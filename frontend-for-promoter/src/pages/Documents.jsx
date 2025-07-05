import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'

function Documents() {
  const { id } = useParams()
  const [documentUrls, setDocumentUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewingDocument, setViewingDocument] = useState(null)

  // Document type mapping with user-friendly names
  const documentTypes = {
    cc_uploaded_url: { name: 'Completion Certificate', icon: '📋', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    plan_uploaded_url: { name: 'Plan Document', icon: '📐', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    search_report_uploaded_url: { name: 'Search Report', icon: '🔍', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    da_uploaded_url: { name: 'DA Document', icon: '📄', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    pa_uploaded_url: { name: 'PA Document', icon: '📝', color: 'bg-green-50 text-green-600 border-green-200' },
    satbara_uploaded_url: { name: 'Satbara Document', icon: '🏛️', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    promoter_letter_head_uploaded_url: { name: 'Promoter Letter Head', icon: '✉️', color: 'bg-pink-50 text-pink-600 border-pink-200' },
    promoter_sign_stamp_uploaded_url: { name: 'Promoter Sign & Stamp', icon: '✍️', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' }
  }

  useEffect(() => {
    const fetchProjectDocuments = async (id) => {
      try {
        setLoading(true)
        const projectDocuments = await databaseService.getProjectDocuments(id)
        console.log("Project Documents:", projectDocuments)
        
        // Handle case where no documents are returned or empty object
        if (projectDocuments && typeof projectDocuments === 'object') {
          setDocumentUrls(projectDocuments)
        } else {
          setDocumentUrls({})
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
        setDocumentUrls({})
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProjectDocuments(id)
    } else {
      setLoading(false)
    }
  }, [id])

  const handleView = (url, docType) => {
    setViewingDocument({ url, type: docType })
  }

  // Enhanced download function with better mobile support
  const handleDownload = async (url, docType) => {
    try {
      // For mobile devices, try to fetch and create blob
      if (window.navigator && window.navigator.share) {
        // If Web Share API is available, use it
        const response = await fetch(url)
        const blob = await response.blob()
        const file = new File([blob], `${documentTypes[docType]?.name || 'Document'}.pdf`, { type: 'application/pdf' })
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: documentTypes[docType]?.name || 'Document',
            text: `Download ${documentTypes[docType]?.name || 'Document'}`
          })
          return
        }
      }

      // Fallback to traditional download
      const link = document.createElement('a')
      link.href = url
      link.download = `${documentTypes[docType]?.name || 'Document'}.pdf`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      // Final fallback: open in new tab
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const closeViewer = () => {
    setViewingDocument(null)
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
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Documents</h3>
          <p className="text-gray-500 text-sm">Please wait while we fetch your documents...</p>
        </div>
      </div>
    )
  }

  const availableDocuments = Object.entries(documentUrls)
    .filter(([key, url]) => url && documentTypes[key])
    .map(([key, url]) => ({ key, url, ...documentTypes[key] }))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Mobile Optimized */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl text-white shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">Project Documents</h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                ID: <span className="font-semibold text-blue-600">{id}</span>
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs sm:text-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 whitespace-nowrap">
                Updated: {documentUrls.updated_at ? formatDate(documentUrls.updated_at) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid - Mobile First */}
      <div className="space-y-4">
        {availableDocuments.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/30 p-8 sm:p-12 text-center">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Documents Available</h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
              No documents have been uploaded for this project yet. Documents will appear here once they are uploaded.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {availableDocuments.map(({ key, url, name, icon, color }) => (
              <div key={key} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Document Icon */}
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 ${color} shrink-0`}>
                      <span className="text-lg sm:text-xl">{icon}</span>
                    </div>
                    
                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2">{name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">PDF Document</p>
                      
                      {/* Action Buttons - Mobile Stacked */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={() => handleView(url, key)}
                          className="flex items-center justify-center px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 bg-white/80 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 order-2 sm:order-1"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(url, key)}
                          className="flex items-center justify-center px-4 py-2.5 sm:py-2 border border-transparent rounded-lg sm:rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 order-1 sm:order-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal - Mobile Optimized */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header - Mobile Optimized */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className={`p-1.5 sm:p-2 rounded-lg ${documentTypes[viewingDocument.type]?.color || 'bg-gray-100 text-gray-700'} shrink-0`}>
                  <span className="text-sm sm:text-base">{documentTypes[viewingDocument.type]?.icon || '📄'}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                    {documentTypes[viewingDocument.type]?.name || 'Document'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">PDF Document</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <button
                  onClick={() => handleDownload(viewingDocument.url, viewingDocument.type)}
                  className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={closeViewer}
                  className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg sm:rounded-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content - Full height on mobile */}
            <div className="flex-1 overflow-hidden bg-gray-50 min-h-0">
              <iframe
                src={viewingDocument.url}
                className="w-full h-full border-0"
                title={documentTypes[viewingDocument.type]?.name || 'Document'}
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents