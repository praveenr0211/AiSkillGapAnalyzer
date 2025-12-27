import React, { useState, useEffect } from "react";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for auth success/error in URL params
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    const errorParam = params.get("error");

    if (authStatus === "success") {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      onLoginSuccess();
    } else if (errorParam) {
      setError("Authentication failed. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onLoginSuccess]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError("");

    // Redirect to backend Google OAuth
    const authUrl =
      process.env.NODE_ENV === "production"
        ? "/auth/google"
        : process.env.REACT_APP_AUTH_URL
        ? `${process.env.REACT_APP_AUTH_URL}/google`
        : "http://localhost:5000/auth/google";

    window.location.href = authUrl;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎯 AI Skill-Gap Analyzer</h1>
          <p>
            Sign in to analyze your skills and get personalized learning
            recommendations
          </p>
        </div>

        <div className="login-content">
          {error && <div className="error-message">⚠️ {error}</div>}

          <button
            onClick={handleGoogleLogin}
            className="google-btn"
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>

          <div className="login-features">
            <h3>Features</h3>
            <ul>
              <li>📄 Upload and analyze your resume</li>
              <li>🎯 Compare skills with job requirements</li>
              <li>📊 Get skill match percentage</li>
              <li>🗺️ Receive personalized learning roadmap</li>
            </ul>
          </div>
        </div>

        <div className="login-footer">
          <p>Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
