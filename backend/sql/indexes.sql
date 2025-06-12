-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Promoters table indexes
CREATE INDEX IF NOT EXISTS idx_promoters_status ON promoters(status_for_delete);
CREATE INDEX IF NOT EXISTS idx_promoters_type ON promoters(promoter_type);
CREATE INDEX IF NOT EXISTS idx_promoters_district_city ON promoters(district, city);
CREATE INDEX IF NOT EXISTS idx_promoters_created_by ON promoters(created_by);
CREATE INDEX IF NOT EXISTS idx_promoters_created_at ON promoters(created_at);
CREATE INDEX IF NOT EXISTS idx_promoters_email ON promoters(email_id);
CREATE INDEX IF NOT EXISTS idx_promoters_contact ON promoters(contact_number);

-- Promoter details indexes
CREATE INDEX IF NOT EXISTS idx_promoter_details_promoter_id ON promoter_details(promoter_id);
CREATE INDEX IF NOT EXISTS idx_promoter_details_created_by ON promoter_details(created_by);

-- Channel partners indexes
CREATE INDEX IF NOT EXISTS idx_channel_partners_status ON channel_partners(status_for_delete);
CREATE INDEX IF NOT EXISTS idx_channel_partners_district_city ON channel_partners(district, city);
CREATE INDEX IF NOT EXISTS idx_channel_partners_created_at ON channel_partners(created_at);
CREATE INDEX IF NOT EXISTS idx_channel_partners_email ON channel_partners(email_id);
CREATE INDEX IF NOT EXISTS idx_channel_partners_contact ON channel_partners(contact_number);

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status_for_delete);
CREATE INDEX IF NOT EXISTS idx_projects_promoter_id ON projects(promoter_id);
CREATE INDEX IF NOT EXISTS idx_projects_channel_partner_id ON projects(channel_partner_id);
CREATE INDEX IF NOT EXISTS idx_projects_district_city ON projects(district, city);
CREATE INDEX IF NOT EXISTS idx_projects_rera_number ON projects(rera_number);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_expiry_date ON projects(expiry_date);
CREATE INDEX IF NOT EXISTS idx_projects_registration_date ON projects(registration_date);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);

-- Professional details indexes
CREATE INDEX IF NOT EXISTS idx_engineers_licence ON engineers(licence_number);
CREATE INDEX IF NOT EXISTS idx_engineers_pan ON engineers(pan_number);
CREATE INDEX IF NOT EXISTS idx_architects_licence ON architects(licence_number);
CREATE INDEX IF NOT EXISTS idx_architects_pan ON architects(pan_number);
CREATE INDEX IF NOT EXISTS idx_cas_licence ON cas(licence_number);
CREATE INDEX IF NOT EXISTS idx_cas_pan ON cas(pan_number);

-- Project professional details indexes
CREATE INDEX IF NOT EXISTS idx_project_professional_project_id ON project_professional_details(project_id);
CREATE INDEX IF NOT EXISTS idx_project_professional_engineer_id ON project_professional_details(engineer_id);
CREATE INDEX IF NOT EXISTS idx_project_professional_architect_id ON project_professional_details(architect_id);
CREATE INDEX IF NOT EXISTS idx_project_professional_ca_id ON project_professional_details(ca_id);

-- Project units indexes
CREATE INDEX IF NOT EXISTS idx_project_units_project_id ON project_units(project_id);
CREATE INDEX IF NOT EXISTS idx_project_units_status ON project_units(status_for_delete);
CREATE INDEX IF NOT EXISTS idx_project_units_unit_status ON project_units(unit_status);
CREATE INDEX IF NOT EXISTS idx_project_units_customer_name ON project_units(customer_name);
CREATE INDEX IF NOT EXISTS idx_project_units_agreement_date ON project_units(agreement_for_sale_date);
CREATE INDEX IF NOT EXISTS idx_project_units_sale_deed_date ON project_units(sale_deed_date);
CREATE INDEX IF NOT EXISTS idx_project_units_unit_type ON project_units(unit_type);

-- Project documents indexes
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);

-- Site progress indexes
CREATE INDEX IF NOT EXISTS idx_site_progress_project_id ON site_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_building_progress_site_id ON building_progress(site_progress_id);
CREATE INDEX IF NOT EXISTS idx_common_areas_progress_site_id ON common_areas_progress(site_progress_id);

-- Assignments indexes
CREATE INDEX IF NOT EXISTS idx_assignments_project_id ON assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status_for_delete);
CREATE INDEX IF NOT EXISTS idx_assignments_type ON assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_assignments_payment_date ON assignments(payment_date);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at);
CREATE INDEX IF NOT EXISTS idx_assignments_application_number ON assignments(application_number);

-- Assignment timeline indexes
CREATE INDEX IF NOT EXISTS idx_assignment_timeline_assignment_id ON assignment_timeline(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_timeline_event_type ON assignment_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_assignment_timeline_created_at ON assignment_timeline(created_at);

-- Assignment reminders indexes
CREATE INDEX IF NOT EXISTS idx_assignment_reminders_assignment_id ON assignment_reminders(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_reminders_date_time ON assignment_reminders(date_and_time);
CREATE INDEX IF NOT EXISTS idx_assignment_reminders_status ON assignment_reminders(status);