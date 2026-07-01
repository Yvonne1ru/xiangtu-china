import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',           // 纯静态导出 (生成 out 文件夹)
  trailingSlash: true,        // 为每个路由生成 index.html，完美适配静态服务器
  images: {
    unoptimized: true,        // 禁用图片优化 (静态环境必须)
  },
};

export default nextConfig;

