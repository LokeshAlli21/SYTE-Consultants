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
  getAssignmentTimeline,
  getAllPendingReminders,
  updateReminderStatus,
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

    router.patch(
      '/update-reminder-status',
      protect,
      updateReminderStatus
    );

  router.get('/get-all', protect, getAllAssignments);

  router.get('/get-all-pending-reminders', protect, getAllPendingReminders);

    router.get('/get/:id', protect, getAssignmentById);

    router.get('/timeline/:id', protect, getAssignmentTimeline);

  router.delete('/delete/:id', protect, softDeleteAssignmentById);

export default router;
