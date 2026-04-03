import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../../.demo-db.json");

function defaultState() {
  return {
    users: [],
    policies: [],
    claims: [],
    triggers: [],
  };
}

function ensureDbFile() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultState(), null, 2));
  }
}

function readState() {
  ensureDbFile();

  const raw = fs.readFileSync(dbPath, "utf-8");
  const parsed = JSON.parse(raw);

  return {
    ...defaultState(),
    ...parsed,
  };
}

function writeState(state) {
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
}

function withMeta(document, isNew = true) {
  const now = new Date().toISOString();

  return {
    _id: document._id || randomUUID(),
    ...document,
    createdAt: isNew ? now : document.createdAt,
    updatedAt: now,
  };
}

function sortNewest(items) {
  return [...items].sort((left, right) => {
    return (
      new Date(right.updatedAt || right.createdAt || 0).getTime() -
      new Date(left.updatedAt || left.createdAt || 0).getTime()
    );
  });
}

export function createDemoDb() {
  function getCollection(name) {
    const state = readState();
    return state[name];
  }

  function create(name, document) {
    const state = readState();
    const record = withMeta(document, true);
    state[name].push(record);
    writeState(state);
    return record;
  }

  function createMany(name, documents) {
    const state = readState();
    const records = documents.map((document) => withMeta(document, true));
    state[name].push(...records);
    writeState(state);
    return records;
  }

  function updateById(name, id, updates) {
    const state = readState();
    const index = state[name].findIndex((item) => item._id === id);

    if (index === -1) {
      return null;
    }

    const updated = withMeta(
      {
        ...state[name][index],
        ...updates,
      },
      false,
    );

    state[name][index] = updated;
    writeState(state);
    return updated;
  }

  function findOne(name, predicate) {
    return getCollection(name).find(predicate) || null;
  }

  function findMany(name, predicate = () => true) {
    return getCollection(name).filter(predicate);
  }

  return {
    create,
    createMany,
    updateById,
    findOne,
    findMany,
    sortNewest,
  };
}
