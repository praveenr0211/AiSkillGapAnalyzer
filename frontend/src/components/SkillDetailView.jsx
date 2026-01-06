import React, { useState, useEffect } from "react";
import "./SkillDetailView.css";

const SkillDetailView = ({ skill, roadmapItem, onClose }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = (e) => {
      setScrollY(e.target.scrollTop);
    };

    const modalContent = document.querySelector(".skill-detail-content");
    if (modalContent) {
      modalContent.addEventListener("scroll", handleScroll);
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      if (modalContent) {
        modalContent.removeEventListener("scroll", handleScroll);
      }
      document.body.style.overflow = "auto";
    };
  }, []);

  // Generate detailed topics based on the skill
  const getDetailedTopics = (skillName) => {
    const topicsMap = {
      JavaScript: [
        {
          title: "Core Fundamentals",
          topics: [
            "Variables, Data Types & Operators",
            "Control Flow & Loops",
            "Functions & Arrow Functions",
            "Scope & Closures",
            "Objects & Arrays",
          ],
          icon: "🎯",
          color: "#f7df1e",
        },
        {
          title: "Advanced Concepts",
          topics: [
            "Promises & Async/Await",
            "ES6+ Features",
            "Destructuring & Spread Operator",
            "Modules & Imports",
            "Error Handling",
          ],
          icon: "🚀",
          color: "#764ba2",
        },
        {
          title: "DOM & Browser APIs",
          topics: [
            "DOM Manipulation",
            "Event Handling",
            "Local Storage & Session Storage",
            "Fetch API & AJAX",
            "Browser DevTools",
          ],
          icon: "🌐",
          color: "#667eea",
        },
        {
          title: "Best Practices",
          topics: [
            "Clean Code Principles",
            "Debugging Techniques",
            "Performance Optimization",
            "Security Best Practices",
            "Testing with Jest",
          ],
          icon: "✨",
          color: "#4caf50",
        },
      ],
      React: [
        {
          title: "React Basics",
          topics: [
            "Components & JSX",
            "Props & State",
            "Event Handling",
            "Conditional Rendering",
            "Lists & Keys",
          ],
          icon: "⚛️",
          color: "#61dafb",
        },
        {
          title: "Hooks",
          topics: [
            "useState & useEffect",
            "useContext & useReducer",
            "useRef & useMemo",
            "useCallback",
            "Custom Hooks",
          ],
          icon: "🎣",
          color: "#764ba2",
        },
        {
          title: "Advanced Topics",
          topics: [
            "React Router",
            "State Management (Redux/Context)",
            "API Integration",
            "Form Handling & Validation",
            "Error Boundaries",
          ],
          icon: "🔥",
          color: "#ff6b6b",
        },
        {
          title: "Production Ready",
          topics: [
            "Performance Optimization",
            "Code Splitting & Lazy Loading",
            "Testing (Jest & React Testing Library)",
            "Build & Deployment",
            "SEO & Accessibility",
          ],
          icon: "🏆",
          color: "#51cf66",
        },
      ],
      Python: [
        {
          title: "Python Fundamentals",
          topics: [
            "Variables & Data Types",
            "Control Structures",
            "Functions & Lambda",
            "List Comprehensions",
            "File I/O Operations",
          ],
          icon: "🐍",
          color: "#3776ab",
        },
        {
          title: "Object-Oriented Programming",
          topics: [
            "Classes & Objects",
            "Inheritance & Polymorphism",
            "Encapsulation",
            "Magic Methods",
            "Decorators",
          ],
          icon: "📦",
          color: "#ffd43b",
        },
        {
          title: "Advanced Python",
          topics: [
            "Generators & Iterators",
            "Context Managers",
            "Threading & Multiprocessing",
            "Regular Expressions",
            "Working with APIs",
          ],
          icon: "⚡",
          color: "#667eea",
        },
        {
          title: "Libraries & Frameworks",
          topics: [
            "NumPy & Pandas",
            "Flask/Django Basics",
            "Data Visualization",
            "Testing with Pytest",
            "Virtual Environments",
          ],
          icon: "🛠️",
          color: "#51cf66",
        },
      ],
      "Node.js": [
        {
          title: "Node.js Basics",
          topics: [
            "Node.js Runtime & V8 Engine",
            "Modules & NPM",
            "File System Operations",
            "Event Loop & Async Programming",
            "Buffers & Streams",
          ],
          icon: "💚",
          color: "#339933",
        },
        {
          title: "Express.js Framework",
          topics: [
            "Routing & Middleware",
            "Request & Response Handling",
            "Template Engines",
            "Error Handling",
            "RESTful API Design",
          ],
          icon: "🚂",
          color: "#000000",
        },
        {
          title: "Database Integration",
          topics: [
            "MongoDB & Mongoose",
            "PostgreSQL & Sequelize",
            "Redis for Caching",
            "Connection Pooling",
            "Database Migrations",
          ],
          icon: "🗄️",
          color: "#4caf50",
        },
        {
          title: "Advanced Topics",
          topics: [
            "Authentication (JWT, OAuth)",
            "WebSockets & Real-time Apps",
            "Testing (Mocha, Jest)",
            "Security Best Practices",
            "Deployment & DevOps",
          ],
          icon: "🔒",
          color: "#764ba2",
        },
      ],
      TypeScript: [
        {
          title: "TypeScript Fundamentals",
          topics: [
            "Type Annotations & Inference",
            "Interfaces & Types",
            "Basic Types & Type Assertions",
            "Functions & Optional Parameters",
            "Union & Intersection Types",
          ],
          icon: "📘",
          color: "#3178c6",
        },
        {
          title: "Advanced Types",
          topics: [
            "Generics & Type Parameters",
            "Utility Types (Partial, Pick, Omit)",
            "Mapped & Conditional Types",
            "Type Guards & Narrowing",
            "Literal & Template Literal Types",
          ],
          icon: "🎯",
          color: "#764ba2",
        },
        {
          title: "OOP in TypeScript",
          topics: [
            "Classes & Inheritance",
            "Access Modifiers",
            "Abstract Classes",
            "Decorators",
            "Namespaces & Modules",
          ],
          icon: "🏗️",
          color: "#667eea",
        },
        {
          title: "Configuration & Tools",
          topics: [
            "tsconfig.json Setup",
            "Compiler Options",
            "Integration with React/Node",
            "Type Definition Files (.d.ts)",
            "Linting with ESLint",
          ],
          icon: "⚙️",
          color: "#51cf66",
        },
      ],
      SQL: [
        {
          title: "SQL Basics",
          topics: [
            "SELECT, INSERT, UPDATE, DELETE",
            "WHERE Clauses & Filtering",
            "ORDER BY & Sorting",
            "Aggregate Functions (COUNT, SUM, AVG)",
            "GROUP BY & HAVING",
          ],
          icon: "🗃️",
          color: "#00758f",
        },
        {
          title: "Joins & Relationships",
          topics: [
            "INNER JOIN",
            "LEFT/RIGHT/FULL OUTER JOIN",
            "Self Joins",
            "Cross Joins",
            "Subqueries & Nested Queries",
          ],
          icon: "🔗",
          color: "#764ba2",
        },
        {
          title: "Database Design",
          topics: [
            "Primary & Foreign Keys",
            "Normalization (1NF, 2NF, 3NF)",
            "Indexes & Performance",
            "Constraints & Data Integrity",
            "ER Diagrams",
          ],
          icon: "📐",
          color: "#667eea",
        },
        {
          title: "Advanced SQL",
          topics: [
            "Window Functions",
            "CTEs (Common Table Expressions)",
            "Stored Procedures & Functions",
            "Triggers",
            "Transactions & ACID Properties",
          ],
          icon: "⚡",
          color: "#ff6b6b",
        },
      ],
      Docker: [
        {
          title: "Docker Fundamentals",
          topics: [
            "Containers vs Virtual Machines",
            "Docker Images & Containers",
            "Dockerfile Basics",
            "Docker Hub & Registries",
            "Basic Docker Commands",
          ],
          icon: "🐳",
          color: "#2496ed",
        },
        {
          title: "Docker Compose",
          topics: [
            "Multi-Container Applications",
            "docker-compose.yml Configuration",
            "Service Dependencies",
            "Volumes & Networks",
            "Environment Variables",
          ],
          icon: "🎼",
          color: "#764ba2",
        },
        {
          title: "Docker Networking",
          topics: [
            "Bridge Networks",
            "Host & Overlay Networks",
            "Container Communication",
            "Port Mapping",
            "Network Security",
          ],
          icon: "🌐",
          color: "#667eea",
        },
        {
          title: "Production & Best Practices",
          topics: [
            "Multi-Stage Builds",
            "Image Optimization",
            "Security Scanning",
            "Docker Swarm Basics",
            "CI/CD with Docker",
          ],
          icon: "🚀",
          color: "#51cf66",
        },
      ],
      Git: [
        {
          title: "Git Basics",
          topics: [
            "Repository Initialization",
            "Commits & Commit Messages",
            "Staging & Unstaging",
            "Viewing History (log, diff)",
            ".gitignore Configuration",
          ],
          icon: "📝",
          color: "#f05032",
        },
        {
          title: "Branching & Merging",
          topics: [
            "Creating & Switching Branches",
            "Merging Strategies",
            "Resolving Conflicts",
            "Rebasing",
            "Cherry-picking",
          ],
          icon: "🌿",
          color: "#764ba2",
        },
        {
          title: "Remote Collaboration",
          topics: [
            "Push, Pull, Fetch",
            "Remote Repository Management",
            "Pull Requests & Code Reviews",
            "Forking & Contributing",
            "GitHub/GitLab Workflows",
          ],
          icon: "🤝",
          color: "#667eea",
        },
        {
          title: "Advanced Git",
          topics: [
            "Git Hooks",
            "Interactive Rebase",
            "Stashing Changes",
            "Submodules",
            "Git Best Practices & Workflows",
          ],
          icon: "⚡",
          color: "#ff6b6b",
        },
      ],
      // Default topics for any other skill
      default: [
        {
          title: "Getting Started",
          topics: [
            "Introduction & Setup",
            "Basic Concepts",
            "Core Syntax",
            "Development Environment",
            "First Project",
          ],
          icon: "🌟",
          color: "#667eea",
        },
        {
          title: "Intermediate Level",
          topics: [
            "Advanced Features",
            "Best Practices",
            "Common Patterns",
            "Problem Solving",
            "Real-world Applications",
          ],
          icon: "📈",
          color: "#764ba2",
        },
        {
          title: "Advanced Mastery",
          topics: [
            "Optimization Techniques",
            "Architecture Patterns",
            "Testing & Debugging",
            "Security Considerations",
            "Performance Tuning",
          ],
          icon: "🎓",
          color: "#ff6b6b",
        },
        {
          title: "Professional Skills",
          topics: [
            "Industry Standards",
            "Build & Deployment",
            "Version Control",
            "Documentation",
            "Community & Resources",
          ],
          icon: "💼",
          color: "#51cf66",
        },
      ],
    };

    return topicsMap[skillName] || topicsMap.default;
  };

  const topics = getDetailedTopics(skill);

  return (
    <div className="skill-detail-modal" onClick={onClose}>
      <div
        className="skill-detail-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        <div className="skill-detail-content">
          {/* Hero Section with Parallax */}
          <div
            className="skill-hero"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          >
            <div className="hero-background">
              <div className="animated-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
              </div>
            </div>
            <h1 className="skill-title">{skill}</h1>
            <p className="skill-subtitle">Complete Learning Path & Roadmap</p>
            {roadmapItem && (
              <div className="skill-timeline">
                <span className="timeline-badge">
                  ⏱️ {roadmapItem.timeline}
                </span>
              </div>
            )}
          </div>

          {/* Topics Roadmap - Visual Journey */}
          <div className="topics-section">
            <h2 className="section-title">📚 Your Learning Journey</h2>
            <div className="roadmap-journey">
              <svg
                className="roadmap-path"
                viewBox="0 0 100 400"
                preserveAspectRatio="none"
              >
                <path
                  d="M 50 0 Q 70 100, 50 200 Q 30 300, 50 400"
                  className="journey-path"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="10"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#764ba2" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f093fb" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="journey-stops">
                {topics.map((section, index) => (
                  <div
                    key={index}
                    className={`journey-stop ${
                      index % 2 === 0 ? "left" : "right"
                    }`}
                    style={{
                      animationDelay: `${index * 0.2}s`,
                    }}
                  >
                    <div className="stop-connector">
                      <div className="connector-line"></div>
                      <div
                        className="stop-marker"
                        style={{
                          background: section.color,
                          boxShadow: `0 0 20px ${section.color}80`,
                        }}
                      >
                        <span className="stop-number">{index + 1}</span>
                      </div>
                    </div>

                    <div
                      className="stop-card"
                      style={{
                        borderColor: section.color,
                      }}
                    >
                      <div
                        className="stop-header"
                        style={{
                          background: `linear-gradient(135deg, ${section.color}dd 0%, ${section.color} 100%)`,
                        }}
                      >
                        <span className="stop-icon">{section.icon}</span>
                        <h3>{section.title}</h3>
                      </div>

                      <div className="stop-content">
                        <ul className="journey-topics">
                          {section.topics.map((topic, tIndex) => (
                            <li key={tIndex} className="journey-topic-item">
                              <span
                                className="topic-bullet"
                                style={{ background: section.color }}
                              >
                                →
                              </span>
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div
                        className="stop-badge"
                        style={{ background: section.color }}
                      >
                        Level {index + 1}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Destination/Goal Marker */}
                <div className="journey-destination">
                  <div className="destination-marker">
                    <span className="destination-flag">🏆</span>
                  </div>
                  <div className="destination-label">
                    <h3>Master {skill}!</h3>
                    <p>You've completed the journey</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Courses Section */}
          {roadmapItem?.resources && roadmapItem.resources.length > 0 && (
            <div className="courses-section">
              <h2 className="section-title">🎓 Recommended Courses</h2>
              <div className="courses-showcase">
                {roadmapItem.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="showcase-card"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="card-glow"></div>
                    <div
                      className={`showcase-platform platform-${resource.platform
                        .toLowerCase()
                        .replace(/\s+/g, "")}`}
                    >
                      {resource.platform}
                    </div>
                    <h4 className="showcase-title">{resource.title}</h4>
                    <div className="showcase-meta">
                      <span className="showcase-rating">
                        ⭐ {resource.rating}
                      </span>
                      <span className="showcase-cost">
                        {resource.cost.toLowerCase() === "free"
                          ? "🎁 FREE"
                          : `💰 ${resource.cost}`}
                      </span>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="showcase-link"
                    >
                      Start Learning →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice Projects Section */}
          {roadmapItem?.projects && roadmapItem.projects.length > 0 && (
            <div className="projects-section">
              <h2 className="section-title">💡 Hands-On Projects</h2>
              <div className="projects-list">
                {roadmapItem.projects.map((project, index) => (
                  <div
                    key={index}
                    className="project-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="project-number">{index + 1}</div>
                    <div className="project-content">
                      <p>{project}</p>
                      <div className="project-tags">
                        <span className="tag">Beginner-Friendly</span>
                        <span className="tag">Portfolio Project</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Motivational Footer */}
          <div className="motivational-footer">
            <div className="motivation-card">
              <h3>🎯 Your Learning Journey Starts Here!</h3>
              <p>
                Consistency is key. Dedicate time daily, build projects, and
                you'll master {skill} in no time!
              </p>
              <div className="progress-steps">
                <div className="step">
                  <div className="step-icon">1️⃣</div>
                  <span>Learn Basics</span>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-icon">2️⃣</div>
                  <span>Practice Daily</span>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-icon">3️⃣</div>
                  <span>Build Projects</span>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-icon">🏆</div>
                  <span>Master {skill}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetailView;
