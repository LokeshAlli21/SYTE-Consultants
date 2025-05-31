-- First drop the existing view
DROP VIEW IF EXISTS vw_assignments_with_latest_timeline;

-- Then create the new view with the timeline as a JSON object
CREATE VIEW vw_assignments_with_latest_timeline AS
WITH 
-- Get the latest timeline entry with assignment_status for each assignment
latest_status AS (
    SELECT DISTINCT ON (at.assignment_id)
        at.assignment_id,
        ast.assignment_status,
        at.created_at
    FROM 
        assignment_timeline at
    INNER JOIN 
        assignment_statuses ast ON at.id = ast.timeline_id
    ORDER BY 
        at.assignment_id, at.created_at DESC
),

-- Get the latest timeline entry with note for each assignment
latest_note AS (
    SELECT DISTINCT ON (at.assignment_id)
        at.assignment_id,
        an.note,
        at.created_at
    FROM 
        assignment_timeline at
    INNER JOIN 
        assignment_notes an ON at.id = an.timeline_id
    ORDER BY 
        at.assignment_id, at.created_at DESC
),

-- Get the latest timeline entry (regardless of what it contains)
latest_timeline AS (
    SELECT DISTINCT ON (at.assignment_id)
        at.id,
        at.assignment_id,
        at.event_type,
        ast.assignment_status,
        an.note,
        at.created_at
    FROM 
        assignment_timeline at
    LEFT JOIN 
        assignment_statuses ast ON at.id = ast.timeline_id
    LEFT JOIN 
        assignment_notes an ON at.id = an.timeline_id
    ORDER BY 
        at.assignment_id, at.created_at DESC
),

-- ✅ Get all reminders for each assignment as a JSON array
assignment_reminders_grouped AS (
    SELECT 
        assignment_id,
        json_agg(
            json_build_object(
                'id', id,
                'date_and_time', date_and_time,
                'message', message,
                'status', status,
                'created_at', created_at
            ) ORDER BY date_and_time
        ) AS reminders
    FROM assignment_reminders
    WHERE status = 'pending'
    GROUP BY assignment_id
)

-- Main query that joins everything together and creates a nested JSON structure
SELECT 
    -- All assignment fields
    a.id,
    a.project_id,
    a.assignment_type,
    a.payment_date,
    a.application_number,
    a.consultation_charges,
    a.govt_fees,
    a.ca_fees,
    a.engineer_fees,
    a.arch_fees,
    a.liasioning_fees,
    a.remarks,
    a.created_at,
    a.updated_at,

    -- Project fields
    p.project_name,
    p.login_id,
    p.password,

    
    -- Create a nested timeline object as JSON
    CASE 
        WHEN lt.id IS NOT NULL THEN
            json_build_object(
                'id', lt.id,
                'event_type', lt.event_type,
                'assignment_status', COALESCE(lt.assignment_status, ls.assignment_status),
                'note', COALESCE(lt.note, ln.note),
                'created_at', lt.created_at
            )
        ELSE NULL
    END AS timeline,

    -- ✅ Reminders array JSON
    ar.reminders
    
FROM 
    assignments a
LEFT JOIN latest_timeline lt ON a.id = lt.assignment_id
LEFT JOIN latest_status ls ON a.id = ls.assignment_id
LEFT JOIN latest_note ln ON a.id = ln.assignment_id
LEFT JOIN projects p ON a.project_id = p.id
LEFT JOIN assignment_reminders_grouped ar ON a.id = ar.assignment_id
WHERE 
    a.status_for_delete = 'active';



CREATE OR REPLACE VIEW view_promoter_full AS
SELECT
  p.id,
  p.promoter_name,
  p.contact_number,
  p.email_id,
  p.district,
  p.city,
  p.promoter_type,
  p.status_for_delete,
  p.created_by,
  p.created_at,
  p.updated_at,
  p.updated_by,
  p.update_action,
  
  -- Aggregate promoter_details as JSON array
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', pd.id,
        'office_address', pd.office_address,
        'contact_person_name', pd.contact_person_name,
        'promoter_photo_uploaded_url', pd.promoter_photo_uploaded_url
      )
    ) FILTER (WHERE pd.id IS NOT NULL),
    '[]'::jsonb
  ) AS promoter_details,

  -- Build updated_user JSON object
  jsonb_build_object(
    'name', u.name,
    'email', u.email,
    'phone', u.phone
  ) AS updated_user

