import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Clock3, TriangleAlert, ArrowRight, X, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { fetchHelpRequests, acceptHelpRequest } from "./volunteerDashboardApi";

const HELP_OPTIONS = [
  { id: "medical", label: "Medical Assistance", icon: "🏥" },
  { id: "supplies", label: "Food & Supplies", icon: "📦" },
  { id: "rescue", label: "Search & Rescue", icon: "🆘" },
  { id: "shelter", label: "Shelter Support", icon: "🏠" },
  { id: "water", label: "Water & Sanitation", icon: "💧" },
  { id: "coordination", label: "Communication", icon: "📱" },
  { id: "transport", label: "Transportation", icon: "🚗" },
  { id: "other", label: "Other Support", icon: "🤝" },
];

const toPriority = (urgency) => {
  if (urgency === "high") {
    return { label: "Critical", badge: "bg-red-100 text-red-700 border-red-200" };
  }
  if (urgency === "medium") {
    return { label: "High", badge: "bg-amber-100 text-amber-700 border-amber-200" };
  }
  return { label: "Normal", badge: "bg-blue-100 text-blue-700 border-blue-200" };
};

const getTimeAgo = (timestamp) => {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours} hr ago`;
};

const isTaskClosedStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  return ["resolved", "rejected", "completed"].includes(normalized);
};

const isAcceptedByCurrentVolunteer = (task, currentUserId) => {
  if (!task || !currentUserId) return false;

  const assignedVolunteerId =
    typeof task.assignedVolunteerId === "object"
      ? task.assignedVolunteerId?._id
      : task.assignedVolunteerId;

  if (assignedVolunteerId && String(assignedVolunteerId) === String(currentUserId)) {
    return true;
  }

  return (task.volunteerAcceptances || []).some((entry) => {
    const volunteerId =
      typeof entry?.volunteerId === "object" ? entry?.volunteerId?._id : entry?.volunteerId;
    return volunteerId && String(volunteerId) === String(currentUserId);
  });
};

const getHelpTypeLabel = (helpType) => {
  const match = HELP_OPTIONS.find((option) => option.id === helpType);
  return match?.label || helpType || "Not provided";
};

const VolunteerTaskBoard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id || null;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingTaskId, setAcceptingTaskId] = useState(null);
  const [acceptFeedback, setAcceptFeedback] = useState({});
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [modalTaskId, setModalTaskId] = useState(null);
  const [selectedHelpType, setSelectedHelpType] = useState(null);
  const [helpDescription, setHelpDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const loadTasks = async () => {
    try {
      const data = await fetchHelpRequests(8);
      setTasks(data?.data || []);
    } catch (error) {
      console.error("Failed to load help tasks:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleOpenAcceptModal = (taskId) => {
    setModalTaskId(taskId);
    setSelectedHelpType(null);
    setHelpDescription("");
    setContactNumber("");
  };

  const handleConfirmAccept = async (taskId, helpType) => {
    if (!helpType) {
      alert("Please select how you want to help");
      return;
    }

    if (!helpDescription.trim()) {
      alert("Please describe how you plan to help");
      return;
    }

    if (!contactNumber.trim()) {
      alert("Please enter your contact number");
      return;
    }

    setAcceptingTaskId(taskId);
    try {
      await acceptHelpRequest(taskId, {
        volunteerHelpType: helpType,
        volunteerHelpDescription: helpDescription.trim(),
        volunteerContactNumber: contactNumber.trim(),
      });
      await loadTasks();
      setAcceptFeedback((prev) => ({
        ...prev,
        [taskId]: { 
          type: "success", 
          message: `Task accepted as ${HELP_OPTIONS.find(o => o.id === helpType)?.label}. Admin will contact you immediately.` 
        },
      }));
      setModalTaskId(null);
      setSelectedHelpType(null);
      setHelpDescription("");
      setContactNumber("");
    } catch (error) {
      setAcceptFeedback((prev) => ({
        ...prev,
        [taskId]: { type: "error", message: `Error: ${error.message}` },
      }));
    } finally {
      setAcceptingTaskId(null);
    }
  };

  const mappedTasks = useMemo(() => {
    return tasks.map((task) => {
      const priority = toPriority(task.urgency);
      const myAcceptance = (task.volunteerAcceptances || []).find((entry) => {
        const volunteerId =
          typeof entry?.volunteerId === "object" ? entry?.volunteerId?._id : entry?.volunteerId;
        return currentUserId && volunteerId && String(volunteerId) === String(currentUserId);
      });

      return {
        id: task._id,
        title: `${String(task.disasterType || "General").toUpperCase()} Support Request`,
        location: task.realLocation || task.location || "Location unavailable",
        eta: getTimeAgo(task.createdAt),
        priorityLabel: priority.label,
        badge: priority.badge,
        contactNumber: task.contactNumber || "Not provided",
        message: task.message || "No message provided",
        status: task.status || "pending",
        assignedVolunteerId: task.assignedVolunteerId || null,
        volunteerAcceptances: Array.isArray(task.volunteerAcceptances)
          ? task.volunteerAcceptances
          : [],
        mySupportType: myAcceptance?.helpType || "",
        mySupportDescription: myAcceptance?.helpDescription || "",
        mySupportContact: myAcceptance?.volunteerContactNumber || "",
      };
    });
  }, [tasks, currentUserId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-slate-500">
        Loading assigned response tasks...
      </div>
    );
  }

  if (mappedTasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-slate-500">
        No active help requests found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="space-y-4">
        {mappedTasks.map((task) => {
          const feedback = acceptFeedback[task.id];
          const isAccepting = acceptingTaskId === task.id;
          const isExpanded = expandedTaskId === task.id;
          const isAccepted = isAcceptedByCurrentVolunteer(task, currentUserId);
          const isClosed = isTaskClosedStatus(task.status);

          return (
            <div
              key={task.id}
              className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-800">{task.title}</h4>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    <span>{task.location}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="w-4 h-4" />
                    <span>Created: {task.eta}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${task.badge}`}
                >
                  <TriangleAlert className="w-3.5 h-3.5" />
                  {task.priorityLabel}
                </span>
              </div>

              {feedback && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {isExpanded && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
                  <p><span className="font-semibold">Status:</span> {task.status}</p>
                  <p><span className="font-semibold">Contact:</span> {task.contactNumber}</p>
                  <p><span className="font-semibold">Details:</span> {task.message}</p>
                  {isAccepted && (
                    <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1">
                      <p className="text-emerald-800 font-semibold">Your Support Plan</p>
                      <p>
                        <span className="font-semibold">Support Type:</span>{" "}
                        {getHelpTypeLabel(task.mySupportType)}
                      </p>
                      <p>
                        <span className="font-semibold">Description:</span>{" "}
                        {task.mySupportDescription || "Not provided"}
                      </p>
                      <p>
                        <span className="font-semibold">Your Contact:</span>{" "}
                        {task.mySupportContact || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleOpenAcceptModal(task.id)}
                  disabled={acceptingTaskId === task.id || isAccepted || isClosed}
                  className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition flex items-center gap-2 ${
                    isAccepted
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : isClosed
                        ? "bg-slate-500"
                      : "bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                  }`}
                >
                  {isAccepted ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Accepted
                    </>
                  ) : isClosed ? (
                    "Closed"
                  ) : acceptingTaskId === task.id ? (
                    "Accepting..."
                  ) : (
                    "Accept Task"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTaskId((prev) => (prev === task.id ? null : task.id))
                  }
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition inline-flex items-center gap-1"
                >
                  {isExpanded ? "Hide Details" : "View Details"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/volunteer/requests")}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold transition"
                >
                  Open Requests
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accept Task Modal */}
      {modalTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            {!selectedHelpType ? (
              <>
                {/* Step 1: Select Help Type */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">How Can You Help?</h3>
                  <button
                    onClick={() => {
                      setModalTaskId(null);
                      setSelectedHelpType(null);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  Select the type of assistance you can provide for this task:
                </p>

                <div className="grid grid-cols-2 gap-2 mb-5 max-h-64 overflow-y-auto">
                  {HELP_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedHelpType(option.id)}
                      className={`p-3 rounded-lg border-2 transition text-sm font-medium flex flex-col items-center gap-1 ${
                        selectedHelpType === option.id
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50"
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setModalTaskId(null);
                      setSelectedHelpType(null);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedHelpType) {
                        setHelpDescription("");
                        setContactNumber("");
                      }
                    }}
                    disabled={!selectedHelpType}
                    className="flex-1 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold transition"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Enter Details */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    {HELP_OPTIONS.find(o => o.id === selectedHelpType)?.label}
                  </h3>
                  <button
                    onClick={() => {
                      setModalTaskId(null);
                      setSelectedHelpType(null);
                      setHelpDescription("");
                      setContactNumber("");
                    }}
                    className="p-1 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  Please provide details about how you plan to help and your contact information:
                </p>

                <div className="space-y-4 mb-5">
                  {/* Description Text Area */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Describe Your Support
                    </label>
                    <textarea
                      value={helpDescription}
                      onChange={(e) => setHelpDescription(e.target.value)}
                      placeholder="e.g., I can provide first aid assistance and have medical training..."
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none text-base"
                      rows="3"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {helpDescription.length}/150 characters
                    </p>
                  </div>

                  {/* Contact Number Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Your phone number (e.g., +1 234 567 8900)"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-base"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedHelpType(null)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleConfirmAccept(modalTaskId, selectedHelpType)}
                    disabled={!helpDescription.trim() || !contactNumber.trim() || acceptingTaskId === modalTaskId}
                    className="flex-1 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold transition"
                  >
                    {acceptingTaskId === modalTaskId ? "Confirming..." : "Confirm"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerTaskBoard;
