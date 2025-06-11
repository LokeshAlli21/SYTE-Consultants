// routes/bucketRoutes.js
import express from 'express';
import { 
  // Single bucket (rera-dev) functions
  getAllFiles,
  getFilesByCategory,
  getAllDocuments,
  getAllPhotos,
  getBucketStructure,
  getBucketStats,
  searchFiles,
  deleteFile,
  getFilesByFolder,
  getCategorySummary,
  getDocumentsBySubfolder,
  getPhotosByRole
} from '../controllers/bucketController.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// ===== MAIN BUCKET ROUTES (RERA-DEV) =====
router.get('/files', getAllFiles);                               // GET all files organized by categories with pagination
router.get('/files/category/:category', getFilesByCategory);     // GET files from specific category
router.get('/files/folder/:folderPath', getFilesByFolder);       // GET files from specific folder path

// ===== DOCUMENT ROUTES =====
router.get('/documents', getAllDocuments);                       // GET all documents with pagination
router.get('/documents/subfolder/:subfolder', getDocumentsBySubfolder); // GET documents from specific subfolder

// ===== PHOTO ROUTES =====
router.get('/photos', getAllPhotos);                             // GET all photos with pagination
router.get('/photos/role/:role', getPhotosByRole);               // GET photos from specific role/category

// ===== BUCKET INFORMATION ROUTES =====
router.get('/structure', getBucketStructure);                    // GET bucket structure and organization
router.get('/stats', getBucketStats);                            // GET bucket statistics (database + S3)
router.get('/categories', getCategorySummary);                   // GET category summary

// ===== SEARCH AND FILTER ROUTES =====
router.get('/search', searchFiles);                              // GET search results with filters

// ===== FILE MANAGEMENT ROUTES =====
router.delete('/file/:fileId', deleteFile);                      // DELETE file by ID (also accepts filePath in body)

export default router;