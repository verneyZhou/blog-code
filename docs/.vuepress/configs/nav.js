module.exports = [
    { text: '最新', link: '/newest/' },
    { text: '笔记', 
        items: [
            { text: 'JS', link: '/frontend/js/'},
            { text: 'HTML', link: '/frontend/html/' },
            { text: 'CSS', link: '/frontend/css/'},
        ]
    },
    
    { text: '项目',
        items: [
            {
                text: 'PC端',
                items: [
                    {text: 'vue-node-admin', link: '/project/vue-node-admin/'},
                ]
            },
            {
                text: '移动端',
                items: [
                    {text: '微信h5', link: '/project/mobile-h5/'},
                    {text: '微信小程序', link: '/project/mini-program/'},
                ]
            }
            
            
        ]
    },
    { text: '源码', link: '/code/' },
    { text: '其他', link: '/tool/'},
    { text: '关于', link: '/about/' },
]