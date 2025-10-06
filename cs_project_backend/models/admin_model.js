import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    acesslevel:{
        type: String,
        default: 'Super',
    },
    profilestatus:{
        type: Boolean,
        default: false
    }
});

export default mongoose.model('Admin',adminSchema);