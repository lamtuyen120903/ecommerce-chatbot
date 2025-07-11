export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userEmail,
      category,
      limit = 6,
      preferences = [],
      previousPurchases = [],
    } = body;

    // Validate required fields
    if (!userEmail || !category) {
      return Response.json(
        {
          success: false,
          error:
            "Missing required fields: userEmail and category are required.",
        },
        { status: 400 }
      );
    }

    // Webhook URL for recommendations from environment variable
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_RECOMMENDATIONS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("N8N_RECOMMENDATIONS_WEBHOOK_URL env variable is not set");
      return Response.json(
        {
          success: false,
          error:
            "Server configuration error: missing recommendation webhook URL.",
        },
        { status: 500 }
      );
    }

    // Send to n8n webhook
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      console.log(`Sending recommendation request for ${category}:`, {
        userEmail,
        category,
        limit,
      });

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          userEmail,
          category,
          limit,
          preferences,
          previousPurchases,
          timestamp: new Date().toISOString(),
          source: "product-recommendations",
          action: "get_recommendations",
          context: getRecommendationContext(category),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`Recommendation response for ${category}:`, data);

        // Handle the response format from n8n
        let products = [];
        let reason = "Personalized recommendations for you";

        // Handle the new Vietnamese format
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];

          // Check if it's the new Vietnamese format
          if (
            firstItem.content &&
            firstItem.content.data &&
            Array.isArray(firstItem.content.data)
          ) {
            products = parseVietnameseProducts(
              firstItem.content.data,
              category
            );
            reason = "Sản phẩm được đề xuất cho bạn";
          } else if (firstItem.output) {
            try {
              const parsed = JSON.parse(firstItem.output);
              if (parsed.data && Array.isArray(parsed.data)) {
                products = parseVietnameseProducts(parsed.data, category);
                reason = "Sản phẩm được đề xuất cho bạn";
              } else if (parsed.products) {
                products = parsed.products;
                reason = parsed.reason || reason;
              }
            } catch {
              products = getFallbackProducts(category);
            }
          } else if (firstItem.products) {
            products = firstItem.products;
            reason = firstItem.reason || reason;
          }
        } else if (
          data.content &&
          data.content.data &&
          Array.isArray(data.content.data)
        ) {
          products = parseVietnameseProducts(data.content.data, category);
          reason = "Sản phẩm được đề xuất cho bạn";
        } else if (data.data && Array.isArray(data.data)) {
          products = parseVietnameseProducts(data.data, category);
          reason = "Sản phẩm được đề xuất cho bạn";
        } else if (data.products) {
          products = data.products;
          reason = data.reason || reason;
        } else if (data.output) {
          try {
            const parsed = JSON.parse(data.output);
            if (parsed.data && Array.isArray(parsed.data)) {
              products = parseVietnameseProducts(parsed.data, category);
              reason = "Sản phẩm được đề xuất cho bạn";
            } else if (parsed.products) {
              products = parsed.products;
              reason = parsed.reason || reason;
            }
          } catch {
            products = getFallbackProducts(category);
          }
        }

        return Response.json({
          success: true,
          products: products.slice(0, limit),
          category,
          reason,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.error(
          `Recommendation webhook returned status: ${response.status}`
        );
        throw new Error(`Webhook returned status: ${response.status}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`Recommendation webhook error:`, fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("Recommendation API error:", error);

    // Return fallback recommendations on error
    const { category = "digital" } = await req
      .json()
      .catch(() => ({ category: "digital" }));

    return Response.json({
      success: false,
      products: getFallbackProducts(category),
      category,
      reason: "Popular items you might like",
      timestamp: new Date().toISOString(),
      note: "Using fallback recommendations due to API error",
    });
  }
}

function parseVietnameseProducts(data: any[], category: string) {
  return data.map((item, index) => {
    // Parse Vietnamese price format (remove VND and convert to number)
    const priceString = item.price.replace(/[^\d,]/g, "").replace(/,/g, "");
    const price = Number.parseInt(priceString) / 1000; // Convert to thousands for display

    // Generate a unique ID
    const id = `vn-${category}-${index + 1}`;

    // Extract product name and create description
    const name = item.product_name;
    const description = generateDescription(name, category);

    // Generate rating and review count
    const rating = 4.0 + Math.random() * 1.0; // Random rating between 4.0-5.0
    const reviewCount = Math.floor(Math.random() * 1000) + 100; // Random reviews 100-1100

    return {
      id,
      name,
      description,
      price,
      image: item.image_url,
      category,
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal
      reviewCount,
      tags: generateTags(name, category),
      inStock: true,
      productUrl: item.product_url,
    };
  });
}

function generateDescription(name: string, category: string): string {
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
  };

  const categoryDescriptions =
    descriptions[category as keyof typeof descriptions] || descriptions.digital;

  const desc: any = categoryDescriptions; // cast for flexible key access

  if (name.toLowerCase().includes("tab")) {
    return desc.tablet || desc.default;
  } else if (
    name.toLowerCase().includes("pixel") ||
    name.toLowerCase().includes("phone")
  ) {
    return desc.phone || desc.default;
  } else if (
    name.toLowerCase().includes("wf") ||
    name.toLowerCase().includes("headphone")
  ) {
    return desc.headphone || desc.default;
  }

  return desc.default;
}

function generateTags(name: string, category: string): string[] {
  const baseTags = {
    digital: ["Technology", "Electronics"],
    clothes: ["Fashion", "Style"],
    food: ["Food", "Gourmet"],
    orders: ["Service", "Support"],
  };

  const tags = [
    ...(baseTags[category as keyof typeof baseTags] || baseTags.digital),
  ];

  // Add specific tags based on product name
  if (name.toLowerCase().includes("samsung")) tags.push("Samsung");
  if (name.toLowerCase().includes("sony")) tags.push("Sony");
  if (name.toLowerCase().includes("google")) tags.push("Google");
  if (name.toLowerCase().includes("tab")) tags.push("Tablet");
  if (name.toLowerCase().includes("pixel")) tags.push("Smartphone");
  if (name.toLowerCase().includes("wf")) tags.push("Wireless", "Audio");

  return tags;
}

// Keep existing functions unchanged
function getRecommendationContext(category: string): string {
  const contexts = {
    digital:
      "Generate product recommendations for digital products including software, apps, digital downloads, online services, and digital content.",
    clothes:
      "Generate product recommendations for clothing and fashion items including shirts, pants, shoes, accessories, and fashion items.",
    food: "Generate product recommendations for food and beverage items including snacks, drinks, gourmet items, and specialty foods.",
    orders:
      "Generate product recommendations for order-related services including shipping upgrades, gift wrapping, and additional services.",
  };

  return contexts[category as keyof typeof contexts] || contexts.digital;
}

function getFallbackProducts(category: string) {
  const fallbackProducts = {
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
    ],
  };

  return (
    fallbackProducts[category as keyof typeof fallbackProducts] ||
    fallbackProducts.digital
  );
}
