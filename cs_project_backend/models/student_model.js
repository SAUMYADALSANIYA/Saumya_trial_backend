import mongoose from "mongoose";
import user_model from "./user_model.js";

const StudentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Existing Registration/Core Fields
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
    number: { // Likely the primary contact number from the User model
        type: Number,
        required: true,
        unique: true,
    },
    enrollmentId:{
        type: Number,
        required: true,
        unique: true,
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
    },
    
    // NEW FIELDS TO SUPPORT FLUTTER ADMIN DASHBOARD (classes_page.dart)
    rollNumber: { // Used as a key identifier in the Flutter app
        type: String, 
        unique: true,
        sparse: true, 
        trim: true,
    },
    phone: { // Flutter field: We use this field for the phone number
        type: String, 
        default: "",
        trim: true,
    },
    age: { // Flutter field
        type: String,
        default: "",
        trim: true,
    },
    department: { // Flutter field: Used in place of/alongside 'course'
        type: String,
        default: "",
        trim: true,
    },
    image: { // Flutter field: Profile picture URL
        type: String,
        trim: true,
        default: function() {
             return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name || 'Student')}`;
        },
    },

}, {
    timestamps: true,
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