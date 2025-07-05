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
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading documents...</p>
        </div>
      </div>
    )
  }

  const availableDocuments = Object.entries(documentUrls)
    .filter(([key, url]) => url && documentTypes[key])
    .map(([key, url]) => ({ key, url, ...documentTypes[key] }))

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Project Documents</h1>
          <p className="text-gray-600 text-sm mb-3">Access and download your project files</p>
          {documentUrls.updated_at && (
            <div className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-medium text-emerald-700">
                Updated: {formatDate(documentUrls.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {availableDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
            <p className="text-gray-600 text-sm">Documents will appear here once uploaded</p>
          </div>
        ) : (
          availableDocuments.map(({ key, url, name, icon, color }) => (
            <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 ${color} flex items-center justify-center text-xl`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{name}</h3>
                  <p className="text-xs text-gray-500">PDF Document</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(url, key)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDownload(url, key)}
                    className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${documentTypes[viewingDocument.type]?.color || 'bg-gray-100 text-gray-700'}`}>
                  <span className="text-lg">{documentTypes[viewingDocument.type]?.icon || '📄'}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {documentTypes[viewingDocument.type]?.name || 'Document'}
                  </h3>
                  <p className="text-xs text-gray-500">PDF Preview</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(viewingDocument.url, viewingDocument.type)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={closeViewer}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
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