require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const { readHandwriting } = require("./src/vision");
const { streamChat, generateStream } = require("./src/client");
const chats = require("./src/chatStore");
const notes = require("./src/notesStore");
const books = require("./src/books");
const analytics = require("./src/analyticsStore");
const gamify = require("./src/gamifyStore");
const { router: authRouter, requireAuth } = require("./src/auth");

const app = express();
app.set("trust proxy", 1);      // ← ye nayi line
app.use(express.json({ limit: "10mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
   cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

app.use("/api/auth", authRouter);
app.use("/api/profile", require("./src/profileRouter"));
app.use("/api/about", require("./src/aboutRouter"));
app.get("/api/analytics", requireAuth, (req, res) => {
  res.json(analytics.list(req.session.userId));
});

app.post("/api/analytics", requireAuth, (req, res) => {
  const score = Number(req.body.score);
  const total = Number(req.body.total);
  if (!(total >= 1) || !(score >= 0) || score > total) {
    return res.status(400).json({ error: "Score galat hai" });
  }
  res.json(
    analytics.add(req.session.userId, {
      subject: req.body.subject,
      topic: req.body.topic,
      score,
      total,
      date: req.body.date,
    })
  );
});

app.delete("/api/analytics/:id", requireAuth, (req, res) => {
  res.json(analytics.remove(req.session.userId, req.params.id));
});

app.get("/api/gamify", requireAuth, (req, res) => {
  res.json(gamify.summary(req.session.userId, req.query.day));
});

app.post("/api/gamify/log", requireAuth, (req, res) => {
  const r = gamify.log(req.session.userId, req.body);
  res.status(r.error ? 400 : 200).json(r);
});

app.post("/api/gamify/goal", requireAuth, (req, res) => {
  const r = gamify.setGoal(req.session.userId, req.body);
  res.status(r.error ? 400 : 200).json(r);
});

app.post("/api/gamify/friend", requireAuth, async (req, res) => {
  try {
    const r = await gamify.addFriend(req.session.userId, req.body);
    res.status(r.error ? 400 : 200).json(r);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  if (!req.session.userId) return res.redirect("/login.html");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/index.html", (req, res) => {
  if (!req.session.userId) return res.redirect("/login.html");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use(express.static("public", { index: false }));

// ---------- चैट ----------
app.get("/api/chats", requireAuth, (req, res) => {
  res.json(chats.list(req.session.userId));
});

app.post("/api/chats", requireAuth, (req, res) => {
  res.json(chats.create(req.session.userId));
});

app.get("/api/chats/:id", requireAuth, (req, res) => {
  const chat = chats.get(req.session.userId, req.params.id);
  if (!chat) return res.status(404).json({ error: "नहीं मिली" });
  res.json(chat);
});

app.delete("/api/chats/:id", requireAuth, (req, res) => {
  chats.remove(req.session.userId, req.params.id);
  res.json({ ok: true });
});

app.patch("/api/chats/:id", requireAuth, (req, res) => {
  const title = String(req.body.title || "").slice(0, 60);
  const chat = chats.update(req.session.userId, req.params.id, (c) => {
    c.title = title || c.title;
  });
  if (!chat) return res.status(404).json({ error: "नहीं मिली" });
  res.json(chat);
});

app.post("/api/chats/:id/regenerate", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const chatId = req.params.id;
  chats.update(userId, chatId, (c) => {
    if (c.messages.length && c.messages[c.messages.length - 1].role === "assistant") {
      c.messages.pop();
    }
    if (c.messages.length && c.messages[c.messages.length - 1].role === "user") {
      c.messages.pop();
    }
  });
  res.json({ ok: true });
});

app.post("/api/chats/:id/message", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const chatId = req.params.id;
  const message = String(req.body.message || "").trim();
  if (!message) return res.status(400).end("खाली मैसेज।");

  const chat = chats.get(userId, chatId);
  if (!chat) return res.status(404).end("चैट नहीं मिली।");

  const history = [...chat.messages, { role: "user", content: message }];
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  let full = "";
  try {
    for await (const piece of streamChat(history)) {
      full += piece;
      res.write(piece);
    }
    chats.update(userId, chatId, (c) => {
      c.messages.push({ role: "user", content: message }, { role: "assistant", content: full });
      if (c.title === "नई चैट") c.title = message.slice(0, 30);
    });
    res.end();
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500);
    res.end(full ? "" : "कुछ गड़बड़ हुई, दोबारा कोशिश करें।");
  }
});

// ---------- किताब सूची (CBSE / BSEB) ----------
app.get("/api/books", requireAuth, (req, res) => {
  const data = books && books.boards ? books : { boards: { CBSE: {}, BSEB: {} } };
  res.json(data);
});

// ---------- मेरे नोट्स ----------
app.get("/api/notes", requireAuth, (req, res) => {
  res.json(notes.list(req.session.userId));
});

app.post("/api/notes", requireAuth, (req, res) => {
  const question = String(req.body.question || "").slice(0, 500);
  const answer = String(req.body.answer || "");
  if (!answer.trim()) return res.status(400).json({ error: "खाली जवाब" });
  res.json(notes.add(req.session.userId, question, answer));
});

app.delete("/api/notes/:id", requireAuth, (req, res) => {
  notes.remove(req.session.userId, req.params.id);
  res.json({ ok: true });
});
// ---------- प्रश्न जनरेटर (Short / Long / MCQ) ----------
const QGEN_HI = {
  short: "छोटे प्रश्न (Short Answer): हर प्रश्न का उत्तर 2-3 वाक्यों में। प्रश्न कम से कम 2 अंक के।",
  long: "लंबे प्रश्न (Long Answer): हर प्रश्न का उत्तर 8-10 वाक्यों में, उदाहरण सहित। प्रश्न कम से कम 5 अंक के।",
  mcq: "बहुविकल्पीय प्रश्न (MCQ): हर प्रश्न के 4 विकल्प, एक सही उत्तर।",
};
const QGEN_EN = {
  short: "Short Answer questions: each answer in 2-3 sentences. Questions worth at least 2 marks.",
  long: "Long Answer questions: each answer in 8-10 sentences with examples. Questions worth at least 5 marks.",
  mcq: "Multiple Choice Questions (MCQ): 4 options each, exactly one correct answer.",
};

app.post("/api/questions", requireAuth, async (req, res) => {
  const cls = String(req.body.classLevel || "").trim();
  const subject = String(req.body.subject || "").trim().slice(0, 60);
  const chapter = String(req.body.chapter || "").trim().slice(0, 160);
  const type = ["short", "long", "mcq"].includes(req.body.type) ? req.body.type : "short";
  const count = Math.min(Math.max(parseInt(req.body.count, 10) || 10, 3), 25);
  const lang = req.body.lang === "english" ? "english" : "hindi";
  if (!cls || !subject || !chapter) return res.status(400).end("कक्षा, विषय और अध्याय भरें।");

  const isEng = lang === "english";
  const typeText = isEng ? QGEN_EN[type] : QGEN_HI[type];
  const system = isEng
    ? `You are an experienced teacher for Indian schools (NCERT/state board). Create exam questions for the given class, subject and chapter.
Type: ${typeText}
Number of questions: exactly ${count}. Cover different topics of the chapter.
For each question give the answer or model answer, in Markdown. Numbered list. For MCQ, mark the correct option with ✅ and give a one-line explanation.
Language: only simple English.`
    : `आप भारतीय स्कूलों के अनुभवी शिक्षक हैं। दिए गए कक्षा, विषय और अध्याय पर परीक्षा के प्रश्न बनाएँ।
प्रकार: ${typeText}
प्रश्नों की संख्या: ठीक ${count}। अध्याय के अलग-अलग टॉपिक कवर करें।
हर प्रश्न का उत्तर (या मॉडल उत्तर) मार्कडाउन में दें। क्रमांक वाली सूची। MCQ में सही विकल्प को ✅ से चिह्नित करें और एक पंक्ति में व्याख्या दें।
भाषा: केवल हिंदी।`;

  const messages = [
    {
      role: "user",
      content: isEng
        ? `Class ${cls}, Subject: ${subject}, Chapter: ${chapter}. Create the questions now.`
        : `कक्षा ${cls}, विषय: ${subject}, अध्याय: ${chapter}। अब प्रश्न बनाओ।`,
    },
  ];
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  try {
    for await (const piece of generateStream(system, messages, 6000)) {
      res.write(piece);
    }
    res.end();
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500);
    res.end(isEng ? "Could not create questions, please try again." : "प्रश्न नहीं बन पाए, दोबारा कोशिश करें।");
  }
});
// ---------- फोटो से उत्तर पढ़ना ----------
app.post("/api/read-photo", requireAuth, async (req, res) => {
  const img = String(req.body.image || "");
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(img)) {
    return res.status(400).json({ error: "केवल JPG, PNG या WEBP फोटो भेजें।" });
  }
  try {
    const text = await readHandwriting(img);
    res.json({ text });
  } catch (err) {
    console.error("Vision error:", err.message);
    res.status(500).json({ error: "फोटो नहीं पढ़ी जा सकी। दोबारा कोशिश करें या उत्तर खुद लिखें।" });
  }
});
// ---------- उत्तर जाँच (Answer Checking) ----------
const CHECK_HI = `आप भारतीय बोर्ड परीक्षा के अनुभवी परीक्षक हैं। छात्र का लिखा उत्तर दिए गए प्रश्न और अध्याय के आधार पर जाँचें।
केवल हिंदी में, मार्कडाउन में, इस क्रम में जवाब दें:
1. 📊 अंक अनुमान: प्रश्न के कुल अंक में से अनुमानित अंक (जैसे 3/5) और एक लाइन में कारण
2. ✅ क्या सही है: बिंदु-वार, जो उत्तर में सही और अच्छा है
3. ❌ क्या छूट गया: बिंदु-वार, जो परीक्षा में लिखना ज़रूरी था लेकिन नहीं लिखा गया
4. 🛠 कहाँ सुधार चाहिए: भाषा, क्रम, उदाहरण, शब्दों के चुनाव पर सुझाव
5. ✍️ परीक्षा में ऐसे लिखें: एक आदर्श उत्तर का ढांचा (हेडिंग और बिंदु), जो छात्र सीधे उतार सके
6. 💡 एक ज़रूरी टिप
विनम्र और प्रोत्साहित करने वाला लहजा रखें।`;

const CHECK_EN = `You are an experienced board exam examiner. Check the student's written answer against the given question and chapter.
Reply only in simple English, in Markdown, in this order:
1. 📊 Marks estimate: estimated marks out of the total (e.g. 3/5) with one line of reason
2. ✅ What is correct: point-wise, what is right and good in the answer
3. ❌ What is missing: point-wise, what should have been written for full marks
4. 🛠 Where to improve: language, order, examples, word choice
5. ✍️ How to write it in the exam: an ideal answer skeleton (headings and points) the student can write directly
6. 💡 One important tip
Keep the tone polite and encouraging.`;

app.post("/api/check-answer", requireAuth, async (req, res) => {
  const question = String(req.body.question || "").trim().slice(0, 1500);
  const answer = String(req.body.answer || "").trim().slice(0, 6000);
  const cls = String(req.body.classLevel || "").trim();
  const subject = String(req.body.subject || "").trim().slice(0, 60);
  const marks = String(req.body.marks || "").trim().slice(0, 10);
  const lang = req.body.lang === "english" ? "english" : "hindi";
  if (!question || !answer) return res.status(400).end("प्रश्न और उत्तर दोनों लिखें।");

  const isEng = lang === "english";
  const messages = [
    {
      role: "user",
      content: isEng
        ? `Class ${cls}, Subject: ${subject || "General"}, Total marks: ${marks || "not given"}\nQuestion: ${question}\n\nStudent's answer:\n${answer}`
        : `कक्षा ${cls}, विषय: ${subject || "सामान्य"}, कुल अंक: ${marks || "दिए नहीं गए"}\nप्रश्न: ${question}\n\nछात्र का उत्तर:\n${answer}`,
    },
  ];
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  try {
    for await (const piece of generateStream(isEng ? CHECK_EN : CHECK_HI, messages, 4000)) {
      res.write(piece);
    }
    res.end();
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500);
    res.end(isEng ? "Could not check the answer, please try again." : "उत्तर की जाँच नहीं हो पाई, दोबारा कोशिश करें।");
  }
});
// ---------- Exam Preparation: टेस्ट और रिवीज़न ----------
function examSystem(isEng, count, mode) {
  const modeHi = {
    mock: "मॉक टेस्ट: पूरे विषय के मुख्य टॉपिक से मिले-जुले प्रश्न, परीक्षा जैसा कठिनाई-स्तर।",
    pyq: "पिछले वर्षों के बोर्ड परीक्षा की शैली के प्रश्न। ये नए बनाए गए अभ्यास प्रश्न हैं, वास्तविक पुराने प्रश्न-पत्र नहीं।",
    chapter: "केवल दिए गए अध्याय पर अध्याय-वार टेस्ट।",
  };
  const modeEn = {
    mock: "Mock test: mixed questions from all main topics of the subject, at exam difficulty.",
    pyq: "Previous-year style board exam questions. These are newly created practice questions, not real old papers.",
    chapter: "Chapter-wise test only on the given chapter.",
  };
  if (isEng) {
    return `You are an experienced question paper setter for Indian school board exams. ${modeEn[mode]}
Return ONLY JSON, no other text, no markdown, no code fences. Format:
{"questions":[{"q":"question","options":["A","B","C","D"],"answer":0,"topic":"short sub-topic name","explanation":"one-line explanation"}]}
Rules: exactly ${count} questions. 4 options each. "answer" is the index (0-3) of the correct option. "topic" must be a short sub-topic name so weak topics can be found. Language: only simple English.`;
  }
  return `आप भारतीय बोर्ड परीक्षा के अनुभवी प्रश्न-पत्र निर्माता हैं। ${modeHi[mode]}
केवल JSON लौटाएँ, कोई और टेक्स्ट, मार्कडाउन या कोड-फ़ेंस नहीं। फ़ॉर्मेट:
{"questions":[{"q":"प्रश्न","options":["A","B","C","D"],"answer":0,"topic":"उप-टॉपिक का छोटा नाम","explanation":"एक पंक्ति की व्याख्या"}]}
नियम: ठीक ${count} प्रश्न। हर प्रश्न के 4 विकल्प। "answer" 0-3 के बीच सही विकल्प का index। "topic" छोटा उप-टॉपिक नाम हो, ताकि कमज़ोर टॉपिक पहचाने जा सकें। भाषा: केवल हिंदी।`;
}

