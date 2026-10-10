(function () {
  const chat = document.getElementById("chat");
  if (!chat) return;

  const fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap";
  document.head.appendChild(fl);

  const CSS = `
    .mm-box {
      margin: 12px 0; padding: 14px; border-radius: 14px; text-align: center; overflow-x: auto;
      background: rgba(10, 12, 28, 0.75); border: 1px solid rgba(34, 211, 238, 0.45);
      box-shadow: 0 0 16px rgba(34, 211, 238, 0.2);
    }
    .mm-box svg { max-width: 100%; height: auto; }
    .mm-box svg text { font-family: Caveat, "Nirmala UI", "Segoe UI", cursive; }
    .mm-title {
      text-align: left; margin-bottom: 6px; font: 600 12px "Outfit", "Segoe UI", sans-serif; color: #67e8f9;
    }
    .mm-box details { margin-top: 10px; text-align: left; }
    .mm-box summary { cursor: pointer; font-size: 12px; color: #a5b4fc; }
    .mm-box details pre { white-space: pre-wrap; font-size: 12px; }
    .mm-fail { text-align: left; color: #fca5a5; font-size: 12px; }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  let ready = false;
  let counter = 0;
  let timer1 = null;
  let timer2 = null;

  const MM_START = /^(flowchart|graph|sequenceDiagram|mindmap|stateDiagram|timeline|pie|classDiagram)\b/;
  const ARROW = /\s*(?:-+>|=+>|→)\s*/;

  // Hand-drawn (sketch) filter: lines thodi tedhi-medhi dikhti hain
  const SKETCH = `<filter id="sketchF" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter>`;

  // Tayaar hand-drawn dil ka chitra
  const HEART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 460">
  <defs>${SKETCH}</defs>
  <text x="460" y="34" fill="#f1f5f9" font-size="26" font-weight="600" text-anchor="middle">Human Heart / मानव हृदय</text>
  <g filter="url(#sketchF)" stroke="#1e293b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <g transform="translate(260,20)">
      <path d="M300 360 C150 260 80 190 90 130 C100 70 170 50 220 80 C260 100 285 130 300 150 C315 130 340 100 380 80 C430 50 500 70 510 130 C520 190 450 260 300 360 Z" fill="#fecaca"/>
      <path d="M380 215 C380 150 410 95 470 90" fill="none" stroke="#b91c1c" stroke-width="16"/>
      <path d="M215 220 C215 150 240 110 300 105" fill="none" stroke="#1d4ed8" stroke-width="14"/>
      <path d="M175 135 C170 100 165 80 150 60" fill="none" stroke="#2563eb" stroke-width="14"/>
      <path d="M415 140 C430 110 440 90 460 70" fill="none" stroke="#dc2626" stroke-width="12"/>
      <ellipse cx="190" cy="170" rx="52" ry="40" fill="#60a5fa"/>
      <ellipse cx="395" cy="165" rx="52" ry="40" fill="#f87171"/>
      <ellipse cx="205" cy="265" rx="58" ry="52" fill="#3b82f6"/>
      <ellipse cx="390" cy="270" rx="60" ry="56" fill="#ef4444"/>
    </g>
  </g>
  <g stroke="#94a3b8" stroke-width="1.5" fill="none">
    <line x1="200" y1="50" x2="410" y2="80"/>
    <line x1="200" y1="185" x2="398" y2="190"/>
    <line x1="200" y1="330" x2="420" y2="300"/>
    <line x1="786" y1="66" x2="735" y2="108"/>
    <line x1="786" y1="170" x2="712" y2="185"/>
    <line x1="786" y1="308" x2="712" y2="290"/>
  </g>
  <g fill="#facc15">
    <circle cx="410" cy="80" r="4"/><circle cx="398" cy="190" r="4"/><circle cx="420" cy="300" r="4"/>
    <circle cx="735" cy="108" r="4"/><circle cx="712" cy="185" r="4"/><circle cx="712" cy="290" r="4"/>
  </g>
  <g fill="#e2e8f0" font-size="18">
    <text x="10" y="44">Superior vena cava<tspan x="10" dy="22">ऊर्ध्व महाशिरा</tspan></text>
    <text x="10" y="180">Right atrium<tspan x="10" dy="22">दायाँ अलिंद</tspan></text>
    <text x="10" y="325">Right ventricle<tspan x="10" dy="22">दायाँ निलय</tspan></text>
    <text x="790" y="58">Aorta<tspan x="790" dy="22">महाधमनी</tspan></text>
    <text x="790" y="164">Left atrium<tspan x="790" dy="22">बायाँ अलिंद</tspan></text>
    <text x="790" y="302">Left ventricle<tspan x="790" dy="22">बायाँ निलय</tspan></text>
  </g>
</svg>`;

  // Tayaar hand-drawn dimaag ka chitra
  const BRAIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 460">
  <defs>
    ${SKETCH}
    <clipPath id="cerClip"><path d="M200 260 C170 220 180 150 230 120 C280 80 370 70 440 90 C520 110 560 160 555 220 C560 260 540 290 500 300 L230 310 C210 300 205 280 200 260 Z"/></clipPath>
  </defs>
  <text x="460" y="34" fill="#f1f5f9" font-size="26" font-weight="600" text-anchor="middle">Human Brain / मानव मस्तिष्क</text>
  <g filter="url(#sketchF)" stroke="#1e293b" stroke-width="3" stroke-linejoin="round">
    <path d="M200 260 C170 220 180 150 230 120 C280 80 370 70 440 90 C520 110 560 160 555 220 C560 260 540 290 500 300 L230 310 C210 300 205 280 200 260 Z" fill="#f9a8d4"/>
    <g clip-path="url(#cerClip)" stroke="none">
      <rect x="150" y="60" width="130" height="260" fill="#93c5fd"/>
      <rect x="280" y="60" width="130" height="90" fill="#86efac"/>
      <rect x="500" y="80" width="90" height="240" fill="#f9a8d4"/>
      <rect x="260" y="230" width="250" height="90" fill="#fcd34d"/>
    </g>
    <path d="M200 260 C170 220 180 150 230 120 C280 80 370 70 440 90 C520 110 560 160 555 220 C560 260 540 290 500 300 L230 310 C210 300 205 280 200 260 Z" fill="none"/>
    <path d="M260 170 Q300 150 340 175 T420 170" fill="none" opacity="0.5"/>
    <path d="M330 250 Q380 230 430 255 T520 240" fill="none" opacity="0.5"/>
    <ellipse cx="470" cy="325" rx="62" ry="30" fill="#c4b5fd"/>
    <path d="M320 300 L350 300 L355 395 L322 395 Z" fill="#fde68a"/>
  </g>
  <g stroke="#94a3b8" stroke-width="1.5" fill="none">
    <line x1="200" y1="150" x2="230" y2="180"/>
    <line x1="200" y1="40" x2="350" y2="95"/>
    <line x1="200" y1="380" x2="330" y2="370"/>
    <line x1="786" y1="180" x2="560" y2="190"/>
    <line x1="786" y1="270" x2="480" y2="265"/>
    <line x1="786" y1="340" x2="530" y2="325"/>
  </g>
  <g fill="#facc15">
    <circle cx="230" cy="180" r="4"/><circle cx="350" cy="95" r="4"/><circle cx="330" cy="370" r="4"/>
    <circle cx="560" cy="190" r="4"/><circle cx="480" cy="265" r="4"/><circle cx="530" cy="325" r="4"/>
  </g>
  <g fill="#e2e8f0" font-size="18">
    <text x="10" y="134">Frontal lobe<tspan x="10" dy="22">अग्र पालि</tspan></text>
    <text x="10" y="30">Parietal lobe<tspan x="10" dy="22">पार्श्विका पालि</tspan></text>
    <text x="10" y="366">Brainstem<tspan x="10" dy="22">मस्तिष्क स्तंभ</tspan></text>
    <text x="790" y="164">Occipital lobe<tspan x="790" dy="22">पश्च पालि</tspan></text>
    <text x="790" y="254">Temporal lobe<tspan x="790" dy="22">टेम्पोरल पालि</tspan></text>
    <text x="790" y="324">Cerebellum<tspan x="790" dy="22">अनुमस्तिष्क</tspan></text>
  </g>
</svg>`;

  // "A -> B -> C" wali lines ko mermaid flowchart mein badalna
  function arrowsToMermaid(text) {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => ARROW.test(l));
    if (!lines.length) return null;

    const ids = new Map();
    const nodes = [];
    const edges = [];
    const idOf = (label) => {
      if (!ids.has(label)) {
        const id = "N" + ids.size;
        ids.set(label, id);
        const clean = label.replace(/"/g, "'").slice(0, 60);
        nodes.push(`${id}["${clean}"]`);
      }
      return ids.get(label);
    };

    lines.forEach((line) => {
      const parts = line.split(ARROW).map((s) => s.trim()).filter(Boolean);
      parts.forEach((p) => idOf(p));
      for (let i = 0; i < parts.length - 1; i++) {
        edges.push(`${idOf(parts[i])} --> ${idOf(parts[i + 1])}`);
      }
    });

    if (ids.size < 2 || ids.size > 14) return null;
    return "flowchart TD\n  " + nodes.join("\n  ") + "\n  " + edges.join("\n  ");
  }

  // SVG ko safe banana: script, foreignObject aur on* events hata dena
  function sanitizeSvg(src) {
    const doc = new DOMParser().parseFromString(src, "image/svg+xml");
    if (doc.querySelector("parsererror")) return null;
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg") return null;

    svg.querySelectorAll("script, foreignObject, iframe, object, embed").forEach((n) => n.remove());
    svg.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((a) => {
        const n = a.name.toLowerCase();
        const v = a.value.trim().toLowerCase();
        if (n.startsWith("on") || ((n === "href" || n === "xlink:href") && v.startsWith("javascript:"))) {
          el.removeAttribute(a.name);
        }
      });
    });
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("style", "max-width:100%;height:auto");
    return document.importNode(svg, true);
  }

  function buildBox(title, original) {
    const box = document.createElement("div");
    box.className = "mm-box";
    box.innerHTML = `<div class="mm-title">${title}</div>`;
    const det = document.createElement("details");
    const sum = document.createElement("summary");
    sum.textContent = "कोड देखें";
    const pre = document.createElement("pre");
    pre.textContent = original;
    det.appendChild(sum);
    det.appendChild(pre);
    box.appendChild(det);
    return box;
  }

  async function renderMermaid(code, anchor, original, title) {
    const box = buildBox(title, original);
    anchor.replaceWith(box);
    const id = "mmd" + ++counter;
    try {
      const { svg } = await mermaid.render(id, code);
      const holder = document.createElement("div");
      holder.innerHTML = svg;
      box.insertBefore(holder, box.querySelector("details"));
    } catch (err) {
      console.warn("Diagram error:", err);
      const fail = document.createElement("div");
      fail.className = "mm-fail";
      fail.textContent = "Diagram नहीं बन सका, कोड नीचे है:";
      box.insertBefore(fail, box.querySelector("details"));
    }
    document.getElementById("d" + id)?.remove();
  }

  function renderSvg(src, anchor) {
    let source = src;
    if (/heart|हृदय|दिल/i.test(src)) source = HEART;
    else if (/brain|मस्तिष्क|cerebr|lobe|दिमाग/i.test(src)) source = BRAIN;

    const svg = sanitizeSvg(source);
    if (!svg) return false;
    const box = buildBox("✏️ चित्र / Diagram", src);
    const holder = document.createElement("div");
    holder.appendChild(svg);
    box.insertBefore(holder, box.querySelector("details"));
    anchor.replaceWith(box);
    return true;
  }

  function scan() {
    if (!ready) return;
    chat.querySelectorAll("code").forEach((el) => {
      if (el.dataset.mm) return;
      const text = el.textContent.trim();
      const pre = el.closest("pre");

      // Streaming ke beech adhoora code na banaye: pehli baar text sirf note karo
      if (el.dataset.seen !== text) {
        el.dataset.seen = text;
        return;
      }

      if (/language-svg/.test(el.className) || /^<svg[\s>]/i.test(text)) {
        el.dataset.mm = "1";
        renderSvg(text, pre || el);
        return;
      }

      if (/language-mermaid/.test(el.className) || MM_START.test(text)) {
        el.dataset.mm = "1";
        renderMermaid(text, pre || el, text, "📊 Diagram");
        return;
      }

      if (pre && ARROW.test(text)) {
        el.dataset.mm = "1";
        const code = arrowsToMermaid(text);
        if (code) renderMermaid(code, pre, text, "📊 Flow diagram");
      }
    });
  }

  const obs = new MutationObserver(() => {
    clearTimeout(timer1);
    clearTimeout(timer2);
    timer1 = setTimeout(scan, 300);
    timer2 = setTimeout(scan, 1500);
  });
  obs.observe(chat, { childList: true, subtree: true, characterData: true });

  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";
  s.onload = () => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "strict",
      flowchart: { htmlLabels: false, curve: "basis" },
    });
    ready = true;
    scan();
  };
  s.onerror = () => {
    ready = true;
    console.warn("Mermaid load नहीं हुआ, internet check करें");
    scan();
  };
  document.head.appendChild(s);
})();