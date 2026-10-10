const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "data", "analytics");

function file(userId) {
  return path.join(DIR, `${userId}.json`);
}

function read(userId) {
  try {
    return JSON.parse(fs.readFileSync(file(userId), "utf8"));
  } catch {
    return [];
  }
}

function write(userId, rows) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(file(userId), JSON.stringify(rows, null, 2));
}

function list(userId) {
  return read(userId);
}

function add(userId, entry) {
  const rows = read(userId);
  const date =
    entry.date && !isNaN(new Date(entry.date))
      ? new Date(entry.date).toISOString()
      : new Date().toISOString();

  const row = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    subject: String(entry.subject || "General").slice(0, 60),
    topic: String(entry.topic || "").slice(0, 80),
    score: Number(entry.score),
    total: Number(entry.total),
    date,
  };
  rows.push(row);
  write(userId, rows);
  return row;
}

function remove(userId, id) {
  const rows = read(userId).filter((r) => r.id !== id);
  write(userId, rows);
  return rows;
}

module.exports = { list, add, remove };