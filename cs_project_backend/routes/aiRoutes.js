import express from "express";
// Middleware is no longer needed
// import { verifyToken, permitRoles } from "../middleware/authmiddleware.js";
import { 
  addQuestion, 
  analyzeSubject, 
  getAnswer,
  batchAddQuestions,
  addQuestionImage
} from "../controllers/aiController.js";
import { uploadQuestionImage } from '../middleware/questionUploadMiddleware.js';

const router = express.Router();

// --- ADMIN ROUTES (NOW PUBLIC) ---

// (Original) Add a single question with an optional image
router.post(
  "/add-question",
  uploadQuestionImage, 
  addQuestion
);

// (NEW) Add a batch of text-only questions from JSON
router.post(
  "/batch-add-questions",
  batchAddQuestions // This route expects a JSON array in the body
);

// (NEW) Add/update an image for an existing question
router.put(
  "/question-image/:id",
  uploadQuestionImage, // Use the same image uploader
  addQuestionImage
);


// --- STUDENT ROUTES (NOW PUBLIC) ---

// The main "Analyzer" feature
router.post(
  "/analyze-subject",
  analyzeSubject
);

// The "Tutor" feature
router.post(
  "/get-answer",
  getAnswer
);

export default router;