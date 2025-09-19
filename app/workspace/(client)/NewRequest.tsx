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
import { ActionState } from "@/lib/auth/middleware";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { createServiceRequest } from "../actions";

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
  const [title, setTitle] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createServiceRequest,
    { error: "" }
  );

  const handleAddressChange = (
    address: AddressData | null,
    rawValue: string
  ) => {
    setSelectedAddress(address);
    setLocation(rawValue);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 photos allowed");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      return result.photos;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      // Upload photos first if any are selected
      let photoUrls: string[] = [];
      if (selectedFiles.length > 0) {
        photoUrls = await uploadPhotos();
      }

      // Add photo URLs to form data
      formData.set("photos", JSON.stringify(photoUrls));

      // Call the form action within a transition
      startTransition(async () => {
        formAction(formData);

        // Reset form on success (check state after action completes)
        setTimeout(() => {
          if (!state?.error) {
            setTitle("");
            setSelectedFiles([]);
            setServiceType("");
            setUrgency("");
            setLocation("");
            setSelectedAddress(null);
            setIsOpen(false); // Close modal after successful creation
            toast.success("Demande créée avec succès !", {
              description:
                "Vous recevrez bientôt des devis de nos artisans qualifiés.",
            });
            onRequestCreated();
          }
        }, 100);
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const formContent = (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de la demande *
        </label>
        <Input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Donnez un titre court à votre demande..."
          required
          className="w-full"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">Maximum 100 caractères</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de service *
          </label>
          <Select
            name="serviceType"
            value={serviceType}
            onValueChange={setServiceType}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plomberie">🔧 Plomberie</SelectItem>
              <SelectItem value="electricite">⚡ Électricité</SelectItem>
              <SelectItem value="menuiserie">🔨 Menuiserie</SelectItem>
              <SelectItem value="peinture">🎨 Peinture</SelectItem>
              <SelectItem value="renovation">🏠 Rénovation</SelectItem>
              <SelectItem value="depannage">⚙️ Dépannage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgence *
          </label>
          <Select
            name="urgency"
            value={urgency}
            onValueChange={setUrgency}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Quand ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">🚨 Urgent (24h)</SelectItem>
              <SelectItem value="week">📅 Cette semaine</SelectItem>
              <SelectItem value="flexible">⏰ Flexible</SelectItem>
            </SelectContent>
          </Select>
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
        <AddressAutocomplete
          name="location"
          placeholder="Entrez votre adresse..."
          onChange={handleAddressChange}
          value={location}
          required
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
            onChange={handlePhotoSelect}
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

        {selectedFiles.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedFiles.map((file, index) => (
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

      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{state?.error}</p>
        </div>
      )}

      <div className={`flex gap-3 ${isModal ? "pt-4 border-t" : ""}`}>
        <Button
          type="submit"
          disabled={pending || isPending || isUploading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {pending || isPending || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? "Upload en cours..." : "Création..."}
            </>
          ) : (
            "Créer la demande"
          )}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return (
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
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Créer une nouvelle demande</CardTitle>
          <p className="text-sm text-gray-600">
            Remplissez ce formulaire pour soumettre votre demande de service
          </p>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    </div>
  );
}
