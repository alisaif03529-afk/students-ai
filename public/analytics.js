(function () {
  const chat = document.getElementById("chat");
  const form = document.getElementById("form");
  const side = document.getElementById("side");
  const btn = document.getElementById("analyticsBtn");
  if (!chat || !btn) return;

  const CSS = `
    .an-wrap { max-width: 900px; margin: 0 auto; padding: 24px 18px 40px; color: #e5e7eb; font-family: "Outfit", "Segoe UI", sans-serif; }
    .an-wrap h2 {
      margin: 0; font-size: 26px;
      background: linear-gradient(90deg, #67e8f9, #a78bfa, #f472b6);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .an-sub { color: #a5a1c2; margin: 4px 0 18px; }
    .an-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 14px; }
    .an-stat {
      border-radius: 16px; padding: 14px; background: rgba(15, 15, 30, 0.6);
      border: 1px solid rgba(103, 232, 249, 0.35); box-shadow: 0 0 16px rgba(103, 232, 249, 0.2);
    }
    .an-stat b { display: block; font-size: 26px; color: #67e8f9; }
    .an-stat span { font-size: 13px; color: #c4b5fd; }
    .an-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
    .an-card {
      border-radius: 18px; padding: 16px; margin-bottom: 14px; background: rgba(15, 15, 30, 0.6);
      border: 1px solid rgba(167, 139, 250, 0.35); box-shadow: 0 0 18px rgba(167, 139, 250, 0.2);
    }
    .an-card h3 { margin: 0 0 10px; font-size: 16px; color: #e9d5ff; }
    .an-bar { margin: 8px 0; }
    .an-bar .lbl { display: flex; justify-content: space-between; font-size: 13px; color: #ddd6fe; }
    .an-track { height: 10px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); overflow: hidden; margin-top: 4px; }
    .an-fill {
      height: 100%; border-radius: 999px;
      background: linear-gradient(90deg, #22d3ee, #a78bfa, #f472b6);
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.6); transition: width 0.8s ease;
    }
    .an-tag { display: inline-block; margin: 4px 6px 4px 0; padding: 5px 10px; border-radius: 999px; font-size: 13px; }
    .an-tag.s { background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.5); }
    .an-tag.w { background: rgba(244, 114, 182, 0.15); color: #f9a8d4; border: 1px solid rgba(244, 114, 182, 0.5); }
    .an-tip { margin: 8px 0; line-height: 1.6; }
    .an-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
    .an-form input {
      padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(167, 139, 250, 0.4);
      background: rgba(10, 10, 25, 0.7); color: #f5f3ff; font: inherit; outline: none;
    }
    .an-form input:focus { border-color: #22d3ee; box-shadow: 0 0 14px rgba(34, 211, 238, 0.6); }
    .an-form button {
      grid-column: 1 / -1; padding: 11px; border: 0; border-radius: 12px; cursor: pointer;
      font-weight: 700; font-size: 15px; font-family: inherit; color: #0b1020;
      background: linear-gradient(90deg, #22d3ee, #a78bfa); box-shadow: 0 0 18px rgba(34, 211, 238, 0.5);
    }
    .an-rec {
      display: flex; justify-content: space-between; align-items: center; gap: 10px;
      padding: 8px 10px; border-radius: 12px; background: rgba(255, 255, 255, 0.04);
      margin-bottom: 6px; font-size: 14px;
    }
    .an-rec button {
      background: none; border: 1px solid rgba(244, 114, 182, 0.5); color: #f9a8d4;
      border-radius: 8px; padding: 3px 9px; cursor: pointer;
    }
    .an-empty { color: #a5a1c2; font-size: 14px; }
    .an-wrap svg text { fill: #c4b5fd; font-size: 11px; }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  let rows = [];

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (r) => (r.total ? Math.round((r.score / r.total) * 100) : 0);
  const avg = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
  const group = (arr, fn) =>
    arr.reduce((m, r) => {
      const k = fn(r);
      (m[k] ||= []).push(r);
      return m;
    }, {});
  const status = (o) =>
    o >= 75 ? "बहुत अच्छी 🌟" : o >= 50 ? "ठीक-ठाक, सुधार जारी 📈" : "मेहनत की ज़रूरत 💪";

  function weekStart(iso) {
    const d = new Date(iso);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function compute() {
    const overall = avg(rows.map(pct));

    const subjects = Object.entries(group(rows, (r) => r.subject || "General"))
      .map(([name, rs]) => ({ name, value: avg(rs.map(pct)), count: rs.length }))
      .sort((a, b) => b.value - a.value);

    const topics = Object.entries(group(rows, (r) => r.topic || r.subject || "General")).map(
      ([name, rs]) => ({ name, value: avg(rs.map(pct)), count: rs.length })
    );
    const strong = topics.filter((t) => t.value >= 75).sort((a, b) => b.value - a.value);
    const weak = topics.filter((t) => t.value < 50).sort((a, b) => a.value - b.value);

    const wk = group(rows, (r) => weekStart(r.date).getTime());
    const weeks = Object.keys(wk)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(-8)
      .map((k) => ({
        label: new Date(k).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: avg(wk[k].map(pct)),
      }));

    return { overall, subjects, strong, weak, weeks };
  }

  function tips(s) {
    if (!rows.length) return ["अभी कोई स्कोर नहीं है। नीचे से अपना पहला टेस्ट स्कोर जोड़ें।"];
    const t = [];
    if (s.weak.length)
      t.push(`"${s.weak[0].name}" सबसे कमज़ोर है (औसत ${s.weak[0].value}%). रोज़ 20 मिनट सिर्फ़ इसी टॉपिक के सवाल हल करें।`);
    if (s.weak.length > 1)
      t.push(`इन टॉपिक्स पर भी ध्यान दें: ${s.weak.slice(1, 4).map((x) => x.name).join(", ")}।`);
    if (s.subjects.length > 1) {
      const low = s.subjects[s.subjects.length - 1];
      t.push(`"${low.name}" विषय सबसे पीछे है (${low.value}%). इसके पुराने पाठ दोबारा पढ़ें।`);
    }
    const w = s.weeks;
    if (w.length >= 2 && w[w.length - 1].value < w[w.length - 2].value)
      t.push("पिछले हफ़्ते से स्कोर गिरा है। अपना revision plan (7/15/30 दिन) फिर से देखें।");
    if (w.length >= 2 && w[w.length - 1].value > w[w.length - 2].value)
      t.push("स्कोर बढ़ रहा है, यही रफ़्तार बनाए रखें!");
    if (rows.length < 3) t.push("सही तस्वीर के लिए कम से कम 3 टेस्ट दें।");
    if (s.overall >= 75)
      t.push("बहुत अच्छा! अब टाइम-बाउंड मॉक टेस्ट दें, ताकि परीक्षा का दबाव संभालना आए।");
    return t;
  }

  function lineChart(weeks) {
    if (!weeks.length) return `<p class="an-empty">हफ़्तेवार डेटा अभी नहीं है।</p>`;
    const W = 600, H = 220, P = 30;
    const step = weeks.length > 1 ? (W - P * 2) / (weeks.length - 1) : 0;
    const pts = weeks.map((w, i) => ({
      x: weeks.length > 1 ? P + i * step : W / 2,
      y: H - P - (w.value / 100) * (H - P * 2),
      v: w.value,
      l: w.label,
    }));
    const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");
    const grid = [0, 50, 100]
      .map((g) => {
        const y = H - P - (g / 100) * (H - P * 2);
        return `<line x1="${P}" x2="${W - P}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.08)"/><text x="4" y="${y + 4}">${g}%</text>`;
      })
      .join("");
    const dots = pts
      .map(
        (p) =>
          `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#67e8f9" style="filter:drop-shadow(0 0 6px #22d3ee)"/>` +
          `<text x="${p.x}" y="${p.y - 10}" text-anchor="middle">${p.v}%</text>` +
          `<text x="${p.x}" y="${H - 8}" text-anchor="middle">${esc(p.l)}</text>`
      )
      .join("");
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Weekly progress">
      <defs>
        <linearGradient id="anG" x1="0" x2="1">
          <stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#f472b6"/>
        </linearGradient>
      </defs>
      ${grid}
      <polyline points="${poly}" fill="none" stroke="url(#anG)" stroke-width="3" style="filter:drop-shadow(0 0 6px #a78bfa)"/>
      ${dots}
    </svg>`;
  }

  function bars(list) {
    if (!list.length) return `<p class="an-empty">विषय-वार स्कोर अभी नहीं है।</p>`;
    return list
      .map(
        (s) => `<div class="an-bar">
          <div class="lbl"><span>${esc(s.name)} (${s.count})</span><b>${s.value}%</b></div>
          <div class="an-track"><div class="an-fill" style="width:${s.value}%"></div></div>
        </div>`
      )
      .join("");
  }

  function tags(list, cls) {
    if (!list.length)
      return `<p class="an-empty">${cls === "s" ? "अभी कोई मज़बूत टॉपिक नहीं (75%+)।" : "कोई कमज़ोर टॉपिक नहीं 🎉"}</p>`;
    return list.map((t) => `<span class="an-tag ${cls}">${esc(t.name)} · ${t.value}%</span>`).join("");
  }

  function records() {
    if (!rows.length) return `<p class="an-empty">कोई रिकॉर्ड नहीं।</p>`;
    return rows
      .slice()
      .reverse()
      .map(
        (r) => `<div class="an-rec">
          <span>${esc(r.subject)}${r.topic ? " · " + esc(r.topic) : ""} — <b>${r.score}/${r.total}</b> (${pct(r)}%)</span>
          <button data-id="${esc(r.id)}" type="button">हटाएँ</button>
        </div>`
      )
      .join("");
  }

  function render() {
    const s = compute();
    chat.innerHTML = `
      <div class="an-wrap">
        <h2>📊 Performance Analytics</h2>
        <p class="an-sub">आपकी तैयारी कैसी चल रही है, एक नज़र में</p>

        <div class="an-cards">
          <div class="an-stat"><b>${s.overall}%</b><span>कुल औसत · ${status(s.overall)}</span></div>
          <div class="an-stat"><b>${rows.length}</b><span>कुल टेस्ट</span></div>
          <div class="an-stat"><b>${s.strong.length}</b><span>मज़बूत टॉपिक</span></div>
          <div class="an-stat"><b>${s.weak.length}</b><span>कमज़ोर टॉपिक</span></div>
        </div>

        <div class="an-grid">
          <section class="an-card"><h3>विषय-वार स्कोर</h3>${bars(s.subjects)}</section>
          <section class="an-card"><h3>साप्ताहिक प्रगति</h3>${lineChart(s.weeks)}</section>
          <section class="an-card"><h3>💪 मज़बूत टॉपिक</h3>${tags(s.strong, "s")}</section>
          <section class="an-card"><h3>⚠️ कमज़ोर टॉपिक</h3>${tags(s.weak, "w")}</section>
        </div>

        <section class="an-card"><h3>💡 सुधार के सुझाव</h3>
          ${tips(s).map((t) => `<p class="an-tip">• ${esc(t)}</p>`).join("")}
        </section>

        <section class="an-card"><h3>➕ नया स्कोर जोड़ें</h3>
          <form id="anForm" class="an-form">
            <input name="subject" placeholder="विषय (जैसे Science)" required />
            <input name="topic" placeholder="टॉपिक (जैसे Light)" />
            <input name="score" type="number" min="0" placeholder="स्कोर" required />
            <input name="total" type="number" min="1" placeholder="कुल अंक" required />
            <button type="submit">सेव करें</button>
          </form>
          <p id="anMsg" class="an-empty"></p>
        </section>

        <section class="an-card"><h3>पिछले रिकॉर्ड</h3><div id="anRecs">${records()}</div></section>
      </div>`;

    form.style.display = "none";
    bind();
  }

  function bind() {
    document.getElementById("anForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const msg = document.getElementById("anMsg");
      const score = Number(f.score.value);
      const total = Number(f.total.value);
      if (total < 1 || score < 0 || score > total) {
        msg.textContent = "स्कोर 0 से कुल अंक के बीच होना चाहिए।";
        return;
      }
      try {
        const res = await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: f.subject.value.trim(),
            topic: f.topic.value.trim(),
            score,
            total,
          }),
        });
        if (!res.ok) throw new Error("save failed");
        await load();
        render();
      } catch {
        msg.textContent = "सेव नहीं हो पाया। सर्वर चल रहा है?";
      }
    });

    document.getElementById("anRecs").addEventListener("click", async (e) => {
      const id = e.target.dataset && e.target.dataset.id;
      if (!id) return;
      await fetch(`/api/analytics/${encodeURIComponent(id)}`, { method: "DELETE" });
      await load();
      render();
    });
  }

  async function load() {
    try {
      const res = await fetch("/api/analytics");
      rows = res.ok ? await res.json() : [];
    } catch {
      rows = [];
    }
  }

  async function open() {
    await load();
    render();
  }

  btn.addEventListener("click", open);

  // Koi aur sidebar button ya chat dabe to form wapas dikhe
  side.addEventListener("click", (e) => {
    if (!e.target.closest("#analyticsBtn")) form.style.display = "";
  });

  // Dusre features ke liye: exam ka result yahan se save ho sakta hai
  window.recordPerformance = async function (entry) {
    const res = await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.ok;
  };
})();