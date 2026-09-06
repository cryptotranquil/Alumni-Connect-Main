const db = require("../config/firestore");
const DEFAULT_DEPARTMENTS = require("../config/departments");

const departmentsRef = db.collection("departments");

/** Derive a short code from a name like "Information Technology" -> "IT". */
function deriveCode(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 6);
}

/**
 * One-time self-heal: if the `departments` collection has never been
 * populated (fresh Firestore project, or this feature just shipped),
 * seed it from src/config/departments.js so the signup dropdown and the
 * admin "Manage Departments" page aren't empty. Short-circuits as soon as
 * any doc exists, so it's cheap to call on every read.
 */
async function seedIfEmpty() {
  const snap = await departmentsRef.limit(1).get();
  if (!snap.empty) return;

  const now = new Date();
  const batch = db.batch();
  DEFAULT_DEPARTMENTS.forEach((name) => {
    const ref = departmentsRef.doc();
    batch.set(ref, {
      name,
      code: deriveCode(name),
      description: "",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });
  await batch.commit();
}

function toDto(doc) {
  return { _id: doc.id, ...doc.data() };
}

async function listAll() {
  await seedIfEmpty();
  const snap = await departmentsRef.orderBy("name").get();
  return snap.docs.map(toDto);
}

async function listActive() {
  const all = await listAll();
  return all.filter((d) => d.isActive !== false);
}

async function findById(id) {
  const doc = await departmentsRef.doc(id).get();
  return doc.exists ? toDto(doc) : null;
}

/** Case-insensitive lookup, used to block duplicate names and to validate
 *  a submitted department against the real list at registration/profile time.
 *  Also seeds on first use — otherwise a registration attempt on a totally
 *  fresh database (before anyone has ever loaded the dropdown or the admin
 *  panel) would find an empty collection and wrongly reject every department. */
async function findByName(name) {
  if (!name) return null;
  await seedIfEmpty();
  const target = name.trim().toLowerCase();
  const snap = await departmentsRef.get();
  const match = snap.docs.find((d) => (d.data().name || "").toLowerCase() === target);
  return match ? toDto(match) : null;
}

async function create({ name, code, description }) {
  const now = new Date();
  const ref = departmentsRef.doc();
  const doc = {
    name: name.trim(),
    code: (code || deriveCode(name)).trim().toUpperCase(),
    description: description ? description.trim() : "",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(doc);
  return { _id: ref.id, ...doc };
}

async function update(id, patch) {
  await departmentsRef.doc(id).update({ ...patch, updatedAt: new Date() });
  return findById(id);
}

async function remove(id) {
  await departmentsRef.doc(id).delete();
}

module.exports = {
  listAll,
  listActive,
  findById,
  findByName,
  create,
  update,
  remove,
};