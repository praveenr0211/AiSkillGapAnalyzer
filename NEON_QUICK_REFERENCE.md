# 🚀 Quick Reference: Neon PostgreSQL Integration

## 📝 Checklist

```
[ ] 1. Created Neon account at neon.tech
[ ] 2. Created project (PostgreSQL 17, AWS US East 1)
[ ] 3. Copied connection string from Neon dashboard
[ ] 4. Updated DATABASE_URL in Render environment variables
[ ] 5. Redeployed app on Render
[ ] 6. Ran initialization: node initAllTables.js
[ ] 7. Tested app functionality
```

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| **Neon Dashboard** | https://console.neon.tech |
| **Render Dashboard** | https://dashboard.render.com |
| **Full Setup Guide** | See NEON_SETUP.md |

---

## 🔑 Key Commands

### Test Neon Connection (Local)
```bash
cd backend
node testNeonConnection.js
```

### Initialize All Tables
```bash
cd backend
node initAllTables.js
```

### Initialize Individual Tables
```bash
node initDatabase.js       # Job skills
node initHistoryTable.js   # Analysis history
node initProgressTable.js  # User progress
node initChatTable.js      # Chat system
node initAdminTable.js     # Admin users
node initCoursesTable.js   # Course catalog
node initVideosTable.js    # Video library
```

---

## 🌍 Environment Variables (Render)

Set these in Render Dashboard → Your Service → Environment:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/dbname?sslmode=require
GOOGLE_GEMINI_API_KEY=your_gemini_key
SESSION_SECRET=auto_generated
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://your-frontend.onrender.com
NODE_ENV=production
```

---

## 📊 Verify Tables in Neon

Run this SQL in Neon SQL Editor:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count rows in each table
SELECT 'job_skills' as table_name, COUNT(*) FROM job_skills
UNION ALL
SELECT 'analysis_history', COUNT(*) FROM analysis_history
UNION ALL
SELECT 'user_progress', COUNT(*) FROM user_progress
UNION ALL
SELECT 'chat_sessions', COUNT(*) FROM chat_sessions
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'videos', COUNT(*) FROM videos;
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **Connection refused** | Check DATABASE_URL includes `?sslmode=require` |
| **Table not found** | Run `node initAllTables.js` |
| **SSL error** | Verify `ssl: { rejectUnauthorized: false }` in database.js |
| **Works locally, fails on Render** | Check DATABASE_URL is set in Render environment |
| **Timeout on first query** | Normal - Neon scales to zero when idle |

---

## 🎯 Your Connection String Format

```
postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
           └─────┘ └────────┘  └─────┘  └────────┘
           neondb_  xxxxx...   ep-xxx-  neondb
           owner               xxx.aws.
                              neon.tech
```

**Example**:
```
postgresql://neondb_owner:AbCd123XyZ@ep-cool-cloud-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## ✅ Expected Tables

After running `initAllTables.js`, you should have:

1. ✅ `job_skills` - Job role requirements
2. ✅ `analysis_history` - Resume analyses
3. ✅ `user_progress` - Skill tracking
4. ✅ `skill_progress` - Individual skill progress
5. ✅ `achievements` - User achievements
6. ✅ `chat_sessions` - Chatbot sessions
7. ✅ `chat_messages` - Chat history
8. ✅ `admin_users` - Admin accounts
9. ✅ `courses` - Course catalog
10. ✅ `videos` - Video library

---

## 💾 Neon Free Tier Limits

- **Storage**: 0.5 GB
- **Compute**: Up to 2 CU (autoscales)
- **Connections**: 100 concurrent
- **Branches**: 10 branches per project
- **Idle Timeout**: Scales to zero after 5 min
- **Backups**: 7 days point-in-time recovery

---

## 📞 Need Help?

1. **Check logs**: Render Dashboard → Logs tab
2. **Test connection**: `node testNeonConnection.js`
3. **Full guide**: Read NEON_SETUP.md
4. **Neon docs**: https://neon.tech/docs
5. **Neon status**: https://status.neon.tech

---

**Last Updated**: March 2026  
**Project**: GDG AI Skill-Gap Analyzer  
**Database**: Neon PostgreSQL (Free Tier)  
**Hosting**: Render (Free Tier)
