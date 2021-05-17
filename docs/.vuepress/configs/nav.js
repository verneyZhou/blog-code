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
    {
        text: '进阶',
        items: [
            {
                text: '技术栈',
                items: [
                    {text: 'vue', link: '/skills/vue/'},
                    {text: 'webpack', link: '/skills/webpack/'},
                    {text: 'node', link: '/skills/node/'},
                    {text: 'react', link: '/skills/react/'},
                ]
            },
            {
                text: '提升',
                items: [
                    { text: '源码学习', link: '/code/' },
                    { text: '更多', link: '/more/' },
                ]
            }
        ]
    },
    { text: '其他', link: '/tool/'},
    { text: 'Github', link: 'https://github.com/verneyZhou'},
    { text: '关于', link: '/about/' },
]