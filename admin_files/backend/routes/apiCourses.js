const express = require("express");
const router = express.Router();
const dbAsync = require("../config/database");

/**
 * @route GET /api/courses
 * @desc Get all courses for users
 */
router.get("/", async (req, res) => {
    try {
        const result = await dbAsync.query(
            "SELECT * FROM courses ORDER BY created_at DESC"
        );
        res.json({
            success: true,
            courses: result.rows
        });
    } catch (err) {
        console.error("Get public courses error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
