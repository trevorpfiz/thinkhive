import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

function Demo() {
  return (
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
  );
}

export default Demo;
