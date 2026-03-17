


## 主题

[vuepress-theme-vdoing](https://doc.xugaoyi.com/)



## 运行及部署

- 本地运行
npm run dev

### 上线：

- 方式1：上线到`verneyZhou.github.io`，对应线上域名：`http://docs.verneyzhou-code.cn/`
1. 先提交代码至github
2. 再上线：`npm run deploy`

- 方式2：jenkins部署到我的阿里云服务器`https://www.verneyzhou-code.cn/blog/`
<!-- 1. 先在 `config.js` 修改` base: '/blog/'`, 再提交代码至github
> 注意：如果是用方式1上线，则需注释掉~
2. `ssh root@verney-zhou`，终端连接远程阿里云服务器
3. 然后`cd /vue-blog`，执行上线脚本：`./update-blog.sh` -->

1. 先在 `config.js` 修改` base: '/blog/'`
2. `npm run aliyun` 本地打包
> 这里本地打包是因为我的jenkins服务器可能内存不够，每次在服务器上打包都会崩...

3. 然后push上去之后，jenkins会自动部署~~~~



- 方式3：docker自动部署到服务器



- 优化点：
    1. 评论系统
    2. 点击图片预览


- 常见问题：
    1. 执行`shell`脚本提示：
    ``` js
    ./blog-update.sh: 行 21:  2873 已杀死               npm run build
    ```
    > 自动化执行脚本的时候，服务器cpu占用太多，达到90%以上~



## 报错记录

- `npm run build`报错：
```
error Error rendering /tool/vscode-plugin.html: false
undefined
error Error rendering /tool/interview.html: false
undefined
error Error rendering /tool/vscode.html: false
undefined
ReferenceError: canonicalLink is not defined
```
> vuepress版本过低，升级到`v1.8.0`以上即可~



## TODO

- css整理
- js
- vue
- webpack原理
- 移动端调试

1. proxy
2. chrome-devtool
3. css3
4. h5调试及常见问题
5. 算法
6. web性能优化

## 国庆学习计划
1. chrome dectools技巧
2. vue3+ts项目实战
3. vue原理学习





## TODO
### 2022.07 todo
- 梳理前端自动生成助记词，公私钥逻辑；本地储存是否安全？
    - web3笔记梳理
- 公众号

- h5开发调试，ios兼容性问题记录
- whistle, 代理的原理
- 翻墙
- nginx,ftp, 部署原理
- web3项目开发总结
    - metamask钱包使用
- 考研，买房



### 2022.08 todo

- nginx梳理, caddy熟悉
- 实践：Vue + Node.js 自动化
- Vue 组件库开发
- 《vue.js设计与实践》学习

- 工作相关
    - vue3，vite开发总结，ts使用复习，vite项目打包配置总结，vue3实践ppt
        - vue3组合式api的高级写法，router4跟3有什么不同，vuex4跟3有什么不同
    - nginx,ftp, 部署原理; 
        > 互爱町部署原理，为什么有时静态资源部署失败？
        > infratructure打包部署原理？
    - whistle, 代理的原理

- h5开发调试，ios兼容性问题记录
    > whistle: Weinre
- 翻墙
- vscode插件
- 代码规范，eslint规范，git commit规范
- 前端监控


### 2022.09 todo

- 微前端服务
- 工程化
- chrome插件




### 2023 TODO

- 组件库封装
- 低代码
- 微前端
- 前端监控
- 自动化部署


#### 2023春节

- 前端监控（互爱町）
- 智能合约低代码部署，合约方法可视化
    文件的上传与下载
    shell
    自动化部署（husky,githook）



#### 2023.02 todo

- chrome devtools
- 移动端调试整理
- 并发请求数量控制




#### 2023.03 todo


- 组件、插件开发
- vue3原理
- 虚拟列表
- 有道云笔记整理
- 自动化部署（husky,githook）
- farcaster协议去中心化社区
- 瀑布流布局
- 公众号添加ChatGPT



#### 2023.04 todo

- 性能优化
- 微前端
- 前端监控
- 低代码
- Docker
- Web Worker
- react v15 v16 v17 v18 区别


#### 2023.05 todo

- Web Component
- vue3: compositionAPI




### 2023技能GET

- 插件封装：瀑布流，虚拟滚动
- 自研组件库: 
    - wx呼端，新手引导，toast，dialog
    - vitepress搭建组件门户网站

- 低代码
- react
- ci/cd jenkins docker  DevOps
- ai: 数据报表查询
- 脚手架: 搭建一个vite+vue3项目的脚手架


### 2024TODO

- 低码后台管理系统：CRUD
- 小程序：
    - boss包围（社交小游戏）
    - 小工具（投票）
        - 文件上传/下载/转换 
- 监控分析平台
- 微前端
- 工具库：
    - 虚拟列表
- vue3搭建项目
- ssr渲染
- 在线编辑器
- 其他
    - websocket通信
    - three.js 动画



<!--  -->


## 2026.02春节 TODO

- 低码梳理
    - 架构设计，搭建，开发，部署，监控
    - 版本控制
    - 常见问题
- 性能优化梳理
    - 安全攻击
    - FCP等性能指标统计
    - 缩短首屏加载时间：先统计，分析数据，拆包，按需加载，缓存静态资源...
- 跨端（taro）：小程序，H5，PC端
- next.js学习
- 组件库
    - 版本管理？
- 自有code项目复习
- 博客复习
    - 项目中做过什么降本增效、对部门有增益的工作？
        - 搭建低代码平台，固化 CRUD 模板、表单校验、权限与数据源接入；把常用组件规范化并开放业务自助配置。
        - 性能优化，首页加载时间缩短；拆分首屏包、按需加载组件；接口批量合并与缓存；引入服务端压缩与 CDN。首屏时间从 4.5s 降到 1.8s；接口 QPS 降低 40%；减少服务器扩容预算。
        - 建立统一前端基建（脚手架、组件规范、Lint+CI、自动化测试），封装统一业务组件库。
        - 实现发布流水线、灰度发布、版本回滚机制；发布产物版本化存储。发布风险显著降低，线上问题平均恢复时间从 1 小时降到 10 分钟以内。
        - 搭建前端监控平台，统一异常采集、性能指标、关键链路告警。
    - 国际化多语言支持怎么进行技术架构设计？
- AI课程
    - Coze搭建，dify：搭建AI漫剧agent
    - RAG, agent：实战项目
    - 小滴ai资料
    - 笔记梳理
    - 实操langchain/llamaIndex（跟着官方文档搭建对轮对话与工具调用功能，源码了解）
    - 创建自己的编程agent和Skill
    - iphone翻墙，AI开发app
- 公共课与讲义合集.txt
- 多人表达
- 运动
- 看书
- AI漫剧
- 买房流程
    - 公积金贷款、转移
    - 新房、二手房分布情况










