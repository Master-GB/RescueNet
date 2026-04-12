# 🌍 RescueNet -- Disaster Response & Emergency Coordination Platform

## Live Demo

> ### Live Application
> **Open RescueNet:** [https://rescue-net-8jet.vercel.app/](https://rescue-net-8jet.vercel.app/)

[![Live on Vercel](https://img.shields.io/badge/Live%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://rescue-net-8jet.vercel.app/)

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original-wordmark.svg" width="80"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" width="80"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" width="80"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" width="80"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="80"/>
</p>

------------------------------------------------------------------------

# 📌 Project Overview

**RescueNet** is a MERN-based disaster response and emergency coordination platform developed under **UN SDG 11 - Sustainable Cities and Communities**. 
It integrates real-time disaster intelligence, shelter management, SOS help requests, NGO coordination, routing, and missing person reporting into a unified system designed to improve disaster resilience and response efficiency.

The platform leverages global APIs (USGS, NASA FIRMS, GDACS, ReliefWeb), geospatial indexing, AI-powered triaging, and real-time communication technologies to deliver situational awareness, resource coordination, and structured emergency workflows. Its modular backend architecture ensures scalability, security, and maintainability, making it suitable for real-world deployment in disaster-prone regions.


------------------------------------------------------------------------

# 🚀 Core Modules

------------------------------------------------------------------------

## 🔐 Authentication & Authorization Module

-   JWT-based authentication
-   Secure HTTP-only cookies
-   Role-based access control (ADMIN, CITIZEN, VOLUNTEER, NGO)
-   Admin account lifecycle management

📄 See detailed backend documentation: - [Authentication Module Documentation](server/src/docs/auth/auth.md)

------------------------------------------------------------------------
## 👥 User Management Module

-  Each user(CITIZEN, NGO, VOLUNTEER) can create their profile
-  Each USER can Update their Infomation and can Delete Profile
-  ADMIN can verfiry NGO and VOLUNTEER account
-  ADMIN can any USER except other ADMIN

📄 See detailed backend documentation: - [UserManagement Module Documentation](server/src/docs/userManagement/user-management.md)

------------------------------------------------------------------------

## 🏠 Shelter Management Module

-   Create / Update / Delete shelters
-   GeoJSON-based geospatial storage
-   Nearby shelter search (2dsphere index)
-   Capacity & occupancy tracking
-   Advanced filtering (medical, wheelchair, food, power, etc.)
-   Real-time Socket.IO updates for shelter changes

📄 See detailed backend documentation: - [Shelter Module Documentation](server/src/docs/shelter/shelter.md)

------------------------------------------------------------------------

## 🌍 Geo & Routing Module

-   Forward Geocoding (OpenStreetMap Nominatim)
-   Reverse Geocoding
-   Route generation with alternatives (OSRM)
-   Bounding box support (Sri Lanka & global)
-   Map-ready GeoJSON responses

📄 See detailed backend documentation: - [Geo Module Documentation](server/src/docs/geoLocation/geo-module.md)

------------------------------------------------------------------------

## 🌪 Disaster Monitoring/Analysing and Altar Module

Integrates global disaster intelligence APIs:

-   USGS Earthquake API
-   NASA FIRMS Fire Hotspots API
-   GDACS RSS (Flood, Tsunami, Cyclone, Storm, Volcano, Drought)
-   ReliefWeb Disaster Updates API

Features: - Disaster map (GeoJSON output) - Heatmap-ready endpoint -
Disaster filtering by type - API response caching - Bounding box
filtering - Global & Sri Lanka coverage

### Notifications

-   SMS alerts via Notify.lk API
-   Web Based Alert
  
📄 See detailed backend documentation: - [Disaster Module Documentation](server/src/docs/disasterAPIs/disasterModel.md)

------------------------------------------------------------------------

## 🆘 Help Request Module

This module allows users to submit emergency SOS requests during
disaster situations.

-   Real-time SOS request submission
-   GPS location sharing
-   Last known location fallback when connection drops
-   AI-powered triaging:
    -   Voice-to-text transcription
    -   Multilingual translation
    -   Image severity classification
-   Media uploads (voice & images)
-   Administrative task escalation
-   Automated urgency scoring
    
📄 See detailed backend documentation: - [Help_Request Module Documentation](server/src/docs/help-request/help-request-api.md)

------------------------------------------------------------------------

## 📋 Task Management Module

Provides a structured coordination layer between admins and NGOs.

### Admin Capabilities

-   Register and promote users to NGO role
-   Approve / Reject / Suspend NGOs
-   Manage help request lifecycle
-   Track admin notes and rejection reasons
-   Monitor NGO performance metrics
-   Remove NGOs with safe cleanup logic

### NGO and Volunteer Capabilities

-   View accepted tasks dashboard
-   Accept / Decline assignments
-   Update task progress (In Progress → Completed)
-   Track performance statistics
-   Automatic resolution handling when all assignments complete

📄 See detailed documentation(For ADMIN): - [TaskManagement Module Documentation](server/src/docs/task-management/admin-task-management/admin-taskManagement.md) <br/>
📄 See detailed backend documentation(For NGO/VOLUNTEER): - [TaskManagement Module Documentation](server/src/docs/task-management/ngo-task-management/ngo-taskManagement.md)

------------------------------------------------------------------------

## 🎯 Relief Campaigns Module  

  - Campaign creation & publishing (ADMIN / NGO)
  - Needs & inventory tracking
  - Donation pledges & confirmations
  - Campaign map visibility
  - Filtering & discovery

 📄 See detailed backend documentation: - [Campaign Module Documentation](server/src/docs/campaignsManagement/campaign-management.md)

------------------------------------------------------------------------

## 🔍 Missing Person Reporting Module

Designed to assist communities during disasters.

-   Submit detailed missing person reports
-   Real-time broadcasting via Socket.IO
-   Community sighting submissions
-   Case status updates (Active, Found, Closed)
-   Geospatial search for proximity-based filtering
-   Live case statistics dashboard

📄 See detailed backend documentation: - [Missing-Person Module Documentation](server/src/docs/missingPerson/missingPerson.md)

------------------------------------------------------------------------

# 🧱 Technology Stack

| Category | Technologies |
|---------|--------------|
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Socket.IO, NodeCache, Axios, Cookie Parser |
| **Backend External APIs** | USGS Earthquake API, NASA FIRMS API, GDACS RSS, ReliefWeb API, OSRM Routing API, NodeMailer, OpenWeather / Open-Meteo,  Hugging Face Inference API, Google Translate API, Notify.lk SMS Gateway, OpenStreetMap Nominatim, Cloudinary |
| **Frontend** | React 19, React Router DOM v7, Tailwind CSS (Vigilant Sanctuary System), GSAP & Framer Motion (Animations), Leaflet & React Leaflet (Maps), Recharts (Data Visualization), Socket.IO Client, Axios, Lucide React |
| **Frontend External APIs** | Leaflet (OpenStreetMap), Cloudinary (Image Delivery) |

---

# 🧩 Other Technologies 

## Security & Auth
- JWT Authentication (signed tokens)
- HTTP-only Cookies (session-like experience)
- Role-Based Access Control (RBAC)
- Input Validation (Joi / schema-based validation)

## Testing & Quality
- Jest Unit Testing
- Controller/service mocking
- Postman Collections for API verification

## Real-time & Communication
- Socket.IO broadcasting (shelters, missing persons, etc.)

------------------------------------------------------------------------

# 🗂 Backend Folder Structure
   
      
      server
        |
        ├── node_module
        ├── src/
        |   │
        |   ├── config/
        |   ├── controllers/
        |   ├── docs/
        |   ├── lib/
        |   ├── middleware/
        |   ├── models/
        |   ├── routes/
        |   ├── services/
        |   ├── sockets/
        |   ├── template/
        |   ├── tests
        |   ├── utils
        |   ├── validators/
        |   └── server.js
        |
        ├── tests/
        ├── jest.config.js
        ├── jest.help-loc.config.js
        ├── package-lock.json
        ├── .env.example
        └── package.json
    
------------------------------------------------------------------------

# ⚙️ Getting Started (Backend)

## 1️⃣ Clone Repository

    git clone <repository-url>
    cd server

## 2️⃣ Install Dependencies

    npm install

## 3️⃣ Backend Environment Variables

Create `.env` file inside `server/`

  ```env
    PORT=5000
    DM_URL=your_mongodb_connection_string
    CLIENT_URL=http://localhost:5173
    
    JWT_SECRET=your_secret_key
    JWT_EXPIRES_IN= expir date(noramlly 7 days)
    NODE_ENV=development

    EMAIL_HOST = add you select host
    EMAIL_PORT = 587
    SMTP_USER = add user
    SMTP_PASS = add your pass
    EMAIL_USER = RescuNet <add your registered email>

    # use public OSRM server
    OSRM_BASE_URL=http://router.project-osrm.org
    
    # Nominatim base
    NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
    # For Identify app (Nominatim requires proper User-Agent)
    APP_NAME=RescueNet
    CONTACT_EMAIL=your email

    USGS_BASE_URL=https://earthquake.usgs.gov 
    GDACS_Base_URL=https://www.gdacs.org/xml/rss.xml
    RELIEFWEB_BASE_URL=https://api.reliefweb.int/v1
    RELIEFWEB_APPNAME= your_reliefweb_appname

    # FIRMS requires free MAP_KEY (you can register and get one)
    FIRMS_BASE_URL=https://firms.modaps.eosdis.nasa.gov
    FIRMS_MAP_KEY=your_firms_key

    # Default Sri Lanka bbox
    LK_MIN_LAT=5.7
    LK_MAX_LAT=10.0
    LK_MIN_LNG=79.5
    LK_MAX_LNG=82.1

    # Weather provider open-meteo
    WEATHER_API_PROVIDER=open-meteo
    WEATHER_UNITS=metric
    WEATHER_API_KEY=your_Open-Meteo_key
    
    HUGGINGFACE_API_KEY=your_hf_key
    
    # SMS provider Notify.lk
    NOTIFY_USER_ID=your_user_id
    NOTIFY_API_KEY=your_sms_key
    NOTIFY_SENDER_ID=NotifyDEMO

    # Cloudinary Credentials
    CLOUDINARY_CLOUD_NAME=dszbqdw4l
    CLOUDINARY_API_KEY=your_clodinary_id
    CLOUDINARY_API_SECRET=your_secret_key
```
    
## 4️⃣ Start Server

    npm run dev

------------------------------------------------------------------------

# 🎨 Frontend Overview

**RescueNet Frontend** is a modern, high-performance web application built with React 19 and styled using the custom **"Vigilant Sanctuary"** design system. It provides a specialized, role-based interface for Citizens, NGOs, Volunteers, and Admins to coordinate disaster response efforts effectively.

## 💎 Design Philosophy: "The Vigilant Sanctuary"

The platform's UI follows a specialized design system optimized for clarity and focus under high-stress conditions:
- **Atmospheric Clarity**: Deep obsidian tones (`#151316`) combined with high-frequency signal colors (Mint Signal `#56f7b7`) for maximum legibility.
- **The "No-Line" Rule**: Content is separated by tonal shifts and background hierarchy rather than 1px borders, reducing visual clutter.
- **Glassmorphism**: Layered "glass" panels with backdrop blur provide depth and focus for critical navigation and map controls.
- **Editorial Typography**: Uses **Raleway** for an authoritative yet approachable feel, with a scale designed for readability in motion.

------------------------------------------------------------------------

# 📱 Frontend Features by Role

## 👤 Citizen Portal
- **Real-time SOS Reporting**: Quickly request help with GPS location sharing and automated urgency scoring.
- **Disaster Map**: Interactive map showing real-time earthquakes, fires, and flood alerts from global APIs.
- **Shelter Discovery**: Find nearby shelters with proximity filtering and real-time occupancy status.
- **Missing Persons**: Report missing persons and submit sightings to aid community recovery.
- **Donation Hub**: Discover and pledge to relief campaigns organized by NGOs.
- **Emergency Guides**: On-demand access to first-aid guides and critical emergency contacts.

## 🏢 NGO Portal
- **Campaign Management**: Create and track relief campaigns with inventory and donation monitoring.
- **Task Execution**: Receive and manage official task assignments from platform administrators.
- **Donation Review**: Validate and process community donation pledges.
- **Shelter Coordination**: Manage shelter capacity and amenities in real-time.

## 🤝 Volunteer Portal
- **Field Dashboard**: Real-time view of assigned tasks and localized relief requests.
- **GPS-Enabled Mapping**: Field-ready navigation and situational awareness.
- **Pulse Notifications**: Instant alerts for team coordination and urgent priority changes.
- **Resource Tracking**: Manage relief requests and donations directly from the field.

## ⚙️ Admin Portal
- **Platform Orchestration**: High-level dashboard for monitoring system health and disaster trends.
- **NGO Lifecycle**: Verify into and manage NGO credentials and performance.
- **Task Dispatching**: AI-assisted triaging and assignment of SOS requests to NGOs.
- **Global Governance**: Manage platform-wide shelter standards and situational data.

------------------------------------------------------------------------

# 📂 Frontend Folder Structure

```
client
├── public/                 # Static assets and site index
├── src/
│   ├── assets/             # Images, brand icons, and theme assets
│   ├── components/         # Atomic and reusable UI components
│   ├── constants/          # App-wide configurations and API endpoints
│   ├── contexts/           # Global state (Auth, Notification, Socket)
│   ├── hooks/              # Custom React logic and state helpers
│   ├── layouts/            # Role-specific dashboard structures
│   ├── pages/              # Domain-specific views (Admin, NGO, etc.)
│   ├── routes/             # App routing and Role-Based Access Control
│   ├── services/           # Backend API integration (Axios instance)
│   ├── styles/             # Design tokens and Global CSS
│   └── utils/              # Formatting and helper utilities
├── postcss.config.js       # Styling post-processing
├── tailwind.config.js      # Vigilant Sanctuary theme configuration
└── package.json            # Frontend dependency manifest
```

------------------------------------------------------------------------

# ⚙️ Getting Started (Frontend)

## 1️⃣ Navigate to Client
```bash
cd client
```

## 2️⃣ Install Dependencies
```bash
npm install
```

## 3️⃣ Environment Configuration
Create a `.env` file in the `client/` directory:
```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

## 4️⃣ Start Application
```bash
npm start
```

------------------------------------------------------------------------

# 🧪 Testing

### ✅ Testing Overview
The backend system is tested using multiple testing strategies to ensure reliability, performance, and correctness:

- Unit Testing
- Integration Testing
- API Testing
- Performance Testing

---

## 🔹 Unit Testing
Unit tests focus on testing individual components such as controllers and services in isolation.

---

### 🔧 Tools Used
- Jest
  

### ⚙️ Features
- Controller & service mocking
- Isolated function testing
- Fast execution

### 📂 Documentation
- See detailed documentation: **Unit Testing Guide**
- [Test files located in:](server/src/tests/unit/README.md)
---

## 🔗 Integration Testing
Integration testing verifies that different modules of the application work together correctly.

---

This includes:
- Controller → Service → Database flow
- Middleware execution
- API request/response lifecycle

### 🔧 Tools Used
- Jest
- Supertest

### ⚙️ Features
- API endpoint functionality
- Database interactions
- Authentication & authorization flows
- Error handling between layers

### 📂 Documentation
- See detailed documentation: **Intergation Testing Guide**
- [Test files located in:](server/src/tests/integration/README.md)

---

# 🚀 Performance Testing
Performance testing evaluates the system’s responsiveness, scalability, and stability under different load conditions.

---

### 🔧 Tools Used
- k6 / Artillery / Apache JMeter *(use the one implemented in your project)*


### ⚙️ Testing Types
- Load Testing → Simulate normal user traffic
- Stress Testing → Push system beyond limits
- Spike Testing → Sudden traffic increase


### 📊 What We Measure
- Response Time
- Throughput (requests per second)
- Error Rate
- Concurrent Users Handling


### 📂 Documentation
- See detailed documentation: **Performance Testing Guide**
- [Test files located in:](server/src/tests/performanceTest/README.md)

---

# 🌐 API Testing
API testing ensures that all backend endpoints function correctly, securely, and return expected responses.

---

### 🔧 Tools Used
- Postman
---

### 📂 Postman Collections

-   Postman collections available for:
    -   Authentication → See json documentation: - [Authentication Postman Collection](server/src/docs/auth/auth_Postman_Collection.json)
    -   UserMangemnet → See json documentation: - [UserManagement Postman Collection](server/src/docs/userManagement/user_Postman_Collection.json)
    -   Shelter → See json documentation: - [Shelter Postman Collection](server/src/docs/shelter/shelter_Postmen_Collection.json)
    -   Geo APIs → See json documentation: - [Geo Postman Collection](server/src/docs/geoLocation/geo_Postment_collection.json)
    -   Disaster APIs → See json documentation: - [Disaster Postman Collection](server/src/docs/disasterAPIs/disaster_Postment_collection.json)
    -   Help Request → See json documentation: - [Help_Request Postman Collection](server/src/docs/help-request/Postman_Collection.json)
    -   weather API → See json documentation: - [Help_Request Postman Collection](server/src/docs/weatherAPI/Postman_Collection.json)
    -   Missing person → See json documentation: - [Missing-Person Postman Collection](server/src/docs/missingPerson/RescueNet-Missing-Person-API-v2.postman_collection.json)
    -   Task Management(for ADMIN) → See detailed documentation: - [TaskManagement Postman Collection](server/src/docs/task-management/admin-task-management/Postman_Collection.json)
    -   Task Management(for NGO/VOLUNTEER) → See detailed documentation: - [TaskManagement Postman Collection](server/src/docs/task-management/ngo-task-management/Postman_Collection.json)
    -   Campaign Management → See detailed documentation: - [Campaign Postman Collection](server/src/docs/campaignsManagement/campaign_Postman_Collection.json)

### ⚙️ What We Test
- HTTP methods (GET, POST, PUT, DELETE)
- Request & response validation
- Authentication & authorization
- Error handling (4xx, 5xx responses)
- Data validation

---

 ### For run Test;
    -  Run all the test `npm test`
    -  Run Unit test `npm test:unit`
    -  Run API test `npm test:api`

------------------------------------------------------------------------

# 📚 Project Documentation Links

 #### 🔹 Authentication module → See detailed documentation: - [Authentication Module Documentation](server/src/docs/auth/auth.md)
 #### 🔹 UserManagement module → See detailed documentation: - [UserManagement Module Documentation](server/src/docs/userManagement/user-management.md)
 #### 🔹 Geo Module → See detailed documentation: - [Geo Module Documentation](server/src/docs/geoLocation/geo-module.md)
 #### 🔹 Disaster Module → See detailed documentation: - [Disaster Module Documentation](server/src/docs/disasterAPIs/disasterModel.md)
 #### 🔹 Shelter Module → See detailed documentation: - [Shelter Module Documentation](server/src/docs/shelter/shelter.md)
 #### 🔹 Help Request Module → See detailed documentation: - [Help_Request Module Documentation](server/src/docs/help-request/help-request-api.md)
 #### 🔹 Task Management Module →
   -  See detailed documentation(For ADMIN): - [TaskManagement Module Documentation](server/src/docs/task-management/admin-task-management/admin-taskManagement.md)
   -  See detailed documentation(For NGO/VOLUNTEER): - [TaskManagement Module Documentation](server/src/docs/task-management/ngo-task-management/ngo-taskManagement.md)
 #### 🔹 Missing Person Module → See detailed backend documentation: - [Missing-Person Module Documentation](server/src/docs/missingPerson/missingPerson.md)
 #### 🔹 Campaign Management Module → See detailed backend documentation: - [Campaign Module Documentation](server/src/docs/campaignsManagement/campaign-management.md)

------------------------------------------------------------------------

# 🔐 Security & Production Notes

-   Role-based route protection
-   Input validation middleware
-   Proper error standardization
-   API caching for rate-limit protection
-   HTTPS required for geolocation
-   Environment variable isolation

------------------------------------------------------------------------

# 📜 License

Developed for academic and research purposes under UN SDG 11.
