const Groq = require("groq-sdk");

// Rate limiting configuration
const RATE_LIMITS = {
  perUser: {
    maxMessages: 20, // Max messages per user per hour
    timeWindow: 60 * 60 * 1000, // 1 hour in milliseconds
  },
  global: {
    maxMessages: 100, // Max global messages per hour
    timeWindow: 60 * 60 * 1000, // 1 hour
  },
};

// In-memory rate limit tracking (use Redis for production)
const userMessageCounts = new Map();
let globalMessageCount = 0;
let globalResetTime = Date.now() + RATE_LIMITS.global.timeWindow;

/**
 * Check and update rate limits
 */
function checkRateLimit(userId) {
  const now = Date.now();

  // Reset global counter if time window expired
  if (now >= globalResetTime) {
    globalMessageCount = 0;
    globalResetTime = now + RATE_LIMITS.global.timeWindow;
  }

  // Check global limit
  if (globalMessageCount >= RATE_LIMITS.global.maxMessages) {
    return {
      allowed: false,
      reason: "Global rate limit exceeded. Please try again later.",
    };
  }

  // Get or initialize user tracking
  let userTracking = userMessageCounts.get(userId);
  if (!userTracking || now >= userTracking.resetTime) {
    userTracking = {
      count: 0,
      resetTime: now + RATE_LIMITS.perUser.timeWindow,
    };
    userMessageCounts.set(userId, userTracking);
  }

  // Check user limit
  if (userTracking.count >= RATE_LIMITS.perUser.maxMessages) {
    const minutesLeft = Math.ceil((userTracking.resetTime - now) / 60000);
    return {
      allowed: false,
      reason: `You've reached your message limit (${RATE_LIMITS.perUser.maxMessages} messages/hour). Try again in ${minutesLeft} minutes.`,
    };
  }

  // Increment counters
  userTracking.count++;
  globalMessageCount++;

  return { allowed: true };
}

/**
 * Build system prompt based on context
 */
function buildSystemPrompt(contextData) {
  let prompt = `You are an AI career advisor assistant for a Skill Gap Analyzer platform. Your role is to:
- Help users understand their skill gaps and how to improve
- Provide career guidance and learning path recommendations
- Answer questions about skills, courses, and career development
- Be encouraging, supportive, and provide actionable advice

Guidelines:
- Keep responses concise (2-4 paragraphs max)
- Be friendly and conversational
- Focus on practical, actionable advice
- If asked about specific skills, provide learning resources
- If you don't know something, be honest`;

  if (contextData) {
    try {
      const context = JSON.parse(contextData);

      if (context.analysisResult) {
        const { matchedSkills, missingSkills, matchPercentage, jobRole } =
          context.analysisResult;

        prompt += `\n\nContext about this user:
- Job Role Target: ${jobRole || "Not specified"}
- Match Percentage: ${matchPercentage || "N/A"}%
- Matched Skills: ${matchedSkills?.map((s) => s.skill).join(", ") || "None"}
- Missing Skills: ${missingSkills?.map((s) => s.skill).join(", ") || "None"}

Use this context to provide personalized advice when relevant.`;
      }
    } catch (e) {
      // Invalid context data, ignore
    }
  }

  return prompt;
}

/**
 * Build conversation history for context
 */
function buildConversationHistory(messages, maxMessages = 5) {
  // Get last N messages for context (to keep token count manageable)
  const recentMessages = messages.slice(-maxMessages);

  return recentMessages
    .map(
      (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.message}`
    )
    .join("\n\n");
}

/**
 * Generate chat response using Gemini AI
 */
exports.generateChatResponse = async (
  userMessage,
  conversationHistory,
  contextData,
  userId
) => {
  // Check rate limits
  const rateLimitCheck = checkRateLimit(userId);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.reason);
  }

  // Validate input
  if (!userMessage || userMessage.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  // Limit message length
  if (userMessage.length > 2000) {
    throw new Error(
      "Message is too long. Please keep it under 2000 characters."
    );
  }

  const maxRetries = 2;
  let currentApiKey = process.env.CHATBOT_API_KEY;

  // Log API key status for verification
  console.log("🔑 API Key Check:");
  console.log("  - CHATBOT_API_KEY exists:", !!currentApiKey);
  console.log("  - Key length:", currentApiKey ? currentApiKey.length : 0);
  console.log(
    "  - Key prefix:",
    currentApiKey ? currentApiKey.substring(0, 15) + "..." : "N/A"
  );

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!currentApiKey)
        throw new Error("CHATBOT_API_KEY is not set in environment");

      console.log(`🤖 Attempt ${attempt}: Initializing Groq AI with API key`);

      // Initialize Groq client
      const groq = new Groq({
        apiKey: currentApiKey,
      });

      // Build system prompt with context
      const systemPrompt = buildSystemPrompt(contextData);

      // Build conversation history in Groq format
      const messages = [{ role: "system", content: systemPrompt }];

      // Add conversation history
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-5); // Last 5 messages
        for (const msg of recentHistory) {
          messages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.message,
          });
        }
      }

      // Add current user message
      messages.push({ role: "user", content: userMessage });

      // Generate response using Groq with llama-3.3-70b-versatile (current free model)
      console.log("📡 Sending request to Groq API...");
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiResponse = completion.choices[0].message.content;

      console.log("✅ Successfully received response from Groq API");
      console.log("   Response length:", aiResponse.length, "characters");

      // Return successful response
      return {
        success: true,
        message: aiResponse,
        tokensUsed: completion.usage?.total_tokens || aiResponse.length,
      };
    } catch (error) {
      console.error(
        `Chat AI error (attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      // If rate limited, wait and retry
      if (
        error.message.includes("429") ||
        error.message.includes("rate limit")
      ) {
        console.log(`⚠️  Rate limit hit on current API key`);

        if (attempt < maxRetries) {
          console.log(`🔄 Waiting before retry...`);
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        }
      }

      // If last attempt failed, fall back to demo mode
      if (attempt === maxRetries) {
        console.log("❌ All API attempts failed, falling back to demo mode");
        return {
          message:
            getDemoResponse(userMessage, contextData) +
            "\n\n💡 *Note: This is a demo response. Your API key may have issues.*",
        };
      }
    }
  }
};

