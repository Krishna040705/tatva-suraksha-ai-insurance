import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    eventKey: { type: String, required: true },
    triggerType: { type: String, required: true },
    status: {
      type: String,
      enum: ["auto_approved", "flagged", "paid"],
      default: "auto_approved",
    },
    lossHours: { type: Number, required: true },
    payoutAmount: { type: Number, required: true },
    payoutReference: { type: String, required: true },
    requestedGatewayId: { type: String, default: "upi" },
    explanation: { type: String, required: true },
    fraudAssessment: {
      score: { type: Number, required: true },
      status: { type: String, required: true },
      reasons: [{ type: String }],
      confidence: { type: Number, default: 0 },
      modelVersion: { type: String, default: "centroid-anomaly-v2" },
      features: { type: Object, default: {} },
      historicalContext: { type: Object, default: {} },
    },
    triggerSnapshot: { type: Object, required: true },
    simulationProfile: { type: String, default: "clean" },
    payout: { type: Object, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ClaimModel = mongoose.model("Claim", claimSchema);
