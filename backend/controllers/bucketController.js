// bucketController.js
import { supabase } from '../supabase/supabaseClient.js';

// ===== UPLOADED DOCUMENTS BUCKET FUNCTIONS =====

// Get all files from uploaded-documents bucket organized by folders
export const getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;

    // Use the paginated function to get files
    const { data: paginatedData, error: paginatedError } = await supabase
      .rpc('get_uploaded_documents_paginated', {
        page_num: parseInt(page),
        page_size: parseInt(limit),
        folder_filter: null
      });

    if (paginatedError) {
      console.error('Error fetching paginated files:', paginatedError);
      return res.status(500).json({ error: 'Failed to fetch files' });
    }

    // Get folder summary for organization
    const { data: folderSummary, error: summaryError } = await supabase
      .from('uploaded_documents_folder_summary')
      .select('*');

    if (summaryError) {
      console.error('Error fetching folder summary:', summaryError);
      return res.status(500).json({ error: 'Failed to fetch folder summary' });
    }

    // Organize files by folder
    const organizedFiles = {};
    const allFiles = paginatedData || [];
    const totalFiles = allFiles.length > 0 ? allFiles[0].total_count : 0;

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

    // console.log(`Found ${totalFiles} total files across ${folderSummary.length} folders`);

    return res.status(200).json({
      success: true,
      bucket: 'uploaded-documents',
      totalFiles: parseInt(totalFiles),
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
        totalPages: Math.ceil(parseInt(totalFiles) / parseInt(limit))
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
    
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }

    // Use the paginated function with folder filter
    const { data: filesData, error: filesError } = await supabase
      .rpc('get_uploaded_documents_paginated', {
        page_num: parseInt(page),
        page_size: parseInt(limit),
        folder_filter: folderPath
      });

    if (filesError) {
      console.error('Error fetching files by folder:', filesError);
      return res.status(500).json({ error: 'Failed to fetch folder files' });
    }

    const allFiles = filesData || [];
    const totalFiles = allFiles.length > 0 ? allFiles[0].total_count : 0;

    // console.log(`Found ${totalFiles} total files in ${folderPath} folder`);

    return res.status(200).json({
      success: true,
      bucket: 'uploaded-documents',
      folder: folderPath,
      totalFiles: parseInt(totalFiles),
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
        totalPages: Math.ceil(parseInt(totalFiles) / parseInt(limit))
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

    // Use the paginated function to get photos
    const { data: paginatedData, error: paginatedError } = await supabase
      .rpc('get_user_photos_paginated', {
        page_num: parseInt(page),
        page_size: parseInt(limit),
        role_filter: role || null
      });

    if (paginatedError) {
      console.error('Error fetching paginated photos:', paginatedError);
      return res.status(500).json({ error: 'Failed to fetch photos' });
    }

    // Get role summary for organization
    const { data: roleSummary, error: summaryError } = await supabase
      .from('user_profile_photos_role_summary')
      .select('*');

    if (summaryError) {
      console.error('Error fetching role summary:', summaryError);
      return res.status(500).json({ error: 'Failed to fetch role summary' });
    }

    // Organize photos by role
    const organizedPhotos = {};
    const allPhotos = paginatedData || [];
    const totalPhotos = allPhotos.length > 0 ? allPhotos[0].total_count : 0;

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

    // console.log(`Found ${totalPhotos} total photos across ${roleSummary.length} roles`);

    return res.status(200).json({
      success: true,
      bucket: 'user-profile-photos',
      totalPhotos: parseInt(totalPhotos),
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
        totalPages: Math.ceil(parseInt(totalPhotos) / parseInt(limit))
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
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Use the paginated function with role filter
    const { data: photosData, error: photosError } = await supabase
      .rpc('get_user_photos_paginated', {
        page_num: parseInt(page),
        page_size: parseInt(limit),
        role_filter: role.toLowerCase()
      });

    if (photosError) {
      console.error('Error fetching photos by role:', photosError);
      return res.status(500).json({ error: 'Failed to fetch role photos' });
    }

    const allPhotos = photosData || [];
    const totalPhotos = allPhotos.length > 0 ? allPhotos[0].total_count : 0;

    // console.log(`Found ${totalPhotos} total photos in ${role} role`);

    return res.status(200).json({
      success: true,
      bucket: 'user-profile-photos',
      role: role.toLowerCase(),
      totalPhotos: parseInt(totalPhotos),
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
        totalPages: Math.ceil(parseInt(totalPhotos) / parseInt(limit))
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
    const { data: structureData, error: structureError } = await supabase
      .from('all_buckets_structure')
      .select('*');

    if (structureError) {
      console.error('Error fetching bucket structure:', structureError);
      return res.status(500).json({ error: 'Failed to fetch bucket structure' });
    }

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
      const { data: detailedDocs, error: docsError } = await supabase
        .from('uploaded_documents_files')
        .select('name, full_path_array, size, updated_at, public_url, folder')
        .limit(1000);

      if (!docsError && detailedDocs) {
        detailedDocs.forEach(doc => {
          const folder = doc.folder || 'root';
          if (structure['uploaded-documents'].folders[folder]) {
            structure['uploaded-documents'].folders[folder].files.push({
              name: doc.name,
              fullPath: doc.full_path_array.join('/'),
              size: parseInt(doc.size) || 0,
              lastModified: doc.updated_at,
              publicUrl: doc.public_url
            });
          }
        });
      }

      // Get detailed photos
      const { data: detailedPhotos, error: photosError } = await supabase
        .from('user_profile_photos')
        .select('name, full_path_array, size, updated_at, public_url, role_folder')
        .limit(1000);

      if (!photosError && detailedPhotos) {
        detailedPhotos.forEach(photo => {
          const role = photo.role_folder;
          if (structure['user-profile-photos'].roles[role]) {
            structure['user-profile-photos'].roles[role].photos.push({
              name: photo.name,
              fullPath: photo.full_path_array.join('/'),
              size: parseInt(photo.size) || 0,
              lastModified: photo.updated_at,
              publicUrl: photo.public_url
            });
          }
        });
      }
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
    const { data: statsData, error: statsError } = await supabase
      .from('bucket_statistics')
      .select('*');

    if (statsError) {
      console.error('Error fetching bucket statistics:', statsError);
      return res.status(500).json({ error: 'Failed to fetch bucket statistics' });
    }

    // Get folder and role lists
    const { data: folderSummary, error: folderError } = await supabase
      .from('uploaded_documents_folder_summary')
      .select('folder_name');

    const { data: roleSummary, error: roleError } = await supabase
      .from('user_profile_photos_role_summary')
      .select('role_name');

    if (folderError || roleError) {
      console.error('Error fetching folder/role summaries:', folderError, roleError);
      return res.status(500).json({ error: 'Failed to fetch summaries' });
    }

    // Organize statistics
    const statistics = {
      'uploaded-documents': {
        totalFiles: 0,
        totalSize: 0,
        totalFolders: 0,
        folders: folderSummary ? folderSummary.map(f => f.folder_name) : []
      },
      'user-profile-photos': {
        totalPhotos: 0,
        totalSize: 0,
        totalRoles: 0,
        roles: roleSummary ? roleSummary.map(r => r.role_name) : []
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

    // Use the search function
    const { data: searchResults, error: searchError } = await supabase
      .rpc('search_all_files', {
        search_term: search || null,
        bucket_filter: bucket,
        mime_type_filter: mimeType,
        page_num: parseInt(page),
        page_size: parseInt(limit)
      });

    if (searchError) {
      console.error('Error searching files:', searchError);
      return res.status(500).json({ error: 'Failed to search files' });
    }

    const results = searchResults || [];
    const totalResults = results.length > 0 ? results[0].total_count : 0;

    return res.status(200).json({
      success: true,
      searchTerm: search,
      filters: { bucket, mimeType },
      totalResults: parseInt(totalResults),
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
        totalPages: Math.ceil(parseInt(totalResults) / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Unexpected error in searchFiles:', error);
    return res.status(500).json({ error: 'Server error while searching files' });
  }
};

// Delete file from any bucket (unchanged)
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

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting file ${filePath} from ${bucket}:`, error);
      return res.status(500).json({ error: `Failed to delete file: ${error.message}` });
    }

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