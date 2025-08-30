"use client";

import { useState } from "react";
import {
  XCircle,
  CheckCircle,
  Eye,
  Timer,
  Star,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Euro,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";

type ServiceRequestForArtisan = {
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
  requirements?: string[];
};

interface RequestsProps {
  requests?: ServiceRequestForArtisan[];
  onAcceptRequest: (requestId: number) => void;
}

export function Requests({ requests = [], onAcceptRequest }: RequestsProps) {
  const [requestSelectedJob, setRequestSelectedJob] =
    useState<ServiceRequestForArtisan | null>(null);
  const [requestShowFilters, setRequestShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: "all",
    date: "all",
    urgency: "all",
  });
  const [sortBy, setSortBy] = useState("newest");

  const categories = [
    { value: "all", label: "Toutes catégories" },
    { value: "plumbing", label: "Plomberie" },
    { value: "electrical", label: "Électricité" },
    { value: "heating", label: "Chauffage" },
    { value: "furniture", label: "Montage meuble" },
  ];

  const sortOptions = [
    { value: "newest", label: "Plus récentes" },
    { value: "urgency", label: "Urgence" },
    { value: "distance", label: "Distance" },
    { value: "payout", label: "Rémunération" },
  ];

  // Filter and sort logic
  const filteredRequests = requests
    ?.filter((request) => {
      if (
        selectedFilters.category !== "all" &&
        request.serviceType !== selectedFilters.category
      )
        return false;
      if (selectedFilters.urgency !== "all") {
        if (
          selectedFilters.urgency === "urgent" &&
          request.urgency === "urgent"
        )
          return false;
        if (
          selectedFilters.urgency === "flexible" &&
          request.urgency === "flexible"
        )
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "urgency":
          if (a.urgency === "urgent" && b.urgency !== "urgent") return -1;
          if (a.urgency !== "urgent" && b.urgency === "urgent") return 1;
          return 0;
        default: // newest
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const formatTimeLeft = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  const getUrgencyBadge = (
    request: ServiceRequestForArtisan & {
      taken?: boolean;
      urgent?: boolean;
      timeLeft?: number;
    }
  ) => {
    if (request.status === "taken" || request.taken) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          Prise
        </Badge>
      );
    }
    if (request.urgent || request.urgency === "urgent") {
      const isExpiringSoon = (request.timeLeft || 60) < 30;
      return (
        <Badge
          variant="destructive"
          className={`${
            isExpiringSoon ? "animate-pulse" : ""
          } flex items-center gap-1`}
        >
          <Timer className="h-3 w-3" />
          Urgent - {formatTimeLeft(request.timeLeft || 60)}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-green-600 border-green-200">
        Flexible
      </Badge>
    );
  };

  const JobDetailModal = ({
    job,
    onClose,
  }: {
    job: ServiceRequestForArtisan;
    onClose: () => void;
  }) => {
    const photos = job.photos ? JSON.parse(job.photos) : [];
    return (
      <div className="fixed inset-0 flex bg-black/50 items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{job.serviceType}</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Informations client</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Nom:</strong> {job.clientName}
                    </p>
                    <p>
                      <strong>Téléphone:</strong> {job.clientPhone}
                    </p>
                    <p className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <strong>Note:</strong> 5/5
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Détails de la mission</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {moment(job.createdAt).format("DD/MM/YYYY")}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {job.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Durée estimée: 2h
                    </p>
                    <p className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <strong className="text-green-600">60€</strong>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-700">{job.description}</p>
                </div>

                {job.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">Prérequis</h3>
                    <ul className="text-sm space-y-1">
                      {job.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {photos && photos.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Photos</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {photos.map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={photo || "/placeholder.svg"}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  {getUrgencyBadge(job)}

                  {job.status === "available" || !job.isAssigned ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={onClose}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Refuser
                      </Button>
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          onAcceptRequest(job.id);
                          onClose();
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accepter
                      </Button>
                    </div>
                  ) : (
                    <Button disabled className="w-full">
                      Mission déjà prise
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Demandes de mission
          </h1>
          <p className="text-gray-600">
            {filteredRequests?.length || 0} demande
            {(filteredRequests?.length || 0) !== 1 ? "s" : ""} disponible
            {(filteredRequests?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRequestShowFilters(!requestShowFilters)}
            className="sm:hidden"
          >
            Filtres
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card className={`${requestShowFilters ? "block" : "hidden"} sm:block`}>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Catégorie</Label>
              <Select
                value={selectedFilters.category}
                onValueChange={(value) =>
                  setSelectedFilters({ ...selectedFilters, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Urgence</Label>
              <Select
                value={selectedFilters.urgency}
                onValueChange={(value) =>
                  setSelectedFilters({ ...selectedFilters, urgency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="urgent">Urgentes</SelectItem>
                  <SelectItem value="flexible">Flexibles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Date</Label>
              <Select
                value={selectedFilters.date}
                onValueChange={(value) =>
                  setSelectedFilters({ ...selectedFilters, date: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes dates</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Cards */}
      {(filteredRequests?.length || 0) > 0 ? (
        <div className="grid gap-4">
          {filteredRequests!.map((request) => {
            const photos = request.photos ? JSON.parse(request.photos) : [];
            return (
              <Card
                key={request.id}
                className={`transition-all hover:shadow-md ${
                  request.urgency === "urgent" && request.status === "available"
                    ? "border-red-200 bg-red-50"
                    : ""
                } ${request.status === "taken" ? "opacity-60" : ""}`}
              >
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {request.serviceType}
                          </h3>
                          <p className="text-gray-600">
                            Client: {request.clientName}
                          </p>
                        </div>
                        {getUrgencyBadge(request)}
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-2">
                        {request.description}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            {moment(request.createdAt).format("DD/MM/YYYY")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>2h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>5/5</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500">
                        {request.location}
                      </p>

                      {/* Photos */}
                      {photos && photos.length > 0 && (
                        <div className="flex gap-2">
                          {photos
                            .slice(0, 3)
                            .map((photo: string, index: number) => (
                              <img
                                key={index}
                                src={photo || "/placeholder.svg"}
                                alt={`Photo ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ))}
                          {photos.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                              +{photos.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-between items-end space-y-3 min-w-[200px]">
                      <div className="text-right">
                        <p className="font-bold text-2xl text-green-600">
                          {request.estimatedPrice
                            ? (request.estimatedPrice / 100).toFixed(2)
                            : "60"}
                          €
                        </p>
                        <p className="text-sm text-gray-500">Rémunération</p>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRequestSelectedJob(request)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Détails
                        </Button>

                        {request.status === "available" ||
                        !request.isAssigned ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2 bg-transparent"
                            >
                              <XCircle className="h-4 w-4" />
                              Refuser
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                              onClick={() => onAcceptRequest(request.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Accepter
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" disabled className="w-full">
                            Mission prise
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Empty State
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune demande disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Il n'y a actuellement aucune demande correspondant à vos critères.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>💡 Suggestions pour recevoir plus de demandes :</p>
              <ul className="space-y-1">
                <li>• Élargissez votre rayon d'intervention</li>
                <li>• Activez plus de catégories de services</li>
                <li>• Vérifiez vos disponibilités dans votre profil</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Detail Modal */}
      {requestSelectedJob && (
        <JobDetailModal
          job={requestSelectedJob}
          onClose={() => setRequestSelectedJob(null)}
        />
      )}

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Actualisation automatique toutes les 60 secondes
        </div>
      </div>
    </div>
  );
}
