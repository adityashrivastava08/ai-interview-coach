import mongoose, { Schema, model, models } from "mongoose";

const AptitudeAttemptSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: { type: String, required: true },
  selectedOption: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  solvedAt: { type: Date, default: Date.now }
});

// Compound unique index so one user only has one attempt record per question
AptitudeAttemptSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const AptitudeAttempt = models.AptitudeAttempt || model("AptitudeAttempt", AptitudeAttemptSchema);
