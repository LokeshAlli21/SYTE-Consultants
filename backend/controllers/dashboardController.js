import { query, getClient } from '../aws/awsClient';

// ====================================================================
// 1. MONTHLY TRENDS CONTROLLERS
// ====================================================================

// Get Monthly Promoters Added
export const getMonthlyPromoters = async (req, res) => {
  try {
    const { year, month, limit = 12 } = req.query;
    
    let queryText = 'SELECT * FROM dashboard_monthly_promoters';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (year) {
      conditions.push(`year = $${paramIndex}`);
      params.push(parseInt(year));
      paramIndex++;
    }
    if (month) {
      conditions.push(`month = $${paramIndex}`);
      params.push(parseInt(month));
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY year DESC, month DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "Monthly promoters data fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_monthly_channel_partners';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (year) {
      conditions.push(`year = $${paramIndex}`);
      params.push(parseInt(year));
      paramIndex++;
    }
    if (month) {
      conditions.push(`month = $${paramIndex}`);
      params.push(parseInt(month));
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY year DESC, month DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "Monthly channel partners data fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_monthly_projects';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (year) {
      conditions.push(`year = $${paramIndex}`);
      params.push(parseInt(year));
      paramIndex++;
    }
    if (month) {
      conditions.push(`month = $${paramIndex}`);
      params.push(parseInt(month));
      paramIndex++;
    }
    if (project_type) {
      conditions.push(`project_type = $${paramIndex}`);
      params.push(project_type);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY year DESC, month DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "Monthly projects data fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_monthly_assignments';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (year) {
      conditions.push(`year = $${paramIndex}`);
      params.push(parseInt(year));
      paramIndex++;
    }
    if (month) {
      conditions.push(`month = $${paramIndex}`);
      params.push(parseInt(month));
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY year DESC, month DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "Monthly assignments data fetched successfully",
      data: result.rows 
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
    const queryText = 'SELECT * FROM dashboard_assignment_status_summary ORDER BY assignment_count DESC';
    const result = await query(queryText);

    res.status(200).json({ 
      success: true,
      message: "Assignment status summary fetched successfully",
      data: result.rows 
    });
  } catch (err) {
    console.error("❌ Unexpected error in getAssignmentStatusSummary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Assignment Type Summary
export const getAssignmentTypeSummary = async (req, res) => {
  try {
    const queryText = 'SELECT * FROM dashboard_assignment_type_summary ORDER BY assignment_count DESC';
    const result = await query(queryText);

    res.status(200).json({ 
      success: true,
      message: "Assignment type summary fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_daily_reminders';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (assignment_type) {
      conditions.push(`assignment_type = $${paramIndex}`);
      params.push(assignment_type);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY date_and_time ASC';

    const result = await query(queryText, params);

    // Filter by urgency if provided (post-processing)
    let filteredData = result.rows;
    if (urgency) {
      filteredData = result.rows.filter(item => item.urgency === urgency);
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
    const queryText = 'SELECT * FROM dashboard_general_stats LIMIT 1';
    const result = await query(queryText);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No general statistics found" });
    }

    res.status(200).json({ 
      success: true,
      message: "General statistics fetched successfully",
      data: result.rows[0] 
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
    const queryText = 'SELECT * FROM dashboard_promoter_type_distribution ORDER BY promoter_count DESC';
    const result = await query(queryText);

    res.status(200).json({ 
      success: true,
      message: "Promoter type distribution fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_promoter_geographic_distribution';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (district) {
      conditions.push(`district = $${paramIndex}`);
      params.push(district);
      paramIndex++;
    }
    if (city) {
      conditions.push(`city = $${paramIndex}`);
      params.push(city);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY promoter_count DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "Promoter geographic distribution fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_project_overview';
    let countQuery = 'SELECT COUNT(*) as total FROM dashboard_project_overview';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (search) {
      conditions.push(`(project_name ILIKE $${paramIndex} OR promoter_name ILIKE $${paramIndex} OR rera_number ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (district) {
      conditions.push(`district = $${paramIndex}`);
      params.push(district);
      paramIndex++;
    }
    if (city) {
      conditions.push(`city = $${paramIndex}`);
      params.push(city);
      paramIndex++;
    }
    if (project_type) {
      conditions.push(`project_type = $${paramIndex}`);
      params.push(project_type);
      paramIndex++;
    }
    if (promoter_id) {
      conditions.push(`promoter_id = $${paramIndex}`);
      params.push(promoter_id);
      paramIndex++;
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      queryText += whereClause;
      countQuery += whereClause;
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    // Execute both queries
    const [dataResult, countResult] = await Promise.all([
      query(queryText, params),
      query(countQuery, params.slice(0, -2)) // Remove limit and offset params for count
    ]);

    // Filter by rera_status if provided (post-processing)
    let filteredData = dataResult.rows;
    if (rera_status) {
      filteredData = dataResult.rows.filter(item => item.rera_status === rera_status);
    }

    const totalRecords = parseInt(countResult.rows[0].total);

    res.status(200).json({ 
      success: true,
      message: "Project overview fetched successfully",
      data: filteredData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords: totalRecords,
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
    
    let queryText = 'SELECT * FROM dashboard_rera_expiry_alerts';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (district) {
      conditions.push(`district = $${paramIndex}`);
      params.push(district);
      paramIndex++;
    }
    if (city) {
      conditions.push(`city = $${paramIndex}`);
      params.push(city);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY expiry_date ASC';

    const result = await query(queryText, params);

    // Filter by alert_level if provided (post-processing)
    let filteredData = result.rows;
    if (alert_level) {
      filteredData = result.rows.filter(item => item.alert_level === alert_level);
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
    
    let queryText = 'SELECT * FROM dashboard_monthly_financial_summary';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters - note: need to filter by month_year string format
    if (year && month) {
      const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
      conditions.push(`month_year = $${paramIndex}`);
      params.push(monthYear);
      paramIndex++;
    } else if (year) {
      conditions.push(`month_year LIKE $${paramIndex}`);
      params.push(`${year}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY month_year DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "Monthly financial summary fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_assignment_financial_performance';
    let params = [];
    let paramIndex = 1;

    // Apply filters
    if (assignment_type) {
      queryText += ` WHERE assignment_type = $${paramIndex}`;
      params.push(assignment_type);
    }

    queryText += ' ORDER BY total_revenue DESC';

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "Assignment financial performance fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_user_activity_summary';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }
    if (user_type) {
      conditions.push(`user_type = $${paramIndex}`);
      params.push(user_type);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY total_actions DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "User activity summary fetched successfully",
      data: result.rows 
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
    
    let queryText = 'SELECT * FROM dashboard_recent_activity';
    let params = [];
    let conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (activity_type) {
      conditions.push(`activity_type = $${paramIndex}`);
      params.push(activity_type);
      paramIndex++;
    }
    if (entity_type) {
      conditions.push(`entity_type = $${paramIndex}`);
      params.push(entity_type);
      paramIndex++;
    }
    if (district) {
      conditions.push(`district = $${paramIndex}`);
      params.push(district);
      paramIndex++;
    }
    if (city) {
      conditions.push(`city = $${paramIndex}`);
      params.push(city);
      paramIndex++;
    }
    if (created_by_user) {
      conditions.push(`created_by_user = $${paramIndex}`);
      params.push(created_by_user);
      paramIndex++;
    }

    // Filter by date range
    const daysBackDate = new Date();
    daysBackDate.setDate(daysBackDate.getDate() - parseInt(days_back));
    conditions.push(`activity_date >= $${paramIndex}`);
    params.push(daysBackDate.toISOString());
    paramIndex++;

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY activity_date DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.status(200).json({ 
      success: true,
      message: "Recent activity fetched successfully",
      data: result.rows 
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
    // Use a database client for multiple queries in sequence
    const client = await getClient();
    
    try {
      // Execute all queries concurrently for better performance
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
        client.query('SELECT * FROM dashboard_general_stats LIMIT 1'),
        client.query('SELECT * FROM dashboard_monthly_promoters ORDER BY year DESC, month DESC LIMIT 6'),
        client.query('SELECT * FROM dashboard_monthly_projects ORDER BY year DESC, month DESC LIMIT 6'),
        client.query('SELECT * FROM dashboard_monthly_assignments ORDER BY year DESC, month DESC LIMIT 6'),
        client.query('SELECT * FROM dashboard_assignment_status_summary ORDER BY assignment_count DESC'),
        client.query('SELECT * FROM dashboard_assignment_type_summary ORDER BY assignment_count DESC'),
        client.query('SELECT * FROM dashboard_daily_reminders ORDER BY date_and_time ASC LIMIT 10'),
        client.query('SELECT * FROM dashboard_rera_expiry_alerts ORDER BY expiry_date ASC LIMIT 10'),
        client.query('SELECT * FROM dashboard_monthly_financial_summary ORDER BY month_year DESC LIMIT 6'),
        client.query('SELECT * FROM dashboard_recent_activity ORDER BY activity_date DESC LIMIT 15')
      ]);

      // Combine all data
      const dashboardData = {
        generalStats: generalStatsResult.rows[0] || null,
        monthlyTrends: {
          promoters: monthlyPromotersResult.rows,
          projects: monthlyProjectsResult.rows,
          assignments: monthlyAssignmentsResult.rows
        },
        assignmentSummary: {
          statusDistribution: assignmentStatusResult.rows,
          typeDistribution: assignmentTypeResult.rows
        },
        reminders: {
          daily: dailyRemindersResult.rows,
          reraExpiry: reraExpiryResult.rows
        },
        financial: {
          monthlySummary: monthlyFinancialResult.rows
        },
        activity: {
          recent: recentActivityResult.rows
        }
      };

      res.status(200).json({ 
        success: true,
        message: "Complete dashboard data fetched successfully",
        data: dashboardData 
      });
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  } catch (err) {
    console.error("❌ Unexpected error in getCompleteDashboardData:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};