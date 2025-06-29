"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  ShoppingBag,
  Shirt,
  Coffee,
  Package,
  LogOut,
  User,
  Search,
  MoreVertical,
  Trash2,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useChatbots } from "../hooks/useChatbots";
import { ConfirmationDialog } from "./confirmation-dialog";

interface ChatbotSidebarProps {
  userEmail: string;
  userName: string;
  onLogout: () => void;
  activeChatbot: string | null;
  onChatbotSelect: (chatbotId: string) => void;
}

export function ChatbotSidebar({
  userEmail,
  userName,
  onLogout,
  activeChatbot,
  onChatbotSelect,
}: ChatbotSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    chatbotId: string | null;
    chatbotName: string;
  }>({
    open: false,
    chatbotId: null,
    chatbotName: "",
  });

  const { chatbots, clearChatHistory } = useChatbots(userEmail);

  const getIcon = (iconName: string) => {
    const icons = {
      ShoppingBag,
      Shirt,
      Coffee,
      Package,
    };
    return icons[iconName as keyof typeof icons] || MessageCircle;
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      digital: {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        hoverColor: "hover:bg-blue-50",
        activeColor: "bg-blue-100 border-blue-400",
      },
      clothes: {
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        hoverColor: "hover:bg-purple-50",
        activeColor: "bg-purple-100 border-purple-400",
      },
      food: {
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        hoverColor: "hover:bg-orange-50",
        activeColor: "bg-orange-100 border-orange-400",
      },
      orders: {
        color: "text-green-600",
        bgColor: "bg-green-50",
        hoverColor: "hover:bg-green-50",
        activeColor: "bg-green-100 border-green-400",
      },
    };
    return configs[category as keyof typeof configs] || configs.digital;
  };

  const handleClearChatClick = (
    chatbotId: string,
    chatbotName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setConfirmDialog({
      open: true,
      chatbotId,
      chatbotName,
    });
  };

  const handleConfirmClearChat = () => {
    if (confirmDialog.chatbotId) {
      clearChatHistory(confirmDialog.chatbotId);
    }
    setConfirmDialog({
      open: false,
      chatbotId: null,
      chatbotName: "",
    });
  };

  const filteredChatbots = chatbots.filter((chatbot) =>
    searchQuery
      ? chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chatbot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chatbot.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-medium text-gray-900 text-sm">Trợ lý AI</h2>
            </div>
            <Badge
              variant="outline"
              className="text-green-600 border-green-200 text-xs"
            >
              {chatbots.length} Hoạt động
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm trợ lý..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 border-gray-200 focus:border-green-400 focus:ring-green-400 text-sm h-8"
            />
          </div>
        </div>

        {/* Chatbots List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-2">
            {filteredChatbots.length === 0 ? (
              <div className="text-center py-6">
                <Bot className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">Không tìm thấy trợ lý</p>
              </div>
            ) : (
              filteredChatbots.map((chatbot) => {
                const Icon = getIcon(chatbot.icon);
                const config = getCategoryConfig(chatbot.category);
                const isActive = activeChatbot === chatbot.id;

                return (
                  <div
                    key={chatbot.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      isActive
                        ? `${config.activeColor} border`
                        : `${config.hoverColor} border-transparent hover:border-gray-200`
                    }`}
                    onClick={() => onChatbotSelect(chatbot.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <h3 className="font-medium text-gray-900 text-sm">
                              {chatbot.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0 mt-1 inline-block"
                            >
                              {chatbot.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                            {chatbot.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {chatbot.lastActivity}
                            </span>
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">
                                Hoạt động
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Kebab Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) =>
                              handleClearChatClick(chatbot.id, chatbot.name, e)
                            }
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Xóa Lịch sử
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <Link href="/profile">
            <div className="flex items-center space-x-2 mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500">Xem Hồ sơ</p>
              </div>
            </div>
          </Link>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-8 text-sm"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title="Xóa Lịch sử Trò chuyện"
        description={`Bạn có chắc chắn muốn xóa lịch sử trò chuyện cho ${confirmDialog.chatbotName}? Hành động này không thể hoàn tác và sẽ xóa tất cả các cuộc trò chuyện trước đó với trợ lý này.`}
        confirmText="Có, Xóa Lịch sử"
        cancelText="Không, Giữ Lịch sử"
        onConfirm={handleConfirmClearChat}
        variant="destructive"
      />
    </>
  );
}
