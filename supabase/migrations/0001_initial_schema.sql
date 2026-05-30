-- =====================================================================
-- Esporte Recreação — Schema completo (greenfield, multi-tenant por coach)
-- Aplicado via Management API. Idempotente onde possível.
-- =====================================================================

-- ---------- Funções utilitárias ----------
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Helpers de ownership (SECURITY DEFINER, late binding nas tabelas) ----
CREATE OR REPLACE FUNCTION fn_is_coach_owner_of_team(p_team_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams t
    JOIN branches b ON b.id = t.branch_id
    WHERE t.id = p_team_id AND b.coach_id = (SELECT auth.uid())
  );
END; $$;

CREATE OR REPLACE FUNCTION fn_is_coach_owner_of_session(p_session_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM training_sessions ts
    JOIN teams t ON t.id = ts.team_id
    JOIN branches b ON b.id = t.branch_id
    WHERE ts.id = p_session_id AND b.coach_id = (SELECT auth.uid())
  );
END; $$;

CREATE OR REPLACE FUNCTION fn_is_coach_owner_of_match(p_match_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM matches m
    JOIN teams t ON t.id = m.team_id
    JOIN branches b ON b.id = t.branch_id
    WHERE m.id = p_match_id AND b.coach_id = (SELECT auth.uid())
  );
END; $$;

CREATE OR REPLACE FUNCTION fn_is_coach_owner_of_evaluation(p_evaluation_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM evaluations e
    JOIN training_sessions ts ON ts.id = e.session_id
    JOIN teams t ON t.id = ts.team_id
    JOIN branches b ON b.id = t.branch_id
    WHERE e.id = p_evaluation_id AND b.coach_id = (SELECT auth.uid())
  );
END; $$;

CREATE OR REPLACE FUNCTION fn_prevent_branch_delete_with_active_teams()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM teams WHERE branch_id = OLD.id AND archived = false) THEN
    RAISE EXCEPTION 'Não é possível excluir uma filial com turmas ativas. Arquive ou exclua as turmas primeiro.';
  END IF;
  RETURN OLD;
END; $$;

-- SEC-A1: imutabilidade da key de skill_configs
CREATE OR REPLACE FUNCTION fn_prevent_skill_key_update()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.key <> OLD.key THEN
    RAISE EXCEPTION 'A chave (key) de um fundamento é imutável após a criação.';
  END IF;
  RETURN NEW;
END; $$;

