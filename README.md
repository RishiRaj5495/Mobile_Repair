# RepairNow – Full Stack Mobile Repair Service Platform

RepairNow is a doorstep mobile repair platform that allows users to upload phone issue videos, book trusted technicians, track real-time location, and receive secure repair services without visiting repair shops.
## Tech Stack
Frontend: HTML, CSS, Bootstrap, JavaScript  
Backend: Node.js, Express.js  
Database: MongoDB  
Real-Time Communication: Socket.io  
Notifications: Firebase Admin  
Deployment: Render



## Features
- Doorstep mobile repair booking
- Video issue upload for diagnostics
- Real-time technician tracking
- Google Maps ETA & route optimization
- Verified technician system
- Firebase push notifications
- Customer feedback & reviews
  
---

## Workflow
<img src="images/Workflow.png" width="800" />

---

## Technical Highlights

- Built secure RESTful APIs using Node.js and Express.js
- Implemented real-time communication and live tracking using Socket.io
- Integrated Google Directions API and Distance Matrix API for ETA calculation
- Designed scalable MongoDB schemas with indexing and relational references
- Implemented Firebase Admin push notifications for live service updates
- Applied MVC architecture and production deployment practices using Render

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

## 🛠️ Installation

### Clone the repository

```bash
git clone https://github.com/RishiRaj5495/Mobile_Repair.git
```

### Navigate to project folder

```bash
cd Mobile_Repair
```

### Install dependencies

```bash
npm install
```

### Start the server

```bash
npm run dev
```
---

## 🔐 Environment Variables

Create a `.env` file in the root directory and add:

```env
SECRET=your_secret_key

FIREBASE_SERVICE_ACCOUNT_PATH=path_to_service_account.json

FRONTEND_URL=your_frontend_url

CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

MONGODB_URI=your_mongodb_connection_string

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
FIREBASE_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

GOOGLE_MAPS_API_KEY=your_google_maps_api_key

GOOGLE_APPLICATION_CREDENTIALS=path_to_google_credentials.json

GEMINI_API_KEY=your_gemini_api_key
```


