/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    // Ensure the backend URL exists and strip any trailing slashes
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
    const targetUrl = rawUrl.replace(/\/$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${targetUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
