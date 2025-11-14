import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    // The link to the stored PDF file (e.g., /uploads/filename.pdf)
    fileUrl: {
        type: String,
        required: true,
    },
    // CRITICAL: Field to segregate documents (College or Hostel)
    type: {
        type: String,
        required: true,
        enum: ['College', 'Hostel'],
        trim: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    audience: {
        type: String,
        enum: ['All', 'Students', 'Faculty', 'Admin'],
        default: 'All',
    }
}, {
    timestamps: true 
});

const DocumentModel = mongoose.model('Document', documentSchema);
export default DocumentModel;