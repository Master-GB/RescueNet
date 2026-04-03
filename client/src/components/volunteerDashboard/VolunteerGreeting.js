import React, { useState, useEffect } from "react";
import { Sun, Cloud, Moon } from "lucide-react";

const VolunteerGreeting = () => {
  const [greeting, setGreeting] = useState("");
  const [icon, setIcon] = useState(null);
  const [userName, setUserName] = useState("Volunteer");

  useEffect(() => {
    // Get current hour to determine greeting
    const hour = new Date().getHours();
    
    if (hour < 12) {
      setGreeting("Good morning");
      setIcon(<Sun className="w-6 h-6 text-amber-500" />);
    } else if (hour < 18) {
      setGreeting("Good afternoon");
      setIcon(<Cloud className="w-6 h-6 text-blue-500" />);
    } else {
      setGreeting("Good evening");
      setIcon(<Moon className="w-6 h-6 text-indigo-500" />);
    }

    // Try to get user name from localStorage or auth context
    const storedUserName = localStorage.getItem("userDisplayName") || localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">{icon}</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, <span className="text-blue-600">{userName}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back to the volunteer coordination platform. You're all set to respond to relief requests.
            </p>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase">Current Time</p>
            <p className="text-lg font-bold text-gray-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerGreeting;
