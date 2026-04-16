import { disruptionScenarios } from "../data/scenarios.js";
import { fraudPresets } from "../data/fraud-presets.js";
import { runAutomationForUser } from "../services/claim-automation.service.js";
import { buildSignalSnapshot } from "../services/risk.service.js";
import { listGatewayOptions } from "../services/payout.service.js";

export async function getScenarios(req, res) {
  return res.json({
    scenarios: disruptionScenarios,
    fraudPresets,
    gateways: listGatewayOptions(),
  });
}

export async function getSnapshot(req, res, next) {
  try {
    return res.json({
      snapshot: buildSignalSnapshot(req.user, req.query.scenarioId),
    });
  } catch (error) {
    return next(error);
  }
}

export async function simulateTriggers(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const policies = await repositories.policies.listByUserId(req.user._id);

    const result = await runAutomationForUser(
      repositories,
      req.user,
      policies,
      req.body.scenarioId,
      {
        fraudPresetId: req.body.fraudPresetId,
        gatewayId: req.body.gatewayId,
      },
    );

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
