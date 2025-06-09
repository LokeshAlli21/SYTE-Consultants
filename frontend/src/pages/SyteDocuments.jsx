import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  FolderOpen, 
  File, 
  Download, 
  Trash2, 
  Eye, 
  Filter,
  RefreshCw,
  Grid,
  List,
  Upload,
  Image,
  FileText,
  Archive,
  Users,
  Calendar,
  HardDrive,
  X,
  ChevronRight,
  Home,
  SortAsc,
  SortDesc,
  MoreVertical,
  Share2,
  Copy,
  Star,
  StarOff,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import databaseService from '../backend-services/database/database';
import env from '../env/env';

// Loading Skeleton Components
const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
    <div className="flex items-center">
      <div className="p-3 bg-slate-200 rounded-xl w-12 h-12"></div>
      <div className="ml-4 flex-1">
        <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-slate-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const FolderCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 animate-pulse">
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-slate-200 rounded-xl w-12 h-12 mr-4"></div>
        <div className="flex-1">
          <div className="h-6 bg-slate-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-5 h-5 bg-slate-200 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-slate-200 rounded-full w-8 h-6"></div>
                <div className="w-5 h-5 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FileCardSkeleton = ({ viewMode }) => (
  <div className={`border border-slate-200 rounded-xl animate-pulse ${
    viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
  }`}>
    <div className={`flex items-center ${viewMode === 'list' ? 'flex-1' : 'mb-3'}`}>
      <div className="w-4 h-4 bg-slate-200 rounded mr-3"></div>
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-8 h-8 bg-slate-200 rounded-lg"></div>
      ))}
    </div>
  </div>
);

