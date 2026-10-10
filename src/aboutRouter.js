const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const FILE = path.join(__dirname, "..", "data", "about.json");
const DEFAULT = {
  adminName: "Admin",
  photo: "",
  bio: "Admin ka parichay yahan likhein.",
  project: "Is project ke baare mein yahan likhein.",
};

function read() {
  try {
    return { ...DEFAULT, ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return { ...DEFAULT };
  }
}

function write(d) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
}

function safeEq(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function needAdmin(req, res, next) {
  if (!req.session || !req.session.isAdmin) return res.status(403).json({ error: "सिर्फ़ admin ही बदल सकता है" });
  next();
}

const router = express.Router();

// Sab log dekh sakte hain
router.get("/", (req, res) => {
  res.json({ about: read(), isAdmin: !!(req.session && req.session.isAdmin) });
});

// Admin login
router.post("/login", express.json(), (req, res) => {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return res.status(500).json({ error: "ADMIN_PASSWORD .env में नहीं है" });
  if (!safeEq(req.body && req.body.password ? req.body.password : "", pw)) {
    return res.status(401).json({ error: "Password गलत है" });
  }
  req.session.isAdmin = true;
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  if (req.session) delete req.session.isAdmin;
  res.json({ ok: true });
});

// Sirf admin edit kar sakta hai
router.put("/", needAdmin, express.json(), (req, res) => {
  const b = req.body || {};
  const photoOk =
    typeof b.photo === "string" &&
    (b.photo === "" || (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(b.photo) && b.photo.length <= 90000));

  const clean = {
    adminName: String(b.adminName || "Admin").trim().slice(0, 40),
    photo: photoOk ? b.photo : read().photo,
    bio: String(b.bio || "").trim().slice(0, 600),
    project: String(b.project || "").trim().slice(0, 1500),
  };
  try {
    write(clean);
    res.json(clean);
  } catch {
    res.status(500).json({ error: "save नहीं हुआ" });
  }
});

module.exports = router;