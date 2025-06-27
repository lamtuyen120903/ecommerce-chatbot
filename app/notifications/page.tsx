"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  Tag,
  Activity,
  Smartphone,
  Package,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Truck,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface NotificationCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  count?: number
}

interface NotificationItem {
  id: string
  category: string
  title: string
  description: string
  timestamp: string
  isRead: boolean
  details?: string
  orderNumber?: string
  isExpanded?: boolean
}

export default function NotificationsPage() {
  const router = useRouter()
  const [expandedNotifications, setExpandedNotifications] = useState<string[]>([])

  const categories: NotificationCategory[] = [
    {
      id: "promotions",
      title: "Promotions",
      description: "Special offers and discount codes available",
      icon: Tag,
      color: "text-green-600",
      bgColor: "bg-green-100",
      count: 3,
    },
    {
      id: "activity",
      title: "Activity",
      description: "Your feedback and support interactions",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
      count: 2,
    },
    {
      id: "app-updates",
      title: "App Updates",
      description: "New features and app improvements available",
      icon: Smartphone,
      color: "text-green-600",
      bgColor: "bg-green-100",
      count: 1,
    },
  ]

  const [notifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      category: "orders",
      title: "Have you rated your purchase?",
      description: "Order 1511101512345 is completed. Your feedback matters to us! Rate the products by 26-11-2019.",
      timestamp: "2 hours ago",
      isRead: false,
      orderNumber: "1511101512345",
      details:
        "Please take a moment to rate your recent purchase. Your feedback helps other customers make informed decisions.",
    },
    {
      id: "notif-2",
      category: "orders",
      title: "Order Delivered",
      description:
        "Your order 1511101512345 has been delivered on 26-10-2019. Please allow 1-3 day(s) for payment to be released to the seller.",
      timestamp: "1 day ago",
      isRead: false,
      orderNumber: "1511101512345",
      details:
        "Your package has been successfully delivered. If you have any issues with your order, please contact our support team.",
    },
    {
      id: "notif-3",
      category: "promotions",
      title: "Flash Sale Alert!",
      description: "Up to 70% off on selected items. Limited time offer ending soon!",
      timestamp: "3 hours ago",
      isRead: true,
    },
    {
      id: "notif-4",
      category: "app-updates",
      title: "New App Version Available",
      description: "Update to version 2.1.0 for improved performance and new features.",
      timestamp: "1 week ago",
      isRead: true,
    },
  ])

  const toggleNotificationExpansion = (notificationId: string) => {
    setExpandedNotifications((prev) =>
      prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : [...prev, notificationId],
    )
  }

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "orders":
        return Package
      case "promotions":
        return Tag
      case "activity":
        return Activity
      case "app-updates":
        return Smartphone
      default:
        return Package
    }
  }

  const orderNotifications = notifications.filter((notif) => notif.category === "orders")
  const otherNotifications = notifications.filter((notif) => notif.category !== "orders")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <ShoppingCart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Notification Categories */}
        <div className="space-y-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.id} className="shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${category.bgColor} rounded-full flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{category.title}</h3>
                          {category.count && category.count > 0 && (
                            <Badge className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                              {category.count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Order Updates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Updates</h2>
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
              Read All
            </Button>
          </div>

          <div className="space-y-3">
            {orderNotifications.map((notification) => {
              const isExpanded = expandedNotifications.includes(notification.id)
              const Icon = getNotificationIcon(notification.category)

              return (
                <Card key={notification.id} className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                            <p className="text-xs text-gray-400">{notification.timestamp}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleNotificationExpansion(notification.id)}
                            className="ml-2 p-1"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>

                        {isExpanded && notification.details && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{notification.details}</p>
                            {notification.orderNumber && (
                              <div className="mt-2 flex items-center space-x-4">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                                  <Star className="w-4 h-4 mr-1" />
                                  Rate Product
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-200 text-green-600 hover:bg-green-50"
                                >
                                  <Truck className="w-4 h-4 mr-1" />
                                  Track Order
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {!notification.isRead && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Other Notifications */}
        {otherNotifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {otherNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.category)

                return (
                  <Card key={notification.id} className="shadow-sm border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                          <p className="text-xs text-gray-400">{notification.timestamp}</p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
