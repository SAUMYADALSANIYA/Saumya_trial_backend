import fetch from 'node-fetch';
import QuestionModel from '../models/question_model.js';

// This is the Gemini API URL.
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';
const API_KEY = ""; // Handled by environment

/**
 * Helper function to call the Gemini API
 */
async function callGemini(payload) {
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
  }

  return response.json();
}

// -------------------------------------------------------------
// 1. (Admin) Add questions to the database
// -------------------------------------------------------------
export const addQuestion = async (req, res) => {
  try {
    const { subject, year, questionText, source } = req.body;

    if (!subject || !year || !questionText) {
      return res.status(400).json({ message: "Subject, year, and questionText are required." });
    }

    const newQuestion = new QuestionModel({
      subject,
      year,
      questionText,
      source: source || 'PYQ',
    });

    await newQuestion.save();
    res.status(201).json({ message: "Question added successfully", question: newQuestion });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: "Error adding question", error: error.message });
  }
};

// -------------------------------------------------------------
// 2. (Student) Analyze Questions - FEATURE 1
// -------------------------------------------------------------
export const analyzeSubject = async (req, res) => {
  try {
    const { subject, years } = req.body; // e.g., { "subject": "Data Structures", "years": [2022, 2023] }

    if (!subject || !Array.isArray(years) || years.length === 0) {
      return res.status(400).json({ message: "Subject and a non-empty array of years are required." });
    }

    // 1. Fetch all matching questions from MongoDB
    const questions = await QuestionModel.find({
      subject: subject,
      year: { $in: years },
    }).select('questionText');

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found for that subject and year combination." });
    }

    // 2. Format questions into a single string for the prompt
    const questionListString = questions.map(q => q.questionText).join('\n');

    // 3. Define the precise JSON output structure we want from the AI
    const jsonSchema = {
      type: "OBJECT",
      properties: {
        topicSummary: {
          type: "ARRAY",
          description: "A list of all identified topics, sorted by the number of questions (highest first).",
          items: {
            type: "OBJECT",
            properties: {
              topic: { type: "STRING" },
              count: { type: "INTEGER" }
            }
          }
        },
        questionsByTopic: {
          type: "OBJECT",
          description: "An object where each key is a topic name and each value is an array of the exact, unmodified question strings belonging to that topic."
        }
      },
      required: ["topicSummary", "questionsByTopic"]
    };

    // 4. Create the system prompt
    const systemPrompt = `You are an expert university professor for the subject "${subject}". Your job is to analyze a list of past exam questions and organize them for a student.
- Read the entire list of questions.
- Identify the main topics (e.g., "Linked Lists", "Sorting Algorithms", "Binary Trees").
- Group *every* provided question under one of these topics.
- Count how many questions fall into each topic.
- Return a JSON object that strictly follows the provided schema.
- The 'topicSummary' array must be sorted by 'count' in descending order.
- The 'questionsByTopic' value must be an array of the *exact, unmodified* question strings.`;

    // 5. Call the Gemini API with the JSON schema
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: `Here is the list of questions:\n\n${questionListString}` }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema
      }
    };

    const result = await callGemini(payload);
    
    // 6. Parse the JSON text from the API's response
    const jsonText = result.candidates[0].content.parts[0].text;
    const structuredData = JSON.parse(jsonText);

    // 7. Send the structured JSON to the Flutter app
    res.status(200).json(structuredData);

  } catch (error) {
    console.error("Error analyzing subject:", error);
    res.status(500).json({ message: "Error analyzing subject", error: error.message });
  }
};

// -------------------------------------------------------------
// 3. (Student) Get Answer for a Question - FEATURE 2
// -------------------------------------------------------------
export const getAnswer = async (req, res) => {
  try {
    const { questionText } = req.body;

    if (!questionText) {
      return res.status(400).json({ message: "questionText is required." });
    }

    // 1. Create the tutor prompt
    const systemPrompt = `You are a friendly, encouraging, and expert university tutor. A student needs help with an exam question.
Your response must be in two parts:
1.  **Answer:** Start with a direct, clear, and step-by-step answer to the question.
2.  **Key Concepts:** After the answer, add a section titled "## Key Concepts". In this section, explain *why* the answer is correct and what core principles the student should remember for the exam.

Be thorough and helpful.`;

    // 2. Call the Gemini API
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: `Here is the question I need help with:\n\n"${questionText}"` }]
      }]
    };

    const result = await callGemini(payload);

    // 3. Send the plain text response to the Flutter app
    const answerText = result.candidates[0].content.parts[0].text;
    res.status(200).json({ answer: answerText });

  } catch (error) {
    console.error("Error getting answer:", error);
    res.status(500).json({ message: "Error getting answer", error: error.message });
  }
};