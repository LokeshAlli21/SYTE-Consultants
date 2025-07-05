import { query, getClient, getSignedUrl } from '../aws/awsClient.js';

export const getChannelPartnerByPromoterId = async (req, res) => {
  const promoterId = req.params.promoterId;

  try {
    const client = await getClient();
    const queryText = `
      SELECT get_channel_partner_by_promoter($1) AS channel_partner;
    `;
    const result = await client.query(queryText, [promoterId]);

    if (!result.rows[0].channel_partner) {
      return res.status(404).json({ message: 'Channel partner not found.' });
    }

    const channelPartner = result.rows[0]?.channel_partner;
    if (channelPartner) {
      channelPartner.cp_photo_uploaded_url = getSignedUrl(channelPartner.cp_photo_uploaded_url);
    }

    return res.status(200).json({ channelPartner });
  } catch (error) {
    console.error('Error fetching channel partner:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getPromoterProjects = async (req, res) => {
  const {promoterId} = req.params;

  try {
    const client = await getClient();
    const queryText = `
      SELECT 
        id,
        project_name,
        project_type,
        city,
        district,
        rera_number,
        registration_date,
        expiry_date,
        created_at
      FROM projects 
      WHERE promoter_id = $1 
      AND status_for_delete = 'active'
      ORDER BY created_at DESC;
    `;
    const result = await client.query(queryText, [promoterId]);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'No active projects found for this promoter.' });
    }

    return res.status(200).json({ 
      projects: result.rows,
      count: result.rows.length 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId || isNaN(projectId)) {
    return res.status(400).json({ 
      message: 'Invalid project ID. Project ID must be a valid number.' 
    });
  }

  let client;
  
  try {
    client = await getClient();
    
    const queryText = `
      SELECT * FROM get_project_details($1);
    `;
    
    const result = await client.query(queryText, [parseInt(projectId)]);
    

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Project not found or project is not active.' 
      });
    }

    const project = result.rows[0];
    
    // Organize data into logical groups
    const organizedProject = {
      basic_info: {
        project_id: project.project_id,
        project_name: project.project_name,
        project_type: project.project_type,
        project_address: project.project_address,
        city: project.city,
        district: project.district,
        project_pincode: project.project_pincode,
        promoter_name: project.promoter_name
      },
      status: {
        project_status: project.project_status,
        professional_team_status: project.professional_team_status,
        registration_date: project.registration_date,
        expiry_date: project.expiry_date,
        days_until_expiry: project.days_until_expiry,
        project_age_days: project.project_age_days
      },
      rera_details: {
        rera_number: project.rera_number,
        rera_certificate_url: getSignedUrl(project.rera_certificate_url)
      },
      professional_team: {
        engineer: {
          name: project.engineer_name,
          contact: project.engineer_contact,
          email: project.engineer_email,
          documents: {
            licence_url: getSignedUrl(project.engineer_licence_url),
            pan_url: getSignedUrl(project.engineer_pan_url),
            letterhead_url: getSignedUrl(project.engineer_letterhead_url),
            stamp_url: getSignedUrl(project.engineer_stamp_url)
          }
        },
        architect: {
          name: project.architect_name,
          contact: project.architect_contact,
          email: project.architect_email,
          documents: {
            licence_url: getSignedUrl(project.architect_licence_url),
            pan_url: getSignedUrl(project.architect_pan_url),
            letterhead_url: getSignedUrl(project.architect_letterhead_url),
            stamp_url: getSignedUrl(project.architect_stamp_url)
          }
        },
        ca: {
          name: project.ca_name,
          contact: project.ca_contact,
          email: project.ca_email,
          documents: {
            licence_url: getSignedUrl(project.ca_licence_url),
            pan_url: getSignedUrl(project.ca_pan_url),
            letterhead_url: getSignedUrl(project.ca_letterhead_url),
            stamp_url: getSignedUrl(project.ca_stamp_url)
          }
        }
      },
      timestamps: {
        project_created_date: project.project_created_date
      }
    };

    return res.status(200).json({ 
      success: true,
      project: organizedProject 
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ 
      message: 'Internal server error while fetching project details.' 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getProjectDocuments = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId || isNaN(projectId)) {
    return res.status(400).json({ 
      message: 'Invalid project ID. Project ID must be a valid number.' 
    });
  }

  try {
    const client = await getClient();
    const queryText = `
      SELECT * FROM project_documents WHERE project_id = $1;
    `;
    
    const result = await client.query(queryText, [parseInt(projectId)]);

    console.log('Project Documents Result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'No documents found for this project.' 
      });
    }

    const documents = {
      cc_uploaded_url: getSignedUrl(result?.rows[0]?.cc_uploaded_url) || null,
      plan_uploaded_url: getSignedUrl(result?.rows[0]?.plan_uploaded_url) || null,
      search_report_uploaded_url: getSignedUrl(result?.rows[0]?.search_report_uploaded_url) || null,
      da_uploaded_url: getSignedUrl(result?.rows[0]?.da_uploaded_url) || null,
      pa_uploaded_url: getSignedUrl(result?.rows[0]?.pa_uploaded_url) || null,
      satbara_uploaded_url: getSignedUrl(result?.rows[0]?.satbara_uploaded_url) || null,
      promoter_letter_head_uploaded_url: getSignedUrl(result?.rows[0]?.promoter_letter_head_uploaded_url) || null,
      promoter_sign_stamp_uploaded_url: getSignedUrl(result?.rows[0]?.promoter_sign_stamp_uploaded_url) || null,
      created_at: result?.rows[0]?.created_at || null,
      updated_at: result?.rows[0]?.updated_at || null,
    };

    return res.status(200).json({ 
      success: true,
      documents 
    });

  } catch (error) {
    console.error('Error fetching project documents:', error);
    return res.status(500).json({ 
      message: 'Internal server error while fetching project documents.' 
    });
  }
};