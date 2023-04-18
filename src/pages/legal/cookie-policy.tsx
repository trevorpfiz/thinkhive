import Head from 'next/head';
import Meta from '~/components/seo/Meta';
import MetaDescription from '~/components/seo/MetaDescription';

function CookiePolicy() {
  return (
    <>
      <Head>
        <title>Cookie Policy - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
        knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div>
        <iframe
          title="Termly Cookie Policy"
          src="https://app.termly.io/embed/cookie-policy/1da840d7-bfa8-42dd-beb6-031fdf4366bf"
          style={{ width: '100%', height: '100vh', border: 'none' }}
        ></iframe>
      </div>
    </>
  );
}

export default CookiePolicy;
