// Minimal CSV writer for the admin exports.
//
// Cells are quoted when they contain a comma, quote or newline. Cells that
// start with = + - @ (or a tab/CR) get a leading apostrophe so a spreadsheet
// can't run them as a formula when the file is opened (CSV injection).
function cell(value) {
  if (value == null) return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// columns: [{ key, label }]. A UTF-8 BOM is added so Excel reads non-ASCII correctly.
export function toCsv(rows, columns) {
  const lines = [columns.map((c) => cell(c.label)).join(",")];
  for (const row of rows) lines.push(columns.map((c) => cell(row[c.key])).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
