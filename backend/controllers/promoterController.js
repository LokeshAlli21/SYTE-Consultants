// controllers/promoterController.js
import { supabase } from '../supabase/supabaseClient.js';

export const uploadPromoterData = async (req, res) => {
  try {
    // Step 1: Extract data from the request body
    const {
      promoter_name,
      contact_number,
      email_id,
      district,
      city,
      promoter_type,
      full_name,
      office_address,
      aadhar_number,
      pan_number,
      dob,
      contact_person_name,
      partnership_pan_number,
      company_pan_number,
      company_incorporation_number,
      aadhar_uploaded_url,
      pan_uploaded_url,
      partnership_pan_uploaded_url,
      company_pan_uploaded_url,
      company_incorporation_uploaded_url,
    } = req.body;

    // Step 2: Insert promoter basic data into 'Promoters' table
    const { data: promoterData, error: promoterError } = await supabase
      .from('Promoters')
      .insert([{
        promoter_name,
        contact_number,
        email_id,
        district,
        city,
        promoter_type,
      }])
      .select()
      .single();

    if (promoterError) {
      console.error('Error inserting into Promoters:', promoterError);
      return res.status(500).json({ error: 'Failed to insert promoter data', details: promoterError });
    }

    // Step 3: Insert promoter details into 'PromoterDetails' table
    const { data: detailsData, error: detailsError } = await supabase
      .from('PromoterDetails')
      .insert([{
        full_name,
        office_address,
        aadhar_number,
        aadhar_uploaded_url,
        pan_number,
        pan_uploaded_url,
        dob,
        contact_person_name,
        partnership_pan_number,
        partnership_pan_uploaded_url,
        company_pan_number,
        company_pan_uploaded_url,
        company_incorporation_number,
        company_incorporation_uploaded_url,
        promoter_id: promoterData.id // Link the promoter details to the promoter
      }]);

    if (detailsError) {
      console.error('Error inserting into PromoterDetails:', detailsError);
      return res.status(500).json({ error: 'Failed to insert promoter details', details: detailsError });
    }

    // Step 4: Return success response
    res.status(201).json({ message: 'Promoter and details uploaded successfully', promoterData, detailsData });

  } catch (error) {
    console.error('Unexpected error in uploadPromoterData:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadPromoterFiles = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedUrls = {};

    for (const file of files) {
      const fieldName = file.fieldname;
      const originalName = file.originalname;

      // Extract folder name based on fieldname convention
      let folder = "others";
      if (fieldName.includes("pan")) folder = "pan";
      else if (fieldName.includes("aadhar")) folder = "aadhar";
      else if (fieldName.includes("incorporation")) folder = "incorporation";
      else if (fieldName.includes("partnership")) folder = "partnership";
      else if (fieldName.includes("company")) folder = "company";
      else if (fieldName.includes("address")) folder = "address";

      const fileExt = originalName.split('.').pop();
      const filePath = `promoter-files/${folder}/${originalName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploaded-documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error(`Error uploading ${fieldName}:`, error);
        return res.status(500).json({ message: `Failed to upload ${fieldName}` });
      }

      const { data: publicUrlData } = supabase.storage
        .from('uploaded-documents')
        .getPublicUrl(filePath);

      uploadedUrls[fieldName] = publicUrlData.publicUrl;
    }

    return res.status(200).json(uploadedUrls);

  } catch (error) {
    console.error('Unexpected error in uploadPromoterFiles:', error);
    return res.status(500).json({ message: 'Server error while uploading promoter files.' });
  }
};

