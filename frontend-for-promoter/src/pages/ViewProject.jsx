import React, { useEffect, useState } from 'react'
import { MapPin, Calendar, CheckCircle, Clock, User, Phone, Mail, FileText, Download, Building, Home, ArrowRight, Files, Layout, TrendingUp, Star, Award, Shield } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'

function ViewProject() {

  const {id} = useParams()
  const navigate = useNavigate()

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
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'expired':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
      case 'pending':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
    }
  }

  const getDaysUntilExpiryColor = (days) => {
    if (days > 365) return 'text-green-600'
    if (days > 90) return 'text-amber-600'
    return 'text-red-600'
  }

  const quickActionCards = [
    {
      id: 'documents',
      title: 'Documents',
      description: 'View project documents, certificates & legal papers',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      route: '/documents'
    },
    {
      id: 'units',
      title: 'Units',
      description: 'Explore available units, floor plans & pricing',
      icon: Layout,
      gradient: 'from-purple-500 to-pink-500',
      route: '/units'
    },
    {
      id: 'progress',
      title: 'Project Progress',
      description: 'Track construction progress & milestones',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-500',
      route: '/progress'
    }
  ]

  const handleCardClick = (route) => {
    if (!id) {
      setError("Project ID is not available")
      return
    }
    navigate(`${route}/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <Building className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-2" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Section */}
      <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {project.basic_info?.project_name || 'Project Details'}
                </h1>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(project.status?.project_status)} shadow-lg`}>
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {project.status?.project_status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-white/90">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">RERA: {project.rera_details?.rera_number || 'N/A'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-white/80 text-sm">Days Until Expiry</div>
                <div className="text-white font-bold text-xl">
                  {project.status?.days_until_expiry || 'N/A'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-white/90">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {project.basic_info?.city}, {project.basic_info?.district} - {project.basic_info?.project_pincode}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActionCards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.route)}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Project Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Project Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Building className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Project Type</p>
                <p className="text-sm text-gray-600">{project.basic_info?.project_type || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Address</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {project.basic_info?.project_address || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Promoter</p>
                <p className="text-sm text-gray-600">{project.basic_info?.promoter_name || 'N/A'}</p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Project Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-xl">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Project Timeline</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Registration</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {formatDate(project.status?.registration_date)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Expiry</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {formatDate(project.status?.expiry_date)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Project Age</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {project.status?.project_age_days ? `${project.status.project_age_days} days` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RERA Certificate */}
      {project.rera_details?.rera_certificate_url && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">RERA Certificate</h2>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">RERA Registration Number</p>
                <p className="text-lg font-bold text-indigo-600 font-mono">{project.rera_details.rera_number}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            
            <a 
              href={project.rera_details.rera_certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              <span>Download Certificate</span>
            </a>
          </div>
        </div>
      )}

      {/* Professional Team */}
      {project.professional_team && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Professional Team</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Engineer */}
            {project.professional_team.engineer?.name && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Engineer</span>
                </div>
                <p className="text-gray-900 font-semibold mb-2">{project.professional_team.engineer.name}</p>
                {project.professional_team.engineer.contact && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{project.professional_team.engineer.contact}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Architect */}
            {project.professional_team.architect?.name && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Architect</span>
                </div>
                <p className="text-gray-900 font-semibold mb-2">{project.professional_team.architect.name}</p>
                {project.professional_team.architect.contact && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Phone className="w-4 h-4" />
                    <span>{project.professional_team.architect.contact}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* CA */}
            {project.professional_team.ca?.name && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-bold text-purple-700 uppercase tracking-wide">CA</span>
                </div>
                <p className="text-gray-900 font-semibold mb-2">{project.professional_team.ca.name}</p>
                {project.professional_team.ca.contact && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Phone className="w-4 h-4" />
                    <span>{project.professional_team.ca.contact}</span>
                  </div>
                )}
                {project.professional_team.ca.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{project.professional_team.ca.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewProject