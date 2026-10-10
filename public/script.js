const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const list = document.getElementById("list");
const notesBtn = document.getElementById("notesBtn");
let currentId = null;
let lastUserMessage = "";
let inNotes = false;

fetch("/api/auth/me").then(async (r) => {
  if (!r.ok) return (location.href = "/login.html");
  document.getElementById("who").textContent = "नमस्ते, " + (await r.json()).name;
  loadList();
});

document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  location.href = "/login.html";
});

document.getElementById("newChat").addEventListener("click", async () => {
  const c = await (await fetch("/api/chats", { method: "POST" })).json();
  inNotes = false;
  form.style.display = "";
  currentId = c.id;
  chat.innerHTML = "";
  loadList();
});

notesBtn.addEventListener("click", showNotes);

async function loadList() {
  const items = await (await fetch("/api/chats")).json();
  list.innerHTML = "";
  if (!items.length) {
    const c = await (await fetch("/api/chats", { method: "POST" })).json();
    currentId = c.id;
    chat.innerHTML = "";
    return loadList();
  }
  for (const c of items) {
    const row = document.createElement("div");
    if (c.id === currentId) row.classList.add("active");
    const t = document.createElement("span");
    t.textContent = "💭 " + c.title;
    t.onclick = () => openChat(c.id);
    const ren = document.createElement("button");
    ren.textContent = "✎";
    ren.onclick = async () => {
      const name = prompt("नया नाम:", c.title);
      if (!name) return;
      await fetch("/api/chats/" + c.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name }),
      });
      loadList();
    };
    const del = document.createElement("button");
    del.textContent = "🗑";
    del.onclick = async () => {
      if (!confirm("यह चैट डिलीट करें?")) return;
      await fetch("/api/chats/" + c.id, { method: "DELETE" });
      if (currentId === c.id) { currentId = null; chat.innerHTML = ""; }
      loadList();
    };
    row.append(t, ren, del);
    list.appendChild(row);
  }
  if (!currentId && !inNotes) openChat(items[0].id);
}

async function openChat(id) {
  inNotes = false;
  form.style.display = "";
  currentId = id;
  const c = await (await fetch("/api/chats/" + id)).json();
  chat.innerHTML = "";
  c.messages.forEach((m, i) => {
    const el = show(m.content, m.role === "user" ? "user" : "bot");
    if (m.role === "assistant") {
      const q = c.messages[i - 1] ? c.messages[i - 1].content : "";
      addSaveButton(el, q, m.content);
    }
  });
  const users = c.messages.filter((m) => m.role === "user");
  lastUserMessage = users.length ? users[users.length - 1].content : "";
  addRegenButton();
  loadList();
}

// ---------- मेरे नोट्स ----------
async function showNotes() {
  inNotes = true;
  currentId = null;
  form.style.display = "none";
  document.querySelectorAll("#list > div").forEach((d) => d.classList.remove("active"));
  chat.innerHTML = "";

  const head = document.createElement("div");
  head.className = "notes-head";
  head.innerHTML = "<h2>📝 मेरे नोट्स</h2>";
  chat.appendChild(head);
  chat.appendChild(buildGenerator());

  try {
    const res = await fetch("/api/notes");
    if (!res.ok) throw new Error("सर्वर जवाब नहीं दे रहा (कोड " + res.status + ")");
    const items = await res.json();

    if (items.length) {
      const all = document.createElement("button");
      all.className = "notes-dl-all";
      all.textContent = "⬇ सभी नोट्स डाउनलोड करें (.txt)";
      all.onclick = () => downloadAllNotes(items);
      chat.appendChild(all);
    } else {
      const p = document.createElement("p");
      p.className = "notes-empty";
      p.textContent = "अभी कोई नोट नहीं है। किसी जवाब के नीचे 📌 दबाकर उसे सेव करें।";
      chat.appendChild(p);
    }

    for (const n of items) {
      const card = document.createElement("div");
      card.className = "note-card";

      const q = document.createElement("div");
      q.className = "note-q";
      q.textContent = "❓ " + (n.question || "(सवाल उपलब्ध नहीं)");

      const a = document.createElement("div");
      a.className = "note-a";
      render(a, n.answer);

      const bar = document.createElement("div");
      bar.className = "note-bar";

      const dl = document.createElement("button");
      dl.className = "note-dl";
      dl.textContent = "⬇ .txt";
      dl.onclick = () => downloadNote(n);
      bar.appendChild(dl);

      const del = document.createElement("button");
      del.className = "note-del";
      del.textContent = "🗑 हटाएँ";
      del.onclick = async () => {
        if (!confirm("यह नोट हटाएँ?")) return;
        await fetch("/api/notes/" + n.id, { method: "DELETE" });
        card.remove();
      };
      bar.appendChild(del);

      card.append(q, a, bar);
      chat.appendChild(card);
    }
  } catch (err) {
    const p = document.createElement("p");
    p.className = "notes-empty";
    p.textContent = "नोट्स लोड नहीं हुए: " + err.message;
    chat.appendChild(p);
  }
}

