// ---------- Exam Preparation ----------
let examTimer = null;
const examBtn = document.getElementById("examBtn");
examBtn.addEventListener("click", showExamHub);

const MODE_LABEL = {
  mock: "🧪 Mock Test",
  pyq: "📜 Previous-Year Style",
  chapter: "📘 Chapter-wise Test",
};
const LANG_ITEMS = [["hindi", "हिंदी में"], ["english", "English में"]];

function makeSel(items, selected) {
  const s = document.createElement("select");
  items.forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    s.appendChild(o);
  });
  if (selected) s.value = selected;
  return s;
}
function classItems() {
  const a = [];
  for (let n = 5; n <= 12; n++) a.push([String(n), "कक्षा " + n]);
  return a;
}
function makeInp(ph) {
  const i = document.createElement("input");
  i.placeholder = ph;
  return i;
}
function fmt(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
}

function showExamHub() {
  clearInterval(examTimer);
  inNotes = true;
  currentId = null;
  form.style.display = "none";
  document.querySelectorAll("#list > div").forEach((d) => d.classList.remove("active"));
  chat.innerHTML = "";

  const head = document.createElement("div");
  head.className = "notes-head";
  head.innerHTML = "<h2>🏆 Exam Preparation</h2>";

  const tabs = document.createElement("div");
  tabs.className = "exam-tabs";
  const panel = document.createElement("div");

  const tabBtns = [["test", "🧪 टेस्ट"], ["plan", "📅 Revision Plan"]].map(([k, t]) => {
    const b = document.createElement("button");
    b.className = "exam-tab";
    b.textContent = t;
    b.onclick = () => {
      tabBtns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      if (k === "test") renderTestForm(panel);
      else renderPlanForm(panel);
    };
    tabs.appendChild(b);
    return b;
  });
  tabBtns[0].classList.add("active");

  chat.append(head, tabs, panel);
  renderTestForm(panel);
}

// ---------- टेस्ट सेटअप ----------
function renderTestForm(panel) {
  clearInterval(examTimer);
  panel.innerHTML = "";
  const box = document.createElement("div");
  box.className = "gen-box";

  const title = document.createElement("h3");
  title.textContent = "🧪 टेस्ट सेटअप";

  const hint = document.createElement("p");
  hint.className = "notes-empty";
  hint.textContent =
    "Mock: पूरा विषय। PYQ: बोर्ड जैसी शैली। Chapter-wise: केवल एक अध्याय। अंत में स्कोर, कमज़ोर टॉपिक और सही उत्तर दिखेंगे।";

  const r1 = document.createElement("div");
  r1.className = "gen-row";
  const mode = makeSel(Object.entries(MODE_LABEL));
  const cls = makeSel(classItems(), "8");
  const subject = makeInp("विषय (जैसे Science)");
  const chapter = makeInp("अध्याय (Chapter-wise के लिए ज़रूरी)");
  r1.append(mode, cls, subject, chapter);

  const r2 = document.createElement("div");
  r2.className = "gen-row";
  const count = makeSel([["10", "10 प्रश्न"], ["15", "15 प्रश्न"], ["20", "20 प्रश्न"]]);
  const timeSel = makeSel([
    ["0", "⏱ बिना समय सीमा"],
    ["10", "Timed: 10 मिनट"],
    ["20", "Timed: 20 मिनट"],
    ["30", "Timed: 30 मिनट"],
  ]);
  const lang = makeSel(LANG_ITEMS);
  r2.append(count, timeSel, lang);

  const btn = document.createElement("button");
  btn.className = "gen-btn";
  btn.textContent = "🚀 टेस्ट शुरू करें";

  const out = document.createElement("div");
  out.className = "gen-out";

  btn.onclick = async () => {
    const m = mode.value;
    const subj = subject.value.trim();
    const chap = chapter.value.trim();
    if (!subj) return alert("विषय लिखें।");
    if (m === "chapter" && !chap) return alert("Chapter-wise टेस्ट के लिए अध्याय लिखें।");

    const chapFinal = chap || "पूरा सिलेबस";
    const meta = { title: `${MODE_LABEL[m]} | कक्षा ${cls.value} | ${subj} | ${chapFinal}` };
    const minutes = Number(timeSel.value);

    btn.disabled = true;
    out.innerHTML = "";
    const wait = document.createElement("p");
    wait.className = "notes-empty";
    wait.textContent = "टेस्ट बन रहा है... (लगभग 30-60 सेकंड)";
    out.appendChild(wait);

    try {
      const res = await fetch("/api/exam-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: m,
          classLevel: cls.value,
          subject: subj,
          chapter: chapFinal,
          count: count.value,
          lang: lang.value,
        }),
      });
      if (res.status === 401) return (location.href = "/login.html");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "टेस्ट नहीं बन पाया।");
      runExam(data, minutes, out, meta);
    } catch (err) {
      out.innerHTML = "";
      const p = document.createElement("p");
      p.className = "notes-empty";
      p.textContent = err.message;
      out.appendChild(p);
    } finally {
      btn.disabled = false;
    }
  };

  box.append(title, hint, r1, r2, btn, out);
  panel.appendChild(box);
}

