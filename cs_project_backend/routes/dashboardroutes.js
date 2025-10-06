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
} from '../controllers/dashboardcontroller.js';
import {
    getFaculties,
    getFacultyDashboardData,
    adminUpdateFaculty,
} from '../controllers/profilecontrollers.js';

const router = express.Router();

// -------------------------------------------------------------
// EXISTING REDIRECTION & ROLE-BASED ACCESS (STILL REQUIRED for login flow)
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
    .put(updateStudent) 
    .delete(deleteStudent); 

// Content Creation - NO AUTH CHECK
router.route('/assignment').post(createAssignment); 
router.route('/notice').post(createNotice); 

// Faculty Management - NO AUTH CHECK
router.route('/faculties').get(getFaculties); 
router.route('/faculty/:id').put(adminUpdateFaculty); 


// -------------------------------------------------------------
// GENERAL/FACULTY ACCESS ROUTES (Auth checks remain for general access/user context)
// -------------------------------------------------------------
// Note: These must keep verifyToken because they rely on req.user to fetch content or file complaints.
router.route('/notices')
    .get(verifyToken, permitRoles(0, 1, 2), getNotices); 

router.route('/complaint')
    .post(verifyToken, permitRoles(0, 1, 2), submitComplaint); 

router.route('/faculty/data')
    .get(verifyToken, permitRoles(1), getFacultyDashboardData); 

export default router;
