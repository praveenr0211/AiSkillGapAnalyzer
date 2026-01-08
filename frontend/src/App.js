import React, { useState, useEffect } from "react";
import "./App.css";
import LandingPage from "./components/LandingPage";
import ResumeUpload from "./components/ResumeUpload";
import ResultDashboard from "./components/ResultDashboard";
import History from "./components/History";
import CompareAnalyses from "./components/CompareAnalyses";
import ProgressDashboard from "./components/ProgressDashboard";
import Courses from "./components/Courses";
import Jobs from "./components/Jobs";
import ChatBot from "./components/ChatBot";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { getCurrentUser, logout, getAnalysisById } from "./services/api";

function App() {
  const [analysisResult, setAnalysisResult] = useState(() => {
    const saved = sessionStorage.getItem("analysisResult");
    return saved ? JSON.parse(saved) : null;
  });
  const [jobRole, setJobRole] = useState(() => {
    return sessionStorage.getItem("jobRole") || "";
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    const saved = sessionStorage.getItem("adminUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem("currentView") || "upload";
  });
  const [compareIds, setCompareIds] = useState(() => {
    const saved = sessionStorage.getItem("compareIds");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    if (analysisResult) {
      sessionStorage.setItem("analysisResult", JSON.stringify(analysisResult));
    } else {
      sessionStorage.removeItem("analysisResult");
    }
  }, [analysisResult]);

  useEffect(() => {
    if (jobRole) {
      sessionStorage.setItem("jobRole", jobRole);
    } else {
      sessionStorage.removeItem("jobRole");
    }
  }, [jobRole]);

  useEffect(() => {
    sessionStorage.setItem("currentView", currentView);
  }, [currentView]);

  useEffect(() => {
    if (compareIds.length > 0) {
      sessionStorage.setItem("compareIds", JSON.stringify(compareIds));
    } else {
      sessionStorage.removeItem("compareIds");
    }
  }, [compareIds]);

  useEffect(() => {
    // Check authentication status on mount only if not showing admin login
    // Also restore admin authentication if adminUser exists in sessionStorage
    if (adminUser && !showAdminLogin) {
      setIsAdminAuthenticated(true);
      setLoading(false);
    } else if (!showAdminLogin) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [showAdminLogin, adminUser]);

  const checkAuth = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
      setAnalysisResult(null);
      setJobRole("");
      setCurrentView("upload");
      // Clear sessionStorage on logout
      sessionStorage.clear();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLoginSuccess = (adminData) => {
    console.log("Admin logged in:", adminData);
    // Store admin info in sessionStorage
    sessionStorage.setItem("adminUser", JSON.stringify(adminData));
    setAdminUser(adminData);
    setIsAdminAuthenticated(true);
    setShowAdminLogin(false);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("adminUser");
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    setShowAdminLogin(false);
  };

  const handleBackFromAdminLogin = () => {
    setShowAdminLogin(false);
  };

  const handleAnalysisComplete = (analysis, role) => {
    setAnalysisResult(analysis);
    setJobRole(role);
    setCurrentView("results");
  };

  const handleReset = () => {
    // Clear analysis data from sessionStorage
    sessionStorage.removeItem("analysisResult");
    sessionStorage.removeItem("jobRole");
    setAnalysisResult(null);
    setJobRole("");
    setCurrentView("upload");
  };

  const handleViewHistory = () => {
    setCurrentView("history");
  };

  const handleViewAnalysis = async (id) => {
    try {
      const response = await getAnalysisById(id);
      if (response.success) {
        setAnalysisResult(response.analysis);
        setJobRole(response.analysis.job_role);
        setCurrentView("results");
      }
    } catch (error) {
      console.error("Failed to load analysis:", error);
    }
  };

  const handleCompare = (ids) => {
    setCompareIds(ids);
    setCurrentView("compare");
  };

  const handleBackToHistory = () => {
    setCurrentView("history");
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showAdminLogin) {
      return (
        <div className="App">
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onBack={handleBackFromAdminLogin}
          />
        </div>
      );
    }

    if (isAdminAuthenticated && adminUser) {
      return (
        <div className="App">
          <AdminDashboard admin={adminUser} onLogout={handleAdminLogout} />
        </div>
      );
    }

    return (
      <div className="App">
        <LandingPage
          onLoginSuccess={handleLoginSuccess}
          onAdminLogin={handleAdminLogin}
        />
      </div>
    );
  }

  return (
    <div className="App">
      {/* User Info Bar */}
      <div className="user-bar">
        <div className="user-info">
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="user-name">{user?.name}</span>
        </div>
        <div className="nav-buttons">
          <button
            onClick={() => setCurrentView("upload")}
            className={`nav-btn ${currentView === "upload" ? "active" : ""}`}
          >
            📤 Upload Resume
          </button>
          <button
            onClick={handleViewHistory}
            className={`nav-btn ${currentView === "history" ? "active" : ""}`}
          >
            📚 History
          </button>
          <button
            onClick={() => setCurrentView("progress")}
            className={`nav-btn ${currentView === "progress" ? "active" : ""}`}
          >
            📊 Progress
          </button>
          <button
            onClick={() => setCurrentView("courses")}
            className={`nav-btn ${currentView === "courses" ? "active" : ""}`}
          >
            🎓 Courses
          </button>
          <button
            onClick={() => setCurrentView("jobs")}
            className={`nav-btn ${currentView === "jobs" ? "active" : ""}`}
          >
            💼 Jobs
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      {currentView === "upload" && (
        <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
      )}

      {currentView === "history" && (
        <History
          onViewAnalysis={handleViewAnalysis}
          onCompare={handleCompare}
        />
      )}

      {currentView === "progress" && <ProgressDashboard />}

      {currentView === "courses" && (
        <Courses onBack={() => setCurrentView("upload")} />
      )}

      {currentView === "jobs" && (
        <Jobs analysisResult={analysisResult} jobRole={jobRole} />
      )}

      {currentView === "compare" && (
        <CompareAnalyses
          analysisIds={compareIds}
          onBack={handleBackToHistory}
        />
      )}

      {currentView === "results" && (
        <ResultDashboard
          analysis={analysisResult}
          jobRole={jobRole}
          onReset={handleReset}
        />
      )}

      {/* AI Chatbot - Available everywhere when authenticated */}
      {isAuthenticated && (
        <ChatBot
          analysisResult={analysisResult}
          jobRole={jobRole}
          currentPage={currentView}
        />
      )}
    </div>
  );
}

export default App;
