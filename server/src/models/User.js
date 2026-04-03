import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    city: { type: String, required: true },
    zoneType: {
      type: String,
      enum: ["safe", "moderate", "high-risk"],
      default: "moderate",
    },
    occupation: { type: String, required: true },
    platform: { type: String, required: true },
    weeklyIncome: { type: Number, required: true },
    upiId: { type: String, required: true },
    trustScore: { type: Number, default: 80 },
    telemetryProfile: {
      gpsLocation: { type: String, default: "matched" },
      networkLocation: { type: String, default: "matched" },
      movement: { type: String, default: "active" },
      claimFrequency: { type: Number, default: 0 },
      inSuspiciousCluster: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model("User", userSchema);
