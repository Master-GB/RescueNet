import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Clock3, TriangleAlert, ArrowRight } from "lucide-react";
import { fetchHelpRequests, acceptHelpRequest } from "./volunteerDashboardApi";

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

const VolunteerTaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingTaskId, setAcceptingTaskId] = useState(null);
  const [acceptFeedback, setAcceptFeedback] = useState({});

  useEffect(() => {
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

    loadTasks();
  }, []);

  const handleAcceptTask = async (taskId) => {
    setAcceptingTaskId(taskId);
    try {
      await acceptHelpRequest(taskId);
      setAcceptFeedback((prev) => ({
        ...prev,
        [taskId]: { type: "success", message: "Task accepted successfully!" },
      }));
      // Remove accepted task from list after 2 seconds
      setTimeout(() => {
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
        setAcceptFeedback((prev) => {
          const newFeedback = { ...prev };
          delete newFeedback[taskId];
          return newFeedback;
        });
      }, 2000);
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

      return {
        id: task._id,
        title: `${String(task.disasterType || "General").toUpperCase()} Support Request`,
        location: task.realLocation || task.location || "Location unavailable",
        eta: getTimeAgo(task.createdAt),
        priorityLabel: priority.label,
        badge: priority.badge,
      };
    });
  }, [tasks]);

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

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleAcceptTask(task.id)}
                  disabled={isAccepting || feedback?.type === "success"}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-semibold transition"
                >
                  {isAccepting ? "Accepting..." : "Accept Task"}
                </button>
                <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition inline-flex items-center gap-1">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VolunteerTaskBoard;
