# Local setup with Copilot

After cloning, open the repo in VS Code and paste the prompt below into Copilot Chat (agent mode). It installs, configures and runs the app, then creates demo accounts in your local database.

```text
Set up and run this repo locally (Probiz Finance, a Next.js 16 app using the pages router, with its API in server/). Read README.md and AGENTS.md first. Next 16 has breaking changes, so check node_modules/next/dist/docs/ before changing any Next code.

Steps:
1. Check that Node is 20.9 or newer (`node -v`). If it's older, stop and tell me.
2. Run `npm install`. If it fails with certificate or TLS errors (corporate proxy), retry with NODE_OPTIONS=--use-system-ca.
3. Create `.env.local` from `.env.example`. Set JWT_SECRET to the output of `openssl rand -hex 32`. Leave DATABASE_URL and the Supabase keys empty: locally the app uses PGlite in .data/pglite and saves uploads to public/uploads. Leave the WHATSAPP_* keys empty (alerts stay off). Never commit .env.local.
4. Start the dev server in the background with `TRUST_PROXY=1 npm run dev` and wait until http://localhost:3000/api/health returns {"status":"ok"}.
5. Create demo accounts. These are local only, so use these exact values:
   - First admin: POST http://localhost:3000/api/createAdmin with JSON {"admin_Name":"Admin","admin_Email":"admin@probiz.com","password":"Admin@12345"}
   - Sign in: POST /api/staffLogin with {"email":"admin@probiz.com","password":"Admin@12345"} and keep the accessToken.
   - With header "Authorization: Bearer <token>", POST /api/admin/employees four times (without an email, the sign-in email is made from the first name and role):
     {"name":"Neha Gupta","email":"neha@probiz.com","mobile":"9826000001","employeeId":"PBZ-001","persona":"ops_l1","password":"Staff@1234"}
     {"name":"Arjun Mehta","email":"arjun@probiz.com","mobile":"9826000002","employeeId":"PBZ-002","persona":"ops_l1","password":"Staff@1234"}
     {"name":"Rahul Verma","mobile":"9826000003","employeeId":"PBZ-003","persona":"sales","password":"Staff@1234"}
     {"name":"Kavya Iyer","mobile":"9826000004","employeeId":"PBZ-004","persona":"ops_l2","password":"Staff@1234"}
   - Customer: POST /api/userSignUp with {"user_Name":"Priya","user_Email":"priya@example.com","mobile_no":"9876500001","password":"Demo@1234","confirmPassword":"Demo@1234","country_code":"+91"}. If it's rejected, read server/controllers/user.controller.js (userSignUp) and adjust the fields.
6. Verify:
   - `bash scripts/smoke-api.sh`
   - `npm run check:intake` (it needs the server started with TRUST_PROXY=1, as in step 4). All checks should pass. It creates test leads, which is fine locally.
7. Give me a short summary: the URLs (site http://localhost:3000, staff panel http://localhost:3000/admin-panel, sign-in http://localhost:3000/sign-in) and a table of the demo logins you created.

Rules: don't commit or push anything, don't edit tracked files unless a step fails, and if something fails, show the error and fix the root cause instead of skipping the step.
```

## Demo logins (local only)

| Role | Email | Password | Where |
| --- | --- | --- | --- |
| Platform manager (developers) | platformmanager | platformmanager | `/sign-in` → Probiz staff (built in, full admin) |
| Admin | admin@probiz.com | Admin@12345 | `/sign-in` → Probiz staff, or `/admin-panel` |
| Employee, Operations L1 | neha@probiz.com | Staff@1234 | same |
| Employee, Operations L1 | arjun@probiz.com | Staff@1234 | same |
| Employee, Sales executive | rahul.sales@probiz.com | Staff@1234 | same |
| Employee, Operations L2 | kavya.opsl2@probiz.com | Staff@1234 | same |
| Customer | priya@example.com | Demo@1234 | `/sign-in` → Customer |

These accounts exist only in your local `.data/pglite` database. Never create them on a deployed site.
The platform manager isn't stored in the database: it's on by default in local dev and off in production unless `PLATFORM_MANAGER_USERNAME` and `PLATFORM_MANAGER_PASSWORD` are set.
