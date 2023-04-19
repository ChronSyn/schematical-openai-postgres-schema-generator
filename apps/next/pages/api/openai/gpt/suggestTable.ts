import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: process.env.OPEN_AI_ORG_ID ?? undefined,
  apiKey: process.env.OPENAI_API_KEY,
});
const openAiSingleton = new OpenAIApi(configuration);
// const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt } = req.body

  if (!prompt) {
    res.status(400).json({ error: 'Missing prompt' })
    return
  }

  const wrappedJsonPrompt = [
    'I want you to create the JSON structure that can be used to represtent a schema for a project with the following theme:',
    `"I am building a ${prompt} platform"`,
    'This JSON structure will be used to create a UI which can be used to visualize the schema. Please only return the JSON - do not include any other content.',
    'The JSON structure should be a list of objects. Each object should have the following properties:',
    'name: The name of the table',
    'columns: A list of objects. Each object should have the following properties:',
    'name: The name of the column',
    'type: The type of the column',
    'primary_key: A boolean indicating whether or not the column is a primary key',
    'foreign_key: A boolean indicating whether or not the column is a foreign key',
    'references: If the column is a foreign key, this should be the name of the table that the column references',
    'default: The default value for the column',
    'The root object should be called "tables".',
    'All data types should be compatible with PostgreSQL.',
    'Varchar should be text.',
    'primary keys should be uuid.',
    'foreign keys should be uuid.',
    'integer should be int8.',
    'Any user table should not include a password column.',
    'Any user table should include a created_at column.',
    'Any user table should include a foreign key link between auth.users.id column and the user table id column.',
    'Any uuid column should use the uuid_generate_v4() function to generate the default value.',
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