# 🚀 Distributed URL Shortener

A production-ready, highly concurrent distributed URL shortening service built using:

- Node.js + Express
- PostgreSQL
- Redis
- Docker
- NGINX

This project demonstrates advanced backend system design concepts, specifically horizontal scaling, decoupling reads from writes via asynchronous background workers, Redis queuing, and reverse proxy load balancing.

---

# 📦 Core Features

- **Horizontal Scalability:** NGINX load balances traffic across multiple dynamically spun-up Node.js containers.
- **Asynchronous Analytics (Zero-Blocking):** Click tracking is decoupled from the redirect flow. Analytics are pushed to a Redis queue and processed by a background worker, preventing PostgreSQL row-locking bottlenecks during high traffic.
- **Lightning Fast Redirects:** Redis acts as the primary read layer for short codes.
- **Detailed Analytics:** Track total clicks, unique visitors (IP-based), and recent click timestamps.
- **Self-Healing Infrastructure:** Health check endpoints and service retry logic ensure the app waits for Postgres and Redis to be fully ready before accepting traffic.

---

# 🏗 System Architecture

```plaintext
Client
   ↓
NGINX (Reverse Proxy / Load Balancer)
   ↓ (least_conn distribution)

[ Node App 1 ]  [ Node App 2 ]  [ Node App 3 ]

   ↓ (Fast Read)        ↓ (Async Write)

Redis (Cache)        Redis List (Queue: "click_logs")
                        ↓
                 [ Background Worker ]
                        ↓ (Bulk Insert/Update)

                 PostgreSQL (Persistent Storage)
```

---

# ⚡ The "Zero-Blocking" Request Flow

1. Client requests a short URL redirect.
2. NGINX routes the request to the Node app with the least active connections.
3. App fetches the long URL directly from Redis (Cache HIT).
4. App pushes click data (IP, User Agent, Timestamp) to a Redis Queue and immediately redirects the user.
5. In the background, the Analytics Worker wakes up, pops batches of clicks from the Redis Queue, and securely writes them to PostgreSQL.

---

# ⚙️ Tech Stack

| Layer | Technology |
|------|------|
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Cache & Queue | Redis |
| Containerization | Docker |
| Load Balancer | NGINX |

---

# 🐳 How to Run

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/distributed-url-shortener.git
cd distributed-url-shortener
```

---

## 2️⃣ Start the Cluster (Scaled out to 3 instances)

```bash
docker-compose up --build --scale app=3
```

Wait until you see the background workers and servers boot up:

```plaintext
🔥 Connected to Redis
✅ Connected to PostgreSQL
👷 Analytics Worker started in the background
🚀 Server running on port 8000
```

The NGINX load balancer will now accept traffic at:

```plaintext
http://localhost:8000
```

---

# 🧪 API Testing Guide

## 🔹 Create Short URL

```bash
curl -X POST http://localhost:8000/api/url/shorten \
-H "Content-Type: application/json" \
-d '{"longUrl":"https://github.com/amankumar"}'
```

---

## 🔹 Redirect (Test the Load Balancer)

```bash
curl -i http://localhost:8000/1
```

(Run this multiple times and check your Docker logs to see NGINX routing the request to different app containers!)

---

## 🔹 Get URL Analytics

```bash
curl http://localhost:8000/api/url/1/stats
```

---

# 📂 Project Structure

```plaintext
distributed-url-shortener/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   │   └── urlController.js
│   ├── middleware/
│   │   └── rateLimiter.js
│   ├── routes/
│   │   ├── healthRoutes.js
│   │   └── urlRoutes.js
│   ├── services/
│   │   └── urlService.js
│   ├── workers/
│   │   └── analyticsWorker.js
│   ├── app.js
│   └── server.js
│
├── nginx.conf
├── docker-compose.yml
├── Dockerfile
├── init.sql
└── README.md
```

---

# 🧠 Concepts Demonstrated

- Decoupling Reads from Writes: Preventing DB locking via background workers.
- Message Queuing: Using Redis Lists (`lPush`, `rPop`) to handle bursts of traffic.
- Container Orchestration: Dynamically scaling Node instances without port collisions.
- Reverse Proxy Load Balancing: Distributing load using NGINX `least_conn`.
- Database Indexing: Optimizing PostgreSQL lookups for Base62 short codes.

---

# 👨‍💻 Author

## Aman Kumar

- LinkedIn: https://www.linkedin.com/in/aman-kumar-016927308/
- GitHub: https://github.com/Aman-kumar840