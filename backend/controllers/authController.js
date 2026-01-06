const passport = require("../config/passport");

/**
 * Initiate Google OAuth login
 */
exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account", // Always show account selection
});

/**
 * Google OAuth callback handler
 */
exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      console.error("Auth error:", err);
      return res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=no_user`);
    }

    // Log user in
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.redirect(`${process.env.FRONTEND_URL}?error=login_failed`);
      }

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}?auth=success`);
    });
  })(req, res, next);
};

/**
 * Logout handler
 */
exports.logout = (req, res) => {
  req.logout((err) => {
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
};

/**
 * Get current user
 */
exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
};
