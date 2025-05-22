COMMENT ON TABLE users IS 'System users with authentication details';
COMMENT ON TABLE promoters IS 'Real estate promoters/developers information';
COMMENT ON TABLE promoter_details IS 'Additional details for promoters including photos and addresses';
COMMENT ON TABLE channel_partners IS 'Sales channel partners working with promoters';
COMMENT ON TABLE projects IS 'Real estate projects registered under RERA';
COMMENT ON TABLE project_units IS 'Individual units within projects with sales and financial tracking';
COMMENT ON TABLE assignments IS 'Various assignments/tasks related to projects with cost tracking';
COMMENT ON TABLE assignment_timeline IS 'Timeline tracking for assignment status changes';
COMMENT ON TABLE assignment_reminders IS 'Reminder system for assignments and deadlines';

-- Column comments for key fields
COMMENT ON COLUMN promoters.promoter_type IS 'Type: individual, huf, proprietor, company, partnership, llp, trust, society, public_authority, aop_boi, joint_venture';
COMMENT ON COLUMN projects.rera_number IS 'Real Estate Regulatory Authority registration number';
COMMENT ON COLUMN project_units.total_received IS 'Auto-calculated sum of all FY received amounts';
COMMENT ON COLUMN project_units.balance_amount IS 'Auto-calculated as agreement_value - total_received';