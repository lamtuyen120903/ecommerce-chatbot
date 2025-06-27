"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Settings, CheckCircle, AlertCircle, Bot, Info } from "lucide-react"

export function EnvSetup() {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Using the working webhook URL for all categories
  const workingWebhookUrl = "https://n8ntina.onegroup.id.vn/webhook/baa63860-e324-4ac6-b16e-c6deabcc3872"

  const categoryEndpoints = [
    {
      category: "digital",
      name: "Digital Products Bot",
      url: workingWebhookUrl,
      description: "Handles software, downloads, licenses, and digital services",
      color: "bg-pink-100 text-pink-700",
      status: "active",
    },
    {
      category: "clothes",
      name: "Clothes & Fashion Bot",
      url: workingWebhookUrl,
      description: "Handles clothing, accessories, sizing, and fashion advice",
      color: "bg-rose-100 text-rose-700",
      status: "active",
    },
    {
      category: "food",
      name: "Food & Beverage Bot",
      url: workingWebhookUrl,
      description: "Handles menu items, ingredients, dietary options, and delivery",
      color: "bg-orange-100 text-orange-700",
      status: "active",
    },
    {
      category: "orders",
      name: "Order Management Bot",
      url: workingWebhookUrl,
      description: "Handles order tracking, returns, exchanges, and delivery status",
      color: "bg-purple-100 text-purple-700",
      status: "active",
    },
  ]

  const testAllWebhooks = async () => {
    setIsLoading(true)
    setTestResult(null)

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
        })

        const data = await response.json()
        return {
          category: endpoint.category,
          name: endpoint.name,
          success: data.success,
          response: data.response,
        }
      })

      const results = await Promise.all(testPromises)
      const successCount = results.filter((r) => r.success).length

      if (successCount === results.length) {
        setTestResult({
          success: true,
          message: `All ${successCount} category-specific chatbots are working correctly!`,
        })
      } else {
        setTestResult({
          success: false,
          message: `${successCount}/${results.length} chatbots are working. Check your n8n workflows.`,
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Connection error. Please verify your webhook URLs and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>N8N Chatbot Configuration</span>
        </CardTitle>
        <CardDescription>
          Current setup uses one working webhook with category-specific context for specialized responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Setup Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Current Setup:</strong> All categories use the same working webhook URL with different context
            parameters. This allows for specialized responses while using a single n8n workflow. You can create separate
            workflows later for even more specialized behavior.
          </AlertDescription>
        </Alert>

        {/* Category Endpoints */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Chatbot Categories</h3>
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
                        <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                          {endpoint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block break-all">{endpoint.url}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Button onClick={testAllWebhooks} disabled={isLoading} className="w-full">
          {isLoading ? "Testing All Chatbots..." : "Test All Category Chatbots"}
        </Button>

        {testResult && (
          <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">N8N Workflow Setup</h4>
          <p className="text-sm text-gray-600 mb-3">Current working configuration:</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Working Webhook URL:</span>
              <code className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded">{workingWebhookUrl}</code>
            </div>
            <div className="text-xs text-gray-500 mt-3">
              <p>
                <strong>Data sent to n8n:</strong> userMessage, category, conversationId, timestamp, source, botType,
                context
              </p>
              <p>
                <strong>Expected response:</strong> {`{ "output": "Your AI response here" }`}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h5 className="font-medium text-yellow-800 mb-1">Next Steps (Optional):</h5>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Create separate n8n workflows for each category</li>
              <li>• Use different webhook URLs for more specialized responses</li>
              <li>• Train each workflow with category-specific knowledge</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