const SyteDocuments = () => {
  // State management
  const [documents, setDocuments] = useState(null);
  const [userPhotos, setUserPhotos] = useState(null);
  const [bucketStats, setBucketStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [fullScreenPreview, setFullScreenPreview] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [recentFiles, setRecentFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showDropdown, setShowDropdown] = useState(null);
  const [folderLoading, setFolderLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStatsLoading(true);
      setDocumentsLoading(true);
      setPhotosLoading(true);
      
      const [docsResponse, photosResponse, statsResponse] = await Promise.all([
        databaseService.getAllProjectFiles().finally(() => setDocumentsLoading(false)),
        databaseService.getAllUserPhotos().finally(() => setPhotosLoading(false)),
        databaseService.getBucketStats().finally(() => setStatsLoading(false))
      ]);

      if (!docsResponse || !photosResponse || !statsResponse) {
        throw new Error('Failed to fetch one or more resources');
      }
      
      setDocuments(docsResponse);
      setUserPhotos(photosResponse);
      setBucketStats(statsResponse);
      
      // Set recent files
      const allFiles = [...(docsResponse.allFiles || []), ...(photosResponse.allPhotos || [])];
      const recent = allFiles
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5);
      setRecentFiles(recent);
      
    } catch (err) {
      setError('Failed to load documents: ' + err.message);
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  const handleFolderClick = useCallback(async (folderPath, bucket) => {
    try {
      setFolderLoading(true);
      setSelectedFolder({ path: folderPath, bucket });
      
      let files = [];
      if (bucket === 'uploaded-documents') {
        const response = await databaseService.getProjectFilesByFolder(folderPath);
        files = response.files || [];
      } else if (bucket === 'user-profile-photos') {
        const response = await databaseService.getUserPhotosByRole(folderPath);
        files = response.photos || [];
      }
      
      setFolderFiles(files);
    } catch (err) {
      console.error('Error fetching folder files:', err);
    } finally {
      setFolderLoading(false);
    }
  }, []);

  const handleDeleteFile = useCallback(async (bucket, filePath) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await databaseService.deleteFile(bucket, filePath);
      // Refresh the current view
      if (selectedFolder) {
        handleFolderClick(selectedFolder.path, selectedFolder.bucket);
      } else {
        loadAllData();
      }
    } catch (err) {
      alert('Error deleting file: ' + err.message);
    }
  }, [selectedFolder, handleFolderClick, loadAllData]);

  const handlePreview = useCallback((fileUrl) => {
    setFullScreenPreview(fileUrl);
  }, []);

  const closeFullScreen = useCallback(() => {
    setFullScreenPreview(null);
  }, []);

  const toggleFavorite = useCallback((filePath) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(filePath)) {
        newFavorites.delete(filePath);
      } else {
        newFavorites.add(filePath);
      }
      return newFavorites;
    });
  }, []);

  const handleDownload = useCallback((fileUrl, fileName) => {
    const previewUrl = buildPreviewURL(fileUrl);
    console.log('Downloading file:', previewUrl);
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = fileName;
    link.click();
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Utility functions
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getFileIcon = useCallback((filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const iconMap = {
      'jpg': <Image className="w-4 h-4 text-emerald-500" />,
      'jpeg': <Image className="w-4 h-4 text-emerald-500" />,
      'png': <Image className="w-4 h-4 text-emerald-500" />,
      'gif': <Image className="w-4 h-4 text-emerald-500" />,
      'webp': <Image className="w-4 h-4 text-emerald-500" />,
      'svg': <Image className="w-4 h-4 text-emerald-500" />,
      'pdf': <FileText className="w-4 h-4 text-red-500" />,
      'doc': <FileText className="w-4 h-4 text-blue-600" />,
      'docx': <FileText className="w-4 h-4 text-blue-600" />,
      'xls': <FileText className="w-4 h-4 text-green-600" />,
      'xlsx': <FileText className="w-4 h-4 text-green-600" />,
      'zip': <Archive className="w-4 h-4 text-amber-600" />,
      'rar': <Archive className="w-4 h-4 text-amber-600" />,
    };
    
    return iconMap[extension] || <File className="w-4 h-4 text-slate-500" />;
  }, []);

  const isImageFile = useCallback((filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
  }, []);

  const isPdfFile = useCallback((filename) => {
    return filename.toLowerCase().endsWith('.pdf');
  }, []);

  // Filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    let files = [];
    
    if (selectedFolder) {
      files = [...folderFiles];
    } else {
      const allFiles = [];
      if (documents && (selectedBucket === 'all' || selectedBucket === 'uploaded-documents')) {
        allFiles.push(...documents.allFiles);
      }
      if (userPhotos && (selectedBucket === 'all' || selectedBucket === 'user-profile-photos')) {
        allFiles.push(...userPhotos.allPhotos);
      }
      files = allFiles;
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      files = files.filter(file => 
        file.name.toLowerCase().includes(searchLower) ||
        (file.folder && file.folder.toLowerCase().includes(searchLower)) ||
        (file.roleFolder && file.roleFolder.toLowerCase().includes(searchLower))
      );
    }

    // Sort files
    files.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'date':
          aValue = new Date(a.lastModified);
          bValue = new Date(b.lastModified);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return files;
  }, [folderFiles, documents, userPhotos, selectedBucket, selectedFolder, searchQuery, sortBy, sortOrder]);

  const supabaseBaseURL = env.supabaseUrl;

