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

  const handleDownload = async (url, docType) => {
    try {
      setDownloadingDoc(docType)
      
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `${documentTypes[docType]?.name || 'Document'}.pdf`
      link.target = '_blank'
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloadingDoc(null)
    }
  }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Project Documents
              </h1>
              <p className="text-gray-600 text-lg mt-1">Access and manage your project documentation</p>
            </div>
          </div>
          
          {documentUrls.updated_at && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 w-fit border border-gray-200/50">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {formatDate(documentUrls.updated_at)}</span>
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
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${gradient} text-white text-2xl shadow-lg`}>
                      {icon}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">{name}</h3>
                  <p className="text-sm text-gray-500 flex items-center space-x-1 mb-6">
                    <span>📄</span>
                    <span>PDF Document</span>
                  </p>
                  
                  {/* Large Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleView(url, key)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Eye className="w-5 h-5" />
                      <span className="font-medium">View</span>
                    </button>
                    <button
                      onClick={() => handleDownload(url, key)}
                      disabled={downloadingDoc === key}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
        {viewingDocument && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-[80%] h-[80%] flex flex-col border border-white/20">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-t-3xl">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${documentTypes[viewingDocument.type]?.gradient || 'from-gray-400 to-gray-500'}`}>
                    <span className="text-2xl text-white">{documentTypes[viewingDocument.type]?.icon || '📄'}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">
                      {documentTypes[viewingDocument.type]?.name || 'Document'}
                    </h3>
                    <p className="text-sm text-gray-500">PDF Document • {zoom}% zoom</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Zoom Controls */}
                  <div className="flex items-center space-x-2 bg-gray-100/50 rounded-xl p-1">
                    <button
                      onClick={handleZoomOut}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 px-2">{zoom}%</span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <button
                    onClick={() => window.open(viewingDocument.url, '_blank')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={() => handleDownload(viewingDocument.url, viewingDocument.type)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={closeViewer}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-hidden p-6">
                <div className="w-full h-full bg-gray-50 rounded-2xl overflow-hidden shadow-inner">
                  <iframe
                    src={`${viewingDocument.url}#zoom=${zoom}`}
                    className="w-full h-full border-0 rounded-2xl"
                    title={documentTypes[viewingDocument.type]?.name || 'Document'}
                    allow="fullscreen"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents