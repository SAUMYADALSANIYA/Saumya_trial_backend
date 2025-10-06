import express from 'express';
// Note: verifyToken and permitRoles are still imported, but removed from Admin routes below
import { verifyToken, permitRoles } from '../middleware/authmiddleware.js'; 
import { 
    redirectToDashboard,
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    createAssignment,
    createNotice,
    getNotices,
    submitComplaint,
    getStudentById,
} from '../controllers/dashboardcontroller.js';
import {
    getFaculties,
    getFacultyDashboardData,
    adminUpdateFaculty,
    updateOrCreateFacultyProfile, // This handles both POST (Add Faculty) and PUT (Self-Update)
} from '../controllers/profilecontrollers.js';

const router = express.Router();

// -------------------------------------------------------------
// EXISTING REDIRECTION & ROLE-BASED ACCESS (STILL REQUIRED)
// -------------------------------------------------------------
router.get('/redirect', verifyToken, redirectToDashboard);

// These are internal dashboard entry points, still require verification
router.get('/student', verifyToken, permitRoles(0), (req,res)=> res.json({message: 'Welcome Student'}) );
router.get('/faculty', verifyToken, permitRoles(1), (req,res)=> res.json({message: 'Welcome Faculty'}) );
router.get('/admin', verifyToken, permitRoles(2), (req,res)=> res.json({message: 'Welcome Admin'}) );


// -------------------------------------------------------------
// ADMIN MANAGEMENT & CONTENT ROUTES (Authentication REMOVED for testing)
// -------------------------------------------------------------

// Student CRUD - NO AUTH CHECK
router.route('/students').get(getStudents); 
router.route('/student').post(addStudent); 
router.route('/student/:id')
    .get(getStudentById) 
    .put(updateStudent)       
    .delete(deleteStudent); 

// Content Creation - NO AUTH CHECK
router.route('/assignment').post(createAssignment); 
router.route('/notice').post(createNotice); 

// Faculty Management - NO AUTH CHECK
router.route('/faculties').get(getFaculties); 

// PUT Update Specific Faculty Member by ID (Admin Action)
router.route('/faculty/:id').put(adminUpdateFaculty); 

// NEW: POST Add Faculty (Admin Action)
router.route('/faculty').post(updateOrCreateFacultyProfile); 


// -------------------------------------------------------------
// GENERAL/FACULTY ACCESS ROUTES (Authentication REMOVED per request)
// -------------------------------------------------------------
router.route('/notices').get(getNotices); 
router.route('/complaint').post(submitComplaint); 
router.route('/faculty/data').get(getFacultyDashboardData); 

export default router;
