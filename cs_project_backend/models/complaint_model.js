import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    // Link to the user who filed the complaint (polymorphic reference)
    filedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'filedByModel', // Use refPath to link to Faculty/Student/Admin
        required: true,
    },
    filedByModel: { // Tracks which collection (model) the user belongs to
        type: String,
        required: true,
        enum: ['Faculty', 'Student', 'Admin']
    },
    
    // Complaint details
    content: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Resolved', 'Closed'],
        default: 'New',
    },
    
    category: {
        type: String,
        default: 'General',
    }
}, {
    timestamps: true 
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;