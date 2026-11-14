import fs from 'fs';
import path from 'path';
import {
  ContactInquiry,
  InquiryStatus,
  Client,
  MarketingProject,
  ServiceItem,
  PortfolioProject,
  TestimonialItem,
  SiteContent,
  MediaFile,
  RecentActivity,
  DashboardStats,
  AdminProfile,
} from '../types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const MEDIA_FILE = path.join(DATA_DIR, 'media.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Helper to safely read JSON files
function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

// Helper to safely write JSON files atomically
function writeJson<T>(filePath: string, data: T): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const temp = `${filePath}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(temp, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Initial Seed for Site Content
const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    eyebrow: 'Marketing Agency',
    headlineStart: 'Turn Your Brand Into a',
    headlineHighlight: 'Business',
    headlineEnd: 'People Remember.',
    description: 'Creative content, social media growth & strategic marketing for ambitious brands.',
    primaryCtaText: 'Get Started',
    secondaryCtaText: 'Chat on WhatsApp',
    heroImage: '/src/assets/images/hero_digital_marketing_1791888552925.jpg',
    stat1Value: '50+',
    stat1Label: 'Brands Scaled',
    stat2Value: '10x',
    stat2Label: 'Avg. Engagement ROI',
    stat3Value: '24/7',
    stat3Label: 'Dedicated Support',
  },
  about: {
    tagline: 'Connecting Through Creativity',
    title: 'Transforming Local Businesses into Recognized Brands',
    description: 'Divire Ads TV is a modern digital marketing powerhouse rooted in Kaithal, Haryana. We specialize in high-impact visual storytelling, conversion-driven paid advertising, and organic social media expansion.',
    mission: 'To empower ambitious businesses with world-class creative production, performance marketing, and measurable revenue growth.',
    vision: 'To be Haryana’s most trusted growth partner for forward-thinking brands and enterprises.',
    experienceYears: '4+',
    completedProjects: '120+',
  },
  contact: {
    address: 'Divire Ads TV, Near Maharaja Palace, Dhand Road, HUDA Sector 20, Kaithal, Haryana 136027, India',
    phone: '+91 83074-81063',
    whatsapp: '+91 83074-81063',
    email: 'divireadstv@gmail.com',
    workingHours: 'Monday–Saturday, 10:00 AM–5:00 PM',
    mapLocationTitle: 'Divire Ads TV Head Office',
    googleMapsUrl: 'https://maps.app.goo.gl/YL1wE7CMfU1p3krh7?g_st=ic',
    googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3463.5042!2d76.422755!3d29.814238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3911e1efb3a33b41%3A0xa4644b9639a81d12!2sKaithal%20Breaking%20tv!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
  },
  socialLinks: {
    instagram: 'https://instagram.com/divireadstv',
    whatsapp: 'https://wa.me/918307481063?text=Hi%20Divire%20Ads%20TV,%20I%20would%20like%20to%20grow%20my%20brand.',
    facebook: 'https://facebook.com/divireadstv',
    youtube: 'https://youtube.com/@divireadstv',
    linkedin: 'https://linkedin.com/company/divire-ads-tv',
  },
  seo: {
    metaTitle: 'Divire Ads TV – Connecting Through Creativity | Digital Marketing Agency',
    metaDescription: 'Divire Ads TV is a premier digital marketing agency in Kaithal, Haryana. Turn your brand into a business people remember with creative content and strategic marketing.',
    metaKeywords: 'digital marketing kaithal, social media marketing haryana, ads agency, video production, graphic design, SEO',
    ogTitle: 'Divire Ads TV – Connecting Through Creativity',
    ogDescription: 'Turn your brand into a business people remember. Premium social media management, performance marketing, and creative production.',
  },
  services: [
    {
      id: 'srv-1',
      title: 'Social Media Management',
      shortDesc: 'Grow your audience. Boost your presence.',
      fullDesc: 'End-to-end management of Instagram, Facebook, and LinkedIn. From editorial calendars and carousel designs to community engagement and algorithmic growth strategies.',
      iconName: 'Share2',
      highlighted: true,
      order: 1,
    },
    {
      id: 'srv-2',
      title: 'Creative Content Production',
      shortDesc: 'Scroll-stopping content that gets results.',
      fullDesc: 'High-definition video reels, product commercial shoots, promotional teasers, and lifestyle graphic assets that capture consumer attention within 3 seconds.',
      iconName: 'Video',
      highlighted: true,
      order: 2,
    },
    {
      id: 'srv-3',
      title: 'Google & Meta Paid Ads',
      shortDesc: 'Targeted ROI campaigns for instant lead flow.',
      fullDesc: 'Hyper-localized pay-per-click advertising on Meta (Facebook & Instagram) and Google Search to generate high-intent buyer leads and boost retail footfall.',
      iconName: 'Target',
      highlighted: true,
      order: 3,
    },
    {
      id: 'srv-4',
      title: 'Brand Identity & Strategy',
      shortDesc: 'Distinctive logos, messaging, and visual guidelines.',
      fullDesc: 'Complete corporate identity kits including logo vector assets, color palettes, typography guidelines, and brand positioning roadmaps.',
      iconName: 'Sparkles',
      highlighted: false,
      order: 4,
    },
    {
      id: 'srv-5',
      title: 'High-Converting Web Design',
      shortDesc: 'Fast, responsive, modern business websites.',
      fullDesc: 'Speed-optimized, mobile-first websites and landing pages engineered specifically for digital marketing conversion and search engine ranking.',
      iconName: 'Globe',
      highlighted: false,
      order: 5,
    },
  ],
  portfolio: [
    {
      id: 'port-1',
      title: 'Sharma Sweets Diwali Campaign',
      category: 'Social Media & Performance Ads',
      description: 'Scaled holiday sweet gift box pre-orders across 3 city branches with viral regional reels and geo-targeted Instagram ad campaigns.',
      client: 'Sharma Sweets & Bakers',
      imageUrl: '/src/assets/images/hero_digital_marketing_1791888552925.jpg',
      resultsMetric: '+320% Festive Sales Revenue',
      order: 1,
    },
    {
      id: 'port-2',
      title: 'Aura Luxe Ethnic Wear Launch',
      category: 'Creative Production & Branding',
      description: 'Cinematic bridal fashion reels, lookbook photography, and targeted influencer collaboration creating rapid sell-outs of their flagship collection.',
      client: 'Aura Luxe Boutique',
      imageUrl: '/Images/photo-output.jpeg',
      resultsMetric: '1.2M Organic Reel Views',
      order: 2,
    },
    {
      id: 'port-3',
      title: 'Apex Fitness Membership Drive',
      category: 'Lead Generation Advertising',
      description: 'Annual gym membership subscription campaign utilizing testimonial videos and WhatsApp click-to-chat Meta ads.',
      client: 'Apex Fitness Club',
      imageUrl: '/src/assets/images/hero_digital_marketing_1791888552925.jpg',
      resultsMetric: '240+ New Paid Memberships',
      order: 3,
    },
  ],
  testimonials: [
    {
      id: 'test-1',
      clientName: 'Rohit Sharma',
      clientRole: 'Managing Director',
      clientCompany: 'Sharma Sweets & Bakers',
      avatarUrl: '',
      quote: 'Divire Ads TV transformed our traditional sweets business into a modern digital brand. Their creative reels brought customers from all neighboring towns!',
      rating: 5,
      featured: true,
    },
    {
      id: 'test-2',
      clientName: 'Simran Kaur',
      clientRole: 'Founder & Designer',
      clientCompany: 'Aura Luxe Boutique',
      avatarUrl: '',
      quote: 'The team understands aesthetics better than anyone in our region. Our wedding collection launch was our most profitable month in 6 years.',
      rating: 5,
      featured: true,
    },
    {
      id: 'test-3',
      clientName: 'Vikram Choudhary',
      clientRole: 'General Manager',
      clientCompany: 'Apex Fitness Club',
      avatarUrl: '',
      quote: 'High quality leads on WhatsApp with predictable acquisition costs. Divire Ads TV delivers true return on marketing spend.',
      rating: 5,
      featured: true,
    },
  ],
};

// Initial Seed for Inquiries
const DEFAULT_INQUIRIES: ContactInquiry[] = [
  {
    id: 'divire-inq-101',
    name: 'Rohit Sharma',
    brandName: 'Sharma Sweets & Bakers',
    email: 'rohit.sharma@example.com',
    phone: '+91 98120-44552',
    services: ['Social Media Management', 'Google & Meta Ads', 'Content Creation'],
    message: 'We have 3 retail outlets in Kaithal and Kurukshetra. We want to scale our Instagram following and run targeted Meta ads for festive promotions.',
    status: 'New',
    notes: 'High intent local business. Follow up on WhatsApp.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'divire-inq-102',
    name: 'Simran Kaur',
    brandName: 'Aura Luxe Boutique',
    email: 'simran.kaur@example.com',
    phone: '+91 94160-88219',
    services: ['Content Creation', 'Website Design', 'SEO and Branding'],
    message: 'Launching our designer ethnic wear collection. Need complete visual identity, website, and scroll-stopping reels content.',
    status: 'Contacted',
    notes: 'Sent initial service deck and pricing structure. Scheduled call for Wednesday.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'divire-inq-103',
    name: 'Vikram Choudhary',
    brandName: 'Apex Fitness Club',
    email: 'vikram.apex@example.com',
    phone: '+91 98960-12345',
    services: ['Paid Advertising', 'Social Media Management'],
    message: 'Need high-converting gym membership lead generation campaigns across Kaithal and Karnal.',
    status: 'Converted',
    notes: 'Signed 3-month retainer for Meta Ads and organic Reels management.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
];

// Initial Seed for Clients
const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Rohit Sharma',
    company: 'Sharma Sweets & Bakers',
    email: 'rohit.sharma@example.com',
    phone: '+91 98120-44552',
    status: 'Active',
    totalProjects: 2,
    notes: 'Multi-location sweet mart. Ongoing monthly retainer for festive social ads.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
  },
  {
    id: 'client-2',
    name: 'Simran Kaur',
    company: 'Aura Luxe Boutique',
    email: 'simran.kaur@example.com',
    phone: '+91 94160-88219',
    status: 'Active',
    totalProjects: 1,
    notes: 'Designer clothing line. High budget for 4K video reel production.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
  },
  {
    id: 'client-3',
    name: 'Vikram Choudhary',
    company: 'Apex Fitness Club',
    email: 'vikram.apex@example.com',
    phone: '+91 98960-12345',
    status: 'Active',
    totalProjects: 3,
    notes: 'Gym and wellness center. Performance lead generation campaigns.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 10).toISOString(),
  },
];

// Initial Seed for Marketing Projects
const DEFAULT_PROJECTS: MarketingProject[] = [
  {
    id: 'proj-1',
    title: 'Festive Social Scale & WhatsApp Ad Funnel',
    clientName: 'Sharma Sweets & Bakers',
    clientId: 'client-1',
    serviceCategory: 'Google & Meta Paid Ads',
    status: 'In Progress',
    deadline: '2026-11-20',
    budget: '₹45,000 / mo',
    description: 'Running geo-fenced Meta ads in Kaithal and Kurukshetra targeting corporate gift hampers and festive gift pre-orders.',
    thumbnail: '/src/assets/images/hero_digital_marketing_1791888552925.jpg',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
  },
  {
    id: 'proj-2',
    title: 'Autumn Bridal Collection Video Launch',
    clientName: 'Aura Luxe Boutique',
    clientId: 'client-2',
    serviceCategory: 'Creative Content Production',
    status: 'Review',
    deadline: '2026-11-15',
    budget: '₹60,000',
    description: '10 cinematic Instagram reels, drone venue shots, and catalog lookbooks for designer ethnic bridal lehengas.',
    thumbnail: '/Images/photo-output.jpeg',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 1).toISOString(),
  },
  {
    id: 'proj-3',
    title: 'Kaithal Membership Acquisition Drive',
    clientName: 'Apex Fitness Club',
    clientId: 'client-3',
    serviceCategory: 'Lead Generation Advertising',
    status: 'Completed',
    deadline: '2026-10-31',
    budget: '₹35,000',
    description: 'Targeted lead generation for annual gym membership signups via Facebook Leads and instant WhatsApp triggers.',
    thumbnail: '/src/assets/images/hero_digital_marketing_1791888552925.jpg',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString(),
  },
];

// Initial Seed for Admin Configuration
const DEFAULT_ADMIN_CONFIG = {
  profile: {
    email: 'divireadstv@gmail.com',
    name: 'Divire Ads TV Administrator',
    role: 'Super Admin',
    avatarUrl: '/logo.jpg',
    lastLogin: new Date().toISOString(),
    notifyOnNewLead: true,
    notifyEmail: 'divireadstv@gmail.com',
  },
  // Default password 'divire2025' or from env
  passwordHash: process.env.ADMIN_PASSWORD || 'divire2025',
  resetCode: null as string | null,
  resetCodeExpiresAt: null as number | null,
};

// Initial Seed for Activities
const DEFAULT_ACTIVITIES: RecentActivity[] = [
  {
    id: 'act-1',
    title: 'New Lead Submitted',
    description: 'Rohit Sharma (Sharma Sweets & Bakers) submitted a new enquiry for Social Media Management.',
    type: 'inquiry',
    timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'act-2',
    title: 'Project Status Updated',
    description: 'Apex Fitness Membership Acquisition Drive marked as Completed.',
    type: 'project',
    timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    id: 'act-3',
    title: 'Content Updated',
    description: 'Homepage working hours updated to 10:00 AM–5:00 PM.',
    type: 'content',
    timestamp: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
  {
    id: 'act-4',
    title: 'Client Added',
    description: 'Simran Kaur (Aura Luxe Boutique) added as an Active marketing client.',
    type: 'client',
    timestamp: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
  },
];

// Initial Seed for Analytics
const DEFAULT_ANALYTICS = {
  totalVisitors: 4850,
  visitorsToday: 142,
  dailyHistory: [
    { day: 'Mon', visitors: 110, inquiries: 3 },
    { day: 'Tue', visitors: 145, inquiries: 4 },
    { day: 'Wed', visitors: 132, inquiries: 2 },
    { day: 'Thu', visitors: 168, inquiries: 6 },
    { day: 'Fri', visitors: 195, inquiries: 5 },
    { day: 'Sat', visitors: 220, inquiries: 8 },
    { day: 'Sun', visitors: 180, inquiries: 4 },
  ],
  lastRecordedDate: new Date().toISOString().slice(0, 10),
};

// Ensure all database files exist
export function initDatabase(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(INQUIRIES_FILE)) {
    writeJson(INQUIRIES_FILE, DEFAULT_INQUIRIES);
  }
  if (!fs.existsSync(CONTENT_FILE)) {
    writeJson(CONTENT_FILE, DEFAULT_SITE_CONTENT);
  }
  if (!fs.existsSync(CLIENTS_FILE)) {
    writeJson(CLIENTS_FILE, DEFAULT_CLIENTS);
  }
  if (!fs.existsSync(PROJECTS_FILE)) {
    writeJson(PROJECTS_FILE, DEFAULT_PROJECTS);
  }
  if (!fs.existsSync(MEDIA_FILE)) {
    writeJson(MEDIA_FILE, [
      {
        id: 'media-1',
        filename: 'logo.jpg',
        originalName: 'Divire Ads TV Official Logo',
        url: '/logo.jpg',
        size: 245000,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'media-2',
        filename: 'hero_digital_marketing_1791888552925.jpg',
        originalName: 'Creative Workspace Showcase',
        url: '/src/assets/images/hero_digital_marketing_1791888552925.jpg',
        size: 382000,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'media-3',
        filename: 'photo-output.jpeg',
        originalName: 'Divire 3D Emblem',
        url: '/Images/photo-output.jpeg',
        size: 238000,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      },
    ]);
  }
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    writeJson(ACTIVITIES_FILE, DEFAULT_ACTIVITIES);
  }
  if (!fs.existsSync(ADMIN_CONFIG_FILE)) {
    writeJson(ADMIN_CONFIG_FILE, DEFAULT_ADMIN_CONFIG);
  }
  if (!fs.existsSync(ANALYTICS_FILE)) {
    writeJson(ANALYTICS_FILE, DEFAULT_ANALYTICS);
  }
}

// ---------------------------------------------------------------------------
// INQUIRIES / LEADS OPERATIONS
// ---------------------------------------------------------------------------
export function getAllInquiries(): ContactInquiry[] {
  initDatabase();
  return readJson<ContactInquiry[]>(INQUIRIES_FILE, DEFAULT_INQUIRIES);
}

export function saveAllInquiries(inquiries: ContactInquiry[]): boolean {
  return writeJson(INQUIRIES_FILE, inquiries);
}

export function syncInquiriesFromExternal(externalInquiries: ContactInquiry[]): ContactInquiry[] {
  const local = getAllInquiries();
  const map = new Map<string, ContactInquiry>();

  // Add local inquiries
  for (const item of local) {
    map.set(item.id, item);
  }

  // Supabase is authoritative for records found in Supabase
  for (const item of externalInquiries) {
    map.set(item.id, item);
  }

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  saveAllInquiries(merged);
  return merged;
}

export function addInquiry(
  data: Omit<ContactInquiry, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): ContactInquiry {
  const inquiries = getAllInquiries();
  const id = `divire-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newInquiry: ContactInquiry = {
    id,
    ...data,
    status: 'New',
    createdAt: now,
    updatedAt: now,
  };

  inquiries.unshift(newInquiry);
  saveAllInquiries(inquiries);

  // Log activity
  logActivity({
    title: 'New Customer Lead',
    description: `${newInquiry.name} (${newInquiry.brandName}) submitted an enquiry for ${newInquiry.services.join(', ')}.`,
    type: 'inquiry',
  });

  return newInquiry;
}

