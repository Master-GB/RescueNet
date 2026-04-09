import React, { useEffect, useState } from "react";
import NGOnavbar from "./NGOnavbar";
import { getNgoProfile, updateNgoStatus } from "../../services/profileService";

const NGOCampaignShell = ({ title, subtitle, actions, children }) => {
  const [ngoData, setNgoData] = useState({
    availabilityStatus: "OFFLINE",
  });

  useEffect(() => {
    let isMounted = true;

    const loadNgoProfile = async () => {
      try {
        const data = await getNgoProfile();
        if (isMounted && data) {
          setNgoData((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (error) {
        console.error("Could not load NGO profile", error);
      }
    };

    loadNgoProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusToggle = async () => {
    const previousStatus = ngoData.availabilityStatus || "OFFLINE";
    const nextStatus = previousStatus === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";

    setNgoData((prev) => ({
      ...prev,
      availabilityStatus: nextStatus,
    }));

    try {
      await updateNgoStatus({ availabilityStatus: nextStatus });
    } catch (error) {
      setNgoData((prev) => ({
        ...prev,
        availabilityStatus: previousStatus,
      }));
      console.error("Could not update NGO status", error);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      <NGOnavbar ngoData={ngoData} handleStatusToggle={handleStatusToggle} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Donations Management</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-on-surface">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-3xl text-sm text-secondary">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </header>

        {children}
      </main>
    </div>
  );
};

export default NGOCampaignShell;
