(function () {
  const side = document.getElementById("side");
  const list = document.getElementById("list");
  if (!side || !list) return;

  // Purana New Chat button hatao (ID se ya text se)
  const newChat =
    document.getElementById("newChat") ||
    Array.from(side.querySelectorAll("button")).find((b) =>
      b.textContent.includes("New Chat")
    );
  if (newChat) newChat.remove();

  const style = document.createElement("style");
  style.textContent = `
    #histBox {
      margin: 14px 0 8px;
      padding: 10px 8px;
      border-radius: 16px;
      background: rgba(15, 15, 30, 0.55);
      border: 1px solid rgba(167, 139, 250, 0.35);
      box-shadow: 0 0 18px rgba(167, 139, 250, 0.25);
    }
    #histHead {
      display: flex;
      align-items: center;
      padding: 4px 6px 8px;
      font: 700 15px "Outfit", "Segoe UI", sans-serif;
      color: #e9d5ff;
      text-shadow: 0 0 10px rgba(167, 139, 250, 0.7);
    }
    #histBox #list {
      max-height: 320px;
      overflow-y: auto;
      padding-right: 2px;
    }
    #histBox #list::-webkit-scrollbar { width: 6px; }
    #histBox #list::-webkit-scrollbar-thumb {
      background: rgba(167, 139, 250, 0.5);
      border-radius: 6px;
    }
    #histEmpty {
      font-size: 13px;
      color: #a5a1c2;
      padding: 6px 8px;
    }
  `;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.id = "histBox";
  box.innerHTML = `<div id="histHead"><span>📜 History</span></div>`;

  // Sidebar ke sabse neeche (Answer Check ke baad)
  side.appendChild(box);
  box.appendChild(list);

  const empty = document.createElement("div");
  empty.id = "histEmpty";
  empty.textContent = "अभी कोई पिछली चैट नहीं है";
  box.appendChild(empty);

  function syncEmpty() {
    empty.style.display = list.children.length === 0 ? "block" : "none";
  }
  new MutationObserver(syncEmpty).observe(list, { childList: true });
  syncEmpty();
})();