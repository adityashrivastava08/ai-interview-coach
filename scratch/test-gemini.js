const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: "AIzaSyCX42zX9lmmB3v1wzIccDVm4MbGZKSM5ow" });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, tell me a joke.",
    });
    console.log("Success:", response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
