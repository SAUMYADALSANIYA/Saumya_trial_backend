import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true, // Add index for faster queries
  },
  year: {
    type: Number,
    required: true,
    index: true, // Add index for faster queries
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    enum: ['PYQ', 'Book', 'Practice'],
    default: 'PYQ',
  },
  // We can leave 'topic' out for now and let the AI
  // categorize it dynamically on each request.
}, {
  timestamps: true,
});

const QuestionModel = mongoose.model('Question', questionSchema);
export default QuestionModel;