"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../lib/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (!isLoading) {
      // If auth is required but user is not authenticated, redirect to login
      if (requireAuth && !isAuthenticated) {
        router.push("/auth");
        return;
      }

      // If user is authenticated but trying to access auth page, redirect to home
      if (
        isAuthenticated &&
        typeof window !== "undefined" &&
        window.location.pathname === "/auth"
      ) {
        router.push("/");
        return;
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, show loading while redirecting
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but trying to access auth page, show loading while redirecting
  if (
    isAuthenticated &&
    typeof window !== "undefined" &&
    window.location.pathname === "/auth"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
