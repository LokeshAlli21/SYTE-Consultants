import express from 'express';
import { protectPromoter } from '../middlewares/protect.js';
import { getChannelPartnerByPromoterId,
} from '../controllers/promoterFrontendController.js';
import { upload } from '../aws/awsClient.js'; 

const router = express.Router();

router.get('/get-cp-by-promoter/:promoterId', protectPromoter, getChannelPartnerByPromoterId);

export default router;
