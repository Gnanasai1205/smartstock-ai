const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// We will default to a fast Llama 3 model for operational intelligence
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Utility to process structured JSON evaluations directly against dynamic inventory payloads.
 * 
 * @param {String} systemInstruction The persona and constraints for the AI
 * @param {String} userPrompt The dynamic contextual request
 * @param {Object} responseSchema The schema definition to include in the system prompt
 * @returns {Object} JSON payload
 */
const generateStructuredJSON = async (systemInstruction, userPrompt, responseSchema) => {
  try {
    const enrichedSystemPrompt = `
      ${systemInstruction}
      
      You MUST respond ONLY with valid, minified JSON object that strictly adheres to the following structure:
      ${JSON.stringify(responseSchema)}
      
      Do not include markdown blocks, explanations, or any other text. Only the raw JSON.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: enrichedSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: MODEL,
      response_format: { type: 'json_object' }
    });

    const resultText = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(resultText);
  } catch (err) {
    console.error("Groq Structured Output Error:", err);
    throw err;
  }
};

/**
 * Standard text-based generation for AI Chat widget
 * 
 * @param {String} prompt The aggregated conversation or query
 * @returns {String} AI generated reply
 */
const generateChatResponse = async (prompt) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: "You are 'SmartStock AI', an internal warehouse intelligence assistant for employees. Keep answers concise, extremely helpful, and directly related to the provided inventory data payload."
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      model: MODEL
    });
    
    return chatCompletion.choices[0]?.message?.content || 'I encountered an error analyzing your request.';
  } catch (err) {
     console.error("Groq Chat Output Error:", err);
     throw err;
  }
};

module.exports = {
  groq,
  generateStructuredJSON,
  generateChatResponse
};
