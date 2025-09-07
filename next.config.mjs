/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ build will not fail on ESLint errors
  },
};

export default nextConfig;
