import MissingPerson from '../models/MissingPerson.js'; 

class MissingPersonService {
  // Create new missing person report
  async createReport(reportData) {
  try {
    const missingPerson = new MissingPerson(reportData);
    await missingPerson.save();
    return missingPerson;
  } catch (error) {
    throw new Error(`Error creating report: ${error.message}`);
  }
}

  // Get all reports with filters and pagination
  async getAllReports(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        city,
        sortBy = '-createdAt',
        search
      } = options;

      // Build query
      const query = { isActive: true };

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (city) query['lastSeenLocation.city'] = new RegExp(city, 'i');
      if (search) {
        query.$text = { $search: search };
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      
      const [reports, total] = await Promise.all([
        MissingPerson.find(query)
          .sort(sortBy)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('reportedBy', 'name email')
          .lean(),
        MissingPerson.countDocuments(query)
      ]);

      return {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReports: total,
          reportsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching reports: ${error.message}`);
    }
  }

  // Get report by ID
  async getReportById(id) {
    try {
      const report = await MissingPerson.findById(id)
        .populate('reportedBy', 'name email phone');
      
      if (!report) {
        throw new Error('Missing person report not found');
      }

      return report;
    } catch (error) {
      throw new Error(`Error fetching report: ${error.message}`);
    }
  }

  // Update report
  async updateReport(id, updateData, userId) {
    try {
      const report = await MissingPerson.findById(id);

      if (!report) {
        throw new Error('Missing person report not found');
      }

      // Check if user has permission to update (reporter or admin)
      // This will be enhanced with proper auth later
      
      Object.assign(report, updateData);
      await report.save();

      return report;
    } catch (error) {
      throw new Error(`Error updating report: ${error.message}`);
    }
  }

  // Delete report (soft delete)
  async deleteReport(id, userId) {
    try {
      const report = await MissingPerson.findById(id);

      if (!report) {
        throw new Error('Missing person report not found');
      }

      // Soft delete
      report.isActive = false;
      await report.save();

      return { message: 'Report deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting report: ${error.message}`);
    }
  }

  // Add sighting to a report
  async addSighting(reportId, sightingData) {
    try {
      const report = await MissingPerson.findById(reportId);

      if (!report) {
        throw new Error('Missing person report not found');
      }

      report.sightings.push(sightingData);
      await report.save();

      return report;
    } catch (error) {
      throw new Error(`Error adding sighting: ${error.message}`);
    }
  }

  // Search reports by location radius
  async searchByLocation(longitude, latitude, radiusInKm = 10) {
    try {
      const radiusInMeters = radiusInKm * 1000;

      const reports = await MissingPerson.find({
        'lastSeenLocation.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusInMeters
          }
        },
        isActive: true,
        status: 'Active'
      }).limit(20);

      return reports;
    } catch (error) {
      throw new Error(`Error searching by location: ${error.message}`);
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const [total, active, found, byPriority] = await Promise.all([
        MissingPerson.countDocuments({ isActive: true }),
        MissingPerson.countDocuments({ status: 'Active', isActive: true }),
        MissingPerson.countDocuments({ status: 'Found', isActive: true }),
        MissingPerson.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ])
      ]);

      return {
        total,
        active,
        found,
        closed: total - active - found,
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Error fetching statistics: ${error.message}`);
    }
  }
}

export default new MissingPersonService();