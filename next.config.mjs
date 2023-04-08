// @ts-check

import nextMdx from '@next/mdx';

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));

/** @type {import("next").NextConfig} */
const withMDX = nextMdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const config = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: '*',
      },
      // TODO {
      //   hostname: 'lh3.googleusercontent.com',
      // },
      // {
      //   hostname: 'cdn.discordapp.com',
      // },
    ],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    config.experiments = { ...config.experiments, topLevelAwait: true };

    return config;
  },
};
export default withMDX(config);
