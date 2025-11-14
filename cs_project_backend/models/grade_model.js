import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    semester: {
        type: String,
        required: true,
    },
    grade: {
        type: String,
        required: true,
    },
    credits: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model("Grade", gradeSchema);