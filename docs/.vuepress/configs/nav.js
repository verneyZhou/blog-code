module.exports = [
    { text: '首页', link: '/' },
    { text: '前端', 
        items: [
            {text: 'html', link: '/fontend/html/'},
            {text: 'css', link: '/fontend/css/'},
            {text: 'js', link: '/fontend/js/'},
            {text: '小程序', link: '/fontend/wechat/'},
            {text: 'H5', link: '/fontend/h5/'},
            {text: 'PC&后台', link: '/fontend/pc/'},
        ]
    },
    { text: '工具', 
        items: [
            {text: '开发', 
            items: [
                {text: 'vscode', link: '/tool/vscode/'},
                {text: 'node', link: '/tool/node/'}
            ]
            },
            {text: '文档', 
            items: [
                {text: '笔记', link: '/tool/note/'},
                {text: '整理', link: 'fontend/note/'}
            ]
            },
        ]
    },
    { text: '面试', link: '/interview/' },
    { text: '关于', link: '/about/' },
    { text: 'Github', link: 'https://github.com/verneyZhou' },
]