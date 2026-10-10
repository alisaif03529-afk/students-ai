(function () {
  const chat = document.getElementById("chat");
  const form = document.getElementById("form");
  const side = document.getElementById("side");
  const btn = document.getElementById("gamifyBtn");
  if (!chat || !btn) return;

  const CSS = `
    .gm-wrap { max-width: 900px; margin: 0 auto; padding: 24px 18px 40px; color: #e5e7eb; font-family: "Outfit", "Segoe UI", sans-serif; }
    .gm-wrap h2 { margin: 0; font-size: 26px; background: linear-gradient(90deg, #fde047, #fb923c, #f472b6); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .gm-sub { color: #a5a1c2; margin: 4px 0 16px; }
    .gm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 14px; }
    .gm-stat { border-radius: 16px; padding: 14px; background: rgba(15,15,30,.6); border: 1px solid rgba(253,224,71,.35); box-shadow: 0 0 16px rgba(253,224,71,.18); }
    .gm-stat b { display: block; font-size: 24px; color: #fde047; }
    .gm-stat span { font-size: 13px; color: #fde68a; }
    .gm-card { border-radius: 18px; padding: 16px; margin-bottom: 14px; background: rgba(15,15,30,.6); border: 1px solid rgba(167,139,250,.35); box-shadow: 0 0 18px rgba(167,139,250,.2); }
    .gm-card h3 { margin: 0 0 8px; font-size: 16px; color: #e9d5ff; }
    .gm-card p { margin: 4px 0; font-size: 14px; }
    .gm-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .gm-row input { flex: 1; min-width: 180px; padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(167,139,250,.4); background: rgba(10,10,25,.7); color: #f5f3ff; font: inherit; outline: none; }
    .gm-row input:focus { border-color: #22d3ee; box-shadow: 0 0 14px rgba(34,211,238,.6); }
    .gm-row button { padding: 10px 16px; border: 0; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: inherit; color: #0b1020; background: linear-gradient(90deg,#22d3ee,#a78bfa); box-shadow: 0 0 16px rgba(34,211,238,.5); }
    .gm-track { height: 12px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; margin: 8px 0; }
    .gm-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg,#fde047,#fb923c,#f472b6); box-shadow: 0 0 12px rgba(251,146,60,.6); transition: width .8s ease; }
    .gm-badges { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .gm-badge { border-radius: 14px; padding: 12px; text-align: center; background: rgba(255,255,255,.03); border: 1px dashed rgba(255,255,255,.15); opacity: .45; }
    .gm-badge.on { opacity: 1; border: 1px solid rgba(253,224,71,.6); background: rgba(253,224,71,.08); box-shadow: 0 0 14px rgba(253,224,71,.3); }
    .gm-badge span { font-size: 26px; display: block; }
    .gm-badge b { display: block; font-size: 14px; color: #fde68a; margin-top: 4px; }
    .gm-badge small { color: #a5a1c2; font-size: 11px; }
    .gm-rank { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 8px 12px; margin-top: 6px; border-radius: 12px; background: rgba(255,255,255,.04); }
    .gm-rank.me { border: 1px solid rgba(34,211,238,.6); box-shadow: 0 0 12px rgba(34,211,238,.35); }
    .gm-msg { color: #fde68a; font-size: 13px; min-height: 18px; }
    .gm-empty { color: #a5a1c2; font-size: 14px; }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = () => fmt(new Date());

  let myName = "Student";

  async function loadName() {
    try {
      const r = await fetch("/api/auth/me");
      if (r.ok) {
        const d = await r.json();
        const u = d.user || d;
        myName = u.name || "Student";
      }
    } catch {}
  }

  async function post(url, body) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "fail");
    return d;
  }

  async function open(msg) {
    await loadName();
    const r = await fetch(`/api/gamify?day=${today()}`);
    if (!r.ok) throw new Error("load failed");
    view(await r.json(), msg);
  }

  function view(s, msg) {
    const pct = s.goal ? Math.min(100, Math.round((s.week / s.goal) * 100)) : 0;
    chat.innerHTML = `
      <div class="gm-wrap">
        <h2>🏅 Study Game</h2>
        <p class="gm-sub">पढ़ो, streak बनाओ, XP कमाओ, और दोस्तों से आगे निकलो</p>

        <div class="gm-stats">
          <div class="gm-stat"><b>${s.xp}</b><span>XP</span></div>
          <div class="gm-stat"><b>🔥 ${s.streak}</b><span>दिन की streak</span></div>
          <div class="gm-stat"><b>${s.todayMin}</b><span>आज के मिनट</span></div>
          <div class="gm-stat"><b>${s.week}</b><span>इस हफ़्ते के मिनट</span></div>
        </div>

        <section class="gm-card">
          <h3>🎯 Weekly goal</h3>
          <p>${s.goal ? `${s.week} / ${s.goal} मिनट (${pct}%)` : "अभी कोई goal नहीं है"}</p>
          ${s.goal ? `<div class="gm-track"><div class="gm-fill" style="width:${pct}%"></div></div>` : ""}
          <div class="gm-row">
            <input id="gmGoalIn" type="number" min="10" max="2000" placeholder="हफ़्ते के मिनट (जैसे 300)" />
            <button id="gmGoal" type="button">Goal set करें</button>
          </div>
          <p class="gm-msg" id="gmGMsg"></p>
        </section>

        <section class="gm-card">
          <h3>✍️ आज की पढ़ाई दर्ज करें</h3>
          <p class="gm-sub">1 मिनट = 1 XP (एक दिन में 180 XP तक) · हर streak दिन पर +10 XP</p>
          <div class="gm-row">
            <input id="gmMin" type="number" min="1" max="600" placeholder="आज कितने मिनट पढ़े?" />
            <button id="gmLog" type="button">+ XP लें</button>
          </div>
          <p class="gm-msg" id="gmMsg">${esc(msg || "")}</p>
        </section>

        <section class="gm-card">
          <h3>🏆 Badges</h3>
          <div class="gm-badges">
            ${s.badges.map((b) => `
              <div class="gm-badge ${b.ok ? "on" : ""}">
                <span>${b.icon}</span><b>${esc(b.name)}</b><small>${esc(b.how)}</small>
              </div>`).join("")}
          </div>
        </section>

        <section class="gm-card">
          <h3>👥 Friends leaderboard <span class="gm-sub">(optional)</span></h3>
          <div class="gm-row">
            <input id="gmFriendIn" type="email" placeholder="दोस्त का registered email" />
            <button id="gmFriend" type="button">Add</button>
          </div>
          <p class="gm-msg" id="gmFMsg"></p>
          ${s.board.length <= 1 ? `<p class="gm-empty">अभी कोई दोस्त नहीं जुड़ा।</p>` : ""}
          ${s.board.map((p, i) => `
            <div class="gm-rank ${p.me ? "me" : ""}">
              <span>#${i + 1}</span>
              <b>${esc(p.name)}${p.me ? " (आप)" : ""}</b>
              <span>${p.xp} XP</span>
            </div>`).join("")}
        </section>
      </div>`;
    form.style.display = "none";
    bind();
  }

  function bind() {
    document.getElementById("gmLog").onclick = async () => {
      const m = Number(document.getElementById("gmMin").value);
      if (!(m > 0)) {
        document.getElementById("gmMsg").textContent = "मिनट डालें (1 से ऊपर)";
        return;
      }
      try {
        await post("/api/gamify/log", { minutes: m, day: today(), name: myName });
        await open("✅ बढ़िया! XP जुड़ गया।");
      } catch {
        document.getElementById("gmMsg").textContent = "सेव नहीं हो पाया। सर्वर चल रहा है?";
      }
    };

    document.getElementById("gmGoal").onclick = async () => {
      const t = Number(document.getElementById("gmGoalIn").value);
      try {
        await post("/api/gamify/goal", { target: t });
        await open("🎯 Goal सेट हो गया!");
      } catch (e) {
        document.getElementById("gmGMsg").textContent = "Goal 10 से 2000 minutes के बीच रखें।";
      }
    };

    document.getElementById("gmFriend").onclick = async () => {
      const email = document.getElementById("gmFriendIn").value.trim();
      try {
        await post("/api/gamify/friend", { email });
        await open("👥 दोस्त जुड़ गया!");
      } catch (e) {
        document.getElementById("gmFMsg").textContent = e.message === "fail" ? "दोस्त नहीं जुड़ पाया।" : e.message;
      }
    };
  }

  btn.addEventListener("click", () => open());

  // Koi aur sidebar button dabe to form wapas dikhe
  side.addEventListener("click", (e) => {
    if (!e.target.closest("#gamifyBtn")) form.style.display = "";
  });
})();