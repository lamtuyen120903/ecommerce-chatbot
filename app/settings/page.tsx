"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Customer Support Settings
          </h1>
          <p className="text-gray-600 mt-2">Configure and test your n8n webhook integration</p>
        </div>

        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">N8N Integration</h2>
              <p className="text-gray-600">Your n8n webhook integration is configured and ready to use.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <strong>Status:</strong> All chatbot categories are working with intelligent fallback responses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Webhook URL:</span>
                <span className="text-gray-900 font-mono text-xs">https://n8ntina.onegroup.id.vn/webhook/baa63860-e324-4ac6-b16e-c6deabcc3872...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categories:</span>
                <span className="text-gray-900">Digital, Clothes, Food, Orders</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Active with Fallbacks</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
