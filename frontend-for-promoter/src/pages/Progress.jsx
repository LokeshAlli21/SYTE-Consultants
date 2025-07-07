import React, { useEffect, useState } from 'react'
import { Building, Wrench, TreePine, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'


function Progress() {
  const {id} = useParams()
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const fetchProjectProgress = async () => {
      try {
        setLoading(true)
        const result = await databaseService.getProjectProgress(id)
        console.log('progress: ', result)
        setProgress(result)
      } catch (error) {
        console.error("Error fetching Progress:", error)
        setProgress({})
      } finally {
        setLoading(false)
      }
    }

    fetchProjectProgress()
  }, [id])

  const getProgressStatus = (percentage) => {
    if (percentage === 100) return { status: 'complete', color: 'bg-green-500', icon: CheckCircle }
    if (percentage > 50) return { status: 'progress', color: 'bg-blue-500', icon: Clock }
    if (percentage > 0) return { status: 'started', color: 'bg-yellow-500', icon: Clock }
    return { status: 'pending', color: 'bg-gray-300', icon: AlertCircle }
  }

  const ProgressCard = ({ title, percentage, icon: Icon, description }) => {
    const { status, color, icon: StatusIcon } = getProgressStatus(percentage || 0)
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${percentage === 100 ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="font-bold text-lg text-gray-900">{percentage || 0}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{percentage || 0}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-out ${color}`}
              style={{ width: `${percentage || 0}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  const CommonAreaCard = ({ title, items }) => {
    const completedItems = Object.values(items).filter(item => item.percentage_of_work === 100).length
    const totalItems = Object.values(items).length
    const overallProgress = Math.round((completedItems / totalItems) * 100)

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-sm font-medium text-gray-600">{completedItems}/{totalItems} Complete</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {Object.entries(items).map(([key, item]) => (
            <div key={key} className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-lg backdrop-blur-sm">
              <span className="text-sm text-gray-700 capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-2">
                {item.percentage_of_work === 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                )}
                <span className="text-sm font-medium">{item.percentage_of_work}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project progress...</p>
        </div>
      </div>
    )
  }

  const buildingProgress = progress.buildingProgress || {}
  const commonAreasProgress = progress.commonAreasProgress || {}

  // Calculate overall project progress
  const buildingTasks = [
    { name: 'Excavation', value: buildingProgress.excavation },
    { name: 'Plinth', value: buildingProgress.plinth },
    { name: 'Superstructure', value: buildingProgress.superstructure },
    { name: 'Interior Finishing', value: buildingProgress.interior_finishing },
    { name: 'Sanitary Fittings', value: buildingProgress.sanitary_fittings },
    { name: 'Common Infrastructure', value: buildingProgress.common_infrastructure },
    { name: 'External Works', value: buildingProgress.external_works },
    { name: 'Final Installations', value: buildingProgress.final_installations }
  ].filter(task => task.value !== null)

  const overallProgress = buildingTasks.length > 0 
    ? Math.round(buildingTasks.reduce((sum, task) => sum + (task.value || 0), 0) / buildingTasks.length)
    : 0

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl mb-6 shadow-lg">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Project Progress</h1>
          <p className="text-blue-100">Track your construction milestones</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Overall Progress</h2>
            <div className="text-4xl font-bold text-blue-600 mb-2">{overallProgress}%</div>
            <p className="text-gray-600">Project Completion</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Building Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6" />
            Building Construction
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {buildingTasks.map((task, index) => (
              <ProgressCard
                key={index}
                title={task.name}
                percentage={task.value}
                icon={Wrench}
              />
            ))}
          </div>
        </div>

        {/* Common Areas Progress */}
        {Object.keys(commonAreasProgress).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TreePine className="w-6 h-6" />
              Common Areas & Infrastructure
            </h2>
            
            <CommonAreaCard 
              title="Infrastructure & Amenities"
              items={Object.fromEntries(
                Object.entries(commonAreasProgress)
                  .filter(([key]) => !['id', 'created_at', 'updated_at', 'updated_by', 'updated_user', 'update_action', 'site_progress_id'].includes(key))
              )}
            />
          </div>
        )}

        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {buildingTasks.filter(task => task.value === 100).length}
              </div>
              <div className="text-sm text-gray-600">Completed Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {buildingTasks.filter(task => task.value > 0 && task.value < 100).length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress