import HelpRequest from "../models/HelpRequest.js";
// Switched to unified NgoProfile model
import NgoProfile from "../models/userProfileModel/NgoProfile.js";
import mongoose from "mongoose";

/**
 * Update help request admin fields
 * PATCH /api/admin/help-requests/:id
 */
export const updateHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      adminNotes,
      rejectionReason,
      publishedToSocial,
    } = req.body;

    if (req.body.assignedTo !== undefined || req.body.assignments !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Use the assign/unassign endpoints to modify assignments",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID",
      });
    }

    // Find the help request
    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    // Prepare update data
    const updateData = {};

    // Update status
    if (status !== undefined) {
      const validStatuses = [
        "pending",
        "verified",
        "assigned",
        "in-progress",
        "resolved",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
        });
      }
      updateData.status = status;

      // Auto-set resolvedAt when status is resolved
      if (status === "resolved") {
        updateData.resolvedAt = new Date();
      }
    }

    // Update admin notes
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    // Update rejection reason
    if (rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason;
    }

    // Update published to social
    if (publishedToSocial !== undefined) {
      updateData.publishedToSocial = publishedToSocial;
    }

    // Perform update
    const updatedRequest = await HelpRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("assignments.ngoId", "organizationName type availabilityStatus");

    res.json({
      success: true,
      message: "Help request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update help request",
      error: error.message,
    });
  }
};

/**
 * Assign help request to an organization
 * POST /api/admin/help-requests/:id/assign
 */
export const assignHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.body;

    // check if id and organizationId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID",
      });
    }

    // check if organizationId is provided and valid
    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid organization ID is required",
      });
    }

    // Find the help request
    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    // Find the organization
    const organization = await NgoProfile.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (organization.approvalStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign to unapproved organization",
      });
    }

    if (organization.availabilityStatus === "OFFLINE") {
      return res.status(400).json({
        success: false,
        message: `Organization is currently ${organization.availabilityStatus}`,
        warning: true,
      });
    }

    // Update help request
    const assignments = Array.isArray(helpRequest.assignments)
      ? helpRequest.assignments
      : [];
    const alreadyAssignedToRequest = assignments.some(
      (assignment) => assignment.ngoId.toString() === organizationId
    );
    if (!alreadyAssignedToRequest) {
      helpRequest.assignments = assignments;
      helpRequest.assignments.push({ ngoId: organizationId, status: "assigned" });
    }
    helpRequest.status = "assigned";
    await helpRequest.save();

    // Fix: compare as strings since assignedRequests contains ObjectIds
    const alreadyAssigned = organization.assignedRequests.some(
      (reqId) => reqId.toString() === id
    );
    if (!alreadyAssigned) {
      organization.assignedRequests.push(id);
      await organization.save();
    }

    const updatedRequest = await HelpRequest.findById(id).populate(
      "assignments.ngoId",
      "organizationName type contactPerson contactPhone availabilityStatus"
    );

    res.json({
      success: true,
      message: `Help request assigned to ${organization.organizationName}`,
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign help request",
      error: error.message,
    });
  }
};

/**
 * Unassign help request from an organization
 * POST /api/admin/help-requests/:id/unassign
 */
export const unassignHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID",
      });
    }

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid organization ID is required",
      });
    }

    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    const assignments = Array.isArray(helpRequest.assignments)
      ? helpRequest.assignments
      : [];
    const assignmentIndex = assignments.findIndex(
      (assignment) => assignment.ngoId.toString() === organizationId
    );
    if (assignmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found for organization",
      });
    }

    assignments.splice(assignmentIndex, 1);
    helpRequest.assignments = assignments;
    if (assignments.length === 0 && helpRequest.status === "assigned") {
      helpRequest.status = "verified";
    }

    await helpRequest.save();

    const organization = await NgoProfile.findById(organizationId);
    if (organization) {
      organization.assignedRequests = organization.assignedRequests.filter(
        (reqId) => reqId.toString() !== id
      );
      organization.acceptedRequests = organization.acceptedRequests.filter(
        (reqId) => reqId.toString() !== id
      );
      await organization.save();
    }

    const updatedRequest = await HelpRequest.findById(id).populate(
      "assignments.ngoId",
      "organizationName type contactPerson contactPhone availabilityStatus"
    );

    res.json({
      success: true,
      message: "Help request unassigned successfully",
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unassign help request",
      error: error.message,
    });
  }
};

/**
 * Reject a help request
 * POST /api/admin/help-requests/:id/reject
 */
export const rejectHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID",
      });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    helpRequest.status = "rejected";
    helpRequest.rejectionReason = reason;
    await helpRequest.save();

    res.json({
      success: true,
      message: "Help request rejected",
      data: helpRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject help request",
      error: error.message,
    });
  }
};

/**
 * Mark help request as verified
 * POST /api/admin/help-requests/:id/verify
 */
export const verifyHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID",
      });
    }

    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    if (helpRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot verify request with status: ${helpRequest.status}`,
      });
    }

    helpRequest.status = "verified";
    await helpRequest.save();

    res.json({
      success: true,
      message: "Help request verified",
      data: helpRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify help request",
      error: error.message,
    });
  }
};

/**
 * Mark help request as resolved
 * POST /api/admin/help-requests/:id/resolve
 */
export const resolveHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID",
      });
    }

    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    helpRequest.status = "resolved";
    helpRequest.resolvedAt = new Date();
    
    if (adminNotes) {
      helpRequest.adminNotes = adminNotes;
    }

    await helpRequest.save();

    // Update organization's completed tasks if assigned
    const assignedNgoIds = (Array.isArray(helpRequest.assignments)
      ? helpRequest.assignments
      : [])
      .map((assignment) => assignment.ngoId)
      .filter(Boolean);
    if (assignedNgoIds.length > 0) {
      await NgoProfile.updateMany(
        { _id: { $in: assignedNgoIds } },
        { $inc: { completedTasks: 1 } }
      );
    }

    res.json({
      success: true,
      message: "Help request marked as resolved",
      data: helpRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to resolve help request",
      error: error.message,
    });
  }
};

/**
 * Get all help requests with filtering (admin view)
 * GET /api/admin/help-requests
 */
export const getAdminHelpRequests = async (req, res) => {
  try {
    const { status, disasterType, urgency, assignedTo, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (disasterType) filter.disasterType = disasterType;
    if (urgency) filter.urgency = urgency;
    if (assignedTo) {
      if (assignedTo === "unassigned") {
        filter.assignments = { $size: 0 };
      } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        filter["assignments.ngoId"] = assignedTo;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      HelpRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate(
          "assignments.ngoId",
          "organizationName type contactPerson contactPhone availabilityStatus"
        ),
      HelpRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch help requests",
      error: error.message,
    });
  }
};

/**
 * Get single help request with full details (admin view)
 * GET /api/admin/help-requests/:id
 */
export const getAdminHelpRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID",
      });
    }

    const helpRequest = await HelpRequest.findById(id).populate(
      "assignments.ngoId",
      "organizationName type contactPerson officialEmail contactPhone address services serviceDistricts availabilityStatus"
    );

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    res.json({
      success: true,
      data: helpRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch help request",
      error: error.message,
    });
  }
};
