
module.exports = [
    '@vuepress/back-to-top', // 返回到到顶部插件
    '@vuepress/nprogress', // 进度条
    'reading-progress', // 阅读进度插件
    'vuepress-plugin-smooth-scroll', // 你的 VuePress 站点中使用平滑滚动
    'flowchart', // 流程图
    [
      '@vuepress/medium-zoom',
      {
        selector: 'img.zoom-custom-imgs',
        // medium-zoom options here
        // See: https://github.com/francoischalifour/medium-zoom#options
        options: {
          margin: 16,
          bgColor: 'rgba(0,0,0,0.6)'
        }
      }
    ],
    [
        '@vuepress/pwa', // pwa
        {
           serviceWorker: true,
           updatePopup: true
        }
    ],
    [
        'vuepress-plugin-comment', // 评论系统
        {
          choosen: 'valine',
          // options选项中的所有参数，会传给Valine的配置
          // https://leancloud.cn/dashboard/app.html?appid=IGEu2AqUJHlRFqJOoG9nvkbq-gzGzoHsz#/key
          options: {
            el: '#valine-vuepress-comment',
            appId: 'IGEu2AqUJHlRFqJOoG9nvkbq-gzGzoHsz',
            appKey: 'Eo2mcmVrgCbKURVS6KP58ywG'
          }
        }
    ],
    ['one-click-copy', { // 代码块复制按钮
      copySelector: ['div[class*="language-"] pre', 'div[class*="aside-code"] aside'], // String or Array
      copyMessage: '复制成功', // default is 'Copy successfully and then paste it for use.'
      duration: 1000, // prompt message display time.
      showInMobile: false // whether to display on the mobile side, default: false.
  }],
]