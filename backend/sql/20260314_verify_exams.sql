SELECT 1 / CASE WHEN to_regclass('public.exams') IS NULL THEN 0 ELSE 1 END;
SELECT 1 / CASE WHEN to_regclass('public.idx_exams_user_date') IS NULL THEN 0 ELSE 1 END;
SELECT 1 / CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exams' AND column_name = 'exam_date'
) THEN 1 ELSE 0 END;
SELECT 1 / CASE WHEN NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exams' AND column_name IN ('start_time', 'end_time')
) THEN 1 ELSE 0 END;