-- Inicialização do coach no signup
CREATE OR REPLACE FUNCTION fn_initialize_coach_settings()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO settings (coach_id) VALUES (NEW.id) ON CONFLICT (coach_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION fn_initialize_default_skill_configs()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO skill_configs (coach_id, kind, key, label, active, weight, sort_order) VALUES
    (NEW.id, 'technical', 'saque',         'Saque',          true,  1.0, 1),
    (NEW.id, 'technical', 'recepcao',      'Recepção',       true,  1.2, 2),
    (NEW.id, 'technical', 'levantamento',  'Levantamento',   true,  1.3, 3),
    (NEW.id, 'technical', 'ataque',        'Ataque',         true,  1.4, 4),
    (NEW.id, 'technical', 'bloqueio',      'Bloqueio',       true,  1.0, 5),
    (NEW.id, 'technical', 'defesa',        'Defesa',         true,  1.0, 6),
    (NEW.id, 'technical', 'posicionamento','Posicionamento', false, 1.0, 7),
    (NEW.id, 'soft',      'comportamento', 'Comportamento',  true,  1.0, 1),
    (NEW.id, 'soft',      'proatividade',  'Proatividade',   true,  1.0, 2),
    (NEW.id, 'soft',      'apoio',         'Apoio ao time',  true,  1.0, 3),
    (NEW.id, 'soft',      'comunicacao',   'Comunicação',    false, 1.0, 4),
    (NEW.id, 'soft',      'esforco',       'Esforço',        true,  1.0, 5)
  ON CONFLICT (coach_id, key) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

-- Atualiza snapshot student_skills quando avaliação registra ajuste de fundamento
CREATE OR REPLACE FUNCTION fn_sync_student_skill_from_eval()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID;
  v_coach_id UUID;
BEGIN
  SELECT e.student_id INTO v_student_id FROM evaluations e WHERE e.id = NEW.evaluation_id;
  SELECT s.coach_id INTO v_coach_id FROM students s WHERE s.id = v_student_id;
  INSERT INTO student_skills (student_id, coach_id, skill_key, value)
  VALUES (v_student_id, v_coach_id, NEW.skill_key, NEW.value)
  ON CONFLICT (student_id, skill_key)
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  RETURN NEW;
END; $$;

-- =====================================================================
-- TABELAS
-- =====================================================================

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  parental_consent_acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ---------- settings ----------
CREATE TABLE IF NOT EXISTS settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  theme         TEXT NOT NULL DEFAULT 'light'       CHECK (theme IN ('light','dark','system')),
  height_unit   TEXT NOT NULL DEFAULT 'cm'          CHECK (height_unit IN ('cm','ft')),
  team_size     TEXT NOT NULL DEFAULT '6x6'         CHECK (team_size IN ('2x2','3x3','4x4','5x5','6x6','7x7')),
  assembly_mode TEXT NOT NULL DEFAULT 'competitive' CHECK (assembly_mode IN ('competitive','development')),
  bench_policy  TEXT NOT NULL DEFAULT 'bench'       CHECK (bench_policy IN ('bench','rotation')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS settings_select_own ON settings;
CREATE POLICY settings_select_own ON settings FOR SELECT USING (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS settings_insert_own ON settings;
CREATE POLICY settings_insert_own ON settings FOR INSERT WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS settings_update_own ON settings;
CREATE POLICY settings_update_own ON settings FOR UPDATE USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()));
DROP TRIGGER IF EXISTS trg_settings_updated_at ON settings;
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ---------- skill_configs ----------
CREATE TABLE IF NOT EXISTS skill_configs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id   UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('technical','soft')),
  key        TEXT NOT NULL,
  label      TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT true,
  weight     NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (weight BETWEEN 0.5 AND 2.0),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coach_id, key)
);
ALTER TABLE skill_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS skill_configs_select_own ON skill_configs;
CREATE POLICY skill_configs_select_own ON skill_configs FOR SELECT USING (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS skill_configs_insert_own ON skill_configs;
CREATE POLICY skill_configs_insert_own ON skill_configs FOR INSERT WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS skill_configs_update_own ON skill_configs;
CREATE POLICY skill_configs_update_own ON skill_configs FOR UPDATE USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()));
DROP TRIGGER IF EXISTS trg_skill_configs_updated_at ON skill_configs;
CREATE TRIGGER trg_skill_configs_updated_at BEFORE UPDATE ON skill_configs FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
DROP TRIGGER IF EXISTS trg_skill_configs_key_immutable ON skill_configs;
CREATE TRIGGER trg_skill_configs_key_immutable BEFORE UPDATE ON skill_configs FOR EACH ROW EXECUTE FUNCTION fn_prevent_skill_key_update();
CREATE INDEX IF NOT EXISTS idx_skill_configs_coach_id ON skill_configs(coach_id);

-- ---------- profile init triggers (settings + skill_configs já existem) ----------
DROP TRIGGER IF EXISTS trg_profiles_after_insert_settings ON profiles;
CREATE TRIGGER trg_profiles_after_insert_settings AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION fn_initialize_coach_settings();
DROP TRIGGER IF EXISTS trg_profiles_after_insert_skills ON profiles;
CREATE TRIGGER trg_profiles_after_insert_skills AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION fn_initialize_default_skill_configs();
DROP TRIGGER IF EXISTS trg_auth_users_after_insert ON auth.users;
CREATE TRIGGER trg_auth_users_after_insert AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- ---------- branches ----------
CREATE TABLE IF NOT EXISTS branches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id     UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  city         TEXT NOT NULL DEFAULT '',
  address      TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  manager_name TEXT NOT NULL DEFAULT '',
  archived     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branches_select_own ON branches;
