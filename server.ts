import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import {
  initDatabase,
  getAllInquiries,
  addInquiry,
  updateInquiryStatus,
  deleteInquiry,
  getSiteContent,
  updateSiteContent,
  getAllClients,
  addClient,
  updateClient,
  deleteClient,
  getAllProjects,
  addProject,
  updateProject,
  deleteProject,
  getAllMedia,
  addMediaFile,
  deleteMediaFile,
  getAllActivities,
  getAdminProfile,
  updateAdminProfile,
  verifyAdminPassword,
  setAdminPassword,
  generatePasswordResetCode,
  verifyAndResetPassword,
  recordVisitorHit,
  getDashboardOverviewStats,
  syncInquiriesFromExternal,
} from './src/server/db.js';
import {
  saveInquiryToSupabase,
  testSupabaseConnection,
  fetchInquiriesFromSupabase,
  updateInquiryInSupabase,
  deleteInquiryFromSupabase,
} from './src/server/supabase.js';
import { ContactInquiry, InquiryStatus } from './src/types.js';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const ADMIN_SESSION_SECRET = 'divire-agency-session-token-2025';

// Ensure database and uploads directory exist
initDatabase();
const UPLOAD_DIR = path.resolve(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage for media uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/Images', express.static(path.resolve(__dirname, 'Images')));
app.use('/uploads', express.static(UPLOAD_DIR));

// In-memory rate limiter for public forms
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function inquiryRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 10;

  const current = rateLimitMap.get(clientIp);
  if (!current || now > current.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (current.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many submissions from your connection. Please wait a few minutes or call us directly at +91 83074-81063.',
    });
  }

  current.count += 1;
  next();
}

// Admin Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin login required' });
  }

  if (token !== ADMIN_SESSION_SECRET) {
    return res.status(403).json({ success: false, error: 'Invalid or expired session token' });
  }

  next();
}

// ---------------------------------------------------------------------------
// PUBLIC API ROUTES
// ---------------------------------------------------------------------------

// GET /api/content - Public website content
app.get('/api/content', (_req: Request, res: Response) => {
  try {
    const content = getSiteContent();
    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching site content:', error);
    return res.status(500).json({ success: false, error: 'Failed to load website content.' });
  }
});

// POST /api/visitor-hit - Track page views
app.post('/api/visitor-hit', (_req: Request, res: Response) => {
  try {
    recordVisitorHit();
    return res.json({ success: true });
  } catch {
    return res.json({ success: false });
  }
});