app.post("/api/exam-test", requireAuth, async (req, res) => {
  const cls = String(req.body.classLevel || "").trim();
  const subject = String(req.body.subject || "").trim().slice(0, 60);
  const chapter = String(req.body.chapter || "").trim().slice(0, 160);
  const mode = ["mock", "pyq", "chapter"].includes(req.body.mode) ? req.body.mode : "mock";
  const count = Math.min(Math.max(parseInt(req.body.count, 10) || 10, 5), 20);
  const lang = req.body.lang === "english" ? "english" : "hindi";
  if (!cls || !subject || !chapter) return res.status(400).json({ error: "कक्षा, विषय और अध्याय भरें।" });

  const isEng = lang === "english";
  const messages = [
    {
      role: "user",
      content: isEng
        ? `Class ${cls}, Subject: ${subject}, Chapter/Scope: ${chapter}. Make the test now.`
        : `कक्षा ${cls}, विषय: ${subject}, अध्याय/दायरा: ${chapter}। अब टेस्ट बनाओ।`,
    },
  ];
  try {
    let raw = "";
    for await (const piece of generateStream(examSystem(isEng, count, mode), messages, 6000)) {
      raw += piece;
    }
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const data = JSON.parse(raw.slice(start, end + 1));
    const questions = (data.questions || []).filter(
      (x) =>
        x && x.q && Array.isArray(x.options) && x.options.length === 4 &&
        Number.isInteger(x.answer) && x.answer >= 0 && x.answer <= 3
    );
    if (!questions.length) throw new Error("no valid questions");
    res.json({ questions });
  } catch (err) {
    console.error("Exam test error:", err.message);
    res.status(500).json({ error: "टेस्ट नहीं बन पाया, दोबारा कोशिश करें।" });
  }
});

