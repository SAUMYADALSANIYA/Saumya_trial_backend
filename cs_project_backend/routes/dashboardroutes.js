import express from 'express';
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
    adminUpdateFaculty, // <--- Imported NEW function
} from '../controllers/profilecontrollers.js';

const router = express.Router();

// -------------------------------------------------------------
// EXISTING REDIRECTION & ROLE-BASED ACCESS
// -------------------------------------------------------------
router.get('/redirect', verifyToken, redirectToDashboard);

router.get('/dashboard/student', verifyToken, permitRoles(0), (req,res)=> res.json({message: 'Welcome Student'}) );
router.get('/dashboard/faculty', verifyToken, permitRoles(1), (req,res)=> res.json({message: 'Welcome Faculty'}) );
router.get('/dashboard/admin', verifyToken, permitRoles(2), (req,res)=> res.json({message: 'Welcome Admin'}) );


// -------------------------------------------------------------
// ADMIN MANAGEMENT & CONTENT ROUTES (Role 2)
// -------------------------------------------------------------
router.route('/dashboard/students')
    .get(verifyToken, permitRoles(2), getStudents); 

router.route('/dashboard/student')
    .post(verifyToken, permitRoles(2), addStudent); 

router.route('/dashboard/student/:id')
    .put(verifyToken, permitRoles(2), updateStudent) 
    .delete(verifyToken, permitRoles(2), deleteStudent); 

router.route('/dashboard/assignment')
    .post(verifyToken, permitRoles(2), createAssignment); 

router.route('/dashboard/notice')
    .post(verifyToken, permitRoles(2), createNotice); 

// Faculty List for Admin's UpdateFacultyPage
router.route('/dashboard/faculties')
    .get(verifyToken, permitRoles(2), getFaculties); 

// PUT Update Specific Faculty Member by ID (Admin Action)
router.route('/dashboard/faculty/:id')
    .put(verifyToken, permitRoles(2), adminUpdateFaculty); // <--- NEW ROUTE

// -------------------------------------------------------------
// GENERAL/FACULTY ACCESS ROUTES (All/Multiple Roles)
// -------------------------------------------------------------
router.route('/dashboard/notices')
    .get(verifyToken, permitRoles(0, 1, 2), getNotices); 

router.route('/dashboard/complaint')
    .post(verifyToken, permitRoles(0, 1, 2), submitComplaint); 

router.route('/dashboard/faculty/data')
    .get(verifyToken, permitRoles(1), getFacultyDashboardData); 

export default router;