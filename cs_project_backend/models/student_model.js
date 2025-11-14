import mongoose from "mongoose";
import user_model from "./user_model.js";

const StudentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
        unique: true,
    },
    enrollmentId:{
        type: Number,
        required: true,
    },
    course:{
        type: String,
        required: true,
    },
    DOB:{
        type: Date,
        required: true, 
    },
    Gender:{
        type: String,
        required: true,
    },
    Year:{
        type: Number,
        required: true,
    },
    Nationality:{
        type:String,
        required : true,
    },
    Religion:{
        type:String,
        required: true,
    },
    State:{
        type:String,
        required: true,
    },
    profilestatus:{
        type: Boolean,
        default: false
    }
});

StudentSchema.pre('save',async function (next){
    if(!this.isModified('user')) return next();
    
    const user = await user_model.findById(this.user);
    if(!user) return next(new Error('User not found'));

    this.email = user.email;
    this.name = user.name;
    this.number = user.number;

    next();
});

export default mongoose.model('Student',StudentSchema);

