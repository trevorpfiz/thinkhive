export default function MetaDescription({ value }: { value: string }) {
  return (
    <>
      <meta key="description" name="description" content={value} />
      <meta property="og:description" content={value} />
    </>
  );
}