CREATE POLICY branches_select_own ON branches FOR SELECT USING (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS branches_insert_own ON branches;
CREATE POLICY branches_insert_own ON branches FOR INSERT WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS branches_update_own ON branches;
CREATE POLICY branches_update_own ON branches FOR UPDATE USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS branches_delete_own ON branches;
CREATE POLICY branches_delete_own ON branches FOR DELETE USING (coach_id = (SELECT auth.uid()));
DROP TRIGGER IF EXISTS trg_branches_updated_at ON branches;
CREATE TRIGGER trg_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
DROP TRIGGER IF EXISTS trg_branches_before_delete ON branches;
CREATE TRIGGER trg_branches_before_delete BEFORE DELETE ON branches FOR EACH ROW EXECUTE FUNCTION fn_prevent_branch_delete_with_active_teams();
CREATE INDEX IF NOT EXISTS idx_branches_coach_id ON branches(coach_id);

-- ---------- teams ----------
CREATE TABLE IF NOT EXISTS teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  schedule_days   TEXT NOT NULL DEFAULT '',
  schedule_time   TIME,
  level           TEXT NOT NULL DEFAULT 'Iniciante' CHECK (level IN ('Iniciante','Intermediário','Avançado')),
  age_group       TEXT NOT NULL DEFAULT '',
  instructor_name TEXT NOT NULL DEFAULT '',
  archived        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS teams_select_own ON teams;
CREATE POLICY teams_select_own ON teams FOR SELECT USING (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS teams_insert_own ON teams;
CREATE POLICY teams_insert_own ON teams FOR INSERT WITH CHECK (
  coach_id = (SELECT auth.uid())
  AND EXISTS (SELECT 1 FROM branches WHERE id = branch_id AND coach_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS teams_update_own ON teams;
CREATE POLICY teams_update_own ON teams FOR UPDATE USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS teams_delete_own ON teams;
CREATE POLICY teams_delete_own ON teams FOR DELETE USING (coach_id = (SELECT auth.uid()));
DROP TRIGGER IF EXISTS trg_teams_updated_at ON teams;
CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_teams_branch_id ON teams(branch_id);

-- ---------- students ----------
CREATE TABLE IF NOT EXISTS students (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id            UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  position            TEXT NOT NULL DEFAULT '' CHECK (position IN ('','LEV','PON','OPO','CEN','LIB')),
  alternate_positions TEXT[] NOT NULL DEFAULT '{}',
  age                 INT CHECK (age IS NULL OR (age >= 1 AND age <= 99)),
  height_cm           INT CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 250)),
  dominant_hand       TEXT NOT NULL DEFAULT '' CHECK (dominant_hand IN ('','Destro','Canhoto','Ambidestro')),
  photo_path          TEXT,
  guardian_name       TEXT NOT NULL DEFAULT '',
  guardian_phone      TEXT NOT NULL DEFAULT '',
  notes               TEXT NOT NULL DEFAULT '',
  parental_consent    BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS students_select_own ON students;
CREATE POLICY students_select_own ON students FOR SELECT USING (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS students_insert_own ON students;
CREATE POLICY students_insert_own ON students FOR INSERT WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS students_update_own ON students;
CREATE POLICY students_update_own ON students FOR UPDATE USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS students_delete_own ON students;
CREATE POLICY students_delete_own ON students FOR DELETE USING (coach_id = (SELECT auth.uid()));
DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE INDEX IF NOT EXISTS idx_students_coach_id ON students(coach_id);

-- ---------- team_students (M:N) ----------
CREATE TABLE IF NOT EXISTS team_students (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, student_id)
);
ALTER TABLE team_students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS team_students_select_own ON team_students;
CREATE POLICY team_students_select_own ON team_students FOR SELECT USING (
  EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND t.coach_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS team_students_insert_own ON team_students;
CREATE POLICY team_students_insert_own ON team_students FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND t.coach_id = (SELECT auth.uid()))
  AND EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.coach_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS team_students_delete_own ON team_students;
CREATE POLICY team_students_delete_own ON team_students FOR DELETE USING (
  EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND t.coach_id = (SELECT auth.uid()))
);
CREATE INDEX IF NOT EXISTS idx_team_students_team_id ON team_students(team_id);
CREATE INDEX IF NOT EXISTS idx_team_students_student_id ON team_students(student_id);

-- ---------- student_skills (snapshot) ----------
CREATE TABLE IF NOT EXISTS student_skills (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  coach_id   UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  skill_key  TEXT NOT NULL,
  value      INT NOT NULL DEFAULT 3 CHECK (value >= 1 AND value <= 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, skill_key)
);
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS student_skills_select_own ON student_skills;
CREATE POLICY student_skills_select_own ON student_skills FOR SELECT USING (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS student_skills_insert_own ON student_skills;
CREATE POLICY student_skills_insert_own ON student_skills FOR INSERT WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS student_skills_update_own ON student_skills;
CREATE POLICY student_skills_update_own ON student_skills FOR UPDATE USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()));
CREATE INDEX IF NOT EXISTS idx_student_skills_student_id ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_coach_id ON student_skills(coach_id);

-- ---------- training_sessions ----------
CREATE TABLE IF NOT EXISTS training_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id      UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id     UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sessions_select_own ON training_sessions;
CREATE POLICY sessions_select_own ON training_sessions FOR SELECT USING (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS sessions_insert_own ON training_sessions;
CREATE POLICY sessions_insert_own ON training_sessions FOR INSERT WITH CHECK (coach_id = (SELECT auth.uid()) AND fn_is_coach_owner_of_team(team_id));
DROP POLICY IF EXISTS sessions_update_own ON training_sessions;
CREATE POLICY sessions_update_own ON training_sessions FOR UPDATE USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS sessions_delete_own ON training_sessions;
CREATE POLICY sessions_delete_own ON training_sessions FOR DELETE USING (coach_id = (SELECT auth.uid()));
DROP TRIGGER IF EXISTS trg_training_sessions_updated_at ON training_sessions;
CREATE TRIGGER trg_training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE INDEX IF NOT EXISTS idx_training_sessions_coach_id ON training_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_team_id ON training_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);

-- ---------- attendances ----------
CREATE TABLE IF NOT EXISTS attendances (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, student_id)
);
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS attendances_select_own ON attendances;
CREATE POLICY attendances_select_own ON attendances FOR SELECT USING (fn_is_coach_owner_of_session(session_id));
DROP POLICY IF EXISTS attendances_insert_own ON attendances;
CREATE POLICY attendances_insert_own ON attendances FOR INSERT WITH CHECK (fn_is_coach_owner_of_session(session_id));
DROP POLICY IF EXISTS attendances_update_own ON attendances;
CREATE POLICY attendances_update_own ON attendances FOR UPDATE USING (fn_is_coach_owner_of_session(session_id)) WITH CHECK (fn_is_coach_owner_of_session(session_id));
DROP POLICY IF EXISTS attendances_delete_own ON attendances;
CREATE POLICY attendances_delete_own ON attendances FOR DELETE USING (fn_is_coach_owner_of_session(session_id));
CREATE INDEX IF NOT EXISTS idx_attendances_session_id ON attendances(session_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student_id ON attendances(student_id);

-- ---------- evaluations ----------
CREATE TABLE IF NOT EXISTS evaluations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  engagement INT NOT NULL DEFAULT 3 CHECK (engagement >= 1 AND engagement <= 5),
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, student_id)
);
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS evaluations_select_own ON evaluations;
CREATE POLICY evaluations_select_own ON evaluations FOR SELECT USING (fn_is_coach_owner_of_session(session_id));
DROP POLICY IF EXISTS evaluations_insert_own ON evaluations;
CREATE POLICY evaluations_insert_own ON evaluations FOR INSERT WITH CHECK (fn_is_coach_owner_of_session(session_id));
DROP POLICY IF EXISTS evaluations_update_own ON evaluations;
CREATE POLICY evaluations_update_own ON evaluations FOR UPDATE USING (fn_is_coach_owner_of_session(session_id)) WITH CHECK (fn_is_coach_owner_of_session(session_id));
DROP POLICY IF EXISTS evaluations_delete_own ON evaluations;
CREATE POLICY evaluations_delete_own ON evaluations FOR DELETE USING (fn_is_coach_owner_of_session(session_id));
DROP TRIGGER IF EXISTS trg_evaluations_updated_at ON evaluations;
CREATE TRIGGER trg_evaluations_updated_at BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE INDEX IF NOT EXISTS idx_evaluations_session_id ON evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student_id ON evaluations(student_id);

