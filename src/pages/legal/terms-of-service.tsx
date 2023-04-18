import Head from 'next/head';
import Meta from '~/components/seo/Meta';
import MetaDescription from '~/components/seo/MetaDescription';

function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
        knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div>
        <iframe
          title="Termly Terms and Conditions"
          src="https://app.termly.io/embed/terms-and-conditions/183699fa-a057-4dfe-a345-75b22cd2b3bf"
          style={{ width: '100%', height: '100vh', border: 'none' }}
        ></iframe>
      </div>
    </>
  );
}

export default TermsPage;