// ---------- अध्याय नोट्स जनरेटर ----------
function buildGenerator() {
  const box = document.createElement("div");
  box.className = "gen-box";

  const title = document.createElement("h3");
  title.textContent = "🔍 अध्याय खोजें और नोट्स बनाएँ";

  const row = document.createElement("div");
  row.className = "gen-row";

  const cls = document.createElement("select");
  for (let n = 5; n <= 12; n++) {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = "कक्षा " + n;
    cls.appendChild(o);
  }

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

  const subject = document.createElement("input");
  subject.placeholder = "विषय (जैसे Science, Maths)";

  const chapter = document.createElement("input");
  chapter.placeholder = "अध्याय (जैसे Light, Motion)";

  row.append(cls, lang, subject, chapter);

  const btn = document.createElement("button");
  btn.className = "gen-btn";
  btn.textContent = "✨ नोट्स बनाएँ";

  const out = document.createElement("div");
  out.className = "gen-out";

  btn.onclick = async () => {
    const classLevel = cls.value;
    const language = lang.value;
    const subj = subject.value.trim();
    const chap = chapter.value.trim();
    if (!subj || !chap) {
      alert("विषय और अध्याय दोनों लिखें।");
      return;
    }
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
    const question = `कक्षा ${classLevel} | ${subj} | ${chap} | ${language}`;
    let full = "";
    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classLevel, subject: subj, chapter: chap, lang: language }),
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
        const name = `${subj}-${chap}-class${classLevel}-${isEng ? "English" : "Hindi"}.txt`;
        const content = isEng
          ? `Subject: ${subj}\nClass: ${classLevel}\nChapter: ${chap}\n\n${full}`
          : `विषय: ${subj}\nकक्षा: ${classLevel}\nअध्याय: ${chap}\n\n${full}`;
        downloadText(name, content);
      };
      bar.appendChild(dl);

      const dlh = document.createElement("button");
      dlh.className = "note-dl";
      dlh.textContent = "🖼 चित्र सहित .html";
      dlh.onclick = () =>
        downloadHtml(
          `${subj}-${chap}-class${classLevel}`,
          `${subj} - ${chap} (कक्षा ${classLevel})`,
          full
        );
      bar.appendChild(dlh);

      card.appendChild(bar);
      addSaveButton(card, question, full);
    } catch (err) {
      console.error("Notes error:", err);
      body.textContent = full
        ? full
        : "नोट्स बनाने में समस्या हुई: " + (err && err.message ? err.message : "सर्वर से कनेक्ट नहीं हो पाया।");
    } finally {
      btn.disabled = false;
      btn.textContent = "✨ नोट्स बनाएँ";
    }
  };

  box.append(title, row, btn, out);
  return box;
}

