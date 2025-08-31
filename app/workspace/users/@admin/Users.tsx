"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  Users as UsersIcon,
  Shield,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
  Briefcase,
  LucideWrench,
  Zap,
  PaintBucket,
  Fence,
  Settings,
  Cog,
  Scissors,
  Truck,
} from "lucide-react";
import { getCategoryConfig, ServiceType } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import moment from "moment";

interface UserData {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  clientProfile: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  professionalProfile: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    siret: string | null;
    serviceArea: string | null;
    specialties: string | null;
    isVerified: boolean | null;
    experience: string | null;
    description: string | null;
  } | null;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsersResponse {
  users: UserData[];
  pagination: PaginationInfo;
}

const getRoleColor = (role: string) => {
  const roleColors: { [key: string]: string } = {
    admin: "bg-red-100 text-red-800 border-red-200",
    owner: "bg-purple-100 text-purple-800 border-purple-200",
    professional: "bg-blue-100 text-blue-800 border-blue-200",
    client: "bg-green-100 text-green-800 border-green-200",
    member: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    roleColors[role.toLowerCase()] ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const truncateText = (text: string, maxLength: number = 30) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const getDisplayName = (user: UserData) => {
  if (!user) return "";
  if (user.name) return user.name;

  const profile = user.clientProfile || user.professionalProfile;
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  if (profile?.firstName) return profile.firstName;
  if (profile?.lastName) return profile.lastName;

  return user.email.split("@")[0];
};

const getPhone = (user: UserData) => {
  return user.clientProfile?.phone || user.professionalProfile?.phone || null;
};

const getSpecialties = (specialties: string | null) => {
  if (!specialties) return null;
  try {
    const parsed = JSON.parse(specialties);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 2).join(", ") + (parsed.length > 2 ? "..." : "");
    }
  } catch {
    return specialties;
  }
  return specialties;
};

const specialties = [
  "Plomberie",
  "Électricité",
  "Peinture",
  "Menuiserie",
  "Carrelage",
  "Jardinage",
  "Nettoyage",
  "Déménagement",
];

const getSpecialtyConfig = (specialty: string) => {
  switch (specialty) {
    case "Plomberie":
      return getCategoryConfig(ServiceType.PLOMBERIE, "h-4 w-4");
    case "Électricité":
      return getCategoryConfig(ServiceType.ELECTRICITE, "h-4 w-4");
    case "Peinture":
      return getCategoryConfig(ServiceType.PEINTURE, "h-4 w-4");
    case "Menuiserie":
      return getCategoryConfig(ServiceType.MENUISERIE, "h-4 w-4");
    case "Carrelage":
      return {
        type: "Carrelage",
        icon: <Settings className="h-4 w-4 text-teal-700" />,
        colors: {
          color: "teal-500",
          bg: "bg-teal-50",
          text: "text-teal-700",
          ring: "ring-teal-200",
          accent: "border-teal-500",
          borderTop: "border-t-teal-500",
        },
      };
    case "Jardinage":
      return {
        type: "Jardinage",
        icon: <Scissors className="h-4 w-4 text-green-700" />,
        colors: {
          color: "green-500",
          bg: "bg-green-50",
          text: "text-green-700",
          ring: "ring-green-200",
          accent: "border-green-500",
          borderTop: "border-t-green-500",
        },
      };
    case "Nettoyage":
      return {
        type: "Nettoyage",
        icon: <Cog className="h-4 w-4 text-cyan-700" />,
        colors: {
          color: "cyan-500",
          bg: "bg-cyan-50",
          text: "text-cyan-700",
          ring: "ring-cyan-200",
          accent: "border-cyan-500",
          borderTop: "border-t-cyan-500",
        },
      };
    case "Déménagement":
      return {
        type: "Déménagement",
        icon: <Truck className="h-4 w-4 text-purple-700" />,
        colors: {
          color: "purple-500",
          bg: "bg-purple-50",
          text: "text-purple-700",
          ring: "ring-purple-200",
          accent: "border-purple-500",
          borderTop: "border-t-purple-500",
        },
      };
    default:
      return {
        type: specialty,
        icon: <Settings className="h-4 w-4 text-gray-700" />,
        colors: {
          color: "gray-500",
          bg: "bg-gray-50",
          text: "text-gray-700",
          ring: "ring-gray-200",
          accent: "border-gray-500",
          borderTop: "border-t-gray-500",
        },
      };
  }
};

