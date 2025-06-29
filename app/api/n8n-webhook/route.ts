export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      message,
      Username,
      userEmail,
      category,
      conversationId,
      timestamp,
    } = body;

    // Validate required fields
    if (!message || !category) {
      return Response.json(
        {
          success: false,
          response:
            "Missing required fields: message and category are required.",
        },
        { status: 400 }
      );
    }

    // Correct webhook URL
    const baseWebhookUrl =
      "https://n8ntina.onegroup.id.vn/webhook/baa63860-e324-4ac6-b16e-c6deabcc3872";

    // Category-specific n8n webhook URLs
    const n8nWebhookUrls = {
      digital: baseWebhookUrl,
      clothes: baseWebhookUrl,
      food: baseWebhookUrl,
      orders: baseWebhookUrl,
    };

    // Get the appropriate webhook URL for the category
    const webhookUrl = n8nWebhookUrls[category as keyof typeof n8nWebhookUrls];

    if (!webhookUrl) {
      return Response.json(
        {
          success: false,
          response: `Unsupported category: ${category}. Please select a valid category.`,
        },
        { status: 400 }
      );
    }

    // Send to category-specific n8n webhook
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      console.log(`Sending to ${category} n8n webhook:`, {
        message,
        category,
        conversationId,
      });

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
      });

      clearTimeout(timeoutId);

      // Log response headers for debugging
      console.log(
        `${category} webhook response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      // Check if the response is JSON based on Content-Type
      const contentType = response.headers.get("Content-Type") || "";
      const isJson = contentType.includes("application/json");

      if (response.ok) {
        let aiResponse = "";

        // Try to parse as JSON if Content-Type indicates JSON
        if (isJson) {
          try {
            const data = await response.json();
            console.log(`${category} bot response:`, data);

            // Handle the specific response format from your n8n workflow
            if (Array.isArray(data) && data.length > 0) {
              if (data[0].output) {
                aiResponse = data[0].output;
              } else if (data[0].response) {
                aiResponse = data[0].response;
              } else if (typeof data[0] === "string") {
                aiResponse = data[0];
              }
            } else if (data.output) {
              aiResponse = data.output;
            } else if (data.response) {
              aiResponse = data.response;
            } else if (typeof data === "string") {
              aiResponse = data;
            } else {
              aiResponse = getCategorySpecificFallback(category, "processing");
            }
          } catch (jsonError) {
            console.error(`${category} JSON parsing error:`, jsonError);
            // Fallback to text if JSON parsing fails
            const text = await response.text();
            aiResponse =
              text || getCategorySpecificFallback(category, "processing");
          }
        } else {
          // If not JSON, treat as plain text
          const text = await response.text();
          console.log(`${category} non-JSON response:`, text);
          aiResponse =
            text || getCategorySpecificFallback(category, "processing");
        }

        // Ensure we have a valid response
        if (!aiResponse || aiResponse.trim() === "") {
          aiResponse = getCategorySpecificFallback(category, "processing");
        }

        return Response.json({
          success: true,
          response: aiResponse,
          botType: `${category}-specialist`,
          webhookUrl: webhookUrl,
        });
      } else {
        console.error(
          `${category} n8n webhook returned status: ${response.status}`
        );
        const errorText = await response.text();
        console.error(`${category} error response:`, errorText);

        let errorDetails = errorText;
        if (isJson) {
          try {
            const errorData = JSON.parse(errorText);
            errorDetails = errorData.message || errorText;
          } catch {}
        }

        if (response.status === 404) {
          if (
            errorDetails.includes("not registered") ||
            errorDetails.includes("test mode")
          ) {
            console.log(
              `${category} webhook not active, using intelligent fallback`
            );
            return Response.json({
              success: true,
              response: getCategorySpecificFallback(
                category,
                "webhook_not_active"
              ),
              botType: `${category}-specialist-fallback`,
              note: "Webhook not active - using intelligent fallback response",
            });
          } else {
            console.log(
              `${category} endpoint not found, using fallback response`
            );
            return Response.json({
              success: true,
              response: getCategorySpecificFallback(
                category,
                "endpoint_not_found"
              ),
              botType: `${category}-specialist-fallback`,
            });
          }
        }

        throw new Error(
          `Webhook returned status: ${response.status} - ${errorDetails}`
        );
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        console.error(`${category} n8n webhook timeout`);
        return Response.json({
          success: true,
          response: getCategorySpecificFallback(category, "timeout"),
        });
      } else {
        console.error(`${category} n8n webhook fetch error:`, fetchError);
        throw fetchError;
      }
    }
  } catch (error) {
    console.error("N8N webhook error:", error);

    const { category } = await req
      .json()
      .catch(() => ({ category: "general" }));

    return Response.json({
      success: true,
      response: getCategorySpecificFallback(category, "error"),
      note: "Using fallback response due to webhook error",
    });
  }
}

function getCategoryContext(category: string): string {
  const contexts = {
    digital:
      "Bạn là chuyên gia sản phẩm kỹ thuật số. Hỗ trợ về phần mềm, tải xuống kỹ thuật số, giấy phép, dịch vụ trực tuyến, ứng dụng và nội dung kỹ thuật số.",
    clothes:
      "Bạn là chuyên gia thời trang và quần áo. Hỗ trợ về kích thước, chất liệu, kiểu dáng, vừa vặn, hướng dẫn chăm sóc và tư vấn thời trang.",
    food: "Bạn là chuyên gia thực phẩm và đồ uống. Hỗ trợ về món ăn, thành phần, hạn chế ăn kiêng, dinh dưỡng và tùy chọn giao hàng.",
    orders:
      "Bạn là chuyên gia quản lý đơn hàng. Hỗ trợ theo dõi đơn hàng, vận chuyển, trả lại, đổi hàng, hoàn tiền và trạng thái giao hàng. Khi người dùng hỏi về đơn hàng cụ thể, hãy yêu cầu số đơn hàng của họ. Đối với số đơn hàng, sử dụng định dạng #12345. Cung cấp thông tin chi tiết về vận chuyển, thời gian giao hàng và chính sách trả lại.",
  };

  return (
    contexts[category as keyof typeof contexts] ||
    "Bạn là trợ lý dịch vụ khách hàng hữu ích."
  );
}

function getCategorySpecificFallback(
  category: string,
  type:
    | "processing"
    | "timeout"
    | "error"
    | "endpoint_not_found"
    | "webhook_not_active"
): string {
  const fallbacks = {
    digital: {
      processing:
        "Tôi đang phân tích yêu cầu sản phẩm kỹ thuật số của bạn. Chuyên gia sản phẩm kỹ thuật số của chúng tôi sẽ cung cấp thông tin chi tiết trong thời gian ngắn.",
      timeout:
        "Tôi đang mất nhiều thời gian hơn để truy cập cơ sở dữ liệu sản phẩm kỹ thuật số. Hãy để tôi giúp bạn với một số thông tin nhanh trong khi tôi làm việc trên phản hồi chi tiết.",
      error:
        "Tôi đang gặp khó khăn khi kết nối với hệ thống sản phẩm kỹ thuật số. Các chuyên gia kỹ thuật số của chúng tôi có thể giúp với phần mềm, tải xuống, giấy phép và dịch vụ kỹ thuật số. Bạn quan tâm đến sản phẩm kỹ thuật số cụ thể nào?",
      endpoint_not_found:
        "Tôi là chuyên gia sản phẩm kỹ thuật số của bạn! Tôi có thể giúp bạn với phần mềm, tải xuống kỹ thuật số, giấy phép, ứng dụng và dịch vụ trực tuyến. Trong khi hệ thống AI tiên tiến của chúng tôi đang được thiết lập, tôi ở đây để hỗ trợ bạn với bất kỳ câu hỏi nào về sản phẩm kỹ thuật số. Tôi có thể giúp bạn tìm gì hôm nay?",
      webhook_not_active:
        "Xin chào! Tôi là chuyên gia sản phẩm kỹ thuật số của bạn. Tôi có thể giúp bạn với khuyến nghị phần mềm, tải xuống kỹ thuật số, câu hỏi về giấy phép và hỗ trợ kỹ thuật. Hệ thống AI của chúng tôi hiện đang ở chế độ thiết lập, nhưng tôi sẵn sàng hỗ trợ bạn ngay lập tức. Bạn quan tâm đến sản phẩm hoặc dịch vụ kỹ thuật số nào?",
    },
    clothes: {
      processing:
        "Tôi đang kiểm tra danh mục thời trang cho bạn. Chuyên gia quần áo sẽ giúp bạn với kích thước, kiểu dáng và khuyến nghị.",
      timeout:
        "Tôi đang truy cập cơ sở dữ liệu thời trang. Trong khi tôi làm việc trên đó, tôi có thể giúp với câu hỏi về kích thước chung hoặc khuyến nghị kiểu dáng.",
      error:
        "Tôi đang gặp khó khăn khi kết nối với hệ thống thời trang. Các chuyên gia quần áo của chúng tôi có thể giúp với kích thước, chất liệu, kiểu dáng và khuyến nghị vừa vặn. Bạn đang tìm kiếm món quần áo nào?",
      endpoint_not_found:
        "Tôi là chuyên gia thời trang và quần áo của bạn! Tôi có thể giúp bạn với hướng dẫn kích thước, khuyến nghị kiểu dáng, thông tin chất liệu và hướng dẫn chăm sóc. Trong khi hệ thống AI tiên tiến của chúng tôi đang được cấu hình, tôi sẵn sàng hỗ trợ với bất kỳ câu hỏi nào về quần áo. Tôi có thể giúp bạn với món thời trang nào?",
      webhook_not_active:
        "Chào bạn! Tôi là chuyên gia thời trang và quần áo của bạn. Tôi có thể giúp bạn với hướng dẫn kích thước, tư vấn kiểu dáng, câu hỏi về chất liệu và hướng dẫn chăm sóc. Hệ thống AI của chúng tôi hiện đang được kích hoạt, nhưng tôi ở đây để giúp bạn tìm những món quần áo hoàn hảo. Bạn đang mua sắm gì hôm nay?",
    },
    food: {
      processing:
        "Tôi đang kiểm tra thực đơn và tùy chọn thực phẩm cho bạn. Chuyên gia thực phẩm & đồ uống sẽ cung cấp khuyến nghị tươi mới.",
      timeout:
        "Tôi đang truy cập cơ sở dữ liệu thực phẩm. Trong khi tôi chuẩn bị phản hồi, tôi có thể giúp với câu hỏi về thực đơn hoặc sở thích ăn kiêng.",
      error:
        "Tôi đang gặp khó khăn khi kết nối với hệ thống thực phẩm. Các chuyên gia ẩm thực của chúng tôi có thể giúp với món ăn, thành phần, hạn chế ăn kiêng và tùy chọn giao hàng. Bạn quan tâm đến thực phẩm hoặc đồ uống nào?",
      endpoint_not_found:
        "Tôi là chuyên gia thực phẩm và đồ uống của bạn! Tôi có thể giúp bạn với thực đơn, thành phần, tùy chọn ăn kiêng, thông tin dinh dưỡng và chi tiết giao hàng. Trong khi hệ thống AI tiên tiến của chúng tôi đang được chuẩn bị, tôi ở đây để hỗ trợ với bất kỳ câu hỏi nào liên quan đến thực phẩm. Tôi có thể giúp bạn gì hôm nay?",
      webhook_not_active:
        "Chào mừng! Tôi là chuyên gia thực phẩm và đồ uống của bạn. Tôi có thể giúp bạn với khuyến nghị thực đơn, thông tin thành phần, điều chỉnh ăn kiêng và tùy chọn giao hàng. Hệ thống AI của chúng tôi hiện đang được chuẩn bị, nhưng tôi sẵn sàng giúp bạn tìm những lựa chọn ngon miệng ngay bây giờ. Bạn đang thèm gì hôm nay?",
    },
    orders: {
      processing:
        "Tôi đang tìm kiếm thông tin đơn hàng của bạn. Chuyên gia quản lý đơn hàng sẽ cung cấp cập nhật trạng thái mới nhất. Nếu bạn có số đơn hàng, vui lòng chia sẻ để tôi có thể cung cấp chi tiết cụ thể về đơn hàng của bạn.",
      timeout:
        "Tôi đang truy cập hệ thống theo dõi đơn hàng. Trong khi tôi làm việc trên đó, vui lòng chuẩn bị số đơn hàng để được hỗ trợ nhanh hơn. Bạn có thể tìm số đơn hàng trong email xác nhận hoặc trong lịch sử đơn hàng tài khoản.",
      error:
        "Tôi đang gặp khó khăn khi kết nối với hệ thống quản lý đơn hàng. Các chuyên gia đơn hàng của chúng tôi có thể giúp với theo dõi, trả lại, đổi hàng và câu hỏi giao hàng. Bạn có số đơn hàng không? Nó nên ở định dạng #12345.",
      endpoint_not_found:
        "Tôi là chuyên gia quản lý đơn hàng của bạn! Tôi có thể giúp bạn theo dõi đơn hàng, xử lý trả lại, xử lý đổi hàng và trả lời câu hỏi giao hàng. Trong khi hệ thống theo dõi tiên tiến của chúng tôi đang được cập nhật, tôi sẵn sàng hỗ trợ với bất kỳ yêu cầu nào liên quan đến đơn hàng. Bạn có số đơn hàng tôi có thể giúp không? Nó nên ở định dạng #12345.",
      webhook_not_active:
        "Xin chào! Tôi là chuyên gia quản lý đơn hàng của bạn. Tôi có thể giúp bạn theo dõi đơn hàng, xử lý trả lại, xử lý đổi hàng và trả lời câu hỏi vận chuyển. Hệ thống AI của chúng tôi hiện đang được kích hoạt, nhưng tôi ở đây để giúp bạn với bất kỳ mối quan tâm nào về đơn hàng ngay lập tức. Bạn có số đơn hàng hoặc câu hỏi cụ thể về việc mua hàng không? Để được hỗ trợ nhanh nhất, vui lòng cung cấp số đơn hàng ở định dạng #12345.",
    },
  };

  return (
    fallbacks[category as keyof typeof fallbacks]?.[type] ||
    "Tôi ở đây để giúp! Trong khi hệ thống AI của chúng tôi đang được kích hoạt, tôi sẵn sàng hỗ trợ bạn với các câu hỏi. Tôi có thể giúp bạn gì hôm nay?"
  );
}
