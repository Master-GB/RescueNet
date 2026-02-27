# Help Request API Documentation

## Overview

The Help Request API is a core feature of RescueNet that allows users to submit emergency help requests during disaster situations. The system automatically determines urgency levels based on real-time weather conditions, disaster types, and AI-powered image severity analysis, providing an intelligent response mechanism for emergency management.

---

## Table of Contents

1. [Data Model](#data-model)
2. [API Endpoints](#api-endpoints)
3. [Auto-Urgency Logic](#auto-urgency-logic)
4. [Weather Integration](#weather-integration)
5. [Media Upload Format](#media-upload-format)
6. [Error Handling](#error-handling)
7. [Usage Examples](#usage-examples)

---

## Data Model

### HelpRequest Schema

| Field                   | Type          | Required        | Description                                                           |
| ----------------------- | ------------- | --------------- | --------------------------------------------------------------------- |
| `name`                  | String        | ✓               | Name of the person requesting help                                    |
| `location`              | String        | ✓               | General location description                                          |
| `realLocation`          | String        | ✓               | Precise location for weather lookup and rescue                        |
| `contactNumber`         | String        | ✓               | Contact number for follow-up                                          |
| `disasterType`          | String (Enum) | ✓               | Type of disaster: `flood`, `tsunami`, `landslide`, `cyclone`, `other` |
| `message`               | String        | ✓               | Detailed description of the emergency                                 |
| `translatedMessage`     | String        | Auto-populated  | AI-translated version of the message into English                     |
| `urgency`               | String (Enum) | Auto-calculated | Priority level: `low`, `medium`, `high`                               |
| `weatherCondition`      | String        | Auto-populated  | Current weather at the location                                       |
| `voiceMessage`          | Object        | ✗               | Optional voice recording (Base64 encoded)                             |
| `voiceMessage.data`     | Buffer        | ✗               | Audio data buffer                                                     |
| `voiceMessage.mimeType` | String        | ✗               | Audio format (default: `audio/mpeg`)                                  |
| `voiceMessage.size`     | Number        | ✗               | File size in bytes                                                    |
| `voiceTranscription`    | String        | Auto-populated  | AI-transcribed text from the voice message                            |
| `images`                | Array[Object] | ✗               | Optional images (Base64 encoded)                                      |
| `images[].data`         | Buffer        | ✗               | Image data buffer                                                     |
| `images[].mimeType`     | String        | ✗               | Image format (default: `image/jpeg`)                                  |
| `images[].size`         | Number        | ✗               | File size in bytes                                                    |
| `imageLabels`           | Array[String] | Auto-populated  | AI-detected context labels from the images                            |
| `createdAt`             | Date          | Auto            | Timestamp of request creation                                         |
| `updatedAt`             | Date          | Auto            | Timestamp of last update                                              |

---

## API Endpoints

### Base URL

```
/api/help
```

### 1. Create Help Request

**Endpoint:** `POST /api/help/add`

**Description:** Creates a new help request with automatic urgency calculation and weather detection.

**Request Body:**

```json
{
  "name": "John Doe",
  "location": "Downtown Area",
  "realLocation": "Mumbai",
  "contactNumber": "+91-9876543210",
  "disasterType": "flood",
  "message": "Urgent help needed. Water level rising rapidly.",
  "voiceMessage": {
    "data": "base64EncodedAudioData...",
    "mimeType": "audio/mpeg"
  },
  "images": [
    {
      "data": "base64EncodedImageData...",
      "mimeType": "image/jpeg"
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "_id": "65f8a3b2c1d4e5f6g7h8i9j0",
  "name": "Jane Test",
  "location": "Flood Zone",
  "realLocation": "Test City",
  "contactNumber": "+1-555-9999",
  "disasterType": "flood",
  "message": "¡El agua está subiendo muy rápido!",
  "translatedMessage": "The water is rising very fast!",
  "urgency": "high",
  "weatherCondition": "Heavy rain",
  "voiceTranscription": "Help, we are stuck on the roof.",
  "imageLabels": [
    "lumbermill, sawmill",
    "stone wall",
    "lakeside, lakeshore"
  ],
  "voiceMessage": { ... },
  "images": [ ... ],
  "createdAt": "2024-03-18T10:30:00.000Z",
  "updatedAt": "2024-03-18T10:30:00.000Z"
}
```

---

### 2. Get All Help Requests

**Endpoint:** `GET /api/help/`

**Description:** Retrieves all help requests sorted by creation date (newest first).

**Response:** `200 OK`

```json
[
  {
    "_id": "65f8a3b2c1d4e5f6g7h8i9j0",
    "name": "John Doe",
    "urgency": "high",
    "disasterType": "flood",
    ...
  },
  {
    "_id": "65f8a3b2c1d4e5f6g7h8i9j1",
    "name": "Jane Smith",
    "urgency": "medium",
    "disasterType": "cyclone",
    ...
  }
]
```

---

### 3. Get Help Request by ID

**Endpoint:** `GET /api/help/getid/:id`

**Description:** Retrieves a specific help request by its ID.

**Parameters:**

- `id` (path parameter): MongoDB ObjectId of the help request

**Response:** `200 OK`

```json
{
  "_id": "65f8a3b2c1d4e5f6g7h8i9j0",
  "name": "John Doe",
  "location": "Downtown Area",
  "realLocation": "Mumbai",
  ...
}
```

**Error Response:** `404 Not Found`

```json
{
  "message": "Help request not found"
}
```

---

### 4. Update Help Request

**Endpoint:** `PUT /api/help/update/:id`

**Description:** Updates an existing help request. Only provided fields will be updated.

**Parameters:**

- `id` (path parameter): MongoDB ObjectId of the help request

**Request Body:** (All fields optional)

```json
{
  "name": "John Doe Updated",
  "urgency": "low",
  "message": "Situation improved, water receding"
}
```

**Response:** `200 OK`

```json
{
  "message": "Help request updated",
  "helpRequest": { ... }
}
```

---

### 5. Delete Help Request

**Endpoint:** `DELETE /api/help/delete/:id`

**Description:** Deletes a help request permanently.

**Parameters:**

- `id` (path parameter): MongoDB ObjectId of the help request

**Response:** `200 OK`

```json
{
  "message": "Help request deleted successfully",
  "id": "65f8a3b2c1d4e5f6g7h8i9j0"
}
```

---

## Auto-Urgency Logic

The system automatically calculates urgency based on three main factors:

### Priority Rules (in order):

1. **HIGH Priority** - Triggered if:
   - Current weather is `Rain` or `Thunderstorm`, OR
   - Disaster type is `flood` or `tsunami`, OR
   - The AI Image Classification detects dangerous context keywords (e.g. `flood`, `fire`, `hurricane`, `lakeshore`, `volcano` etc.) in the uploaded images.

2. **MEDIUM Priority** - All other cases

3. **LOW Priority** - Default fallback (rarely used due to rule #2)

### Logic Flow:

```javascript
if (weather === "Rain" || weather === "Thunderstorm") {
  urgency = "high";
} else if (disasterType === "flood" || disasterType === "tsunami") {
  urgency = "high";
} else {
  urgency = "medium";
}

// AI Phase 3: Escalate if an image depicts a dangerous scene
if (
  detectedImageLabels.some((label) =>
    dangerousKeywords.some((danger) => label.includes(danger)),
  )
) {
  urgency = "high";
}
```

> [!NOTE]
> The urgency is automatically set on creation but can be manually overridden via the update endpoint if needed.

---

## Weather Integration

### Service Provider

The system supports two weather providers (configurable via environment variables):

1. **Open-Meteo** (Default, no API key required)
2. **OpenWeatherMap** (Requires API key)

### Configuration

**Environment Variables:**

```bash
WEATHER_API_PROVIDER=open-meteo  # or "openweather"
WEATHER_UNITS=metric             # or "imperial"
WEATHER_API_KEY=<your-key>       # Required only for OpenWeatherMap
```

### Weather Detection Process

1. **Location Resolution:**
   - Uses `realLocation` field (fallback to `location` if not provided)
   - Geocodes city name to coordinates using Open-Meteo Geocoding API
2. **Weather Fetch:**
   - Retrieves current weather conditions
   - Maps weather codes to human-readable conditions
3. **Condition Mapping:**
   - Weather codes are mapped to conditions like:
     - `Clear`, `Partly cloudy`, `Overcast`
     - `Rain`, `Thunderstorm`, `Snow`
     - `Fog`, `Drizzle`, etc.

### Weather Code Mapping (Open-Meteo)

| Code  | Condition                  |
| ----- | -------------------------- |
| 0     | Clear                      |
| 1-3   | Cloudy variations          |
| 45-48 | Fog                        |
| 51-57 | Drizzle                    |
| 61-67 | Rain (various intensities) |
| 71-77 | Snow                       |
| 80-86 | Showers                    |
| 95-99 | Thunderstorm (with hail)   |

> [!IMPORTANT]
> Weather data is fetched **at the time of request creation** and stored in the `weatherCondition` field. It is not updated automatically.

---

## Media Upload Format

### Base64 Encoding

All media files (voice messages and images) must be sent as Base64-encoded strings.

### Voice Message Format

```json
{
  "voiceMessage": {
    "data": "SGVsbG8gV29ybGQh", // Base64 string
    "mimeType": "audio/mpeg" // Optional, defaults to "audio/mpeg"
  }
}
```

**Supported Audio Formats:**

- `audio/mpeg` (MP3)
- `audio/wav`
- `audio/webm`
- `audio/ogg`

### Image Upload Format

```json
{
  "images": [
    {
      "data": "iVBORw0KGgoAAAANSUhEUg...", // Base64 string
      "mimeType": "image/jpeg" // Optional, defaults to "image/jpeg"
    },
    {
      "data": "iVBORw0KGgoAAAANSUhEUg...",
      "mimeType": "image/png"
    }
  ]
}
```

**Supported Image Formats:**

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

### Storage Details

- Media files are stored **directly in MongoDB** as Binary (Buffer) data
- No external file storage (e.g., AWS S3, local filesystem) is used
- The Base64 data is converted to Buffer before storage
- File size is automatically calculated and stored

> [!CAUTION]
> Large files can significantly increase database size. Consider implementing file size limits in production environments.

---

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "message": "Validation error",
  "error": "Disaster type must be one of: flood, tsunami, landslide, cyclone, other"
}
```

#### 404 Not Found

```json
{
  "message": "Help request not found"
}
```

#### 500 Server Error

```json
{
  "message": "Server Error",
  "error": "Detailed error message"
}
```

### Weather Service Errors

If weather fetching fails, the request creation continues with:

- `weatherCondition`: `"Unknown"`
- Urgency calculation falls back to disaster type only

---

## Usage Examples

### Example 1: Basic Help Request (No Media)

```bash
curl -X POST http://localhost:3000/api/help/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "location": "Riverside District",
    "realLocation": "Kolkata",
    "contactNumber": "+91-9123456789",
    "disasterType": "cyclone",
    "message": "Strong winds, roof damaged, need immediate assistance"
  }'
```

### Example 2: Help Request with Voice Message

```javascript
// Client-side JavaScript example
const audioBlob = await recordAudio(); // Your audio recording function
const reader = new FileReader();

reader.onloadend = async () => {
  const base64Audio = reader.result.split(",")[1]; // Remove data:audio/mpeg;base64,

  const response = await fetch("http://localhost:3000/api/help/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Alex Kumar",
      location: "Coastal Area",
      realLocation: "Chennai",
      contactNumber: "+91-9988776655",
      disasterType: "tsunami",
      message: "Tsunami warning received, evacuation needed",
      voiceMessage: {
        data: base64Audio,
        mimeType: "audio/webm",
      },
    }),
  });

  const result = await response.json();
  console.log("Help request created:", result);
};

reader.readAsDataURL(audioBlob);
```

### Example 3: Help Request with Multiple Images

```javascript
// Convert multiple images to Base64
async function createHelpRequestWithImages(files) {
  const images = await Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              data: reader.result.split(",")[1],
              mimeType: file.type,
            });
          };
          reader.readAsDataURL(file);
        }),
    ),
  );

  const response = await fetch("http://localhost:3000/api/help/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Priya Sharma",
      location: "Village Center",
      realLocation: "Patna",
      contactNumber: "+91-8877665544",
      disasterType: "flood",
      message: "Village submerged, 50+ people stranded on rooftops",
      images: images,
    }),
  });

  return await response.json();
}
```

### Example 4: Updating Request Status

```bash
# Mark situation as resolved
curl -X PUT http://localhost:3000/api/help/update/65f8a3b2c1d4e5f6g7h8i9j0 \
  -H "Content-Type: application/json" \
  -d '{
    "urgency": "low",
    "message": "Rescue team arrived, situation under control"
  }'
