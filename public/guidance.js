(function () {
  const chat = document.getElementById("chat");
  const form = document.getElementById("form");
  const side = document.getElementById("side");
  const btn = document.getElementById("guidanceBtn");
  if (!chat || !btn) return;

  const CSS = `
    .gd-wrap { max-width: 900px; margin: 0 auto; padding: 24px 18px 40px; color: #e5e7eb; font-family: "Outfit", "Segoe UI", sans-serif; }
    .gd-wrap h2 {
      margin: 0; font-size: 26px;
      background: linear-gradient(90deg, #67e8f9, #a78bfa, #f472b6);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .gd-sub { color: #a5a1c2; margin: 4px 0 16px; }
    .gd-tabs, .gd-levels { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .gd-tabs button, .gd-levels button {
      padding: 8px 14px; border-radius: 999px; cursor: pointer; font-family: inherit; font-size: 14px;
      background: rgba(15, 15, 30, 0.6); color: #ddd6fe;
      border: 1px solid rgba(167, 139, 250, 0.4); transition: box-shadow 0.25s ease;
    }
    .gd-tabs button:hover, .gd-levels button:hover { box-shadow: 0 0 14px rgba(103, 232, 249, 0.5); }
    .gd-tabs button.on, .gd-levels button.on {
      color: #0b1020; font-weight: 700; border-color: transparent;
      background: linear-gradient(90deg, #22d3ee, #a78bfa); box-shadow: 0 0 16px rgba(34, 211, 238, 0.5);
    }
    .gd-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .gd-card {
      border-radius: 18px; padding: 16px; background: rgba(15, 15, 30, 0.6);
      border: 1px solid rgba(167, 139, 250, 0.35); box-shadow: 0 0 18px rgba(167, 139, 250, 0.2);
    }
    .gd-card h3 { margin: 0 0 6px; font-size: 17px; color: #e9d5ff; }
    .gd-card p { margin: 4px 0; font-size: 14px; line-height: 1.6; color: #d4d4e8; }
    .gd-tag {
      display: inline-block; margin: 6px 6px 0 0; padding: 4px 10px; border-radius: 999px; font-size: 12px;
      background: rgba(34, 211, 238, 0.12); color: #67e8f9; border: 1px solid rgba(34, 211, 238, 0.4);
    }
    .gd-step { margin: 6px 0; padding-left: 4px; font-size: 14px; line-height: 1.5; }
    .gd-step b { color: #f9a8d4; }
    .gd-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
    .gd-form input, .gd-form select {
      padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(167, 139, 250, 0.4);
      background: rgba(10, 10, 25, 0.7); color: #f5f3ff; font: inherit; outline: none;
    }
    .gd-form input:focus, .gd-form select:focus { border-color: #22d3ee; box-shadow: 0 0 14px rgba(34, 211, 238, 0.6); }
    .gd-form button {
      grid-column: 1 / -1; padding: 11px; border: 0; border-radius: 12px; cursor: pointer;
      font-weight: 700; font-size: 15px; font-family: inherit; color: #0b1020;
      background: linear-gradient(90deg, #22d3ee, #a78bfa); box-shadow: 0 0 18px rgba(34, 211, 238, 0.5);
    }
    .gd-phase { border-left: 3px solid #22d3ee; padding: 6px 0 6px 12px; margin: 10px 0; }
    .gd-phase b { color: #67e8f9; }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Content ---------- */
  const CAREERS = [
    { icon: "💻", name: "Software Developer", level: "both",
      what: "Apps, websites aur software banana. Aaj sabse zyada demand wale fields mein se ek.",
      skills: ["Python / JavaScript", "Problem solving", "Git & GitHub"],
      path: ["Class 10 ke baad ya college mein: Python ya HTML/CSS/JS se shuruaat", "B.Tech (CS) / BCA ya online courses", "Har mahine ek chhota project GitHub par daalein", "Internship aur coding interview ki practice"] },
    { icon: "📊", name: "Data Analyst", level: "college",
      what: "Data se pattern nikaalna aur business ko decision lene mein madad karna.",
      skills: ["Excel", "SQL", "Python (pandas)", "Charts / dashboards"],
      path: ["Excel aur statistics ke basics", "SQL aur Python seekhein", "Public dataset par analysis karke portfolio banayein", "Internship ya entry-level role"] },
    { icon: "🩺", name: "Doctor (MBBS)", level: "school",
      what: "Logon ka ilaj aur health care. Lamba raasta lekin bahut sammaan wala.",
      skills: ["Biology aur Chemistry", "Patience", "Communication"],
      path: ["Class 11–12 mein PCB (Physics, Chemistry, Biology)", "NEET ki taiyari", "MBBS (5.5 saal) + internship", "NEET-PG ke baad specialization"] },
    { icon: "⚖️", name: "Lawyer (LLB)", level: "both",
      what: "Kanooni salah, court mein pairvi aur documents ka kaam.",
      skills: ["Reading aur writing", "Logic", "Bolne ki kala"],
      path: ["Class 12 ke baad CLAT ya state law entrance", "5 saal ka integrated LLB ya 3 saal ka LLB", "Senior lawyer ke saath internship", "Bar Council registration"] },
    { icon: "🎨", name: "UI / Graphic Designer", level: "both",
      what: "Apps, websites aur posters ka look aur feel design karna.",
      skills: ["Figma", "Color aur typography", "User experience ki samajh"],
      path: ["Design ke basics (rang, layout, font)", "Figma ya Canva seekhein", "10 design ka portfolio banayein", "Freelance ya internship se shuruaat"] },
    { icon: "📈", name: "Chartered Accountant (CA)", level: "college",
      what: "Accounts, tax aur audit ka kaam. Commerce students ke liye best option.",
      skills: ["Accounts", "Taxation", "Discipline aur padhai"],
      path: ["Class 11–12 Commerce", "CA Foundation (ICAI)", "Intermediate aur Final + articleship", "Practice ya job"] },
    { icon: "🏗️", name: "Civil Engineer", level: "both",
      what: "Sadak, building aur bridge jaise projects banana aur sambhaalna.",
      skills: ["Maths aur Physics", "AutoCAD", "Site management"],
      path: ["Class 12 mein PCM", "JEE Main ya state entrance", "B.Tech (Civil)", "GATE ya government/private job"] },
    { icon: "🏛️", name: "Government Exams", level: "both",
      what: "SSC, Bank, Railway, UPSC jaise exams. Stable career ke liye popular.",
      skills: ["General knowledge", "Maths aur reasoning", "Current affairs"],
      path: ["Exam ka syllabus aur pichhle saal ke papers dekhein", "Roz 1 ghanta maths aur reasoning", "Current affairs ka daily notes", "Mock tests aur analysis"] },
  ];

  const ROADMAPS = [
    { icon: "🐍", name: "Python", level: "both", steps: [
      ["Basics (3–4 hafte)", "Variables, if-else, loops, functions, list aur dictionary"],
      ["Projects (4 hafte)", "Calculator, quiz app, file handling wale chhote programs"],
      ["Advanced (6 hafte)", "Libraries jaise pandas, Flask, aur ek chhota web/data project"] ] },
    { icon: "🌐", name: "Web Development", level: "both", steps: [
      ["HTML aur CSS (3 hafte)", "Page ka structure, flexbox, responsive design"],
      ["JavaScript (4 hafte)", "DOM, events, fetch API, chhota interactive app"],
      ["Projects (4 hafte)", "Portfolio site, to-do app, aur ek full project"] ] },
    { icon: "📗", name: "Excel", level: "both", steps: [
      ["Basics (2 hafte)", "Formulas, sort, filter, cell formatting"],
      ["Intermediate (3 hafte)", "VLOOKUP, pivot table, conditional formatting"],
      ["Advanced (3 hafte)", "Dashboards, charts, aur real data se report banana"] ] },
    { icon: "🗣️", name: "Spoken English", level: "both", steps: [
      ["Daily habit (4 hafte)", "Roz 15 min sunna aur bolna, naye words ke 5 sentences"],
      ["Speaking practice (4 hafte)", "Apne aap se baat karna, short speech aur interviews ki practice"],
      ["Presentation (2 hafte)", "5 minute ka topic bolna aur record karke sudharna"] ] },
  ];

  const PROJECTS = {
    school: [
      { name: "Simple Calculator", diff: "Easy", skills: "Python ya JS, conditions", next: "History feature jodein" },
      { name: "Number Guessing Game", diff: "Easy", skills: "Loops, random", next: "Attempts ka count dikhayein" },
      { name: "Student Marks Calculator", diff: "Easy", skills: "Lists, average", next: "Grade (A, B, C) nikalein" },
      { name: "To-Do List", diff: "Medium", skills: "HTML, CSS, JS", next: "LocalStorage se data save karein" },
      { name: "Quiz App", diff: "Medium", skills: "Arrays, buttons, score", next: "Timer aur result page jodein" },
    ],
    college: [
      { name: "Expense Tracker", diff: "Medium", skills: "Database (SQL), forms", next: "Monthly chart jodein" },
      { name: "Library Management System", diff: "Medium", skills: "CRUD, database", next: "Login aur role add karein" },
      { name: "Weather App", diff: "Medium", skills: "API fetch, JS", next: "5 din ka forecast dikhayein" },
      { name: "Portfolio Website", diff: "Easy", skills: "HTML, CSS, responsive", next: "Projects ka section jodein" },
      { name: "Chat App", diff: "Hard", skills: "Node.js, Socket.io", next: "Login aur multiple rooms" },
      { name: "E-commerce Cart", diff: "Hard", skills: "Full stack, payments (test mode)", next: "Admin panel banayein" },
    ],
  };

  const PRACTICE_TIPS = {
    school: ["Roz 20 minute ek chhota program likhein.", "Pehle bina Google ke khud try karein, phir solution dekhein.", "Har program ko naam dekar GitHub ya notebook mein save karein."],
    college: ["Roz ek easy aur ek medium problem hal karein (LeetCode / HackerRank jaise platforms).", "Har project ka README likhein: kya banaya, kaise chalta hai.", "Ek project ko deploy karke live link resume mein daalein."],
  };

  /* ---------- State ---------- */
  const state = { tab: "career", level: "school" };

  const tabsHtml = () => {
    const T = [["career", "🧭 Career"], ["roadmap", "🗺️ Roadmap"], ["projects", "💻 Coding & Projects"], ["goal", "🎯 Goal Planner"]];
    return `<div class="gd-tabs">${T.map(([k, l]) => `<button type="button" data-tab="${k}" class="${state.tab === k ? "on" : ""}">${l}</button>`).join("")}</div>`;
  };

  const levelHtml = () => `
    <div class="gd-levels">
      <button type="button" data-level="school" class="${state.level === "school" ? "on" : ""}">🏫 School</button>
      <button type="button" data-level="college" class="${state.level === "college" ? "on" : ""}">🎓 College</button>
    </div>`;

  const fits = (item) => item.level === "both" || item.level === state.level;

  function careerBody() {
    return `<div class="gd-grid">${CAREERS.filter(fits).map((c) => `
      <div class="gd-card">
        <h3>${c.icon} ${esc(c.name)}</h3>
        <p>${esc(c.what)}</p>
        <div>${c.skills.map((s) => `<span class="gd-tag">${esc(s)}</span>`).join("")}</div>
        <p><b>Raasta:</b></p>
        ${c.path.map((p, i) => `<div class="gd-step">${i + 1}. ${esc(p)}</div>`).join("")}
      </div>`).join("")}</div>`;
  }

  function roadmapBody() {
    return `<div class="gd-grid">${ROADMAPS.filter(fits).map((r) => `
      <div class="gd-card">
        <h3>${r.icon} ${esc(r.name)} roadmap</h3>
        ${r.steps.map(([t, d], i) => `<div class="gd-step"><b>Step ${i + 1}: ${esc(t)}</b><br>${esc(d)}</div>`).join("")}
      </div>`).join("")}</div>`;
  }

  function projectsBody() {
    const list = PROJECTS[state.level];
    return `
      <div class="gd-card" style="margin-bottom:14px">
        <h3>✅ Practice ke tips</h3>
        ${PRACTICE_TIPS[state.level].map((t) => `<div class="gd-step">• ${esc(t)}</div>`).join("")}
      </div>
      <div class="gd-grid">${list.map((p) => `
        <div class="gd-card">
          <h3>${esc(p.name)}</h3>
          <span class="gd-tag">${esc(p.diff)}</span>
          <p><b>Skills:</b> ${esc(p.skills)}</p>
          <p><b>Next step:</b> ${esc(p.next)}</p>
        </div>`).join("")}</div>`;
  }

  function goalBody() {
    return `
      <div class="gd-card">
        <h3>🎯 Apna goal batayein</h3>
        <form id="gdGoal" class="gd-form">
          <input name="goal" placeholder="Goal (jaise Python seekhna)" required />
          <input name="weeks" type="number" min="1" max="52" placeholder="Kitne hafte (1–52)" required />
          <input name="hours" type="number" min="0.5" max="8" step="0.5" placeholder="Roz kitne ghante" required />
          <select name="level">
            <option value="school">School</option>
            <option value="college">College</option>
          </select>
          <button type="submit">Plan banayein</button>
        </form>
      </div>
      <div id="gdPlan"></div>`;
  }

  function buildPlan(goal, weeks, hours) {
    const phases = [
      { name: "बुनियाद (Basics)", share: 0.3, focus: "मूल concepts, छोटे उदाहरण" },
      { name: "अभ्यास (Practice)", share: 0.4, focus: "रोज़ छोटे सवाल या tasks हल करें" },
      { name: "प्रोजेक्ट (Build)", share: 0.2, focus: `"${goal}" से जुड़ा एक छोटा प्रोजेक्ट बनाएँ` },
      { name: "रिवीज़न (Revise)", share: 0.1, focus: "कमज़ोर हिस्से दोबारा, और एक self-test" },
    ];
    let rem = weeks;
    const rows = [];
    let start = 1;
    phases.forEach((p, i) => {
      let n = i === phases.length - 1 ? rem : Math.max(1, Math.round(weeks * p.share));
      n = Math.min(n, rem);
      rem -= n;
      if (n > 0) {
        rows.push({ ...p, from: start, to: start + n - 1 });
        start += n;
      }
    });

    const mins = Math.round(hours * 60);
    const theory = Math.round(mins * 0.4);
    const practice = Math.round(mins * 0.4);
    const revise = mins - theory - practice;

    return `
      <div class="gd-card" style="margin-top:14px">
        <h3>📅 "${esc(goal)}" ka plan</h3>
        <p>कुल ${weeks} हफ़्ते · रोज़ ${mins} मिनट</p>
        <p><b>रोज़ का बँटवारा:</b> पढ़ाई ${theory} मिनट · अभ्यास ${practice} मिनट · रिवीज़न ${revise} मिनट</p>
        ${rows.map((r) => `
          <div class="gd-phase">
            <b>हफ़्ता ${r.from}${r.to > r.from ? "–" + r.to : ""}: ${esc(r.name)}</b>
            <div>${esc(r.focus)}</div>
          </div>`).join("")}
        <p>${weeks >= 8 ? "हर हफ़्ते के आखिर में एक छोटा test दें।" : "हर 2–3 दिन में खुद से एक सवाल पूछकर देखें कि समझ आया या नहीं।"}</p>
      </div>`;
  }

  /* ---------- Render ---------- */
  function render() {
    let body = "";
    if (state.tab === "career") body = careerBody();
    if (state.tab === "roadmap") body = roadmapBody();
    if (state.tab === "projects") body = projectsBody();
    if (state.tab === "goal") body = goalBody();

    const showLevel = state.tab !== "goal";
    chat.innerHTML = `
      <div class="gd-wrap">
        <h2>🧭 Career & Skills Guidance</h2>
        <p class="gd-sub">School aur college, dono ke liye: career, skills aur goal ke hisaab se raasta</p>
        ${tabsHtml()}
        ${showLevel ? levelHtml() : ""}
        ${body}
      </div>`;
    form.style.display = "none";
  }

  /* ---------- Events ---------- */
  chat.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab],[data-level]");
    if (!t) return;
    if (t.dataset.tab) state.tab = t.dataset.tab;
    if (t.dataset.level) state.level = t.dataset.level;
    render();
  });

  chat.addEventListener("submit", (e) => {
    if (e.target.id !== "gdGoal") return;
    e.preventDefault();
    const f = e.target;
    const goal = f.goal.value.trim();
    const weeks = Math.min(52, Math.max(1, Math.round(Number(f.weeks.value))));
    const hours = Math.min(8, Math.max(0.5, Number(f.hours.value)));
    state.level = f.level.value;
    document.getElementById("gdPlan").innerHTML = buildPlan(goal, weeks, hours);
  });

  btn.addEventListener("click", render);

  // Koi aur sidebar button ya chat dabe to form wapas dikhe
  side.addEventListener("click", (e) => {
    if (!e.target.closest("#guidanceBtn")) form.style.display = "";
  });
})();