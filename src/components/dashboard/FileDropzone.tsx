/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useMemo, useState } from 'react';
import { type FileRejection, useDropzone } from 'react-dropzone';

import { api } from '@/utils/api';
import convertPdfToText from '@/utils/pdf/convert-pdf';
import { getPdfMetadata, type PdfMetadata } from '@/utils/pdf/metadata';

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
  const utils = api.useContext();

  const { mutate, isLoading } = api.upload.uploadText.useMutation({
    onSuccess(input) {
      // Refetch the query after a successful delete
      void utils.metadata.getMetadata.invalidate();

      console.log(input);
    },
    onError: () => {
      console.error('Error!');
    },
  });

  const [myFiles, setMyFiles] = useState<File[]>([]);

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      const updatedFiles = [...myFiles];
      acceptedFiles.forEach((newFile) => {
        // Check if the file already exists in the list of selected files
        const fileExists = updatedFiles.some(
          (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
        );
        if (!fileExists) {
          updatedFiles.push(newFile);
        } else {
          console.log(`File ${newFile.name} already exists`);
        }
      });
      setMyFiles(updatedFiles);
    },
    [myFiles]
  );

  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    console.log(rejectedFiles);
  }, []);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    validator: nameLengthValidator,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    onDropAccepted,
    onDropRejected,
  });

  const removeFile = (file: File) => () => {
    const newFiles = [...myFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setMyFiles(newFiles);
  };

  const removeAll = () => {
    setMyFiles([]);
  };

  const files = myFiles.map((file: File) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes <button onClick={removeFile(file)}>Remove File</button>
    </li>
  ));

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  function sendDataToBackend(text: string, wordCount: number, metadata: PdfMetadata) {
    mutate({ text, wordCount, metadata });
  }

  const handleSubmit = async () => {
    if (myFiles.length === 0) {
      console.log('no files selected');
      return;
    }

    setMyFiles([]);

    // TODO - is calling sendDataToBackend for each file, will need to convert to handling a page
    for (const file of myFiles) {
      const { text, wordCount } = await convertPdfToText(file);
      console.log(wordCount);
      const metadata = await getPdfMetadata(file);
      console.log(metadata);

      sendDataToBackend(text, wordCount, metadata);
    }
  };

  return (
    <section className="container">
      {/* @ts-ignore */}
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Click to select files, or drag & drop</p>
        <em>(Only files with name less than 20 characters will be accepted)</em>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
      {files.length > 0 && <button onClick={removeAll}>Remove All</button>}
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
