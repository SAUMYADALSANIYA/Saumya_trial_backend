import express from 'express';
import { verifyToken } from '../middleware/authmiddleware.js';
import { permitRoles } from '../middleware/authmiddleware.js';
import { redirectToDashboard } from '../controllers/dashboardcontroller.js';

const router = express.Router();

router.get('/redirect',verifyToken,redirectToDashboard);

router.get('/dashboard/student',
    verifyToken,
    permitRoles(0),
    (req,res)=> res.json({message: 'Welcome Student'})
);

router.get('/dashboard/faculty',
    verifyToken,
    permitRoles(1),
    (req,res)=> res.json({message: 'Welcome Faculty'})
);

router.get('/dashboard/admin',
    verifyToken,
    permitRoles(2),
    (req,res)=> res.json({message: 'Welcome Admin'})
);

export default router;