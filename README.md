📋 OfficeQ: Smart Queue Management System
OfficeQ is a full-stack queue management solution designed to streamline customer flow in high-traffic environments. It features a digital kiosk for customers, a live mobile tracking assistant, and a data-driven Admin Dashboard with automated operational insights.

🚀 Key Features
Dual-Interface System: Separate portals for Customers (Kiosk) and Staff (Dashboard).

Smart Mobile Assistant: A "mock-AI" chat interface that provides customers with real-time wait estimates and queue positions.

Operations Analytics: An Admin Insight engine that analyzes live database trends to provide staffing recommendations.

Priority Routing: Advanced SQL-based logic to handle VIP/Priority tickets, ensuring they jump to the head of the queue.

Live Data Syncing: 5-second polling interval for real-time dashboard updates without page refreshes.

🛠️ Tech Stack
Frontend
React (Vite): For a lightning-fast, component-based UI.

Tailwind CSS: For a modern, mobile-responsive "Apple-style" aesthetic.

Lucide React: For professional iconography.

Backend
Flask (Python 3.8): RESTful API architecture.

SQLAlchemy: ORM for structured data management.

SQLite: Lightweight, portable database for local development.

📂 Project Structure
```
OfficeQ/
├── backend/            # Flask API & Database Models
│   ├── app/            # Main application package
│   │   ├── models.py   # Database Schema
│   │   └── routes.py   # API Endpoints & Analytics Logic
│   ├── instance/       # Local SQLite Database (Ignored by Git)
│   └── run.py          # Entry point
├── frontend/           # React Application
│   ├── src/            # Components & Pages
│   ├── vite.config.js  # Proxy settings for Flask
│   └── tailwind.config.js
└── README.md
```
⚙️ Installation & Setup
1. Backend Setup
```
Bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
2. Frontend Setup
```
Bash
cd frontend
npm install
npm run dev
```
🧠 Smart Analytics Logic (The "AI" Component)
To ensure 100% uptime and reliability during demonstrations, the Operations Insights engine utilizes a deterministic logic-based model. It queries the Ticket database to calculate:

Traffic Concentration: Identifies which service department has the highest active volume.

Bottleneck Detection: Calculates estimated wait times based on a 5-minute-per-person processing constant.

Staffing Optimization: Suggests reallocating personnel based on real-time demand spikes.

👤 Author
Software Engineering Students-USIU AFRICA