// ---------- डाउनलोड ----------
function downloadText(filename, text) {
  try {
    const safeName = (filename || "notes.txt").replace(/[\\/:*?"<>|\s]+/g, "_");
    const blob = new Blob(["\uFEFF" + text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error("Download error:", err);
    alert("फ़ाइल डाउनलोड नहीं हो पाई: " + err.message);
  }
}

function downloadNote(n) {
  const text =
    "सवाल: " + (n.question || "(उपलब्ध नहीं)") + "\n\n" +
    "जवाब:\n" + n.answer + "\n\n" +
    "सेव की तारीख: " + new Date(n.createdAt).toLocaleString("hi-IN") + "\n";
  downloadText("note-" + n.id + ".txt", text);
}

function downloadAllNotes(items) {
  if (!items.length) return;
  const text = items
    .map((n, i) =>
      (i + 1) + ". सवाल: " + (n.question || "(उपलब्ध नहीं)") + "\n" +
      "जवाब: " + n.answer + "\n" +
      "-----------------------------\n"
    )
    .join("\n");
  downloadText("mere-notes.txt", "Mynotes\n\n" + text);
}

function downloadHtml(filename, title, md) {
  const body = toSafeHtml(md);
  const doc = `<!DOCTYPE html>
<html lang="hi"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: "Nirmala UI", "Segoe UI", sans-serif; max-width: 820px; margin: 0 auto;
         padding: 24px; line-height: 1.8; font-size: 18px; background: #fffdf7; color: #222; }
  h1 { color: #7c3aed; text-align: center; }
  h2 { color: #1d4ed8; border-bottom: 3px solid #fde68a; padding-bottom: 4px; }
  .diagram { background: #fff; border: 2px dashed #7c3aed; border-radius: 16px;
             padding: 12px; margin: 16px 0; text-align: center; }
  .diagram svg { max-width: 100%; height: auto; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
  th { background: #ede9fe; }
</style></head>
<body><h1>${title}</h1>${body}</body></html>`;

  const safeName = (filename || "notes").replace(/[\\/:*?"<>|\s]+/g, "_") + ".html";
  const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

// ---------- चित्र और मार्कडाउन रेंडर ----------
function toSafeHtml(text) {
  const svgs = [];

  const keep = (raw) => {
    let s = raw
      .replace(/`{3,}[a-zA-Z]*/g, "")
      .replace(/^\s*\|/gm, "")
      .replace(/\|\s*$/gm, "");
    const start = s.search(/<?svg\b/i);
    if (start < 0) return "";
    s = s.slice(start);
    if (!s.startsWith("<")) s = "<" + s;
    if (!/<\/svg>/i.test(s)) s += "</svg>";
    svgs.push(DOMPurify.sanitize(s, { USE_PROFILES: { svg: true, svgFilters: true } }));
    return "\n\n@@SVG" + (svgs.length - 1) + "@@\n\n";
  };

  let work = text;
  work = work.replace(/```[a-zA-Z]*[\s\S]*?(?:```|$)/g, (m) => (/svg/i.test(m) ? keep(m) : m));
  work = work.replace(/<svg[\s\S]*?<\/svg>/gi, (m) => keep(m));
  work = work.replace(/(^|\n)[ \t|]*svg\s+viewBox=[\s\S]*?<\/svg>/gi, (m) => keep(m));

  let html = marked.parse(work);
  html = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

  html = html.replace(/@@SVG(\d+)@@/g, (_, i) => '<div class="diagram">' + svgs[+i] + "</div>");
  return html;
}

function render(el, text) {
  el.classList.remove("thinking");
  if (!(window.marked && window.DOMPurify)) {
    el.textContent = text;
    return;
  }
  try {
    el.innerHTML = toSafeHtml(text);
  } catch (err) {
    console.error("Render error:", err);
    el.textContent = text;
  }
  el.querySelectorAll("pre").forEach((pre) => {
    if (pre.querySelector(".copy")) return;
    const btn = document.createElement("button");
    btn.className = "copy";
    btn.textContent = "Copy";
    btn.onclick = async () => {
      const code = pre.querySelector("code") || pre;
      await navigator.clipboard.writeText(code.innerText);
      btn.textContent = "कॉपी हुआ ✓";
      setTimeout(() => (btn.textContent = "कॉपी"), 1500);
    };
    pre.appendChild(btn);
  });
}

function show(text, cls) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  if (cls === "bot") render(d, text);
  else d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

function showThinking() {
  const d = document.createElement("div");
  d.className = "msg bot thinking";
  d.innerHTML =
    '<span class="think-icon">💭</span>' +
    '<span class="think-text">Searching</span>' +
    '<span class="dots"><i></i><i></i><i></i></span>';
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

function addSaveButton(el, question, answer) {
  const b = document.createElement("button");
  b.className = "save-note";
  b.textContent = "📌 Save Note";
  b.onclick = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    if (res.ok) {
      b.textContent = "Save ✓";
      b.disabled = true;
    } else {
      b.textContent = "सेव नहीं हुआ";
    }
  };
  el.appendChild(b);
}

function addRegenButton() {
  document.querySelectorAll(".regen").forEach((b) => b.remove());
  if (!lastUserMessage) return;
  const btn = document.createElement("button");
  btn.className = "regen";
  btn.textContent = "🔄 Regenrate";
  btn.onclick = regenerate;
  chat.appendChild(btn);
  chat.scrollTop = chat.scrollHeight;
}

async function regenerate() {
  if (!currentId || !lastUserMessage) return;
  const msg = lastUserMessage;
  const msgs = chat.querySelectorAll(".msg");
  if (msgs.length >= 2) {
    msgs[msgs.length - 1].remove();
    msgs[msgs.length - 2].remove();
  }
  await fetch("/api/chats/" + currentId + "/regenerate", { method: "POST" });
  await sendMessage(msg);
}

async function sendMessage(message) {
  show(message, "user");
  const bot = showThinking();
  lastUserMessage = message;
  let full = "";

  try {
    const res = await fetch("/api/chats/" + currentId + "/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.status === 401) return (location.href = "/login.html");
    if (!res.ok) {
      render(bot, await res.text());
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      render(bot, full);
      chat.scrollTop = chat.scrollHeight;
    }
    full += decoder.decode();
    render(bot, full);
    addSaveButton(bot, message, full);
    loadList();
  } catch {
    render(bot, "सर्वर से कनेक्ट नहीं हो पाया।");
  }
  addRegenButton();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message || !currentId) return;
  input.value = "";
  document.querySelectorAll(".regen").forEach((b) => b.remove());
  await sendMessage(message);
});

// ---------- डार्क मोड ----------
const themeBtn = document.getElementById("theme");

function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeBtn.textContent = dark ? "☀️" : "🌙";
}

applyTheme(localStorage.getItem("theme") === "dark");

themeBtn.addEventListener("click", () => {
  const dark = !document.body.classList.contains("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
  applyTheme(dark);
});