// POST /api/inquiries - Submit an enquiry form
app.post('/api/inquiries', inquiryRateLimiter, async (req: Request, res: Response) => {
  try {
    const { name, brandName, email, phone, services, message, honeypot } = req.body;

    // Spam honeypot trap
    if (honeypot && String(honeypot).trim().length > 0) {
      console.log('Spam honeypot triggered; discarding bot submission silently.');
      return res.status(200).json({
        success: true,
        message: 'Enquiry received successfully! Our team will contact you shortly.',
      });
    }

    // Input Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter your full name (minimum 2 characters).' });
    }

    if (!brandName || typeof brandName !== 'string' || brandName.trim().length < 1) {
      return res.status(400).json({ success: false, error: 'Please enter your business or brand name.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const phoneClean = String(phone || '').replace(/[^0-9+]/g, '');
    if (!phone || phoneClean.length < 8) {
      return res.status(400).json({ success: false, error: 'Please provide a valid WhatsApp / phone number (at least 8 digits).' });
    }

    const validServices = Array.isArray(services)
      ? services.filter((s) => typeof s === 'string' && s.trim().length > 0)
      : [];

    if (validServices.length === 0) {
      return res.status(400).json({ success: false, error: 'Please select at least one service you need help with.' });
    }

    // Persist to Database
    const newInquiry = addInquiry({
      name: name.trim(),
      brandName: brandName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      services: validServices,
      message: message ? String(message).trim() : undefined,
    });

    // Optional Resend email dispatch if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const emailContent = `
New Digital Marketing Lead Received for Divire Ads TV:
-------------------------------------------------------
Client Name: ${newInquiry.name}
Brand Name: ${newInquiry.brandName}
Email: ${newInquiry.email}
Phone/WhatsApp: ${newInquiry.phone}
Services Requested: ${newInquiry.services.join(', ')}
Client Message: ${newInquiry.message || 'No additional note'}
Submitted At: ${newInquiry.createdAt}
        `.trim();

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Divire Ads TV <onboarding@resend.dev>',
            to: ['divireadstv@gmail.com'],
            subject: `[New Lead] ${newInquiry.brandName} - Divire Ads TV Enquiry`,
            text: emailContent,
          }),
        });
        console.log(`[Email Notification] Sent lead email to divireadstv@gmail.com via Resend.`);
      } catch (emailErr) {
        console.error('[Email Notification Error]', emailErr);
      }
    }

    // Persist to Supabase backend table (orders / inquiries)
    let supabaseResult = null;
    try {
      supabaseResult = await saveInquiryToSupabase(newInquiry);
      if (supabaseResult.saved) {
        console.log(`[Supabase Connected] Saved order from ${newInquiry.name} to Supabase table "${supabaseResult.tableName}".`);
      } else {
        console.log(`[Supabase Info] Order preserved locally. Supabase note: ${supabaseResult.error}`);
      }
    } catch (sbErr) {
      console.error('[Supabase Error]', sbErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will contact you within 24 hours.',
      inquiry: newInquiry,
      supabase: supabaseResult,
    });
  } catch (error) {
    console.error('Error handling inquiry submission:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred. Please try again or reach out on WhatsApp.',
    });
  }
});

// ---------------------------------------------------------------------------
// ADMIN AUTHENTICATION & PROFILE ROUTES
// ---------------------------------------------------------------------------

// POST /api/admin/login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const profile = getAdminProfile();

  if (!password || !verifyAdminPassword(password)) {
    return res.status(401).json({ success: false, error: 'Incorrect administrator password.' });
  }

  // If email is provided, verify match (case-insensitive)
  if (email && String(email).trim().toLowerCase() !== profile.email.toLowerCase()) {
    return res.status(401).json({ success: false, error: 'Email address does not match admin records.' });
  }

  updateAdminProfile({ lastLogin: new Date().toISOString() });

  return res.json({
    success: true,
    token: ADMIN_SESSION_SECRET,
    admin: getAdminProfile(),
  });
});

// GET /api/admin/me
app.get('/api/admin/me', requireAdmin, (_req: Request, res: Response) => {
  return res.json({
    success: true,
    admin: getAdminProfile(),
  });
});

// POST /api/admin/forgot-password - Request reset code
app.post('/api/admin/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Please enter your administrator email.' });
  }

  const result = generatePasswordResetCode(String(email));
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  // Return the code in development for instantaneous access
  return res.json({
    success: true,
    message: `Verification code generated for ${email}. (Code: ${result.code})`,
    code: result.code,
  });
});

// POST /api/admin/reset-password - Verify code and reset password
app.post('/api/admin/reset-password', (req: Request, res: Response) => {
  const { code, newPassword } = req.body;
  if (!code || !newPassword) {
    return res.status(400).json({ success: false, error: 'Please provide both verification code and new password.' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  const result = verifyAndResetPassword(String(code), String(newPassword));
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  return res.json({
    success: true,
    message: 'Administrator password reset successfully. Please sign in with your new password.',
  });
});

// POST /api/admin/change-password - Change password while authenticated
app.post('/api/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !verifyAdminPassword(currentPassword)) {
    return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
  }
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
  }

  setAdminPassword(newPassword);
  return res.json({ success: true, message: 'Password updated successfully!' });
});

// PUT /api/admin/profile - Update administrator profile
app.put('/api/admin/profile', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = updateAdminProfile(req.body);
    return res.json({ success: true, data: updated, message: 'Profile updated successfully!' });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to update profile.' });
  }
});

// ---------------------------------------------------------------------------
// ADMIN DASHBOARD OVERVIEW & ACTIVITIES
// ---------------------------------------------------------------------------

// GET /api/admin/stats - Analytics and key metrics
app.get('/api/admin/stats', requireAdmin, async (_req: Request, res: Response) => {
  try {
    // Sync any new Supabase enquiries first so stats counter is always accurate
    try {
      const sbResult = await fetchInquiriesFromSupabase();
      if (sbResult.success && sbResult.inquiries.length > 0) {
        syncInquiriesFromExternal(sbResult.inquiries);
      }
    } catch (sbSyncErr) {
      console.warn('[Supabase Stats Sync Warning]:', sbSyncErr);
    }

    const stats = getDashboardOverviewStats();
    return res.json({ success: true, data: stats });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to load stats.' });
  }
});

// GET /api/admin/activities - Audit log feed
app.get('/api/admin/activities', requireAdmin, (_req: Request, res: Response) => {
  try {
    const activities = getAllActivities(25);
    return res.json({ success: true, data: activities });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to load activities.' });
  }
});

// ---------------------------------------------------------------------------
// WEBSITE CONTENT MANAGEMENT
// ---------------------------------------------------------------------------

// GET /api/admin/content
app.get('/api/admin/content', requireAdmin, (_req: Request, res: Response) => {
  try {
    const content = getSiteContent();
    return res.json({ success: true, data: content });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to load content.' });
  }
});

// PUT /api/admin/content
app.put('/api/admin/content', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = updateSiteContent(req.body);
    return res.json({ success: true, data: updated, message: 'Website content updated and published successfully!' });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to update content.' });
  }
});

// ---------------------------------------------------------------------------
// LEADS / INQUIRIES MANAGEMENT (SUPABASE BACKEND INTEGRATED)
// ---------------------------------------------------------------------------

// GET /api/admin/inquiries - Fetch live customer leads from Supabase backend
app.get('/api/admin/inquiries', requireAdmin, async (req: Request, res: Response) => {
  try {
    let allInquiries: ContactInquiry[];
    let sourceTable = 'orders';
    let liveSupabaseCount = 0;

    // 1. Fetch live customer enquiries directly from Supabase tables ('orders' & 'inquiries')
    try {
      const sbResult = await fetchInquiriesFromSupabase();
      if (sbResult.success && sbResult.inquiries.length > 0) {
        liveSupabaseCount = sbResult.inquiries.length;
        sourceTable = sbResult.sourceTable || 'orders';
        allInquiries = syncInquiriesFromExternal(sbResult.inquiries);
      } else {
        allInquiries = getAllInquiries();
      }
    } catch (sbErr) {
      console.warn('[Supabase Inquiries Fetch Warning] Falling back to local store:', sbErr);
      allInquiries = getAllInquiries();
    }

    let filtered = allInquiries;
    const { q, status, service } = req.query;

    // Filter by Status
    if (status && typeof status === 'string' && status !== 'All') {
      filtered = filtered.filter((inq) => inq.status.toLowerCase() === status.toLowerCase());
    }

    // Filter by Service
    if (service && typeof service === 'string' && service !== 'All') {
      filtered = filtered.filter((inq) =>
        inq.services.some((s: string) => s.toLowerCase().includes(service.toLowerCase()))
      );
    }

    // Search query
    if (q && typeof q === 'string' && q.trim().length > 0) {
      const query = q.trim().toLowerCase();
      filtered = filtered.filter(
        (inq) =>
          inq.name.toLowerCase().includes(query) ||
          inq.brandName.toLowerCase().includes(query) ||
          inq.email.toLowerCase().includes(query) ||
          inq.phone.includes(query) ||
          (inq.message && inq.message.toLowerCase().includes(query)) ||
          (inq.notes && inq.notes.toLowerCase().includes(query)) ||
          inq.services.some((s: string) => s.toLowerCase().includes(query))
      );
    }

    const stats = {
      total: allInquiries.length,
      new: allInquiries.filter((i) => i.status === 'New').length,
      contacted: allInquiries.filter((i) => i.status === 'Contacted').length,
      converted: allInquiries.filter((i) => i.status === 'Converted').length,
      rejected: allInquiries.filter((i) => i.status === 'Rejected').length,
      archived: allInquiries.filter((i) => i.status === 'Archived').length,
    };

    return res.json({
      success: true,
      data: filtered,
      stats,
      supabaseTable: sourceTable,
      supabaseRecordCount: liveSupabaseCount,
    });
  } catch (error) {
    console.error('Error fetching admin inquiries:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve enquiries' });
  }
});

// PATCH /api/admin/inquiries/:id - Update status and notes in both local and Supabase
app.patch('/api/admin/inquiries/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses: InquiryStatus[] = ['New', 'Contacted', 'Converted', 'Rejected', 'Archived'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid inquiry status value' });
    }

    const current = getAllInquiries().find((i) => i.id === id);
    const targetStatus = status || current?.status || 'New';
    const updated = updateInquiryStatus(id, targetStatus, notes);

    // Persist change to Supabase backend table as well
    try {
      await updateInquiryInSupabase(id, { status: targetStatus, notes });
    } catch (sbErr) {
      console.warn('[Supabase Sync Warning] Could not update inquiry in Supabase:', sbErr);
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return res.status(500).json({ success: false, error: 'Failed to update inquiry' });
  }
});

// DELETE /api/admin/inquiries/:id - Delete inquiry from local and Supabase
app.delete('/api/admin/inquiries/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = deleteInquiry(id);

    // Delete from Supabase backend table as well
    try {
      await deleteInquiryFromSupabase(id);
    } catch (sbErr) {
      console.warn('[Supabase Delete Warning]:', sbErr);
    }

    if (!success) {
      return res.status(404).json({ success: false, error: 'Inquiry not found or already deleted' });
    }
    return res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete inquiry' });
  }
});

// GET /api/admin/export-csv
app.get('/api/admin/export-csv', requireAdmin, (_req: Request, res: Response) => {
  const inquiries = getAllInquiries();

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'ID',
    'Date Submitted',
    'Client Name',
    'Brand/Company Name',
    'Email Address',
    'Phone / WhatsApp',
    'Services Requested',
    'Lead Status',
    'Internal Notes',
    'Client Message',
  ];

  const rows = inquiries.map((inq) => [
    escapeCsv(inq.id),
    escapeCsv(inq.createdAt),
    escapeCsv(inq.name),
    escapeCsv(inq.brandName),
    escapeCsv(inq.email),
    escapeCsv(inq.phone),
    escapeCsv(inq.services.join('; ')),
    escapeCsv(inq.status),
    escapeCsv(inq.notes || ''),
    escapeCsv(inq.message || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="divire_inquiries_${new Date().toISOString().slice(0, 10)}.csv"`);
  return res.send(csvContent);
});

// ---------------------------------------------------------------------------
// CLIENTS & PROJECTS MANAGEMENT
// ---------------------------------------------------------------------------

// Clients
app.get('/api/admin/clients', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ success: true, data: getAllClients() });
});

