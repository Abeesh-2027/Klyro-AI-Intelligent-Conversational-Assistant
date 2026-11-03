Klyro AI
========

An AI chat assistant with Google sign-in, saved conversations, file questions (upload a document and ask about it), voice input, read-aloud replies and personal preferences.

Stack: React (Vite) + FastAPI + Groq + MongoDB + Supabase Auth.

What it does
------------

- Sign in with Google (Supabase). Every API call carries your login token and the backend checks it.
- Chats are saved in MongoDB. The last 20 messages are sent to the model, so it remembers the conversation.
- Attach a .txt, .md, .csv, .json or .pdf (up to 2 MB). The backend splits it into pieces and gives the model the pieces that best match your question.
- Click the mic to speak your message. Click the speaker on a reply to hear it.
- Account menu, then Personalize: tell Klyro how you like answers. Your name and preferences are used in every reply.
- Admin only route: GET /api/admin/stats (counts only, no chat content).

Folders
-------

    backend/    FastAPI app (app/), tests, Dockerfile
    frontend/   React app (src/), Dockerfile, nginx.conf, vercel.json
    scripts/    audit.sh and scan-secrets.sh
    docker-compose.yml, render.yaml

Step 1. Create your accounts and keys
-------------------------------------

1. Supabase: create a project. Copy the Project URL and the anon public key (Project Settings, API). The anon key is meant to be public. Never use the service_role key in this project.
2. Google login: in Google Cloud Console create an OAuth client (type Web). Add this authorized redirect URI: https://YOUR-PROJECT.supabase.co/auth/v1/callback. In Supabase go to Authentication, Providers, Google, switch it on and paste the client ID and secret.
3. Supabase, Authentication, URL Configuration: set Site URL to your site and add http://localhost:5173, http://localhost:3000 and your production URL to Redirect URLs.
4. Groq: create an API key at console.groq.com. It only ever goes in the backend environment.
5. MongoDB Atlas (or use the Docker MongoDB below): create a free cluster and a database user with the readWrite role on the klyro database only. Limit Network Access to your server if you can.

Step 2. Run it on your computer
-------------------------------

Backend (Python 3.12 or newer):

    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env
    uvicorn app.main:app --reload

Fill in backend/.env first. The app stops at start-up and names any variable that is missing or wrong.

Frontend (Node 20.19 or newer):

    cd frontend
    cp .env.example .env
    npm install
    npm run dev

Open http://localhost:5173. Commit the package-lock.json that npm install creates.

Run it with Docker
------------------

    cp .env.example .env
    docker compose up --build

Fill in the root .env first (use letters and numbers only in MONGO_PASSWORD). Open http://localhost:3000. MongoDB is only reachable from the other containers, not from your computer or the internet.

Deploy
------

Backend on Render:

1. Push this folder to GitHub. In Render choose New, Blueprint, and pick the repo. It reads render.yaml.
2. Fill in the secret values when asked: GROQ_API_KEY, MONGODB_URI, SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAILS.
3. Set CORS_ORIGINS to your Vercel address, for example https://your-app.vercel.app. No trailing slash and no star.

Frontend on Vercel:

1. Import the same repo. Set Root Directory to frontend.
2. Add environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL (your Render address).
3. Deploy, then add the Vercel address to the Supabase Redirect URLs.

The security headers in frontend/vercel.json and frontend/nginx.conf allow connections to *.supabase.co and *.onrender.com. If you use a custom API domain, add it to connect-src in both files.

Environment variables
---------------------

Backend (backend/.env or the Render dashboard):

| Name | Meaning |
| --- | --- |
| APP_ENV | production (default) or development. Development turns on /docs. |
| GROQ_API_KEY | Your Groq key. Required. |
| GROQ_MODEL | Model id, default openai/gpt-oss-120b. |
| MONGODB_URI | MongoDB connection string. Required. |
| MONGODB_DB | Database name, default klyro. |
| SUPABASE_URL | Supabase project URL. Required. |
| SUPABASE_ANON_KEY | Supabase anon key. Required. |
| CORS_ORIGINS | Comma separated site addresses allowed to call the API. |
| ADMIN_EMAILS | Comma separated emails allowed to use admin routes. |

Frontend (frontend/.env or the Vercel dashboard): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL. Everything starting with VITE_ is visible in the browser, so only put public values there.

API
---

All routes except /api/health need the header Authorization: Bearer YOUR_TOKEN.

| Route | What it does |
| --- | --- |
| GET /api/health | Is the server up |
| GET /api/me | Who am I, and which model is used |
| GET, PUT /api/me/profile | Read or save personal preferences |
| GET, POST /api/chats | List chats, create a chat |
| GET, PATCH, DELETE /api/chats/{id} | Open, rename or pin, delete a chat |
| POST /api/chats/{id}/messages | Send a message, get the AI reply |
| POST /api/chats/{id}/files | Upload a file to ask questions about |
| GET /api/admin/stats | Admins only |

Tests and security checks
-------------------------

    cd backend
    pip install -r requirements-dev.txt
    pytest

    sh scripts/audit.sh

audit.sh runs pip-audit, bandit, npm audit and a secret scan (including git history once the project is a git repository). Read SECURITY.md for what was hardened and what to watch.

Keeping packages up to date
---------------------------

    cd backend && pip install -U -r requirements.txt && pip-audit -r requirements.txt
    cd frontend && npm update && npm audit
