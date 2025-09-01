"use client";
import { UserEditModal } from "@/app/workspace/users/@admin/UserEditModal";
import { useState } from "react";
import { Request } from "./Request";

export default function AdminRequestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <>
      <Request setUserId={setUserId} />
      <UserEditModal userId={userId} setUserId={setUserId} />
    </>
  );
}
