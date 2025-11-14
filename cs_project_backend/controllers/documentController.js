import DocumentModel from '../models/document_model.js';

// --- Utility for consistent file path creation ---
const getFileRelativePath = (filename) => `/uploads/${filename}`;


// -------------------------------------------------------------
// POST: Upload Document (Used by Admin/Faculty)
// -------------------------------------------------------------
export const uploadDocument = async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ message: req.fileValidationError });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Get optional metadata from the request body
        // NOTE: req.body holds non-file fields from the multipart form
        const { title, category, audience } = req.body;
        
        // Construct the relative file URL
        const fileUrl = getFileRelativePath(req.file.filename);
        
        // Save metadata to DB
        const newDocument = await DocumentModel.create({
            title: title || req.file.originalname,
            fileUrl: fileUrl,
            category: category,
            audience: audience,
            uploadedBy: req.user ? req.user._id : null, 
        });

        res.status(201).json({
            message: 'PDF uploaded and metadata saved.',
            document: newDocument
        });

    } catch (error) {
        console.error("Document upload error:", error);
        res.status(500).json({ 
            message: 'Failed to upload document or save metadata.',
            error: error.message 
        });
    }
};


// -------------------------------------------------------------
// GET: Fetch Document List (Used by Student/Faculty/Admin)
// -------------------------------------------------------------
export const getDocuments = async (req, res) => {
    try {
        // Logic to filter documents based on user role would go here
        // For now, we fetch all public documents or all documents (for simplified testing)
        const documents = await DocumentModel.find()
            .sort({ createdAt: -1 })
            .select('title fileUrl category audience createdAt');

        res.status(200).json(documents);

    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ 
            message: 'Failed to retrieve documents.',
            error: error.message 
        });
    }
};