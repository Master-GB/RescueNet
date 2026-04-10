import React, { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import useEmergencyChat from "../../hooks/useEmergencyChat";
import {
  Phone, Ambulance, Shield, MapPin, AlertTriangle,
  Search, PhoneCall, Loader2, MessageCircle,
  Hospital, Flame as Fire, Users, Zap, Droplets, Waves, Mountain, Globe
} from "lucide-react";

const EmergencyContactPage = () => {
  useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [callingContact, setCallingContact] = useState(null);
  const [activeTab, setActiveTab] = useState("contacts");

  // Communication Tab State
  const [selectedServiceType, setSelectedServiceType] = useState("police");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  const {
    messages,
    loading: chatLoading,
    error: chatError,
    isOpponentTyping,
    onlineStatus,
    sendMessage,
    sendTyping
  } = useEmergencyChat(selectedServiceType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "communication") {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText);
    setMessageText("");
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    sendTyping();
  };

  // Sri Lanka Official Emergency Contacts Database
  const sriLankaEmergencyContacts = {
    immediateEmergency: [
      { 
        id: 1, 
        name: "Police Emergency", 
        phone: "119", 
        icon: Shield, 
        color: "blue", 
        description: "Emergency Police Services - 24/7",
        category: "immediate",
        priority: "critical",
        available: true
      },
      { 
        id: 2, 
        name: "Ambulance Service", 
        phone: "119", 
        icon: Ambulance, 
        color: "red", 
        description: "Medical Emergency Services - 24/7",
        category: "immediate",
        priority: "critical",
        available: true
      },
      { 
        id: 3, 
        name: "Fire Department", 
        phone: "110", 
        icon: Fire, 
        color: "orange", 
        description: "Fire and Rescue Services - 24/7",
        category: "immediate",
        priority: "critical",
        available: true
      },
      { 
        id: 4, 
        name: "Disaster Management", 
        phone: "117", 
        icon: AlertTriangle, 
        color: "red", 
        description: "Disaster Emergency Hotline - 24/7",
        category: "immediate",
        priority: "critical",
        available: true
      }
    ],
    medical: [
      { 
        id: 5, 
        name: "National Hospital", 
        phone: "0112 691111", 
        icon: Hospital, 
        color: "green", 
        description: "Colombo National Hospital of Sri Lanka",
        category: "medical",
        priority: "high",
        available: true,
        address: "Regent Street, Colombo 08"
      },
      { 
        id: 6, 
        name: "Lady Ridgeway Hospital", 
        phone: "0112 693444", 
        icon: Hospital, 
        color: "pink", 
        description: "Children's Hospital - 24/7 Emergency",
        category: "medical",
        priority: "high",
        available: true,
        address: "Regent Street, Colombo 08"
      },
      { 
        id: 7, 
        name: "Medical Emergency Helpline", 
        phone: "1990", 
        icon: Phone, 
        color: "green", 
        description: "24/7 Medical Emergency Helpline",
        category: "medical",
        priority: "high",
        available: true
      },
      { 
        id: 8, 
        name: "Sri Jayewardenepura Hospital", 
        phone: "0112 755 444", 
        icon: Hospital, 
        color: "green", 
        description: "General Hospital - 24/7 Emergency",
        category: "medical",
        priority: "medium",
        available: true,
        address: "Thalapathpitiya, Nugegoda"
      }
    ],
    utilities: [
      { 
        id: 9, 
        name: "CEB Emergency", 
        phone: "1987", 
        icon: Zap, 
        color: "yellow", 
        description: "Ceylon Electricity Board Emergency",
        category: "utilities",
        priority: "medium",
        available: true
      },
      { 
        id: 10, 
        name: "Water Board Emergency", 
        phone: "1939", 
        icon: Droplets, 
        color: "blue", 
        description: "National Water Supply & Drainage Board",
        category: "utilities",
        priority: "medium",
        available: true
      },
      { 
        id: 11, 
        name: "Gas Emergency", 
        phone: "0112 433 333", 
        icon: Fire, 
        color: "orange", 
        description: "Gas Leak Emergency Hotline",
        category: "utilities",
        priority: "high",
        available: true
      }
    ],
    disaster: [
      { 
        id: 12, 
        name: "Meteorological Department", 
        phone: "0112 666 777", 
        icon: Waves, 
        color: "cyan", 
        description: "Weather Emergency and Warnings",
        category: "disaster",
        priority: "medium",
        available: true
      },
      { 
        id: 13, 
        name: "Coast Guard", 
        phone: "0112 433 333", 
        icon: Waves, 
        color: "blue", 
        description: "Marine Emergency Services",
        category: "disaster",
        priority: "medium",
        available: true
      },
      { 
        id: 14, 
        name: "Landslide Warning", 
        phone: "0112 544 888", 
        icon: Mountain, 
        color: "brown", 
        description: "National Building Research Organization",
        category: "disaster",
        priority: "medium",
        available: true
      }
    ],
    regional: [
      { 
        id: 15, 
        name: "Western Province", 
        phone: "0112 888 888", 
        icon: MapPin, 
        color: "purple", 
        description: "Western Province Emergency Services",
        category: "regional",
        priority: "low",
        available: true
      },
      { 
        id: 16, 
        name: "Central Province", 
        phone: "0812 222 222", 
        icon: MapPin, 
        color: "purple", 
        description: "Central Province Emergency Services",
        category: "regional",
        priority: "low",
        available: true
      },
      { 
        id: 17, 
        name: "Southern Province", 
        phone: "0412 222 222", 
        icon: MapPin, 
        color: "purple", 
        description: "Southern Province Emergency Services",
        category: "regional",
        priority: "low",
        available: true
      },
      { 
        id: 18, 
        name: "Northern Province", 
        phone: "0212 222 222", 
        icon: MapPin, 
        color: "purple", 
        description: "Northern Province Emergency Services",
        category: "regional",
        priority: "low",
        available: true
      }
    ]
  };

  const categories = [
    { id: "all", name: "All Services", icon: Globe, color: "gray" },
    { id: "immediate", name: "Immediate Emergency", icon: AlertTriangle, color: "red" },
    { id: "medical", name: "Medical Services", icon: Hospital, color: "green" },
    { id: "utilities", name: "Utilities", icon: Zap, color: "yellow" },
    { id: "disaster", name: "Disaster Services", icon: Waves, color: "blue" },
    { id: "regional", name: "Regional Services", icon: MapPin, color: "purple" }
  ];

  // Flatten all contacts for filtering
  const allContacts = Object.values(sriLankaEmergencyContacts).flat();

  // Filter contacts based on search and category
  const filteredContacts = allContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort by priority
  const sortedContacts = filteredContacts.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleCall = async (contact) => {
    setCallingContact(contact.id);
    try {
      // Simulate call action
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = `tel:${contact.phone}`;
    } catch (error) {
      console.error('Call failed:', error);
    } finally {
      setCallingContact(null);
    }
  };

  
  const getPriorityBadge = (priority) => {
    const colors = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[priority] || colors.low;
  };

  const getPriorityIcon = (priority) => {
    if (priority === "critical") return "🚨";
    if (priority === "high") return "⚡";
    if (priority === "medium") return "⚠️";
    return "ℹ️";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-10 blur-3xl"></div>
          
          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/30">
            {/* Top Section */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex-1">
                <div className="flex items-center space-x-6 mb-4">
                  {/* Sri Lanka Flag/Icon */}
                  <div className="relative group">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500">
                      <span className="text-3xl font-bold text-white">SL</span>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Title Section */}
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                        Emergency Contacts
                      </h1>
                      <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                        CRITICAL
                      </div>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">
                      Official emergency services and helplines for Sri Lankan citizens
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>24/7 Available</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Shield className="w-4 h-4" />
                        <span>Verified Services</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{allContacts.length} Services</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex flex-col items-end space-y-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl border border-green-400/30">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-white rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <div className="text-sm font-bold">SYSTEM STATUS</div>
                      <div className="text-xs opacity-90">All Services Operational</div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex space-x-2">
                  <div className="bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                    <div className="text-xs text-red-600 font-bold">CRITICAL</div>
                    <div className="text-lg font-bold text-red-700">4</div>
                  </div>
                  <div className="bg-blue-50 px-3 py-2 rounded-xl border border-blue-200">
                    <div className="text-xs text-blue-600 font-bold">SERVICES</div>
                    <div className="text-lg font-bold text-blue-700">{allContacts.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative group">
              {/* Search Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-xl"></div>
              
              {/* Search Container */}
              <div className="relative bg-white rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden group-focus-within:border-blue-500 group-focus-within:shadow-2xl transition-all duration-300">
                <div className="flex items-center">
                  {/* Search Icon */}
                  <div className="pl-6 pr-4 py-4">
                    <Search className="w-6 h-6 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                  </div>
                  
                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="Search emergency services, names, or numbers... (e.g., Police, 119, Hospital)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 pr-6 py-4 text-gray-900 placeholder-gray-500 font-medium text-lg focus:outline-none"
                  />
                  
                  {/* Clear Button */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="pr-6 pl-2 py-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
                
                {/* Search Suggestions */}
                {!searchTerm && (
                  <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-2xl mt-2 p-4 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="text-sm text-gray-500 mb-2">Quick searches:</div>
                    <div className="flex flex-wrap gap-2">
                      {["119", "Police", "Hospital", "Fire", "Medical"].map(term => (
                        <button
                          key={term}
                          onClick={() => setSearchTerm(term)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab("contacts")}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === "contacts"
                      ? "bg-white text-blue-600 shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  <span>Emergency Contacts</span>
                </button>
                <button
                  onClick={() => setActiveTab("communication")}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === "communication"
                      ? "bg-white text-blue-600 shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Communication</span>
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                Last updated: <span className="font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "contacts" && (
        <div>
          {/* Category Filter */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filter by Category</h2>
                <div className="text-sm text-gray-500">
                  {sortedContacts.length} services found
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative flex items-center space-x-3 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-xl shadow-blue-500/25'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`relative ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`}>
                      <category.icon className="w-5 h-5" />
                    </div>
                    <span>{category.name}</span>
                    {selectedCategory === category.id && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contacts Grid */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedContacts.map(contact => {
                const Icon = contact.icon;
                return (
                  <div
                    key={contact.id}
                    className={`group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 transform hover:scale-105 ${
                      contact.priority === 'critical' 
                        ? 'border-red-300 ring-4 ring-red-100/50 hover:ring-red-200/70' 
                        : 'border-gray-200/50 hover:border-gray-300/70'
                    }`}
                  >
                    {contact.priority === 'critical' && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        CRITICAL
                      </div>
                    )}
                    
                    <div className="p-7">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center space-x-4">
                          <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${
                            contact.color === 'red' ? 'from-red-400 to-pink-600' :
                            contact.color === 'blue' ? 'from-blue-400 to-indigo-600' :
                            contact.color === 'green' ? 'from-green-400 to-emerald-600' :
                            contact.color === 'orange' ? 'from-orange-400 to-amber-600' :
                            contact.color === 'yellow' ? 'from-yellow-400 to-orange-600' :
                            contact.color === 'purple' ? 'from-purple-400 to-pink-600' :
                            contact.color === 'cyan' ? 'from-cyan-400 to-blue-600' :
                            contact.color === 'brown' ? 'from-amber-600 to-orange-800' :
                            'from-gray-400 to-gray-600'
                          } shadow-lg`}>
                            <Icon className="w-7 h-7 text-white" />
                            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                              {contact.name}
                            </h3>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadge(contact.priority)}`}>
                                {getPriorityIcon(contact.priority)} {contact.priority.toUpperCase()}
                              </span>
                              {contact.available && (
                                <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                  <div className="relative">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                  </div>
                                  <span className="text-xs font-semibold text-green-700">Available</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-5 leading-relaxed font-medium">
                        {contact.description}
                      </p>

                      {/* Phone Number */}
                      <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <Phone className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="font-mono text-xl font-bold text-gray-900 tracking-wide">
                          {contact.phone}
                        </span>
                      </div>

                      
                      {/* Action Button */}
                      <button
                        onClick={() => handleCall(contact)}
                        disabled={callingContact === contact.id}
                        className="group/btn w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed font-semibold"
                      >
                        {callingContact === contact.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <PhoneCall className="w-5 h-5 group-hover/btn:animate-pulse" />
                        )}
                        <span>Call Now</span>
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-xs">{'>'}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {sortedContacts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Emergency Services Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your search terms or filter criteria to find the emergency services you need.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bidirectional Communication Tab */}
      {activeTab === "communication" && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/30 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[600px]">
            {/* Service Selector Sidebar */}
            <div className="col-span-1 border-r border-gray-200 pr-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" /> Services
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'police', name: 'Police Dispatch', icon: Shield, color: 'blue' },
                  { id: 'ambulance', name: 'Ambulance Service', icon: Ambulance, color: 'red' },
                  { id: 'fire', name: 'Fire Department', icon: Fire, color: 'orange' },
                  { id: 'disaster', name: 'Disaster Auth', icon: AlertTriangle, color: 'purple' }
                ].map(service => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedServiceType(service.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                      selectedServiceType === service.id
                        ? "bg-" + service.color + "-50 border-2 border-" + service.color + "-500 shadow-md"
                        : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <service.icon className={`w-5 h-5 ${selectedServiceType === service.id ? "text-" + service.color + "-600" : "text-gray-500"}`} />
                      <span className={`font-semibold ${selectedServiceType === service.id ? 'text-gray-900' : 'text-gray-600'}`}>
                        {service.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="col-span-1 md:col-span-3 flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-t-2xl border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{selectedServiceType} Emergency Line</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${onlineStatus ? 'bg-green-500 animate-pulse' : chatError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                      <span className="text-xs font-semibold text-gray-500">
                        {onlineStatus ? 'Coordinator Online' : chatError ? 'Connection Failed' : 'Connecting...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
                {chatError ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-lg font-semibold text-red-700 mb-2">Connection Failed</p>
                    <p className="text-sm text-gray-500 max-w-xs">{chatError}</p>
                    <p className="text-xs text-gray-400 mt-3">Make sure the backend server is running on <code className="bg-gray-100 px-1 rounded">localhost:5000</code>, then restart this page.</p>
                  </div>
                ) : chatLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No messages yet.</p>
                    <p className="text-sm">Start the conversation by sending a message.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isCitizen = msg.sender === 'citizen';
                    return (
                      <div key={index} className={`flex items-start space-x-3 ${isCitizen ? 'justify-end' : ''}`}>
                        {!isCitizen && (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`flex flex-col ${isCitizen ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div className={`p-4 rounded-2xl shadow-sm ${
                            isCitizen 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-tr-none' 
                              : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <span className="text-xs text-gray-400 mt-1 lowercase">
                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {isCitizen && (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                
                {isOpponentTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white rounded-b-2xl border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleTyping}
                    placeholder={`Message ${selectedServiceType} dispatch...`}
                    className="flex-1 px-5 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium text-gray-700"
                    disabled={!onlineStatus}
                  />
                  <button 
                    type="submit" 
                    disabled={!messageText.trim() || !onlineStatus}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold uppercase tracking-wide hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg disabled:hover:shadow-none"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Notice */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200/50 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-red-500/20 rounded-2xl animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-900 mb-3">
                Emergency Notice
              </h3>
              <div className="bg-white/60 rounded-2xl p-4 border border-red-200/50">
                <p className="text-red-800 leading-relaxed font-medium">
                  In case of life-threatening emergencies, always call <span className="font-bold text-red-900 bg-red-100 px-2 py-1 rounded-lg">119</span> immediately. 
                  These contacts are for official emergency services only. Please use them responsibly.
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">24/7 Emergency Hotline Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactPage;
