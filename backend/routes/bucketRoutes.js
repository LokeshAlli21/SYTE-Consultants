// routes/bucketRoutes.js
import express from 'express';
import { 
  // Uploaded Documents functions
  getAllFiles,
  getFilesByFolder,

  // User Profile Photos functions
  getAllUserPhotos,
  getUserPhotosByRole,
  
  // Combined Bucket functions
  getAllBucketsStructure,
  getBucketStats,
  deleteFile
} from '../controllers/bucketController.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// ===== UPLOADED DOCUMENTS ROUTES =====
router.get('/documents', getAllFiles);                           // GET all project files organized by folders
router.get('/documents/folder/:folderPath', getFilesByFolder);   // GET files from specific folder (supports nested paths with encoded slashes)

// ===== USER PROFILE PHOTOS ROUTES =====
router.get('/photos', getAllUserPhotos);                         // GET all user photos organized by roles
router.get('/photos/role/:role', getUserPhotosByRole);           // GET photos from specific role folder

// ===== COMBINED BUCKET ROUTES =====
router.get('/structure', getAllBucketsStructure);                // GET complete folder structure for both buckets
router.get('/stats', getBucketStats);                            // GET statistics for both buckets

// ===== FILE MANAGEMENT ROUTES =====
router.delete('/file/:bucket/:filePath', deleteFile);            // DELETE file from any bucket (supports encoded paths)

export default router;