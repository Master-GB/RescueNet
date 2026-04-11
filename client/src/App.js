// client/src/App.js
import React from "react";
import { ShelterProvider } from "./contexts/ShelterContext";
import { VolunteerProvider } from "./contexts/VolunteerContext";

// Primary route file
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ShelterProvider>
      <VolunteerProvider>
        <AppRoutes />
      </VolunteerProvider>
    </ShelterProvider>
  );
}

export default App;