import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
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
    secretkey:{
        type: String,
        required: true,
    },
    role:{
        type: Number,
        enum: [0,1,2],
        required: true,
        default: 0,
    }
},{timestamps: true})

export default mongoose.model("user", userSchema);
