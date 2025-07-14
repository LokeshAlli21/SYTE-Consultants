import React, { useEffect, useState } from 'react'
import { Download, Eye, FileText, Calendar, AlertCircle, X, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import databaseService from '../backend-services/database/database'
import { useParams } from 'react-router-dom'

function Documents() {

    const { id } = useParams() // Get project ID from URL parameters
  const [documentUrls, setDocumentUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [downloadingDoc, setDownloadingDoc] = useState(null)
  const [zoom, setZoom] = useState(100)


  // Document type mapping with modern styling
  const documentTypes = {
    cc_uploaded_url: { 
      name: 'Completion Certificate', 
      icon: '📋', 
      gradient: 'from-emerald-500 to-emerald-600',
      color: 'emerald',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/50',
      text: 'text-emerald-700'
    },
    plan_uploaded_url: { 
      name: 'Plan Document', 
      icon: '📐', 
      gradient: 'from-blue-500 to-blue-600',
      color: 'blue',
      bg: 'bg-blue-50/80',
      border: 'border-blue-200/50',
      text: 'text-blue-700'
    },
    search_report_uploaded_url: { 
      name: 'Search Report', 
      icon: '🔍', 
      gradient: 'from-purple-500 to-purple-600',
      color: 'purple',
      bg: 'bg-purple-50/80',
      border: 'border-purple-200/50',
      text: 'text-purple-700'
    },
    da_uploaded_url: { 
      name: 'DA Document', 
      icon: '📄', 
      gradient: 'from-orange-500 to-orange-600',
      color: 'orange',
      bg: 'bg-orange-50/80',
      border: 'border-orange-200/50',
      text: 'text-orange-700'
    },
    pa_uploaded_url: { 
      name: 'PA Document', 
      icon: '📝', 
      gradient: 'from-green-500 to-green-600',
      color: 'green',
      bg: 'bg-green-50/80',
      border: 'border-green-200/50',
      text: 'text-green-700'
    },
    satbara_uploaded_url: { 
      name: 'Satbara Document', 
      icon: '🏛️', 
      gradient: 'from-indigo-500 to-indigo-600',
      color: 'indigo',
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200/50',
      text: 'text-indigo-700'
    },
    promoter_letter_head_uploaded_url: { 
      name: 'Promoter Letter Head', 
      icon: '✉️', 
      gradient: 'from-pink-500 to-pink-600',
      color: 'pink',
      bg: 'bg-pink-50/80',
      border: 'border-pink-200/50',
      text: 'text-pink-700'
    },
    promoter_sign_stamp_uploaded_url: { 
      name: 'Promoter Sign & Stamp', 
      icon: '✍️', 
      gradient: 'from-yellow-500 to-yellow-600',
      color: 'yellow',
      bg: 'bg-yellow-50/80',
      border: 'border-yellow-200/50',
      text: 'text-yellow-700'
    }
  }

  useEffect(() => {
    // Simulate API call with mock data
    const fetchProjectDocuments = async () => {
      try {
        setLoading(true)
        const documents = await databaseService.getProjectDocuments(id)
        setDocumentUrls(documents)
      } catch (error) {
        console.error("Error fetching documents:", error)
        setDocumentUrls({})
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDocuments(id)
  }, [id])

  const handleView = (url, docType) => {
    setViewingDocument({ url, type: docType })
    setZoom(100)
  }

  const handleDownload = async (s3Key, docType) => {
  // Input validation
  if (!s3Key) {
    console.error('No S3 key provided for download');
    setDownloadError('Download URL not available');
    return;
  }

  // Set loading state
  setDownloadingDoc(docType);
  setDownloadError(null);

  console.log('Downloading file with S3 key:', s3Key);

  try {
    // Extract filename from S3 key or use document type name
    const s3Filename = s3Key.split('/').pop();
    const docTypeName = documentTypes[docType]?.name || 'Document';
    const filename = s3Filename || `${docTypeName}.pdf`;
    
    // Download and save file using database service
    await databaseService.downloadAndSaveFile(s3Key, filename);
    
    console.log('✅ File downloaded successfully:', filename);
    
  } catch (error) {
    console.error('❌ Download failed:', error);
    
    // Set user-friendly error message
    const errorMessage = error.message || 'Download failed. Please try again.';
    setDownloadError(errorMessage);
    
    // Optional: Fallback to direct URL opening if available
    // if (fallbackUrl) {
    //   window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    // }
    
  } finally {
    // Always clear loading state
    setDownloadingDoc(null);
  }
};

  const closeViewer = () => {
    setViewingDocument(null)
    setZoom(100)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screenflex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading documents...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your files</p>
        </div>
      </div>
    )
  }

  const availableDocuments = Object.entries(documentUrls)
    .filter(([key, url]) => url && documentTypes[key])
    .map(([key, url]) => ({ key, url, ...documentTypes[key] }))

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-4">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Project Documents
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Access and manage your files</p>
            </div>
          </div>
          
          {documentUrls.updated_at && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1.5 w-fit border border-green-200/80">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Updated: {formatDate(documentUrls.updated_at)}</span>
            </div>
          )}
        </div>

        {/* Documents Grid */}
        {availableDocuments.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Documents Available</h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg">
              Your project documents will appear here once they are uploaded and processed.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {availableDocuments.map(({ key, url, name, icon, gradient, bg, border, text }) => (
              <div key={key} className={`group relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border ${border} p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80`}>
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
                
                <div className="relative z-10 ">
                  <div className=' flex flex-row gap-2 items-center'>

                    <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${gradient} text-white text-2xl shadow-lg`}>
                      {icon}
                    </div>
                  </div>
                <div className=' flex-1'>
                    <h3 className="font-bold  text-gray-900 mb-2 text-lg leading-tight">{name}</h3>
                  
                  <p className="text-sm text-gray-500 flex items-center space-x-1 mb-6">
                    <span>📄</span>
                    <span>PDF Document</span>
                  </p>
                </div>

                  </div>
                  
                  {/* Large Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleView(url, key)}
                      className="flex-1 w-[150px] flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Eye className="w-5 h-5" />
                      <span className="font-medium">View</span>
                    </button>
                    <button
                      onClick={() => handleDownload(url, key)}
                      disabled={downloadingDoc === key}
                      className="flex-1 w-[150px] flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {downloadingDoc === key ? (
                        <>
                          <div className="w-5 h-5 border-2 border-green-200 border-t-white rounded-full animate-spin"></div>
                          <span className="font-medium">Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span className="font-medium">Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modern Document Viewer Modal */}
         {/* Simple Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <div className="flex justify-end p-2">
              <button
                onClick={closeViewer}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Iframe */}
            <div className="flex-1 px-4 pb-4">
              <iframe
                src={viewingDocument.url}
                className="w-full h-full border-0 rounded"
                title={viewingDocument.title}
                allow="fullscreen"
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Documents