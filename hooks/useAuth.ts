"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import type { User, RegisterData, LoginData } from "../types/auth"
import { AuthService } from "../services/auth-service"
import { migrateUserData } from "../utils/user-data-migration"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  register: (data: RegisterData) => Promise<{ success: boolean; errors?: any[]; message?: string }>
  login: (data: LoginData) => Promise<{ success: boolean; errors?: any[]; message?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; errors?: any[]; message?: string }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = AuthService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          // Migrate any existing chat data to user-specific storage
          migrateUserData(currentUser.email)
          // Trigger recommendations for existing user
          // RecommendationService.triggerRecommendationsOnAuth(currentUser.email)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const register = async (data: RegisterData) => {
    try {
      const response = await AuthService.register(data)

      if (response.success && response.user) {
        setUser(response.user)
        // Migrate any existing chat data to user-specific storage
        migrateUserData(response.user.email)
        // Trigger recommendations for new user
        // RecommendationService.triggerRecommendationsOnAuth(response.user.email)
      }

      return {
        success: response.success,
        errors: response.errors,
        message: response.message,
      }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        errors: [{ message: "An unexpected error occurred. Please try again." }],
      }
    }
  }

  const login = async (data: LoginData) => {
    try {
      const response = await AuthService.login(data)

      if (response.success && response.user) {
        setUser(response.user)
        // Migrate any existing chat data to user-specific storage
        migrateUserData(response.user.email)
        // Trigger recommendations for returning user
        // RecommendationService.triggerRecommendationsOnAuth(response.user.email)
      }

      return {
        success: response.success,
        errors: response.errors,
        message: response.message,
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        errors: [{ message: "An unexpected error occurred. Please try again." }],
      }
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return {
          success: false,
          errors: [{ message: "No user logged in" }],
        }
      }

      const response = await AuthService.updateProfile(user.id, updates)

      if (response.success && response.user) {
        setUser(response.user)
      }

      return {
        success: response.success,
        errors: response.errors,
        message: response.message,
      }
    } catch (error) {
      console.error("Profile update error:", error)
      return {
        success: false,
        errors: [{ message: "An unexpected error occurred. Please try again." }],
      }
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
