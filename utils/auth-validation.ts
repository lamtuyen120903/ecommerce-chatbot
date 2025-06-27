import type { RegisterData, LoginData, AuthError } from "../types/auth"

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true // Phone is optional
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
}

export function validateRegistrationData(data: RegisterData): AuthError[] {
  const errors: AuthError[] = []

  // Name validation
  if (!data.name.trim()) {
    errors.push({ field: "name", message: "Full name is required" })
  } else if (data.name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters long" })
  }

  // Email validation
  if (!data.email.trim()) {
    errors.push({ field: "email", message: "Email address is required" })
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" })
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: "password", message: "Password is required" })
  } else {
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach((error) => {
        errors.push({ field: "password", message: error })
      })
    }
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Please confirm your password" })
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Passwords do not match" })
  }

  // Phone validation (optional)
  if (data.phone && !validatePhone(data.phone)) {
    errors.push({ field: "phone", message: "Please enter a valid phone number" })
  }

  return errors
}

export function validateLoginData(data: LoginData): AuthError[] {
  const errors: AuthError[] = []

  if (!data.email.trim()) {
    errors.push({ field: "email", message: "Email address is required" })
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" })
  }

  if (!data.password) {
    errors.push({ field: "password", message: "Password is required" })
  }

  return errors
}
