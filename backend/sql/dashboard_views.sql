-- ====================================================================
-- REAL ESTATE MASTER DASHBOARD - SQL VIEWS
-- ====================================================================

-- ====================================================================
-- 1. MONTHLY TRENDS VIEWS
-- ====================================================================

-- Monthly Promoters Added
CREATE OR REPLACE VIEW dashboard_monthly_promoters AS
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') AS month_year,
    EXTRACT(YEAR FROM created_at) AS year,
    EXTRACT(MONTH FROM created_at) AS month,
    TO_CHAR(created_at, 'Mon YYYY') AS month_name,
    COUNT(*) AS promoters_added,
    COUNT(*) FILTER (WHERE promoter_type = 'Individual') AS individual_promoters,
    COUNT(*) FILTER (WHERE promoter_type = 'Company') AS company_promoters,
    COUNT(*) FILTER (WHERE promoter_type = 'Partnership') AS partnership_promoters,
    COUNT(*) FILTER (WHERE promoter_type IN ('HUF', 'Trust', 'Society', 'LLP')) AS other_promoters
FROM promoters 
WHERE status_for_delete = 'active'
GROUP BY 
    TO_CHAR(created_at, 'YYYY-MM'),
    EXTRACT(YEAR FROM created_at),
    EXTRACT(MONTH FROM created_at),
    TO_CHAR(created_at, 'Mon YYYY')
ORDER BY year DESC, month DESC;

-- Monthly Channel Partners Added
CREATE OR REPLACE VIEW dashboard_monthly_channel_partners AS
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') AS month_year,
    EXTRACT(YEAR FROM created_at) AS year,
    EXTRACT(MONTH FROM created_at) AS month,
    TO_CHAR(created_at, 'Mon YYYY') AS month_name,
    COUNT(*) AS channel_partners_added,
    COUNT(DISTINCT district) AS districts_covered,
    COUNT(DISTINCT city) AS cities_covered
FROM channel_partners 
WHERE status_for_delete = 'active'
GROUP BY 
    TO_CHAR(created_at, 'YYYY-MM'),
    EXTRACT(YEAR FROM created_at),
    EXTRACT(MONTH FROM created_at),
    TO_CHAR(created_at, 'Mon YYYY')
ORDER BY year DESC, month DESC;

-- Monthly Projects Added
CREATE OR REPLACE VIEW dashboard_monthly_projects AS
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') AS month_year,
    EXTRACT(YEAR FROM created_at) AS year,
    EXTRACT(MONTH FROM created_at) AS month,
    TO_CHAR(created_at, 'Mon YYYY') AS month_name,
    COUNT(*) AS projects_added,
    COUNT(*) FILTER (WHERE project_type = 'Residential') AS residential_projects,
    COUNT(*) FILTER (WHERE project_type = 'Commercial') AS commercial_projects,
    COUNT(*) FILTER (WHERE project_type NOT IN ('Residential', 'Commercial') OR project_type IS NULL) AS other_projects,
    COUNT(DISTINCT district) AS districts_covered,
    COUNT(DISTINCT city) AS cities_covered
FROM projects 
WHERE status_for_delete = 'active'
GROUP BY 
    TO_CHAR(created_at, 'YYYY-MM'),
    EXTRACT(YEAR FROM created_at),
    EXTRACT(MONTH FROM created_at),
    TO_CHAR(created_at, 'Mon YYYY')
ORDER BY year DESC, month DESC;

-- Monthly Assignments Added
CREATE OR REPLACE VIEW dashboard_monthly_assignments AS
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') AS month_year,
    EXTRACT(YEAR FROM created_at) AS year,
    EXTRACT(MONTH FROM created_at) AS month,
    TO_CHAR(created_at, 'Mon YYYY') AS month_name,
    COUNT(*) AS assignments_added,
    COUNT(DISTINCT assignment_type) AS assignment_types,
    ROUND(AVG(consultation_charges), 2) AS avg_consultation_charges,
    SUM(consultation_charges) AS total_consultation_charges,
    SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees) AS total_operational_costs
FROM assignments 
WHERE status_for_delete = 'active'
GROUP BY 
    TO_CHAR(created_at, 'YYYY-MM'),
    EXTRACT(YEAR FROM created_at),
    EXTRACT(MONTH FROM created_at),
    TO_CHAR(created_at, 'Mon YYYY')
ORDER BY year DESC, month DESC;

-- ====================================================================
-- 2. ASSIGNMENT STATUS SUMMARY
-- ====================================================================