export function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
  notes?: string
): ContactInquiry | null {
  const inquiries = getAllInquiries();
  const index = inquiries.findIndex((inq) => inq.id === id);
  if (index === -1) return null;

  const oldStatus = inquiries[index].status;
  inquiries[index] = {
    ...inquiries[index],
    status,
    notes: notes !== undefined ? notes : inquiries[index].notes,
    updatedAt: new Date().toISOString(),
  };

  saveAllInquiries(inquiries);

  if (oldStatus !== status) {
    logActivity({
      title: 'Lead Status Changed',
      description: `Lead from ${inquiries[index].name} (${inquiries[index].brandName}) changed from "${oldStatus}" to "${status}".`,
      type: 'inquiry',
    });
  }

  return inquiries[index];
}

export function deleteInquiry(id: string): boolean {
  const inquiries = getAllInquiries();
  const target = inquiries.find((i) => i.id === id);
  const filtered = inquiries.filter((inq) => inq.id !== id);
  if (filtered.length === inquiries.length) return false;
  const ok = saveAllInquiries(filtered);
  if (ok && target) {
    logActivity({
      title: 'Lead Removed',
      description: `Removed lead inquiry from ${target.name} (${target.brandName}).`,
      type: 'inquiry',
    });
  }
  return ok;
}

