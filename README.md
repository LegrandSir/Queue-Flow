# QueueFlow — Real-Time Branch Queue Management System

QueueFlow is a full-stack queue orchestration platform designed to eliminate lobby congestion through self-service check-in kiosks, mobile QR ticket tracking, synchronized waiting room TV displays, priority fast-tracking, and real-time SLA analytics.

> **Live Demo:** _[Add your Vercel URL after deploy]_  
> *(Backend runs on Render's free tier — allow ~30s for initial cold start.)*

---

## Instant Demo Access

Explore every role immediately using the floating **Demo Tour** bar or 1-click sign-in buttons on `/login`:

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@queueflow.io` | `Admin123!` | Live operations engine, Recharts SLA analytics, staff & service CRUD, branch settings, CSV export |
| **Staff** | `staff@queueflow.io` | `Staff123!` | Counter dispatch (`Call Next`), queue board filtering, ticket completion/no-show, shift reports |
| **Customer** | _No login required_ | — | Self-service Kiosk (`/`), Mobile QR Tracker (`/ticket/:id`), Public Lobby TV Board (`/display`) |

---

## Key Features

- **Priority-First Dispatch Algorithm:** Automatically prioritizes accessibility, elderly, and expectant-mother tickets (`P-series`) ahead of standard check-ins (`B-series`) while preserving FIFO ordering within each tier.
- **Synchronized Multi-Screen Experience:** Self-service kiosk, mobile QR ticket tracker with browser turn alerts, and a high-contrast dark-mode lobby TV board polling live counter states.
- **Deterministic Operations Engine:** Analyzes real-time queue volume, department concentration, and priority buildup to surface live staffing recommendations without external API fragility.
- **Timestamped SLA Analytics:** Tracks `created_at`, `called_at`, and `completed_at` in East Africa Time (`Africa/Nairobi`) to compute actual wait times, completion rates, and handling efficiency vs. SLA targets.
- **Interactive Demo Sandbox:** Built-in one-click walk-in traffic simulation (`Simulate +2 Walk-ins`) and sandbox reset controls so visitors can test live queue flow anytime.

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons, Sonner, `qrcode.react`
- **Backend:** Python, Flask, Flask-SQLAlchemy, Flask-Migrate, Gunicorn, `pytz`
- **Database:** PostgreSQL (Neon / Render production) with automatic zero-config SQLite fallback for local development

---

## Local Development Setup

### 1. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_roles.py
python run.py