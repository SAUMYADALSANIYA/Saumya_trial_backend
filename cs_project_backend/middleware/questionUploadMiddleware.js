import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the destination folder
const uploadDir = 'uploads/questions/';

// Ensure the directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Define storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Create unique file name: fieldname-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to ensure only images are uploaded
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept image files
  } else {
    cb(null, false); // Reject other files
    req.fileValidationError = 'Only image files (png, jpg, jpeg) are allowed!'; 
  }
};

// Initialize multer upload instance (10MB limit)
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
  fileFilter: imageFileFilter
});

// Middleware function to handle a single file upload named 'questionImage'
export const uploadQuestionImage = upload.single('questionImage');