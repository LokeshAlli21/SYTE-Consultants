// controllers/promoterController.js
import { supabase } from '../supabase/supabaseClient.js';
import getCurrentISTTimestamp from './timestampt.js'

export const uploadPromoterData = async (req, res) => {
  try {
    // Step 1: Extract data from request body
    const {
      promoter_name,
      contact_number,
      email_id,
      district,
      city,
      promoter_type,
      office_address,
      contact_person_name,
      promoter_photo_uploaded_url,
      promoter_details,
      userId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Step 2: Insert into 'promoters' table
    const promoterInsertRes = await supabase
      .from('promoters')
      .insert([{
        promoter_name,
        contact_number,
        email_id,
        district,
        city,
        promoter_type,
        created_by:userId,
        created_at: getCurrentISTTimestamp(),
      }])
      .select('id');

    const { data: promoterData, error: promoterError, status, statusText } = promoterInsertRes;

    if (promoterError) {
      console.error('❌ Error inserting into Promoters:', promoterError);
      return res.status(500).json({
        error: 'Failed to insert promoter data',
        details: promoterError,
        status,
        statusText,
      });
    }

    if (!promoterData || promoterData.length === 0) {
      return res.status(500).json({ error: 'No promoter data returned' });
    }

    const promoterId = promoterData[0].id;
    if (!promoterId) {
      return res.status(500).json({ error: 'Failed to retrieve promoter ID after insert' });
    }

    // Step 3: Build promoter_details object
    const promoterDetails = {
      office_address,
      contact_person_name,
      promoter_id: promoterId,
      promoter_photo_uploaded_url,
    };

    // Step 4: Filter out empty/invalid fields
    const filteredPromoterDetails = {};
    Object.entries(promoterDetails).forEach(([key, value]) => {
      if (value && value !== 'null' && value !== 'undefined' && value !== '') {
        filteredPromoterDetails[key] = value;
      }
    });

    const insertData = {
      ...filteredPromoterDetails,
      created_by: userId,
    };

    // Step 5: Insert into 'promoter_details' table
    const { data: detailsData, error: detailsError } = await supabase
      .from('promoter_details')
      .insert([insertData])
      .select('id');

    if (detailsError) {
      console.error('❌ Error inserting into PromoterDetails:', detailsError);
      return res.status(500).json({
        error: 'Failed to insert promoter details',
        details: detailsError,
      });
    }

    if (!detailsData || detailsData.length === 0) {
      return res.status(500).json({ error: 'No details data returned' });
    }

    const promoterDetailsId = detailsData[0].id;

    // Step 6: Filter promoter_details object
    const filteredAdditionalDetails = {};
    Object.entries(promoter_details).forEach(([key, value]) => {
      if (value && value !== 'null' && value !== 'undefined' && value !== '') {
        filteredAdditionalDetails[key] = value;
      }
    });

    // Step 7: Insert additional details based on promoter_type
    const tableMap = {
      individual: 'individual_promoters',
      hindu_undivided_family: 'huf_promoters',
      proprietor: 'proprietor_promoters',
      company: 'company_promoters',
      partnership: 'partnership_promoters',
      limited_liability_partnership: 'llp_promoters',
      trust: 'trust_promoters',
      society: 'society_promoters',
      public_authority: 'public_authority_promoters',
      aop_boi: 'aop_boi_promoters',
      joint_venture: 'joint_venture_promoters',
    };

    const targetTable = tableMap[promoter_type];

    if (!targetTable) {
      return res.status(400).json({ error: 'Invalid promoter type' });
    }

    const additionalInsertRes = await supabase
      .from(targetTable)
      .insert([{ promoter_details_id: detailsData[0].id, ...filteredAdditionalDetails }]);

    if (additionalInsertRes.error) {
      console.error('Error inserting additional promoter details:', additionalInsertRes.error);
      return res.status(500).json({
        error: 'Failed to insert additional promoter details',
        details: additionalInsertRes.error
      });
    }

    // Step 7: Success response
    return res.status(201).json({
      message: '✅ Promoter and details uploaded successfully',
      promoterData,
      detailsData,
      additionalInsertRes,
    });

  } catch (error) {
    console.error('❌ Unexpected error in uploadPromoterData:', error);
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

    // Define folder mapping for each specific fieldname
    const folderMap = {
      promoter_photo_uploaded_url:'photo',
      aadhar_uploaded_url: "individual/aadhar",
      pan_uploaded_url: "individual/pan",
      proprietor_pan_uploaded_url: "proprietor/pan",
      karta_pan_uploaded_url: "huf/karta/pan",
      huf_pan_pan_uploaded_url: "huf/huf/pan",
      company_pan_uploaded_url: "company/pan",
      company_incorporation_uploaded_url: "company/incorporation",
      partnership_pan_uploaded_url: "partnership/pan",
      llp_pan_uploaded_url: "llp/pan",
      trust_pan_uploaded_url: "trust/pan",
      society_pan_uploaded_url: "society/pan",
      public_authority_pan_uploaded_url: "public_authority/pan",
      aop_boi_pan_uploaded_url: "aop_boi/pan",
      aop_boi_deed_of_formation_uploaded_url: "aop_boi/deed_of_formation",
      joint_venture_pan_uploaded_url: "joint_venture/pan",
      joint_venture_deed_of_formation_uploaded_url: "joint_venture/deed_of_formation"
    };

    for (const file of files) {
      const fieldName = file.fieldname;
      // console.log("fieldName :",fieldName);
      
      const originalName = file.originalname;

      // Determine folder from map or fallback to "others"
      const folder = folderMap[fieldName] || "others";

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
      console.log(`${fieldName} uploaded to ${publicUrlData.publicUrl}`);
    }

    return res.status(200).json(uploadedUrls);

  } catch (error) {
    console.error('Unexpected error in uploadPromoterFiles:', error);
    return res.status(500).json({ message: 'Server error while uploading promoter files.' });
  }
};

export const getAllPromoters = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('promoters')
      .select('id, promoter_name, contact_number, email_id, district, city, created_at, updated_at, promoter_type, created_by, updated_by, update_action, created_at')
      .eq('status_for_delete','active');

    if (error) {
      console.error('❌ Error fetching promoters:', error);
      return res.status(500).json({ error: 'Failed to fetch promoters', details: error });
    }

    res.status(200).json({ promoters: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllPromoters:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const softDeletePromoterById = async (req, res) => {
  const promoterId = req.params.id;

  try {
    const { error } = await supabase
      .from('promoters')
      .update({ status_for_delete: 'inactive' })
      .eq('id', promoterId);

    if (error) {
      console.error('❌ Error soft deleting promoter:', error);
      return res.status(500).json({ error: 'Failed to delete promoter', details: error });
    }

    res.status(200).json({ message: '✅ Promoter marked as inactive' });
  } catch (err) {
    console.error('❌ Unexpected error in softDeletePromoterById:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPromoterById = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch base promoter and promoter_details
    const { data: promoterData, error: promoterError } = await supabase
       .from('view_promoter_full')
      .select('*')
      .eq('id', id)
      .single();
      

    if (promoterError) {
      console.error(`❌ Error fetching promoter:`, promoterError);
      return res.status(500).json({ error: 'Failed to fetch promoter' });
    }

    if (!promoterData) {
      return res.status(404).json({ error: 'Promoter not found' });
    }

    // console.log(promoterData);
    

    const promoterDetailsId = promoterData.promoter_details[0]?.id;
    const promoterType = promoterData.promoter_type;

    let specificDetails = {};

    // console.log(promoterDetailsId);
    

    if (promoterDetailsId) {
      const tableMap = {
        individual: 'individual_promoters',
        huf: 'huf_promoters',
        proprietor: 'proprietor_promoters',
        company: 'company_promoters',
        partnership: 'partnership_promoters',
        llp: 'llp_promoters',
        trust: 'trust_promoters',
        society: 'society_promoters',
        public_authority: 'public_authority_promoters',
        aop_boi: 'aop_boi_promoters',
        joint_venture: 'joint_venture_promoters',
      };

      const tableName = tableMap[promoterType?.toLowerCase()];
      console.log(tableName);
      
      if (tableName) {
        const { data: typeDetails, error: typeError } = await supabase
          .from(tableName)
          .select('*')
          .eq('promoter_details_id', promoterDetailsId)
          .single();

          // console.log(typeDetails);
          
        if (typeError) {
          console.error(`❌ Error fetching ${tableName} data:`, typeError);
        } else {
          specificDetails = typeDetails;
        }
      }
    }

  const response = {
    ...promoterData,
    promoter_details: {
      ...(promoterData.promoter_details?.[0] || {}),
      [promoterType]: {
        ...specificDetails,
      },
    },
  };

    return res.status(200).json({ promoter: response });
  } catch (err) {
    console.error('❌ Unexpected error in getPromoterById:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const updatePromoter = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      promoter_name,
      contact_number,
      email_id,
      district,
      city,
      promoter_type,
      office_address,
      contact_person_name,
      promoter_photo_uploaded_url,
      promoter_details,
      userId,
      update_action,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Step 1: Update 'promoters' table
    const { data: promoterData, error: promoterError } = await supabase
      .from('promoters')
      .update({
        promoter_name,
        contact_number,
        email_id,
        district,
        city,
        promoter_type,
        updated_by:userId,
        update_action,
      })
      .eq('id', id)
      .select('id');

    if (promoterError) {
      console.error('❌ Error updating Promoters table:', promoterError);
      return res.status(500).json({ error: 'Failed to update promoter', details: promoterError });
    }

    if (!promoterData || promoterData.length === 0) {
      return res.status(404).json({ error: 'Promoter not found for update' });
    }

    // Step 2: Fetch promoter_details ID
    const { data: existingDetails, error: detailsFetchError } = await supabase
      .from('promoter_details')
      .select('id')
      .eq('promoter_id', id)
      .single();

    if (detailsFetchError || !existingDetails) {
      return res.status(404).json({ error: 'Promoter details not found', details: detailsFetchError });
    }

    const promoterDetailsId = existingDetails.id;

    // Step 3: Update promoter_details table
    const detailsToUpdate = {
      office_address,
      contact_person_name,
      promoter_photo_uploaded_url,
      updated_at: new Date().toISOString()
    };

    const filteredDetails = {};
    Object.entries(detailsToUpdate).forEach(([key, value]) => {
      if (value && value !== 'null' && value !== 'undefined' && value !== '') {
        filteredDetails[key] = value;
      }
    });

    const insertData = {
      ...filteredDetails,
      updated_by: userId,
      update_action,
    };
    
    const { data: updatedDetails, error: detailsUpdateError } = await supabase
      .from('promoter_details')
      .update(insertData)
      .eq('id', promoterDetailsId)
      .select();

    if (detailsUpdateError) {
      console.error('❌ Error updating promoter_details:', detailsUpdateError);
      return res.status(500).json({ error: 'Failed to update promoter details', details: detailsUpdateError });
    }

    // Step 4: Update additional promoter type table
    const tableMap = {
      individual: 'individual_promoters',
      hindu_undivided_family: 'huf_promoters',
      proprietor: 'proprietor_promoters',
      company: 'company_promoters',
      partnership: 'partnership_promoters',
      limited_liability_partnership: 'llp_promoters',
      trust: 'trust_promoters',
      society: 'society_promoters',
      public_authority: 'public_authority_promoters',
      aop_boi: 'aop_boi_promoters',
      joint_venture: 'joint_venture_promoters',
    };

    const targetTable = tableMap[promoter_type];

    if (!targetTable) {
      return res.status(400).json({ error: 'Invalid promoter type' });
    }

    const filteredAdditionalDetails = {};
    Object.entries(promoter_details || {}).forEach(([key, value]) => {
      if (value && value !== 'null' && value !== 'undefined' && value !== '') {
        filteredAdditionalDetails[key] = value;
      }
    });

    const { data: existingEntry, error: entryFetchError } = await supabase
      .from(targetTable)
      .select('*')
      .eq('promoter_details_id', promoterDetailsId)
      .single();

    if (entryFetchError) {
      console.error(`❌ Could not find existing entry in ${targetTable}:`, entryFetchError);
      return res.status(404).json({ error: `No existing entry found in ${targetTable}` });
    }

    // console.log("existingEntry :",existingEntry);
    

    const { data: updatedAdditionalData, error: updateAdditionalError } = await supabase
      .from(targetTable)
      .update(filteredAdditionalDetails)
      .eq('promoter_details_id', promoterDetailsId)
      .select();

    if (updateAdditionalError) {
      console.error(`❌ Error updating ${targetTable}:`, updateAdditionalError);
      return res.status(500).json({ error: `Failed to update ${targetTable}`, details: updateAdditionalError });
    }

    // Step 5: Final success response
    return res.status(200).json({
      message: '✅ Promoter and details updated successfully',
      promoterData,
      updatedDetails,
      updatedAdditionalData
    });

  } catch (error) {
    console.error('❌ Unexpected error in updatePromoter:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
