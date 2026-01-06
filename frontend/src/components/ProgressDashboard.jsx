import React, { useState, useEffect } from "react";
import { getProgress, updateProgress, getProgressStats } from "../services/api";
import "./ProgressDashboard.css";

const ProgressDashboard = () => {
  const [skills, setSkills] = useState([]);
  const [stats, setStats] = useState({
    totalSkills: 0,
    completedSkills: 0,
    inProgressSkills: 0,
    recentlyCompleted: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressData, statsData] = await Promise.all([
        getProgress(),
        getProgressStats(),
      ]);

      console.log("Progress data:", progressData);
      console.log("Stats data:", statsData);

      setSkills(progressData.skills || []);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      console.error("Error response:", err.response);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load progress data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (skillName) => {
    try {
      const skill = skills.find((s) => s.skill_name === skillName);
      const newStatus =
        skill.status === "completed" ? "in-progress" : "completed";
      const completedAt =
        newStatus === "completed" ? new Date().toISOString() : null;

      // Optimistically update the UI
      setSkills((prevSkills) =>
        prevSkills.map((s) =>
          s.skill_name === skillName
            ? {
                ...s,
                status: newStatus,
                completed_at: completedAt,
              }
            : s
        )
      );

      // Update stats optimistically
      setStats((prevStats) => {
        const isNowCompleted = newStatus === "completed";
        let updatedRecentlyCompleted = [...(prevStats.recentlyCompleted || [])];

        if (isNowCompleted) {
          // Add to recently completed
          const completedSkill = {
            skill_name: skillName,
            completed_at: completedAt,
          };
          updatedRecentlyCompleted.unshift(completedSkill);
          // Keep only the 5 most recent
          updatedRecentlyCompleted = updatedRecentlyCompleted.slice(0, 5);
        } else {
          // Remove from recently completed if marking as in-progress
          updatedRecentlyCompleted = updatedRecentlyCompleted.filter(
            (s) => s.skill_name !== skillName
          );
        }

        return {
          ...prevStats,
          completedSkills: isNowCompleted
            ? prevStats.completedSkills + 1
            : prevStats.completedSkills - 1,
          inProgressSkills: isNowCompleted
            ? prevStats.inProgressSkills - 1
            : prevStats.inProgressSkills + 1,
          recentlyCompleted: updatedRecentlyCompleted,
        };
      });

      // Send update to backend
      await updateProgress(skillName, newStatus, skill.notes);
    } catch (err) {
      console.error("Error updating skill:", err);
      alert("Failed to update skill status");
      // Revert on error
      fetchData();
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await updateProgress(newSkillName, "in-progress");
      setNewSkillName("");
      setShowAddSkill(false);
      await fetchData();
    } catch (err) {
      console.error("Error adding skill:", err);
      alert("Failed to add skill");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = () => {
    if (stats.totalSkills === 0) return 0;
    return Math.round((stats.completedSkills / stats.totalSkills) * 100);
  };

  if (loading) {
    return (
      <div className="progress-dashboard loading">Loading progress...</div>
    );
  }

  if (error) {
    return <div className="progress-dashboard error">{error}</div>;
  }

  return (
    <div className="progress-dashboard">
      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📚</span>
            <span className="stat-label">Total Skills</span>
            <button className="stat-menu">⋯</button>
          </div>
          <div className="stat-value">{stats.totalSkills}</div>
          <div className="stat-change positive">+14.9% ↑</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Completed</span>
            <button className="stat-menu">⋯</button>
          </div>
          <div className="stat-value">{stats.completedSkills}</div>
          <div className="stat-change negative">-12.6% ↓</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🔄</span>
            <span className="stat-label">In Progress</span>
            <button className="stat-menu">⋯</button>
          </div>
          <div className="stat-value">{stats.inProgressSkills}</div>
          <div className="stat-change positive">+3.1% ↑</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📈</span>
            <span className="stat-label">Completion Rate</span>
            <button className="stat-menu">⋯</button>
          </div>
          <div className="stat-value">{calculateProgress()}%</div>
          <div className="stat-change positive">+11.9% ↑</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Left Section - Circular Progress */}
        <div className="dashboard-card circular-progress-section">
          <div className="card-header">
            <h3>Overall Progress</h3>
            <button className="export-btn">Export ↓</button>
          </div>
          <div className="circular-gauge">
            <svg viewBox="0 0 200 200" className="gauge-svg">
              <defs>
                <linearGradient
                  id="gaugeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#f093fb", stopOpacity: 1 }}
                  />
                  <stop
                    offset="50%"
                    style={{ stopColor: "#764ba2", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#667eea", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${calculateProgress() * 5.03} 502.65`}
                transform="rotate(-90 100 100)"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
            <div className="gauge-center">
              <div className="gauge-value">{calculateProgress()}%</div>
              <div className="gauge-label">Complete</div>
            </div>
          </div>
          <div className="gauge-legend">
            <div className="legend-item">
              <span
                className="legend-dot"
                style={{ background: "#f093fb" }}
              ></span>
              <span className="legend-label">Completed</span>
              <span className="legend-value">
                {Math.round((stats.completedSkills / stats.totalSkills) * 100)}%
              </span>
            </div>
            <div className="legend-item">
              <span
                className="legend-dot"
                style={{ background: "#667eea" }}
              ></span>
              <span className="legend-label">In Progress</span>
              <span className="legend-value">
                {Math.round((stats.inProgressSkills / stats.totalSkills) * 100)}
                %
              </span>
            </div>
            <div className="legend-item">
              <span
                className="legend-dot"
                style={{ background: "#06b6d4" }}
              ></span>
              <span className="legend-label">Remaining</span>
              <span className="legend-value">{100 - calculateProgress()}%</span>
            </div>
          </div>
        </div>

        {/* Right Section - Skills Chart */}
        <div className="dashboard-card skills-chart-section">
          <div className="card-header">
            <div>
              <h3>Skills Progress</h3>
              <p className="card-subtitle">Monthly tracking</p>
            </div>
          </div>
          <div className="chart-value">
            <span className="chart-amount">{stats.totalSkills}</span>
            <span className="chart-change positive">+14.9% ↑</span>
          </div>
          <div className="line-chart">
            <svg
              viewBox="0 0 800 200"
              className="line-chart-svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#667eea", stopOpacity: 1 }}
                  />
                  <stop
                    offset="50%"
                    style={{ stopColor: "#764ba2", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#f093fb", stopOpacity: 1 }}
                  />
                </linearGradient>
                <linearGradient
                  id="areaGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#764ba2", stopOpacity: 0.3 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#764ba2", stopOpacity: 0 }}
                  />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line
                x1="0"
                y1="50"
                x2="800"
                y2="50"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="100"
                x2="800"
                y2="100"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="150"
                x2="800"
                y2="150"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />

              {/* Area under curve */}
              <path
                d="M 0 170 L 66.67 130 L 133.33 180 L 200 100 L 266.67 160 L 333.33 90 L 400 140 L 466.67 120 L 533.33 80 L 600 130 L 666.67 110 L 733.33 90 L 800 90 L 800 200 L 0 200 Z"
                fill="url(#areaGradient)"
              />

              {/* Line */}
              <path
                d="M 0 170 L 66.67 130 L 133.33 180 L 200 100 L 266.67 160 L 333.33 90 L 400 140 L 466.67 120 L 533.33 80 L 600 130 L 666.67 110 L 733.33 90"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {[
                { x: 0, y: 170 },
                { x: 66.67, y: 130 },
                { x: 133.33, y: 180 },
                { x: 200, y: 100 },
                { x: 266.67, y: 160 },
                { x: 333.33, y: 90 },
                { x: 400, y: 140 },
                { x: 466.67, y: 120 },
                { x: 533.33, y: 80 },
                { x: 600, y: 130 },
                { x: 666.67, y: 110 },
                { x: 733.33, y: 90 },
              ].map((point, idx) => (
                <circle
                  key={idx}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="url(#lineGradient)"
                  className="chart-point"
                />
              ))}
            </svg>
          </div>
          <div className="chart-labels">
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((month, idx) => (
              <span key={idx} className="chart-label">
                {month}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="skills-section">
        <div className="section-header">
          <h2>🎯 Target Skills</h2>
          <button
            className="add-skill-btn"
            onClick={() => setShowAddSkill(!showAddSkill)}
          >
            {showAddSkill ? "Cancel" : "+ Add Skill"}
          </button>
        </div>

        {showAddSkill && (
          <form onSubmit={handleAddSkill} className="add-skill-form">
            <input
              type="text"
              placeholder="Enter skill name..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="skill-input"
            />
            <button type="submit" className="submit-btn">
              Add
            </button>
          </form>
        )}

        {skills.length === 0 ? (
          <div className="empty-state">
            <p>
              No skills tracked yet. Start by adding skills from your resume
              analysis!
            </p>
          </div>
        ) : (
          <div className="skills-grid">
            {skills.map((skill) => (
              <div key={skill.id} className={`skill-card ${skill.status}`}>
                <div className="skill-header">
                  <h3>{skill.skill_name}</h3>
                  <span className={`status-badge ${skill.status}`}>
                    {skill.status === "completed" ? "✓" : "○"}
                  </span>
                </div>
                <div className="skill-dates">
                  <div className="date-item">
                    <span className="date-label">Started:</span>
                    <span className="date-value">
                      {formatDate(skill.started_at)}
                    </span>
                  </div>
                  {skill.completed_at && (
                    <div className="date-item">
                      <span className="date-label">Completed:</span>
                      <span className="date-value">
                        {formatDate(skill.completed_at)}
                      </span>
                    </div>
                  )}
                </div>
                {skill.notes && (
                  <div className="skill-notes">
                    <p>{skill.notes}</p>
                  </div>
                )}
                <button
                  className={`mark-complete-btn ${skill.status}`}
                  onClick={() => handleMarkComplete(skill.skill_name)}
                >
                  {skill.status === "completed"
                    ? "Mark as In Progress"
                    : "Mark as Complete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Completed */}
      {stats.recentlyCompleted && stats.recentlyCompleted.length > 0 && (
        <div className="recent-section">
          <h2>🎉 Recently Completed</h2>
          <div className="recent-list">
            {stats.recentlyCompleted.map((skill, index) => (
              <div key={index} className="recent-item">
                <span className="recent-icon">✓</span>
                <span className="recent-skill">{skill.skill_name}</span>
                <span className="recent-date">
                  {formatDate(skill.completed_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
