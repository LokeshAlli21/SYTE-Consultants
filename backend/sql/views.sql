-- First drop the existing view
DROP VIEW IF EXISTS vw_assignments_with_latest_timeline;

-- Then create the new view with the timeline as a JSON object
CREATE VIEW vw_assignments_with_latest_timeline AS
WITH 
-- Get the latest timeline entry with assignment_status for each assignment
latest_status AS (
    SELECT DISTINCT ON (assignment_id)
        assignment_id,
        assignment_status,
        created_at
    FROM 
        assignment_timeline
    WHERE 
        assignment_status IS NOT NULL
    ORDER BY 
        assignment_id, created_at DESC
),

-- Get the latest timeline entry with note for each assignment
latest_note AS (
    SELECT DISTINCT ON (assignment_id)
        assignment_id,
        note,
        created_at
    FROM 
        assignment_timeline
    WHERE 
        note IS NOT NULL
    ORDER BY 
        assignment_id, created_at DESC
),

-- Get the latest timeline entry (regardless of what it contains)
latest_timeline AS (
    SELECT DISTINCT ON (assignment_id)
        id,
        assignment_id,
        event_type,
        assignment_status,
        note,
        created_at
    FROM 
        assignment_timeline
    ORDER BY 
        assignment_id, created_at DESC
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
