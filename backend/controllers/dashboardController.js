import { supabase } from '../supabase/supabaseClient.js';

// ====================================================================
// 1. MONTHLY TRENDS CONTROLLERS
// ====================================================================

// Get Monthly Promoters Added
export const getMonthlyPromoters = async (req, res) => {
  try {
    const { year, month, limit = 12 } = req.query;
    
    let query = supabase
      .from('dashboard_monthly_promoters')
      .select('*');

    // Apply filters
    if (year) {
      query = query.eq('year', parseInt(year));
    }
    if (month) {
      query = query.eq('month', parseInt(month));
    }

    // Limit results and order
    query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching monthly promoters data:", error);
      return res.status(500).json({ error: "Failed to fetch monthly promoters data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Monthly promoters data fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getMonthlyPromoters:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Monthly Channel Partners Added
export const getMonthlyChannelPartners = async (req, res) => {
  try {
    const { year, month, limit = 12 } = req.query;
    
    let query = supabase
      .from('dashboard_monthly_channel_partners')
      .select('*');

    // Apply filters
    if (year) {
      query = query.eq('year', parseInt(year));
    }
    if (month) {
      query = query.eq('month', parseInt(month));
    }

    // Limit results and order
    query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching monthly channel partners data:", error);
      return res.status(500).json({ error: "Failed to fetch monthly channel partners data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Monthly channel partners data fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getMonthlyChannelPartners:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Monthly Projects Added
export const getMonthlyProjects = async (req, res) => {
  try {
    const { year, month, project_type, limit = 12 } = req.query;
    
    let query = supabase
      .from('dashboard_monthly_projects')
      .select('*');

    // Apply filters
    if (year) {
      query = query.eq('year', parseInt(year));
    }
    if (month) {
      query = query.eq('month', parseInt(month));
    }

    // Limit results and order
    query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching monthly projects data:", error);
      return res.status(500).json({ error: "Failed to fetch monthly projects data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Monthly projects data fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getMonthlyProjects:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Monthly Assignments Added
export const getMonthlyAssignments = async (req, res) => {
  try {
    const { year, month, limit = 12 } = req.query;
    
    let query = supabase
      .from('dashboard_monthly_assignments')
      .select('*');

    // Apply filters
    if (year) {
      query = query.eq('year', parseInt(year));
    }
    if (month) {
      query = query.eq('month', parseInt(month));
    }

    // Limit results and order
    query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching monthly assignments data:", error);
      return res.status(500).json({ error: "Failed to fetch monthly assignments data", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Monthly assignments data fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getMonthlyAssignments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================================
// 2. ASSIGNMENT STATUS SUMMARY CONTROLLERS
// ====================================================================

// Get Assignment Status Summary
export const getAssignmentStatusSummary = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dashboard_assignment_status_summary')
      .select('*')
      .order('assignment_count', { ascending: false });

    if (error) {
      console.error("❌ Error fetching assignment status summary:", error);
      return res.status(500).json({ error: "Failed to fetch assignment status summary", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Assignment status summary fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getAssignmentStatusSummary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Assignment Type Summary
export const getAssignmentTypeSummary = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dashboard_assignment_type_summary')
      .select('*')
      .order('assignment_count', { ascending: false });

    if (error) {
      console.error("❌ Error fetching assignment type summary:", error);
      return res.status(500).json({ error: "Failed to fetch assignment type summary", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Assignment type summary fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getAssignmentTypeSummary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================================
// 3. DAILY REMINDERS AND TASKS CONTROLLERS
// ====================================================================

// Get Daily Reminders
export const getDailyReminders = async (req, res) => {
  try {
    const { urgency, assignment_type, days_ahead = 7 } = req.query;
    
    let query = supabase
      .from('dashboard_daily_reminders')
      .select('*');

    // Apply filters
    if (urgency) {
      // Post-processing filter since urgency is computed
    }
    if (assignment_type) {
      query = query.eq('assignment_type', assignment_type);
    }

    const { data, error } = await query.order('date_and_time', { ascending: true });

    if (error) {
      console.error("❌ Error fetching daily reminders:", error);
      return res.status(500).json({ error: "Failed to fetch daily reminders", details: error });
    }

    // Filter by urgency if provided (post-processing)
    let filteredData = data;
    if (urgency) {
      filteredData = data.filter(item => item.urgency === urgency);
    }

    res.status(200).json({ 
      success: true,
      message: "Daily reminders fetched successfully",
      data: filteredData 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getDailyReminders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================================
// 4. GENERAL STATISTICS CONTROLLERS
// ====================================================================

// Get General Statistics
export const getGeneralStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dashboard_general_stats')
      .select('*')
      .single();

    if (error) {
      console.error("❌ Error fetching general statistics:", error);
      return res.status(500).json({ error: "Failed to fetch general statistics", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "General statistics fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getGeneralStats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================================
// 5. PROMOTER INSIGHTS CONTROLLERS
// ====================================================================

// Get Promoter Type Distribution
export const getPromoterTypeDistribution = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dashboard_promoter_type_distribution')
      .select('*')
      .order('promoter_count', { ascending: false });

    if (error) {
      console.error("❌ Error fetching promoter type distribution:", error);
      return res.status(500).json({ error: "Failed to fetch promoter type distribution", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Promoter type distribution fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getPromoterTypeDistribution:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Promoter Geographic Distribution
export const getPromoterGeographicDistribution = async (req, res) => {
  try {
    const { district, city, limit = 50 } = req.query;
    
    let query = supabase
      .from('dashboard_promoter_geographic_distribution')
      .select('*');

    // Apply filters
    if (district) {
      query = query.eq('district', district);
    }
    if (city) {
      query = query.eq('city', city);
    }

    query = query
      .order('promoter_count', { ascending: false })
      .limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching promoter geographic distribution:", error);
      return res.status(500).json({ error: "Failed to fetch promoter geographic distribution", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Promoter geographic distribution fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getPromoterGeographicDistribution:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================================
// 6. PROJECT INSIGHTS CONTROLLERS
// ====================================================================

// Get Project Overview
export const getProjectOverview = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      district, 
      city, 
      project_type, 
      promoter_id,
      rera_status 
    } = req.query;
    
    let query = supabase
      .from('dashboard_project_overview')
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
      console.error("❌ Error fetching project overview:", error);
      return res.status(500).json({ error: "Failed to fetch project overview", details: error });
    }

    // Filter by rera_status if provided (post-processing)
    let filteredData = data;
    if (rera_status) {
      filteredData = data.filter(item => item.rera_status === rera_status);
    }

    res.status(200).json({ 
      success: true,
      message: "Project overview fetched successfully",
      data: filteredData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error in getProjectOverview:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get RERA Expiry Alerts
export const getReraExpiryAlerts = async (req, res) => {
  try {
    const { alert_level, district, city, days_ahead = 90 } = req.query;
    
    let query = supabase
      .from('dashboard_rera_expiry_alerts')
      .select('*');

    // Apply filters
    if (district) {
      query = query.eq('district', district);
    }
    if (city) {
      query = query.eq('city', city);
    }

    query = query.order('expiry_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching RERA expiry alerts:", error);
      return res.status(500).json({ error: "Failed to fetch RERA expiry alerts", details: error });
    }

    // Filter by alert_level if provided (post-processing)
    let filteredData = data;
    if (alert_level) {
      filteredData = data.filter(item => item.alert_level === alert_level);
    }

    res.status(200).json({ 
      success: true,
      message: "RERA expiry alerts fetched successfully",
      data: filteredData 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getReraExpiryAlerts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================================
// 7. FINANCIAL INSIGHTS CONTROLLERS
// ====================================================================

// Get Monthly Financial Summary
export const getMonthlyFinancialSummary = async (req, res) => {
  try {
    const { year, month, limit = 12 } = req.query;
    
    let query = supabase
      .from('dashboard_monthly_financial_summary')
      .select('*');

    // Apply filters - note: need to filter by month_year string format
    if (year && month) {
      const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
      query = query.eq('month_year', monthYear);
    } else if (year) {
      query = query.like('month_year', `${year}%`);
    }

    query = query
      .order('month_year', { ascending: false })
      .limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching monthly financial summary:", error);
      return res.status(500).json({ error: "Failed to fetch monthly financial summary", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Monthly financial summary fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getMonthlyFinancialSummary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Assignment Financial Performance
export const getAssignmentFinancialPerformance = async (req, res) => {
  try {
    const { assignment_type } = req.query;
    
    let query = supabase
      .from('dashboard_assignment_financial_performance')
      .select('*');

    // Apply filters
    if (assignment_type) {
      query = query.eq('assignment_type', assignment_type);
    }

    query = query.order('total_revenue', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching assignment financial performance:", error);
      return res.status(500).json({ error: "Failed to fetch assignment financial performance", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Assignment financial performance fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getAssignmentFinancialPerformance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================================
// 8. ACTIVITY AND PRODUCTIVITY METRICS CONTROLLERS
// ====================================================================

// Get User Activity Summary
export const getUserActivitySummary = async (req, res) => {
  try {
    const { user_id, user_type, limit = 50 } = req.query;
    
    let query = supabase
      .from('dashboard_user_activity_summary')
      .select('*');

    // Apply filters
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    if (user_type) {
      query = query.eq('user_type', user_type);
    }

    query = query
      .order('total_actions', { ascending: false })
      .limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching user activity summary:", error);
      return res.status(500).json({ error: "Failed to fetch user activity summary", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "User activity summary fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getUserActivitySummary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Recent Activity
export const getRecentActivity = async (req, res) => {
  try {
    const { 
      activity_type, 
      entity_type, 
      district, 
      city, 
      created_by_user,
      limit = 50,
      days_back = 30 
    } = req.query;
    
    let query = supabase
      .from('dashboard_recent_activity')
      .select('*');

    // Apply filters
    if (activity_type) {
      query = query.eq('activity_type', activity_type);
    }
    if (entity_type) {
      query = query.eq('entity_type', entity_type);
    }
    if (district) {
      query = query.eq('district', district);
    }
    if (city) {
      query = query.eq('city', city);
    }
    if (created_by_user) {
      query = query.eq('created_by_user', created_by_user);
    }

    // Filter by date range
    const daysBackDate = new Date();
    daysBackDate.setDate(daysBackDate.getDate() - parseInt(days_back));
    query = query.gte('activity_date', daysBackDate.toISOString());

    query = query
      .order('activity_date', { ascending: false })
      .limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching recent activity:", error);
      return res.status(500).json({ error: "Failed to fetch recent activity", details: error });
    }

    res.status(200).json({ 
      success: true,
      message: "Recent activity fetched successfully",
      data: data 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getRecentActivity:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================================
// 9. COMBINED DASHBOARD DATA CONTROLLERS
// ====================================================================

// Get Complete Dashboard Data (combines multiple views for single API call)
export const getCompleteDashboardData = async (req, res) => {
  try {
    // Fetch data from multiple views concurrently
    const [
      generalStatsResult,
      monthlyPromotersResult,
      monthlyProjectsResult,
      monthlyAssignmentsResult,
      assignmentStatusResult,
      assignmentTypeResult,
      dailyRemindersResult,
      reraExpiryResult,
      monthlyFinancialResult,
      recentActivityResult
    ] = await Promise.all([
      supabase.from('dashboard_general_stats').select('*').single(),
      supabase.from('dashboard_monthly_promoters').select('*').order('year', { ascending: false }).order('month', { ascending: false }).limit(6),
      supabase.from('dashboard_monthly_projects').select('*').order('year', { ascending: false }).order('month', { ascending: false }).limit(6),
      supabase.from('dashboard_monthly_assignments').select('*').order('year', { ascending: false }).order('month', { ascending: false }).limit(6),
      supabase.from('dashboard_assignment_status_summary').select('*').order('assignment_count', { ascending: false }),
      supabase.from('dashboard_assignment_type_summary').select('*').order('assignment_count', { ascending: false }),
      supabase.from('dashboard_daily_reminders').select('*').order('date_and_time', { ascending: true }).limit(10),
      supabase.from('dashboard_rera_expiry_alerts').select('*').order('expiry_date', { ascending: true }).limit(10),
      supabase.from('dashboard_monthly_financial_summary').select('*').order('month_year', { ascending: false }).limit(6),
      supabase.from('dashboard_recent_activity').select('*').order('activity_date', { ascending: false }).limit(15)
    ]);

    // Check for errors
    const errors = [
      generalStatsResult.error,
      monthlyPromotersResult.error,
      monthlyProjectsResult.error,
      monthlyAssignmentsResult.error,
      assignmentStatusResult.error,
      assignmentTypeResult.error,
      dailyRemindersResult.error,
      reraExpiryResult.error,
      monthlyFinancialResult.error,
      recentActivityResult.error
    ].filter(error => error !== null);

    if (errors.length > 0) {
      console.error("❌ Errors fetching complete dashboard data:", errors);
      return res.status(500).json({ error: "Failed to fetch complete dashboard data", details: errors });
    }

    // Combine all data
    const dashboardData = {
      generalStats: generalStatsResult.data,
      monthlyTrends: {
        promoters: monthlyPromotersResult.data,
        projects: monthlyProjectsResult.data,
        assignments: monthlyAssignmentsResult.data
      },
      assignmentSummary: {
        statusDistribution: assignmentStatusResult.data,
        typeDistribution: assignmentTypeResult.data
      },
      reminders: {
        daily: dailyRemindersResult.data,
        reraExpiry: reraExpiryResult.data
      },
      financial: {
        monthlySummary: monthlyFinancialResult.data
      },
      activity: {
        recent: recentActivityResult.data
      }
    };

    res.status(200).json({ 
      success: true,
      message: "Complete dashboard data fetched successfully",
      data: dashboardData 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getCompleteDashboardData:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};