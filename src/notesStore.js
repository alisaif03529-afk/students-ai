const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "notes");

function fileOf(userId) {
  return path.join(DIR, userId + ".json");
}
function load(userId) {
  try { return JSON.parse(fs.readFileSync(fileOf(userId), "utf8")); }
  catch { return []; }
}
function save(userId, notes) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(fileOf(userId), JSON.stringify(notes, null, 2));
}
function list(userId) {
  return load(userId).sort((a, b) => b.createdAt - a.createdAt);
}
function add(userId, question, answer) {
  const notes = load(userId);
  const note = {
    id: Date.now().toString(36),
    question,
    answer,
    createdAt: Date.now(),
  };
  notes.push(note);
  save(userId, notes);
  return note;
}
function remove(userId, id) {
  save(userId, load(userId).filter((n) => n.id !== id));
}

module.exports = { list, add, remove };