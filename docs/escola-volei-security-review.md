# Security Review: Esporte Recreacao -- pos-PO

**Projeto:** Esporte Recreacao (app de gestao de turmas de volei)
**Stack:** Vite + React + Supabase (Auth + RLS + Storage)
**Modo:** Security Review pos-PO (Modo 1)
**Data:** 2026-05-30

---

## 1. Classificacao de Dados

### PII de Menores de Idade (12-17 anos)

O app manipula dados de menores de idade (alunos de volei, faixa 12-17). Isso eleva a sensibilidade mesmo sem dados financeiros ou de saude.

| Dado | Classificacao | Tratamento Obrigatorio |
|------|--------------|----------------------|
| Nome completo do aluno | **Interno** | Acesso autenticado, RLS por coach, nunca expor em API publica |
| Idade / data de nascimento | **Interno** | Acesso autenticado, RLS por coach |
| Altura / mao dominante | **Interno** | Acesso autenticado, RLS por coach |
| Foto do aluno (futuro) | **Confidencial** | Bucket privado, signed URLs com TTL curto (max 1h), RLS no storage, nunca URL publica |
| Posicao / fundamentos (notas 1-5) | **Interno** | Acesso autenticado, RLS por coach |
| Historico V/D, engajamento | **Interno** | Acesso autenticado, RLS por coach |
| Email do coach | **Interno** | Acesso autenticado, visivel apenas ao proprio usuario |
| Senha do coach | **Restrito** | Supabase Auth (bcrypt), nunca armazenada ou logada pela aplicacao |
| Supabase anon key | **Publico** | Exposta no client -- permissoes controladas por RLS |
| Supabase service_role_key | **Restrito** | Apenas server-side (Edge Functions), nunca no client, nunca em variaveis VITE_ |
| Configuracoes do coach (tema, idioma, preferencias) | **Publico** | Sem sensibilidade, mas isoladas por usuario via RLS |

### Dados Gerados (Compartilhamento)

A feature de compartilhamento gera imagens **client-side** com nomes de jogadores e stats. A imagem nao contem dados sensiveis alem de nomes e resultados de partida (informacao publica no contexto esportivo). Risco aceitavel -- nao requer protecao adicional.

---

## 2. Threat Modeling (STRIDE)

### Fluxo: Autenticacao e Sessao

| Ameaca | Risco | Mitigacao |
|--------|-------|-----------|
| **Spoofing** -- roubo de sessao | Medio | Supabase Auth com cookies httpOnly (se SSR) ou tokens com refresh. Rate limiting no login (Supabase Auth nativo). |
| **Tampering** -- alterar dados de sessao no client | Baixo | JWT assinado pelo Supabase, validado server-side. Nunca confiar em dados do client para auth. |
| **Information Disclosure** -- email leak via signup | Medio | Mensagem generica no signup/login: "Email ou senha incorretos" -- nunca revelar se email ja existe. Verificar config do Supabase Auth. |

### Fluxo: CRUD de Entidades (Filiais, Turmas, Alunos)

| Ameaca | Risco | Mitigacao |
|--------|-------|-----------|
| **Tampering** -- coach altera dados de outro coach via DevTools/API | **Alto** | RLS obrigatorio em TODAS as tabelas. Toda operacao (SELECT/INSERT/UPDATE/DELETE) deve verificar `auth.uid()`. |
| **Elevation of Privilege** -- coach acessa filiais/turmas/alunos de outro coach | **Alto** | Tenant isolation via RLS: `coach_id = auth.uid()`. Nunca confiar em parametro do client para determinar ownership. |
| **Information Disclosure** -- listar todos os alunos do sistema | **Alto** | RLS restringe SELECT apenas aos alunos vinculados as turmas do coach autenticado. |
| **Repudiation** -- "eu nao deletei essa turma" | Baixo | Para MVP, aceitavel sem audit log. Considerar em v2 para acoes destrutivas (delete filial/turma/aluno). |

