"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle, AlertCircle, Bot, Info } from "lucide-react";

export function EnvSetup() {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Using the working webhook URL for all categories
  const workingWebhookUrl =
    "https://n8ntina.onegroup.id.vn/webhook-test/baa63860-e324-4ac6-b16e-c6deabcc3872";

  const categoryEndpoints = [
    {
      category: "digital",
      name: "Bot Sản phẩm Kỹ thuật số",
      url: workingWebhookUrl,
      description:
        "Xử lý phần mềm, tải xuống, giấy phép và dịch vụ kỹ thuật số",
      color: "bg-pink-100 text-pink-700",
      status: "active",
    },
    {
      category: "clothes",
      name: "Bot Quần áo & Thời trang",
      url: workingWebhookUrl,
      description: "Xử lý quần áo, phụ kiện, kích thước và tư vấn thời trang",
      color: "bg-rose-100 text-rose-700",
      status: "active",
    },
    {
      category: "food",
      name: "Bot Thực phẩm & Đồ uống",
      url: workingWebhookUrl,
      description: "Xử lý món ăn, thành phần, tùy chọn ăn kiêng và giao hàng",
      color: "bg-orange-100 text-orange-700",
      status: "active",
    },
    {
      category: "orders",
      name: "Bot Quản lý Đơn hàng",
      url: workingWebhookUrl,
      description:
        "Xử lý theo dõi đơn hàng, trả lại, đổi hàng và trạng thái giao hàng",
      color: "bg-purple-100 text-purple-700",
      status: "active",
    },
  ];

  const testAllWebhooks = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const testPromises = categoryEndpoints.map(async (endpoint) => {
        const response = await fetch("/api/n8n-webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Test message for ${endpoint.name}`,
            category: endpoint.category,
            conversationId: `test-${endpoint.category}-${Date.now()}`,
            timestamp: new Date().toISOString(),
          }),
        });

        const data = await response.json();
        return {
          category: endpoint.category,
          name: endpoint.name,
          success: data.success,
          response: data.response,
        };
      });

      const results = await Promise.all(testPromises);
      const successCount = results.filter((r) => r.success).length;

      if (successCount === results.length) {
        setTestResult({
          success: true,
          message: `Tất cả ${successCount} chatbot theo danh mục đang hoạt động chính xác!`,
        });
      } else {
        setTestResult({
          success: false,
          message: `${successCount}/${results.length} chatbot đang hoạt động. Kiểm tra quy trình n8n của bạn.`,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Lỗi kết nối. Vui lòng kiểm tra URL webhook và thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Cài đặt Môi trường N8N</span>
        </CardTitle>
        <CardDescription>
          Cấu hình và kiểm tra kết nối webhook cho các chatbot AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Setup Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Đây là trang cài đặt để kiểm tra và cấu hình các webhook N8N cho các
            chatbot AI khác nhau. Tất cả các chatbot hiện tại đang sử dụng cùng
            một webhook URL để đơn giản hóa.
          </AlertDescription>
        </Alert>

        {/* Category Endpoints */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Danh mục Chatbot</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryEndpoints.map((endpoint) => (
              <Card key={endpoint.category} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${endpoint.color}`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          {endpoint.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600 border-green-200"
                        >
                          Hoạt động
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {endpoint.description}
                      </p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block break-all">
                        {endpoint.url}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Button
          onClick={testAllWebhooks}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading
            ? "Đang kiểm tra tất cả Chatbot..."
            : "Kiểm tra tất cả Chatbot theo danh mục"}
        </Button>

        {testResult && (
          <Alert
            className={
              testResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={testResult.success ? "text-green-800" : "text-red-800"}
            >
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Thiết lập Quy trình N8N
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Cấu hình hoạt động hiện tại:
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">URL Webhook hoạt động:</span>
              <code className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded">
                {workingWebhookUrl}
              </code>
            </div>
            <div className="text-xs text-gray-500 mt-3">
              <p>
                <strong>Dữ liệu gửi đến n8n:</strong> userMessage, category,
                conversationId, timestamp, source, botType, context
              </p>
              <p>
                <strong>Phản hồi mong đợi:</strong>{" "}
                {`{ "output": "Phản hồi AI của bạn ở đây" }`}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h5 className="font-medium text-yellow-800 mb-1">
              Bước tiếp theo (Tùy chọn):
            </h5>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Tạo quy trình n8n riêng biệt cho từng danh mục</li>
              <li>
                • Sử dụng URL webhook khác nhau cho phản hồi chuyên biệt hơn
              </li>
              <li>
                • Huấn luyện từng quy trình với kiến thức chuyên biệt theo danh
                mục
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
