(function () {
  const css = `
    html, body {
      height: auto !important;
      min-height: 100%;
      overflow-y: auto !important;
      -webkit-text-size-adjust: 100%;
      overscroll-behavior-y: contain;
    }
    @media (max-width: 860px) {
      html, body { width: 100%; overflow-x: hidden !important; }
      * { box-sizing: border-box; }
      img, video, canvas, svg { max-width: 100%; }
      pre, table { display: block; max-width: 100%; overflow-x: auto; }
      #chat { padding: 12px 12px 8px !important; }
      #input { font-size: 16px !important; }
      #heroWrap .hr-stats,
      #heroWrap .hr-tools { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
      .hr-card { padding: 14px !important; }
    }
    @media (max-width: 380px) {
      #heroWrap .hr-stats,
      #heroWrap .hr-tools { grid-template-columns: 1fr !important; }
    }
  `;
  try {
    const st = document.createElement("style");
    st.id = "mobile-fix";
    st.textContent = css;
    document.head.appendChild(st);
  } catch (e) {}

  // Sidebar/drawer band hone ke baad body ka overflow lock reset karein
  const unlock = () => {
    const open = document.querySelector(".open, .show, .active-sidebar");
    if (!open) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  };
  try {
    new MutationObserver(unlock).observe(document.body, { attributes: true, subtree: false, attributeFilter: ["style", "class"] });
  } catch (e) {}

  // Back button se page wapas aaye to purani (cached) state ki jagah fresh load ho
  window.addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
})();