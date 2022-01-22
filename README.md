


## 主题

[ vuepress-theme-vdoing](https://doc.xugaoyi.com/)



## 运行及部署

- 本地运行
npm run dev:hot

- 上线：
    - 方式1：上线到`verneyZhou.github.io`，对应线上域名：`http://docs.verneyzhou-code.cn/`
    1. 先提交代码至github
    2. 再上线：`npm run deploy`

    - 方式2：推送到我的阿里云服务器`https://www.verneyzhou-code.cn/blog/`
    1. 先在 `config.js` 修改` base: '/blog/'`, 再提交代码至github
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
