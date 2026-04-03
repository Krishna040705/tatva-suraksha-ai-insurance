import mongoose from "mongoose";

const triggerEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    eventKey: { type: String, required: true },
    triggerType: { type: String, required: true },
    severity: { type: String, required: true },
    narrative: { type: String, required: true },
    source: { type: String, required: true },
    scenarioId: { type: String, required: true },
    snapshot: { type: Object, required: true },
  },
  { timestamps: true },
);

export const TriggerEventModel = mongoose.model(
  "TriggerEvent",
  triggerEventSchema,
);
