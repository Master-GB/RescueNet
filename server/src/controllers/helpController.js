import HelpRequest from "../models/HelpRequest.js";
import getWeather from "../utils/weatherService.js";

export async function createHelpRequest(req, res) {
  try {
    const {
      name,
      location,
      disasterType,
      message,
      contactNumber,
      realLocation,
      voiceMessage,
      images,
    } = req.body;

    // 1. Get weather
    const weather = await getWeather(realLocation || location);

    // 2. Auto urgency logic
    let urgency = "low";

    if (weather === "Rain" || weather === "Thunderstorm") {
      urgency = "high";
    } else if (disasterType === "flood" || disasterType === "tsunami") {
      urgency = "high";
    } else {
      urgency = "medium";
    }

    // 3. Prepare media payloads (base64 -> Buffer)
    let voicePayload;
    if (voiceMessage?.data) {
      const buf = Buffer.from(voiceMessage.data, "base64");
      voicePayload = {
        data: buf,
        mimeType: voiceMessage.mimeType || "audio/mpeg",
        size: buf.length,
      };
    }

    let imagePayloads;
    if (Array.isArray(images) && images.length > 0) {
      imagePayloads = images
        .filter((img) => img?.data)
        .map((img) => {
          const buf = Buffer.from(img.data, "base64");
          return {
            data: buf,
            mimeType: img.mimeType || "image/jpeg",
            size: buf.length,
          };
        });
    }

    // 4. Save to DB
    const helpRequest = await HelpRequest.create({
      name,
      location,
      disasterType,
      message,
      contactNumber,
      realLocation,
      urgency,
      weatherCondition: weather,
      voiceMessage: voicePayload,
      images: imagePayloads,
    });

    res.status(201).json(helpRequest);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function getAllRequests(req, res) {
  try {
    const requests = await HelpRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
}
