(function () {
  const newChat = document.getElementById("newChat");
  const list = document.getElementById("list");
  if (!list) return;

  const style = document.createElement("style");
  style.textContent = `
    #histBox {
      margin: 10px 0 8px;
      padding: 10px 8px;
      border-radius: 16px;
      background: rgba(15, 15, 30, 0.55);
      border: 1px solid rgba(167, 139, 250, 0.35);
      box-shadow: 0 0 18px rgba(167, 139, 250, 0.25);
    }
    #histHead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 4px 6px 8px;
      font: 700 15px "Outfit", "Segoe UI", sans-serif;
      color: #e9d5ff;
      text-shadow: 0 0 10px rgba(167, 139, 250, 0.7);
    }
    #histNew {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid rgba(34, 211, 238, 0.6);
      background: rgba(34, 211, 238, 0.12);
      color: #67e8f9;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      box-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
      transition: background 0.25s ease;
    }
    #histNew:hover { background: rgba(34, 211, 238, 0.28); }
    #histBox #list {
      max-height: 300px;
      overflow-y: auto;
      padding-right: 2px;
    }
    #histBox #list::-webkit-scrollbar { width: 6px; }
    #histBox #list::-webkit-scrollbar-thumb {
      background: rgba(167, 139, 250, 0.5);
      border-radius: 6px;
    }
  `;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.id = "histBox";
  box.innerHTML = `
    <div id="histHead">
      <span>📜 History</span>
      <button id="histNew" type="button" title="नई चैट शुरू करें">+</button>
    </div>
  `;

  // New Chat button ki jagah History box lagao
  if (newChat) newChat.replaceWith(box);
  else list.parentElement.insertBefore(box, list);

  // Chat list ko History box ke andar le jao
  box.appendChild(list);

  // + se naya chat (Home wala logic reuse)
  document.getElementById("histNew").addEventListener("click", () => {
    const home = document.getElementById("homeBtn");
    if (home) home.click();
  });
})();