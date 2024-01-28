---
title: Vue+Node实现可视化部署工具
date: 2024-01-21 12:27:01
permalink: false
categories:
  - 部署
tags:
  - node
  - vue
---

# Vue+Node实现可视化部署工具



> 其实前端部署，简单来讲，就是将打包后的文件放在服务器的指定目录上，然后在`nginx`中进行配置，就可以通过指定路由访问到打包后的文件。


- ftp 部署：通过node插件如`ftp`连接服务器，将本地打包后的文件推送到服务器上；

- jenkins 部署：在服务器内搭建jenkins服务，通过配置不同的脚本实现将代码从仓库拉取、打包、部署等操作

- `docker+gitlab` 部署：通过跑ci脚本打包docker镜像，然后再服务器上拉取镜像，创建容器，运行



## vn-node-deploy
> 这里用`vue+node`创建一个可视化的部署工具，目前大致功能如下：

1. 可在页面输入`shell`脚本信息，然后在服务器上执行，并查看执行日志信息；
2. 可上传`.sh`脚本文件到服务器指定目录管理，可执行并查看执行日志信息；
3. 可对服务器上的`nginx`配置文件和`http`证书文件进行管理；
> 以前的ng配置和https证书需要先`ssh`登录服务器，然后进入相应目录下进行修改，现在通过这个工具就可以在页面上进行增删改查；


[项目github地址](https://github.com/verneyZhou/vn-node-deploy)



## pm2
> 该项目使用pm2来进行进程管理~

- `npm install pm2 -g`: 全局安装pm2

- `pm2 list`: 查看启动的node服务列表

- `pm2 log`: 查看node执行日志

- `pm2 stop vndeploy`: 停止id为vndeploy的进程


[Node进程管理工具—pm2](https://blog.csdn.net/qq_38128179/article/details/120401139)


## 启动

首先 `git clone`下来该项目~

> `node v16+`


- `npm install`

- `npm run start`: 启动服务


或

- `npm link`
- `vn-node-deploy start`


该项目开发完毕可打包生成脚手架，方便在其他服务器上使用, 脚手架使用方法如下：

1. `npm install vn-node-deploy -g`
2. `vn-node-deploy start`


启动项目后，默认会开启`8888`端口（端口可配置）：
1. 如果是本地启动，访问：`http://127.0.0.1:8888/`即可访问`client/index.html`页面；
2. 如果是云服务器上启动，访问`http:[ip]:8888/`即可~






## 目录结构

``` json
- bin/      // vn-node-deploy脚手架入口
- client/   // 前端页面
- server/   // node后端核心代码
- index.js  // 入口
- package.json
```



## 前端项目

> 这里因为前端页面比较简单，就一个操作界面，就不像其他前端项目一样采用脚手架工具搭建项目了，这里直接引入cdn构建前端页面~


- 技术栈：`vue3, element-plus, axios, socket.io`

``` html
<!-- client/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vn Node Deploy</title>
    <link rel="stylesheet" href="https://unpkg.com/element-plus@2.5.2/dist/index.css" />
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/element-plus@2.5.2/dist/index.full.js"></script>
    <script src="https://unpkg.com/axios@1.6.5/dist/axios.min.js"></script>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        const {createApp, ref, reactive, toRefs} = Vue;
        createApp({
            setup() {...},
            created() {...},
            mounted() {...},
            methods: {...},
        )}.use(ElementPlus).mount('#app');
    </script>
</body>
</html>
```

所需node包的cdn地址可在这里查询：[unpkg](https://unpkg.com/)



## socket通信
> 这里使用`socket`来进行前后端通信，方便log日志的展示~

- [socket cdn](https://cdn.socket.io/)
- [socket官方文档](https://socket.io/zh-CN/)




## 后端项目


- `server/index.js`:

``` js
const Koa = require("koa");
const KoaStatic = require("koa-static");
const KoaRouter = require("koa-router");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
const path = require("path");
const fs = require("fs");
const runCmd = require("./utils/runCmd");
const logger = require("./utils/logger");

const app = new Koa();
const router = new KoaRouter();

app.use(bodyParser()); // 处理 post 请求参数, 解析请求的参数，解析成功后赋值给 ctx.request.body

// 参数获取
const getArgs = () => {
    let argsInfo = fs.readFileSync("../args.json").toString();
    return JSON.parse(argsInfo) || {};
}
let args = getArgs()

// 集成 session，进行登陆状态的管理
app.keys = [`${args.password}`]; // 'some secret hurr'
const CONFIG = {
  key: "koa:sess"
  ...
};
app.use(session(CONFIG, app)); // 缓存 session

// 开启 socket 服务
let socketList = [];
const server = require("http").Server(app.callback());
const socketIo = require("socket.io")(server);
socketIo.on("connection", (socket) => {
  socketList.push(socket);
  logger.info("a user connected");
});


// 路由
router.post("/login", async (ctx) => {
  let code = 0;
  let msg = "登录成功";
  let { password } = ctx.request.body;
  if (password === `${args.password}`) {
    ctx.session.isLogin = true;
  } else {
    code = -1;
    msg = "密码错误";
  }
  ctx.body = {
    code,
    msg,
  };
});



// 静态资源
// 本启动服务后，访问 http://127.0.0.1:[端口] 即可访问client下的index.html页面
app.use(new KoaStatic(path.resolve(__dirname, "../client")));
// 路由
app.use(router.routes()).use(router.allowedMethods());
// 监听端口
server.listen(args.port, () => logger.info(`服务监听 ${args.port} 端口`));

```


### child_process
> child_process 模块允许打开一个子进程去执行其他任务，该功能使 node 程序可以执行指定的 shell 脚本，可以用于自动化部署、定时任务

- [child_process](https://fe.zuo11.com/node/node-doc.html#child-process)
- [child_process子进程](https://www.nodeapp.cn/child_process.html)


### koa-session
> 使用 koa-session 进行登陆状态管理~

[Koa2 中如何使用 koa-session 进行登陆状态管理?](https://juejin.cn/post/6948780829921247269)


### log4js
> 日志输出~

- [log4js](https://www.npmjs.com/package/log4js)
- [【Log4js】Log4js 使用手册](https://blog.csdn.net/qq_37012965/article/details/124932263)



### koa-static
> 静态服务器，类似 nginx 启动静态服务，配置前端访问页面

- [koa-static](https://www.npmjs.com/package/koa-static)
- [对静态文件中间件koa-static的一些理解](https://blog.csdn.net/qq_43624878/article/details/107739956)







## 参考

- [zuo-deploy](https://github.com/dev-zuo/zuo-deploy)
- [Vue + Node.js 从 0 到 1 实现自动化部署工具](https://juejin.cn/post/7070921715492061214)