-- Assignment Status Distribution (for Pie Charts)
CREATE OR REPLACE VIEW dashboard_assignment_status_summary AS
SELECT 
    COALESCE(
        (SELECT assignment_status 
         FROM assignment_timeline at2 
         WHERE at2.assignment_id = a.id 
         ORDER BY at2.created_at DESC 
         LIMIT 1), 
        'Not Started'
    ) AS current_status,
    COUNT(*) AS assignment_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage,
    COUNT(DISTINCT a.project_id) AS projects_involved,
    COUNT(DISTINCT a.assignment_type) AS assignment_types_involved,
    SUM(a.consultation_charges) AS total_consultation_value,
    AVG(a.consultation_charges) AS avg_consultation_value
FROM assignments a
WHERE a.status_for_delete = 'active'
GROUP BY 
    (SELECT assignment_status 
     FROM assignment_timeline at2 
     WHERE at2.assignment_id = a.id 
     ORDER BY at2.created_at DESC 
     LIMIT 1)
ORDER BY assignment_count DESC;

-- Assignment Type Distribution
CREATE OR REPLACE VIEW dashboard_assignment_type_summary AS
SELECT 
    COALESCE(assignment_type, 'Unspecified') AS assignment_type,
    COUNT(*) AS assignment_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage,
    COUNT(DISTINCT project_id) AS projects_involved,
    SUM(consultation_charges) AS total_consultation_value,
    SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees) AS total_operational_costs,
    ROUND(AVG(consultation_charges), 2) AS avg_consultation_charges
FROM assignments
WHERE status_for_delete = 'active'
GROUP BY assignment_type
ORDER BY assignment_count DESC;

-- ====================================================================
-- 3. DAILY REMINDERS AND TASKS
-- ====================================================================

-- Today's and Overdue Reminders
CREATE OR REPLACE VIEW dashboard_daily_reminders AS
SELECT 
    ar.id AS reminder_id,
    ar.assignment_id,
    a.assignment_type,
    p.project_name,
    pr.promoter_name,
    ar.message,
    ar.date_and_time,
    ar.assignment_status,
    ar.status AS reminder_status,
    CASE 
        WHEN DATE(ar.date_and_time) = CURRENT_DATE THEN 'Due Today'
        WHEN DATE(ar.date_and_time) < CURRENT_DATE THEN 'Overdue'
        ELSE 'Upcoming'
    END AS urgency,
    DATE(ar.date_and_time) - CURRENT_DATE AS days_difference
FROM assignment_reminders ar
JOIN assignments a ON ar.assignment_id = a.id
JOIN projects p ON a.project_id = p.id
JOIN promoters pr ON p.promoter_id = pr.id
WHERE 
    ar.date_and_time <= CURRENT_DATE + INTERVAL '7 days'
    AND a.status_for_delete = 'active'
    AND p.status_for_delete = 'active'
    AND pr.status_for_delete = 'active'
ORDER BY ar.date_and_time ASC;

-- ====================================================================
-- 4. GENERAL STATISTICS
-- ====================================================================

-- Overall System Statistics
CREATE OR REPLACE VIEW dashboard_general_stats AS
SELECT 
    -- Promoter Statistics
    (SELECT COUNT(*) FROM promoters WHERE status_for_delete = 'active') AS total_promoters,
    (SELECT COUNT(*) FROM promoters WHERE status_for_delete = 'active' AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE)) AS promoters_this_month,
    
    -- Channel Partner Statistics
    (SELECT COUNT(*) FROM channel_partners WHERE status_for_delete = 'active') AS total_channel_partners,
    (SELECT COUNT(*) FROM channel_partners WHERE status_for_delete = 'active' AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE)) AS channel_partners_this_month,
    
    -- Project Statistics
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active') AS total_projects,
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active' AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE)) AS projects_this_month,
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active' AND project_type = 'Residential') AS residential_projects,
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active' AND project_type = 'Commercial') AS commercial_projects,
    
    -- Assignment Statistics
    (SELECT COUNT(*) FROM assignments WHERE status_for_delete = 'active') AS total_assignments,
    (SELECT COUNT(*) FROM assignments WHERE status_for_delete = 'active' AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE)) AS assignments_this_month,
    
    -- Professional Statistics
    (SELECT COUNT(*) FROM engineers) AS total_engineers,
    (SELECT COUNT(*) FROM architects) AS total_architects,
    (SELECT COUNT(*) FROM cas) AS total_cas,
    
    -- Financial Statistics
    (SELECT COALESCE(SUM(consultation_charges), 0) FROM assignments WHERE status_for_delete = 'active') AS total_consultation_value,
    (SELECT COALESCE(SUM(consultation_charges), 0) FROM assignments WHERE status_for_delete = 'active' AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE)) AS consultation_value_this_month,
    
    -- Geographic Coverage
    (SELECT COUNT(DISTINCT district) FROM promoters WHERE status_for_delete = 'active') AS promoter_districts_covered,
    (SELECT COUNT(DISTINCT city) FROM promoters WHERE status_for_delete = 'active') AS promoter_cities_covered,
    (SELECT COUNT(DISTINCT district) FROM projects WHERE status_for_delete = 'active') AS project_districts_covered,
    (SELECT COUNT(DISTINCT city) FROM projects WHERE status_for_delete = 'active') AS project_cities_covered;

