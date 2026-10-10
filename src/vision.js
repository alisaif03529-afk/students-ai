const Groq = require("groq-sdk");

const client = new Groq(); // key अपने आप .env से लेगा
// vision model: .env में VISION_MODEL लिखकर बदल सकते हैं
const VISION_MODEL = process.env.VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

// फोटो (base64 data URL) से हाथ से लिखा उत्तर टेक्स्ट में पढ़ता है
async function readHandwriting(imageDataUrl) {
  const res = await client.chat.completions.create({
    model: VISION_MODEL,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "इस फोटो में लिखा हुआ उत्तर ज्यों का त्यों टेक्स्ट में लिखें। कुछ अपनी तरफ़ से न जोड़ें और न सुधारें। जो लिखा है वही दें। अगर कोई शब्द साफ़ न पढ़ा जाए तो [?] लिखें।",
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
  });
  return res.choices[0].message.content || "";
}

module.exports = { readHandwriting };