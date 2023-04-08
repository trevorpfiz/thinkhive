import Image from 'next/image';

function CustomImage({ src, alt }: { src?: string; alt?: string }) {
  return (
    <div className="w-[10rem] p-10 mx-auto">
      <Image src={src || ''} alt={alt || 'image'} fill />
    </div>
  );
}
export default CustomImage;
