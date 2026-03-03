# 🚀 Neon PostgreSQL Integration Guide

This guide will help you integrate Neon PostgreSQL database with your GDG Skill Gap Analyzer project deployed on Render.

## Why Neon PostgreSQL?

- ✅ **Generous Free Tier**: 0.5 GB storage, autoscaling, 10 branches
- ✅ **Serverless**: Scales to zero when inactive (no wasted resources)
- ✅ **Fast**: Modern architecture with instant branching
- ✅ **Reliable**: Better uptime than Render's free PostgreSQL
- ✅ **AWS-based**: Low latency with your Render deployment

---

## 📋 Step 1: Create Neon Database

1. **Sign up for Neon** (if you haven't already):
   - Go to: https://neon.tech
   - Sign up with GitHub, Google, or email
   - You'll automatically get the free tier

2. **Create a New Project**:
   - Click **"Create Project"**
   - **Project Name**: `skillgap-analyzer` (or your choice)
   - **Postgres Version**: Select **17** (recommended)
   - **Cloud Provider**: Select **AWS**
   - **Region**: Choose **US East 1 (N. Virginia)** (closest to Render Oregon)
     - This minimizes latency between your Render app and database
   - Leave **Neon Auth** disabled (we're using our own auth)
   - Click **"Create project"**

3. **Copy Your Connection String**:
   After project creation, you'll see a connection string like:
   ```
   postgresql://neondb_owner:AbCd123XyZ...@ep-cool-cloud-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   - **IMPORTANT**: Save this connection string securely!
   - You can always retrieve it from the Neon dashboard under **"Connection Details"**

---

## 🔧 Step 2: Configure Render Environment Variables

1. **Go to Render Dashboard**:
   - Navigate to https://dashboard.render.com
   - Select your **backend service** (`skillgap-analyzer-backend`)

2. **Update Environment Variables**:
   - Go to **Environment** tab
   - Find `DATABASE_URL` variable
   - **Update** its value to your Neon connection string:
     ```
     postgresql://neondb_owner:AbCd123XyZ...@ep-cool-cloud-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```
   - Click **"Save Changes"**

3. **Verify Other Variables**:
   Make sure these are also set:
   - `NODE_ENV=production`
   - `SESSION_SECRET` (auto-generated)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_GEMINI_API_KEY`
   - `FRONTEND_URL` (your frontend URL)

---

## 🗄️ Step 3: Initialize Database Tables

Your app needs to create the necessary tables in the new Neon database.

### Option A: Auto-initialization (Run on Render)

1. **Connect to your Render backend shell**:
   - In Render Dashboard → Your Backend Service
   - Click **"Shell"** tab
   - This opens a terminal to your running app

2. **Run initialization scripts**:
   ```bash
   cd backend
   node initDatabase.js
   node initHistoryTable.js
   node initProgressTable.js
   node initChatTable.js
   node initAdminTable.js
   node initCoursesTable.js
   node initVideosTable.js
   ```

### Option B: Deploy and Auto-run (Recommended)

Add a post-deploy script to your `render.yaml`:

```yaml
services:
  - type: web
    name: skillgap-analyzer-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node initAllTables.js && node server.js
```

But first, create `backend/initAllTables.js`:

```javascript
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

async function initAllTables() {
  console.log("🔧 Initializing all database tables...");
  
  try {
    await require("./initDatabase")();
    await require("./initHistoryTable")();
    await require("./initProgressTable")();
    await require("./initChatTable")();
    await require("./initAdminTable")();
    await require("./initCoursesTable")();
    await require("./initVideosTable")();
    
    console.log("✅ All tables initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing tables:", error);
    // Don't exit - let the server start anyway
  }
}

if (require.main === module) {
  initAllTables();
}

module.exports = initAllTables;
```

---

## 🔍 Step 4: Verify Connection

1. **Trigger a Redeploy**:
   - In Render Dashboard → Backend Service
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Or push a new commit to trigger auto-deploy

2. **Check Logs**:
   - Go to **Logs** tab in Render
   - Look for these success messages:
     ```
     ✅ Connected to PostgreSQL database (Neon)
     ✅ Database connection test successful
     ✅ Table created successfully
     ```

3. **Test Your App**:
   - Visit your frontend URL
   - Try uploading a resume
   - Check if analysis works
   - Verify history is saved

---

## 🎯 Step 5: Verify Tables in Neon Console

1. **Open Neon SQL Editor**:
   - Go to Neon Dashboard → Your Project
   - Click **"SQL Editor"** in the sidebar

2. **Run verification queries**:
   ```sql
   -- List all tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';

   -- Check tables exist
   SELECT COUNT(*) FROM job_skills;
   SELECT COUNT(*) FROM analysis_history;
   SELECT COUNT(*) FROM user_progress;
   SELECT COUNT(*) FROM chat_sessions;
   SELECT COUNT(*) FROM chat_messages;
   SELECT COUNT(*) FROM admin_users;
   SELECT COUNT(*) FROM courses;
   SELECT COUNT(*) FROM videos;
   ```

3. **Expected tables**:
   - `job_skills` - Job role requirements
   - `analysis_history` - Resume analysis results
   - `user_progress` - User skill tracking
   - `chat_sessions` - Chatbot sessions
   - `chat_messages` - Chat history
   - `admin_users` - Admin accounts
   - `courses` - Course catalog
   - `videos` - Video library

---

## 🎨 Local Development with Neon (Optional)

If you want to use Neon locally instead of SQLite:

1. **Create a `.env` file** in project root:
   ```bash
   cp .env.example .env
   ```

2. **Add your Neon connection string**:
   ```env
   DATABASE_URL=postgresql://neondb_owner:AbCd123XyZ...@ep-cool-cloud-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **Run init scripts locally**:
   ```bash
   cd backend
   node initDatabase.js
   node initHistoryTable.js
   # ... etc
   ```

4. **Start your app**:
   ```bash
   npm start
   ```

🎉 Your app will now use Neon PostgreSQL instead of SQLite!

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** (already in `.gitignore`)
2. **Keep connection strings secret** - don't share in public repos
3. **Use environment variables** for all sensitive data
4. **Enable IP restrictions** in Neon (if needed) - though Render IPs are dynamic
5. **Regularly rotate passwords** in Neon dashboard

---

## 📊 Monitoring & Maintenance

### Neon Dashboard Features:

1. **Metrics**:
   - Monitor database size, queries, connections
   - Track active time vs idle time

2. **Branches**:
   - Create branches for testing (like Git branches!)
   - Each branch is an isolated copy of your database

3. **History**:
   - Point-in-time recovery
   - Restore to any point in last 7 days (free tier)

4. **Backups**:
   - Automatic continuous backups
   - No manual backup needed

### Render Monitoring:

- Check **Logs** tab for database connection issues
- Monitor **Metrics** for response times
- Set up **Alerts** for downtime

---

## 🐛 Troubleshooting

### Issue: "Connection refused" or "timeout"

**Solution**:
- Verify connection string is correct in Render environment variables
- Check if `sslmode=require` is in the connection string
- Ensure Neon project is active (not paused)

### Issue: "Table does not exist"

**Solution**:
- Run initialization scripts via Render shell (Step 3)
- Check Render logs for table creation errors
- Verify tables in Neon SQL Editor

### Issue: "SSL certificate error"

**Solution**:
- Connection string must include `?sslmode=require`
- Verify `ssl: { rejectUnauthorized: false }` in `backend/config/database.js`

### Issue: "Too many connections"

**Solution**:
- Neon free tier: 100 concurrent connections
- Reduce `max: 20` in `database.js` to `max: 10`
- Check for connection leaks in code

### Issue: App works locally but not on Render

**Solution**:
- Verify `DATABASE_URL` is set in Render environment
- Check Render logs for specific error messages
- Ensure all init scripts ran successfully
- Verify Neon project region matches expectations

---

## 💡 Tips & Optimization

1. **Connection Pooling**: Already configured in `database.js` (max 20 connections)

2. **Idle Timeout**: Neon scales to zero after 5 minutes of inactivity (free tier)
   - First query after idle period may be slower (~1-2 seconds)
   - Subsequent queries are fast

3. **Query Optimization**:
   - Add indexes for frequently queried columns
   - Use prepared statements (already done via `pg` parameterized queries)

4. **Monitoring**:
   - Set up Neon webhooks for alerts
   - Use Render metrics to track database performance

5. **Scaling**:
   - Free tier: 0.5 GB storage, up to 2 CU (compute units)
   - Paid tier: Autoscaling, more storage, faster compute

---

## ✅ Checklist

- [ ] Created Neon account and project
- [ ] Selected AWS US East 1 region
- [ ] Copied Neon connection string
- [ ] Updated `DATABASE_URL` in Render environment variables
- [ ] Redeployed app on Render
- [ ] Ran database initialization scripts
- [ ] Verified tables in Neon SQL Editor
- [ ] Tested app functionality (upload, analyze, history)
- [ ] Checked Render logs for connection success
- [ ] Bookmarked Neon dashboard for monitoring

---

## 📚 Additional Resources

- **Neon Documentation**: https://neon.tech/docs/introduction
- **Neon Status Page**: https://status.neon.tech
- **PostgreSQL Guide**: https://www.postgresql.org/docs/
- **Render + Neon**: https://render.com/docs/databases

---

## 🎉 Success!

Your GDG Skill Gap Analyzer is now running on:
- ☁️ **Compute**: Render (Free Tier)
- 🗄️ **Database**: Neon PostgreSQL (Free Tier)
- 🚀 **AI**: Google Gemini API

**Total Cost**: $0 🎊

Need help? Check the troubleshooting section or review Render/Neon logs for specific errors.
