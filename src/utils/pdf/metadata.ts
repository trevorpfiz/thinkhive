import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export interface PdfMetadata {
  fileName: string;
  fileSize: number;
  contentType: string;
  createdDate?: string;
  modifiedDate?: string;
}

interface PdfInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Keywords?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
  Trapped?: string;
}

export async function getPdfMetadata(file: File): Promise<PdfMetadata> {
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);

  return new Promise<PdfMetadata>((resolve, reject) => {
    fileReader.onload = async () => {
      if (!fileReader.result) {
        reject(new Error('Failed to read PDF file'));
        return;
      }

      const pdfDoc = await pdfjsLib.getDocument(fileReader.result).promise;
      const pdfInfo = await pdfDoc.getMetadata();
      const infoDict = pdfInfo.info as PdfInfo;

      const metadata = {
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        createdDate: infoDict.CreationDate,
        modifiedDate: infoDict.ModDate,
      };

      Object.fromEntries(Object.entries(metadata).filter(([_, v]) => v !== undefined && v !== ''));

      resolve(metadata);
    };

    fileReader.onerror = () => {
      reject(new Error('Failed to read PDF file'));
    };
  });
}

//* will need to rewrite this to convert pdf date if needed
// export function formatDate(dateStr: string | undefined) {
//   console.log(dateStr);
//   if (!dateStr) {
//     return '';
//   }

//   const date = new Date(dateStr);

//   if (isNaN(date.getTime())) {
//     return '';
//   }

//   return date.toLocaleString();
// }
