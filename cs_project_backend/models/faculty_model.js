import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department:{
        type: String,
        required: true,
        default: 'xyz'
    },
    courseTeaching:{
        type: [String],
        default:[]
    },
    profilestatus:{
        type: Boolean,
        default: false
    }
});

export default mongoose.model('Faculty',facultySchema);