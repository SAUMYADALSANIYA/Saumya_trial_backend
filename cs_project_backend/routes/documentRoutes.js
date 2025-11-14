import express from 'express';
import { verifyToken, permitRoles } from '../middleware/authmiddleware.js';
import { uploadDocument, getDocumentsByType } from '../controllers/documentController.js';
import { uploadSinglePDF } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// -------------------------------------------------------------
// POST /api/v1/documents/upload
// Enables Admin/Faculty to upload the PDF. (No Auth required)
// -------------------------------------------------------------
router.post(
    '/upload', 
    uploadSinglePDF, // Multer processes the file (field name: 'document')
    uploadDocument  // Controller saves metadata and links
);

// -------------------------------------------------------------
// GET /api/v1/documents/college 
// GET /api/v1/documents/hostel
// Enables all roles to fetch the categorized list.
// -------------------------------------------------------------
router.get(
    '/:type', // The parameter :type will be 'college' or 'hostel'
    getDocumentsByType 
);

export default router;