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

    const updated = await repositories.claims.updateById(claim._id, {
      status: "paid",
      paidAt: new Date().toISOString(),
      explanation: `${claim.explanation} Manual review cleared the hold.`,
    });

    return res.json({ claim: updated });
  } catch (error) {
    return next(error);
  }
}
