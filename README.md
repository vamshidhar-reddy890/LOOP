# LOOP

LOOP is a full-stack customer feedback intelligence platform. It brings feedback collection, analysis, collaboration, and reporting into one workspace so teams can turn customer comments into clear product decisions.

**Live demo:** [Open LOOP on Render](https://loop-9uia.onrender.com)

## Features

- User authentication with JWT-based sessions
- Workspace-based feedback management
- Manual feedback capture and CSV import
- Search, filtering, pagination, and feedback deletion
- Dashboard statistics and visualizations
- Sentiment analysis and theme detection
- AI-assisted summaries and executive reports
- PDF report export
- Responsive React interface

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA
- **Database:** H2 for local development; PostgreSQL is supported for deployment
- **Authentication:** JSON Web Tokens (JWT)
- **AI:** OpenAI API, with local fallback analysis when no API key is configured
- **Deployment:** Docker and Render

## Project structure

```text
.
├── frontend/    React and TypeScript client
├── backend/     Spring Boot REST API
├── render.yaml  Render deployment configuration
└── TODO.md      Project build notes
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Java 17 or newer
- Maven 3.9 or newer, unless using the included Docker setup

## Run locally

Start the backend first:

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080` and uses an in-memory H2 database by default.

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

### Frontend environment

The frontend uses `http://localhost:8080/api` by default. To point it at another API, create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080/api
```

Restart Vite after changing environment variables.

### Backend environment

The backend has useful development defaults, but production deployments should set these variables:

| Variable | Required | Description |
| --- | --- | --- |
| `JWT_SECRET` | Yes in production | Long, random secret used to sign authentication tokens |
| `FRONTEND_URL` | Yes in production | Allowed frontend origin, for example `https://your-app.onrender.com` |
| `OPENAI_API_KEY` | Optional | Enables AI-powered sentiment, themes, and summaries |
| `OPENAI_MODEL` | Optional | OpenAI model name; defaults to `gpt-4-mini` |
| `PORT` | Optional | Server port; defaults to `8080` locally |

Without `OPENAI_API_KEY`, standard feedback workflows still work and analysis uses local fallback behavior where supported.

## Build and verify

Build the frontend:

```bash
cd frontend
npm run build
```

Build the backend:

```bash
cd backend
mvn clean package
```

Check the backend health endpoint:

```text
GET http://localhost:8080/api/ai/health
```

## Docker

Build and run the backend container from the repository root:

```bash
docker build -t loop-backend ./backend
docker run --rm -p 8080:8080 loop-backend
```

The container honors `PORT`, `JWT_SECRET`, `FRONTEND_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL`.

## Deploy with Render

The included `render.yaml` defines two services:

1. A Docker-based Spring Boot backend from `backend/`.
2. A static Vite frontend from `frontend/`.

To deploy:

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select the repository.
3. Set the `OPENAI_API_KEY` secret if AI-powered analysis is required.
4. Update `FRONTEND_URL` and `VITE_API_URL` if your Render service names or domains differ from the values in `render.yaml`.

## CSV import

CSV imports should include feedback text in a `content` column. Additional fields supported by the application can be found in the sample files in `backend/`, such as `sample-feedback-import.csv`.

## Contributing

1. Create a feature branch.
2. Make focused changes and add or update tests where appropriate.
3. Run the frontend and backend build commands before opening a pull request.
4. Open a pull request with a clear description of the behavior changed.

## License

No license has been specified yet. Add a license file before distributing LOOP publicly.
