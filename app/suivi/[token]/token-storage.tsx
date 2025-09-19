"use client";

import { useEffect } from "react";

export function TokenStorage({ token }: { token: string }) {
  useEffect(() => {
    if (typeof window !== "undefined" && token) {
      // Get existing tokens from localStorage
      const existing = localStorage.getItem("fixeo_guest_tokens");
      let tokens: string[] = [];

      if (existing) {
        try {
          tokens = JSON.parse(existing);
        } catch {
          // Invalid JSON, start fresh
          tokens = [];
        }
      }

      // Add this token if it's not already there
      if (!tokens.includes(token)) {
        tokens.push(token);
        localStorage.setItem("fixeo_guest_tokens", JSON.stringify(tokens));
      }
    }
  }, [token]);

  return null; // This component doesn't render anything
}

export const setGuestToken = (token: string) => {
  const existing = localStorage.getItem("fixeo_guest_tokens");
  let tokens: string[] = [];

  if (existing) {
    try {
      tokens = JSON.parse(existing);
    } catch {
      // Invalid JSON, start fresh
      tokens = [];
    }
  }

  if (!tokens.includes(token)) {
    tokens.push(token);
  }

  localStorage.setItem("fixeo_guest_tokens", JSON.stringify(tokens));
};

export const getGuestTokens = () => {
  const existing = localStorage.getItem("fixeo_guest_tokens");
  return existing ? JSON.parse(existing) : [];
};
