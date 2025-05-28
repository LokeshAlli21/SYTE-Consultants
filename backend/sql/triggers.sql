-- ================================================
-- Add `updated_at` timestamp update triggers
-- ================================================

-- Add trigger to update `updated_at` before row update on `promoters`
DROP TRIGGER IF EXISTS trigger_update_promoters_timestamp ON promoters;
CREATE TRIGGER trigger_update_promoters_timestamp
    BEFORE UPDATE ON promoters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `promoter_details`
DROP TRIGGER IF EXISTS trigger_update_promoter_details_timestamp ON promoter_details;
CREATE TRIGGER trigger_update_promoter_details_timestamp
    BEFORE UPDATE ON promoter_details
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `channel_partners`
DROP TRIGGER IF EXISTS trigger_update_channel_partners_timestamp ON channel_partners;
CREATE TRIGGER trigger_update_channel_partners_timestamp
    BEFORE UPDATE ON channel_partners
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `projects`
DROP TRIGGER IF EXISTS trigger_update_projects_timestamp ON projects;
CREATE TRIGGER trigger_update_projects_timestamp
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `project_professional_details`
DROP TRIGGER IF EXISTS trigger_update_project_professional_details_timestamp ON project_professional_details;
CREATE TRIGGER trigger_update_project_professional_details_timestamp
    BEFORE UPDATE ON project_professional_details
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `project_units`
DROP TRIGGER IF EXISTS trigger_update_project_units_timestamp ON project_units;
CREATE TRIGGER trigger_update_project_units_timestamp
    BEFORE UPDATE ON project_units
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `project_documents`
DROP TRIGGER IF EXISTS trigger_update_project_documents_timestamp ON project_documents;
CREATE TRIGGER trigger_update_project_documents_timestamp
    BEFORE UPDATE ON project_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `building_progress`
DROP TRIGGER IF EXISTS trigger_update_building_progress_timestamp ON building_progress;
CREATE TRIGGER trigger_update_building_progress_timestamp
    BEFORE UPDATE ON building_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `common_areas_progress`
DROP TRIGGER IF EXISTS trigger_update_common_areas_progress_timestamp ON common_areas_progress;
CREATE TRIGGER trigger_update_common_areas_progress_timestamp
    BEFORE UPDATE ON common_areas_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `assignments`
DROP TRIGGER IF EXISTS trigger_update_assignments_timestamp ON assignments;
CREATE TRIGGER trigger_update_assignments_timestamp
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger to update `updated_at` before row update on `assignment_reminders`
DROP TRIGGER IF EXISTS trigger_update_reminders_timestamp ON assignment_reminders;
CREATE TRIGGER trigger_update_reminders_timestamp
    BEFORE UPDATE ON assignment_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ================================================
-- Constraints
-- ================================================

-- Ensure all received fiscal year amounts in `project_units` are non-negative
ALTER TABLE project_units 
DROP CONSTRAINT IF EXISTS chk_received_amounts_positive;

ALTER TABLE project_units 
ADD CONSTRAINT chk_received_amounts_positive 
CHECK (
    COALESCE(received_fy_2018_19, 0) >= 0 AND
    COALESCE(received_fy_2019_20, 0) >= 0 AND
    COALESCE(received_fy_2020_21, 0) >= 0 AND
    COALESCE(received_fy_2021_22, 0) >= 0 AND
    COALESCE(received_fy_2022_23, 0) >= 0 AND
    COALESCE(received_fy_2023_24, 0) >= 0 AND
    COALESCE(received_fy_2024_25, 0) >= 0 AND
    COALESCE(received_fy_2025_26, 0) >= 0 AND
    COALESCE(received_fy_2026_27, 0) >= 0 AND
    COALESCE(received_fy_2027_28, 0) >= 0 AND
    COALESCE(received_fy_2028_29, 0) >= 0 AND
    COALESCE(received_fy_2029_30, 0) >= 0
);

-- ================================================
-- Custom triggers for business logic
-- ================================================

-- Trigger to calculate totals in `project_units` before insert/update
DROP TRIGGER IF EXISTS trigger_calculate_project_unit_totals ON project_units;
CREATE TRIGGER trigger_calculate_project_unit_totals
    BEFORE INSERT OR UPDATE ON project_units
    FOR EACH ROW
    EXECUTE FUNCTION calculate_project_unit_totals();

-- Trigger to automatically set promoter name in `projects` on insert/update
CREATE TRIGGER trg_set_promoter_name
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW
    WHEN (NEW.promoter_id IS NOT NULL)
    EXECUTE FUNCTION set_promoter_name();

-- Trigger to insert record in `assignment_timeline` after new assignment
CREATE TRIGGER trg_insert_assignment_timeline
    AFTER INSERT ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION insert_assignment_timeline();

-- Trigger to set default status in `assignment_timeline` before insert
CREATE TRIGGER trg_default_assignment_status
    BEFORE INSERT ON assignment_timeline
    FOR EACH ROW
    EXECUTE FUNCTION set_default_assignment_status();