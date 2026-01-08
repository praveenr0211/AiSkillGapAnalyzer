const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

/**
 * POST /api/chat/message
 * Send a message and get AI response
 */
router.post("/message", chatController.sendMessage);

/**
 * GET /api/chat/sessions
 * Get all chat sessions for current user
 */
router.get("/sessions", chatController.getSessions);

/**
 * GET /api/chat/history/:sessionId
 * Get messages for a specific session
 */
router.get("/history/:sessionId", chatController.getHistory);

/**
 * DELETE /api/chat/session/:sessionId
 * Clear/delete a chat session
 */
router.delete("/session/:sessionId", chatController.clearSession);

/**
 * GET /api/chat/quick-actions
 * Get quick action suggestions based on context
 */
router.get("/quick-actions", chatController.getQuickActions);

/**
 * GET /api/chat/rate-limit
 * Get current rate limit status
 */
router.get("/rate-limit", chatController.getRateLimitStatus);

module.exports = router;
