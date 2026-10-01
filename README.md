# MechMate — Full Stack Web Application

> **Stack:** React 18 + Vite (Frontend) · Laravel 12 REST API (Backend)  
> **Modules:** Administrator Management System + Multi-Role Password Reset Workflow

---

## 🚀 Quick Start

### 1. Backend (Laravel) — Terminal 1
```bash
cd backend
composer install   # initial setup
php artisan serve
```
- API Base URL: `http://localhost:8000/api`

### 2. Frontend (React + Vite) — Terminal 2
```bash
cd frontend
npm install        # initial setup
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Default Credentials (Mock Mode)

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@mechmate.lk` | `password` |
| **Vehicle Owner** | `owner@mechmate.lk` / `ashan@email.com` | `password123` |
| **Spare Part Shop Owner** | `shop@mechmate.lk` / `autofix@lk.com` | `password123` |
| **Service Centre Owner** | `service@mechmate.lk` / `speed@srv.com` | `password123` |
| **Mechanic** | `mechanic@mechmate.lk` / `qm@hub.com` | `password123` |

---

## 🖥️ Frontend Navigation & Routes

| Route | Page | Description |
|---|---|---|
| `/admin/login` | **Admin Login** | Secure admin authentication with validation & error handling |
| `/forgot-password` | **Forgot Password** | 6-digit confirmation code request across all platform roles |
| `/reset-password` | **Reset Password** | Token verification and strong password updating |
| `/admin/dashboard` | **Dashboard Overview** | Platform KPIs, pending approvals callout, API usage rates & recent activity feed |
| `/admin/users` | **User Management** | Vehicle owner accounts, search/filters, vehicle details modal, status toggle (Active/Blocked/Inactive), delete |
| `/admin/providers` | **Provider Management** | Tabbed views (Pending Approvals, Spare Part Shops, Service Centres, Mechanics), credential inspection, approve (with email dispatch stub), reject with reasons, email verification badges |
| `/admin/categories` | **Category Management** | Tabbed interface for Spare-Part & Service categories, icon selection, add/edit/delete CRUD |
| `/admin/diagnosis-data` | **Diagnosis Data** | Symptom-to-fault mapping rules with severity levels (Low, Medium, High, Critical), linked parts, and live customer diagnosis search logs |
| `/admin/monitoring` | **Live Monitoring** | External API usage (Gemini AI, Cloud Vision, Speech-to-Text, Google Maps), SLA rates, real-time alerts container, invocation logs |
| `/admin/reviews` | **Reviews & Moderation** | Provider reviews moderation queue with star ratings, flag context, hide, restore, and delete actions |
| `/admin/reports` | **System Analytics & Reports** | Date-range filters, platform metrics, monthly booking velocity charts, category share, and client-side **Export to CSV** |

---

## 🔌 API Endpoints Summary

### Authentication & Password Reset (Public)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/admin/login` | Admin login with token return |
| `POST` | `/api/auth/forgot-password` | Generates 6-digit verification code with 15-min validity |
| `POST` | `/api/auth/verify-code` | Validates 6-digit confirmation code |
| `POST` | `/api/auth/reset-password` | Sets new password with confirmation matching |

