"use client";

import { useAuthStore } from "../lib/auth-store";
import { useEffect } from "react";

export function AuthDebug() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    console.log("Auth Debug - Current State:", {
      user,
      isAuthenticated,
      isLoading,
    });
  }, [user, isAuthenticated, isLoading]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
        <div>User: {user ? user.email : "None"}</div>
        <div>User ID: {user?.id || "None"}</div>
      </div>
    </div>
  );
}
