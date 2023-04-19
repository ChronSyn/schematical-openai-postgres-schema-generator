import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: process.env.OPEN_AI_ORG_ID ?? undefined,
  apiKey: process.env.OPENAI_API_KEY,
});
const openAiSingleton = new OpenAIApi(configuration);

import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { existingTablesJson } = req.body

  if (!existingTablesJson) {
    res.status(400).json({ error: 'Missing prompt or existing table data' })
    return
  }

  const wrappedJsonPrompt = [
    'I have the following JSON structure which represents a Postgres database schema:',
    `${existingTablesJson}`,
    'I would like you to generate the SQL code for this schema',
    'It should be compatible with PostgreSQL',
    'Please return the SQL code only - do not include any other content.',
  ].join(' ');

  const suggestions = await openAiSingleton.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: wrappedJsonPrompt }
    ]
  })

  return res.status(200).send(suggestions?.data?.choices?.[0]?.message?.content ?? "")
}

export default handler