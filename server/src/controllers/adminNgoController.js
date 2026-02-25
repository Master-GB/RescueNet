// Switched from ngoModel.js (Organization) to the unified NgoProfile model
import NgoProfile from "../models/userProfileModel/NgoProfile.js";
import User from "../models/user.js";
import HelpRequest from "../models/HelpRequest.js";
import mongoose from "mongoose";

/**
 * Register a new NGO Profile (Admin Only)
 * POST /api/admin/ngos/register
 */
export const registerNgo = async (req, res) => {
  try {
    const {
      userEmail,
      organizationName,
      registrationNumber,
      type,
      contactPerson,
      officialEmail,
      contactPhone,
      address,
      services,
      serviceDistricts,
    } = req.body;

    // Validate required fields before hitting the DB
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "userEmail is required.",
      });
    }
    if (!registrationNumber) {
      return res.status(400).json({
        success: false,
        message: "registrationNumber is required.",
      });
    }
    if (!contactPhone) {
      return res.status(400).json({
        success: false,
        message: "contactPhone is required.",
      });
    }

    // 1. Find the user by email
    const user = await User.findOne({ email: userEmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with email ${userEmail} not found. Please register the user account first.`,
      });
    }

    // 2. Check if this user already has an NGO profile
    const existingNgo = await NgoProfile.findOne({ userId: user._id });
    if (existingNgo) {
      return res.status(400).json({
        success: false,
        message: "This user is already linked to an NGO profile.",
      });
    }

    // 3. Check if registration number is unique
    const duplicateReg = await NgoProfile.findOne({ registrationNumber });
    if (duplicateReg) {
      return res.status(400).json({
        success: false,
        message: "Organization with this registration number already exists.",
      });
    }

    // 4. Create the NgoProfile (admin-registered NGOs are auto-approved)
    const newNgo = await NgoProfile.create({
      userId: user._id,
      organizationName,
      registrationNumber,
      type,
      contactPerson,
      officialEmail,
      contactPhone,
      address,
      services: services || [],
      serviceDistricts: serviceDistricts || [],
      approvalStatus: "approved",
      verifiedByAdmin: true,
      approvedBy: req.user._id,
      approvedAt: new Date(),
      availabilityStatus: "AVAILABLE",
    });

    // 5. Update User Role to NGO
    if (user.role !== "ADMIN") {
      user.role = "NGO";
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "NGO registered successfully",
      data: {
        ngo: newNgo,
        userRole: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register NGO",
      error: error.message,
    });
  }
};

/**
 * Get all NGO profiles (Admin Only)
 * GET /api/admin/ngos
 */
export const getAllNgos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      approvalStatus,
      availabilityStatus,
      type,
      q,
    } = req.query;

    const filter = {};

    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (availabilityStatus) filter.availabilityStatus = availabilityStatus;
    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { organizationName: { $regex: q, $options: "i" } },
        { registrationNumber: { $regex: q, $options: "i" } },
        { officialEmail: { $regex: q, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 20, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const [ngos, total] = await Promise.all([
      NgoProfile.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("userId", "name email role"),
      NgoProfile.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: ngos,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch NGOs",
      error: error.message,
    });
  }
};

/**
 * Get single NGO by ID (Admin Only)
 * GET /api/admin/ngos/:id
 */
export const getNgoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngo = await NgoProfile.findById(id)
      .populate("userId", "name email role isAccountVerified")
      .populate("approvedBy", "name email");

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    res.json({
      success: true,
      data: ngo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch NGO",
      error: error.message,
    });
  }
};

// ...existing code...

/**
 * Update NGO profile details (Admin Only)
 * PATCH /api/admin/ngos/:id
 */
export const updateNgo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngo = await NgoProfile.findById(id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    const allowedFields = [
      "organizationName",
      "registrationNumber",
      "type",
      "contactPerson",
      "officialEmail",
      "contactPhone",
      "alternatePhone",
      "address",
      "services",
      "serviceDistricts",
      "availabilityStatus",
      "approvalStatus",
      "rejectionReason",
      "isActive",
      "notes",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (
      updateData.registrationNumber &&
      updateData.registrationNumber !== ngo.registrationNumber
    ) {
      const duplicateReg = await NgoProfile.findOne({
        registrationNumber: updateData.registrationNumber,
        _id: { $ne: id },
      });

      if (duplicateReg) {
        return res.status(400).json({
          success: false,
          message: "Organization with this registration number already exists.",
        });
      }
    }

    if (updateData.approvalStatus === "approved") {
      updateData.approvedBy = req.user._id;
      updateData.approvedAt = new Date();
      updateData.rejectionReason = "";
      // Keep verifiedByAdmin in sync when admin approves via approvalStatus
      updateData.verifiedByAdmin = true;
    } else if (updateData.approvalStatus === "rejected" || updateData.approvalStatus === "suspended") {
      updateData.verifiedByAdmin = false;
    }

    const updatedNgo = await NgoProfile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email role");

    res.json({
      success: true,
      message: "NGO updated successfully",
      data: updatedNgo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update NGO",
      error: error.message,
    });
  }
};

/**
 * Delete NGO profile (Admin Only)
 * DELETE /api/admin/ngos/:id
 */
export const deleteNgo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngo = await NgoProfile.findById(id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    // Un-assign all help requests that referenced this NGO
    await HelpRequest.updateMany(
      { assignedTo: ngo._id },
      {
        $set: {
          assignedTo: null,
          status: "verified",
        },
      }
    );

    if (ngo.userId) {
      const linkedUser = await User.findById(ngo.userId);
      if (linkedUser && linkedUser.role === "NGO") {
        linkedUser.role = "CITIZEN";
        await linkedUser.save();
      }
    }

    await NgoProfile.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "NGO deleted successfully",
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete NGO",
      error: error.message,
    });
  }
};