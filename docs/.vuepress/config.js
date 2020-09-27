


const nav = require('./configs/nav');
const sidebar = require('./configs/sidebar');
const plugins = require('./configs/plugin');
const head = require('./configs/head');


module.exports = {
    title: '阿沐的博客',
    description: '这是阿沐的博客哦~',
    head,
    themeConfig: {
        sidebar: 'auto',
        displayAllHeaders: true, // 默认值：false
        nav: nav
    },
    plugins: plugins
}