"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Shield,
  Smartphone,
  Headphones,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
} from "lucide-react";
import { AuthGuard } from "../../components/auth-guard";
import { useAuthStore } from "../../lib/auth-store";
import type { RegisterData, LoginData, AuthError } from "../../types/auth";
import {
  validateRegistrationData,
  validateLoginData,
} from "../../utils/auth-validation";

export default function AuthPage() {
  const router = useRouter();
  const { register, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Form data
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginDataChange = (field: keyof LoginData, value: string) => {
    setLoginData((prev) => {
      const next = { ...prev, [field]: value };
      // Validate login data in real-time
      const validationErrors = validateLoginData(next);
      setErrors(validationErrors);
      return next;
    });
    setSuccessMessage("");
  };

  const handleRegisterDataChange = (
    field: keyof RegisterData,
    value: string
  ) => {
    setRegisterData((prev) => {
      const next = { ...prev, [field]: value };
      // Real-time validation for registration data
      const validationErrors = validateRegistrationData(next);
      setErrors(validationErrors);
      return next;
    });
    setSuccessMessage("");
  };

  const clearErrors = () => {
    setErrors([]);
    setSuccessMessage("");
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find((error) => error.field === field)?.message;
  };

  const getGeneralError = (): string | undefined => {
    return errors.find((error) => !error.field)?.message;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Validate login data before submitting
    const validationErrors = validateLoginData(loginData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(loginData);

      if (result.success) {
        setSuccessMessage(result.message || "Đăng nhập thành công!");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setErrors(result.errors || []);
      }
    } catch (err) {
      setErrors([{ message: "Đăng nhập thất bại. Vui lòng thử lại." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Client-side validation for registration data (including password rules)
    const validationErrors = validateRegistrationData(registerData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(registerData);

      if (result.success) {
        setSuccessMessage(result.message || "Tài khoản được tạo thành công!");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setErrors(result.errors || []);
      }
    } catch (err) {
      setErrors([{ message: "Đăng ký thất bại. Vui lòng thử lại." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-2xl font-bold">Trợ lý AI Thương mại</h1>
                <p className="text-green-100">Hỗ trợ khách hàng thông minh</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Badge
                variant="outline"
                className="text-green-100 border-green-300"
              >
                <Shield className="w-4 h-4 mr-1" />
                Bảo mật cao
              </Badge>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Bảo mật Tuyệt đối
                </h3>
                <p className="text-sm text-gray-600">
                  Dữ liệu được mã hóa và bảo vệ an toàn
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Hỗ trợ 24/7
                </h3>
                <p className="text-sm text-gray-600">
                  Trợ lý AI luôn sẵn sàng hỗ trợ mọi lúc
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Tư vấn Thông minh
                </h3>
                <p className="text-sm text-gray-600">
                  AI hiểu và giải đáp mọi thắc mắc
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Thanh toán An toàn
                </h3>
                <p className="text-sm text-gray-600">
                  Kết nối với nhân viên khi cần thiết
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Auth Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Chào mừng trở lại
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Đăng nhập hoặc tạo tài khoản để bắt đầu
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm font-medium"
                    >
                      Đăng nhập
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm font-medium"
                    >
                      Đăng ký
                    </TabsTrigger>
                  </TabsList>

                  {/* Success Message */}
                  {successMessage && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {successMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* General Error Message */}
                  {getGeneralError() && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        {getGeneralError()}
                      </AlertDescription>
                    </Alert>
                  )}

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Họ và tên
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={registerData.name}
                          onChange={(e) =>
                            handleRegisterDataChange("name", e.target.value)
                          }
                          className={`mt-1 ${
                            getFieldError("name") ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập họ và tên"
                        />
                        {getFieldError("name") && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError("name")}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) =>
                            handleRegisterDataChange("email", e.target.value)
                          }
                          className={`mt-1 ${
                            getFieldError("email") ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập địa chỉ email"
                        />
                        {getFieldError("email") && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError("email")}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-gray-700"
                        >
                          Số điện thoại
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={registerData.phone}
                          onChange={(e) =>
                            handleRegisterDataChange("phone", e.target.value)
                          }
                          className={`mt-1 ${
                            getFieldError("phone") ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập số điện thoại"
                        />
                        {getFieldError("phone") && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError("phone")}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium text-gray-700"
                        >
                          Mật khẩu
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={registerData.password}
                          onChange={(e) =>
                            handleRegisterDataChange("password", e.target.value)
                          }
                          className={`mt-1 ${
                            getFieldError("password") ? "border-red-500" : ""
                          }`}
                          placeholder="Tạo mật khẩu"
                        />
                        {getFieldError("password") && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError("password")}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium text-gray-700"
                        >
                          Xác nhận mật khẩu
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            handleRegisterDataChange(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                          className={`mt-1 ${
                            getFieldError("confirmPassword")
                              ? "border-red-500"
                              : ""
                          }`}
                          placeholder="Nhập lại mật khẩu"
                        />
                        {getFieldError("confirmPassword") && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError("confirmPassword")}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-base font-medium shadow-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Đang tạo tài khoản..." : "Tạo Tài khoản"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label
                          htmlFor="loginEmail"
                          className="text-sm font-medium text-gray-700"
                        >
                          Email
                        </Label>
                        <Input
                          id="loginEmail"
                          type="email"
                          value={loginData.email}
                          onChange={(e) =>
                            handleLoginDataChange("email", e.target.value)
                          }
                          className={`mt-1 ${
                            getFieldError("email") ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập địa chỉ email"
                        />
                        {getFieldError("email") && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError("email")}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="loginPassword"
                          className="text-sm font-medium text-gray-700"
                        >
                          Mật khẩu
                        </Label>
                        <Input
                          id="loginPassword"
                          type="password"
                          value={loginData.password}
                          onChange={(e) =>
                            handleLoginDataChange("password", e.target.value)
                          }
                          className={`mt-1 ${
                            getFieldError("password") ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập mật khẩu"
                        />
                        {getFieldError("password") && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError("password")}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-base font-medium shadow-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
