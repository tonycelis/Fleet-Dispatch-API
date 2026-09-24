Real-Time Fleet & Dispatch Tracking API

A backend service built to handle the logistical complexities of last-mile delivery, dispatching, and real-time fleet tracking. Inspired by hands-on experience in the grocery delivery and transport sector, this project abstracts the physical challenges of route management into an event-driven architectural system.

It provides endpoints for creating orders, simulating driver coordinates using Redis pub/sub, and asynchronously dispatching webhook events to external clients when delivery statuses change.

🏗️ Architecture
    
    graph TD
    Client[Client / Dispatcher] -->|POST /orders| API(Node.js / Express API)
    API -->|Write Order| DB[(PostgreSQL)]
    
    Worker[Simulation Worker] -->|Publish Coords| Cache[(Redis Pub/Sub)]
    API -->|Subscribe to Coords| Cache
    
    Worker -->|Status Change| Webhook[Webhook Dispatcher]
    Webhook -->|POST| External[External Client URL]

🛠️ Tech Stack

• Runtime: Node.js, Express.js

• Database: PostgreSQL (Persistent state, Orders, Webhook Subscriptions)

• Cache & Pub/Sub: Redis (Ephemeral driver coordinates, real-time messaging)

• Infrastructure: Docker & Docker Compose

• Architecture: RESTful API, Event-Driven Webhooks

✨ Key Features

• Order Management: REST endpoints to provision dispatch orders and assign unique tracking IDs.

• Real-Time Telemetry Cache: Utilizes Redis to rapidly store and retrieve simulated driver GPS coordinates without overloading the primary relational database.

• Event-Driven Webhooks (WIP): A system that allows third-party services to subscribe to order status updates (e.g., PICKED_UP, DELIVERED) and receive asynchronous HTTP payloads.

• Containerized Infrastructure: One-command local environment spin-up using Docker Compose for the data layer.

🚀 Getting Started

Prerequisites

• Node.js (v18+ recommended)

• Docker Desktop (running)

• Git

Installation

1. Clone the repository:

        Bash
        git clone https://github.com/your-username/fleet-dispatch-api.git
        cd fleet-dispatch-api

2. Install dependencies:

        Bash
        npm install
    
3. Configure Environment Variables:

    Create a .env file in the root directory:

        PORT=3000
        DATABASE_URL=postgres://postgres:password@localhost:5432/fleet_db
        REDIS_URL=redis://localhost:6379
    
4. Start the Database and Cache:

        Bash
        docker compose up -d
    
5. Initialize the Database Schema:

        Bash
        node src/db/init.js
        
6. Start the Development Server:

        Bash
        npm run dev

📡 API Endpoints (v1)

Orders

| Method | Endpoint | Description |
| -------- | -------- | -------- |
| POST | /api/v1/orders | Create a new dispatch order |
| GET | /health | Check API and Database status |

🛣️ Roadmap & Future Enhancements

• Implement the Redis driver simulation worker.

• Build the webhook dispatcher using background jobs.

• Add HMAC payload signing for secure webhook transmission.

• Implement integration tests using Jest and Supertest.

Developed with a focus on backend systems architecture and resilient API design.
