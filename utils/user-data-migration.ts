import type { Chatbot } from "../hooks/useChatbots"

const OLD_STORAGE_KEY = "customer-support-chatbots"

export function migrateUserData(userEmail: string): boolean {
  try {
    // Check if there's old data without user email
    const oldData = localStorage.getItem(OLD_STORAGE_KEY)
    if (!oldData) {
      return false // No old data to migrate
    }

    // Check if user-specific data already exists
    const newStorageKey = `customer-support-chatbots-${userEmail}`
    const existingUserData = localStorage.getItem(newStorageKey)
    if (existingUserData) {
      return false // User already has data, no migration needed
    }

    // Parse and validate old data
    const parsedOldData: Chatbot[] = JSON.parse(oldData)
    if (!Array.isArray(parsedOldData)) {
      return false // Invalid data format
    }

    // Migrate old data to user-specific storage
    localStorage.setItem(newStorageKey, JSON.stringify(parsedOldData))

    // Optionally remove old data (commented out to be safe)
    // localStorage.removeItem(OLD_STORAGE_KEY)

    console.log(`Migrated chat history for user: ${userEmail}`)
    return true
  } catch (error) {
    console.error("Error migrating user data:", error)
    return false
  }
}

export function getUserChatStats(userEmail: string): {
  totalMessages: number
  totalChatbots: number
  lastActivity: string | null
} {
  try {
    const userStorageKey = `customer-support-chatbots-${userEmail}`
    const userData = localStorage.getItem(userStorageKey)

    if (!userData) {
      return {
        totalMessages: 0,
        totalChatbots: 0,
        lastActivity: null,
      }
    }

    const chatbots: Chatbot[] = JSON.parse(userData)
    const totalMessages = chatbots.reduce((total, bot) => total + bot.messages.length, 0)
    const lastActivity = chatbots.reduce(
      (latest, bot) => {
        const botLastActivity = new Date(bot.updatedAt).getTime()
        const currentLatest = latest ? new Date(latest).getTime() : 0
        return botLastActivity > currentLatest ? bot.updatedAt : latest
      },
      null as string | null,
    )

    return {
      totalMessages,
      totalChatbots: chatbots.length,
      lastActivity,
    }
  } catch (error) {
    console.error("Error getting user chat stats:", error)
    return {
      totalMessages: 0,
      totalChatbots: 0,
      lastActivity: null,
    }
  }
}

export function clearAllUserData(userEmail: string): boolean {
  try {
    const userStorageKey = `customer-support-chatbots-${userEmail}`
    localStorage.removeItem(userStorageKey)
    console.log(`Cleared all chat data for user: ${userEmail}`)
    return true
  } catch (error) {
    console.error("Error clearing user data:", error)
    return false
  }
}