```

### Example 5: Fetching High Priority Requests

```javascript
// Get all requests and filter for high urgency
const response = await fetch("http://localhost:3000/api/help/");
const allRequests = await response.json();

const highPriority = allRequests.filter((req) => req.urgency === "high");
console.log(`High priority requests: ${highPriority.length}`);
```

---

## Best Practices

### 1. Location Accuracy

- Always provide the most accurate `realLocation` for proper weather detection
- Use city names or coordinates that weather services can recognize
- Example: `"Mumbai"` instead of `"Near the market"`

### 2. Contact Information

- Ensure contact numbers are valid and reachable
- Include country code for international requests
- Format: `+[country-code]-[number]`

### 3. Message Quality

- Be specific and concise in the `message` field
- Include number of people affected
- Mention any immediate dangers or medical emergencies
- Example: "10 people trapped, water rising, elderly person needs medication"

### 4. Media Optimization

- Compress images before Base64 encoding to reduce payload size
- Use appropriate audio formats (WebM/Opus for better compression)
- Limit image count to essential evidence only

### 5. Error Handling

- Always check response status codes
- Implement retry logic for network failures
- Validate user input before sending requests

---

## Technical Notes

### Database Schema Details

- Model name: `HelpRequest`
- Collection name: `helprequests` (MongoDB auto-pluralization)
- Timestamps: Automatically managed by Mongoose

### Performance Considerations

- Weather API calls add ~500ms to request creation
- Media files increase MongoDB document size significantly
- Consider implementing pagination for `GET /api/help/` in high-volume scenarios

### Future Enhancements

- Real-time urgency updates based on changing weather
- Geolocation coordinates storage
- Status tracking (pending, in-progress, resolved)
- Assignment to rescue teams
- Push notifications for high-priority requests

---

## Troubleshooting

### Weather Data Not Fetching

- **Check internet connectivity** to weather API services
- **Verify location name** is recognized by geocoding service
- **Environment variables** are correctly set
- Fallback: System will continue with `weatherCondition: "Unknown"`

### Media Upload Failures

- **File size too large**: MongoDB has 16MB document size limit
- **Invalid Base64**: Ensure proper encoding without data URI prefix
- **MIME type mismatch**: Verify file type matches declared MIME type

### Urgency Not Auto-Calculating

- Check server logs for weather service errors
- Verify `disasterType` is one of the valid enum values
- Manual override via update endpoint if needed

---

## API Version Information

- Current Version: 1.0
- Last Updated: 2024
- Compatibility: MongoDB 4.0+, Node.js 14+