FROM promoters p
LEFT JOIN promoter_details pd ON pd.promoter_id = p.id
LEFT JOIN users u ON u.id = p.updated_by
GROUP BY
  p.id, p.promoter_name, p.contact_number, p.email_id, p.district, p.city,
  p.promoter_type, p.status_for_delete, p.created_by, p.created_at,
  p.updated_at, p.updated_by, p.update_action,
  u.id, u.name, u.email, u.phone;


CREATE OR REPLACE VIEW view_channel_partners_with_updated_user AS
SELECT 
    cp.*,
    json_build_object(
        'name', u.name,
        'email', u.email,
        'phone', u.phone
    ) AS updated_user
FROM channel_partners cp
LEFT JOIN users u ON cp.updated_by = u.id;

CREATE OR REPLACE VIEW view_projects_with_updated_user AS
SELECT 
    p.*,
    json_build_object(
        'name', u.name,
        'email', u.email,
        'phone', u.phone
    ) AS updated_user
FROM projects p
LEFT JOIN users u ON p.updated_by = u.id;

CREATE OR REPLACE VIEW view_project_professional_details_full AS
SELECT 
  p.id,
  p.project_id,
  p.engineer_id,
  p.architect_id,
  p.ca_id,
  p.created_at,
  p.updated_at,
  p.updated_by,
  p.updated_at,
  p.update_action,

  -- Engineer Details
  json_build_object(
    'id', e.id,
    'name', e.name,
    'email_id', e.email_id,
    'pan_number', e.pan_number,
    'contact_number', e.contact_number,
    'licence_number', e.licence_number,
    'office_address', e.office_address,
    'pan_uploaded_url', e.pan_uploaded_url,
    'licence_uploaded_url', e.licence_uploaded_url,
    'sign_stamp_uploaded_url', e.sign_stamp_uploaded_url,
    'letter_head_uploaded_url', e.letter_head_uploaded_url
  ) AS engineers,

  -- Architect Details
  json_build_object(
    'id', a.id,
    'name', a.name,
    'email_id', a.email_id,
    'pan_number', a.pan_number,
    'contact_number', a.contact_number,
    'licence_number', a.licence_number,
    'office_address', a.office_address,
    'pan_uploaded_url', a.pan_uploaded_url,
    'licence_uploaded_url', a.licence_uploaded_url,
    'sign_stamp_uploaded_url', a.sign_stamp_uploaded_url,
    'letter_head_uploaded_url', a.letter_head_uploaded_url
  ) AS architects,

  -- CA Details
  json_build_object(
    'id', c.id,
    'name', c.name,
    'email_id', c.email_id,
    'pan_number', c.pan_number,
    'contact_number', c.contact_number,
    'licence_number', c.licence_number,
    'office_address', c.office_address,
    'pan_uploaded_url', c.pan_uploaded_url,
    'licence_uploaded_url', c.licence_uploaded_url,
    'sign_stamp_uploaded_url', c.sign_stamp_uploaded_url,
    'letter_head_uploaded_url', c.letter_head_uploaded_url
  ) AS cas,

  -- Updated User Info
  json_build_object(
    'name', u.name,
    'email', u.email,
    'phone', u.phone
  ) AS updated_user

FROM project_professional_details p
LEFT JOIN users u ON p.updated_by = u.id
LEFT JOIN engineers e ON p.engineer_id = e.id
LEFT JOIN architects a ON p.architect_id = a.id
LEFT JOIN cas c ON p.ca_id = c.id;

CREATE OR REPLACE VIEW view_project_documents_full AS
SELECT 
  d.*,

  -- Updated User Info (optional)
  json_build_object(
    'name', u.name,
    'email', u.email,
    'phone', u.phone
  ) AS updated_user

FROM project_documents d
LEFT JOIN users u ON d.updated_by = u.id;


