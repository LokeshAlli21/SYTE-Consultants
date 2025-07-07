import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'

function ViewProjectUnit() {
  const {id} = useParams()
  const navigate = useNavigate()

  const [unit, setUnit] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true)
        const result = await databaseService.getProjectUnitById(id)
        console.log("Unit Details:", result)
        if (result) {
          setUnit(result)
        } else {
          setError("Unit not found")
        }
      } catch (error) {
        console.error("Error fetching Unit:", error)
        setError("Failed to load Unit")
      } finally {
        setLoading(false)
      }
    }

    fetchUnit()
  }, [id])

  return (
    <div>ViewProjectUnit</div>
  )
}

export default ViewProjectUnit