CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_id ON projects(id);
CREATE INDEX IF NOT EXISTS idx_projects_promoter_id ON projects(promoter_id);
CREATE INDEX IF NOT EXISTS idx_projects_status_for_delete ON projects(status_for_delete);
CREATE INDEX IF NOT EXISTS idx_projects_promoter_status ON projects(promoter_id, status_for_delete);

CREATE INDEX IF NOT EXISTS idx_assignments_project_id ON assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status_for_delete ON assignments(status_for_delete);
CREATE INDEX IF NOT EXISTS idx_assignment_timeline_assignment_id ON assignment_timeline(assignment_id);
CREATE INDEX idx_timeline_assignment_created ON assignment_timeline(assignment_id, created_at DESC);