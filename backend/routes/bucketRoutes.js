// routes/bucketRoutes.js
import express from 'express';
import { 
  uploadSingleFile,
  uploadMultipleFilesController,
  uploadWithProgressController,
  deleteFile,
  deleteMultipleFilesController,
  downloadFile,
  getFileMetadataController,
  getSignedUrlController,
  generatePresignedUrlController,
  
  // File operations
  copyFileController,
  moveFileController,
  checkFileExists,
  
  // Folder operations
  createFolderController,
  deleteFolderController,
  getFolderStructureController,
  getFolderSizeController,
  
  // Listing operations
  listFiles,
  listFilesInFolderController,
  
  // Search operations
  searchFilesController,
  
  // Analytics operations
  getBucketInfoController,
  
  // Utility operations
  validateFileTypeController,
  generateUniqueFileNameController,
  formatBytesController,
  
  // Health check
  healthCheck,
  upload,
} from '../controllers/bucketController.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// ========================
// HEALTH CHECK
// ========================
router.get('/health', healthCheck);

// ========================
// SINGLE FILE OPERATIONS
// ========================

/**
 * @route POST /api/bucket/upload/single
 * @desc Upload a single file to S3
 * @access Protected
 */
router.post(
  '/upload/single',
  protect,
  upload.single('file'),
  uploadSingleFile
);

/**
 * @route POST /api/bucket/upload/multiple
 * @desc Upload multiple files to S3
 * @access Protected
 */
router.post(
  '/upload/multiple',
  protect,
  upload.array('files', 10), // Max 10 files
  uploadMultipleFilesController
);

/**
 * @route POST /api/bucket/upload/progress
 * @desc Upload file with progress tracking
 * @access Protected
 */
router.post(
  '/upload/progress',
  protect,
  upload.single('file'),
  uploadWithProgressController
);

/**
 * @route DELETE /api/bucket/files/:key
 * @desc Delete a single file from S3
 * @access Protected
 */
router.delete(
  '/files/:key',
  protect,
  deleteFile
);

/**
 * @route DELETE /api/bucket/files/bulk
 * @desc Delete multiple files from S3
 * @access Protected
 */
router.delete(
  '/files/bulk',
  protect,
  deleteMultipleFilesController
);

/**
 * @route GET /api/bucket/files/:key/download
 * @desc Download a file from S3
 * @access Protected
 */
router.get(
  '/files/:key/download',
  protect,
  downloadFile
);

/**
 * @route GET /api/bucket/files/:key/metadata
 * @desc Get file metadata
 * @access Protected
 */
router.get(
  '/files/:key/metadata',
  protect,
  getFileMetadataController
);

/**
 * @route GET /api/bucket/files/:key/signed-url
 * @desc Get signed URL for file access
 * @access Protected
 */
router.get(
  '/files/:key/signed-url',
  protect,
  getSignedUrlController
);

/**
 * @route GET /api/bucket/files/:key/presigned-url
 * @desc Generate presigned URL for file download
 * @access Protected
 */
router.get(
  '/files/:key/presigned-url',
  protect,
  generatePresignedUrlController
);

// ========================
// FILE OPERATIONS
// ========================

/**
 * @route POST /api/bucket/files/copy
 * @desc Copy a file within S3
 * @access Protected
 */
router.post(
  '/files/copy',
  protect,
  copyFileController
);

/**
 * @route POST /api/bucket/files/move
 * @desc Move a file within S3
 * @access Protected
 */
router.post(
  '/files/move',
  protect,
  moveFileController
);

/**
 * @route GET /api/bucket/files/:key/exists
 * @desc Check if file exists
 * @access Protected
 */
router.get(
  '/files/:key/exists',
  protect,
  checkFileExists
);

// ========================
// FOLDER OPERATIONS
// ========================

/**
 * @route POST /api/bucket/folders
 * @desc Create a folder in S3
 * @access Protected
 */
router.post(
  '/folders',
  protect,
  createFolderController
);

/**
 * @route DELETE /api/bucket/folders/:folderPath
 * @desc Delete a folder and all its contents
 * @access Protected
 */
router.delete(
  '/folders/:folderPath',
  protect,
  deleteFolderController
);

/**
 * @route GET /api/bucket/folders/structure
 * @desc Get folder structure
 * @access Protected
 */
router.get(
  '/folders/structure',
  protect,
  getFolderStructureController
);

