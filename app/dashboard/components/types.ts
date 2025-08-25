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