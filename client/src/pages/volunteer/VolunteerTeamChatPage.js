import React, { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal, Users } from "lucide-react";
import { io } from "socket.io-client";
import DashboardLayout from "../../layouts/DashboardLayout";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import useAuth from "../../hooks/useAuth";
import { volunteerSidebarItems } from "./volunteerLayoutConfig";

const TEAM_ROOM = "volunteer-team-global";
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin);

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const VolunteerTeamChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const socketRef = useRef(null);
  const listRef = useRef(null);

  const currentUserId = user?._id || user?.id || "";
  const currentUserName = user?.name || "Volunteer";

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError("");
      socket.emit("volunteer:chat:join", {
        room: TEAM_ROOM,
        userId: currentUserId,
        userName: currentUserName,
      });
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setConnectionError(error?.message || "Unable to connect to chat server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("volunteer:chat:history", (payload) => {
      if (payload?.room !== TEAM_ROOM) return;
      setMessages(Array.isArray(payload?.messages) ? payload.messages : []);
    });

    socket.on("volunteer:chat:new", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("volunteer:chat:system", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId, currentUserName]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const orderedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !socketRef.current) return;
    if (!isConnected) {
      setConnectionError("You are offline. Reconnecting to chat server...");
      return;
    }

    socketRef.current.emit("volunteer:chat:message", {
      room: TEAM_ROOM,
      text,
    });
    setDraft("");
  };

  return (
    <DashboardLayout
      sidebarItems={volunteerSidebarItems}
      portalTitle="Volunteer Portal"
      avatarLetter="V"
      homePath="/volunteer-dashboard"
      searchPlaceholder="Search team messages..."
    >
      <div className="space-y-6">
        <VolunteerSectionHeader
          title="Volunteer Team Chat"
          subtitle="Coordinate with nearby responders in real time"
        />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 inline-flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-600" />
          <p className="text-sm text-slate-700">
            Room: <span className="font-semibold">General Volunteer Team</span>
          </p>
          <span className={`ml-2 text-xs font-semibold ${isConnected ? "text-emerald-600" : "text-slate-500"}`}>
            {isConnected ? "Connected" : "Reconnecting..."}
          </span>
        </div>

        {connectionError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {connectionError}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div ref={listRef} className="h-[470px] overflow-y-auto p-4 space-y-3 bg-slate-50">
            {orderedMessages.length === 0 ? (
              <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p>
            ) : (
              orderedMessages.map((message) => {
                const isSystem = message.type === "system";
                const mine = !isSystem && String(message?.sender?.userId || "") === String(currentUserId);

                if (isSystem) {
                  return (
                    <div key={message.id} className="text-center text-xs text-slate-500">
                      {message.text} · {formatTime(message.createdAt)}
                    </div>
                  );
                }

                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2 ${mine ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-800"}`}>
                      <p className={`text-xs mb-1 ${mine ? "text-indigo-100" : "text-slate-500"}`}>
                        {mine ? "You" : message?.sender?.name || "Volunteer"}
                      </p>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      <p className={`text-[11px] mt-1 ${mine ? "text-indigo-100" : "text-slate-500"}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 p-3 flex items-center gap-2 bg-white">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type message and press Enter..."
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-semibold"
            >
              <SendHorizontal className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerTeamChatPage;
