import Shelter from "../models/shelterModel.js";
import { buildShelterQuery } from "../services/shelterQuery.js";

/**
 * Helper to emit realtime events if socket is enabled
 * (req.io is injected from server.js)
 */
function emit(req, event, payload) {
  if (req.io) req.io.emit(event, payload);
}

export const createShelter = async (req, res) => {
  try {
    const {
      name,
      description,
      shelterType,
      images,
      managedBy,
      address,
      contact,
      location,
      capacity,
      occupancy,
      supports,
      specialSupport,
      status,
      verified,
    } = req.body;

    if (
      !name ||
      !address ||
      !capacity?.total ||
      !contact?.phone ||
      !supports?.disasterTypes
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Missing required fields: name,address, capacity, phone or deasaster types",
        });
    } else if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "location.coordinates must be an array of [lng, lat]",
        });
    } else if (capacity.total < 1) {
      return res
        .status(400)
        .json({ success: false, message: "capacity.total must be at least 1" });
    }

    const newShelter = await Shelter.create({
      name,
      description,
      shelterType,
      images,
      createdBy: req.user._id,
      managedBy: managedBy || [],
      address,
      contact,
      location,
      capacity,
      occupancy,
      supports,
      specialSupport,
      status: status || "OPEN",
      verified: verified ?? false,
    });

    emit(req, "shelter:created", newShelter);

    return res
      .status(201)
      .json({ success: true, message: "Shelter created", shelter: newShelter });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Create shelter failed",
        error: error.message,
      });
  }
};

export const getShelterById = async (req, res) => {
  try {
    const shelterID = req.params.id;
    if (!shelterID) {
      return res
        .status(400)
        .json({ success: false, message: "Shelter ID is required" });
    }
    const shelter = await Shelter.findById(shelterID);

    if (!shelter)
      return res
        .status(404)
        .json({ success: false, message: "Shelter not found" });

    return res.status(200).json({ success: true, shelter, message: "Shelter retrieved successfully" });

  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Get shelter failed",
        error: error.message,
      });
  }
};

//  list + filter + search + pagination
export const listShelters = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const sort = req.query.sort || "-updatedAt";

    const filter = {
      ...buildShelterQuery(req.query),
      verified: true
    };

    const [items, total] = await Promise.all([
      Shelter.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Shelter.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      shelters: items,
      message: "Shelters retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "List shelters failed",
        error: error.message,
      });
  }
};


export const nearbyShelters = async (req, res) => {
  try {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const radiusKm = parseFloat(req.query.radiusKm || "5");

    if (Number.isNaN(lng) || Number.isNaN(lat)) {
      return res
        .status(400)
        .json({ success: false, message: "lng and lat are required numbers" });
    }

    const baseFilter = {
      ...buildShelterQuery(req.query),
      verified: true
    };

    const shelters = await Shelter.find({
      ...baseFilter,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    }).limit(200);

    return res.status(200).json({ success: true, shelters,message: "Nearby shelters retrieved successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Nearby shelters failed",
        error: error.message,
      });
  }
};

export const updateShelter = async (req, res) => {
  try {
    const updateShelter = { ...req.body };

    // handle location.coordinates -> location
    if (updateShelter.location?.coordinates) {
      updateShelter.location = {
        type: updateShelter.location.type ||"Point",
        coordinates: updateShelter.location.coordinates,
      };
    }

    const updated = await Shelter.findByIdAndUpdate(
      req.params.id,
      { $set: updateShelter },
      { returnDocument: "after", runValidators: true },
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Shelter not found" });

    emit(req, "shelter:updated", updated);

    return res
      .status(200)
      .json({ success: true, message: "Shelter updated", shelter: updated });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Update shelter failed",
        error: error.message,
      });
  }
};


export const deleteShelter = async (req, res) => {
  try {
    const shelterID = req.params.id;
    if (!shelterID) {
      return res
        .status(400)
        .json({ success: false, message: "Shelter ID is required" });
    }
    const deletedShelter = await Shelter.findByIdAndDelete(shelterID);
    if (!deletedShelter)
      return res
        .status(404)
        .json({ success: false, message: "Shelter not found" });

    emit(req, "shelter:deleted", { _id: deletedShelter._id });

    return res.status(200).json({ success: true, message: "Shelter deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Delete shelter failed",
        error: error.message,
      });
  }
};

// New flexible controller for listing shelters with verification filter
export const listSheltersWithVerification = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const sort = req.query.sort || "-updatedAt";
    
    // Get verification filter from query parameter
    const verifiedParam = req.query.verified;
    
    // Build filter based on verification parameter
    let filter = {
      ...buildShelterQuery(req.query)
    };
    
    // Handle verification filtering
    if (verifiedParam === 'false') {
      filter.verified = false; // Only unverified shelters
    } else if (verifiedParam === 'true') {
      filter.verified = true; // Only verified shelters
    }
    // If verified param is 'all' or not provided, don't add verified filter (return all shelters)

    const [items, total] = await Promise.all([
      Shelter.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Shelter.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      shelters: items,
      message: "Shelters retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "List shelters failed",
        error: error.message,
      });
  }
};
