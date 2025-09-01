import useSWR from 'swr';

interface BillingEstimateForClient {
  id: number;
  serviceRequestId: number;
  adminId: number | null;
  estimatedPrice: number;
  description: string;
  breakdown: any;
  validUntil: Date;
  status: 'pending' | 'accepted' | 'rejected';
  clientResponse: string | null;
  createdAt: Date;
  updatedAt: Date;
  admin: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  serviceRequest: {
    id: number;
    userId: number;
    serviceType: string;
    description: string;
    location: any;
    status: string;
    title: string;
    createdAt: Date;
  } | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBillingEstimate(estimateId: number | string | null) {
  const shouldFetch = estimateId !== null && estimateId !== undefined;
  const key = shouldFetch ? `/api/client/billing-estimates/${estimateId}` : null;
  
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<BillingEstimateForClient>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    estimate: data,
    error,
    isLoading,
    mutate,
  };
}

export function useArtisanBillingEstimate(estimateId: number | string | null) {
  const shouldFetch = estimateId !== null && estimateId !== undefined;
  const key = shouldFetch ? `/api/artisan/billing-estimates/${estimateId}` : null;
  
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<BillingEstimateForClient>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    estimate: data,
    error,
    isLoading,
    mutate,
  };
}

export function useAdminBillingEstimate(estimateId: number | string | null) {
  const shouldFetch = estimateId !== null && estimateId !== undefined;
  const key = shouldFetch ? `/api/admin/billing-estimates/${estimateId}` : null;
  
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<BillingEstimateForClient>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    estimate: data,
    error,
    isLoading,
    mutate,
  };
}
