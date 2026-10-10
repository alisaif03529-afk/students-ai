const Groq = require("groq-sdk");
const { MODEL, MAX_TOKENS } = require("./config");
const SYSTEM = require("./prompts");

const client = new Groq(); // key अपने आप .env से लेगा

async function chat(messages) {
  const res = await client.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "system", content: SYSTEM }, ...messages],
  });
  return res.choices[0].message.content;
}

async function* streamChat(messages) {
  const stream = await client.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "system", content: SYSTEM }, ...messages],
    stream: true,
  });
  for await (const part of stream) {
    const text = part.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

// अलग सिस्टम प्रॉम्प्ट और लंबे जवाब के लिए (नोट्स जनरेटर)
async function* generateStream(system, messages, maxTokens = 2500) {
  const stream = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: system }, ...messages],
    stream: true,
  });
  for await (const part of stream) {
    const text = part.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

module.exports = { chat, streamChat, generateStream };