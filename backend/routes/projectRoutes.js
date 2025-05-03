import express from 'express';
import { protect } from '../middlewares/protect.js';
import { uploadProjectFiles, 
    uploadProjectData, 
    getAllProjects,
    uploadProjectProfessionalData,
    uploadProjectProfessionalFiles,
    uploadUnitFiles,
    uploadProjectUnits,
    uploadDocumentFiles,
    uploadProjectDocuments,
    addBuildingProgress,
    addCommonAreasProgress,
} from '../controllers/projectController.js';
import {upload} from '../supabase/supabaseClient.js'

const router = express.Router();

router.post('/add-project', protect, uploadProjectData);
router.post('/upload-files', protect, upload.any(), uploadProjectFiles);

router.get('/get-all', protect, getAllProjects);

router.post('/add-project-professionals', protect, uploadProjectProfessionalData);
router.post('/professional-details/upload-files', protect, upload.any(), uploadProjectProfessionalFiles);

router.post('/unit-details/upload-files', protect, upload.any(), uploadUnitFiles);
router.post('/add-project-units', protect, uploadProjectUnits);
router.post('/documents/upload-files', protect, upload.any(), uploadDocumentFiles);
router.post('/add-project-documents', protect, uploadProjectDocuments);
router.post('/add-building-progress', protect, addBuildingProgress);
router.post('/add-common-areas-progress', protect, addCommonAreasProgress);

export default router;
