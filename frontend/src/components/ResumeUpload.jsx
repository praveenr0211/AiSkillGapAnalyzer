import React, { useState } from "react";
import "./ResumeUpload.css";
import { uploadResume, analyzeSkills } from "../services/api";

const ResumeUpload = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [inputMode, setInputMode] = useState("predefined"); // "predefined" or "custom"
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const jobRoles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "AI Engineer",
    "DevOps Engineer",
    "Mobile Developer",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];

      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF or DOCX file");
        setFile(null);
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploadSuccess(false);

    // Validation
    if (!file) {
      setError("Please upload your resume");
      return;
    }

    if (inputMode === "predefined" && !jobRole) {
      setError("Please select a job role");
      return;
    }

    if (inputMode === "custom" && !customJobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    setLoading(true);
    setUploadProgress("Uploading resume...");

    try {
      // Step 1: Upload and extract text
      const uploadResponse = await uploadResume(file);

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || "Failed to upload resume");
      }

      // Show success message
      setUploadProgress("");
      setError("");
      setUploadSuccess(true);

      // Wait 2 seconds to show success message
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setUploadSuccess(false);
      setUploadProgress("Analyzing skills with AI...");

      // Step 2: Analyze skills
      const analysisResponse = await analyzeSkills(
        uploadResponse.extractedText,
        inputMode === "predefined" ? jobRole : null,
        inputMode === "custom" ? customJobDescription : null
      );

      if (!analysisResponse.success) {
        throw new Error(analysisResponse.message || "Failed to analyze skills");
      }

      setUploadProgress("Analysis complete!");

      // Pass results to parent component
      onAnalysisComplete(
        analysisResponse.analysis,
        inputMode === "predefined" ? jobRole : "Custom Job Description"
      );
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
      setUploadProgress("");
      setUploadSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      {/* Animated Background */}
      <div className="upload-background">
        <div className="gradient-orb upload-orb-1"></div>
        <div className="gradient-orb upload-orb-2"></div>
        <div className="gradient-orb upload-orb-3"></div>
        <div className="stars-bg"></div>
      </div>

      {/* Left Side - Learning Orbit Scene */}
      <div className="upload-left-section">
        <div className="orbit-scene">
          {/* Central Student Avatar */}
          <div className="student-avatar">
            <span className="student-emoji">👨‍💻</span>
          </div>

          {/* Orbit Rings with Animated Dots */}
          <div className="orbit-ring ring-1">
            <div className="orbit-line"></div>
            <div className="orbit-dot dot-1"></div>
            <div className="orbit-dot dot-2"></div>
          </div>
          <div className="orbit-ring ring-2">
            <div className="orbit-line"></div>
            <div className="orbit-dot dot-1"></div>
            <div className="orbit-dot dot-2"></div>
          </div>
          <div className="orbit-ring ring-3">
            <div className="orbit-line"></div>
            <div className="orbit-dot dot-1"></div>
            <div className="orbit-dot dot-2"></div>
          </div>

          {/* Tech Stack Cards on Orbits */}
          {/* Ring 1 - React */}
          <div className="tech-card orbit-1">
            <svg viewBox="0 0 24 24" fill="#61DAFB">
              <circle cx="12" cy="12" r="2" />
              <ellipse
                cx="12"
                cy="12"
                rx="11"
                ry="4.2"
                fill="none"
                stroke="#61DAFB"
                strokeWidth="1"
              />
              <ellipse
                cx="12"
                cy="12"
                rx="11"
                ry="4.2"
                fill="none"
                stroke="#61DAFB"
                strokeWidth="1"
                transform="rotate(60 12 12)"
              />
              <ellipse
                cx="12"
                cy="12"
                rx="11"
                ry="4.2"
                fill="none"
                stroke="#61DAFB"
                strokeWidth="1"
                transform="rotate(120 12 12)"
              />
            </svg>
          </div>

          {/* Ring 1 - Python */}
          <div className="tech-card orbit-2">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C10.7 2 9.6 2.5 9.1 3.4L7.5 6H12V7H6C4.3 7 3 8.3 3 10V14C3 15.7 4.3 17 6 17H7V14.5C7 12.6 8.6 11 10.5 11H13.5C15.2 11 16.5 9.7 16.5 8V5.5C16.5 3.8 15.2 2.5 13.5 2.5L12 2M10 4C10.6 4 11 4.4 11 5C11 5.6 10.6 6 10 6C9.4 6 9 5.6 9 5C9 4.4 9.4 4 10 4Z"
                fill="#3776AB"
              />
              <path
                d="M12 22C13.3 22 14.4 21.5 14.9 20.6L16.5 18H12V17H18C19.7 17 21 15.7 21 14V10C21 8.3 19.7 7 18 7H17V9.5C17 11.4 15.4 13 13.5 13H10.5C8.8 13 7.5 14.3 7.5 16V18.5C7.5 20.2 8.8 21.5 10.5 21.5L12 22M14 20C13.4 20 13 19.6 13 19C13 18.4 13.4 18 14 18C14.6 18 15 18.4 15 19C15 19.6 14.6 20 14 20Z"
                fill="#FFC331"
              />
            </svg>
          </div>

          {/* Ring 2 - JavaScript */}
          <div className="tech-card orbit-3">
            <svg viewBox="0 0 24 24" fill="#F7DF1E">
              <rect x="2" y="2" width="20" height="20" fill="#F7DF1E" rx="2" />
              <text
                x="12"
                y="17"
                fontSize="14"
                fontWeight="bold"
                fill="#000"
                textAnchor="middle"
              >
                JS
              </text>
            </svg>
          </div>

          {/* Ring 2 - Node.js */}
          <div className="tech-card orbit-4">
            <svg viewBox="0 0 24 24" fill="#339933">
              <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.47 1.71.47 1.4 0 2.21-.85 2.21-2.33V8.44c0-.12-.1-.22-.22-.22H8.5c-.13 0-.23.1-.23.22v8.47c0 .66-.68 1.31-1.77.76L4.5 16.5a.26.26 0 0 1-.12-.21V7.71c0-.09.04-.17.12-.21l7.44-4.29c.07-.04.17-.04.24 0l7.44 4.29c.08.04.12.12.12.21v8.58c0 .08-.04.16-.12.21l-7.44 4.29c-.07.04-.17.04-.24 0l-1.89-1.12c-.06-.03-.13-.04-.19-.01-.52.28-.62.32-1.09.48-.12.04-.29.1.07.28l2.46 1.45c.24.14.5.2.78.2.27 0 .54-.07.77-.2l7.44-4.29c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.5-.2-.77-.2z" />
            </svg>
          </div>

          {/* Ring 3 - SQL */}
          <div className="tech-card orbit-5">
            <svg viewBox="0 0 24 24" fill="#CC2927">
              <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z" />
            </svg>
          </div>

          {/* Ring 3 - Docker */}
          <div className="tech-card orbit-6">
            <svg viewBox="0 0 24 24" fill="#2496ED">
              <path d="M13.5 10.1h2V8h-2v2.1zm-2.4 0h2V8h-2v2.1zM9 10.1h2V8H9v2.1zm5.9-2.2h2V5.8h-2v2.1zm-2.4 0h2V5.8h-2v2.1zm-2.4 0h2V5.8h-2v2.1zM9 7.9h2V5.8H9v2.1zm12.4 4.4c-.5-.3-1.8-.4-2.7-.1-.1-1.1-.9-2-1.8-2.5l-.4-.2-.2.4c-.3.6-.5 1.4-.3 2.2.1.5.3.9.7 1.3-.4.2-1 .4-1.9.4H2.5c-.4 1.5-.2 3.4 1 4.8 1.2 1.4 3 2.1 5.4 2.1 5.3 0 9.2-2.5 10.8-6.8.7 0 2.2 0 3-.8.1-.1.4-.5.6-1.1l.1-.3-.7-.4z" />
            </svg>
          </div>
        </div>
        <div className="upload-tagline">
          <h2>
            START YOUR
            <br />
            <span className="gradient-text-upload">CAREER ADVENTURE!</span>
          </h2>
        </div>
      </div>

      {/* Right Side - Upload Form */}
      <div className="upload-card">
        <div className="upload-header">
          <h1>UPLOAD RESUME</h1>
          <p>Analyze your skills and get personalized roadmap</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="resume">📄 Select Resume File</label>
            <div className="file-input-wrapper">
              <label htmlFor="resume" className="file-upload-label">
                <svg
                  className="upload-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className={file ? "uploaded-filename" : ""}>
                  {file ? file.name : "Click to upload or drag & drop"}
                </span>
              </label>
              <input
                type="file"
                id="resume"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                disabled={loading}
                className="file-input-hidden"
              />
            </div>
            <small>PDF, DOCX (Max 5MB)</small>
          </div>

          {/* Input Mode Toggle */}
          <div className="form-group">
            <label>Job Matching Method</label>
            <div className="toggle-buttons">
              <button
                type="button"
                className={`toggle-btn ${
                  inputMode === "predefined" ? "active" : ""
                }`}
                onClick={() => setInputMode("predefined")}
                disabled={loading}
              >
                📋 Predefined Roles
              </button>
              <button
                type="button"
                className={`toggle-btn ${
                  inputMode === "custom" ? "active" : ""
                }`}
                onClick={() => setInputMode("custom")}
                disabled={loading}
              >
                ✍️ Custom Job Description
              </button>
            </div>
          </div>

          {/* Predefined Job Role Selection */}
          {inputMode === "predefined" && (
            <div className="form-group">
              <label htmlFor="jobRole">Target Job Role</label>
              <select
                id="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                disabled={loading}
                required={inputMode === "predefined"}
              >
                <option value="">Select a job role</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Job Description Input */}
          {inputMode === "custom" && (
            <div className="form-group">
              <label htmlFor="jobDescription">Paste Job Description</label>
              <textarea
                id="jobDescription"
                value={customJobDescription}
                onChange={(e) => setCustomJobDescription(e.target.value)}
                disabled={loading}
                required={inputMode === "custom"}
                placeholder="Paste the complete job description here. Include responsibilities, requirements, and required skills..."
                rows="10"
              />
              <small>
                AI will extract required skills from this description
              </small>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="success-message">✓ Successfully uploaded!</div>
          )}

          {/* Progress Message */}
          {uploadProgress && (
            <div className="progress-message">
              <div className="spinner"></div>
              {uploadProgress}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn-upload"
            disabled={
              loading ||
              !file ||
              (inputMode === "predefined" && !jobRole) ||
              (inputMode === "custom" && !customJobDescription.trim())
            }
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Analyzing...
              </>
            ) : (
              "Analyze Skills"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeUpload;
