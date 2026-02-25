import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
const SESSION_ID = `test-session-${Date.now()}`; // Unique session each run

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  console.log("Session ID:", SESSION_ID);
  
  // Start sharing location (Colombo, Sri Lanka)
  socket.emit("location:start", {
    sessionId: SESSION_ID,
    latitude: 6.9271,
    longitude: 79.8612,
    accuracy: 10,
    userName: "Test User",
    contactNumber: "0771234567",
    isEmergency: true,
    emergencyType: "flood",
    emergencyMessage: "Need immediate help!"
  });
});

socket.on("location:started", (data) => {
  console.log("✅ Sharing started:", data.sessionId);
  console.log("📍 GeoJSON stored:", data.location.currentLocation);
  
  // Simulate location updates every 2 seconds
  let count = 0;
  const interval = setInterval(() => {
    count++;
    const newLat = 6.9271 + Math.random() * 0.001;
    const newLng = 79.8612 + Math.random() * 0.001;
    
    console.log(`📍 Sending update #${count}: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
    
    socket.emit("location:update", {
      sessionId: SESSION_ID,
      latitude: newLat,
      longitude: newLng,
      accuracy: 10,
      speed: 1.5
    });
    
    // Stop after 3 updates and test nearby search
    if (count >= 3) {
      clearInterval(interval);
      console.log("\n🔍 Testing nearby search via REST API...");
      testNearbySearch().then(() => {
        console.log("\n🛑 Stopping location sharing...");
        socket.emit("location:stop", { sessionId: SESSION_ID });
      });
    }
  }, 2000);
});

async function testNearbySearch() {
  try {
    const response = await fetch(
      `http://localhost:5000/api/location/nearby?latitude=6.9271&longitude=79.8612&radius=5000`
    );
    const data = await response.json();
    console.log(`✅ Found ${data.count} user(s) within 5km:`);
    data.results?.forEach((r) => {
      console.log(`   - ${r.userName || "Anonymous"}: ${r.distanceText} away ${r.isEmergency ? "🚨 EMERGENCY" : ""}`);
    });
  } catch (err) {
    console.log("⚠️ Nearby search test failed (server may not support fetch):", err.message);
  }
}

socket.on("location:update", (data) => {
  console.log("📡 Received update:", data.location);
});

socket.on("location:stopped", (data) => {
  console.log("✅ Sharing stopped. Last location:", data.lastLocation);
  setTimeout(() => {
    console.log("\n✅ Test complete!");
    socket.disconnect();
    process.exit(0);
  }, 500);
});

socket.on("location:error", (err) => {
  console.error("❌ Error:", err);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
  console.log("Make sure the server is running: npm run dev");
  process.exit(1);
});
