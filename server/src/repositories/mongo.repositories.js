import { ClaimModel } from "../models/Claim.js";
import { PolicyModel } from "../models/Policy.js";
import { TriggerEventModel } from "../models/TriggerEvent.js";
import { UserModel } from "../models/User.js";

function normalize(document) {
  if (!document) {
    return null;
  }

  const plain = document.toObject ? document.toObject() : document;

  return {
    ...plain,
    _id: String(plain._id),
    userId: plain.userId ? String(plain.userId) : plain.userId,
    policyId: plain.policyId ? String(plain.policyId) : plain.policyId,
  };
}

function normalizeList(items) {
  return items.map(normalize);
}

export function createMongoRepositories() {
  return {
    users: {
      create: async (payload) => normalize(await UserModel.create(payload)),
      findByEmail: async (email) =>
        normalize(await UserModel.findOne({ email }).lean()),
      findById: async (id) => normalize(await UserModel.findById(id).lean()),
      list: async () => normalizeList(await UserModel.find({}).lean()),
      updateById: async (id, updates) =>
        normalize(
          await UserModel.findByIdAndUpdate(id, updates, {
            new: true,
            lean: true,
          }),
        ),
    },
    policies: {
      create: async (payload) => normalize(await PolicyModel.create(payload)),
      findById: async (id) => normalize(await PolicyModel.findById(id).lean()),
      list: async () =>
        normalizeList(await PolicyModel.find({}).sort({ updatedAt: -1 }).lean()),
      listByUserId: async (userId) =>
        normalizeList(
          await PolicyModel.find({ userId }).sort({ updatedAt: -1 }).lean(),
        ),
      listActive: async () =>
        normalizeList(await PolicyModel.find({ status: "active" }).lean()),
      updateById: async (id, updates) =>
        normalize(
          await PolicyModel.findByIdAndUpdate(id, updates, {
            new: true,
            lean: true,
          }),
        ),
    },
    claims: {
      create: async (payload) => normalize(await ClaimModel.create(payload)),
      findById: async (id) => normalize(await ClaimModel.findById(id).lean()),
      list: async () =>
        normalizeList(await ClaimModel.find({}).sort({ updatedAt: -1 }).lean()),
      listByUserId: async (userId) =>
        normalizeList(
          await ClaimModel.find({ userId }).sort({ updatedAt: -1 }).lean(),
        ),
      listRecent: async (limit = 10) =>
        normalizeList(
          await ClaimModel.find({}).sort({ updatedAt: -1 }).limit(limit).lean(),
        ),
      findByEventKey: async ({ userId, policyId, eventKey }) =>
        normalize(
          await ClaimModel.findOne({ userId, policyId, eventKey }).lean(),
        ),
      updateById: async (id, updates) =>
        normalize(
          await ClaimModel.findByIdAndUpdate(id, updates, {
            new: true,
            lean: true,
          }),
        ),
    },
    triggers: {
      createMany: async (payload) =>
        normalizeList(await TriggerEventModel.insertMany(payload)),
      listRecent: async (limit = 10) =>
        normalizeList(
          await TriggerEventModel.find({})
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean(),
        ),
      listByUserId: async (userId, limit = 10) =>
        normalizeList(
          await TriggerEventModel.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean(),
        ),
    },
  };
}
