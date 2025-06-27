"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, User, Mail, Phone, MapPin, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../hooks/useAuth"

export default function EditProfilePage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState("")

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors([]) // Clear errors when user types
    setSuccessMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])
    setSuccessMessage("")

    try {
      // Validate form data
      const validationErrors: string[] = []

      if (!formData.name.trim()) {
        validationErrors.push("Name is required")
      }
      if (!formData.email.trim()) {
        validationErrors.push("Email is required")
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      const result = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      })

      if (result.success) {
        setSuccessMessage(result.message || "Profile updated successfully!")
        setTimeout(() => {
          router.push("/profile")
        }, 1500)
      } else {
        setErrors(result.errors?.map((e) => e.message) || ["Failed to update profile"])
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrors(["An unexpected error occurred. Please try again."])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePhoto = () => {
    // Placeholder for photo change functionality
    alert("Photo change functionality will be implemented soon!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
          </div>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-500 hover:bg-green-600 text-white">
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Photo */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-green-600" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={handleChangePhoto}
          >
            Change Photo
          </Button>
        </div>

        {/* Edit Form */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    className="pl-10 border-gray-200 bg-gray-50 cursor-not-allowed"
                    placeholder="Enter your email address"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500">Email address cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Submit Button (Mobile) */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white h-12"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Changes...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <Card className="shadow-sm border-0 bg-green-50">
          <CardContent className="p-4">
            <div className="text-center text-sm text-green-700">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="font-medium mb-1">Your Privacy Matters</p>
              <p>Your personal information is securely stored and will not be shared with third parties.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
