// bucketController.js
import { query, db } from '../aws/awsClient.js';

// ===== UPLOADED DOCUMENTS BUCKET FUNCTIONS =====

// Get all files from uploaded-documents bucket organized by folders
export const getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get paginated files with folder filter
    const filesQuery = `
      SELECT 
        id, name, folder_path, folder, size, updated_at, created_at, 
        mime_type, public_url, depth_level,
        COUNT(*) OVER() as total_count
      FROM uploaded_documents_files 
      ORDER BY updated_at DESC 
      LIMIT $1 OFFSET $2
    `;

    const filesResult = await query(filesQuery, [parseInt(limit), offset]);
    const allFiles = filesResult.rows;
    const totalFiles = allFiles.length > 0 ? parseInt(allFiles[0].total_count) : 0;

    // Get folder summary for organization
    const folderSummaryQuery = `
      SELECT folder_name, file_count 
      FROM uploaded_documents_folder_summary
    `;
    const folderSummaryResult = await query(folderSummaryQuery);
    const folderSummary = folderSummaryResult.rows;

    // Organize files by folder
    const organizedFiles = {};

    // Group files by folder
    allFiles.forEach(file => {
      const folder = file.folder || 'root';
      if (!organizedFiles[folder]) {
        organizedFiles[folder] = [];
      }
      organizedFiles[folder].push({
        id: file.id,
        name: file.name,
        fullPath: `${file.folder_path}/${file.name}`.replace(/^\//, ''),
        folder: file.folder,
        folderPath: file.folder_path,
        size: parseInt(file.size) || 0,
        lastModified: file.updated_at || file.created_at,
        mimeType: file.mime_type,
        publicUrl: file.public_url,
        bucket: 'uploaded-documents',
        level: file.depth_level
      });
    });

    // Create folder breakdown from summary
    const folderBreakdown = {};
    folderSummary.forEach(folder => {
      folderBreakdown[folder.folder_name] = folder.file_count;
    });

    return res.status(200).json({
      success: true,
      bucket: 'uploaded-documents',
      totalFiles: totalFiles,
      organizedByFolder: organizedFiles,
      allFiles: allFiles.map(file => ({
        id: file.id,
        name: file.name,
        fullPath: `${file.folder_path}/${file.name}`.replace(/^\//, ''),
        folder: file.folder,
        folderPath: file.folder_path,
        size: parseInt(file.size) || 0,
        lastModified: file.updated_at || file.created_at,
        mimeType: file.mime_type,
        publicUrl: file.public_url,
        bucket: 'uploaded-documents',
        level: file.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allFiles.length === parseInt(limit),
        totalPages: Math.ceil(totalFiles / parseInt(limit))
      },
      summary: {
        totalFolders: folderSummary.length,
        folderBreakdown: folderBreakdown
      }
    });

  } catch (error) {
    console.error('Unexpected error in getAllFiles:', error);
    return res.status(500).json({ error: 'Server error while fetching files' });
  }
};

// Get files from specific folder in uploaded-documents bucket
export const getFilesByFolder = async (req, res) => {
  try {
    const folderPath = decodeURIComponent(req.params.folderPath);
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }

    // Get files from specific folder with pagination
    const filesQuery = `
      SELECT 
        id, name, folder_path, folder, size, updated_at, created_at, 
        mime_type, public_url, depth_level,
        COUNT(*) OVER() as total_count
      FROM uploaded_documents_files 
      WHERE folder_path = $1 OR folder = $2
      ORDER BY updated_at DESC 
      LIMIT $3 OFFSET $4
    `;

    const filesResult = await query(filesQuery, [folderPath, folderPath, parseInt(limit), offset]);
    const allFiles = filesResult.rows;
    const totalFiles = allFiles.length > 0 ? parseInt(allFiles[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'uploaded-documents',
      folder: folderPath,
      totalFiles: totalFiles,
      files: allFiles.map(file => ({
        id: file.id,
        name: file.name,
        fullPath: `${file.folder_path}/${file.name}`.replace(/^\//, ''),
        folder: file.folder,
        folderPath: file.folder_path,
        size: parseInt(file.size) || 0,
        lastModified: file.updated_at || file.created_at,
        mimeType: file.mime_type,
        publicUrl: file.public_url,
        bucket: 'uploaded-documents',
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

// ===== USER PROFILE PHOTOS BUCKET FUNCTIONS =====

// Get all user photos organized by role folders
export const getAllUserPhotos = async (req, res) => {
  try {
    const { page = 1, limit = 100, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query with optional role filter
    let photosQuery = `
      SELECT 
        id, name, folder_path, role_folder, size, updated_at, created_at, 
        mime_type, public_url, depth_level,
        COUNT(*) OVER() as total_count
      FROM user_profile_photos 
    `;
    let queryParams = [];
    
    if (role) {
      photosQuery += ` WHERE role_folder = $1 `;
      queryParams.push(role.toLowerCase());
    }
    
    photosQuery += ` ORDER BY updated_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), offset);

    const photosResult = await query(photosQuery, queryParams);
    const allPhotos = photosResult.rows;
    const totalPhotos = allPhotos.length > 0 ? parseInt(allPhotos[0].total_count) : 0;

    // Get role summary for organization
    const roleSummaryQuery = `
      SELECT role_name, photo_count 
      FROM user_profile_photos_role_summary
    `;
    const roleSummaryResult = await query(roleSummaryQuery);
    const roleSummary = roleSummaryResult.rows;

    // Organize photos by role
    const organizedPhotos = {};

    // Group photos by role
    allPhotos.forEach(photo => {
      const role = photo.role_folder || 'root';
      if (!organizedPhotos[role]) {
        organizedPhotos[role] = [];
      }
      organizedPhotos[role].push({
        id: photo.id,
        name: photo.name,
        fullPath: `${photo.folder_path}/${photo.name}`.replace(/^\//, ''),
        roleFolder: photo.role_folder,
        folderPath: photo.folder_path,
        size: parseInt(photo.size) || 0,
        lastModified: photo.updated_at || photo.created_at,
        mimeType: photo.mime_type,
        publicUrl: photo.public_url,
        bucket: 'user-profile-photos',
        level: photo.depth_level
      });
    });

    // Create role breakdown from summary
    const roleBreakdown = {};
    roleSummary.forEach(role => {
      roleBreakdown[role.role_name] = role.photo_count;
    });

    return res.status(200).json({
      success: true,
      bucket: 'user-profile-photos',
      totalPhotos: totalPhotos,
      organizedByRole: organizedPhotos,
      allPhotos: allPhotos.map(photo => ({
        id: photo.id,
        name: photo.name,
        fullPath: `${photo.folder_path}/${photo.name}`.replace(/^\//, ''),
        roleFolder: photo.role_folder,
        folderPath: photo.folder_path,
        size: parseInt(photo.size) || 0,
        lastModified: photo.updated_at || photo.created_at,
        mimeType: photo.mime_type,
        publicUrl: photo.public_url,
        bucket: 'user-profile-photos',
        level: photo.depth_level
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: allPhotos.length === parseInt(limit),
        totalPages: Math.ceil(totalPhotos / parseInt(limit))
      },
      summary: {
        totalRoles: roleSummary.length,
        roleBreakdown: roleBreakdown
      }
    });

  } catch (error) {
    console.error('Unexpected error in getAllUserPhotos:', error);
    return res.status(500).json({ error: 'Server error while fetching user photos' });
  }
};

// Get photos from specific role folder
export const getUserPhotosByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Get photos from specific role with pagination
    const photosQuery = `
      SELECT 
        id, name, folder_path, role_folder, size, updated_at, created_at, 
        mime_type, public_url, depth_level,
        COUNT(*) OVER() as total_count
      FROM user_profile_photos 
      WHERE role_folder = $1
      ORDER BY updated_at DESC 
      LIMIT $2 OFFSET $3
    `;

    const photosResult = await query(photosQuery, [role.toLowerCase(), parseInt(limit), offset]);
    const allPhotos = photosResult.rows;
    const totalPhotos = allPhotos.length > 0 ? parseInt(allPhotos[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      bucket: 'user-profile-photos',
      role: role.toLowerCase(),
      totalPhotos: totalPhotos,
      photos: allPhotos.map(photo => ({
        id: photo.id,
        name: photo.name,
        fullPath: `${photo.folder_path}/${photo.name}`.replace(/^\//, ''),
        roleFolder: photo.role_folder,
        folderPath: photo.folder_path,
        size: parseInt(photo.size) || 0,
        lastModified: photo.updated_at || photo.created_at,
        mimeType: photo.mime_type,
        publicUrl: photo.public_url,
        bucket: 'user-profile-photos',
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
    console.error('Unexpected error in getUserPhotosByRole:', error);
    return res.status(500).json({ error: 'Server error while fetching role photos' });
  }
};

// ===== COMBINED BUCKET FUNCTIONS =====

// Get complete folder structure for both buckets
export const getAllBucketsStructure = async (req, res) => {
  try {
    const { detailed = false } = req.query;

    // Get structure from the combined view
    const structureQuery = `
      SELECT bucket_name, category, file_count, total_size, mime_types
      FROM all_buckets_structure
    `;
    const structureResult = await query(structureQuery);
    const structureData = structureResult.rows;

    // Organize the data by bucket
    const structure = {
      'uploaded-documents': {
        totalFiles: 0,
        folders: {}
      },
      'user-profile-photos': {
        totalPhotos: 0,
        roles: {}
      }
    };

    structureData.forEach(item => {
      if (item.bucket_name === 'uploaded-documents') {
        structure['uploaded-documents'].totalFiles += item.file_count;
        structure['uploaded-documents'].folders[item.category] = {
          fileCount: item.file_count,
          totalSize: item.total_size,
          mimeTypes: item.mime_types
        };

        if (detailed === 'true') {
          // Get detailed files for this folder
          structure['uploaded-documents'].folders[item.category].files = [];
        }
      } else if (item.bucket_name === 'user-profile-photos') {
        structure['user-profile-photos'].totalPhotos += item.file_count;
        structure['user-profile-photos'].roles[item.category] = {
          photoCount: item.file_count,
          totalSize: item.total_size,
          mimeTypes: item.mime_types
        };

        if (detailed === 'true') {
          // Get detailed photos for this role
          structure['user-profile-photos'].roles[item.category].photos = [];
        }
      }
    });

    // If detailed view is requested, fetch actual files
    if (detailed === 'true') {
      // Get detailed documents
      const docsQuery = `
        SELECT name, full_path_array, size, updated_at, public_url, folder
        FROM uploaded_documents_files
        LIMIT 1000
      `;
      const docsResult = await query(docsQuery);
      const detailedDocs = docsResult.rows;

      detailedDocs.forEach(doc => {
        const folder = doc.folder || 'root';
        if (structure['uploaded-documents'].folders[folder]) {
          structure['uploaded-documents'].folders[folder].files.push({
            name: doc.name,
            fullPath: Array.isArray(doc.full_path_array) ? doc.full_path_array.join('/') : doc.full_path_array,
            size: parseInt(doc.size) || 0,
            lastModified: doc.updated_at,
            publicUrl: doc.public_url
          });
        }
      });

      // Get detailed photos
      const photosQuery = `
        SELECT name, full_path_array, size, updated_at, public_url, role_folder
        FROM user_profile_photos
        LIMIT 1000
      `;
      const photosResult = await query(photosQuery);
      const detailedPhotos = photosResult.rows;

      detailedPhotos.forEach(photo => {
        const role = photo.role_folder;
        if (structure['user-profile-photos'].roles[role]) {
          structure['user-profile-photos'].roles[role].photos.push({
            name: photo.name,
            fullPath: Array.isArray(photo.full_path_array) ? photo.full_path_array.join('/') : photo.full_path_array,
            size: parseInt(photo.size) || 0,
            lastModified: photo.updated_at,
            publicUrl: photo.public_url
          });
        }
      });
    }

    return res.status(200).json({
      success: true,
      bucketStructure: structure,
      summary: {
        totalBuckets: 2,
        'uploaded-documents': {
          totalFiles: structure['uploaded-documents'].totalFiles,
          totalFolders: Object.keys(structure['uploaded-documents'].folders).length
        },
        'user-profile-photos': {
          totalPhotos: structure['user-profile-photos'].totalPhotos,
          totalRoles: Object.keys(structure['user-profile-photos'].roles).length
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in getAllBucketsStructure:', error);
    return res.status(500).json({ error: 'Server error while fetching bucket structure' });
  }
};

// Get bucket statistics
export const getBucketStats = async (req, res) => {
  try {
    // Get statistics from the bucket_statistics view
    const statsQuery = `
      SELECT bucket_name, total_files, total_size_bytes, total_categories
      FROM bucket_statistics
    `;
    const statsResult = await query(statsQuery);
    const statsData = statsResult.rows;

    // Get folder and role lists
    const folderQuery = `SELECT folder_name FROM uploaded_documents_folder_summary`;
    const roleQuery = `SELECT role_name FROM user_profile_photos_role_summary`;
    
    const [folderResult, roleResult] = await Promise.all([
      query(folderQuery),
      query(roleQuery)
    ]);

    const folderSummary = folderResult.rows;
    const roleSummary = roleResult.rows;

    // Organize statistics
    const statistics = {
      'uploaded-documents': {
        totalFiles: 0,
        totalSize: 0,
        totalFolders: 0,
        folders: folderSummary.map(f => f.folder_name)
      },
      'user-profile-photos': {
        totalPhotos: 0,
        totalSize: 0,
        totalRoles: 0,
        roles: roleSummary.map(r => r.role_name)
      },
      overall: {
        totalFiles: 0,
        totalSize: 0,
        totalBuckets: 2
      }
    };

    // Process statistics data
    statsData.forEach(stat => {
      if (stat.bucket_name === 'uploaded-documents') {
        statistics['uploaded-documents'].totalFiles = stat.total_files;
        statistics['uploaded-documents'].totalSize = stat.total_size_bytes;
        statistics['uploaded-documents'].totalFolders = stat.total_categories;
      } else if (stat.bucket_name === 'user-profile-photos') {
        statistics['user-profile-photos'].totalPhotos = stat.total_files;
        statistics['user-profile-photos'].totalSize = stat.total_size_bytes;
        statistics['user-profile-photos'].totalRoles = stat.total_categories;
      } else if (stat.bucket_name === 'total') {
        statistics.overall.totalFiles = stat.total_files;
        statistics.overall.totalSize = stat.total_size_bytes;
      }
    });

    return res.status(200).json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Unexpected error in getBucketStats:', error);
    return res.status(500).json({ error: 'Server error while fetching bucket statistics' });
  }
};

// ===== ADDITIONAL UTILITY FUNCTIONS =====

// Search files across both buckets
export const searchFiles = async (req, res) => {
  try {
    const { 
      search = '', 
      bucket = null, 
      mimeType = null, 
      page = 1, 
      limit = 50 
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build dynamic search query
    let searchQuery = `
      WITH combined_files AS (
        SELECT 
          id, name, 'uploaded-documents' as bucket_name, folder as category,
          CONCAT(folder_path, '/', name) as full_path, size, updated_at, created_at,
          mime_type, public_url,
          COUNT(*) OVER() as total_count
        FROM uploaded_documents_files
        
        UNION ALL
        
        SELECT 
          id, name, 'user-profile-photos' as bucket_name, role_folder as category,
          CONCAT(folder_path, '/', name) as full_path, size, updated_at, created_at,
          mime_type, public_url,
          COUNT(*) OVER() as total_count
        FROM user_profile_photos
      )
      SELECT * FROM combined_files
      WHERE 1=1
    `;

    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      searchQuery += ` AND name ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
    }

    if (bucket) {
      paramCount++;
      searchQuery += ` AND bucket_name = $${paramCount}`;
      queryParams.push(bucket);
    }

    if (mimeType) {
      paramCount++;
      searchQuery += ` AND mime_type ILIKE $${paramCount}`;
      queryParams.push(`%${mimeType}%`);
    }

    searchQuery += ` ORDER BY updated_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const searchResult = await query(searchQuery, queryParams);
    const results = searchResult.rows;
    const totalResults = results.length > 0 ? parseInt(results[0].total_count) : 0;

    return res.status(200).json({
      success: true,
      searchTerm: search,
      filters: { bucket, mimeType },
      totalResults: totalResults,
      results: results.map(file => ({
        id: file.id,
        name: file.name,
        bucket: file.bucket_name,
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

// Delete file from any bucket (now uses AWS S3)
export const deleteFile = async (req, res) => {
  try {
    const { bucket } = req.params;
    const filePath = decodeURIComponent(req.params.filePath);

    if (!bucket || !filePath) {
      return res.status(400).json({ error: 'Bucket and file path are required' });
    }

    // Validate bucket name
    const validBuckets = ['uploaded-documents', 'user-profile-photos'];
    if (!validBuckets.includes(bucket)) {
      return res.status(400).json({ error: 'Invalid bucket name' });
    }

    // Import deleteFromS3 function
    const { deleteFromS3 } = await import('../aws/awsClient.js');
    
    // Delete from S3
    await deleteFromS3(filePath);

    // Delete from database
    let deleteQuery = '';
    if (bucket === 'uploaded-documents') {
      deleteQuery = 'DELETE FROM uploaded_documents_files WHERE CONCAT(folder_path, \'/\', name) = $1';
    } else if (bucket === 'user-profile-photos') {
      deleteQuery = 'DELETE FROM user_profile_photos WHERE CONCAT(folder_path, \'/\', name) = $1';
    }

    await query(deleteQuery, [filePath]);

    return res.status(200).json({
      success: true,
      message: `File deleted successfully from ${bucket}`,
      deletedFile: {
        bucket,
        filePath: filePath
      }
    });

  } catch (error) {
    console.error('Unexpected error in deleteFile:', error);
    return res.status(500).json({ error: 'Server error while deleting file' });
  }
};