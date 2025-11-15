import express from "express";
import { verifyToken, permitRoles } from "../middleware/authmiddleware.js";
import { addQuestion, analyzeSubject, getAnswer } from "../controllers/aiController.js";
// 1. IMPORT THE NEW MIDDLEWARE
import { uploadQuestionImage } from '../middleware/questionUploadMiddleware.js';

const router = express.Router();

// --- ADMIN ROUTE ---
// 2. MODIFY THIS ROUTE
router.post(
  "/add-question",
  verifyToken,
  permitRoles(2), // Only Admins
  uploadQuestionImage, // Use multer to handle the optional image file
  addQuestion
);

// --- STUDENT ROUTES ---
// The main "Analyzer" feature
// Protected: Only Students (role 0) can use this
router.post(
  "/analyze-subject",
  verifyToken,
  permitRoles(0), // Only Students
  analyzeSubject
);

// The "Tutor" feature
// Protected: Only Students (role 0) can use this
router.post(
  "/get-answer",
  verifyToken,
  permitRoles(0), // Only Students
  getAnswer
);

export default router;