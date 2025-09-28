"use client";
import { Requests } from "@/app/workspace/requests/@admin/Requests";
import { UserEditModal } from "@/app/workspace/users/@admin/UserEditModal";
import { useState } from "react";

export default function AdminRequestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <>
      <Requests setUserId={setUserId} />
      <UserEditModal userId={userId} setUserId={setUserId} />
    </>
  );
}
