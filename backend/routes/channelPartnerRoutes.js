import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createChannelPartner,
  getAllChannelPartners,
  softDeleteChannelPartnerById,
  getChannelPartnerById,
  updateChannelPartner,
} from '../controllers/channelPartnerController.js';

const router = express.Router();

router.post(
    '/add',
    protect,
    createChannelPartner,
  );

  router.put(
    '/update/:id',
    protect,
    updateChannelPartner
  );
  

  router.get('/get-all', protect, getAllChannelPartners);

  router.get('/get/:id', protect, getChannelPartnerById);

  router.delete('/delete/:id', protect, softDeleteChannelPartnerById);

export default router;
