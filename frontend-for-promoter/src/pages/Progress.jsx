import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'

function Progress() {
  const {id} = useParams()

  const [progresss, setProgress] = useState({})
  
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Simulate API call
    const fetchProjectProgress = async () => {
      try {
        setLoading(true)
        // Replace with actual API call
        const result = await databaseService.getProjectProgress(id)
        console.log('progress: ',result)
        setProgress(result)
      } catch (error) {
        console.error("Error fetching Progresss:", error)
        setProgress({})
      } finally {
        setLoading(false)
      }
    }

    fetchProjectProgress()
  }, [projectId])

  return (
    <div>Progress</div>
  )
}

export default Progress