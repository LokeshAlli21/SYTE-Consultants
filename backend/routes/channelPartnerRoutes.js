import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createChannelPartner,
  getAllChannelPartners,
  softDeleteChannelPartnerById,
  getChannelPartnerById,
  updateChannelPartner,
  uploadChannelPartnerPhoto,
} from '../controllers/channelPartnerController.js';

import { upload } from '../aws/awsClient.js';

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

  router.post('/upload-photo', protect, upload.any(), uploadChannelPartnerPhoto);

  router.get('/get-all', protect, getAllChannelPartners);

  router.get('/get/:id', protect, getChannelPartnerById);

  router.delete('/delete/:id', protect, softDeleteChannelPartnerById);

export default router;
