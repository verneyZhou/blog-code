module.exports = [
    { text: '首页', link: '/' },
    { text: '前端', 
        items: [
            {text: 'html', link: '/frontend/html/'},
            {text: 'css', link: '/frontend/css/'},
            {text: '小程序', link: '/frontend/wechat/'},
            {text: 'H5', link: '/frontend/h5/'},
            {text: 'PC&后台', link: '/frontend/pc/'},
        ]
    },
    { text: 'JavaScript', link: '/frontend/js/' },
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
                {text: '整理', link: 'frontend/note/'}
            ]
            },
        ]
    },
    { text: '面试', link: '/interview/' },
    { text: '源码',
        items: [
            {text: 'vuex源码分析', link: '/code/vuex/'}
        ]
    },
    { text: 'Github', link: 'https://github.com/verneyZhou' },
    { text: '关于', link: '/about/' },
]