// ---------- टेस्ट चलाना, टाइमर और परिणाम ----------
function runExam(data, minutes, out, meta) {
  clearInterval(examTimer);
  const qs = data.questions;
  const answers = qs.map(() => null);
  let idx = 0;
  let left = minutes * 60;
  const started = Date.now();

  out.innerHTML = "";
  const root = document.createElement("div");
  root.className = "exam-root";
  out.appendChild(root);

  const restart = () => runExam(data, minutes, out, meta);

  const finish = (auto) => {
    clearInterval(examTimer);
    const used = Math.round((Date.now() - started) / 1000);
    const r = evaluate(qs, answers);
    renderResult(root, qs, answers, r, used, auto, meta, restart);
  };

  const draw = () => {
    root.innerHTML = "";

    const top = document.createElement("div");
    top.className = "exam-top";
    const info = document.createElement("span");
    info.textContent = `${meta.title} | सवाल ${idx + 1}/${qs.length} | उत्तर दिए: ${answers.filter((a) => a !== null).length}`;
    top.appendChild(info);
    if (minutes > 0) {
      const t = document.createElement("span");
      t.className = "exam-timer";
      t.id = "examTimerEl";
      t.textContent = "⏱ " + fmt(left);
      top.appendChild(t);
    }
    root.appendChild(top);

    const q = qs[idx];
    const card = document.createElement("div");
    card.className = "note-card";

    const qt = document.createElement("div");
    qt.className = "note-a";
    qt.style.fontWeight = "600";
    qt.textContent = `${idx + 1}. ${q.q}`;
    card.appendChild(qt);

    q.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.className = "quiz-opt" + (answers[idx] === i ? " selected" : "");
      b.textContent = String.fromCharCode(65 + i) + ". " + opt;
      b.onclick = () => {
        answers[idx] = i;
        draw();
      };
      card.appendChild(b);
    });
    root.appendChild(card);

    const map = document.createElement("div");
    map.className = "exam-map";
    qs.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "exam-num" + (i === idx ? " cur" : "") + (answers[i] !== null ? " done" : "");
      b.textContent = i + 1;
      b.onclick = () => {
        idx = i;
        draw();
      };
      map.appendChild(b);
    });
    root.appendChild(map);

    const nav = document.createElement("div");
    nav.className = "exam-nav";

    const prev = document.createElement("button");
    prev.className = "gen-btn";
    prev.textContent = "← पिछला";
    prev.disabled = idx === 0;
    prev.onclick = () => {
      idx--;
      draw();
    };

    const next = document.createElement("button");
    next.className = "gen-btn";
    next.textContent = "अगला →";
    next.disabled = idx === qs.length - 1;
    next.onclick = () => {
      idx++;
      draw();
    };

    const submit = document.createElement("button");
    submit.className = "gen-btn";
    submit.textContent = "✅ परीक्षा समाप्त करें";
    submit.onclick = () => {
      if (confirm("परीक्षा समाप्त करें?")) finish(false);
    };

    nav.append(prev, next, submit);
    root.appendChild(nav);
  };

  draw();

  if (minutes > 0) {
    examTimer = setInterval(() => {
      // अगर उपयोगकर्ता किसी और पेज पर चला गया, तो टाइमर बंद
      if (!document.body.contains(root)) {
        clearInterval(examTimer);
        return;
      }
      left--;
      const el = document.getElementById("examTimerEl");
      if (el) el.textContent = "⏱ " + fmt(Math.max(left, 0));
      if (left <= 0) {
        clearInterval(examTimer);
        alert("समय समाप्त! आपका टेस्ट जमा हो रहा है।");
        finish(true);
      }
    }, 1000);
  }
}

