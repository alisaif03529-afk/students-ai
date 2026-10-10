(function () {
  const chat = document.getElementById("chat");
  const main = document.getElementById("main") || (chat && chat.parentElement);
  if (!chat || !main) return;

  const CSS = `
  #main { position: relative; }
  #swLamp {
    position: absolute; left: 50%; top: 44%;
    transform: translate(-50%, -50%);
    width: 360px; height: 440px; z-index: 2;
    display: flex; flex-direction: column; align-items: center;
    pointer-events: none;
  }
  #swLamp.sw-hidden { display: none !important; }

  #swLamp .sw-lamp {
    position: relative; width: 240px; height: 280px;
    cursor: pointer; pointer-events: auto;
    transition: transform .3s ease;
  }
  #swLamp .sw-lamp:hover { transform: translateY(-3px); }
  #swLamp .sw-svg { width: 100%; height: 100%; overflow: visible; }

  #swLamp .sw-shade { transition: filter .8s ease; }
  #swLamp.on .sw-shade { filter: drop-shadow(0 0 14px rgba(253,224,71,.55)); }

  #swLamp .sw-bulb { fill: #3a3a2a; transition: fill .6s ease, filter .6s ease; }
  #swLamp.on .sw-bulb {
    fill: #fffbe0;
    filter: drop-shadow(0 0 10px #fde047) drop-shadow(0 0 22px #f59e0b);
    animation: swBulbPulse 2.4s ease-in-out infinite;
  }
  #swLamp .sw-bulbGlow { fill: rgba(253,224,71,0); transition: fill .8s ease; }
  #swLamp.on .sw-bulbGlow { fill: rgba(253,224,71,.55); filter: blur(6px); }

  #swLamp .sw-pole { fill: #22222e; }
  #swLamp .sw-base { fill: #22222e; }
  #swLamp .sw-cord line { stroke: #b8a46a; stroke-width: 2; }
  #swLamp .sw-cord rect { fill: #d9c27a; }
  #swLamp.on .sw-cord rect { fill: #fde047; filter: drop-shadow(0 0 6px #fde047); }

  #swLamp .sw-beam {
    position: absolute; left: 50%; top: 120px;
    width: 440px; height: 330px; transform: translateX(-50%);
    clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%);
    background: linear-gradient(180deg, rgba(253,224,71,.6), rgba(251,146,60,.22) 65%, rgba(251,146,60,0));
    opacity: 0; transition: opacity 1s ease;
    pointer-events: none;
  }
  #swLamp.on .sw-beam { opacity: 1; animation: swBeamFlicker 4s ease-in-out infinite; }

  #swLamp .sw-text {
    position: absolute; top: 310px; left: 0; right: 0;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    pointer-events: none;
  }
  #swLamp .sw-text span {
    font: 800 24px "Outfit", "Segoe UI", sans-serif;
    letter-spacing: .5px;
    opacity: 0; transform: translateY(12px); filter: blur(6px);
    color: transparent;
    background: linear-gradient(90deg, #fde047, #fb923c, #67e8f9, #f472b6, #fde047);
    background-size: 300% auto;
    -webkit-background-clip: text; background-clip: text;
    transition: opacity .8s ease, transform .8s cubic-bezier(.22,1,.36,1), filter .8s ease;
  }
  #swLamp.on .sw-text span {
    opacity: 1; transform: none; filter: drop-shadow(0 0 8px rgba(253,224,71,.5));
    animation: swShine 6s linear infinite;
  }
  #swLamp.on .sw-text span:nth-child(1) { transition-delay: .6s; }
  #swLamp.on .sw-text span:nth-child(2) { transition-delay: 1.1s; }
  #swLamp.on .sw-text span:nth-child(3) { transition-delay: 1.6s; }

  @keyframes swBulbPulse {
    0%, 100% { filter: drop-shadow(0 0 10px #fde047) drop-shadow(0 0 22px #f59e0b); }
    50% { filter: drop-shadow(0 0 16px #fde047) drop-shadow(0 0 34px #f59e0b); }
  }
  @keyframes swBeamFlicker {
    0%, 100% { opacity: 1; }
    50% { opacity: .85; }
  }
  @keyframes swShine {
    to { background-position: 300% center; }
  }

  @media (prefers-reduced-motion: reduce) {
    #swLamp .sw-beam, #swLamp .sw-text span, #swLamp.on .sw-bulb { animation: none !important; }
  }
  `;

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  if (getComputedStyle(main).position === "static") main.style.position = "relative";

  const wrap = document.createElement("div");
  wrap.id = "swLamp";
  wrap.innerHTML = `
    <div class="sw-beam"></div>
    <div class="sw-lamp" title="Lamp par click karke light on/off karein">
      <svg class="sw-svg" viewBox="0 0 240 280" aria-hidden="true">
        <defs>
          <linearGradient id="swShadeG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#6b6b84" />
            <stop offset="1" stop-color="#2a2a3a" />
          </linearGradient>
        </defs>
        <path class="sw-shade" d="M40 108 Q120 2 200 108 Z" fill="url(#swShadeG)" />
        <ellipse class="sw-bulbGlow" cx="120" cy="110" rx="38" ry="12" />
        <ellipse class="sw-bulb" cx="120" cy="110" rx="26" ry="9" />
        <rect class="sw-pole" x="117" y="110" width="6" height="140" />
        <ellipse class="sw-base" cx="120" cy="255" rx="48" ry="9" />
        <g class="sw-cord">
          <line x1="166" y1="108" x2="166" y2="160" />
          <rect x="160" y="160" width="12" height="22" rx="6" />
        </g>
      </svg>
    </div>
    <div class="sw-text">
      <span>Dream Big.</span>
      <span>Learn More.</span>
      <span>Achieve More. 🚀</span>
    </div>
  `;
  main.appendChild(wrap);

  const lamp = wrap.querySelector(".sw-lamp");
  let timer = null;

  function lightOn(delay) {
    clearTimeout(timer);
    timer = setTimeout(() => wrap.classList.add("on"), delay || 0);
  }

  function toggle() {
    clearTimeout(timer);
    wrap.classList.toggle("on");
  }

  lamp.addEventListener("click", toggle);

  // Chat khali hone par lamp dikhe aur apne aap jal jaye
  let wasEmpty = null;
  function sync() {
    const empty = chat.children.length === 0;
    wrap.classList.toggle("sw-hidden", !empty);
    if (empty && wasEmpty !== true) {
      wrap.classList.remove("on");
      lightOn(500);
    }
    if (!empty) clearTimeout(timer);
    wasEmpty = empty;
  }

  new MutationObserver(sync).observe(chat, { childList: true });
  sync();
})();