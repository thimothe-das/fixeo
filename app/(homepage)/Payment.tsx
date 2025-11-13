"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, CheckCircle, Loader2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Payment() {
  const router = useRouter();
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [showPaymentFailedModal, setShowPaymentFailedModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const requestId = searchParams?.get("requestId");
  const pathname = usePathname() || "";

  const fetchPaymentStatus = async (requestId: string | null) => {
    if (!requestId) {
      return;
    }
    const params = new URLSearchParams();
    params.set("requestId", requestId);
    const response = await fetch(`/api/payments/status?${params}`);
    const data = await response.json();
    return data;
  };
  const handlePaymentFailed = async () => {
    setShowPaymentFailedModal(true);
  };

  const handlePaymentRequestIdVerification = async (
    requestId: string | null
  ) => {
    if (!requestId) return;

    setLoading(true);
    const data = await fetchPaymentStatus(requestId);
    if (data.paymentCompleted) {
      setShowPaymentSuccessModal(true);
    } else {
      handlePaymentFailed();
    }
    setLoading(false);
    router.replace(pathname);
  };

  useEffect(() => {
    handlePaymentRequestIdVerification(requestId || null);
  }, [requestId]);

  const handlePaymentSuccessConfirm = () => {
    setShowPaymentSuccessModal(false);
    const token = requestId;
    router.push(`/suivi/${token}`);
  };

  return (
    <>
      <Dialog
        open={showPaymentSuccessModal}
        onOpenChange={setShowPaymentSuccessModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              Paiement réussi !
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Votre demande a été confirmée et transmise aux artisans de votre
              secteur. Vous allez être redirigé vers la page de suivi de votre
              demande.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center space-x-2">
            <Button
              onClick={handlePaymentSuccessConfirm}
              className="w-full bg-fixeo-accent-500 hover:bg-fixeo-accent-600 text-white"
            >
              Voir ma demande
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPaymentFailedModal}
        onOpenChange={setShowPaymentFailedModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              Paiement échoué !
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Votre demande n'a pas été confirmée. Veuillez réessayer.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={loading} onOpenChange={setLoading}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
              <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              Vérification du paiement...
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Votre paiement est en cours de vérification. Veuillez patienter.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
