const mediaUrl = new URL(process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:3001/media');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Rich-text content can carry pasted images inline, which easily exceeds the 1 MB default.
    serverActions: { bodySizeLimit: '25mb' },
  },
  images: {
    // next/image defaults to 75% quality when a component doesn't set its own;
    // this makes the closest (only) allowed value 100 instead, site-wide.
    qualities: [100],
    remotePatterns: [
      {
        protocol: mediaUrl.protocol.replace(':', ''),
        hostname: mediaUrl.hostname,
        port: mediaUrl.port,
        pathname: `${mediaUrl.pathname.replace(/\/$/, '')}/**`,
      },
    ],
  },
};

module.exports = nextConfig;
