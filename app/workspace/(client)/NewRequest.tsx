import { setGuestToken } from "@/app/suivi/[token]/token-storage";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/lib/db/schema";
import { cn, fetcher, getCategoryConfig, ServiceType } from "@/lib/utils";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import useSWR from "swr";
import { CreateRequestType, createServiceRequest } from "../actions";

interface NewRequestProps {
  onRequestCreated: () => void;
  isModal?: boolean;
  className?: string;
}

export function NewRequest({
  onRequestCreated,
  isModal = false,
  className,
}: NewRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const userEmail = user?.email;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestType>({
    defaultValues: {
      title: "",
      serviceType: "",
      urgency: "",
      description: "",
      clientEmail: userEmail,
      photos: [],
      location: "",
      location_housenumber: "",
      location_street: "",
      location_postcode: "",
      location_city: "",
      location_citycode: "",
      location_district: "",
      location_coordinates: "",
      location_context: "",
    },
  });
  const photos = useWatch({ control, name: "photos" });

  const onSubmit: SubmitHandler<CreateRequestType> = async (data) => {
    const serviceRequestResult = await createServiceRequest(data);
    if ("success" in serviceRequestResult && serviceRequestResult.success) {
      if (serviceRequestResult.guestToken) {
        setGuestToken(serviceRequestResult.guestToken);
      }
      setIsOpen(false);
      router.push(`/workspace/requests/${serviceRequestResult.requestId}`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setValue("photos", [...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setValue(
      "photos",
      photos.filter((_, i) => i !== index)
    );
  };

  const handleAddressChange = (value: AddressData | null): void => {
    setValue("location_housenumber", value?.housenumber || "");
    setValue("location_street", value?.street || "");
    setValue("location_postcode", value?.postcode || "");
    setValue("location_city", value?.city || "");
    setValue("location_citycode", value?.citycode || "");
    setValue("location_district", value?.district || "");
    setValue("location_coordinates", value?.coordinates.join(",") || "");
    setValue("location_context", value?.context || "");
    setValue("location", value?.label || "");
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de la demande *
        </label>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Donnez un titre court à votre demande..."
              required
              className="w-full"
              maxLength={100}
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">Maximum 100 caractères</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de service *
          </label>
          <Controller
            control={control}
            name="serviceType"
            render={({ field }) => {
              return (
                <Select {...field} onValueChange={field.onChange} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ServiceType).map((serviceType) => {
                      const categoryConfig = getCategoryConfig(
                        serviceType,
                        "h-4 w-4"
                      );
                      return (
                        <SelectItem key={serviceType} value={serviceType}>
                          {categoryConfig.icon}
                          {categoryConfig.type}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              );
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgence *
          </label>
          <Controller
            control={control}
            name="urgency"
            render={({ field }) => (
              <Select {...field} onValueChange={field.onChange} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Quand ?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🚨 Urgent (24h)</SelectItem>
                  <SelectItem value="week">📅 Cette semaine</SelectItem>
                  <SelectItem value="flexible">⏰ Flexible</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <Textarea
          name="description"
          placeholder="Décrivez votre problème ou vos besoins en détail..."
          required
          className="min-h-[100px] resize-none"
        />
      </div>

      <div>
        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <AddressAutocomplete
              onChange={handleAddressChange}
              label="📍 Adresse d'intervention"
              placeholder="Tapez votre adresse complète..."
              required
              className="h-11 focus:border-blue-500 text-sm"
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (optionnel)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="photo-upload"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <label
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Cliquez pour ajouter des photos
            </span>
            <span className="text-xs text-gray-500">
              PNG, JPG jusqu'à 10MB chacune
            </span>
          </label>
        </div>

        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs p-1 rounded truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`flex gap-3 ${isModal ? "pt-4 border-t" : ""}`}>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-fixeo-accent-500 hover:bg-fixeo-accent-600 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création et paiement...
            </>
          ) : (
            "Créer la demande et payer"
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      {isModal ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className={cn(
                className,
                "w-full bg-fixeo-accent-500 hover:bg-fixeo-accent-500 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-colors cursor-pointer hover:cursor-pointer"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Créer une nouvelle demande
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Décrivez votre besoin et recevez des devis personnalisés de nos
                artisans qualifiés.
              </DialogDescription>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Créer une nouvelle demande
              </CardTitle>
              <p className="text-sm text-gray-600">
                Remplissez ce formulaire pour soumettre votre demande de service
              </p>
            </CardHeader>
            <CardContent>{formContent}</CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
