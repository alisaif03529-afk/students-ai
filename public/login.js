(function () {
  const $ = (s) => document.querySelector(s);
  const ring = $('#ring');
  const content = $('#content');
  const title = $('#title');
  const sub = $('#sub');
  const nameWrap = $('#nameWrap');
  const nameInput = $('#name');
  const emailInput = $('#email');
  const pwInput = $('#password');
  const form = $('#authForm');
  const submit = $('#submit');
  const err = $('#error');
  const swText = $('#swText');
  const swBtn = $('#swBtn');

  const TEXT = {
    signup: {
      title: 'Sign Up',
      sub: 'Create your account',
      btn: 'CREATE ACCOUNT',
      swText: 'Already have an account?',
      swBtn: 'Login',
    },
    login: {
      title: 'Login',
      sub: 'Welcome back',
      btn: 'LOGIN',
      swText: "Don't have an account?",
      swBtn: 'Sign Up',
    },
  };

  let mode = 'signup';
  let busy = false;

  function apply(m) {
    mode = m;
    const t = TEXT[m];
    title.textContent = t.title;
    sub.textContent = t.sub;
    submit.textContent = t.btn;
    swText.textContent = t.swText;
    swBtn.textContent = t.swBtn;
    nameWrap.classList.toggle('hide', m !== 'signup');
    nameInput.required = m === 'signup';
    err.textContent = '';
  }

  // Ring 360deg ghoomta hai, aur content fade ke saath badalta hai
  function swap(next) {
    if (busy || next === mode) return;
    busy = true;
    ring.animate(
      [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      { duration: 800, easing: 'cubic-bezier(.4, 0, .2, 1)', composite: 'add' }
    );
    content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).onfinish = () => {
      apply(next);
      content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: 'forwards' }).onfinish = () => {
        busy = false;
      };
    };
  }

  function setBusy(on) {
    submit.disabled = on;
    submit.textContent = on ? '...' : TEXT[mode].btn;
  }

  swBtn.addEventListener('click', () => swap(mode === 'signup' ? 'login' : 'signup'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    err.textContent = '';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = pwInput.value;

    if (mode === 'signup' && !name) return (err.textContent = 'नाम लिखें');
    if (!email || !password) return (err.textContent = 'ईमेल और पासवर्ड भरें');

    setBusy(true);
    try {
      const body = mode === 'signup' ? { name, email, password } : { email, password };
      const res = await fetch('/api/auth/' + mode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        err.textContent = data.error || 'कुछ गड़बड़ हुई, दोबारा कोशिश करें';
        setBusy(false);
        return;
      }
      location.href = '/index.html';
    } catch (_) {
      err.textContent = 'सर्वर से कनेक्ट नहीं हो पा रहा';
      setBusy(false);
    }
  });

  // Pehle se login ho to seedha index par bhejein
  fetch('/api/auth/me', { credentials: 'same-origin' })
    .then((r) => { if (r.ok) location.replace('/index.html'); })
    .catch(() => {});

  apply('signup');
})();