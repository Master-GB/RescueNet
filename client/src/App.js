// client/src/App.js
import React from "react";
import { ShelterProvider } from "./contexts/ShelterContext";

// Primary route file
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ShelterProvider>
      <AppRoutes />
    </ShelterProvider>
  );
}

export default App;