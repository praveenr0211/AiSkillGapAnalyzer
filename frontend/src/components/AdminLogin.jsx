import React, { useState } from "react";
import "./AdminLogin.css";
import { adminLogin } from "../services/adminApi";

const AdminLogin = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await adminLogin(email, password);
      if (response.success) {
        onLoginSuccess(response.admin);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Animated Background */}
      <div className="admin-animated-background">
        <div className="admin-gradient-orb admin-orb-1"></div>
        <div className="admin-gradient-orb admin-orb-2"></div>
        <div className="admin-gradient-orb admin-orb-3"></div>
      </div>

      {/* Login Card */}
      <div className="admin-login-card">
        <button className="admin-back-btn" onClick={onBack}>
          ← Back to Home
        </button>

        <div className="admin-login-header">
          <div className="admin-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1>Administrator Login</h1>
          <p>Access the admin dashboard</p>
        </div>

        {error && (
          <div className="admin-error-banner">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">Email Address</label>
            <div className="admin-input-wrapper">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skillgap.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <div className="admin-input-wrapper">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="admin-spinner"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>
            🔒 Secure admin access • Default credentials: admin@skillgap.com /
            admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
