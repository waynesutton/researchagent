/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure Convex to work with Next.js
  transpilePackages: ["convex"],
};

export default nextConfig;
