import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServiceRequestStatus } from "@/lib/db/schema";
import {
  getCategoryConfig,
  getPriorityConfig,
  getStatusConfig,
  handleAcceptQuote,
} from "@/lib/utils";
import {
  AlertTriangle,
  Calculator,
  Check,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Phone,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import moment from "moment";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

export default function RequestCardContainer({
  request,
  onRequestUpdate,
}: {
  request: any;
  onRequestUpdate?: () => void;
}) {
  const router = useRouter();
  const [descriptionExpanded, setDescriptionExpanded] = React.useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const pathname = usePathname();
  // Validation states
  const [showValidationDialog, setShowValidationDialog] = React.useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "dispute"
  >("approve");
  const [isSubmittingValidation, setIsSubmittingValidation] =
    React.useState(false);

  const photos = request.photos ? JSON.parse(request.photos) : [];
  const relevantEstimate = request.billingEstimates?.[0];
  const priorityConfig = getPriorityConfig(request.priority);
  const statusConfig = getStatusConfig(request.status, "h-4 w-4 flex-shrink-0");
  const categoryConfig = getCategoryConfig(request.serviceType, "h-4 w-4");

  const handleRejectQuote = async () => {
    if (!relevantEstimate) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/client/billing-estimates/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateId: relevantEstimate.id,
          action: "reject",
        }),
      });

      if (response.ok) {
        setShowRejectDialog(false);
        onRequestUpdate?.(); // Refresh the requests list
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error rejecting quote:", error);
      alert("Erreur lors du refus du devis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateCompletion = async () => {
    setIsSubmittingValidation(true);
    try {
      const response = await fetch(
        `/api/service-requests/${request.id}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: validationType,
          }),
        }
      );

      if (response.ok) {
        setShowValidationDialog(false);
        setShowDisputeDialog(false);
        onRequestUpdate?.(); // Refresh the requests list
        resetValidationForm();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error validating completion:", error);
      alert("Erreur lors de la validation");
    } finally {
      setIsSubmittingValidation(false);
    }
  };

  const resetValidationForm = () => {
    setValidationType("approve");
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/workspace/requests/${request.id}`);
  };

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`;
  };

  const handleDeclineEstimate = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.stopPropagation();
    e.preventDefault();
    setShowRejectDialog(true);
  };
  const handleAcceptEstimate = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.stopPropagation();
    e.preventDefault();
    setShowAcceptDialog(true);
  };
  return (
    <Card
      className="block group rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden !p-0 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className={`h-1 ${priorityConfig.topBarColor}`} />

      {(request.status === ServiceRequestStatus.DISPUTED_BY_CLIENT ||
        request.status === ServiceRequestStatus.DISPUTED_BY_ARTISAN ||
        request.status === ServiceRequestStatus.DISPUTED_BY_BOTH) && (
        <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-4 py-3 shadow-2xl shadow-red-500/25 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full"></div>

          <div className="relative z-10 flex items-center justify-between">
            {/* Left side - Enhanced alert section */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="h-4 w-4 text-white drop-shadow-sm" />
                <div className="absolute -inset-0.5 bg-white/30 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="font-bold text-white text-xs tracking-wide uppercase drop-shadow-sm">
                  Litige en cours
                </span>
                <div className="text-white/90 text-[10px] font-medium">
                  Réponse sous 48h
                </div>
              </div>
            </div>

            {/* Right side - Enhanced action section */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="group relative bg-white text-red-600 border-2 border-white hover:bg-red-50 text-xs h-7 px-4 rounded-full font-bold cursor-pointer hover:text-white hover:bg-red-500"
              >
                <FileText className="h-3 w-3 mr-1.5" />
                <span className="font-bold tracking-wide">Voir</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <CardHeader className="p-3 pt-1">
        <div className="space-y-2  overflow-hidden">
          {/* Title with category icon and status badge row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-4 h-4 flex items-center justify-center ${categoryConfig.colors.text} cursor-help flex-shrink-0`}
                    >
                      {categoryConfig.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-white capitalize">
                      {request.serviceType}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="text-lg font-semibold text-slate-900 leading-tight group-hover:text-slate-700 transition-colors duration-200 truncate">
                      {request.title}
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-white">{request.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={`rounded-full m-1 text-xs px-1 py-1 font-medium ${statusConfig.color} ml-3 max-w-24 flex items-center gap-1 truncate ${statusConfig.colors.bg} ${statusConfig.colors.text} flex-shrink-0`}
                  >
                    {statusConfig.icon}
                    <span className="truncate min-w-0">
                      {statusConfig.label}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-white">{statusConfig.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      {/* Client Already Validated Banner */}
      {request.status === ServiceRequestStatus.CLIENT_VALIDATED && (
        <div className="px-3 pb-3">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">
                Vous avez validé cette mission. En attente de la validation de
                l'artisan.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <CardContent className="p-3 pt-0 pb-0 space-y-2">
        {/* Description callout */}
        <div
          className={`
            relative p-1
            ${categoryConfig.colors.accent}
          `}
        >
          <p
            className={`text-sm text-slate-400 leading-relaxed ${
              !descriptionExpanded ? "line-clamp-2" : ""
            }`}
          >
            {request.description}
          </p>
          {request.description.length > 100 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDescriptionExpanded(!descriptionExpanded);
              }}
              className={`h-auto p-0 text-xs mt-2 font-medium hover:underline text-fixeo-accent-500 hover:text-fixeo-accent-600 hover:underline`}
            >
              {descriptionExpanded ? "Voir moins" : "Voir plus"}
            </Button>
          )}
        </div>

        {/* Photos */}
        {/* {photos.length > 0 ? (
          <PhotosStrip photos={photos} />
        ) : (
          <div className="flex items-center justify-center h-12 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400">
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Aucune photo fournie</span>
            </div>
          </div>
        )} */}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 pb-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center">
            {/* Artisan Panel */}
            <div className="space-y-1 h-full">
              {request.assignedArtisan ? (
                <div className="flex flex-col items-center text-center space-y-1">
                  {/* Photo */}
                  {request.assignedArtisan.profilePicture ? (
                    <img
                      src={request.assignedArtisan.profilePicture}
                      alt={request.assignedArtisan.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                  )}

                  {/* Name and First Name */}
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs font-semibold text-slate-900 truncate cursor-help max-w-30">
                            {request.assignedArtisan.firstName &&
                            request.assignedArtisan.lastName
                              ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                              : request.assignedArtisan.name}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-white">
                            {request.assignedArtisan.firstName &&
                            request.assignedArtisan.lastName
                              ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                              : request.assignedArtisan.name}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {request.assignedArtisan.specialty && (
                      <p className="text-xs text-slate-500">
                        {request.assignedArtisan.specialty}
                      </p>
                    )}
                  </div>

                  {/* <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-slate-700">
                      {request.assignedArtisan.rating?.toFixed(1) || "4.5"}
                    </span>
                  </div> */}

                  {/* Phone Number Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7"
                    onClick={() => {
                      // Handle phone call logic
                      if (request.assignedArtisan?.email) {
                        window.open(
                          `tel:${request.assignedArtisan.email}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>

                  {/* Additional Actions */}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center text-slate-500 h-full">
                  <Clock className="h-4 w-4 mb-1" />
                  <span className="text-xs font-medium text-center">
                    En attente d'assignation
                  </span>
                </div>
              )}
            </div>

            {/* Right Panel - Conditional based on status */}
            <div className="space-y-1 h-full">
              {/* Special statuses Panel - for non-dispute issues */}

              {/* Standard Devis Panel - for non-dispute statuses */}
              {relevantEstimate && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200 p-2 relative h-full flex flex-col justify-between">
                  {/* Accepted Check Icon */}
                  {relevantEstimate.status === "accepted" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-white">Devis accepté</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {relevantEstimate.status === "rejected" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-white">Devis refusé</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="h-4 w-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Devis
                    </span>
                  </div>

                  {/* Price - Most prominent */}
                  <div className="mb-1">
                    <p className="text-lg font-bold text-slate-900 tracking-tight">
                      {formatPrice(relevantEstimate.estimatedPrice)}
                    </p>
                    {relevantEstimate.validUntil && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        Expire le{" "}
                        {moment(relevantEstimate.validUntil).format(
                          "DD/MM/YYYY"
                        )}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-1.5">
                    {relevantEstimate.status === "pending" ? (
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          size="sm"
                          onClick={handleAcceptEstimate}
                          className="group relative bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 border-0 text-white shadow-sm hover:shadow-md transition-all duration-200 text-[10px] h-6 px-2 font-medium rounded-md"
                        >
                          <CheckCircle className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeclineEstimate}
                          className="group relative border border-slate-300 text-slate-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50 active:bg-rose-100 transition-all duration-200 text-[10px] h-6 px-2 font-medium rounded-md"
                        >
                          <X className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          router.push(
                            `/workspace/devis/${relevantEstimate.id}`
                          );
                        }}
                        className="w-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 text-[10px] h-6 font-medium rounded-md"
                      >
                        <Eye className="h-3 w-3 mr-1.5" />
                        Voir détails
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* No estimate panel */}
              {ServiceRequestStatus.AWAITING_ESTIMATE === request.status &&
                !relevantEstimate && (
                  <div className="bg-amber-50 rounded-lg p-2 flex flex-col items-center justify-center text-amber-600 h-16">
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium text-center">
                      Devis en préparation
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Metadata footer - subtle info */}
          <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
            <p className="text-xs text-slate-400 text-center truncate">
              📍 {request.location}
            </p>
            {/* <p className="text-xs text-slate-400 text-center">
              Créée le {moment(request.createdAt).format("DD/MM/YYYY")}
            </p> */}
          </div>
        </div>
        {/* Validation Banner and Actions - Two-way validation system */}
        {(request.status === ServiceRequestStatus.IN_PROGRESS ||
          request.status === ServiceRequestStatus.ARTISAN_VALIDATED) && (
          <div className="pb-3 w-full">
            {/* Action Buttons */}
            <div className="flex gap-2 sm:justify-center">
              <Button
                size="sm"
                onClick={(e) => {
                  setValidationType("approve");
                  setShowValidationDialog(true);
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  setValidationType("dispute");
                  setShowDisputeDialog(true);
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="flex-1 h-11  border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-lg"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Contester
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Accepter le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir accepter ce devis de{" "}
              {relevantEstimate && formatPrice(relevantEstimate.estimatedPrice)}{" "}
              ? Cette action déclenchera le début des travaux.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleAcceptQuote(
                  request.id,
                  pathname,
                  relevantEstimate.estimatedPrice
                )
              }
              disabled={isLoading}
              className="bg-fixeo-main-600 hover:bg-fixeo-main-700 text-white"
            >
              {isLoading ? "En cours..." : "Accepter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir refuser ce devis ? L'artisan sera notifié
              de votre décision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectQuote}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "En cours..." : "Refuser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Validation Success Dialog */}
      <Dialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
      >
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              Valider la mission
            </DialogTitle>
            <DialogDescription>
              Confirmez que les travaux ont été réalisés de manière
              satisfaisante.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ✓ Mission validée avec succès
              </p>
              <p className="text-xs text-green-600 mt-1">
                L'artisan sera notifié de votre validation et le paiement sera
                déclenché.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidationDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidateCompletion}
              disabled={isSubmittingValidation}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmittingValidation
                ? "En cours..."
                : "Confirmer la validation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              Contester la mission
            </DialogTitle>
            <DialogDescription>
              Confirmez que vous souhaitez contester cette mission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Litige signalé
              </p>
              <p className="text-xs text-red-600 mt-1">
                Un litige sera ouvert et notre équipe examinera la situation. Le
                paiement sera suspendu en attendant la résolution.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisputeDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidateCompletion}
              disabled={isSubmittingValidation}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmittingValidation ? "En cours..." : "Confirmer le litige"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
