import express from "express";
import { verifyToken, permitRoles } from "../middleware/authmiddleware.js";
import { addQuestion, analyzeSubject, getAnswer } from "../controllers/aiController.js";

const router = express.Router();

// --- ADMIN ROUTE ---
// Use this route to add questions to your database
// Protected: Only Admins (role 2) can add questions
router.post(
  "/add-question",
  verifyToken,
  permitRoles(2), // Only Admins
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