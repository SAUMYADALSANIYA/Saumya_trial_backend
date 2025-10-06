import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    startTime: {
        type: String, // Storing as string (e.g., "10:00 AM") for simplicity
        required: true,
    },
    endTime: {
        type: String, // Storing as string (e.g., "11:00 AM")
        required: true,
    },
    location: {
        type: String, // e.g., "Room 305" or "CS Lab 2"
        required: true,
        trim: true,
    },
    course: { // Link to the Course model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    faculty: { // Link to the specific faculty member teaching this slot
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true,
    },
}, {
    timestamps: true
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;