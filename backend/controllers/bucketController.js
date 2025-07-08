// bucketController.js
import {
  upload,
  uploadToS3,
  deleteFromS3,
  moveFileInS3,
  listS3Files,
  getSignedUrl,
  getFileMetadata,
  listFilesInFolder,
  getFolderStructure,
  downloadFromS3,
  fileExists,
  generatePresignedUrl,
  copyFile,
  moveFile,
  createFolder,
  deleteFolder,
  deleteMultipleFiles,
  searchFiles,
  uploadMultipleFiles,
  uploadWithProgress,
  getBucketInfo,
  getFolderSize,
  formatBytes,
  generateUniqueFileName,
  validateFileType,
  bucketName
} from '../aws/awsClient.js';

// ========================
// SINGLE FILE OPERATIONS
// ========================

/**
 * Upload a single file to S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { folder } = req.body;
    const uniqueKey = generateUniqueFileName(req.file.originalname);
    
    const result = await uploadToS3(req.file, uniqueKey, folder);
    
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

/**
 * Upload multiple files to S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadMultipleFilesController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const { folder } = req.body;
    const result = await uploadMultipleFiles(req.files, folder);
    
    res.status(201).json({
      success: true,
      message: `${result.totalUploaded} files uploaded successfully`,
      data: result
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Multiple file upload failed',
      error: error.message
    });
  }
};

/**
 * Upload file with progress tracking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadWithProgressController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { folder } = req.body;
    const uniqueKey = generateUniqueFileName(req.file.originalname);
    
    const result = await uploadWithProgress(
      req.file,
      uniqueKey,
      folder,
      (percentage, loaded, total) => {
        console.log(`Upload progress: ${percentage}% (${loaded}/${total} bytes)`);
      }
    );
    
    res.status(201).json({
      success: true,
      message: 'File uploaded with progress tracking',
      data: result
    });
  } catch (error) {
    console.error('Upload with progress error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload with progress failed',
      error: error.message
    });
  }
};

/**
 * Delete a single file from S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteFile = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    const exists = await fileExists(key);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    await deleteFromS3(key);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
};

/**
 * Delete multiple files from S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteMultipleFilesController = async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keys array is required'
      });
    }

    const result = await deleteMultipleFiles(keys);
    
    res.status(200).json({
      success: true,
      message: `${result.deleted.length} files deleted successfully`,
      data: result
    });
  } catch (error) {
    console.error('Multiple delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Multiple file deletion failed',
      error: error.message
    });
  }
};

/**
 * Download a file from S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const downloadFile = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    const exists = await fileExists(key);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = await downloadFromS3(key);
    
    res.set({
      'Content-Type': file.contentType,
      'Content-Length': file.size,
      'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`
    });
    
    res.send(file.buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'File download failed',
      error: error.message
    });
  }
};

/**
 * Get file metadata
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getFileMetadataController = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    const exists = await fileExists(key);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const metadata = await getFileMetadata(key);
    
    res.status(200).json({
      success: true,
      message: 'File metadata retrieved successfully',
      data: metadata
    });
  } catch (error) {
    console.error('Metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file metadata',
      error: error.message
    });
  }
};

/**
 * Get signed URL for file access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSignedUrlController = async (req, res) => {
  try {
    const { key } = req.params;
    const { expires = 3600 } = req.query;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    const exists = await fileExists(key);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const signedUrl = getSignedUrl(key, parseInt(expires));
    
    res.status(200).json({
      success: true,
      message: 'Signed URL generated successfully',
      data: {
        url: signedUrl,
        expires: expires,
        key: key
      }
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed URL',
      error: error.message
    });
  }
};

/**
 * Generate presigned URL for file download
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generatePresignedUrlController = async (req, res) => {
  try {
    const { key } = req.params;
    const { expiresIn = 3600 } = req.query;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    const exists = await fileExists(key);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const url = await generatePresignedUrl(key, parseInt(expiresIn));
    
    res.status(200).json({
      success: true,
      message: 'Presigned URL generated successfully',
      data: {
        url: url,
        expiresIn: expiresIn,
        key: key
      }
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate presigned URL',
      error: error.message
    });
  }
};

// ========================
// FILE OPERATIONS
// ========================

/**
 * Copy a file within S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const copyFileController = async (req, res) => {
  try {
    const { sourceKey, destinationKey } = req.body;
    
    if (!sourceKey || !destinationKey) {
      return res.status(400).json({
        success: false,
        message: 'Source key and destination key are required'
      });
    }

    const exists = await fileExists(sourceKey);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Source file not found'
      });
    }

    await copyFile(sourceKey, destinationKey);
    
    res.status(200).json({
      success: true,
      message: 'File copied successfully',
      data: {
        sourceKey,
        destinationKey
      }
    });
  } catch (error) {
    console.error('Copy error:', error);
    res.status(500).json({
      success: false,
      message: 'File copy failed',
      error: error.message
    });
  }
};

/**
 * Move a file within S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const moveFileController = async (req, res) => {
  try {
    const { sourceKey, destinationKey } = req.body;
    
    if (!sourceKey || !destinationKey) {
      return res.status(400).json({
        success: false,
        message: 'Source key and destination key are required'
      });
    }

    const exists = await fileExists(sourceKey);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Source file not found'
      });
    }

    await moveFile(sourceKey, destinationKey);
    
    res.status(200).json({
      success: true,
      message: 'File moved successfully',
      data: {
        sourceKey,
        destinationKey
      }
    });
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({
      success: false,
      message: 'File move failed',
      error: error.message
    });
  }
};

/**
 * Check if file exists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkFileExists = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    const exists = await fileExists(key);
    
    res.status(200).json({
      success: true,
      message: 'File existence check completed',
      data: {
        key,
        exists
      }
    });
  } catch (error) {
    console.error('File exists check error:', error);
    res.status(500).json({
      success: false,
      message: 'File existence check failed',
      error: error.message
    });
  }
};

// ========================
// FOLDER OPERATIONS
// ========================

/**
 * Create a folder in S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createFolderController = async (req, res) => {
  try {
    const { folderPath } = req.body;
    
    if (!folderPath) {
      return res.status(400).json({
        success: false,
        message: 'Folder path is required'
      });
    }

    await createFolder(folderPath);
    
    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: {
        folderPath
      }
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Folder creation failed',
      error: error.message
    });
  }
};

/**
 * Delete a folder and all its contents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteFolderController = async (req, res) => {
  try {
    const { folderPath } = req.params;
    
    if (!folderPath) {
      return res.status(400).json({
        success: false,
        message: 'Folder path is required'
      });
    }

    await deleteFolder(folderPath);
    
    res.status(200).json({
      success: true,
      message: 'Folder deleted successfully',
      data: {
        folderPath
      }
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Folder deletion failed',
      error: error.message
    });
  }
};

/**
 * Get folder structure
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getFolderStructureController = async (req, res) => {
  try {
    const { prefix = '' } = req.query;
    
    const folders = await getFolderStructure(prefix);
    
    res.status(200).json({
      success: true,
      message: 'Folder structure retrieved successfully',
      data: {
        prefix,
        folders
      }
    });
  } catch (error) {
    console.error('Folder structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get folder structure',
      error: error.message
    });
  }
};

/**
 * Get folder size
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getFolderSizeController = async (req, res) => {
  try {
    const { folderPath } = req.params;
    
    if (!folderPath) {
      return res.status(400).json({
        success: false,
        message: 'Folder path is required'
      });
    }

    const sizeInfo = await getFolderSize(folderPath);
    
    res.status(200).json({
      success: true,
      message: 'Folder size retrieved successfully',
      data: sizeInfo
    });
  } catch (error) {
    console.error('Folder size error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get folder size',
      error: error.message
    });
  }
};

// ========================
// LISTING OPERATIONS
// ========================

/**
 * List all files in S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const listFiles = async (req, res) => {
  try {
    const { prefix = '', maxKeys = 1000 } = req.query;
    
    const files = await listS3Files(prefix, parseInt(maxKeys));
    
    res.status(200).json({
      success: true,
      message: 'Files listed successfully',
      data: {
        files,
        count: files.length,
        prefix
      }
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: error.message
    });
  }
};

/**
 * List files in a specific folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const listFilesInFolderController = async (req, res) => {
  try {
    let { folder = '' } = req.params;
    if(folder === 'root'){
      folder = ''
    }
    const { maxKeys = 1000, continuationToken = null } = req.query;
    
    const result = await listFilesInFolder(folder, parseInt(maxKeys), continuationToken);
    // console.log(result)
    
    res.status(200).json({
      success: true,
      message: 'Folder files listed successfully',
      data: result
    });
  } catch (error) {
    console.error('List folder files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list folder files',
      error: error.message
    });
  }
};

// ========================
// SEARCH OPERATIONS
// ========================

/**
 * Search files by name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchFilesController = async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { folder = '' } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const files = await searchFiles(searchTerm, folder);
    
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: {
        searchTerm,
        folder,
        files,
        count: files.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// ========================
// ANALYTICS OPERATIONS
// ========================

/**
 * Get bucket information and analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBucketInfoController = async (req, res) => {
  try {
    const bucketInfo = await getBucketInfo();
    
    res.status(200).json({
      success: true,
      message: 'Bucket information retrieved successfully',
      data: bucketInfo
    });
  } catch (error) {
    console.error('Bucket info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bucket information',
      error: error.message
    });
  }
};

// ========================
// UTILITY OPERATIONS
// ========================

/**
 * Validate file type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const validateFileTypeController = async (req, res) => {
  try {
    const { mimetype } = req.body;
    const { allowedTypes = [] } = req.body;
    
    if (!mimetype) {
      return res.status(400).json({
        success: false,
        message: 'Mimetype is required'
      });
    }

    const isValid = validateFileType(mimetype, allowedTypes);
    
    res.status(200).json({
      success: true,
      message: 'File type validation completed',
      data: {
        mimetype,
        isValid,
        allowedTypes
      }
    });
  } catch (error) {
    console.error('File type validation error:', error);
    res.status(500).json({
      success: false,
      message: 'File type validation failed',
      error: error.message
    });
  }
};

/**
 * Generate unique filename
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateUniqueFileNameController = async (req, res) => {
  try {
    const { originalName } = req.body;
    
    if (!originalName) {
      return res.status(400).json({
        success: false,
        message: 'Original filename is required'
      });
    }

    const uniqueName = generateUniqueFileName(originalName);
    
    res.status(200).json({
      success: true,
      message: 'Unique filename generated successfully',
      data: {
        originalName,
        uniqueName
      }
    });
  } catch (error) {
    console.error('Generate unique filename error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate unique filename',
      error: error.message
    });
  }
};

/**
 * Format bytes to human readable format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const formatBytesController = async (req, res) => {
  try {
    const { bytes } = req.body;
    const { decimals = 2 } = req.body;
    
    if (bytes === undefined || bytes === null) {
      return res.status(400).json({
        success: false,
        message: 'Bytes value is required'
      });
    }

    const formatted = formatBytes(parseInt(bytes), decimals);
    
    res.status(200).json({
      success: true,
      message: 'Bytes formatted successfully',
      data: {
        originalBytes: bytes,
        formatted,
        decimals
      }
    });
  } catch (error) {
    console.error('Format bytes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to format bytes',
      error: error.message
    });
  }
};

// ========================
// HEALTH CHECK
// ========================

/**
 * Health check endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const healthCheck = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'S3 Bucket Controller is healthy',
      timestamp: new Date().toISOString(),
      bucketName: bucketName
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};

// Export multer upload middleware
export { upload };

// Export all controller functions
export default {
  // Single file operations
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
  
  // Multer middleware
  upload
};