const buildPreviewURL = (url) => {
  const path = url.replace(/^https:\/\/+/, ""); // removes "https://"
  console.log('Building preview URL for:', `https://${supabaseBaseURL}/${path}`);

  return `https://${supabaseBaseURL}/${path}`;
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 bg-slate-200 rounded-xl w-24 animate-pulse"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>

          {/* Controls Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="h-12 bg-slate-200 rounded-xl w-full max-w-md animate-pulse"></div>
              <div className="flex items-center space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 rounded-xl w-32 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FolderCardSkeleton />
            <FolderCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 shadow-xl shadow-gray-300/30">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button 
              onClick={loadAllData}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 outline-none focus:ring-red-200 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className=" top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2F4C92] tracking-tight">Syte Documents</h1>
              <p className="text-slate-600 mt-1">Manage and organize your files with ease</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl focus:outline-none focus:ring-4 outline-none focus:ring-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-gray-300/30 hover:shadow-xl shadow-gray-300/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              {/* <button className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-4 outline-none focus:ring-slate-200 transition-all duration-200 shadow-sm hover:shadow-lg shadow-gray-300/30">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : bucketStats ? (
            <>
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-xl shadow-gray-300/30 hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-gray-300/30">
                    <HardDrive className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Files</p>
                    <p className="text-2xl font-bold text-slate-900">{bucketStats.statistics.overall.totalFiles}</p>
                    <p className="text-xs text-slate-500 mt-1">All buckets</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-xl shadow-gray-300/30 hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-gray-300/30">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Documents</p>
                    <p className="text-2xl font-bold text-slate-900">{bucketStats.statistics['uploaded-documents'].totalFiles}</p>
                    <p className="text-xs text-slate-500 mt-1">Project files</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-xl shadow-gray-300/30 hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-gray-300/30">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Profile Photos</p>
                    <p className="text-2xl font-bold text-slate-900">{bucketStats.statistics['user-profile-photos'].totalPhotos}</p>
                    <p className="text-xs text-slate-500 mt-1">User avatars</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-xl shadow-gray-300/30 hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-gray-300/30">
                    <Archive className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Size</p>
                    <p className="text-2xl font-bold text-slate-900">{formatFileSize(bucketStats.statistics.overall.totalSize)}</p>
                    <p className="text-xs text-slate-500 mt-1">Storage used</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

{/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-slate-300 rounded-xl focus:ring-4 outline-none focus:ring-teal-100  transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center space-x-3">
              {/* Bucket Filter */}
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 outline-none focus:ring-teal-100  transition-all duration-200 bg-white/50 backdrop-blur-sm font-medium"
              >
                <option value="all">All Buckets</option>
                <option value="uploaded-documents">Documents</option>
                <option value="user-profile-photos">Profile Photos</option>
              </select>

              {/* Sort Controls */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 outline-none focus:ring-teal-100  transition-all duration-200 bg-white/50 backdrop-blur-sm font-medium"
              >
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size </option>
                <option value="date">Sort by Date</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 border border-slate-300 rounded-xl hover:bg-slate-50 focus:ring-4 outline-none focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                {sortOrder === 'asc' ? 
                  <SortAsc className="w-5 h-5 text-slate-600" /> : 
                  <SortDesc className="w-5 h-5 text-slate-600" />
                }
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/50 backdrop-blur-sm border border-slate-300 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-gray-300/30' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-gray-300/30' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        {selectedFolder && (
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => setSelectedFolder(null)}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 font-medium">{selectedFolder.path}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {selectedFolder ? (
          // Folder Content View
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderOpen className="w-6 h-6 text-amber-500 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedFolder.path}</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      {folderLoading ? 'Loading...' : `${filteredAndSortedData.length} files`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {folderLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <FileCardSkeleton key={i} viewMode={viewMode} />
                  ))}
                </div>
              ) : filteredAndSortedData.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <File className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No files found</h3>
                  <p className="text-slate-500">This folder appears to be empty or no files match your search.</p>
                </div>
              ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}`}>
                  {filteredAndSortedData.map((file, index) => (
                    <div
                      key={index}
                      className={`border border-slate-200/60 rounded-xl bg-white/50 backdrop-blur-sm hover:shadow-lg shadow-gray-300/30 hover:scale-[1.02] transition-all duration-200 ${
                        viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
                      }`}
                    >
                      <div className={`flex items-center ${viewMode === 'list' ? 'flex-1' : 'mb-3'}`}>
                        {getFileIcon(file.name)}
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleFavorite(file.fullPath)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            favorites.has(file.fullPath)
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                        >
                          {favorites.has(file.fullPath) ? 
                            <Star className="w-4 h-4 fill-current" /> : 
                            <StarOff className="w-4 h-4" />
                          }
                        </button>
                        
                        {(isImageFile(file.name) || isPdfFile(file.name)) && (
                          <button
                            onClick={() => handlePreview(file.publicUrl)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDownload(file.publicUrl, file.name)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => copyToClipboard(file.publicUrl)}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        {/* <button
                          onClick={() => handleDeleteFile(selectedFolder.bucket, file.fullPath)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Folder Overview
          <div className="space-y-8">
            {/* Recent Files */}
            {recentFiles.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-gray-300/30 mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Recent Files</h3>
                    <p className="text-slate-600 text-sm">Your most recently modified files</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="border border-slate-200/60 rounded-xl p-4 bg-white/50 backdrop-blur-sm hover:shadow-lg shadow-gray-300/30 hover:scale-[1.02] transition-all duration-200"
                    >
                      <div className="flex items-center mb-3">
                        {getFileIcon(file.name)}
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {(isImageFile(file.name) || isPdfFile(file.name)) && (
                          <button
                            onClick={() => handlePreview(file.publicUrl)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDownload(file.publicUrl, file.name)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Folders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Documents Folder */}
              {(documentsLoading || (documents && documents.organizedByFolder)) && (
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl shadow-gray-300/30 transition-all duration-300">
                  {documentsLoading ? (
                    <FolderCardSkeleton />
                  ) : (
                    <>
                      <div className="p-6 border-b border-slate-200/60">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-gray-300/30 mr-4">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">Project Documents</h3>
                              <p className="text-slate-600 text-sm">Organized project files and documents</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                            {documents.totalFiles} files
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-3">
                          {Object.entries(documents.organizedByFolder).map(([folder, files]) => (
                            <button
                              key={folder}
                              onClick={() => handleFolderClick(folder, 'uploaded-documents')}
                              className="w-full border border-slate-200/60 rounded-xl p-4 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 bg-white/50 backdrop-blur-sm group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                  <FolderOpen className="w-5 h-5 text-amber-500 mr-3" />
                                  <div className="text-left flex-1">
                                    <p className="font-medium text-slate-900 capitalize">{folder}</p>
                                    <p className="text-sm text-slate-500">{files.length} files</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                    {files.length}
                                  </span>
                                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* User Photos Folder */}
              {(photosLoading || (userPhotos && userPhotos.organizedByRole)) && (
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl shadow-gray-300/30 transition-all duration-300">
                  {photosLoading ? (
                    <FolderCardSkeleton />
                  ) : (
                    <>
                      <div className="p-6 border-b border-slate-200/60">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-gray-300/30 mr-4">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">User Profile Photos</h3>
                              <p className="text-slate-600 text-sm">Profile pictures organized by role</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                            {userPhotos.totalPhotos} photos
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-3">
                          {Object.entries(userPhotos.organizedByRole).map(([role, photos]) => (
                            <button
                              key={role}
                              onClick={() => handleFolderClick(role, 'user-profile-photos')}
                              className="w-full border border-slate-200/60 rounded-xl p-4 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 bg-white/50 backdrop-blur-sm group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                  <Users className="w-5 h-5 text-purple-500 mr-3" />
                                  <div className="text-left flex-1">
                                    <p className="font-medium text-slate-900 capitalize">{role}</p>
                                    <p className="text-sm text-slate-500">{photos.length} photos</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                    {photos.length}
                                  </span>
                                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Preview Modal (original) */}
      {/* {fullScreenPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={closeFullScreen}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-300/30 max-h-[90vh] overflow-auto">
              {isImageFile(fullScreenPreview) ? (
                <img
                  src={fullScreenPreview}
                  alt="Preview"
                  className="max-w-full max-h-[80vh] object-contain"
                />
              ) : isPdfFile(fullScreenPreview) ? (
                <iframe
                  src={fullScreenPreview}
                  className="w-full h-[80vh]"
                  title="PDF Preview"
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-600">Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}
{/* Duplicate */}
      {fullScreenPreview && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="relative max-w-7xl max-h-full">
      <button
        onClick={closeFullScreen}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-300/30 max-h-[90vh] overflow-auto">
        {isImageFile(fullScreenPreview) ? (
          <img
            src={buildPreviewURL(fullScreenPreview)}
            alt="Preview"
            className="max-w-fit max-h-[80vh] object-contain"
          />
        ) : isPdfFile(fullScreenPreview) ? (
          <iframe
            src={buildPreviewURL(fullScreenPreview)}
            className="w-[80vw] h-[80vh]"
            title="PDF Preview"
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-600">Preview not available for this file type</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default SyteDocuments;