app.post('/api/admin/clients', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, company, email, phone, status, notes } = req.body;
    if (!name || !company || !email) {
      return res.status(400).json({ success: false, error: 'Name, Company, and Email are required.' });
    }
    const created = addClient({
      name: name.trim(),
      company: company.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      status: status || 'Active',
      totalProjects: Number(req.body.totalProjects) || 0,
      notes: notes ? notes.trim() : '',
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to add client.' });
  }
});

app.put('/api/admin/clients/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = updateClient(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Client not found.' });
  return res.json({ success: true, data: updated });
});

app.delete('/api/admin/clients/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = deleteClient(req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: 'Client not found.' });
  return res.json({ success: true, message: 'Client removed successfully.' });
});

// Projects
app.get('/api/admin/projects', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ success: true, data: getAllProjects() });
});

app.post('/api/admin/projects', requireAdmin, (req: Request, res: Response) => {
  try {
    const { title, clientName, clientId, serviceCategory, status, deadline, budget, description, thumbnail } = req.body;
    if (!title || !clientName) {
      return res.status(400).json({ success: false, error: 'Project Title and Client Name are required.' });
    }
    const created = addProject({
      title: title.trim(),
      clientName: clientName.trim(),
      clientId,
      serviceCategory: serviceCategory || 'Social Media & Performance Ads',
      status: status || 'In Progress',
      deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      budget: budget || '₹25,000',
      description: description || '',
      thumbnail: thumbnail || '/src/assets/images/hero_digital_marketing_1791888552925.jpg',
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to create project.' });
  }
});

app.put('/api/admin/projects/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Project not found.' });
  return res.json({ success: true, data: updated });
});

