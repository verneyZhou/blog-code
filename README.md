


## 主题

[ vuepress-theme-vdoing](https://doc.xugaoyi.com/)



## 运行及部署

- 本地运行
npm run dev

- 上线：
    - 方式1：上线到`verneyZhou.github.io`，对应线上域名：`http://docs.verneyzhou-code.cn/`
    1. 先提交代码至github
    2. 再上线：`npm run deploy`

    - 方式2：推送到我的阿里云服务器`https://www.verneyzhou-code.cn/blog/`
    1. 先在 `config.js` 修改` base: '/blog/'`, 再提交代码至github
    > 注意：如果是用方式1上线，则需注释掉~
    2. `ssh root@verney-zhou`，终端连接远程阿里云服务器
    3. 然后`cd /vue-blog`，执行上线脚本：`./update-blog.sh`




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
