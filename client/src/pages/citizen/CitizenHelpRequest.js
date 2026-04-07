import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Droplets,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Phone,
  Upload,
  User,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import locationService from "../../services/locationService";

const disasterTypes = [
  { value: "flood", label: "Flood", icon: Droplets },
  { value: "tsunami", label: "Tsunami", icon: Waves },
  { value: "landslide", label: "Landslide", icon: AlertTriangle },
  { value: "cyclone", label: "Cyclone", icon: Wind },
  { value: "other", label: "Other", icon: MapPin },
];

const LocationPicker = ({ onSelectLocation }) => {
  useMapEvents({
    click(event) {
      onSelectLocation(event.latlng.lat, event.latlng.lng, "map");
    },
  });

  return null;
};

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
};

const CitizenHelpRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState("");

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingIntervalRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    location: "",
    realLocation: "",
    disasterType: "other",
    message: "",
    images: [],
    voiceMessage: null,
  });

  const updateLocationFromCoords = (lat, lng, source = "gps") => {
    setCurrentLocation({ lat, lng });
    setMapCenter([lat, lng]);

    const coordinateText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setFormData((prev) => ({
      ...prev,
      realLocation: `${lat},${lng}`,
      location:
        source === "map"
          ? `Selected on map: ${coordinateText}`
          : prev.location || `Current location: ${coordinateText}`,
    }));
  };

  useEffect(() => {
    const unsubscribe = locationService.subscribe((location) => {
      updateLocationFromCoords(location.lat, location.lng, "gps");
    });

    if (!locationService.getLocation()) {
      setLocationLoading(true);
      locationService.getCurrentLocation().finally(() => setLocationLoading(false));
    } else {
      const existing = locationService.getLocation();
      updateLocationFromCoords(existing.lat, existing.lng, "gps");
    }

    return () => {
      unsubscribe();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setError("");
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocationFromCoords(position.coords.latitude, position.coords.longitude, "gps");
        setError("");
        setLocationLoading(false);
      },
      (geoError) => {
        const hasValidLocation = Boolean(currentLocation || locationService.getLocation() || formData.realLocation);

        if (!hasValidLocation) {
          const messageByCode = {
            1: "Location permission denied. Please allow location access.",
            2: "Location unavailable. Please try again.",
            3: "Location request timed out. Please try again.",
          };

          setError(messageByCode[geoError?.code] || "Unable to fetch current location. Please allow location access.");
        } else {
          // Keep UI clean when we already have usable coordinates from a prior successful read.
          setError((prev) =>
            prev === "Unable to fetch current location. Please allow location access." ||
            prev === "Location permission denied. Please allow location access." ||
            prev === "Location unavailable. Please try again." ||
            prev === "Location request timed out. Please try again."
              ? ""
              : prev
          );
        }
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              data: String(event.target?.result || "").split(",")[1],
              mimeType: file.type,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const startVoiceRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData((prev) => ({
            ...prev,
            voiceMessage: {
              data: String(event.target?.result || "").split(",")[1],
              mimeType: "audio/mpeg",
            },
          }));
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 300) {
            recorder.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
              clearInterval(recordingIntervalRef.current);
              recordingIntervalRef.current = null;
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access denied or not available");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const clearVoiceRecording = () => {
    setFormData((prev) => ({ ...prev, voiceMessage: null }));
    setRecordingTime(0);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.contactNumber.trim()) return "Contact number is required";
    if (!formData.location.trim()) return "Location is required";
    if (!formData.message.trim()) return "Please describe your situation";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/help/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          contactNumber: formData.contactNumber,
          location: formData.location,
          realLocation: formData.realLocation,
          disasterType: formData.disasterType,
          message: formData.message,
          images: formData.images.length > 0 ? formData.images : undefined,
          voiceMessage: formData.voiceMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit help request");
      }

      setRequestId(data?.helpRequest?._id || "");
      setSuccess(true);
      setFormData({
        name: "",
        contactNumber: "",
        location: "",
        realLocation: currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : "",
        disasterType: "other",
        message: "",
        images: [],
        voiceMessage: null,
      });
      setRecordingTime(0);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-none mx-0 space-y-6">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-2xl font-bold text-red-800">Emergency Help Request</h1>
          <p className="text-sm text-red-700 mt-1">
            Fill all details on this single page and submit immediately. This is designed for active disaster situations.
          </p>
        </section>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-emerald-800 font-semibold">Request submitted successfully.</p>
            {requestId && <p className="text-sm text-emerald-700 mt-1">Request ID: {requestId}</p>}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-none bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter your contact number"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Current Location / Address
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your current location"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleUseBrowserLocation}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
              >
                Use My Current Location
              </button>
              <p className="text-xs text-slate-500">Or click directly on the map below to set location.</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {locationLoading && "Detecting GPS location..."}
              {!locationLoading && currentLocation && `GPS: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
              {!locationLoading && !currentLocation && "GPS not available. You can still submit using address."}
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom
                style={{ height: "280px", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={mapCenter} />
                <LocationPicker onSelectLocation={updateLocationFromCoords} />
                {currentLocation && (
                  <CircleMarker
                    center={[currentLocation.lat, currentLocation.lng]}
                    radius={10}
                    pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.45 }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Disaster Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {disasterTypes.map((type) => {
                const TypeIcon = type.icon;

                return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, disasterType: type.value }))}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold capitalize transition ${
                    formData.disasterType === type.value
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <TypeIcon className="w-4 h-4" />
                    {type.label}
                  </span>
                </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Situation Details</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="5"
              maxLength={500}
              placeholder="Describe what happened, number of people affected, and what help is needed."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.message.length}/500 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Photos (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full"
              />
              {formData.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={`data:${img.mimeType};base64,${img.data}`}
                        alt={`upload-${idx}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {isRecording ? <MicOff className="w-4 h-4 inline mr-2" /> : <Mic className="w-4 h-4 inline mr-2" />}
                Voice Message (Optional)
              </label>

              {!formData.voiceMessage && !isRecording && (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="w-full px-4 py-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 font-semibold"
                >
                  Start Recording
                </button>
              )}

              {isRecording && (
                <div className="space-y-2">
                  <div className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
                    Recording... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}
                  </div>
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="w-full px-4 py-2 rounded-lg bg-red-600 text-white font-semibold"
                  >
                    Stop Recording
                  </button>
                </div>
              )}

              {formData.voiceMessage && !isRecording && (
                <div className="space-y-2">
                  <div className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold">
                    Voice message attached
                  </div>
                  <button
                    type="button"
                    onClick={clearVoiceRecording}
                    className="w-full px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold"
                  >
                    Clear Recording
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Submit once all details are entered. Response teams will use this data for faster dispatch.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold transition inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Emergency Help Request"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CitizenHelpRequest;
