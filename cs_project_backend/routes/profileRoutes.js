import express from 'express';
import { verifyToken } from '../middleware/authmiddleware.js';
import studentdetail from './../controllers/profilecontrollers.js';

const router = express.Router();

router.post('/profile/student',verifyToken,studentdetail);

export default router;