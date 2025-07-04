import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import databaseService from '../backend-services/database/database'

function Projects() {
  const userData = useSelector((state) => state.auth.userData)
  const promoterId = userData?.id

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    if (!promoterId) {
      setError("Promoter ID is not available.")
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await databaseService.getPromoterProjects(promoterId)
        
        if (response.projects) {
          setProjects(response.projects)
        } else if (response.message) {
          setError(response.message)
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
        setError("Failed to load projects. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [promoterId])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getProjectTypeInfo = (type) => {
    const types = {
      'residential': { 
        color: 'bg-gradient-to-r from-blue-500 to-blue-600', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-700',
        icon: '🏠'
      },
      'residential / group housing': { 
        color: 'bg-gradient-to-r from-blue-500 to-blue-600', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-700',
        icon: '🏠'
      },
      'commercial': { 
        color: 'bg-gradient-to-r from-green-500 to-green-600', 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-700',
        icon: '🏢'
      },
      'mixed': { 
        color: 'bg-gradient-to-r from-purple-500 to-purple-600', 
        bgColor: 'bg-purple-50', 
        textColor: 'text-purple-700',
        icon: '🏘️'
      },
      'plotted': { 
        color: 'bg-gradient-to-r from-amber-500 to-amber-600', 
        bgColor: 'bg-amber-50', 
        textColor: 'text-amber-700',
        icon: '🗺️'
      },
      'default': { 
        color: 'bg-gradient-to-r from-gray-500 to-gray-600', 
        bgColor: 'bg-gray-50', 
        textColor: 'text-gray-700',
        icon: '🏗️'
      }
    }
    
    // Normalize the input to handle case variations
    const normalizedType = type?.toLowerCase().trim()
    return types[normalizedType] || types.default
  }

  const getProjectStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', color: 'bg-gray-100 text-gray-600' }
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { status: 'Expired', color: 'bg-red-100 text-red-700' }
    } else if (daysUntilExpiry < 30) {
      return { status: 'Expiring Soon', color: 'bg-amber-100 text-amber-700' }
    } else {
      return { status: 'Active', color: 'bg-green-100 text-green-700' }
    }
  }

  const getUniqueProjectTypes = () => {
    const types = projects.map(p => p.project_type?.toLowerCase()).filter(Boolean)
    return [...new Set(types)]
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.district?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
                         project.project_type?.toLowerCase() === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-10 bg-gray-200 rounded-lg mb-3 w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
            </div>
            
            {/* Search & Filter Skeleton */}
            <div className="mb-8">
              <div className="h-14 bg-gray-200 rounded-2xl mb-4"></div>
              <div className="flex gap-2 mb-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 bg-gray-200 rounded-full w-20"></div>
                ))}
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>

            {/* Projects Skeleton */}
            <div className="grid gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">

{/* Enhanced Search & Filter */}
<div className="mb-8">
  <div className="relative mb-4">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      placeholder="Search projects, locations, or RERA numbers..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-12 pr-4 py-4 bg-white/70 outline-none border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg placeholder-gray-500 text-gray-900"
    />
  </div>

  {/* Filter Tabs */}
  <div className="flex gap-2 overflow-x-auto pb-2">
    <button
      onClick={() => setSelectedFilter('all')}
      className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
        selectedFilter === 'all' 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white/70 text-gray-700 hover:bg-white'
      }`}
    >
      All Projects ({projects.length})
    </button>
    {getUniqueProjectTypes().map(type => (
      <button
        key={type}
        onClick={() => setSelectedFilter(type)}
        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all capitalize ${
          selectedFilter === type 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'bg-white/70 text-gray-700 hover:bg-white'
        }`}
      >
        {getProjectTypeInfo(type).icon} {type}
      </button>
    ))}
  </div>
</div>

{/* Enhanced Stats Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
        <div className="text-sm text-gray-600 mt-1">Total Projects</div>
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
    </div>
  </div>

  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-bold text-green-600">
          {projects.filter(p => getProjectStatus(p.expiry_date).status === 'Active').length}
        </div>
        <div className="text-sm text-gray-600 mt-1">Active Projects</div>
      </div>
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </div>

  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-bold text-amber-600">
          {projects.filter(p => getProjectStatus(p.expiry_date).status === 'Expiring Soon').length}
        </div>
        <div className="text-sm text-gray-600 mt-1">Expiring Soon</div>
      </div>
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    </div>
  </div>

  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-bold text-purple-600">{filteredProjects.length}</div>
        <div className="text-sm text-gray-600 mt-1">Filtered Results</div>
      </div>
      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
      </div>
    </div>
  </div>
</div>

        {/* Error State */}
        {error && (
          <div className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Projects</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Projects List */}
        {filteredProjects.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm || selectedFilter !== 'all' ? 'No matching projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your projects will appear here once added'}
            </p>
          </div>
        ) : (
<div className="space-y-4">
            {filteredProjects.map((project) => {
              const typeInfo = getProjectTypeInfo(project.project_type)
              const statusInfo = getProjectStatus(project.expiry_date)
              
              return (
                <div 
                  key={project.id} 
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-4">
                    {/* Header with icon and title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${typeInfo.color} rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0`}>
                        {typeInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {project.project_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                            {project.project_type || 'N/A'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            {statusInfo.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact info grid */}
                    <div className="space-y-2">
                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium truncate">
                          {project.city}{project.district && `, ${project.district}`}
                        </span>
                      </div>

                      {/* RERA Number */}
                      {project.rera_number && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">RERA: {project.rera_number}</span>
                        </div>
                      )}

                      {/* Dates in compact row */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Reg: {formatDate(project.registration_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Exp: {formatDate(project.expiry_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects