// bucketController.js - Updated for single S3 bucket (rera-dev)
import { query, db, listS3Files, deleteFromS3, getBucketStats as getS3Stats } from '../aws/awsClient.js';

// ===== SINGLE BUCKET FUNCTIONS - RERA-DEV =====

// Get all files from rera-dev bucket organized by categories
export const getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 100, category = null, folder = null } = req.query;
    
    // Use the paginated function from the database
    const filesResult = await query(
      'SELECT * FROM get_rera_dev_files_paginated($1, $2, $3, $4)',
      [parseInt(page), parseInt(limit), category, folder]
    );
    
    const allFiles = filesResult.rows;
    const totalFiles = allFiles.length > 0 ? parseInt(allFiles[0].total_count) : 0;

    // Get category summary for organization
    const categorySummaryResult = await query('SELECT * FROM rera_dev_category_summary');
    const categorySummary = categorySummaryResult.rows;

    // Organize files by category
    const organizedFiles = {};
    
    // Group files by category
    allFiles.forEach(file => {
      const cat = file.category || 'root';
      if (!organizedFiles[cat]) {
        organizedFiles[cat] = [];
      }
      organizedFiles[cat].push({
        id: file.id,
        name: file.name,
        fullPath: file.folder_path ? `${file.folder_path}/${file.name}`.replace(/^\//, '') : file.name,
        category: file.category,
        folderPath: file.folder_path,
        size: parseInt(file.size) || 0,
        lastModified: file.updated_at || file.created_at,
        mimeType: file.mime_type,
        publicUrl: file.public_url,
        bucket: 'rera-dev',
        level: file.depth_level
      });
    });

    // Create category breakdown from summary
    const categoryBreakdown = {};
    categorySummary.forEach(cat => {
      categoryBreakdown[cat.category_name] = {
        fileCount: cat.file_count,
        totalSize: cat.total_size,
        originalFolder: cat.original_folder,
        mimeTypes: cat.mime_types,
        subfolders: cat.subfolders || []
      };
    });

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      totalFiles: totalFiles,
      organizedByCategory: organizedFiles,
      allFiles: allFiles.map(file => ({
        id: file.id,
        name: file.name,
        fullPath: file.folder_path ? `${file.folder_path}/${file.name}`.replace(/^\//, '') : file.name,
        category: file.category,
        folderPath: file.folder_path,
        size: parseInt(file.size) || 0,
        lastModified: file.updated_at || file.created_at,
        mimeType: file.mime_type,
        publicUrl: file.public_url,
        bucket: 'rera-dev',
        level: file.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allFiles.length === parseInt(limit),
        totalPages: Math.ceil(totalFiles / parseInt(limit))
      },
      summary: {
        totalCategories: categorySummary.length,
        categoryBreakdown: categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Unexpected error in getAllFiles:', error);
    return res.status(500).json({ error: 'Server error while fetching files' });
  }
};

// Get files from specific category in rera-dev bucket
export const getFilesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 50, folder = null } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Use the paginated function with category filter
    const filesResult = await query(
      'SELECT * FROM get_rera_dev_files_paginated($1, $2, $3, $4)',
      [parseInt(page), parseInt(limit), category, folder]
    );
    
    const allFiles = filesResult.rows;
    const totalFiles = allFiles.length > 0 ? parseInt(allFiles[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      category: category,
      totalFiles: totalFiles,
      files: allFiles.map(file => ({
        id: file.id,
        name: file.name,
        fullPath: file.folder_path ? `${file.folder_path}/${file.name}`.replace(/^\//, '') : file.name,
        category: file.category,
        folderPath: file.folder_path,
        size: parseInt(file.size) || 0,
        lastModified: file.updated_at || file.created_at,
        mimeType: file.mime_type,
        publicUrl: file.public_url,
        bucket: 'rera-dev',
        level: file.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allFiles.length === parseInt(limit),
        totalPages: Math.ceil(totalFiles / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Unexpected error in getFilesByCategory:', error);
    return res.status(500).json({ error: 'Server error while fetching category files' });
  }
};

// Get documents specifically from rera-dev bucket
export const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 100, subfolder = null } = req.query;
    
    // Use the documents paginated function
    const documentsResult = await query(
      'SELECT * FROM get_rera_dev_documents_paginated($1, $2, $3)',
      [parseInt(page), parseInt(limit), subfolder]
    );
    
    const allDocuments = documentsResult.rows;
    const totalDocuments = allDocuments.length > 0 ? parseInt(allDocuments[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      category: 'documents',
      totalDocuments: totalDocuments,
      documents: allDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        fullPath: doc.folder_path ? `${doc.folder_path}/${doc.name}`.replace(/^\//, '') : doc.name,
        mainFolder: doc.main_folder,
        subFolder: doc.sub_folder,
        folderPath: doc.folder_path,
        size: parseInt(doc.size) || 0,
        lastModified: doc.updated_at || doc.created_at,
        mimeType: doc.mime_type,
        publicUrl: doc.public_url,
        bucket: 'rera-dev',
        level: doc.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allDocuments.length === parseInt(limit),
        totalPages: Math.ceil(totalDocuments / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Unexpected error in getAllDocuments:', error);
    return res.status(500).json({ error: 'Server error while fetching documents' });
  }
};

// Get photos specifically from rera-dev bucket
export const getAllPhotos = async (req, res) => {
  try {
    const { page = 1, limit = 100, role = null } = req.query;
    
    // Use the photos paginated function
    const photosResult = await query(
      'SELECT * FROM get_rera_dev_photos_paginated($1, $2, $3)',
      [parseInt(page), parseInt(limit), role]
    );
    
    const allPhotos = photosResult.rows;
    const totalPhotos = allPhotos.length > 0 ? parseInt(allPhotos[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      category: 'photos',
      totalPhotos: totalPhotos,
      photos: allPhotos.map(photo => ({
        id: photo.id,
        name: photo.name,
        fullPath: photo.folder_path ? `${photo.folder_path}/${photo.name}`.replace(/^\//, '') : photo.name,
        mainFolder: photo.main_folder,
        roleOrCategory: photo.role_or_category,
        folderPath: photo.folder_path,
        size: parseInt(photo.size) || 0,
        lastModified: photo.updated_at || photo.created_at,
        mimeType: photo.mime_type,
        publicUrl: photo.public_url,
        bucket: 'rera-dev',
        level: photo.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allPhotos.length === parseInt(limit),
        totalPages: Math.ceil(totalPhotos / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Unexpected error in getAllPhotos:', error);
    return res.status(500).json({ error: 'Server error while fetching photos' });
  }
};

// Get bucket structure and statistics
export const getBucketStructure = async (req, res) => {
  try {
    const { detailed = false } = req.query;

    // Get category summary
    const categorySummaryResult = await query('SELECT * FROM rera_dev_category_summary');
    const categorySummary = categorySummaryResult.rows;

    // Get overall statistics
    const statisticsResult = await query('SELECT * FROM rera_dev_statistics');
    const statistics = statisticsResult.rows[0];

    // Build structure
    const structure = {
      bucketName: 'rera-dev',
      totalFiles: statistics.total_files,
      totalSize: {
        bytes: statistics.total_size_bytes,
        mb: statistics.total_size_mb,
        gb: statistics.total_size_gb
      },
      totalMainFolders: statistics.total_main_folders,
      totalSubfolders: statistics.total_subfolders,
      oldestFile: statistics.oldest_file,
      newestFile: statistics.newest_file,
      allMimeTypes: statistics.all_mime_types,
      fileTypeCounts: {
        images: statistics.image_files,
        pdfs: statistics.pdf_files,
        office: statistics.office_files,
        text: statistics.text_files
      },
      categories: {}
    };

    // Organize categories
    categorySummary.forEach(cat => {
      structure.categories[cat.category_name] = {
        originalFolder: cat.original_folder,
        fileCount: cat.file_count,
        totalSize: cat.total_size,
        oldestFile: cat.oldest_file,
        newestFile: cat.newest_file,
        mimeTypes: cat.mime_types,
        subfolders: cat.subfolders || []
      };

      // If detailed view is requested, get files for each category
      if (detailed === 'true') {
        structure.categories[cat.category_name].files = [];
      }
    });

    // If detailed view is requested, fetch sample files for each category
    if (detailed === 'true') {
      for (const category of Object.keys(structure.categories)) {
        const filesResult = await query(
          'SELECT * FROM get_rera_dev_files_paginated($1, $2, $3, $4)',
          [1, 100, category, null]
        );
        
        structure.categories[category].files = filesResult.rows.map(file => ({
          id: file.id,
          name: file.name,
          fullPath: file.folder_path ? `${file.folder_path}/${file.name}`.replace(/^\//, '') : file.name,
          folderPath: file.folder_path,
          size: parseInt(file.size) || 0,
          lastModified: file.updated_at || file.created_at,
          mimeType: file.mime_type,
          publicUrl: file.public_url,
          level: file.depth_level
        }));
      }
    }

    return res.status(200).json({
      success: true,
      structure: structure
    });

  } catch (error) {
    console.error('Unexpected error in getBucketStructure:', error);
    return res.status(500).json({ error: 'Server error while fetching bucket structure' });
  }
};

// Get bucket statistics
export const getBucketStats = async (req, res) => {
  try {
    // Get statistics from the view
    const statisticsResult = await query('SELECT * FROM rera_dev_statistics');
    const statistics = statisticsResult.rows[0];

    // Get category summary
    const categorySummaryResult = await query('SELECT * FROM rera_dev_category_summary');
    const categorySummary = categorySummaryResult.rows;

    // Get S3 bucket stats as well
    const s3Stats = await getS3Stats();

    return res.status(200).json({
      success: true,
      bucketName: 'rera-dev',
      statistics: {
        database: {
          totalFiles: statistics.total_files,
          totalSize: {
            bytes: statistics.total_size_bytes,
            mb: statistics.total_size_mb,
            gb: statistics.total_size_gb
          },
          totalMainFolders: statistics.total_main_folders,
          totalSubfolders: statistics.total_subfolders,
          oldestFile: statistics.oldest_file,
          newestFile: statistics.newest_file,
          fileTypeCounts: {
            images: statistics.image_files,
            pdfs: statistics.pdf_files,
            office: statistics.office_files,
            text: statistics.text_files
          },
          allMimeTypes: statistics.all_mime_types,
          categoryBreakdown: categorySummary.map(cat => ({
            category: cat.category_name,
            originalFolder: cat.original_folder,
            fileCount: cat.file_count,
            totalSize: cat.total_size,
            mimeTypes: cat.mime_types,
            subfolders: cat.subfolders || []
          }))
        },
        s3: s3Stats
      }
    });

  } catch (error) {
    console.error('Unexpected error in getBucketStats:', error);
    return res.status(500).json({ error: 'Server error while fetching bucket statistics' });
  }
};

// Search files in rera-dev bucket
export const searchFiles = async (req, res) => {
  try {
    const { 
      search = null, 
      category = null, 
      mimeType = null, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Use the search function
    const searchResult = await query(
      'SELECT * FROM search_rera_dev_files($1, $2, $3, $4, $5)',
      [search, category, mimeType, parseInt(page), parseInt(limit)]
    );
    
    const results = searchResult.rows;
    const totalResults = results.length > 0 ? parseInt(results[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      searchTerm: search,
      filters: { category, mimeType },
      totalResults: totalResults,
      results: results.map(file => ({
        id: file.id,
        name: file.name,
        category: file.category,
        fullPath: file.full_path,
        size: parseInt(file.size) || 0,
        lastModified: file.updated_at || file.created_at,
        mimeType: file.mime_type,
        publicUrl: file.public_url
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: results.length === parseInt(limit),
        totalPages: Math.ceil(totalResults / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Unexpected error in searchFiles:', error);
    return res.status(500).json({ error: 'Server error while searching files' });
  }
};

// Delete file from rera-dev bucket
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { filePath } = req.body;

    if (!fileId && !filePath) {
      return res.status(400).json({ error: 'File ID or file path is required' });
    }

    let fileToDelete;

    // Get file information first
    if (fileId) {
      const fileResult = await query(
        'SELECT * FROM rera_dev_files WHERE id = $1',
        [fileId]
      );
      
      if (fileResult.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      fileToDelete = fileResult.rows[0];
    } else {
      // Use file path to find the file
      const fileResult = await query(
        'SELECT * FROM rera_dev_files WHERE CONCAT(folder_path, \'/\', name) = $1 OR name = $1',
        [filePath]
      );
      
      if (fileResult.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      fileToDelete = fileResult.rows[0];
    }

    // Construct the S3 key from path_tokens
    const s3Key = Array.isArray(fileToDelete.full_path_array) 
      ? fileToDelete.full_path_array.join('/')
      : fileToDelete.name;

    // Delete from S3
    await deleteFromS3(s3Key);

    // Delete from database (this will be handled by the storage.objects delete cascade)
    await query('DELETE FROM storage.objects WHERE id = $1', [fileToDelete.id]);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully from rera-dev bucket',
      deletedFile: {
        id: fileToDelete.id,
        name: fileToDelete.name,
        category: fileToDelete.category,
        s3Key: s3Key,
        bucket: 'rera-dev'
      }
    });

  } catch (error) {
    console.error('Unexpected error in deleteFile:', error);
    return res.status(500).json({ error: 'Server error while deleting file' });
  }
};

// Get files by folder path
export const getFilesByFolder = async (req, res) => {
  try {
    const folderPath = decodeURIComponent(req.params.folderPath);
    const { page = 1, limit = 50, category = null } = req.query;
    
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }

    // Use the paginated function with folder filter
    const filesResult = await query(
      'SELECT * FROM get_rera_dev_files_paginated($1, $2, $3, $4)',
      [parseInt(page), parseInt(limit), category, folderPath]
    );
    
    const allFiles = filesResult.rows;
    const totalFiles = allFiles.length > 0 ? parseInt(allFiles[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      folderPath: folderPath,
      totalFiles: totalFiles,
      files: allFiles.map(file => ({
        id: file.id,
        name: file.name,
        fullPath: file.folder_path ? `${file.folder_path}/${file.name}`.replace(/^\//, '') : file.name,
        category: file.category,
        folderPath: file.folder_path,
        size: parseInt(file.size) || 0,
        lastModified: file.updated_at || file.created_at,
        mimeType: file.mime_type,
        publicUrl: file.public_url,
        bucket: 'rera-dev',
        level: file.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allFiles.length === parseInt(limit),
        totalPages: Math.ceil(totalFiles / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Unexpected error in getFilesByFolder:', error);
    return res.status(500).json({ error: 'Server error while fetching folder files' });
  }
};

// Get category summary
export const getCategorySummary = async (req, res) => {
  try {
    const categorySummaryResult = await query('SELECT * FROM rera_dev_category_summary');
    const categorySummary = categorySummaryResult.rows;

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      totalCategories: categorySummary.length,
      categories: categorySummary.map(cat => ({
        categoryName: cat.category_name,
        originalFolder: cat.original_folder,
        fileCount: cat.file_count,
        totalSize: cat.total_size,
        oldestFile: cat.oldest_file,
        newestFile: cat.newest_file,
        mimeTypes: cat.mime_types,
        subfolders: cat.subfolders || []
      }))
    });

  } catch (error) {
    console.error('Unexpected error in getCategorySummary:', error);
    return res.status(500).json({ error: 'Server error while fetching category summary' });
  }
};

// Get files by specific subfolder (for documents)
export const getDocumentsBySubfolder = async (req, res) => {
  try {
    const { subfolder } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (!subfolder) {
      return res.status(400).json({ error: 'Subfolder is required' });
    }

    // Use the documents paginated function with subfolder filter
    const documentsResult = await query(
      'SELECT * FROM get_rera_dev_documents_paginated($1, $2, $3)',
      [parseInt(page), parseInt(limit), subfolder]
    );
    
    const allDocuments = documentsResult.rows;
    const totalDocuments = allDocuments.length > 0 ? parseInt(allDocuments[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      category: 'documents',
      subfolder: subfolder,
      totalDocuments: totalDocuments,
      documents: allDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        fullPath: doc.folder_path ? `${doc.folder_path}/${doc.name}`.replace(/^\//, '') : doc.name,
        mainFolder: doc.main_folder,
        subFolder: doc.sub_folder,
        folderPath: doc.folder_path,
        size: parseInt(doc.size) || 0,
        lastModified: doc.updated_at || doc.created_at,
        mimeType: doc.mime_type,
        publicUrl: doc.public_url,
        bucket: 'rera-dev',
        level: doc.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allDocuments.length === parseInt(limit),
        totalPages: Math.ceil(totalDocuments / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Unexpected error in getDocumentsBySubfolder:', error);
    return res.status(500).json({ error: 'Server error while fetching subfolder documents' });
  }
};

// Get photos by specific role/category
export const getPhotosByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Use the photos paginated function with role filter
    const photosResult = await query(
      'SELECT * FROM get_rera_dev_photos_paginated($1, $2, $3)',
      [parseInt(page), parseInt(limit), role]
    );
    
    const allPhotos = photosResult.rows;
    const totalPhotos = allPhotos.length > 0 ? parseInt(allPhotos[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'rera-dev',
      category: 'photos',
      role: role,
      totalPhotos: totalPhotos,
      photos: allPhotos.map(photo => ({
        id: photo.id,
        name: photo.name,
        fullPath: photo.folder_path ? `${photo.folder_path}/${photo.name}`.replace(/^\//, '') : photo.name,
        mainFolder: photo.main_folder,
        roleOrCategory: photo.role_or_category,
        folderPath: photo.folder_path,
        size: parseInt(photo.size) || 0,
        lastModified: photo.updated_at || photo.created_at,
        mimeType: photo.mime_type,
        publicUrl: photo.public_url,
        bucket: 'rera-dev',
        level: photo.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allPhotos.length === parseInt(limit),
        totalPages: Math.ceil(totalPhotos / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Unexpected error in getPhotosByRole:', error);
    return res.status(500).json({ error: 'Server error while fetching role photos' });
  }
};