// ---------------------------------------------------------------------------
// SITE CONTENT OPERATIONS
// ---------------------------------------------------------------------------
export function getSiteContent(): SiteContent {
  initDatabase();
  return readJson<SiteContent>(CONTENT_FILE, DEFAULT_SITE_CONTENT);
}

export function updateSiteContent(partialContent: Partial<SiteContent>): SiteContent {
  const current = getSiteContent();
  const merged: SiteContent = {
    ...current,
    ...partialContent,
    hero: { ...current.hero, ...(partialContent.hero || {}) },
    about: { ...current.about, ...(partialContent.about || {}) },
    contact: { ...current.contact, ...(partialContent.contact || {}) },
    socialLinks: { ...current.socialLinks, ...(partialContent.socialLinks || {}) },
    seo: { ...current.seo, ...(partialContent.seo || {}) },
    services: partialContent.services || current.services,
    portfolio: partialContent.portfolio || current.portfolio,
    testimonials: partialContent.testimonials || current.testimonials,
  };

  writeJson(CONTENT_FILE, merged);

  logActivity({
    title: 'Website Content Updated',
    description: 'Administrator published live website content changes.',
    type: 'content',
  });

  return merged;
}

// ---------------------------------------------------------------------------
// CLIENTS OPERATIONS
// ---------------------------------------------------------------------------
export function getAllClients(): Client[] {
  initDatabase();
  return readJson<Client[]>(CLIENTS_FILE, DEFAULT_CLIENTS);
}