app.delete('/api/admin/projects/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = deleteProject(req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: 'Project not found.' });
  return res.json({ success: true, message: 'Project deleted successfully.' });
});

// ---------------------------------------------------------------------------
// MEDIA MANAGEMENT
// ---------------------------------------------------------------------------

app.get('/api/admin/media', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ success: true, data: getAllMedia() });
});

// Upload multipart file
app.post('/api/admin/media/upload', requireAdmin, upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No media file provided.' });
    }

    const newMedia = addMediaFile({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

    return res.status(201).json({
      success: true,
      data: newMedia,
      message: 'Media asset uploaded successfully!',
    });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Upload failed.' });
  }
});

app.delete('/api/admin/media/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = deleteMediaFile(req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: 'Media file not found.' });
  return res.json({ success: true, message: 'Media file deleted.' });
});

// ---------------------------------------------------------------------------
// SUPABASE STATUS & SYNC
// ---------------------------------------------------------------------------

app.get('/api/admin/supabase-status', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const status = await testSupabaseConnection();
    return res.json({ success: true, data: status });
  } catch (err: unknown) {
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to query Supabase status',
    });
  }
});

app.post('/api/admin/supabase-sync', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const all = getAllInquiries();
    const results = [];
    let savedCount = 0;

    for (const inq of all) {
      const resSave = await saveInquiryToSupabase(inq);
      results.push({ id: inq.id, name: inq.name, ...resSave });
      if (resSave.saved) savedCount++;
    }

    return res.json({
      success: true,
      syncedCount: savedCount,
      totalCount: all.length,
      details: results,
    });
  } catch (err: unknown) {
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to sync inquiries to Supabase',
    });
  }
});

// ---------------------------------------------------------------------------
// VITE OR STATIC FRONTEND SERVING
// ---------------------------------------------------------------------------
async function startServer() {
  // Always serve files in public directory statically (e.g. logo.jpg, uploads, sitemap)
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Divire Ads TV server running on port ${PORT}`);
  });
}

startServer();
