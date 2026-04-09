// client/src/App.js
import React from "react";
import { ShelterProvider } from "./contexts/ShelterContext";

// Modular route files
import AppRoutes from "./routes/AppRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import VolunteerRoutes from "./routes/VolunteerRoutes";
import NGORoutes from "./routes/NGORoutes";
import NGOCampaignRoutes from "./routes/NGOCampaignRoutes";

function App() {
  return (
    <ShelterProvider>
      <AppRoutes />
      <AuthRoutes />
      <VolunteerRoutes />
      <NGORoutes />
      <NGOCampaignRoutes />
    </ShelterProvider>
  );
}

export default App;