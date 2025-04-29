import express from 'express';
import { protect } from '../middlewares/protect.js';
import { uploadPromoterData, uploadPromoterFiles, getAllPromoters} from '../controllers/promoterController.js';
import {upload} from '../supabase/supabaseClient.js'

const router = express.Router();

router.post(
    '/add-promoter',
    protect,
    uploadPromoterData,
  );

// Accept any fields ending with "_uploaded_url"
router.post('/upload-files', protect, upload.any(), uploadPromoterFiles);

router.get('/get-all', protect, getAllPromoters);

export default router;
