import Product from "../models/Product.js";

const getAIServiceConfig = () => {
  return {
    url: process.env.AI_SERVICE_URL || "http://localhost:8000",
    internalKey: process.env.AI_INTERNAL_KEY || "long-random-string",
  };
};

/**
 * @desc    Secure AI Chatbot Endpoint
 * @route   POST /api/ai/chat
 * @access  Private (Authenticated users: farmer, consumer, admin)
 */
export const chatWithAI = async (req, res) => {
  try {
    // 1. Strict Authentication & Role Derivation
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to access FarmEasy AI.",
      });
    }

    // Role MUST come exclusively from verified JWT authentication context
    const rawRole = (req.user.role || "consumer").toLowerCase();
    const role = rawRole === "user" ? "consumer" : rawRole;

    if (!["farmer", "consumer", "admin"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${role}' is not authorized to access AI services.`,
      });
    }

    // 2. Validate Question / Message
    const rawMessage = req.body.message ?? req.body.question;
    if (!rawMessage || typeof rawMessage !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question or message string.",
      });
    }

    const message = rawMessage.trim();
    if (message.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Question must be at least 2 characters long.",
      });
    }

    if (message.length > 1500) {
      return res.status(400).json({
        success: false,
        message: "Question exceeds maximum allowed limit of 1500 characters.",
      });
    }

    // 3. Sanitize Optional Conversation History (bound to last 6 messages)
    let sanitizedHistory = [];
    if (Array.isArray(req.body.history)) {
      sanitizedHistory = req.body.history
        .slice(-6)
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.content === "string" &&
            ["user", "assistant", "ai", "bot"].includes((item.role || "").toLowerCase())
        )
        .map((item) => ({
          role: ["assistant", "ai", "bot"].includes(item.role.toLowerCase()) ? "assistant" : "user",
          content: String(item.content).slice(0, 1000),
        }));
    }

    // 4. Grounding Context: Fetch Live In-Stock Products for Consumer Queries
    let catalogItems = null;
    const isConsumer = role === "consumer";
    const mentionsProduce = /(buy|price|cost|fresh|vegetable|fruit|produce|stock|available|order|kg|crop)/i.test(message);

    if (isConsumer || mentionsProduce) {
      try {
        const products = await Product.find({ isAvailable: true })
          .select("name category price unit quantity")
          .limit(8)
          .lean();

        catalogItems = products.map((p) => ({
          name: p.name,
          category: p.category || "Produce",
          price: typeof p.price === "number" ? p.price : null,
          unit: p.unit || "kg",
          quantity: typeof p.quantity === "number" ? p.quantity : 0,
        }));
      } catch (dbErr) {
        console.warn("Could not query live products for AI catalog grounding:", dbErr.message);
        catalogItems = null;
      }
    }

    // 5. Secure Backend-to-AI-Service Communication
    const { url, internalKey } = getAIServiceConfig();
    const endpoint = `${url.replace(/\/+$/, "")}/chat`;

    const payload = {
      question: message,
      role,
      history: sanitizedHistory,
      catalog: catalogItems,
    };

    let aiResponse;
    try {
      aiResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": internalKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(35000), // 35 second timeout
      });
    } catch (networkError) {
      if (networkError.name === "TimeoutError") {
        return res.status(504).json({
          success: false,
          message: "The FarmEasy AI service took too long to respond. Please try again with a more specific question.",
        });
      }
      console.error("AI Service Network Connection Failure:", networkError.message);
      return res.status(503).json({
        success: false,
        message: "The FarmEasy AI service is currently unavailable. Please verify the AI service is running.",
      });
    }

    // 6. Handle AI Service HTTP Responses
    if (!aiResponse.ok) {
      const status = aiResponse.status;
      let errorDetail = "";
      try {
        const errorJson = await aiResponse.json();
        errorDetail = errorJson.detail || "";
      } catch {
        // Response was not JSON
      }

      console.error(`AI Service HTTP Error ${status}: ${errorDetail}`);

      if (status === 429) {
        return res.status(429).json({
          success: false,
          message: "AI query rate limit reached. Please wait a moment and try again.",
        });
      }

      if (status === 503) {
        return res.status(503).json({
          success: false,
          message: errorDetail.includes("Index not")
            ? "The agricultural knowledgebase is being prepared. Please try again shortly."
            : "The FarmEasy AI service is temporarily busy. Please try again in a few moments.",
        });
      }

      return res.status(502).json({
        success: false,
        message: "Failed to generate an AI response. Please try again shortly.",
      });
    }

    const data = await aiResponse.json();

    // 7. Return Clean, Consistent Response to React
    return res.status(200).json({
      success: true,
      answer: data.answer || "No response generated.",
      sources: Array.isArray(data.sources) ? data.sources : [],
      role,
    });
  } catch (error) {
    console.error("Internal Server Error in chatWithAI controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while processing your AI request.",
    });
  }
};

/**
 * @desc    Health Check for AI Service
 * @route   GET /api/ai/health
 * @access  Private
 */
export const getAIHealth = async (req, res) => {
  try {
    const { url } = getAIServiceConfig();
    const endpoint = `${url.replace(/\/+$/, "")}/health`;

    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        status: "UNHEALTHY",
        message: "AI service responded with an error.",
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      status: "HEALTHY",
      data,
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: "UNAVAILABLE",
      message: "Could not connect to FarmEasy AI service.",
    });
  }
};
