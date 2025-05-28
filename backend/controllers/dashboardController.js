import { supabase } from '../supabase/supabaseClient.js';

// 1. Master Dashboard Overview
export const getMasterDashboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vw_master_dashboard')
      .select('*')
      .single();

    if (error) {
      console.error("❌ Error fetching master dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch master dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Master dashboard data fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getMasterDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 2. Promoters Dashboard
export const getPromotersDashboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, district, city, promoter_type } = req.query;
    
    let query = supabase
      .from('vw_promoters_dashboard')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`promoter_name.ilike.%${search}%,contact_number.ilike.%${search}%,email_id.ilike.%${search}%`);
    }
    if (district) {
      query = query.eq('district', district);
    }
    if (city) {
      query = query.eq('city', city);
    }
    if (promoter_type) {
      query = query.eq('promoter_type', promoter_type);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching promoters dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch promoters dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Promoters dashboard data fetched successfully",
      data: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getPromotersDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 3. Projects Dashboard
export const getProjectsDashboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, district, city, project_type, promoter_id } = req.query;
    
    let query = supabase
      .from('vw_projects_dashboard')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`project_name.ilike.%${search}%,promoter_name.ilike.%${search}%,rera_number.ilike.%${search}%`);
    }
    if (district) {
      query = query.eq('district', district);
    }
    if (city) {
      query = query.eq('city', city);
    }
    if (project_type) {
      query = query.eq('project_type', project_type);
    }
    if (promoter_id) {
      query = query.eq('promoter_id', promoter_id);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching projects dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch projects dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Projects dashboard data fetched successfully",
      data: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getProjectsDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 4. Units Dashboard
export const getUnitsDashboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, unit_status, project_id, district, city } = req.query;
    
    let query = supabase
      .from('vw_units_dashboard')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`unit_name.ilike.%${search}%,customer_name.ilike.%${search}%,project_name.ilike.%${search}%`);
    }
    if (unit_status) {
      query = query.eq('unit_status', unit_status);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (district) {
      query = query.eq('district', district);
    }
    if (city) {
      query = query.eq('city', city);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching units dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch units dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Units dashboard data fetched successfully",
      data: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getUnitsDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 5. Assignments Dashboard
export const getAssignmentsDashboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, assignment_type, project_id, current_status } = req.query;
    
    let query = supabase
      .from('vw_assignments_dashboard')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`application_number.ilike.%${search}%,project_name.ilike.%${search}%,promoter_name.ilike.%${search}%`);
    }
    if (assignment_type) {
      query = query.eq('assignment_type', assignment_type);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (current_status) {
      query = query.eq('current_status', current_status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching assignments dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch assignments dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Assignments dashboard data fetched successfully",
      data: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getAssignmentsDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 6. Financial Dashboard
export const getFinancialDashboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vw_financial_dashboard')
      .select('*')
      .single();

    if (error) {
      console.error("❌ Error fetching financial dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch financial dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Financial dashboard data fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getFinancialDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 7. Site Progress Dashboard
export const getSiteProgressDashboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, district, city, project_id } = req.query;
    
    let query = supabase
      .from('vw_site_progress_dashboard')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`project_name.ilike.%${search}%,promoter_name.ilike.%${search}%`);
    }
    if (district) {
      query = query.eq('district', district);
    }
    if (city) {
      query = query.eq('city', city);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching site progress dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch site progress dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Site progress dashboard data fetched successfully",
      data: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getSiteProgressDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 8. Channel Partners Dashboard
export const getChannelPartnersDashboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, district, city } = req.query;
    
    let query = supabase
      .from('vw_channel_partners_dashboard')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,contact_number.ilike.%${search}%,email_id.ilike.%${search}%`);
    }
    if (district) {
      query = query.eq('district', district);
    }
    if (city) {
      query = query.eq('city', city);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching channel partners dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch channel partners dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Channel partners dashboard data fetched successfully",
      data: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getChannelPartnersDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 9. Reminders Dashboard
export const getRemindersDashboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, reminder_status, assignment_type } = req.query;
    
    let query = supabase
      .from('vw_reminders_dashboard')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`project_name.ilike.%${search}%,promoter_name.ilike.%${search}%,message.ilike.%${search}%`);
    }
    if (reminder_status) {
      // This filter will be applied on the computed reminder_status field
      // Note: Supabase might not support filtering on computed fields directly
      // You may need to handle this in the application logic
    }
    if (assignment_type) {
      query = query.eq('assignment_type', assignment_type);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching reminders dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch reminders dashboard data", details: error });
    }

    // Filter by reminder_status if provided (post-processing)
    let filteredData = data;
    if (reminder_status) {
      filteredData = data.filter(item => item.reminder_status === reminder_status);
    }

    res.status(200).json({ 
      success: true,
      message: "Reminders dashboard data fetched successfully",
      data: filteredData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getRemindersDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 10. Document Status Dashboard
export const getDocumentStatusDashboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, min_completeness_percentage } = req.query;
    
    let query = supabase
      .from('vw_document_status_dashboard')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`project_name.ilike.%${search}%,promoter_name.ilike.%${search}%`);
    }
    if (min_completeness_percentage) {
      query = query.gte('document_completeness_percentage', parseFloat(min_completeness_percentage));
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching document status dashboard data:", error);
      return res.status(500).json({ error: "Failed to fetch document status dashboard data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Document status dashboard data fetched successfully",
      data: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getDocumentStatusDashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};