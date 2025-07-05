-- Function to automatically update the `updated_at` column to the current timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- -- Create trigger function to calculate total_received
-- CREATE OR REPLACE FUNCTION calculate_project_unit_totals()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.total_received := NEW.received_fy_2018_19 + NEW.received_fy_2019_20 + 
--                           NEW.received_fy_2020_21 + NEW.received_fy_2021_22 + 
--                           NEW.received_fy_2022_23 + NEW.received_fy_2023_24 + 
--                           NEW.received_fy_2024_25 + NEW.received_fy_2025_26 + 
--                           NEW.received_fy_2026_27 + NEW.received_fy_2027_28 + 
--                           NEW.received_fy_2028_29 + NEW.received_fy_2029_30;

--     NEW.balance_amount := NEW.agreement_value - NEW.total_received;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Function to calculate total_received and balance_amount in the `project_units` table
CREATE OR REPLACE FUNCTION calculate_project_unit_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Sum all FY received amounts, using 0 as fallback for NULL values
    NEW.total_received = COALESCE(NEW.received_fy_2018_19, 0) + 
                         COALESCE(NEW.received_fy_2019_20, 0) + 
                         COALESCE(NEW.received_fy_2020_21, 0) + 
                         COALESCE(NEW.received_fy_2021_22, 0) + 
                         COALESCE(NEW.received_fy_2022_23, 0) + 
                         COALESCE(NEW.received_fy_2023_24, 0) + 
                         COALESCE(NEW.received_fy_2024_25, 0) + 
                         COALESCE(NEW.received_fy_2025_26, 0) + 
                         COALESCE(NEW.received_fy_2026_27, 0) + 
                         COALESCE(NEW.received_fy_2027_28, 0) + 
                         COALESCE(NEW.received_fy_2028_29, 0) + 
                         COALESCE(NEW.received_fy_2029_30, 0);
    
    -- Calculate balance_amount as agreement_value - total_received
    NEW.balance_amount = COALESCE(NEW.agreement_value, 0) - NEW.total_received;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Function to auto-fill `promoter_name` in `projects` table based on `promoter_id`
CREATE OR REPLACE FUNCTION set_promoter_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Fetch promoter_name from promoters table
    SELECT promoter_name INTO NEW.promoter_name
    FROM promoters
    WHERE id = NEW.promoter_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Function to automatically insert the first timeline entry for a new assignment
CREATE OR REPLACE FUNCTION insert_assignment_timeline()
RETURNS TRIGGER AS $$
DECLARE
    timeline_entry_id INT;
