/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as pdfjsLib from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone';

import { api } from '@/utils/api';
import { useMemo } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

const maxLength = 20;

function nameLengthValidator(file: File) {
  if (file.name.length > maxLength) {
    return {
      code: 'name-too-large',
      message: `Name is larger than ${maxLength} characters`,
    };
  }

  return null;
}

export default function FileDropzone() {
  const { mutateAsync, isLoading } = api.upload.uploadText.useMutation();

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    validator: nameLengthValidator,
    accept: {
      'application/pdf': ['.pdf'],
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  async function convertPdfToText(file: File): Promise<string> {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    return new Promise<string>((resolve, reject) => {
      fileReader.onload = async () => {
        if (!fileReader.result) {
          reject(new Error('Failed to read PDF file'));
          return;
        }

        const pdf = await pdfjsLib.getDocument(fileReader.result).promise;
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const text = textContent.items
          .map((item) => {
            if ('str' in item) {
              return item.str;
            } else {
              return '';
            }
          })
          .join(' ');
        resolve(text);
      };

      fileReader.onerror = () => {
        reject(new Error('Failed to read PDF file'));
      };
    });
  }

  async function sendTextToBackend(text: string): Promise<void> {
    await mutateAsync({ text });
  }

  const handleSubmit = async () => {
    const file = acceptedFiles[0];

    if (!file) {
      console.log('no file');
      return;
    }

    const text = await convertPdfToText(file);
    console.log(text);

    await sendTextToBackend(text);

    return;
  };

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
      <ul>
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <section className="container">
      {/* @ts-ignore */}
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Click to select files, or drag & drop</p>
        <em>(Only files with name less than 20 characters will be accepted)</em>
      </div>
      <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems}</ul>
        <h4>Rejected files</h4>
        <ul>{fileRejectionItems}</ul>
      </aside>
      <button
        type="button"
        className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        Save
      </button>
    </section>
  );
}
