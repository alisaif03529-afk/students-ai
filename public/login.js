const $ = (id) => document.getElementById(id);
let mode = "login";
let busy = false;
let submitting = false;

const TEXT = {
  login: { title: "Welcome Back", sub: "अपने अकाउंट में लॉगिन करें", submit: "Sign In" },
  signup: { title: "Create Account", sub: "नया अकाउंट बनाएँ", submit: "Sign Up" },
};

// फायरफ्लाइज़
for (let i = 0; i < 30; i++) {
  const s = document.createElement("span");
  s.style.left = Math.random() * 100 + "vw";
  s.style.top = Math.random() * 100 + "vh";
  s.style.animationDelay = Math.random() * 6 + "s";
  $("fireflies").appendChild(s);
}

// मोड बदलने पर टेक्स्ट और फ़ील्ड
function applyMode(m) {
  mode = m;
  const t = TEXT[m];
  $("title").textContent = t.title;
  $("sub").textContent = t.sub;
  $("submit").textContent = t.submit;
  $("nameWrap").classList.toggle("open", m === "signup");
  $("name").required = m === "signup";
  $("error").textContent = "";
  document.querySelectorAll(".tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.mode === m)
  );
}

// कार्ड को घुमाकर मोड बदलना
async function switchMode(m) {
  if (m === mode || busy) return;
  busy = true;
  const card = $("authForm");

  await card.animate(
    [{ transform: "rotateY(0deg)" }, { transform: "rotateY(90deg)" }],
    { duration: 280, easing: "ease-in" }
  ).finished;

  applyMode(m);

  await card.animate(
    [{ transform: "rotateY(-90deg)" }, { transform: "rotateY(0deg)" }],
    { duration: 320, easing: "ease-out" }
  ).finished;

  busy = false;
}

document.querySelectorAll(".tab").forEach((b) =>
  b.addEventListener("click", () => switchMode(b.dataset.mode))
);

// Google / GitHub (अभी सिर्फ़ message)
document.querySelectorAll(".soc").forEach((b) =>
  b.addEventListener("click", () => ($("error").textContent = "यह सुविधा जल्द आएगी।"))
);

// सबमिट (लॉगिन या साइन-अप)
$("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitting) return;
  $("error").textContent = "";

  const btn = $("submit");
  const label = btn.textContent;
  submitting = true;
  btn.disabled = true;
  btn.textContent = "रुकें...";

  const body = {
    email: $("email").value,
    password: $("password").value,
  };
  if (mode === "signup") body.name = $("name").value;

  try {
    const res = await fetch("/api/auth/" + (mode === "signup" ? "signup" : "login"), {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      $("error").textContent = data.error || "कुछ गड़बड़ हुई (कोड " + res.status + ")";
      return;
    }

    // जाँचें कि सेशन सेव हुआ या नहीं
    const me = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!me.ok) {
      $("error").textContent = "लॉगिन हुआ, पर सेशन सेव नहीं हुआ। server.js जाँचें।";
      return;
    }
    location.href = "/index.html";
  } catch (err) {
    $("error").textContent = "सर्वर से कनेक्ट नहीं हो पाया।";
  } finally {
    submitting = false;
    btn.disabled = false;
    btn.textContent = label;
  }
});