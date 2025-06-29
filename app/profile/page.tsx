"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Package,
  Wallet,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { UserChatStats } from "../../components/user-chat-stats";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  variant?: "default" | "danger";
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();

  const handleLogout = () => {
    authLogout();
    router.push("/auth");
  };

  const menuItems: MenuItem[] = [
    {
      id: "orders",
      title: "Đơn hàng của tôi",
      description: "Xem lịch sử đơn hàng",
      icon: Package,
      href: "/orders",
    },
    {
      id: "wallet",
      title: "Ví của tôi",
      description: "Quản lý ví và thanh toán",
      icon: Wallet,
      href: "/wallet",
    },
    {
      id: "notifications",
      title: "Thông báo",
      description: "Quản lý tùy chọn thông báo",
      icon: Bell,
      href: "/notifications",
    },
    {
      id: "settings",
      title: "Cài đặt Tài khoản",
      description: "Tùy chọn tài khoản chung",
      icon: Settings,
      href: "/settings-page",
    },
    {
      id: "logout",
      title: "Đăng xuất",
      description: "Đăng xuất khỏi tài khoản",
      icon: LogOut,
      action: handleLogout,
      variant: "danger",
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;

    if (item.href) {
      return (
        <Link key={item.id} href={item.href}>
          <div
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left ${
              item.variant === "danger" ? "hover:bg-red-50" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.variant === "danger" ? "bg-red-100" : "bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    item.variant === "danger" ? "text-red-600" : "text-gray-600"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`font-medium ${
                    item.variant === "danger" ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm ${
                    item.variant === "danger" ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 ${
                item.variant === "danger" ? "text-red-400" : "text-gray-400"
              }`}
            />
          </div>
        </Link>
      );
    }

    return (
      <button key={item.id} onClick={item.action}>
        <div
          className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left ${
            item.variant === "danger" ? "hover:bg-red-50" : ""
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                item.variant === "danger" ? "bg-red-100" : "bg-gray-100"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  item.variant === "danger" ? "text-red-600" : "text-gray-600"
                }`}
              />
            </div>
            <div>
              <h3
                className={`font-medium ${
                  item.variant === "danger" ? "text-red-600" : "text-gray-900"
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`text-sm ${
                  item.variant === "danger" ? "text-red-500" : "text-gray-500"
                }`}
              >
                {item.description}
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-5 h-5 ${
              item.variant === "danger" ? "text-red-400" : "text-gray-400"
            }`}
          />
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-green-500 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-2"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
            {user?.avatar ? (
              <img
                src={user?.avatar || "/placeholder.svg"}
                alt={user?.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{user?.name}</h1>
            <p className="text-white/80 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* User Chat Statistics */}
      <UserChatStats userEmail={user?.email || ""} />

      {/* Account Menu */}
      <div className="px-4 py-6">
        <Card className="shadow-sm border-0">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Menu Tài khoản
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {menuItems.map(renderMenuItem)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