app.post("/api/revision-plan", requireAuth, async (req, res) => {
  const days = [7, 15, 30].includes(Number(req.body.days)) ? Number(req.body.days) : 7;
  const hours = Math.min(Math.max(parseInt(req.body.hours, 10) || 2, 1), 6);
  const cls = String(req.body.classLevel || "").trim();
  const subject = String(req.body.subject || "").trim().slice(0, 60);
  const chapter = String(req.body.chapter || "").trim().slice(0, 160);
  const lang = req.body.lang === "english" ? "english" : "hindi";
  if (!cls || !subject || !chapter) return res.status(400).end("कक्षा, विषय और अध्याय भरें।");

  const isEng = lang === "english";
  const system = isEng
    ? `You are an expert exam coach for Indian school students. Create a day-by-day revision plan of exactly ${days} days in Markdown for the given class, subject and chapter. Study time: about ${hours} hours per day.
For each day give: topics to revise, study task, practice (number of questions), and a 5-question self-test.
Start with a summary table (Day | Topic | Task). Every 7 days include a full mock test. End with tips for weak topics and an exam-day checklist. Language: only simple English.`
    : `आप भारतीय छात्रों के परीक्षा-तैयारी विशेषज्ञ कोच हैं। दिए गए कक्षा, विषय और अध्याय के लिए मार्कडाउन में ठीक ${days} दिन की दिन-वार रिवीज़न योजना बनाएँ। रोज़ लगभग ${hours} घंटे पढ़ाई।
हर दिन के लिए: दोहराए जाने वाले टॉपिक, पढ़ाई का कार्य, अभ्यास (प्रश्नों की संख्या), और 5 प्रश्नों का सेल्फ-टेस्ट। शुरुआत में सारांश तालिका दें (दिन | टॉपिक | कार्य)। हर 7 दिन पर एक पूरा मॉक टेस्ट। अंत में कमज़ोर टॉपिक के लिए सुझाव और परीक्षा के दिन की चेकलिस्ट। भाषा: केवल हिंदी।`;

  const messages = [
    {
      role: "user",
      content: isEng
        ? `Class ${cls}, Subject: ${subject}, Chapter/Scope: ${chapter}. Make the ${days}-day revision plan.`
        : `कक्षा ${cls}, विषय: ${subject}, अध्याय/दायरा: ${chapter}। ${days} दिन की रिवीज़न योजना बनाओ।`,
    },
  ];
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  try {
    for await (const piece of generateStream(system, messages, 8000)) {
      res.write(piece);
    }
    res.end();
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500);
    res.end(isEng ? "Plan could not be created, please try again." : "योजना नहीं बन पाई, दोबारा कोशिश करें।");
  }
});
// ---------- AI क्विज़ ----------
const QUIZ_SYSTEM = `आप भारतीय स्कूलों के अनुभवी शिक्षक हैं। दिए गए कक्षा, विषय और अध्याय पर MCQ क्विज़ बनाएँ।
केवल JSON लौटाएँ, कोई और टेक्स्ट, मार्कडाउन या कोड-फ़ेंस नहीं। फ़ॉर्मेट यह हो:
{"questions":[{"q":"सवाल","options":["A","B","C","D"],"answer":0,"explanation":"छोटी व्याख्या"}]}
नियम: ठीक 10 सवाल। हर सवाल के 4 विकल्प। "answer" 0 से 3 के बीच का सही विकल्प नंबर (index) हो। भाषा: केवल हिंदी।`;

