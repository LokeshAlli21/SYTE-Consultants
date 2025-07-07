import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'

function Units() {

  const {projectId} = useParams()

  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Simulate API call with mock data
    const fetchProjectUnits = async () => {
      try {
        setLoading(true)
        const result = await databaseService.getProjectUnits(projectId)
        console.log('fetched units: ', result)
        setUnits(result)
      } catch (error) {
        console.error("Error fetching units:", error)
        setUnits([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjectUnits()
  }, [projectId])

  return (
    <div>Units</div>
  )
}

export default Units