/**
 * Get quick action suggestions based on context
 */
exports.getQuickActions = (contextData) => {
  const defaultActions = [
    "Explain my skill gaps",
    "How do I improve?",
    "Career path advice",
    "Best learning resources",
  ];

  if (!contextData) {
    return defaultActions;
  }

  try {
    const context = JSON.parse(contextData);
    const actions = [];

    if (context.analysisResult) {
      const { missingSkills, jobRole } = context.analysisResult;

      if (missingSkills && missingSkills.length > 0) {
        actions.push(`How do I learn ${missingSkills[0].skill}?`);
        if (missingSkills.length > 1) {
          actions.push(`Best resources for ${missingSkills[1].skill}`);
        }
      }

      if (jobRole) {
        actions.push(`Career path for ${jobRole}`);
      }
    }

    return actions.length > 0
      ? actions.concat(defaultActions.slice(0, 4 - actions.length))
      : defaultActions;
  } catch (e) {
    return defaultActions;
  }
};

/**
 * Get rate limit status for user
 */
exports.getRateLimitStatus = (userId) => {
  const userTracking = userMessageCounts.get(userId);

  if (!userTracking) {
    return {
      remaining: RATE_LIMITS.perUser.maxMessages,
      total: RATE_LIMITS.perUser.maxMessages,
      resetsIn: RATE_LIMITS.perUser.timeWindow / 1000, // in seconds
    };
  }

  const now = Date.now();
  const resetsIn = Math.max(
    0,
    Math.ceil((userTracking.resetTime - now) / 1000)
  );

  return {
    remaining: Math.max(
      0,
      RATE_LIMITS.perUser.maxMessages - userTracking.count
    ),
    total: RATE_LIMITS.perUser.maxMessages,
    resetsIn: resetsIn,
  };
};

/**
 * Generate demo responses when API keys are unavailable
 */
function getDemoResponse(message, contextData) {
  const msg = message.toLowerCase();

  // Parse context if available
  let context = null;
  try {
    context = contextData ? JSON.parse(contextData) : null;
  } catch (e) {
    // Invalid JSON, ignore
  }

  // Context-aware responses
  if (context?.analysisResult) {
    if (msg.includes("skill") || msg.includes("gap")) {
      return "Based on your resume analysis, I can see you have skills in various areas. However, I'm currently running in demo mode with limited AI capabilities. To get detailed skill gap analysis, please provide valid Gemini API keys or wait for the quota to reset.";
    }
    if (msg.includes("recommend") || msg.includes("course")) {
      return "I'd love to recommend courses based on your skill gaps! However, I'm in demo mode right now. For personalized course recommendations, please ensure you have valid API keys configured.";
    }
  }

  // Generic responses
  const responses = {
    greeting: [
      "Hello! I'm your skill development assistant. I'm currently in demo mode, but I can still help answer basic questions!",
      "Hi there! While I'm in demo mode with limited AI, feel free to ask me questions about skill development!",
    ],
    help: [
      "I can help you with skill gap analysis and course recommendations. Currently in demo mode - full AI features require valid API keys.",
      "I'm here to assist with your learning journey! Note: I'm in demo mode right now, so responses are limited.",
    ],
    default: [
      "Thanks for your message! I'm running in demo mode right now. For full AI-powered responses, please configure valid Gemini API keys.",
      "I received your question! Currently in demo mode - for detailed analysis, please add valid API keys to your environment.",
    ],
  };

  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return responses.greeting[
      Math.floor(Math.random() * responses.greeting.length)
    ];
  }

  if (msg.includes("help") || msg.includes("what can you")) {
    return responses.help[Math.floor(Math.random() * responses.help.length)];
  }

  return responses.default[
    Math.floor(Math.random() * responses.default.length)
  ];
}

exports.getDemoResponse = getDemoResponse;
