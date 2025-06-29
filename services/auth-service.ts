import type {
  RegisterData,
  LoginData,
  AuthResponse,
  User,
} from "../types/auth";
import {
  validateRegistrationData,
  validateLoginData,
} from "../utils/auth-validation";
import { supabase } from "../lib/supabase";

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate input data
      const validationErrors = validateRegistrationData(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
        };
      }

      // Call server-side registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          address: data.address,
        }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        // Store user in localStorage for client-side access
        if (typeof window !== "undefined") {
          localStorage.setItem("currentUser", JSON.stringify(result.user));
        }
      }

      return result;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        errors: [
          { message: "An unexpected error occurred. Please try again." },
        ],
      };
    }
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Validate input data
      const validationErrors = validateLoginData(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
        };
      }

      // Call server-side login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        // Store user in localStorage for client-side access
        if (typeof window !== "undefined") {
          localStorage.setItem("currentUser", JSON.stringify(result.user));
        }
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        errors: [
          { message: "An unexpected error occurred. Please try again." },
        ],
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentUser");
      }
    } catch (error) {
      console.error("Logout error:", error);
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentUser");
      }
    }
  }

  static getCurrentUser(): User | null {
    try {
      // Only access localStorage on the client side
      if (typeof window === "undefined") {
        return null;
      }

      const userStr = localStorage.getItem("currentUser");
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<AuthResponse> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return {
          success: false,
          errors: [{ message: "User not found or unauthorized" }],
        };
      }

      // Update user data in our custom users table
      const { data: userData, error: updateError } = await supabase
        .from("users")
        .update({
          name: updates.name,
          phone: updates.phone,
          address: updates.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          errors: [{ message: "Failed to update profile. Please try again." }],
        };
      }

      // Update user in localStorage
      const updatedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }

      return {
        success: true,
        user: updatedUser,
        message: "Profile updated successfully!",
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        errors: [
          { message: "An unexpected error occurred. Please try again." },
        ],
      };
    }
  }

  // Method to check if user is authenticated
  static async checkAuth(): Promise<User | null> {
    try {
      // First, try to get user from localStorage (our primary auth method)
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        // Verify the user still exists in our database by calling the server
        const response = await fetch(
          `/api/auth/check?userId=${currentUser.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            // Update localStorage with fresh user data
            if (typeof window !== "undefined") {
              localStorage.setItem("currentUser", JSON.stringify(result.user));
            }
            return result.user;
          }
        }
      }

      // If no valid user found, clear localStorage and return null
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentUser");
      }
      return null;
    } catch (error) {
      console.error("Auth check error:", error);
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentUser");
      }
      return null;
    }
  }
}
