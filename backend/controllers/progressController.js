const db = require("../config/database");

/**
 * Get user's skill progress
 */
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM skill_progress
      WHERE user_id = ?
      ORDER BY started_at DESC
    `;

    const result = await db.query(query, [userId]);

    res.json({
      success: true,
      skills: result.rows,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving progress",
    });
  }
};

/**
 * Add or update skill progress
 */
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { skill_name, status, notes } = req.body;

    if (!skill_name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const completed_at =
      status === "completed" ? new Date().toISOString() : null;

    const query = `
      INSERT INTO skill_progress (user_id, user_email, skill_name, status, notes, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, skill_name) 
      DO UPDATE SET status = excluded.status, notes = excluded.notes, completed_at = excluded.completed_at
    `;

    await db.run(query, [
      userId,
      userEmail,
      skill_name,
      status,
      notes,
      completed_at,
    ]);

    res.json({
      success: true,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating progress",
    });
  }
};

/**
 * Get progress statistics
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalResult = await db.query(
      `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = ?`,
      [userId]
    );
    const completedResult = await db.query(
      `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = ? AND status = 'completed'`,
      [userId]
    );
    const inProgressResult = await db.query(
      `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = ? AND status = 'in-progress'`,
      [userId]
    );
    const recentResult = await db.query(
      `SELECT skill_name, completed_at 
       FROM skill_progress 
       WHERE user_id = ? AND status = 'completed'
       ORDER BY completed_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      totalSkills: parseInt(totalResult.rows[0].count),
      completedSkills: parseInt(completedResult.rows[0].count),
      inProgressSkills: parseInt(inProgressResult.rows[0].count),
      recentlyCompleted: recentResult.rows,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving stats",
    });
  }
};
