# Final Submission Package

## Included In This Repo

The following Week 6 artefacts are now staged inside the project:

- `docs/DEMO_SCRIPT.md`
  - 5-minute walkthrough script
- `docs/FINAL_PITCH_DECK.md`
  - slide-by-slide pitch content
- `docs/FINAL_PITCH_DECK.html`
  - export-ready HTML deck that can be printed to PDF
- `docs/FINAL_PITCH_DECK.pdf`
  - generated PDF pitch deck for judging upload
- updated website
  - worker journey
  - admin journey
  - fraud simulation
  - instant payout simulation

## What The Website Now Demonstrates

- Advanced fraud detection
  - GPS spoofing
  - suspicious cluster behavior
  - device integrity drops
  - fake weather claims checked against historical weather bands
- Instant payout system
  - UPI Simulator
  - Razorpay Test Mode
  - Stripe Sandbox
- Intelligent dashboards
  - Worker: earnings protected, active weekly coverage, payout summary, forecast
  - Admin: loss ratios, predictive analytics, business viability, social impact

## Deployment Notes

Development:

```bash
npm run dev
```

Production-style build:

```bash
npm run build
npm start
```

After `npm run build`, the Express server serves the built client from `client/dist`.

## Manual Steps Still Required

These steps cannot be completed automatically from this environment:

1. Record the final 5-minute screen-capture demo video.
2. Upload the video to a public link.

## Recommended Recording Flow

1. Open Suraksha landing page.
2. Load worker demo.
3. Show quote and active weekly cover.
4. Trigger `Monsoon Surge` with `Fake weather claim` or `GPS spoof attempt`.
5. Show fraud score and either payout settlement or flagged hold.
6. Release a flagged claim if needed.
7. Switch to admin demo.
8. Close on loss ratio, forecast, and viability cards.
