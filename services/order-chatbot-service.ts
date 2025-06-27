import type { Message } from "../hooks/useChatbots"

interface OrderDetails {
  id: string
  status: "processing" | "shipped" | "delivered" | "returned"
  trackingNumber?: string
  estimatedDelivery?: string
  items: {
    name: string
    quantity: number
    price: number
  }[]
  total: number
  orderDate: string
}

// Mock order database for demo purposes
const mockOrders: Record<string, OrderDetails> = {
  "12345": {
    id: "12345",
    status: "shipped",
    trackingNumber: "TRK789012345",
    estimatedDelivery: "October 15, 2023",
    items: [
      { name: "Wireless Headphones", quantity: 1, price: 89.99 },
      { name: "Phone Case", quantity: 2, price: 19.99 },
    ],
    total: 129.97,
    orderDate: "October 5, 2023",
  },
  "67890": {
    id: "67890",
    status: "processing",
    items: [{ name: "Smart Watch", quantity: 1, price: 199.99 }],
    total: 199.99,
    orderDate: "October 10, 2023",
  },
  "54321": {
    id: "54321",
    status: "delivered",
    trackingNumber: "TRK543219876",
    items: [
      { name: "Bluetooth Speaker", quantity: 1, price: 79.99 },
      { name: "USB-C Cable", quantity: 3, price: 12.99 },
    ],
    total: 118.96,
    orderDate: "September 28, 2023",
  },
}

export class OrderChatbotService {
  static extractOrderNumber(message: string): string | null {
    // Look for patterns like "order 12345", "#12345", "order number 12345"
    const orderPatterns = [
      /order\s+#?(\d{5})/i,
      /#(\d{5})/i,
      /order\s+number\s+#?(\d{5})/i,
      /tracking\s+order\s+#?(\d{5})/i,
      /status\s+of\s+order\s+#?(\d{5})/i,
      /where\s+is\s+order\s+#?(\d{5})/i,
      /order\s+(\d{5})/i,
      /(\d{5})/,
    ]

    for (const pattern of orderPatterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  }

  static getOrderDetails(orderNumber: string): OrderDetails | null {
    return mockOrders[orderNumber] || null
  }

  static async processOrderQuery(message: string): Promise<{
    response: string
    attachments?: Message["attachments"]
  }> {
    const orderNumber = this.extractOrderNumber(message)

    // If we found an order number, provide specific details
    if (orderNumber) {
      const orderDetails = this.getOrderDetails(orderNumber)

      if (orderDetails) {
        // Create order-specific response
        return this.createOrderResponse(orderDetails, message)
      } else {
        return {
          response: `I couldn't find order #${orderNumber} in our system. Please verify the order number and try again, or provide more details about your order.`,
        }
      }
    }

    // Handle general order queries
    if (message.toLowerCase().includes("track") || message.toLowerCase().includes("where is my order")) {
      return {
        response:
          "I can help you track your order. Please provide your order number, and I'll check its status for you.",
      }
    }

    if (message.toLowerCase().includes("return") || message.toLowerCase().includes("exchange")) {
      return {
        response:
          "Our return policy allows returns within 30 days of delivery. To process a return or exchange, please provide your order number, and I can guide you through the process.",
      }
    }

    if (message.toLowerCase().includes("cancel")) {
      return {
        response:
          "You can cancel an order within 1 hour of placing it if it hasn't been processed yet. Please provide your order number so I can check if it's eligible for cancellation.",
      }
    }

    // Default response for order-related queries
    return {
      response:
        "I'm here to help with your order. You can ask me about tracking, returns, exchanges, or any other order-related questions. If you have a specific order in mind, please provide the order number.",
    }
  }

  private static createOrderResponse(
    order: OrderDetails,
    message: string,
  ): {
    response: string
    attachments?: Message["attachments"]
  } {
    // Check what kind of information the user is asking about
    const lowerMessage = message.toLowerCase()

    // Tracking/status query
    if (lowerMessage.includes("track") || lowerMessage.includes("status") || lowerMessage.includes("where")) {
      let response = `Your order #${order.id} is currently ${order.status}.`

      if (order.status === "shipped") {
        response += ` It was shipped with tracking number ${order.trackingNumber} and should arrive by ${order.estimatedDelivery}.`
      } else if (order.status === "processing") {
        response += " We're preparing your items for shipment and will notify you once it's on the way."
      } else if (order.status === "delivered") {
        response += " It was delivered on " + new Date(order.orderDate).toLocaleDateString() + "."
      }

      return {
        response,
        attachments: [
          {
            type: "order",
            orderId: order.id,
            title: `Order #${order.id} - ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
            url: `/orders/${order.id}`,
          },
        ],
      }
    }

    // Items/details query
    if (lowerMessage.includes("item") || lowerMessage.includes("what") || lowerMessage.includes("detail")) {
      const itemList = order.items
        .map((item) => `${item.quantity}x ${item.name} ($${item.price.toFixed(2)})`)
        .join(", ")

      return {
        response: `Your order #${order.id} contains: ${itemList}. The total amount is $${order.total.toFixed(2)}.`,
        attachments: [
          {
            type: "order",
            orderId: order.id,
            title: `Order #${order.id} Details`,
            url: `/orders/${order.id}`,
          },
        ],
      }
    }

    // Return/exchange query
    if (lowerMessage.includes("return") || lowerMessage.includes("exchange")) {
      return {
        response: `For order #${order.id}, you can initiate a return or exchange within 30 days of delivery. Would you like me to help you start the return process for this order?`,
        attachments: [
          {
            type: "order",
            orderId: order.id,
            title: `Return Order #${order.id}`,
            url: `/orders/${order.id}/return`,
          },
        ],
      }
    }

    // Default order response
    return {
      response: `I found your order #${order.id} placed on ${order.orderDate}. It's currently ${order.status}. How can I help you with this order?`,
      attachments: [
        {
          type: "order",
          orderId: order.id,
          title: `Order #${order.id} - ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
          url: `/orders/${order.id}`,
        },
      ],
    }
  }
}
