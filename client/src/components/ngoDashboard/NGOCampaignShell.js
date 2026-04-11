import React, { useEffect, useState } from "react";
import NGOnavbar from "./NGOnavbar";
import { getNgoProfile, updateNgoStatus } from "../../services/profileService";
import DashboardLayout from "../../layouts/DashboardLayout";
import ngoSidebarItems from "../../pages/ngo/ngoSidebarItems";

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
    <DashboardLayout
      sidebarItems={ngoSidebarItems}
      portalTitle="NGO Portal"
      avatarLetter="N"
      homePath="/ngo-dashboard"
      searchPlaceholder="Search tasks, campaigns, and donations..."
      contentClassName="bg-auth-bg"
    >
      <section className="space-y-5 rounded-2xl bg-auth-bg text-auth-text">
        <NGOnavbar ngoData={ngoData} handleStatusToggle={handleStatusToggle} />

        <main className="mx-auto w-full max-w-7xl px-1 py-1 sm:px-2 lg:px-2">
          <header className="mb-6 rounded-2xl border border-auth-border bg-auth-surface p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-auth-text-soft">Donations Management</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-auth-text-strong">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-3xl text-sm text-auth-text-soft">{subtitle}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
            </div>
          </header>

          {children}
        </main>
      </section>
    </DashboardLayout>
  );
};

export default NGOCampaignShell;
