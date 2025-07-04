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

    if (channelPartner?.cp_photo_uploaded_url) {
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