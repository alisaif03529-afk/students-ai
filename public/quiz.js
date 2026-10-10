// ---------- AI क्विज़ ----------
const quizBtn = document.getElementById("quizBtn");
quizBtn.addEventListener("click", showQuiz);

function showQuiz() {
  inNotes = true;
  currentId = null;
  form.style.display = "none";
  document.querySelectorAll("#list > div").forEach((d) => d.classList.remove("active"));
  chat.innerHTML = "";

  const head = document.createElement("div");
  head.className = "notes-head";
  head.innerHTML = "<h2>🎯 AI क्विज़</h2>";
  chat.appendChild(head);

  const box = document.createElement("div");
  box.className = "gen-box";

  const row = document.createElement("div");
  row.className = "gen-row";

  const cls = document.createElement("select");
  for (let n = 5; n <= 12; n++) {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = "कक्षा " + n;
    cls.appendChild(o);
  }

  const subject = document.createElement("input");
  subject.placeholder = "विषय (जैसे Science)";

  const chapter = document.createElement("input");
  chapter.placeholder = "अध्याय (जैसे Light)";

  const lang = document.createElement("select");
  [
    ["hindi", "हिंदी में"],
    ["english", "English में"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    lang.appendChild(o);
  });

  row.append(cls, subject, chapter, lang);

  const btn = document.createElement("button");
  btn.className = "gen-btn";
  btn.textContent = "🎯 क्विज़ शुरू करें";

  const out = document.createElement("div");
  out.className = "gen-out";

  btn.onclick = async () => {
    if (!subject.value.trim() || !chapter.value.trim()) {
      alert("विषय और अध्याय लिखें।");
      return;
    }
    btn.disabled = true;
    btn.textContent = "क्विज़ बन रहा है...";
    out.innerHTML = "<p class='notes-empty'>सोच रहा है...</p>";
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: cls.value,
          subject: subject.value.trim(),
          chapter: chapter.value.trim(),
          lang: lang.value,
        }),
      });
      if (res.status === 401) return (location.href = "/login.html");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "क्विज़ नहीं बन पाया।");
      startQuiz(data.questions, out);
    } catch (err) {
      out.innerHTML = "";
      const p = document.createElement("p");
      p.className = "notes-empty";
      p.textContent = err.message;
      out.appendChild(p);
    } finally {
      btn.disabled = false;
      btn.textContent = "🎯 क्विज़ शुरू करें";
    }
  };

  box.append(row, btn, out);
  chat.appendChild(box);
}

function startQuiz(questions, out) {
  let idx = 0;
  let score = 0;
  out.innerHTML = "";

  const show = () => {
    out.innerHTML = "";
    if (idx >= questions.length) {
      const res = document.createElement("div");
      res.className = "note-card";
      const pct = Math.round((score / questions.length) * 100);
      res.innerHTML = `<h3>🏆 आपका स्कोर: ${score} / ${questions.length} (${pct}%)</h3>`;
      const again = document.createElement("button");
      again.className = "gen-btn";
      again.textContent = "🔁 दोबारा खेलें";
      again.onclick = () => { idx = 0; score = 0; show(); };
      res.appendChild(again);
      out.appendChild(res);
      return;
    }

    const q = questions[idx];
    const card = document.createElement("div");
    card.className = "note-card";

    const prog = document.createElement("div");
    prog.className = "note-q";
    prog.textContent = `सवाल ${idx + 1} / ${questions.length}`;

    const qt = document.createElement("div");
    qt.className = "note-a";
    qt.style.fontWeight = "600";
    qt.textContent = q.q;

    const feedback = document.createElement("div");
    feedback.className = "note-a";
    feedback.style.marginTop = "8px";

    card.append(prog, qt);

    q.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.className = "quiz-opt";
      b.textContent = opt;
      b.onclick = () => {
        card.querySelectorAll(".quiz-opt").forEach((x) => (x.disabled = true));
        if (i === q.answer) {
          b.classList.add("right");
          score++;
          feedback.textContent = "✅ सही! " + (q.explanation || "");
        } else {
          b.classList.add("wrong");
          card.querySelectorAll(".quiz-opt")[q.answer].classList.add("right");
          feedback.textContent = "❌ गलत। सही उत्तर: " + q.options[q.answer] + ". " + (q.explanation || "");
        }
        const next = document.createElement("button");
        next.className = "gen-btn";
        next.style.marginTop = "10px";
        next.textContent = idx + 1 < questions.length ? "अगला सवाल →" : "परिणाम देखें";
        next.onclick = () => { idx++; show(); };
        card.appendChild(next);
      };
      card.appendChild(b);
    });

    card.appendChild(feedback);
    out.appendChild(card);
  };
  show();
}