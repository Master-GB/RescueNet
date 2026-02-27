import HelpRequest from "../models/HelpRequest.js";
import NgoProfile from "../models/userProfileModel/NgoProfile.js";
import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Internal helper — fetch the calling NGO's profile and enforce approval gate
// ---------------------------------------------------------------------------
const getApprovedNgoProfile = async (userId, res) => {
  const profile = await NgoProfile.findOne({ userId });

  if (!profile) {
    res.status(404).json({ success: false, message: "NGO profile not found" });
    return null;
  }

  if (profile.approvalStatus !== "approved") {
    res.status(403).json({
      success: false,
      message: "Your NGO account has not been approved by an admin yet",
    });
    return null;
  }

  return profile;
};

// ---------------------------------------------------------------------------
// GET /api/ngo/help-requests?status=&page=&limit=
// List all help requests assigned to this NGO, optionally filtered by assignment status
// ---------------------------------------------------------------------------
export const getMyTasks = async (req, res) => {
  try {
    const profile = await getApprovedNgoProfile(req.user._id, res);
    if (!profile) return;

    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build the elemMatch filter on the assignments sub-array
    const assignmentFilter = { ngoId: profile._id };
    if (status) {
      const validStatuses = ["assigned", "accepted", "declined", "in-progress", "completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed: ${validStatuses.join(", ")}`,
        });
      }
      assignmentFilter.status = status;
    }

    const query = { assignments: { $elemMatch: assignmentFilter } };

    const [total, helpRequests] = await Promise.all([
      HelpRequest.countDocuments(query),
      HelpRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("-voiceMessage -images"), // omit binary blobs from list view
    ]);

    return res.json({
      success: true,
      data: helpRequests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/ngo/help-requests/performance
// Return profile performance stats + per-status assignment counts
// ---------------------------------------------------------------------------
export const getPerformance = async (req, res) => {
  try {
    const profile = await getApprovedNgoProfile(req.user._id, res);
    if (!profile) return;

    // Aggregate assignment status counts for this NGO
    const statusCounts = await HelpRequest.aggregate([
      { $unwind: "$assignments" },
      { $match: { "assignments.ngoId": profile._id } },
      {
        $group: {
          _id: "$assignments.status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert array to { assigned: N, accepted: N, ... } map
    const counts = statusCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        completedTasks: profile.completedTasks,
        averageResponseTime: profile.averageResponseTime ?? null,
        rating: profile.rating,
        availabilityStatus: profile.availabilityStatus,
        assignmentCounts: {
          assigned: counts.assigned ?? 0,
          accepted: counts.accepted ?? 0,
          declined: counts.declined ?? 0,
          inProgress: counts["in-progress"] ?? 0,
          completed: counts.completed ?? 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/ngo/help-requests/:requestId
// Get detail of a single help request that includes this NGO in assignments
// ---------------------------------------------------------------------------
export const getTaskDetail = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid help request ID" });
    }

    const profile = await getApprovedNgoProfile(req.user._id, res);
    if (!profile) return;

    const helpRequest = await HelpRequest.findOne({
      _id: requestId,
      "assignments.ngoId": profile._id,
    });

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found or not assigned to your organisation",
      });
    }

    return res.json({ success: true, data: helpRequest });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/ngo/help-requests/:requestId/accept
// Move assignment status: assigned → accepted
// ---------------------------------------------------------------------------
export const acceptTask = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid help request ID" });
    }

    const profile = await getApprovedNgoProfile(req.user._id, res);
    if (!profile) return;

    const helpRequest = await HelpRequest.findById(requestId);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: "Help request not found" });
    }

    const assignment = helpRequest.assignments.find(
      (a) => a.ngoId.toString() === profile._id.toString()
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Your organisation is not assigned to this help request",
      });
    }

    if (assignment.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept — current assignment status is "${assignment.status}"`,
      });
    }

    assignment.status = "accepted";

    // Track in NgoProfile.acceptedRequests (avoid duplicates)
    if (!profile.acceptedRequests.some((id) => id.toString() === requestId)) {
      profile.acceptedRequests.push(helpRequest._id);
    }

    await Promise.all([helpRequest.save(), profile.save()]);

    return res.json({
      success: true,
      message: "Task accepted successfully",
      data: { requestId, assignmentStatus: assignment.status },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/ngo/help-requests/:requestId/decline
// Move assignment status: assigned → declined
// Body: { reason?: string }
// ---------------------------------------------------------------------------
export const declineTask = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid help request ID" });
    }

    const profile = await getApprovedNgoProfile(req.user._id, res);
    if (!profile) return;

    const helpRequest = await HelpRequest.findById(requestId);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: "Help request not found" });
    }

    const assignment = helpRequest.assignments.find(
      (a) => a.ngoId.toString() === profile._id.toString()
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Your organisation is not assigned to this help request",
      });
    }

    if (assignment.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: `Cannot decline — current assignment status is "${assignment.status}"`,
      });
    }

    assignment.status = "declined";
    if (reason) {
      assignment.declineReason = reason;
    }

    // Clean up acceptedRequests if present (edge case)
    profile.acceptedRequests = profile.acceptedRequests.filter(
      (id) => id.toString() !== requestId
    );

    await Promise.all([helpRequest.save(), profile.save()]);

    return res.json({
      success: true,
      message: "Task declined",
      data: { requestId, assignmentStatus: assignment.status, declineReason: assignment.declineReason ?? null },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/ngo/help-requests/:requestId/in-progress
// Move assignment status: accepted → in-progress
// ---------------------------------------------------------------------------
export const markInProgress = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid help request ID" });
    }

    const profile = await getApprovedNgoProfile(req.user._id, res);
    if (!profile) return;

    const helpRequest = await HelpRequest.findById(requestId);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: "Help request not found" });
    }

    const assignment = helpRequest.assignments.find(
      (a) => a.ngoId.toString() === profile._id.toString()
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Your organisation is not assigned to this help request",
      });
    }

    if (assignment.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: `Cannot mark in-progress — current assignment status is "${assignment.status}"`,
      });
    }

    assignment.status = "in-progress";

    // Promote the top-level request status if it hasn't been already
    if (helpRequest.status !== "in-progress" && helpRequest.status !== "resolved") {
      helpRequest.status = "in-progress";
    }

    await helpRequest.save();

    return res.json({
      success: true,
      message: "Task marked as in-progress",
      data: { requestId, assignmentStatus: assignment.status, helpRequestStatus: helpRequest.status },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/ngo/help-requests/:requestId/complete
// Move assignment status: in-progress → completed
// If all assignments are completed/declined, resolves the help request
// ---------------------------------------------------------------------------
export const markCompleted = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid help request ID" });
    }

    const profile = await getApprovedNgoProfile(req.user._id, res);
    if (!profile) return;

    const helpRequest = await HelpRequest.findById(requestId);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: "Help request not found" });
    }

    const assignment = helpRequest.assignments.find(
      (a) => a.ngoId.toString() === profile._id.toString()
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Your organisation is not assigned to this help request",
      });
    }

    if (assignment.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: `Cannot complete — current assignment status is "${assignment.status}"`,
      });
    }

    assignment.status = "completed";
    assignment.completedAt = new Date();

    // Increment completed task counter on the NGO profile
    profile.completedTasks = (profile.completedTasks ?? 0) + 1;

    // Resolve the overall help request if every assignment is done
    const allDone = helpRequest.assignments.every((a) =>
      ["completed", "declined"].includes(a.status)
    );

    if (allDone) {
      helpRequest.status = "resolved";
      helpRequest.resolvedAt = new Date();
    }

    await Promise.all([helpRequest.save(), profile.save()]);

    return res.json({
      success: true,
      message: allDone
        ? "Task completed — help request fully resolved"
        : "Task marked as completed",
      data: {
        requestId,
        assignmentStatus: assignment.status,
        completedAt: assignment.completedAt,
        helpRequestStatus: helpRequest.status,
        helpRequestResolved: allDone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
