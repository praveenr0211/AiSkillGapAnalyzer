const express = require("express");
const router = express.Router();
const dbAsync = require("../config/database");

/**
 * @route GET /api/courses
 * @desc Get all courses for users
 */
router.get("/", async (req, res) => {
  try {
    const coursesResult = await dbAsync.query(
      "SELECT * FROM courses ORDER BY created_at DESC"
    );

    // Get videos for each course
    const courses = await Promise.all(
      coursesResult.rows.map(async (course) => {
        try {
          const videosResult = await dbAsync.query(
            "SELECT * FROM videos WHERE course_id = ? ORDER BY order_index ASC",
            [course.id]
          );
          return {
            ...course,
            videos: videosResult.rows || [],
          };
        } catch (videoError) {
          // If videos table doesn't exist yet, return empty array
          console.warn("Videos fetch error:", videoError.message);
          return {
            ...course,
            videos: [],
          };
        }
      })
    );

    res.json({
      success: true,
      courses,
    });
  } catch (err) {
    console.error("Get public courses error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
