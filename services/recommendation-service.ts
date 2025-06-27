export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviewCount: number
  discount?: number
  tags: string[]
  inStock: boolean
  productUrl?: string // Add product URL field
}

export interface RecommendationResponse {
  success: boolean
  products: Product[]
  category: string
  reason: string
  timestamp: string
}

export interface RecommendationRequest {
  userEmail: string
  category: string
  limit?: number
  preferences?: string[]
  previousPurchases?: string[]
}

export interface VietnameseProduct {
  product_name: string
  image_url: string
  price: string
  product_url: string
}

export class RecommendationService {
  private static readonly WEBHOOK_URL = "https://n8ntina.onegroup.id.vn/webhook/c175892b-d1e4-4479-af3c-785c1dffead3"
  private static readonly TIMEOUT = 60000 // 60 seconds

  static async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT)

      console.log("Fetching recommendations for category:", request.category, "user:", request.userEmail)

      const response = await fetch(this.WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userEmail: request.userEmail,
          category: request.category,
          limit: request.limit || 6,
          preferences: request.preferences || [],
          previousPurchases: request.previousPurchases || [],
          timestamp: new Date().toISOString(),
          source: "product-recommendations",
          action: "get_recommendations",
          triggerType: "category_selection", // Add trigger type for tracking
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        console.log("Recommendation response for", request.category, ":", data)

        // Handle different response formats from n8n
        let products: Product[] = []
        let reason = "Personalized recommendations for you"

        // Parse the response data (keep existing parsing logic)
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0]

          if (firstItem.content && firstItem.content.data && Array.isArray(firstItem.content.data)) {
            products = this.parseVietnameseProducts(firstItem.content.data, request.category)
            reason = "Sản phẩm được đề xuất cho bạn"
          } else if (firstItem.output) {
            try {
              const parsed = JSON.parse(firstItem.output)
              if (parsed.data && Array.isArray(parsed.data)) {
                products = this.parseVietnameseProducts(parsed.data, request.category)
                reason = "Sản phẩm được đề xuất cho bạn"
              } else if (parsed.products) {
                products = parsed.products
                reason = parsed.reason || reason
              }
            } catch {
              products = this.getFallbackRecommendations(request.category)
            }
          } else if (firstItem.products) {
            products = firstItem.products
            reason = firstItem.reason || reason
          }
        } else if (data.content && data.content.data && Array.isArray(data.content.data)) {
          products = this.parseVietnameseProducts(data.content.data, request.category)
          reason = "Sản phẩm được đề xuất cho bạn"
        } else if (data.data && Array.isArray(data.data)) {
          products = this.parseVietnameseProducts(data.data, request.category)
          reason = "Sản phẩm được đề xuất cho bạn"
        } else if (data.products) {
          products = data.products
          reason = data.reason || reason
        } else if (data.output) {
          try {
            const parsed = JSON.parse(data.output)
            if (parsed.data && Array.isArray(parsed.data)) {
              products = this.parseVietnameseProducts(parsed.data, request.category)
              reason = "Sản phẩm được đề xuất cho bạn"
            } else if (parsed.products) {
              products = parsed.products
              reason = parsed.reason || reason
            }
          } catch {
            products = this.getFallbackRecommendations(request.category)
          }
        }

        // If no products received, use fallback
        if (!products || products.length === 0) {
          products = this.getFallbackRecommendations(request.category)
          reason = "Popular items in " + request.category
        }

        return {
          success: true,
          products: products.slice(0, request.limit || 6),
          category: request.category,
          reason,
          timestamp: new Date().toISOString(),
        }
      } else {
        console.error("Recommendation API error:", response.status)
        throw new Error(`API returned status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching recommendations for", request.category, ":", error)

      // Return fallback recommendations on error
      return {
        success: false,
        products: this.getFallbackRecommendations(request.category),
        category: request.category,
        reason: "Popular items you might like",
        timestamp: new Date().toISOString(),
      }
    }
  }

  private static parseVietnameseProducts(data: VietnameseProduct[], category: string): Product[] {
    return data.map((item, index) => {
      // Parse Vietnamese price format (remove VND and convert to number)
      const priceString = item.price.replace(/[^\d,]/g, "").replace(/,/g, "")
      const price = Number.parseInt(priceString) / 1000 // Convert to thousands for display

      // Generate a unique ID
      const id = `vn-${category}-${index + 1}`

      // Extract product name and create description
      const name = item.product_name
      const description = this.generateDescription(name, category)

      // Generate rating and review count
      const rating = 4.0 + Math.random() * 1.0 // Random rating between 4.0-5.0
      const reviewCount = Math.floor(Math.random() * 1000) + 100 // Random reviews 100-1100

      return {
        id,
        name,
        description,
        price,
        image: item.image_url,
        category,
        rating: Math.round(rating * 10) / 10, // Round to 1 decimal
        reviewCount,
        tags: this.generateTags(name, category),
        inStock: true,
        productUrl: item.product_url,
      }
    })
  }

  private static generateDescription(name: string, category: string): string {
    const descriptions = {
      digital: {
        tablet: "Máy tính bảng cao cấp với hiệu năng mạnh mẽ và màn hình sắc nét",
        phone: "Điện thoại thông minh với camera chất lượng cao và pin bền bỉ",
        headphone: "Tai nghe không dây với chất lượng âm thanh tuyệt vời",
        default: "Sản phẩm công nghệ chất lượng cao với tính năng hiện đại",
      },
      clothes: {
        default: "Sản phẩm thời trang chất lượng cao với thiết kế hiện đại",
      },
      food: {
        default: "Sản phẩm thực phẩm tươi ngon và chất lượng",
      },
      orders: {
        default: "Dịch vụ hỗ trợ đơn hàng chuyên nghiệp",
      },
    }

    const categoryDescriptions = descriptions[category as keyof typeof descriptions] || descriptions.digital

    if (name.toLowerCase().includes("tab")) {
      return categoryDescriptions.tablet || categoryDescriptions.default
    } else if (name.toLowerCase().includes("pixel") || name.toLowerCase().includes("phone")) {
      return categoryDescriptions.phone || categoryDescriptions.default
    } else if (name.toLowerCase().includes("wf") || name.toLowerCase().includes("headphone")) {
      return categoryDescriptions.headphone || categoryDescriptions.default
    }

    return categoryDescriptions.default
  }

  private static generateTags(name: string, category: string): string[] {
    const baseTags = {
      digital: ["Technology", "Electronics"],
      clothes: ["Fashion", "Style"],
      food: ["Food", "Gourmet"],
      orders: ["Service", "Support"],
    }

    const tags = [...(baseTags[category as keyof typeof baseTags] || baseTags.digital)]

    // Add specific tags based on product name
    if (name.toLowerCase().includes("samsung")) tags.push("Samsung")
    if (name.toLowerCase().includes("sony")) tags.push("Sony")
    if (name.toLowerCase().includes("google")) tags.push("Google")
    if (name.toLowerCase().includes("tab")) tags.push("Tablet")
    if (name.toLowerCase().includes("pixel")) tags.push("Smartphone")
    if (name.toLowerCase().includes("wf")) tags.push("Wireless", "Audio")

    return tags
  }

  private static getFallbackRecommendations(category: string): Product[] {
    const fallbackProducts: Record<string, Product[]> = {
      digital: [
        {
          id: "dig-1",
          name: "Premium Photo Editor Pro",
          description: "Professional photo editing software with AI features",
          price: 89.99,
          originalPrice: 129.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "digital",
          rating: 4.8,
          reviewCount: 1247,
          discount: 31,
          tags: ["Software", "Photography", "AI"],
          inStock: true,
        },
        {
          id: "dig-2",
          name: "Cloud Storage 1TB",
          description: "Secure cloud storage with advanced sync features",
          price: 9.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "digital",
          rating: 4.6,
          reviewCount: 892,
          tags: ["Storage", "Cloud", "Backup"],
          inStock: true,
        },
        {
          id: "dig-3",
          name: "VPN Premium Service",
          description: "Secure VPN with global servers and fast speeds",
          price: 12.99,
          originalPrice: 19.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "digital",
          rating: 4.7,
          reviewCount: 2156,
          discount: 35,
          tags: ["Security", "Privacy", "VPN"],
          inStock: true,
        },
      ],
      clothes: [
        {
          id: "clo-1",
          name: "Premium Cotton T-Shirt",
          description: "Soft, comfortable cotton t-shirt in multiple colors",
          price: 24.99,
          originalPrice: 34.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "clothes",
          rating: 4.5,
          reviewCount: 567,
          discount: 29,
          tags: ["Cotton", "Casual", "Comfortable"],
          inStock: true,
        },
        {
          id: "clo-2",
          name: "Denim Jacket Classic",
          description: "Timeless denim jacket with modern fit",
          price: 79.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "clothes",
          rating: 4.7,
          reviewCount: 234,
          tags: ["Denim", "Jacket", "Classic"],
          inStock: true,
        },
        {
          id: "clo-3",
          name: "Running Sneakers Pro",
          description: "High-performance running shoes with cushioning",
          price: 129.99,
          originalPrice: 159.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "clothes",
          rating: 4.8,
          reviewCount: 1089,
          discount: 19,
          tags: ["Shoes", "Running", "Sports"],
          inStock: true,
        },
      ],
      food: [
        {
          id: "foo-1",
          name: "Organic Coffee Beans",
          description: "Premium organic coffee beans from sustainable farms",
          price: 18.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "food",
          rating: 4.9,
          reviewCount: 445,
          tags: ["Coffee", "Organic", "Premium"],
          inStock: true,
        },
        {
          id: "foo-2",
          name: "Artisan Chocolate Box",
          description: "Handcrafted chocolates with exotic flavors",
          price: 32.99,
          originalPrice: 42.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "food",
          rating: 4.8,
          reviewCount: 678,
          discount: 23,
          tags: ["Chocolate", "Artisan", "Gift"],
          inStock: true,
        },
        {
          id: "foo-3",
          name: "Gourmet Tea Collection",
          description: "Premium tea collection from around the world",
          price: 24.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "food",
          rating: 4.6,
          reviewCount: 312,
          tags: ["Tea", "Gourmet", "Collection"],
          inStock: true,
        },
      ],
      orders: [
        {
          id: "ord-1",
          name: "Express Shipping Upgrade",
          description: "Upgrade your order to express shipping",
          price: 9.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "orders",
          rating: 4.4,
          reviewCount: 156,
          tags: ["Shipping", "Express", "Fast"],
          inStock: true,
        },
        {
          id: "ord-2",
          name: "Gift Wrapping Service",
          description: "Professional gift wrapping for your orders",
          price: 4.99,
          image: "/placeholder.svg?height=200&width=200",
          category: "orders",
          rating: 4.7,
          reviewCount: 89,
          tags: ["Gift", "Wrapping", "Service"],
          inStock: true,
        },
      ],
    }

    return fallbackProducts[category] || fallbackProducts.digital
  }
}
