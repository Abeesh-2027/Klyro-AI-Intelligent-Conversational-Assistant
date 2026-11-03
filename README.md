# Klyro AI – Intelligent AI Chat Assistant

**Your AI Companion. Smarter Conversations. Simplified Productivity.**

Klyro AI is a full-stack, AI-powered chat application designed to provide users with an intelligent, personalized, and seamless conversational experience. It combines modern authentication, persistent conversation history, document-based question answering, and voice interaction in a single, user-friendly platform.

Powered by **Groq AI**, Klyro AI delivers fast and context-aware responses while allowing users to upload documents, ask questions about their content, and personalize how the assistant communicates.

The application uses Supabase Authentication for secure Google sign-in, MongoDB for persistent conversation storage, and FastAPI to handle backend operations and AI integration.

---

## 1. Project Overview

Klyro AI is designed to make interacting with artificial intelligence simple, accessible, and personalized.

Unlike a basic chatbot, the application provides a persistent conversational environment where users can sign in, manage previous conversations, upload documents for contextual analysis, and interact with the assistant through voice input and audio responses.

The application maintains conversational context by sending the most recent 20 messages to the AI model, enabling more relevant and continuous interactions.

Its document question-answering functionality processes uploaded files, divides their content into smaller sections, and retrieves the most relevant sections based on the user's question.

Klyro AI also supports personalized response preferences, allowing users to configure how the assistant addresses them and structures its responses.

The platform combines AI-powered conversations, document understanding, voice interaction, and secure user authentication into one integrated application.

## 2. Key Features

### 2.1 Secure Authentication

- Google authentication using Supabase Auth.
- Secure user sign-in and session management.
- Backend authentication through Supabase access tokens.
- Every protected API request includes a valid Bearer token.
- Backend verification ensures that API requests are associated with authenticated users.

### 2.2 AI-Powered Conversations

- Interactive AI chat interface.
- Fast AI responses powered by Groq.
- Context-aware conversations using recent chat history.
- Maintains the last 20 messages as conversational context.
- Supports continuous conversations and follow-up questions.
- Saves conversations in MongoDB for future access.

### 2.3 Conversation Management

- Automatically saves chat conversations.
- Retrieve previously saved conversations.
- Create new conversations.
- Rename existing conversations.
- Pin important conversations.
- Delete unwanted conversations.
- Maintain conversation history across sessions.

### 2.4 Document-Based Question Answering

Klyro AI allows users to upload documents and ask questions directly about their contents.

**Supported file formats:**
- `.txt` – Plain text documents.
- `.md` – Markdown documents.
- `.csv` – Comma-separated data files.
- `.json` – Structured JSON documents.
- `.pdf` – PDF documents.

**Document processing capabilities:**
- Supports file uploads up to 2 MB.
- Extracts text from uploaded documents.
- Divides document content into smaller chunks.
- Identifies relevant content based on the user's question.
- Provides the most relevant document sections to the AI model.
- Generates answers using the uploaded document as contextual information.

This approach allows users to interact with their documents without manually searching through the entire content.

### 2.5 Voice Interaction

- Voice input through the microphone.
- Converts spoken input into text.
- Read-aloud functionality for AI-generated responses.
- Speaker controls to play responses.
- Provides an alternative to traditional text-based interaction.

### 2.6 Personalization

Klyro AI allows users to customize their assistant experience through personal preferences.

Users can access the **Personalize** section from the account menu to configure:

- Preferred name.
- Response style and preferences.
- Personalized communication instructions.

The saved preferences are included in AI requests to provide responses that better match the user's preferred communication style.

### 2.7 Admin Dashboard API

The application includes a restricted administrative endpoint for monitoring basic application statistics.

- Admin-only access.
- Provides application statistics and usage counts.
- Does not expose conversation content.
- Access is restricted using configured administrator email addresses.

**Endpoint:** `GET /api/admin/stats`

---

## 3. Technology Stack

