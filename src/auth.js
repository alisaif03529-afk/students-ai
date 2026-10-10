const express = require("express");
const bcrypt = require("bcryptjs");
const users = require("./users");
const router = express.Router();

function start(req, user) {
  req.session.userId = user.id;
  req.session.name = user.name;
}

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "सभी फ़ील्ड भरें।" });
  if (password.length < 6)
    return res.status(400).json({ error: "पासवर्ड कम से कम 6 अक्षर का रखें।" });
  const e = email.trim().toLowerCase();
  if (users.findByEmail(e))
    return res.status(409).json({ error: "यह ईमेल पहले से रजिस्टर है।" });
  const user = users.create(name.trim(), e, await bcrypt.hash(password, 10));
  start(req, user);
  res.json({ ok: true });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.findByEmail((email || "").trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password || "", user.hash)))
    return res.status(401).json({ error: "ईमेल या पासवर्ड गलत है।" });
  start(req, user);
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({});
  res.json({ name: req.session.name });
});

function requireAuth(req, res, next) {
  if (!req.session.userId)
    return res.status(401).json({ reply: "पहले लॉगिन करें।" });
  next();
}

module.exports = { router, requireAuth };