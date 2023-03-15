import { PineconeClient } from 'pinecone-client';

export type Metadata = { userId: string; text: string; title: string };

export const pineconeClient = new PineconeClient<Metadata>({
  apiKey: process.env.PINECONE_API_KEY,
  baseUrl: process.env.PINECONE_BASE_URL,
  namespace: 'testing',
});