Klyro AI follows a modern full-stack architecture using React for the frontend, FastAPI for backend services, MongoDB for data persistence, and Groq for AI-powered conversations.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Building the user interface |
| Build Tool | Vite | Frontend development and build |
| Backend | Python, FastAPI | REST API and business logic |
| AI Integration | Groq API | AI-powered conversations |
| Default AI Model | `openai/gpt-oss-120b` | Generating AI responses |
| Database | MongoDB | Persistent conversation storage |
| Authentication | Supabase Auth | Secure user authentication |
| OAuth Provider | Google | Google sign-in |
| File Processing | Python | Document extraction and processing |
| Deployment | Vercel | Frontend hosting |
| Backend Hosting | Render | Backend deployment |
| Containerization | Docker | Application containerization |
| Testing | Pytest | Backend automated testing |

---

## 4. System Architecture

Klyro AI follows a client-server architecture that separates the frontend, backend, authentication, database, and AI processing responsibilities.

### 4.1 Frontend Layer

The frontend is developed using React and Vite.

**Responsibilities:**
- Provides the user interface and navigation.
- Handles Google authentication through Supabase.
- Manages chat conversations and application state.
- Displays AI-generated responses.
- Supports document uploads.
- Provides voice input and read-aloud functionality.
- Manages user preferences and account settings.
- Communicates with the backend through authenticated API requests.

### 4.2 Backend Layer

The backend is developed using Python and FastAPI.

**Responsibilities:**
- Exposes REST API endpoints.
- Validates Supabase authentication tokens.
- Handles conversation creation and management.
- Processes incoming user messages.
- Integrates with the Groq API.
- Maintains conversational context.
- Handles document uploads and text extraction.
- Performs document chunking and relevant content retrieval.
- Manages user preferences.
- Restricts administrative endpoints to authorized users.

### 4.3 Database Layer

MongoDB is used for persistent storage.

**Responsibilities:**
- Stores user conversations.
- Maintains message history.
- Stores conversation metadata.
- Supports conversation retrieval and management.
- Persists user-specific application data.

The database allows users to access their saved conversations across sessions.

### 4.4 Authentication Layer

Supabase Auth provides authentication and session management.

**Authentication workflow:**

1. The user selects Google sign-in.
2. Supabase initiates the Google OAuth authentication process.
3. Google verifies the user's identity.
4. Supabase creates an authenticated session.
5. The frontend obtains the Supabase access token.
6. The token is included in backend API requests.
7. FastAPI verifies the token before processing protected requests.

This ensures that protected API operations are performed only by authenticated users.

### 4.5 AI Integration Layer

Groq API provides the intelligence behind Klyro AI.

The backend sends user messages, relevant conversation history, personalization preferences, and relevant document content to the configured AI model.

**Conversation workflow:**

1. The user submits a message.
2. The frontend sends the request to FastAPI with an authentication token.
3. The backend validates the user's session.
4. The backend retrieves the relevant conversation history.
5. The latest 20 messages are prepared as conversational context.
6. Relevant personalization instructions are included.
7. The request is sent to the configured Groq model.
8. The AI generates a response.
9. The conversation and response are saved in MongoDB.
10. The response is returned to the frontend.

### 4.6 Document Processing Workflow

Document question answering follows a retrieval-based approach.

1. The user uploads a supported document.
2. The backend validates the file format and size.
3. Text is extracted from the uploaded document.
4. The extracted content is divided into smaller chunks.
5. The user's question is analyzed.
6. The most relevant chunks are selected.
7. Relevant content is provided to the AI model.
8. The model generates an answer based on the supplied context.
9. The response is returned to the user.

This approach reduces unnecessary context and helps the model focus on information relevant to the user's question.

### 4.7 Application Architecture Diagram

