import express from 'express';
import { 
  createUser,
  getAllUsers, 
  getUserById,
  updateUser,
  changeUserPassword,
  softDeleteUser,
  restoreUser,
  searchUsers,
  getUserStats,
  blockUser,
  unblockUser,
  uploadUserPhoto,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/protect.js';
import { upload } from '../aws/awsClient.js'; // Changed from supabase to awsClient

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

router.post('/users/upload-photo', upload.any(), uploadUserPhoto);  // UPLOAD - Upload user photo

router.put('/users/:id/password', changeUserPassword);  // UPDATE - Change user password by ID

// User Status Management
router.patch('/users/:id/delete', softDeleteUser);    // SOFT DELETE - Mark user as deleted
router.patch('/users/:id/restore', restoreUser);      // RESTORE - Restore soft-deleted user
router.patch('/users/:id/block', blockUser);          // BLOCK - Block user (set status to blocked)
router.patch('/users/:id/unblock', unblockUser);      // UNBLOCK - Unblock user (set status to active)

export default router;