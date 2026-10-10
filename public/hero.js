(function () {
  const chat = document.getElementById("chat");
  if (!chat) return;

  const CSS = `
    body.hero-on #swLamp { display: none !important; }
    #heroWrap { max-width: 1180px; margin: 0 auto; padding: 18px 18px 40px; font-family: "Outfit", "Segoe UI", sans-serif; color: #e5e7eb; box-sizing: border-box; }
    #heroWrap * { box-sizing: border-box; }

    .hr-card {
      display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; align-items: center;
      padding: 38px 42px; border-radius: 26px; position: relative; overflow: hidden; min-height: 320px;
      background:
        radial-gradient(circle at 78% 48%, rgba(139, 92, 246, 0.55), transparent 52%),
        radial-gradient(circle at 8% 100%, rgba(34, 211, 238, 0.2), transparent 45%),
        linear-gradient(120deg, #0d1030 0%, #1a1650 55%, #2a1c70 100%);
      border: 1px solid rgba(129, 140, 248, 0.45);
      box-shadow: 0 0 56px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    .hr-card::after {
      content: ""; position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.04) 50%, transparent 60%);
    }
    .hr-hello { font-size: 30px; font-weight: 700; color: #fff; }
    .hr-hello span { background: linear-gradient(90deg, #67e8f9, #c4b5fd); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hr-sub { color: #cbd5e1; margin-top: 6px; font-size: 16px; }
    .hr-tag {
      display: inline-flex; gap: 6px; align-items: center; margin-top: 20px; padding: 7px 16px; border-radius: 20px;
      background: rgba(99, 102, 241, 0.22); border: 1px solid rgba(129, 140, 248, 0.45); color: #c7d2fe; font-size: 14px;
    }
    .hr-title { margin-top: 14px; font-size: 42px; font-weight: 800; color: #fff; line-height: 1.12; }
    .hr-title b { background: linear-gradient(90deg, #22d3ee, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hr-bar { margin-top: 22px; height: 9px; border-radius: 10px; background: rgba(255, 255, 255, 0.15); overflow: hidden; max-width: 460px; }
    .hr-bar > i { display: block; height: 100%; width: var(--p, 0%); border-radius: 10px; background: linear-gradient(90deg, #22d3ee, #8b5cf6); box-shadow: 0 0 12px #22d3ee; }
    .hr-bar-t { font-size: 14px; color: #cbd5e1; margin-top: 8px; }
    .hr-btn {
      display: inline-flex; align-items: center; gap: 10px; margin-top: 24px; padding: 15px 30px; border: none; border-radius: 32px;
      cursor: pointer; color: #fff; font: 600 16px "Outfit", "Segoe UI", sans-serif;
      background: linear-gradient(90deg, #22d3ee, #3b82f6 70%, #6366f1); box-shadow: 0 0 26px rgba(34, 211, 238, 0.5);
      transition: transform .2s ease, filter .2s ease;
    }
    .hr-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
    .hr-btn svg { width: 18px; height: 18px; }

    .hr-art { display: grid; place-items: center; min-height: 300px; }
    .hr-art svg { width: 100%; max-width: 340px; height: auto; animation: hrFloat 4s ease-in-out infinite; filter: drop-shadow(0 0 22px rgba(139, 92, 246, 0.45)); }
    @keyframes hrFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

    .hr-ic {
      width: 50px; height: 50px; border-radius: 15px; flex: none; display: grid; place-items: center; color: #fff;
      background: linear-gradient(135deg, var(--c), color-mix(in srgb, var(--c) 55%, #000));
      box-shadow: 0 0 20px color-mix(in srgb, var(--c) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.25);
    }
    .hr-ic svg { width: 24px; height: 24px; }

    .hr-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 20px; }
    .hr-stat {
      display: flex; gap: 14px; align-items: center; padding: 18px; border-radius: 18px; min-width: 0;
      background: rgba(15, 18, 45, 0.92); border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .hr-stat:hover { transform: translateY(-2px); box-shadow: 0 0 22px color-mix(in srgb, var(--c) 35%, transparent); }
    .hr-stat .l { font-size: 13px; color: #94a3b8; white-space: nowrap; }
    .hr-stat .v { font-size: 26px; font-weight: 700; color: #fff; margin-top: 2px; }
    .hr-stat .n { font-size: 12px; color: var(--c); margin-top: 2px; }

    .hr-tools-h { margin-top: 30px; }
    .hr-tools-t { font-size: 24px; font-weight: 700; color: #fff; }
    .hr-tools-t span { color: #67e8f9; }
    .hr-tools-s { font-size: 14px; color: #94a3b8; margin-top: 4px; }
    .hr-tools { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 14px; }
    .hr-tool {
      position: relative; text-align: left; cursor: pointer; padding: 20px; min-height: 190px; min-width: 0;
      border-radius: 20px; color: #fff; font-family: "Outfit", "Segoe UI", sans-serif;
      background: linear-gradient(160deg, color-mix(in srgb, var(--c) 30%, #0f1232), #0f1232 75%);
      border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .hr-tool:hover { transform: translateY(-4px); box-shadow: 0 0 28px color-mix(in srgb, var(--c) 45%, transparent); }
    .hr-tool .t { font-weight: 700; font-size: 16px; margin-top: 16px; }
    .hr-tool .d { font-size: 13.5px; color: #cbd5e1; margin-top: 6px; line-height: 1.45; }
    .hr-go {
      position: absolute; top: 18px; right: 18px; width: 34px; height: 34px; border-radius: 50%;
      display: grid; place-items: center; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255,255,255,.25);
    }
    .hr-go svg { width: 16px; height: 16px; }

    @media (min-width: 1400px) {
      #heroWrap { max-width: 1280px; }
      .hr-title { font-size: 48px; }
      .hr-art svg { max-width: 380px; }
    }

    @media (max-width: 860px) {
      .hr-card { grid-template-columns: 1fr; padding: 24px; gap: 8px; }
      .hr-art { order: -1; min-height: 0; }
      .hr-art svg { max-width: 200px; }
      .hr-title { font-size: 30px; }
      .hr-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .hr-tools { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 520px) {
      #heroWrap { padding: 10px 10px 130px; }
      .hr-card { padding: 18px; border-radius: 20px; }
      .hr-art svg { max-width: 150px; }
      .hr-hello { font-size: 22px; }
      .hr-sub { font-size: 13px; }
      .hr-tag { font-size: 12px; margin-top: 12px; padding: 5px 12px; }
      .hr-title { font-size: 24px; margin-top: 8px; }
      .hr-bar { margin-top: 14px; }
      .hr-bar-t { font-size: 12px; }
      .hr-btn { width: 100%; justify-content: center; font-size: 14px; padding: 13px 18px; margin-top: 16px; }
      .hr-stats { gap: 10px; margin-top: 14px; }
      .hr-stat { padding: 12px; gap: 8px; flex-direction: column; align-items: flex-start; border-radius: 16px; }
      .hr-ic { width: 38px; height: 38px; border-radius: 12px; }
      .hr-ic svg { width: 19px; height: 19px; }
      .hr-stat .l { font-size: 11px; white-space: normal; }
      .hr-stat .v { font-size: 19px; }
      .hr-stat .n { font-size: 10.5px; }
      .hr-tools-h { margin-top: 22px; }
      .hr-tools-t { font-size: 19px; }
      .hr-tools-s { font-size: 12px; }
      .hr-tools { gap: 10px; }
      .hr-tool { min-height: 150px; padding: 15px; border-radius: 16px; }
      .hr-tool .hr-ic { width: 40px; height: 40px; }
      .hr-tool .t { font-size: 14px; margin-top: 10px; padding-right: 26px; }
      .hr-tool .d { font-size: 12px; }
      .hr-go { top: 12px; right: 12px; width: 28px; height: 28px; }
      .hr-go svg { width: 13px; height: 13px; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const icon = (body) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  const I = {
    book: icon(`<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>`),
    clock: icon(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`),
    target: icon(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>`),
    flame: icon(`<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-2 4-2 4s-2-1-2-4c-2 3-4 5-4 10 0 4 3 7 5 7z"/>`),
    help: icon(`<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7"/><line x1="12" y1="17" x2="12" y2="17.01"/>`),
    check: icon(`<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12l3 3 5-6"/>`),
    file: icon(`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>`),
    cap: icon(`<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/>`),
    arrow: icon(`<path d="M5 12h14M13 6l6 6-6 6"/>`),
  };

  const MASCOT = `
    <svg viewBox="0 0 320 320" aria-hidden="true">
      <defs>
        <radialGradient id="hrGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#8b5cf6" stop-opacity=".55"/>
          <stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="hrHead" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#bfe3ff"/>
        </linearGradient>
        <linearGradient id="hrVisor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#23206b"/>
          <stop offset="1" stop-color="#0a0e2e"/>
        </linearGradient>
        <linearGradient id="hrCap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#60a5fa"/>
          <stop offset="1" stop-color="#1e3a8a"/>
        </linearGradient>
        <linearGradient id="hrBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e0f2fe"/>
          <stop offset="1" stop-color="#7dd3fc"/>
        </linearGradient>
        <linearGradient id="hrPad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#60a5fa"/>
          <stop offset="1" stop-color="#2563eb"/>
        </linearGradient>
        <filter id="hrNeon" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <circle cx="160" cy="165" r="150" fill="url(#hrGlow)"/>
      <circle cx="160" cy="165" r="132" fill="none" stroke="#a78bfa" stroke-opacity=".5" stroke-width="2"/>
      <circle cx="28" cy="110" r="4" fill="#38bdf8"/>
      <circle cx="296" cy="96" r="5" fill="#c084fc"/>
      <circle cx="38" cy="232" r="3" fill="#67e8f9"/>
      <circle cx="292" cy="236" r="4" fill="#a78bfa"/>

      <line x1="160" y1="66" x2="160" y2="44" stroke="#67e8f9" stroke-width="3"/>
      <circle cx="160" cy="38" r="8" fill="#22d3ee" filter="url(#hrNeon)"/>

      <polygon points="96,104 160,80 224,104 160,128" fill="url(#hrCap)"/>
      <path d="M118 116 V134 Q160 148 202 134 V116 Z" fill="#1e3a8a"/>
      <line x1="210" y1="106" x2="210" y2="132" stroke="#facc15" stroke-width="3"/>
      <circle cx="210" cy="136" r="5" fill="#facc15"/>

      <rect x="92" y="108" width="136" height="104" rx="38" fill="url(#hrHead)" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.5"/>

      <rect x="78" y="140" width="18" height="42" rx="9" fill="url(#hrPad)"/>
      <rect x="224" y="140" width="18" height="42" rx="9" fill="url(#hrPad)"/>

      <rect x="110" y="140" width="100" height="58" rx="24" fill="url(#hrVisor)"/>
      <path d="M128 170 Q140 152 152 170" stroke="#22d3ee" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#hrNeon)"/>
      <path d="M168 170 Q180 152 192 170" stroke="#22d3ee" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#hrNeon)"/>
      <path d="M142 184 Q160 200 178 184" stroke="#22d3ee" stroke-width="4.5" fill="none" stroke-linecap="round" filter="url(#hrNeon)"/>

      <rect x="108" y="214" width="104" height="70" rx="32" fill="url(#hrBody)"/>

      <rect x="96" y="224" width="26" height="52" rx="13" fill="url(#hrBody)"/>
      <rect x="198" y="224" width="26" height="52" rx="13" fill="url(#hrBody)"/>

      <path d="M160 232 Q140 220 120 226 V268 Q140 262 160 272 Z" fill="#f8fafc"/>
      <path d="M160 232 Q180 220 200 226 V268 Q180 262 160 272 Z" fill="#e2e8f0"/>
      <line x1="160" y1="232" x2="160" y2="272" stroke="#94a3b8" stroke-width="2"/>
      <line x1="130" y1="238" x2="150" y2="242" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="170" y1="242" x2="190" y2="238" stroke="#cbd5e1" stroke-width="2"/>

      <ellipse cx="160" cy="290" rx="78" ry="9" fill="#22d3ee" fill-opacity=".35"/>
    </svg>`;

  const STATS = [
    { c: "#3b82f6", ic: I.book, l: "Total Topics", n: "Analytics se", key: "topics" },
    { c: "#06b6d4", ic: I.clock, l: "Study Time", n: "Jald jodenge", v: "—" },
    { c: "#8b5cf6", ic: I.target, l: "Daily Goal", n: "Jald jodenge", v: "—" },
    { c: "#f97316", ic: I.flame, l: "Learning Streak", n: "Game se", v: "—" },
  ];

  const TOOLS = [
    { id: "doubtBtn", c: "#a855f7", ic: I.help, t: "AI Doubt Solver", d: "Har sawal ka turant jawab" },
    { id: "quizBtn", c: "#3b82f6", ic: I.check, t: "AI Quiz", d: "Practice karke knowledge badhayein" },
    { id: "notesBtn", c: "#10b981", ic: I.file, t: "My Notes", d: "Save, organize aur revise karein" },
    { id: "examBtn", c: "#f59e0b", ic: I.cap, t: "Exam Preparation", d: "Smart study plan banayein" },
  ];

  async function loadName() {
    try {
      const r = await fetch("/api/profile", { credentials: "same-origin" });
      if (r.ok) {
        const d = await r.json();
        const p = d.profile || d;
        if (p && p.displayName) return p.displayName;
      }
    } catch {}
    const who = document.getElementById("who");
    const t = who ? who.textContent.split(",").pop().trim() : "";
    return t || "Student";
  }

  async function loadTopics() {
    try {
      const r = await fetch("/api/analytics", { credentials: "same-origin" });
      if (!r.ok) return 0;
      const d = await r.json();
      const arr = Array.isArray(d) ? d : d.list || d.items || [];
      return arr.length;
    } catch {
      return 0;
    }
  }

  let mounting = false;

  function isEmpty() {
    return [...chat.children].every((c) => c.id === "heroWrap");
  }

  async function mount() {
    if (mounting || document.getElementById("heroWrap")) return;
    mounting = true;
    const [name, topics] = await Promise.all([loadName(), loadTopics()]);
    mounting = false;
    if (document.getElementById("heroWrap") || !isEmpty()) return;

    const statsHtml = STATS.map((s) => {
      const value = s.key === "topics" ? topics : s.v;
      return `
        <div class="hr-stat" style="--c:${s.c}">
          <div class="hr-ic" style="--c:${s.c}">${s.ic}</div>
          <div>
            <div class="l">${s.l}</div>
            <div class="v">${value}</div>
            <div class="n">${s.n}</div>
          </div>
        </div>`;
    }).join("");

    const toolsHtml = TOOLS.map(
      (x) => `
        <button class="hr-tool" data-go="${x.id}" type="button" style="--c:${x.c}">
          <div class="hr-ic" style="--c:${x.c}">${x.ic}</div>
          <div class="t">${x.t}</div>
          <div class="d">${x.d}</div>
          <span class="hr-go">${I.arrow}</span>
        </button>`
    ).join("");

    const wrap = document.createElement("div");
    wrap.id = "heroWrap";
    wrap.innerHTML = `
      <div class="hr-card">
        <div>
          <div class="hr-hello">Hello, <span>${esc(name)}</span> 👋</div>
          <div class="hr-sub">Ready to learn something amazing today?</div>
          <div class="hr-tag">🎯 Your Study Goal</div>
          <div class="hr-title">Be a <b>Better</b> Version<br>of <b>Yourself</b></div>
          <div class="hr-bar"><i style="--p:0%"></i></div>
          <div class="hr-bar-t">0 / 5 topics completed</div>
          <button class="hr-btn" id="hrContinue" type="button">${I.book}<span>Continue Learning</span>${I.arrow}</button>
        </div>
        <div class="hr-art">${MASCOT}</div>
      </div>

      <div class="hr-stats">${statsHtml}</div>

      <div class="hr-tools-h">
        <div class="hr-tools-t">Explore <span>Study Tools</span></div>
        <div class="hr-tools-s">Everything you need to learn, practice and grow.</div>
      </div>
      <div class="hr-tools">${toolsHtml}</div>`;

    chat.appendChild(wrap);
    wrap.querySelector("#hrContinue").addEventListener("click", () => {
      const input = document.getElementById("input");
      if (input) input.focus();
    });
    wrap.querySelectorAll("[data-go]").forEach((b) =>
      b.addEventListener("click", () => {
        const target = document.getElementById(b.dataset.go);
        if (target) target.click();
      })
    );
  }

  function sync() {
    const empty = isEmpty();
    document.body.classList.toggle("hero-on", empty);
    if (empty) {
      mount();
    } else {
      const h = document.getElementById("heroWrap");
      if (h) h.remove();
    }
  }

  new MutationObserver(sync).observe(chat, { childList: true });
  sync();
})();