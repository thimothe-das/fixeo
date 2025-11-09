"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCategoryConfig, getStatusConfig } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DisputeAction {
  id: number;
  timestamp: string;
  actorId: number;
  actorType: string;
  disputeReason: string;
  disputeDetails: string;
  createdAt: string;
  actor: {
    id: number;
    name: string;
    email: string;
  };
}

interface DisputedRequest {
  id: number;
  title: string;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  assignedArtisanId: number | null;
  client: {
    id: number;
    name: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
  artisan: {
    id: number;
    name: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  } | null;
  disputeActions: DisputeAction[];
}

const getDisputeReasonLabel = (reason: string) => {
  const labels: Record<string, string> = {
    incomplete: "Travail incomplet",
    quality: "Problème de qualité",
    damage: "Dégâts causés",
    different: "Différent de prévu",
    other: "Autre",
  };
  return labels[reason] || reason;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateText = (text: string, maxLength: number = 80) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] =
    useState<DisputedRequest | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const router = useRouter();

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/disputes");

      if (!response.ok) {
        throw new Error("Failed to fetch disputes");
      }

      const data = await response.json();
      setDisputes(data.disputes || []);
    } catch (err) {
      console.error("Error fetching disputes:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;

    try {
      setIsResolving(true);

      const response = await fetch(
        `/api/admin/disputes/${selectedDispute.id}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resolutionNotes: resolutionNotes || undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resolve dispute");
      }

      // Refresh disputes list
      await fetchDisputes();

      // Close dialog and reset
      setShowResolveDialog(false);
      setSelectedDispute(null);
      setResolutionNotes("");
    } catch (err) {
      console.error("Error resolving dispute:", err);
      alert("Erreur lors de la résolution du litige");
    } finally {
      setIsResolving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, "h-4 w-4");
    return (
      <Badge
        variant="outline"
        className={`${config.colors?.bg || "bg-gray-100"} ${
          config.colors?.text || "text-gray-700"
        }`}
      >
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading disputes: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des litiges
          </h1>
          <p className="text-gray-600 mt-1">
            Visualisez et gérez les demandes contestées
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-lg px-4 py-2 bg-orange-50 text-orange-700 border-orange-200"
        >
          {disputes.length} litige{disputes.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun litige en cours
            </h3>
            <p className="text-gray-600">
              Toutes les demandes contestées ont été résolues.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Litiges actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre / Service</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => {
                  const categoryConfig = getCategoryConfig(
                    dispute.serviceType,
                    "h-4 w-4"
                  );
                  const latestDispute = dispute.disputeActions[0];

                  return (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-medium">
                        #{dispute.id}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {dispute.title || "Sans titre"}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {categoryConfig.icon}
                            <span>{categoryConfig.type}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">
                              {dispute.client.firstName &&
                              dispute.client.lastName
                                ? `${dispute.client.firstName} ${dispute.client.lastName}`
                                : dispute.client.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {dispute.client.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dispute.artisan ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium">
                                {dispute.artisan.firstName &&
                                dispute.artisan.lastName
                                  ? `${dispute.artisan.firstName} ${dispute.artisan.lastName}`
                                  : dispute.artisan.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {dispute.artisan.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Non assigné
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                      <TableCell>
                        {latestDispute ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {getDisputeReasonLabel(
                                    latestDispute.disputeReason
                                  )}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                  {truncateText(
                                    latestDispute.disputeDetails,
                                    200
                                  )}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(dispute.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/workspace/requests/${dispute.id}`
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-white">
                                <p>Voir la demande complète</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => {
                                    setSelectedDispute(dispute);
                                    setShowResolveDialog(true);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Résoudre
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-white">
                                <p>Marquer le litige comme résolu</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Résoudre le litige
            </DialogTitle>
            <DialogDescription>
              Cette action marquera le litige comme résolu et changera le statut
              de la demande.
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-2">Informations du litige</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Demande:</span>{" "}
                    {selectedDispute.title || "Sans titre"} (ID: #
                    {selectedDispute.id})
                  </div>
                  <div>
                    <span className="font-medium">Client:</span>{" "}
                    {selectedDispute.client.firstName &&
                    selectedDispute.client.lastName
                      ? `${selectedDispute.client.firstName} ${selectedDispute.client.lastName}`
                      : selectedDispute.client.name}
                  </div>
                  {selectedDispute.artisan && (
                    <div>
                      <span className="font-medium">Artisan:</span>{" "}
                      {selectedDispute.artisan.firstName &&
                      selectedDispute.artisan.lastName
                        ? `${selectedDispute.artisan.firstName} ${selectedDispute.artisan.lastName}`
                        : selectedDispute.artisan.name}
                    </div>
                  )}
                </div>
              </div>

              {selectedDispute.disputeActions.length > 0 && (
                <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Détails de la contestation
                  </h4>
                  {selectedDispute.disputeActions.map((action) => (
                    <div key={action.id} className="space-y-2 text-sm mb-3">
                      <div>
                        <span className="font-medium">Raison:</span>{" "}
                        {getDisputeReasonLabel(action.disputeReason)}
                      </div>
                      <div>
                        <span className="font-medium">Détails:</span>
                        <p className="mt-1 text-gray-700">
                          {action.disputeDetails}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        Par {action.actor?.name || "Inconnu"} le{" "}
                        {formatDate(action.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Notes de résolution (optionnel)
                </label>
                <Textarea
                  placeholder="Ajoutez des notes sur la résolution de ce litige..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResolveDialog(false);
                setSelectedDispute(null);
                setResolutionNotes("");
              }}
              disabled={isResolving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleResolveDispute}
              disabled={isResolving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isResolving ? "Résolution..." : "Marquer comme résolu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
