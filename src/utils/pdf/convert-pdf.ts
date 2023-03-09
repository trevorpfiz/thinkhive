import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

type PdfTextResult = {
  wordCount: number;
  text: string;
};

export default async function convertPdfToText(file: File): Promise<PdfTextResult> {
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);

  return new Promise<PdfTextResult>((resolve, reject) => {
    fileReader.onload = async () => {
      if (!fileReader.result) {
        reject(new Error('Failed to read PDF file'));
        return;
      }

      const pdfDoc = await pdfjsLib.getDocument(fileReader.result).promise;

      // Get text content from PDF and count words
      const pageTextPromises = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const pageTextPromise = page.getTextContent();
        pageTextPromises.push(pageTextPromise);
      }
      const pageTexts = await Promise.all(pageTextPromises);
      const text = pageTexts
        .map((pageText) =>
          pageText.items
            .map((item) => {
              if ('str' in item) {
                return item.str;
              } else {
                return '';
              }
            })
            .join(' ')
        )
        .join(' ');

      const totalWords = pageTexts.reduce((acc, pageText) => {
        const words = pageText.items.map((item) => {
          if ('str' in item) {
            return item.str.trim().split(/\s+/).length;
          } else {
            return 0;
          }
        });
        return acc + words.reduce((acc: number, wordCount: number) => acc + wordCount, 0);
      }, 0);

      resolve({ text, wordCount: totalWords });
    };

    fileReader.onerror = () => {
      reject(new Error('Failed to read PDF file'));
    };
  });
}