function evaluate(qs, answers) {
  let score = 0;
  const topics = {};
  qs.forEach((q, i) => {
    const t = q.topic || "सामान्य";
    if (!topics[t]) topics[t] = { total: 0, correct: 0 };
    topics[t].total++;
    if (answers[i] === q.answer) {
      score++;
      topics[t].correct++;
    }
  });
  const weak = Object.entries(topics)
    .filter(([, v]) => v.correct / v.total < 0.5)
    .map(([k, v]) => ({ topic: k, pct: Math.round((v.correct / v.total) * 100) }));
  return { score, topics, weak };
}

function renderResult(root, qs, answers, r, used, auto, meta, restart) {
  root.innerHTML = "";
  const pct = Math.round((r.score / qs.length) * 100);

  // सारांश
  const sum = document.createElement("div");
  sum.className = "note-card";
  const h = document.createElement("h3");
  h.textContent = `🏆 परिणाम: ${r.score} / ${qs.length} (${pct}%)`;
  const m = document.createElement("p");
  m.className = "notes-empty";
  m.textContent = meta.title;
  const t = document.createElement("p");
  t.className = "notes-empty";
  t.textContent = `समय: ${fmt(used)}${auto ? " | समय समाप्त होने पर स्वतः जमा" : ""}`;
  sum.append(h, m, t);

  // टॉपिक-वार विश्लेषण और कमज़ोर टॉपिक
  const wk = document.createElement("div");
  wk.className = "note-card";
  const wh = document.createElement("h3");
  wh.textContent = "📊 टॉपिक-वार विश्लेषण";
  wk.appendChild(wh);
  Object.entries(r.topics).forEach(([name, v]) => {
    const pc = Math.round((v.correct / v.total) * 100);
    const p = document.createElement("div");
    p.className = "note-a";
    p.textContent = `${pc >= 50 ? "🟢" : "🔴"} ${name}: ${v.correct}/${v.total} (${pc}%)`;
    wk.appendChild(p);
  });
  const verdict = document.createElement("p");
  verdict.className = "note-a";
  verdict.style.fontWeight = "600";
  verdict.textContent = r.weak.length
    ? "⚠️ कमज़ोर टॉपिक: " + r.weak.map((x) => x.topic).join(", ") + ". इन पर Revision Plan बनाएँ।"
    : "🎉 सभी टॉपिक में अच्छा प्रदर्शन!";
  wk.appendChild(verdict);

  // समीक्षा
  const rv = document.createElement("div");
  rv.className = "note-card";
  const rh = document.createElement("h3");
  rh.textContent = "📖 समीक्षा (सही उत्तर और व्याख्या)";
  rv.appendChild(rh);
  qs.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    const block = document.createElement("div");
    block.className = "review-item";

    const qq = document.createElement("div");
    qq.className = "note-a";
    qq.style.fontWeight = "600";
    qq.textContent = `${i + 1}. ${q.q}`;

    const yours = document.createElement("div");
    yours.className = "note-a";
    yours.textContent =
      "आपका उत्तर: " + (answers[i] === null ? "नहीं दिया" : q.options[answers[i]]) + (ok ? " ✅" : " ❌");

    const right = document.createElement("div");
    right.className = "note-a";
    right.textContent = "सही उत्तर: " + q.options[q.answer];

    const ex = document.createElement("div");
    ex.className = "note-a";
    ex.textContent = q.explanation ? "💡 " + q.explanation : "";

    block.append(qq, yours, right, ex);
    rv.appendChild(block);
  });

  const retry = document.createElement("button");
  retry.className = "gen-btn";
  retry.textContent = "🔁 दोबारा दें";
  retry.onclick = restart;

  root.append(sum, wk, rv, retry);
}

