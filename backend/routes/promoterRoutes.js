import express from 'express';
import { protect } from '../middlewares/protect.js';
import { uploadPromoterData, uploadPromoterFiles, getAllPromoters, softDeletePromoterById, getPromoterById,
  updatePromoter,
  checkUsernameAvailability,
} from '../controllers/promoterController.js';
import { upload } from '../aws/awsClient.js'; // Changed from supabase to awsClient

const router = express.Router();

router.post(
    '/add-promoter',
    protect,
    uploadPromoterData,
  );

router.put(
    '/update/:id',
    protect,
    updatePromoter
  );

// Accept any fields ending with "_uploaded_url"
router.post('/upload-files', protect, upload.any(), uploadPromoterFiles);

router.get('/get-all', protect, getAllPromoters);

router.get('/get/:id', protect, getPromoterById);

router.get('/check-username/:username', protect, checkUsernameAvailability);

router.delete('/delete/:id', protect, softDeletePromoterById);

export default router;