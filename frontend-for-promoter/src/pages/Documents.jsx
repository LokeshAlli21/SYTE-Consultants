import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'

function Documents() {
  const {id} = useParams()
  const [documentUrls, setDocumentUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjectDocuments = async (id) => {
      try {
        setLoading(true)
        const projectDocuments = await databaseService.getProjectDocuments(id)
        console.log("Project Documents:", projectDocuments)
        if (projectDocuments) {
          setDocumentUrls(projectDocuments || {})
        } else {
          setError("Documents not found")
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
        setError("Failed to load project documents")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDocuments(id)
  }, [id])
  return (
    <div>Documents for Project ID: {id}</div>
  )
}

export default Documents