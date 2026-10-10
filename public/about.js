(function () {
  const CSS = `
    #abBtn {
      display: inline-flex; align-items: center; gap: 6px; margin-right: 8px;
      padding: 6px 14px; border-radius: 30px; cursor: pointer;
      background: rgba(15, 15, 30, 0.88); border: 1px solid rgba(250, 204, 21, 0.7);
      color: #fef3c7; font: 600 13px "Outfit", "Segoe UI", sans-serif;
      box-shadow: 0 0 14px rgba(250, 204, 21, 0.35);
    }
    #abBtn:hover { filter: brightness(1.15); }
    #abPanel {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 90;
      width: min(720px, 92vw); max-height: 88vh; overflow-y: auto; padding: 22px; border-radius: 18px;
      background: rgba(12, 12, 28, 0.97); border: 1px solid rgba(250, 204, 21, 0.55);
      box-shadow: 0 0 30px rgba(250, 204, 21, 0.25);
      color: #e5e7eb; font: 15px "Outfit", "Segoe UI", sans-serif;
    }
    #abPanel[hidden] { display: none; }
    #abPanel .ab-head { display: flex; gap: 12px; align-items: center; }
    #abPanel .ab-photo {
      width: 64px; height: 64px; border-radius: 50%; flex: none; display: grid; place-items: center;
      font-size: 30px; overflow: hidden; background: linear-gradient(135deg, #facc15, #f59e0b);
      box-shadow: 0 0 12px rgba(250, 204, 21, 0.5);
    }
    #abPanel .ab-photo img, #abPanel .ab-up img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
    #abPanel .ab-name { font-weight: 700; font-size: 16px; color: #fde68a; }
    #abPanel .ab-role { font-size: 12px; color: #94a3b8; }
    #abPanel .ab-bio { margin-top: 14px; line-height: 1.7; color: #cbd5e1; white-space: pre-wrap; font-size: 15px; }
    #abPanel .ab-box {
      margin-top: 14px; padding: 14px; border-radius: 12px;
      border: 1px solid rgba(34, 211, 238, 0.45); background: rgba(5, 5, 18, 0.7);
    }
    #abPanel .ab-box-t { font-weight: 600; color: #67e8f9; margin-bottom: 8px; font-size: 15px; }
    #abPanel .ab-proj { white-space: pre-wrap; line-height: 1.75; color: #e2e8f0; font-size: 15px; }
    #abPanel .ab-lbl { margin-top: 12px; font-size: 13px; color: #cbd5e1; }
    #abPanel input, #abPanel textarea {
      width: 100%; margin-top: 4px; padding: 8px 10px; box-sizing: border-box; border-radius: 10px;
      border: 1px solid rgba(250, 204, 21, 0.45); background: rgba(5, 5, 18, 0.9); color: #f5f3ff; font: inherit;
    }
    #abPanel textarea { min-height: 70px; resize: vertical; }
    #abPanel .ab-btn {
      margin-top: 10px; padding: 8px 12px; border-radius: 20px; cursor: pointer;
      font: 600 12px "Outfit", "Segoe UI", sans-serif; color: #fff;
      border: 1px solid rgba(250, 204, 21, 0.6); background: linear-gradient(135deg, #f59e0b, #ec4899);
    }
    #abPanel .ab-ghost { background: transparent; color: #fde68a; }
    #abPanel .ab-row { display: flex; gap: 8px; flex-wrap: wrap; }
    #abPanel .ab-msg { margin-top: 8px; font-size: 12px; color: #fca5a5; min-height: 14px; }
    #abPanel .ab-up {
      display: inline-block; margin-top: 0; padding: 6px 12px; border-radius: 20px; cursor: pointer;
      border: 1px solid #facc15; color: #fde68a; font-size: 12px;
    }
    @media (max-width: 600px) {
      #abPanel { left: 8px; right: 8px; width: auto; transform: translateY(-50%); padding: 16px; }
      #abBtn .ab-t { display: none; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const btn = document.createElement("button");
  btn.id = "abBtn";
  btn.type = "button";
  btn.innerHTML = `<span>ℹ️</span><span class="ab-t">About</span>`;

  const panel = document.createElement("div");
  panel.id = "abPanel";
  panel.hidden = true;
  document.body.appendChild(panel);

  const anchor =
    document.getElementById("pfBtn") ||
    [...document.querySelectorAll("button, a")].find((e) => /logout/i.test(e.textContent));
  if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(btn, anchor);
  else {
    btn.style.cssText = "position:fixed;top:14px;right:260px;z-index:70;";
    document.body.appendChild(btn);
  }

  let about = { adminName: "Admin", photo: "", bio: "", project: "" };
  let isAdmin = false;
  let mode = "view"; // view | login | edit
  let draft = {};
  let msg = "";

  async function api(method, url, body) {
    const r = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      credentials: "same-origin",
      body: body ? JSON.stringify(body) : undefined,
    });
    let d = {};
    try { d = await r.json(); } catch {}
    if (!r.ok) throw new Error(d.error || "Error " + r.status);
    return d;
  }

  async function load() {
    try {
      const d = await api("GET", "/api/about");
      about = d.about;
      isAdmin = d.isAdmin;
    } catch {}
  }

  function toAvatar(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const S = 160;
          const c = document.createElement("canvas");
          c.width = S;
          c.height = S;
          const ctx = c.getContext("2d");
          const m = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
          resolve(c.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = fr.result;
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  function on(id, ev, fn) {
    const el = panel.querySelector("#" + id);
    if (el) el.addEventListener(ev, fn);
  }

  function readDraft() {
    const n = panel.querySelector("#abName");
    const b = panel.querySelector("#abBio");
    const p = panel.querySelector("#abProj");
    if (n) draft.adminName = n.value;
    if (b) draft.bio = b.value;
    if (p) draft.project = p.value;
  }

  function setMsg(t) {
    const m = panel.querySelector("#abMsg");
    if (m) m.textContent = t;
  }

  function paint() {
    if (mode === "login") {
      panel.innerHTML = `
        <div class="ab-name">🔐 Admin login</div>
        <div class="ab-lbl">Admin password</div>
        <input id="abPw" type="password" />
        <div class="ab-row">
          <button class="ab-btn" id="abGo" type="button">Login</button>
          <button class="ab-btn ab-ghost" id="abBack" type="button">वापस</button>
        </div>
        <div class="ab-msg" id="abMsg"></div>`;
      on("abGo", "click", async () => {
        const pw = panel.querySelector("#abPw").value;
        try {
          await api("POST", "/api/about/login", { password: pw });
          isAdmin = true;
          mode = "view";
          msg = "Admin login हो गया ✓";
        } catch (e) {
          msg = e.message;
        }
        paint();
      });
      on("abBack", "click", () => { mode = "view"; paint(); });
    } else if (mode === "edit") {
      panel.innerHTML = `
        <div class="ab-head">
          <div class="ab-photo">${draft.photo ? `<img src="${draft.photo}" alt="">` : "🧑‍💼"}</div>
          <div>
            <label class="ab-up">📷 फ़ोटो चुनें<input type="file" id="abFile" accept="image/*" hidden /></label>
            ${draft.photo ? `<div><button class="ab-btn ab-ghost" id="abRm" type="button">फ़ोटो हटाएँ</button></div>` : ""}
          </div>
        </div>
        <div class="ab-lbl">नाम</div>
        <input id="abName" maxlength="40" value="${esc(draft.adminName)}" />
        <div class="ab-lbl">Admin का परिचय (Bio)</div>
        <textarea id="abBio" maxlength="600">${esc(draft.bio)}</textarea>
        <div class="ab-lbl">इस प्रोजेक्ट के बारे में</div>
        <textarea id="abProj" maxlength="1500" style="min-height:160px">${esc(draft.project)}</textarea>
        <div class="ab-row">
          <button class="ab-btn" id="abSave" type="button">सेव करें</button>
          <button class="ab-btn ab-ghost" id="abCancel" type="button">रद्द करें</button>
        </div>
        <div class="ab-msg" id="abMsg"></div>`;

      on("abFile", "change", async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        readDraft();
        if (!f.type.startsWith("image/")) {
          msg = "सिर्फ़ image चुनें";
          paint();
          return;
        }
        try {
          draft.photo = await toAvatar(f);
          msg = "फ़ोटो चुनी गई, अब सेव करें";
        } catch {
          msg = "फ़ोटो पढ़ी नहीं गई";
        }
        paint();
      });
      on("abRm", "click", () => { readDraft(); draft.photo = ""; paint(); });
      on("abSave", "click", async () => {
        readDraft();
        try {
          about = await api("PUT", "/api/about", draft);
          mode = "view";
          msg = "सेव हो गया ✓";
        } catch (e) {
          msg = e.message;
        }
        paint();
      });
      on("abCancel", "click", () => { mode = "view"; paint(); });
    } else {
      panel.innerHTML = `
        <div class="ab-head">
          <div class="ab-photo">${about.photo ? `<img src="${about.photo}" alt="">` : "🧑‍💼"}</div>
          <div>
            <div class="ab-name">${esc(about.adminName)}</div>
            <div class="ab-role">Admin</div>
          </div>
        </div>
        <div class="ab-bio">${esc(about.bio)}</div>
        <div class="ab-box">
          <div class="ab-box-t">📘 इस प्रोजेक्ट के बारे में</div>
          <div class="ab-proj">${esc(about.project)}</div>
        </div>
        <div class="ab-row">
          ${isAdmin
            ? `<button class="ab-btn" id="abEdit" type="button">✏️ Edit करें</button>
               <label class="ab-btn ab-ghost" style="cursor:pointer">📷 फ़ोटो बदलें
                 <input type="file" id="abPhotoQuick" accept="image/*" hidden />
               </label>
               <button class="ab-btn ab-ghost" id="abOut" type="button">Admin logout</button>`
            : `<button class="ab-btn ab-ghost" id="abLogin" type="button">🔐 Admin login</button>`}
        </div>
        <div class="ab-msg" id="abMsg"></div>`;

      on("abLogin", "click", () => { mode = "login"; paint(); });
      on("abEdit", "click", () => { draft = { ...about }; mode = "edit"; paint(); });
      on("abPhotoQuick", "change", async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f || !f.type.startsWith("image/")) {
          msg = "सिर्फ़ image चुनें";
          paint();
          return;
        }
        try {
          const photo = await toAvatar(f);
          about = await api("PUT", "/api/about", { ...about, photo });
          msg = "फ़ोटो सेव हो गई ✓";
        } catch (err) {
          msg = err.message || "फ़ोटो सेव नहीं हुई";
        }
        paint();
      });
      on("abOut", "click", async () => {
        try { await api("POST", "/api/about/logout"); } catch {}
        isAdmin = false;
        mode = "view";
        paint();
      });
    }

    if (msg) {
      setMsg(msg);
      msg = "";
    }
  }

  btn.addEventListener("click", async () => {
    if (panel.hidden) {
      await load();
      mode = "view";
      paint();
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.isConnected) return;
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) panel.hidden = true;
  });

  load();
})();