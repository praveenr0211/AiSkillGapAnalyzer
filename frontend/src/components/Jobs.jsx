import React, { useState, useEffect } from "react";
import "./Jobs.css";
import { searchJobs } from "../services/api";

function Jobs({ analysisResult, jobRole }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [minMatchPercentage, setMinMatchPercentage] = useState(0);
  const [location, setLocation] = useState("us");
  const [minSalary, setMinSalary] = useState("");

  useEffect(() => {
    if (jobRole) {
      fetchJobs(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRole]);

  const fetchJobs = async (pageNum = 1, reset = false) => {
    if (!jobRole) {
      setError("Please complete your skill analysis first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userSkills =
        analysisResult?.matched_skills || analysisResult?.matchedSkills || [];

      const response = await searchJobs(jobRole, location, pageNum, userSkills);

      if (response.success) {
        const newJobs = response.jobs || [];

        if (reset) {
          setJobs(newJobs);
        } else {
          setJobs((prev) => [...prev, ...newJobs]);
        }

        setHasMore(newJobs.length === 20);
        setPage(pageNum);
      } else {
        setError(response.error || "Failed to fetch jobs");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchJobs(page + 1, false);
  };

  const handleFilterChange = () => {
    fetchJobs(1, true);
  };

  // Apply client-side filters
  const filteredJobs = jobs.filter((job) => {
    // Match percentage filter
    if (job.matchPercentage < minMatchPercentage) return false;

    // Salary filter
    if (minSalary && job.salary_min) {
      if (job.salary_min < parseInt(minSalary)) return false;
    }

    return true;
  });

  const formatSalary = (min, max, isPredicted) => {
    if (!min && !max) return "Not specified";
    const minFormatted = min ? `$${Math.round(min).toLocaleString()}` : "";
    const maxFormatted = max ? `$${Math.round(max).toLocaleString()}` : "";
    const range =
      minFormatted && maxFormatted
        ? `${minFormatted} - ${maxFormatted}`
        : minFormatted || maxFormatted;
    return isPredicted ? `${range} (estimated)` : range;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="jobs-container">
      {/* Animated Background */}
      <div className="jobs-background">
        <div className="jobs-stars"></div>
        <div className="jobs-gradient-orb jobs-orb-1"></div>
        <div className="jobs-gradient-orb jobs-orb-2"></div>
        <div className="jobs-gradient-orb jobs-orb-3"></div>
      </div>

      {/* Content */}
      <div className="jobs-content">
        <div className="jobs-header">
          <h1>🎯 Job Recommendations</h1>
          <p>Personalized job matches for {jobRole}</p>
        </div>

        {/* Filters */}
        <div className="jobs-filters">
          <div className="filter-group">
            <label>
              📍 Location:
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="us">United States</option>
                <option value="gb">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="in">India</option>
              </select>
            </label>
          </div>

          <div className="filter-group">
            <label>
              🎯 Min Match %:
              <select
                value={minMatchPercentage}
                onChange={(e) => setMinMatchPercentage(Number(e.target.value))}
              >
                <option value="0">All Jobs</option>
                <option value="50">50%+</option>
                <option value="60">60%+</option>
                <option value="70">70%+</option>
                <option value="80">80%+</option>
              </select>
            </label>
          </div>

          <div className="filter-group">
            <label>
              💰 Min Salary:
              <input
                type="number"
                placeholder="e.g., 50000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
            </label>
          </div>

          <button className="btn-apply-filters" onClick={handleFilterChange}>
            Apply Filters
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="jobs-error">{error}</div>}

        {/* Jobs List */}
        <div className="jobs-list">
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <div
                  className="job-match-badge"
                  style={{
                    background:
                      job.matchPercentage >= 70
                        ? "#4caf50"
                        : job.matchPercentage >= 50
                        ? "#ff9800"
                        : "#f44336",
                  }}
                >
                  {job.matchPercentage}% Match
                </div>
              </div>

              <div className="job-card-info">
                <div className="job-info-item">
                  <span className="job-icon">🏢</span>
                  <span>{job.company}</span>
                </div>
                <div className="job-info-item">
                  <span className="job-icon">📍</span>
                  <span>{job.location}</span>
                </div>
                <div className="job-info-item">
                  <span className="job-icon">💰</span>
                  <span>
                    {formatSalary(
                      job.salary_min,
                      job.salary_max,
                      job.salary_is_predicted
                    )}
                  </span>
                </div>
                <div className="job-info-item">
                  <span className="job-icon">📅</span>
                  <span>{formatDate(job.created)}</span>
                </div>
                <div className="job-info-item">
                  <span className="job-icon">⏰</span>
                  <span>{job.contract_time}</span>
                </div>
              </div>

              {/* Matched Skills */}
              {job.matchedSkills && job.matchedSkills.length > 0 && (
                <div className="job-skills">
                  <strong>✅ Your Skills:</strong>
                  <div className="skills-list">
                    {job.matchedSkills.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="skill-badge skill-matched">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {job.missingSkills && job.missingSkills.length > 0 && (
                <div className="job-skills">
                  <strong>📚 Skills to Learn:</strong>
                  <div className="skills-list">
                    {job.missingSkills.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="skill-badge skill-missing">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="job-card-actions">
                <a
                  href={job.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-apply"
                >
                  Apply Now →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {!loading && hasMore && filteredJobs.length > 0 && (
          <div className="load-more-container">
            <button className="btn-load-more" onClick={handleLoadMore}>
              Load More Jobs
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="jobs-loading">
            <div className="spinner"></div>
            <p>Finding best job matches...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredJobs.length === 0 && jobs.length > 0 && (
          <div className="no-results">
            <h3>No jobs match your filters</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && jobRole && (
          <div className="no-results">
            <h3>No jobs found</h3>
            <p>Try searching with different filters or location</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
