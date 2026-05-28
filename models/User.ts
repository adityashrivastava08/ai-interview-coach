import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: [true, "Full name is required"] },
  email: { type: String, required: [true, "Email is required"], unique: true },
  password: { type: String }, // Optional to allow OAuth sign-ins later
  avatarUrl: { type: String, default: "" },
  college: { type: String, default: "" },
  targetCompany: { type: String, default: "" },
  role: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model("User", UserSchema);