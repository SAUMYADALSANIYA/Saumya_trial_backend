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

        // Get metadata from the request body
        // MODIFIED: Changed 'category' to 'type' to match your model
        const { title, type, audience } = req.body;
        
        // ADDED: Validation to ensure the required 'type' field is provided
        if (!type || !['College', 'Hostel'].includes(type)) {
            return res.status(400).json({
                message: "A 'type' field is required. Must be either 'College' or 'Hostel'."
            });
        }
        
        // Construct the relative file URL
        const fileUrl = getFileRelativePath(req.file.filename);
        
        // Save metadata to DB
        const newDocument = await DocumentModel.create({
            title: title || req.file.originalname,
            fileUrl: fileUrl,
            type: type, // MODIFIED: Correctly saving the 'type'
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
// GET: Fetch Document List BY TYPE (Used by Student/Faculty/Admin)
// -------------------------------------------------------------
// RENAMED: from getDocuments to getDocumentsByType
export const getDocumentsByType = async (req, res) => {
    try {
        const { type } = req.params; // Get type from URL ('College' or 'Hostel')

        // Validate the type
        // Capitalize first letter to match enum 'College' or 'Hostel'
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

        if (!capitalizedType || !['College', 'Hostel'].includes(capitalizedType)) {
            return res.status(400).json({ 
                message: "Invalid document type. Must be 'College' or 'Hostel'." 
            });
        }

        // Use the capitalized 'type' in the find query
        const documents = await DocumentModel.find({ type: capitalizedType })
            .sort({ createdAt: -1 })
            .select('title fileUrl type audience createdAt'); // Added 'type' to the selection

        if (documents.length === 0) {
             return res.status(404).json({ 
                message: `No documents found for type: ${capitalizedType}` 
            });
        }

        res.status(200).json(documents);

    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ 
            message: 'Failed to retrieve documents.',
            error: error.message 
        });
    }
};