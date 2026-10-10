// ---------- AI डाउट सॉल्वर ----------
const doubtBtn = document.getElementById("doubtBtn");
doubtBtn.addEventListener("click", showDoubt);

function showDoubt() {
  inNotes = true;
  currentId = null;
  form.style.display = "none";
  document.querySelectorAll("#list > div").forEach((d) => d.classList.remove("active"));
  chat.innerHTML = "";

  const head = document.createElement("div");
  head.className = "notes-head";
  head.innerHTML = "<h2>🧮 AI डाउट सॉल्वर</h2>";
  chat.appendChild(head);

  const box = document.createElement("div");
  box.className = "gen-box";

  const hint = document.createElement("p");
  hint.className = "notes-empty";
  hint.textContent = "अपना सवाल लिखें। AI चरण-दर-चरण हल समझाएगा, ताकि आप सिर्फ़ उत्तर न रटें।";

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
  subject.placeholder = "विषय (जैसे Maths, Physics)";

  const lang = document.createElement("select");
  [
    ["hindi", "हिंदी में जवाब"],
    ["english", "English में जवाब"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    lang.appendChild(o);
  });

  row.append(cls, subject, lang);

  const question = document.createElement("textarea");
  question.rows = 4;
  question.placeholder = "अपना सवाल यहाँ लिखें...";
  question.className = "doubt-input";

  const btn = document.createElement("button");
  btn.className = "gen-btn";
  btn.textContent = "✨ हल समझाएँ";

  const out = document.createElement("div");
  out.className = "gen-out";

  btn.onclick = () => {
    const q = question.value.trim();
    if (!q) {
      alert("पहले सवाल लिखें।");
      return;
    }
    askDoubt({
      classLevel: cls.value,
      subject: subject.value.trim(),
      question: q,
      lang: lang.value,
      btn,
      out,
    });
  };

  box.append(hint, row, question, btn, out);
  chat.appendChild(box);
}

async function askDoubt({ classLevel, subject, question, lang, btn, out }) {
  btn.disabled = true;
  btn.textContent = "हल बना रहे हैं...";
  out.innerHTML = "";

  const card = document.createElement("div");
  card.className = "note-card gen-result";
  const body = document.createElement("div");
  body.className = "note-a";
  body.textContent = "सोच रहा है...";
  card.appendChild(body);
  out.appendChild(card);

  const label = `कक्षा ${classLevel} | ${subject || "सामान्य"} | ${question}`;
  let full = "";

  try {
    const res = await fetch("/api/doubt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classLevel, subject, question, lang }),
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

    addSaveButton(card, label, full);
  } catch (err) {
    console.error("Doubt error:", err);
    body.textContent = full || "हल नहीं हो पाया: " + (err && err.message ? err.message : "सर्वर से कनेक्ट नहीं हो पाया।");
  } finally {
    btn.disabled = false;
    btn.textContent = "✨ हल समझाएँ";
  }
}