/**
 * @route GET /api/bucket/folders/:folderPath/size
 * @desc Get folder size
 * @access Protected
 */
router.get(
  '/folders/:folderPath/size',
  protect,
  getFolderSizeController
);

// ========================
// LISTING OPERATIONS
// ========================

/**
 * @route GET /api/bucket/files
 * @desc List all files in S3
 * @access Protected
 */
router.get(
  '/files',
  protect,
  listFiles
);

/**
 * @route GET /api/bucket/folders/:folder/files
 * @desc List files in a specific folder
 * @access Protected
 */
router.get(
  '/folders/:folder/files',
  protect,
  listFilesInFolderController
);

/**
 * @route GET /api/bucket/folders/root/files
 * @desc List files in root folder
 * @access Protected
 */
router.get(
  '/folders/root/files',
  protect,
  (req, res, next) => {
    req.params.folder = '';
    next();
  },
  listFilesInFolderController
);

// ========================
// SEARCH OPERATIONS
// ========================

/**
 * @route GET /api/bucket/search/:searchTerm
 * @desc Search files by name
 * @access Protected
 */
router.get(
  '/search/:searchTerm',
  protect,
  searchFilesController
);

// ========================
// ANALYTICS OPERATIONS
// ========================

/**
 * @route GET /api/bucket/analytics
 * @desc Get bucket information and analytics
 * @access Protected
 */
router.get(
  '/analytics',
  protect,
  getBucketInfoController
);

// ========================
// UTILITY OPERATIONS
// ========================

/**
 * @route POST /api/bucket/utils/validate-file-type
 * @desc Validate file type
 * @access Protected
 */
router.post(
  '/utils/validate-file-type',
  protect,
  validateFileTypeController
);

/**
 * @route POST /api/bucket/utils/generate-unique-filename
 * @desc Generate unique filename
 * @access Protected
 */
router.post(
  '/utils/generate-unique-filename',
  protect,
  generateUniqueFileNameController
);

/**
 * @route POST /api/bucket/utils/format-bytes
 * @desc Format bytes to human readable format
 * @access Protected
 */
router.post(
  '/utils/format-bytes',
  protect,
  formatBytesController
);

// ========================
// ADVANCED UPLOAD ROUTES
// ========================

/**
 * @route POST /api/bucket/upload/any
 * @desc Upload files with any field names (similar to your channel partner example)
 * @access Protected
 */
router.post(
  '/upload/any',
  protect,
  upload.any(),
  uploadMultipleFilesController
);

/**
 * @route POST /api/bucket/upload/fields
 * @desc Upload files with specific field names
 * @access Protected
 */
router.post(
  '/upload/fields',
  protect,
  upload.fields([
    { name: 'documents', maxCount: 5 },
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 3 }
  ]),
  (req, res, next) => {
    // Transform req.files object to array for the controller
    const files = [];
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        files.push(...req.files[fieldName]);
      });
    }
    req.files = files;
    next();
  },
  uploadMultipleFilesController
);

// ========================
// BATCH OPERATIONS
// ========================

/**
 * @route POST /api/bucket/batch/upload
 * @desc Batch upload with folder organization
 * @access Protected
 */
router.post(
  '/batch/upload',
  protect,
  upload.array('files', 50), // Max 50 files for batch
  uploadMultipleFilesController
);

/**
 * @route POST /api/bucket/batch/delete
 * @desc Batch delete files
 * @access Protected
 */
router.post(
  '/batch/delete',
  protect,
  deleteMultipleFilesController
);

// ========================
// ADMIN ROUTES (Optional - Add additional protection if needed)
// ========================

/**
 * @route GET /api/bucket/admin/bucket-info
 * @desc Get comprehensive bucket information (Admin only)
 * @access Protected + Admin
 */
router.get(
  '/admin/bucket-info',
  protect,
  // Add admin middleware here if you have one
  getBucketInfoController
);

/**
 * @route DELETE /api/bucket/admin/cleanup
 * @desc Clean up empty folders (Admin only)
 * @access Protected + Admin
 */
router.delete(
  '/admin/cleanup',
  protect,
  // Add admin middleware here if you have one
  async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Cleanup functionality can be implemented here'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Cleanup failed',
        error: error.message
      });
    }
  }
);

// ========================
// ERROR HANDLING MIDDLEWARE
// ========================

// Handle multer errors
router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 50MB.'
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.'
    });
  }
  
  if (error.message && error.message.includes('File type not supported')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

export default router;