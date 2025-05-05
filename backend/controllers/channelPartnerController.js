import { supabase } from '../supabase/supabaseClient.js';

export const createChannelPartner = async (req, res) => {
    try {
      const {
        full_name,
        contact_number,
        alternate_contact_number,
        email_id,
        district,
        city,
      } = req.body;
  
      const { data, error } = await supabase
        .from('channel_partners')
        .insert([{
          full_name,
          contact_number,
          alternate_contact_number: alternate_contact_number || null,
          email_id: email_id || null,
          district: district || null,
          city: city || null,
        }]);
  
      if (error) {
        console.error('❌ Error inserting channel partner data:', error);
        return res.status(500).json({ error: 'Failed to insert channel partner data', details: error });
      }
  
      res.status(201).json({ message: '✅ Channel Partner added successfully', data });
  
    } catch (error) {
      console.error('❌ Unexpected error in uploadChannelPartnerData:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  