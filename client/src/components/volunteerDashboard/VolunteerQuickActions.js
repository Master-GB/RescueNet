import React from "react";
import { Radio, Route, ClipboardCheck, Package } from "lucide-react";
import QuickActionCard from "../citizenDashboard/QuickActionCard";

const VolunteerQuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <QuickActionCard
        title="Dispatch Check-In"
        description="Broadcast your availability and assigned zone to the central response coordinator."
        buttonText="Check In"
        variant="primary"
        icon={Radio}
        status="Live"
        onClick={() => console.log("Dispatch check-in")}
      />
      <QuickActionCard
        title="Route Planner"
        description="Get safe travel paths around blocked roads and flooded sections in real time."
        buttonText="Plan Route"
        variant="success"
        icon={Route}
        status="Updated"
        onClick={() => console.log("Route planner")}
      />
      <QuickActionCard
        title="Task Verification"
        description="Close completed assignments with proof and immediate field notes for handover."
        buttonText="Verify Task"
        variant="warning"
        icon={ClipboardCheck}
        status="Pending"
        onClick={() => console.log("Task verification")}
      />
      <QuickActionCard
        title="Supply Update"
        description="Report shortages or confirm replenished kits for your shelter and nearby hubs."
        buttonText="Update Supplies"
        variant="emergency"
        icon={Package}
        status="Urgent"
        onClick={() => console.log("Supply update")}
      />
    </div>
  );
};

export default VolunteerQuickActions;
