-- 0002_weights_guest_showweights.sql
-- Adds: students.is_guest, settings.show_weights
-- Replaces: v_student_overall with weighted average formula

-- 1) students.is_guest
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT false;

-- 2) settings.show_weights
ALTER TABLE settings ADD COLUMN IF NOT EXISTS show_weights BOOLEAN NOT NULL DEFAULT false;

-- 3) v_student_overall — weighted average
--    Formula: overall_rating = ROUND(48 + ((weighted_avg - 1) / 4.0) * 50)
--    weighted_avg = SUM(ss.value * sc.weight) / NULLIF(SUM(sc.weight), 0)
--    Fallback to 3 if no skills (COALESCE)
--    Preserves: security_invoker=true, same output columns, same joins/filters
CREATE OR REPLACE VIEW v_student_overall WITH (security_invoker = true) AS
SELECT
  s.id AS student_id, s.coach_id, s.name, s.position,
  ROUND(48 + ((COALESCE(SUM(ss.value * sc.weight) / NULLIF(SUM(sc.weight), 0), 3) - 1) / 4.0) * 50)::INT AS overall_rating,
  COUNT(ss.id)::INT AS skills_count
FROM students s
LEFT JOIN student_skills ss ON ss.student_id = s.id
  AND ss.skill_key IN (
    SELECT sc2.key FROM skill_configs sc2
    WHERE sc2.coach_id = s.coach_id AND sc2.kind = 'technical' AND sc2.active = true
  )
LEFT JOIN skill_configs sc ON sc.coach_id = s.coach_id AND sc.key = ss.skill_key AND sc.kind = 'technical' AND sc.active = true
GROUP BY s.id, s.coach_id, s.name, s.position;
