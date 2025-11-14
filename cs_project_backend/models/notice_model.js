// import mongoose from 'mongoose';

// const noticeSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     description: {
//         type: String,
//         required: true,
//     },
//     date: {
//         type: Date, // Date the notice was issued (from Flutter date picker)
//         default: Date.now,
//     },
//     createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Admin', // Assuming Admin creates notices
//         required: true,
//     },
//     audience: {
//         type: String,
//         enum: ['All', 'Students', 'Faculty'],
//         default: 'All',
//     }
// }, {
//     timestamps: true 
// });

// // const Notice = mongoose.model('Notice', noticeSchema);
// const Notice = mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
// export default Notice;