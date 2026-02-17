import HelpRequest from "../models/HelpRequest.js";
import getWeather from "../utils/WeatherService.js";

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

export async function getHelpRequestById(req, res) {
  try {
    const { id } = req.params;
    const helpRequest = await HelpRequest.findById(id);
    
    if (!helpRequest) {
      return res.status(404).json({ message: "Help request not found" });
    }
    
    res.json(helpRequest);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function updateHelpRequest(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      disasterType,
      message,
      contactNumber,
      realLocation,
      urgency,
      voiceMessage,
      images,
    } = req.body;

    const helpRequest = await HelpRequest.findById(id);
    
    if (!helpRequest) {
      return res.status(404).json({ message: "Help request not found" });
    }

    // Update fields if provided
    if (name) helpRequest.name = name;
    if (location) helpRequest.location = location;
    if (disasterType) helpRequest.disasterType = disasterType;
    if (message) helpRequest.message = message;
    if (contactNumber) helpRequest.contactNumber = contactNumber;
    if (realLocation) helpRequest.realLocation = realLocation;
    if (urgency) helpRequest.urgency = urgency;

    // Handle voice message update
    if (voiceMessage?.data) {
      const buf = Buffer.from(voiceMessage.data, "base64");
      helpRequest.voiceMessage = {
        data: buf,
        mimeType: voiceMessage.mimeType || "audio/mpeg",
        size: buf.length,
      };
    }

    // Handle images update
    if (Array.isArray(images) && images.length > 0) {
      helpRequest.images = images
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

    await helpRequest.save();
    res.json({ message: "Help request updated", helpRequest });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function deleteHelpRequest(req, res) {
  try {
    const { id } = req.params;
    const helpRequest = await HelpRequest.findByIdAndDelete(id);
    
    if (!helpRequest) {
      return res.status(404).json({ message: "Help request not found" });
    }
    
    res.json({ message: "Help request deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
