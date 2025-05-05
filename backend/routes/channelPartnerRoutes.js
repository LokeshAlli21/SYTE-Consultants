import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createChannelPartner,
} from '../controllers/channelPartnerController.js';

const router = express.Router();

router.post(
    '/add',
    protect,
    createChannelPartner,
  );

export default router;
