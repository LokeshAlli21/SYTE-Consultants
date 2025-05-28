-- =====================================================
-- MASTER DASHBOARD VIEWS FOR REAL ESTATE PROJECT MANAGEMENT SYSTEM
-- =====================================================

-- 1. MASTER DASHBOARD OVERVIEW VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_master_dashboard AS
SELECT 
    -- Summary Counts
    (SELECT COUNT(*) FROM promoters WHERE status_for_delete = 'active') AS total_active_promoters,
    (SELECT COUNT(*) FROM projects WHERE status_for_delete = 'active') AS total_active_projects,
    (SELECT COUNT(*) FROM project_units WHERE status_for_delete = 'active') AS total_units,
    (SELECT COUNT(*) FROM project_units WHERE status_for_delete = 'active' AND unit_status = 'Available') AS available_units,
    (SELECT COUNT(*) FROM project_units WHERE status_for_delete = 'active' AND unit_status = 'Booked') AS booked_units,
    (SELECT COUNT(*) FROM project_units WHERE status_for_delete = 'active' AND unit_status = 'Sold') AS sold_units,
    (SELECT COUNT(*) FROM assignments WHERE status_for_delete = 'active') AS total_assignments,
    (SELECT COUNT(*) FROM channel_partners WHERE status_for_delete = 'active') AS total_channel_partners,
    
    -- Financial Summary
    (SELECT COALESCE(SUM(agreement_value), 0) FROM project_units WHERE status_for_delete = 'active') AS total_agreement_value,
    (SELECT COALESCE(SUM(total_received), 0) FROM project_units WHERE status_for_delete = 'active') AS total_amount_received,
    (SELECT COALESCE(SUM(balance_amount), 0) FROM project_units WHERE status_for_delete = 'active') AS total_balance_amount,
    
    -- Assignment Financial Summary
    (SELECT COALESCE(SUM(consultation_charges), 0) FROM assignments WHERE status_for_delete = 'active') AS total_consultation_charges,
    (SELECT COALESCE(SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees), 0) FROM assignments WHERE status_for_delete = 'active') AS total_operational_costs;

-- 2. PROMOTERS DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_promoters_dashboard AS
SELECT 
    p.id,
    p.promoter_name,
    p.contact_number,
    p.email_id,
    p.district,
    p.city,
    p.promoter_type,
    p.status_for_delete,
    p.created_at,
    
    -- Project counts for each promoter
    COALESCE(proj_stats.project_count, 0) AS total_projects,
    COALESCE(proj_stats.active_projects, 0) AS active_projects,
    
    -- Unit statistics
    COALESCE(unit_stats.total_units, 0) AS total_units,
    COALESCE(unit_stats.sold_units, 0) AS sold_units,
    COALESCE(unit_stats.booked_units, 0) AS booked_units,
    COALESCE(unit_stats.available_units, 0) AS available_units,
    
    -- Financial summary
    COALESCE(unit_stats.total_agreement_value, 0) AS total_agreement_value,
    COALESCE(unit_stats.total_received, 0) AS total_received,
    COALESCE(unit_stats.total_balance, 0) AS total_balance,
    
    -- Assignment counts
    COALESCE(assign_stats.total_assignments, 0) AS total_assignments
    
FROM promoters p
LEFT JOIN (
    SELECT 
        promoter_id,
        COUNT(*) AS project_count,
        COUNT(CASE WHEN status_for_delete = 'active' THEN 1 END) AS active_projects
    FROM projects 
    GROUP BY promoter_id
) proj_stats ON p.id = proj_stats.promoter_id

LEFT JOIN (
    SELECT 
        pr.promoter_id,
        COUNT(pu.id) AS total_units,
        COUNT(CASE WHEN pu.unit_status = 'Sold' THEN 1 END) AS sold_units,
        COUNT(CASE WHEN pu.unit_status = 'Booked' THEN 1 END) AS booked_units,
        COUNT(CASE WHEN pu.unit_status = 'Available' THEN 1 END) AS available_units,
        SUM(pu.agreement_value) AS total_agreement_value,
        SUM(pu.total_received) AS total_received,
        SUM(pu.balance_amount) AS total_balance
    FROM projects pr
    LEFT JOIN project_units pu ON pr.id = pu.project_id AND pu.status_for_delete = 'active'
    WHERE pr.status_for_delete = 'active'
    GROUP BY pr.promoter_id
) unit_stats ON p.id = unit_stats.promoter_id

