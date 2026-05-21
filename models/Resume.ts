import mongoose, { Schema, model, models } from "mongoose";

const ResumeSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: { type: String, required: true },
  textContent: { type: String, required: true },
  skills: [{ type: String }], // Mongoose array configuration to match your skills tags
  extractedAt: { type: Date, default: Date.now }
});

export const Resume = models.Resume || model("Resume", ResumeSchema);