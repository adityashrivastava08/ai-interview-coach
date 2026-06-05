const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://adityaranjan2611_db_user:q1NEVf1m2oClq1Nf@interview-ai-cluster.dtcvkt6.mongodb.net/interview_db?retryWrites=true&w=majority";

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log("Connected successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error connecting:", error);
    process.exit(1);
  }
}
test();