-- ---------- evaluation_skills ----------
CREATE TABLE IF NOT EXISTS evaluation_skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  skill_key     TEXT NOT NULL,
  value         INT NOT NULL CHECK (value >= 1 AND value <= 5),
  direction     TEXT NOT NULL DEFAULT 'stable' CHECK (direction IN ('up','down','stable')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (evaluation_id, skill_key)
);
ALTER TABLE evaluation_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS eval_skills_select_own ON evaluation_skills;
CREATE POLICY eval_skills_select_own ON evaluation_skills FOR SELECT USING (fn_is_coach_owner_of_evaluation(evaluation_id));
DROP POLICY IF EXISTS eval_skills_insert_own ON evaluation_skills;
CREATE POLICY eval_skills_insert_own ON evaluation_skills FOR INSERT WITH CHECK (fn_is_coach_owner_of_evaluation(evaluation_id));
DROP POLICY IF EXISTS eval_skills_update_own ON evaluation_skills;
CREATE POLICY eval_skills_update_own ON evaluation_skills FOR UPDATE USING (fn_is_coach_owner_of_evaluation(evaluation_id)) WITH CHECK (fn_is_coach_owner_of_evaluation(evaluation_id));
DROP POLICY IF EXISTS eval_skills_delete_own ON evaluation_skills;
CREATE POLICY eval_skills_delete_own ON evaluation_skills FOR DELETE USING (fn_is_coach_owner_of_evaluation(evaluation_id));
CREATE INDEX IF NOT EXISTS idx_evaluation_skills_evaluation_id ON evaluation_skills(evaluation_id);
DROP TRIGGER IF EXISTS trg_eval_skills_sync ON evaluation_skills;
CREATE TRIGGER trg_eval_skills_sync AFTER INSERT OR UPDATE ON evaluation_skills FOR EACH ROW EXECUTE FUNCTION fn_sync_student_skill_from_eval();

