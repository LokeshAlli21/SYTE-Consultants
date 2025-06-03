import express from 'express';
import { 
  createUser,
  getAllUsers, 
  getUserById,
  updateUser,
  softDeleteUser,
  restoreUser,
  searchUsers,
  getUserStats,
  blockUser,
  unblockUser
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

// User Status Management
router.patch('/users/:id/delete', softDeleteUser);    // SOFT DELETE - Mark user as deleted
router.patch('/users/:id/restore', restoreUser);      // RESTORE - Restore soft-deleted user
router.patch('/users/:id/block', blockUser);          // BLOCK - Block user (set status to blocked)
router.patch('/users/:id/unblock', unblockUser);      // UNBLOCK - Unblock user (set status to active)

export default router;