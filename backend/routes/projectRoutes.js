import express from 'express';
import { protect } from '../middlewares/protect.js';
import { uploadProjectFiles, 
    uploadProjectData, 
    getAllProjects,
    uploadProjectProfessionalData,
    uploadProjectProfessionalFiles,
} from '../controllers/projectController.js';
import {upload} from '../supabase/supabaseClient.js'

const router = express.Router();

router.post('/add-project', protect, uploadProjectData);
router.post('/upload-files', protect, upload.any(), uploadProjectFiles);

router.get('/get-all', protect, getAllProjects);

router.post('/add-project-professionals', protect, uploadProjectProfessionalData);
router.post('/professional-details/upload-files', protect, upload.any(), uploadProjectProfessionalFiles);

// router.get('/get/:id', protect, getPromoterById);

// router.delete('/delete/:id', protect, softDeletePromoterById);

export default router;
