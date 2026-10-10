const express = require("express");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "data", "profiles");
fs.mkdirSync(DIR, { recursive: true });

const router = express.Router();

function fileOf(id) {
  return path.join(DIR, String(id).replace(/[^a-zA-Z0-9_-]/g, "") + ".json");
}

function auth(req, res, next) {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: "login करें" });
  next();
}

router.get("/", auth, (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(fileOf(req.session.userId), "utf8")));
  } catch {
    res.json({});
  }
});

router.post("/", auth, express.json(), (req, res) => {
  const b = req.body || {};
  const photoOk =
    typeof b.photo === "string" &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(b.photo) &&
    b.photo.length <= 90000;

  const clean = {
    displayName: String(b.displayName || "").trim().slice(0, 30),
    avatar: String(b.avatar || "🦁").slice(0, 8),
    color: ["cyan", "violet", "rose", "amber"].includes(b.color) ? b.color : "cyan",
    className: ["", "5", "6", "7", "8", "9", "10", "11", "12"].includes(String(b.className || "")) ? String(b.className || "") : "",
    board: ["", "CBSE", "BSEB", "Other"].includes(b.board || "") ? b.board || "" : "",
    bio: String(b.bio || "").trim().slice(0, 80),
    photo: photoOk ? b.photo : "",
  };

  try {
    fs.writeFileSync(fileOf(req.session.userId), JSON.stringify(clean, null, 2));
    res.json(clean);
  } catch {
    res.status(500).json({ error: "save नहीं हुआ" });
  }
});

module.exports = router;