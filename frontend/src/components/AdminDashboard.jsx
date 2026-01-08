import React, { useState, useEffect, useCallback } from "react";
import "./AdminDashboard.css";
import {
  getAdminStats,
  getUsers,
  adminLogout,
  getAdminCourses,
  addAdminCourse,
  deleteAdminCourse,
} from "../services/adminApi";

const AdminDashboard = ({ admin, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newCourse, setNewCourse] = useState({
    title: "",
    stream: "",
    url: "",
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse, coursesResponse] = await Promise.all(
        [getAdminStats(), getUsers(currentPage, 10), getAdminCourses()]
      );

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.users);
        setTotalPages(usersResponse.pagination.totalPages);
      }

      if (coursesResponse.success) {
        setCourses(coursesResponse.courses);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = async () => {
    try {
      await adminLogout();
      onLogout();
    } catch (err) {
      console.error("Logout error:", err);
      onLogout(); // Logout anyway
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await addAdminCourse(newCourse);
      if (response.success) {
        // Reload all data to ensure consistency
        await loadDashboardData();
        setNewCourse({
          title: "",
          stream: "",
          url: "",
        });
        alert("Course added successfully!");
      }
    } catch (err) {
      console.error("Add course error:", err);
      alert("Failed to add course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }
    try {
      const response = await deleteAdminCourse(courseId);
      if (response.success) {
        setCourses(courses.filter((c) => c.id !== courseId));
        alert("Course deleted successfully!");
      }
    } catch (err) {
      console.error("Delete course error:", err);
      alert("Failed to delete course");
    }
  };

  if (loading && !stats) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Animated Background */}
      <div className="admin-dashboard-background">
        <div className="admin-dashboard-orb admin-orb-1"></div>
        <div className="admin-dashboard-orb admin-orb-2"></div>
        <div className="admin-dashboard-orb admin-orb-3"></div>
      </div>

      {/* Header */}
      <header className="admin-dashboard-header">
        <div className="admin-header-content">
          <div className="admin-branding">
            <h1 className="admin-hello">Hello Admin</h1>
          </div>
          <div className="admin-user-section">
            <button onClick={handleLogout} className="admin-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="admin-hero-section">
        <div className="admin-hero-content">
          <div className="admin-hero-text">
            <p className="admin-hero-badge">CAREER GUIDANCE 2.0</p>
            <h1 className="admin-hero-title">
              Your Gateway into
              <br />
              <span className="admin-hero-highlight">Professional Success</span>
            </h1>
            <p className="admin-hero-subtitle">
              HireIQ is a career platform. We make career guidance accessible.
            </p>
            <button className="admin-hero-btn">Explore Analytics</button>
          </div>
          <div className="admin-hero-shapes">
            <div className="admin-shape admin-shape-square"></div>
            <div className="admin-shape admin-shape-triangle"></div>
            <div className="admin-shape admin-shape-circle"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="admin-dashboard-content">
        {error && (
          <div className="admin-error-alert">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">TOTAL USERS</div>
              <div className="admin-stat-value-row">
                <h3>{stats?.totalUsers || 0}</h3>
                <span className="admin-stat-trend admin-trend-up">↑ 12%</span>
              </div>
              <div className="admin-stat-chart">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                  <polyline
                    points="0,20 20,15 40,18 60,10 80,12 100,8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">ANALYSES</div>
              <div className="admin-stat-value-row">
                <h3>{stats?.totalAnalyses || 0}</h3>
                <span className="admin-stat-trend admin-trend-up">↑ 8.4%</span>
              </div>
              <div className="admin-stat-chart">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                  <polyline
                    points="0,25 20,18 40,20 60,12 80,15 100,10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">RECENT</div>
              <div className="admin-stat-value-row">
                <h3>{stats?.recentAnalyses || 0}</h3>
                <span className="admin-stat-trend admin-trend-down">
                  ↓ 2.1%
                </span>
              </div>
              <div className="admin-stat-chart">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                  <polyline
                    points="0,15 20,12 40,18 60,20 80,22 100,25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">JOB ROLES</div>
              <div className="admin-stat-value-row">
                <h3>{stats?.uniqueJobRoles || 0}</h3>
                <span className="admin-stat-trend admin-trend-up">↑ 5.2%</span>
              </div>
              <div className="admin-stat-chart">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                  <polyline
                    points="0,22 20,20 40,15 60,18 80,10 100,12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Top Job Roles */}
        {stats?.topJobRoles && stats.topJobRoles.length > 0 && (
          <div className="admin-section">
            <h2 className="admin-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Top Job Roles
            </h2>
            <div className="admin-job-roles-grid">
              {stats.topJobRoles.map((role, index) => (
                <div key={index} className="admin-job-role-card">
                  <div className="admin-job-role-rank">#{index + 1}</div>
                  <div className="admin-job-role-info">
                    <h4>{role.job_role}</h4>
                    <p>{role.count} analyses</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Management Section */}
        <div className="admin-section admin-courses-section">
          <div className="admin-courses-header">
            <h2 className="admin-section-title">Manage Career Courses</h2>
            <span className="admin-control-badge">ADMIN CONTROL</span>
          </div>

          <div className="admin-courses-layout">
            {/* Add New Course Form */}
            <div className="admin-course-form-container">
              <h3 className="admin-form-title">Add New Course</h3>
              <form onSubmit={handleAddCourse} className="admin-course-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Course Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Master React in 30 Days"
                      value={newCourse.title}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Stream (Job Role)</label>
                    <select
                      value={newCourse.stream}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, stream: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Stream</option>
                      <option value="FRONTEND DEVELOPER">
                        Frontend Developer
                      </option>
                      <option value="BACKEND DEVELOPER">
                        Backend Developer
                      </option>
                      <option value="FULL STACK DEVELOPER">
                        Full Stack Developer
                      </option>
                      <option value="DATA SCIENTIST">Data Scientist</option>
                      <option value="DEVOPS ENGINEER">DevOps Engineer</option>
                      <option value="MOBILE DEVELOPER">Mobile Developer</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>YouTube Embed URL</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/embed/..."
                    value={newCourse.url}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, url: e.target.value })
                    }
                    required
                  />
                  <small className="admin-form-hint">
                    Must be an embed link (e.g. /embed/ID)
                  </small>
                </div>

                <button type="submit" className="admin-deploy-btn">
                  Deploy Course Now
                </button>
              </form>
            </div>

            {/* Active Courses List */}
            <div className="admin-active-courses">
              <h3 className="admin-form-title">
                Active Courses ({courses?.length || 0})
              </h3>
              <div className="admin-courses-list">
                {courses && courses.length > 0 ? (
                  courses.map((course) => (
                    <div key={course.id} className="admin-course-item">
                      <div className="admin-course-icon">
                        {course.icon || "📚"}
                      </div>
                      <div className="admin-course-info">
                        <h4>{course.title}</h4>
                        <p className="admin-course-stream">{course.stream}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="admin-delete-course-btn"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="admin-no-courses">No courses available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-section">
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Registered Users
          </h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Login Count</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        {user.picture && (
                          <img
                            src={user.picture}
                            alt={user.name}
                            className="admin-user-avatar"
                          />
                        )}
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className="admin-badge">
                        {user.login_count || 1}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="admin-pagination-btn"
              >
                Previous
              </button>
              <span className="admin-pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="admin-pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
