import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createNewAssignment,
  getAllAssignments,
} from '../controllers/assignmentController.js';

const router = express.Router();

router.post(
    '/add',
    protect,
    createNewAssignment,
  );

  router.get('/get-all', protect, getAllAssignments);

export default router;
