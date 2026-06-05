import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  async redirects() {
    return [
      // Old single-file Home comp (shared with Brian 5/29) → the multi-file bundle
      {
        source: "/comps/home-full-build.html",
        destination: "/comps/home-full-build/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
