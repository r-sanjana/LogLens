# LogLens – Centralised Application Monitoring & Incident Management Platform

\<p align="center">
&#x20; \<strong>A full-stack application monitoring platform for centralised log management, automated incident detection and real-time email notifications.\</strong>
\</p>

---

## Overview

**LogLens** is a full-stack application monitoring and incident management platform designed to help developers monitor application activity, identify errors and manage incidents through a centralised dashboard.

It collects application logs through secure API-key-based ingestion, detects error events, automatically generates incidents and sends asynchronous email notifications using Celery and Redis.

The platform provides a unified interface for monitoring application logs, tracking incidents, managing alerts and analysing application activity.

## Problem Statement

In modern software applications, identifying and tracking failures across different services can be challenging. Developers often need to inspect multiple log sources manually, which can delay error detection and incident response.

LogLens addresses this problem by providing a centralised monitoring system that collects application logs, detects errors, generates incidents and notifies developers automatically.

## Key Features

- **User Authentication:** Secure registration and login using JWT authentication.
- **Application Management:** Register, update and manage monitored applications.
- **API Key Management:** Generate, manage and revoke application-specific API keys.
- **Log Ingestion:** Securely receive application logs through REST APIs.
- **Log Explorer:** View, filter and investigate application logs.
- **Automatic Incident Detection:** Detect ERROR-level logs and automatically create or update incidents.
- **Incident Management:** Track incident severity, occurrence counts and resolution status.
- **Email Notifications:** Send asynchronous email alerts using Celery and Redis.
- **Monitoring Dashboard:** View application statistics, log activity and incident status.
- **Analytics:** Visualise log trends and application monitoring metrics.
- **Settings:** View user profile information and manage sessions.

## Technology Stack

| Category              | Technologies                    |
| --------------------- | ------------------------------- |
| Frontend              | React, TypeScript               |
| Styling               | Tailwind CSS                    |
| Backend               | Python, FastAPI                 |
| Database              | PostgreSQL                      |
| ORM                   | SQLAlchemy                      |
| Database Migrations   | Alembic                         |
| Authentication        | JWT                             |
| API Security          | API Key Authentication, Hashing |
| Background Processing | Celery                          |
| Message Broker        | Redis                           |
| Notifications         | Gmail SMTP                      |
| Data Visualisation    | Recharts                        |
| API Testing           | Swagger UI                      |
| Version Control       | Git, GitHub                     |

## System Architecture

```mermaid
flowchart TD
    A[Monitored Applications] -->|Logs + API Key| B[FastAPI Backend]
    B --> C[API Key Authentication]
    C --> D[Log Processing]
    D --> E[(PostgreSQL)]
    D --> F[Incident Detection]
    F --> G[Incident Management]
    G --> H[Alert Generation]
    H --> I[Redis Message Broker]
    I --> J[Celery Worker]
    J --> K[Email Notification]
    B --> L[React Frontend]
    E --> L
    G --> L
    L --> M[Monitoring Dashboard]
    L --> N[Analytics]
```

## Application Workflow

1. Applications register with LogLens and receive API keys.
2. Monitored applications send logs through the secure ingestion endpoint.
3. FastAPI validates the API key and processes incoming logs.
4. Logs are stored in PostgreSQL.
5. ERROR-level logs trigger automatic incident detection.
6. New incidents generate email alerts.
7. Celery processes notification tasks asynchronously using Redis.
8. Developers monitor logs, incidents and alerts through the React dashboard.
9. Developers investigate the underlying application issue, implement a fix and update the incident status in LogLens.

## Project Structure

```text
LogLens/
│
├── app/
│   ├── api/
│   │   ├── routes/
│   │   ├── api_key_deps.py
│   │   └── deps.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── api_key_security.py
│   │   └── celery_app.py
│   │
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── tasks/
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── migrations/
├── alembic.ini
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js and npm
- PostgreSQL
- Redis
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/r-sanjana/LogLens.git
cd LogLens
```

### 2. Backend Setup

Create and activate a virtual environment.

**Windows PowerShell:**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the project root.

Configure the following variables using your own local credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/loglens_db

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASSWORD=your_gmail_app_password
SMTP_TIMEOUT_SECONDS=20
```

**Security:** Never commit `.env` files, passwords, API keys or other credentials to GitHub.

### 4. Database Migration

Run the database migrations:

```powershell
alembic upgrade head
```

### 5. Start the Backend

```powershell
uvicorn app.main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 6. Start Redis

Start your local Redis service or Redis container and verify connectivity:

```powershell
docker exec loglens-redis redis-cli ping
```

Expected response:

```text
PONG
```

### 7. Start the Celery Worker

Open another terminal:

```powershell
celery -A app.core.celery_app:celery_app worker --loglevel=info --pool=solo
```

### 8. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

`http://localhost:5173`

## API Endpoints

| Module           | Endpoint                              | Method     |
| ---------------- | ------------------------------------- | ---------- |
| Authentication   | `/api/v1/auth/register`               | POST       |
| Authentication   | `/api/v1/auth/login`                  | POST       |
| Applications     | `/api/v1/applications/`               | GET / POST |
| API Keys         | `/api/v1/applications/{id}/api-keys/` | GET / POST |
| Log Ingestion    | `/api/v1/logs/ingest`                 | POST       |
| Log Explorer     | `/api/v1/applications/{id}/logs/`     | GET        |
| Incidents        | `/api/v1/incidents/`                  | GET        |
| Incident Details | `/api/v1/incidents/{id}`              | GET        |
| Resolve Incident | `/api/v1/incidents/{id}/resolve`      | PATCH      |
| Alerts           | `/api/v1/alerts/`                     | GET        |
| Dashboard        | `/api/v1/dashboard/summary`           | GET        |
| Log Trends       | `/api/v1/dashboard/log-trends`        | GET        |

For complete request and response schemas, refer to the interactive Swagger documentation at `/docs`.

## Security

- JWT-based user authentication.
- Application-specific API key authentication.
- API keys stored as hashes rather than plaintext.
- Application ownership validation.
- Environment-based configuration for sensitive credentials.

## Future Enhancements

- Docker-based deployment and container orchestration.
- Advanced log search and filtering.
- Real-time dashboard updates.
- More detailed incident investigation and root-cause analysis.
- Additional notification channels.
- Application health monitoring and performance metrics.

## Current Project Status

**Development:** Core backend and frontend functionality implemented and integration-tested locally.

**Containerisation:** Planned.

**Public Deployment:** Not yet deployed.

## Author

**Sanjana R**

BE – Artificial Intelligence and Machine Learning

GitHub: [r-sanjana](https://github.com/r-sanjana)

---

\<p align="center">   \<strong>LogLens – Monitor Smarter. Detect Faster. Resolve Better.\</strong> \</p>
