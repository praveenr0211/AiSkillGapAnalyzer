const db = require("../config/database");
const chatService = require("../services/chatService");

/**
 * Send a chat message and get AI response
 */
exports.sendMessage = async (req, res) => {
  try {
    console.log("📩 Received chat message request");
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const { message, sessionId, contextData } = req.body;
    const userId = String(req.user?.id || 1); // Convert to string for large Google IDs

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Get or create session
    let session_id = sessionId;
    if (!session_id) {
      console.log("Creating new chat session for user:", userId);
      // Create new session
      const result = await db.run(
        `INSERT INTO chat_sessions (user_id, context_data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id`,
        [userId, contextData || null]
      );
      console.log("Insert result:", result);

      if (!result || !result.rows || !result.rows[0]) {
        throw new Error("Failed to create chat session - no ID returned");
      }

      session_id = result.rows[0].id;
      console.log("✅ Created new session:", session_id);
    } else {
      // Update existing session
      await db.run(
        `UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP, context_data = $1 WHERE id = $2 AND user_id = $3`,
        [contextData || null, session_id, userId]
      );
    }

    // Get conversation history
    const history = await db.all(
      `SELECT role, message FROM chat_messages 
       WHERE session_id = $1 
       ORDER BY timestamp ASC`,
      [session_id]
    );

    // Save user message
    await db.run(
      `INSERT INTO chat_messages (session_id, role, message) VALUES ($1, 'user', $2)`,
      [session_id, message]
    );

    // Generate AI response
    const aiResponse = await chatService.generateChatResponse(
      message,
      history,
      contextData,
      userId
    );

    // Save AI response
    await db.run(
      `INSERT INTO chat_messages (session_id, role, message) VALUES ($1, 'assistant', $2)`,
      [session_id, aiResponse.message]
    );

    // Get rate limit status
    const rateLimitStatus = chatService.getRateLimitStatus(userId);

    res.json({
      success: true,
      sessionId: session_id,
      message: aiResponse.message,
      rateLimitStatus,
    });
  } catch (error) {
    console.error("❌ Error in sendMessage:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate response",
    });
  }
};

/**
 * Get chat history for a session
 */
exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = String(req.user?.id || 1);

    // Verify session belongs to user
    const session = await db.get(
      `SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    // Get messages
    const messages = await db.all(
      `SELECT id, role, message, timestamp 
       FROM chat_messages 
       WHERE session_id = $1 
       ORDER BY timestamp ASC`,
      [sessionId]
    );

    res.json({
      success: true,
      session,
      messages,
    });
  } catch (error) {
    console.error("Error in getHistory:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch history",
    });
  }
};

/**
 * Get all sessions for current user
 */
exports.getSessions = async (req, res) => {
  try {
    const userId = String(req.user?.id || 1);

    const sessions = await db.all(
      `SELECT 
        cs.id, 
        cs.created_at, 
        cs.updated_at,
        cs.context_data,
        (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count
       FROM chat_sessions cs
       WHERE cs.user_id = $1
       ORDER BY cs.updated_at DESC
       LIMIT 20`,
      [userId]
    );

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Error in getSessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch sessions",
    });
  }
};

/**
 * Clear/delete a chat session
 */
exports.clearSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = String(req.user?.id || 1);

    // Verify session belongs to user
    const session = await db.get(
      `SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    // Delete messages first (cascade)
    await db.run(`DELETE FROM chat_messages WHERE session_id = $1`, [
      sessionId,
    ]);

    // Delete session
    await db.run(`DELETE FROM chat_sessions WHERE id = $1`, [sessionId]);

    res.json({
      success: true,
      message: "Session cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearSession:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear session",
    });
  }
};

/**
 * Get quick action suggestions
 */
exports.getQuickActions = async (req, res) => {
  try {
    const { contextData } = req.query;

    const actions = chatService.getQuickActions(contextData);

    res.json({
      success: true,
      actions,
    });
  } catch (error) {
    console.error("Error in getQuickActions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch quick actions",
    });
  }
};

/**
 * Get rate limit status
 */
exports.getRateLimitStatus = async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    const status = chatService.getRateLimitStatus(userId);

    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Error in getRateLimitStatus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch rate limit status",
    });
  }
};
