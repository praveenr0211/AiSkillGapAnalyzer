const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const requireAdmin = require("../middleware/adminAuth");

// Public routes
router.post("/login", adminController.login);

// Protected routes (require admin authentication)
router.post("/logout", requireAdmin, adminController.logout);
router.get("/current", requireAdmin, adminController.getCurrentAdmin);
router.get("/stats", requireAdmin, adminController.getStats);
router.get("/users", requireAdmin, adminController.getUsers);

// Course Management Routes
router.get("/courses", requireAdmin, adminController.getCourses);
router.post("/courses", requireAdmin, adminController.addCourse);
router.delete("/courses/:id", requireAdmin, adminController.deleteCourse);

module.exports = router;
