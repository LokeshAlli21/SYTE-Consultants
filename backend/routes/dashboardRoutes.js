import express from 'express';
import { protect } from '../middlewares/protect.js';
import {
  // Monthly Trends Controllers
  getMonthlyPromoters,
  getMonthlyChannelPartners,
  getMonthlyProjects,
  getMonthlyAssignments,
  
  // Assignment Status Summary Controllers
  getAssignmentStatusSummary,
  getAssignmentTypeSummary,
  
  // Daily Reminders and Tasks Controllers
  getDailyReminders,
  
  // General Statistics Controllers
  getGeneralStats,
  
  // Promoter Insights Controllers
  getPromoterTypeDistribution,
  getPromoterGeographicDistribution,
  
  // Project Insights Controllers
  getProjectOverview,
  getReraExpiryAlerts,
  
  // Financial Insights Controllers
  getMonthlyFinancialSummary,
  getAssignmentFinancialPerformance,
  
  // Activity and Productivity Metrics Controllers
  getUserActivitySummary,
  getRecentActivity,
  
  // Combined Dashboard Data Controllers
  getCompleteDashboardData
} from '../controllers/dashboardController.js';

const router = express.Router();

// ====================================================================
// 1. MONTHLY TRENDS ROUTES
// ====================================================================

// Get Monthly Promoters Added
// Query params: year, month, limit
router.get('/monthly/promoters', protect, getMonthlyPromoters);

// Get Monthly Channel Partners Added
// Query params: year, month, limit
router.get('/monthly/channel-partners', protect, getMonthlyChannelPartners);

// Get Monthly Projects Added
// Query params: year, month, project_type, limit
router.get('/monthly/projects', protect, getMonthlyProjects);

// Get Monthly Assignments Added
// Query params: year, month, limit
router.get('/monthly/assignments', protect, getMonthlyAssignments);

// ====================================================================
// 2. ASSIGNMENT STATUS SUMMARY ROUTES
// ====================================================================

// Get Assignment Status Summary
router.get('/assignments/status-summary', protect, getAssignmentStatusSummary);

// Get Assignment Type Summary
router.get('/assignments/type-summary', protect, getAssignmentTypeSummary);

// ====================================================================
// 3. DAILY REMINDERS AND TASKS ROUTES
// ====================================================================

// Get Daily Reminders
// Query params: urgency, assignment_type, days_ahead
router.get('/reminders/daily', protect, getDailyReminders);

// ====================================================================
// 4. GENERAL STATISTICS ROUTES
// ====================================================================

// Get General Statistics
router.get('/stats/general', protect, getGeneralStats);

// ====================================================================
// 5. PROMOTER INSIGHTS ROUTES
// ====================================================================

// Get Promoter Type Distribution
router.get('/promoters/type-distribution', protect, getPromoterTypeDistribution);

// Get Promoter Geographic Distribution
// Query params: district, city, limit
router.get('/promoters/geographic-distribution', protect, getPromoterGeographicDistribution);

// ====================================================================
// 6. PROJECT INSIGHTS ROUTES
// ====================================================================

// Get Project Overview
// Query params: page, limit, search, district, city, project_type, promoter_id, rera_status
router.get('/projects/overview', protect, getProjectOverview);

// Get RERA Expiry Alerts
// Query params: alert_level, district, city, days_ahead
router.get('/projects/rera-expiry-alerts', protect, getReraExpiryAlerts);

// ====================================================================
// 7. FINANCIAL INSIGHTS ROUTES
// ====================================================================

// Get Monthly Financial Summary
// Query params: year, month, limit
router.get('/financial/monthly-summary', protect, getMonthlyFinancialSummary);

// Get Assignment Financial Performance
// Query params: assignment_type
router.get('/financial/assignment-performance', protect, getAssignmentFinancialPerformance);

// ====================================================================
// 8. ACTIVITY AND PRODUCTIVITY METRICS ROUTES
// ====================================================================

// Get User Activity Summary
// Query params: user_id, user_type, limit
router.get('/activity/user-summary', protect, getUserActivitySummary);

// Get Recent Activity
// Query params: activity_type, entity_type, district, city, created_by_user, limit, days_back
router.get('/activity/recent', protect, getRecentActivity);

// ====================================================================
// 9. COMBINED DASHBOARD DATA ROUTES
// ====================================================================

// Get Complete Dashboard Data (combines multiple views for single API call)
router.get('/complete', protect, getCompleteDashboardData);

// ====================================================================
// 10. CONVENIENCE ROUTES (Alternative naming for easier access)
// ====================================================================

// Alternative routes for common dashboard sections
router.get('/overview', protect, getCompleteDashboardData); // Same as /complete
router.get('/stats', protect, getGeneralStats); // Same as /stats/general
router.get('/reminders', protect, getDailyReminders); // Same as /reminders/daily
router.get('/assignments', protect, getAssignmentStatusSummary); // Quick assignment overview
router.get('/promoters', protect, getPromoterTypeDistribution); // Quick promoter overview
router.get('/projects', protect, getProjectOverview); // Quick project overview
router.get('/financial', protect, getMonthlyFinancialSummary); // Quick financial overview
router.get('/activity', protect, getRecentActivity); // Quick activity overview

export default router;