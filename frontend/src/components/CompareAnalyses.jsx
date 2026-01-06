import React, { useState, useEffect } from "react";
import "./CompareAnalyses.css";
import { compareAnalyses } from "../services/api";

const CompareAnalyses = ({ analysisIds, onBack }) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisIds]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await compareAnalyses(analysisIds);
      if (response.success) {
        setComparison(response.comparison);
      } else {
        setError(response.message || "Failed to load comparison");
      }
    } catch (err) {
      console.error("Comparison error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load comparison";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateImprovement = (analysis1, analysis2) => {
    const diff = analysis2.match_percentage - analysis1.match_percentage;
    return {
      value: Math.abs(diff),
      isImprovement: diff > 0,
      isDecline: diff < 0,
      isEqual: diff === 0,
    };
  };

  if (loading) {
    return (
      <div className="compare-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="compare-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>{error || "Failed to load comparison"}</h2>
          <button onClick={onBack} className="back-btn">
            ← Back to History
          </button>
        </div>
      </div>
    );
  }

  const { analysis1, analysis2 } = comparison;
  const improvement = calculateImprovement(analysis1, analysis2);

  return (
    <div className="compare-container">
      <div className="compare-header">
        <button onClick={onBack} className="back-btn">
          ← Back to History
        </button>
        <h1>⚖️ Resume Comparison</h1>
      </div>

      {/* Improvement Summary */}
      <div className="improvement-summary">
        {improvement.isImprovement && (
          <div className="improvement-badge success">
            <span className="icon">📈</span>
            <span className="text">
              <strong>+{improvement.value}%</strong> improvement
            </span>
          </div>
        )}
        {improvement.isDecline && (
          <div className="improvement-badge decline">
            <span className="icon">📉</span>
            <span className="text">
              <strong>-{improvement.value}%</strong> decline
            </span>
          </div>
        )}
        {improvement.isEqual && (
          <div className="improvement-badge neutral">
            <span className="icon">➡️</span>
            <span className="text">No change in score</span>
          </div>
        )}
      </div>

      {/* Side-by-side comparison */}
      <div className="comparison-grid">
        {/* Analysis 1 */}
        <div className="analysis-panel">
          <div className="panel-header">
            <h2>📄 Previous Analysis</h2>
            <div className="date-badge">{formatDate(analysis1.created_at)}</div>
          </div>

          <div className="score-section">
            <div
              className="score-circle"
              style={{
                background: `conic-gradient(
                  from 0deg,
                  #667eea 0deg,
                  #764ba2 ${analysis1.match_percentage * 1.8}deg,
                  #f093fb ${analysis1.match_percentage * 3.6}deg,
                  rgba(255, 255, 255, 0.05) ${
                    analysis1.match_percentage * 3.6
                  }deg
                )`,
              }}
            >
              <div className="score-inner">
                <div className="percentage">{analysis1.match_percentage}%</div>
                <div className="label">Match</div>
              </div>
            </div>
          </div>

          <div className="job-role">
            <strong>Job Role:</strong> {analysis1.job_role}
          </div>

          <div className="skills-section">
            <h3>✅ Matched Skills ({analysis1.matched_skills.length})</h3>
            <div className="skills-list">
              {analysis1.matched_skills.map((skill, idx) => (
                <span key={idx} className="skill-tag matched">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="skills-section">
            <h3>❌ Missing Skills ({analysis1.missing_skills.length})</h3>
            <div className="skills-list">
              {analysis1.missing_skills.map((skill, idx) => (
                <span key={idx} className="skill-tag missing">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis 2 */}
        <div className="analysis-panel">
          <div className="panel-header">
            <h2>📄 Recent Analysis</h2>
            <div className="date-badge">{formatDate(analysis2.created_at)}</div>
          </div>

          <div className="score-section">
            <div
              className="score-circle"
              style={{
                background: `conic-gradient(
                  from 0deg,
                  #667eea 0deg,
                  #764ba2 ${analysis2.match_percentage * 1.8}deg,
                  #f093fb ${analysis2.match_percentage * 3.6}deg,
                  rgba(255, 255, 255, 0.05) ${
                    analysis2.match_percentage * 3.6
                  }deg
                )`,
              }}
            >
              <div className="score-inner">
                <div className="percentage">{analysis2.match_percentage}%</div>
                <div className="label">Match</div>
              </div>
            </div>
          </div>

          <div className="job-role">
            <strong>Job Role:</strong> {analysis2.job_role}
          </div>

          <div className="skills-section">
            <h3>✅ Matched Skills ({analysis2.matched_skills.length})</h3>
            <div className="skills-list">
              {analysis2.matched_skills.map((skill, idx) => (
                <span key={idx} className="skill-tag matched">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="skills-section">
            <h3>❌ Missing Skills ({analysis2.missing_skills.length})</h3>
            <div className="skills-list">
              {analysis2.missing_skills.map((skill, idx) => (
                <span key={idx} className="skill-tag missing">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Changes */}
      <div className="changes-section">
        <h2>📊 Key Changes</h2>
        <div className="changes-grid">
          <div className="change-card">
            <div className="change-label">Matched Skills</div>
            <div className="change-value">
              {analysis1.matched_skills.length} →{" "}
              {analysis2.matched_skills.length}
              <span
                className={
                  analysis2.matched_skills.length >
                  analysis1.matched_skills.length
                    ? "positive"
                    : "negative"
                }
              >
                {analysis2.matched_skills.length >
                analysis1.matched_skills.length
                  ? " ↑"
                  : " ↓"}
              </span>
            </div>
          </div>

          <div className="change-card">
            <div className="change-label">Missing Skills</div>
            <div className="change-value">
              {analysis1.missing_skills.length} →{" "}
              {analysis2.missing_skills.length}
              <span
                className={
                  analysis2.missing_skills.length <
                  analysis1.missing_skills.length
                    ? "positive"
                    : "negative"
                }
              >
                {analysis2.missing_skills.length <
                analysis1.missing_skills.length
                  ? " ↓"
                  : " ↑"}
              </span>
            </div>
          </div>

          <div className="change-card">
            <div className="change-label">Overall Match</div>
            <div className="change-value">
              {analysis1.match_percentage}% → {analysis2.match_percentage}%
              {improvement.isImprovement && (
                <span className="positive"> ↑</span>
              )}
              {improvement.isDecline && <span className="negative"> ↓</span>}
              {improvement.isEqual && <span className="neutral"> →</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareAnalyses;
