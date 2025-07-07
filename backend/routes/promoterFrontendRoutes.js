import express from 'express';
import { protectPromoter } from '../middlewares/protect.js';
import { getChannelPartnerByPromoterId,
    getPromoterProjects,
    getProjectById,
    getProjectDocuments,
    getProjectUnits,
    getProjectUnitById,
} from '../controllers/promoterFrontendController.js';
import { upload } from '../aws/awsClient.js'; 

const router = express.Router();

router.get('/get-cp-by-promoter/:promoterId', protectPromoter, getChannelPartnerByPromoterId);

router.get('/get-projects-by-promoter/:promoterId', protectPromoter, getPromoterProjects);

router.get('/get-project/:projectId', protectPromoter, getProjectById);

router.get('/get-project-documents/:projectId', protectPromoter, getProjectDocuments);

router.get('/get-project-units/:projectId', protectPromoter, getProjectUnits);

router.get('/get-project-unit/:id', protectPromoter, getProjectUnitById);

export default router;
