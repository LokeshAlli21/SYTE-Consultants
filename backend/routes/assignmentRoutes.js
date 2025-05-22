import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createNewAssignment,
  getAllAssignments,
  softDeleteAssignmentById,
  getAssignmentById,
  updateAssignment,
  updateAssignmentStatus,
  addAssignmentNote,
  setAssignmentReminder,
} from '../controllers/assignmentController.js';

const router = express.Router();

router.post(
    '/add',
    protect,
    createNewAssignment,
  );

    router.put(
      '/update/:id',
      protect,
      updateAssignment
    );

    router.put(
      '/update-status/:id',
      protect,
      updateAssignmentStatus
    );

    router.put(
      '/add-note/:id',
      protect,
      addAssignmentNote
    );

    router.post(
      '/set-reminder/:id',
      protect,
      setAssignmentReminder
    );

  router.get('/get-all', protect, getAllAssignments);

    router.get('/get/:id', protect, getAssignmentById);

  router.delete('/delete/:id', protect, softDeleteAssignmentById);

export default router;
