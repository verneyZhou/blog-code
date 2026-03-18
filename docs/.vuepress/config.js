



const plugins = require('./configs/plugin');
const head = require('./configs/head');
const markdown = require('./configs/markdown');
const themeConfig = require('./configs/themeConfig');

const path = require('path');


module.exports = {
    // base: '/blog/', // 如果部署到阿里云服务器需要添加这个
    port: 8097,
    title: '四零肆',
    description: '这是四零肆的前端技术博客哦~',
    // 关闭默认 prefetch ：禁用 VuePress 对异步 chunk 的 prefetch ，减少首屏后“抢网式”预取；站点页面较多时，默认的 prefetch 可能导致首屏后产生大量无意义的请求
    shouldPrefetch: () => false,
    head,
    lastUpdated: true, // 显示更新时间,设置true，开启最后更新时间
    theme: 'vdoing', // 主题插件：vuepress-theme-vdoing
    themeConfig,
    markdown,
    alias: {
        'styles': path.resolve(__dirname, './styles'),
        'images': path.resolve(__dirname, './images')
    },
    plugins: plugins
}
