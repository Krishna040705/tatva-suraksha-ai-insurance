import { buildPremiumQuote } from "../services/risk.service.js";

function triggerConfig() {
  return {
    heavyRain: 70,
    flooding: 72,
    extremeHeat: 42,
    airPollution: 280,
    curfew: 70,
  };
}

export async function getQuote(req, res, next) {
  try {
    const quote = buildPremiumQuote(req.user, req.body, req.body.scenarioId);
    return res.json(quote);
  } catch (error) {
    return next(error);
  }
}

export async function listPolicies(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const policies = await repositories.policies.listByUserId(req.user._id);
    return res.json({ policies });
  } catch (error) {
    return next(error);
  }
}

export async function createPolicy(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const quote = buildPremiumQuote(req.user, req.body, req.body.scenarioId);
    const existingPolicies = await repositories.policies.listByUserId(req.user._id);

    await Promise.all(
      existingPolicies
        .filter((policy) => policy.status === "active")
        .map((policy) =>
          repositories.policies.updateById(policy._id, { status: "paused" }),
        ),
    );

    const policy = await repositories.policies.create({
      userId: req.user._id,
      ...quote,
      status: "active",
      triggerConfig: triggerConfig(),
    });

    return res.status(201).json({ policy });
  } catch (error) {
    return next(error);
  }
}

export async function updatePolicy(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const policy = await repositories.policies.findById(req.params.policyId);

    if (!policy || policy.userId !== req.user._id) {
      return res.status(404).json({ message: "Policy not found." });
    }

    const allowedStatuses = ["active", "paused", "expired"];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Unsupported policy status." });
    }

    if (req.body.status === "active") {
      const existingPolicies = await repositories.policies.listByUserId(req.user._id);
      await Promise.all(
        existingPolicies
          .filter(
            (existingPolicy) =>
              existingPolicy.status === "active" &&
              existingPolicy._id !== policy._id,
          )
          .map((existingPolicy) =>
            repositories.policies.updateById(existingPolicy._id, {
              status: "paused",
            }),
          ),
      );
    }

    const updated = await repositories.policies.updateById(policy._id, {
      status: req.body.status,
    });

    return res.json({ policy: updated });
  } catch (error) {
    return next(error);
  }
}
