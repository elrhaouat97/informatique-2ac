import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "informatique-2ac-15-seances";
const githubBasePath = process.env.GITHUB_ACTIONS === "true" ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: githubBasePath,
  assetPrefix: githubBasePath,
  env: { NEXT_PUBLIC_COURSE_BASE_PATH: githubBasePath },
  images: { unoptimized: true },
};

export default nextConfig;
