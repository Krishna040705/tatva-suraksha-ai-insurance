import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planName: { type: String, default: "Income Shield Weekly" },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "expired"],
      default: "active",
    },
    coverageAmount: { type: Number, required: true },
    coverageHours: { type: Number, required: true },
    basePremium: { type: Number, required: true },
    dynamicPremium: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    riskBand: { type: String, required: true },
    factors: [{ type: String }],
    triggerConfig: {
      heavyRain: { type: Number, default: 70 },
      flooding: { type: Number, default: 72 },
      extremeHeat: { type: Number, default: 42 },
      airPollution: { type: Number, default: 280 },
      curfew: { type: Number, default: 70 },
    },
    nextBillingDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export const PolicyModel = mongoose.model("Policy", policySchema);
