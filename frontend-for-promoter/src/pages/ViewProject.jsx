import React, { useEffect, useState } from 'react'
import { MapPin, Calendar, CheckCircle, Clock, User, Phone, Mail, FileText, Download, Building, Home } from 'lucide-react'
import databaseService from '../backend-services/database/database'
import { useParams } from 'react-router-dom'

function ViewProject() {

  const {id} = useParams()

  const [project, setProject] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjectDetails = async (id) => {
      try {
        setLoading(true)
        const projectDetails = await databaseService.getProjectById(id)
        console.log("Project Details:", projectDetails)
        if (projectDetails) {
          setProject(projectDetails)
        } else {
          setError("Project not found")
        }
      } catch (error) {
        console.error("Error fetching project details:", error)
        setError("Failed to load project details")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetails(id)
  }, [id])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDaysUntilExpiryColor = (days) => {
    if (days > 365) return 'text-green-600'
    if (days > 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screenflex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-2" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-3 mb-2">
            <Building className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {project.basic_info?.project_name || 'Project Details'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status?.project_status)}`}>
              {project.status?.project_status?.toUpperCase() || 'UNKNOWN'}
            </span>
            <span className="text-sm text-gray-500">
              RERA: {project.rera_details?.rera_number || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Project Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Home className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Project Information</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Building className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Project Type</p>
                <p className="text-sm text-gray-600">{project.basic_info?.project_type || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {project.basic_info?.project_address || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {project.basic_info?.city}, {project.basic_info?.district} - {project.basic_info?.project_pincode}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <User className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Promoter</p>
                <p className="text-sm text-gray-600">{project.basic_info?.promoter_name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Status & Timeline */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Project Status</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Registration Date</span>
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-sm text-gray-900">{formatDate(project.status?.registration_date)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Expiry Date</span>
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-sm text-gray-900">{formatDate(project.status?.expiry_date)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Days Until Expiry</span>
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <p className={`text-sm font-medium ${getDaysUntilExpiryColor(project.status?.days_until_expiry)}`}>
                {project.status?.days_until_expiry ? `${project.status.days_until_expiry} days` : 'N/A'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Project Age</span>
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-sm text-gray-900">
                {project.status?.project_age_days ? `${project.status.project_age_days} days` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* RERA Details */}
        {project.rera_details && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">RERA Details</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">RERA Number</span>
                <span className="text-sm text-gray-900 font-mono">
                  {project.rera_details.rera_number || 'N/A'}
                </span>
              </div>
              
              {project.rera_details.rera_certificate_url && (
                <div className="pt-2 border-t">
                  <a 
                    href={project.rera_details.rera_certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download RERA Certificate</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Professional Team */}
        {project.professional_team && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Professional Team</h2>
            </div>
            
            <div className="space-y-4">
              {/* Engineer */}
              {project.professional_team.engineer?.name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Engineer</span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{project.professional_team.engineer.name}</p>
                  {project.professional_team.engineer.contact && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{project.professional_team.engineer.contact}</span>
                    </div>
                  )}
                  {project.professional_team.engineer.email && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{project.professional_team.engineer.email}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Architect */}
              {project.professional_team.architect?.name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Architect</span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{project.professional_team.architect.name}</p>
                  {project.professional_team.architect.contact && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{project.professional_team.architect.contact}</span>
                    </div>
                  )}
                  {project.professional_team.architect.email && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{project.professional_team.architect.email}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* CA */}
              {project.professional_team.ca?.name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Chartered Accountant</span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{project.professional_team.ca.name}</p>
                  {project.professional_team.ca.contact && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{project.professional_team.ca.contact}</span>
                    </div>
                  )}
                  {project.professional_team.ca.email && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{project.professional_team.ca.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Project Created: {formatDate(project.timestamps?.project_created_date)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Last Updated: {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewProject