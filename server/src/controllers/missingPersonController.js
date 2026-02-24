import missingPersonService from '../services/missingPersonService.js';

class MissingPersonController {
  // Create new missing person report
  async createReport(req, res) {
    try {
      const reportData = {
        ...req.body,
        reportedBy: req.user?.id || null // Will be set properly when auth is implemented
      };

      const report = await missingPersonService.createReport(reportData);

      res.status(201).json({
        success: true,
        message: 'Missing person report created successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all reports with filters and pagination
  async getAllReports(req, res) {
    try {
      const { page, limit, status, priority, city, sortBy, search } = req.query;

      const result = await missingPersonService.getAllReports(
        {},
        { page, limit, status, priority, city, sortBy, search }
      );

      res.status(200).json({
        success: true,
        message: 'Reports fetched successfully',
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get report by ID
  async getReportById(req, res) {
    try {
      const { id } = req.params;
      const report = await missingPersonService.getReportById(id);

      res.status(200).json({
        success: true,
        message: 'Report fetched successfully',
        data: report
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update report
  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // Will be set properly when auth is implemented

      const report = await missingPersonService.updateReport(id, req.body, userId);

      res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete report
  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const result = await missingPersonService.deleteReport(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add sighting to a report
  async addSighting(req, res) {
    try {
      const { id } = req.params;
      const sightingData = req.body;

      const report = await missingPersonService.addSighting(id, sightingData);

      res.status(200).json({
        success: true,
        message: 'Sighting added successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search by location
  async searchByLocation(req, res) {
    try {
      const { longitude, latitude, radius } = req.query;

      if (!longitude || !latitude) {
        return res.status(400).json({
          success: false,
          message: 'Longitude and latitude are required'
        });
      }

      const reports = await missingPersonService.searchByLocation(
        parseFloat(longitude),
        parseFloat(latitude),
        parseFloat(radius) || 10
      );

      res.status(200).json({
        success: true,
        message: 'Nearby reports fetched successfully',
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get statistics
  async getStatistics(req, res) {
    try {
      const stats = await missingPersonService.getStatistics();

      res.status(200).json({
        success: true,
        message: 'Statistics fetched successfully',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ... other methods above ...
  
}

export default new MissingPersonController();