import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createChannelPartner,
  getAllChannelPartners,
  softDeleteChannelPartnerById,
} from '../controllers/channelPartnerController.js';

const router = express.Router();

router.post(
    '/add',
    protect,
    createChannelPartner,
  );

  router.get('/get-all', protect, getAllChannelPartners);

  router.delete('/delete/:id', protect, softDeleteChannelPartnerById);

export default router;
