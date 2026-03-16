-- Add user_id column to students table to link students to user accounts.
-- When a user is assigned to a class, a student record is auto-created with this FK.
-- Nullable so manually-added students (by admin) still work without a user account.
ALTER TABLE students ADD COLUMN user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL;

-- Index for lookups by user_id + class_id
CREATE INDEX idx_students_user_class ON students(user_id, class_id) WHERE user_id IS NOT NULL;
