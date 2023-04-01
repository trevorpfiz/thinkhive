/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useMemo, useState } from 'react';
import { type FileRejection, useDropzone } from 'react-dropzone';
import type * as CSS from 'csstype';
import { IconPdf } from '@tabler/icons-react';
import clsx from 'clsx';
import { Card, Flex, Text, ProgressBar } from '@tremor/react';

import { api } from '@/utils/api';
import convertPdfToText from '@/utils/pdf/convert-pdf';
import { getPdfMetadata, type PdfMetadata } from '@/utils/pdf/metadata';
import Button from '../ui/Button';
import Notification from '../ui/Notification';
import useNotification from '@/hooks/useNotification';

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

const maxFileSize = 10 * 1024 * 1024; // 4 MB
const maxLength = 255;

function fileValidator(file: File) {
  // check file size under 10MB
  if (file.size > maxFileSize) {
    return {
      code: 'file-too-large',
      message: `File size is larger than ${maxFileSize / (1024 * 1024)} MB`,
    };
  }
  // check file name length under 255 characters
  if (file.name.length > maxLength) {
    return {
      code: 'name-too-large',
      message: `File name is longer than ${maxLength} characters`,
    };
  }

  return null;
}

export default function FileDropzone() {
  const { isLoading: isLoadingCredits, data: credits, error } = api.user.getUserCredits.useQuery();
  const utils = api.useContext();

  const { mutate, isLoading } = api.upload.uploadText.useMutation({
    onSuccess() {
      // Refetch the query after a successful delete
      void utils.metadata.getMetadata.invalidate();
      // show success notification
      showSuccessNotification('Files uploaded successfully');
    },
    onError: (error) => {
      // show error notification
      showErrorNotification('Failed to upload files', error.message);
    },
  });

  // notifications
  const { notification, showSuccessNotification, showErrorNotification, showLoadingNotification } =
    useNotification();

  const [myFiles, setMyFiles] = useState<File[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [fileTexts, setFileTexts] = useState<Record<string, string>>({});
  const [fileMetadata, setFileMetadata] = useState<Record<string, PdfMetadata>>({});
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({});
  const totalWordCount = useMemo(() => {
    return Object.values(wordCounts).reduce((sum, wc) => sum + wc, 0);
  }, [wordCounts]);
  // calculate the percentage of credits used
  const creditPercentage = useMemo(() => {
    if (!credits) return 0;
    const creditsUsed = totalWordCount / 5 / 1000;
    const creditsAfter = credits - creditsUsed;
    const percentage = ((creditsAfter - credits) / credits) * 100;
    return parseFloat(percentage.toFixed(2));
  }, [credits, totalWordCount]);

  const creditsUsed = useMemo(() => {
    return parseFloat((totalWordCount / 5 / 1000).toFixed(2));
  }, [totalWordCount]);

  // TODO - add a notification for file calcs
  const onDropAccepted = useCallback(
    async (acceptedFiles: File[]) => {
      const updatedFiles = [...myFiles];
      const updatedWordCounts = { ...wordCounts };
      const updatedFileTexts = { ...fileTexts };
      const updatedFileMetadata = { ...fileMetadata };
      showLoadingNotification('Staging files...');
      for (const newFile of acceptedFiles) {
        // Check if the file already exists in the list of selected files
        const fileExists = updatedFiles.some(
          (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
        );
        if (!fileExists) {
          updatedFiles.push(newFile);
          const { text, wordCount } = await convertPdfToText(newFile);
          const metadata = await getPdfMetadata(newFile);
          updatedWordCounts[newFile.name] = wordCount;
          updatedFileTexts[newFile.name] = text;
          updatedFileMetadata[newFile.name] = metadata;
        } else {
          console.log(`File ${newFile.name} already exists`);
        }
      }
      showSuccessNotification('Files staged for upload');
      setMyFiles(updatedFiles);
      setWordCounts(updatedWordCounts);
      setFileTexts(updatedFileTexts);
      setFileMetadata(updatedFileMetadata);
    },
    [myFiles, wordCounts, fileTexts, fileMetadata, showLoadingNotification, showSuccessNotification]
  );

  // Remove focus after drop
  const handleInputBlur = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      showErrorNotification(
        'Error Attaching Brain',
        fileRejections[0]?.errors[0]?.message || 'File rejected'
      );
    },
    [showErrorNotification]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, inputRef } =
    useDropzone({
      validator: fileValidator,
      accept: {
        'application/pdf': ['.pdf'],
      },
      multiple: true,
      onDropAccepted: (acceptedFiles: File[]) => {
        void onDropAccepted(acceptedFiles);
        handleInputBlur();
      },
      onDropRejected,
    });

  const removeFile = (file: File) => () => {
    const newFiles = [...myFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setMyFiles(newFiles);

    const newWordCounts = { ...wordCounts };
    delete newWordCounts[file.name];
    setWordCounts(newWordCounts);

    const newFileTexts = { ...fileTexts };
    delete newFileTexts[file.name];
    setFileTexts(newFileTexts);

    const newFileMetadata = { ...fileMetadata };
    delete newFileMetadata[file.name];
    setFileMetadata(newFileMetadata);
  };

  const removeAll = () => {
    setMyFiles([]);
    setWordCounts({});
    setFileTexts({});
    setFileMetadata({});
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

  const handleSubmit = () => {
    if (myFiles.length === 0) {
      console.log('no files selected');
      return;
    }

    showLoadingNotification('Uploading files...');
    setMyFiles([]);

    for (const file of myFiles) {
      const text = fileTexts[file.name] as string;
      const wordCount = wordCounts[file.name] as number;
      const metadata = fileMetadata[file.name] as PdfMetadata;

      sendDataToBackend(text, wordCount, metadata);
    }
  };

  return (
    <>
      {notification.show && (
        <Notification
          intent={notification.intent}
          message={notification.message}
          description={notification.description}
          show={notification.show}
          onClose={notification.onClose}
          timeout={notification.timeout}
        />
      )}
      <section className="flex-grow">
        <div className="overflow-hidden rounded-md bg-white shadow">
          <div className="bg-white px-4 pt-5 pb-1 sm:px-6">
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
              <em>(Currently support PDF files under 4MBs)</em>
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
                          <div className="flex items-center space-x-2">
                            <IconPdf color="red" size={24} />
                            <div>
                              <p className="max-w-[140px] truncate text-sm font-medium text-gray-900 sm:max-w-xs ">
                                {file.name}
                              </p>
                              <p className="truncate text-sm text-gray-500">
                                {wordCounts[file.name]} words
                              </p>
                            </div>
                          </div>
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
              <div className="flex flex-wrap justify-between">
                <Card className="max-w-sm shadow-none">
                  <Flex className="w-full items-center justify-between">
                    <Text className="w-full">{credits} Credits</Text>
                    <Flex className="justify-end space-x-1">
                      <Text>{creditsUsed * -1} Credits</Text>
                      <Text>({creditPercentage}%)</Text>
                    </Flex>
                  </Flex>
                  <ProgressBar
                    percentageValue={Math.abs(creditPercentage)}
                    color="gray"
                    className="mt-3"
                  />
                </Card>
                <div className="flex items-end justify-end gap-4">
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
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
