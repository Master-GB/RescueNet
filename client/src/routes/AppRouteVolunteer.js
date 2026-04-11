import React from "react";
import { Navigate, Route } from "react-router-dom";
import RoleRoute from "../components/authentication/RoleRoute";
import VolunteerPendingApprovalPage from "../pages/auth/VolunteerPendingApprovalPage";
import VolunteerProfileFormPage from "../pages/auth/VolunteerProfileFormPage";
import VolunteerAlertsPage from "../pages/volunteer/VolunteerAlertsPage";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";
import VolunteerMapPage from "../pages/volunteer/VolunteerMapPage";
import VolunteerTeamChatPage from "../pages/volunteer/VolunteerTeamChatPage";
import VolunteerProfilePage from "../pages/volunteer/VolunteerProfilePage";
import VolunteerTasksPage from "../pages/volunteer/VolunteerTasksPage";
import VolunteerDonationsPage from "../pages/volunteer/VolunteerDonationsPage";
import CitizenHelpRequest from "../pages/citizen/CitizenHelpRequest";
import { volunteerSidebarItems } from "../pages/volunteer/volunteerLayoutConfig";

export const renderVolunteerRoutes = () => (
	<>
		<Route path="/volunteer" element={<Navigate to="/volunteer-dashboard" replace />} />

		<Route
			path="/volunteer/profile-setup"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]}>
					<VolunteerProfileFormPage />
				</RoleRoute>
			)}
		/>

		<Route
			path="/volunteer/pending-approval"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]}>
					<VolunteerPendingApprovalPage />
				</RoleRoute>
			)}
		/>

		<Route
			path="/volunteer-dashboard"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
					<VolunteerDashboard />
				</RoleRoute>
			)}
		/>

		<Route
			path="/volunteer/tasks"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
					<VolunteerTasksPage />
				</RoleRoute>
			)}
		/>

		<Route
			path="/volunteer/map"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
					<VolunteerMapPage />
				</RoleRoute>
			)}
		/>

		<Route
			path="/volunteer/alerts"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
					<VolunteerAlertsPage />
				</RoleRoute>
			)}
		/>

		<Route
			path="/volunteer/chat"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
					<VolunteerTeamChatPage />
				</RoleRoute>
			)}
		/>

		<Route path="/volunteer/requests" element={<Navigate to="/volunteer/tasks" replace />} />

		<Route
			path="/volunteer/profile"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
					<VolunteerProfilePage />
				</RoleRoute>
			)}
		/>

		<Route
			path="/volunteer/donations"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
					<VolunteerDonationsPage />
				</RoleRoute>
			)}
		/>
		<Route
			path="/volunteer/help-request"
			element={(
				<RoleRoute allowedRoles={["VOLUNTEER"]} requireFullyOnboarded>
					<CitizenHelpRequest 
						sidebarItems={volunteerSidebarItems}
						portalTitle="Volunteer Portal"
						avatarLetter="V"
						homePath="/volunteer-dashboard"
					/>
				</RoleRoute>
			)}
		/>
	</>
);

