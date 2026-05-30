// Setup determinístico p/ o módulo de treino: cria 1 filial + 1 turma "Treino QA" + 7 alunos
// com fundamentos variados, vinculados. Usa service_role (bypassa RLS) com coach_id do QA bot.
import { readFileSync } from 'node:fs'

function env() {
  const e = {}
  for (const l of readFileSync('.env', 'utf8').split('\n')) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return e
}
const E = env()
const PID = E.SUPABASE_PROJECT_ID
const TOKEN = E.SUPABASE_ACCESS_TOKEN
const QID = readFileSync('/tmp/qa_uid.txt', 'utf8').trim()

async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${PID}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const t = await r.text()
  if (!r.ok) throw new Error(t)
  return JSON.parse(t)
}

// limpa setup de treino anterior do QA e recria
const q = `
DO $$
DECLARE c UUID := '${QID}'; f UUID; t UUID; sid UUID;
  names TEXT[] := ARRAY['Treino A','Treino B','Treino C','Treino D','Treino E','Treino F','Treino G'];
  poss TEXT[] := ARRAY['LEV','PON','OPO','CEN','LIB','LEV','PON'];
  sk INT[][] := ARRAY[ARRAY[4,4,5,5,3,4],ARRAY[4,4,3,5,4,4],ARRAY[5,3,3,5,4,3],ARRAY[3,3,2,4,5,3],ARRAY[2,5,3,2,1,5],ARRAY[3,4,5,3,2,5],ARRAY[4,5,3,4,3,5]];
  keys TEXT[] := ARRAY['saque','recepcao','levantamento','ataque','bloqueio','defesa'];
  i INT; j INT;
BEGIN
  DELETE FROM students WHERE coach_id=c AND name LIKE 'Treino %';
  DELETE FROM teams WHERE coach_id=c AND name='Treino QA T1';
  DELETE FROM branches WHERE coach_id=c AND name='Treino QA';
  INSERT INTO branches(coach_id,name,city) VALUES(c,'Treino QA','QA City') RETURNING id INTO f;
  INSERT INTO teams(branch_id,coach_id,name,schedule_days,level,age_group) VALUES(f,c,'Treino QA T1','Seg·Qua','Avançado','15-17') RETURNING id INTO t;
  FOR i IN 1..7 LOOP
    INSERT INTO students(coach_id,name,position,age,height_cm,dominant_hand,parental_consent)
      VALUES(c,names[i],poss[i],16,180,'Destro',true) RETURNING id INTO sid;
    INSERT INTO team_students(team_id,student_id) VALUES(t,sid);
    FOR j IN 1..6 LOOP INSERT INTO student_skills(student_id,coach_id,skill_key,value) VALUES(sid,c,keys[j],sk[i][j]); END LOOP;
  END LOOP;
END $$;
SELECT json_build_object(
  'team',(SELECT name FROM teams WHERE coach_id='${QID}' AND name='Treino QA T1'),
  'students',(SELECT count(*) FROM students WHERE coach_id='${QID}' AND name LIKE 'Treino %')
);
`
const res = await sql(q)
console.log('setup treino:', JSON.stringify(res[0]?.json_build_object || res))
