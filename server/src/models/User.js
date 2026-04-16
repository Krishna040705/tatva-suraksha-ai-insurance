import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["worker", "admin"],
      default: "worker",
    },
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
    preferredPayoutRail: {
      type: String,
      enum: ["upi", "razorpay", "stripe"],
      default: "upi",
    },
    trustScore: { type: Number, default: 80 },
    telemetryProfile: {
      gpsLocation: { type: String, default: "matched" },
      networkLocation: { type: String, default: "matched" },
      gpsDriftKm: { type: Number, default: 0.8 },
      routeDeviationScore: { type: Number, default: 6 },
      movement: { type: String, default: "active" },
      staticMinutes: { type: Number, default: 8 },
      routeSpeedKph: { type: Number, default: 28 },
      deviceIntegrityConfidence: { type: Number, default: 0.92 },
      claimFrequency: { type: Number, default: 0 },
      inSuspiciousCluster: { type: Boolean, default: false },
      weatherReportConfidence: { type: Number, default: 0.9 },
      reportedRainMm: { type: Number, default: null },
      riderDeclaredConditions: { type: String, default: "aligned" },
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model("User", userSchema);