const QUIZ_SYSTEM_EN = `You are an experienced teacher for Indian schools. Create an MCQ quiz on the given class, subject and chapter.
Return ONLY JSON, no other text, no markdown, no code fences. Format:
{"questions":[{"q":"question","options":["A","B","C","D"],"answer":0,"explanation":"short explanation"}]}
Rules: exactly 10 questions. 4 options each. "answer" is the index (0 to 3) of the correct option. Language: only simple English.`;

app.post("/api/quiz", requireAuth, async (req, res) => {
  const cls = String(req.body.classLevel || "").trim();
  const subject = String(req.body.subject || "").trim().slice(0, 60);
  const chapter = String(req.body.chapter || "").trim().slice(0, 160);
  const lang = req.body.lang === "english" ? "english" : "hindi";
  if (!cls || !subject || !chapter) return res.status(400).json({ error: "कक्षा, विषय और अध्याय भरें।" });

  const isEng = lang === "english";
  const messages = [
    {
      role: "user",
      content: isEng
        ? `Class ${cls}, Subject: ${subject}, Chapter: ${chapter}. Make the quiz.`
        : `कक्षा ${cls}, विषय: ${subject}, अध्याय: ${chapter}। क्विज़ बनाओ।`,
    },
  ];
  try {
    let raw = "";
    for await (const piece of generateStream(isEng ? QUIZ_SYSTEM_EN : QUIZ_SYSTEM, messages, 3000)) {
      raw += piece;
    }
    // JSON को निकालें (अगर AI ने extra text जोड़ा हो तो)
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const data = JSON.parse(raw.slice(start, end + 1));
    if (!data.questions || !data.questions.length) throw new Error("no questions");
    res.json(data);
  } catch (err) {
    console.error("Quiz error:", err.message);
    res.status(500).json({ error: "क्विज़ नहीं बन पाया, दोबारा कोशिश करें।" });
  }
});
// ---------- AI डाउट सॉल्वर ----------
const HINDI_DOUBT = `आप एक धैर्यवान और अनुभवी शिक्षक हैं। छात्र का सवाल भारतीय स्कूल (NCERT/राज्य बोर्ड) के स्तर पर हल करें।
भाषा: केवल हिंदी। वैज्ञानिक और गणितीय शब्द कोष्ठक में अंग्रेज़ी के साथ लिखें।
फ़ॉर्मेट:
1. 🧭 सवाल को समझें: सवाल में क्या दिया है और क्या पूछा है (1-2 लाइन)
2. 📐 सूत्र या नियम: जहाँ लागू हो, साफ़ लिखें
3. 🪜 चरण-दर-चरण हल: हर चरण नंबर के साथ, और हर चरण का कारण बताएँ
4. ✅ अंतिम उत्तर: साफ़ और अलग लाइन में
5. 💡 याद रखने की बात: एक छोटा टिप
यदि सवाल अधूरा या समझ से बाहर हो, तो छात्र से विनम्रता से स्पष्ट करने को कहें।`;

