export type ServiceRequestForArtisan = {
  id: number;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
  photos?: string;
  isAssigned: boolean;
  category?: string;
  date?: string;
  time?: string;
  notes?: string;
  timeline?: Array<{
    step: string;
    completed: boolean;
    date?: string;
  }>;
  messages?: Array<{
    id: number;
    sender: string;
    message: string;
    createdAt: string;
  }>;
  requirements?: string[];
};

export type ArtisanStats = {
  totalRequests: number;
  completedRequests: number;
  avgRating: number;
  todayRevenue: number;
  todayJobs: number;
  monthlyRevenue: number;
  totalJobs: number;
};

export type ServiceRequestForAdmin = {
  id: number;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  updatedAt: string;
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
  photos?: string;
  client?: {
    id: number;
    name: string;
    email: string;
  };
  assignedArtisan?: {
    id: number;
    name: string;
    email: string;
  };
  billingEstimates?: BillingEstimateForAdmin[];
};

export type BillingEstimateForAdmin = {
  id: number;
  serviceRequestId: number;
  adminId: number;
  estimatedPrice: number;
  description: string;
  breakdown?: string; // JSON string
  validUntil?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  clientResponse?: string;
  createdAt: string;
  updatedAt: string;
  admin?: {
    id: number;
    name: string;
    email: string;
  };
};

export type BillingEstimateForClient = {
  id: number;
  serviceRequestId: number;
  estimatedPrice: number;
  description: string;
  breakdown?: string; // JSON string
  validUntil?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  clientResponse?: string;
  createdAt: string;
  updatedAt: string;
  serviceRequest?: {
    id: number;
    serviceType: string;
    description: string;
    location: string;
    status: string;
  };
};

export type BillingEstimateBreakdownItem = {
  description: string;
  quantity: number;
  unitPrice: number; // In cents
  total: number; // In cents
};

export type AdminStats = {
  totalRequests: number;
  pendingRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalUsers: number;
  totalArtisans: number;
  totalClients: number;
  awaitingEstimateRequests: number;
  pendingEstimates: number;
}; 