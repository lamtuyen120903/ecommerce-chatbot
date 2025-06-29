"use client";

import { useState, useEffect } from "react";

export interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  attachments?: {
    type: "image" | "product" | "order";
    url?: string;
    title?: string;
    price?: string;
    orderId?: string;
    status?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  }[];
}

export interface Chatbot {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  messages: Message[];
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

const getUserStorageKey = (userEmail: string) =>
  `customer-support-chatbots-${userEmail}`;

export function useChatbots(userEmail: string) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load chatbots from localStorage on mount
  useEffect(() => {
    if (!userEmail) {
      setIsLoading(false);
      return;
    }

    try {
      const userStorageKey = getUserStorageKey(userEmail);
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        const parsedChatbots = JSON.parse(stored);
        setChatbots(parsedChatbots);
      } else {
        // Initialize with default chatbots for each category for this user
        const defaultChatbots: Chatbot[] = [
          {
            id: "digital-bot",
            category: "digital",
            name: "Trợ lý Sản phẩm Kỹ thuật số",
            description:
              "Chuyên về phần mềm, tải xuống, giấy phép & dịch vụ kỹ thuật số",
            icon: "ShoppingBag",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            messages: [
              {
                id: "welcome-digital",
                type: "bot",
                content:
                  "Xin chào! Tôi là Trợ lý Sản phẩm Kỹ thuật số của bạn. Tôi chuyên về phần mềm, tải xuống, giấy phép và dịch vụ kỹ thuật số. Tôi có thể giúp gì cho bạn hôm nay?",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ],
            isActive: true,
            lastActivity: "Vừa xong",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "clothes-bot",
            category: "clothes",
            name: "Trợ lý Thời trang & Phong cách",
            description:
              "Chuyên gia về quần áo, kích thước, phong cách & tư vấn thời trang",
            icon: "Shirt",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            messages: [
              {
                id: "welcome-clothes",
                type: "bot",
                content:
                  "Chào bạn! Tôi là Trợ lý Thời trang & Phong cách của bạn. Tôi có thể giúp bạn với hướng dẫn kích thước, gợi ý phong cách, chất liệu và hướng dẫn chăm sóc. Bạn cần tôi giúp gì về thời trang?",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ],
            isActive: true,
            lastActivity: "Vừa xong",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "food-bot",
            category: "food",
            name: "Trợ lý Thực phẩm & Đồ uống",
            description: "Chuyên về món ăn, nguyên liệu & tùy chọn ăn kiêng",
            icon: "Coffee",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            messages: [
              {
                id: "welcome-food",
                type: "bot",
                content:
                  "Chào mừng! Tôi là Trợ lý Thực phẩm & Đồ uống của bạn. Tôi có thể giúp bạn với gợi ý thực đơn, thông tin nguyên liệu, chế độ ăn kiêng và tùy chọn giao hàng. Bạn đang thèm gì hôm nay?",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ],
            isActive: true,
            lastActivity: "Vừa xong",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "orders-bot",
            category: "orders",
            name: "Trợ lý Quản lý Đơn hàng",
            description:
              "Chuyên gia về theo dõi, trả hàng, đổi hàng & giao hàng",
            icon: "Package",
            color: "text-green-600",
            bgColor: "bg-green-50",
            messages: [
              {
                id: "welcome-orders",
                type: "bot",
                content:
                  "Xin chào! Tôi là Trợ lý Quản lý Đơn hàng của bạn. Tôi có thể giúp bạn theo dõi đơn hàng, xử lý trả hàng, xử lý đổi hàng và trả lời câu hỏi về vận chuyển. Bạn có số đơn hàng hoặc câu hỏi cụ thể về đơn hàng của mình không?",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ],
            isActive: true,
            lastActivity: "Vừa xong",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setChatbots(defaultChatbots);
        localStorage.setItem(userStorageKey, JSON.stringify(defaultChatbots));
      }
    } catch (error) {
      console.error("Error loading chatbots:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  // Save chatbots to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && chatbots.length > 0 && userEmail) {
      try {
        const userStorageKey = getUserStorageKey(userEmail);
        localStorage.setItem(userStorageKey, JSON.stringify(chatbots));
      } catch (error) {
        console.error("Error saving chatbots:", error);
      }
    }
  }, [chatbots, isLoading, userEmail]);

  const addMessage = (chatbotId: string, message: Omit<Message, "id">) => {
    const messageWithId: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setChatbots((prev) =>
      prev.map((bot) => {
        if (bot.id === chatbotId) {
          return {
            ...bot,
            messages: [...bot.messages, messageWithId],
            lastActivity: "Just now",
            updatedAt: new Date().toISOString(),
          };
        }
        return bot;
      })
    );

    return messageWithId;
  };

  const clearChatHistory = (chatbotId: string) => {
    setChatbots((prev) =>
      prev.map((bot) => {
        if (bot.id === chatbotId) {
          // Reset to welcome message only
          const welcomeMessage: Message = {
            id: `welcome-${bot.category}-${Date.now()}`,
            type: "bot",
            content: getWelcomeMessage(bot.category),
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          return {
            ...bot,
            messages: [welcomeMessage],
            lastActivity: "Just now",
            updatedAt: new Date().toISOString(),
          };
        }
        return bot;
      })
    );
  };

  const getChatbot = (chatbotId: string): Chatbot | undefined => {
    return chatbots.find((bot) => bot.id === chatbotId);
  };

  const getChatbotByCategory = (category: string): Chatbot | undefined => {
    return chatbots.find((bot) => bot.category === category);
  };

  const getWelcomeMessage = (category: string): string => {
    const welcomeMessages = {
      digital:
        "Xin chào! Tôi là Trợ lý Sản phẩm Kỹ thuật số của bạn. Tôi chuyên về phần mềm, tải xuống, giấy phép và dịch vụ kỹ thuật số. Tôi có thể giúp gì cho bạn hôm nay?",
      clothes:
        "Chào bạn! Tôi là Trợ lý Thời trang & Phong cách của bạn. Tôi có thể giúp bạn với hướng dẫn kích thước, gợi ý phong cách, chất liệu và hướng dẫn chăm sóc. Bạn cần tôi giúp gì về thời trang?",
      food: "Chào mừng! Tôi là Trợ lý Thực phẩm & Đồ uống của bạn. Tôi có thể giúp bạn với gợi ý thực đơn, thông tin thành phần, chế độ ăn kiêng và tùy chọn giao hàng. Bạn đang thèm gì hôm nay?",
      orders:
        "Xin chào! Tôi là Trợ lý Quản lý Đơn hàng của bạn. Tôi có thể giúp bạn theo dõi đơn hàng, xử lý trả hàng, đổi hàng và trả lời câu hỏi về vận chuyển. Bạn có số đơn hàng hoặc câu hỏi cụ thể về đơn mua hàng không?",
    };
    return (
      welcomeMessages[category as keyof typeof welcomeMessages] ||
      "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?"
    );
  };

  const clearUserData = () => {
    setChatbots([]);
    if (userEmail) {
      try {
        const userStorageKey = getUserStorageKey(userEmail);
        localStorage.removeItem(userStorageKey);
      } catch (error) {
        console.error("Error clearing user data:", error);
      }
    }
  };

  return {
    chatbots,
    isLoading,
    addMessage,
    clearChatHistory,
    getChatbot,
    getChatbotByCategory,
    clearUserData,
  };
}