CREATE OR REPLACE VIEW view_site_progress_full AS
SELECT
  sp.*,

  -- building_progress fields with updated user info
  jsonb_build_object(
    'id', bp.id,
    'site_progress_id', bp.site_progress_id,
    'excavation', bp.excavation,
    'basement', bp.basement,
    'podium', bp.podium,
    'plinth', bp.plinth,
    'stilt', bp.stilt,
    'superstructure', bp.superstructure,
    'interior_finishing', bp.interior_finishing,
    'sanitary_fittings', bp.sanitary_fittings,
    'common_infrastructure', bp.common_infrastructure,
    'external_works', bp.external_works,
    'final_installations', bp.final_installations,
    'created_at', bp.created_at,
    'updated_at', bp.updated_at,
    'updated_by', bp.updated_by,
    'update_action', bp.update_action,
    'updated_user', jsonb_build_object(
      'name', u1.name,
      'email', u1.email,
      'phone', u1.phone
    )
  ) AS building_progress,

  -- common_areas_progress fields with updated user info
  jsonb_build_object(
    'id', cap.id,
    'site_progress_id', cap.site_progress_id,
    'internal_roads_footpaths', cap.internal_roads_footpaths,
    'water_supply', cap.water_supply,
    'sewerage', cap.sewerage,
    'storm_water_drains', cap.storm_water_drains,
    'landscaping_tree_planting', cap.landscaping_tree_planting,
    'street_lighting', cap.street_lighting,
    'community_buildings', cap.community_buildings,
    'sewage_treatment', cap.sewage_treatment,
    'solid_waste_management', cap.solid_waste_management,
    'rain_water_harvesting', cap.rain_water_harvesting,
    'energy_management', cap.energy_management,
    'fire_safety', cap.fire_safety,
    'electrical_metering', cap.electrical_metering,
    'created_at', cap.created_at,
    'updated_at', cap.updated_at,
    'updated_by', cap.updated_by,
    'update_action', cap.update_action,
    'updated_user', jsonb_build_object(
      'name', u2.name,
      'email', u2.email,
      'phone', u2.phone
    )
  ) AS common_areas_progress

FROM site_progress sp
LEFT JOIN building_progress bp ON bp.site_progress_id = sp.id
LEFT JOIN users u1 ON bp.updated_by = u1.id
LEFT JOIN common_areas_progress cap ON cap.site_progress_id = sp.id
LEFT JOIN users u2 ON cap.updated_by = u2.id;

CREATE OR REPLACE VIEW view_unit_with_updated_user AS
SELECT 
  pu.id,
  pu.project_id,
  pu.status_for_delete,
  pu.unit_name,
  pu.unit_type,
  pu.carpet_area,
  pu.unit_status,
  pu.customer_name,
  pu.agreement_value,
  pu.agreement_for_sale_date,
  pu.sale_deed_date,
  pu.received_fy_2018_19,
  pu.received_fy_2019_20,
  pu.received_fy_2020_21,
  pu.received_fy_2021_22,
  pu.received_fy_2022_23,
  pu.received_fy_2023_24,
  pu.received_fy_2024_25,
  pu.received_fy_2025_26,
  pu.received_fy_2026_27,
  pu.received_fy_2027_28,
  pu.received_fy_2028_29,
  pu.received_fy_2029_30,
  pu.total_received,
  pu.balance_amount,
  pu.afs_uploaded_url,
  pu.sale_deed_uploaded_url,
  pu.created_at,
  pu.updated_at,
  pu.created_by,
  pu.updated_by,
  pu.update_action,

  -- Join and format the updated user's details as a JSON object
  jsonb_build_object(
    'name', u.name,
    'email', u.email,
    'phone', u.phone
  ) AS updated_user

FROM 
  project_units pu
LEFT JOIN 
  users u ON pu.updated_by = u.id;

