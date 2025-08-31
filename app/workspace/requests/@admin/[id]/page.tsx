"use client";
import { UserEditModal } from "@/app/workspace/users/@admin/UserEditModal";
import { useState } from "react";
import { User } from "./User";

export default function AdminRequestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <>
      <User setUserId={setUserId} />
      <UserEditModal userId={userId} setUserId={setUserId} />
    </>
  );
}
