import type { User } from "../types/auth"

const USERS_STORAGE_KEY = "customer-support-users"
const CURRENT_USER_KEY = "customer-support-current-user"

export interface StoredUser extends User {
  passwordHash: string
  salt: string
}

// Simple hash function for demo purposes (in production, use bcrypt or similar)
function simpleHash(password: string, salt: string): string {
  let hash = 0
  const str = password + salt
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = generateSalt()
  const hash = simpleHash(password, salt)
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  return simpleHash(password, salt) === hash
}

export function getAllUsers(): StoredUser[] {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY)
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error("Error loading users:", error)
    return []
  }
}

export function saveUser(user: StoredUser): boolean {
  try {
    const users = getAllUsers()
    const existingIndex = users.findIndex((u) => u.id === user.id)

    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    return true
  } catch (error) {
    console.error("Error saving user:", error)
    return false
  }
}

export function findUserByEmail(email: string): StoredUser | null {
  const users = getAllUsers()
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

export function findUserById(id: string): StoredUser | null {
  const users = getAllUsers()
  return users.find((user) => user.id === id) || null
}

export function getCurrentUser(): User | null {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error("Error loading current user:", error)
    return null
  }
}

export function setCurrentUser(user: User | null): boolean {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
    return true
  } catch (error) {
    console.error("Error setting current user:", error)
    return false
  }
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// Convert StoredUser to User (remove sensitive data)
export function sanitizeUser(storedUser: StoredUser): User {
  const { passwordHash, salt, ...user } = storedUser
  return user
}