-- ====================================================================
-- 5. PROMOTER INSIGHTS
-- ====================================================================

-- Promoter Type Distribution
CREATE OR REPLACE VIEW dashboard_promoter_type_distribution AS
SELECT 
    COALESCE(promoter_type, 'Unspecified') AS promoter_type,
    COUNT(*) AS promoter_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage,
    COUNT(DISTINCT district) AS districts_covered,
    COUNT(DISTINCT city) AS cities_covered,
    (SELECT COUNT(*) FROM projects WHERE promoter_id IN 
        (SELECT id FROM promoters WHERE promoter_type = COALESCE(p.promoter_type, 'Unspecified') AND status_for_delete = 'active')
        AND status_for_delete = 'active') AS total_projects
FROM promoters p
WHERE status_for_delete = 'active'
GROUP BY promoter_type
ORDER BY promoter_count DESC;

-- Geographic Distribution of Promoters
CREATE OR REPLACE VIEW dashboard_promoter_geographic_distribution AS
SELECT 
    district,
    city,
    COUNT(*) AS promoter_count,
    COUNT(DISTINCT promoter_type) AS promoter_types,
    (SELECT COUNT(*) FROM projects WHERE promoter_id IN 
        (SELECT id FROM promoters WHERE district = p.district AND city = p.city AND status_for_delete = 'active')
        AND status_for_delete = 'active') AS total_projects
FROM promoters p
WHERE status_for_delete = 'active'
GROUP BY district, city
ORDER BY promoter_count DESC;

-- ====================================================================
-- 6. PROJECT INSIGHTS
-- ====================================================================

-- Project Status Overview
CREATE OR REPLACE VIEW dashboard_project_overview AS
SELECT 
    p.id AS project_id,
    p.project_name,
    p.project_type,
    p.district,
    p.city,
    pr.promoter_name,
    pr.promoter_type,
    cp.full_name AS channel_partner_name,
    p.rera_number,
    p.registration_date,
    p.expiry_date,
    CASE 
        WHEN p.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'Active'
    END AS rera_status,
    (SELECT COUNT(*) FROM assignments WHERE project_id = p.id AND status_for_delete = 'active') AS total_assignments,
    COALESCE((SELECT SUM(consultation_charges) FROM assignments WHERE project_id = p.id AND status_for_delete = 'active'), 0) AS total_consultation_value
FROM projects p
JOIN promoters pr ON p.promoter_id = pr.id
LEFT JOIN channel_partners cp ON p.channel_partner_id = cp.id
WHERE p.status_for_delete = 'active' 
    AND pr.status_for_delete = 'active'
    AND (cp.status_for_delete = 'active' OR cp.id IS NULL);

-- RERA Expiry Alerts
CREATE OR REPLACE VIEW dashboard_rera_expiry_alerts AS
SELECT 
    p.id AS project_id,
    p.project_name,
    p.rera_number,
    p.expiry_date,
    pr.promoter_name,
    p.district,
    p.city,
    p.expiry_date - CURRENT_DATE AS days_to_expiry,
    CASE 
        WHEN p.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Critical'
        WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'Warning'
        ELSE 'Normal'
    END AS alert_level
FROM projects p
JOIN promoters pr ON p.promoter_id = pr.id
WHERE p.status_for_delete = 'active' 
    AND pr.status_for_delete = 'active'
    AND p.expiry_date IS NOT NULL
    AND p.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY p.expiry_date ASC;

-- ====================================================================
-- 7. FINANCIAL INSIGHTS
-- ====================================================================

-- Monthly Financial Summary
CREATE OR REPLACE VIEW dashboard_monthly_financial_summary AS
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') AS month_year,
    TO_CHAR(created_at, 'Mon YYYY') AS month_name,
    COUNT(*) AS assignments_count,
    SUM(consultation_charges) AS total_consultation_revenue,
    SUM(govt_fees) AS total_govt_fees,
    SUM(ca_fees) AS total_ca_fees,
    SUM(engineer_fees) AS total_engineer_fees,
    SUM(arch_fees) AS total_architect_fees,
    SUM(liasioning_fees) AS total_liasioning_fees,
    SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees) AS total_operational_costs,
    SUM(consultation_charges) - SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees) AS net_revenue,
    ROUND(AVG(consultation_charges), 2) AS avg_consultation_charges
