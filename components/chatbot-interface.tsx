"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Paperclip,
  ImageIcon,
  ExternalLink,
  Bot,
  User,
  Package,
  ShoppingCart,
  MoreVertical,
  Trash2,
  ShoppingBag,
  Shirt,
  Coffee,
} from "lucide-react";
import { useChatbots, type Message } from "../hooks/useChatbots";
import { ConfirmationDialog } from "./confirmation-dialog";

// Import the OrderChatbotService at the top of the file
import { OrderChatbotService } from "../services/order-chatbot-service";

// Import the OrderTracker component at the top of the file
import { OrderTracker } from "./order-tracker";

// Import the OrderQuickPrompts component at the top of the file
import { OrderQuickPrompts } from "./order-quick-prompts";

interface ChatbotInterfaceProps {
  chatbotId: string | null;
  userEmail: string;
}

export function ChatbotInterface({
  chatbotId,
  userEmail,
}: ChatbotInterfaceProps) {
  const { getChatbot, addMessage, clearChatHistory } = useChatbots(userEmail);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    chatbotName: string;
  }>({
    open: false,
    chatbotName: "",
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get chatbot from the hook
  const chatbot = chatbotId ? getChatbot(chatbotId) : null;
  const messages = chatbot?.messages || [];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getIcon = (iconName: string) => {
    const icons = {
      ShoppingBag,
      Shirt,
      Coffee,
      Package,
    };
    return icons[iconName as keyof typeof icons] || Bot;
  };

  const getCategoryColors = (category: string) => {
    const colors = {
      digital: {
        gradient: "from-blue-500 to-blue-600",
        input: "border-blue-200 focus:border-blue-400 focus:ring-blue-400",
        button: "border-blue-200 text-blue-600 hover:bg-blue-50",
        badge: "border-blue-200 text-blue-600 hover:bg-blue-50",
        userMessage: "bg-gradient-to-r from-blue-500 to-blue-600",
      },
      clothes: {
        gradient: "from-purple-500 to-purple-600",
        input:
          "border-purple-200 focus:border-purple-400 focus:ring-purple-400",
        button: "border-purple-200 text-purple-600 hover:bg-purple-50",
        badge: "border-purple-200 text-purple-600 hover:bg-purple-50",
        userMessage: "bg-gradient-to-r from-purple-500 to-purple-600",
      },
      food: {
        gradient: "from-orange-500 to-orange-600",
        input:
          "border-orange-200 focus:border-orange-400 focus:ring-orange-400",
        button: "border-orange-200 text-orange-600 hover:bg-orange-50",
        badge: "border-orange-200 text-orange-600 hover:bg-orange-50",
        userMessage: "bg-gradient-to-r from-orange-500 to-orange-600",
      },
      orders: {
        gradient: "from-green-500 to-green-600",
        input: "border-green-200 focus:border-green-400 focus:ring-green-400",
        button: "border-green-200 text-green-600 hover:bg-green-50",
        badge: "border-green-200 text-green-600 hover:bg-green-50",
        userMessage: "bg-gradient-to-r from-green-500 to-green-600",
      },
    };
    return colors[category as keyof typeof colors] || colors.digital;
  };

  // Helper to transform plain-text URLs into clickable links
  const linkify = (text: string) => {
    // Match URLs but stop before a closing parenthesis if it is not part of the URL
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const sendToN8nWorkflow = async (message: string, category: string) => {
    try {
      const response = await fetch("/api/n8n-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          category,
          conversationId: chatbotId,
          timestamp: new Date().toISOString(),
          userEmail: userEmail,
        }),
      });

      const text = await response.text();

      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        console.warn("Non-JSON or malformed response from n8n:", parseErr);
      }

      if (data && data.success) {
        return (
          data.response ||
          "Cảm ơn bạn đã gửi tin nhắn. Tôi ở đây để giúp bạn với mọi câu hỏi."
        );
      }

      // Fallbacks for error or empty body
      if (!text) {
        console.error("Empty response from n8n");
      } else if (!data) {
        console.error("Received non-JSON response:", text.slice(0, 200));
      } else {
        console.error("API error:", data);
      }

      return "Xin lỗi, tôi đang gặp khó khăn trong việc xử lý yêu cầu của bạn ngay bây giờ. Vui lòng thử lại sau.";
    } catch (error) {
      console.error("Error sending to n8n:", error);
      return "Tôi đang gặp một số khó khăn kỹ thuật. Vui lòng thử lại trong giây lát, hoặc liên hệ trực tiếp với đội ngũ hỗ trợ nếu vấn đề vẫn tiếp tục.";
    }
  };

  // Add a function to handle quick prompts
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    // Small delay to make it feel more natural
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleSend = async () => {
    if (!input.trim() || !chatbotId || !chatbot) return;

    // Add user message
    addMessage(chatbotId, {
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(async () => {
      let botResponse = "";
      let attachments: Message["attachments"] = [];

      // Handle different categories and commands
      if (
        chatbot.category === "orders" ||
        input.toLowerCase().includes("order")
      ) {
        // Process order-specific queries
        const orderResponse = await OrderChatbotService.processOrderQuery(
          input
        );
        botResponse = orderResponse.response;
        attachments = orderResponse.attachments || [];
      } else if (
        input.toLowerCase().includes("product") ||
        input.toLowerCase().includes("buy")
      ) {
        botResponse = "Đây là một số sản phẩm có thể bạn quan tâm:";
        attachments = [
          {
            type: "product",
            title: "Sản phẩm Đề xuất",
            price: "99.99₫",
            url: "/products/item",
          },
        ];
      } else {
        // Send to n8n workflow for AI processing
        botResponse = await sendToN8nWorkflow(input, chatbot.category);
      }

      // Add bot message
      addMessage(chatbotId, {
        type: "bot",
        content: botResponse,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments,
      });

      setIsTyping(false);
    }, 1500);
  };

  const handleClearChatClick = () => {
    if (chatbot) {
      setConfirmDialog({
        open: true,
        chatbotName: chatbot.name,
      });
    }
  };

  const handleConfirmClearChat = () => {
    if (chatbotId) {
      clearChatHistory(chatbotId);
    }
    setConfirmDialog({
      open: false,
      chatbotName: "",
    });
  };

  if (!chatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Chọn Trợ lý AI
          </h3>
          <p className="text-gray-600 max-w-md">
            Chọn một trợ lý chuyên biệt từ thanh bên để bắt đầu trò chuyện
          </p>
        </div>
      </div>
    );
  }

  const Icon = getIcon(chatbot.icon);
  const colors = getCategoryColors(chatbot.category);

  return (
    <>
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div
          className={`p-4 border-b border-gray-100 bg-gradient-to-r ${colors.gradient}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">{chatbot.name}</h2>
                <p className="text-sm text-white/80">{chatbot.description}</p>
              </div>
            </div>

            {/* Header Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleClearChatClick}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa Lịch sử Trò chuyện
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex space-x-3 max-w-[80%] ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user"
                        ? colors.userMessage
                        : "bg-gray-100"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "user"
                          ? `${colors.userMessage} text-white`
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {linkify(message.content)}
                      </p>
                    </div>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <Card
                            key={index}
                            className={`border ${colors.input.split(" ")[0]}`}
                          >
                            <CardContent className="p-3">
                              {attachment.type === "product" && (
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-12 h-12 ${chatbot.bgColor} rounded-lg flex items-center justify-center`}
                                  >
                                    <ShoppingCart
                                      className={`w-6 h-6 ${chatbot.color}`}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {attachment.title}
                                    </h4>
                                    <p
                                      className={`text-sm font-semibold ${chatbot.color}`}
                                    >
                                      {attachment.price}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90`}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Xem
                                  </Button>
                                </div>
                              )}

                              {attachment.type === "order" && (
                                <>
                                  {/* Use OrderTracker for detailed order tracking */}
                                  {attachment.orderId &&
                                  attachment.orderId.startsWith("#") ? (
                                    <OrderTracker
                                      orderId={attachment.orderId.substring(1)}
                                      status={
                                        (attachment.status as
                                          | "processing"
                                          | "shipped"
                                          | "delivered"
                                          | "returned") || "processing"
                                      }
                                      trackingNumber={attachment.trackingNumber}
                                      estimatedDelivery={
                                        attachment.estimatedDelivery
                                      }
                                    />
                                  ) : (
                                    <div className="flex items-center space-x-3">
                                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-green-600" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">
                                          {attachment.title}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Order {attachment.orderId}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-green-200 text-green-600 hover:bg-green-50"
                                      >
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Theo dõi
                                      </Button>
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500">{message.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {chatbot.category === "orders" && messages.length <= 2 && (
            <OrderQuickPrompts onPromptClick={handleQuickPrompt} />
          )}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className={colors.button}>
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className={colors.button}>
              <ImageIcon className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${chatbot.name}...`}
                className={colors.input}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                onClick={handleSend}
                className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90`}
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
