# 🚗 DriveEasy — Smart Car Rental Platform

A **production-ready, full-stack car rental platform** with real-time availability, AI-powered recommendations, secure payments, and role-based access control.

---

## ✨ Features at a Glance

| Feature | Status |
|---|---|
| JWT Auth + Role-based Access | ✅ |
| Real-time availability (Socket.io) | ✅ |
| AI Chat Assistant (OpenAI GPT-4o) | ✅ |
| Stripe Payment Integration | ✅ |
| MongoDB (cars, users, bookings) | ✅ |
| PostgreSQL + Prisma (payments, logs) | ✅ |
| Cloudinary Image Upload | ✅ |
| Email Notifications (Nodemailer) | ✅ |
| Responsive Dark UI (Tailwind + Framer Motion) | ✅ |
| Unit Tests (Jest + Supertest) | ✅ |

---

## 🏗️ Architecture

```
driveeasy/
├── client/                     # React + TypeScript Frontend
│   └── src/
│       ├── components/
│       │   ├── ai/             # AI Chat Widget
│       │   ├── cars/           # CarCard, Filters
│       │   ├── layout/         # Navbar, Footer
│       │   └── ui/             # LoadingScreen
│       ├── hooks/              # useSocket
│       ├── pages/              # All page components
│       ├── store/              # Zustand state (auth)
│       ├── styles/             # Global CSS
│       ├── types/              # TypeScript interfaces
│       └── utils/              # API client (Axios)
│
└── server/                     # Node.js + Express Backend
    ├── __tests__/              # Jest unit tests
    ├── config/                 # MongoDB + PostgreSQL connections
    ├── controllers/            # Business logic
    ├── middleware/              # Auth, error handling
    ├── models/                 # Mongoose schemas
    ├── prisma/                 # Prisma schema (PostgreSQL)
    ├── routes/                 # Express route definitions
    ├── services/               # Socket.io, AI, Email, Cloudinary, Audit
    └── utils/                  # Logger, Seed script
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- PostgreSQL database (Railway, Supabase, or local)

### 1. Clone & Install

```bash
git clone https://github.com/yourname/driveeasy.git
cd driveeasy
npm run install:all
```

### 2. Configure Environment Variables

**Server** — copy and fill `server/.env.example` → `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/carrental
DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/carrental
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
```

**Client** — copy and fill `client/.env.example` → `client/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Initialize Database

```bash
# Run Prisma migrations (PostgreSQL)
cd server
npx prisma migrate dev --name init

# Seed sample data (MongoDB)
npm run seed
```

### 4. Start Development Servers

```bash
# From project root — starts both client + server
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

### 5. Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Admin1234 |
| Owner | owner@demo.com | Demo1234 |
| User | user@demo.com | Demo1234 |

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

### 🔐 Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login & get token |
| POST | `/auth/logout` | ✅ | Logout |
| GET | `/auth/me` | ✅ | Get current user |
| PUT | `/auth/profile` | ✅ | Update profile |
| PUT | `/auth/change-password` | ✅ | Change password |
| POST | `/auth/forgot-password` | ❌ | Send reset email |
| PUT | `/auth/reset-password/:token` | ❌ | Reset password |

**Register Request:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "phone": "+91 98765 43210"
}
```

**Register Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "_id": "64abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 🚗 Car Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/cars` | ❌ | Any | List cars with filters |
| GET | `/cars/:id` | ❌ | Any | Get car details |
| GET | `/cars/owner` | ✅ | Owner/Admin | Get owner's cars |
| GET | `/cars/availability` | ❌ | Any | Check availability |
| POST | `/cars` | ✅ | Owner/Admin | Create car listing |
| PUT | `/cars/:id` | ✅ | Owner/Admin | Update car |
| DELETE | `/cars/:id` | ✅ | Owner/Admin | Delete car |

