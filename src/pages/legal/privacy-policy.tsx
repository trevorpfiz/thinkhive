import Head from 'next/head';

import Meta from '@/components/seo/Meta';
import MetaDescription from '@/components/seo/MetaDescription';

function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Police - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
        knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div>
        <iframe
          title="Termly Privacy Policy"
          src="https://app.termly.io/embed/privacy-policy/f7b7ce7d-ed9b-4fc0-802c-1ae5fcbde7a1"
          style={{ width: '100%', height: '100vh', border: 'none' }}
        ></iframe>
      </div>
    </>
  );
}

export default PrivacyPolicy;
