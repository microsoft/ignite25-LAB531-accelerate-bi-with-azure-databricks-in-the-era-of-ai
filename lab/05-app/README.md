# Wanderbricks Booking App

Interactive web application for browsing and booking vacation rentals from the Wanderbricks platform.

## Architecture

- **Backend**: FastAPI application with Databricks SQL Warehouse integration
- **Frontend**: React + TypeScript with Vite
- **Authentication**: On-Behalf-Of (OBO) - app executes queries with logged-in user's permissions
- **Deployment**: Databricks Apps

## Project Structure

```
05-app/
├── backend/              # FastAPI backend (deployed to Databricks)
│   ├── app/             # Application code
│   │   ├── core/        # Configuration
│   │   ├── database/    # Database connection
│   │   ├── models/      # Data models
│   │   └── routers/     # API endpoints
│   ├── genie/           # AI Assistant integration
│   ├── sql/             # SQL queries
│   ├── static/          # Built frontend files (served by FastAPI)
│   ├── app.yaml         # Databricks Apps config
│   ├── main.py          # FastAPI app entry point
│   └── requirements.txt # Python dependencies
├── frontend/            # React frontend (for development only)
│   ├── src/             # Source code
│   │   ├── components/  # React components
│   │   ├── services/    # API clients
│   │   └── types/       # TypeScript types
│   ├── package.json     # Node dependencies
│   └── vite.config.ts   # Build configuration
├── start-dev.sh         # Local development script
└── .env.example         # Environment variables template
```

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 18+
- Databricks workspace access
- SQL Warehouse access

### Setup

1. **Configure environment variables:**
   ```bash
   cp .env.example backend/.env
   # Edit backend/.env with your credentials
   ```

2. **Start development server:**
   ```bash
   ./start-dev.sh
   ```

   This will:
   - Create virtual environment
   - Install Python dependencies
   - Start FastAPI server on http://localhost:8000

3. **Build frontend (when making UI changes):**
   ```bash
   cd frontend
   npm install
   npm run build
   cp -r dist/* ../backend/static/
   ```

## Deployment to Databricks

### Deploy Backend Only

```bash
# From repository root
databricks bundle deploy
```

### Deploy with Frontend Changes

```bash
# From repository root
databricks bundle deploy --target dev
databricks bundle run -t dev wanderbricks_booking_app
```

This will:
1. Deploy the app using pre-built frontend from `backend/static/`
2. Start the app on Databricks

## Making Changes

### Backend Changes

1. Edit files in `backend/app/`
2. Test locally: `./start-dev.sh`
3. Deploy: `databricks bundle deploy`

### Frontend Changes

1. Edit files in `frontend/src/`
2. Build: `cd frontend && npm run build`
3. Copy: `cp -r dist/* ../backend/static/`
4. Deploy from repo root:
```bash
databricks bundle deploy --target dev
databricks bundle run -t dev wanderbricks_booking_app
```

### Configuration Changes

- **Bundle config**: Edit `databricks.yml` (at repository root)
- **App config**: Edit `backend/app.yaml`
- **Resource definition**: Edit `resources/wanderbricks_booking_app.app.yml`

## Key Features

- **Browse Properties**: Search vacation rentals by destination
- **AI Assistant**: Natural language search using Databricks Genie
- **Dashboard Analytics**: View business metrics and insights
- **User Authentication**: On-Behalf-Of authentication for secure data access
- **Row-Level Security**: Unity Catalog automatically enforces data permissions

## Environment Variables

Required for local development (in `backend/.env`):

- `DATABRICKS_SERVER_HOSTNAME`: Your workspace hostname
- `DATABRICKS_WAREHOUSE_ID`: SQL Warehouse ID
- `DATABRICKS_ACCESS_TOKEN`: Personal Access Token (local dev only)
- `DATABRICKS_CATALOG`: Data catalog (default: samples)
- `DATABRICKS_SCHEMA`: Schema name (default: wanderbricks)

For Databricks Apps deployment, these are configured via bundle variables in `databricks.yml`.

## Troubleshooting

### Port 8000 already in use
```bash
lsof -ti:8000 | xargs kill -9
./start-dev.sh
```

### Frontend not loading
1. Check if `backend/static/` contains built files
2. Rebuild: `cd frontend && npm run build && cp -r dist/* ../backend/static/`

### Bundle validation errors
```bash
databricks bundle validate
# Check output for configuration issues
```

## Additional Resources

- [Databricks Apps Documentation](https://docs.databricks.com/en/dev-tools/databricks-apps/)
- [Databricks Asset Bundles](https://docs.databricks.com/dev-tools/bundles/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