**GET /cars Query Parameters:**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| city | string | `Mumbai` | Filter by city |
| category | string | `SUV` | Car category |
| minPrice | number | `1000` | Min price/day |
| maxPrice | number | `5000` | Max price/day |
| fuel | string | `Electric` | Fuel type |
| transmission | string | `Automatic` | Transmission |
| seats | number | `5` | Min seats |
| available | boolean | `true` | Availability |
| search | string | `Swift` | Search term |
| sortBy | string | `pricePerDay` | Sort field |
| order | string | `asc` | Sort direction |
| page | number | `1` | Page number |
| limit | number | `12` | Items per page |

**GET /cars Response:**
```json
{
  "success": true,
  "cars": [
    {
      "_id": "64abc...",
      "brand": "Maruti Suzuki",
      "model": "Swift ZXi+",
      "year": 2023,
      "category": "Hatchback",
      "pricePerDay": 1200,
      "location": { "city": "Mumbai", "state": "Maharashtra" },
      "isAvailable": true,
      "rating": { "average": 4.5, "count": 12 },
      "images": [{ "url": "https://...", "isPrimary": true }]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 87,
    "pages": 8
  }
}
```

**POST /cars (multipart/form-data):**
```
name: "Nexon EV"
brand: "Tata"
model: "Nexon EV Max"
year: 2023
category: "Electric"
transmission: "Automatic"
fuel: "Electric"
seats: 5
pricePerDay: 2200
location[city]: "Pune"
location[state]: "Maharashtra"
features[]: "400km Range"
features[]: "Fast Charging"
description: "Go green!"
images: [file1, file2, ...]
```

---

### 📋 Booking Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/bookings` | ✅ | User | Create booking |
| GET | `/bookings` | ✅ | User | Get my bookings |
| GET | `/bookings/:id` | ✅ | User/Owner | Get booking details |
| PUT | `/bookings/:id/cancel` | ✅ | User | Cancel booking |
| GET | `/bookings/owner` | ✅ | Owner | Get bookings for my cars |
| PUT | `/bookings/:id/status` | ✅ | Owner | Update booking status |
| POST | `/bookings/:id/review` | ✅ | User | Add review |

**POST /bookings:**
```json
{
  "carId": "64abc...",
  "startDate": "2025-02-01T00:00:00Z",
  "endDate": "2025-02-05T00:00:00Z",
  "pickupLocation": {
    "address": "Bandra Station",
    "city": "Mumbai"
  },
  "specialRequests": "Child seat please"
}
```

**Booking Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "64xyz...",
    "status": "pending",
    "paymentStatus": "pending",
    "totalDays": 4,
    "pricePerDay": 2200,
    "subtotal": 8800,
    "taxes": 1584,
    "totalAmount": 10384,
    "car": { "brand": "Tata", "model": "Nexon EV Max" },
    "user": { "name": "Priya User", "email": "user@demo.com" }
  }
}
```

---

### 💳 Payment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/create-intent` | ✅ | Create Stripe payment intent |
| POST | `/payments/confirm` | ✅ | Confirm payment |
| GET | `/payments/history` | ✅ | Get payment history |
| POST | `/payments/webhook` | ❌ | Stripe webhook handler |

---

### 🤖 AI Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/ai/chat` | Optional | Chat with AI assistant |
| POST | `/ai/recommendations` | Optional | Get car recommendations |

**POST /ai/chat:**
```json
{
  "message": "I need an SUV under ₹3000/day in Bangalore for 5 people",
  "conversationHistory": [],
  "userPreferences": {}
}
```

**AI Response:**
```json
{
  "success": true,
  "reply": "Great choice! For an SUV in Bangalore under ₹3000/day for 5 people, I found some excellent options...",
  "recommendedCars": [
    { "_id": "...", "brand": "Hyundai", "model": "Creta", "pricePerDay": 2800 }
  ],
  "updatedHistory": [...]
}
```

---

### 🛠️ Admin Endpoints

