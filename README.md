
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