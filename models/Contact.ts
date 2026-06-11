import mongoose, { Schema, model, models } from "mongoose";

const ContactSchema = new Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: { type: String, required: [true, "Email is required"] },
  subject: { type: String, default: "General inquiry" },
  message: { type: String, required: [true, "Message is required"] },
  createdAt: { type: Date, default: Date.now },
});

export const Contact = models.Contact || model("Contact", ContactSchema);
