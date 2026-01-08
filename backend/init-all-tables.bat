@echo off
REM Quick Deployment Script for Windows
REM Run this after deploying to initialize your PostgreSQL database

echo 🔧 Initializing PostgreSQL database...
echo.

REM Initialize main job_skills table
echo 📋 Creating job_skills table and seeding data...
call npm run init-db

echo.

REM Initialize history table
echo 📋 Creating resume_analyses table...
node initHistoryTable.js

echo.

REM Initialize progress tables
echo 📋 Creating skill_progress and achievements tables...
node initProgressTable.js

echo.

REM Initialize chat tables
echo 📋 Creating chat_sessions and chat_messages tables...
node initChatTable.js

echo.

REM Initialize admin table
echo 📋 Creating admins table...
node initAdminTable.js

echo.

REM Initialize courses table
echo 📋 Creating courses table...
node initCoursesTable.js

echo.
echo ✅ Database initialization complete!
echo 🎉 Your app is ready to use!
pause
