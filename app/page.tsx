"use client";

import { useState } from "react";
import { AuthGuard } from "../components/auth-guard";
import { ChatbotSidebar } from "../components/chatbot-sidebar";
import { ChatbotInterface } from "../components/chatbot-interface";
import { ProductRecommendations } from "../components/product-recommendations";
import { useChatbots } from "../hooks/useChatbots";
import { useAuthStore } from "../lib/auth-store";

export default function HomePage() {
  const { user, logout } = useAuthStore();
  const { chatbots, clearUserData } = useChatbots(user?.email || "");
  const [activeChatbot, setActiveChatbot] = useState<string | null>(null);

  const handleChatbotSelect = (chatbotId: string) => {
    setActiveChatbot(chatbotId);
  };

  const handleLogout = () => {
    clearUserData(); // Clear user-specific data before logout
    logout();
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="h-screen flex bg-gray-50">
        <ChatbotSidebar
          userEmail={user?.email || ""}
          userName={user?.name || ""}
          onLogout={handleLogout}
          activeChatbot={activeChatbot}
          onChatbotSelect={handleChatbotSelect}
        />

        <ChatbotInterface
          chatbotId={activeChatbot}
          userEmail={user?.email || ""}
        />

        <ProductRecommendations userEmail={user?.email || ""} />
      </div>
    </AuthGuard>
  );
}
