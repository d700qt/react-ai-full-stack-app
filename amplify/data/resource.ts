import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Note: a
    .model({
      name:a.string(),
      description: a.string(),
      image: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  generateSummary: a.generation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: 'You generate summaries of notes in clear English in a comedy style.',
  })
  .arguments({
    description: a.string(),
  })
  .returns(a.string())
  .authorization((allow) => allow.authenticated()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