LEFT JOIN (
    SELECT 
        pr.promoter_id,
        COUNT(a.id) AS total_assignments
    FROM projects pr
    LEFT JOIN assignments a ON pr.id = a.project_id AND a.status_for_delete = 'active'
    WHERE pr.status_for_delete = 'active'
    GROUP BY pr.promoter_id
) assign_stats ON p.id = assign_stats.promoter_id

WHERE p.status_for_delete = 'active'
ORDER BY p.promoter_name;

-- 3. PROJECTS DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_projects_dashboard AS
SELECT 
    p.id,
    p.promoter_id,
    p.promoter_name,
    p.project_name,
    p.project_type,
    p.district,
    p.city,
    p.rera_number,
    p.registration_date,
    p.expiry_date,
    p.status_for_delete,
    p.created_at,
    
    -- Channel partner info
    cp.full_name AS channel_partner_name,
    cp.contact_number AS channel_partner_contact,
    
    -- Unit statistics
    COALESCE(unit_stats.total_units, 0) AS total_units,
    COALESCE(unit_stats.sold_units, 0) AS sold_units,
    COALESCE(unit_stats.booked_units, 0) AS booked_units,
    COALESCE(unit_stats.available_units, 0) AS available_units,
    
    -- Financial summary
    COALESCE(unit_stats.total_agreement_value, 0) AS total_agreement_value,
    COALESCE(unit_stats.total_received, 0) AS total_received,
    COALESCE(unit_stats.total_balance, 0) AS total_balance,
    
    -- Progress summary
    COALESCE(ROUND(building_progress.avg_building_progress, 2), 0) AS avg_building_progress,
    
    -- Assignment counts
    COALESCE(assign_stats.total_assignments, 0) AS total_assignments,
    COALESCE(assign_stats.consultation_revenue, 0) AS consultation_revenue,
    
    -- Professional team
    prof.engineer_name,
    prof.architect_name,
    prof.ca_name
    
FROM projects p
LEFT JOIN channel_partners cp ON p.channel_partner_id = cp.id
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(*) AS total_units,
        COUNT(CASE WHEN unit_status = 'Sold' THEN 1 END) AS sold_units,
        COUNT(CASE WHEN unit_status = 'Booked' THEN 1 END) AS booked_units,
        COUNT(CASE WHEN unit_status = 'Available' THEN 1 END) AS available_units,
        SUM(agreement_value) AS total_agreement_value,
        SUM(total_received) AS total_received,
        SUM(balance_amount) AS total_balance
    FROM project_units 
    WHERE status_for_delete = 'active'
    GROUP BY project_id
) unit_stats ON p.id = unit_stats.project_id

LEFT JOIN (
    SELECT 
        sp.project_id,
        (COALESCE(bp.excavation, 0) + COALESCE(bp.basement, 0) + COALESCE(bp.podium, 0) + 
         COALESCE(bp.plinth, 0) + COALESCE(bp.stilt, 0) + COALESCE(bp.superstructure, 0) +
         COALESCE(bp.interior_finishing, 0) + COALESCE(bp.sanitary_fittings, 0) + 
         COALESCE(bp.common_infrastructure, 0) + COALESCE(bp.external_works, 0) + 
         COALESCE(bp.final_installations, 0)) / 11.0 AS avg_building_progress
    FROM site_progress sp
    LEFT JOIN building_progress bp ON sp.id = bp.site_progress_id
) building_progress ON p.id = building_progress.project_id

LEFT JOIN (
    SELECT 
        project_id,
        COUNT(*) AS total_assignments,
        SUM(consultation_charges) AS consultation_revenue
    FROM assignments 
    WHERE status_for_delete = 'active'
    GROUP BY project_id
) assign_stats ON p.id = assign_stats.project_id

LEFT JOIN (
    SELECT 
        ppd.project_id,
        e.name AS engineer_name,
        a.name AS architect_name,
        c.name AS ca_name
    FROM project_professional_details ppd
    LEFT JOIN engineers e ON ppd.engineer_id = e.id
    LEFT JOIN architects a ON ppd.architect_id = a.id
    LEFT JOIN cas c ON ppd.ca_id = c.id
) prof ON p.id = prof.project_id

