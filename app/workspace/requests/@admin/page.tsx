"use client";
import { useState } from "react";
import { UserEditModal } from "../../users/@admin/UserEditModal";
import { Requests } from "./Requests";

export default function AdminRequestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <>
      <Requests setUserId={setUserId} />
      <UserEditModal userId={userId} setUserId={setUserId} />
    </>
  );
}
