import React, { useState, useEffect } from "react";
import "./LandingPage.css";

const LandingPage = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for auth success/error in URL params
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    const errorParam = params.get("error");

    if (authStatus === "success") {
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

    const authUrl =
      process.env.NODE_ENV === "production"
        ? "/auth/google"
        : process.env.REACT_APP_AUTH_URL
        ? `${process.env.REACT_APP_AUTH_URL}/google`
        : "http://localhost:5000/auth/google";

    window.location.href = authUrl;
  };

  return (
    <div className="landing-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="stars"></div>
      </div>

      {/* Header Navigation */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">SkillGap</span>
        </div>
        <div className="social-links">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">AI-Powered</span> Skill Gap.
            <br />
            Personalized Learning.
          </h1>
          <p className="hero-description">
            Our advanced AI technology analyzes your resume and provides
            personalized learning roadmaps. Powered by Google Gemini, it
            compares your skills with job requirements and creates customized
            career development plans.
          </p>

          {error && <div className="error-banner">⚠️ {error}</div>}

          <div className="cta-buttons">
            <button
              onClick={handleGoogleLogin}
              className="cta-primary"
              disabled={loading}
            >
              <svg className="google-icon-small" viewBox="0 0 24 24">
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
              {loading ? "Signing in..." : "Get Started"}
            </button>
            <button
              className="cta-secondary"
              onClick={() =>
                document
                  .getElementById("features")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
            </button>
          </div>

          {/* Feature Tags */}
          <div className="feature-tags">
            <span className="tag">📊 AI Analysis</span>
            <span className="tag">🎯 Skill Matching</span>
            <span className="tag">🗺️ Learning Roadmap</span>
          </div>
        </div>

        {/* Animated Illustration */}
        <div className="hero-illustration">
          <div className="floating-element element-1">
            <div className="skill-card">
              <span className="skill-icon">⚛️</span>
              <span>React</span>
            </div>
          </div>
          <div className="floating-element element-2">
            <div className="skill-card">
              <span className="skill-icon">🐍</span>
              <span>Python</span>
            </div>
          </div>
          <div className="floating-element element-3">
            <div className="skill-card">
              <span className="skill-icon">📊</span>
              <span>Data Science</span>
            </div>
          </div>

          {/* Center AI Robot */}
          <div className="ai-robot">
            <div className="robot-head">
              <div className="robot-eye left"></div>
              <div className="robot-eye right"></div>
              <div className="robot-antenna"></div>
            </div>
            <div className="infinity-symbol">
              <svg viewBox="0 0 200 100" className="infinity-svg">
                <path
                  d="M50,50 Q25,20 50,20 T100,50 Q125,80 150,50 T200,50 Q175,80 150,80 T100,50 Q75,20 50,50 Z"
                  fill="url(#infinityGradient)"
                  className="infinity-path"
                />
                <defs>
                  <linearGradient
                    id="infinityGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="50%" stopColor="#764ba2" />
                    <stop offset="100%" stopColor="#f093fb" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">
          <span className="gradient-text">Powerful Features</span>
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Resume Analysis</h3>
            <p>Upload your resume and let AI extract your skills instantly</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Skill Matching</h3>
            <p>
              Compare your skills with job requirements and get match percentage
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Learning Roadmap</h3>
            <p>Get personalized learning paths with courses and projects</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Track your learning progress and earn achievements</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Powered by Google Gemini AI • © 2026 SkillGap Analyzer</p>
      </footer>
    </div>
  );
};

export default LandingPage;
