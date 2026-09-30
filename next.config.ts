import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  cacheHandler: require.resolve("./cache-handler.js"),
  cacheMaxMemorySize: 0,
};

export default nextConfig;
