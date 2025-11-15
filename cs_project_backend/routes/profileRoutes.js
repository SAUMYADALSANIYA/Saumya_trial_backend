import express from 'express';
// import { verifyToken } from '../middleware/authmiddleware.js'; // No longer needed
import studentdetail from './../controllers/profilecontrollers.js';
import { 
    getMyFacultyProfile, 
    updateOrCreateFacultyProfile, 
    getStudentProfileById, 
    getFaculties, 
    adminUpdateFaculty, 
    getFacultyDashboardData 
} from './../controllers/profilecontrollers.js';

const router = express.Router();

// REFACTORED: This route is now public
router.post('/profile/student', studentdetail);

// --- All other routes from your controller file ---
// (I am adding them here so they work)

// These routes now expect a 'userId' in the body instead of a token
router.post('/faculty/my-profile', getMyFacultyProfile);
router.post('/faculty/save-profile', updateOrCreateFacultyProfile);

// This one was already public and correct
router.get('/student/:userId', getStudentProfileById);

// Admin/Public routes
router.get('/faculties', getFaculties);
router.put('/faculty/admin-update/:id', adminUpdateFaculty);

// This route was already expecting a 'userId' in the query, so it's fine
router.get('/faculty-dashboard', getFacultyDashboardData);

export default router;