"use client";

import { useAuthStore } from "../lib/auth-store";

// Simple hook that wraps the Zustand store for backward compatibility
export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
  } = useAuthStore();

  return {
    user,
    isLoading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
  };
}

// Export the store directly for advanced usage
export { useAuthStore };
