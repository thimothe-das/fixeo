"use client";

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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cn,
  getCategoryConfig,
  getPriorityConfig,
  ServiceType,
  Urgency,
} from "@/lib/utils";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Navigation,
  Wrench,
  XCircle,
} from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import { useMemo, useState } from "react";

moment.locale("fr");

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
  title?: string;
};

interface RequestsProps {
  requests?: ServiceRequestForArtisan[];
  onAcceptRequest: (requestId: number) => void;
  onRefuseRequest: (requestId: number) => void;
}

export function Requests({
  requests = [],
  onAcceptRequest,
  onRefuseRequest,
}: RequestsProps) {
  const [requestSelectedJob, setRequestSelectedJob] =
    useState<ServiceRequestForArtisan | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    category: "all",
    date: "all",
    urgency: "all",
  });
  const [sortBy, setSortBy] = useState("newest");

  // Photo gallery state
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);

  // Confirmation modal state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );

  const categories = [
    { value: "all", label: "Toutes catégories" },
    ...Object.values(ServiceType).map((category) => ({
      value: getCategoryConfig(category, "h-5 w-5").type,
      label: getCategoryConfig(category, "h-5 w-5").type,
    })),
  ];

  const sortOptions = [
    { value: "newest", label: "Plus récentes" },
    { value: "urgency", label: "Urgence" },
    { value: "distance", label: "Distance" },
    { value: "payout", label: "Rémunération" },
  ];

  // Photo gallery functions
  const openPhotoGallery = (photos: string[], startIndex: number = 0) => {
    setGalleryPhotos(photos);
    setCurrentPhotoIndex(startIndex);
    setShowPhotoGallery(true);
  };

  const closePhotoGallery = () => {
    setShowPhotoGallery(false);
    setGalleryPhotos([]);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev < galleryPhotos.length - 1 ? prev + 1 : 0
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev > 0 ? prev - 1 : galleryPhotos.length - 1
    );
  };

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
          request.urgency === Urgency.URGENT
        )
          return false;
        if (
          selectedFilters.urgency === "flexible" &&
          request.urgency === Urgency.FLEXIBLE
        )
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "urgency":
          if (a.urgency === Urgency.URGENT && b.urgency !== Urgency.URGENT)
            return -1;
          if (a.urgency !== Urgency.URGENT && b.urgency === Urgency.URGENT)
            return 1;
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
    const urgencyConfig = getPriorityConfig(request.urgency, "h-3 w-3");
    return (
      <Badge
        variant="outline"
        className={`${urgencyConfig.colors.bg} ${urgencyConfig.colors.text} inline-flex items-center gap-2`}
      >
        {urgencyConfig.icon}
        {urgencyConfig.label}
      </Badge>
    );
  };

  // Photo Gallery Modal Component
  const PhotoGalleryModal = () => {
    if (!showPhotoGallery || galleryPhotos.length === 0) return null;

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
          onClick={closePhotoGallery}
        >
          <XCircle className="h-6 w-6" />
        </Button>

        {/* Photo counter */}
        <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded z-50">
          {currentPhotoIndex + 1} sur {galleryPhotos.length}
        </div>

        {/* Navigation buttons */}
        {galleryPhotos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
              onClick={prevPhoto}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
              onClick={nextPhoto}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Main photo */}
        <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          <img
            src={galleryPhotos[currentPhotoIndex] || "/placeholder.svg"}
            alt={`Photo ${currentPhotoIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Thumbnail navigation */}
        {galleryPhotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded">
            {galleryPhotos.map((photo, index) => (
              <button
                key={index}
                className={cn(
                  "w-12 h-12 rounded border-2 overflow-hidden",
                  currentPhotoIndex === index
                    ? "border-white"
                    : "border-white/50 hover:border-white/80"
                )}
                onClick={() => setCurrentPhotoIndex(index)}
              >
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Click outside to close */}
        <div className="absolute inset-0 -z-10" onClick={closePhotoGallery} />
      </div>
    );
  };

  const RequestCard = useMemo(
    () =>
      ({ request }: { request: ServiceRequestForArtisan }) => {
        const photos = request.photos ? JSON.parse(request.photos) : [];
        const isUrgent = request.urgency === Urgency.URGENT;
        const isTaken = request.isAssigned;

        const [isDescriptionExpanded, setIsDescriptionExpanded] =
          useState(false);
        const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

        const description = request.description || "Aucune description";
        const isLongDescription = description.length > 150;
        const categoryConfig = getCategoryConfig(
          request.serviceType,
          "h-5 w-5 "
        );

        // Determine which photos to show (user photos or default)
        const displayPhotos =
          photos.length > 0 ? photos : [categoryConfig.defaultPhoto];
        const hasMultiplePhotos = displayPhotos.length > 1;

        const nextPhoto = (e: React.MouseEvent) => {
          e.stopPropagation();
          setCurrentPhotoIndex((prev) =>
            prev < displayPhotos.length - 1 ? prev + 1 : 0
          );
        };

        const prevPhoto = (e: React.MouseEvent) => {
          e.stopPropagation();
          setCurrentPhotoIndex((prev) =>
            prev > 0 ? prev - 1 : displayPhotos.length - 1
          );
        };

        return (
          <Card
            className={cn(
              `!h-fit rounded-lg border shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-t-4 p-0`,
              isUrgent ? "border-t-red-500 bg-red-50/30" : "border-t-blue-500",
              isTaken ? "opacity-60" : ""
            )}
            onClick={() => setRequestSelectedJob(request)}
          >
            <CardContent className="!p-0">
              <div className="flex flex-col">
                {/* Photo Carousel Section */}
                <div className="relative w-full h-56 bg-gray-100 group">
                  <img
                    src={displayPhotos[currentPhotoIndex] || "/placeholder.svg"}
                    alt={`Photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (photos.length > 0) {
                        openPhotoGallery(photos, currentPhotoIndex);
                      }
                    }}
                  />

                  {/* Arrow Navigation - Only show if multiple photos */}
                  {hasMultiplePhotos && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={prevPhoto}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={nextPhoto}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}

                  {/* Dot Indicators - Only show if multiple photos */}
                  {hasMultiplePhotos && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {displayPhotos.map((_: string, index: number) => (
                        <button
                          key={index}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            currentPhotoIndex === index
                              ? "bg-white w-6"
                              : "bg-white/60 hover:bg-white/80"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhotoIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Photo counter badge */}
                  {photos.length > 0 && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {currentPhotoIndex + 1} / {displayPhotos.length}
                    </div>
                  )}

                  {/* Price Overlay - Bottom Right */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {request.estimatedPrice
                        ? (request.estimatedPrice / 100).toFixed(2)
                        : "60"}
                      €
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {request.title}
                  </h3>

                  {/* Time Created */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Créée {moment(request.createdAt).fromNow()}</span>
                  </div>

                  {/* Location with Navigation */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center flex-1 min-w-0">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2 shrink-0" />
                      <span className="truncate">{request.location}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0 ml-2 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        const encodedLocation = encodeURIComponent(
                          request.location
                        );
                        const mapsUrl = `https://maps.google.com/maps?q=${encodedLocation}`;
                        window.open(mapsUrl, "_blank");
                      }}
                      title="Navigate to location"
                    >
                      <Navigation className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>

                  {/* Urgency Badge */}
                  <div>{getUrgencyBadge(request)}</div>

                  {/* Description with Expand/Collapse */}
                  <div>
                    <p
                      className={cn(
                        "text-sm text-gray-700 leading-relaxed transition-all duration-200",
                        !isDescriptionExpanded && isLongDescription
                          ? "line-clamp-3"
                          : ""
                      )}
                    >
                      {description}
                    </p>
                    {isLongDescription && (
                      <button
                        className="text-fixeo-accent-500 hover:text-fixeo-accent-600 text-sm font-medium mt-1 transition-colors hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDescriptionExpanded(!isDescriptionExpanded);
                        }}
                      >
                        {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
                      </button>
                    )}
                  </div>

                  {/* Bottom Row: Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {!request.isAssigned ? (
                      <>
                        <Button
                          className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequestId(request.id);
                            setShowAcceptModal(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-10 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium text-sm touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequestId(request.id);
                            setShowRefuseModal(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-10 bg-transparent hover:bg-gray-50 border-gray-200 font-medium text-sm touch-manipulation"
                        disabled
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Mission prise
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      },
    [onAcceptRequest]
  );

  const JobDetailModal = ({
    job,
    onClose,
  }: {
    job: ServiceRequestForArtisan;
    onClose: () => void;
  }) => {
    const photos = job.photos ? JSON.parse(job.photos) : [];
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const description = job.description || "Aucune description";
    const isLongDescription = description.length > 150;

    return (
      <div className="fixed inset-0 flex bg-black/50 items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header with Title and Close Button */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {job.title || job.serviceType}
                </h2>
                <div className="flex items-center gap-3">
                  {getUrgencyBadge(job)}
                  <span className="text-sm text-gray-500 capitalize">
                    {job.serviceType}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                {/* Close Button */}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <XCircle className="h-5 w-5" />
                </Button>
                {/* Simple Big Price */}
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-600">
                    {job.estimatedPrice
                      ? (job.estimatedPrice / 100).toFixed(2)
                      : "60"}
                    €
                  </div>
                </div>
              </div>
            </div>

            {/* Remove the old price section */}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">
                    Détails de la mission
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Créée {moment(job.createdAt).fromNow()}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {job.location}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">
                    Description
                  </h3>
                  <div>
                    <p
                      className={cn(
                        "text-sm text-gray-700 leading-relaxed transition-all duration-200",
                        !isDescriptionExpanded && isLongDescription
                          ? "line-clamp-3"
                          : ""
                      )}
                    >
                      {description}
                    </p>
                    {isLongDescription && (
                      <button
                        className="text-fixeo-accent-500 hover:text-fixeo-accent-600 text-sm font-medium mt-2 transition-colors hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDescriptionExpanded(!isDescriptionExpanded);
                        }}
                      >
                        {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
                      </button>
                    )}
                  </div>
                </div>

                {job.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">
                      Prérequis
                    </h3>
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
                    <h3 className="font-semibold mb-3 text-gray-900">
                      Photos ({photos.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((photo: string, index: number) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => openPhotoGallery(photos, index)}
                        >
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Cliquez sur une photo pour l'agrandir
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  {!job.isAssigned ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setSelectedRequestId(job.id);
                          setShowRefuseModal(true);
                          onClose();
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Refuser
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-11 text-white"
                        onClick={() => {
                          setSelectedRequestId(job.id);
                          setShowAcceptModal(true);
                          onClose();
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accepter
                      </Button>
                    </div>
                  ) : (
                    <Button disabled className="w-full h-11">
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
      {/* Header */}
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

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-white border-gray-200 shadow-sm">
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

      {/* Integrated Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filtres:</span>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedFilters.category}
              onValueChange={(value) =>
                setSelectedFilters({ ...selectedFilters, category: value })
              }
            >
              <SelectTrigger className="h-9 px-3 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors min-w-[140px]">
                <SelectValue placeholder="Catégorie" />
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

          {/* Urgency Filter */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedFilters.urgency}
              onValueChange={(value) =>
                setSelectedFilters({ ...selectedFilters, urgency: value })
              }
            >
              <SelectTrigger className="h-9 px-3 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors min-w-[120px]">
                <SelectValue placeholder="Urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="urgent">Urgentes</SelectItem>
                <SelectItem value="flexible">Flexibles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedFilters.date}
              onValueChange={(value) =>
                setSelectedFilters({ ...selectedFilters, date: value })
              }
            >
              <SelectTrigger className="h-9 px-3 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors min-w-[130px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedFilters.category !== "all" ||
          selectedFilters.urgency !== "all" ||
          selectedFilters.date !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSelectedFilters({
                category: "all",
                date: "all",
                urgency: "all",
              })
            }
            className="text-gray-500 hover:text-gray-700 h-9 px-3"
          >
            Effacer les filtres
          </Button>
        )}
      </div>

      {/* Requests Grid - Using Jobs.tsx layout */}
      {(filteredRequests?.length || 0) > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {filteredRequests!.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
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

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal />

      {/* Accept Confirmation Modal */}
      <AlertDialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'acceptation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir accepter cette demande ? En acceptant,
              vous vous engagez à effectuer cette mission et le client sera
              notifié de votre acceptation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (selectedRequestId) {
                  onAcceptRequest(selectedRequestId);
                  setShowAcceptModal(false);
                  setSelectedRequestId(null);
                }
              }}
            >
              Accepter la mission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refuse Confirmation Modal */}
      <AlertDialog open={showRefuseModal} onOpenChange={setShowRefuseModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le refus</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir refuser cette demande ? Cette demande ne
              vous sera plus affichée et vous ne pourrez plus l'accepter par la
              suite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (selectedRequestId) {
                  onRefuseRequest(selectedRequestId);
                  setShowRefuseModal(false);
                  setSelectedRequestId(null);
                }
              }}
            >
              Refuser la demande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
