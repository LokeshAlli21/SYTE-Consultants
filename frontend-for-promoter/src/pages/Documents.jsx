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
    cc_uploaded_url: { name: 'Completion Certificate', icon: '📋', color: 'bg-emerald-100 text-emerald-700' },
    plan_uploaded_url: { name: 'Plan Document', icon: '📐', color: 'bg-blue-100 text-blue-700' },
    search_report_uploaded_url: { name: 'Search Report', icon: '🔍', color: 'bg-purple-100 text-purple-700' },
    da_uploaded_url: { name: 'DA Document', icon: '📄', color: 'bg-orange-100 text-orange-700' },
    pa_uploaded_url: { name: 'PA Document', icon: '📝', color: 'bg-green-100 text-green-700' },
    satbara_uploaded_url: { name: 'Satbara Document', icon: '🏛️', color: 'bg-indigo-100 text-indigo-700' },
    promoter_letter_head_uploaded_url: { name: 'Promoter Letter Head', icon: '✉️', color: 'bg-pink-100 text-pink-700' },
    promoter_sign_stamp_uploaded_url: { name: 'Promoter Sign & Stamp', icon: '✍️', color: 'bg-yellow-100 text-yellow-700' }
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

  // Direct download using window.open to avoid CORS issues
  const handleDownload = (url, docType) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = url
      link.download = `${documentTypes[docType]?.name || 'Document'}.pdf`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      
      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: open in new tab
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading documents...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your documents</p>
        </div>
      </div>
    )
  }

  const availableDocuments = Object.entries(documentUrls)
    .filter(([key, url]) => url && documentTypes[key])
    .map(([key, url]) => ({ key, url, ...documentTypes[key] }))

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Project Documents</h1>
              <p className="text-gray-600">Project ID: <span className="font-semibold text-blue-600">{id}</span></p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Updated: {documentUrls.updated_at ? formatDate(documentUrls.updated_at) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {availableDocuments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Documents Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No documents have been uploaded for this project yet. Documents will appear here once they are uploaded.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableDocuments.map(({ key, url, name, icon, color }) => (
              <div key={key} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${color} text-2xl font-semibold`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{name}</h3>
                      <p className="text-sm text-gray-500 mb-4">PDF Document</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(url, key)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white/80 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(url, key)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
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

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${documentTypes[viewingDocument.type]?.color || 'bg-gray-100 text-gray-700'}`}>
                  {documentTypes[viewingDocument.type]?.icon || '📄'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {documentTypes[viewingDocument.type]?.name || 'Document'}
                  </h3>
                  <p className="text-sm text-gray-500">PDF Document</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDownload(viewingDocument.url, viewingDocument.type)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={closeViewer}
                  className="inline-flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
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
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents