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
    explanation: { type: String, required: true },
    fraudAssessment: {
      score: { type: Number, required: true },
      status: { type: String, required: true },
      reasons: [{ type: String }],
    },
    triggerSnapshot: { type: Object, required: true },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ClaimModel = mongoose.model("Claim", claimSchema);
