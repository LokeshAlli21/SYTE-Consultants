// services/bucketService.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import env from '../../env/env';
import { toast } from "react-toastify";
import {authenticatedFetch} from '../fetchWrapper';

dayjs.extend(utc);
dayjs.extend(timezone);

class BucketService {
  constructor() {
    this.baseUrl = env.backendUrl;
  }

  // ✅ Utility to get token
  getAuthHeaders(skipContentType = false) {
    const token = localStorage.getItem('authToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    if (!skipContentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }
  
  // ✅ Utility to handle responses globally
  async handleResponse(response) {
    const data = await response.json();
console.log(data)
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authTokenForPromoter');
      toast("Session expired. Please log in again.");
      window.location.href = "/login"; // or use `navigate()` from router
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  }

  // ========================
  // SINGLE FILE OPERATIONS
  // ========================

  /**
   * Upload a single file to S3
   * @param {File} file - The file to upload
   * @param {string} folder - Optional folder path
   * @returns {Promise<Object>} Upload result
   */
  async uploadSingleFile(file, folder = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/upload/single`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error uploading single file:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files to S3
   * @param {FileList|Array} files - The files to upload
   * @param {string} folder - Optional folder path
   * @returns {Promise<Object>} Upload result
   */
  async uploadMultipleFiles(files, folder = '') {
    try {
      const formData = new FormData();
      
      // Handle FileList or Array
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        formData.append('files', file);
      });

      if (folder) {
        formData.append('folder', folder);
      }

      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/upload/multiple`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  /**
   * Upload file with progress tracking
   * @param {File} file - The file to upload
   * @param {string} folder - Optional folder path
   * @param {Function} progressCallback - Progress callback function
   * @returns {Promise<Object>} Upload result
   */
  async uploadWithProgress(file, folder = '', progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        if (progressCallback) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              progressCallback(percentComplete, e.loaded, e.total);
            }
          });
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));

        xhr.open('POST', `${this.baseUrl}/api/bucket/upload/progress`);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error uploading with progress:', error);
      throw error;
    }
  }

  /**
   * Delete a single file from S3
   * @param {string} key - The file key to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(key) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files from S3
   * @param {Array<string>} keys - Array of file keys to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteMultipleFiles(keys) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/bulk`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keys })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting multiple files:', error);
      throw error;
    }
  }

  /**
   * Download a file from S3
   * @param {string} key - The file key to download
   * @returns {Promise<Blob>} File blob
   */
  async downloadFile(key) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/${encodeURIComponent(key)}/download`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   * @param {string} key - The file key
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(key) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/${encodeURIComponent(key)}/metadata`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for file access
   * @param {string} key - The file key
   * @param {number} expires - Expiration time in seconds (default: 3600)
   * @returns {Promise<Object>} Signed URL data
   */
  async getSignedUrl(key, expires = 3600) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/${encodeURIComponent(key)}/signed-url?expires=${expires}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }

  /**
   * Generate presigned URL for file download
   * @param {string} key - The file key
   * @param {number} expiresIn - Expiration time in seconds (default: 3600)
   * @returns {Promise<Object>} Presigned URL data
   */
  async generatePresignedUrl(key, expiresIn = 3600) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/${encodeURIComponent(key)}/presigned-url?expiresIn=${expiresIn}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  // ========================
  // FILE OPERATIONS
  // ========================

  /**
   * Copy a file within S3
   * @param {string} sourceKey - Source file key
   * @param {string} destinationKey - Destination file key
   * @returns {Promise<Object>} Copy result
   */
  async copyFile(sourceKey, destinationKey) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/copy`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sourceKey, destinationKey })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }

  /**
   * Move a file within S3
   * @param {string} sourceKey - Source file key
   * @param {string} destinationKey - Destination file key
   * @returns {Promise<Object>} Move result
   */
  async moveFile(sourceKey, destinationKey) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/move`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sourceKey, destinationKey })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param {string} key - The file key
   * @returns {Promise<Object>} Existence check result
   */
  async checkFileExists(key) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/files/${encodeURIComponent(key)}/exists`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error checking file existence:', error);
      throw error;
    }
  }

  // ========================
  // FOLDER OPERATIONS
  // ========================

  /**
   * Create a folder in S3
   * @param {string} folderPath - The folder path to create
   * @returns {Promise<Object>} Create result
   */
  async createFolder(folderPath) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/folders`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderPath })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Delete a folder and all its contents
   * @param {string} folderPath - The folder path to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteFolder(folderPath) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/folders/${encodeURIComponent(folderPath)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  /**
   * Get folder structure
   * @param {string} prefix - Optional prefix to filter folders
   * @returns {Promise<Object>} Folder structure
   */
  async getFolderStructure(prefix = '') {
    try {
      const queryString = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/folders/structure${queryString}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error getting folder structure:', error);
      throw error;
    }
  }

  /**
   * Get folder size
   * @param {string} folderPath - The folder path
   * @returns {Promise<Object>} Folder size information
   */
  async getFolderSize(folderPath) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/folders/${encodeURIComponent(folderPath)}/size`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error getting folder size:', error);
      throw error;
    }
  }

  // ========================
  // LISTING OPERATIONS
  // ========================

  /**
   * List all files in S3
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Files list
   */
  async listFiles(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString 
        ? `${this.baseUrl}/api/bucket/files?${queryString}`
        : `${this.baseUrl}/api/bucket/files`;

      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * List files in a specific folder
   * @param {string} folder - The folder path
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Files list
   */
  async listFilesInFolder(folder, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const folderPath = folder === '' ? 'root' : encodeURIComponent(folder);
      const url = queryString 
        ? `${this.baseUrl}/api/bucket/folders/${folderPath}/files?${queryString}`
        : `${this.baseUrl}/api/bucket/folders/${folderPath}/files`;

      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error listing files in folder:', error);
      throw error;
    }
  }

  // ========================
  // SEARCH OPERATIONS
  // ========================

  /**
   * Search files by name
   * @param {string} searchTerm - The search term
   * @param {string} folder - Optional folder to search in
   * @returns {Promise<Object>} Search results
   */
  async searchFiles(searchTerm, folder = '') {
    try {
      const queryString = folder ? `?folder=${encodeURIComponent(folder)}` : '';
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/search/${encodeURIComponent(searchTerm)}${queryString}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  }

  // ========================
  // ANALYTICS OPERATIONS
  // ========================

  /**
   * Get bucket information and analytics
   * @returns {Promise<Object>} Bucket information
   */
  async getBucketInfo() {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/analytics`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error getting bucket info:', error);
      throw error;
    }
  }

  // ========================
  // UTILITY OPERATIONS
  // ========================

  /**
   * Validate file type
   * @param {string} mimetype - The file mimetype
   * @param {Array<string>} allowedTypes - Allowed file types
   * @returns {Promise<Object>} Validation result
   */
  async validateFileType(mimetype, allowedTypes = []) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/utils/validate-file-type`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mimetype, allowedTypes })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error validating file type:', error);
      throw error;
    }
  }

  /**
   * Generate unique filename
   * @param {string} originalName - The original filename
   * @returns {Promise<Object>} Unique filename
   */
  async generateUniqueFileName(originalName) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/utils/generate-unique-filename`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ originalName })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error generating unique filename:', error);
      throw error;
    }
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - The bytes value
   * @param {number} decimals - Number of decimal places
   * @returns {Promise<Object>} Formatted bytes
   */
  async formatBytes(bytes, decimals = 2) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/utils/format-bytes`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bytes, decimals })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error formatting bytes:', error);
      throw error;
    }
  }

  // ========================
  // ADVANCED UPLOAD OPERATIONS
  // ========================

  /**
   * Upload files with any field names
   * @param {FileList|Array} files - The files to upload
   * @param {string} folder - Optional folder path
   * @returns {Promise<Object>} Upload result
   */
  async uploadAnyFiles(files, folder = '') {
    try {
      const formData = new FormData();
      
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        formData.append('files', file);
      });

      if (folder) {
        formData.append('folder', folder);
      }

      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/upload/any`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error uploading any files:', error);
      throw error;
    }
  }

  /**
   * Upload files with specific field names
   * @param {Object} filesObject - Object with field names as keys and files as values
   * @param {string} folder - Optional folder path
   * @returns {Promise<Object>} Upload result
   */
  async uploadFieldFiles(filesObject, folder = '') {
    try {
      const formData = new FormData();
      
      Object.keys(filesObject).forEach(fieldName => {
        const files = Array.from(filesObject[fieldName]);
        files.forEach(file => {
          formData.append(fieldName, file);
        });
      });

      if (folder) {
        formData.append('folder', folder);
      }

      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/upload/fields`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error uploading field files:', error);
      throw error;
    }
  }

  /**
   * Batch upload files
   * @param {FileList|Array} files - The files to upload (max 50)
   * @param {string} folder - Optional folder path
   * @returns {Promise<Object>} Upload result
   */
  async batchUpload(files, folder = '') {
    try {
      const formData = new FormData();
      
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        formData.append('files', file);
      });

      if (folder) {
        formData.append('folder', folder);
      }

      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/batch/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error batch uploading files:', error);
      throw error;
    }
  }

  /**
   * Batch delete files
   * @param {Array<string>} keys - Array of file keys to delete
   * @returns {Promise<Object>} Delete result
   */
  async batchDelete(keys) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/batch/delete`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keys })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error batch deleting files:', error);
      throw error;
    }
  }

  // ========================
  // HEALTH CHECK
  // ========================

  /**
   * Health check endpoint
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}/api/bucket/health`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  // ========================
  // CONVENIENCE METHODS
  // ========================

  /**
   * Download file and trigger browser download
   * @param {string} key - The file key
   * @param {string} filename - Optional custom filename
   */
  async downloadAndSave(key, filename = null) {
    try {
      const blob = await this.downloadFile(key);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || key.split('/').pop();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading and saving file:', error);
      throw error;
    }
  }

  /**
   * Upload files with drag and drop support
   * @param {DataTransfer} dataTransfer - The DataTransfer object from drag event
   * @param {string} folder - Optional folder path
   * @returns {Promise<Object>} Upload result
   */
  async uploadFromDrop(dataTransfer, folder = '') {
    try {
      const files = Array.from(dataTransfer.files);
      return this.uploadMultipleFiles(files, folder);
    } catch (error) {
      console.error('Error uploading from drop:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const bucketService = new BucketService();
export default bucketService;

// Also export the class for custom instances
export { BucketService };