import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: process.env.OPEN_AI_ORG_ID ?? undefined,
  apiKey: process.env.OPENAI_API_KEY,
});
const openAiSingleton = new OpenAIApi(configuration);

import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt, existingTablesJson } = req.body

  if (!prompt || !existingTablesJson) {
    res.status(400).json({ error: 'Missing prompt or existing table data' })
    return
  }

  const wrappedJsonPrompt = [
    'I have the following JSON structure which represents an existing Postgres database schema:',
    `${existingTablesJson}`,
    `I have the following prompt:`,
    `I would like to ${prompt}`,
    'I want you to adjust the JSON structure to reflect the changes that I would like to make to the database schema.',
    'The JSON structure should be returned in the same format as the original JSON structure but with the changes that I would like to make to the database schema.',
    'Please return the JSON structure only - do not include any other content.',
  ].join(' ');

  const suggestions = await openAiSingleton.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: wrappedJsonPrompt }
    ]
  })

  const result = JSON.parse((suggestions.data.choices?.[0] ?? [])?.message?.content ?? "{}");

  return res.status(200).json(result)
}

export default handler