import Organization from "../models/ngoModel.js";
import User from "../models/user.js";
import HelpRequest from "../models/HelpRequest.js";
import mongoose from "mongoose";

/**
 * Register a new NGO Profile (Admin Only)
 * Links an existing user account to a new Organization profile
 * POST /api/admin/ngos/register
 */
export const registerNgo = async (req, res) => {
  try {
    // Extract NGO details from request body
    const {
      userEmail, // The email of the user who will manage this NGO
      organizationName,
      registrationNumber,
      type,
      contactPerson,
      officialEmail,
      phone,
      address,
      capabilities,
      serviceArea,
    } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email: userEmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with email ${userEmail} not found. Please register the user account first.`,
      });
    }

    // 2. Check if this user already has an NGO profile
    const existingNgo = await Organization.findOne({ userId: user._id });
    if (existingNgo) {
      return res.status(400).json({
        success: false,
        message: "This user is already linked to an NGO profile.",
      });
    }

    // 3. Check if registration number is unique
    if (registrationNumber) {
      const duplicateReg = await Organization.findOne({ registrationNumber });
      if (duplicateReg) {
        return res.status(400).json({
          success: false,
          message: "Organization with this registration number already exists.",
        });
      }
    }

    // 4. Create the Organization
    const newNgo = await Organization.create({
      userId: user._id,
      organizationName,
      registrationNumber,
      type,
      contactPerson,
      officialEmail,
      phone,
      address,
      capabilities,
      serviceArea,
      // Auto-approve since Admin is creating it
      approvalStatus: "approved",
      approvedBy: req.user._id, // The admin performing this action
      approvedAt: new Date(),
      availabilityStatus: "available",
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
      Organization.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("userId", "name email role"),
      Organization.countDocuments(filter),
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

    const ngo = await Organization.findById(id)
      .populate("userId", "firstName lastName email role isAccountVerified")
      .populate("approvedBy", "firstName lastName email");

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

    const ngo = await Organization.findById(id);
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
      "phone",
      "alternatePhone",
      "address",
      "capabilities",
      "serviceArea",
      "resources",
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
      const duplicateReg = await Organization.findOne({
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
    }

    const updatedNgo = await Organization.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "firstName lastName email role");

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

    const ngo = await Organization.findById(id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

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

    await Organization.findByIdAndDelete(id);

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