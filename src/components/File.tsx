import * as pdfjsLib from 'pdfjs-dist';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { api } from '@/utils/api';

type FormValues = {
  file: FileList;
};

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function File() {
  const { mutateAsync, isLoading } = api.upload.uploadText.useMutation();

  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data, e) => {
    console.log('submit');
    e?.preventDefault();

    const formData = new FormData();
    const file = data.file?.[0];

    if (file) {
      formData.append('file', file);

      // Read the PDF file and convert to text
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = async () => {
        const pdf = await pdfjsLib.getDocument(fileReader.result).promise;
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(' ');
        console.log(text);
        // Send the text to the backend
        await mutateAsync({ text });
      };
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register('file')} />

        <input type="submit" />
      </form>
    </div>
  );
}
