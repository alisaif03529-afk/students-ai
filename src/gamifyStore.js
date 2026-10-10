const fs = require("fs");
const path = require("path");
const users = require("./users");

const DIR = path.join(__dirname, "..", "data", "gamify");
const DAY_CAP = 180; // XP ke liye ek din ka max minutes
const MAX_LOG = 600; // ek din mein max minutes darj ho sakte hain

const file = (id) => path.join(DIR, `${id}.json`);
const fresh = () => ({ name: null, days: {}, goal: 0, best: 0, friends: [] });

function read(id) {
  try {
    return { ...fresh(), ...JSON.parse(fs.readFileSync(file(id), "utf8")) };
  } catch {
    return fresh();
  }
}

function write(id, data) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(file(id), JSON.stringify(data, null, 2));
}

const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const shift = (key, n) => {
  const [y, m, d] = key.split("-").map(Number);
  return fmt(new Date(y, m - 1, d + n));
};
const validDay = (k) => (/^\d{4}-\d{2}-\d{2}$/.test(String(k || "")) ? k : null);

function streak(days, today) {
  let k = (days[today] || 0) > 0 ? today : shift(today, -1);
  let n = 0;
  while ((days[k] || 0) > 0) {
    n++;
    k = shift(k, -1);
  }
  return n;
}

function weekMinutes(days, today) {
  let t = 0;
  for (let i = 0; i < 7; i++) t += days[shift(today, -i)] || 0;
  return t;
}

const xpOf = (d, today) =>
  Object.values(d.days).reduce((a, v) => a + Math.min(v, DAY_CAP), 0) + 10 * streak(d.days, today);

function summary(userId, day) {
  const today = validDay(day) || fmt(new Date());
  const me = read(userId);
  const st = streak(me.days, today);
  me.best = Math.max(me.best || 0, st);
  write(userId, me);

  const week = weekMinutes(me.days, today);
  const totalMin = Object.values(me.days).reduce((a, v) => a + v, 0);
  const xp = xpOf(me, today);

  const board = [{ name: me.name || "आप", xp, me: true }];
  me.friends.forEach((f) => {
    const fd = read(f.id);
    board.push({ name: fd.name || f.name || "Friend", xp: xpOf(fd, today), me: false });
  });
  board.sort((a, b) => b.xp - a.xp);

  const badges = [
    { icon: "🌱", name: "पहला कदम", how: "पहली बार पढ़ाई दर्ज करें", ok: totalMin > 0 },
    { icon: "🔥", name: "3 दिन streak", how: "लगातार 3 दिन पढ़ें", ok: me.best >= 3 },
    { icon: "⚡", name: "7 दिन streak", how: "लगातार 7 दिन पढ़ें", ok: me.best >= 7 },
    { icon: "👑", name: "30 दिन streak", how: "लगातार 30 दिन पढ़ें", ok: me.best >= 30 },
    { icon: "⏱️", name: "10 घंटे", how: "कुल 600 मिनट पढ़ें", ok: totalMin >= 600 },
    { icon: "⭐", name: "500 XP", how: "500 XP कमाएँ", ok: xp >= 500 },
    { icon: "🎯", name: "Goal पूरा", how: "हफ़्ते का goal पूरा करें", ok: me.goal > 0 && week >= me.goal },
    { icon: "👥", name: "दोस्त", how: "किसी दोस्त को जोड़ें", ok: me.friends.length > 0 },
  ];

  return {
    name: me.name,
    xp,
    streak: st,
    todayMin: me.days[today] || 0,
    week,
    goal: me.goal,
    badges,
    board,
  };
}

function log(userId, body) {
  const day = validDay(body.day);
  const minutes = Math.round(Number(body.minutes));
  if (!day || !(minutes > 0)) return { error: "Minutes ya date galat hai" };

  const me = read(userId);
  if (body.name) me.name = String(body.name).slice(0, 40);
  me.days[day] = Math.min(MAX_LOG, (me.days[day] || 0) + Math.min(minutes, MAX_LOG));
  me.best = Math.max(me.best || 0, streak(me.days, day));
  write(userId, me);
  return { ok: true };
}

function setGoal(userId, body) {
  const t = Math.round(Number(body.target));
  if (!(t >= 10 && t <= 2000)) return { error: "Goal 10 se 2000 minutes ke beech rakhein" };
  const me = read(userId);
  me.goal = t;
  write(userId, me);
  return { ok: true };
}

async function addFriend(userId, body) {
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) return { error: "Email daalein" };

  const other = await users.findByEmail(email);
  if (!other) return { error: "Ye email registered nahi hai" };
  if (String(other.id) === String(userId)) return { error: "Khud ko friend nahi bana sakte" };

  const me = read(userId);
  const them = read(other.id);
  if (!me.friends.some((f) => String(f.id) === String(other.id)))
    me.friends.push({ id: other.id, name: other.name || null });
  if (!them.friends.some((f) => String(f.id) === String(userId)))
    them.friends.push({ id: userId, name: me.name || null });

  write(userId, me);
  write(other.id, them);
  return { ok: true };
}

module.exports = { summary, log, setGoal, addFriend };