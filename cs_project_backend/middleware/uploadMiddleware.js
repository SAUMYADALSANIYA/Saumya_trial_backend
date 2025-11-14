import multer from 'multer';
import path from 'path';

// Define storage settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Files are saved to the 'uploads' folder
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Create unique file name: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Ensure the filename is URL-safe and retains the original extension
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to ensure only PDFs are uploaded
const pdfFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept PDF files
    } else {
        cb(null, false); // Reject other files
        // Store error message on the request object
        req.fileValidationError = 'Only PDF files are allowed!'; 
    }
};

// Initialize multer upload instance (10MB limit)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, 
    fileFilter: pdfFileFilter
});

// Middleware function to handle a single file upload named 'document'
export const uploadSinglePDF = upload.single('document');
