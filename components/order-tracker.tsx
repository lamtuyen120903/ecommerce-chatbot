"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle, Clock, ArrowRight } from "lucide-react"

interface OrderTrackerProps {
  orderId: string
  status: "processing" | "shipped" | "delivered" | "returned"
  trackingNumber?: string
  estimatedDelivery?: string
}

export function OrderTracker({ orderId, status, trackingNumber, estimatedDelivery }: OrderTrackerProps) {
  const [expanded, setExpanded] = useState(false)

  const getStatusStep = () => {
    switch (status) {
      case "processing":
        return 1
      case "shipped":
        return 2
      case "delivered":
        return 3
      case "returned":
        return 4
      default:
        return 1
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-orange-500"
      case "delivered":
        return "bg-green-500"
      case "returned":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
      case "shipped":
        return <Badge className="bg-orange-100 text-orange-700">Shipped</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-700">Delivered</Badge>
      case "returned":
        return <Badge className="bg-red-100 text-red-700">Returned</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>
    }
  }

  return (
    <Card className="border-green-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">Order #{orderId}</h4>
              {getStatusBadge()}
            </div>
            {trackingNumber && <p className="text-xs text-gray-500 mt-1">Tracking: {trackingNumber}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
          >
            {expanded ? "Hide Details" : "View Details"}
          </Button>
        </div>

        {expanded && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="relative pt-4">
              <div className="h-1 w-full bg-gray-200 rounded">
                <div
                  className={`h-1 ${getStatusColor()} rounded transition-all duration-300`}
                  style={{ width: `${(getStatusStep() / 3) * 100}%` }}
                ></div>
              </div>

              {/* Status Steps */}
              <div className="flex justify-between mt-2">
                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${getStatusStep() >= 1 ? getStatusColor() : "bg-gray-300"}`}
                  >
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-xs mt-1">Processing</p>
                </div>

                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${getStatusStep() >= 2 ? getStatusColor() : "bg-gray-300"}`}
                  >
                    <Truck className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-xs mt-1">Shipped</p>
                </div>

                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${getStatusStep() >= 3 ? getStatusColor() : "bg-gray-300"}`}
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-xs mt-1">Delivered</p>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            {estimatedDelivery && (
              <div className="text-center bg-green-50 p-2 rounded">
                <p className="text-xs text-green-700">
                  {status === "delivered" ? "Delivered on" : "Estimated delivery by"}:{" "}
                  <span className="font-medium">{estimatedDelivery}</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" size="sm" className="text-xs border-green-200 text-green-600 hover:bg-green-50">
                <Package className="w-3 h-3 mr-1" />
                View Details
              </Button>

              <Button size="sm" className="text-xs bg-green-500 hover:bg-green-600 text-white">
                Track Order
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
