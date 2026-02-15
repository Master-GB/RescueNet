import VolunteerProfile from "../../models/userProfileModel/VolunteerProfile.js";
import NgoProfile from "../../models/userProfileModel/NgoProfile.js";
import User from "../../models/user.js";

export const verifyVolunteer = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "VOLUNTEER") {
      return res.status(400).json({ success: false, message: "Volunteer user not found" });
    }

    const profile = await VolunteerProfile.findOneAndUpdate(
      { userId },
      { $set: { verifiedByAdmin: true } },
      { returnDocument: "after", runValidators: true },
    );

    return res.status(200).json({ success: true, message: "Volunteer verified", profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
};

export const verifyNgo = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "NGO") {
      return res.status(400).json({ success: false, message: "NGO user not found" });
    }

    const profile = await NgoProfile.findOneAndUpdate(
      { userId },
      { $set: { verifiedByAdmin: true } },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "NGO verified", profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
};
