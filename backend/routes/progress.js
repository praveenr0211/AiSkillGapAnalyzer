const express = require("express");
const progressController = require("../controllers/progressController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Get user's skill progress
router.get("/", progressController.getProgress);

// Update skill progress
router.post("/update", progressController.updateProgress);

// Get progress statistics
router.get("/stats", progressController.getStats);

module.exports = router;
