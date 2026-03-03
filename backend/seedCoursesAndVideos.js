require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { Pool } = require("pg");

/**
 * Seed courses and videos tables with sample data
 */
async function seedCoursesAndVideos() {
  console.log("🔧 Seeding Courses and Videos data...\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  try {
    const client = await pool.connect();
    console.log("✅ Connected to Neon PostgreSQL\n");

    // Sample courses data
    const courses = [
      {
        title: "Complete React Developer Course",
        stream: "Frontend Development",
        url: "https://www.udemy.com/course/react-the-complete-guide",
        icon: "⚛️",
        lessons: 45,
        hours: 38.5,
        color: "#61dafb",
      },
      {
        title: "Node.js - The Complete Guide",
        stream: "Backend Development",
        url: "https://www.udemy.com/course/nodejs-the-complete-guide",
        icon: "🟢",
        lessons: 52,
        hours: 42.0,
        color: "#68a063",
      },
      {
        title: "Python for Data Science",
        stream: "Data Science",
        url: "https://www.coursera.org/learn/python-for-data-science",
        icon: "🐍",
        lessons: 30,
        hours: 25.0,
        color: "#3776ab",
      },
      {
        title: "Machine Learning A-Z",
        stream: "AI/ML",
        url: "https://www.udemy.com/course/machinelearning",
        icon: "🤖",
        lessons: 40,
        hours: 35.0,
        color: "#ff6b6b",
      },
      {
        title: "AWS Certified Solutions Architect",
        stream: "Cloud Computing",
        url: "https://www.udemy.com/course/aws-certified-solutions-architect",
        icon: "☁️",
        lessons: 60,
        hours: 50.0,
        color: "#ff9900",
      },
      {
        title: "Full Stack Web Development",
        stream: "Full Stack",
        url: "https://www.udemy.com/course/the-complete-web-development-bootcamp",
        icon: "💻",
        lessons: 65,
        hours: 55.0,
        color: "#667eea",
      },
      {
        title: "Docker & Kubernetes",
        stream: "DevOps",
        url: "https://www.udemy.com/course/docker-kubernetes",
        icon: "🐳",
        lessons: 35,
        hours: 28.0,
        color: "#0db7ed",
      },
      {
        title: "React Native - Mobile Development",
        stream: "Mobile Development",
        url: "https://www.udemy.com/course/react-native-the-practical-guide",
        icon: "📱",
        lessons: 38,
        hours: 32.0,
        color: "#61dafb",
      },
    ];

    console.log("📚 Inserting courses...");
    const courseIds = [];

    for (const course of courses) {
      // Check if course already exists
      const existing = await client.query(
        "SELECT id FROM courses WHERE title = $1",
        [course.title]
      );

      if (existing.rows.length > 0) {
        console.log(`  ⏭️  ${course.title} (already exists)`);
        courseIds.push(existing.rows[0].id);
      } else {
        const result = await client.query(
          `INSERT INTO courses (title, stream, url, icon, lessons, hours, color) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [
            course.title,
            course.stream,
            course.url,
            course.icon,
            course.lessons,
            course.hours,
            course.color,
          ]
        );
        courseIds.push(result.rows[0].id);
        console.log(`  ✅ ${course.title}`);
      }
    }

    console.log(`\n✅ Inserted ${courses.length} courses\n`);

    // Sample videos for first 3 courses
    console.log("🎥 Inserting sample videos...");

    const videos = [
      // React course videos
      {
        course_id: courseIds[0],
        title: "Introduction to React",
        url: "https://youtube.com/watch?v=react1",
        duration: "15:30",
        order_index: 1,
      },
      {
        course_id: courseIds[0],
        title: "React Components & Props",
        url: "https://youtube.com/watch?v=react2",
        duration: "22:45",
        order_index: 2,
      },
      {
        course_id: courseIds[0],
        title: "State Management in React",
        url: "https://youtube.com/watch?v=react3",
        duration: "28:15",
        order_index: 3,
      },
      // Node.js course videos
      {
        course_id: courseIds[1],
        title: "Node.js Fundamentals",
        url: "https://youtube.com/watch?v=node1",
        duration: "18:20",
        order_index: 1,
      },
      {
        course_id: courseIds[1],
        title: "Express.js Basics",
        url: "https://youtube.com/watch?v=node2",
        duration: "25:10",
        order_index: 2,
      },
      // Python course videos
      {
        course_id: courseIds[2],
        title: "Python Basics for Data Science",
        url: "https://youtube.com/watch?v=python1",
        duration: "20:00",
        order_index: 1,
      },
      {
        course_id: courseIds[2],
        title: "Pandas and NumPy",
        url: "https://youtube.com/watch?v=python2",
        duration: "30:45",
        order_index: 2,
      },
    ];

    let videoCount = 0;
    for (const video of videos) {
      // Check if video already exists
      const existing = await client.query(
        "SELECT id FROM videos WHERE title = $1 AND course_id = $2",
        [video.title, video.course_id]
      );

      if (existing.rows.length > 0) {
        console.log(`  ⏭️  ${video.title} (already exists)`);
      } else {
        await client.query(
          `INSERT INTO videos (course_id, title, url, duration, order_index) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            video.course_id,
            video.title,
            video.url,
            video.duration,
            video.order_index,
          ]
        );
        console.log(`  ✅ ${video.title}`);
        videoCount++;
      }
    }

    console.log(`\n✅ Inserted ${videoCount} videos\n`);

    client.release();
    await pool.end();

    console.log("🎉 Courses and Videos seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    await pool.end();
    process.exit(1);
  }
}

seedCoursesAndVideos();
