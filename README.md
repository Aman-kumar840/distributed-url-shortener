# 🚀 Distributed URL Shortener

A production-style distributed URL shortening service built using:

- Node.js + Express  
- PostgreSQL  
- Redis  
- Docker  
- NGINX  

This project demonstrates backend system design concepts such as caching, container networking, service health monitoring, analytics tracking, and reverse proxy configuration.

---

## 📦 Features

- Generate short URLs
- Redirect using short codes
- Track total clicks
- Track unique visitors (IP-based)
- Redis caching (Cache HIT / MISS logging)
- Detailed analytics endpoint
- Health check endpoint (Postgres + Redis monitoring)
- Retry logic for service startup
- Fully Dockerized multi-container architecture
- NGINX reverse proxy setup

---

## 🏗 System Architecture

```
Client
   ↓
NGINX (Reverse Proxy)
   ↓
Node.js Application (API Layer)
   ↓
PostgreSQL (Persistent Storage)
   ↔
Redis (Caching Layer)
```

### Request Flow

1. Client sends request
2. NGINX forwards request to Node app
3. App checks Redis cache
4. If cache MISS → fetch from PostgreSQL
5. Cache result in Redis
6. Track click analytics
7. Return response

---

## ⚙️ Tech Stack

| Layer            | Technology            |
|------------------|----------------------|
| Backend          | Node.js + Express    |
| Database         | PostgreSQL           |
| Cache            | Redis                |
| Containerization | Docker               |
| Reverse Proxy    | NGINX                |

---

## 🐳 How to Run (Only 1 Terminal Required)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/distributed-url-shortener.git
cd distributed-url-shortener
```

### 2️⃣ Start the application

```bash
docker-compose up --build
```

Wait until you see:

```
🚀 Server running on port 8000
```

Application will run at:

```
http://localhost:8000
```

---

## 🧪 API Testing Guide

You can use the same terminal or open a new one.

### 🔹 Health Check

```bash
curl http://localhost:8000/health
```

Example response:

```json
{
  "status": "OK",
  "services": {
    "postgres": "UP",
    "redis": "UP"
  }
}
```

---

### 🔹 Create Short URL

```bash
curl -X POST http://localhost:8000/api/url/shorten \
-H "Content-Type: application/json" \
-d '{"longUrl":"https://google.com"}'
```

Example response:

```json
{
  "shortUrl": "http://localhost:8000/1",
  "shortCode": "1"
}
```

---

### 🔹 Redirect

```bash
curl http://localhost:8000/1
```

---

### 🔹 Get URL Analytics

```bash
curl http://localhost:8000/api/url/1/stats
```

Example response:

```json
{
  "shortCode": "1",
  "longUrl": "https://google.com",
  "totalClicks": 5,
  "uniqueVisitors": 3,
  "recentClicks": [
    {
      "ip_address": "127.0.0.1",
      "user_agent": "curl/8.0.1",
      "clicked_at": "2026-02-18T07:30:00.000Z"
    }
  ]
}
```

---

## 🛑 Stop the Application

Press:

```
CTRL + C
```

Then clean containers:

```bash
docker-compose down -v
```

---

## 🖥 Terminal Setup

Minimum required: **1 terminal**

Recommended professional workflow:

| Terminal   | Purpose |
|------------|----------|
| Terminal 1 | `docker-compose up --build` (view logs) |
| Terminal 2 | API testing using curl |

---

## 📂 Project Structure

```
distributed-url-shortener/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── server.js
│
├── nginx.conf
├── docker-compose.yml
├── Dockerfile
├── init.sql
├── .dockerignore
└── README.md
```

---

## 🧠 Scalability Considerations

This system can scale horizontally by:

- Running multiple Node.js instances behind NGINX
- Using Redis for high-speed caching
- Using PostgreSQL indexing for optimized queries
- Adding load balancing
- Moving to managed cloud services (AWS / GCP / Azure)
- Using CDN for global distribution

---

## 🚀 Future Improvements

- JWT authentication for private links
- Expiration support for short URLs
- Rate limiting
- Admin dashboard
- Custom short codes
- Cloud deployment (AWS EC2 / Render / Railway)
- Kubernetes-based scaling
- Metrics with Prometheus + Grafana

---

## 📚 Concepts Demonstrated

- REST API Design
- Database indexing
- Redis caching strategy
- Service retry logic
- Docker networking
- Reverse proxy configuration
- Health monitoring
- Basic system design principles

---

## 👨‍💻 Author

**Aman Kumar**

---

## 🧾 .dockerignore

Create a file named `.dockerignore` in the root directory and add:

```
node_modules
npm-debug.log
.git
.gitignore
.env
```

This prevents unnecessary files from being copied into the Docker image and keeps it lightweight.

---

## 🔥 Summary

This project demonstrates:

- Multi-container backend architecture  
- Caching layer integration  
- Analytics tracking  
- Health monitoring  
- Reverse proxy configuration  
- Dockerized production-style setup  