BEGIN
    -- Insert the timeline entry first
    INSERT INTO assignment_timeline (
        assignment_id,
        event_type,
        created_at
    )
    VALUES (
        NEW.id,
        'assignment_created',  -- Event type for new assignment creation
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
    )
    RETURNING id INTO timeline_entry_id;
    
    -- Insert the corresponding status entry
    INSERT INTO assignment_statuses (
        timeline_id,
        assignment_id,
        assignment_status,
        created_by,
        created_at
    )
    VALUES (
        timeline_entry_id,
        NEW.id,
        'new',
        NEW.created_by,
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_assignment_status_fn(
  p_assignment_id INT,
  p_assignment_status VARCHAR,
  p_created_by INT
)
RETURNS TABLE (
  timeline_id INT,
  status_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_timeline_id INT;
  new_status_id INT;
BEGIN
  -- Insert into assignment_timeline
  INSERT INTO assignment_timeline (assignment_id, event_type)
  VALUES (p_assignment_id, 'status_changed')
  RETURNING id INTO new_timeline_id;

  -- Insert into assignment_statuses
  INSERT INTO assignment_statuses (timeline_id, assignment_id, assignment_status, created_by)
  VALUES (new_timeline_id, p_assignment_id, p_assignment_status, p_created_by)
  RETURNING id INTO new_status_id;

  RETURN QUERY SELECT new_timeline_id, new_status_id;
END;
$$;

CREATE OR REPLACE FUNCTION add_assignment_note(
    p_assignment_id INT,
    p_note JSONB,
    p_created_by INT
)
RETURNS TABLE (
    timeline_id INT,
    note_id INT
) AS $$
DECLARE
    v_timeline_id INT;
    v_note_id INT;
BEGIN
    -- Validate input
    IF p_note IS NULL OR jsonb_typeof(p_note) IS NULL THEN
        RAISE EXCEPTION '❌ At least one note must be provided';
    END IF;

    -- Step 1: Insert into assignment_timeline
    INSERT INTO assignment_timeline (
        assignment_id,
        event_type,
        created_at
    ) VALUES (
        p_assignment_id,
        'note_added',
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
    )
    RETURNING id INTO v_timeline_id;

    -- Step 2: Insert into assignment_notes
    INSERT INTO assignment_notes (
        timeline_id,
        assignment_id,
        note,
        created_by,
        created_at
    ) VALUES (
        v_timeline_id,
        p_assignment_id,
        p_note,
        p_created_by,
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
    )
    RETURNING id INTO v_note_id;

    -- Return the inserted IDs
    RETURN QUERY SELECT v_timeline_id, v_note_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_assignment_reminder(
    p_assignment_id INT,
    p_date_and_time TIMESTAMP,
    p_message TEXT,
    p_status VARCHAR(25),
    p_created_by INT
) RETURNS TABLE (
    reminder_id INT,
    timeline_id INT
) AS $$
DECLARE
    v_timeline_id INT;
BEGIN
    -- Insert into assignment_timeline and get timeline_id for 'reminder_set'
    INSERT INTO assignment_timeline (assignment_id, event_type)
    VALUES (p_assignment_id, 'reminder_set')
    RETURNING id INTO v_timeline_id;

    -- Insert into assignment_reminders with timeline_set_id
    INSERT INTO assignment_reminders (
        timeline_set_id,
        assignment_id,
        date_and_time,
        message,
        status,
        created_by
    )
    VALUES (
        v_timeline_id,
        p_assignment_id,
        p_date_and_time,
        p_message,
        p_status,
        p_created_by
    )
    RETURNING id INTO reminder_id;

    timeline_id := v_timeline_id;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_assignment_reminder_status(
    p_reminder_id INT,
    p_updated_by INT
) RETURNS TABLE (
    updated_reminder_id INT,
    timeline_id INT
) AS $$
DECLARE
    v_assignment_id INT;
    v_timeline_id INT;
BEGIN
    -- Get assignment_id from the reminder
    SELECT assignment_id INTO v_assignment_id
    FROM assignment_reminders
    WHERE id = p_reminder_id;

    IF v_assignment_id IS NULL THEN
        RAISE EXCEPTION 'Reminder not found';
    END IF;

    -- Create timeline event for 'reminder_completed'
    INSERT INTO assignment_timeline (assignment_id, event_type)
    VALUES (v_assignment_id, 'reminder_completed')
    RETURNING id INTO v_timeline_id;

    -- Update the reminder with new status and timeline_completed_id
    UPDATE assignment_reminders
    SET status = 'completed',
        updated_by = p_updated_by,
        updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata',
        timeline_completed_id = v_timeline_id
    WHERE id = p_reminder_id;

    updated_reminder_id := p_reminder_id;
    timeline_id := v_timeline_id;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_channel_partner_by_promoter(promoter_id_input INT)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'id', cp.id,
            'cp_photo_uploaded_url', cp.cp_photo_uploaded_url,
            'promoter_id', promoter_id_input,
            'full_name', cp.full_name,
            'contact_number', cp.contact_number,
            'alternate_contact_number', cp.alternate_contact_number,
            'email_id', cp.email_id,
            'district', cp.district,
            'city', cp.city,
            'project_id', p.id
        )
        FROM channel_partners cp
        JOIN projects p ON cp.id = p.channel_partner_id
        WHERE p.promoter_id = promoter_id_input
          AND cp.status_for_delete = 'active'
        ORDER BY p.id  -- This determines which project takes priority
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- SQL Function for Single Project Client Tracking
-- This function provides comprehensive project details for a specific project

CREATE OR REPLACE FUNCTION get_project_details(p_project_id INT)
RETURNS TABLE (
    project_id INT,
    project_name VARCHAR,
    project_type VARCHAR,
    project_address TEXT,
    city VARCHAR,
    district VARCHAR,
    project_pincode NUMERIC,
    project_status VARCHAR,
    registration_date DATE,
    expiry_date DATE,
    days_until_expiry INTEGER,
    project_age_days INTEGER,
    rera_number VARCHAR,
    rera_certificate_url TEXT,
    promoter_name VARCHAR,
    engineer_name VARCHAR,
    engineer_contact VARCHAR,
    engineer_email VARCHAR,
    engineer_licence_url TEXT,
    engineer_pan_url TEXT,
    engineer_letterhead_url TEXT,
    engineer_stamp_url TEXT,
    architect_name VARCHAR,
    architect_contact VARCHAR,
    architect_email VARCHAR,
    architect_licence_url TEXT,
    architect_pan_url TEXT,
    architect_letterhead_url TEXT,
    architect_stamp_url TEXT,
    ca_name VARCHAR,
    ca_contact VARCHAR,
    ca_email VARCHAR,
    ca_licence_url TEXT,
    ca_pan_url TEXT,
    ca_letterhead_url TEXT,
    ca_stamp_url TEXT,
    professional_team_status TEXT,
    project_created_date TIMESTAMP,
    project_last_updated TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Project Basic Information
        p.id::INT AS project_id,
        p.project_name::VARCHAR,
        p.project_type::VARCHAR,
        p.project_address::TEXT,
        p.city::VARCHAR,
        p.district::VARCHAR,
        p.project_pincode::NUMERIC,
        
        -- Project Status & Dates
        p.status_for_delete::VARCHAR AS project_status,
        p.registration_date::DATE,
        p.expiry_date::DATE,
        
        -- Calculate days remaining until expiry (fixed calculation)
        CASE 
            WHEN p.expiry_date IS NOT NULL THEN 
                (p.expiry_date - CURRENT_DATE)::INTEGER
            ELSE NULL 
        END AS days_until_expiry,
        
        -- Project age in days (fixed calculation)
        CASE 
            WHEN p.registration_date IS NOT NULL THEN
                (CURRENT_DATE - p.registration_date)::INTEGER
            ELSE NULL
        END AS project_age_days,
        
        -- RERA Information
        p.rera_number::VARCHAR,
        p.rera_certificate_uploaded_url::TEXT AS rera_certificate_url,
        
        -- Promoter Information
        p.promoter_name::VARCHAR,
        
        -- Engineer Details
        COALESCE(eng.name, 'Not Assigned')::VARCHAR AS engineer_name,
        COALESCE(eng.contact_number, 'N/A')::VARCHAR AS engineer_contact,
        COALESCE(eng.email_id, 'N/A')::VARCHAR AS engineer_email,
        eng.licence_uploaded_url::TEXT AS engineer_licence_url,
        eng.pan_uploaded_url::TEXT AS engineer_pan_url,
        eng.letter_head_uploaded_url::TEXT AS engineer_letterhead_url,
        eng.sign_stamp_uploaded_url::TEXT AS engineer_stamp_url,
        
        -- Architect Details
        COALESCE(arch.name, 'Not Assigned')::VARCHAR AS architect_name,
        COALESCE(arch.contact_number, 'N/A')::VARCHAR AS architect_contact,
        COALESCE(arch.email_id, 'N/A')::VARCHAR AS architect_email,
        arch.licence_uploaded_url::TEXT AS architect_licence_url,
        arch.pan_uploaded_url::TEXT AS architect_pan_url,
        arch.letter_head_uploaded_url::TEXT AS architect_letterhead_url,
        arch.sign_stamp_uploaded_url::TEXT AS architect_stamp_url,
        
        -- CA Details
        COALESCE(ca.name, 'Not Assigned')::VARCHAR AS ca_name,
        COALESCE(ca.contact_number, 'N/A')::VARCHAR AS ca_contact,
        COALESCE(ca.email_id, 'N/A')::VARCHAR AS ca_email,
        ca.licence_uploaded_url::TEXT AS ca_licence_url,
        ca.pan_uploaded_url::TEXT AS ca_pan_url,
        ca.letter_head_uploaded_url::TEXT AS ca_letterhead_url,
        ca.sign_stamp_uploaded_url::TEXT AS ca_stamp_url,
        
        -- Professional Team Completion Status
        CASE 
            WHEN eng.id IS NOT NULL AND arch.id IS NOT NULL AND ca.id IS NOT NULL THEN 'Complete'::TEXT
            WHEN eng.id IS NOT NULL OR arch.id IS NOT NULL OR ca.id IS NOT NULL THEN 'Partial'::TEXT
            ELSE 'Not Assigned'::TEXT
        END AS professional_team_status,
        
        -- Project Timestamps
        p.created_at::TIMESTAMP AS project_created_date,
        p.updated_at::TIMESTAMP AS project_last_updated

    FROM projects p
    LEFT JOIN project_professional_details ppd ON p.id = ppd.project_id
    LEFT JOIN engineers eng ON ppd.engineer_id = eng.id
    LEFT JOIN architects arch ON ppd.architect_id = arch.id
    LEFT JOIN cas ca ON ppd.ca_id = ca.id
    
    WHERE p.id = p_project_id 
    AND p.status_for_delete = 'active';
END;
$$ LANGUAGE plpgsql;

-- Usage Example:
-- SELECT * FROM get_project_details(10);