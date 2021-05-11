
module.exports = {
    '/tool/http/': getHttpSidebar('《透视HTTP协议》学习笔记', '介绍'),
}

  function getHttpSidebar (groupA, introductionA) {
    return [
      {
        title: groupA,
        collapsable: false,
        sidebarDepth: 2,
        children: [
        //   {
        //     title: introductionA,
        //     children: ['']
        //   },
        //   {
        //     title: 'HTTP的前世今生',
        //     children: ['start'],
        //   },
        //   {
        //     title: '什么是HTTP',
        //     children: ['what'],
        //   },
        //   {
        //     title: 'HTTP概览',
        //     children: ['intro'],
        //   },
        //   {
        //     title: 'HTTP详解',
        //     children: ['detail'],
        //   },
        //   {
        //     title: 'HTTPS',
        //     children: ['https'],
        //   },
        //   {
        //     title: 'HTTP进阶',
        //     children: ['pro'],
        //   },
          ['', introductionA],
          'start',
          'what',
          'intro',
          'detail',
          'https',
          'pro'
        ]
      }
    ]
  }