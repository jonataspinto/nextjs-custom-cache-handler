import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheHandler: require.resolve("./cache-handler.js"),
};

export default nextConfig;
