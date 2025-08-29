import express from 'express';
import { protect } from '../middlewares/protect.js';
import { 
    getBatchDataByUserId,
    updateTelecallingStatus,
} from '../controllers/telecallingController.js';

const router = express.Router();

  router.get('/get-batch-data/:userId', protect, getBatchDataByUserId);

  router.put('/update-status/:recordId', protect, updateTelecallingStatus);

export default router;
