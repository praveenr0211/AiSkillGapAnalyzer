import React, { useState, useEffect } from "react";
import "./History.css";
import { getHistory, deleteAnalysis } from "../services/api";

const History = ({ onViewAnalysis, onCompare }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getHistory();
      if (response.success) {
        setHistory(response.history);
      }
    } catch (err) {
      setError("Failed to load history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) {
      return;
    }

    try {
      await deleteAnalysis(id);
      setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to delete analysis");
      console.error(err);
    }
  };

  const toggleCompareSelection = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        setError("You can only compare 2 analyses at a time");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      onCompare(selectedForCompare);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* Futuristic Background */}
      <div className="history-background">
        <div className="gradient-orb hist-orb-1"></div>
        <div className="gradient-orb hist-orb-2"></div>
        <div className="gradient-orb hist-orb-3"></div>
        <div className="stars-container"></div>
      </div>

      <div className="history-header">
        <h1>
          <span className="folder-icon">📁</span> Analysis{" "}
          <span className="gradient-text-history">History</span>
        </h1>
        <p>View and compare your past resume analyses</p>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {selectedForCompare.length === 2 && (
        <div className="compare-banner">
          <span>{selectedForCompare.length} analyses selected</span>
          <button onClick={handleCompare} className="compare-btn">
            Compare Selected
          </button>
          <button
            onClick={() => setSelectedForCompare([])}
            className="clear-btn"
          >
            Clear Selection
          </button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Analysis History Yet</h2>
          <p>Your analyzed resumes will appear here</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="card-wrapper">
              <svg
                className="orbital-svg"
                viewBox="0 0 400 300"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id={`orbital-gradient-${item.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#667eea", stopOpacity: 0.8 }}
                    />
                    <stop
                      offset="50%"
                      style={{ stopColor: "#764ba2", stopOpacity: 0.6 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#f093fb", stopOpacity: 0.9 }}
                    />
                  </linearGradient>
                </defs>
                <ellipse
                  cx="200"
                  cy="150"
                  rx="180"
                  ry="130"
                  fill="none"
                  stroke={`url(#orbital-gradient-${item.id})`}
                  strokeWidth="2"
                  className="orbital-path"
                />
                <circle
                  className="orbital-dot orbital-dot-1"
                  r="4"
                  fill="#667eea"
                >
                  <animateMotion dur="8s" repeatCount="indefinite">
                    <mpath href={`#orbital-path-${item.id}`} />
                  </animateMotion>
                </circle>
              </svg>

              <div
                className={`history-card ${
                  selectedForCompare.includes(item.id) ? "selected" : ""
                }`}
              >
                <div className="card-header">
                  <h3>{item.job_role}</h3>
                  <div className="score-badge">{item.match_percentage}%</div>
                </div>

                <div className="card-date">
                  📅 {formatDate(item.created_at)}
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => onViewAnalysis(item.id)}
                    className="action-btn view-btn"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => toggleCompareSelection(item.id)}
                    className={`action-btn compare-btn ${
                      selectedForCompare.includes(item.id) ? "active" : ""
                    }`}
                  >
                    📊 Compare
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="action-btn delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
