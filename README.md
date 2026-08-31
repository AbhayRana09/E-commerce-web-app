# Full-Stack E-Commerce Web Application

A full-stack e-commerce web platform developed as a personal project to demonstrate modern software architecture, scalable API design, and responsive user interfaces. 

The application is built using Next.js 16 (React 19) on the frontend, FastAPI (Python 3.12) on the backend, and PostgreSQL with Prisma ORM for database management.

---

## Project Overview

The goal of this project was to build an end-to-end online shopping platform with realistic business logic, including a state-machine order lifecycle, automated delivery estimation, coupon management, verified customer reviews, and an administrative control center.

---

## Key Features

### Customer Experience
- **Product Catalog**: Category filtering, instant search, pagination, and multi-parameter sorting.
- **Cart and Wishlist**: Persistent cart state, live price breakdown, coupon code validation, and wishlist toggles.
- **Multi-Address Checkout**: Saved delivery addresses, default selection management, and Cash on Delivery (COD) / simulated card payments.
- **Order Tracking & Milestones**:
  - 4-step delivery progress stepper (Confirmed -> Processing -> Shipped -> Delivered).
  - Calculated estimated delivery date (+4 business days SLA).
  - Chronologically validated action timestamps and itemized receipts.
- **Ratings and Reviews**: Verified purchase reviews with star ratings and comments.
- **User Authentication**: Secure JWT-based authentication, bcrypt password hashing, and account flows.

### Admin Dashboard
- **Analytics & Metrics**: Revenue aggregations, order counts, low-stock alerts, and customer insights.
- **Finite State Machine Order Workflow**: State-machine validation ensuring strict unidirectional order progression.
- **Automated Inventory Restocking**: Cancelling an order automatically restores product stock quantities.
- **Catalog Management**: Full CRUD operations for products, categories, stock, pricing, and image URLs.
- **Coupon Manager**: Percentage and fixed discount codes with minimum order limits and expiration rules.

---

## Architecture & Tech Stack

```
+--------------------------------------------------------+
|                   FRONTEND (Client)                    |
|      Next.js 16 (App Router) - React 19 - Tailwind CSS |
|      Context API (Auth, Cart, Toast, Wishlist)         |
+---------------------------+----------------------------+
                            | REST API (JSON / Bearer JWT)
+---------------------------v----------------------------+
|                   BACKEND (Server)                     |
|         FastAPI (Python 3.12) - Pydantic v2            |
|         JWT Authentication - Finite State Machine      |
+---------------------------+----------------------------+
                            | Async Queries
+---------------------------v----------------------------+
|                   DATABASE LAYER                       |
|       PostgreSQL Database - Prisma Client Python       |
+--------------------------------------------------------+
```

- **Frontend**: Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Lucide React
- **Backend**: FastAPI, Python 3.12, Pydantic v2, Uvicorn, Passlib (bcrypt), PyJWT
- **Database**: PostgreSQL, Prisma ORM (`prisma-client-py`)
- **Key Concepts**: Finite State Machine (FSM), SLA Temporal Auto-Delivery Engine, RESTful API Design

---

## Local Setup & Installation

### Prerequisites
- Node.js: `v18.17+` (or `v20+`)
- Python: `3.10+` (or `3.12`)
- PostgreSQL: Running locally or cloud-hosted instance

---

### 1. Backend Setup

1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install fastapi uvicorn prisma pydantic python-jose passlib bcrypt python-multipart
   ```

4. Create and configure your `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db?schema=public"
   SECRET_KEY="your-secret-jwt-key"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. Push the database schema and generate Prisma client:
   ```bash
   prisma db push
   prisma generate
   ```

6. Seed initial demo products and admin account (optional):
   ```bash
   python scripts/seed.py
   python scripts/create_admin.py
   ```

7. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   - API Base URL: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   - Application URL: `http://localhost:3000`

---

## Engineering Highlights

1. **Finite State Machine (FSM)**: Orders strictly follow valid state transitions (`CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` or `CANCELLED`). Invalid status jumps are rejected at the API layer.
2. **Temporal SLA Delivery Simulation**: To simulate real-world logistics without active courier hardware, the system includes a time-based progression engine that automatically advances order statuses across 24h, 48h, and 96h thresholds.
3. **Proportional Timestamp Interpolation**: When an admin marks an order as delivered early, intermediate milestone timestamps are distributed proportionally between the order placement time and delivery time, ensuring the timeline always remains chronologically valid.
4. **Relational Data Integrity**: Prisma ORM models enforce foreign key constraints, cascading deletes where appropriate, and indexed status lookups.

---

## Author & Project Notes

This project was built independently as a hands-on implementation of full-stack web technologies and software design patterns.
