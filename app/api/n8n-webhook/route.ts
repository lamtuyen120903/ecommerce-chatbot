export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, Username, userEmail, category, conversationId, timestamp } = body

    // Validate required fields
    if (!message || !category) {
      return Response.json(
        {
          success: false,
          response: "Missing required fields: message and category are required.",
        },
        { status: 400 },
      )
    }

    // Correct webhook URL
    const baseWebhookUrl = "https://n8ntina.onegroup.id.vn/webhook/baa63860-e324-4ac6-b16e-c6deabcc3872"

    // Category-specific n8n webhook URLs
    const n8nWebhookUrls = {
      digital: baseWebhookUrl,
      clothes: baseWebhookUrl,
      food: baseWebhookUrl,
      orders: baseWebhookUrl,
    }

    // Get the appropriate webhook URL for the category
    const webhookUrl = n8nWebhookUrls[category as keyof typeof n8nWebhookUrls]

    if (!webhookUrl) {
      return Response.json(
        {
          success: false,
          response: `Unsupported category: ${category}. Please select a valid category.`,
        },
        { status: 400 },
      )
    }

    // Send to category-specific n8n webhook
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      console.log(`Sending to ${category} n8n webhook:`, { message, category, conversationId })

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json; charset=utf-8", // Explicitly request JSON with UTF-8
        },
        body: JSON.stringify({
          userMessage: message,
          userEmail: userEmail,
          category,
          conversationId,
          timestamp,
          source: "customer-support-chat",
          botType: `${category}-specialist`,
          context: getCategoryContext(category),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Log response headers for debugging
      console.log(`${category} webhook response headers:`, Object.fromEntries(response.headers.entries()))

      // Check if the response is JSON based on Content-Type
      const contentType = response.headers.get("Content-Type") || ""
      const isJson = contentType.includes("application/json")

      if (response.ok) {
        let aiResponse = ""

        // Try to parse as JSON if Content-Type indicates JSON
        if (isJson) {
          try {
            const data = await response.json()
            console.log(`${category} bot response:`, data)

            // Handle the specific response format from your n8n workflow
            if (Array.isArray(data) && data.length > 0) {
              if (data[0].output) {
                aiResponse = data[0].output
              } else if (data[0].response) {
                aiResponse = data[0].response
              } else if (typeof data[0] === "string") {
                aiResponse = data[0]
              }
            } else if (data.output) {
              aiResponse = data.output
            } else if (data.response) {
              aiResponse = data.response
            } else if (typeof data === "string") {
              aiResponse = data
            } else {
              aiResponse = getCategorySpecificFallback(category, "processing")
            }
          } catch (jsonError) {
            console.error(`${category} JSON parsing error:`, jsonError)
            // Fallback to text if JSON parsing fails
            const text = await response.text()
            aiResponse = text || getCategorySpecificFallback(category, "processing")
          }
        } else {
          // If not JSON, treat as plain text
          const text = await response.text()
          console.log(`${category} non-JSON response:`, text)
          aiResponse = text || getCategorySpecificFallback(category, "processing")
        }

        // Ensure we have a valid response
        if (!aiResponse || aiResponse.trim() === "") {
          aiResponse = getCategorySpecificFallback(category, "processing")
        }

        return Response.json({
          success: true,
          response: aiResponse,
          botType: `${category}-specialist`,
          webhookUrl: webhookUrl,
        })
      } else {
        console.error(`${category} n8n webhook returned status: ${response.status}`)
        const errorText = await response.text()
        console.error(`${category} error response:`, errorText)

        let errorDetails = errorText
        if (isJson) {
          try {
            const errorData = JSON.parse(errorText)
            errorDetails = errorData.message || errorText
          } catch {}
        }

        if (response.status === 404) {
          if (errorDetails.includes("not registered") || errorDetails.includes("test mode")) {
            console.log(`${category} webhook not active, using intelligent fallback`)
            return Response.json({
              success: true,
              response: getCategorySpecificFallback(category, "webhook_not_active"),
              botType: `${category}-specialist-fallback`,
              note: "Webhook not active - using intelligent fallback response",
            })
          } else {
            console.log(`${category} endpoint not found, using fallback response`)
            return Response.json({
              success: true,
              response: getCategorySpecificFallback(category, "endpoint_not_found"),
              botType: `${category}-specialist-fallback`,
            })
          }
        }

        throw new Error(`Webhook returned status: ${response.status} - ${errorDetails}`)
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.error(`${category} n8n webhook timeout`)
        return Response.json({
          success: true,
          response: getCategorySpecificFallback(category, "timeout"),
        })
      } else {
        console.error(`${category} n8n webhook fetch error:`, fetchError)
        throw fetchError
      }
    }
  } catch (error) {
    console.error("N8N webhook error:", error)

    const { category } = await req.json().catch(() => ({ category: "general" }))

    return Response.json({
      success: true,
      response: getCategorySpecificFallback(category, "error"),
      note: "Using fallback response due to webhook error",
    })
  }
}

