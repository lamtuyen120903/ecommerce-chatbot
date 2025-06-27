"use client"

import { Button } from "@/components/ui/button"
import { Package, RefreshCw, HelpCircle, Calendar } from "lucide-react"

interface OrderQuickPromptsProps {
  onPromptClick: (prompt: string) => void
}

export function OrderQuickPrompts({ onPromptClick }: OrderQuickPromptsProps) {
  const prompts = [
    {
      text: "Track my order #12345",
      icon: Package,
    },
    {
      text: "How do I return an item?",
      icon: RefreshCw,
    },
    {
      text: "When will my order ship?",
      icon: Calendar,
    },
    {
      text: "Order delivery problems",
      icon: HelpCircle,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {prompts.map((prompt, index) => {
        const Icon = prompt.icon
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
        )
      })}
    </div>
  )
}
