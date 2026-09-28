import getDb from "@/lib/db";
import { getResource } from "@/lib/resources";

// Table and column names below are interpolated into SQL, which is only safe
// because every function first checks the table against the RESOURCES
// whitelist and takes column names from it, never from request data. Values
// are always bound parameters.

const toPlain = (row) => (row ? { ...row } : null);

function resourceFor(table) {
  const resource = getResource(table);
  if (!resource) throw new Error(`Unknown table: ${table}`);
  return resource;
}

export function listAll(table) {
  resourceFor(table);
  return getDb()
    .prepare(`SELECT * FROM ${table} ORDER BY id DESC`)
    .all()
    .map(toPlain);
}

export function getRow(table, id) {
  resourceFor(table);
  return toPlain(getDb().prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
}

export function insertRow(table, values) {
  const cols = resourceFor(table).fields.map((f) => f.name);
  const stmt = getDb().prepare(
    `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map((c) => "@" + c).join(", ")})`
  );
  const result = stmt.run(Object.fromEntries(cols.map((c) => [c, values[c]])));
  return Number(result.lastInsertRowid);
}

// Returns true if a row was updated, false if that id doesn't exist.
export function updateRow(table, id, values) {
  const cols = resourceFor(table).fields.map((f) => f.name);
  const stmt = getDb().prepare(
    `UPDATE ${table} SET ${cols.map((c) => `${c} = @${c}`).join(", ")} WHERE id = @id`
  );
  const result = stmt.run({ ...Object.fromEntries(cols.map((c) => [c, values[c]])), id });
  return result.changes > 0;
}

export function deleteRow(table, id) {
  resourceFor(table);
  return getDb().prepare(`DELETE FROM ${table} WHERE id = ?`).run(id).changes > 0;
}
