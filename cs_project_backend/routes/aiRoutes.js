import express from "express";
import { verifyToken, permitRoles } from "../middleware/authmiddleware.js";
import { 
  addQuestion, 
  analyzeSubject, 
  getAnswer,
  batchAddQuestions,  // <--- 1. IMPORT NEW FUNCTION
  addQuestionImage    // <--- 2. IMPORT NEW FUNCTION
} from "../controllers/aiController.js";
import { uploadQuestionImage } from '../middleware/questionUploadMiddleware.js';

const router = express.Router();

// --- ADMIN ROUTES ---

// (Original) Add a single question with an optional image
router.post(
  "/add-question",
  verifyToken,
  permitRoles(2), // Only Admins
  uploadQuestionImage, 
  addQuestion
);

// (NEW) Add a batch of text-only questions from JSON
router.post(
  "/batch-add-questions",
  verifyToken,
  permitRoles(2), // Only Admins
  batchAddQuestions // This route expects a JSON array in the body
);

// (NEW) Add/update an image for an existing question
router.put(
  "/question-image/:id",
  verifyToken,
  permitRoles(2), // Only Admins
  uploadQuestionImage, // Use the same image uploader
  addQuestionImage
);


// --- STUDENT ROUTES ---
// (No changes below)

// The main "Analyzer" feature
router.post(
  "/analyze-subject",
  verifyToken,
  permitRoles(0), // Only Students
  analyzeSubject
);

// The "Tutor" feature
router.post(
  "/get-answer",
  verifyToken,
  permitRoles(0), // Only Students
  getAnswer
);

export default router;