import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useVolunteerContext } from "../contexts/VolunteerContext";
import AuthCookie from "../components/authentication/AuthCookie";
import {
  LayoutDashboard,
  House,
  TriangleAlert,
  HandHelping,
  HandCoins,
  Search,
  Phone,
  UserCircle,
  Bell,
  LogOut,
  SearchIcon,
  X,
} from "lucide-react";

const defaultSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/citizen-dashboard" },
  { name: "Shelters", icon: House, path: "/citizen/shelters" },
  { name: "Disaster", icon: TriangleAlert, path: "/citizen/disaster" },
  { name: "Help Request", icon: HandHelping, path: "/citizen/help-request" },
  { name: "Missing Persons", icon: Search, path: "/citizen/missing-persons" },
  { name: "Emergency Contact", icon: Phone, path: "/citizen/emergency-contact" },
  { name: "Donations", icon: HandCoins, path: "/donations" },
  { name: "Profile", icon: UserCircle, path: "/citizen/profile" },
];

const DashboardLayout = ({
  children,
  sidebarItems = defaultSidebarItems,
  portalTitle = "Citizen Portal",
  avatarLetter = "C",
  homePath = "/citizen-dashboard",
  searchPlaceholder = "Search shelters, alerts, requests...",
  contentClassName = "",
}) => {
  const location = useLocation();
  const { logout } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useVolunteerContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const isVolunteerPortal = portalTitle === "Volunteer Portal";
  const unreadCount = (notifications || []).filter((item) => !item.read).length;
  const notificationItems = (notifications || []).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-black border-b border-gray-800 z-[1200]">
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
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative w-11 h-11 rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 transition flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-white" />
              {isVolunteerPortal && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && isVolunteerPortal && (
              <div className="absolute top-16 right-28 w-[360px] max-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-[1300]">
                <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Notifications</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                    <button
                      type="button"
                      onClick={clearNotifications}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notificationItems.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
                  ) : (
                    notificationItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => markNotificationRead(item.id)}
                        className={`w-full text-left p-3 border-b border-slate-100 hover:bg-slate-50 ${
                          item.read ? "bg-white" : "bg-blue-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

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
      <aside className="fixed top-20 left-0 w-72 h-[calc(100vh-5rem)] bg-gray-900 border-r border-gray-800 z-[1100] hidden lg:flex flex-col">


        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

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
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-900 hover:bg-red-800 text-white hover:text-white font-medium transition group"
            disabled={isLoggingOut}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="pt-20 lg:pl-72 min-h-screen">
        <div className={`p-4 md:p-6 lg:p-8 ${contentClassName}`}>{children || <Outlet />}</div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl transform">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-2xl">
              <button
                onClick={cancelLogout}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <LogOut className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">Confirm Logout</h2>
                  <p className="text-white/90 text-sm">Are you sure you want to sign out?</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You will be logged out of your account and will need to sign in again to access your dashboard.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={confirmLogout}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  <LogOut className="w-5 h-5 inline mr-2" />
                  Yes, Sign Out
                </button>

                <button
                  onClick={cancelLogout}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global auth cookie consent component */}
      <AuthCookie />
    </div>
  );
};

export default DashboardLayout;