// ---------- Revision Plan (7 / 15 / 30 दिन) ----------
function renderPlanForm(panel) {
  clearInterval(examTimer);
  panel.innerHTML = "";
  const box = document.createElement("div");
  box.className = "gen-box";

  const title = document.createElement("h3");
  title.textContent = "📅 Revision Plan";

  const r1 = document.createElement("div");
  r1.className = "gen-row";
  const days = makeSel([["7", "7 दिन"], ["15", "15 दिन"], ["30", "30 दिन"]]);
  const cls = makeSel(classItems(), "8");
  const subject = makeInp("विषय (जैसे Maths)");
  const chapter = makeInp("अध्याय (खाली = पूरा सिलेबस)");
  r1.append(days, cls, subject, chapter);

  const r2 = document.createElement("div");
  r2.className = "gen-row";
  const hours = makeSel(
    [["1", "रोज़ 1 घंटा"], ["2", "रोज़ 2 घंटे"], ["3", "रोज़ 3 घंटे"], ["4", "रोज़ 4 घंटे"]],
    "2"
  );
  const lang = makeSel(LANG_ITEMS);
  r2.append(hours, lang);

  const btn = document.createElement("button");
  btn.className = "gen-btn";
  btn.textContent = "📅 योजना बनाएँ";

  const out = document.createElement("div");
  out.className = "gen-out";

  btn.onclick = async () => {
    const subj = subject.value.trim();
    if (!subj) return alert("विषय लिखें।");
    const chapFinal = chapter.value.trim() || "पूरा सिलेबस";
    const label = `Revision Plan | ${days.value} दिन | कक्षा ${cls.value} | ${subj} | ${chapFinal}`;

    btn.disabled = true;
    btn.textContent = "योजना बन रही है...";
    out.innerHTML = "";
    const card = document.createElement("div");
    card.className = "note-card gen-result";
    const body = document.createElement("div");
    body.className = "note-a";
    body.textContent = "सोच रहा है...";
    card.appendChild(body);
    out.appendChild(card);

    let full = "";
    try {
      const res = await fetch("/api/revision-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: days.value,
          classLevel: cls.value,
          subject: subj,
          chapter: chapFinal,
          hours: hours.value,
          lang: lang.value,
        }),
      });
      if (res.status === 401) return (location.href = "/login.html");
      if (!res.ok) {
        render(body, await res.text());
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        render(body, full);
      }
      full += decoder.decode();
      render(body, full);

      const bar = document.createElement("div");
      bar.className = "note-bar";
      const dl = document.createElement("button");
      dl.className = "note-dl";
      dl.textContent = "⬇ .txt";
      dl.onclick = () => downloadText(`revision-${days.value}days-${subj}.txt`, full);
      bar.appendChild(dl);
      card.appendChild(bar);
      addSaveButton(card, label, full);
    } catch (err) {
      console.error("Plan error:", err);
      body.textContent = full || "योजना नहीं बन पाई: " + (err && err.message ? err.message : "सर्वर से कनेक्ट नहीं हो पाया।");
    } finally {
      btn.disabled = false;
      btn.textContent = "📅 योजना बनाएँ";
    }
  };

  box.append(title, r1, r2, btn, out);
  panel.appendChild(box);
}