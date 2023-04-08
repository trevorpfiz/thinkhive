import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';
import { Document } from 'langchain/document';

export async function processMarkDownFiles(directoryPath: string): Promise<Document[]> {
  try {
    const fileNames = await glob('**/*.md', { cwd: directoryPath });
    console.log('files', fileNames);

    const docs: Document[] = [];
    for (const fileName of fileNames) {
      const filePath = path.join(directoryPath, fileName);
      const text = await fs.readFile(filePath, {
        encoding: 'utf-8',
      });
      const metadata = { source: fileName };
      docs.push(
        new Document({
          pageContent: text,
          metadata,
        })
      );
    }
    console.log('docs', docs);
    return docs;
  } catch (error) {
    console.log('error', error);
    throw new Error(`Could not read directory path ${directoryPath} `);
  }
}

// Stripe
export const toDateTime = (secs: number) => {
  const t = new Date('1970-01-01T00:30:00Z'); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

// widget
export const isMobile = () => window.innerWidth <= 600;
export const isTablet = () => window.innerWidth > 600 && window.innerWidth < 768;
export const isDesktop = () => window.innerWidth >= 768;
export const isPortraitMode = () => window.innerHeight > window.innerWidth;
