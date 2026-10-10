// ---------- CBSE / BSEB किताब सेक्शन ----------
// NCERT की किताब के PDF link यहाँ भरें। Key का format: "क्लास-विषय"
// Link ncert.nic.in/textbook.php से copy करें। खाली छोड़ने पर NCERT का textbook page खुलेगा।
const BOOK_PDFS = {
  "5-Maths": "",
  "5-Science": "",
  "6-Maths": "",
  "6-Science": "",
  "7-Maths": "",
  "7-Science": "",
  "8-Maths": "",
  "8-Science": "",
  "9-Maths": "",
  "9-Science": "",
  "10-Maths": "",
  "10-Science": "",
};
const NCERT_FALLBACK = "https://ncert.nic.in/textbook.php";

const bookBtn = document.getElementById("bookBtn");
bookBtn.addEventListener("click", showBooks);
let booksData = null;

async function showBooks() {
  inNotes = true;
  currentId = null;
  form.style.display = "none";
  document.querySelectorAll("#list > div").forEach((d) => d.classList.remove("active"));
  chat.innerHTML = "";

  const head = document.createElement("div");
  head.className = "notes-head";
  head.innerHTML = "<h2>📚 किताब के अनुसार नोट्स (CBSE / BSEB)</h2>";
  chat.appendChild(head);

  try {
    if (!booksData) {
      const r = await fetch("/api/books");
      if (r.status === 401) return (location.href = "/login.html");
      if (!r.ok) throw new Error("किताब सूची लोड नहीं हुई (कोड " + r.status + ")");
      booksData = await r.json();
    }
    chat.appendChild(buildBookPicker());
  } catch (err) {
    const p = document.createElement("p");
    p.className = "notes-empty";
    p.textContent = err.message;
    chat.appendChild(p);
  }
}

function fillSelect(sel, values, placeholder) {
  sel.innerHTML = "";
  if (placeholder) {
    const o = document.createElement("option");
    o.value = "";
    o.textContent = placeholder;
    sel.appendChild(o);
  }
  values.forEach((v) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

function buildBookPicker() {
  const box = document.createElement("div");
  box.className = "gen-box";

  const title = document.createElement("h3");
  title.textContent = "🔍 बोर्ड, कक्षा, विषय और अध्याय चुनें";

  const row1 = document.createElement("div");
  row1.className = "gen-row";
  const board = document.createElement("select");
  fillSelect(board, Object.keys(booksData.boards));
  const cls = document.createElement("select");
  fillSelect(cls, ["5", "6", "7", "8", "9", "10"]);
  const subj = document.createElement("select");
  const lang = document.createElement("select");
  [
    ["hindi", "हिंदी माध्यम (Hindi)"],
    ["english", "English Medium"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    lang.appendChild(o);
  });
  row1.append(board, cls, subj, lang);

  const row2 = document.createElement("div");
  row2.className = "gen-row";
  const chapSel = document.createElement("select");
  const customChap = document.createElement("input");
  customChap.placeholder = "अध्याय का नाम खुद लिखें";
  customChap.style.display = "none";
  row2.append(chapSel, customChap);

  const openBook = document.createElement("button");
  openBook.className = "gen-btn";
  openBook.textContent = "📖 पूरी किताब खोलें";
  openBook.onclick = () => {
    const key = `${cls.value}-${subj.value}`;
    const url = BOOK_PDFS[key] || NCERT_FALLBACK;
    window.open(url, "_blank", "noopener");
  };

  const refreshSubjects = () => {
    const sub = (booksData.boards[board.value] || {})[cls.value] || {};
    fillSelect(subj, Object.keys(sub), "— विषय चुनें —");
    refreshChapters();
  };
  const refreshChapters = () => {
    const boardData = booksData.boards[board.value] || {};
    const list = (boardData[cls.value] || {})[subj.value] || [];
    fillSelect(chapSel, [...list, "✏️ खुद लिखें"], "— अध्याय चुनें —");
    customChap.style.display = "none";
  };

  board.addEventListener("change", refreshSubjects);
  cls.addEventListener("change", refreshSubjects);
  subj.addEventListener("change", refreshChapters);
  chapSel.addEventListener("change", () => {
    customChap.style.display = chapSel.value === "✏️ खुद लिखें" ? "" : "none";
  });
  refreshSubjects();

  const btn = document.createElement("button");
  btn.className = "gen-btn";
  btn.textContent = "✨ इस अध्याय के नोट्स बनाएँ";

  const out = document.createElement("div");
  out.className = "gen-out";

  btn.onclick = () => {
    const isCustom = chapSel.value === "✏️ खुद लिखें";
    const chapter = isCustom ? customChap.value.trim() : chapSel.value;
    if (!subj.value || !chapter) {
      alert("बोर्ड, विषय और अध्याय चुनें (या अध्याय खुद लिखें)।");
      return;
    }
    runBookNotes({
      board: board.value,
      classLevel: cls.value,
      subj: subj.value,
      chap: chapter,
      language: lang.value,
      btn,
      out,
    });
  };

  box.append(title, row1, row2, openBook, btn, out);
  return box;
}

async function runBookNotes({ board, classLevel, subj, chap, language, btn, out }) {
  btn.disabled = true;
  btn.textContent = "नोट्स बन रहे हैं...";
  out.innerHTML = "";

  const card = document.createElement("div");
  card.className = "note-card gen-result";
  const body = document.createElement("div");
  body.className = "note-a";
  body.textContent = "सोच रहा है...";
  card.appendChild(body);
  out.appendChild(card);

  const isEng = language === "english";
  const chapterForAI = `${board} बोर्ड की किताब, ${chap}`;
  const question = `${board} | कक्षा ${classLevel} | ${subj} | ${chap} | ${language}`;
  let full = "";

  try {
    const res = await fetch("/api/generate-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classLevel, subject: subj, chapter: chapterForAI, lang: language }),
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
    dl.onclick = () => {
      const name = `${board}-class${classLevel}-${subj}-${chap}-${isEng ? "English" : "Hindi"}.txt`;
      const content = isEng
        ? `Board: ${board}\nClass: ${classLevel}\nSubject: ${subj}\nChapter: ${chap}\n\n${full}`
        : `बोर्ड: ${board}\nकक्षा: ${classLevel}\nविषय: ${subj}\nअध्याय: ${chap}\n\n${full}`;
      downloadText(name, content);
    };
    bar.appendChild(dl);

    const dlh = document.createElement("button");
    dlh.className = "note-dl";
    dlh.textContent = "🖼 चित्र सहित .html";
    dlh.onclick = () =>
      downloadHtml(
        `${board}-class${classLevel}-${subj}-${chap}`,
        `${board} - कक्षा ${classLevel} - ${subj} - ${chap}`,
        full
      );
    bar.appendChild(dlh);

    card.appendChild(bar);
    addSaveButton(card, question, full);
  } catch (err) {
    console.error("Book notes error:", err);
    body.textContent = full
      ? full
      : "नोट्स बनाने में समस्या हुई: " + (err && err.message ? err.message : "सर्वर से कनेक्ट नहीं हो पाया।");
  } finally {
    btn.disabled = false;
    btn.textContent = "✨ इस अध्याय के नोट्स बनाएँ";
  }
}