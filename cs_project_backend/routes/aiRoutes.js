import express from "express";
import { addQuestion, analyzeSubject } from "../controllers/aiController.js";
import { uploadQuestionImage } from '../middleware/questionUploadMiddleware.js';

const router = express.Router();

// Add a single question (with optional image)
router.post("/add-question", uploadQuestionImage, addQuestion);

// Analyze subject (returns topics + Gemini answers)
router.post("/analyze-subject", analyzeSubject);

export default router;