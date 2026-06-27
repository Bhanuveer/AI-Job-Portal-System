# JobPilot — AI Powered Job Portal

A full-stack job portal with an AI-powered recommendation engine, built as a portfolio project to demonstrate practical software engineering skills across the entire stack.

**Live Demo:** _Deploy and add your links here_

---

## Features

### Candidate
- Browse, search, and filter jobs by type and experience level
- Apply for jobs with PDF resume upload + optional cover letter
- Track application status in real time
- Get AI-powered job recommendations based on your skills
- Manage your profile and skills

### Recruiter
- Post, edit, and delete job listings
- Dashboard with stats (total jobs, active jobs, total applications)
- View all applicants with filterable table
- Update application status (Pending → Reviewing → Shortlisted → Hired/Rejected)
- Resume download links for each applicant

### Platform
- JWT authentication with token blacklisting (proper logout)
- Role-based access control (Candidate / Recruiter)
- Persistent login via localStorage + profile re-fetch
- Responsive UI — works on mobile, tablet, and desktop
- Toast notifications, loading states, and empty states throughout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios (with JWT interceptors) |
| Forms | React Hook Form |
| Backend | Python, Django 6, Django REST Framework |
| Authentication | Simple JWT (access + refresh tokens, blacklist) |
| Database | MySQL |
| ML Engine | scikit-learn (TF-IDF + Cosine Similarity) |
| Production Server | Gunicorn + Whitenoise |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Project Architecture

```
AI-Job-Portal/
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── api/                # Axios API functions (auth, jobs, applications, recommendations)
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Layout wrapper
│   │   │   └── ui/             # ProtectedRoute
│   │   ├── context/            # AuthContext — global user state
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── candidate/      # Jobs, JobDetail, MyApplications, Recommended
│   │   │   ├── recruiter/      # Dashboard, MyJobs, JobForm, Applicants
│   │   │   └── shared/         # ProfilePage (works for both roles)
│   │   └── App.jsx             # Route definitions
│   ├── .env.example
│   └── vercel.json
│
├── backend/                    # Django project
│   ├── jobpilot/               # Project config (settings, urls, wsgi)
│   ├── accounts/               # Custom User model, auth endpoints
│   ├── jobs/                   # Job model, CRUD, dashboard
│   ├── applications/           # Apply, track, status updates
│   ├── recommendations/        # ML engine (engine.py) + API view
│   ├── .env.example
│   ├── build.sh                # Render build script
│   └── requirements.txt
│
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8+

### 1. Clone the repository
```bash
git clone https://github.com/your-username/AI-Job-Portal.git
cd AI-Job-Portal
```

### 2. Create the database
```sql
CREATE DATABASE job_portal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env with your database credentials and a strong SECRET_KEY

python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```

### 4. Frontend setup
```bash
cd frontend
npm install

cp .env.example .env
# .env already points to http://localhost:8000/api

npm run dev
```

The app runs at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key | `django-insecure-...` |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `DB_NAME` | MySQL database name | `job_portal_db` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `yourpassword` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend URLs | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |

---

## API Endpoints

### Auth — `/api/auth/`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register/` | Public | Register a new user |
| POST | `/login/` | Public | Login and receive JWT tokens |
| POST | `/logout/` | Auth | Blacklist refresh token |
| GET | `/profile/` | Auth | Get current user profile |
| PATCH | `/profile/` | Auth | Update profile / skills |
| POST | `/token/refresh/` | Public | Refresh access token |

### Jobs — `/api/jobs/`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List active jobs (search, filter, pagination) |
| POST | `/` | Recruiter | Create a job listing |
| GET | `/{id}/` | Public | Job detail |
| PATCH | `/{id}/` | Job Owner | Update a job |
| DELETE | `/{id}/` | Job Owner | Delete a job |
| GET | `/mine/` | Recruiter | List my posted jobs |
| GET | `/dashboard/` | Recruiter | Dashboard stats + recent data |

### Applications — `/api/applications/`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Candidate | Apply for a job (multipart/form-data) |
| GET | `/mine/` | Candidate | My applications and their status |
| GET | `/check/?job_id=` | Candidate | Check if already applied |
| DELETE | `/{id}/withdraw/` | Candidate | Withdraw a pending application |
| GET | `/recruiter/` | Recruiter | All applicants for my jobs |
| PATCH | `/{id}/status/` | Recruiter | Update application status |

### Recommendations — `/api/recommendations/`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Candidate | Get AI-recommended jobs based on skills |

**All responses follow a consistent structure:**
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

---

## How the ML Recommendation Engine Works

The engine lives in `backend/recommendations/engine.py` and is fully decoupled from Django.

**Algorithm:**
1. Candidate has a skills string: `"React, JavaScript, Tailwind CSS"`
2. Each active job has a skills string: `"React, TypeScript, Node.js"`
3. Both are combined into a corpus and passed to **TF-IDF Vectorizer**
   - Rare/specific terms (e.g. `TypeScript`) receive higher weight than common ones
4. **Cosine Similarity** measures the angle between the candidate vector and each job vector
   - Score 1.0 = perfect match, 0.0 = no overlap
5. Jobs are sorted by score (descending) and the top 10 are returned
6. Already-applied jobs are automatically excluded

**Example:**
```
Candidate skills:  "React, JavaScript, Tailwind CSS"
Job A skills:      "React, TypeScript, CSS, Tailwind"   → score: 0.82
Job B skills:      "React, Node.js, JavaScript"          → score: 0.29
Job C skills:      "Python, Django, PostgreSQL"          → score: 0.00 (excluded)
```

---

## Deployment

### Frontend → Vercel
1. Push the `frontend/` folder to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Set the root directory to `frontend`
4. Add environment variable: `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`
5. Deploy — `vercel.json` handles SPA routing automatically

### Backend → Render
1. Push the `backend/` folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn jobpilot.wsgi:application`
4. Add all environment variables from `backend/.env.example`
5. Set `DEBUG=False`, `ALLOWED_HOSTS=your-app.onrender.com`
6. Set `CORS_ALLOWED_ORIGINS=https://your-app.vercel.app`

---

## Future Improvements

- Email verification on registration
- Password reset via email
- Saved / bookmarked jobs
- Company profiles with logo upload
- Job alerts and email notifications
- Advanced ML: collaborative filtering based on application history
- Admin analytics dashboard
- Unit and integration tests

---

## License

MIT