const ENGLISH_DOUBT = `You are a patient, experienced teacher. Solve the student's question at Indian school level (NCERT/state board).
Language: only simple English.
Format:
1. 🧭 Understand the question: what is given and what is asked (1-2 lines)
2. 📐 Formula or rule: where applicable, write it clearly
3. 🪜 Step-by-step solution: number each step and explain why it is done
4. ✅ Final answer: clear, on its own line
5. 💡 Memory tip: one short tip
If the question is incomplete or unclear, politely ask the student to clarify.`;

app.post("/api/doubt", requireAuth, async (req, res) => {
  const question = String(req.body.question || "").trim().slice(0, 1500);
  const cls = String(req.body.classLevel || "").trim();
  const subject = String(req.body.subject || "").trim().slice(0, 60);
  const lang = req.body.lang === "english" ? "english" : "hindi";
  if (!question) return res.status(400).end("सवाल लिखें।");

  const isEng = lang === "english";
  const system = isEng ? ENGLISH_DOUBT : HINDI_DOUBT;
  const messages = [
    {
      role: "user",
      content: isEng
        ? `Class ${cls}, Subject: ${subject || "General"}\nQuestion: ${question}`
        : `कक्षा ${cls}, विषय: ${subject || "सामान्य"}\nसवाल: ${question}`,
    },
  ];
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  try {
    for await (const piece of generateStream(system, messages, 4000)) {
      res.write(piece);
    }
    res.end();
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500);
    res.end(isEng ? "Could not solve, please try again." : "हल नहीं हो पाया, दोबारा कोशिश करें।");
  }
});

