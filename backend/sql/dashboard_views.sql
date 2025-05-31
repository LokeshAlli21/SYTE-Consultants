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
        (SELECT ast.assignment_status 
         FROM assignment_statuses ast
         JOIN assignment_timeline at ON ast.timeline_id = at.id
         WHERE ast.assignment_id = a.id 
         ORDER BY at.created_at DESC 
         LIMIT 1), 
        'Not Started'
    ) AS current_status,
    COUNT(*) AS assignment_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage,
    COUNT(DISTINCT a.project_id) AS projects_involved,
    COUNT(DISTINCT a.assignment_type) AS assignment_types_involved
FROM assignments a
WHERE a.status_for_delete = 'active'
GROUP BY 
    (SELECT ast.assignment_status 
     FROM assignment_statuses ast
     JOIN assignment_timeline at ON ast.timeline_id = at.id
     WHERE ast.assignment_id = a.id 
     ORDER BY at.created_at DESC 
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
    COALESCE(
        (SELECT ast.assignment_status 
         FROM assignment_statuses ast
         JOIN assignment_timeline at ON ast.timeline_id = at.id
         WHERE ast.assignment_id = a.id 
         ORDER BY at.created_at DESC 
         LIMIT 1), 
        'Not Started'
    ) AS assignment_status,
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
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active' AND project_type = 'Residential / Group Housing') AS residential_projects,
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active' AND project_type = 'Commercial') AS commercial_projects,
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active' AND project_type = 'Mixed') AS mixed_projects,
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active' AND project_type = 'Plotted') AS plotted_projects,
    
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
    (SELECT COUNT(DISTINCT district) FROM channel_partners WHERE status_for_delete = 'active') AS channel_partner_districts_covered,
    (SELECT COUNT(DISTINCT city) FROM channel_partners WHERE status_for_delete = 'active') AS channel_partner_cities_covered,
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
-- CREATE OR REPLACE VIEW dashboard_recent_activity AS
-- SELECT 
--     activity_date,
--     activity_type,
--     entity_name,
--     entity_type,
--     entity_id,
--     created_by_user,
--     created_by_name,
--     district,
--     city,
--     location_display,
--     time_ago,
--     additional_info
-- FROM (
--     -- Promoter Activities
--     SELECT 
--         p.created_at AS activity_date,
--         'New Promoter Added' AS activity_type,
--         p.promoter_name AS entity_name,
--         'Promoter' AS entity_type,
--         p.id AS entity_id,
--         p.created_by AS created_by_user,
--         u.name AS created_by_name,
--         p.district,
--         p.city,
--         CASE 
--             WHEN p.city IS NOT NULL AND p.district IS NOT NULL 
--             THEN CONCAT(p.city, ', ', p.district)
--             WHEN p.district IS NOT NULL 
--             THEN p.district
--             WHEN p.city IS NOT NULL 
--             THEN p.city
--             ELSE 'Location not specified'
--         END AS location_display,
--         CASE 
--             WHEN p.created_at >= NOW() - INTERVAL '1 hour' THEN 'Just now'
--             WHEN p.created_at >= NOW() - INTERVAL '1 day' THEN CONCAT(EXTRACT(HOUR FROM NOW() - p.created_at), ' hours ago')
--             WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN CONCAT(EXTRACT(DAY FROM NOW() - p.created_at), ' days ago')
--             ELSE TO_CHAR(p.created_at, 'DD Mon YYYY')
--         END AS time_ago,
--         CONCAT('Contact: ', COALESCE(p.contact_number, 'Not provided')) AS additional_info
--     FROM promoters p
--     LEFT JOIN users u ON p.created_by = u.id
--     WHERE p.status_for_delete = 'active'
    
--     UNION ALL
    
--     -- Project Activities
--     SELECT 
--         p.created_at AS activity_date,
--         CASE 
--             WHEN p.project_type IS NOT NULL 
--             THEN CONCAT('New ', p.project_type, ' Project Added')
--             ELSE 'New Project Added'
--         END AS activity_type,
--         p.project_name AS entity_name,
--         'Project' AS entity_type,
--         p.id AS entity_id,
--         p.created_by AS created_by_user,
--         u.name AS created_by_name,
--         p.district,
--         p.city,
--         CASE 
--             WHEN p.city IS NOT NULL AND p.district IS NOT NULL 
--             THEN CONCAT(p.city, ', ', p.district)
--             WHEN p.district IS NOT NULL 
--             THEN p.district
--             WHEN p.city IS NOT NULL 
--             THEN p.city
--             ELSE 'Location not specified'
--         END AS location_display,
--         CASE 
--             WHEN p.created_at >= NOW() - INTERVAL '1 hour' THEN 'Just now'
--             WHEN p.created_at >= NOW() - INTERVAL '1 day' THEN CONCAT(EXTRACT(HOUR FROM NOW() - p.created_at), ' hours ago')
--             WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN CONCAT(EXTRACT(DAY FROM NOW() - p.created_at), ' days ago')
--             ELSE TO_CHAR(p.created_at, 'DD Mon YYYY')
--         END AS time_ago,
--         CASE 
--             WHEN p.project_type IS NOT NULL 
--             THEN CONCAT('Type: ', p.project_type)
--             ELSE 'Project details available'
--         END AS additional_info
--     FROM projects p
--     LEFT JOIN users u ON p.created_by = u.id
--     WHERE p.status_for_delete = 'active'
    
--     UNION ALL
    
--     -- Assignment Activities
--     SELECT 
--         a.created_at AS activity_date,
--         CASE 
--             WHEN a.assignment_type IS NOT NULL 
--             THEN CONCAT('New ', a.assignment_type, ' Assignment')
--             ELSE 'New Assignment Created'
--         END AS activity_type,
--         COALESCE(a.assignment_type, 'Assignment') AS entity_name,
--         'Assignment' AS entity_type,
--         a.id AS entity_id,
--         a.created_by AS created_by_user,
--         u.name AS created_by_name,
--         NULL AS district,
--         NULL AS city,
--         'Assignment Details' AS location_display,
--         CASE 
--             WHEN a.created_at >= NOW() - INTERVAL '1 hour' THEN 'Just now'
--             WHEN a.created_at >= NOW() - INTERVAL '1 day' THEN CONCAT(EXTRACT(HOUR FROM NOW() - a.created_at), ' hours ago')
--             WHEN a.created_at >= NOW() - INTERVAL '7 days' THEN CONCAT(EXTRACT(DAY FROM NOW() - a.created_at), ' days ago')
--             ELSE TO_CHAR(a.created_at, 'DD Mon YYYY')
--         END AS time_ago,
--         CASE 
--             WHEN a.consultation_charges IS NOT NULL 
--             THEN CONCAT('Value: ₹', a.consultation_charges)
--             ELSE 'Consultation assigned'
--         END AS additional_info
--     FROM assignments a
--     LEFT JOIN users u ON a.created_by = u.id
--     WHERE a.status_for_delete = 'active'
    
--     UNION ALL
    
--     -- Channel Partner Activities
--     SELECT 
--         cp.created_at AS activity_date,
--         'New Channel Partner Added' AS activity_type,
--         cp.full_name AS entity_name,
--         'Channel Partner' AS entity_type,
--         cp.id AS entity_id,
--         cp.created_by AS created_by_user,
--         u.name AS created_by_name,
--         cp.district,
--         cp.city,
--         CASE 
--             WHEN cp.city IS NOT NULL AND cp.district IS NOT NULL 
--             THEN CONCAT(cp.city, ', ', cp.district)
--             WHEN cp.district IS NOT NULL 
--             THEN cp.district
--             WHEN cp.city IS NOT NULL 
--             THEN cp.city
--             ELSE 'Location not specified'
--         END AS location_display,
--         CASE 
--             WHEN cp.created_at >= NOW() - INTERVAL '1 hour' THEN 'Just now'
--             WHEN cp.created_at >= NOW() - INTERVAL '1 day' THEN CONCAT(EXTRACT(HOUR FROM NOW() - cp.created_at), ' hours ago')
--             WHEN cp.created_at >= NOW() - INTERVAL '7 days' THEN CONCAT(EXTRACT(DAY FROM NOW() - cp.created_at), ' days ago')
--             ELSE TO_CHAR(cp.created_at, 'DD Mon YYYY')
--         END AS time_ago,
--         CONCAT('Contact: ', COALESCE(cp.contact_number, 'Not provided')) AS additional_info
--     FROM channel_partners cp
--     LEFT JOIN users u ON cp.created_by = u.id
--     WHERE cp.status_for_delete = 'active'
-- ) recent_activities
-- ORDER BY activity_date DESC, entity_id DESC
-- LIMIT 15;

-- Enhanced Recent Activity Feed View
-- Improvements: Better performance, consistent formatting, more activity types, better time calculation
CREATE OR REPLACE VIEW dashboard_recent_activity AS
WITH time_calculations AS (
    SELECT 
        NOW() AS current_time,
        NOW() - INTERVAL '1 hour' AS one_hour_ago,
        NOW() - INTERVAL '1 day' AS one_day_ago,
        NOW() - INTERVAL '7 days' AS one_week_ago,
        NOW() - INTERVAL '30 days' AS one_month_ago
),
recent_activities_raw AS (
    -- Promoter Activities
    SELECT 
        p.created_at AS activity_date,
        'promoter_added' AS activity_category,
        CASE 
            WHEN p.promoter_type IS NOT NULL 
            THEN CONCAT('New ', INITCAP(p.promoter_type), ' Promoter Added')
            ELSE 'New Promoter Added'
        END AS activity_type,
        p.promoter_name AS entity_name,
        'Promoter' AS entity_type,
        p.id AS entity_id,
        p.created_by AS created_by_user,
        u.name AS created_by_name,
        p.district,
        p.city,
        CASE 
            WHEN p.city IS NOT NULL AND p.district IS NOT NULL 
            THEN CONCAT(p.city, ', ', p.district)
            WHEN p.district IS NOT NULL 
            THEN p.district
            WHEN p.city IS NOT NULL 
            THEN p.city
            ELSE 'Location not specified'
        END AS location_display,
        JSONB_BUILD_OBJECT(
            'contact', COALESCE(p.contact_number, 'Not provided'),
            'email', COALESCE(p.email_id, 'Not provided'),
            'type', COALESCE(p.promoter_type, 'Not specified')
        ) AS additional_info,
        1 AS sort_priority
    FROM promoters p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.status_for_delete = 'active'
    
    UNION ALL
    
    -- Project Activities
    SELECT 
        p.created_at AS activity_date,
        'project_added' AS activity_category,
        CASE 
            WHEN p.project_type IS NOT NULL 
            THEN CONCAT('New ', INITCAP(p.project_type), ' Project Added')
            ELSE 'New Project Added'
        END AS activity_type,
        p.project_name AS entity_name,
        'Project' AS entity_type,
        p.id AS entity_id,
        p.created_by AS created_by_user,
        u.name AS created_by_name,
        p.district,
        p.city,
        CASE 
            WHEN p.city IS NOT NULL AND p.district IS NOT NULL 
            THEN CONCAT(p.city, ', ', p.district)
            WHEN p.district IS NOT NULL 
            THEN p.district
            WHEN p.city IS NOT NULL 
            THEN p.city
            ELSE 'Location not specified'
        END AS location_display,
        JSONB_BUILD_OBJECT(
            'type', COALESCE(p.project_type, 'Not specified'),
            'promoter', COALESCE(p.promoter_name, 'Not specified'),
            'rera_number', COALESCE(p.rera_number, 'Not provided'),
            'registration_date', COALESCE(p.registration_date::text, 'Not specified')
        ) AS additional_info,
        2 AS sort_priority
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.status_for_delete = 'active'
    
    UNION ALL
    
    -- Assignment Activities
    SELECT 
        a.created_at AS activity_date,
        'assignment_created' AS activity_category,
        CASE 
            WHEN a.assignment_type IS NOT NULL 
            THEN CONCAT('New ', INITCAP(a.assignment_type), ' Assignment')
            ELSE 'New Assignment Created'
        END AS activity_type,
        COALESCE(a.assignment_type, 'General Assignment') AS entity_name,
        'Assignment' AS entity_type,
        a.id AS entity_id,
        a.created_by AS created_by_user,
        u.name AS created_by_name,
        p.district,
        p.city,
        CASE 
            WHEN p.city IS NOT NULL AND p.district IS NOT NULL 
            THEN CONCAT(p.city, ', ', p.district)
            WHEN p.district IS NOT NULL 
            THEN p.district
            WHEN p.city IS NOT NULL 
            THEN p.city
            ELSE 'Project location'
        END AS location_display,
        JSONB_BUILD_OBJECT(
            'project_name', COALESCE(p.project_name, 'Unknown Project'),
            'consultation_charges', CASE 
                WHEN a.consultation_charges IS NOT NULL 
                THEN CONCAT('₹', TO_CHAR(a.consultation_charges, 'FM999,999,999.00'))
                ELSE 'Not specified'
            END,
            'application_number', COALESCE(a.application_number, 'Not assigned'),
            'payment_date', COALESCE(a.payment_date::text, 'Not scheduled')
        ) AS additional_info,
        3 AS sort_priority
    FROM assignments a
    LEFT JOIN users u ON a.created_by = u.id
    LEFT JOIN projects p ON a.project_id = p.id
    WHERE a.status_for_delete = 'active'
    
    UNION ALL
    
    -- Channel Partner Activities
    SELECT 
        cp.created_at AS activity_date,
        'channel_partner_added' AS activity_category,
        'New Channel Partner Added' AS activity_type,
        cp.full_name AS entity_name,
        'Channel Partner' AS entity_type,
        cp.id AS entity_id,
        cp.created_by AS created_by_user,
        u.name AS created_by_name,
        cp.district,
        cp.city,
        CASE 
            WHEN cp.city IS NOT NULL AND cp.district IS NOT NULL 
            THEN CONCAT(cp.city, ', ', cp.district)
            WHEN cp.district IS NOT NULL 
            THEN cp.district
            WHEN cp.city IS NOT NULL 
            THEN cp.city
            ELSE 'Location not specified'
        END AS location_display,
        JSONB_BUILD_OBJECT(
            'contact', COALESCE(cp.contact_number, 'Not provided'),
            'alternate_contact', COALESCE(cp.alternate_contact_number, 'Not provided'),
            'email', COALESCE(cp.email_id, 'Not provided')
        ) AS additional_info,
        4 AS sort_priority
    FROM channel_partners cp
    LEFT JOIN users u ON cp.created_by = u.id
    WHERE cp.status_for_delete = 'active'
    
    UNION ALL
    
    -- Project Unit Activities (New units added)
    SELECT 
        pu.created_at AS activity_date,
        'unit_added' AS activity_category,
        CASE 
            WHEN pu.unit_type IS NOT NULL 
            THEN CONCAT('New ', INITCAP(pu.unit_type), ' Unit Added')
            ELSE 'New Unit Added'
        END AS activity_type,
        COALESCE(pu.unit_name, CONCAT('Unit #', pu.id)) AS entity_name,
        'Project Unit' AS entity_type,
        pu.id AS entity_id,
        pu.created_by AS created_by_user,
        u.name AS created_by_name,
        p.district,
        p.city,
        CASE 
            WHEN p.city IS NOT NULL AND p.district IS NOT NULL 
            THEN CONCAT(p.city, ', ', p.district)
            WHEN p.district IS NOT NULL 
            THEN p.district
            WHEN p.city IS NOT NULL 
            THEN p.city
            ELSE 'Project location'
        END AS location_display,
        JSONB_BUILD_OBJECT(
            'project_name', COALESCE(p.project_name, 'Unknown Project'),
            'unit_type', COALESCE(pu.unit_type, 'Not specified'),
            'carpet_area', CASE 
                WHEN pu.carpet_area IS NOT NULL 
                THEN CONCAT(pu.carpet_area, ' sq ft')
                ELSE 'Not specified'
            END,
            'unit_status', pu.unit_status,
            'customer_name', COALESCE(pu.customer_name, 'Not assigned')
        ) AS additional_info,
        5 AS sort_priority
    FROM project_units pu
    LEFT JOIN users u ON pu.created_by = u.id
    LEFT JOIN projects p ON pu.project_id = p.id
    WHERE pu.status_for_delete = 'active'
),
activities_with_time AS (
    SELECT 
        ra.*,
        tc.current_time,
        tc.one_hour_ago,
        tc.one_day_ago,
        tc.one_week_ago,
        tc.one_month_ago,
        CASE 
            WHEN ra.activity_date >= tc.one_hour_ago THEN 'Just now'
            WHEN ra.activity_date >= tc.one_day_ago THEN 
                CONCAT(EXTRACT(HOUR FROM tc.current_time - ra.activity_date)::INTEGER, 
                       CASE 
                           WHEN EXTRACT(HOUR FROM tc.current_time - ra.activity_date)::INTEGER = 1 
                           THEN ' hour ago'
                           ELSE ' hours ago'
                       END)
            WHEN ra.activity_date >= tc.one_week_ago THEN 
                CONCAT(EXTRACT(DAY FROM tc.current_time - ra.activity_date)::INTEGER,
                       CASE 
                           WHEN EXTRACT(DAY FROM tc.current_time - ra.activity_date)::INTEGER = 1 
                           THEN ' day ago'
                           ELSE ' days ago'
                       END)
            WHEN ra.activity_date >= tc.one_month_ago THEN 
                CONCAT(CEIL(EXTRACT(DAY FROM tc.current_time - ra.activity_date) / 7.0)::INTEGER, 
                       CASE 
                           WHEN CEIL(EXTRACT(DAY FROM tc.current_time - ra.activity_date) / 7.0)::INTEGER = 1 
                           THEN ' week ago'
                           ELSE ' weeks ago'
                       END)
            ELSE TO_CHAR(ra.activity_date, 'DD Mon YYYY')
        END AS time_ago,
        -- Add activity age for filtering
        CASE 
            WHEN ra.activity_date >= tc.one_hour_ago THEN 'recent'
            WHEN ra.activity_date >= tc.one_day_ago THEN 'today'
            WHEN ra.activity_date >= tc.one_week_ago THEN 'this_week'
            WHEN ra.activity_date >= tc.one_month_ago THEN 'this_month'
            ELSE 'older'
        END AS activity_age
    FROM recent_activities_raw ra
    CROSS JOIN time_calculations tc
)
SELECT 
    activity_date,
    activity_category,
    activity_type,
    entity_name,
    entity_type,
    entity_id,
    created_by_user,
    created_by_name,
    district,
    city,
    location_display,
    time_ago,
    activity_age,
    additional_info,
    sort_priority,
    -- Add some computed fields for better UI experience
    CASE 
        WHEN activity_age = 'recent' THEN '#22c55e'  -- Green for very recent
        WHEN activity_age = 'today' THEN '#3b82f6'   -- Blue for today
        WHEN activity_age = 'this_week' THEN '#f59e0b' -- Orange for this week
        ELSE '#6b7280'  -- Gray for older
    END AS activity_color,
    -- Activity icon suggestions
    CASE activity_category
        WHEN 'promoter_added' THEN 'user-plus'
        WHEN 'project_added' THEN 'building'
        WHEN 'assignment_created' THEN 'clipboard-list'
        WHEN 'channel_partner_added' THEN 'users'
        WHEN 'unit_added' THEN 'home'
        ELSE 'activity'
    END AS activity_icon
FROM activities_with_time
ORDER BY 
    activity_date DESC, 
    sort_priority ASC,
    entity_id DESC
LIMIT 20;

-- Create an index to improve performance
CREATE INDEX IF NOT EXISTS idx_dashboard_activity_performance 
ON promoters (created_at DESC, status_for_delete) 
WHERE status_for_delete = 'active';

CREATE INDEX IF NOT EXISTS idx_dashboard_activity_projects 
ON projects (created_at DESC, status_for_delete) 
WHERE status_for_delete = 'active';

CREATE INDEX IF NOT EXISTS idx_dashboard_activity_assignments 
ON assignments (created_at DESC, status_for_delete) 
WHERE status_for_delete = 'active';

CREATE INDEX IF NOT EXISTS idx_dashboard_activity_channel_partners 
ON channel_partners (created_at DESC, status_for_delete) 
WHERE status_for_delete = 'active';

CREATE INDEX IF NOT EXISTS idx_dashboard_activity_units 
ON project_units (created_at DESC, status_for_delete) 
WHERE status_for_delete = 'active';

-- Optional: Create a materialized view for better performance on large datasets
-- Uncomment if you have performance issues with large amounts of data
/*
CREATE MATERIALIZED VIEW dashboard_recent_activity_mv AS
SELECT * FROM dashboard_recent_activity;

CREATE UNIQUE INDEX idx_dashboard_activity_mv_unique 
ON dashboard_recent_activity_mv (activity_date, entity_type, entity_id);

-- Refresh function (call this periodically or via trigger)
CREATE OR REPLACE FUNCTION refresh_dashboard_activity()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_recent_activity_mv;
END;
$$ LANGUAGE plpgsql;
*/