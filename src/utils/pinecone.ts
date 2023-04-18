import { PineconeClient } from '@pinecone-database/pinecone';

export async function initPinecone() {
  if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
    throw new Error('Pinecone environment or api key vars missing');
  }

  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT ?? '',
      apiKey: process.env.PINECONE_API_KEY ?? '',
    });

    return pinecone;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to initialize Pinecone Client: ${error.message}`);
    } else {
      throw new Error('Unknown Pinecone error.');
    }
  }
}