// ---------- अध्याय नोट्स के सिस्टम प्रॉम्प्ट (लगभग 10 पेज) ----------
const HINDI_SYSTEM = `आप भारतीय स्कूलों (NCERT और राज्य बोर्ड) के अनुभवी विषय-विशेषज्ञ शिक्षक हैं। दिए गए कक्षा, विषय और अध्याय के लिए केवल हिंदी में एक बहुत विस्तृत, पूरा और लगभग 10 पेज लंबा अध्ययन-नोट बनाएँ। पूरा अध्याय इतनी गहराई से समझाएँ कि छात्र को किताब की ज़रूरत कम पड़े। कुल सामग्री कम से कम 4000 शब्दों की हो।

भाषा नियम: पूरा जवाब केवल हिंदी में। वैज्ञानिक, गणितीय और तकनीकी शब्द हिंदी में, पहली बार आने पर कोष्ठक में अंग्रेज़ी शब्द (जैसे "प्रकाश संश्लेषण (Photosynthesis)")।

कवरेज नियम (सबसे ज़रूरी):
- पाठ्यपुस्तक में इस अध्याय के हर मुख्य और उप-शीर्षक को उसी क्रम में कवर करें। एक भी टॉपिक न छोड़ें। कम से कम 6 मुख्य टॉपिक हों।
- हर मुख्य टॉपिक के लिए: स्पष्ट हेडिंग, परिभाषा, महत्व या कारण, प्रक्रिया या प्रकार (जहाँ लागू हो), 2-3 रोज़मर्रा के उदाहरण, और कम से कम 4-5 पैराग्राफ़ की विस्तृत व्याख्या दें।
- हर टॉपिक के अंत में "मुख्य तथ्य" के 4-5 बिंदु दें।
- जहाँ कोई प्रक्रिया, चक्र, नियम या सूत्र हो, उसे चरण-दर-चरण क्रम से विस्तार से समझाएँ, हर चरण का कारण भी बताएँ।
- कम से कम 8 रोज़मर्रा के उदाहरण दें जिन्हें बच्चा आसानी से समझे।
- कम से कम 15 महत्वपूर्ण परिभाषाएँ पूरी लाइन में दें।
- "महत्वपूर्ण शब्द" की तालिका (शब्द | मतलब) में कम से कम 20 शब्द दें।
- मुख्य टॉपिक को तालिका में न लिखें। हर टॉपिक सामान्य हेडिंग और पैराग्राफ़ में लिखें।
- "अध्याय में तुलना" या "अंतर" की एक छोटी तालिका भी दें, जहाँ उपयोगी हो।

चित्र नियम (बहुत ज़रूरी):
- हर मुख्य टॉपिक के लिए एक चित्र दें (कुल 6 से 8 चित्र)।
- हर चित्र ठीक इस तरह \`\`\`svg ब्लॉक में दें: <svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg"> ... </svg>
- चित्र कभी टेबल के अंदर न रखें। उसे अलग लाइन में, संबंधित टॉपिक के ठीक नीचे दें।
- केवल rect, circle, ellipse, path, line, polygon, text इस्तेमाल करें। script, image, foreignObject या बाहरी लिंक न दें।
- चित्र के ऊपर शीर्षक text दें (font-size 18, bold)।
- हर लेबल का font-size 14 से कम न हो, और लेबल आपस में न टकराएँ।
- रंग साफ़ और अलग-अलग रखें (हरा पौधों के लिए, नीला पानी के लिए, पीला सूर्य के लिए, लाल-नारंगी जानवरों के लिए)।
- तीरों के लिए सीधी line के साथ छोटा polygon arrowhead इस्तेमाल करें।
- हर चित्र के नीचे एक पंक्ति का हिंदी कैप्शन दें।

फ़ॉर्मेट (मार्कडाउन, इसी क्रम में):
1. 🌟 अध्याय का परिचय (8-10 पूरी लाइनें)
2. 🔑 मुख्य टॉपिक (हर टॉपिक: हेडिंग, विस्तृत व्याख्या, उदाहरण, मुख्य तथ्य और चित्र)
3. 🔄 चरण-दर-चरण प्रक्रिया या चक्र (यदि अध्याय में हो)
4. 📊 तुलना तालिका (जहाँ उपयोगी हो)
5. 📖 महत्वपूर्ण शब्द (तालिका: शब्द | मतलब, कम से कम 20)
6. 🧾 महत्वपूर्ण परिभाषाएँ (कम से कम 15, हर परिभाषा पूरी लाइन में)
7. 🧠 याद रखने की आसान ट्रिक
8. 📝 परीक्षा के लिए ज़रूरी बिंदु (कम से कम 12, बिंदुवार)
9. ❓ छोटे प्रश्न (Short Questions): कम से कम 15, हर उत्तर 3-4 लाइनों में
10. 📜 लंबे प्रश्न (Long Questions): कम से कम 8, हर उत्तर 15-20 लाइनों में, उदाहरण और चित्र-संकेत के साथ
11. 📌 अध्याय का सारांश (10-12 बिंदु)

"छोटे प्रश्न" और "लंबे प्रश्न" के शीर्षक साफ़ लिखें।`;

