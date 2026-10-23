# Pledge Invest Admin

Dedicated administrator frontend for Pledge-Invest. Investor-facing pages stay in `Ubnlord/Pledge-Invest`.

## Stack
- React + TypeScript + Vite + Tailwind
- Supabase Auth via `@supabase/supabase-js`
- Shared Supabase Edge Function API: `/functions/v1/pledge-api`

## Shared project
The admin frontend uses the same Supabase project as the investor website:
`xypcqtqmekrjgytivmsm`.

## Required configuration
1. Enable and configure the intended Supabase Auth provider(s) and allowed redirect URLs.
2. Set the Edge Function secret `PLEDGE_ADMIN_AUTH_CODE` to a strong private code. Never put it in frontend code or a Vite environment variable.
3. Confirm `pledge-api` is deployed and the admin email allowlist in the function matches the intended administrator.
4. Import and reconcile existing legacy investor records before enabling real financial operations.

## Development
Install dependencies, then run `npm run dev`. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if using a different Supabase project. The public defaults point to the shared Pledge-Invest project.
