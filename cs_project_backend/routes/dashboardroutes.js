import express from 'express';
// Middleware is no longer needed
// import { verifyToken } from '../middleware/authmiddleware.js';
// import { permitRoles } from '../middleware/authmiddleware.js';
import { redirectToDashboard, updateStudent} from '../controllers/dashboardcontroller.js';
import { deleteStudent } from './../controllers/dashboardcontroller.js';
import { getStudents } from '../controllers/dashboardcontroller.js';

const router = express.Router();

// CHANGED: This is now a POST to accept a userId in the body
router.post('/redirect', redirectToDashboard);

router.get('/dashboard/student',
    (req,res)=> res.json({message: 'Welcome Student'})
);

router.get('/dashboard/faculty',
    (req,res)=> res.json({message: 'Welcome Faculty'})
);

router.get('/dashboard/admin',
    (req,res)=> res.json({message: 'Welcome Admin'})
);

router.route('/students').get(getStudents); 
router.route('/student/:id')
    .put(updateStudent)       
    .delete(deleteStudent); 


export default router;