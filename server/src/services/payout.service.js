import { randomUUID } from "crypto";

const gatewayCatalog = {
  upi: {
    id: "upi",
    label: "UPI Simulator",
    rail: "instant_bank_push",
    provider: "NPCI Sandbox",
    settlementMinutes: 2,
  },
  razorpay: {
    id: "razorpay",
    label: "Razorpay Test Mode",
    rail: "bank_transfer",
    provider: "RazorpayX Sandbox",
    settlementMinutes: 4,
  },
  stripe: {
    id: "stripe",
    label: "Stripe Sandbox",
    rail: "connected_account",
    provider: "Stripe Treasury Sandbox",
    settlementMinutes: 5,
  },
};

export function listGatewayOptions() {
  return Object.values(gatewayCatalog);
}

export function getGatewayById(gatewayId = "upi") {
  return gatewayCatalog[gatewayId] || gatewayCatalog.upi;
}

export function buildPayoutSimulation(user, claim, policy) {
  const gateway = getGatewayById(
    claim.requestedGatewayId ||
      policy?.payoutGatewayId ||
      user.preferredPayoutRail ||
      "upi",
  );
  const initiatedAt = new Date().toISOString();
  const completedAt = new Date(
    Date.now() + gateway.settlementMinutes * 60 * 1000,
  ).toISOString();

  return {
    gatewayId: gateway.id,
    gatewayLabel: gateway.label,
    provider: gateway.provider,
    rail: gateway.rail,
    destination: user.upiId,
    transferId: `${gateway.id.toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`,
    status: "settled",
    initiatedAt,
    completedAt,
    settlementMinutes: gateway.settlementMinutes,
    narrative: `${gateway.label} simulated an instant wage replacement transfer to ${user.upiId}.`,
  };
}
