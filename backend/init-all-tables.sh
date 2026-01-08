#!/bin/bash

# Quick Deployment Script for Render/Heroku
# Run this after deploying to initialize your PostgreSQL database

echo "🔧 Initializing PostgreSQL database..."
echo ""

# Initialize main job_skills table
echo "📋 Creating job_skills table and seeding data..."
npm run init-db

echo ""

# Initialize history table
echo "📋 Creating resume_analyses table..."
node initHistoryTable.js

echo ""

# Initialize progress tables
echo "📋 Creating skill_progress and achievements tables..."
node initProgressTable.js

echo ""

# Initialize chat tables
echo "📋 Creating chat_sessions and chat_messages tables..."
node initChatTable.js

echo ""

# Initialize admin table
echo "📋 Creating admins table..."
node initAdminTable.js

echo ""

# Initialize courses table
echo "📋 Creating courses table..."
node initCoursesTable.js

echo ""
echo "✅ Database initialization complete!"
echo "🎉 Your app is ready to use!"
