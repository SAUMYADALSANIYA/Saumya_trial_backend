import fetch from 'node-fetch';
import QuestionModel from '../models/question_model.js';
import fs from 'fs'; 
import path from 'path'; 

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';
const API_KEY = "AIzaSyC3JbaT5D5JkHIootEcNSBF4PC6YcWvi8Q"; // Handled by environment

// --- Helper function to get relative file path ---
const getFileRelativePath = (filename) => `/uploads/questions/${filename}`;

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
// 1. (Admin) Add a SINGLE question
// -------------------------------------------------------------
export const addQuestion = async (req, res) => {
  try {
    const { subject, year, questionText, source } = req.body;
    const imageFile = req.file;

    if (!subject || !year || !questionText) {
      return res.status(400).json({ message: "Subject, year, and questionText are required." });
    }
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }
    let imageUrl = null;
    if (imageFile) {
      imageUrl = getFileRelativePath(imageFile.filename);
    }
    const newQuestion = new QuestionModel({
      subject,
      year,
      questionText,
      questionImage: imageUrl, 
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
    const { subject, years } = req.body; 
    if (!subject || !Array.isArray(years) || years.length === 0) {
      return res.status(400).json({ message: "Subject and a non-empty array of years are required." });
    }
    const questions = await QuestionModel.find({
      subject: subject,
      year: { $in: years },
    }).select('questionText questionImage'); 
    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found for that subject and year combination." });
    }
    const questionListString = JSON.stringify(
      questions.map(q => ({
        text: q.questionText,
        imagePath: q.questionImage 
      }))
    );
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
        // --- THIS IS THE CORRECTED BLOCK ---
        questionsByTopic: {
          type: "OBJECT",
          description: "An object where each key is a topic name and each value is an array of question objects.",
          additionalProperties: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                questionText: { type: "STRING" },
                questionImage: { type: "STRING", "nullable": true } 
              }
            }
          }
        }
        // --- END OF CORRECTION ---
      },
      required: ["topicSummary", "questionsByTopic"]
    };
    const systemPrompt = `You are an expert university professor for the subject "${subject}". Your job is to analyze a list of past exam questions and organize them for a student.
- You will be given a JSON string array of question objects, each with a "text" and an "imagePath" (which can be null).
- Read all the questions.
- Identify the main topics (e.g., "Linked Lists", "Sorting Algorithms", "Binary Trees").
- Group *every* provided question object under one of these topics.
- Count how many questions fall into each topic.
- Return a JSON object that strictly follows the provided schema.
- The 'topicSummary' array must be sorted by 'count' in descending order.
- In 'questionsByTopic', the value for each topic must be an array of objects, containing the *exact, unmodified* "questionText" and "questionImage" values from the input.`;

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
    const jsonText = result.candidates[0].content.parts[0].text;
    const structuredData = JSON.parse(jsonText);
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
    const { questionText, questionImage } = req.body;
    if (!questionText) {
      return res.status(400).json({ message: "questionText is required." });
    }
    const systemPrompt = `You are a friendly, encouraging, and expert university tutor. A student needs help with an exam question.
If an image is provided, it is part of the question.
Your response must be in two parts:
1.  **Answer:** Start with a direct, clear, and step-by-step answer to the question (and its image, if provided).
2.  **Key Concepts:** After the answer, add a section titled "## Key Concepts". In this section, explain *why* the answer is correct and what core principles the student should remember for the exam.

Be thorough and helpful.`;
    const textPart = { text: `Here is the question I need help with:\n\n"${questionText}"` };
    const requestParts = [textPart];
    if (questionImage) {
      try {
        const imagePath = path.join(process.cwd(), questionImage);
        const imageBytes = fs.readFileSync(imagePath);
        const imageBase64 = imageBytes.toString('base64');
        requestParts.push({
          inlineData: {
            mimeType: 'image/png', 
            data: imageBase64 
          }
        });
      } catch (err) {
        console.error("Error reading question image:", err);
      }
    }
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: requestParts 
      }]
    };
    const result = await callGemini(payload);
    const answerText = result.candidates[0].content.parts[0].text;
    res.status(200).json({ answer: answerText });
  } catch (error) {
    console.error("Error getting answer:", error);
    res.status(500).json({ message: "Error getting answer", error: error.message });
  }
};


// -------------------------------------------------------------
// 4. (Admin) Batch add text-only questions
// [NEW FUNCTION]
// -------------------------------------------------------------
export const batchAddQuestions = async (req, res) => {
  try {
    // Expects a JSON array in the body:
    // [ { "subject": "...", "year": 2023, "questionText": "..." }, ... ]
    const questions = req.body; 

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array of questions." });
    }

    // Add the 'source' and 'questionImage' defaults
    const questionsToInsert = questions.map(q => ({
      ...q,
      questionImage: null,
      source: q.source || 'PYQ'
    }));

    // Use insertMany for efficient batch insertion
    const result = await QuestionModel.insertMany(questionsToInsert);

    res.status(201).json({
      message: `Successfully inserted ${result.length} questions.`,
      count: result.length,
      data: result // Send back the created questions with their new _ids
    });

  } catch (error) {
    console.error("Error in batch adding questions:", error);
    res.status(500).json({ message: "Error in batch add", error: error.message });
  }
};

// -------------------------------------------------------------
// 5. (Admin) Add/Update an image for an existing question
// [NEW FUNCTION]
// -------------------------------------------------------------
export const addQuestionImage = async (req, res) => {
  try {
    const { id } = req.params; // Get the Question ID from the URL
    const imageFile = req.file; // Get the uploaded file

    // Check for file validation errors
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    // Check if a file was actually uploaded
    if (!imageFile) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    // Get the relative path to store in the DB
    const imageUrl = getFileRelativePath(imageFile.filename);

    // Find the question by ID and update its image field
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      id,
      { questionImage: imageUrl },
      { new: true } // Return the updated document
    );

    if (!updatedQuestion) {
      // If the question wasn't found, delete the orphaned image
      try {
        const imagePath = path.join(process.cwd(), imageUrl);
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error("Error deleting orphaned image:", err);
      }
      return res.status(404).json({ message: "Question not found with that ID." });
    }

    res.status(200).json({
      message: "Image added to question successfully.",
      question: updatedQuestion
    });

  } catch (error) {
    console.error("Error adding question image:", error);
    res.status(500).json({ message: "Error adding image", error: error.message });
  }
};