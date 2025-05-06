import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createNewAssignment,
  getAllAssignments,
  softDeleteAssignmentById,
} from '../controllers/assignmentController.js';

const router = express.Router();

router.post(
    '/add',
    protect,
    createNewAssignment,
  );

  router.get('/get-all', protect, getAllAssignments);

  router.delete('/delete/:id', protect, softDeleteAssignmentById);

export default router;
