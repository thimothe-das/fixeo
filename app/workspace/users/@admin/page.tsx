"use client";

import { UserEditModal } from "./UserEditModal";
import { Users } from "./Users";
import { useState } from "react";

export default function AdminUsersPage() {
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <>
      <UserEditModal userId={userId} setUserId={setUserId} />
      <Users setUserId={setUserId} />
    </>
  );
}