WHERE p.status_for_delete = 'active'
ORDER BY p.project_name;

-- 4. UNITS DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_units_dashboard AS
SELECT 
    pu.id,
    pu.project_id,
    p.project_name,
    p.promoter_name,
    p.district,
    p.city,
    pu.unit_name,
    pu.unit_type,
    pu.carpet_area,
    pu.unit_status,
    pu.customer_name,
    pu.agreement_value,
    pu.total_received,
    pu.balance_amount,
    pu.agreement_for_sale_date,
    pu.sale_deed_date,
    pu.status_for_delete,
    pu.created_at,
    
    -- Financial year wise collection summary (last 3 years)
    pu.received_fy_2022_23,
    pu.received_fy_2023_24,
    pu.received_fy_2024_25,
    
    -- Collection percentage
    CASE 
        WHEN pu.agreement_value > 0 THEN ROUND((pu.total_received / pu.agreement_value) * 100, 2)
        ELSE 0 
    END AS collection_percentage,
    
    -- Document status
    CASE WHEN pu.afs_uploaded_url IS NOT NULL THEN 'Yes' ELSE 'No' END AS afs_uploaded,
    CASE WHEN pu.sale_deed_uploaded_url IS NOT NULL THEN 'Yes' ELSE 'No' END AS sale_deed_uploaded

FROM project_units pu
JOIN projects p ON pu.project_id = p.id
WHERE pu.status_for_delete = 'active' AND p.status_for_delete = 'active'
ORDER BY p.project_name, pu.unit_name;

-- 5. ASSIGNMENTS DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_assignments_dashboard AS
SELECT 
    a.id,
    a.project_id,
    p.project_name,
    p.promoter_name,
    a.assignment_type,
    a.payment_date,
    a.application_number,
    a.consultation_charges,
    a.govt_fees,
    a.ca_fees,
    a.engineer_fees,
    a.arch_fees,
    a.liasioning_fees,
    (a.govt_fees + a.ca_fees + a.engineer_fees + a.arch_fees + a.liasioning_fees) AS total_operational_cost,
    (a.consultation_charges - (a.govt_fees + a.ca_fees + a.engineer_fees + a.arch_fees + a.liasioning_fees)) AS net_profit,
    a.remarks,
    a.status_for_delete,
    a.created_at,
    
    -- Latest status from timeline
    latest_status.assignment_status AS current_status,
    latest_status.latest_update AS last_status_update

FROM assignments a
JOIN projects p ON a.project_id = p.id
LEFT JOIN (
    SELECT DISTINCT ON (assignment_id)
        assignment_id,
        assignment_status,
        created_at AS latest_update
    FROM assignment_timeline
    WHERE assignment_status IS NOT NULL
    ORDER BY assignment_id, created_at DESC
) latest_status ON a.id = latest_status.assignment_id

WHERE a.status_for_delete = 'active' AND p.status_for_delete = 'active'
ORDER BY a.created_at DESC;

