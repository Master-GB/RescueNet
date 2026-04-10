import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap, FileText, Heart, Megaphone, Users, User, MapPin, CheckCircle } from 'lucide-react';
import NGOnavbar from '../../components/ngoDashboard/NGOnavbar';
import { getNgoProfile, updateNgoStatus } from '../../services/profileService';
// TODO: Replace other mocked metrics with real API calls when available

const NgoDashboard = () => {
  // Minimal mock for initial render; real profile will be loaded on mount
  const [ngoData, setNgoData] = useState({
    registrationNumber: "NGO123456",
    availabilityStatus: "AVAILABLE",
    approvalStatus: "approved",
  });

  const [metrics, setMetrics] = useState({
    activeTasks: 24,
    pendingDonations: 12450.00,
    activeCampaigns: 12,
    peopleAssisted: 1842
  });

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const donationData = [
    { name: 'MON', value: 4000 },
    { name: 'TUE', value: 3000 },
    { name: 'WED', value: 5000 },
    { name: 'THU', value: 4500 },
    { name: 'FRI', value: 7000 },
    { name: 'SAT', value: 8500 },
    { name: 'SUN', value: 6500 },
  ];

  const taskData = [
    { name: 'In Progress', value: 18, color: '#005f5f' }, // Secondary Container
    { name: 'Under Review', value: 4, color: '#2cda9d' }, // Primary Container
    { name: 'Completed', value: 2, color: '#e5e7eb' },
  ];

  const pendingTasks = [
    { id: 1, location: 'San Diego, CA', type: 'Shelter Support', category: 'Medical Supplies', severity: 'CRITICAL' },
    { id: 2, location: 'Tucson, AZ', type: 'Logistics', category: 'Transport Ops', severity: 'MODERATE' },
    { id: 3, location: 'El Paso, TX', type: 'Field Rescue', category: 'Emergency Food', severity: 'HIGH' },
  ];

  const campaignFeeds = [
    { id: 1, name: 'Elena S.', action: 'donated $500', campaign: '#CaliforniaWildfires', time: '2 minutes ago', type: 'donation' },
    { id: 2, name: 'Global Corp', action: 'matched $5,000', campaign: '#GlobalCrisisRelief', time: '15 minutes ago', type: 'match' },
    { id: 3, name: 'Mark J.', action: 'donated $120', campaign: '#FoodSecurityFund', time: '1 hour ago', type: 'donation' },
    { id: 4, name: 'Target Met', action: 'Shelter B-12', campaign: '#TexasFloodRelief', time: '3 hours ago', type: 'target' },
  ];

  const handleStatusToggle = async () => {
    // Toggle locally first for snappy UI, then persist to backend
    const nextStatus = ngoData.availabilityStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    setNgoData(prev => ({ ...prev, availabilityStatus: nextStatus }));

    try {
      await updateNgoStatus({ availabilityStatus: nextStatus });
    } catch (err) {
      // Revert locally and surface error
      setNgoData(prev => ({ ...prev, availabilityStatus: prev.availabilityStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE' }));
      setServerError("Could not update availability status. Please try again.");
      console.error("Failed to update NGO status", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      setServerError("");
      try {
        const data = await getNgoProfile();
        if (!mounted) return;
        if (data) {
          // Map server response into local shape if needed
          setNgoData(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Error fetching NGO profile", err);
        if (mounted) setServerError("Could not load NGO profile.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, []);

  const getSeverityPill = (severity) => {
    const colors = {
      'CRITICAL': 'bg-red-100 text-red-700',
      'HIGH': 'bg-orange-100 text-orange-700',
      'MODERATE': 'bg-[#8ad3d3] text-gray-900', // Secondary
      'LOW': 'bg-green-100 text-green-700',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[severity] || 'bg-gray-100 text-gray-700'}`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      {/* Top Navbar */}
      <NGOnavbar ngoData={ngoData} handleStatusToggle={handleStatusToggle} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, ActionAid Rescue</h1>
            <p className="text-gray-500 mt-1 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} &bull; Operations Dashboard</p>
          </div>
          <button className="mt-4 md:mt-0 flex items-center bg-[#56f7b7] hover:bg-[#2cda9d] text-gray-900 px-5 py-2.5 rounded-lg shadow-ambient font-bold transition-all transform hover:scale-105">
            <Zap size={18} className="mr-2" />
            Quick Dispatch
          </button>
        </div>

        {/* Top-Level Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'ACTIVE TASKS', value: metrics.activeTasks, icon: FileText, badge: '+2 active', badgeColor: 'bg-[#2cfe4c] text-gray-900' },
            { label: 'PENDING DONATIONS', value: `$${metrics.pendingDonations.toLocaleString()}`, icon: Heart },
            { label: 'ACTIVE CAMPAIGNS', value: metrics.activeCampaigns, icon: Megaphone },
            { label: 'PEOPLE ASSISTED', value: metrics.peopleAssisted.toLocaleString(), icon: Users }
          ].map((metric, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#56f7b7]"></div>
              <div className="flex justify-between items-start">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  <metric.icon size={20} />
                </div>
                {metric.badge && (
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${metric.badgeColor}`}>
                    {metric.badge}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{metric.label}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{metric.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Data Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Donations Received (Last 7 Days)</h2>
              <select className="bg-gray-50 border-none text-sm font-semibold text-gray-600 rounded-md py-1.5 px-3">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#005f5f" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#56f7b7', stroke: '#005f5f'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Task Status</h2>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-gray-900">{metrics.activeTasks}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Tasks</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {taskData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actionable Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Urgent Pending Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Urgent Pending Tasks</h2>
              <a href="#tasks" className="text-sm font-bold text-[#005f5f] hover:text-[#2cda9d] transition">View All Tasks</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Mission Type</th>
                    <th className="px-6 py-4 text-center">Severity</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-500">
                            <MapPin size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{task.location}</p>
                            <p className="text-xs text-gray-500 font-medium">{task.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700 text-sm">
                        {task.category}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={getSeverityPill(task.severity)}>{task.severity}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="bg-[#56f7b7] hover:bg-[#2cda9d] text-gray-900 px-4 py-1.5 rounded-md text-xs font-bold shadow-sm transition">
                          Accept
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Campaign Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Campaign Feed</h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-6">
                {campaignFeeds.map((feed) => (
                  <div key={feed.id} className="flex relative">
                    {/* Minimal Timeline connector */}
                    <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-gray-100 last:hidden"></div>
                    
                    <div className="mr-4 relative z-10">
                      {feed.type === 'target' ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <CheckCircle size={16} />
                        </div>
                      ) : feed.type === 'match' ? (
                        <div className="w-8 h-8 rounded-full bg-[#e0f2f1] text-[#005f5f] flex items-center justify-center">
                          <FileText size={16} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center overflow-hidden">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 font-bold">
                        {feed.name} <span className="font-normal text-gray-600">{feed.action}</span>
                      </p>
                      <p className="text-xs text-[#005f5f] font-semibold mt-0.5">{feed.campaign}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1 flex items-center">
                        {feed.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-gray-50 text-center rounded-b-xl border-t border-gray-100">
              <button className="text-[#005f5f] hover:text-[#003d3d] text-xs font-bold transition">
                Open Full Feed
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default NgoDashboard;
