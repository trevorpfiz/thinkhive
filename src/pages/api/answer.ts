/* eslint-disable @typescript-eslint/require-await */
import { get_encoding } from '@dqbd/tiktoken';
import { CallbackManager } from 'langchain/callbacks';
import { ConversationalRetrievalQAChain, RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { getClientIp } from 'request-ip';

import type { NextApiRequest, NextApiResponse } from 'next';
import { PINECONE_INDEX_NAME } from '~/config/pinecone';
import { prisma } from '~/server/db';
import { hasEnoughCredits } from '~/server/helpers/permissions';
import { messageLimitDay, messageLimitMinute } from '~/server/helpers/ratelimit';
import { initPinecone } from '~/utils/pinecone';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { question, chatHistory, systemMessage, metadataIds, assistantId } = req.body as {
    question?: string;
    chatHistory?: string[];
    systemMessage?: string;
    metadataIds?: string[];
    assistantId?: string;
  };

  if (!question || !chatHistory || !metadataIds || !assistantId) {
    return res.status(400).json({ message: 'Invalid request payload' });
  }

  // rate limit
  const ip = getClientIp(req);
  if (!ip) throw new Error('BAD_REQUEST');
  const { success } = await messageLimitMinute.limit(ip);
  if (!success) throw new Error('TOO_MANY_REQUESTS');
  const { success: successDay } = await messageLimitDay.limit(ip);
  if (!successDay) throw new Error('TOO_MANY_REQUESTS');

  // get userId from assistantId
  const assistantUserId = await prisma.assistant.findUnique({
    where: {
      id: assistantId,
    },
    select: {
      userId: true,
    },
  });

  if (!assistantUserId) throw new Error('BAD_REQUEST');
  const userId = assistantUserId?.userId;

  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  // 2. Metadata filtering.
  const filter = {
    metadataId: { $in: metadataIds },
  };

  const pinecone = await initPinecone();
  const index = pinecone.Index(PINECONE_INDEX_NAME);
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }),
    {
      namespace: userId,
      pineconeIndex: index,
      textKey: 'text',
      filter: filter,
    }
  );

  const qaTemplate = `Given the context provided below, answer the question. If the exact information requested is unavailable, provide any relevant information related to the topic from the context. Provide a helpful and concise answer. ${
    systemMessage ? systemMessage.replace(/\{/g, '(').replace(/\}/g, ')') : ''
  }
  Context: {context}
  Question: {question}
  Helpful Answer:`;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  const model = new ChatOpenAI({
    temperature: 0.0,
    streaming: true,
    callbackManager: CallbackManager.fromHandlers({
      handleLLMNewToken: async (token) => {
        res.write(`data: ${token}\n\n`);
      },
      handleLLMEnd: async () => {
        console.log('handleLLMEnd!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        res.write(`data: [DONE]\n\n`);
        res.end();
      },
      handleLLMError: async (e) => {
        console.log('error!!!!!!!!!!!!!!!', e);
      },
    }),
  });

  // create the chain
  // FIXME - this is a bug in langchain
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    qaTemplate,
    returnSourceDocuments: false,
  });

  try {
    //Ask a question
    const response = await chain.call({
      query: sanitizedQuestion,
    });

    console.log('response', response);
  } catch (error) {
    console.log('error', error);
  } finally {
    res.end();
  }
}
