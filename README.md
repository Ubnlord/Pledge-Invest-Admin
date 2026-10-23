# Pledge Invest Admin

Dedicated administrator frontend for Pledge-Invest. This repository intentionally contains only the admin interface; investor-facing pages stay in `Ubnlord/Pledge-Invest`.

## Included
- Administrator sign-in and server-side admin-code verification flow
- Overview, investor management, deposits, profit controls, investments, withdrawals, transactions, referrals, notifications, documents, support, settings, and audit log sections
- Responsive React + TypeScript + Vite + Tailwind interface

## Important integration requirement
The admin panel was ported from the current Pledge-Invest interface and calls the existing `/api/admin/*` and `/api/public/*` endpoints through `@appdeploy/client`. For real operation, this frontend must be deployed/configured to use the **same authenticated Pledge-Invest backend and identity provider** as the main website. A separate deployment with a separate backend/database will not automatically share investors, sessions, balances, or admin permissions.

Before using financial controls in production, verify the hosting platform's SDK resolution, shared-backend routing, administrator allowlist, `PLEDGE_ADMIN_AUTH_CODE` secret, and server-side authorization. Never put the admin code or service credentials in frontend environment variables. Test deposit approvals, withdrawals, ledger updates, and audit logs in a non-production environment first.

## Development

Install dependencies, then run `npm run dev`. The hosting environment must provide the `@appdeploy/client` package and the correct connection to the existing backend. `npm run build` should be run in that same configured environment before deployment.
