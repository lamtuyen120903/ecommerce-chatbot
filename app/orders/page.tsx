"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  title: string
  description: string
  completionPercentage: number
  expectedCompletion: string
  daysRemaining: number
  status: "newest" | "completed" | "delivery"
  stages: {
    orderPlaced: { completed: boolean; active: boolean }
    processing: { completed: boolean; active: boolean }
    shipped: { completed: boolean; active: boolean }
    delivered: { completed: boolean; active: boolean }
  }
  recommendations?: {
    text: string
    responses: { yes: number; no: number }
  }[]
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [expandedOrders, setExpandedOrders] = useState<string[]>(["order-1"])

  const [orders] = useState<Order[]>([
    {
      id: "order-1",
      title: "Order 1",
      description: "Look like Google's",
      completionPercentage: 45,
      expectedCompletion: "Oct 12, 2019",
      daysRemaining: 15,
      status: "newest",
      stages: {
        orderPlaced: { completed: true, active: false },
        processing: { completed: false, active: true },
        shipped: { completed: false, active: false },
        delivered: { completed: false, active: false },
      },
      recommendations: [
        {
          text: "23% increase in home listing in next you like inquire",
          responses: { yes: 0, no: 0 },
        },
        {
          text: "47% have a lower threshold than basic jane price, Buy 11% below average",
          responses: { yes: 0, no: 0 },
        },
      ],
    },
    {
      id: "order-2",
      title: "Order 2",
      description: "Look like Google's",
      completionPercentage: 75,
      expectedCompletion: "Oct 18, 2019",
      daysRemaining: 15,
      status: "completed",
      stages: {
        orderPlaced: { completed: true, active: false },
        processing: { completed: true, active: false },
        shipped: { completed: false, active: true },
        delivered: { completed: false, active: false },
      },
    },
  ])

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const getStageIcon = (stage: string, stageData: { completed: boolean; active: boolean }) => {
    if (stageData.completed) {
      return <CheckCircle className="w-5 h-5 text-white" />
    }
    if (stageData.active) {
      switch (stage) {
        case "orderPlaced":
          return <Package className="w-5 h-5 text-white" />
        case "processing":
          return <Clock className="w-5 h-5 text-white" />
        case "shipped":
          return <Truck className="w-5 h-5 text-white" />
        case "delivered":
          return <CheckCircle className="w-5 h-5 text-white" />
        default:
          return <Clock className="w-5 h-5 text-white" />
      }
    }
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  const getStageStyle = (stageData: { completed: boolean; active: boolean }) => {
    if (stageData.completed || stageData.active) {
      return "bg-green-500"
    }
    return "bg-gray-300"
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "newest":
        return "bg-green-100 text-green-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "delivery":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-6 space-y-6">
        {orders.map((order) => {
          const isExpanded = expandedOrders.includes(order.id)

          return (
            <Card key={order.id} className="shadow-sm border-0">
              <CardContent className="p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
                      <Badge className={getStatusBadgeStyle(order.status)}>
                        {order.status === "newest" ? "Newest" : order.status === "completed" ? "Completed" : "Delivery"}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{order.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Complete</div>
                    <div className="text-2xl font-bold text-gray-900">{order.completionPercentage}%</div>
                    <div className="text-sm text-gray-500">Expected Completion</div>
                    <div className="text-sm font-medium text-gray-900">{order.expectedCompletion}</div>
                    <div className="text-xs text-gray-400">{order.daysRemaining} Days</div>
                  </div>
                </div>

                {/* Progress Stages */}
                <div className="mb-6">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{
                          width: `${
                            order.stages.orderPlaced.completed
                              ? order.stages.processing.completed
                                ? order.stages.shipped.completed
                                  ? "100%"
                                  : "66%"
                                : "33%"
                              : "0%"
                          }`,
                        }}
                      />
                    </div>

                    {/* Stage Icons */}
                    <div className="flex items-center justify-between w-full relative z-10">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${getStageStyle(order.stages.orderPlaced)}`}
                        >
                          {getStageIcon("orderPlaced", order.stages.orderPlaced)}
                        </div>
                        <div className="text-xs text-gray-600 mt-2 text-center">Order Placed</div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${getStageStyle(order.stages.processing)}`}
                        >
                          {getStageIcon("processing", order.stages.processing)}
                        </div>
                        <div className="text-xs text-gray-600 mt-2 text-center">Processing</div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${getStageStyle(order.stages.shipped)}`}
                        >
                          {getStageIcon("shipped", order.stages.shipped)}
                        </div>
                        <div className="text-xs text-gray-600 mt-2 text-center">Shipped</div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${getStageStyle(order.stages.delivered)}`}
                        >
                          {getStageIcon("delivered", order.stages.delivered)}
                        </div>
                        <div className="text-xs text-gray-600 mt-2 text-center">Delivered</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex space-x-2 mb-4">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Newest
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Completed
                  </Badge>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    Delivery
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
