import React, { useEffect, useState } from 'react'
import { Download, Eye, FileText, Calendar, AlertCircle, X } from 'lucide-react'
import databaseService from '../backend-services/database/database'
import { useParams } from 'react-router-dom'

function Documents() {
  const {id} = useParams() // Get project ID from URL parameters
  const [documentUrls, setDocumentUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [downloadingDoc, setDownloadingDoc] = useState(null)

  // Document type mapping with user-friendly names
  const documentTypes = {
    cc_uploaded_url: { 
      name: 'Completion Certificate', 
      icon: '📋', 
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-100'
    },
    plan_uploaded_url: { 
      name: 'Plan Document', 
      icon: '📐', 
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100'
    },
    search_report_uploaded_url: { 
      name: 'Search Report', 
      icon: '🔍', 
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-100'
    },
    da_uploaded_url: { 
      name: 'DA Document', 
      icon: '📄', 
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      iconBg: 'bg-orange-100'
    },
    pa_uploaded_url: { 
      name: 'PA Document', 
      icon: '📝', 
      color: 'bg-green-50 text-green-700 border-green-200',
      iconBg: 'bg-green-100'
    },
    satbara_uploaded_url: { 
      name: 'Satbara Document', 
      icon: '🏛️', 
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-100'
    },
    promoter_letter_head_uploaded_url: { 
      name: 'Promoter Letter Head', 
      icon: '✉️', 
      color: 'bg-pink-50 text-pink-700 border-pink-200',
      iconBg: 'bg-pink-100'
    },
    promoter_sign_stamp_uploaded_url: { 
      name: 'Promoter Sign & Stamp', 
      icon: '✍️', 
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      iconBg: 'bg-yellow-100'
    }
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
    setViewingDocument({ url, type: docType })
  }

  const handleDownload = async (url, docType) => {
    try {
      setDownloadingDoc(docType)
      
      // Fetch the file
      const response = await fetch(url)
      const blob = await response.blob()
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${documentTypes[docType]?.name || 'Document'}.pdf`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: open in new tab
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
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
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading documents...</p>
        </div>
      </div>
    )
  }

  const availableDocuments = Object.entries(documentUrls)
    .filter(([key, url]) => url && documentTypes[key])
    .map(([key, url]) => ({ key, url, ...documentTypes[key] }))

  return (
    <div className="w-full">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Documents</h1>
              <p className="text-gray-600">Access and manage your project documentation</p>
            </div>
          </div>
          
          {documentUrls.updated_at && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {formatDate(documentUrls.updated_at)}</span>
            </div>
          )}
        </div>

        {/* Documents Grid */}
        {availableDocuments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 p-12 text-center">
            <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your project documents will appear here once they are uploaded and processed.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {availableDocuments.map(({ key, url, name, icon, color, iconBg }) => (
              <div key={key} className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border-2 border-white/50 ${color.replace('bg-', 'hover:bg-')} p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-white/90`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${iconBg} text-lg`}>
                    {icon}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleView(url, key)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(url, key)}
                      disabled={downloadingDoc === key}
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Download"
                    >
                      {downloadingDoc === key ? (
                        <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-tight">{name}</h3>
                <p className="text-xs text-gray-500">PDF Document</p>
              </div>
            ))}
          </div>
        )}

        {/* Document Viewer Modal */}
        {viewingDocument && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-white/20">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${documentTypes[viewingDocument.type]?.iconBg || 'bg-gray-100'}`}>
                    <span className="text-lg">{documentTypes[viewingDocument.type]?.icon || '📄'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {documentTypes[viewingDocument.type]?.name || 'Document'}
                    </h3>
                    <p className="text-sm text-gray-500">PDF Document</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(viewingDocument.url, viewingDocument.type)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={closeViewer}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
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