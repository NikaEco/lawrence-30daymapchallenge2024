import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // for DuckDB to work in NextJS API: https://github.com/vercel/next.js/discussions/49709#discussioncomment-10838215
    serverExternalPackages: ["duckdb", "duckdb-async"],
};

export default nextConfig;
