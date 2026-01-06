import React, { useState } from "react";
import "./ResultDashboard.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { updateProgress } from "../services/api";
import SkillDetailView from "./SkillDetailView";

const ResultDashboard = ({ analysis, jobRole, onReset }) => {
  const { match_percentage, matched_skills, missing_skills, learning_roadmap } =
    analysis;
  const [trackingSkills, setTrackingSkills] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState(null);

  // Calculate color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 75) return "#4caf50";
    if (percentage >= 50) return "#ff9800";
    return "#f44336";
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(102, 126, 234);
    doc.text("Skills Analysis Report", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Job Role: ${jobRole}`, pageWidth / 2, yPosition, {
      align: "center",
    });
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      yPosition + 6,
      { align: "center" }
    );

    yPosition += 20;

    // Match Score Section
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text("Skill Match Score", 14, yPosition);

    yPosition += 10;
    doc.setFontSize(36);
    doc.setTextColor(...hexToRgb(getMatchColor(match_percentage)));
    doc.text(`${match_percentage}%`, pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const matchDesc =
      match_percentage >= 75
        ? "Excellent match! You have most required skills."
        : match_percentage >= 50
        ? "Good start! Some skills need development."
        : "Focus on building key skills for this role.";
    doc.text(matchDesc, pageWidth / 2, yPosition, { align: "center" });

    yPosition += 15;

    // Matched Skills Section
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`✓ Skills You Have (${matched_skills.length})`, 14, yPosition);

    yPosition += 8;
    if (matched_skills.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [["Matched Skills"]],
        body: matched_skills.map((skill) => [skill]),
        theme: "striped",
        headStyles: { fillColor: [76, 175, 80] },
        margin: { left: 14, right: 14 },
      });
      yPosition = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("No matching skills found", 14, yPosition);
      yPosition += 10;
    }

    // Check if new page needed
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Missing Skills Section
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`✕ Skills to Learn (${missing_skills.length})`, 14, yPosition);

    yPosition += 8;
    if (missing_skills.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [["Skills to Develop"]],
        body: missing_skills.map((skill) => [skill]),
        theme: "striped",
        headStyles: { fillColor: [244, 67, 54] },
        margin: { left: 14, right: 14 },
      });
      yPosition = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Great! You have all required skills!", 14, yPosition);
      yPosition += 10;
    }

    // Learning Roadmap Section
    if (learning_roadmap && learning_roadmap.length > 0) {
      // Check if new page needed
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text("🗺 Personalized Learning Roadmap", 14, yPosition);

      yPosition += 8;

      // Create roadmap data with courses and projects
      const roadmapData = learning_roadmap.flatMap((item, index) => {
        const rows = [];

        // Main skill row
        rows.push([
          {
            content: `${index + 1}. ${item.skill}`,
            colSpan: 3,
            styles: { fontStyle: "bold", fillColor: [240, 242, 255] },
          },
        ]);

        // Timeline row
        rows.push([{ content: `⏱️ Timeline: ${item.timeline}`, colSpan: 3 }]);

        // Courses
        if (item.resources && item.resources.length > 0) {
          rows.push([
            {
              content: "📚 Recommended Courses:",
              colSpan: 3,
              styles: { fontStyle: "bold" },
            },
          ]);

          item.resources.forEach((resource) => {
            rows.push([
              resource.platform,
              resource.title,
              `${resource.rating}\n${resource.cost}`,
            ]);
          });
        }

        // Projects
        if (item.projects && item.projects.length > 0) {
          rows.push([
            {
              content: "💡 Practice Projects:",
              colSpan: 3,
              styles: { fontStyle: "bold" },
            },
          ]);

          item.projects.forEach((project) => {
            rows.push([{ content: `• ${project}`, colSpan: 3 }]);
          });
        }

        // Spacer
        rows.push([{ content: "", colSpan: 3, styles: { minCellHeight: 5 } }]);

        return rows;
      });

      autoTable(doc, {
        startY: yPosition,
        body: roadmapData,
        theme: "grid",
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 95 },
          2: { cellWidth: 40 },
        },
      });
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${totalPages} | Generated by AI Skill-Gap Analyzer`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Save PDF
    doc.save(
      `skill-analysis-${jobRole
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.pdf`
    );
  };

  // Track missing skills function
  const handleTrackSkills = async () => {
    if (!missing_skills || missing_skills.length === 0) {
      alert("No missing skills to track!");
      return;
    }

    try {
      setTrackingSkills(true);
      let successCount = 0;

      for (const skill of missing_skills) {
        try {
          await updateProgress(
            skill,
            "in-progress",
            `Added from ${jobRole} analysis`
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to track skill: ${skill}`, error);
        }
      }

      alert(
        `Successfully added ${successCount} skills to your progress tracker!`
      );
    } catch (error) {
      console.error("Error tracking skills:", error);
      alert("Failed to track skills. Please try again.");
    } finally {
      setTrackingSkills(false);
    }
  };

  // Handle opening skill detail view
  const handleViewSkillDetails = (skill, roadmapItem) => {
    setSelectedSkill(skill);
    setSelectedRoadmapItem(roadmapItem);
  };

  // Handle closing skill detail view
  const handleCloseSkillDetails = () => {
    setSelectedSkill(null);
    setSelectedRoadmapItem(null);
  };

  return (
    <div className="dashboard-container">
      {/* Futuristic Background */}
      <div className="dashboard-background">
        <div className="gradient-orb dash-orb-1"></div>
        <div className="gradient-orb dash-orb-2"></div>
        <div className="gradient-orb dash-orb-3"></div>
        <div className="particles-container"></div>
      </div>

      {/* Hero Section */}
      <div className="dashboard-hero">
        <h1 className="hero-title">
          <span className="gradient-text-dash">Know Your Gap,</span>
          <br />
          Map Your Path
        </h1>
        <p className="hero-subtitle">
          Upload your resume and generate a personalized roadmap to your dream
          job.
        </p>
        <div className="hero-cta-row">
          <button className="hero-cta primary" onClick={onReset}>
            Upload Resume
          </button>
          <button className="hero-cta secondary">Try Demo</button>
        </div>
      </div>

      {/* Feature Tiles */}
      <div className="feature-tiles">
        <div className="feature-tile">
          <div className="tile-icon">🔎</div>
          <div className="tile-body">
            <div className="tile-title">Skill Analysis</div>
            <div className="tile-desc">
              Find matching skills across curated requirements and best
              practices.
            </div>
          </div>
        </div>
        <div className="feature-tile">
          <div className="tile-icon">🧠</div>
          <div className="tile-body">
            <div className="tile-title">AI Roadmap</div>
            <div className="tile-desc">
              Browse adaptive skill roadmaps aligned to career-relevant gaps.
            </div>
          </div>
        </div>
        <div className="feature-tile">
          <div className="tile-icon">💼</div>
          <div className="tile-body">
            <div className="tile-title">Job Matches</div>
            <div className="tile-desc">
              Find out your strengths and understand your progress over time.
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Panels - 3 cards in a row */}
      <div className="dashboard-main">
        {/* Skills Match Report */}
        <div className="panel glassmorphism-card">
          <div className="panel-header">
            <div className="panel-icon">📊</div>
            <div className="panel-title">Skills Match Report</div>
          </div>
          <div className="match-report-body">
            <div className="circular-progress compact">
              <svg viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="20"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 85 * (1 - match_percentage / 100)
                  }`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="progress-circle"
                />
                <defs>
                  <linearGradient
                    id="progressGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f093fb" />
                    <stop offset="50%" stopColor="#764ba2" />
                    <stop offset="100%" stopColor="#667eea" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="percentage-text">{match_percentage}%</div>
            </div>
            <div className="match-report-meta">
              <div className="match-report-role">{jobRole}</div>
              <div className="match-report-desc">
                {match_percentage >= 75 &&
                  "Excellent match! You have most required skills."}
                {match_percentage >= 50 &&
                  match_percentage < 75 &&
                  "Good start! Some skills need development."}
                {match_percentage < 50 &&
                  "Focus on building key skills for this role."}
              </div>
            </div>
          </div>
        </div>

        {/* Matched Skills Card */}
        <div className="panel glassmorphism-card  ">
          <div className="panel-header">
            <div className="panel-icon">✅</div>
            <div className="panel-title">Skills You Have</div>
            <div className="panel-count">{matched_skills.length}</div>
          </div>
          <div className="skills-list-body">
            {matched_skills.length > 0 ? (
              <div className="skills-grid-compact">
                {matched_skills.map((skill, index) => (
                  <div key={index} className="skill-tag-compact matched">
                    {skill}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message-compact">
                No matching skills found
              </div>
            )}
          </div>
        </div>

        {/* Missing Skills Card */}
        <div className="panel glassmorphism-card extrawidth">
          <div className="panel-header">
            <div className="panel-icon">📚</div>
            <div className="panel-title">Skills to Learn</div>
            <div className="panel-count">{missing_skills.length}</div>
          </div>
          <div className="skills-list-body">
            {missing_skills.length > 0 ? (
              <div className="skills-grid-compact">
                {missing_skills.map((skill, index) => (
                  <div key={index} className="skill-tag-compact missing">
                    {skill}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message-compact">
                Great! You have all required skills!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Learning Roadmap - Full width below */}
      <div className="roadmap-section">
        <div className="panel glassmorphism-card roadmap-card">
          <div className="panel-header">
            <div className="panel-title">Personal Learning Roadmap</div>
            <div className="panel-subtitle">AI Roadmap</div>
          </div>
          <div className="roadmap-panel-body">
            <div className="roadmap-curve">
              <svg
                className="roadmap-curve-svg"
                viewBox="0 0 520 210"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="roadmapGradient"
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
                <path
                  d="M30,160 C130,30 200,40 260,110 C320,180 390,170 490,100"
                  fill="none"
                  stroke="url(#roadmapGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>

              {learning_roadmap &&
                learning_roadmap.slice(0, 5).map((item, index) => {
                  const positions = [
                    { left: "12%", top: "68%" },
                    { left: "28%", top: "38%" },
                    { left: "50%", top: "58%" },
                    { left: "72%", top: "38%" },
                    { left: "88%", top: "68%" },
                  ];
                  const letters = ["B", "C", "D", "E", "F"];
                  return (
                    <button
                      key={index}
                      className="roadmap-node"
                      style={positions[index]}
                      onClick={() => handleViewSkillDetails(item.skill, item)}
                      title={`${item.skill} - ${item.timeline}`}
                    >
                      <div className="roadmap-node-circle">
                        {letters[index]}
                      </div>
                      <div className="roadmap-node-time">{item.timeline}</div>
                    </button>
                  );
                })}

              <div className="roadmap-trophy">🏆</div>
            </div>

            <div className="roadmap-skill-pills">
              {missing_skills &&
                missing_skills.slice(0, 5).map((skill, index) => {
                  const roadmapItem = learning_roadmap?.find(
                    (item) => item.skill === skill
                  );
                  return (
                    <button
                      key={index}
                      className="roadmap-pill"
                      onClick={() =>
                        roadmapItem &&
                        handleViewSkillDetails(skill, roadmapItem)
                      }
                    >
                      {skill}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="dashboard-actions-bar">
        <button
          onClick={handleTrackSkills}
          className="action-btn track"
          disabled={
            trackingSkills || !missing_skills || missing_skills.length === 0
          }
        >
          {trackingSkills ? "⏳ Tracking..." : "✓ Track Missing Skills"}
        </button>
        <button onClick={exportToPDF} className="action-btn export">
          📄 Export as PDF
        </button>
        <button onClick={onReset} className="action-btn analyze">
          🔄 Analyze Another Resume
        </button>
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillDetailView
          skill={selectedSkill}
          roadmapItem={selectedRoadmapItem}
          onClose={handleCloseSkillDetails}
        />
      )}
    </div>
  );
};

export default ResultDashboard;
