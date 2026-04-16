import { buildPayoutSimulation } from "../services/payout.service.js";

export async function listClaims(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const claims = await repositories.claims.listByUserId(req.user._id);
    return res.json({ claims });
  } catch (error) {
    return next(error);
  }
}

export async function releaseClaim(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const claim = await repositories.claims.findById(req.params.claimId);

    if (!claim || claim.userId !== req.user._id) {
      return res.status(404).json({ message: "Claim not found." });
    }

    if (claim.status !== "flagged") {
      return res.status(400).json({
        message: "Only flagged claims can be released manually.",
      });
    }

    const policy = await repositories.policies.findById(claim.policyId);
    const payout = buildPayoutSimulation(req.user, claim, policy);
    const updated = await repositories.claims.updateById(claim._id, {
      status: "paid",
      paidAt: new Date().toISOString(),
      payout,
      payoutReference: payout.transferId,
      explanation: `${claim.explanation} Manual review cleared the hold and settled the payout instantly.`,
    });

    return res.json({ claim: updated });
  } catch (error) {
    return next(error);
  }
}
