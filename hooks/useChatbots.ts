"use client"

import { useState, useEffect } from "react"

export interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: string
  attachments?: {
    type: "image" | "product" | "order"
    url?: string
    title?: string
    price?: string
    orderId?: string
  }[]
}

export interface Chatbot {
  id: string
  category: string
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  messages: Message[]
  isActive: boolean
  lastActivity: string
  createdAt: string
  updatedAt: string
}

const getUserStorageKey = (userEmail: string) => `customer-support-chatbots-${userEmail}`

export function useChatbots(userEmail: string) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load chatbots from localStorage on mount
  useEffect(() => {
    if (!userEmail) {
      setIsLoading(false)
      return
    }

    try {
      const userStorageKey = getUserStorageKey(userEmail)
      const stored = localStorage.getItem(userStorageKey)
      if (stored) {
        const parsedChatbots = JSON.parse(stored)
        setChatbots(parsedChatbots)
      } else {
        // Initialize with default chatbots for each category for this user
        const defaultChatbots: Chatbot[] = [
          {
            id: "digital-bot",
            category: "digital",
            name: "Digital Products Assistant",
            description: "Specialized in software, downloads, licenses & digital services",
            icon: "ShoppingBag",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            messages: [
              {
                id: "welcome-digital",
                type: "bot",
                content:
                  "Hello! I'm your Digital Products Assistant. I specialize in software, downloads, licenses, and digital services. How can I help you today?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
            isActive: true,
            lastActivity: "Just now",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "clothes-bot",
            category: "clothes",
            name: "Fashion & Style Assistant",
            description: "Expert in clothing, sizing, styles & fashion advice",
            icon: "Shirt",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            messages: [
              {
                id: "welcome-clothes",
                type: "bot",
                content:
                  "Hi there! I'm your Fashion & Style Assistant. I can help you with sizing guides, style recommendations, materials, and care instructions. What fashion item can I help you with?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
            isActive: true,
            lastActivity: "Just now",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "food-bot",
            category: "food",
            name: "Food & Beverage Assistant",
            description: "Specialized in menu items, ingredients & dietary options",
            icon: "Coffee",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            messages: [
              {
                id: "welcome-food",
                type: "bot",
                content:
                  "Welcome! I'm your Food & Beverage Assistant. I can help you with menu recommendations, ingredient information, dietary accommodations, and delivery options. What are you craving today?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
            isActive: true,
            lastActivity: "Just now",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "orders-bot",
            category: "orders",
            name: "Order Management Assistant",
            description: "Expert in tracking, returns, exchanges & delivery",
            icon: "Package",
            color: "text-green-600",
            bgColor: "bg-green-50",
            messages: [
              {
                id: "welcome-orders",
                type: "bot",
                content:
                  "Hello! I'm your Order Management Assistant. I can help you track orders, process returns, handle exchanges, and answer shipping questions. Do you have an order number or specific question about your purchase?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
            isActive: true,
            lastActivity: "Just now",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        setChatbots(defaultChatbots)
        localStorage.setItem(userStorageKey, JSON.stringify(defaultChatbots))
      }
    } catch (error) {
      console.error("Error loading chatbots:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userEmail])

  // Save chatbots to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && chatbots.length > 0 && userEmail) {
      try {
        const userStorageKey = getUserStorageKey(userEmail)
        localStorage.setItem(userStorageKey, JSON.stringify(chatbots))
      } catch (error) {
        console.error("Error saving chatbots:", error)
      }
    }
  }, [chatbots, isLoading, userEmail])

  const addMessage = (chatbotId: string, message: Omit<Message, "id">) => {
    const messageWithId: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    setChatbots((prev) =>
      prev.map((bot) => {
        if (bot.id === chatbotId) {
          return {
            ...bot,
            messages: [...bot.messages, messageWithId],
            lastActivity: "Just now",
            updatedAt: new Date().toISOString(),
          }
        }
        return bot
      }),
    )

    return messageWithId
  }

  const clearChatHistory = (chatbotId: string) => {
    setChatbots((prev) =>
      prev.map((bot) => {
        if (bot.id === chatbotId) {
          // Reset to welcome message only
          const welcomeMessage: Message = {
            id: `welcome-${bot.category}-${Date.now()}`,
            type: "bot",
            content: getWelcomeMessage(bot.category),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }

          return {
            ...bot,
            messages: [welcomeMessage],
            lastActivity: "Just now",
            updatedAt: new Date().toISOString(),
          }
        }
        return bot
      }),
    )
  }

  const getChatbot = (chatbotId: string): Chatbot | undefined => {
    return chatbots.find((bot) => bot.id === chatbotId)
  }

  const getChatbotByCategory = (category: string): Chatbot | undefined => {
    return chatbots.find((bot) => bot.category === category)
  }

  const getWelcomeMessage = (category: string): string => {
    const welcomeMessages = {
      digital:
        "Hello! I'm your Digital Products Assistant. I specialize in software, downloads, licenses, and digital services. How can I help you today?",
      clothes:
        "Hi there! I'm your Fashion & Style Assistant. I can help you with sizing guides, style recommendations, materials, and care instructions. What fashion item can I help you with?",
      food: "Welcome! I'm your Food & Beverage Assistant. I can help you with menu recommendations, ingredient information, dietary accommodations, and delivery options. What are you craving today?",
      orders:
        "Hello! I'm your Order Management Assistant. I can help you track orders, process returns, handle exchanges, and answer shipping questions. Do you have an order number or specific question about your purchase?",
    }
    return welcomeMessages[category as keyof typeof welcomeMessages] || "Hello! How can I help you today?"
  }

  const clearUserData = () => {
    setChatbots([])
    if (userEmail) {
      try {
        const userStorageKey = getUserStorageKey(userEmail)
        localStorage.removeItem(userStorageKey)
      } catch (error) {
        console.error("Error clearing user data:", error)
      }
    }
  }

  return {
    chatbots,
    isLoading,
    addMessage,
    clearChatHistory,
    getChatbot,
    getChatbotByCategory,
    clearUserData,
  }
}
