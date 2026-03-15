-- Add class_id to exams table (make exams class-centric instead of user-centric)
ALTER TABLE exams ADD COLUMN class_id UUID REFERENCES classes(id) ON DELETE CASCADE;

-- Remove any existing exams that have no class (orphans from old schema)
DELETE FROM exams WHERE class_id IS NULL;

-- Make class_id required
ALTER TABLE exams ALTER COLUMN class_id SET NOT NULL;

-- Drop old user-based index, create class-based index
DROP INDEX IF EXISTS idx_exams_user_date;
CREATE INDEX idx_exams_class_date ON exams(class_id, exam_date);

-- Remove user_id column (exams now belong to classes, not users)
ALTER TABLE exams DROP COLUMN user_id;
