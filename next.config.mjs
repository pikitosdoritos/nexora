/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fonts are loaded at runtime via <link>; don't fetch them at build time
  // so the project builds cleanly offline.
  optimizeFonts: false,
};
export default nextConfig;