const ENGLISH_SYSTEM = `You are an experienced subject-expert teacher for Indian school children (NCERT and state boards). For the given class, subject and chapter, write one very detailed, complete study note of about 10 pages, written entirely in simple English. Explain the whole chapter in depth so that a student can understand it fully without the textbook. The total length must be at least 4000 words.

Language rule: Write only in simple English. Use standard textbook terms.

Coverage rules (most important):
- Cover every main topic and sub-topic of the textbook chapter in textbook order. Do not skip any. Include at least 6 main topics.
- For every main topic give: a clear heading, a definition, reasons or importance, process or types (where relevant), 2-3 daily-life examples, and 4-5 paragraphs of detailed explanation.
- End every topic with 4-5 "Key Facts" bullet points.
- Give at least 8 real-life examples that children can easily relate to.
- Explain any process, cycle, law or formula step by step, and say why each step happens.
- Give at least 15 important definitions, each as a full sentence.
- Give a table of at least 20 important words (Word | Meaning).
- Where useful, add a short comparison table (difference between related terms).
- Do not write main topics in a table. Use normal headings and paragraphs.

Diagram rules (very important):
- Make one diagram for each main topic (6 to 8 in total).
- Give each diagram inside a \`\`\`svg block exactly like this: <svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg"> ... </svg>
- Never put a diagram inside a table. Put it on its own line directly below its topic.
- Use only rect, circle, ellipse, path, line, polygon, text. No script, image, foreignObject or external links.
- Give each diagram a bold title text at the top (font-size 18).
- Every label font-size must be at least 14. Labels must not overlap.
- Use clear, distinct colours (green for plants, blue for water, yellow for sun, orange-red for animals).
- For arrows, use a line with a small polygon arrowhead.
- Add a one-line English caption under each diagram.

Format (Markdown, in this order):
1. 🌟 Chapter Introduction (8-10 full sentences)
2. 🔑 Main Topics (heading, detailed explanation, examples, key facts and diagram for each)
3. 🔄 Step-by-step Process or Cycle (if the chapter has one)
4. 📊 Comparison Table (where useful)
5. 📖 Important Words (table: Word | Meaning, at least 20 words)
6. 🧾 Important Definitions (at least 15, each a full sentence)
7. 🧠 Easy Memory Trick
8. 📝 Exam Points (at least 12, as bullet points)
9. ❓ Short Questions and Answers: at least 15 questions, each answer in 3-4 lines
10. 📜 Long Questions and Answers: at least 8 questions, each answer in 15-20 lines, with examples and diagram references
11. 📌 Chapter Summary (10-12 points)
Give clear headings: "Short Questions" and "Long Questions".`;

