# RepairNow – Full-Stack Mobile Repair Platform with Real-Time Technician Dispatch

RepairNow is a full-stack doorstep mobile repair platform that connects customers with nearby technicians based on their repair requirements and location.

Customers can submit repair issue videos, receive AI-assisted video validation, book technicians, make online payments, and track technician location and booking status in real time.

The platform combines a Node.js/Express backend with MongoDB, Redis, Kafka, Socket.IO, Razorpay, and a separate Python/FastAPI AI video-processing service deployed on AWS EC2.


---
## Demo

🌐 **Live Application:** [RepairNow](https://repairnow.onrender.com)

💻 **Source Code:** [GitHub Repository](https://github.com/RishiRaj5495/Mobile_Repair)

---

## Features

- 📹 **AI video validation** — customers submit repair videos that are analyzed using visual and speech evidence before technician assignment
- 📍 **Live technician tracking** — real-time technician location and booking-status updates using Socket.IO and Google Maps
- 🔔 **Push notifications** — Firebase notifications triggered by booking-status transitions
- 🧑‍🔧 **Technician discovery** — MongoDB geospatial queries find nearby technicians within a configurable search radius
- 💳 **Online payments** — Razorpay payment processing with webhook signature verification
- ⚡ **Performance optimization** — Redis caching reduces repeated MongoDB reads
- 📨 **Asynchronous processing** — Kafka producer-consumer architecture for booking events
- ⭐ **Reviews** — customers can rate completed repair services
  

---

## Workflow
<img src="images/FullWorkflow.png" width="900" />

---

##  AI Video Validation Pipeline
   Customer repair videos are processed by a dedicated AI service rather than directly inside the main Node.js application.
 mermaid-diagram
 <img src="images/mermaid-diagram.png" width="900" />


---
## Architecture

RepairNow uses a service-separated architecture:

- **Web application:** Node.js + Express + EJS/Bootstrap
- **Application data:** MongoDB
- **Caching:** Redis
- **Asynchronous processing:** Apache Kafka + KafkaJS
- **Real-time communication:** Socket.IO
- **Payments:** Razorpay + webhook signature verification
- **AI inference:** Python + FastAPI
- **Video processing:** FFmpeg
- **Vision analysis:** YOLO
- **Speech analysis:** Faster-Whisper
- **AI deployment:** AWS EC2

The AI service runs independently from the main backend because video processing and inference require significantly more compute than normal API operations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | EJS, HTML, CSS, Bootstrap, JavaScript |
| Backend | Node.js, Express.js, REST APIs |
| Database | MongoDB, Mongoose |
| Caching | Redis |
| Messaging | Apache Kafka, KafkaJS |
| Real-Time | Socket.IO |
| AI Service | Python, FastAPI |
| AI / Video | YOLO, Faster-Whisper, FFmpeg |
| Deployment | AWS EC2, Render |
| Storage | Cloudinary |
| Notifications | Firebase Admin SDK, FCM |
| Maps & ETA | Google Maps, Directions API, Distance Matrix API |
| Payments | Razorpay, Webhooks |
| Developer Tool | Git, Docker, Postman |

---

## Technical Highlights

- Built 15+ RESTful APIs with Node.js and Express.js for authentication, booking workflows, technician management, video validation, and location tracking.

- Implemented Redis caching with cache invalidation, reducing MongoDB reads by approximately 75% and improving measured response time from approximately 489 ms to 109 ms during local testing.

- Implemented Apache Kafka with KafkaJS using a producer-consumer architecture for asynchronous booking-event processing.

- Implemented Socket.IO-based real-time technician location and booking-status synchronization, reducing unnecessary polling by approximately 80%.

- Integrated Razorpay Webhooks with HMAC-SHA256 signature verification to securely process payment events and synchronize payment status with MongoDB.

- Built a separate AI video-validation service using Python, FastAPI, FFmpeg, YOLO, and Faster-Whisper to analyze visual and speech evidence from customer repair videos.

- Deployed the AI inference service on AWS EC2 as a systemd-managed FastAPI service, keeping compute-intensive video processing separate from the main application backend.

- Implemented MongoDB 2dsphere geospatial queries using `$near` and `$geoNear` to discover nearby technicians within a configurable search radius.

- Integrated Google Directions API and Distance Matrix API for route calculation and technician ETA estimation.

- Used Firebase Admin SDK to trigger server-side push notifications during booking-status transitions.
---

## Architecture Decisions

### Why a separate AI service?

Video processing involves frame extraction, object detection, and speech transcription. These workloads are more resource-intensive than normal API requests, so the AI pipeline is isolated into a FastAPI service running on AWS EC2.

### Why Redis?

Redis is used to cache frequently accessed data and reduce repeated MongoDB queries. Cache invalidation is performed when relevant application data changes.

### Why Kafka?

Kafka is used for asynchronous booking-event processing so event-driven operations do not need to block the main request flow.

### Why Socket.IO?

Socket.IO provides real-time communication for technician location and booking-status updates without relying on continuous polling.

### Why Razorpay Webhooks?

Razorpay webhooks allow the backend to receive payment events server-side. HMAC-SHA256 signature verification is used to verify webhook authenticity before updating payment status.
---
## ## Engineering Highlights

| Area | Result |
|---|---|
| REST APIs | 15+ |
| MongoDB read reduction | ~75% with Redis caching |
| Measured response time | ~489 ms → ~109 ms |
| Polling reduction | ~80% using Socket.IO |
| Database collections | 6+ |
| AI processing | YOLO + Faster-Whisper + FFmpeg |


---
## Project Status

🟢 Core RepairNow platform — Working  
🟢 Real-time technician tracking — Working  
🟢 Online payments — Working  
🟢 AI video validation — Working  
🟢 AWS-hosted AI service — Working  
---


## Screenshots

### Homepage & Repair Shop Listings
<img src="images/Homepage.png" width="800"/>

### Customer Issue Reporting & Video Upload
<img src="images/customerForm.png" width="800"/>

### Customer Login
<img src="images/customerLogin.png" width="800"/>

### Customer Signup
<img src="images/customerSighup.png" width="800"/>

### Technician Dashboard
<img src="images/technicianDashboard.png" width="800"/>

### Technician Registration
<img src="images/technicianRegister.png" width="800"/>

---

## Project Structure

```text
Mobile_Repair/
├── AI-Service/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── yolo11n.pt
│   ├── test_yolo.py
│   ├── test_yolo_videos.py
│   └── services/
│       ├── audio_processor.py
│       ├── decision_engine.py
│       ├── semantic_analyzer.py
│       ├── speech_processor.py
│       ├── video_processor.py
│       └── visual_analyzer.py
│
├── Models/
│   ├── mobileShops.js
│   ├── notification.js
│   ├── orders.js
│   ├── ratings.js
│   └── users.js
│
├── config/
│   ├── kafka.js
│   ├── kafkaConsumer.js
│   └── redis.js
│
├── controllers/
│   └── users.js
│
├── routes/
│   ├── allNearbyTechnician.js
│   ├── booking.js
│   ├── eta.js
│   ├── fcm.js
│   ├── mobileShops.js
│   ├── orders.js
│   ├── razorpayWebhook.js
│   └── users.js
│
├── middleware/
│   └── middlewear.js
│
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── admin.js
│   │   ├── approaching.js
│   │   ├── firebase-config.js
│   │   ├── mobileShops.js
│   │   ├── orderTracks.js
│   │   ├── product.js
│   │   ├── ratings,js
│   │   ├── script.js
│   │   └── technicianTrack.js
│   ├── images/
│   └── videos/
│
├── views/
│   ├── includes/
│   ├── layouts/
│   ├── listings/
│   ├── users/
│   └── error.ejs
│
├── images/
│   ├── Architecture.png
│   ├── FullWorkflow.png
│   ├── Homepage.png
│   ├── Workflow.png
│   └── ...
│
├── app.js
├── sockets.js
├── cloudConfig.js
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

### Main Components

- **`routes/`** — API and application routes for bookings, technicians, payments, maps/ETA, notifications, and AI video validation.
- **`Models/`** — MongoDB/Mongoose data models for users, shops, orders, notifications, and ratings.
- **`config/`** — Redis and Kafka configuration and Kafka consumer setup.
- **`sockets.js`** — Socket.IO real-time communication for technician tracking and booking updates.
- **`AI-Service/`** — Separate Python/FastAPI service for video processing and AI-based validation.
- **`AI-Service/services/`** — Video/audio processing, YOLO visual analysis, speech processing, semantic analysis, and decision logic.
- **`public/` and `views/`** — Frontend assets and EJS views.
- **`images/`** — Architecture diagrams and project screenshots.
- **`Dockerfile` / `docker-compose.yml`** — Containerization and local service orchestration.



## 🚀Quick Start
  Run RepairNow locally with Docker:

### Clone the repository

```bash
git clone https://github.com/RishiRaj5495/Mobile_Repair.git
cd Mobile_Repair
```



### Configure environment variables

Create a `.env` file in the project root and add the required environment variables.

### Start the application

```bash
docker compose up --build
```

### Open the application

```text
http://localhost:8080
```

### Check running services

```bash
docker compose ps
```

### Stop the application

```bash
docker compose down
```

For detailed configuration, Docker services, and AI service setup, see the Installation section below.

---

## 🛠️ Installation

### 📋 Prerequisites

Install the following tools:

- Git
- Docker
- Docker Compose

No separate installation of Node.js, MongoDB, Redis, or Kafka is required when running RepairNow with Docker Compose.

---

### 🔗 Clone the Repository

```bash
git clone https://github.com/RishiRaj5495/Mobile_Repair.git
cd Mobile_Repair
```

---

### ⚙️ Environment Variables

Create a `.env` file in the project root:

```text
Mobile_Repair/
├── .env
├── Dockerfile
├── docker-compose.yml
├── package.json
├── app.js
└── ...
```

Add the required environment variables:

```env
SECRET=your_secret_key

REDIS_URL=your_redis_connection_string

KAFKA_BROKER=your_kafka_bootstrap_server
KAFKA_USERNAME=your_kafka_api_key
KAFKA_PASSWORD=your_kafka_api_secret

FRONTEND_URL=your_frontend_url

CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

MONGODB_URI=your_mongodb_connection_string

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
FIREBASE_SERVICE_ACCOUNT_PATH=path_to_service_account.json

GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

> **Important:** These values are placeholders. Never commit API keys, passwords, Firebase credentials, private keys, or other secrets to GitHub.

---

### 🐳 Docker Compose

Build the application image and start the required services:

```bash
docker compose up --build
```

Docker Compose starts the following local services:

```text
RepairNow Backend
       │
       ├── MongoDB
       ├── Redis
       └── Kafka
```

The backend is available at:

```text
http://localhost:8080
```

#### Run in the Background

```bash
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

---

### 🧩 Docker Services

RepairNow uses Docker Compose to run the main backend infrastructure locally.

| Service | Technology | Port | Purpose |
|---|---|---:|---|
| `backend` | Node.js + Express | `8080` | Main RepairNow application |
| `mongodb` | MongoDB | `27017` | Application database |
| `redis` | Redis 7 | `6379` | Caching and session-related data |
| `kafka` | Apache Kafka | `9092` | Asynchronous event processing |

#### Backend

The root `Dockerfile` uses Node.js 22 Alpine and runs the RepairNow backend on port `8080`.

#### MongoDB

MongoDB is used as the primary application database.

#### Redis

Redis is used for caching and session-related data.

#### Kafka

Apache Kafka is used for asynchronous booking-event processing.

---

### 🤖 AI Video Validation Service

RepairNow's AI video validation runs as a separate service from the main Docker Compose application.

AI service location:

```text
AI-Service/
```

The service uses:

- Python
- FastAPI
- FFmpeg
- YOLO
- Faster-Whisper
- Semantic analysis
- Decision engine

The AI service has its own Dockerfile:

```text
AI-Service/Dockerfile
```

The AI service is deployed separately from the main backend because video processing and AI inference require more compute resources.

#### Local AI Service Testing

```bash
cd AI-Service
docker build -t repairnow-ai .
docker run -p 10000:10000 repairnow-ai
```

The local FastAPI service is available at:

```text
http://localhost:10000
```

For the deployed setup, the AI service runs separately on AWS EC2.

---

### 🧰 Useful Docker Commands

#### Rebuild

```bash
docker compose up --build
```

#### Start in Background

```bash
docker compose up -d
```

#### Stop

```bash
docker compose down
```

#### Check Services

```bash
docker compose ps
```

#### View Logs

```bash
docker compose logs -f
```

#### View Backend Logs

```bash
docker compose logs -f backend
```

#### Rebuild Without Cache

```bash
docker compose build --no-cache
```

#### Restart Services

```bash
docker compose restart
```

---

