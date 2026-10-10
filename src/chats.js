const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "chats");

function fileOf(userId) {
  return path.join(DIR, userId + ".json");
}
function load(userId) {
  try { return JSON.parse(fs.readFileSync(fileOf(userId), "utf8")); }
  catch { return []; }
}
function save(userId, chats) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(fileOf(userId), JSON.stringify(chats, null, 2));
}
function list(userId) {
  return load(userId)
    .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
function create(userId) {
  const chats = load(userId);
  const chat = { id: Date.now().toString(36), title: "नई चैट", updatedAt: Date.now(), messages: [] };
  chats.push(chat);
  save(userId, chats);
  return chat;
}
function get(userId, id) {
  return load(userId).find((c) => c.id === id);
}
function update(userId, id, fn) {
  const chats = load(userId);
  const chat = chats.find((c) => c.id === id);
  if (!chat) return null;
  fn(chat);
  chat.updatedAt = Date.now();
  save(userId, chats);
  return chat;
}
function remove(userId, id) {
  save(userId, load(userId).filter((c) => c.id !== id));
}

module.exports = { list, create, get, update, remove };