const experienceOptions = [
  { value: "0-1", label: "Moins d'1 an" },
  { value: "1-3", label: "1 à 3 ans" },
  { value: "3-5", label: "3 à 5 ans" },
  { value: "5-10", label: "5 à 10 ans" },
  { value: "10+", label: "Plus de 10 ans" },
];

export function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
    address: "",
    serviceArea: "",
    siret: "",
    experience: "",
    specialties: [] as string[],
    description: "",
    isVerified: false,
  });

  const [selectedServiceAddress, setSelectedServiceAddress] =
    useState<AddressData | null>(null);
  const [selectedClientAddress, setSelectedClientAddress] =
    useState<AddressData | null>(null);

  const fetchUsers = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage, pagination.pageSize);
  }, []);

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.pageSize);
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchUsers(1, pageSize); // Reset to first page when changing page size
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);

    // Populate form data
    const profile = user.clientProfile || user.professionalProfile;
    let userSpecialties: string[] = [];

    // Safe JSON parsing for specialties
    if (user.professionalProfile?.specialties) {
      try {
        const parsed = JSON.parse(user.professionalProfile.specialties);
        userSpecialties = Array.isArray(parsed)
          ? parsed.filter((s) => typeof s === "string")
          : [];
      } catch (error) {
        console.warn("Invalid specialties JSON for user", user.id, error);
        userSpecialties = [];
      }
    }

    setFormData({
      name: user.name || "",
      email: user.email || "",
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      role: user.role || "",
      phone: profile?.phone || "",
      address: user.clientProfile?.address || "",
      serviceArea: user.professionalProfile?.serviceArea || "",
      siret: user.professionalProfile?.siret || "",
      experience: user.professionalProfile?.experience || "",
      specialties: userSpecialties,
      description: user.professionalProfile?.description || "",
      isVerified: user.professionalProfile?.isVerified || false,
    });

    setIsModalOpen(true);
    setModalError(null);
  };

  // Handle role changes and clear role-specific data
  const handleRoleChange = (newRole: string) => {
    setFormData((prev) => {
      const updated = { ...prev, role: newRole };

      // Clear role-specific fields when role changes
      if (newRole !== prev.role) {
        if (newRole === "client") {
          // Clear professional-specific fields
          updated.siret = "";
          updated.serviceArea = "";
          updated.experience = "";
          updated.specialties = [];
          updated.description = "";
          updated.isVerified = false;
        } else if (newRole === "professional") {
          // Clear client-specific fields
          updated.address = "";
        }
      }

      return updated;
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalError(null);
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Basic validation
    if (!formData.email?.trim()) {
      errors.push("Email est requis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Format d'email invalide");
    }

    if (!formData.firstName?.trim()) {
      errors.push("Prénom est requis");
    }

    if (!formData.lastName?.trim()) {
      errors.push("Nom est requis");
    }

    if (!formData.role) {
      errors.push("Rôle est requis");
    }

    // Role-specific validation
    if (formData.role === "professional") {
      if (!formData.siret?.trim()) {
        errors.push("SIRET est requis pour les professionnels");
      } else if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ""))) {
        errors.push("SIRET doit contenir exactement 14 chiffres");
      }

      if (!formData.serviceArea?.trim()) {
        errors.push("Zone d'intervention est requise pour les professionnels");
      }

      if (formData.specialties.length === 0) {
        errors.push(
          "Au moins une spécialité est requise pour les professionnels"
        );
      }
    }

    if (formData.role === "client" && !formData.address?.trim()) {
      errors.push("Adresse est requise pour les clients");
    }

    return errors;
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setModalError(null);

      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setModalError(validationErrors.join(", "));
        return;
      }

      // Check if role is changing to warn about data loss
      const roleChanged = selectedUser.role !== formData.role;
      if (roleChanged) {
        const confirmed = window.confirm(
          `Vous êtes sur le point de changer le rôle de "${formatRole(
            selectedUser.role
          )}" vers "${formatRole(formData.role)}". ` +
            `Cela supprimera les données spécifiques à l'ancien rôle. Continuer ?`
        );
        if (!confirmed) {
          return;
        }
      }

      const payload = {
        name: formData.name?.trim(),
        email: formData.email?.trim().toLowerCase(),
        role: formData.role,
        oldRole: selectedUser.role, // Send old role for cleanup
        ...(formData.role === "professional" && {
          professionalProfile: {
            firstName: formData.firstName?.trim(),
            lastName: formData.lastName?.trim(),
            phone: formData.phone?.trim(),
            siret: formData.siret?.replace(/\s/g, ""), // Remove spaces from SIRET
            serviceArea: formData.serviceArea?.trim(),
            experience: formData.experience,
            specialties: JSON.stringify(formData.specialties || []),
            description: formData.description?.trim(),
            isVerified: formData.isVerified,
          },
        }),
        ...(formData.role === "client" && {
          clientProfile: {
            firstName: formData.firstName?.trim(),
            lastName: formData.lastName?.trim(),
            phone: formData.phone?.trim(),
            address: formData.address?.trim(),
          },
        }),
      };

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      // Refresh users data
      await fetchUsers(pagination.currentPage, pagination.pageSize);
      handleCloseModal();
    } catch (err) {
      console.error("Error updating user:", err);
      setModalError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleServiceAreaChange = (
    address: AddressData | null,
    rawValue: string
  ) => {
    setSelectedServiceAddress(address);
    setFormData((prev) => ({ ...prev, serviceArea: rawValue }));
  };

  const handleClientAddressChange = (
    address: AddressData | null,
    rawValue: string
  ) => {
    setSelectedClientAddress(address);
    setFormData((prev) => ({ ...prev, address: rawValue }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Erreur: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          Utilisateurs ({pagination.totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{user.id}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {getDisplayName(user)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={`${getRoleColor(user.role)} text-xs`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {getPhone(user) ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{getPhone(user)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 max-w-[200px]">
                        {user.professionalProfile?.serviceArea && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span title={user.professionalProfile.serviceArea}>
                              {truncateText(
                                user.professionalProfile.serviceArea,
                                25
                              )}
                            </span>
                          </div>
                        )}
                        {user.professionalProfile?.siret && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Building className="h-3 w-3 text-gray-400" />
                            <span>SIRET: {user.professionalProfile.siret}</span>
                          </div>
                        )}
                        {user.professionalProfile?.specialties && (
                          <div className="text-xs text-gray-600">
                            <span title={user.professionalProfile.specialties}>
                              {getSpecialties(
                                user.professionalProfile.specialties
                              )}
                            </span>
                          </div>
                        )}
                        {user.clientProfile?.address && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span title={user.clientProfile.address}>
                              {truncateText(user.clientProfile.address, 25)}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.professionalProfile?.isVerified !== null &&
                          user.professionalProfile?.isVerified !==
                            undefined && (
                            <div className="flex items-center gap-1">
                              {user.professionalProfile?.isVerified ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-green-600">
                                    Vérifié
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 text-red-500" />
                                  <span className="text-xs text-red-600">
                                    Non vérifié
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        {user.professionalProfile?.experience && (
                          <span className="text-xs text-gray-600">
                            Expérience: {user.professionalProfile.experience}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>
                          {moment(user.createdAt).format("DD/MM/YYYY")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Modifier l'utilisateur"
                        onClick={() => handleEditUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {users.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {/* Edit User Modal */}
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={getDisplayName(selectedUser!)} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    {getDisplayName(selectedUser!).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">
                    Modifier l'utilisateur "{getDisplayName(selectedUser!)}"
                  </h2>
                  <p className="text-sm text-gray-500">
                    ID #{selectedUser?.id} • Créé le{" "}
                    {moment(selectedUser?.createdAt).format("DD/MM/YYYY")}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* Basic Information - Firstname and Lastname first */}
                <div className="space-y-4">
                  <div className="space-y-3 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        {
                          value: "client",
                          label: "Client",
                          icon: User,
                          color: "green",
                        },
                        {
                          value: "professional",
                          label: "Professionnel",
                          icon: Briefcase,
                          color: "blue",
                        },
                        {
                          value: "admin",
                          label: "Administrateur",
                          icon: Shield,
                          color: "red",
                        },
                      ].map((role) => {
                        const Icon = role.icon;
                        const isSelected = formData.role === role.value;
                        return (
                          <div
                            key={role.value}
                            className={`
                              relative p-4 border-2 rounded-lg cursor-pointer transition-all
                              ${
                                isSelected
                                  ? `border-${role.color}-500 bg-${role.color}-50`
                                  : "border-gray-200 hover:border-gray-300"
                              }
                            `}
                            onClick={() => handleRoleChange(role.value)}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon
                                className={`h-5 w-5 ${
                                  isSelected
                                    ? `text-${role.color}-600`
                                    : "text-gray-400"
                                }`}
                              />
                              <div>
                                <p
                                  className={`font-medium ${
                                    isSelected
                                      ? `text-${role.color}-900`
                                      : "text-gray-900"
                                  }`}
                                >
                                  {role.label}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle
                                className={`absolute top-2 right-2 h-4 w-4 text-${role.color}-600`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Prénom"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Nom"
                        required
                      />
                    </div>
                  </div>

                  {/* Email and Phone on same line - Email wider */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="pl-10"
                          placeholder="Email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          className="pl-10"
                          placeholder="Téléphone"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client-specific fields */}
                {formData.role === "client" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Informations client
                    </h3>

                    <div className="space-y-2">
                      <AddressAutocomplete
                        label="Adresse"
                        placeholder="Adresse complète"
                        name="address"
                        value={formData.address}
                        onChange={handleClientAddressChange}
                      />
                    </div>
                  </div>
                )}

                {/* Professional-specific fields */}
                {formData.role === "professional" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Informations professionnelles
                    </h3>
                    <div className="space-y-3">
                      <Label>Spécialités</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {specialties.map((specialty) => {
                          const isSelected =
                            formData.specialties.includes(specialty);
                          const config = getSpecialtyConfig(specialty);
                          return (
                            <div
                              key={specialty}
                              className={`
                                relative p-3 border-2 rounded-lg cursor-pointer transition-all
                                ${
                                  isSelected
                                    ? `${config.colors.accent} ${config.colors.bg}`
                                    : "border-gray-200 hover:border-gray-300"
                                }
                              `}
                              onClick={() => handleSpecialtyToggle(specialty)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {config.icon}
                                  <span
                                    className={`font-medium text-sm ${
                                      isSelected
                                        ? config.colors.text
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {specialty}
                                  </span>
                                </div>
                                {isSelected && (
                                  <CheckCircle
                                    className={`h-4 w-4 ${config.colors.text}`}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Experience and SIRET on same row - Experience smaller */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="experience">Années d'expérience</Label>
                        <Select
                          value={formData.experience}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              experience: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3 space-y-2">
                        <Label htmlFor="siret">SIRET</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="siret"
                            value={formData.siret}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                siret: e.target.value,
                              }))
                            }
                            className="pl-10"
                            placeholder="Numéro SIRET"
                            maxLength={14}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <AddressAutocomplete
                        label="Zone d'intervention"
                        placeholder="Ville, département..."
                        name="serviceArea"
                        value={formData.serviceArea}
                        onChange={handleServiceAreaChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description/Présentation
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Décrivez votre expérience, vos compétences..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {modalError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    {modalError}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
