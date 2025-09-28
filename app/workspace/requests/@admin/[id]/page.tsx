"use client";
import { Request } from "@/app/workspace/requests/@admin/[id]/Request";
import { UserEditModal } from "@/app/workspace/users/@admin/UserEditModal";
import { useState } from "react";
export default function AdminRequestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <>
      <Request setUserId={setUserId} />
      <UserEditModal userId={userId} setUserId={setUserId} />
    </>
  );
}
