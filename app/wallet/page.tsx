"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Menu,
  CreditCard,
  Smartphone,
  Banknote,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CardData {
  id: string;
  type: "mastercard" | "visa";
  number: string;
  expiry: string;
  holderName: string;
  isActive: boolean;
}

interface CardSettings {
  onlinePayments: boolean;
  storePayments: boolean;
  atmWithdrawals: boolean;
}

export default function MyWalletPage() {
  const router = useRouter();
  const [activeCardType, setActiveCardType] = useState<"mastercard" | "visa">(
    "mastercard"
  );
  const [cardSettings, setCardSettings] = useState<CardSettings>({
    onlinePayments: true,
    storePayments: true,
    atmWithdrawals: true,
  });

  const [cards] = useState<CardData[]>([
    {
      id: "card-1",
      type: "mastercard",
      number: "**** **** **** 3456",
      expiry: "03/25",
      holderName: "ĐĂNG TUYẾN",
      isActive: true,
    },
    {
      id: "card-2",
      type: "visa",
      number: "**** **** **** 7890",
      expiry: "08/26",
      holderName: "ĐĂNG TUYẾN",
      isActive: false,
    },
  ]);

  const activeCard = cards.find((card) => card.type === activeCardType);

  const handleSettingChange = (setting: keyof CardSettings) => {
    setCardSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const getCardGradient = (type: "mastercard" | "visa") => {
    if (type === "mastercard") {
      return "bg-gradient-to-br from-green-500 via-green-600 to-green-700";
    }
    return "bg-gradient-to-br from-green-400 via-green-500 to-green-600";
  };

  const getCardLogo = (type: "mastercard" | "visa") => {
    if (type === "mastercard") {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
          <div className="w-8 h-8 bg-yellow-500 rounded-full opacity-80 -ml-4"></div>
        </div>
      );
    }
    return <div className="text-white font-bold text-lg italic">VISA</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Thẻ của bạn</h1>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Card Type Selector */}
        <div className="flex space-x-3">
          <Button
            variant={activeCardType === "mastercard" ? "default" : "outline"}
            onClick={() => setActiveCardType("mastercard")}
            className={`flex-1 ${
              activeCardType === "mastercard"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "border-green-200 text-green-600 hover:bg-green-50"
            }`}
          >
            Mastercard
          </Button>
          <Button
            variant={activeCardType === "visa" ? "default" : "outline"}
            onClick={() => setActiveCardType("visa")}
            className={`flex-1 ${
              activeCardType === "visa"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "border-green-200 text-green-600 hover:bg-green-50"
            }`}
          >
            Visa
          </Button>
        </div>

        {/* Credit Card Display */}
        {activeCard && (
          <div className="relative">
            <div
              className={`${getCardGradient(
                activeCard.type
              )} rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105`}
            >
              {/* Card Type */}
              <div className="flex justify-between items-start mb-8">
                <div className="text-sm font-medium opacity-90">
                  {activeCard.type.toUpperCase()}
                </div>
                <div className="flex items-center">
                  {getCardLogo(activeCard.type)}
                </div>
              </div>

              {/* Card Number */}
              <div className="mb-6">
                <div className="text-2xl font-mono tracking-wider">
                  {activeCard.number}
                </div>
              </div>

              {/* Card Details */}
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-70 mb-1">CHỦ THẺ</div>
                  <div className="text-sm font-medium">
                    {activeCard.holderName}
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">HẠN SỬ DỤNG</div>
                  <div className="text-sm font-medium">{activeCard.expiry}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Settings */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-green-600" />
                Cài đặt Thẻ
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Online Payments */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Thanh toán Trực tuyến
                    </h4>
                    <p className="text-sm text-gray-500">
                      Bật giao dịch trực tuyến
                    </p>
                  </div>
                </div>
                <Switch
                  checked={cardSettings.onlinePayments}
                  onCheckedChange={() => handleSettingChange("onlinePayments")}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              {/* Store Payments */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Thanh toán Cửa hàng
                    </h4>
                    <p className="text-sm text-gray-500">
                      Bật thanh toán không tiếp xúc
                    </p>
                  </div>
                </div>
                <Switch
                  checked={cardSettings.storePayments}
                  onCheckedChange={() => handleSettingChange("storePayments")}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              {/* ATM Withdrawals */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Rút tiền ATM</h4>
                    <p className="text-sm text-gray-500">Bật rút tiền mặt</p>
                  </div>
                </div>
                <Switch
                  checked={cardSettings.atmWithdrawals}
                  onCheckedChange={() => handleSettingChange("atmWithdrawals")}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16 border-green-200 text-green-600 hover:bg-green-50 flex flex-col items-center justify-center space-y-1"
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-sm">Thêm Thẻ</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 border-green-200 text-green-600 hover:bg-green-50 flex flex-col items-center justify-center space-y-1"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Quản lý</span>
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="shadow-sm border-0 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Số dư khả dụng</p>
                <p className="text-2xl font-bold text-green-700">$2,450.00</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Banknote className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
