import React, { useState, useEffect, useCallback } from "react";
import "./Courses.css";
import CoursePlayer from "./CoursePlayer";
import axios from "axios";

const Courses = ({ onBack }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      const API_URL =
        process.env.NODE_ENV === "production"
          ? "/api/courses"
          : process.env.REACT_APP_API_URL
          ? `${process.env.REACT_APP_API_URL}/api/courses`
          : "http://localhost:5000/api/courses";

      const response = await axios.get(API_URL);
      console.log("Fetched courses:", response.data);
      if (response.data.success) {
        // Ensure all courses have videos array (even if empty)
        const coursesWithVideos = response.data.courses.map((course) => ({
          ...course,
          videos: course.videos || [],
        }));
        setCourses(coursesWithVideos);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      // Fallback to default courses if API fails
      setCourses(getDefaultCourses());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getDefaultCourses = () => [
    {
      id: "dsa",
      title: "Data Structures & Algorithms",
      icon: "🔍",
      lessons: 3,
      hours: 2,
      color: "#667eea",
      stream: "FRONTEND DEVELOPER",
      videos: [
        {
          id: 1,
          title: "01 - Binary Trees",
          duration: "45:30",
          url: "https://www.youtube.com/embed/KsmlnrGmZrw",
        },
        {
          id: 2,
          title: "02 - Stacks",
          duration: "38:15",
          url: "https://www.youtube.com/embed/L2PhsCtFEfk",
        },
        {
          id: 3,
          title: "03 - Arrays",
          duration: "42:20",
          url: "https://www.youtube.com/embed/anZNJ0pxhqE",
        },
      ],
    },
    {
      id: "java",
      title: "Java Programming",
      icon: "☕",
      lessons: 1,
      hours: 1,
      color: "#764ba2",
      videos: [
        {
          id: 1,
          title: "01 - Java Programming",
          duration: "55:20",
          url: "https://www.youtube.com/embed/eIrMbAQSU34",
        },
      ],
    },
    {
      id: "python",
      title: "Python Development",
      icon: "🐍",
      lessons: 1,
      hours: 1,
      color: "#f093fb",
      videos: [
        {
          id: 1,
          title: "01 - Python Programming",
          duration: "48:35",
          url: "https://www.youtube.com/embed/K5KVEU3aaeQ",
        },
      ],
    },
    {
      id: "html",
      title: "HTML & CSS",
      icon: "🌐",
      lessons: 1,
      hours: 1,
      color: "#667eea",
      videos: [
        {
          id: 1,
          title: "01 - HTML & CSS Tutorial",
          duration: "52:15",
          url: "https://www.youtube.com/embed/G3e-cpL7ofc",
        },
      ],
    },
    {
      id: "javascript",
      title: "JavaScript Mastery",
      icon: "⚡",
      lessons: 1,
      hours: 1,
      color: "#764ba2",
      videos: [
        {
          id: 1,
          title: "01 - JavaScript Tutorial",
          duration: "60:45",
          url: "https://www.youtube.com/embed/PkZNo7MFNFg",
        },
      ],
    },
  ];

  if (selectedCourse) {
    return (
      <CoursePlayer
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="courses-container">
        <div className="courses-header">
          <button onClick={onBack} className="back-btn-courses">
            ← Back
          </button>
          <h1>📚 My Courses</h1>
        </div>
        <div style={{ textAlign: "center", padding: "3rem", color: "#667eea" }}>
          Loading courses...
        </div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <button onClick={onBack} className="back-btn-courses">
          ← Back
        </button>
        <h1>📚 My Courses</h1>
        <div className="search-box">
          <input type="text" placeholder="Search course & class" />
        </div>
      </div>

      <div className="courses-stats">
        <div className="stat-badge">
          <span className="stat-number">{courses.length}</span>
          <span className="stat-label">Total Courses</span>
        </div>
        <div className="stat-badge">
          <span className="stat-number">7</span>
          <span className="stat-label">Total Lessons</span>
        </div>
        <div className="stat-badge">
          <span className="stat-number">6</span>
          <span className="stat-label">Total Hours</span>
        </div>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div
            key={course.id}
            className="course-card"
            onClick={() => setSelectedCourse(course)}
            style={{ "--card-color": course.color }}
          >
            <div className="course-icon">{course.icon}</div>
            <div className="course-info">
              <h3>{course.title}</h3>
              <div className="course-meta">
                <span>{course.lessons} lessons</span>
                <span>•</span>
                <span>{course.hours} hours</span>
              </div>
            </div>
            <div className="course-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.random() * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
