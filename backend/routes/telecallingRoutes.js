import express from 'express';
import { protect } from '../middlewares/protect.js';
import { 
    getBatchDataByUserId,
    updateTelecallingStatus,
    getLeadsByUser,
    updateLeadStatus,
} from '../controllers/telecallingController.js';

const router = express.Router();

  router.get('/get-batch-data/:userId', protect, getBatchDataByUserId);

  router.patch('/update-status/:recordId', protect, updateTelecallingStatus);

  router.get('/get-leads/:userId', protect, getLeadsByUser);

  router.patch('/update-lead-status/:leadId', protect, updateLeadStatus);

export default router;
