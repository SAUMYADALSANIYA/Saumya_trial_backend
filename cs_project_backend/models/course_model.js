import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    department: {
        type: String,
        required: true,
        trim: true,
    },
    // Link to faculty who teach this course (optional - could be array if multiple faculty teach)
    faculty: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
    }],
    
    // Additional details like credits, semester, etc.
    credits: {
        type: Number,
        default: 3,
    },
}, {
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
export default Course;