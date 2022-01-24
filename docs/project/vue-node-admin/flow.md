---
title: 项目开发流程
date: 2021-04-26 14:45:04
# permalink: false # 95023d/
categories: 
  - project
  - vue-node-admin
tags: 
  - nginx
permalink: false # 8d92b6/
---
# 项目开发流程


## 准备工作
---

1. 阿里云域名注册，ssl证书申请，ECS服务开通（具体看[阿里云服务器相关](./aliyun-server)）；
2. nginx配置（具体看[nginx的安装与配置](./nginx)）；
3. mysql搭建（具体看[msql的安装与使用](./mysql)）
4. 阿里云CentOs服务器搭建（具体看[阿里云centOS服务器搭建](./aliyun-centos)） 
    - node环境：nvm,node,npm,cnpm
    - nginx环境搭建，静态资源通过FileZilla上传nginx上
    - git安装
    - mysql安装


## 流程
---

1. 本地开发项目，开发完成，前端代码打包，将前端代码和后端代码`git push`到`github`仓库
2. 连接服务器
    - `ping verney-zhou` 连接上云服务器，`ssh root@verney-zhou`登录云服务器；
    - `nginx` 启动nginx服务，`fileZilla`连接云服务器，上传静态资源文件；
    - `service mysqld start` 开启mysql服务， `mysql -u root -p`登录，`navicat`连接云数据库；
3. 发布
    - 执行后端`shell`脚本，从`git`上拉取最新的代码，启动`node`服务；
    - 执行前端`shell`脚本，从`git`上拉取最新的代码，打包，上传到`nginx`上；
4. 浏览器访问



## 常见问题
---

1. **前端代码为什么需要打包？**
    - 前端浏览器只能识别js,html,css文件，需要将各种.vue，.less文件编译成浏览器能识别的文件；
    - 代码中含有import，export这种模块化的es6语法，module.exports这种commonJs语法浏览器都无法识别，需要通过打包编译.

2. **执行shell脚本时，提示：权限不够**
> 可参考：
    1.[Centos bash: 运行 ./xxx.sh: 权限不够](https://blog.csdn.net/idomyway/article/details/108229822)
    2.[linux 775和777权限有什么区别](https://blog.csdn.net/hsany330/article/details/49977151)
``` shell
[root@iZ2zef9ue9eyhqrvjxs3aqZ admin-book]# ./update-fe.sh
-bash: ./update-fe.sh: 权限不够
[root@iZ2zef9ue9eyhqrvjxs3aqZ admin-book]# chmod 775 ./update.sh  // chmod 775 更改用户权限
[root@iZ2zef9ue9eyhqrvjxs3aqZ admin-book]# ./update.sh
```

3. **如何通过ip地址访问到后端api?**
> 当静态资源已经上传到服务器上，已经可以通过ip地址`http://123.57.172.182/`访问到服务器上的资源时，这时输入：`http://123.57.172.182:5000`发现无法访问后端~

- 首先要在[阿里云安群组规则](https://ecs.console.aliyun.com/?spm=5176.100251.recommends.decs.62dd4f15QG9Z3L#/securityGroup/region/cn-beijing)中添加后端api请求的端口号：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image01.png')" width="auto"/>

- 然后在服务器上启动node服务：
``` shell
[root@iZ2zef9ue9eyhqrvjxs3aqZ ~]# cd admin-book/
[root@iZ2zef9ue9eyhqrvjxs3aqZ admin-book]# ls
ebook-admin-node  ebook-admin-vue  update-fe.sh  update.sh
[root@iZ2zef9ue9eyhqrvjxs3aqZ admin-book]# ./update.sh  // 执行自动化脚本，启动node
开始更新服务端...
正在更新代码...
已经是最新的。
正在重启服务...
后台服务端启动成功!
[root@iZ2zef9ue9eyhqrvjxs3aqZ admin-book]# ======Http server is running on http://0.0.0.0:5000
HTTPS Server is running on: https://localhost:18082
```

4. **前后端自动上线脚本**
- 前端：update-fe.sh
```shell
echo "start updating frontend..."
cd /root/admin-book
# git clone git@github.com:verneyZhou/ebook-admin-vue.git // 第一次执行时打开
cd ebook-admin-vue
echo "updating source..."
git pull
echo "frontend building"
cnpm i
npm run build
echo "frontend publish"
rm -rf ~/nginx/upload/admin-fe  # 删除原nginx上的文件
mv dist ~/nginx/upload/admin-fe # 将最新打包后的文件dist移动到~/nginx/upload/admin-fe
echo "finish updating frontend..."
```

- 后端：update.sh
```shell
echo "开始更新服务端..."
cd /root/admin-book
# git clone git@github.com:verneyZhou/ebook-admin-node.git // 第一次执行时打开
cd ebook-admin-node
echo "正在更新代码..."
git pull
echo "正在重启服务..."
kill -9 `ps -ef|grep node|grep app.js|awk '{print $2}'` # 关闭所有node服务
#  ps -ef|grep node 查看所有开启的node服务
#  grep app.js  过滤只包含 app.js 的指令
#  awk '{print $2}'  $fileName :   一行一行的读取指定的文件， 以空格作为分隔符，打印第二个字段
#  kill -9  强制关闭进程
cnpm i
node app.js &     # 加上&可以让node在后台也能运行
echo "后台服务端启动成功!"
```
[参考](https://blog.csdn.net/guo_guo_cai/article/details/78499477)

5. **http、https端口号**
    - 一个端口号对应一个服务；
    - nginx上放的是静态资源，node上放的是后端代码；访问静态资源需输入nginx配置的端口号，访问后端api需输入node配置的端口号；
    - nginx配置
        - http服务的默认端口号是80,即浏览器输入：http://localhost:80 访问的就是http://localhost；nginx.conf配置中默认配置的端口号是8080；
        - https的默认端口号是443，即浏览器输入：https://localhost:443 访问的就是https://localhost；一般https的配置在upload.conf中添加；
    - 后端node配置
        - http服务监听的是5000端口，浏览器输入http://localhost:5000/book/list 访问的是后端 /book/list 接口；
        - https服务监听的是18082端口，浏览器输入：https://localhost:18082/book/list 访问后端/book/list接口；
    - mysql的默认数据库端口是3306；
    - 3389 端口是电脑远程控制的端口


6. `Invalid Host header`
> 本地启动项目，用`switchHost`将`localhost`代理到线上域名`www.verneyzhou-code.cn`，项目跑起来后，浏览器输入该域名报：`Invalid Host header`

因为新版的webpack-dev-server出于安全考虑，默认检查hostname，如果hostname不是配置内的就不能访问。可通过vue.config.js中配置解决：
``` js
module.exports = {
  devServer: {
    disableHostCheck: true
  }
}
```

7. ECS服务器的nginx.conf上配置了https，并添加了证书，但浏览器输入`https://www.verneyzhou-code.cn`没有反应
> 检查下ECS控制台的[安全组规则](https://ecs.console.aliyun.com/?spm=5176.12818093.recommend.decs.75e316d0JIQoQA#/securityGroup/region/cn-beijing)是否已已添加了`443`端口：
ECS控制台 》 网络与安全 》 安全组 》 手动添加

<img class="zoom-custom-imgs" :src="$withBase('/images/project/flow001.jpeg')" width="auto"/>

添加之后，重启服务器的nginx，再次输入链接应该就可以了~









<fix-link label="Back" href="/project/vue-node-admin/"></fix-link>

<!-- 2021-04-26 -->

