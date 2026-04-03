import { createDemoDb } from "../store/demoDb.js";

const db = createDemoDb();

function newest(items, limit = 10) {
  return db.sortNewest(items).slice(0, limit);
}

export function createDemoRepositories() {
  return {
    users: {
      create: async (payload) => db.create("users", payload),
      findByEmail: async (email) =>
        db.findOne("users", (user) => user.email === email),
      findById: async (id) => db.findOne("users", (user) => user._id === id),
      list: async () => db.findMany("users"),
      updateById: async (id, updates) => db.updateById("users", id, updates),
    },
    policies: {
      create: async (payload) => db.create("policies", payload),
      findById: async (id) =>
        db.findOne("policies", (policy) => policy._id === id),
      listByUserId: async (userId) =>
        newest(db.findMany("policies", (policy) => policy.userId === userId), 20),
      listActive: async () =>
        db.findMany("policies", (policy) => policy.status === "active"),
      updateById: async (id, updates) =>
        db.updateById("policies", id, updates),
    },
    claims: {
      create: async (payload) => db.create("claims", payload),
      findById: async (id) => db.findOne("claims", (claim) => claim._id === id),
      listByUserId: async (userId) =>
        newest(db.findMany("claims", (claim) => claim.userId === userId), 20),
      listRecent: async (limit = 10) => newest(db.findMany("claims"), limit),
      findByEventKey: async ({ userId, policyId, eventKey }) =>
        db.findOne(
          "claims",
          (claim) =>
            claim.userId === userId &&
            claim.policyId === policyId &&
            claim.eventKey === eventKey,
        ),
      updateById: async (id, updates) => db.updateById("claims", id, updates),
    },
    triggers: {
      createMany: async (payload) => db.createMany("triggers", payload),
      listByUserId: async (userId, limit = 10) =>
        newest(
          db.findMany("triggers", (trigger) => trigger.userId === userId),
          limit,
        ),
    },
  };
}
