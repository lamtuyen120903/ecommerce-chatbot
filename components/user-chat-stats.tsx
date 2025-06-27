"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Package, Clock, BarChart3 } from "lucide-react"
import { getUserChatStats } from "../utils/user-data-migration"

interface UserChatStatsProps {
  userEmail: string
}

export function UserChatStats({ userEmail }: UserChatStatsProps) {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalOrders: 0,
    lastActivity: null as string | null,
  })

  useEffect(() => {
    if (userEmail) {
      const userStats = getUserChatStats(userEmail)
      setStats({ ...userStats, totalOrders: 4 })
    }
  }, [userEmail])

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return "No activity yet"

    const date = new Date(lastActivity)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <span>Your Chat Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.totalMessages}</div>
            <div className="text-sm text-green-600">Total Messages</div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{stats.totalOrders}</div>
            <div className="text-sm text-blue-600">Orders</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Last Activity</span>
          </div>
          <Badge variant="outline" className="text-gray-600">
            {formatLastActivity(stats.lastActivity)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
