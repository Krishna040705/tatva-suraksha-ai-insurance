# Suraksha 5-Minute Demo Script

## Goal

Demonstrate a complete worker-protection flow:

1. Worker onboarding
2. Weekly policy pricing
3. Live disruption monitoring
4. Advanced fraud detection
5. Automated claim approval
6. Instant payout simulation
7. Insurer dashboard with loss ratio and next-week forecast

## 0:00 - 0:30 | Open With The Problem

Say:

"Gig workers lose wages the same day disruption happens, but traditional insurance still behaves like monthly paperwork. Suraksha protects weekly income with parametric triggers, ML-assisted fraud detection, and instant digital payouts."

On screen:

- Land on the Suraksha homepage
- Highlight the worker/admin demo buttons
- Point out the three pillars:
  - advanced fraud
  - instant payouts
  - dual dashboards

## 0:30 - 1:15 | Worker Onboarding

Say:

"The product is built around the worker's actual rhythm: weekly earnings, fast onboarding, and direct payout rails."

On screen:

- Open the register form
- Show city, zone, weekly income, platform, and payout rail
- Mention that the rider can pick UPI, Razorpay test mode, or Stripe sandbox
- Optionally submit a new worker, or load the worker demo persona

Recommended demo persona:

- Email: `rider@suraksha.demo`
- Password: `demo1234`

## 1:15 - 2:00 | Weekly Coverage And Dynamic Premium

Say:

"Suraksha prices weekly protection using hyper-local disruption exposure rather than a static annual view."

On screen:

- Show the worker dashboard
- Call out:
  - earnings protected
  - active weekly cover
  - trust score
  - next-week disruption outlook
- In the pricing studio, adjust coverage amount and coverage hours
- Change the payout rail if needed
- Click `Refresh Quote`
- Explain that the premium reacts to risk factors like rainfall, waterlogging, heat, AQI, and curfew exposure

## 2:00 - 2:45 | Live Disruption Signals

Say:

"The trigger layer watches external signals instead of asking the worker to prove loss after the fact."

On screen:

- Scroll to the live disruption monitor
- Show the five trigger streams:
  - rainfall
  - flood index
  - heat index
  - AQI
  - curfew risk
- Explain that thresholds define when the policy should activate automatically

## 2:45 - 3:45 | Simulate A Disruption And Fraud Review

Say:

"Now we trigger a fake rainstorm and let the platform decide whether the claim should auto-pay or go to review."

On screen:

- Open the scenario lab
- Set `Fraud simulation profile` to `Fake weather claim` or `GPS spoof attempt`
- Set payout gateway to `Razorpay Test Mode` or `UPI Simulator`
- Click `Run Monsoon Surge`

Narrate the result:

- The disruption crosses the insured threshold
- The fraud engine compares telemetry against historical weather baselines
- GPS drift, device confidence, or weather declaration mismatch changes the anomaly score

If using:

- `Clean telemetry`
  - explain auto-approval and instant payout
- `Fake weather claim` or `GPS spoof attempt`
  - explain why the claim is flagged instead of rejected

## 3:45 - 4:20 | Claim Approval And Instant Payout

Say:

"When the claim is approved, the worker sees lost wages replaced instantly through the selected payout rail."

On screen:

- Scroll to the instant payout rail
- Open the newest claim
- Highlight:
  - payout amount
  - transfer ID
  - payout gateway label
  - fraud score
  - model version
  - settlement time

If the claim is flagged:

- Click `Release After Review`
- Show the claim changing to paid
- Mention that the payout is still simulated instantly after manual clearance

## 4:20 - 5:00 | Insurer Dashboard And Close

Say:

"Suraksha is not only worker-friendly. It also gives insurers the controls they need to operate the portfolio responsibly."

On screen:

- Click `Admin Demo`
- Show:
  - weekly premium pool
  - live loss ratio
  - predictive loss ratio
  - next-week expected claims
  - likely triggers
  - city risk spread
  - worker-level portfolio table
  - business viability and social impact cards

Closing line:

"Suraksha protects gig workers before disruption becomes debt, while giving insurers a transparent weekly product with live risk, fraud, and payout visibility."
