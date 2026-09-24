# **Fleet Dispatch & Telemetry API**

An event-driven backend architecture designed to handle the logistical complexities of last-mile delivery, dispatching, and real-time fleet tracking.

Built with a strict focus on backend systems architecture rather than frontend UI, this project abstracts the physical challenges of route management—inspired by real-world grocery delivery logistics—into a highly concurrent, containerized API. It leverages a multi-database approach, using relational storage for persistent state and an in-memory cache for high-frequency ephemeral data.

## **🏗️ Architecture**
    
    graph TD
    Client[Client / Dispatcher] -->|POST /orders| API(Node.js / Express API)
    API -->|Write Order| DB[(PostgreSQL)]
    
    Worker[Simulation Worker] -->|Publish Coords| Cache[(Redis Pub/Sub)]
    API -->|Subscribe to Coords| Cache
    
    Worker -->|Status Change| Webhook[Webhook Dispatcher]
    Webhook -->|POST| External[External Client URL]

## **🛠️ Tech Stack**

• **Runtime:** Node.js, Express.js

• **Persistent Storage:** PostgreSQL (Order states, Webhook subscriptions, Routing data)

• **High-Frequency Cache:** Redis (Real-time driver GPS coordinates)

• **Infrastructure:** Docker & Docker Compose

• **Security:** Cryptographic HMAC SHA-256 payload signing

## **✨ Core Features**

• **Event-Driven Webhooks:** A robust subscription system that securely dispatches asynchronous HTTP payloads to third-party services when order statuses update (e.g., **CREATED** to **DELIVERED**).

• **Real-Time Telemetry Cache:** Utilizes Redis to rapidly process, store, and retrieve live driver GPS coordinates, protecting the primary relational database from heavy disk I/O and lock contention.

• **Automated Simulation Worker:** A decoupled background Node.js process that continuously streams mutating geographical coordinates to the API, mocking a live vehicle's tracking hardware.

• **RESTful Order Management:** Clean, modularized API endpoints to provision deliveries and assign unique tracking references.

## **🚀 Getting Started**

### **Prerequisites**

• Node.js (v18+ recommended)

• Docker Desktop

• Git

## **Installation & Boot Sequence**

### **1. Clone the repository:**

        Bash
        git clone https://github.com/your-username/fleet-dispatch-api.git
        cd fleet-dispatch-api

### **2. Install dependencies:**

        Bash
        npm install
    
### **3. Configure Environment Variables:**

   Create a .env file in the root directory:

        PORT=3000
        DATABASE_URL=postgres://postgres:password@localhost:5432/fleet_db
        REDIS_URL=redis://localhost:6379
    
### **4. Spin up the Infrastructure (Tab 1):**

        Bash
        docker compose up -d
    
### **5. Initialize Database Schema (One-time):**

        Bash
        node src/db/init.js

### **6. Start the API Server (Tab 2):**

        Bash
        npm run dev
            
### **7. Start the Development Server:**

        Bash
        npm run simulate

## **📡 API Endpoints (v1)**

### **Orders & Dispatch**

| Method | Endpoint | Description |
| -------- | -------- | -------- |
| POST | /api/v1/orders | Create a new dispatch order |
| PATCH | /api/v1/orders/:id/status | Update status (triggers webhook dispatcher) |

### **Fleet Telemetry**

| Method | Endpoint | Description |
| -------- | -------- | -------- |
| POST | /api/v1/fleet/:driver_id/location | Write driver GPS coordinates to Redis cache |
| GET | /api/v1/fleet/:driver_id/location | Read real-time driver coordinates |

### **Webhook Management**

| Method | Endpoint | Description |
| -------- | -------- | -------- |
| POST | /api/v1/webhooks | Register an external URL to receive signed event payloads |

## **👨‍💻 Author**

**Antonio Ranon Celis**

Software Engineering (B.Eng. Co-op)

Concordia University
