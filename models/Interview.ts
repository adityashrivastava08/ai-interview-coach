import mongoose, { Schema, model, models } from "mongoose";

// 1. The structure for questions embedded within the interview document
const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  userAnswer: { type: String, default: "" },
  score: { type: Number, default: null },
  feedback: { type: String, default: "" },
  idealKeywords: [{ type: String }],
});

// 2. The main interview schema setup
const InterviewSchema = new Schema({
  // THIS IS WHERE IT GOES: This links the interview to the specific User who took it
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  topic: { type: String, required: true },  
  score: { type: Number, default: null },   
  feedback: { type: String, default: "" },  
  questions: [QuestionSchema], // Your nested array of questions             
  createdAt: { type: Date, default: Date.now },
});

export const Interview = models.Interview || model("Interview", InterviewSchema);