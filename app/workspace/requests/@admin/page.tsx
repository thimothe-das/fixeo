"use client";
import { Requests } from "@/app/workspace/requests/@admin/Requests";
import { UserEditModal } from "@/app/workspace/users/@admin/UserEditModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetcher } from "@/lib/utils";
import { useState } from "react";
import useSWR from "swr";

export default function AdminRequestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const {
    data: user,
    isLoading,
    mutate,
  } = useSWR(`/api/admin/users/${userId}`, fetcher);

  if (!user && !isLoading) {
    return (
      <Dialog open={userId !== null}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Erreur</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <p className="text-red-600">Utilisateur non trouvé</p>
          </div>
          <DialogFooter>
            <Button>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Requests setUserId={setUserId} />
      {user?.id && (
        <Dialog open={userId !== null} onOpenChange={() => setUserId(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {isLoading ? (
              <Dialog open={userId !== null}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Chargement...</DialogTitle>
                  </DialogHeader>
                  <div className="p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <UserEditModal
                userId={userId}
                setUserId={setUserId}
                user={user}
                mutate={mutate}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