FROM assignments
WHERE status_for_delete = 'active'
GROUP BY 
    TO_CHAR(created_at, 'YYYY-MM'),
    TO_CHAR(created_at, 'Mon YYYY')
ORDER BY month_year DESC;

-- Assignment Type Financial Performance
CREATE OR REPLACE VIEW dashboard_assignment_financial_performance AS
SELECT 
    assignment_type,
    COUNT(*) AS assignment_count,
    SUM(consultation_charges) AS total_revenue,
    SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees) AS total_costs,
    SUM(consultation_charges) - SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees) AS net_profit,
    ROUND(AVG(consultation_charges), 2) AS avg_consultation_charges,
    ROUND(AVG(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees), 2) AS avg_operational_costs,
    CASE 
        WHEN SUM(consultation_charges) > 0 THEN 
            ROUND(((SUM(consultation_charges) - SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees)) / SUM(consultation_charges)) * 100, 2)
        ELSE 0 
    END AS profit_margin_percentage
FROM assignments
WHERE status_for_delete = 'active'
GROUP BY assignment_type
ORDER BY total_revenue DESC;

-- ====================================================================
-- 8. ACTIVITY AND PRODUCTIVITY METRICS
-- ====================================================================

-- User Activity Summary (based on created_by and updated_by fields)
CREATE OR REPLACE VIEW dashboard_user_activity_summary AS
SELECT 
    user_id,
    user_type,
    total_actions,
    promoters_created,
    projects_created,
    assignments_created,
    channel_partners_created,
    last_activity_date
FROM (
    SELECT 
        created_by AS user_id,
        'Creator' AS user_type,
        COUNT(*) AS total_actions,
        COUNT(*) FILTER (WHERE table_name = 'promoters') AS promoters_created,
        COUNT(*) FILTER (WHERE table_name = 'projects') AS projects_created,
        COUNT(*) FILTER (WHERE table_name = 'assignments') AS assignments_created,
        COUNT(*) FILTER (WHERE table_name = 'channel_partners') AS channel_partners_created,
        MAX(created_at) AS last_activity_date
    FROM (
        SELECT created_by, created_at, 'promoters' AS table_name FROM promoters WHERE status_for_delete = 'active'
        UNION ALL
        SELECT created_by, created_at, 'projects' AS table_name FROM projects WHERE status_for_delete = 'active'
        UNION ALL
        SELECT created_by, created_at, 'assignments' AS table_name FROM assignments WHERE status_for_delete = 'active'
        UNION ALL
        SELECT created_by, created_at, 'channel_partners' AS table_name FROM channel_partners WHERE status_for_delete = 'active'
    ) combined_activity
    GROUP BY created_by
) user_stats
ORDER BY total_actions DESC;

-- Recent Activity Feed
CREATE OR REPLACE VIEW dashboard_recent_activity AS
SELECT 
    activity_date,
    activity_type,
    entity_name,
    entity_type,
    created_by_user,
    district,
    city
FROM (
    SELECT 
        created_at AS activity_date,
        'New Promoter Added' AS activity_type,
        promoter_name AS entity_name,
        'Promoter' AS entity_type,
        created_by AS created_by_user,
        district,
        city
    FROM promoters 
    WHERE status_for_delete = 'active'
    
    UNION ALL
    
    SELECT 
        created_at AS activity_date,
        'New Project Added' AS activity_type,
        project_name AS entity_name,
        'Project' AS entity_type,
        created_by AS created_by_user,
        district,
        city
    FROM projects 
    WHERE status_for_delete = 'active'
    
    UNION ALL
    
    SELECT 
        created_at AS activity_date,
        'New Assignment Created' AS activity_type,
        assignment_type AS entity_name,
        'Assignment' AS entity_type,
        created_by AS created_by_user,
        NULL AS district,
        NULL AS city
    FROM assignments 
    WHERE status_for_delete = 'active'
    
    UNION ALL
    
    SELECT 
        created_at AS activity_date,
        'New Channel Partner Added' AS activity_type,
        full_name AS entity_name,
        'Channel Partner' AS entity_type,
        created_by AS created_by_user,
        district,
        city
    FROM channel_partners 
    WHERE status_for_delete = 'active'
) recent_activities
ORDER BY activity_date DESC
LIMIT 50;