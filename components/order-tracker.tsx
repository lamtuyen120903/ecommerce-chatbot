"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock, ArrowRight } from "lucide-react";

interface OrderTrackerProps {
  orderId: string;
  status: "processing" | "shipped" | "delivered" | "returned";
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export function OrderTracker({
  orderId,
  status,
  trackingNumber,
  estimatedDelivery,
}: OrderTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusStep = () => {
    switch (status) {
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      case "returned":
        return 4;
      default:
        return 1;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-orange-500";
      case "delivered":
        return "bg-green-500";
      case "returned":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700">Đang xử lý</Badge>;
      case "shipped":
        return <Badge className="bg-orange-100 text-orange-700">Đã gửi</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-700">Đã giao</Badge>;
      case "returned":
        return <Badge className="bg-red-100 text-red-700">Đã trả</Badge>;
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700">Không xác định</Badge>
        );
    }
  };

  return (
    <Card className="border-green-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">Đơn hàng #{orderId}</h4>
              {getStatusBadge()}
            </div>
            {trackingNumber && (
              <p className="text-xs text-gray-500 mt-1">
                Mã theo dõi: {trackingNumber}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
          >
            {expanded ? "Ẩn Chi tiết" : "Xem Chi tiết"}
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
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep() >= 1 ? getStatusColor() : "bg-gray-300"
                    }`}
                  >
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-xs mt-1">Đang xử lý</p>
                </div>

                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep() >= 2 ? getStatusColor() : "bg-gray-300"
                    }`}
                  >
                    <Truck className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-xs mt-1">Đã gửi</p>
                </div>

                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep() >= 3 ? getStatusColor() : "bg-gray-300"
                    }`}
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-xs mt-1">Đã giao</p>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            {estimatedDelivery && (
              <div className="text-center bg-green-50 p-2 rounded">
                <p className="text-xs text-green-700">
                  {status === "delivered"
                    ? "Đã giao vào"
                    : "Dự kiến giao trước"}
                  : <span className="font-medium">{estimatedDelivery}</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-green-200 text-green-600 hover:bg-green-50"
              >
                <Package className="w-3 h-3 mr-1" />
                Xem Chi tiết
              </Button>

              <Button
                size="sm"
                className="text-xs bg-green-500 hover:bg-green-600 text-white"
              >
                Theo dõi Đơn hàng
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
