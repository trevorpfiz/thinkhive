import { OpenAIEmbeddings } from 'langchain/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from 'langchain/vectorstores';

import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { processMarkDownFiles } from '@/utils/helpers';
import { pinecone } from '@/utils/pinecone';

/* Name of directory to retrieve files from. You can change this as required */
const directoryPath = 'Notion_DB';

export const run = async () => {
  try {
    /*load raw docs from the markdown files in the directory */
    const rawDocs = await processMarkDownFiles(directoryPath);

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 0,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
    await PineconeStore.fromDocuments(docs, embeddings, {
      namespace: PINECONE_NAME_SPACE,
      pineconeIndex: index,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

void (async () => {
  await run();
  console.log('ingestion complete');
})();