### Admin Dashboard & Monitoring
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard-stats` | Aggregated KPI stats, API success rates, and activity feed |
| `GET` | `/api/admin/monitoring` | Live system gateway metrics & external API SLA overview |
| `GET` | `/api/admin/monitoring/alerts` | Unresolved API failure and quota alerts |
| `GET` | `/api/admin/monitoring/api-logs` | Filterable API invocation logs (`api_name`, `status`) |

### User Management (Vehicle Owners)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List users with filters (`role`, `status`, `search`) |
| `GET` | `/api/admin/users/{id}` | Retrieve individual user record with vehicle profiles |
| `PUT` | `/api/admin/users/{id}` | Update user details |
| `PUT` | `/api/admin/users/{id}/status` | Toggle user account status (`active`, `blocked`, `inactive`, `pending`) |
| `DELETE` | `/api/admin/users/{id}` | Permanently delete user record |
| `PATCH` | `/api/admin/users/{id}/activate` | Quick activate shortcut |
| `PATCH` | `/api/admin/users/{id}/deactivate` | Quick deactivate shortcut |

### Service Provider Management & Approvals
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/providers` | Filter providers by type (`shop`, `service_center`, `mechanic`), status, search |
| `GET` | `/api/admin/providers/pending` | List pending onboarding requests awaiting approval |
| `GET` | `/api/admin/providers/email-verification-status` | Provider email verification breakdown & rates |
| `GET` | `/api/admin/providers/{id}` | Get provider details and submitted documents |
| `POST` | `/api/admin/providers/{id}/approve` | Approve provider and trigger email verification code dispatch stub |
| `POST` | `/api/admin/providers/{id}/reject` | Reject provider with audit reason logging |
| `PUT` | `/api/admin/providers/{id}/status` | Suspend or activate provider |

### Categories (Spare Parts & Garage Services)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/categories/parts` | List spare-part categories with item count stats |
| `POST` | `/api/admin/categories/parts` | Create new spare-part category |
| `PUT` | `/api/admin/categories/parts/{id}` | Update spare-part category |
| `DELETE` | `/api/admin/categories/parts/{id}` | Remove spare-part category |
| `GET` | `/api/admin/categories/services` | List garage service categories |
| `POST` | `/api/admin/categories/services` | Create new service category |
| `PUT` | `/api/admin/categories/services/{id}` | Update service category |
| `DELETE` | `/api/admin/categories/services/{id}` | Remove service category |

### Diagnosis Reference Data & Search Logs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/diagnosis-data` | List diagnosis reference rules (`severity`, `category`, `search`) |
| `POST` | `/api/admin/diagnosis-data` | Create symptom-to-fault reference mapping rule |
| `PUT` | `/api/admin/diagnosis-data/{id}` | Update diagnosis reference rule |
| `DELETE` | `/api/admin/diagnosis-data/{id}` | Delete diagnosis reference rule |
| `GET` | `/api/admin/diagnosis-history` | View customer diagnosis search queries and AI engine status |

### Ratings & Reviews Moderation
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/reviews` | View reviews queue with filters (`rating`, `target_type`, `status`) |
| `PUT` | `/api/admin/reviews/{id}/status` | Hide or restore a review (`published`, `hidden`) |
| `DELETE` | `/api/admin/reviews/{id}` | Permanently delete review |
| `GET` | `/api/admin/reviews/flagged` | View flagged review submissions |
| `PATCH` | `/api/admin/reviews/{id}/approve` | Approve flagged review |

### System Analytics & Reports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/reports/summary` | Aggregated operational metrics, growth charts, category shares |
| `GET` | `/api/admin/reports/export` | Formatted export rows for CSV/PDF generation |

### Spare Part Shop Owner Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shop/profile` | Retrieve shop details, contact, opening hours, coordinates |
| `PUT` | `/api/shop/profile` | Update shop details and business description |
| `GET` | `/api/shop/parts` | List shop spare parts with filters (`category`, `brand`, `model`, `availability`, `search`) |
| `POST` | `/api/shop/parts` | Add new spare part listing (auto-logs initial stock/price) |
| `PUT` | `/api/shop/parts/{id}` | Edit part details (auto-logs price and stock adjustments) |
| `DELETE` | `/api/shop/parts/{id}` | Remove part from catalog |
| `GET` | `/api/shop/parts/{id}/history` | Retrieve full stock adjustment and price change history |
| `GET` | `/api/shop/inquiries` | View customer inquiries |
| `POST` | `/api/shop/inquiries/{id}/reply` | Respond to customer inquiry |
| `GET` | `/api/shop/reviews` | View customer feedback and ratings |
| `GET` | `/api/shop/analytics` | View profile visits, top-viewed parts, and low-stock alerts |

