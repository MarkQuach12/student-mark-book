ALTER TABLE exams
    DROP CONSTRAINT IF EXISTS exams_time_check;

ALTER TABLE exams
    DROP COLUMN IF EXISTS start_time,
    DROP COLUMN IF EXISTS end_time;
