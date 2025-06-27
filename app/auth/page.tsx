"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageCircle,
  Mail,
  Lock,
  Shield,
  Zap,
  Users,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import type { RegisterData, LoginData, AuthError } from "../../types/auth"

export default function AuthPage() {
  const router = useRouter()
  const { login, register } = useAuth()

  // Login state
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  })

  // Registration state
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<AuthError[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("register") // Default to register

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
    clearErrors()
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData((prev) => ({ ...prev, [name]: value }))
    clearErrors()
  }

  const clearErrors = () => {
    setErrors([])
    setSuccessMessage("")
  }

  const getFieldError = (field: string): string | undefined => {
    return errors.find((error) => error.field === field)?.message
  }

  const getGeneralError = (): string | undefined => {
    return errors.find((error) => !error.field)?.message
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    clearErrors()

    try {
      const result = await login(loginData)

      if (result.success) {
        setSuccessMessage(result.message || "Login successful!")
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        setErrors(result.errors || [])
      }
    } catch (err) {
      setErrors([{ message: "Login failed. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    clearErrors()

    try {
      const result = await register(registerData)

      if (result.success) {
        setSuccessMessage(result.message || "Account created successfully!")
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        setErrors(result.errors || [])
      }
    } catch (err) {
      setErrors([{ message: "Registration failed. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col">
      {/* Header Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center space-y-6 mb-12">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>

          {/* Title and Description */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900">Customer Support Chat</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Get instant help with our AI-powered customer service platform
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
          <Card className="text-center border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6 pb-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">Your conversations are encrypted and secure</p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6 pb-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Response</h3>
              <p className="text-sm text-gray-600">Get immediate answers to your questions</p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6 pb-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600">Connect with human agents when needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">Customer Support Portal</CardTitle>
            <CardDescription className="text-gray-600">
              {activeTab === "register" ? "Create your account to get started" : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-green-50">
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm font-medium"
                >
                  Create Account
                </TabsTrigger>
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm font-medium"
                >
                  Sign In
                </TabsTrigger>
              </TabsList>

              {/* Success Message */}
              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* General Error Message */}
              {getGeneralError() && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{getGeneralError()}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-gray-700 font-medium">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        className={`pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400 h-12 ${
                          getFieldError("name") ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                        }`}
                        required
                      />
                    </div>
                    {getFieldError("name") && <p className="text-sm text-red-600">{getFieldError("name")}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-700 font-medium">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className={`pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400 h-12 ${
                          getFieldError("email") ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                        }`}
                        required
                      />
                    </div>
                    {getFieldError("email") && <p className="text-sm text-red-600">{getFieldError("email")}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone" className="text-gray-700 font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        className={`pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400 h-12 ${
                          getFieldError("phone") ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                        }`}
                      />
                    </div>
                    {getFieldError("phone") && <p className="text-sm text-red-600">{getFieldError("phone")}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-address" className="text-gray-700 font-medium">
                      Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-address"
                        name="address"
                        type="text"
                        placeholder="Enter your address"
                        value={registerData.address}
                        onChange={handleRegisterChange}
                        className="pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400 h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-700 font-medium">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className={`pl-10 pr-10 border-gray-200 focus:border-green-400 focus:ring-green-400 h-12 ${
                          getFieldError("password") ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {getFieldError("password") && <p className="text-sm text-red-600">{getFieldError("password")}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-gray-700 font-medium">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        className={`pl-10 pr-10 border-gray-200 focus:border-green-400 focus:ring-green-400 h-12 ${
                          getFieldError("confirmPassword")
                            ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                            : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {getFieldError("confirmPassword") && (
                      <p className="text-sm text-red-600">{getFieldError("confirmPassword")}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-base font-medium shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className={`pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400 h-12 ${
                          getFieldError("email") ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                        }`}
                        required
                      />
                    </div>
                    {getFieldError("email") && <p className="text-sm text-red-600">{getFieldError("email")}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className={`pl-10 border-gray-200 focus:border-green-400 focus:ring-green-400 h-12 ${
                          getFieldError("password") ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                        }`}
                        required
                      />
                    </div>
                    {getFieldError("password") && <p className="text-sm text-red-600">{getFieldError("password")}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-base font-medium shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Additional Options */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
