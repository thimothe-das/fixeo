"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building,
  CheckCircle,
  Eye,
  MapPin,
  Phone,
  Shield,
  User,
  Users as UsersIcon,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

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

export function Users({ setUserId }: { setUserId: (userId: string) => void }) {
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
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (
    page: number = 1,
    pageSize: number = 10,
    isInitialLoad: boolean = false
  ) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsPaginationLoading(true);
      }
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
      setIsPaginationLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage, pagination.pageSize, true);
  }, []);

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.pageSize);
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchUsers(1, pageSize); // Reset to first page when changing page size
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
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPaginationLoading
                    ? // Skeleton loading rows
                      [...Array(pagination.pageSize)].map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                          <TableCell>
                            <Skeleton className="h-5 w-12 bg-gray-200" />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Skeleton className="h-5 w-32 bg-gray-200" />
                              <Skeleton className="h-4 w-40 bg-gray-200" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24 bg-gray-200" />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-32 bg-gray-200" />
                              <Skeleton className="h-3 w-28 bg-gray-200" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20 bg-gray-200" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-8 rounded-md bg-gray-200" />
                          </TableCell>
                        </TableRow>
                      ))
                    : users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            #{user.id}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {getDisplayName(user)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`${getRoleColor(
                                user.role
                              )} text-xs pointer-events-none`}
                            >
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
                                  <span
                                    title={user.professionalProfile.serviceArea}
                                  >
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
                                  <span>
                                    SIRET: {user.professionalProfile.siret}
                                  </span>
                                </div>
                              )}
                              {user.professionalProfile?.specialties && (
                                <div className="text-xs text-gray-600">
                                  <span
                                    title={user.professionalProfile.specialties}
                                  >
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
                                    {truncateText(
                                      user.clientProfile.address,
                                      25
                                    )}
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
                                  Expérience:{" "}
                                  {user.professionalProfile.experience}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Button
                              onClick={() => {
                                setUserId(user.id.toString());
                              }}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Modifier l'utilisateur"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
