/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'oaidalleapiprodscus.blob.core.windows.net', // OpenAI DALL-E image domain
      'upload.wikimedia.org',
      'images.unsplash.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
