import type { RegisterData, LoginData, AuthResponse, User } from "../types/auth"
import { validateRegistrationData, validateLoginData } from "../utils/auth-validation"
import {
  findUserByEmail,
  saveUser,
  hashPassword,
  verifyPassword,
  sanitizeUser,
  setCurrentUser,
  clearCurrentUser,
  getCurrentUser,
} from "../utils/auth-storage"
import type { StoredUser } from "../utils/auth-storage"

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate input data
      const validationErrors = validateRegistrationData(data)
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
        }
      }

      // Check if user already exists
      const existingUser = findUserByEmail(data.email)
      if (existingUser) {
        return {
          success: false,
          errors: [{ field: "email", message: "An account with this email already exists" }],
        }
      }

      // Hash password
      const { hash, salt } = hashPassword(data.password)

      // Create new user
      const newUser: StoredUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || undefined,
        address: data.address?.trim() || undefined,
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: true, // Auto-verify for demo purposes
      }

      // Save user
      const saved = saveUser(newUser)
      if (!saved) {
        return {
          success: false,
          errors: [{ message: "Failed to create account. Please try again." }],
        }
      }

      // Return sanitized user data
      const user = sanitizeUser(newUser)
      setCurrentUser(user)

      return {
        success: true,
        user,
        message: "Account created successfully!",
      }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        errors: [{ message: "An unexpected error occurred. Please try again." }],
      }
    }
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Validate input data
      const validationErrors = validateLoginData(data)
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
        }
      }

      // Find user by email
      const storedUser = findUserByEmail(data.email)
      if (!storedUser) {
        return {
          success: false,
          errors: [{ message: "No account found with this email address. Please register first." }],
        }
      }

      // Verify password
      const isPasswordValid = verifyPassword(data.password, storedUser.passwordHash, storedUser.salt)
      if (!isPasswordValid) {
        return {
          success: false,
          errors: [{ field: "password", message: "Incorrect password. Please try again." }],
        }
      }

      // Update last login
      storedUser.updatedAt = new Date().toISOString()
      saveUser(storedUser)

      // Set current user
      const user = sanitizeUser(storedUser)
      setCurrentUser(user)

      return {
        success: true,
        user,
        message: "Login successful!",
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        errors: [{ message: "An unexpected error occurred. Please try again." }],
      }
    }
  }

  static logout(): void {
    clearCurrentUser()
  }

  static getCurrentUser(): User | null {
    return getCurrentUser()
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    try {
      const storedUser = findUserByEmail(getCurrentUser()?.email || "")
      if (!storedUser || storedUser.id !== userId) {
        return {
          success: false,
          errors: [{ message: "User not found or unauthorized" }],
        }
      }

      // Update user data
      const updatedUser: StoredUser = {
        ...storedUser,
        ...updates,
        id: storedUser.id, // Ensure ID doesn't change
        email: storedUser.email, // Ensure email doesn't change
        passwordHash: storedUser.passwordHash, // Ensure password doesn't change
        salt: storedUser.salt, // Ensure salt doesn't change
        updatedAt: new Date().toISOString(),
      }

      const saved = saveUser(updatedUser)
      if (!saved) {
        return {
          success: false,
          errors: [{ message: "Failed to update profile. Please try again." }],
        }
      }

      const user = sanitizeUser(updatedUser)
      setCurrentUser(user)

      return {
        success: true,
        user,
        message: "Profile updated successfully!",
      }
    } catch (error) {
      console.error("Profile update error:", error)
      return {
        success: false,
        errors: [{ message: "An unexpected error occurred. Please try again." }],
      }
    }
  }
}
