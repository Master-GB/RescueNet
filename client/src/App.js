import AppRoutes from "./routes/AppRoutes";
import { ShelterProvider } from "./contexts/ShelterContext";

function App() {
  return (
    <ShelterProvider>
      <AppRoutes />
    </ShelterProvider>
  );
}

export default App;