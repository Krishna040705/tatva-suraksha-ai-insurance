# Suraksha Final Pitch Deck

## Slide 1 - Title

Suraksha  
ML-assisted weekly income protection for gig workers

Team Tatva  
Guidewire DEVTrails 2026 Week 6

## Slide 2 - The Worker Persona

Persona: Aarav Singh, 27, delivery rider in Mumbai

- Earns weekly, not monthly
- Loses income immediately when rain, flooding, heat, or civic restrictions hit
- Cannot afford long claim cycles or rejected payouts
- Needs protection that feels native to platform work, not traditional insurance paperwork

## Slide 3 - The Problem

- Gig workers face frequent micro-disruptions, but existing insurance products are slow and document-heavy
- Loss events are often small in amount but urgent in timing
- Fraud risk makes insurers cautious, which creates even more friction for honest workers
- Weekly wage interruption is the real pain point

## Slide 4 - Our Solution

Suraksha offers weekly parametric protection:

- monitor disruption triggers automatically
- activate claims without forms when thresholds are crossed
- score suspicious cases with ML-assisted fraud detection
- simulate instant wage replacement through digital payout rails

## Slide 5 - Product Walkthrough

- Worker registers in minutes
- Weekly premium is quoted dynamically
- Policy activates with insured hours and payout rail
- Disruption scenarios trigger automated claims
- Approved claims settle instantly in the simulated payout rail
- Admin sees live portfolio health and next-week forecast

## Slide 6 - AI And Fraud Architecture

Honest positioning:

- Parametric trigger logic remains rule-based and explainable
- Fraud detection is now ML-assisted, not just deterministic rules
- Predictive analytics estimate next-week disruption pressure and claim load

Fraud signals:

- GPS drift versus network footprint
- static movement during active earning hours
- device integrity confidence
- suspicious claim clusters
- worker-declared weather severity versus live and historical weather bands

Model layer:

- centroid-based anomaly classifier for fraud review
- time-series style forecasting for worker and portfolio disruption outlooks

## Slide 7 - Instant Payout Architecture

Mock settlement rails:

- UPI Simulator
- Razorpay Test Mode
- Stripe Sandbox

Flow:

1. Trigger crosses threshold
2. Fraud engine approves or flags
3. Approved claims generate simulated transfer ID and settlement timeline
4. Worker sees wage replacement immediately in the payout rail

## Slide 8 - Why Weekly Pricing Works

Weekly pricing model:

- aligns with gig-worker income cadence
- keeps premiums small and understandable
- allows rapid repricing when location risk changes
- improves trust because the worker sees clear trigger thresholds

Business viability levers:

- pooling low-risk and moderate-risk workers
- transparent loss ratios
- instant digital settlement lowers ops overhead
- portfolio dashboard keeps premium adequacy visible week by week

## Slide 9 - Business Viability Snapshot

Key operating metrics tracked in the platform:

- weekly premium pool
- settled payouts
- live loss ratio
- predictive loss ratio
- break-even worker count
- payout concentration by city

Commercial thesis:

- launch in dense delivery corridors first
- partner with delivery platforms and local insurers
- win adoption through low-friction onboarding and fast claim certainty

## Slide 10 - Social Impact

Why this matters:

- protects workers who often operate with low savings
- reduces dependence on debt after disruption
- improves trust because honest claims do not require document-heavy proof
- supports financially vulnerable workers with fast weekly continuity

Impact metrics included in the admin console:

- low-balance workers protected
- no-paperwork claim rate
- workers covered
- women-friendly coverage proxy score

## Slide 11 - What Makes Suraksha Different

- designed for the worker, not adapted from traditional insurance
- combines explainable parametric triggers with practical fraud intelligence
- shows end-to-end automation, not just a quote form
- gives insurers portfolio visibility while keeping the worker experience simple

## Slide 12 - Closing

Suraksha protects gig workers before disruption becomes debt.

It is:

- fast for workers
- transparent for insurers
- commercially trackable
- ready for a strong Week 6 demo
