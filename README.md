# Suraksha

## Branch Note

- `main`: full React + Express Suraksha app
- `html-demo`: standalone static demo that can be opened directly with `index.html`

Suraksha is a MERN-style parametric insurance platform for gig workers built for Team Tatva's Guidewire DEVTrails 2026 Phase 2 theme: `Automation & Protection`.

It demonstrates:

- Worker registration
- Insurance policy management
- Dynamic weekly premium calculation
- Automated claims management
- Zero-touch payout simulation
- Five disruption triggers: heavy rain, flooding, extreme heat, air pollution, and curfew

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Persistence: Mongo-ready repository layer with a built-in demo persistence mode
- Auth: JWT
- Styling: custom responsive CSS

## Project Structure

```text
client/   React app
server/   Express API
docs/     Demo support notes
```

## How To Run

1. Install dependencies from the repo root:

```bash
npm install
```

2. Copy environment files if needed:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start both apps:

```bash
npm run dev
```

4. Open the frontend:

```text
http://localhost:5173
```

5. The API runs on:

```text
http://localhost:4000
```

## Demo Credentials

Use the built-in demo bootstrap button in the UI, or log in with:

- Email: `rider@suraksha.demo`
- Password: `demo1234`

## Submission Mapping

### Registration Process

- `/api/auth/register`
- Frontend onboarding form for worker profile creation

### Insurance Policy Management

- Quote, activate, pause, and reactivate weekly policies
- Coverage amount and coverage hours controls

### Dynamic Premium Calculation

- Hyper-local risk engine in `server/src/services/risk.service.js`
- Safe-zone discount and disruption-based pricing adjustments

### Claims Management

- Automated trigger simulation in `server/src/services/claim-automation.service.js`
- Flagged claim review and release endpoint

## Demo Flow

1. Load the demo account or register a new worker.
2. Show the quoted weekly premium and factor explanations.
3. Activate or adjust the policy.
4. Run `Monsoon Surge`, `Heatwave Lock`, `Smog Spike`, or `Curfew Window`.
5. Show automated trigger creation and zero-touch payouts in claims management.

## Persistence Modes

By default, the app runs in `demo` mode and stores data in:

- `server/.demo-db.json`

To use MongoDB instead, set:

```env
PERSISTENCE_MODE=mongo
MONGO_URI=mongodb://127.0.0.1:27017/suraksha
```

## Important Note

This environment could not complete `npm install` because the machine reported `ENOSPC` (no disk space left). The source code is ready, but you may need to free disk space before installing dependencies and running the full app locally.