```text
                       USER
                         |
                         v
                  REACT FRONTEND
                         |
              +----------+----------+
              |                     |
              v                     v
         SUPABASE AUTH          FASTAPI BACKEND
              |                     |
              v                     v
          GOOGLE OAUTH       TOKEN VALIDATION
                                    |
                                    v
                            REQUEST PROCESSING
                                    |
                 +-----------------+-----------------+
                 |                 |                 |
                 v                 v                 v
             MONGODB          GROQ AI          DOCUMENT
                 |                 |           PROCESSING
                 |                 v                 |
                 |           AI RESPONSE             |
                 |                 |                 |
                 +-----------------+-----------------+
                                   |
                                   v
                           RESPONSE DELIVERY
                                   |
                                   v
                             REACT FRONTEND
                                   |
                                   v
                                  USER
```

---

## 5. Project Folder Structure

```text
Klyro-AI/
│
├── backend/
│   ├── app/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── package.json
│
├── scripts/
│   ├── audit.sh
│   └── scan-secrets.sh
│
├── docker-compose.yml
├── render.yaml
└── README.md
```

### Important Project Components

| Component | Responsibility |
|---|---|
| `backend/app/` | FastAPI application and backend modules |
| `backend/tests/` | Backend automated tests |
| `frontend/src/` | React components, pages, and application logic |
| `scripts/audit.sh` | Runs security and dependency audits |
| `scripts/scan-secrets.sh` | Scans for exposed secrets |
| `docker-compose.yml` | Defines application services for Docker |
| `render.yaml` | Render deployment configuration |
| `frontend/vercel.json` | Vercel deployment and security configuration |
| `frontend/nginx.conf` | Nginx configuration for container deployment |

---

## 6. Installation and Local Development

### Prerequisites

Install the following tools before running the application:

- Python 3.12 or later.
- Node.js 20.19 or later.
- npm.
- Git.
- Docker (optional).
- A Supabase account.
- A Google Cloud account.
- A Groq API key.
- MongoDB Atlas or a local MongoDB instance.

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd Klyro-AI
```

### Step 2: Configure Supabase Authentication

1. Create a project in Supabase.
2. Navigate to Project Settings → API.
3. Copy the Project URL.
4. Copy the anon public key.
5. Never use the `service_role` key in this application.

**Configure Google OAuth:**

1. Open Google Cloud Console.
2. Create an OAuth client with the Web application type.
3. Add the following authorized redirect URI:

```text
https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

4. Copy the Google OAuth Client ID and Client Secret.
5. Open Supabase → Authentication → Providers.
6. Enable Google authentication.
7. Enter the Google OAuth credentials.

**Configure redirect URLs:**

Navigate to Supabase → Authentication → URL Configuration.

Set your Site URL and add the following Redirect URLs:

```text
http://localhost:5173
http://localhost:3000
https://your-production-domain.com
```

### Step 3: Configure Groq API

