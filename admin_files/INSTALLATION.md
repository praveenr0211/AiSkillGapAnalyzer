# 🔧 Installation & Configuration Guide

Complete setup instructions for the Admin System.

---

## 📋 Pre-requisites

- Node.js 14+ installed
- Express.js backend running
- React frontend project
- SQLite or PostgreSQL database

---

## 🚀 Installation Steps

### 1. Backend Setup

#### Copy Files

```bash
# Navigate to your backend directory
cd your-project/backend

# Copy admin controller
cp ../admin_files/backend/controllers/adminController.js ./controllers/

# Copy admin routes
cp ../admin_files/backend/routes/admin.js ./routes/
cp ../admin_files/backend/routes/apiCourses.js ./routes/

# Copy admin middleware
cp ../admin_files/backend/middleware/adminAuth.js ./middleware/

# Copy initialization scripts
mkdir -p scripts
cp ../admin_files/backend/scripts/initAdminTable.js ./scripts/
cp ../admin_files/backend/scripts/initCoursesTable.js ./scripts/
```

#### Install Dependencies

```bash
npm install bcrypt axios express-session
```

#### Configure Server

**File: `backend/server.js`**

Add these lines after other imports:

```javascript
const session = require("express-session");
const adminRoutes = require("./routes/admin");
const courseRoutes = require("./routes/apiCourses");
```

Add session middleware (before routes):

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET || "admin-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
```

Add routes (after other routes, before error handling):

```javascript
// Admin routes
app.use("/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
```

### 2. Frontend Setup

#### Copy Files

```bash
# Navigate to your frontend directory
cd your-project/frontend

# Copy admin login component
cp ../admin_files/frontend/components/AdminLogin.jsx ./src/components/

# Copy admin API service
cp ../admin_files/frontend/services/adminApi.js ./src/services/
```

#### Update App.js

Integrate admin authentication:

```javascript
import { useState } from 'react';
import AdminLogin from './components/AdminLogin';

function App() {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [showAdminLogin, setShowAdminLogin] = useState(false);

    const handleAdminLoginSuccess = (adminData) => {
        setAdmin(adminData);
        setIsAdminAuthenticated(true);
    };

    // Conditional rendering based on auth state
    if (isAdminAuthenticated) {
        return (
            <div className="admin-panel">
                <h1>Admin Dashboard</h1>
                <button onClick={() => setIsAdminAuthenticated(false)}>
                    Logout
                </button>
            </div>
        );
    }

    if (showAdminLogin) {
        return (
            <AdminLogin
                onLoginSuccess={handleAdminLoginSuccess}
                onBack={() => setShowAdminLogin(false)}
            />
        );
    }

    return (
        <div>
            <button onClick={() => setShowAdminLogin(true)}>
                Admin Access
            </button>
            {/* Regular app UI */}
        </div>
    );
}

export default App;
```

### 3. Database Initialization

Run from your backend directory:

```bash
# Initialize admin table with default user
node scripts/initAdminTable.js

# Initialize courses table
node scripts/initCoursesTable.js
```

Expected output:
```
🔧 Initializing Admin table...
✅ Admin table created successfully
✅ Default admin user created
📧 Email: admin@skillgap.com
🔑 Password: admin123
⚠️  Please change the password after first login!
🎉 Admin table initialization complete!
```

---

## ⚙️ Configuration

### Environment Variables

Create or update `.env` in your backend root:

```env
# Security
SESSION_SECRET=your-secret-key-change-in-production
ADMIN_SECRET=admin-secret-key-change-in-production

# Database (optional, defaults to SQLite)
DATABASE_URL=postgresql://user:password@localhost/skillgap_db

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
PORT=5000
```

### Database Connection

The system supports both SQLite and PostgreSQL.

**SQLite (Default):**
```javascript
// backend/config/database.js
const sqlite3 = require('sqlite3').verbose();
const dbAsync = new sqlite3.Database('./data.db');
```

**PostgreSQL:**
```javascript
// Ensure DATABASE_URL is set
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
```

---

## 🔐 Security Configuration

### Change Default Admin Credentials

**IMPORTANT:** Change these before production deployment!

**Option 1: Update script and reinitialize**

Edit `scripts/initAdminTable.js`:

```javascript
if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("NEW_PASSWORD_HERE", 10);
    await dbAsync.run(
        "INSERT INTO admins (email, password, name) VALUES (?, ?, ?)",
        ["new-email@domain.com", hashedPassword, "Your Admin Name"]
    );
}
```

Then run: `node scripts/initAdminTable.js`

**Option 2: Direct database update**

```sql
UPDATE admins SET password = 'new_bcrypt_hash' WHERE email = 'admin@skillgap.com';
```

### Set Strong Session Secret

```javascript
// Generate a strong secret
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log(secret); // Copy to .env
```

---

## 🧪 Testing the Setup

### 1. Test Backend Routes

```bash
# Login
curl -X POST http://localhost:5000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillgap.com","password":"admin123"}' \
  --cookie-jar cookies.txt

