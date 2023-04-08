import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

function Demo() {
  return (
    <div className="mx-auto my-16 flex max-w-7xl flex-col items-center justify-center gap-16 lg:my-32">
      <div className="flex flex-col items-center justify-center gap-3">
        <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl md:text-5xl">
          ThinkHive Demo
        </h2>
      </div>

      <div className="w-full">
        <ReactPlayer
          url="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"
          controls={true}
          playing={true}
          muted={true}
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}

export default Demo;
