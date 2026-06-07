
require("dotenv").config();

const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require("fs");
const fsp = require("fs").promises;
const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const speech = require('@google-cloud/speech');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/* =========================
   ✅ GEMINI SETUP (NEW SDK)
========================= */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const speechClient = new speech.SpeechClient();

/* =========================
   📌 1. UPLOAD VIDEO ROUTE
========================= */
router.post('/upload-video', upload.single('video'), async (req, res) => {
  console.log("API HIT ✅");

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    const videoPath = req.file.path;
    let audioPath;

    try {
      audioPath = await extractAudio(videoPath);

      const text = await speechToText(audioPath);
      console.log("🎤 SPEECH TEXT:", text);

      const cleaned = cleanText(text);

      const issueData = await detectIssue(cleaned);

      if (!issueData || issueData.error) {
        return res.json({
          text,
          issueData: {
            issue: "Unknown issue",
            category: "general",
            possible_causes: []
          },
          questions: []
        });
      }

      req.session.issueData = {
        issue: issueData.issue,
        category: issueData.category
      };

      const questions = await generateQuestions(issueData);

      return res.json({ text, issueData, questions });

    } finally {
      await fsp.unlink(videoPath).catch(() => {});
      if (audioPath) await fsp.unlink(audioPath).catch(() => {});
    }

  } catch (error) {
    console.error("Upload Error:", error);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Processing failed" });
    }
  }
});

/* =========================
   📌 2. REFINE ISSUE ROUTE
========================= */
router.post('/refine-issue', async (req, res) => {
  try {
    const { text, issueData, answers } = req.body;

    const finalResult = await refineIssue(text, issueData, answers);
    const price = predictPrice(finalResult);

    return res.json({
      finalIssue: finalResult,
      estimatedPrice: price
    });

  } catch (error) {
    console.error("Refine Error:", error);
    return res.status(500).json({ error: "Refinement failed" });
  }
});

/* =========================
   🎧 EXTRACT AUDIO
========================= */
function extractAudio(videoPath) {
  return new Promise((resolve, reject) => {
    const audioPath = path.join(
      path.dirname(videoPath),
      path.basename(videoPath, path.extname(videoPath)) + '.wav'
    );

    const command = `ffmpeg -i "${videoPath}" -vn -ac 1 -ar 16000 -b:a 64k "${audioPath}"`;

    exec(command, (error) => {
      if (error) return reject(error);
      resolve(audioPath);
    });
  });
}

/* =========================
   🎤 SPEECH TO TEXT
========================= */
async function speechToText(audioPath) {
  const file = fs.readFileSync(audioPath);
  const audioBytes = file.toString('base64');

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
  };

  const [response] = await speechClient.recognize(request);

  return response.results
    .map(r => r.alternatives[0].transcript)
    .join("\n");
}

/* =========================
   🧠 DETECT ISSUE
========================= */
async function detectIssue(text) {
  const prompt = `
You are a mobile repair expert.

Return ONLY valid JSON:

{
  "issue": "",
  "category": "",
  "possible_causes": []
}

User: "${text}"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const raw =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("🤖 RAW:", raw);

    return safeParse(raw);

  } catch (err) {
    console.error("AI Error:", err);
    return { error: "AI failed" };
  }
}

/* =========================
   ❓ GENERATE QUESTIONS
========================= */
async function generateQuestions(issueData) {
const prompt = `
You are a mobile repair expert.

The detected issue is: "${issueData.issue}"

Generate exactly 3 short yes/no diagnostic questions to help identify the exact root cause.

Rules:
- Questions must be specific to the issue
- Questions must be understandable by normal users
- Return ONLY valid JSON array
- No explanation
- No labels like Q1, Q2

Example:
[
  "Does the camera app show a black screen?",
  "Did this start after dropping the phone?",
  "Do other apps also fail to use the camera?"
]
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const raw =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text;

    return safeParse(raw);

  } catch (err) {
    console.error("AI Error:", err);
    return { error: "AI failed" };
  }
}

/* =========================
   🔍 REFINE ISSUE
========================= */
async function refineIssue(text, issueData, answers) {
  const prompt = `
Return JSON:
{
  "final_issue": "",
  "confidence": "",
  "recommended_fix": "",
  "category": ""
}

User: ${text}
Initial: ${JSON.stringify(issueData)}
Answers: ${JSON.stringify(answers)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const raw =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text;

    return safeParse(raw);

  } catch (err) {
    console.error("AI Error:", err);
    return { error: "AI failed" };
  }
}

/* =========================
   💰 PRICE
========================= */
function predictPrice(data) {
  const pricing = {
    "battery": "₹1000–₹2000",
    "overheating": "₹500–₹1500",
    "software": "₹300–₹1000",
    "power ic": "₹1500–₹4000"
  };

  const text = (data.final_issue || "").toLowerCase();

  for (let key in pricing) {
    if (text.includes(key)) return pricing[key];
  }

  return "₹500–₹3000";
}

/* =========================
   🧹 CLEAN TEXT
========================= */
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

/* =========================
   HELPERS
========================= */
function safeParse(content) {
  try {
    if (!content) return { error: "Empty response" };

    const cleaned = content.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

    return match ? JSON.parse(match[0]) : { error: "Invalid JSON", raw: cleaned };

  } catch (err) {
    return { error: "Parse failed", raw: content };
  }
}

module.exports = router;