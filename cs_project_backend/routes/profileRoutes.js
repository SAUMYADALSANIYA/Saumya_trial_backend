import express from 'express';
import { verifyToken, permitRoles } from '../middleware/authmiddleware.js';
import { 
    getMyFacultyProfile,
    updateOrCreateFacultyProfile,
    studentdetail,
} from '../controllers/profilecontrollers.js'; 

const router = express.Router();

// Faculty self-profile management (Role 1)
router.route('/faculty')
    .get(verifyToken, permitRoles(1), getMyFacultyProfile)
    .post(verifyToken, permitRoles(1), updateOrCreateFacultyProfile)
    .put(verifyToken, permitRoles(1), updateOrCreateFacultyProfile);

// Student profile completion route (Role 0)
router.route('/student')
    .post(verifyToken, permitRoles(0), studentdetail);

export default router;