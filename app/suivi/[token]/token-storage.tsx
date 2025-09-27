"use client";

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
  if (typeof window === "undefined") return [];
  const existing = localStorage.getItem("fixeo_guest_tokens");
  return existing ? JSON.parse(existing) : [];
};