-- 6. FINANCIAL DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_financial_dashboard AS
SELECT 
    -- Overall Financial Summary
    'Overall Summary' AS category,
    SUM(pu.agreement_value) AS total_agreement_value,
    SUM(pu.total_received) AS total_received,
    SUM(pu.balance_amount) AS total_balance,
    ROUND(
        CASE 
            WHEN SUM(pu.agreement_value) > 0 
            THEN (SUM(pu.total_received) / SUM(pu.agreement_value)) * 100 
            ELSE 0 
        END, 2
    ) AS collection_percentage,

    -- FY wise collections (last 3 years)
    SUM(pu.received_fy_2022_23) AS fy_2022_23_collection,
    SUM(pu.received_fy_2023_24) AS fy_2023_24_collection,
    SUM(pu.received_fy_2024_25) AS fy_2024_25_collection,

    -- Assignment Revenue (use MAX since it's a single-row CROSS JOIN)
    MAX(assign_revenue.total_consultation_charges) AS total_consultation_revenue,
    MAX(assign_revenue.total_operational_costs) AS total_operational_costs,
    MAX(assign_revenue.net_assignment_profit) AS net_assignment_profit

FROM project_units pu
JOIN projects p ON pu.project_id = p.id
CROSS JOIN (
    SELECT 
        SUM(consultation_charges) AS total_consultation_charges,
        SUM(govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees) AS total_operational_costs,
        SUM(consultation_charges - (govt_fees + ca_fees + engineer_fees + arch_fees + liasioning_fees)) AS net_assignment_profit
    FROM assignments 
    WHERE status_for_delete = 'active'
) assign_revenue
WHERE pu.status_for_delete = 'active' AND p.status_for_delete = 'active';

-- 7. SITE PROGRESS DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_site_progress_dashboard AS
SELECT 
    p.id AS project_id,
    p.project_name,
    p.promoter_name,
    p.district,
    p.city,
    
    -- Building Progress Details
    bp.excavation,
    bp.basement,
    bp.podium,
    bp.plinth,
    bp.stilt,
    bp.superstructure,
    bp.interior_finishing,
    bp.sanitary_fittings,
    bp.common_infrastructure,
    bp.external_works,
    bp.final_installations,
    
    -- Average Building Progress
    ROUND(
        (COALESCE(bp.excavation, 0) + COALESCE(bp.basement, 0) + COALESCE(bp.podium, 0) + 
         COALESCE(bp.plinth, 0) + COALESCE(bp.stilt, 0) + COALESCE(bp.superstructure, 0) +
         COALESCE(bp.interior_finishing, 0) + COALESCE(bp.sanitary_fittings, 0) + 
         COALESCE(bp.common_infrastructure, 0) + COALESCE(bp.external_works, 0) + 
         COALESCE(bp.final_installations, 0)) / 11.0, 2
    ) AS avg_building_progress,
    
    -- Common Areas Progress Status (counting completed items)
    COALESCE(common_areas_summary.completed_items, 0) AS common_areas_completed,
    COALESCE(common_areas_summary.total_items, 13) AS total_common_area_items,
    ROUND(
        (COALESCE(common_areas_summary.completed_items, 0) / 13.0) * 100, 2
    ) AS common_areas_progress_percentage,
    
    bp.updated_at AS building_progress_last_updated,
    cap.updated_at AS common_areas_last_updated

FROM projects p
LEFT JOIN site_progress sp ON p.id = sp.project_id
LEFT JOIN building_progress bp ON sp.id = bp.site_progress_id
LEFT JOIN common_areas_progress cap ON sp.id = cap.site_progress_id
LEFT JOIN (
    SELECT 
        site_progress_id,
        (CASE WHEN internal_roads_footpaths->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN water_supply->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN sewerage->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN storm_water_drains->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN landscaping_tree_planting->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN street_lighting->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN community_buildings->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN sewage_treatment->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN solid_waste_management->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN rain_water_harvesting->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN energy_management->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN fire_safety->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN electrical_metering->>'percentage_of_work' IS NOT NULL THEN 1 ELSE 0 END) AS completed_items,
        13 AS total_items
    FROM common_areas_progress
) common_areas_summary ON sp.id = common_areas_summary.site_progress_id

WHERE p.status_for_delete = 'active'
ORDER BY p.project_name;

-- 8. CHANNEL PARTNERS DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_channel_partners_dashboard AS
SELECT 
    cp.id,
    cp.full_name,
    cp.contact_number,
    cp.alternate_contact_number,
    cp.email_id,
    cp.district,
    cp.city,
    cp.status_for_delete,
    cp.created_at,
    
    -- Project statistics
    COALESCE(proj_stats.total_projects, 0) AS total_projects,
    COALESCE(proj_stats.active_projects, 0) AS active_projects,
    
    -- Unit statistics through projects
    COALESCE(unit_stats.total_units, 0) AS total_units_handled,
    COALESCE(unit_stats.sold_units, 0) AS units_sold,
    COALESCE(unit_stats.total_revenue, 0) AS total_sales_value

FROM channel_partners cp
LEFT JOIN (
    SELECT 
        channel_partner_id,
        COUNT(*) AS total_projects,
        COUNT(CASE WHEN status_for_delete = 'active' THEN 1 END) AS active_projects
    FROM projects 
    WHERE channel_partner_id IS NOT NULL
    GROUP BY channel_partner_id
) proj_stats ON cp.id = proj_stats.channel_partner_id

LEFT JOIN (
    SELECT 
        p.channel_partner_id,
        COUNT(pu.id) AS total_units,
        COUNT(CASE WHEN pu.unit_status = 'Sold' THEN 1 END) AS sold_units,
        SUM(CASE WHEN pu.unit_status = 'Sold' THEN pu.agreement_value ELSE 0 END) AS total_revenue
    FROM projects p
    JOIN project_units pu ON p.id = pu.project_id
    WHERE p.channel_partner_id IS NOT NULL 
      AND p.status_for_delete = 'active' 
      AND pu.status_for_delete = 'active'
    GROUP BY p.channel_partner_id
) unit_stats ON cp.id = unit_stats.channel_partner_id

WHERE cp.status_for_delete = 'active'
ORDER BY cp.full_name;

-- 9. REMINDERS AND TIMELINE DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_reminders_dashboard AS
SELECT 
    ar.id,
    ar.assignment_id,
    a.assignment_type,
    p.project_name,
    p.promoter_name,
    ar.date_and_time,
    ar.message,
    ar.assignment_status,
    ar.status,
    ar.created_at,
    
    -- Time until reminder
    CASE 
        WHEN ar.date_and_time > NOW() THEN 'Upcoming'
        WHEN ar.date_and_time <= NOW() AND ar.status != 'completed' THEN 'Overdue'
        ELSE 'Completed'
    END AS reminder_status,
    
    -- Days difference
    EXTRACT(DAY FROM ar.date_and_time - NOW()) AS days_from_now

FROM assignment_reminders ar
JOIN assignments a ON ar.assignment_id = a.id
JOIN projects p ON a.project_id = p.id
WHERE a.status_for_delete = 'active' AND p.status_for_delete = 'active'
ORDER BY ar.date_and_time;

-- 10. DOCUMENT STATUS DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW vw_document_status_dashboard AS
SELECT 
    p.id AS project_id,
    p.project_name,
    p.promoter_name,
    
    -- RERA Documents
    CASE WHEN p.rera_certificate_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS rera_certificate_status,
    
    -- Project Documents
    CASE WHEN pd.cc_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS completion_certificate_status,
    CASE WHEN pd.plan_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS project_plan_status,
    CASE WHEN pd.search_report_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS search_report_status,
    CASE WHEN pd.da_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS development_agreement_status,
    CASE WHEN pd.pa_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS power_of_attorney_status,
    CASE WHEN pd.satbara_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS satbara_status,
    CASE WHEN pd.promoter_letter_head_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS promoter_letterhead_status,
    CASE WHEN pd.promoter_sign_stamp_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS promoter_signature_status,
    
    -- Professional Documents
    CASE WHEN e.licence_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS engineer_licence_status,
    CASE WHEN a_prof.licence_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS architect_licence_status,
    CASE WHEN c.licence_uploaded_url IS NOT NULL THEN 'Uploaded' ELSE 'Missing' END AS ca_licence_status,
    
    -- Document Completeness Score
    (
        (CASE WHEN p.rera_certificate_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN pd.cc_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN pd.plan_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN pd.search_report_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN pd.da_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN pd.pa_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN pd.satbara_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN pd.promoter_letter_head_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN pd.promoter_sign_stamp_uploaded_url IS NOT NULL THEN 1 ELSE 0 END)
    ) AS documents_uploaded_count,
    
    ROUND(
        (
            (CASE WHEN p.rera_certificate_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN pd.cc_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN pd.plan_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN pd.search_report_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN pd.da_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN pd.pa_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN pd.satbara_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN pd.promoter_letter_head_uploaded_url IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN pd.promoter_sign_stamp_uploaded_url IS NOT NULL THEN 1 ELSE 0 END)
        ) / 9.0 * 100, 2
    ) AS document_completeness_percentage

FROM projects p
LEFT JOIN project_documents pd ON p.id = pd.project_id
LEFT JOIN project_professional_details ppd ON p.id = ppd.project_id
LEFT JOIN engineers e ON ppd.engineer_id = e.id
LEFT JOIN architects a_prof ON ppd.architect_id = a_prof.id
LEFT JOIN cas c ON ppd.ca_id = c.id
WHERE p.status_for_delete = 'active'
ORDER BY document_completeness_percentage DESC, p.project_name;