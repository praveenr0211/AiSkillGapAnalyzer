const fs = require("fs");

const chatServiceCompletion = `

      // Generate response
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      // Return successful response
      return {
        success: true,
        message: aiResponse,
        tokensUsed: aiResponse.length, // Approximate
      };
    } catch (error) {
      console.error(\`Chat AI error (attempt \${attempt}/\${maxRetries}):\`, error.message);

      // If rate limited, wait and retry
      if (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
        console.log(\`⚠️  Rate limit hit on current API key\`);

        // Wait before retrying
        if (attempt < maxRetries) {
          console.log(\`🔄 Waiting before retry...\`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
      }

      // If last attempt failed, throw error
      if (attempt === maxRetries) {
        throw new Error(\`Failed to generate response after \${maxRetries} attempts: \${error.message}\`);
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
        actions.push(\`How do I learn \${missingSkills[0].skill}?\`);
        if (missingSkills.length > 1) {
          actions.push(\`Best resources for \${missingSkills[1].skill}\`);
        }
      }

      if (jobRole) {
        actions.push(\`Career path for \${jobRole}\`);
      }
    }

    return actions.length > 0 ? actions.concat(defaultActions.slice(0, 4 - actions.length)) : defaultActions;
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
  const resetsIn = Math.max(0, Math.ceil((userTracking.resetTime - now) / 1000));

  return {
    remaining: Math.max(0, RATE_LIMITS.perUser.maxMessages - userTracking.count),
    total: RATE_LIMITS.perUser.maxMessages,
    resetsIn: resetsIn,
  };
};
`;

// Append to chatService.js
const filePath = "./services/chatService.js";
fs.appendFileSync(filePath, chatServiceCompletion);
console.log("✅ chatService.js completed successfully");
