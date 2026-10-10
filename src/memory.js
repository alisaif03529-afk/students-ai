const sessions = new Map();

function get(id) {
  if (!sessions.has(id)) sessions.set(id, []);
  return sessions.get(id);
}

function add(id, role, content) {
  get(id).push({ role, content });
}

function undo(id) {
  get(id).pop();
}

module.exports = { get, add, undo };