# ZipLink Engine: High-Performance Distributed URL Optimizer & Auditing Stack

ZipLink is a production-ready, highly scalable URL shortening and analytics platform. Instead of relying on standard monolithic configurations, this system adopts a decoupled microservice-inspired architecture designed to maximize redirection speed while isolating heavy analytics data pipeline writes.

The entire ecosystem is fully containerized, allowing developers to spin up the Node API, Redis Caching Layer, BullMQ Event-Driven Queues, and a PostgreSQL database inside an isolated virtual network with a single command.

---

## 🛠️ System Architecture Design

The core engineering principle behind ZipLink is the **complete separation of user-facing routing performance from background transaction logging**.

[ Visitor Click ] ──► [ Express API Gatekeeper ] ──► ( Instant 302 Redirect )
│
(Check Redis Cache) ──► Hit: O(1) Memory Route
│
▼ (Cache Miss)
[ BullMQ Async Queue ]
│
▼
[ Redis Broker ] ◄─── [ Background Workers ]
│
├──► GeoIP & Hardware Parsing
└──► PostgreSQL Batched Writes

### 1. High-Performance Caching ($O(1)$ Complexity)
When a shortened URL is clicked, the Express controller completely bypasses the relational database. It runs a constant-time lookup against an in-memory **Redis Cache** containing serialized JSON objects. This drops redirect latency down to <1ms.

### 2. Event-Driven Concurrency via BullMQ
To handle viral traffic, the server avoids blocking the HTTP response with blocking database writes. The moment a target URL is resolved, the controller fires an instant `302 Redirect` back to the browser while simultaneously offloading a client metadata payload onto an asynchronous **BullMQ** task queue.

### 3. Isolated Background Workers
Independent background processes pick up the jobs from the Redis message broker to perform heavy computation without impacting user experience:
* **Hardware Fingerprinting:** Parses raw user-agent strings into clean OS/Browser/Device classifications.
* **Network Geolocation:** Extracts client IP addresses to determine international origin profiles.
* **Transactional Persistence:** Updates click counters and appends logs to PostgreSQL via a connection pool.
* **Automated Data Lifecycle:** Utilizing BullMQ Repeatable Jobs (CRON), a maintenance worker wakes up every night at midnight to safely purge expired rows and reclaim database storage space.

---

## ⚡ Technical Stack

* **Frontend:** React, TypeScript, Native CSS Modules (Built for zero framework overhead and absolute layout control).
* **Backend:** Node.js, Express, `pg` Connection Pool, `ua-parser-js`, `geoip-lite`.
* **Layer 2 (Cache/Queue):** Redis Server, BullMQ, IORedis client.
* **Database Layer:** PostgreSQL 15 (Relational persistence with B-Tree indexes on short codes).
* **Security Middleware:** Custom Token-Bucket Rate Limiter utilizing atomic Redis transaction counters.
* **DevOps:** Docker, Docker Compose.

---

## 🏗️ Algorithmic Math Breakdown

### Base10 to Base62 Positional Conversion
To avoid dangerous hash collisions common in random-string generation algorithms, ZipLink maps codes directly to the auto-incrementing database primary keys using positional conversion mathematics. 

By utilizing an alphabet size of $N = 62$ (`0-9`, `a-z`, `A-Z`), a standard 7-character string length yields exponential unique combinations:

$$\text{Total Codes} = 62^7 = 3,521,614,606,208$$

This guarantees over **3.5 Trillion unique links** with guaranteed mathematical uniqueness.

---

## 🚀 Quickstart: Run Locally with Docker

You do not need to manually configure Node, Postgres, or Redis on your host machine. The entire infrastructure is orchestrated via Docker.

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/url-shortener.git](https://github.com/yourusername/url-shortener.git)
cd url-shortener

Create a .env file in your root server directory matching your orchestration settings:

Spin Up the Virtual Network Cluster
docker-compose up --build
