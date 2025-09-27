import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, CheckCircle } from "lucide-react";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  requestId?: string;
}

export function PaymentSuccessModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Paiement réussi !",
  description = "Votre paiement a été confirmé avec succès.",
  confirmText = "Continuer",
  requestId,
}: PaymentSuccessModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {description}
            {requestId && (
              <div className="mt-2 text-sm text-gray-500">
                Référence: {requestId}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center space-x-2">
          <Button
            onClick={handleConfirm}
            className="w-full bg-fixeo-accent-500 hover:bg-fixeo-accent-600 text-white"
          >
            {confirmText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
