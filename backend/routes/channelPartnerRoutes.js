import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createChannelPartner,
  getAllChannelPartners,
} from '../controllers/channelPartnerController.js';

const router = express.Router();

router.post(
    '/add',
    protect,
    createChannelPartner,
  );

  router.get('/get-all', protect, getAllChannelPartners);

export default router;
