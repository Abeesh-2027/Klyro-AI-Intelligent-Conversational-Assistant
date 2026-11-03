Security report
===============

What was checked and changed, in the order you asked.

| Request | Result |
| --- | --- |
| Hide my AI keys | The Groq key and MongoDB address exist only in backend environment variables. The browser gets only the public Supabase anon key. .env files are in .gitignore and .dockerignore. |
| Check my env variables | backend/app/config.py checks every variable at start-up, names any that are missing, and refuses a wildcard in CORS_ORIGINS. |
| Add proper authentication | The old login accepted any name plus any 5 digits and checked it only in the browser, so it protected nothing. It is replaced by Google sign-in through Supabase. The backend verifies the token with Supabase on every request (cached for 60 seconds). |
| Hash passwords properly | There are no passwords any more. Google handles credentials and this project never sees or stores one. Nothing to hash. |
| Check user access | Every chat, file and profile query includes the signed-in user id. Another user gets a plain 404. Chat ids must be 32 hex characters. |
| Protect admin routes | Admin routes need an email in ADMIN_EMAILS and a verified email on the Supabase account. Others get 403. Admin stats return counts only. |
| Sanitize forms | Pydantic models reject unknown fields and enforce length limits. Control characters are stripped. Titles lose angle brackets. File names lose paths and odd characters. The browser also limits length and file type before sending. |
| Protect against XSS | React escapes all text. Assistant markdown is rendered with react-markdown, which does not allow raw HTML. Images are removed and links open with noopener. A strict Content-Security-Policy blocks inline scripts and outside images. Uploaded file text is passed to the model as data with an instruction to ignore commands inside it. |
| Rate limiting | 120 requests a minute per IP for everything, 20 a minute for messages, 10 a minute for uploads. Limits run before the login check, so floods of fake tokens are also limited. |
| Secure API endpoints | All routes need a valid token except /api/health. Request bodies over 3 MB are refused. Uploads are limited to 2 MB, 5 files per chat, and five text types. PDFs are size and page limited. |
| CORS | Only the addresses in CORS_ORIGINS, only the methods used, only the Authorization and Content-Type headers, no cookies. |
| Security headers | API: nosniff, frame deny, no-referrer, HSTS, Permissions-Policy, CSP, no-store. Site: the same plus a Content-Security-Policy in vercel.json and nginx.conf. Microphone is allowed for the site because voice input needs it. |
| Turn off debug mode | debug is off. /docs and /openapi.json exist only when APP_ENV=development. The server runs without reload in Docker and Render. |
| Update dependencies | Minimum versions are set to recent releases. See the note below about verifying. |
| Remove unused packages | Only packages the code imports are listed. Unused imports in the original code were removed. |
| Exposed files | .gitignore and .dockerignore exclude .env, node_modules and caches. nginx denies dot files. No source maps are built. The backend container runs as a non-root user, and under Docker Compose it also has a read-only file system and no extra privileges. |
| Secure my database | MongoDB in Docker needs a username and password and has no published port. All queries use typed values, never raw client input. For Atlas use a readWrite-only user and an IP allowlist. |
| Check git for leaked secrets | Your upload had no .git folder and no keys in the code. The new project scans clean. scripts/scan-secrets.sh also searches git history and tracked .env files once you run git init. |
| Full audit | See below. |

What was run in this session
----------------------------

The sandbox could not reach PyPI or npm, so FastAPI, Vite and the other packages could not be installed here.

Run here and passed:

- 11 unit tests for text cleaning, file reading and file search.
- 25 checks that ran the real route code against an in-memory database with stand-ins for FastAPI, Groq and MongoDB. They covered other users getting 404, uploads, file lookup, history, AI outage, admin guard and the rate limiter.
- 14 browser checks in Chromium on the real React code with a stand-in for Supabase and the API. They covered Google login, loading chats, upload and send, error recovery, personalize, and logout.
- ruff with security (S) and bug (B) rules on the backend, and a secret scan of the project and your upload.

Not run here, please run on your machine:

- docker compose up --build, and a real login, chat and upload against Supabase, Groq and MongoDB.
- npm install, npm run build, npm audit, pip-audit, bandit. The command is: sh scripts/audit.sh.

Dependency versions: lower bounds were chosen from versions known when this was written. Run the update commands in README.md to move to the newest, then commit package-lock.json.

Known limits
------------

- Rate limits are held in memory, so they reset on restart and do not add up across several server copies. Run one instance, or move limits to Redis when you scale.
- The login token is kept in the browser's local storage by Supabase. That is why the Content-Security-Policy is strict. Do not loosen it.
- After logout a token still works on the API for up to 60 seconds because of the verification cache.
- Behind Render the server trusts the forwarded IP header. If you expose the container directly to the internet, remove --forwarded-allow-ips from backend/Dockerfile.
- Chat text is stored unencrypted in MongoDB, apart from the database's own encryption at rest. Atlas encrypts at rest by default.
- The CSP lists *.supabase.co and *.onrender.com. Add your own API domain if you use one.
