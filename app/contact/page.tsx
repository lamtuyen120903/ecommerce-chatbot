"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContactUsPage() {
  const router = useRouter();

  const handleCall = () => {
    window.location.href = "tel:+18156179361";
  };

  const handleEmail = () => {
    window.location.href = "mailto:contact@ccss.com";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-500 px-4 py-8 text-center">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div></div>
        </div>

        <div className="mb-4">
          <Phone className="w-8 h-8 text-white mx-auto mb-4" />
        </div>
        <h1 className="text-3xl font-bold text-white">815 617 9361</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Liên hệ Chúng tôi
          </h2>
          <p className="text-gray-600">Chúng tôi có thể giúp gì cho bạn?</p>
        </div>

        {/* Contact Info */}
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            {/* Address */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Địa chỉ</h3>
                <p className="text-gray-600">
                  303 Phillips Ramp, Miami, FL 11359
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <button
                  onClick={handleEmail}
                  className="text-green-600 hover:text-green-700"
                >
                  contact@ccss.com
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Điện thoại</h3>
                <button
                  onClick={handleCall}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  815 617 9361
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Methods */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4 text-center">
              Kết nối với Chúng tôi
            </h3>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleEmail}
                className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 p-0 rounded-full"
                title="Gmail"
              >
                <Mail className="w-5 h-5" />
              </Button>

              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 p-0 rounded-full"
                title="Zalo"
              >
                <span className="font-bold">Z</span>
              </Button>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 p-0 rounded-full"
                title="Messenger"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleCall}
            className="bg-green-500 hover:bg-green-600 text-white h-12"
          >
            <Phone className="w-4 h-4 mr-2" />
            Gọi Ngay
          </Button>
          <Button
            onClick={handleEmail}
            variant="outline"
            className="border-green-200 text-green-600 hover:bg-green-50 h-12"
          >
            <Mail className="w-4 h-4 mr-2" />
            Gửi Email
          </Button>
        </div>
      </div>
    </div>
  );
}
