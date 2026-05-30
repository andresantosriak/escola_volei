# ADR-001: Escolha de Stack — Vite + React 18 + TypeScript

## Status: Accepted

## Contexto

O Esporte Recreacao e um app mobile-first para treinadores de volei. Precisa ser rapido, funcionar bem em telas 390x844, e nao tem requisito de SEO (app privado, atras de login). O desenvolvedor tem experiencia consolidada com React + Vite + Supabase e quer manter consistencia com outros projetos.

## Decisao

Usar **Vite + React 18 + TypeScript strict** como framework principal, com:

- Tailwind CSS v4 + shadcn/ui para estilizacao
- TanStack React Query para data fetching
- React Router DOM v6 para routing
- React Hook Form + Zod para formularios
- Supabase como backend (Auth + Database + Storage)

## Alternativas descartadas

- **Next.js (App Router):** SSR desnecessario — o app e privado (login obrigatorio), nao precisa de SEO. Server Components adicionam complexidade sem beneficio real. O overhead de um meta-framework nao se justifica para um SPA simples.
- **React Native / Expo:** Apesar de ser mobile-first, o app sera acessado via browser no celular (PWA futuramente). Nao precisa de acesso a APIs nativas (camera, push notifications) no MVP. Capacitor seria opcao futura se necessario.
- **Remix:** Similar ao Next.js — SSR-first sem necessidade. Stack menos familiar ao desenvolvedor.

## Consequencias

**Positivas:**
- Build rapido (Vite HMR)
- SPA simples, sem complexidade de SSR
- Type-safety de ponta a ponta com TypeScript strict
- Consistencia com outros projetos do desenvolvedor
- Deploy simples (qualquer host estatico)

**Negativas:**
- Sem SSR — nao serve se no futuro precisar de paginas publicas com SEO (improvavel para este produto)
- Client-side rendering pode ser mais lento no first paint — mitigado pelo design mobile-first otimizado
