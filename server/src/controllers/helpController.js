import HelpRequest from "../models/HelpRequest.js";
import getWeather from "../utils/WeatherService.js";
import translate from "google-translate-api-x";
import { HfInference } from "@huggingface/inference";

// Initialize with the token directly.
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

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

    // 4. Translate Message asynchronously (don't fail request if translation fails)
    let translatedMessageText = "";
    if (message) {
        try {
            const res = await translate(message, { to: 'en' });
            translatedMessageText = res.text;
        } catch (error) {
            console.error("Translation error:", error);
        }
    }

    // 4.5 Transcribe Voice Message asynchronously
    let voiceTranscriptionText = "";
    if (voicePayload && voicePayload.data && process.env.HUGGINGFACE_API_KEY) {
        try {
            // Extract buffer
            let rawData = voicePayload.data;
            if (rawData.type === "Buffer" && Array.isArray(rawData.data)) {
                rawData = Buffer.from(rawData.data);
            }
            
            const blob = new Blob([rawData], { type: voicePayload.mimeType || "audio/mpeg" });
            
            // Initialize HfInference with the token dynamically so it picks up the .env key properly
            const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
            
            const result = await hf.automaticSpeechRecognition({
                model: 'openai/whisper-large-v3-turbo',
                data: blob
            }, {
                use_cache: false,
                wait_for_model: true
            });
            
            voiceTranscriptionText = result.text;
        } catch (error) {
            console.error("Voice transcription error (Detailed):", error);
        }
    }
    // 4. Image Severity Analysis (Hugging Face Phase 3)
    let detectedImageLabels = [];
    if (imagePayloads && imagePayloads.length > 0 && process.env.HUGGINGFACE_API_KEY) {
        try {
            const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
            
            // Just scan the first image for now to save latency
            const firstImage = imagePayloads[0];
            let rawData = firstImage.data;
            if (rawData.type === "Buffer" && Array.isArray(rawData.data)) {
                rawData = Buffer.from(rawData.data);
            }
            
            const blob = new Blob([rawData], { type: firstImage.mimeType || "image/jpeg" });
            
            const result = await hf.imageClassification({
                data: blob,
                model: 'google/vit-base-patch16-224'
            }, {
                use_cache: false,
                wait_for_model: true
            });
            
            // result is an array of { label: "...", score: 0.98 }
            if (Array.isArray(result)) {
                detectedImageLabels = result.map(r => r.label);
                
                // If the image looks dangerous, escalate urgency! (Uses ImageNet-1K specific classes)
                const dangerousKeywords = [
                    "flood", "fire", "smoke", "accident", "water", "river", "storm", 
                    "hurricane", "crash", "car", "wreck", "ambulance", "police", 
                    "lakeside", "lakeshore", "seashore", "coast", "volcano", "dam", 
                    "breakwater", "valley", "stone wall", "lumbermill"
                ];
                const hasDanger = detectedImageLabels.some(label => 
                    dangerousKeywords.some(danger => label.toLowerCase().includes(danger))
                );
                
                if (hasDanger) {
                    urgency = "high";
                }
            }
        } catch (error) {
            console.error("Image classification error:", error.message);
        }
    }

    // 5. Save to DB
    const helpRequest = await HelpRequest.create({
      name,
      userId: req.user._id, // Set the owner
      location,
      disasterType,
      message,
      translatedMessage: translatedMessageText,
      contactNumber,
      realLocation,
      urgency,
      weatherCondition: weather,
      voiceMessage: voicePayload,
      voiceTranscription: voiceTranscriptionText,
      images: imagePayloads,
      imageLabels: detectedImageLabels
    });

    res.status(201).json(helpRequest);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function getAllRequests(req, res) {
  try {
    // Pagination: default page 1, limit 20 per page
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // Query: exclude heavy binary fields to reduce response size
    let query = {};
    if (req.user.role !== "ADMIN") {
      query.userId = req.user._id; // Only show their own requests
    }

    const requests = await HelpRequest.find(query)
      .select("-voiceMessage -images")  // Exclude large Buffer fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();  // Return plain JS objects (faster)

    // Get total count for pagination metadata
    const total = await HelpRequest.countDocuments(query);

    res.json({
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    // Authorization check: Ensure user owns the request or is an admin
    const isOwner = helpRequest.userId && helpRequest.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied: You don't have permission to update this request" 
      });
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
    const helpRequest = await HelpRequest.findById(id);
    
    if (!helpRequest) {
      return res.status(404).json({ message: "Help request not found" });
    }

    // Authorization check: Ensure user owns the request or is an admin
    const isOwner = helpRequest.userId && helpRequest.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied: You don't have permission to delete this request" 
      });
    }

    await HelpRequest.findByIdAndDelete(id);
    res.json({ message: "Help request deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
