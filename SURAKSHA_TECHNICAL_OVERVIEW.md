# Suraksha Technical Overview

## Project Summary
Suraksha is a demo insurance platform for delivery workers. It simulates:
- delivery-specific parametric coverage
- ML-based fraud assessment
- instant payout simulation through mock payment rails
- worker and insurer dashboards
- disruption and claim automation

This repository is a monorepo with two workspaces:
- `client/` — React + Vite frontend
- `server/` — Express backend with MongoDB persistence and ML fraud logic

## Goals & Phase 3 Deliverables
This project is designed to support Phase 3 (Scale & Optimize):
- **Advanced Fraud Detection**: detect GPS spoofing and fake weather claims
- **Instant Payout System (Simulated)**: mock payment rails like UPI, Razorpay, Stripe
- **Intelligent Dashboard**:
  - worker views for income protection and active coverage
  - insurer/admin analytics for loss ratio and predictive insights
- **Final Submission Package**: demo walkthrough, pitch deck, final product demo

## High-level Architecture

### Client
- `client/src/App.jsx` is the main React shell
- Reusable components include `AuthPanel`, `OverviewPanel`, `PolicyStudio`, `ScenarioLab`, `ClaimsBoard`, `AdminConsole`, `SubmissionKit`
- `Vite` serves the frontend in development and produces static assets for production

### Server
- `server/src/server.js` boots the Express server, initialises repositories, and ensures demo accounts
- `server/src/app.js` mounts API routes and serves the built frontend from `client/dist`
- Database connectivity is managed by `server/src/config/db.js`
- Environment configuration lives in `server/src/config/env.js`

### API
The server exposes the following base routes:
- `/api/auth`
- `/api/claims`
- `/api/dashboard`
- `/api/demo`
- `/api/policies`
- `/api/triggers`

## How to Run Locally

### Prerequisites
- Node.js installed
- npm installed
- MongoDB available if using non-demo persistence mode

### Install dependencies
```bash
npm install
npm install --workspace client
npm install --workspace server
```

### Development mode
```bash
npm run dev
```
This runs both the server and client concurrently.

### Server only
```bash
npm run dev --workspace server
```

### Client only
```bash
npm run dev --workspace client
```

### Production build
```bash
npm run build
```

### Start server
```bash
npm run start --workspace server
```

### Seed demo data
```bash
npm run seed --workspace server
```

## Server Environment Configuration
The server uses `.env` values if present. Defaults are:
- `PORT=4000`
- `PERSISTENCE_MODE=demo`
- `MONGO_URI=mongodb://127.0.0.1:27017/suraksha`
- `JWT_SECRET=suraksha-dev-secret`
- `CLIENT_URL=http://localhost:5173`
- `ENABLE_BACKGROUND_JOBS=true`

## ML Model & Fraud Logic

### Where the ML model lives
- `server/src/services/ml.service.js`
- `server/src/services/fraud.service.js`

### Model type
The project uses a centroid-based anomaly classifier:
- `trainCentroidClassifier(samples)` builds centroids for each label
- `predictWithCentroids(model, features)` normalizes features and computes Euclidean distances to centroids
- the closest centroid wins
- `certainty` is derived from the distance gap to the second closest centroid

### Training data
Training does not use an external dataset. It is synthetic and hard-coded in `server/src/services/fraud.service.js`.
The samples are split into:
- `legit` examples
- `fraud` examples

Each sample includes feature vectors such as:
- `gpsDriftKm`
- `routeDeviationScore`
- `staticMinutes`
- `rainMismatchMm`
- `claimFrequency`
- `deviceRisk`
- `clusterScore`
- `routeSpeedKph`

### Fraud evaluation pipeline
The core fraud evaluation is performed in `server/src/services/fraud.service.js`:
1. Build telemetry profile from the user and fraud preset
2. Build weather baseline using `buildWeatherBaseline()`
3. Create a normalized feature vector from telemetry and weather data
4. Predict with centroid classifier
5. Compute fraud probability and score
6. Determine claim status (`FLAGGED` or `APPROVED`)
7. Build reason messages for each anomaly signature

The evaluation returns:
- `score`
- `status`
- `confidence`
- `reasons`
- `modelVersion` (`centroid-anomaly-v2`)
- `features`
- `historicalContext`

### Claim automation & instant payout simulation
The claim workflow is in `server/src/services/claim-automation.service.js`:
- mock disruption snapshots come from scenario definitions and signal simulation
- candidate triggers are generated for heavy rain, flooding, heat, air pollution, curfew
- each trigger candidate is evaluated for severity
- `evaluateFraud()` is run for the candidate event
- if approved, a payout is simulated to the selected gateway rail
- a payout reference is generated like `UPI-XXXXXXX`

## Data flow and key files

### Demo account bootstrapping
- `server/src/services/demo.service.js` ensures worker/admin demo accounts
- worker demo user is seeded with telemetry profile and active policy
- the app can use `Demo` buttons in the UI to load these profiles

### Policy and premium logic
- `server/src/services/risk.service.js` builds coverage quotes and signal snapshots
- policy objects include:
  - `coverageAmount`
  - `coverageHours`
  - `payoutGatewayId`
  - trigger thresholds

### Fraud presets and simulation controls
- `server/src/data/fraud-presets.js` contains preset fraud profiles
- `client/src/components/ScenarioLab.jsx` allows user choice of fraud preset and payment gateway

## What is not real/what is simulated
- Payment rails are simulated, not integrated with live Razorpay or Stripe
- Weather/disruption data is synthetic/mock, not live external feeds
- The fraud model is simple synthetic centroid-based logic, not a production ML model trained on real production data

## Frontend capabilities
The UI supports:
- auth/register/login
- demo user load
- worker dashboard with coverage and fraud watch
- policy studio and quote refresh
- scenario lab with trigger simulation
- claim board with payout and fraud evidence
- admin console with predictive loss ratio and risk spread

## Recommended review points
If you need to inspect or explain the system, focus on:
- `server/src/services/fraud.service.js` for how ML and fraud scoring is wired
- `server/src/services/ml.service.js` for the centroid classifier logic
- `server/src/services/claim-automation.service.js` for how claims are created and payouts simulated
- `server/src/services/demo.service.js` for seeded demo users and policy setup
- `client/src/App.jsx` and `client/src/components/*` for user-facing dashboards and scenario controls

## Running the project for a demo
1. Install dependencies
2. Start the backend and frontend together with `npm run dev`
3. Open the frontend at the Vite URL (usually `http://localhost:5173`)
4. Use the demo buttons to load a worker or admin persona
5. Trigger a fake disruption and observe:
   - claim creation
   - fraud assessment
   - payout simulation
   - dashboard changes

## Notes for submission
This overview covers:
- technical architecture
- runtime commands
- ML model design
- fraud evaluation pipeline
- instant payout simulation
- demo data flow


