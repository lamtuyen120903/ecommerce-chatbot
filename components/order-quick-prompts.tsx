"use client";

import { Button } from "@/components/ui/button";
import { Package, RefreshCw, HelpCircle, Calendar } from "lucide-react";

interface OrderQuickPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export function OrderQuickPrompts({ onPromptClick }: OrderQuickPromptsProps) {
  const prompts = [
    {
      text: "Theo dõi đơn hàng #12345",
      icon: Package,
    },
    {
      text: "Làm thế nào để trả lại sản phẩm?",
      icon: RefreshCw,
    },
    {
      text: "Khi nào đơn hàng sẽ được gửi?",
      icon: Calendar,
    },
    {
      text: "Vấn đề giao hàng",
      icon: HelpCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {prompts.map((prompt, index) => {
        const Icon = prompt.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onPromptClick(prompt.text)}
            className="justify-start text-left border-green-200 text-green-600 hover:bg-green-50"
          >
            <Icon className="w-4 h-4 mr-2" />
            <span className="truncate">{prompt.text}</span>
          </Button>
        );
      })}
    </div>
  );
}