export function addClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
  const clients = getAllClients();
  const now = new Date().toISOString();
  const newClient: Client = {
    id: `client-${Date.now()}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  clients.unshift(newClient);
  writeJson(CLIENTS_FILE, clients);

  logActivity({
    title: 'New Client Added',
    description: `Added client "${newClient.name}" (${newClient.company}).`,
    type: 'client',
  });

  return newClient;
}

export function updateClient(id: string, data: Partial<Client>): Client | null {
  const clients = getAllClients();
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  clients[idx] = {
    ...clients[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeJson(CLIENTS_FILE, clients);
  return clients[idx];
}

export function deleteClient(id: string): boolean {
  const clients = getAllClients();
  const target = clients.find((c) => c.id === id);
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length) return false;
  const ok = writeJson(CLIENTS_FILE, filtered);
  if (ok && target) {
    logActivity({
      title: 'Client Removed',
      description: `Removed client "${target.name}" (${target.company}).`,
      type: 'client',
    });
  }
  return ok;
}

// ---------------------------------------------------------------------------
// PROJECTS OPERATIONS
// ---------------------------------------------------------------------------
export function getAllProjects(): MarketingProject[] {
  initDatabase();
  return readJson<MarketingProject[]>(PROJECTS_FILE, DEFAULT_PROJECTS);
}

export function addProject(data: Omit<MarketingProject, 'id' | 'createdAt' | 'updatedAt'>): MarketingProject {
  const projects = getAllProjects();
  const now = new Date().toISOString();
  const newProject: MarketingProject = {
    id: `proj-${Date.now()}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  projects.unshift(newProject);
  writeJson(PROJECTS_FILE, projects);

  logActivity({
    title: 'New Marketing Project Created',
    description: `Created project "${newProject.title}" for client ${newProject.clientName}.`,
    type: 'project',
  });

  return newProject;
}

