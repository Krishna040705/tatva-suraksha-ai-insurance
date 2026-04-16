# Suraksha

## Branch Note

- `main`: full React + Express Suraksha app
- `html-demo`: standalone static demo that can be opened directly with `index.html`

Suraksha is a MERN-style parametric insurance platform for gig workers built for Team Tatva's Guidewire DEVTrails 2026 Phase 2 theme: `Automation & Protection`.

The platform now combines:

- Worker onboarding and weekly policy issuance
- Dynamic premium pricing from live disruption exposure
- ML-assisted fraud detection for delivery-specific abuse patterns
- Historical-weather validation for fake weather claims
- Simulated instant payouts through UPI, Razorpay, and Stripe sandbox rails
- Worker and insurer dashboards
- Business viability and social-impact reporting for final judging

## What Changed In This Upgrade

- Reframed the product honestly from vague "AI-powered" marketing to ML-assisted fraud and predictive analytics
- Added anomaly-based fraud scoring in `server/src/services/fraud.service.js`
- Added payout gateway simulation in `server/src/services/payout.service.js`
- Added worker forecasting and insurer analytics in `server/src/services/analytics.service.js`
- Redesigned the frontend with a warmer, delivery-platform visual direction
- Added a Week 6 submission package inside `docs/`

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Persistence: Mongo-ready repositories plus built-in demo persistence
- Auth: JWT
- Deployment behavior: Express serves the built client when `client/dist` exists

## Project Structure

```text
client/   React app
server/   Express API
docs/     Demo, pitch, and submission artefacts
```

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Start both apps for development:

```bash
npm run dev
```

3. Open the product:

```text
http://localhost:5173
```

4. API base:

```text
http://localhost:4000/api
```

## Production Build

Build and verify the client bundle plus server syntax:

```bash
npm run build
```

Then start the API, which will also serve the built frontend from `client/dist`:

```bash
npm start
```

## Demo Personas

Use the UI buttons to load either seeded persona, or log in directly:

- Worker
  - Email: `rider@suraksha.demo`
  - Password: `demo1234`
- Admin
  - Email: `ops@suraksha.demo`
  - Password: `admin1234`

## Week 6 Deliverables Mapping

- Advanced Fraud Detection
  - GPS spoofing, suspicious clusters, device integrity drops, and fake weather claims checked with historical baselines
- Instant Payout System
  - Mock settlement rails for UPI, Razorpay test mode, and Stripe sandbox
- Intelligent Dashboard
  - Worker protection view plus insurer admin console with loss ratio and next-week forecast
- Final Submission Package
  - Demo script, pitch deck source, and submission guide staged in `docs/`

## Docs

- `docs/DEMO_SCRIPT.md`
- `docs/FINAL_PITCH_DECK.md`
- `docs/FINAL_PITCH_DECK.html`
- `docs/FINAL_PITCH_DECK.pdf`
- `docs/FINAL_SUBMISSION_PACKAGE.md`

## Persistence Modes

By default, the app runs in demo mode and stores records in:

- `server/.demo-db.json`

To use MongoDB instead:

```env
PERSISTENCE_MODE=mongo
MONGO_URI=mongodb://127.0.0.1:27017/suraksha
```

## Verification

Validated in this environment with:

- `npm.cmd run check -w server`
- `npm.cmd run build -w client`

## Note On Final Submission

The repo now contains the website, demo flow, pitch content, and export-ready artefacts. The only remaining manual steps are:

- record the final 5-minute screen-capture video
- upload that video to a public link
