// Middleware to check if user is authenticated as admin
const requireAdmin = (req, res, next) => {
    if (!req.session.adminId || !req.session.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin authentication required.",
        });
    }
    next();
};

module.exports = requireAdmin;
