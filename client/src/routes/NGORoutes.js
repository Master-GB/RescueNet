import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleRoute from "../components/authentication/RoleRoute";
import NgoDashboard from "../pages/ngo/NgoDashboard";

const NGORoutes = () => {
	return (
		<Routes>
			{/* Compatibility redirects for NGO URLs used across the app */}
			<Route path="/ngo" element={<Navigate to="/ngo-dashboard" replace />} />
			<Route path="/ngo/dashboard" element={<Navigate to="/ngo-dashboard" replace />} />
			<Route path="/ngo/campaigns" element={<Navigate to="/ngo-dashboard" replace />} />

			{/* Main NGO dashboard */}
			<Route
				path="/ngo-dashboard"
				element={
					<RoleRoute allowedRoles={["NGO"]} requireFullyOnboarded>
						<NgoDashboard />
					</RoleRoute>
				}
			/>
		</Routes>
	);
};

export default NGORoutes;
