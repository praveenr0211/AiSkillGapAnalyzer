const dbAsync = require("../config/database");
const bcrypt = require("bcrypt");

// Admin login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find admin by email
        const admin = await dbAsync.get("SELECT * FROM admins WHERE email = ?", [
            email,
        ]);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Set admin session
        req.session.adminId = admin.id;
        req.session.isAdmin = true;

        // Return admin info (without password)
        const { password: _, ...adminInfo } = admin;

        res.json({
            success: true,
            admin: adminInfo,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login",
        });
    }
};

// Admin logout
exports.logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error logging out",
                });
            }
            res.json({
                success: true,
                message: "Logged out successfully",
            });
        });
    } catch (error) {
        console.error("Admin logout error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during logout",
        });
    }
};

// Get current admin
exports.getCurrentAdmin = async (req, res) => {
    try {
        if (!req.session.adminId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }

        const admin = await dbAsync.get("SELECT * FROM admins WHERE id = ?", [
            req.session.adminId,
        ]);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        const { password: _, ...adminInfo } = admin;

        res.json({
            success: true,
            admin: adminInfo,
        });
    } catch (error) {
        console.error("Get current admin error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Get dashboard statistics
exports.getStats = async (req, res) => {
    try {
        // 1. Total Distinct Users
        const usersResult = await dbAsync.get(
            "SELECT COUNT(*) as count FROM users"
        );
        const totalUsers = Number(usersResult?.count) || 0;

        // 2. Total Analyses
        const analysesResult = await dbAsync.get(
            "SELECT COUNT(*) as count FROM resume_analyses"
        );
        const totalAnalyses = Number(analysesResult?.count) || 0;

        // 3. Recent Activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentAnalysesResult = await dbAsync.get(
            "SELECT COUNT(*) as count FROM resume_analyses WHERE created_at >= ?",
            [sevenDaysAgo.toISOString()]
        );
        const recentAnalyses = Number(recentAnalysesResult?.count) || 0;

        // 4. Unique Job Roles
        const jobRolesResult = await dbAsync.get(
            "SELECT COUNT(DISTINCT job_role) as count FROM resume_analyses"
        );
        const uniqueJobRoles = Number(jobRolesResult?.count) || 0;

        // 5. Total Combined User Logins (Sum of all sessions)
        const loginsResult = await dbAsync.get(
            "SELECT SUM(login_count) as count FROM users"
        );
        const totalLogins = Number(loginsResult?.count) || 0;

        // 6. Top 5 Job Roles
        const topJobRolesResult = await dbAsync.query(
            `SELECT job_role, COUNT(*) as count 
       FROM resume_analyses 
       WHERE job_role IS NOT NULL 
       GROUP BY job_role 
       ORDER BY count DESC 
       LIMIT 5`
        );
        const topJobRoles = topJobRolesResult.rows || [];

        // Success response
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalAnalyses,
                recentAnalyses,
                uniqueJobRoles,
                totalLogins: totalLogins > totalUsers ? totalLogins : totalUsers, // Ensure at least 1 per user
                topJobRoles,
            },
        });
    } catch (error) {
        console.error("CRITICAL: Get stats error:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching statistics",
            error: error.message,
        });
    }
};

// Get users list with pagination
exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM users";
        let countQuery = "SELECT COUNT(*) as count FROM users";
        const params = [];

        if (search) {
            query += " WHERE name LIKE ? OR email LIKE ?";
            countQuery += " WHERE name LIKE ? OR email LIKE ?";
            params.push(`%${search}%`, `%${search}%`);
        }

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const users = await dbAsync.query(query, params);
        const totalResult = await dbAsync.get(
            countQuery,
            search ? [`%${search}%`, `%${search}%`] : []
        );
        const total = totalResult?.count || 0;

        res.json({
            success: true,
            users: users.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("Get users error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Get all courses
 */
exports.getCourses = async (req, res) => {
    try {
        const result = await dbAsync.query(
            "SELECT * FROM courses ORDER BY created_at DESC"
        );
        res.json({
            success: true,
            courses: result.rows
        });
    } catch (err) {
        console.error("Get courses error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Add a new course
 */
exports.addCourse = async (req, res) => {
    const { title, stream, url, icon, lessons, hours, color } = req.body;

    if (!title || !stream || !url) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        await dbAsync.run(
            `INSERT INTO courses (title, stream, url, icon, lessons, hours, color) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, stream, url, icon || "📚", lessons || 0, hours || 0, color || "#667eea"]
        );

        res.json({
            success: true,
            message: "Course added successfully"
        });
    } catch (err) {
        console.error("Add course error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Delete a course
 */
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        await dbAsync.run("DELETE FROM courses WHERE id = ?", [id]);
        res.json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (err) {
        console.error("Delete course error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