export function updateProject(id: string, data: Partial<MarketingProject>): MarketingProject | null {
  const projects = getAllProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  projects[idx] = {
    ...projects[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeJson(PROJECTS_FILE, projects);

  logActivity({
    title: 'Project Updated',
    description: `Updated project "${projects[idx].title}" status to ${projects[idx].status}.`,
    type: 'project',
  });

  return projects[idx];
}

export function deleteProject(id: string): boolean {
  const projects = getAllProjects();
  const target = projects.find((p) => p.id === id);
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  const ok = writeJson(PROJECTS_FILE, filtered);
  if (ok && target) {
    logActivity({
      title: 'Project Deleted',
      description: `Deleted project "${target.title}".`,
      type: 'project',
    });
  }
  return ok;
}

// ---------------------------------------------------------------------------
// MEDIA MANAGEMENT OPERATIONS
// ---------------------------------------------------------------------------
export function getAllMedia(): MediaFile[] {
  initDatabase();
  return readJson<MediaFile[]>(MEDIA_FILE, []);
}

export function addMediaFile(file: Omit<MediaFile, 'id' | 'uploadedAt'>): MediaFile {
  const media = getAllMedia();
  const newFile: MediaFile = {
    id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...file,
    uploadedAt: new Date().toISOString(),
  };
  media.unshift(newFile);
  writeJson(MEDIA_FILE, media);

  logActivity({
    title: 'Media Asset Uploaded',
    description: `Uploaded "${newFile.originalName}" to the media library.`,
    type: 'content',
  });

  return newFile;
}

export function deleteMediaFile(id: string): boolean {
  const media = getAllMedia();
  const target = media.find((m) => m.id === id);
  const filtered = media.filter((m) => m.id !== id);
  if (filtered.length === media.length) return false;

  // Try to remove physical file if stored in public/uploads
  if (target && target.url.startsWith('/uploads/')) {
    try {
      const physicalPath = path.resolve(process.cwd(), 'public', target.url.replace(/^\//, ''));
      if (fs.existsSync(physicalPath)) {
        fs.unlinkSync(physicalPath);
      }
    } catch (e) {
      console.warn('Could not delete physical upload file:', e);
    }
  }

  const ok = writeJson(MEDIA_FILE, filtered);
  if (ok && target) {
    logActivity({
      title: 'Media File Deleted',
      description: `Deleted media asset "${target.originalName}".`,
      type: 'content',
    });
  }
  return ok;
}

// ---------------------------------------------------------------------------
// ACTIVITIES LOG
// ---------------------------------------------------------------------------
export function getAllActivities(limit = 20): RecentActivity[] {
  initDatabase();
  const all = readJson<RecentActivity[]>(ACTIVITIES_FILE, DEFAULT_ACTIVITIES);
  return all.slice(0, limit);
}

export function logActivity(data: Omit<RecentActivity, 'id' | 'timestamp'>): void {
  const all = readJson<RecentActivity[]>(ACTIVITIES_FILE, DEFAULT_ACTIVITIES);
  const newAct: RecentActivity = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    ...data,
    timestamp: new Date().toISOString(),
  };
  all.unshift(newAct);
  writeJson(ACTIVITIES_FILE, all.slice(0, 100)); // retain last 100
}

// ---------------------------------------------------------------------------
// ADMIN PROFILE & AUTHENTICATION
// ---------------------------------------------------------------------------
export function getAdminConfig() {
  initDatabase();
  return readJson(ADMIN_CONFIG_FILE, DEFAULT_ADMIN_CONFIG);
}

export function getAdminProfile(): AdminProfile {
  const config = getAdminConfig();
  return config.profile;
}

export function updateAdminProfile(data: Partial<AdminProfile>): AdminProfile {
  const config = getAdminConfig();
  config.profile = {
    ...config.profile,
    ...data,
  };
  writeJson(ADMIN_CONFIG_FILE, config);

  logActivity({
    title: 'Admin Profile Updated',
    description: 'Updated administrator personal profile and notification preferences.',
    type: 'auth',
  });

  return config.profile;
}

export function verifyAdminPassword(password: string): boolean {
  const config = getAdminConfig();
  return Boolean(password && password === config.passwordHash);
}

export function setAdminPassword(newPassword: string): boolean {
  const config = getAdminConfig();
  config.passwordHash = newPassword;
  const ok = writeJson(ADMIN_CONFIG_FILE, config);
  if (ok) {
    logActivity({
      title: 'Admin Password Changed',
      description: 'The administrator password was securely updated.',
      type: 'auth',
    });
  }
  return ok;
}

export function generatePasswordResetCode(email: string): { success: boolean; code?: string; error?: string } {
  const config = getAdminConfig();
  if (email.trim().toLowerCase() !== config.profile.email.trim().toLowerCase()) {
    return { success: false, error: 'No administrator registered with this email address.' };
  }

  // 6-digit numeric OTP verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  config.resetCode = code;
  config.resetCodeExpiresAt = expiresAt;
  writeJson(ADMIN_CONFIG_FILE, config);

  logActivity({
    title: 'Password Reset Requested',
    description: `A 6-digit verification code was generated for ${email}.`,
    type: 'auth',
  });

  return { success: true, code };
}

export function verifyAndResetPassword(code: string, newPassword: string): { success: boolean; error?: string } {
  const config = getAdminConfig();
  if (!config.resetCode || !config.resetCodeExpiresAt) {
    return { success: false, error: 'No active password reset request. Please request a new code.' };
  }

  if (Date.now() > config.resetCodeExpiresAt) {
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (config.resetCode.trim() !== code.trim()) {
    return { success: false, error: 'Invalid verification code. Please check and try again.' };
  }

  config.passwordHash = newPassword;
  config.resetCode = null;
  config.resetCodeExpiresAt = null;
  writeJson(ADMIN_CONFIG_FILE, config);

  logActivity({
    title: 'Password Successfully Reset',
    description: 'Admin password was reset via 6-digit verification code.',
    type: 'auth',
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// ANALYTICS & DASHBOARD STATS
// ---------------------------------------------------------------------------
export function recordVisitorHit(): void {
  initDatabase();
  const analytics = readJson(ANALYTICS_FILE, DEFAULT_ANALYTICS);
  analytics.totalVisitors += 1;
  analytics.visitorsToday += 1;

  const todayStr = new Date().toISOString().slice(0, 10);
  if (analytics.lastRecordedDate !== todayStr) {
    analytics.visitorsToday = 1;
    analytics.lastRecordedDate = todayStr;
  }

  writeJson(ANALYTICS_FILE, analytics);
}

export function getDashboardOverviewStats(): DashboardStats {
  initDatabase();
  const inquiries = getAllInquiries();
  const clients = getAllClients();
  const projects = getAllProjects();
  const content = getSiteContent();
  const analytics = readJson(ANALYTICS_FILE, DEFAULT_ANALYTICS);

  const totalInquiries = inquiries.length;
  const newLeads = inquiries.filter((i) => i.status === 'New').length;
  const contactedLeads = inquiries.filter((i) => i.status === 'Contacted').length;
  const convertedLeads = inquiries.filter((i) => i.status === 'Converted').length;

  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const activeProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'Review').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;

  const conversionRate = totalInquiries > 0
    ? `${((convertedLeads / totalInquiries) * 100).toFixed(1)}%`
    : '0%';

  return {
    totalVisitors: analytics.totalVisitors || 4850,
    visitorsToday: analytics.visitorsToday || 142,
    totalSubmissions: totalInquiries,
    totalInquiries,
    totalServices: content.services.length,
    totalProjects: projects.length,
    conversionRate,
    newLeads,
    contactedLeads,
    convertedLeads,
    activeClients,
    activeProjects,
    completedProjects,
    chartData: analytics.dailyHistory || DEFAULT_ANALYTICS.dailyHistory,
  };
}
