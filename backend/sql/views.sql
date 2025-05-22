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