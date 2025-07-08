import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Upload, 
  File, 
  Folder, 
  Search, 
  Grid, 
  List, 
  Download, 
  Trash2, 
  Copy, 
  Move, 
  Eye, 
  MoreVertical,
  X,
  Plus,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Cloud,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import bucketService from '../backend-services/database/bucket';

const SyteDocuments = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [bucketInfo, setBucketInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadFiles();
    loadFolderStructure();
    loadBucketInfo();
  }, [currentFolder]);

  // Load files in current folder
  const loadFiles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await bucketService.listFilesInFolder(currentFolder);
      // Access the files from response.data
      setFiles(response.data?.files || []);
    } catch (err) {
      setError('Failed to load files: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load folder structure
  const loadFolderStructure = async () => {
    try {
      const response = await bucketService.getFolderStructure(currentFolder);
      // Access folders from response.data
      setFolders(response.data?.folders || []);
    } catch (err) {
      console.error('Failed to load folder structure:', err);
    }
  };

  // Load bucket info
  const loadBucketInfo = async () => {
    try {
      const response = await bucketService.getBucketInfo();
      // Access bucket info from response.data
      setBucketInfo(response.data || null);
    } catch (err) {
      console.error('Failed to load bucket info:', err);
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (uploadFiles) => {
    if (!uploadFiles || uploadFiles.length === 0) return;

    const fileArray = Array.from(uploadFiles);
    setShowUploadModal(false);
    
    // Initialize progress for each file
    const progressMap = {};
    fileArray.forEach(file => {
      progressMap[file.name] = 0;
    });
    setUploadProgress(progressMap);

    try {
      if (fileArray.length === 1) {
        await bucketService.uploadWithProgress(
          fileArray[0], 
          currentFolder,
          (percent, loaded, total) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileArray[0].name]: percent
            }));
          }
        );
      } else {
        await bucketService.uploadMultipleFiles(fileArray, currentFolder);
      }
      
      setSuccess('Files uploaded successfully!');
      loadFiles();
      loadBucketInfo();
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploadProgress({});
    }
  }, [currentFolder]);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const folderPath = currentFolder ? `${currentFolder}/${newFolderName}` : newFolderName;
      await bucketService.createFolder(folderPath);
      setSuccess('Folder created successfully!');
      setNewFolderName('');
      setShowCreateFolder(false);
      loadFolderStructure();
    } catch (err) {
      setError('Failed to create folder: ' + err.message);
    }
  };

  // Delete selected items
  const handleDelete = async () => {
    if (selectedItems.size === 0) return;
    
    try {
      const itemsArray = Array.from(selectedItems);
      await bucketService.deleteMultipleFiles(itemsArray);
      setSuccess('Items deleted successfully!');
      setSelectedItems(new Set());
      loadFiles();
      loadBucketInfo();
    } catch (err) {
      setError('Failed to delete items: ' + err.message);
    }
  };

  // Download file
  const handleDownload = async (fileKey, fileName) => {
    try {
      await bucketService.downloadAndSave(fileKey, fileName);
      setSuccess('File downloaded successfully!');
    } catch (err) {
      setError('Failed to download file: ' + err.message);
    }
  };

  // Search files
  const handleSearch = async (term) => {
    if (!term.trim()) {
      loadFiles();
      return;
    }
    
    try {
      const response = await bucketService.searchFiles(term, currentFolder);
      // Access files from response.data
      setFiles(response.data?.files || []);
    } catch (err) {
      setError('Search failed: ' + err.message);
    }
  };

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? result : -result;
  });

  // Filter files
  const filteredFiles = sortedFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📊',
      pptx: '📊',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎬',
      mp3: '🎵',
      zip: '📦',
      rar: '📦'
    };
    return iconMap[ext] || '📄';
  };

  // Breadcrumb navigation
  const breadcrumbs = currentFolder.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Syte Documents
              </h1>
              <p className="text-gray-600 mt-1">Modern file management system</p>
            </div>
            
            {/* Bucket Info */}
            {bucketInfo && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <HardDrive size={16} />
                  <span>{formatFileSize(bucketInfo.totalSize || 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <File size={16} />
                  <span>{bucketInfo.totalFiles || 0} files</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-blue-500" />
                  <span>Cloud Storage</span>
                </div>
              </div>
            )}
          </div>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button
              onClick={() => setCurrentFolder('')}
              className="hover:text-blue-600 transition-colors"
            >
              Root
            </button>
            {breadcrumbs.map((folder, index) => (
              <React.Fragment key={index}>
                <ChevronRight size={16} />
                <button
                  onClick={() => setCurrentFolder(breadcrumbs.slice(0, index + 1).join('/'))}
                  className="hover:text-blue-600 transition-colors"
                >
                  {folder}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Upload size={18} />
                Upload
              </button>
              
              <button
                onClick={() => setShowCreateFolder(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FolderPlus size={18} />
                New Folder
              </button>
              
              <button
                onClick={loadFiles}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} transition-colors`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} transition-colors`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="size-asc">Size (Small)</option>
                <option value="size-desc">Size (Large)</option>
                <option value="lastModified-desc">Recent</option>
                <option value="lastModified-asc">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-2">Uploading Files...</h3>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{fileName}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div 
          className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 min-h-96 ${
            isDragging ? 'border-blue-400 bg-blue-50/50' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Drag & Drop Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-100/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-blue-400 flex items-center justify-center z-10">
              <div className="text-center">
                <Upload size={48} className="mx-auto text-blue-500 mb-4" />
                <p className="text-xl font-semibold text-blue-700">Drop files here to upload</p>
                <p className="text-blue-600">Files will be uploaded to {currentFolder || 'root folder'}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin mr-2" size={24} />
              <span>Loading files...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <Cloud size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No files found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search term' : 'Upload some files to get started'}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Upload Files
              </button>
            </div>
          )}

          {/* Files Grid View */}
          {!isLoading && viewMode === 'grid' && filteredFiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.key}
                  className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    const newSelected = new Set(selectedItems);
                    if (newSelected.has(file.key)) {
                      newSelected.delete(file.key);
                    } else {
                      newSelected.add(file.key);
                    }
                    setSelectedItems(newSelected);
                  }}
                >
                  <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-200 ${
                    selectedItems.has(file.key) ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                  }`} />
                  
                  <div className="relative">
                    <div className="text-4xl mb-3 text-center">
                      {getFileIcon(file.name)}
                    </div>
                    
                    <h3 className="font-medium text-sm text-gray-900 mb-1 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {formatFileSize(file.size)}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      {formatDate(file.lastModified)}
                    </p>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file.key, file.name);
                          }}
                          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItems(new Set([file.key]));
                            handleDelete();
                          }}
                          className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Files List View */}
          {!isLoading && viewMode === 'list' && filteredFiles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Modified</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.key}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedItems.has(file.key) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(file.key)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedItems);
                              if (e.target.checked) {
                                newSelected.add(file.key);
                              } else {
                                newSelected.delete(file.key);
                              }
                              setSelectedItems(newSelected);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xl">{getFileIcon(file.name)}</span>
                          <span className="font-medium text-gray-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(file.lastModified)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(file.key, file.name)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItems(new Set([file.key]));
                              handleDelete();
                            }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selection Actions */}
        {selectedItems.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl border border-gray-200 px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Upload size={24} />
                <span>Choose Files</span>
              </button>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

export default SyteDocuments;