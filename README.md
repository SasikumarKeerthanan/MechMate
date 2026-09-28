# MechMate — Full Stack Web Application

> **Stack:** React + Vite (frontend) · Laravel 12 REST API (backend)
> **Module:** Administrator System + Forgot Password Workflow

---

## Quick Start

### Backend (Laravel) — Terminal 1
```bash
cd backend
php artisan serve
```
API available at: http://localhost:8000/api

### Frontend (React) — Terminal 2
```bash
cd frontend
npm install   # only first time
npm run dev
```
App available at: http://localhost:5173

---

## Default Admin Credentials (Mock Mode)
| Field    | Value               |
|----------|---------------------|
| Email    | admin@mechmate.lk   |
| Password | password            |

---

## Frontend Routes
| Route                              | Page                  |
|------------------------------------|-----------------------|
| /admin/login                       | Admin Login           |
| /forgot-password                   | Forgot Password       |
| /reset-password?token=&email=      | Reset Password        |
| /admin/dashboard                   | Dashboard             |
| /admin/users                       | User Management       |
| /admin/providers                   | Provider Management   |
| /admin/categories                  | Categories            |
| /admin/diagnosis-data              | Diagnosis Data        |
| /admin/monitoring                  | Live Monitoring       |
| /admin/reviews                     | Reviews/Moderation    |
| /admin/reports                     | Reports               |

---

## API Endpoints (22 routes)
| Method | Endpoint                           | Description              |
|--------|------------------------------------|--------------------------|
| POST   | /api/auth/admin/login              | Admin login              |
| POST   | /api/auth/forgot-password          | Send reset email         |
| POST   | /api/auth/reset-password           | Reset password           |
| GET    | /api/admin/dashboard-stats         | Dashboard KPIs           |
| GET    | /api/admin/users                   | List users               |
| PUT    | /api/admin/users/{id}              | Update user              |
| PATCH  | /api/admin/users/{id}/deactivate   | Deactivate user          |
| PATCH  | /api/admin/users/{id}/activate     | Activate user            |
| GET    | /api/admin/providers               | List providers           |
| GET    | /api/admin/providers/pending       | Pending approvals        |
| POST   | /api/admin/providers/{id}/approve  | Approve provider         |
| POST   | /api/admin/providers/{id}/reject   | Reject provider          |
| GET    | /api/admin/categories              | List categories          |
| POST   | /api/admin/categories              | Create category          |
| PUT    | /api/admin/categories/{id}         | Update category          |
| DELETE | /api/admin/categories/{id}         | Delete category          |
| GET    | /api/admin/reports                 | Period summary           |
| GET    | /api/admin/reviews/flagged         | Flagged reviews          |
| PATCH  | /api/admin/reviews/{id}/approve    | Approve review           |
| DELETE | /api/admin/reviews/{id}            | Remove review            |
| GET    | /api/admin/monitoring              | Live metrics             |

---

## Firebase Migration
All backend services live in `backend/app/Services/`.
- Contracts (interfaces) are in `Contracts/`
- Mock implementations are in `Mock/`

To switch from mock to Firebase, open `backend/app/Providers/AppServiceProvider.php`
and replace the Mock binding with your Firebase implementation:

  $this->app->bind(AdminAuthServiceInterface::class, FirebaseAdminAuthService::class);

No controllers, routes, or frontend code need to change.

---

## Project Structure
```
MechMate/
├── backend/                    Laravel 12 REST API
│   ├── app/Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   └── Admin/ (Dashboard, User, Provider, Category, Monitoring, Review, Report)
│   ├── app/Services/Contracts/ (interfaces)
│   ├── app/Services/Mock/      (mock implementations)
│   ├── config/cors.php         (allows localhost:5173)
│   └── routes/api.php
└── frontend/                   React 18 + Vite + React Router v6
    └── src/
        ├── api/ (axios.js, services.js)
        ├── context/AuthContext.jsx
        ├── components/ProtectedRoute.jsx
        ├── layouts/AdminLayout/
        └── pages/ (auth/, admin/)
```
