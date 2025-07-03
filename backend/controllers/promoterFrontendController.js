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

    return res.status(200).json({ channelPartner: result.rows[0].channel_partner });
  } catch (error) {
    console.error('Error fetching channel partner:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};