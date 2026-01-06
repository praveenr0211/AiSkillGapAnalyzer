# AI Skill-Gap Analyzer

A full-stack web application that helps students identify missing skills for target job roles using AI analysis.

## Features

- 📄 Resume upload (PDF/DOCX support)
- 🤖 AI-powered skill extraction and comparison
- 🎯 Job role skill matching
- 🗺️ Personalized learning roadmap generation
- 📊 Interactive dashboard with match percentage
- 🔍 **NEW: Detailed Skill View** - Click "View Details" on any skill to see:
  - Comprehensive learning topics with visual cards
  - Parallax scrolling effects
  - Animated course recommendations
  - Hands-on project ideas
  - Step-by-step learning roadmap
- 👤 User authentication with Google OAuth
- 📈 Progress tracking and achievements
- 📜 Analysis history and comparison tools
- 📄 PDF export functionality

## Tech Stack

- **Frontend**: React.js, Axios, CSS3
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **AI**: Google Gemini API
- **File Processing**: pdf-parse, mammoth

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**

   ```bash
   cd gdg_skillgapanalyzer
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   - Copy `.env.example` to `.env` in root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

5. **Initialize Database**
   ```bash
   cd backend
   node initDatabase.js
   node initHistoryTable.js
   node initProgressTable.js
   ```
   Or use the batch file (Windows):
   ```bash
   cd backend
   init-all-tables.bat
   ```

### Running the Application

1. **Start Backend Server**

   ```bash
   cd backend
   npm start
   ```

   Server runs on `http://localhost:5000`

2. **Start Frontend (in new terminal)**
   ```bash
   cd frontend
   npm start
   ```
   App opens at `http://localhost:3000`

## Project Structure

```
gdg_skillgapanalyzer/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── analyzeController.js
│   │   └── uploadController.js
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   ├── geminiService.js
│   │   └── textExtractor.js
│   ├── uploads/
│   ├── server.js
│   ├── initDatabase.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumeUpload.jsx
│   │   │   └── ResultDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## API Endpoints

### POST /api/upload

Upload resume file and extract text.

**Request**: Multipart form-data with `resume` file

**Response**:

```json
{
  "success": true,
  "extractedText": "..."
}
```

### POST /api/analyze

Analyze skills and generate roadmap.

**Request**:

```json
{
  "resumeText": "...",
  "jobRole": "Frontend Developer"
}
```

**Response**:

```json
{
  "success": true,
  "analysis": {
    "match_percentage": 75,
    "matched_skills": ["React", "JavaScript"],
    "missing_skills": ["TypeScript", "Testing"],
    "learning_roadmap": [...]
  }
}
```

## Usage

1. Open the application in your browser
2. Upload your resume (PDF or DOCX)
3. Select or enter target job role
4. Click "Analyze Skills"
5. View results:
   - Skill match percentage
   - Matched skills
   - Missing skills
   - Personalized learning roadmap

## License

MIT
