



const plugins = require('./configs/plugin');
const head = require('./configs/head');
const markdown = require('./configs/markdown');
const themeConfig = require('./configs/themeConfig');

const path = require('path');


module.exports = {
    base: '/blog/', // 如果部署到阿里云服务器需要添加这个
    title: '一苇',
    description: '这是阿沐的博客哦~',
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