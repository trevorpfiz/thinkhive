import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ClipboardIcon } from '@heroicons/react/24/outline';

export default function CodeSnippet() {
  const router = useRouter();
  const expertId = router.query.expertId as string;

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const code = `<script
  async
  src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-expert@latest/index.min.js"
  data-expertId="${expertId}"
></script>`;

  return (
    <div className="relative">
      <pre
        className="cursor-pointer overflow-auto rounded bg-gray-100 p-4 text-gray-700"
        onClick={handleCopy}
      >
        <CopyToClipboard text={code} onCopy={() => setIsCopied(true)}>
          <code>{code}</code>
        </CopyToClipboard>
        {isCopied ? (
          <span className="absolute top-0 right-0 rounded bg-indigo-500 px-2 py-1 text-sm text-white">
            Copied!
          </span>
        ) : (
          <span className="absolute top-0 right-0 px-2 py-2">
            <ClipboardIcon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </pre>
    </div>
  );
}
