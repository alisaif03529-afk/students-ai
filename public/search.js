// ---------- चैट सर्च (टाइप करते ही सूची छनती है) ----------
(function () {
  const input = document.getElementById("chatSearch");
  const list = document.getElementById("list");
  if (!input || !list) return;

  function applyFilter() {
    const q = input.value.trim().toLowerCase();
    [...list.children].forEach((row) => {
      const text = (row.querySelector("span")?.textContent || "").toLowerCase();
      row.classList.toggle("search-hidden", q !== "" && !text.includes(q));
    });
  }

  input.addEventListener("input", applyFilter);

  // जब भी चैट सूची दोबारा बने (नई चैट, नाम बदलना, डिलीट), फ़िल्टर फिर लगे
  new MutationObserver(applyFilter).observe(list, { childList: true });
})();