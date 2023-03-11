import Image, { type ImageProps } from 'next/image';

import thinkhivelogo from '@/images/logos/ThinkHive-logo-black.png';

interface LogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  src?: string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = (props) => (
  <Image src={thinkhivelogo} alt="ThinkHive logo" priority {...props} />
);

export default Logo;
