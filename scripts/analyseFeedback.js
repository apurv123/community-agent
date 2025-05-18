require('dotenv').config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
*/

async function extractPainPoints(text) {
  const prompt = `
  You are a helpful assistant analyzing community sentiment and underlying issues. Analyze the following feedback, thinking deeply about the root cause with the product and extract the main developer pain points.

  Feedback:
  ${text}

  Pain Points:
  `;

   const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that extracts developer pain points from feedback.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 150,
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { extractPainPoints };