# Get current admin
curl http://localhost:5000/admin/current --cookie cookies.txt

# Get stats
curl http://localhost:5000/admin/stats --cookie cookies.txt
```

### 2. Test Frontend Integration

1. Start backend: `npm start` in backend directory
2. Start frontend: `npm start` in frontend directory
3. Click "Admin Login" button
4. Enter: `admin@skillgap.com` / `admin123`
5. Should authenticate and show admin interface

---

## 📊 Database Schema Verification

### Check if tables were created

**SQLite:**
```bash
sqlite3 data.db ".tables"
```

You should see: `admins courses` (plus your existing tables)

**PostgreSQL:**
```sql
\dt  -- in psql console
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Admin table already exists"
**Solution:** It's okay! The script checks for existing tables. Just continue.

### Issue 2: "bcrypt not found"
**Solution:** 
```bash
npm install bcrypt
```

### Issue 3: "Session not persisting"
**Solution:** Ensure cookies are enabled and `withCredentials: true` in axios calls.

### Issue 4: "CORS error"
**Solution:** Add CORS middleware:
```javascript
const cors = require('cors');
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
```

### Issue 5: "Password verification fails"
**Solution:** Reinitialize the admin:
```bash
node scripts/initAdminTable.js
```

---

## 📁 Final Project Structure

Your project should look like:

```
your-project/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js           ✅ (from admin_files)
│   │   └── [other controllers]
│   ├── routes/
│   │   ├── admin.js                     ✅ (from admin_files)
│   │   ├── apiCourses.js                ✅ (from admin_files)
│   │   └── [other routes]
│   ├── middleware/
│   │   ├── adminAuth.js                 ✅ (from admin_files)
│   │   └── [other middleware]
│   ├── scripts/
│   │   ├── initAdminTable.js            ✅ (from admin_files)
│   │   ├── initCoursesTable.js          ✅ (from admin_files)
│   │   └── [other scripts]
│   ├── server.js                        ✏️ (modified)
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLogin.jsx           ✅ (from admin_files)
│   │   │   └── [other components]
│   │   ├── services/
│   │   │   ├── adminApi.js              ✅ (from admin_files)
│   │   │   └── [other services]
│   │   ├── App.js                       ✏️ (modified)
│   │   └── index.js
│   ├── package.json
│   └── .env
│
└── admin_files/  (Keep for reference)
```

---

## ✅ Verification Checklist

- [ ] All 6 backend files copied
- [ ] Server.js updated with routes and session
- [ ] Frontend files copied to correct locations
- [ ] App.js integrated with admin authentication
- [ ] Dependencies installed (`bcrypt`, `axios`, `express-session`)
- [ ] Database tables initialized (ran both init scripts)
- [ ] Can login with `admin@skillgap.com` / `admin123`
- [ ] Session persists across page reloads
- [ ] Can access `/admin/stats` endpoint

---

## 🎯 Next Steps

1. ✅ **Customize UI:** Edit AdminLogin.jsx styling
2. ✅ **Build Dashboard:** Create AdminDashboard.jsx component
3. ✅ **Change Credentials:** Update default admin email/password
4. ✅ **Deploy:** Configure environment variables for production
5. ✅ **Monitor:** Add logging and error tracking

---

**You're all set! The admin system is ready to use.** 🚀