All admin routes require `role: "admin"`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Platform statistics |
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/:id` | Update user role/status |
| GET | `/admin/cars` | List all cars |
| PUT | `/admin/cars/:id/approve` | Approve/reject car |
| GET | `/admin/bookings` | All bookings |

---

## 🔌 WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_user_room` | `userId` | Join personal notification room |
| `join_admin_room` | — | Join admin room |
| `watch_car` | `carId` | Subscribe to car availability |
| `unwatch_car` | `carId` | Unsubscribe from car |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `car_availability_changed` | `{ carId, isAvailable }` | Real-time availability update |
| `booking_created` | `{ bookingId, message }` | User booking confirmation |
| `booking_status_updated` | `{ bookingId, status }` | Booking status change |
| `new_booking` | `{ carName, userName }` | Owner new booking alert |
| `payment_success` | `{ bookingId, message }` | Payment confirmation |
| `car_approval_status` | `{ carId, approved }` | Car listing approval |

---

## 🚀 Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
# Set VITE_STRIPE_PUBLISHABLE_KEY in Vercel env vars
```

### Backend → Render or Railway

```bash
# Set all environment variables in Render/Railway dashboard
# Start command: node index.js
# Root directory: server/
```

### Database

- **MongoDB** → [MongoDB Atlas](https://cloud.mongodb.com) (free tier available)
- **PostgreSQL** → [Supabase](https://supabase.com) or [Railway](https://railway.app)

### Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret to `.env`
3. Images auto-optimize with `quality: auto` and `fetch_format: auto`

### Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Use test keys (sk_test_... / pk_test_...)
3. Set up webhook: `stripe listen --forward-to localhost:5000/api/payments/webhook`

---

## 🧪 Testing

```bash
# Run all tests with coverage
cd server && npm test

# Run specific test file
npx jest __tests__/auth.test.js

# Run tests in watch mode
npx jest --watch
```

**Test Coverage:**
- Auth: register, login, token validation
- Car Model: validation, indexing
- Booking Model: calculations, status transitions

---

## 🛡️ Security Features

- **Helmet.js** — Secure HTTP headers
- **Rate Limiting** — 100 requests/15min per IP
- **bcryptjs** — Password hashing (cost factor 12)
- **JWT** — Stateless auth with expiry
- **CORS** — Origin whitelist
- **Input Validation** — express-validator
- **Audit Logs** — PostgreSQL audit trail
- **Cookie HTTPOnly** — Secure cookie storage
- **Stripe Webhook Signature** — Verified webhook events

---

## 📧 Email Templates

| Template | Trigger |
|----------|---------|
| Welcome Email | User registration |
| Booking Confirmation | Successful booking |
| Password Reset | Forgot password request |

---

## 🤖 AI Features

The AI assistant (powered by GPT-4o mini) can:

- Understand natural language queries in English/Hindi
- Extract budget, city, category, fuel, and seat requirements from conversational text
- Query the live database for matching cars
- Provide helpful travel and car advice
- Remember conversation context (last 10 messages)

**Example prompts:**
- "SUV under ₹2000/day in Mumbai"
- "Best car for a family of 7 to Goa"  
- "I need an electric car in Bangalore for 3 days"
- "Automatic sedan with sunroof"

---

## 📊 Database Schema

### MongoDB Collections
- **users** — auth, profiles, preferences, notifications
- **cars** — listings, images, features, availability, ratings
- **bookings** — reservations, pricing, status, reviews
- **reviews** — ratings, comments, aspect ratings

### PostgreSQL Tables (Prisma)
- **payments** — Stripe payment records
- **transactions** — Financial transaction log
- **audit_logs** — User action audit trail

---

## 🎨 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand |
| HTTP Client | Axios |
| Real-time | Socket.io Client |
| Backend | Node.js + Express |
| MongoDB ORM | Mongoose |
| PostgreSQL ORM | Prisma |
| Auth | JWT + bcryptjs |
| Payments | Stripe |
| AI | OpenAI GPT-4o mini |
| Storage | Cloudinary |
| Email | Nodemailer |
| Testing | Jest + Supertest |
| Logging | Winston |
| Deployment | Vercel + Render |

---

## 📝 License

MIT © 2024 DriveEasy. Built with ❤️ for the full-stack developer community.
