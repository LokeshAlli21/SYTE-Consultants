import express from 'express';
import { 
  createUser,
  getAllUsers, 
  getUserById,
  updateUser,
  softDeleteUser,
  restoreUser,
  searchUsers,
  getUserStats
} from '../controllers/adminController.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// User CRUD Operations
router.post('/users', createUser);                    // CREATE - Add new user
router.get('/users', getAllUsers);                    // READ - Get all users with pagination
router.get('/users/search', searchUsers);             // SEARCH - Search users by name/email
router.get('/users/stats', getUserStats);             // STATS - Get user statistics
router.get('/users/:id', getUserById);                // READ - Get specific user by ID
router.put('/users/:id', updateUser);                 // UPDATE - Update user by ID
router.patch('/users/:id/delete', softDeleteUser);    // SOFT DELETE - Mark user as deleted
router.patch('/users/:id/restore', restoreUser);      // RESTORE - Restore soft-deleted user

export default router;