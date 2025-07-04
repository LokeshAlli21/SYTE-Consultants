import express from 'express';
import { protectPromoter } from '../middlewares/protect.js';
import { getChannelPartnerByPromoterId,
    getPromoterProjects,
} from '../controllers/promoterFrontendController.js';
import { upload } from '../aws/awsClient.js'; 

const router = express.Router();

router.get('/get-cp-by-promoter/:promoterId', protectPromoter, getChannelPartnerByPromoterId);

router.get('/get-projects-by-promoter/:promoterId', protectPromoter, getPromoterProjects);

export default router;
