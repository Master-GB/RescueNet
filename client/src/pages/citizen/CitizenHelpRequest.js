import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  Droplets,
  Edit,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  User,
  Waves,
  Wind,
  X,
  CheckCircle,
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

const CitizenHelpRequest = ({
  sidebarItems,
  portalTitle = "Citizen Portal",
  avatarLetter = "C",
  homePath = "/citizen-dashboard",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requestId, setRequestId] = useState("");

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingIntervalRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Management State
  const [activeTab, setActiveTab] = useState("apply"); // 'apply' or 'manage'
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const response = await fetch("/api/help", {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch requests");
      setRequests(data.data || []);
    } catch (err) {
      setRequestsError(err.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "manage") {
      fetchRequests();
    }
  }, [activeTab]);

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

  const resetForm = () => {
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
    setEditingId(null);
    setRequestId("");
    setSuccess(false);
    setRecordingTime(0);
  };

  const handleEdit = (request) => {
    setFormData({
      name: request.name,
      contactNumber: request.contactNumber,
      location: request.location,
      realLocation: request.realLocation,
      disasterType: request.disasterType,
      message: request.message,
      images: [], // Images are heavy, we don't pre-populate them for now to avoid complexity
      voiceMessage: null,
    });
    setEditingId(request._id);
    setActiveTab("apply");
    setSuccess(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/help/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete request");
      
      setRequests((prev) => prev.filter((r) => r._id !== id));
      if (editingId === id) resetForm();
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
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
      const url = editingId ? `/api/help/update/${editingId}` : "/api/help/add";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
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
        throw new Error(data?.message || `Failed to ${editingId ? "update" : "submit"} help request`);
      }

      setRequestId(data?.helpRequest?._id || data?._id || "");
      setSuccess(true);
      setShowSuccessModal(true);
      
      if (!editingId) {
        resetForm();
      } else {
        setLoading(false);
        // If updating, maybe show success then switch back or allow more edits
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };
   // Scroll to top functionality
    useEffect(() => {
      // Scroll to top when page loads
      window.scrollTo(0, 0);
      
      const handleScroll = () => {
        setShowScrollTop(window.scrollY > 300);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      portalTitle={portalTitle}
      avatarLetter={avatarLetter}
      homePath={homePath}
    >
      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your help request has been <strong>submitted successfully</strong>. 
              Please <strong>stay safe</strong> until help arrives.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
            >
              Understand & Stay Safe
            </button>
            {requestId && (
              <p className="mt-4 text-xs text-slate-400 font-mono">
                ID: {requestId}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-none mx-0 space-y-6">
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              Help Request Management
            </h1>
            <p className="text-sm text-slate-500">Submit emergency requests or manage existing ones</p>
          </div>
          
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab("apply")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "apply"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plus className="w-4 h-4" />
              Apply Help
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "manage"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${requestsLoading ? "animate-spin" : ""}`} />
              Manage Requests
            </button>
          </div>
        </div>

        {activeTab === "apply" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h2 className="text-2xl font-bold text-red-800">
                {editingId ? "Update Help Request" : "Emergency Help Request"}
              </h2>
              <p className="text-sm text-red-700 mt-1">
                {editingId 
                  ? "Update your existing request details below. Modified data will be sent to response teams." 
                  : "Fill all details on this single page and submit immediately. This is designed for active disaster situations."}
              </p>
            </section>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-emerald-800 font-semibold">
                    Request {editingId ? "updated" : "submitted"} successfully.
                  </p>
                  {requestId && <p className="text-sm text-emerald-700 mt-1">Request ID: {requestId}</p>}
                </div>
                {editingId && (
                  <button 
                    onClick={() => setActiveTab("manage")}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium"
                  >
                    View in Manage
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-none bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {editingId && (
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    Editing Mode
                  </div>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="text-xs text-slate-500 hover:text-red-600 font-medium"
                  >
                    Cancel Edit & Create New
                  </button>
                </div>
              )}
              
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900"
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
                  {editingId ? "Update your details. These will be synchronized with our dashboard." : "Submit once all details are entered. Response teams will use this data for faster dispatch."}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 rounded-lg disabled:bg-slate-400 text-white font-semibold transition inline-flex items-center justify-center gap-2 ${
                  editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? (editingId ? "Updating..." : "Submitting...") : (editingId ? "Update Help Request" : "Submit Emergency Help Request")}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {requestsError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700 text-sm">{requestsError}</p>
              </div>
            )}

            {requestsLoading && requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Fetching your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-center px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No requests found</h3>
                <p className="text-slate-500 max-w-sm mt-1">
                  You haven't submitted any emergency help requests yet or they might have been cleared.
                </p>
                <button
                  onClick={() => setActiveTab("apply")}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Create Your First Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map((request) => (
                  <div 
                    key={request._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          request.urgency === 'high' ? 'bg-red-100 text-red-600' : 
                          request.urgency === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {disasterTypes.find(d => d.value === request.disasterType)?.icon ? (
                            React.createElement(disasterTypes.find(d => d.value === request.disasterType).icon, { className: "w-6 h-6" })
                          ) : <AlertTriangle className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900">{request.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              request.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                              request.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {request.location}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Submitted on {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:self-center">
                        <button
                          onClick={() => setViewingRequest(request)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(request)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(request._id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Help Request?</h3>
                <p className="text-slate-500 mb-6">
                  This action cannot be undone. This request will be permanently removed from the emergency system.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={deleting}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    disabled={deleting}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:bg-red-400"
                  >
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {deleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
                <button 
                  onClick={() => setViewingRequest(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    viewingRequest.urgency === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {disasterTypes.find(d => d.value === viewingRequest.disasterType)?.icon ? (
                            React.createElement(disasterTypes.find(d => d.value === viewingRequest.disasterType).icon, { className: "w-8 h-8" })
                          ) : <AlertTriangle className="w-8 h-8" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{viewingRequest.name}</h2>
                    <p className="text-slate-400 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {viewingRequest.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</p>
                    <p className="font-bold text-slate-900 capitalize">{viewingRequest.status}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Urgency</p>
                    <p className={`font-bold capitalize ${
                      viewingRequest.urgency === 'high' ? 'text-red-600' : 
                      viewingRequest.urgency === 'medium' ? 'text-amber-600' : 'text-blue-600'
                    }`}>{viewingRequest.urgency}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Contact</p>
                    <p className="font-bold text-slate-900">{viewingRequest.contactNumber}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Weather</p>
                    <p className="font-bold text-slate-900">{viewingRequest.weatherCondition || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Situation Details
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                    {viewingRequest.message}
                  </div>
                </div>

                {viewingRequest.voiceTranscription && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-purple-600" />
                      Voice Transcription
                    </h4>
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-purple-900 italic">
                      "{viewingRequest.voiceTranscription}"
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setViewingRequest(null);
                      handleEdit(viewingRequest);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                  >
                    Edit This Request
                  </button>
                  <button
                    onClick={() => setViewingRequest(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CitizenHelpRequest;
