(function () {
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  if (!form || !input || !chat) return;

  document.getElementById("vtBar")?.remove();

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasTTS = "speechSynthesis" in window;
  const SILENCE_MS = 1300;
  const SETTLE_MS = 800;
  const ORIG_PH = input.placeholder;

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  /* ---------- Languages ---------- */
  const LANGS = [
    { code: "hi-IN", label: "हिन्दी" },
    { code: "en-IN", label: "English" },
    { code: "bn-IN", label: "বাংলা" },
    { code: "mr-IN", label: "मराठी" },
    { code: "gu-IN", label: "ગુજરાતી" },
    { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
    { code: "ta-IN", label: "தமிழ்" },
    { code: "te-IN", label: "తెలుగు" },
    { code: "kn-IN", label: "ಕನ್ನಡ" },
    { code: "ml-IN", label: "മലയാളം" },
    { code: "ur-IN", label: "اردو" },
  ];
  const NAMES = {
    "hi-IN": "Hindi (Devanagari script)",
    "en-IN": "English",
    "bn-IN": "Bengali",
    "mr-IN": "Marathi",
    "gu-IN": "Gujarati",
    "pa-IN": "Punjabi (Gurmukhi script)",
    "ta-IN": "Tamil",
    "te-IN": "Telugu",
    "kn-IN": "Kannada",
    "ml-IN": "Malayalam",
    "ur-IN": "Urdu",
  };
  // Script se bhasha pehchanne ke liye
  const SCRIPTS = [
    [/[\u0980-\u09FF]/, "bn-IN"],
    [/[\u0A80-\u0AFF]/, "gu-IN"],
    [/[\u0A00-\u0A7F]/, "pa-IN"],
    [/[\u0B80-\u0BFF]/, "ta-IN"],
    [/[\u0C00-\u0C7F]/, "te-IN"],
    [/[\u0C80-\u0CFF]/, "kn-IN"],
    [/[\u0D00-\u0D7F]/, "ml-IN"],
    [/[\u0600-\u06FF]/, "ur-IN"],
  ];
  // Roman Hindi (Hinglish) ke common shabd
  const HINGLISH = /\b(kya|kaise|kyun|kyu|hai|hain|mujhe|batao|bataiye|batayen|samjhao|samjhaiye|kab|kahan|kaun|nahi|aur|mein|se|wala|karo|kar|bolo|chahiye|kitna|kaisa|ka|ki|ke)\b/i;

  let lang = store.get("vtLang", "hi-IN");   // student ki bolne wali bhasha (recognition)
  let replyCode = "hi-IN";                    // jawab kis awaaz mein bolna hai
  let replyHint = null;                       // AI ko bhejne wala hidden instruction
  let voiceQ = "";

  function replyFor(code) {
    return {
      tts: code,
      hint: "Reply only in " + NAMES[code] + ". Use that language and script throughout.",
    };
  }

  function detectReply(q) {
    for (const [re, code] of SCRIPTS) if (re.test(q)) return replyFor(code);
    if (/[\u0900-\u097F]/.test(q)) return replyFor(lang === "mr-IN" ? "mr-IN" : "hi-IN");
    if (HINGLISH.test(q)) {
      return {
        tts: "hi-IN",
        hint: "Reply in simple Hinglish, meaning Hindi written in English letters (Roman Hindi), for example: 'Photosynthesis ek process hai jisme...'.",
      };
    }
    return replyFor("en-IN");
  }

  // Request ke andar sawal ke saath hidden instruction jod do (chat mein nahi dikhega)
  const origFetch = window.fetch;
  window.fetch = function (url, init) {
    if (replyHint && init && typeof init.body === "string" && voiceQ) {
      const enc = JSON.stringify(voiceQ).slice(1, -1);
      if (init.body.includes(enc)) {
        const encNew = JSON.stringify(voiceQ + replyHint).slice(1, -1);
        init = Object.assign({}, init, { body: init.body.replace(enc, encNew) });
        replyHint = null;
      }
    }
    return origFetch.apply(this, arguments);
  };

  /* ---------- Styles ---------- */
  const CSS = `
    body #form #vtMic {
      position: relative; flex: none; align-self: center;
      width: 46px !important; height: 46px !important; min-width: 46px;
      margin-left: 8px; padding: 0; border-radius: 50%; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 22px; line-height: 1;
      border: 1.5px solid rgba(255, 255, 255, 0.55) !important;
      background: linear-gradient(135deg, #22d3ee 0%, #6366f1 55%, #a855f7 100%) !important;
      box-shadow: 0 0 14px rgba(34, 211, 238, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
      transition: transform 0.2s ease, box-shadow 0.3s ease, filter 0.3s ease;
    }
    body #form #vtMic:hover { transform: scale(1.08); filter: brightness(1.12); }
    body #form #vtMic:active { transform: scale(0.95); }
    body #form #vtMic:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    body #form #vtMic.live {
      background: linear-gradient(135deg, #f472b6 0%, #fb7185 100%) !important;
      border-color: #fecdd3 !important;
      box-shadow: 0 0 24px rgba(244, 114, 182, 0.9), 0 0 48px rgba(244, 114, 182, 0.45) !important;
      animation: vtBreath 1.1s ease-in-out infinite;
    }
    body #form #vtMic.live::after {
      content: ""; position: absolute; inset: -6px; border-radius: 50%;
      border: 2px solid rgba(244, 114, 182, 0.7);
      animation: vtRipple 1.4s ease-out infinite; pointer-events: none;
    }
    body #form #vtMic.speaking {
      background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%) !important;
      border-color: #fef3c7 !important;
      box-shadow: 0 0 22px rgba(250, 204, 21, 0.8) !important;
      animation: vtBreath 1.8s ease-in-out infinite;
    }

    body #form #vtLang {
      flex: none; align-self: center; height: 40px; margin-left: 6px; max-width: 110px;
      border-radius: 20px; padding: 0 8px; cursor: pointer;
      border: 1px solid rgba(34, 211, 238, 0.7); background: rgba(10, 10, 25, 0.9);
      color: #e0f7ff; font: 600 13px "Outfit", "Segoe UI", sans-serif;
      box-shadow: 0 0 12px rgba(34, 211, 238, 0.35);
    }
    body #form #vtLang:disabled { opacity: 0.4; cursor: not-allowed; }

    @keyframes vtBreath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
    @keyframes vtRipple { 0% { transform: scale(0.9); opacity: 0.9; } 100% { transform: scale(1.6); opacity: 0; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ---------- Buttons ---------- */
  const langSel = document.createElement("select");
  langSel.id = "vtLang";
  langSel.title = "बोलने की भाषा";
  LANGS.forEach((l) => {
    const o = document.createElement("option");
    o.value = l.code;
    o.textContent = l.label;
    langSel.appendChild(o);
  });
  langSel.value = LANGS.some((l) => l.code === lang) ? lang : "hi-IN";
  lang = langSel.value;

  const micBtn = document.createElement("button");
  micBtn.id = "vtMic";
  micBtn.type = "button";
  micBtn.title = "बोलकर पूछें";
  micBtn.textContent = "🎙️";

  const formBtns = form.querySelectorAll("button");
  const sendBtn = formBtns[formBtns.length - 1] || null;
  form.insertBefore(langSel, sendBtn);
  form.insertBefore(micBtn, sendBtn);

  /* ---------- State ---------- */
  let session = 0;
  let rec = null;
  let listening = false;
  let starting = false;
  let speaking = false;
  let userStopped = false;
  let flashing = false;
  let lastErr = "";
  let heard = "";
  let silenceT = null;
  let fromVoice = false;
  let voicePending = false;
  let lastQ = "";
  let snap = "";
  let settleT = null;

  function setState() {
    micBtn.classList.toggle("live", listening);
    micBtn.classList.toggle("speaking", speaking);
    if (flashing) return;
    if (listening) input.placeholder = "🎙️ बोलिए… (चुप होते ही सवाल भेज देंगे)";
    else if (speaking) input.placeholder = "🔊 जवाब सुना रहा हूँ… (रोकने के लिए 🎙️ दबाएँ)";
    else input.placeholder = ORIG_PH;
  }

  let flashT = null;
  function flash(msg, ms = 2500) {
    flashing = true;
    input.placeholder = msg;
    clearTimeout(flashT);
    flashT = setTimeout(() => {
      flashing = false;
      setState();
    }, ms);
  }

  if (!SR) {
    micBtn.disabled = true;
    langSel.disabled = true;
    micBtn.title = "Voice के लिए Chrome या Edge use करें";
    flash("Voice इस browser में नहीं चलेगा, Chrome या Edge use करें", 6000);
  }

  /* ---------- Mic permission ---------- */
  async function ensureMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
      return true;
    } catch (e) {
      console.warn("Mic error:", e);
      if (e.name === "NotAllowedError" || e.name === "SecurityError") {
        flash("Mic block है। 🔒 पर click करके Microphone → Allow करें", 6000);
      } else if (e.name === "NotFoundError") {
        flash("Mic नहीं मिला, mic connect करें", 4000);
      } else {
        flash("Mic error: " + e.name, 4000);
      }
      return false;
    }
  }

  /* ---------- Speech-to-text ---------- */
  const ERR_MSG = {
    "not-allowed": "Mic permission नहीं मिली। 🔒 → Microphone → Allow करें",
    "service-not-allowed": "Browser का speech service बंद है। Settings में Online speech recognition ON करें",
    "audio-capture": "Mic नहीं मिला, mic connect करें",
    "language-not-supported": "इस भाषा का voice support नहीं, दूसरी भाषा चुनें",
    network: "Internet check करें, voice के लिए internet चाहिए",
    "no-speech": "कुछ सुनाई नहीं दिया, फिर से 🎙️ दबाएँ",
    aborted: "Voice रुक गया, फिर से 🎙️ दबाएँ",
  };

  async function startListen() {
    if (!SR || listening || starting) return;
    if (!window.isSecureContext) {
      flash("Mic के लिए site https या localhost पर खोलें (IP address से नहीं)", 6000);
      return;
    }
    starting = true;
    if (speaking) {
      speechSynthesis.cancel();
      speaking = false;
    }
    const ok = await ensureMic();
    starting = false;
    if (!ok) return;

    const my = ++session;
    heard = "";
    lastErr = "";
    userStopped = false;
    input.value = "";

    rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = lang;

    rec.onstart = () => {
      if (my !== session) return;
      listening = true;
      setState();
    };

    rec.onresult = (e) => {
      if (my !== session) return;
      let fin = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += t;
        else interim += t;
      }
      if (fin) heard = (heard + " " + fin).trim();
      const live = (heard + " " + interim).trim();
      input.value = live;
      clearTimeout(silenceT);
      if (live) silenceT = setTimeout(finish, SILENCE_MS);
    };

    rec.onerror = (e) => {
      if (my !== session) return;
      lastErr = e.error;
      console.warn("Voice error:", e.error);
      if (ERR_MSG[e.error]) flash(ERR_MSG[e.error], 4500);
    };

    rec.onend = () => {
      if (my !== session) return;
      listening = false;
      if (userStopped) {
        userStopped = false;
        setState();
        return;
      }
      if (input.value.trim()) {
        finish();
        return;
      }
      setState();
    };

    try {
      rec.start();
      setTimeout(() => (starting = false), 300);
    } catch (err) {
      console.warn("Voice start error:", err);
      flash("Voice start नहीं हुआ, page reload करके फिर try करें", 4000);
    }
  }

  function stopListen() {
    clearTimeout(silenceT);
    if (rec && listening) {
      userStopped = true;
      listening = false;
      try { rec.stop(); } catch {}
    }
    setState();
  }

  function finish() {
    clearTimeout(silenceT);
    const q = input.value.trim();
    stopListen();
    if (!q) return;
    // Sawal ki bhasha pehchan kar jawab ki bhasha tay karo
    const r = detectReply(q);
    replyCode = r.tts;
    replyHint = " (" + r.hint + " Keep the explanation simple for a school student.)";
    voiceQ = q;
    lastQ = q;
    fromVoice = true;
    if (form.requestSubmit) form.requestSubmit();
    else form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  }

  form.addEventListener("submit", () => {
    if (!fromVoice) return;
    fromVoice = false;
    voicePending = true;
    snap = "";
  }, true);

  /* ---------- Text-to-speech ---------- */
  function pickVoice(code) {
    const vs = speechSynthesis.getVoices();
    return vs.find((v) => v.lang === code) || vs.find((v) => v.lang.startsWith(code.slice(0, 2))) || null;
  }

  function speak(text) {
    if (!hasTTS) {
      doneSpeaking();
      return;
    }
    speechSynthesis.cancel();
    const parts = text
      .slice(0, 1500)
      .split(/(?<=[।.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;

    const voice = pickVoice(replyCode);
    speaking = true;
    setState();
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      u.lang = replyCode;
      u.rate = 1.05;
      if (voice) u.voice = voice;
      if (i === parts.length - 1) {
        u.onend = doneSpeaking;
        u.onerror = doneSpeaking;
      }
      speechSynthesis.speak(u);
    });
  }

  function doneSpeaking() {
    if (!speaking) return;
    speaking = false;
    setState();
  }

  function getText(el) {
    if (!el) return "";
    const c = el.cloneNode(true);
    c.querySelectorAll("button, svg, pre, script, style, img").forEach((n) => n.remove());
    return c.innerText.replace(/[*#`_>|~]/g, " ").replace(/\s+/g, " ").trim();
  }

  function settle() {
    const t = getText(chat.lastElementChild);
    if (t !== snap) {
      snap = t;
      settleT = setTimeout(settle, SETTLE_MS);
      return;
    }
    if (t.length < 4 || t === lastQ) return;
    if (/सोच रहा|thinking|loading/i.test(t)) return;
    voicePending = false;
    speak(t);
  }

  const obs = new MutationObserver(() => {
    if (!voicePending) return;
    clearTimeout(settleT);
    settleT = setTimeout(settle, SETTLE_MS);
  });
  obs.observe(chat, { childList: true, subtree: true, characterData: true });

  /* ---------- Controls ---------- */
  micBtn.addEventListener("click", () => {
    if (!SR) return;
    if (listening) finish();
    else startListen();
  });

  langSel.addEventListener("change", () => {
    lang = langSel.value;
    store.set("vtLang", lang);
    flash("बोलने की भाषा: " + (NAMES[lang] || lang), 1800);
  });

  setState();
})();