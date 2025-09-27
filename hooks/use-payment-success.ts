'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UsePaymentSuccessOptions {
  onPaymentSuccess?: (requestId?: string) => void;
  maxPolls?: number;
  pollInterval?: number;
}

export function usePaymentSuccess(options: UsePaymentSuccessOptions = {}) {
  const {
    onPaymentSuccess,
    maxPolls = 30, // Poll for max 30 seconds
    pollInterval = 1000, // Poll every second
  } = options;
  
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a requestId in URL params (after redirect from payment)
    const urlRequestId = searchParams.get('requestId');
    
    if (urlRequestId) {
      // Clean up URL by removing the requestId parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('requestId');
      router.replace(newUrl.pathname + newUrl.search);
      
      // Set the request ID for polling
      setRequestId(urlRequestId);
      
      // Start polling for payment success
      startPaymentPolling(urlRequestId);
    }
  }, [searchParams, router]);

  const startPaymentPolling = (requestIdToUse: string) => {
    let intervalId: NodeJS.Timeout;
    let pollCount = 0;

    const pollPaymentStatus = async () => {
      try {
        const guestToken = localStorage.getItem('guestToken');
        const params = new URLSearchParams();

        if (guestToken) {
          params.set('guestToken', guestToken);
        }
        if (requestIdToUse) {
          params.set('requestId', requestIdToUse);
        }

        const response = await fetch(`/api/payments/status?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.paymentCompleted) {
            setShowPaymentSuccessModal(true);
            clearInterval(intervalId);
            
            // Call the callback if provided
            if (onPaymentSuccess) {
              onPaymentSuccess(requestIdToUse);
            }
            return;
          }
        }

        pollCount++;
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        clearInterval(intervalId);
      }
    };

    intervalId = setInterval(pollPaymentStatus, pollInterval);

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  };

  const dismissPaymentSuccess = () => {
    setShowPaymentSuccessModal(false);
    setRequestId(null);
  };

  return {
    showPaymentSuccessModal,
    requestId,
    dismissPaymentSuccess,
  };
}
