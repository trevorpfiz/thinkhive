import { NextResponse } from 'next/server';
import model from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { init, Tiktoken } from '@dqbd/tiktoken/lite/init';
// @ts-expect-error https://www.npmjs.com/package/@dqbd/tiktoken#vercel-edge-runtime
import wasm from '@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';
import { CallbackManager } from 'langchain/callbacks';
import { RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

import type { NextRequest } from 'next/server';
import { PINECONE_INDEX_NAME } from '~/config/pinecone';
import { prisma } from '~/server/db';
import { hasEnoughCredits } from '~/server/helpers/permissions';
import { messageLimitDay, messageLimitMinute } from '~/server/helpers/ratelimit';
import { initPinecone } from '~/utils/pinecone';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest): Promise<Response> => {
  const { question, chatHistory, systemMessage, metadataIds, assistantId } = (await req.json()) as {
    question?: string;
    chatHistory?: string[];
    systemMessage?: string;
    metadataIds?: string[];
    assistantId?: string;
  };

  if (!question || !chatHistory || !metadataIds || !assistantId) {
    return new Response('Invalid request payload', { status: 400 });
  }

  // rate limit
  function getIP(request: Request) {
    const xff = request.headers.get('x-forwarded-for');
    return xff ? xff.split(',')[0] : '127.0.0.1';
  }

  const ip = getIP(req);
  if (!ip) throw new Error('BAD_REQUEST');
  const { success } = await messageLimitMinute.limit(ip);
  if (!success) throw new Error('TOO_MANY_REQUESTS');
  const { success: successDay } = await messageLimitDay.limit(ip);
  if (!successDay) throw new Error('TOO_MANY_REQUESTS');

  // Initialize tiktoken for edge
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await init((imports) => WebAssembly.instantiate(wasm, imports));

  const encoding = new Tiktoken(model.bpe_ranks, model.special_tokens, model.pat_str);

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

  const questionTokens = encoding.encode(sanitizedQuestion).length;
  const chatHistoryTokens = encoding.encode(chatHistory.join(' ')).length;
  const embeddingTokens = questionTokens + chatHistoryTokens;

  // 1. Check if user has enough credits for the question.
  const fromCredits = await hasEnoughCredits(userId, embeddingTokens / 5);

  // usage function
  let totalTokens = 0;

  const updateUsage = async (
    userId: string,
    fromCredits: boolean,
    totalTokens: number,
    embeddingTokens: number
  ) => {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: {
          decrement: fromCredits ? (totalTokens + embeddingTokens / 5) / 1000 : 0,
        },
        additionalCredits: {
          decrement: !fromCredits ? (totalTokens + embeddingTokens / 5) / 1000 : 0,
        },
        embeddingUsage: {
          increment: embeddingTokens,
        },
        llmUsage: {
          increment: totalTokens,
        },
      },
    });
  };

  // Metadata filtering
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

  // Call LLM and stream output
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const openai = new ChatOpenAI({
    temperature: 0.0,
    streaming: true,
    callbackManager: CallbackManager.fromHandlers({
      handleLLMNewToken: async (token) => {
        await writer.ready;
        await writer.write(encoder.encode(`data: ${token}\n\n`));
        totalTokens += encoding.encode(token).length;
      },
      handleLLMEnd: async () => {
        await writer.ready;
        await writer.write(encoder.encode(`data: [DONE]\n\n`));
        await writer.close();
        encoding.free();
        void updateUsage(userId, fromCredits, totalTokens, embeddingTokens);
      },
      handleLLMError: async (e) => {
        await writer.ready;
        await writer.abort(e);
      },
    }),
  });

  // create the chain
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const chain = RetrievalQAChain.fromLLM(openai, vectorStore.asRetriever(), {
    qaTemplate,
    returnSourceDocuments: false,
  });

  // Run the chain but don't await it, otherwise the response will start
  // only after the chain is done
  chain
    .call({
      query: sanitizedQuestion,
    })
    .catch(console.error);

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
};

export default handler;