1. Visit [Groq Console](https://console.groq.com/).
2. Create an account.
3. Generate an API key.
4. Store the key in the backend environment configuration.

The Groq API key must remain exclusively on the backend.

### Step 4: Configure MongoDB

Klyro AI supports MongoDB Atlas or a locally hosted MongoDB instance.

For MongoDB Atlas:

1. Create a MongoDB Atlas account.
2. Create a free database cluster.
3. Create a database user.
4. Assign the `readWrite` role to the `klyro` database.
5. Configure network access.
6. Copy the MongoDB connection string.

Use a restricted database user and limit network access to your application server wherever possible.

### Step 5: Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate the environment.

**Windows:**

```cmd
.venv\Scripts\activate
```

**Linux/macOS:**

```bash
source .venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Create the environment configuration file:

```bash
cp .env.example .env
```

Configure all required backend environment variables before starting the application.

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

### Step 6: Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Create the frontend environment file:

```bash
cp .env.example .env
```

Install the dependencies:

```bash
npm install
```

Commit the generated `package-lock.json` file to the repository.

Start the frontend development server:

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

---

## 7. Running with Docker

Klyro AI also supports Docker-based deployment for a consistent development and execution environment.

Create the root environment configuration file:

```bash
cp .env.example .env
```

Configure the required environment variables.

Start the application:

```bash
docker compose up --build
```

Open the application:

```text
http://localhost:3000
```

**Docker security considerations:**

- MongoDB is accessible only to the other application containers.
- MongoDB is not exposed directly to the host or public internet.
- Sensitive configuration values must be provided through environment variables.
- Use alphanumeric characters for `MONGO_PASSWORD`, as required by the Docker configuration.

---

## 8. Environment Variables

Environment variables are used to configure authentication, database connectivity, AI integration, and application security.

### 8.1 Backend Configuration

File: `backend/.env`

| Variable | Description |
|---|---|
| `APP_ENV` | Application environment: `production` or `development` |
| `GROQ_API_KEY` | API key for Groq AI |
| `GROQ_MODEL` | AI model identifier |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | MongoDB database name |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public anon key |
| `CORS_ORIGINS` | Comma-separated list of permitted frontend origins |
| `ADMIN_EMAILS` | Comma-separated list of authorized administrator emails |

**Default values:**

```env
APP_ENV=production
GROQ_MODEL=openai/gpt-oss-120b
MONGODB_DB=klyro
```

### 8.2 Frontend Configuration

File: `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_API_URL` | Backend API base URL |

**Example:**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_API_URL=http://localhost:8000
```

**Important Security Practices:**

- Never commit `.env` files to GitHub.
- Never expose Groq API keys in frontend code.
- Never use the Supabase `service_role` key in the frontend.
- Only store public configuration values in `VITE_` variables.
- Configure production CORS origins explicitly.
- Restrict administrator access using trusted email addresses.
- Use secure database credentials and restricted network access.

---

## 9. API Documentation

Klyro AI provides REST API endpoints through FastAPI.

All API endpoints except `/api/health` require authentication using the following HTTP header:

```http
Authorization: Bearer YOUR_TOKEN
```

### 9.1 Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend availability |

### 9.2 User Profile and Personalization

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/me` | Retrieve authenticated user information and configured AI model |
| GET | `/api/me/profile` | Retrieve user preferences |
| PUT | `/api/me/profile` | Update user preferences |

### 9.3 Conversation Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chats` | Retrieve saved conversations |
| POST | `/api/chats` | Create a new conversation |
| GET | `/api/chats/{id}` | Retrieve a specific conversation |
| PATCH | `/api/chats/{id}` | Rename or pin a conversation |
| DELETE | `/api/chats/{id}` | Delete a conversation |

### 9.4 AI Messaging

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chats/{id}/messages` | Submit a message and receive an AI response |

### 9.5 Document Upload

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chats/{id}/files` | Upload a document for contextual question answering |

### 9.6 Administrative Statistics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Retrieve administrative statistics |

**Administrative Access:**

The administrative endpoint is restricted to email addresses configured in `ADMIN_EMAILS`.

It provides aggregate counts only and does not expose private conversation content.

---

## 10. Testing and Security Auditing

Klyro AI includes automated backend tests and security auditing scripts to help maintain application reliability and identify potential vulnerabilities.

### 10.1 Backend Testing

Navigate to the backend directory:

```bash
cd backend
```

Install development dependencies:

```bash
pip install -r requirements-dev.txt
```

Run the test suite:

```bash
pytest
```

### 10.2 Security Auditing

From the project root, execute:

```bash
sh scripts/audit.sh
```

The audit script performs the following checks:

- `pip-audit` – Identifies vulnerable Python dependencies.
- `bandit` – Scans Python code for common security issues.
- `npm audit` – Checks frontend dependencies for known vulnerabilities.
- Secret scanning – Identifies potentially exposed credentials and sensitive information.

Once the repository is initialized with Git, the secret scanner also checks Git history.

Refer to `SECURITY.md` for information about implemented security improvements and additional security considerations.

---

## 11. Deployment

Klyro AI uses Render for backend hosting and Vercel for frontend hosting, with MongoDB Atlas providing cloud database storage.

### 11.1 Backend Deployment – Render

1. Push the project repository to GitHub.
2. Sign in to [Render](https://render.com/).
3. Select **New → Blueprint**.
4. Connect the GitHub repository.
5. Allow Render to read the `render.yaml` configuration.
6. Configure the required secret environment variables.

Configure the following backend secrets:

```text
GROQ_API_KEY
MONGODB_URI
SUPABASE_URL
SUPABASE_ANON_KEY
ADMIN_EMAILS
```

Set `CORS_ORIGINS` to your deployed Vercel frontend URL.

Example:

```text
https://your-app.vercel.app
```

Do not include a trailing slash or wildcard origin.

Deploy the backend service.

### 11.2 Frontend Deployment – Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Import the same GitHub repository.
3. Set the Root Directory to `frontend`.
4. Configure the required environment variables.

Add the following:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=your-render-backend-url
```

5. Deploy the frontend application.
6. Copy the deployed Vercel URL.
7. Add the production URL to the Supabase Redirect URLs configuration.

### 11.3 Production Security Configuration

The application includes Content Security Policy and security headers through:

- `frontend/vercel.json`
- `frontend/nginx.conf`

The current configuration permits connections to Supabase and Render domains.

If you use a custom API domain, update the `connect-src` directive in both configuration files to allow the new domain.

---

## 12. Security Considerations

Security is an important part of Klyro AI's architecture.

The application incorporates several measures to protect user data and application resources.

**Authentication and Authorization**
- Supabase-based Google authentication.
- Backend verification of authentication tokens.
- Protected API endpoints.
- Restricted administrative access.

**API Security**
- Explicit CORS origin configuration.
- Request authentication using Bearer tokens.
- Backend-only AI API credentials.
- Input and file validation.

**Database Security**
- Restricted MongoDB database user.
- Database access limited to the application environment.
- No direct public exposure of the Docker MongoDB service.

**Credential Management**
- Environment-based configuration.
- No private API keys in frontend variables.
- Secret scanning through automated security scripts.

**Additional Considerations**

For production use, ensure that database queries enforce authenticated user ownership for every conversation and uploaded document. Authentication alone should not be treated as authorization to access another user's resources.

---

## 13. Future Enhancements

The following features can be considered for future versions of Klyro AI:

1. **Advanced Conversation Memory:** Introduce long-term contextual memory to improve continuity across conversations.

2. **Multimodal AI Support:** Enable image understanding and additional media-based interactions.

3. **Advanced Document Analysis:** Support larger documents, additional file formats, and more sophisticated retrieval techniques.

4. **Conversation Export:** Allow users to export conversations in PDF, Markdown, and text formats.

5. **Improved Voice Interaction:** Introduce real-time voice conversations and more natural text-to-speech capabilities.

6. **Conversation Search:** Implement keyword-based and semantic search across saved conversations.

7. **Advanced Personalization:** Provide more detailed assistant customization and response preferences.

8. **Usage Analytics:** Introduce user-facing statistics and AI usage insights.

9. **Mobile Application:** Develop dedicated Android and iOS applications.

10. **Additional AI Models:** Support multiple AI providers and configurable model selection.

11. **Collaborative Conversations:** Enable shared conversations and collaborative document analysis.

12. **Enhanced Document Retrieval:** Introduce embedding-based semantic search for more accurate document question answering.

---

## 14. License

The project license has not yet been specified.

For an open-source release, the MIT License can be considered. If selected, add a `LICENSE` file containing the standard MIT License text to the root directory of the repository.

---

## Conclusion

Klyro AI brings intelligent conversations, document understanding, voice interaction, and personalized assistance together in a single full-stack application.

By combining React, FastAPI, Groq AI, MongoDB, and Supabase Authentication, the platform delivers a modern and scalable foundation for AI-powered communication.

Its persistent conversation history, document-based question answering, and customizable assistant preferences provide a more practical and personalized experience than a traditional chatbot.

**Klyro AI – Your AI Companion. Smarter Conversations. Simplified Productivity.**