function getCategoryContext(category: string): string {
  const contexts = {
    digital:
      "You are a digital products specialist. Help with software, digital downloads, licenses, online services, apps, and digital content.",
    clothes:
      "You are a fashion and clothing specialist. Help with sizing, materials, styles, fit, care instructions, and fashion advice.",
    food: "You are a food and beverage specialist. Help with menu items, ingredients, dietary restrictions, nutrition, and delivery options.",
    orders:
      "You are an order management specialist. Help with order tracking, shipping, returns, exchanges, refunds, and delivery status. When users ask about specific orders, ask for their order number. For order numbers, use format #12345. Provide detailed information about shipping, delivery times, and return policies.",
  }

  return contexts[category as keyof typeof contexts] || "You are a helpful customer service assistant."
}

function getCategorySpecificFallback(
  category: string,
  type: "processing" | "timeout" | "error" | "endpoint_not_found" | "webhook_not_active",
): string {
  const fallbacks = {
    digital: {
      processing:
        "I'm analyzing your digital product inquiry. Our digital products specialist will provide you with detailed information shortly.",
      timeout:
        "I'm taking a bit longer to access our digital products database. Let me help you with some quick information while I work on a detailed response.",
      error:
        "I'm having trouble connecting to our digital products system. Our digital specialists can help with software, downloads, licenses, and digital services. What specific digital product are you interested in?",
      endpoint_not_found:
        "I'm your digital products specialist! I can help you with software, digital downloads, licenses, apps, and online services. While our advanced AI system is being set up, I'm here to assist you with any digital product questions. What can I help you find today?",
      webhook_not_active:
        "Hello! I'm your digital products specialist. I can help you with software recommendations, digital downloads, licensing questions, and technical support. Our AI system is currently in setup mode, but I'm ready to assist you right away. What digital product or service are you interested in?",
    },
    clothes: {
      processing:
        "I'm checking our fashion catalog for you. Our clothing specialist will help you with sizing, styles, and recommendations.",
      timeout:
        "I'm accessing our fashion database. While I work on that, I can help with general sizing questions or style recommendations.",
      error:
        "I'm having trouble connecting to our fashion system. Our clothing specialists can help with sizes, materials, styles, and fit recommendations. What clothing item are you looking for?",
      endpoint_not_found:
        "I'm your fashion and clothing specialist! I can help you with sizing guides, style recommendations, material information, and care instructions. While our advanced AI system is being configured, I'm ready to assist with any clothing questions. What fashion item can I help you with?",
      webhook_not_active:
        "Hi there! I'm your fashion and clothing specialist. I can help you with sizing guides, style advice, material questions, and care instructions. Our AI system is currently being activated, but I'm here to help you find the perfect clothing items. What are you shopping for today?",
    },
    food: {
      processing:
        "I'm checking our menu and food options for you. Our food & beverage specialist will provide you with fresh recommendations.",
      timeout:
        "I'm accessing our food database. While I prepare your response, I can help with menu questions or dietary preferences.",
      error:
        "I'm having trouble connecting to our food system. Our culinary specialists can help with menu items, ingredients, dietary restrictions, and delivery options. What food or beverage are you interested in?",
      endpoint_not_found:
        "I'm your food and beverage specialist! I can help you with our menu, ingredients, dietary options, nutrition information, and delivery details. While our advanced AI system is being prepared, I'm here to assist with any food-related questions. What can I help you with today?",
      webhook_not_active:
        "Welcome! I'm your food and beverage specialist. I can help you with menu recommendations, ingredient information, dietary accommodations, and delivery options. Our AI system is currently being prepared, but I'm ready to help you find delicious options right now. What are you craving today?",
    },
    orders: {
      processing:
        "I'm looking up your order information. Our order management specialist will provide you with the latest status update. If you have your order number handy, please share it so I can provide specific details about your order.",
      timeout:
        "I'm accessing our order tracking system. While I work on that, please have your order number ready for faster assistance. You can find your order number in your confirmation email or in your account's order history.",
      error:
        "I'm having trouble connecting to our order management system. Our order specialists can help with tracking, returns, exchanges, and delivery questions. Do you have your order number available? It should be in the format #12345.",
      endpoint_not_found:
        "I'm your order management specialist! I can help you track orders, process returns, handle exchanges, and answer delivery questions. While our advanced tracking system is being updated, I'm ready to assist with any order-related inquiries. Do you have an order number I can help you with? It should be in the format #12345.",
      webhook_not_active:
        "Hello! I'm your order management specialist. I can help you track your orders, process returns, handle exchanges, and answer shipping questions. Our AI system is currently being activated, but I'm here to help you with any order concerns right away. Do you have an order number or specific question about your purchase? For the fastest assistance, please provide your order number in the format #12345.",
    },
  }

  return (
    fallbacks[category as keyof typeof fallbacks]?.[type] ||
    "I'm here to help! While our AI system is being activated, I'm ready to assist you with your questions. How can I help you today?"
  )
}