-- Create a view for assignment timeline grouped by assignment status
CREATE OR REPLACE VIEW assignment_timeline_view AS
WITH timeline_with_status AS (
    -- Get timeline events with their resolved assignment status
    SELECT 
        t.id,
        t.assignment_id,
        t.event_type,
        t.created_at,
        t.created_by,
        t.note,
        -- If assignment_status is null, use the most recent non-null status for this assignment
        COALESCE(
            t.assignment_status,
            (
                SELECT t2.assignment_status 
                FROM assignment_timeline t2 
                WHERE t2.assignment_id = t.assignment_id 
                    AND t2.assignment_status IS NOT NULL 
                    AND t2.created_at <= t.created_at
                ORDER BY t2.created_at DESC 
                LIMIT 1
            )
        ) AS resolved_assignment_status,
        'timeline' AS source_type
    FROM assignment_timeline t
    
    UNION ALL
    
    -- Get reminders as follow-up events
    SELECT 
        r.id,
        r.assignment_id,
        'follow_up' AS event_type,
        r.created_at,
        r.created_by,
        jsonb_build_object(
            'message', r.message,
            'reminder_date', r.date_and_time,
            'reminder_status', r.status
        ) AS note,
        r.assignment_status AS resolved_assignment_status,
        'reminder' AS source_type
    FROM assignment_reminders r
),
events_with_users AS (
    SELECT 
        tws.assignment_id,
        tws.resolved_assignment_status,
        tws.id,
        tws.source_type,
        json_build_object(
            'id', tws.id,
            'event_type', tws.event_type,
            'created_at', tws.created_at,
            'note', tws.note,
            'source_type', tws.source_type,
            'updated_user', json_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email,
                'phone', u.phone
            )
        ) AS event_data
    FROM timeline_with_status tws
    LEFT JOIN users u ON tws.created_by = u.id
    WHERE tws.resolved_assignment_status IS NOT NULL
),
grouped_timeline AS (
    SELECT 
        assignment_id,
        resolved_assignment_status,
        json_agg(
            event_data 
            ORDER BY 
                CASE WHEN source_type = 'timeline' THEN id END ASC,
                CASE WHEN source_type = 'reminder' THEN id END ASC
        ) AS events
    FROM events_with_users
    GROUP BY assignment_id, resolved_assignment_status
)
SELECT 
    assignment_id,
    json_agg(
        json_build_object(
            'assignment_status', resolved_assignment_status,
            'events', events
        ) ORDER BY resolved_assignment_status
    ) AS timeline_by_status
FROM grouped_timeline
GROUP BY assignment_id;

-- Example query to use the view
-- SELECT * FROM assignment_timeline_view WHERE assignment_id = 1;


CREATE OR REPLACE VIEW assignment_with_updated_user AS
SELECT
  a.id,
  a.project_id,
  a.assignment_type,
  a.payment_date,
  a.application_number,
  a.consultation_charges,
  a.govt_fees,
  a.ca_fees,
  a.engineer_fees,
  a.arch_fees,
  a.liasioning_fees,
  a.remarks,
  a.status_for_delete,
  a.created_at,
  a.updated_at,
  a.created_by,
  a.updated_by,
  a.update_action,
  json_build_object(
    'name', u.name,
    'email', u.email,
    'phone', u.phone
  ) AS updated_user
FROM assignments a
LEFT JOIN users u ON a.updated_by = u.id;


CREATE OR REPLACE VIEW assignment_timeline_view AS
SELECT 
    -- Timeline base information
    at.id AS timeline_id,
    at.assignment_id,
    at.event_type,
    at.created_at AS timeline_created_at,

-- Separate columns for different event data types
CASE 
    WHEN at.event_type IN ('assignment_created', 'status_changed') THEN ast.assignment_status
    ELSE NULL
END AS assignment_status,

CASE 
    WHEN at.event_type = 'note_added' THEN an.note
    ELSE NULL
END AS note,

CASE 
    WHEN at.event_type = 'reminder_set' THEN 
        JSON_BUILD_OBJECT(
            'message', ar.message,
            'date_and_time', ar.date_and_time,
            'status', ar.status
        )
    WHEN at.event_type = 'reminder_completed' THEN 
        JSON_BUILD_OBJECT(
            'message', arc.message,
            'date_and_time', arc.date_and_time,
            'status', arc.status
        )
    ELSE NULL
END AS reminder,

    -- User info based on event type
    JSON_BUILD_OBJECT(
        'name', u_creator.name,
        'email', u_creator.email,
        'phone', u_creator.phone
    ) AS updated_user

FROM assignment_timeline at

-- Joins based on event_type
LEFT JOIN assignment_statuses ast 
    ON at.id = ast.timeline_id 
    AND at.event_type IN ('assignment_created', 'status_changed')

LEFT JOIN assignment_notes an 
    ON at.id = an.timeline_id 
    AND at.event_type = 'note_added'

LEFT JOIN assignment_reminders ar 
    ON at.id = ar.timeline_set_id 
    AND at.event_type = 'reminder_set'

LEFT JOIN assignment_reminders arc 
    ON at.id = arc.timeline_completed_id 
    AND at.event_type ='reminder_completed'

LEFT JOIN users u_creator 
    ON u_creator.id = 
        CASE 
            WHEN at.event_type IN ('assignment_created', 'status_changed') THEN ast.created_by
            WHEN at.event_type = 'note_added' THEN an.created_by
            WHEN at.event_type = 'reminder_set' THEN ar.created_by
            WHEN at.event_type = 'reminder_completed' THEN arc.updated_by
        END

ORDER BY at.id ASC;