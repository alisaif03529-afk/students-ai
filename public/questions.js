// ---------- प्रश्न जनरेटर (Short / Long / MCQ) ----------
const qgenBtn = document.getElementById("qgenBtn");
qgenBtn.addEventListener("click", showQGen);

function showQGen() {
  inNotes = true;
  currentId = null;
  form.style.display = "none";
  document.querySelectorAll("#list > div").forEach((d) => d.classList.remove("active"));
  chat.innerHTML = "";

  const head = document.createElement("div");
  head.className = "notes-head";
  head.innerHTML = "<h2>📝 प्रश्न जनरेटर</h2>";
  chat.appendChild(head);

  const box = document.createElement("div");
  box.className = "gen-box";

  const row1 = document.createElement("div");
  row1.className = "gen-row";

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

  row1.append(cls, subject, chapter);

  const row2 = document.createElement("div");
  row2.className = "gen-row";

  const type = document.createElement("select");
  [
    ["short", "छोटे प्रश्न (Short)"],
    ["long", "लंबे प्रश्न (Long)"],
    ["mcq", "MCQ (बहुविकल्पीय)"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    type.appendChild(o);
  });

  const count = document.createElement("select");
  [5, 10, 15, 20].forEach((n) => {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = n + " प्रश्न";
    count.appendChild(o);
  });
  count.value = "10";

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

  row2.append(type, count, lang);

  const btn = document.createElement("button");
  btn.className = "gen-btn";
  btn.textContent = "✨ प्रश्न बनाएँ";

  const out = document.createElement("div");
  out.className = "gen-out";

  btn.onclick = async () => {
    if (!subject.value.trim() || !chapter.value.trim()) {
      alert("विषय और अध्याय लिखें।");
      return;
    }
    btn.disabled = true;
    btn.textContent = "प्रश्न बन रहे हैं...";
    out.innerHTML = "";

    const card = document.createElement("div");
    card.className = "note-card gen-result";
    const body = document.createElement("div");
    body.className = "note-a";
    body.textContent = "सोच रहा है...";
    card.appendChild(body);
    out.appendChild(card);

    const label = `${type.options[type.selectedIndex].text} | कक्षा ${cls.value} | ${subject.value.trim()} | ${chapter.value.trim()}`;
    let full = "";
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: cls.value,
          subject: subject.value.trim(),
          chapter: chapter.value.trim(),
          type: type.value,
          count: count.value,
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
      dl.onclick = () => downloadText(`प्रश्न-${subject.value}-${chapter.value}-${type.value}.txt`, full);
      bar.appendChild(dl);
      card.appendChild(bar);
      addSaveButton(card, label, full);
    } catch (err) {
      console.error("Question gen error:", err);
      body.textContent = full || "प्रश्न बनाने में समस्या: " + (err && err.message ? err.message : "सर्वर से कनेक्ट नहीं हो पाया।");
    } finally {
      btn.disabled = false;
      btn.textContent = "✨ प्रश्न बनाएँ";
    }
  };

  box.append(row1, row2, btn, out);
  chat.appendChild(box);
}