import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'

function Documents() {
  const { id } = useParams()
  const [documentUrls, setDocumentUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [downloadingDoc, setDownloadingDoc] = useState(null)

  // Document type mapping with user-friendly names
  const documentTypes = {
    cc_uploaded_url: { name: 'Completion Certificate', icon: '📋', color: 'from-emerald-500 to-teal-500' },
    plan_uploaded_url: { name: 'Plan Document', icon: '📐', color: 'from-blue-500 to-cyan-500' },
    search_report_uploaded_url: { name: 'Search Report', icon: '🔍', color: 'from-purple-500 to-pink-500' },
    da_uploaded_url: { name: 'DA Document', icon: '📄', color: 'from-orange-500 to-red-500' },
    pa_uploaded_url: { name: 'PA Document', icon: '📝', color: 'from-green-500 to-emerald-500' },
    satbara_uploaded_url: { name: 'Satbara Document', icon: '🏛️', color: 'from-indigo-500 to-purple-500' },
    promoter_letter_head_uploaded_url: { name: 'Promoter Letter Head', icon: '✉️', color: 'from-pink-500 to-rose-500' },
    promoter_sign_stamp_uploaded_url: { name: 'Promoter Sign & Stamp', icon: '✍️', color: 'from-yellow-500 to-orange-500' }
  }

  useEffect(() => {
    const fetchProjectDocuments = async (id) => {
      try {
        setLoading(true)
        const projectDocuments = await databaseService.getProjectDocuments(id)
        console.log("Project Documents:", projectDocuments)
        
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
    console.log('Opening document:', url)
    setViewingDocument({ url, type: docType })
  }

  const handleDownload = async (url, docType) => {
    console.log('Downloading document:', url)
    setDownloadingDoc(docType)
    
    const fileName = `${documentTypes[docType]?.name.replace(/\s+/g, '_') || 'Document'}.pdf`
    
    try {
      // Method 1: Try creating a download link
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Add a small delay to show download state
      setTimeout(() => {
        setDownloadingDoc(null)
      }, 1000)
      
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: Open in new window
      window.open(url, '_blank', 'noopener,noreferrer')
      setDownloadingDoc(null)
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
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto opacity-50"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading documents...</p>
        </div>
      </div>
    )
  }

  const availableDocuments = Object.entries(documentUrls)
    .filter(([key, url]) => url && documentTypes[key])
    .map(([key, url]) => ({ key, url, ...documentTypes[key] }))

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white mb-4 shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Project Documents
          </h1>
          <p className="text-gray-600 mb-4">Access and manage your project files</p>
          {documentUrls.updated_at && (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                Updated: {formatDate(documentUrls.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Documents List - Full Width Cards */}
      <div className="space-y-4">
        {availableDocuments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">No Documents Available</h3>
            <p className="text-gray-600">Your project documents will appear here once uploaded</p>
          </div>
        ) : (
          availableDocuments.map(({ key, url, name, icon, color }) => (
            <div key={key} className="w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                {/* Left side - Icon and Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{name}</h3>
                    <p className="text-gray-500 text-sm">PDF Document</p>
                  </div>
                </div>
                
                {/* Right side - Action Buttons */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <button
                    onClick={() => handleView(url, key)}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(url, key)}
                    disabled={downloadingDoc === key}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingDoc === key ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${documentTypes[viewingDocument.type]?.color || 'from-gray-400 to-gray-600'} text-white shadow-lg`}>
                  <span className="text-xl">{documentTypes[viewingDocument.type]?.icon || '📄'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {documentTypes[viewingDocument.type]?.name || 'Document'}
                  </h3>
                  <p className="text-sm text-gray-600">PDF Document Preview</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(viewingDocument.url, viewingDocument.type)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={closeViewer}
                  className="inline-flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-hidden bg-gray-50">
              <iframe
                src={viewingDocument.url}
                className="w-full h-full border-0"
                title={documentTypes[viewingDocument.type]?.name || 'Document'}
                onLoad={() => console.log('PDF loaded successfully')}
                onError={() => console.error('Failed to load PDF')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents