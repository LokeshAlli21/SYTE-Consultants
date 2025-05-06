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
  
  export const updateChannelPartner = async (req, res) => {
    const { id } = req.params;
  
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
        .update({
          full_name,
          contact_number,
          alternate_contact_number: alternate_contact_number || null,
          email_id: email_id || null,
          district: district || null,
          city: city || null,
        })
        .eq('id', id);
  
      if (error) {
        console.error('❌ Error updating channel partner data:', error);
        return res.status(500).json({ error: 'Failed to update channel partner', details: error });
      }
  
      res.status(200).json({ message: '✅ Channel Partner updated successfully', data });
  
    } catch (error) {
      console.error('❌ Unexpected error in updateChannelPartner:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  export const getAllChannelPartners = async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('channel_partners')
        .select(`id, full_name, contact_number, alternate_contact_number, email_id, district, city, created_at, updated_at`)
        .eq('status_for_delete','active');
  
      if (error) {
        console.error('❌ Error fetching channel partners:', error);
        return res.status(500).json({ error: 'Failed to fetch channel partners', details: error });
      }

      // console.log(data);
      
  
      res.status(200).json({ channelPartners: data });
    } catch (err) {
      console.error('❌ Unexpected error in getAllChannelPartners:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export const softDeleteChannelPartnerById = async (req, res) => {
    const partnerId = req.params.id;
  
    try {
      const { error } = await supabase
        .from('channel_partners')
        .update({ status_for_delete: 'inactive' })
        .eq('id', partnerId);
  
      if (error) {
        console.error('❌ Error soft deleting channel partner:', error);
        return res.status(500).json({ error: 'Failed to delete channel partner', details: error });
      }
  
      res.status(200).json({ message: '✅ Channel Partner marked as inactive' });
    } catch (err) {
      console.error('❌ Unexpected error in softDeleteChannelPartnerById:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  export const getChannelPartnerById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const { data, error } = await supabase
        .from('channel_partners')
        .select(`
          id,
          full_name,
          contact_number,
          alternate_contact_number,
          email_id,
          district,
          city
        `)
        .eq('id', id)
        .single();
  
      if (error) {
        console.error(`❌ Error fetching channel partner with ID ${id}:`, error);
        return res.status(500).json({ error: 'Failed to fetch channel partner', details: error });
      }
  
      if (!data) {
        return res.status(404).json({ error: 'Channel Partner not found or inactive' });
      }
  
      res.status(200).json({ channelPartner: data });
  
    } catch (err) {
      console.error('❌ Unexpected error in getChannelPartnerById:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  