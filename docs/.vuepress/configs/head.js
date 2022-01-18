

module.exports = [
    ['link', { rel: 'icon', href: `/icons/favicon.ico` }], // 在public文件夹中查找
    //增加manifest.json
    ['link', { rel: 'manifest', href: '/js/mainfest.json' }],
    ['meta', { name: 'Author', content: '一苇' }],
    [
        'meta',
        {
          rel: 'keywords',
          content:
            'verneyzhou,阿沐,一苇,前端,docs.verneyzhou-code.cn,博客,fe,IT,技术',
        },
    ],
    [
        'meta',
        { 'http-equiv': 'Content-Type', content: 'text/html', charset: 'UTF-8' },
    ],
    [
        "meta", // 移动端禁止用户缩放
        {
            name: "viewport",
            content:
            "width=device-width,width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        }
    ],
    ["link", { rel: "stylesheet", href: "/styles/css/style.css" }], // // 这种方式也可以覆盖默认样式，相当于是行内样式
    ["script", { type: "utf-8", src: "/js/disable-user-zoom.js" }], // 移动端,禁止用户缩放,引入你写的js
    ["script", { charset: "utf-8", src: "/js/wx.js" }],
]