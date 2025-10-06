import express from "express";
import { registercontroller,logincontroller, forgotPasswordController } from "../controllers/authcontrollers.js";
const router = express.Router();

router.post("/register",registercontroller);
router.post("/login",logincontroller);
router.post("/forgot-password",forgotPasswordController);
export default router;