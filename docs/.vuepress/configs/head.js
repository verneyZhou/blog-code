

module.exports = [
    ['link', { rel: 'icon', href: `/icons/favicon.ico` }], // 在public文件夹中查找
    //增加manifest.json
    ['link', { rel: 'manifest', href: '/js/mainfest.json' }],
    [
        "meta", // 移动端禁止用户缩放
        {
            name: "viewport",
            content:
            "width=device-width,width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        }
    ],
    ["link", { rel: "stylesheet", href: "/css/style.css" }], // // 这种方式也可以覆盖默认样式，相当于是行内样式
    ["script", { charset: "utf-8", src: "/js/disable-user-zoom.js" }] // 移动端,禁止用户缩放,引入你写的js
]