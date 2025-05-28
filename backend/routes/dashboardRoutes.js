import express from 'express';
import { protect } from '../middlewares/protect.js';
import { 
  getMasterDashboard,
  getPromotersDashboard,
  getProjectsDashboard,
  getUnitsDashboard,
  getAssignmentsDashboard,
  getFinancialDashboard,
  getSiteProgressDashboard,
  getChannelPartnersDashboard,
  getRemindersDashboard,
  getDocumentStatusDashboard
} from '../controllers/dashboardController.js';

const router = express.Router();

// Master Dashboard Overview
router.get('/master-overview', protect, getMasterDashboard);

// Promoters Dashboard
router.get('/promoters', protect, getPromotersDashboard);

// Projects Dashboard
router.get('/projects', protect, getProjectsDashboard);

// Units Dashboard
router.get('/units', protect, getUnitsDashboard);

// Assignments Dashboard
router.get('/assignments', protect, getAssignmentsDashboard);

// Financial Dashboard
router.get('/financial', protect, getFinancialDashboard);

// Site Progress Dashboard
router.get('/site-progress', protect, getSiteProgressDashboard);

// Channel Partners Dashboard
router.get('/channel-partners', protect, getChannelPartnersDashboard);

// Reminders Dashboard
router.get('/reminders', protect, getRemindersDashboard);

// Document Status Dashboard
router.get('/document-status', protect, getDocumentStatusDashboard);

export default router;