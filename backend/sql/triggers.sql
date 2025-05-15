--------------------------------------------------------------------------------------------------------------------------------------------
-- Creating a trigger function to update the 'updated_at' column on row updates
CREATE OR REPLACE FUNCTION update_promoter_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';  -- Set the updated_at to the current time in IST
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger to automatically update the 'updated_at' column when a row is updated
CREATE TRIGGER update_promoter_updated_at
BEFORE UPDATE ON promoters
FOR EACH ROW
EXECUTE FUNCTION update_promoter_timestamp();

--------------------------------------------------------------------------------------------------------------------------------------------

-- Function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_promoter_details_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before each update
CREATE TRIGGER update_promoter_details_updated_at
BEFORE UPDATE ON promoter_details
FOR EACH ROW
EXECUTE FUNCTION update_promoter_details_timestamp();

--------------------------------------------------------------------------------------------------------------------------------------------

-- Creating a trigger function to update the 'updated_at' column on row updates
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';  -- Set the updated_at to the current time in IST
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger to automatically update the 'updated_at' column when a row is updated
CREATE TRIGGER update_project_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_project_timestamp();

--------------------------------------------------------------------------------------------------------------------------------------------
-- Trigger function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_project_professional_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on row updates
CREATE TRIGGER update_project_professional_updated_at
BEFORE UPDATE ON project_professional_details
FOR EACH ROW
EXECUTE FUNCTION update_project_professional_timestamp();

--------------------------------------------------------------------------------------------------------------------------------------------

-- Create trigger function to calculate total_received
CREATE OR REPLACE FUNCTION update_total_received_and_balance_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_received := NEW.received_fy_2018_19 + NEW.received_fy_2019_20 + 
                          NEW.received_fy_2020_21 + NEW.received_fy_2021_22 + 
                          NEW.received_fy_2022_23 + NEW.received_fy_2023_24 + 
                          NEW.received_fy_2024_25 + NEW.received_fy_2025_26 + 
                          NEW.received_fy_2026_27 + NEW.received_fy_2027_28 + 
                          NEW.received_fy_2028_29 + NEW.received_fy_2029_30;

    NEW.balance_amount := NEW.agreement_value - NEW.total_received;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'total_received' and 'balance_amount' before insert or update
CREATE TRIGGER update_project_unit_total_received_balance
BEFORE INSERT OR UPDATE ON project_units
FOR EACH ROW
EXECUTE FUNCTION update_total_received_and_balance_amount();

--------------------------------------------------------------------------------------------------------------------------------------------

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_project_unit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on update
CREATE TRIGGER update_project_unit_updated_at
BEFORE UPDATE ON project_units
FOR EACH ROW
EXECUTE FUNCTION update_project_unit_timestamp();

--------------------------------------------------------------------------------------------------------------------------------------------

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_project_documents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on row updates
CREATE TRIGGER update_project_documents_updated_at
BEFORE UPDATE ON project_documents
FOR EACH ROW
EXECUTE FUNCTION update_project_documents_timestamp();

--------------------------------------------------------------------------------------------------------------------------------------------

-- Trigger function to auto-update updated_at
-- Function to update 'updated_at' timestamp for common_areas_progress
CREATE OR REPLACE FUNCTION update_common_areas_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'; -- Set the updated_at to the current time in IST
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on row updates for common_areas_progress
CREATE TRIGGER update_common_areas_progress_updated_at
BEFORE UPDATE ON common_areas_progress
FOR EACH ROW
EXECUTE FUNCTION update_common_areas_progress_timestamp();

--------------------------------------------------------------------------------------------------------------------------------------------

-- Function to update 'updated_at' timestamp for building_progress
CREATE OR REPLACE FUNCTION update_building_progress_timestamp()
RETURNS TRIGGER AS $$ 
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'; -- Set the updated_at to the current time in IST
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on row updates for building_progress
CREATE TRIGGER update_building_progress_updated_at
BEFORE UPDATE ON building_progress
FOR EACH ROW
EXECUTE FUNCTION update_building_progress_timestamp();


--------------------------------------------------------------------------------------------------------------------------------------------

-- Function to update the `updated_at` timestamp on row update
CREATE OR REPLACE FUNCTION update_assignments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update 'updated_at' on updates to the assignments table
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON assignments
FOR EACH ROW
EXECUTE FUNCTION update_assignments_timestamp();

--------------------------------------------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_channel_partners_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_channel_partners_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------------------------------------------------------------------
-- trigger and function to autoset promoter_name
CREATE OR REPLACE FUNCTION set_promoter_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Set promoter_name from promoters table
  SELECT promoter_name INTO NEW.promoter_name
  FROM promoters
  WHERE id = NEW.promoter_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_set_promoter_name
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW
WHEN (NEW.promoter_id IS NOT NULL)
EXECUTE FUNCTION set_promoter_name();
