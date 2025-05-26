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
BEGIN
    INSERT INTO assignment_timeline (
        assignment_id,
        event_type,
        assignment_status,
        created_by,
        created_at
    )
    VALUES (
        NEW.id,
        'assignment_created',  -- Event type for new assignment creation
        'new',
        NEW.created_by,
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Function to set default `assignment_status` based on the last timeline entry
CREATE OR REPLACE FUNCTION set_default_assignment_status()
RETURNS TRIGGER AS $$
DECLARE
    previous_status VARCHAR(25);
BEGIN
    -- Only set status if it's NULL or empty
    IF NEW.assignment_status IS NULL OR NEW.assignment_status = '' THEN
        -- Fetch the latest previous status by timeline ID
        SELECT assignment_status
        INTO previous_status
        FROM assignment_timeline
        WHERE assignment_id = NEW.assignment_id
        ORDER BY id DESC
        LIMIT 1;

        -- If a previous record exists, use its status; otherwise use 'new'
        IF FOUND THEN
            NEW.assignment_status := previous_status;
        ELSE
            NEW.assignment_status := 'new';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
