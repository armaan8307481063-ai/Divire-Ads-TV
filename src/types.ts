export type InquiryStatus = 'New' | 'Contacted' | 'Converted' | 'Rejected' | 'Archived';

export interface ContactInquiry {
  id: string;
  name: string;
  brandName: string;
  email: string;
  phone: string;
  services: string[];
  message?: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryFormData {
  name: string;
  brandName: string;
  email: string;
  phone: string;
  services: string[];
  message?: string;
  honeypot?: string;
}

export type ClientStatus = 'Active' | 'Lead' | 'Past';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  totalProjects: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'In Progress' | 'Review' | 'Completed' | 'On Hold';

export interface MarketingProject {
  id: string;
  title: string;
  clientName: string;
  clientId?: string;
  serviceCategory: string;
  status: ProjectStatus;
  deadline: string;
  budget?: string;
  description: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  highlighted: boolean;
  order: number;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  client: string;
  imageUrl: string;
  resultsMetric: string;
  order: number;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  avatarUrl?: string;
  quote: string;
  rating: number;
  featured: boolean;
}

export interface SiteContent {
  hero: {
    eyebrow: string;
    headlineStart: string;
    headlineHighlight: string;
    headlineEnd: string;
    description: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    heroImage: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
  };
  about: {
    tagline: string;
    title: string;
    description: string;
    mission: string;
    vision: string;
    experienceYears: string;
    completedProjects: string;
  };
  contact: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    workingHours: string;
    mapLocationTitle: string;
    googleMapsEmbedUrl: string;
    googleMapsUrl?: string;
  };
  socialLinks: {
    instagram: string;
    whatsapp: string;
    facebook: string;
    youtube: string;
    linkedin: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogTitle: string;
    ogDescription: string;
  };
  services: ServiceItem[];
  portfolio: PortfolioProject[];
  testimonials: TestimonialItem[];
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  type: 'inquiry' | 'project' | 'client' | 'content' | 'auth';
  timestamp: string;
}

export interface DashboardStats {
  totalVisitors: number;
  totalSubmissions: number;
  totalInquiries: number;
  totalServices: number;
  totalProjects: number;
  conversionRate: string;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  activeClients: number;
  activeProjects: number;
  completedProjects: number;
  visitorsToday: number;
  chartData: {
    day: string;
    visitors: number;
    inquiries: number;
  }[];
}

export interface AdminProfile {
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  lastLogin: string;
  notifyOnNewLead: boolean;
  notifyEmail: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
