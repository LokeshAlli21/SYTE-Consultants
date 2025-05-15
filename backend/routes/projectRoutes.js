import express from 'express';
import { protect } from '../middlewares/protect.js';
import { uploadProjectFiles, 
    uploadProjectData, 
    getAllProjects,
    adddProjectProfessionals,
    uploadProjectProfessionalFiles,
    uploadUnitFiles,
    uploadProjectUnits,
    uploadDocumentFiles,
    uploadProjectDocuments,
    addBuildingProgress,
    addCommonAreasProgress,
    getAllUnitsForProject,
    softDeleteProjectById,
    softDeleteProjectUnitById,
    getAllEngineers,
    getAllArchitects,
    getAllCAs,
    getProjectProfessionalData,
    getSiteProgress,
    getDocuments,
    getProject,
    updateProjectData,
    getUnitById,
    updateProjectUnits,
    addEngineer,
    addArchitect,
    addCA,
} from '../controllers/projectController.js';
import {upload} from '../supabase/supabaseClient.js'

const router = express.Router();

router.post('/add-project', protect, uploadProjectData);

router.put('/update/:projectId', protect, updateProjectData);

router.get('/get-project/:id', protect, getProject);

router.post('/upload-files', protect, upload.any(), uploadProjectFiles);

router.get('/get-all', protect, getAllProjects);

router.get('/units/get-all', protect, getAllUnitsForProject);

router.get('/units/get-unit/:id', protect, getUnitById);

router.get('/engineers/get-all', protect, getAllEngineers);
router.get('/architects/get-all', protect, getAllArchitects);
router.get('/cas/get-all', protect, getAllCAs);

router.delete('/units/delete/:id', protect, softDeleteProjectUnitById);

router.post('/add-project-professionals', protect, adddProjectProfessionals);

router.post('/professional-details/add/engineer', protect, addEngineer);
router.post('/professional-details/add/architect', protect, addArchitect);
router.post('/professional-details/add/ca', protect, addCA);

router.get('/get-project-professionals/:id', protect, getProjectProfessionalData);

router.post('/professional-details/upload-files', protect, upload.any(), uploadProjectProfessionalFiles);

router.post('/unit-details/upload-files', protect, upload.any(), uploadUnitFiles);
router.post('/add-project-units', protect, uploadProjectUnits);

router.put('/update-project-units/:id', protect, updateProjectUnits);

router.get('/get-documents/:id', protect, getDocuments);

router.post('/documents/upload-files', protect, upload.any(), uploadDocumentFiles);
router.post('/add-project-documents', protect, uploadProjectDocuments);

router.get('/get-site-progress/:id', protect, getSiteProgress);

router.post('/add-building-progress', protect, addBuildingProgress);
router.post('/add-common-areas-progress', protect, addCommonAreasProgress);

router.delete('/delete/:id', protect, softDeleteProjectById);

export default router;
