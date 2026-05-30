# ADR-003: Estrategia de Multi-Tenancy — RLS por auth.uid()

## Status: Accepted

## Contexto

Cada treinador e um tenant isolado. Um treinador nunca deve ver filiais, turmas, alunos ou partidas de outro treinador. A aplicacao nao tem conceito de "organizacao" (org) com multiplos membros — cada treinador e um usuario independente.

Precisamos decidir como isolar os dados entre treinadores.

## Decisao

**Multi-tenancy via Row Level Security (RLS) com `auth.uid()` como chave de isolamento.**

Toda tabela que armazena dados do treinador tera uma coluna `coach_id UUID NOT NULL DEFAULT auth.uid()` com:

- `REFERENCES auth.users(id)` (FK para a tabela de auth)
- Policy de SELECT: `coach_id = (SELECT auth.uid())`
- Policy de INSERT: `WITH CHECK (coach_id = (SELECT auth.uid()))`
- Policy de UPDATE: `USING (coach_id = (SELECT auth.uid())) WITH CHECK (coach_id = (SELECT auth.uid()))`
- Policy de DELETE: `USING (coach_id = (SELECT auth.uid()))`
- Indice em `coach_id` em toda tabela (performance das policies)

O wrapper `(SELECT auth.uid())` e usado em vez de `auth.uid()` direto para evitar re-execucao por linha (padrao cross-project validado).

`coach_id` nunca e enviado pelo client — e sempre `DEFAULT auth.uid()` no INSERT e validado via `WITH CHECK` no UPDATE.

## Alternativas descartadas

- **app_metadata com tenant_id:** Util quando ha organizacoes com multiplos membros que compartilham dados. Neste app, cada treinador e um tenant isolado — nao ha compartilhamento. `auth.uid()` direto e mais simples e igualmente seguro.

- **RLS desabilitado + filtro no service layer:** Inseguro. Se um service esquecer o filtro `WHERE coach_id = ?`, dados vazam. RLS e a camada de seguranca definitiva — o service pode ate esquecer, o banco nao deixa passar.

- **Supabase Edge Functions como proxy obrigatorio:** Adicionaria latencia em toda operacao. O anon key + RLS ja e suficiente para o modelo de ameacas do app (treinadores individuais, sem dados financeiros ou de saude criticos).

## Consequencias

**Positivas:**
- Isolamento garantido no nivel do banco — impossivel acessar dados de outro treinador mesmo com bug no front
- Modelo simples: uma coluna `coach_id` em cada tabela
- Performance: indice em `coach_id` + wrapper `(SELECT auth.uid())` otimizam queries
- Services nao precisam de filtro manual (RLS faz isso)
- `DEFAULT auth.uid()` elimina risco de coach_id spoofado pelo client

**Negativas:**
- Se no futuro o app permitir "assistentes" ou "estagiarios" que acessam dados do treinador principal, sera necessario evoluir para um modelo de `team_id` ou `org_id` em `app_metadata` — mas e YAGNI por enquanto
- Debug de RLS e mais complexo (queries falham silenciosamente se a policy bloquear) — mitigado com testes e bom logging
