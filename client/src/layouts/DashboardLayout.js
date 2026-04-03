import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  House,
  TriangleAlert,
  HandHelping,
  Search,
  Phone,
  UserCircle,
  Bell,
  LogOut,
  SearchIcon,
} from "lucide-react";

const defaultSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Shelters", icon: House, path: "/citizen/shelters" },
  { name: "Disaster", icon: TriangleAlert, path: "/citizen/disaster" },
  { name: "Help Request", icon: HandHelping, path: "/citizen/help-request" },
  { name: "Missing Persons", icon: Search, path: "/citizen/missing-persons" },
  { name: "Emergency Contact", icon: Phone, path: "/citizen/emergency-contact" },
  { name: "Profile", icon: UserCircle, path: "/citizen/profile" },
];

const DashboardLayout = ({
  children,
  sidebarItems = defaultSidebarItems,
  portalTitle = "Citizen Portal",
  avatarLetter = "C",
  homePath = "/",
  searchPlaceholder = "Search shelters, alerts, requests...",
}) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

 

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-black border-b border-gray-800 z-50">
        <div className="h-full px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left */}
          <Link to={homePath} className="flex items-center gap-3 min-w-fit transition-opacity">
            <div className="w-11 h-11 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              R
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">
                RescueNet
              </h1>
              <p className="text-xs text-gray-300">{portalTitle}</p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className="w-full relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-6">
            <button className="relative w-11 h-11 rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 transition flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>

            <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold border border-green-200 uppercase">
              {avatarLetter}
            </div>

            {/* Clock Widget */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 transition min-w-[70px]">
              <div className="flex flex-col">
                <span className="text-white font-semibold text-xl font-mono min-w-[70px]">{formatTime(currentTime)}</span>
              
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="fixed top-20 left-0 w-72 h-[calc(100vh-5rem)] bg-gray-900 border-r border-gray-800 z-40 hidden lg:flex flex-col">


        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition font-medium ${
                  isActive
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-white hover:bg-green-600 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="px-4 py-6 border-t border-gray-800">
          <button
            onClick={() => {
              // Handle logout logic here
              console.log("Logging out...");
              // You can add actual logout logic like clearing tokens, redirecting to login, etc.
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-900 hover:bg-red-800 text-white hover:text-white font-medium transition group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="pt-20 lg:pl-72 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;