### Fluxo: Montar Times e Registrar Resultado

| Ameaca | Risco | Mitigacao |
|--------|-------|-----------|
| **Tampering** -- alterar resultado de partida via API | Medio | RLS: apenas coach dono da turma pode INSERT/UPDATE em partidas. Validacao server-side dos dados. |
| **Denial of Service** -- spam de partidas | Baixo | Rate limiting nativo do Supabase. Para MVP, aceitavel sem protecao adicional. |

### Fluxo: Storage (Fotos de Alunos -- futuro)

| Ameaca | Risco | Mitigacao |
|--------|-------|-----------|
| **Information Disclosure** -- fotos de menores acessiveis publicamente | **Alto** | Bucket **privado** obrigatorio. Signed URLs com TTL max 1h. RLS no storage: apenas coach dono da turma acessa. |
| **Tampering** -- upload de arquivo malicioso | Medio | Validar MIME type server-side (apenas image/*). Limitar tamanho (max 5MB). Sanitizar nome do arquivo. |

---

## 3. Requisitos de Seguranca

### 3.1 Autenticacao e Sessao

- [ ] Auth via Supabase Auth (email/senha) -- senhas com bcrypt (Supabase faz nativamente)
- [ ] Rate limiting no login habilitado no Supabase Dashboard (Auth > Rate Limits)
- [ ] Sessao com expiracao configurada (default Supabase: 1h access token, 1 semana refresh)
- [ ] Logout invalida sessao (chamar `supabase.auth.signOut()`)
- [ ] Tela de reset de senha com token expiravel e single-use (Supabase Auth nativo)
- [ ] Mensagens genericas em login/signup -- nunca revelar se email ja existe
- [ ] `auth.getUser()` obrigatorio em qualquer verificacao server-side -- nunca `auth.getSession()`
- [ ] Email confirmation habilitado no Supabase Dashboard (Auth > Providers > Email)
- [ ] Site URL e Redirect URLs configurados corretamente no Dashboard (previne open redirect)

### 3.2 RLS (Row Level Security) -- por Entidade

**Modelo de tenant isolation:** Cada coach ve apenas seus proprios dados. A cadeia de ownership e:

```
coach (auth.uid()) -> filiais -> turmas -> alunos (via turma) -> partidas (via turma)
```

| Tabela | SELECT | INSERT | UPDATE | DELETE | Regra RLS |
|--------|--------|--------|--------|--------|-----------|
| **filiais** | Proprio coach | Auth | Proprio coach | Proprio coach (sem turmas ativas) | `coach_id = auth.uid()` |
| **turmas** | Proprio coach (via filial) | Auth (filial propria) | Proprio coach | Proprio coach | `filial.coach_id = auth.uid()` (join ou subquery) |
| **alunos** | Proprio coach (via turma) | Auth (turma propria) | Proprio coach | Proprio coach | Cadeia via turma > filial > coach_id |
| **turma_alunos** (pivot) | Proprio coach | Auth | Proprio coach | Proprio coach | Cadeia via turma > filial > coach_id |
| **partidas** | Proprio coach (via turma) | Auth (turma propria) | Proprio coach | Proprio coach | Cadeia via turma > filial > coach_id |
| **avaliacoes** | Proprio coach | Auth | Proprio coach | Proprio coach | Cadeia via sessao > turma > filial > coach_id |
| **fundamentos_config** | Proprio coach | Auth | Proprio coach | N/A | `coach_id = auth.uid()` |
| **configuracoes** | Proprio coach | Auth | Proprio coach | N/A | `coach_id = auth.uid()` |

**Recomendacoes para o Data Architect:**
- Usar `(SELECT auth.uid())` wrappado em subquery nas policies (padrao cross-project validado)
- Considerar RPC `SECURITY DEFINER` para operacoes complexas (ex: deletar filial com verificacao de turmas ativas) em vez de policy UPDATE permissiva
- Toda coluna referenciada em policy deve ter indice (ex: `coach_id`, `filial_id`, `turma_id`)
- Policies devem ser atomicas com a criacao da tabela na mesma migration

### 3.3 Storage (Fotos de Alunos)

- [ ] Bucket `aluno-fotos` com acesso **privado** (nao publico)
- [ ] Policy de storage: apenas coach dono do aluno (via cadeia turma > filial > coach_id) pode upload/download
- [ ] Signed URLs com TTL maximo de 3600 segundos (1 hora)
- [ ] Validacao de MIME type: apenas `image/jpeg`, `image/png`, `image/webp`
- [ ] Limite de tamanho: max 5MB por arquivo
- [ ] Path de storage isolado por coach: `{coach_id}/{aluno_id}/{filename}`
- [ ] Nunca servir fotos de menores via URL publica

### 3.4 Input Validation

- [ ] Validacao com zod em toda boundary (formularios de filial, turma, aluno, partida, avaliacao)
- [ ] Validacao server-side obrigatoria -- client-side e UX, server-side e seguranca
- [ ] Campos numericos (idade, altura, notas de fundamento, sets de partida) com range validation
- [ ] Nome: max 100 chars, sem caracteres de controle
- [ ] Telefone: formato validado
- [ ] Email: formato validado pelo Supabase Auth

### 3.5 API e Edge Functions

Para o MVP, a maioria das operacoes usa o Supabase client diretamente (queries parametrizadas nativas). Edge Functions podem ser necessarias para:

- [ ] Operacoes que exigem `service_role_key` (ex: admin tasks futuras)
- [ ] Se Edge Functions forem usadas: JWT validado no inicio de cada funcao
- [ ] Secrets de Edge Functions via `supabase secrets set` -- nunca hardcoded
- [ ] CORS restrito por funcao (nunca `Access-Control-Allow-Origin: *` em producao)
- [ ] Erros genericos para o client, detalhes apenas nos logs

### 3.6 Seguranca do Client (Vite + React)

- [ ] `SUPABASE_SERVICE_ROLE_KEY` **nunca** com prefixo `VITE_` (seria exposta no bundle)
- [ ] Apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no client
- [ ] `.env` e `.env.local` no `.gitignore`
- [ ] `.env.example` com placeholders, sem valores reais
- [ ] Source maps desabilitados em producao: `build.sourcemap: false` em `vite.config.ts`
- [ ] Nao usar `dangerouslySetInnerHTML` (React faz output encoding por padrao com JSX)
- [ ] Logica de negocio (calculo de times, validacao de resultado) revalidada no server se critica

### 3.7 HTTP Security Headers

> **Nota para o Architect:** Em projetos Vite, headers de seguranca sao configurados no servidor de deploy (Nginx, vercel.json, Cloudflare Rules), nao no codigo da aplicacao. Documentar a configuracao recomendada para o ambiente de deploy escolhido.

| Header | Valor Recomendado | Prioridade |
|--------|------------------|-----------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | **Alta** |
| `Content-Security-Policy` | Ver diretivas abaixo | **Alta** |
| `X-Content-Type-Options` | `nosniff` | **Alta** |
| `X-Frame-Options` | `DENY` | **Media** |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | **Media** |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | **Baixa** |

**CSP minimo para Vite + Supabase:**

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
connect-src 'self' https://alqagnftooeuzscomyku.supabase.co wss://alqagnftooeuzscomyku.supabase.co;
img-src 'self' data: https:;
font-src 'self' https://fonts.gstatic.com;
frame-ancestors 'none';
```

> `connect-src` inclui o dominio Supabase do projeto para chamadas Auth e banco. `style-src 'unsafe-inline'` necessario para Tailwind CSS em dev; em producao, avaliar uso de nonce se viavel.

---

## 4. Recomendacoes por Agente

### Para o System Architect

1. **Middleware de auth**: garantir que todas as rotas protegidas verificam sessao antes de renderizar. Redirect para login se nao autenticado.
2. **Error handling**: erros genericos para o usuario, detalhes no console/log. Nunca expor stack trace em producao.
3. **Variaves de ambiente**: documentar no CLAUDE.md do projeto quais variaveis sao client-safe (`VITE_*`) e quais sao server-only.
4. **Deploy headers**: documentar onde configurar headers de seguranca para o ambiente de deploy escolhido.
5. **Source maps**: desabilitar em producao no `vite.config.ts`.

### Para o Data Architect

1. **RLS obrigatorio**: habilitar na mesma migration que cria cada tabela. Sem excecoes.
2. **Cadeia de ownership**: modelar a relacao `coach > filial > turma > aluno` de forma que RLS policies possam fazer a verificacao de ownership em cadeia, preferencialmente com uma helper function (`is_coach_owner(turma_id)` SECURITY DEFINER).
3. **Wrapper `(SELECT auth.uid())`**: usar em todas as policies para evitar problemas de otimizacao do Postgres.
4. **Indices**: toda coluna usada em policies RLS deve ter indice (coach_id, filial_id, turma_id).
5. **Storage policies**: configurar bucket privado `aluno-fotos` com policies RLS na mesma migration.
6. **Soft delete para filiais com turmas ativas**: a UI impede delete de filiais com turmas ativas; o banco deve reforcar essa regra (trigger ou check constraint + flag `archived`).
7. **Considerar audit trail basico**: tabela `audit_log` para acoes destrutivas (DELETE de filial/turma/aluno) -- opcional para MVP, recomendado para v2.

### Para o Backlog Agent

1. Incluir task de configuracao de rate limiting no Supabase Dashboard (Auth > Rate Limits) na Sprint 1 (setup).
2. Incluir task de configuracao de email confirmation no Supabase Dashboard.
3. Incluir task de configuracao de headers de seguranca no ambiente de deploy.
4. Incluir task de criacao do `.env.example` com placeholders.

---

## 5. Riscos Aceitos para o MVP

| Risco | Justificativa | Acao Futura |
|-------|--------------|-------------|
| Sem audit log | MVP coach-facing, sem necessidade regulatoria | Implementar em v2 para acoes destrutivas |
| Sem MFA | Risco proporcional ao tipo de dados (stats esportivas, nao financeiras) | Avaliar se base de usuarios crescer |
| Sem captcha no signup | Volume esperado baixo, rate limiting do Supabase suficiente | Adicionar se houver abuso |
| Sem RBAC (unico perfil: coach) | MVP com papel unico | Implementar se surgir perfil "admin" ou "pai/responsavel" |
| Compartilhamento de imagem com nomes de menores | Nomes + stats sao informacao publica no contexto esportivo; imagem gerada client-side sem dados sensiveis adicionais | Avaliar consentimento parental se exigido por regulacao |

---

## 6. Checklist Resumo (para validacao no Security Audit pos-codigo)

- [ ] RLS habilitado em **todas** as tabelas
- [ ] Todas as policies usam `(SELECT auth.uid())` com wrapper
- [ ] Indices em colunas referenciadas por policies
- [ ] Bucket de fotos **privado** com signed URLs
- [ ] `SERVICE_ROLE_KEY` nunca no client (nunca com prefixo `VITE_`)
- [ ] `.env` no `.gitignore`, `.env.example` sem valores reais
- [ ] Source maps desabilitados em producao
- [ ] Rate limiting configurado no Supabase Dashboard
- [ ] Email confirmation habilitado
- [ ] Mensagens genericas em login/signup (sem leak de email)
- [ ] `auth.getUser()` em verificacoes server-side (nunca `getSession()`)
- [ ] Headers de seguranca configurados no deploy
- [ ] Input validation com zod em boundaries
