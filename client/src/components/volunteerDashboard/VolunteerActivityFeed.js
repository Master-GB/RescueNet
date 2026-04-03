import React, { useEffect, useMemo, useState } from "react";
import { Radio, Truck, Users2, CheckCircle2 } from "lucide-react";
import { fetchHelpRequests } from "./volunteerDashboardApi";

const iconForStatus = {
  pending: { icon: Radio, iconBg: "bg-amber-500" },
  assigned: { icon: Users2, iconBg: "bg-blue-500" },
  "in-progress": { icon: Truck, iconBg: "bg-indigo-500" },
  resolved: { icon: CheckCircle2, iconBg: "bg-emerald-500" },
};

const toTimeAgo = (timestamp) => {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const min = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (min < 60) {
    return `${min} min ago`;
  }

  const hr = Math.floor(min / 60);
  return `${hr} hr ago`;
};

const VolunteerActivityFeed = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchHelpRequests(4);
        setRequests(data?.data || []);
      } catch (error) {
        console.error("Failed to load volunteer activity:", error.message);
      }
    };

    load();
  }, []);

  const activities = useMemo(() => {
    return requests.map((request) => {
      const iconMeta = iconForStatus[request.status] || iconForStatus.pending;

      return {
        id: request._id,
        message: `${request.disasterType} request at ${request.location}`,
        time: toTimeAgo(request.createdAt),
        icon: iconMeta.icon,
        iconBg: iconMeta.iconBg,
      };
    });
  }, [requests]);

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-slate-500">
        No recent activity found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="space-y-4">
        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-700 leading-relaxed">{item.message}</p>
                <p className="text-xs text-slate-500 mt-1">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VolunteerActivityFeed;
