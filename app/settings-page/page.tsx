"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  HelpCircle,
  LogOut,
  Globe,
  Moon,
  Smartphone,
  User,
  PenSquare,
  Bell,
  Lock,
  Eye,
  Database,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../hooks/useAuth"

interface SettingsItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  action?: () => void
  variant?: "default" | "danger"
  toggle?: boolean
  isToggled?: boolean
  onToggle?: () => void
}

interface SettingsSection {
  id: string
  title: string
  items: SettingsItem[]
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout: authLogout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [dataCollection, setDataCollection] = useState(true)

  const handleLogout = () => {
    authLogout()
    router.push("/auth")
  }

  const handleContactUs = () => {
    router.push("/contact")
  }

  const handleEditProfile = () => {
    router.push("/profile/edit")
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    console.log("Dark mode toggled:", !isDarkMode)
  }

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
    console.log("Notifications toggled:", !notificationsEnabled)
  }

  const toggleDataCollection = () => {
    setDataCollection(!dataCollection)
    console.log("Data collection toggled:", !dataCollection)
  }

  const settingsSections: SettingsSection[] = [
    {
      id: "account",
      title: "Account Settings",
      items: [
        {
          id: "edit-profile",
          title: "Edit Profile",
          description: "Update your personal information",
          icon: PenSquare,
          action: handleEditProfile,
        },
        {
          id: "security",
          title: "Security & Privacy",
          description: "Manage your account security settings",
          icon: Shield,
          action: () => console.log("Navigate to security settings"),
        },
        {
          id: "password",
          title: "Change Password",
          description: "Update your account password",
          icon: Lock,
          action: () => console.log("Navigate to password change"),
        },
      ],
    },
    {
      id: "preferences",
      title: "App Preferences",
      items: [
        {
          id: "language",
          title: "Language & Region",
          description: "Change your language preferences",
          icon: Globe,
          action: () => console.log("Navigate to language settings"),
        },
        {
          id: "theme",
          title: "Dark Mode",
          description: "Switch between light and dark theme",
          icon: Moon,
          toggle: true,
          isToggled: isDarkMode,
          onToggle: toggleDarkMode,
        },
        {
          id: "notifications",
          title: "Push Notifications",
          description: "Enable or disable push notifications",
          icon: Bell,
          toggle: true,
          isToggled: notificationsEnabled,
          onToggle: toggleNotifications,
        },
        {
          id: "app-settings",
          title: "App Preferences",
          description: "Customize your app experience",
          icon: Smartphone,
          action: () => console.log("Navigate to app preferences"),
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy & Data",
      items: [
        {
          id: "privacy-policy",
          title: "Privacy Policy",
          description: "View our privacy policy",
          icon: Eye,
          action: () => console.log("Navigate to privacy policy"),
        },
        {
          id: "data-collection",
          title: "Data Collection",
          description: "Control how we collect your data",
          icon: Database,
          toggle: true,
          isToggled: dataCollection,
          onToggle: toggleDataCollection,
        },
      ],
    },
    {
      id: "support",
      title: "Support & Help",
      items: [
        {
          id: "contact",
          title: "Contact Support",
          description: "Get help and support",
          icon: HelpCircle,
          action: handleContactUs,
        },
        {
          id: "logout",
          title: "Log out from your account",
          description: "Sign out of your current session",
          icon: LogOut,
          action: handleLogout,
          variant: "danger",
        },
      ],
    },
  ]

  const renderSettingsItem = (item: SettingsItem) => {
    const Icon = item.icon

    const content = (
      <div
        className={`w-full flex items-center justify-between p-4 ${
          item.action && !item.toggle ? "hover:bg-gray-50 cursor-pointer" : ""
        } transition-colors text-left ${item.variant === "danger" ? "hover:bg-red-50" : ""}`}
        onClick={item.action && !item.toggle ? item.action : undefined}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              item.variant === "danger" ? "bg-red-100" : "bg-gray-100"
            }`}
          >
            <Icon className={`w-5 h-5 ${item.variant === "danger" ? "text-red-600" : "text-gray-600"}`} />
          </div>
          <div>
            <h3 className={`font-medium ${item.variant === "danger" ? "text-red-600" : "text-gray-900"}`}>
              {item.title}
            </h3>
            <p className={`text-sm ${item.variant === "danger" ? "text-red-500" : "text-gray-500"}`}>
              {item.description}
            </p>
          </div>
        </div>
        {item.toggle ? (
          <Switch
            checked={item.isToggled}
            onCheckedChange={item.onToggle}
            className="data-[state=checked]:bg-green-500"
          />
        ) : (
          <ChevronRight className={`w-5 h-5 ${item.variant === "danger" ? "text-red-400" : "text-gray-400"}`} />
        )}
      </div>
    )

    return <div key={item.id}>{content}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Matching Profile Page */}
      <div className="bg-green-500 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-white/10 p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEditProfile} className="text-white hover:bg-white/10 p-2">
            <PenSquare className="w-5 h-5" />
          </Button>
        </div>

        {/* User Profile - Matching Profile Page */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{user?.name || "User"}</h1>
            <p className="text-white/80 text-sm">{user?.email || "user@example.com"}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-4 py-6 space-y-6">
        {settingsSections.map((section) => (
          <Card key={section.id} className="shadow-sm border-0">
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>

              <div className="divide-y divide-gray-100">{section.items.map((item) => renderSettingsItem(item))}</div>
            </CardContent>
          </Card>
        ))}

        {/* App Information - Matching Profile Page Style */}
        <Card className="shadow-sm border-0 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Customer Support App</h4>
                <p className="text-sm text-green-700">Version 2.1.0 • Settings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