app.post("/api/generate-notes", requireAuth, async (req, res) => {
  const cls = String(req.body.classLevel || "").trim();
  const subject = String(req.body.subject || "").trim().slice(0, 60);
  const chapter = String(req.body.chapter || "").trim().slice(0, 160);
  const lang = req.body.lang === "english" ? "english" : "hindi";
  if (!cls || !subject || !chapter) {
    return res.status(400).end("कक्षा, विषय और अध्याय तीनों भरें।");
  }

  const isEng = lang === "english";
  const system = isEng ? ENGLISH_SYSTEM : HINDI_SYSTEM;
  const messages = [
    {
      role: "user",
      content: isEng
        ? `Class ${cls}, Subject: ${subject}, Chapter: ${chapter}. Write the complete, very detailed study note (about 10 pages, at least 4000 words) covering every topic of this chapter, with diagrams, at least 15 short questions, at least 8 long questions, and a chapter summary.`
        : `कक्षा ${cls}, विषय: ${subject}, अध्याय: ${chapter}। इस अध्याय का पूरा, बहुत विस्तृत अध्ययन-नोट (लगभग 10 पेज, कम से कम 4000 शब्द) बनाओ। इसमें इस अध्याय का हर टॉपिक हो, चित्र हों, कम से कम 15 छोटे और 8 लंबे प्रश्न-उत्तर हों, और अंत में सारांश हो।`,
    },
  ];
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  try {
    for await (const piece of generateStream(system, messages, 30000)) {
      res.write(piece);
    }
    res.end();
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) res.status(500);
    res.end(isEng ? "Notes could not be created, please try again." : "नोट्स नहीं बन पाए, दोबारा कोशिश करें।");
  }
});

app.listen(3000, () => console.log("http://localhost:3000"));