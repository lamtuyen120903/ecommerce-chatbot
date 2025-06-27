"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
} from "lucide-react"
import Link from "next/link"
import { useChatbots } from "../hooks/useChatbots"
import { ConfirmationDialog } from "./confirmation-dialog"

interface ChatbotSidebarProps {
  userEmail: string
  userName: string
  onLogout: () => void
  activeChatbot: string | null
  onChatbotSelect: (chatbotId: string) => void
}

export function ChatbotSidebar({ userEmail, userName, onLogout, activeChatbot, onChatbotSelect }: ChatbotSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    chatbotId: string | null
    chatbotName: string
  }>({
    open: false,
    chatbotId: null,
    chatbotName: "",
  })

  const { chatbots, clearChatHistory } = useChatbots(userEmail)

  const getIcon = (iconName: string) => {
    const icons = {
      ShoppingBag,
      Shirt,
      Coffee,
      Package,
    }
    return icons[iconName as keyof typeof icons] || MessageCircle
  }

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
    }
    return configs[category as keyof typeof configs] || configs.digital
  }

  const handleClearChatClick = (chatbotId: string, chatbotName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDialog({
      open: true,
      chatbotId,
      chatbotName,
    })
  }

  const handleConfirmClearChat = () => {
    if (confirmDialog.chatbotId) {
      clearChatHistory(confirmDialog.chatbotId)
    }
    setConfirmDialog({
      open: false,
      chatbotId: null,
      chatbotName: "",
    })
  }

  const filteredChatbots = chatbots.filter((chatbot) =>
    searchQuery
      ? chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chatbot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chatbot.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  )

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-medium text-gray-900">AI Assistants</h2>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {chatbots.length} Active
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assistants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400 text-sm"
            />
          </div>
        </div>

        {/* Chatbots List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {filteredChatbots.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No assistants found</p>
              </div>
            ) : (
              filteredChatbots.map((chatbot) => {
                const Icon = getIcon(chatbot.icon)
                const config = getCategoryConfig(chatbot.category)
                const isActive = activeChatbot === chatbot.id

                return (
                  <div
                    key={chatbot.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      isActive
                        ? `${config.activeColor} border`
                        : `${config.hoverColor} border-transparent hover:border-gray-200`
                    }`}
                    onClick={() => onChatbotSelect(chatbot.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div
                          className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">{chatbot.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {chatbot.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{chatbot.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{chatbot.lastActivity}</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Active</span>
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
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => handleClearChatClick(chatbot.id, chatbot.name, e)}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Chat History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/profile">
            <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{userName}</p>
                <p className="text-sm text-gray-500">View Profile</p>
              </div>
            </div>
          </Link>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title="Clear Chat History"
        description={`Are you sure you want to clear the chat history for ${confirmDialog.chatbotName}? This action cannot be undone and will remove all previous conversations with this assistant.`}
        confirmText="Yes, Clear History"
        cancelText="No, Keep History"
        onConfirm={handleConfirmClearChat}
        variant="destructive"
      />
    </>
  )
}
