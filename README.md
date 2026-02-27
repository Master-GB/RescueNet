# 🌍 RescueNet -- Disaster Response & Emergency Coordination Platform

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
| **Backend External APIs** | USGS Earthquake API, NASA FIRMS API, GDACS RSS, ReliefWeb API, OSRM Routing API, NodeMailer, OpenWeather / Open-Meteo,  Hugging Face Inference API, Google Translate API, Notify.lk SMS Gateway, OpenStreetMap Nominatim |
| **Frontend** |  |
| **Frontend External APIs** |  |

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
```
    
## 4️⃣ Start Server

    npm run dev

------------------------------------------------------------------------

# 🧪 Backend Testing

-   Jest unit testing
-   Controller & service mocking
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
 -  For run Test;
    -  Run all the test `npm test`
    -  Run Unit test `npm test:unit`
    -  Run API test `npm test:api`

------------------------------------------------------------------------

# 📚 Backend Documentation Links

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
