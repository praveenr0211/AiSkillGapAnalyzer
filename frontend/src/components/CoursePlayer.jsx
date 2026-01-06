import React, { useState } from "react";
import "./CoursePlayer.css";

const CoursePlayer = ({ course, onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState(
    course.videos.length > 0 ? course.videos[0] : null
  );
  const [activeTab, setActiveTab] = useState("modules");

  if (!selectedVideo) {
    return (
      <div className="course-player-container">
        <div className="no-videos">
          <h2>No videos available for this course yet</h2>
          <button onClick={onBack} className="back-btn-player">
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-player-container">
      {/* Sidebar */}
      <div className="course-sidebar">
        <div className="sidebar-header">
          <button onClick={onBack} className="back-btn-player">
            ←
          </button>
          <h2>My Courses</h2>
        </div>

        <div className="course-list">
          {[course].map((c) => (
            <div key={c.id} className="sidebar-course active">
              <div className="course-thumbnail">
                <div className="course-icon-small">{c.icon}</div>
              </div>
              <div className="course-details">
                <h3>{c.title}</h3>
                <p>
                  {c.lessons} lessons • {c.hours} hours
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="course-main-content">
        {/* Video Player */}
        <div className="video-player-section">
          <div className="video-wrapper">
            <iframe
              width="100%"
              height="100%"
              src={selectedVideo.url}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Course Info */}
        <div className="course-content-info">
          <h1>{selectedVideo.title}</h1>
          <div className="instructor-info">
            <div className="instructor-avatar">👨‍🏫</div>
            <div className="instructor-details">
              <span className="instructor-name">John Smith</span>
              <span className="instructor-role">Sr. Product Designer</span>
            </div>
            <button className="follow-btn">+ Follow</button>
            <button className="mentor-btn">Mentor</button>
            <button className="watch-later-btn">Watch Later</button>
          </div>

          {/* Tabs */}
          <div className="content-tabs">
            <button
              className={`tab-btn ${activeTab === "class" ? "active" : ""}`}
              onClick={() => setActiveTab("class")}
            >
              CLASS DETAIL
            </button>
            <button
              className={`tab-btn ${
                activeTab === "assignments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("assignments")}
            >
              ASSIGNMENTS
            </button>
            <button
              className={`tab-btn ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              PROJECTS
            </button>
            <button
              className={`tab-btn ${activeTab === "exams" ? "active" : ""}`}
              onClick={() => setActiveTab("exams")}
            >
              EXAMS
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "class" && (
              <div className="class-detail">
                <h3>About this Course</h3>
                <p>
                  This comprehensive course covers all the essential topics in{" "}
                  {course.title}. You'll learn through hands-on projects and
                  real-world examples.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Modules */}
      <div className="modules-sidebar">
        <div className="modules-header">
          <button
            className={`module-tab ${activeTab === "modules" ? "active" : ""}`}
            onClick={() => setActiveTab("modules")}
          >
            MODULE
          </button>
          <button
            className={`module-tab ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            LIVE COMMENTS
          </button>
        </div>

        <div className="modules-list">
          {course.videos.map((video, index) => (
            <div
              key={video.id}
              className={`module-item ${
                selectedVideo.id === video.id ? "active" : ""
              }`}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="module-number">
                {selectedVideo.id === video.id ? "▶" : index + 1}
              </div>
              <div className="module-info">
                <h4>{video.title}</h4>
                <span className="module-duration">{video.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {course.videos.length === 0 && (
          <div className="no-modules">
            <p>No video modules available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
