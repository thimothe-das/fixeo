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
  title?: string;
  date?: string;
  time?: string;
  notes?: string;
  client?: {
    id: number | null;
    name: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
  assignedArtisan?: {
    id: number | null;
    name: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    specialty: string | null;
  };
  billingEstimates?: Array<{
    id: number;
    estimatedPrice: number;
    status: string;
    validUntil: string | null;
    createdAt: string;
    description: string;
    breakdown: string | null;
  }>;
  timeline?: {
    created?: {
      date: string;
      actor: string;
    };
    quote?: {
      date: string;
      actor: string;
    };
    accepted?: {
      date: string;
      actor: string;
    };
  };
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
    createdAt: string;
    title: string;
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
  disputedRequests: number;
  totalUsers: number;
  totalArtisans: number;
  totalClients: number;
  awaitingEstimateRequests: number;
  pendingEstimates: number;
  totalEarnings: number; // In cents
  requestsTimeSeriesData: Array<{
    date: string;
    count: number;
  }>;
  earningsTimeSeriesData: Array<{
    date: string;
    earnings: number; // In cents
  }>;
}; 