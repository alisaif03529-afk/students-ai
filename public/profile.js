(function () {
  const COLORS = {
    cyan: "linear-gradient(135deg, #22d3ee, #6366f1)",
    violet: "linear-gradient(135deg, #a78bfa, #ec4899)",
    rose: "linear-gradient(135deg, #fb7185, #f97316)",
    amber: "linear-gradient(135deg, #facc15, #f59e0b)",
  };
  const AVATARS = ["🦁", "🐯", "🦊", "🐼", "🦉", "🚀", "🎓", "🧠", "⭐", "🎯", "📚", "🌟"];
  const CLASSES = ["5", "6", "7", "8", "9", "10", "11", "12"];

  const CSS = `
    #pfBtn {
      display: inline-flex; align-items: center; gap: 8px; margin-right: 8px;
      padding: 4px 12px 4px 4px; border-radius: 30px; cursor: pointer;
      background: rgba(15, 15, 30, 0.88); border: 1px solid rgba(34, 211, 238, 0.6);
      color: #e5e7eb; font: 600 13px "Outfit", "Segoe UI", sans-serif;
      box-shadow: 0 0 14px rgba(34, 211, 238, 0.4);
    }
    #pfBtn:hover { filter: brightness(1.15); }
    #pfBtn .pf-av {
      width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
      font-size: 16px; color: #fff; overflow: hidden; flex: none;
      box-shadow: 0 0 12px rgba(167, 139, 250, 0.6);
    }
    #pfBtn .pf-nm { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pf-av img, .pf-big img, .pf-prev img {
      width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;
    }

    #pfPanel {
      position: fixed; top: 64px; right: 18px; z-index: 80; width: 290px;
      max-height: calc(100vh - 80px); overflow-y: auto; padding: 14px; border-radius: 18px;
      background: rgba(12, 12, 28, 0.96); border: 1px solid rgba(167, 139, 250, 0.55);
      box-shadow: 0 0 24px rgba(167, 139, 250, 0.35);
      color: #e5e7eb; font: 13px "Outfit", "Segoe UI", sans-serif;
    }
    #pfPanel[hidden] { display: none; }
    #pfPanel .pf-head { display: flex; gap: 12px; align-items: center; margin-bottom: 6px; }
    #pfPanel .pf-big {
      width: 52px; height: 52px; border-radius: 50%; flex: none; display: grid; place-items: center;
      font-size: 26px; color: #fff; overflow: hidden; box-shadow: 0 0 14px rgba(167, 139, 250, 0.6);
    }
    #pfPanel .pf-name { font-weight: 700; font-size: 15px; color: #67e8f9; }
    #pfPanel .pf-mail { font-size: 11px; color: #94a3b8; word-break: break-all; }
    #pfPanel label { display: block; margin-top: 10px; font-size: 12px; color: #cbd5e1; }
    #pfPanel input, #pfPanel select {
      width: 100%; margin-top: 4px; padding: 8px 10px; box-sizing: border-box;
      border-radius: 10px; border: 1px solid rgba(34, 211, 238, 0.45);
      background: rgba(5, 5, 18, 0.9); color: #f5f3ff; font: inherit;
    }
    #pfPanel .pf-two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    #pfPanel .pf-lbl { margin-top: 10px; font-size: 12px; color: #cbd5e1; }
    #pfPanel .pf-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    #pfPanel .pf-opt {
      width: 34px; height: 34px; border-radius: 50%; padding: 0; cursor: pointer; font-size: 18px;
      border: 2px solid transparent; background: rgba(255, 255, 255, 0.08);
    }
    #pfPanel .pf-opt.on, #pfPanel .pf-sw.on { border-color: #fff; box-shadow: 0 0 10px rgba(255, 255, 255, 0.6); }
    #pfPanel .pf-sw { width: 26px; height: 26px; border-radius: 50%; padding: 0; cursor: pointer; border: 2px solid transparent; }

    #pfPanel .pf-photo { display: flex; gap: 10px; align-items: center; margin-top: 4px; }
    #pfPanel .pf-prev {
      width: 64px; height: 64px; border-radius: 50%; flex: none; display: grid; place-items: center;
      font-size: 30px; color: #fff; overflow: hidden; box-shadow: 0 0 12px rgba(167, 139, 250, 0.6);
    }
    #pfPanel label.pf-up {
      display: inline-block; margin-top: 0; padding: 7px 12px; border-radius: 20px; cursor: pointer;
      border: 1px solid #22d3ee; color: #67e8f9; font-size: 12px; background: rgba(34, 211, 238, 0.1);
    }
    #pfPanel .pf-rm {
      margin-top: 6px; padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 12px;
      border: 1px solid rgba(248, 113, 113, 0.7); background: transparent; color: #fca5a5;
    }
    #pfPanel .pf-save, #pfPanel .pf-out {
      width: 100%; margin-top: 12px; padding: 9px; border-radius: 20px; cursor: pointer;
      font: 600 13px "Outfit", "Segoe UI", sans-serif; color: #fff; border: 1px solid rgba(167, 139, 250, 0.6);
    }
    #pfPanel .pf-save { background: linear-gradient(135deg, #22d3ee, #a855f7); }
    #pfPanel .pf-out { background: transparent; border-color: rgba(248, 113, 113, 0.7); color: #fca5a5; }
    #pfPanel .pf-msg { margin-top: 8px; font-size: 12px; color: #86efac; min-height: 14px; text-align: center; }
    @media (max-width: 600px) {
      #pfBtn .pf-nm { display: none; }
      #pfBtn { padding: 4px; }
      #pfPanel { left: 12px; right: 12px; width: auto; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const btn = document.createElement("button");
  btn.id = "pfBtn";
  btn.type = "button";
  btn.innerHTML = `<span class="pf-av"></span><span class="pf-nm">Student</span>`;

  const panel = document.createElement("div");
  panel.id = "pfPanel";
  panel.hidden = true;
  document.body.appendChild(panel);

  const logout = [...document.querySelectorAll("button, a")].find((e) => /logout/i.test(e.textContent));
  if (logout && logout.parentElement) logout.parentElement.insertBefore(btn, logout);
  else {
    btn.style.cssText = "position:fixed;top:14px;right:150px;z-index:70;";
    document.body.appendChild(btn);
  }

  let user = { name: "", email: "" };
  let prof = {};
  let dr = {};

  const shown = () => prof.displayName || user.name || "Student";

  function render() {
    const av = btn.querySelector(".pf-av");
    av.innerHTML = prof.photo ? `<img src="${prof.photo}" alt="">` : esc(prof.avatar || "🦁");
    av.style.background = COLORS[prof.color || "cyan"];
    btn.querySelector(".pf-nm").textContent = shown();
  }

  async function load() {
    try {
      const r = await fetch("/api/auth/me", { credentials: "same-origin" });
      const d = await r.json();
      const u = d.user || d;
      user = { name: u.name || "", email: u.email || "" };
    } catch {}
    try {
      const r = await fetch("/api/profile", { credentials: "same-origin" });
      prof = await r.json();
    } catch {}
    render();
  }

  // Photo ko chhota square (160px) karke compress karna, taaki save halki rahe
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

  function paint() {
    panel.innerHTML = `
      <div class="pf-head">
        <div class="pf-big" style="background:${COLORS[dr.color]}">
          ${dr.photo ? `<img src="${dr.photo}" alt="">` : esc(dr.avatar)}
        </div>
        <div>
          <div class="pf-name">${esc(dr.displayName || user.name || "Student")}</div>
          <div class="pf-mail">${esc(user.email)}</div>
        </div>
      </div>

      <div class="pf-lbl">प्रोफ़ाइल फ़ोटो</div>
      <div class="pf-photo">
        <div class="pf-prev" style="background:${COLORS[dr.color]}">
          ${dr.photo ? `<img src="${dr.photo}" alt="">` : esc(dr.avatar)}
        </div>
        <div>
          <label class="pf-up">📷 फ़ोटो चुनें
            <input type="file" id="pfFile" accept="image/*" hidden />
          </label>
          ${dr.photo ? `<br /><button type="button" class="pf-rm" id="pfRm">फ़ोटो हटाएँ</button>` : ""}
        </div>
      </div>

      <label>नाम
        <input id="pfName" maxlength="30" value="${esc(dr.displayName)}" />
      </label>

      <div class="pf-lbl">अवतार (फ़ोटो न हो तो)</div>
      <div class="pf-row">
        ${AVATARS.map((a) => `<button type="button" class="pf-opt ${a === dr.avatar ? "on" : ""}" data-av="${a}">${a}</button>`).join("")}
      </div>

      <div class="pf-lbl">रंग</div>
      <div class="pf-row">
        ${Object.keys(COLORS).map((c) => `<button type="button" class="pf-sw ${c === dr.color ? "on" : ""}" data-col="${c}" style="background:${COLORS[c]}"></button>`).join("")}
      </div>

      <div class="pf-two">
        <label>कक्षा
          <select id="pfClass">
            <option value="">चुनें</option>
            ${CLASSES.map((c) => `<option value="${c}" ${c === dr.className ? "selected" : ""}>Class ${c}</option>`).join("")}
          </select>
        </label>
        <label>बोर्ड
          <select id="pfBoard">
            ${["", "CBSE", "BSEB", "Other"].map((b) => `<option value="${b}" ${b === dr.board ? "selected" : ""}>${b || "चुनें"}</option>`).join("")}
          </select>
        </label>
      </div>

      <label>परिचय
        <input id="pfBio" maxlength="80" value="${esc(dr.bio)}" placeholder="जैसे: NEET की तैयारी" />
      </label>

      <button type="button" class="pf-save" id="pfSave">प्रोफ़ाइल सेव करें</button>
      <div class="pf-msg" id="pfMsg"></div>
      <button type="button" class="pf-out" id="pfOut">Logout</button>
    `;

    panel.querySelector("#pfName").addEventListener("input", (e) => (dr.displayName = e.target.value));
    panel.querySelector("#pfBio").addEventListener("input", (e) => (dr.bio = e.target.value));
    panel.querySelector("#pfClass").addEventListener("change", (e) => (dr.className = e.target.value));
    panel.querySelector("#pfBoard").addEventListener("change", (e) => (dr.board = e.target.value));

    panel.querySelector("#pfFile").addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setMsg("सिर्फ़ image file चुनें");
        return;
      }
      try {
        dr.photo = await toAvatar(file);
        paint();
        setMsg("फ़ोटो चुनी गई, अब सेव करें");
      } catch {
        setMsg("फ़ोटो पढ़ी नहीं गई, दूसरी file चुनें");
      }
    });

    const rm = panel.querySelector("#pfRm");
    if (rm) rm.addEventListener("click", async (e) => {
      e.stopPropagation();
      dr.photo = "";
      paint();
      await save();
    });

    panel.querySelectorAll("[data-av]").forEach((b) =>
      b.addEventListener("click", () => {
        dr.avatar = b.dataset.av;
        paint();
      })
    );
    panel.querySelectorAll("[data-col]").forEach((b) =>
      b.addEventListener("click", () => {
        dr.color = b.dataset.col;
        paint();
      })
    );

    panel.querySelector("#pfSave").addEventListener("click", save);
    panel.querySelector("#pfOut").addEventListener("click", () => {
      if (logout) logout.click();
      else location.href = "login.html";
    });
  }

  function setMsg(t) {
    const m = panel.querySelector("#pfMsg");
    if (m) m.textContent = t;
  }

  async function save() {
    setMsg("सेव हो रहा है...");
    try {
      const r = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(dr),
      });
      if (!r.ok) throw new Error("save failed");
      prof = await r.json();
      render();
      if (!panel.hidden) {
        dr.photo = prof.photo || "";
        paint();
      }
      setMsg("सेव हो गया ✓");
    } catch {
      setMsg("सेव नहीं हुआ, फिर से try करें");
    }
  }

  function openPanel() {
    dr = {
      displayName: prof.displayName || user.name || "",
      avatar: prof.avatar || "🦁",
      color: prof.color || "cyan",
      className: prof.className || "",
      board: prof.board || "",
      bio: prof.bio || "",
      photo: prof.photo || "",
    };
    paint();
    panel.hidden = false;
  }

  btn.addEventListener("click", () => {
    if (panel.hidden) openPanel();
    else panel.hidden = true;
  });

  document.addEventListener("click", (e) => {
    // Jo element click ke baad panel mein se hata diya gaya ho, use "bahar" na samjhein
    if (!e.target.isConnected) return;
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) panel.hidden = true;
  });

  load();
})();