
const nav = require('./nav'); // 导航
const sidebar = require('./sidebar'); // 侧边栏

module.exports = {
    // logo: "../public/images/logo.jpg", // 左上角logo
    // repo: 'itclanCode/blogcode', // 链接的仓库
    // repoLabel: 'GitHub', // 链接的名称
    // docsDir: 'docs',
    sidebar: 'auto',
    // sidebar,
    displayAllHeaders: false, // 默认值：false
    nav: nav,
    sidebarDepth: 2, // 侧边栏显示深度，默认1，最大2（显示到h3标题）
    logo: '/icons/apple-touch-icon.png', // 导航栏logo
    // repo: 'verneyzhou', // 导航栏右侧生成Github链接
    searchMaxSuggestions: 10, // 搜索结果显示最大数
    lastUpdated: '上次更新', // 更新的时间，及前缀文字   string | boolean (取值为git提交时间)
    // docsDir: 'docs', // 编辑的文件夹
    // editLinks: true, // 启用编辑
    // editLinkText: '编辑',

    // 以下配置是Vdoing主题改动的和新增的配置
    category: true, // 是否打开分类功能，默认true。 如打开，会做的事情有：1. 自动生成的frontmatter包含分类字段 2.页面中显示与分类相关的信息和模块 3.自动生成分类页面（在@pages文件夹）。如关闭，则反之。
    tag: true, // 是否打开标签功能，默认true。 如打开，会做的事情有：1. 自动生成的frontmatter包含标签字段 2.页面中显示与标签相关的信息和模块 3.自动生成标签页面（在@pages文件夹）。如关闭，则反之。
    archive: true, // 是否打开归档功能，默认true。 如打开，会做的事情有：1.自动生成归档页面（在@pages文件夹）。如关闭，则反之。
    // categoryText: '随笔', // 碎片化文章（_posts文件夹的文章）预设生成的分类值，默认'随笔'
    // bodyBgImg: [
    //   'images/poster01.jpeg',
    //   'images/poster02.jpeg'
    // ], // body背景大图，默认无。 单张图片 String || 多张图片 Array, 多张图片时每隔15秒换一张。
    titleBadge: true, // 文章标题前的图标是否显示，默认true
    // titleBadgeIcons: [ // 文章标题前图标的地址，默认主题内置图标
    //     '/img/dragon/1.png',
    //     '/img/dragon/2.png',
    // ],
    // sidebar: 'structuring', // 'structuring' | { mode: 'structuring', collapsable: Boolean} | 'auto' | 自定义
    sidebarOpen: false, // 初始状态是否打开侧边栏，默认true
    updateBar: { // 最近更新栏
      showToArticle: true, // 显示到文章页底部，默认true
      moreArticle: '/archives' // “更多文章”跳转的页面，默认'/archives'
    },
    author: { // 文章默认的作者信息，可在md文件中单独配置此信息 String | {name: String, link: String}
        name: '阿沐', // 必需
        // link: 'https://github.com/verneyZhou/' // 可选的
    },
    blogger: { // 博主信息，显示在首页侧边栏
        avatar: 'images/poster03.jpeg',
        // name: '阿沐',
        slogan: '是旷野，不是轨道。'
    },
    social: { // 社交图标，显示于博主信息栏和页脚栏
        // iconfontCssFile: '//at.alicdn.com/t/font_1879460_0lacnxoigx9.css', // 可选，阿里图标库在线css文件地址，对于主题没有的图标可自由添加
        // icons: [
        //     {
        //         iconClass: 'icon-github',
        //         title: 'Star我',
        //         link: 'https://github.com/verneyZhou'
        //     },

            // {
            //     iconClass: 'icon-erji',
            //     title: '有品位的歌单',
            //     link: 'http://music.163.com/playlist?id=8444337'
            // }
        // ]
    },
    footer: { // 页脚信息
        createYear: 2021, // 博客创建年份
        copyrightInfo: '一苇 | <a href="https://beian.miit.gov.cn/" target="_blank" style="font-weight:normal"><img src="/blog/images/icp.png" width="20" height="20" alt="公网备案"/>京ICP备2021006935号-2</a> ', // 博客版权信息，支持a标签
    }
}