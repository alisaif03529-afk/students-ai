const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "data", "users.json");

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return []; }
}
function save(users) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}
function findByEmail(email) {
  return load().find((u) => u.email === email);
}
function create(name, email, hash) {
  const users = load();
  const user = { id: Date.now().toString(36), name, email, hash };
  users.push(user);
  save(users);
  return user;
}

module.exports = { findByEmail, create };