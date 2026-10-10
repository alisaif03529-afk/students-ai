(function () {
  const CSS = `
    [data-neon] { position: relative; isolation: isolate; }

    .nr-ring {
      position: absolute; inset: -28px; pointer-events: none; z-index: -1;
      border-radius: 50%; border: 1.5px solid rgba(255, 255, 255, 0.55); opacity: 0.6;
      animation: nrMorph 9s ease-in-out infinite, nrSpin 16s linear infinite;
      transition: opacity 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease;
    }
    .nr-ring.r2 { inset: -20px; animation-duration: 11s, 22s; animation-direction: normal, reverse; }
    .nr-ring.r3 { inset: -36px; animation-duration: 13s, 18s; }

    /* Click / focus par: rang, glow aur tez motion */
    [data-neon].nr-on .nr-ring { opacity: 1; }
    [data-neon].nr-on .nr-ring.r1 {
      border-color: #facc15; animation-duration: 3.5s, 8s;
      box-shadow: 0 0 18px #facc15, inset 0 0 14px rgba(250, 204, 21, 0.6);
    }
    [data-neon].nr-on .nr-ring.r2 {
      border-color: #22c55e; animation-duration: 4.5s, 10s;
      box-shadow: 0 0 18px #22c55e, inset 0 0 14px rgba(34, 197, 94, 0.6);
    }
    [data-neon].nr-on .nr-ring.r3 {
      border-color: #ef4444; animation-duration: 5s, 9s;
      box-shadow: 0 0 18px #ef4444, inset 0 0 14px rgba(239, 68, 68, 0.6);
    }

    @keyframes nrMorph {
      0%, 100% { border-radius: 42% 58% 61% 39% / 45% 42% 58% 55%; }
      25% { border-radius: 58% 42% 35% 65% / 52% 60% 40% 48%; }
      50% { border-radius: 46% 54% 60% 40% / 40% 58% 42% 60%; }
      75% { border-radius: 62% 38% 48% 52% / 56% 36% 64% 44%; }
    }
    @keyframes nrSpin { to { transform: rotate(360deg); } }

    @media (prefers-reduced-motion: reduce) { .nr-ring { animation: none; } }
  `;

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  document.querySelectorAll("[data-neon]").forEach((el) => {
    if (el.querySelector(":scope > .nr-ring")) return;

    ["r1", "r2", "r3"].forEach((c) => {
      const r = document.createElement("span");
      r.className = "nr-ring " + c;
      r.setAttribute("aria-hidden", "true");
      el.insertBefore(r, el.firstChild);
    });

    const on = () => el.classList.add("nr-on");
    const off = () => {
      if (!el.contains(document.activeElement)) el.classList.remove("nr-on");
    };

    el.addEventListener("click", on);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", () => setTimeout(off, 0));
    document.addEventListener("click", (e) => {
      if (!el.contains(e.target)) el.classList.remove("nr-on");
    });
  });
})();