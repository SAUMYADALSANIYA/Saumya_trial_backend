import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date, // Matches 'due_date' payload from Flutter
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Assuming Admin creates assignments
        required: true,
    },
    // Optional: link to a specific class or department
    // department: { type: String }, 

}, {
    timestamps: true 
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;