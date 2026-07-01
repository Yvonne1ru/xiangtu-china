/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind CSS v4 的官方 PostCSS 插件
    "@tailwindcss/postcss": {},
    
    // 可选：如果你需要自动添加浏览器厂商前缀 (如 -webkit-)，可以取消下面这行的注释
    // 注意：需要先运行 npm install autoprefixer
    // "autoprefixer": {},
  },
};

export default config;