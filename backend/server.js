import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Function to clean and format response
function cleanResponse(text) {
  // Remove escape characters and extra quotes
  let cleaned = text
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\//g, "/")
    .replace(/\\\\/g, "\\");

  // Remove markdown code blocks if present
  cleaned = cleaned
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, "").trim())
    .replace(/`([^`]+)`/g, "$1");

  // Remove triple asterisks (***) but keep double (**) and single (*) for formatting
  // Also KEEP markdown headers (### ## #)
  cleaned = cleaned.replace(/\*\*\*/g, "");

  // Remove excessive underscores
  cleaned = cleaned
    .replace(/___/g, "")
    .replace(/__/g, "");

  // Remove empty lines and trim
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  // Add nice spacing between sections (but don't add extra lines before headers)
  cleaned = cleaned.replace(/^(?!#)(\d+\.|[A-Z])/gm, "\n$1").trim();

  return cleaned;
}

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("=== REQUEST RECEIVED ===");
    console.log("PROMPT:", prompt);
    console.log("API_KEY:", process.env.GEMINI_API_KEY ? "✓ Present" : "✗ Missing");

    // ✅ Validation
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // ✅ Load model (stable free model)
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    // ✅ Generate response
    const result = await model.generateContent(
      `You are an AI Trainer Assistant.
Give:
1. Explanation
2. Example
3. 2 Practice Questions

Topic: ${prompt}`
    );

    // ✅ SAFER extraction
    let text = result?.response?.text?.() || "No response from AI";

    // ✅ Clean and format the response
    text = cleanResponse(text);

    console.log("AI RESPONSE:", text);

    res.json({ output: text });

  } catch (error) {
    console.error("=== ERROR CAUGHT ===");
    console.error(error);

    res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
});

// ✅ Generate Notes endpoint
app.post("/notes", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("=== NOTES REQUEST RECEIVED ===");
    console.log("PROMPT:", prompt);

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const result = await model.generateContent(
      `You are an AI Trainer Assistant.
Generate comprehensive and well-structured study notes with:
1. Key Concepts
2. Important Points
3. Summary

Topic: ${prompt}`
    );

    let text = result?.response?.text?.() || "No response from AI";
    text = cleanResponse(text);

    console.log("NOTES GENERATED:", text);
    res.json({ output: text });

  } catch (error) {
    console.error("=== ERROR CAUGHT ===");
    console.error(error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});

// ✅ Generate Assignments endpoint
app.post("/assignments", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("=== ASSIGNMENTS REQUEST RECEIVED ===");
    console.log("PROMPT:", prompt);

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const result = await model.generateContent(
      `You are an AI Trainer Assistant.
Generate challenging and educational assignments with:
1. 3 Short Answer Questions
2. 2 Essay Questions
3. Practical Assignment Task

Topic: ${prompt}`
    );

    let text = result?.response?.text?.() || "No response from AI";
    text = cleanResponse(text);

    console.log("ASSIGNMENTS GENERATED:", text);
    res.json({ output: text });

  } catch (error) {
    console.error("=== ERROR CAUGHT ===");
    console.error(error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});