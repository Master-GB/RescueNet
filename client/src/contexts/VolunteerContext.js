import React, { createContext, useContext, useMemo, useState } from "react";

const VolunteerContext = createContext(null);

export const VolunteerProvider = ({ children }) => {
  const [availabilityStatus, setAvailabilityStatus] = useState("OFFLINE");
  const [activeTaskId, setActiveTaskId] = useState(null);

  const value = useMemo(
    () => ({
      availabilityStatus,
      setAvailabilityStatus,
      activeTaskId,
      setActiveTaskId,
    }),
    [availabilityStatus, activeTaskId],
  );

  return <VolunteerContext.Provider value={value}>{children}</VolunteerContext.Provider>;
};

export const useVolunteerContext = () => {
  const context = useContext(VolunteerContext);

  if (!context) {
    throw new Error("useVolunteerContext must be used within VolunteerProvider");
  }

  return context;
};

export default VolunteerContext;
