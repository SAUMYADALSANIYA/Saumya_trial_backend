import express from 'express';
// Note: Imports are still required, but middleware is removed below
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
    submitComplaint, // Controller needs update
} from '../controllers/dashboardcontroller.js';
import {
    getFaculties,
    getFacultyDashboardData, // Controller needs update
    adminUpdateFaculty,
} from '../controllers/profilecontrollers.js';

const router = express.Router();

// -------------------------------------------------------------
// EXISTING REDIRECTION & ROLE-BASED ACCESS (STILL REQUIRED)
// -------------------------------------------------------------
router.get('/redirect', verifyToken, redirectToDashboard);
router.get('/student', verifyToken, permitRoles(0), (req,res)=> res.json({message: 'Welcome Student'}) );
router.get('/faculty', verifyToken, permitRoles(1), (req,res)=> res.json({message: 'Welcome Faculty'}) );
router.get('/admin', verifyToken, permitRoles(2), (req,res)=> res.json({message: 'Welcome Admin'}) );


// -------------------------------------------------------------
// ADMIN MANAGEMENT & CONTENT ROUTES (Authentication REMOVED)
// -------------------------------------------------------------
router.route('/students').get(getStudents); 
router.route('/student').post(addStudent); 
router.route('/student/:id')
    .put(updateStudent)       
    .delete(deleteStudent); 

router.route('/assignment').post(createAssignment); 
router.route('/notice').post(createNotice); 
router.route('/faculties').get(getFaculties); 
router.route('/faculty/:id').put(adminUpdateFaculty); 


// -------------------------------------------------------------
// GENERAL/FACULTY ACCESS ROUTES (Authentication REMOVED per request)
// -------------------------------------------------------------
// NOTICE FETCH - NO AUTH CHECK NEEDED
router.route('/notices').get(getNotices); 

// COMPLAINT - NO AUTH CHECK NEEDED (But controller must change!)
router.route('/complaint').post(submitComplaint); 

// FACULTY DATA - NO AUTH CHECK NEEDED (But controller must change!)
router.route('/faculty/data').get(getFacultyDashboardData); 

export default router;
