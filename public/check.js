// ---------- उत्तर जाँच (Answer Checking) ----------
const checkBtn = document.getElementById("checkBtn");
checkBtn.addEventListener("click", showCheck);

// फोटो को छोटा और JPEG करके base64 बनाता है (फ़ोन की बड़ी फोटो के लिए)
function fileToResizedDataUrl(file, maxSide = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("फ़ाइल नहीं पढ़ी जा सकी।"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("यह फोटो खुल नहीं रही।"));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function showCheck() {
  inNotes = true;
  currentId = null;
  form.style.display = "none";
  document.querySelectorAll("#list > div").forEach((d) => d.classList.remove("active"));
  chat.innerHTML = "";

  const head = document.createElement("div");
  head.className = "notes-head";
  head.innerHTML = "<h2>✍️ उत्तर जाँच (Answer Checking)</h2>";
  chat.appendChild(head);

  const box = document.createElement("div");
  box.className = "gen-box";

  const hint = document.createElement("p");
  hint.className = "notes-empty";
  hint.textContent =
    "प्रश्न और अपना उत्तर लिखें, या उत्तर की फोटो गैलरी से चुनें। AI बताएगा कि क्या सही है, क्या छूटा है, कहाँ सुधार करें, और परीक्षा में उत्तर कैसे लिखें।";

  const row = document.createElement("div");
  row.className = "gen-row";

  const cls = document.createElement("select");
  for (let n = 5; n <= 12; n++) {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = "कक्षा " + n;
    cls.appendChild(o);
  }
  cls.value = "8";

  const subject = document.createElement("input");
  subject.placeholder = "विषय (जैसे Science)";

  const marks = document.createElement("select");
  [["", "कुल अंक (वैकल्पिक)"], ["1", "1 अंक"], ["2", "2 अंक"], ["3", "3 अंक"], ["5", "5 अंक"]].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    marks.appendChild(o);
  });

  const lang = document.createElement("select");
  [
    ["hindi", "हिंदी में जाँच"],
    ["english", "English में जाँच"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    lang.appendChild(o);
  });

  row.append(cls, subject, marks, lang);

  const question = document.createElement("textarea");
  question.rows = 3;
  question.placeholder = "प्रश्न यहाँ लिखें...";
  question.className = "doubt-input";

  // गैलरी से फोटो चुनने का हिस्सा
  const photoRow = document.createElement("div");
  photoRow.className = "photo-row";

  const photoInput = document.createElement("input");
  photoInput.type = "file";
  photoInput.accept = "image/*"; // फ़ोन पर गैलरी/कैमरा खुलेगा
  photoInput.id = "answerPhoto";
  photoInput.style.display = "none";

  const photoBtn = document.createElement("button");
  photoBtn.type = "button";
  photoBtn.className = "photo-btn";
  photoBtn.textContent = "🖼 गैलरी से उत्तर की फोटो चुनें";
  photoBtn.onclick = () => photoInput.click();

  const photoStatus = document.createElement("span");
  photoStatus.className = "photo-status";

  photoRow.append(photoBtn, photoInput, photoStatus);

  const answer = document.createElement("textarea");
  answer.rows = 8;
  answer.placeholder = "अपना उत्तर यहाँ लिखें (या फोटो चुनें, तो यहाँ अपने-आप आएगा)...";
  answer.className = "doubt-input";

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("फोटो बहुत बड़ी है (15 MB से कम रखें)।");
      photoInput.value = "";
      return;
    }
    photoBtn.disabled = true;
    photoStatus.textContent = "फोटो पढ़ी जा रही है...";
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      const res = await fetch("/api/read-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (res.status === 401) return (location.href = "/login.html");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "फोटो नहीं पढ़ी जा सकी।");
      answer.value = data.text.trim();
      photoStatus.textContent = "✅ उत्तर पढ़ लिया गया। जाँच से पहले ज़रूरी सुधार कर लें।";
    } catch (err) {
      photoStatus.textContent = "❌ " + err.message;
    } finally {
      photoBtn.disabled = false;
      photoInput.value = "";
    }
  });

  const btn = document.createElement("button");
  btn.className = "gen-btn";
  btn.textContent = "🔍 उत्तर जाँचें";

  const out = document.createElement("div");
  out.className = "gen-out";

  btn.onclick = async () => {
    const q = question.value.trim();
    const a = answer.value.trim();
    if (!q || !a) {
      alert("प्रश्न और उत्तर दोनों लिखें (या फोटो चुनें)।");
      return;
    }
    btn.disabled = true;
    btn.textContent = "जाँच हो रही है...";
    out.innerHTML = "";

    const card = document.createElement("div");
    card.className = "note-card gen-result";
    const body = document.createElement("div");
    body.className = "note-a";
    body.textContent = "सोच रहा है...";
    card.appendChild(body);
    out.appendChild(card);

    const label = `उत्तर जाँच | कक्षा ${cls.value} | ${subject.value.trim() || "सामान्य"} | ${q.slice(0, 80)}`;
    let full = "";
    try {
      const res = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          answer: a,
          classLevel: cls.value,
          subject: subject.value.trim(),
          marks: marks.value,
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
      addSaveButton(card, label, full);
    } catch (err) {
      console.error("Check error:", err);
      body.textContent = full || "जाँच नहीं हो पाई: " + (err && err.message ? err.message : "सर्वर से कनेक्ट नहीं हो पाया।");
    } finally {
      btn.disabled = false;
      btn.textContent = "🔍 उत्तर जाँचें";
    }
  };

  box.append(hint, row, question, photoRow, answer, btn, out);
  chat.appendChild(box);
}