-- ---------- matches ----------
CREATE TABLE IF NOT EXISTS matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES training_sessions(id) ON DELETE SET NULL,
  team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id      UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  match_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  team_a_name   TEXT NOT NULL DEFAULT 'Time A',
  team_b_name   TEXT NOT NULL DEFAULT 'Time B',
  winner        TEXT CHECK (winner IN ('a','b')),
  walkover      BOOLEAN NOT NULL DEFAULT false,
  balance_score INT CHECK (balance_score IS NULL OR (balance_score >= 0 AND balance_score <= 100)),
  format        TEXT NOT NULL DEFAULT 'single' CHECK (format IN ('single','best_of_3','best_of_5','timed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS matches_select_own ON matches;
CREATE POLICY matches_select_own ON matches FOR SELECT USING (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS matches_insert_own ON matches;
CREATE POLICY matches_insert_own ON matches FOR INSERT WITH CHECK (coach_id = (SELECT auth.uid()) AND fn_is_coach_owner_of_team(team_id));
DROP POLICY IF EXISTS matches_update_own ON matches;
CREATE POLICY matches_update_own ON matches FOR UPDATE USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS matches_delete_own ON matches;
CREATE POLICY matches_delete_own ON matches FOR DELETE USING (coach_id = (SELECT auth.uid()));
DROP TRIGGER IF EXISTS trg_matches_updated_at ON matches;
CREATE TRIGGER trg_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE INDEX IF NOT EXISTS idx_matches_coach_id ON matches(coach_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_id ON matches(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_session_id ON matches(session_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- ---------- match_sets ----------
CREATE TABLE IF NOT EXISTS match_sets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  set_number INT NOT NULL CHECK (set_number >= 1),
  points_a   INT NOT NULL DEFAULT 0 CHECK (points_a >= 0),
  points_b   INT NOT NULL DEFAULT 0 CHECK (points_b >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, set_number)
);
ALTER TABLE match_sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS match_sets_select_own ON match_sets;
CREATE POLICY match_sets_select_own ON match_sets FOR SELECT USING (fn_is_coach_owner_of_match(match_id));
DROP POLICY IF EXISTS match_sets_insert_own ON match_sets;
CREATE POLICY match_sets_insert_own ON match_sets FOR INSERT WITH CHECK (fn_is_coach_owner_of_match(match_id));
DROP POLICY IF EXISTS match_sets_update_own ON match_sets;
CREATE POLICY match_sets_update_own ON match_sets FOR UPDATE USING (fn_is_coach_owner_of_match(match_id)) WITH CHECK (fn_is_coach_owner_of_match(match_id));
DROP POLICY IF EXISTS match_sets_delete_own ON match_sets;
CREATE POLICY match_sets_delete_own ON match_sets FOR DELETE USING (fn_is_coach_owner_of_match(match_id));
CREATE INDEX IF NOT EXISTS idx_match_sets_match_id ON match_sets(match_id);

-- ---------- match_rosters ----------
CREATE TABLE IF NOT EXISTS match_rosters (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  side       TEXT NOT NULL CHECK (side IN ('a','b')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, student_id)
);
ALTER TABLE match_rosters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS match_rosters_select_own ON match_rosters;
CREATE POLICY match_rosters_select_own ON match_rosters FOR SELECT USING (fn_is_coach_owner_of_match(match_id));
DROP POLICY IF EXISTS match_rosters_insert_own ON match_rosters;
CREATE POLICY match_rosters_insert_own ON match_rosters FOR INSERT WITH CHECK (fn_is_coach_owner_of_match(match_id));
DROP POLICY IF EXISTS match_rosters_delete_own ON match_rosters;
CREATE POLICY match_rosters_delete_own ON match_rosters FOR DELETE USING (fn_is_coach_owner_of_match(match_id));
CREATE INDEX IF NOT EXISTS idx_match_rosters_match_id ON match_rosters(match_id);
CREATE INDEX IF NOT EXISTS idx_match_rosters_student_id ON match_rosters(student_id);

-- =====================================================================
-- VIEWS (SEC-C1: security_invoker = true → herdam RLS das tabelas base)
-- =====================================================================
CREATE OR REPLACE VIEW v_student_overall WITH (security_invoker = true) AS
SELECT
  s.id AS student_id, s.coach_id, s.name, s.position,
  ROUND(48 + ((COALESCE(AVG(ss.value), 3) - 1) / 4.0) * 50)::INT AS overall_rating,
  COUNT(ss.id)::INT AS skills_count
FROM students s
LEFT JOIN student_skills ss ON ss.student_id = s.id
  AND ss.skill_key IN (
    SELECT sc.key FROM skill_configs sc
    WHERE sc.coach_id = s.coach_id AND sc.kind = 'technical' AND sc.active = true
  )
GROUP BY s.id, s.coach_id, s.name, s.position;

CREATE OR REPLACE VIEW v_student_match_stats WITH (security_invoker = true) AS
SELECT
  mr.student_id, s.coach_id, s.name,
  COUNT(*) FILTER (WHERE (mr.side='a' AND m.winner='a') OR (mr.side='b' AND m.winner='b'))::INT AS wins,
  COUNT(*) FILTER (WHERE (mr.side='a' AND m.winner='b') OR (mr.side='b' AND m.winner='a'))::INT AS losses,
  COUNT(*)::INT AS total_matches
FROM match_rosters mr
JOIN matches m ON m.id = mr.match_id
JOIN students s ON s.id = mr.student_id
WHERE m.winner IS NOT NULL
GROUP BY mr.student_id, s.coach_id, s.name;

CREATE OR REPLACE VIEW v_student_attendance_stats WITH (security_invoker = true) AS
SELECT
  a.student_id, s.coach_id,
  COUNT(*) FILTER (WHERE a.status='present')::INT AS present_count,
  COUNT(*) FILTER (WHERE a.status='absent')::INT AS absent_count,
  COUNT(*) FILTER (WHERE a.status='late')::INT AS late_count,
  COUNT(*)::INT AS total_sessions,
  CASE WHEN COUNT(*) > 0
    THEN ROUND(COUNT(*) FILTER (WHERE a.status IN ('present','late'))::NUMERIC / COUNT(*)::NUMERIC * 100, 1)
    ELSE 0 END AS attendance_pct
FROM attendances a
JOIN students s ON s.id = a.student_id
GROUP BY a.student_id, s.coach_id;

-- =====================================================================
-- STORAGE: bucket privado student-photos
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS coach_photos_select ON storage.objects;
CREATE POLICY coach_photos_select ON storage.objects FOR SELECT USING (
  bucket_id = 'student-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
DROP POLICY IF EXISTS coach_photos_insert ON storage.objects;
CREATE POLICY coach_photos_insert ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'student-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
DROP POLICY IF EXISTS coach_photos_update ON storage.objects;
CREATE POLICY coach_photos_update ON storage.objects FOR UPDATE USING (
  bucket_id = 'student-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
DROP POLICY IF EXISTS coach_photos_delete ON storage.objects;
CREATE POLICY coach_photos_delete ON storage.objects FOR DELETE USING (
  bucket_id = 'student-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
