(function () {
  /* ====== YAHAN APNI DETAILS BADLEIN ====== */
  const CONFIG = {
    upiId: "7762036889@ybl",                 // apna UPI ID
    payeeName: "Students AI",
    qrSrc: "upi-qr.jpeg",                   // public folder mein wali QR image
    message: "आपका छोटा सा सहयोग हमें आगे बढ़ने में मदद करता है 🙏",
  };
  /* ======================================== */

  const CSS = `
    #donateBox {
      position: fixed; top: 120px; right: 18px; z-index: 40; width: 190px;
      padding: 12px; border-radius: 16px; text-align: center;
      background: rgba(15, 15, 30, 0.88); border: 1px solid rgba(34, 211, 238, 0.5);
      box-shadow: 0 0 18px rgba(34, 211, 238, 0.3);
      color: #e5e7eb; font: 12px "Outfit", "Segoe UI", sans-serif;
    }
    #donateBox .dn-title {
      font-weight: 700; font-size: 13px; color: #67e8f9; cursor: pointer;
      text-shadow: 0 0 8px rgba(34, 211, 238, 0.7); user-select: none;
    }
    #donateBox .dn-body { margin-top: 8px; }
    #donateBox.collapsed .dn-body { display: none; }
    #donateBox .dn-qr {
      width: 150px; height: 150px; object-fit: contain; display: block; margin: 0 auto;
      background: #fff; border-radius: 10px; padding: 6px;
      box-shadow: 0 0 14px rgba(167, 139, 250, 0.6);
    }
    #donateBox .dn-noqr {
      display: none; padding: 10px; font-size: 11px; color: #fca5a5;
      border: 1px dashed rgba(252, 165, 165, 0.5); border-radius: 10px;
    }
    #donateBox .dn-msg { margin: 8px 0 4px; line-height: 1.4; color: #cbd5e1; }
    #donateBox .dn-upi { color: #fde68a; word-break: break-all; font-size: 12px; }
    #donateBox .dn-copy {
      margin-top: 8px; width: 100%; padding: 7px; border-radius: 20px; cursor: pointer;
      border: 1px solid #a78bfa; color: #fff; font: 600 12px "Outfit", "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #22d3ee, #a855f7);
      box-shadow: 0 0 12px rgba(167, 139, 250, 0.5);
    }
    #donateBox .dn-copy:hover { filter: brightness(1.12); }
    @media (max-width: 760px) { #donateBox { display: none; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.id = "donateBox";
  box.innerHTML = `
    <div class="dn-title" id="dnTitle">💝 Support Students AI ▾</div>
    <div class="dn-body">
      <img class="dn-qr" id="dnQr" src="${CONFIG.qrSrc}" alt="Donation QR code" />
      <div class="dn-noqr" id="dnNoQr">QR image नहीं मिली। public folder में ${CONFIG.qrSrc} रखें।</div>
      <div class="dn-msg">${CONFIG.message}</div>
      <div class="dn-upi">UPI: <b>${CONFIG.upiId}</b></div>
      <button class="dn-copy" id="dnCopy" type="button">UPI ID कॉपी करें</button>
    </div>
  `;
  document.body.appendChild(box);

  const qr = document.getElementById("dnQr");
  qr.addEventListener("error", () => {
    qr.style.display = "none";
    document.getElementById("dnNoQr").style.display = "block";
  });

  document.getElementById("dnTitle").addEventListener("click", () => {
    box.classList.toggle("collapsed");
    document.getElementById("dnTitle").textContent =
      box.classList.contains("collapsed") ? "💝 Support Students AI ▸" : "💝 Support Students AI ▾";
  });

  document.getElementById("dnCopy").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(CONFIG.upiId);
      btn.textContent = "कॉपी हो गया ✓";
    } catch {
      btn.textContent = CONFIG.upiId;
    }
    setTimeout(() => (btn.textContent = "UPI ID कॉपी करें"), 1800);
  });
})();