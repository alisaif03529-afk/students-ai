// ---------- होम बटन: किसी भी पेज से वापस चैट/लैंप वाली होम स्क्रीन ----------
(function () {
  const homeBtn = document.getElementById("homeBtn");
  if (!homeBtn) return;

  homeBtn.addEventListener("click", () => {
    // सभी खास मोड बंद करो
    if (typeof clearInterval === "function" && typeof examTimer !== "undefined") {
      clearInterval(examTimer);
    }
    inNotes = false;
    currentId = null;
    form.style.display = "";
    chat.innerHTML = "";
    document.querySelectorAll("#list > div").forEach((d) => d.classList.remove("active"));

    // नई खाली चैट बनाकर होम स्क्रीन दिखाओ (लैंप अपने-आप welcome.js से आ जाएगा)
    fetch("/api/chats", { method: "POST" })
      .then((r) => r.json())
      .then((c) => {
        currentId = c.id;
        loadList();
      });
  });
})();