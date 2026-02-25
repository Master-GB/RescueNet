# Postman API Testing Guide

## Setup

1. Install Postman: https://www.postman.com/downloads/
2. Import collection: `RescueNet-Missing-Person-API-v2.postman_collection.json`
3. Import environment: `Local-Development.postman_environment.json`
4. Select "Local Development" environment

## Testing Workflow

### 1. Start Server
```bash
cd server
npm run dev
```

### 2. Test Basic Endpoints

**Health Check:**
- Verifies server is running
- Shows Socket.IO connection count

**Get All Reports:**
- Test pagination (page, limit)
- Test filters (status, priority, city)
- Test sorting

**Get Statistics:**
- Verify counts are correct
- Check byPriority breakdown

### 3. Test CRUD Operations

**Create Report:**
1. Send POST request
2. Copy `_id` from response
3. **Important:** If test client is open, you'll see real-time broadcast!

**Get Report by ID:**
1. Replace `:id` with copied ID
2. Verify full details returned

**Update Report:**
1. Update status to "Found"
2. **Check test client for real-time "Person Found" alert!**

**Add Sighting:**
1. Add new sighting
2. **Check test client for real-time sighting broadcast!**

**Delete Report:**
1. Soft delete the report
2. **Check test client for deletion broadcast!**

### 4. Test Socket.IO (NEW!)

**Socket Status:**
- Open test-client.html first
- Check /api/socket/status
- Should show connectedClients: 1

**Test Broadcast:**
- Keep test client open
- Send test broadcast
- Watch message appear in test client instantly!

## Real-Time Testing

**Multi-User Simulation:**
1. Open test-client.html in 2 browsers
2. Create report via Postman
3. Both browsers update instantly
4. **This proves bi-directional communication!**

## Expected Results

All endpoints should return:
- ✅ Correct HTTP status codes
- ✅ Consistent JSON structure
- ✅ Proper error messages
- ✅ Real-time Socket.IO broadcasts

## Troubleshooting

**If Socket.IO not broadcasting:**
- Check server logs for Socket.IO initialization
- Verify test client is connected (green indicator)
- Check browser console for errors

**If validation fails:**
- Check required fields
- Verify data types
- Check coordinates format [longitude, latitude]

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check + Socket.IO status |
| GET | /api/missing-persons | Get all reports |
| GET | /api/missing-persons/:id | Get single report |
| POST | /api/missing-persons | Create report (broadcasts!) |
| PUT | /api/missing-persons/:id | Update report (broadcasts!) |
| DELETE | /api/missing-persons/:id | Delete report (broadcasts!) |
| POST | /api/missing-persons/:id/sightings | Add sighting (broadcasts!) |
| GET | /api/missing-persons/statistics | Get statistics |
| GET | /api/missing-persons/search-location | Search by location |
| GET | /api/socket/status | Socket.IO status |
| POST | /api/socket/test-broadcast | Test broadcasting |