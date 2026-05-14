


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










