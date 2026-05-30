# Deploy & Security Headers — Esporte Recreação

App SPA estático (Vite). Deploy em qualquer host estático. Configs prontas:

- **Vercel:** `vercel.json` (rewrites SPA + headers de segurança)
- **Netlify / Cloudflare Pages:** `public/_headers` + `public/_redirects` (copiados para `dist/` no build)

## Headers aplicados

| Header | Valor | Por quê |
|--------|-------|---------|
| Strict-Transport-Security | max-age 2 anos + preload | força HTTPS |
| X-Content-Type-Options | nosniff | impede MIME sniffing |
| X-Frame-Options | DENY | impede clickjacking |
| Referrer-Policy | strict-origin-when-cross-origin | não vaza URL completa |
| Permissions-Policy | camera/mic/geo desabilitados | reduz superfície |
| Content-Security-Policy | self + Google Fonts + Supabase | restringe origens; `connect-src` libera REST + Realtime (wss) do projeto |

## Variáveis de ambiente (no painel do host)

```
VITE_SUPABASE_URL=https://alqagnftooeuzscomyku.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-jwt>
```

> Apenas `VITE_*` vão para o build do client. `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_ACCESS_TOKEN` NUNCA entram no client — são só para scripts admin locais.

## Checklist pós-deploy no Supabase Dashboard

- [ ] Auth > URL Configuration: definir Site URL e Redirect URLs (produção)
- [ ] Auth > Providers > Email: habilitar confirmação de e-mail
- [ ] Auth > Rate Limits: revisar limites de signup/login
- [ ] Storage: confirmar bucket `student-photos` privado