### Service Centre / Garage Owner Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/garage/profile` | Retrieve garage details, location, hours, description |
| `PUT` | `/api/garage/profile` | Update service centre profile |
| `GET` | `/api/garage/vehicles` | Get supported vehicle types (Car, SUV, Van, Motorbike, etc.) |
| `PUT` | `/api/garage/vehicles` | Update supported vehicle types |
| `GET` | `/api/garage/services` | List repair and maintenance service packages |
| `POST` | `/api/garage/services` | Add new service package |
| `PUT` | `/api/garage/services/{id}` | Update service package |
| `DELETE` | `/api/garage/services/{id}` | Remove service package |
| `GET` | `/api/garage/inquiries` | View service booking and maintenance inquiries |
| `POST` | `/api/garage/inquiries/{id}/reply` | Send response to customer inquiry |
| `GET` | `/api/garage/reviews` | View customer ratings and reviews |
| `GET` | `/api/garage/analytics` | View profile visits and most-viewed services |

---

## 🔄 Firebase Migration Guide

All business logic and data access are decoupled behind abstract interfaces under `backend/app/Services/Contracts/`.

To switch from Mock mode to Firebase/Firestore:
1. Concrete Firebase service classes implement the corresponding interfaces:
   - `FirebaseUserService` (`users` collection)
   - `FirebaseProviderService` (`providers` collection)
   - `FirebaseCategoryService` (`categories_parts`, `categories_services` collections)
   - `FirebaseDiagnosisService` (`diagnosis_reference`, `diagnosis_logs` collections)
   - `FirebaseReviewService` (`reviews` collection)
   - `FirebaseMonitoringService` (`api_logs`, `api_alerts` collections)
   - `FirebaseReportService` (Live cross-collection aggregation)
   - `FirebaseShopOwnerService` (`shops`, `spare_parts`, `stock_history`, `price_history`, `shop_inquiries`, `shop_analytics`)
   - `FirebaseServiceCentreService` (`service_centres`, `services_catalog`, `supported_vehicles`, `garage_inquiries`, `garage_analytics`)
2. Registered in `backend/app/Providers/AppServiceProvider.php`.
3. Artisan Seeders available:
   - `php artisan db:seed-firebase-users`
   - `php artisan db:seed-firebase-providers`
   - `php artisan db:seed-firebase-categories-diagnosis`
   - `php artisan db:seed-firebase-monitoring`
   - `php artisan db:seed-firebase-providers-data`
4. Zero changes required in controllers, API contracts, or frontend client logic.

---

## 📁 Project Structure

```
MechMate/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   └── Admin/
│   │   │       ├── DashboardController.php
│   │   │       ├── UserController.php
│   │   │       ├── ProviderController.php
│   │   │       ├── CategoryController.php
│   │   │       ├── DiagnosisDataController.php
│   │   │       ├── MonitoringController.php
│   │   │       ├── ReviewController.php
│   │   │       └── ReportController.php
│   │   ├── Providers/
│   │   │   └── AppServiceProvider.php       # Service container bindings
│   │   └── Services/
│   │       ├── Contracts/                   # Service interfaces
│   │       ├── Firebase/                    # Live Firebase Firestore implementations
│   │       └── Mock/                        # Local mock & storage implementations
│   ├── routes/
│   │   └── api.php                          # Registered REST API routes
│   └── config/cors.php                      # CORS setup for Vite dev server
└── frontend/
    └── src/
        ├── api/
        │   ├── axios.js                     # Base Axios instance & interceptors
        │   └── services.js                  # Modular API client functions
        ├── context/
        │   └── AuthContext.jsx              # Admin authentication & token store
        ├── components/
        │   └── ProtectedRoute.jsx           # Guard for authenticated admin routes
        ├── layouts/
        │   └── AdminLayout/                 # Responsive shell & sidebar navigation
        └── pages/
            ├── auth/                        # Login, Forgot Password, Reset Password
            └── admin/                       # Dashboard, Users, Providers, Categories,
                                             # Diagnosis, Monitoring, Reviews, Reports
```
