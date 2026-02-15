import Organization from "../models/ngoModel.js";
import User from "../models/user.js";

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