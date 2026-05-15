const express = require("express");
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai");
const ffmpeg = require("fluent-ffmpeg");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `recording-${Date.now()}.webm`);
  },
});
const upload = multer({ storage });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function convertToMp3(inputPath) {
  const outputPath = inputPath.replace(".webm", ".mp3");
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("mp3")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}

router.use(authMiddleware);

router.post("/", upload.single("audio"), async (req, res) => {
  console.log("USER:", req.user?._id);
  const webmPath = req.file.path;
  let mp3Path = null;

  try {
    mp3Path = await convertToMp3(webmPath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(mp3Path),
      model: "whisper-1",
      response_format: "text",
    });
    const transcript = transcription;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a productivity assistant. Given a voice note transcript, return ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "summary": "2-3 sentence summary of the note",
  "actionItems": ["action 1", "action 2", "action 3"]
}`,
        },
        { role: "user", content: `Transcript: ${transcript}` },
      ],
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    // ✅ user field added here
    const note = await Note.create({
      user: req.user._id,
      transcript,
      summary: parsed.summary,
      actionItems: parsed.actionItems,
    });

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    if (fs.existsSync(webmPath)) fs.unlinkSync(webmPath);
    if (mp3Path && fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
  }
});

router.get("/", async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
});

module.exports = router;