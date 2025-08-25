import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, X, Upload } from "lucide-react";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { createServiceRequest } from "../actions";
import { ActionState } from "@/lib/auth/middleware";

interface ClientNewRequestComponentProps {
  onRequestCreated: () => void;
}

export function ClientNewRequestComponent({
  onRequestCreated,
}: ClientNewRequestComponentProps) {
  const [serviceType, setServiceType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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

      // Call the original form action
      const result = await formAction(formData);

      // Reset form and notify parent if successful
      if (result?.success || (!result?.error && !state?.error)) {
        setSelectedFiles([]);
        setServiceType("");
        setUrgency("");
        setLocation("");
        setSelectedAddress(null);
        onRequestCreated();
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Créer une nouvelle demande</CardTitle>
          <p className="text-sm text-gray-600">
            Remplissez ce formulaire pour soumettre votre demande de service
          </p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                placeholder="Décrivez le problème ou les travaux à effectuer..."
                className="min-h-[120px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact *
              </label>
              <Input
                name="clientEmail"
                type="email"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <AddressAutocomplete
                label="Adresse d'intervention"
                placeholder="Tapez votre adresse complète..."
                name="location"
                value={location}
                onChange={handleAddressChange}
                required
              />
            </div>

            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (optionnel, max 5)
              </label>
              <div className="space-y-3">
                {/* File Input */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Cliquez pour ajouter
                        </span>{" "}
                        des photos
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP (max 10MB chacune)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      disabled={selectedFiles.length >= 5}
                    />
                  </label>
                </div>

                {/* Selected Photos Preview */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {state?.error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md">
                Demande créée avec succès !
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={pending || isUploading}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                {pending || isUploading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {isUploading ? "Upload des photos..." : "Envoi..."}
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Envoyer la demande
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
