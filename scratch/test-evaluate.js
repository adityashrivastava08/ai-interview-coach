const { GoogleGenAI } = require("@google/genai");
const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://adityaranjan2611_db_user:q1NEVf1m2oClq1Nf@interview-ai-cluster.dtcvkt6.mongodb.net/interview_db?retryWrites=true&w=majority";
const GEMINI_API_KEY = "AIzaSyCX42zX9lmmB3v1wzIccDVm4MbGZKSM5ow";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const track = "mern";
const messages = [
  { role: "model", content: "Hello, ready for MERN round." },
  { role: "user", content: "I am ready." },
  { role: "model", content: "What is React Virtual DOM?" },
  { role: "user", content: "It is a lightweight representation of the real DOM in memory." }
];

async function run() {
  try {
    const transcriptText = messages
      .map((msg) => `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content || msg.text}`)
      .join("\n\n");

    const evaluationPrompt = `
      You are an expert Senior Technical Recruiter and Bar Raiser.
      Evaluate the technical mock interview dialogue transcript between the Interviewer and the Candidate.
      
      Track Domain: ${track}
      Full Transcript:
      ${transcriptText}
      
      Analyze the candidate's performance. Review each question asked and their corresponding answer.
      You must respond with a JSON object strictly containing the following schema:
      {
        "overallScore": (number between 1 and 10 representing the candidate's average score),
        "overallFeedback": (string containing a professional 3-4 sentence comprehensive summary of their performance, strengths, and key growth areas),
        "questions": [
          {
            "questionText": (string, the exact question text asked by the Interviewer),
            "userAnswer": (string, the exact response text given by the Candidate),
            "score": (number between 1 and 10 representing the quality of this response),
            "feedback": (string, 1-2 sentence detailed critique of their answer, pointing out what was correct and what was missing or incorrect)
          }
        ]
      }
      
      Important rules for formatting the JSON array:
      - Pair each question asked by the interviewer with the subsequent answer given by the candidate.
      - If a question was skipped or not answered, record userAnswer as "[No response]" or "[Skipped]" and score accordingly.
      - Respond ONLY with the raw JSON object. Do not wrap the JSON output in markdown formatting.
    `;

    console.log("Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: evaluationPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    console.log("Raw Response received:", response.text);
    const rawJsonText = response.text?.trim() || "{}";
    const result = JSON.parse(rawJsonText);
    console.log("Successfully parsed JSON!", result);

  } catch (error) {
    console.error("Error encountered:", error);
  }
  process.exit(0);
}

run();
