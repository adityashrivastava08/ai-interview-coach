import mongoose, { Schema, model, models } from "mongoose";

const DSAPracticeSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: { type: String, required: true },
  status: { type: String, enum: ["solved", "attempted"], required: true },
  submittedCode: { type: String, required: true },
  feedback: { type: String, required: true },
  score: { type: Number, required: true },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  attemptedAt: { type: Date, default: Date.now }
});

// Ensure a single user has a unique attempt record per question
DSAPracticeSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const DSAPractice = models.DSAPractice || model("DSAPractice", DSAPracticeSchema);
