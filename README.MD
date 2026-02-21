# 🚛 FleetFlow  
## Modular Fleet & Logistics Management System

FleetFlow is a centralized, rule-based digital platform designed to replace manual fleet logbooks with a smart logistics management system. It helps organizations manage vehicle lifecycle, driver compliance, dispatch operations, maintenance tracking, fuel logging, and financial analytics.

---

# 📌 Project Objective

To optimize fleet operations by:
- Monitoring vehicle availability and maintenance
- Tracking driver compliance and performance
- Managing dispatch workflows
- Recording fuel and operational expenses
- Generating operational analytics & ROI reports

---

# 👥 Team Members

| Role | GitHub Username |
|------|-----------------|
| Team Member 1 | yagna1229 |
| Team Member 2 | dhrumilkharadi |
| Team Member 3 | vraj0809 |

---

# 🛠 Tech Stack

## 🔹 Backend
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- Alembic (Migrations)
- JWT Authentication
- Google OAuth
- Role-Based Access Control (RBAC)

## 🔹 Frontend
- React (Vite)
- Axios
- React Router DOM
- React Hook Form
- Recharts (Analytics)
- Google OAuth
- React Hot Toast

---

# 🏗 System Roles

FleetFlow supports 4 role-based users:

1. **Fleet Manager**
   - Manage vehicles
   - Oversee maintenance
   - Monitor lifecycle

2. **Dispatcher**
   - Create trips
   - Assign drivers
   - Validate cargo loads

3. **Safety Officer**
   - Monitor driver compliance
   - Track license expiration
   - View safety scores

4. **Financial Analyst**
   - Track fuel expenses
   - Analyze operational cost
   - Generate ROI reports

---

# 📦 Backend Setup (FastAPI)

## 1️⃣ Navigate to Backend

```bash
cd backend
```

---

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

---

## 3️⃣ Activate Virtual Environment

### Windows
```bash
venv\Scripts\activate
```

### Mac/Linux
```bash
source venv/bin/activate
```

---

## 4️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 📄 backend/requirements.txt

```txt
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
asyncpg
alembic
python-dotenv
pydantic
pydantic-settings
passlib[bcrypt]
python-jose[cryptography]
authlib
httpx
email-validator
python-multipart
```

---

# 🐘 PostgreSQL Database Setup

Install PostgreSQL and create database:

```sql
CREATE DATABASE fleetflow;
```

---

# 🔐 Environment Variables

Create file: `backend/.env`

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fleetflow
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

# ▶️ Run FastAPI Server

```bash
uvicorn app.main:app --reload
```

### Access API:
- Swagger Docs → http://127.0.0.1:8000/docs
- Base URL → http://127.0.0.1:8000

---

# 🔐 Authentication System

## Features
- Email/Password Login
- JWT Token Authentication
- Google OAuth Login
- Role-Based Access Control

## JWT Payload Example

```json
{
  "sub": "user@email.com",
  "role": "Fleet Manager"
}
```

---

# ⚛️ Frontend Setup (React + Vite)

## 1️⃣ Navigate to Frontend

```bash
cd frontend
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Install Required Libraries

```bash
npm install axios react-router-dom jwt-decode
npm install @react-oauth/google
npm install react-hook-form
npm install recharts
npm install react-hot-toast
```

---

# ▶️ Run Frontend

```bash
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```

---

# 📂 Project Structure

## Backend Structure

```
backend/
 ├── app/
 │   ├── api/
 │   ├── auth/
 │   ├── config/
 │   ├── core/
 │   ├── models/
 │   ├── repositories/
 │   ├── routes/
 │   ├── schemas/
 │   ├── services/
 │   ├── utils/
 │   └── main.py
 ├── .env
 ├── requirements.txt
```

---

## Frontend Structure

```
frontend/
 ├── src/
 │   ├── api/
 │   ├── components/
 │   ├── features/
 │   ├── pages/
 │   ├── hooks/
 │   ├── store/
 │   ├── utils/
 │   └── App.jsx
```

---

# 🔄 Complete Project Initialization (Fresh Setup)

```bash
# Clone Repository
git clone repo_url

# Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend Setup
cd ../frontend
npm install
npm run dev
```

---

# 📊 Core Modules

| Module | Description |
|--------|------------|
| Authentication | Login, Register, Google OAuth |
| Dashboard | Fleet KPIs & Overview |
| Vehicle Registry | CRUD for Vehicles |
| Trip Dispatcher | Assign Driver + Vehicle |
| Maintenance Logs | Auto switch to "In Shop" |
| Fuel & Expense Logging | Track operational cost |
| Driver Compliance | License expiry validation |
| Analytics & Reports | ROI & CSV export |

---

# 📈 Business Logic Examples

## Cargo Validation

```python
if cargo_weight > vehicle.max_capacity:
    raise Exception("Cargo exceeds maximum capacity")
```

## Maintenance Auto Status Update

```python
vehicle.status = "In Shop"
```

## Driver License Validation

```python
if driver.license_expiry < today:
    raise Exception("Driver license expired")
```

---

# 📊 Analytics Calculations

## Fuel Efficiency

```
Fuel Efficiency = Distance (km) / Fuel (Liters)
```

## Vehicle ROI

```
ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
```

---

# 📤 GitHub Initialization

```bash
git init
git add .
git commit -m "Initial commit"

git remote add origin https://github.com/yagna1229/FleetFlow.git
git branch -M main
git push -u origin main
```

Add collaborators in GitHub Settings:
- dhrumilkharadi
- vraj0809

---

# 🚀 Future Deployment

## Backend
- Render
- Railway
- VPS

## Frontend
- Vercel
- Netlify

## Database
- Supabase
- Neon
- Railway

---

# ✅ Feature Checklist

- [x] Responsive UI
- [x] Role-Based Access Control
- [x] Google Authentication
- [x] PostgreSQL Database
- [x] Fleet Lifecycle Management
- [x] Maintenance Tracking
- [x] Fuel Logging
- [x] Operational Analytics
- [x] Financial Reporting
- [x] CSV Export

---

# 📌 Conclusion

FleetFlow provides a scalable, modular, and role-based fleet management system designed to improve operational efficiency, compliance monitoring, and financial transparency.

---