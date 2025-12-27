# 📝 AI-Powered ATS Resume Matcher

**Resume-Enhancer** is an intelligent Applicant Tracking System (ATS) tool designed to bridge the gap between job seekers and recruitment algorithms.

It uses **Google Gemini 1.5 Flash** to analyze PDF resumes against Job Descriptions (JDs), providing a weighted match score, keyword gap analysis, and actionable feedback to help candidates optimize their applications.

---

## 🚀 Key Features

* **📄 AI Resume Parsing:** Extracts complex text and structure from PDF resumes using Gemini's 1M token context window.
* **🎯 Smart Scoring Engine:** Calculates a match percentage based on industry standards:
    * **45% Hard Skills** (Tech stack match)
    * **30% Experience** (Role relevance & seniority)
    * **15% Keywords** (ATS terminology)
    * **10% Formatting** (Readability check)
* **⚡ Intelligent Caching:** Implements **Redis** with **MD5 Content Hashing**. Re-analyzing the same file content costs 0 API credits and returns instant results.
* **🔐 Secure Authentication:** Passwordless login using **Email OTP** (One-Time Password) and JWT sessions.
* **🔄 Version Control:** Stores multiple versions of resumes and analysis history for every user.

---

## 🛠️ Tech Stack

### **Backend**
* **Framework:** FastAPI (Python 3.10+)
* **AI Model:** Google Gemini 2.5 Flash (`google-genai` SDK)
* **Database:** PostgreSQL (with SQLAlchemy Async & Alembic)
* **Caching:** Redis
* **Authentication:** PyJWT + Email Integration

### **Frontend**
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS
* **HTTP Client:** Axios
* **State Management:** React Context API

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
* **Python** (v3.9 or higher)
* **Node.js** (v16 or higher)
* **PostgreSQL** (running locally or cloud)
* **Redis** (running locally or cloud)

---

## ⚙️ Installation Guide

### 1. Clone the Repository
```bash
git clone [https://github.com/Kartik4138/Resume_enhancer.git](https://github.com/Kartik4138/Resume_enhancer.git)
cd Resume_enhancer
```

### 2. Backend Setup
Navigate to the backend folder and set up the Python environment.

```bash
cd backend
# Create virtual environment
python -m venv venv

# Activate environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configuration:**
Create a `.env` file in the `backend/` directory with the following credentials:

```ini
# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/resume_db

# AI Service (Google Gemini)
GEMINI_API_KEY=your_google_ai_studio_key

# Caching (Redis)
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256

# Email Service (For OTP)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```

**Run the Server:**
```bash
uvicorn app.main:app --reload
```
*The API will be available at `http://localhost:8000`*

### 3. Frontend Setup
Open a new terminal and navigate to the frontend folder.

```bash
cd ../frontend

# Install node modules
npm install

# Start the development server
npm run dev
```
*The UI will be available at `http://localhost:5173`*

---

## 📖 Usage Examples

### **1. Upload & Analyze**
* Go to the Dashboard.
* Paste a Job Description (JD) text.
* Upload your Resume (PDF).
* Click **"Analyze"**. The system will generate a score (e.g., 78%) and show missing keywords like "Docker" or "CI/CD".

---

## 🤝 Contributing

Contributions are welcome!
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

## 📄 License
This project is open-source and available under the **MIT License**.

---

**Developed by [Kartik](https://github.com/Kartik4138)**
