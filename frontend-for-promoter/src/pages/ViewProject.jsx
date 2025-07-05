import React, { use, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'

function ViewProject() {
  const { id } = useParams()

  const [project, setProject] = useState({})

  useEffect(() => {
    const fetchProjectDetails = async (projectId) => {
      try {
        const projectDetails = await databaseService.getProjectById(projectId)
        console.log("Project Details:", projectDetails)
        if (projectDetails) {
          setProject(projectDetails)
        } else {
          console.error("Project not found")
        }
      } catch (error) {
        console.error("Error fetching project details:", error)
      }
    }

    fetchProjectDetails(id)
  }, [id])

  return (
    <div>ViewProject {id}</div>
  )
}

export default ViewProject