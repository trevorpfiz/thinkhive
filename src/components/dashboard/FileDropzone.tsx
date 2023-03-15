/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useMemo, useState, RefObject, useRef } from 'react';
import { type FileRejection, useDropzone } from 'react-dropzone';
import type * as CSS from 'csstype';

import { api } from '@/utils/api';
import convertPdfToText from '@/utils/pdf/convert-pdf';
import { getPdfMetadata, type PdfMetadata } from '@/utils/pdf/metadata';
import Button from '../ui/Button';
import clsx from 'clsx';

const baseStyle: CSS.Properties = {
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingLeft: '20px',
  paddingRight: '20px',
  paddingTop: '80px',
  paddingBottom: '80px',
  borderWidth: '2px',
  borderRadius: '2px',
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const focusedStyle: CSS.Properties = {
  borderColor: '#2196f3',
};

const acceptStyle: CSS.Properties = {
  borderColor: '#00e676',
};

const rejectStyle: CSS.Properties = {
  borderColor: '#ff1744',
};

const hoveredStyle: CSS.Properties = {
  borderColor: '#2196f3',
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
    onSuccess() {
      // Refetch the query after a successful delete
      void utils.metadata.getMetadata.invalidate();
    },
    onError: () => {
      console.error('Error!');
    },
  });

  const [myFiles, setMyFiles] = useState<File[]>([]);
  const [isHovered, setIsHovered] = useState(false);

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

  // Remove focus after drop
  const handleInputBlur = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    console.log(rejectedFiles);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, inputRef } =
    useDropzone({
      validator: nameLengthValidator,
      accept: {
        'application/pdf': ['.pdf'],
      },
      multiple: true,
      onDropAccepted: (acceptedFiles: File[]) => {
        onDropAccepted(acceptedFiles);
        handleInputBlur();
      },
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

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
      ...(isHovered ? hoveredStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject, isHovered]
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

      const metadata = await getPdfMetadata(file);

      sendDataToBackend(text, wordCount, metadata);
    }
  };

  return (
    <section className="flex-grow">
      <div className="overflow-hidden rounded-md border border-solid border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
          <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="ml-4 mt-2">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Add files to your knowledge base
              </h3>
            </div>
          </div>
        </div>
        <div className="p-6 pb-0">
          <div
            {...getRootProps({
              style,
              onMouseEnter: handleMouseEnter,
              onMouseLeave: handleMouseLeave,
            })}
            onDragOver={handleMouseEnter}
            onDragLeave={handleMouseLeave}
          >
            <input {...getInputProps()} />
            <p>Click to select files, or drag & drop</p>
            <em>(Currently support PDF files under 4MBs; file names under 20 characters)</em>
          </div>
        </div>
        <aside>
          <div className="p-6 pt-0">
            <div className="my-6 flow-root">
              <ul role="list" className="max-h-52 divide-y divide-gray-200 overflow-auto">
                {myFiles.map((file) => (
                  <li key={file.name} className="py-4 px-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="truncate text-sm text-gray-500">{file.size} bytes</p>
                      </div>
                      <div>
                        <button
                          onClick={removeFile(file)}
                          type="button"
                          className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={removeAll}
                type="button"
                className={clsx(
                  'flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0',
                  {
                    'cursor-not-allowed opacity-50': isLoading || myFiles.length === 0,
                  }
                )}
                disabled={isLoading || myFiles.length === 0}
              >
                Remove all
              </button>
              <Button
                intent="solidIndigo"
                className={clsx('rounded-md', {
                  'cursor-not-allowed opacity-50': isLoading || myFiles.length === 0,
                })}
                onClick={handleSubmit}
                disabled={isLoading || myFiles.length === 0}
              >
                Upload
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
