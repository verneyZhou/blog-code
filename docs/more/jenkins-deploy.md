---
title: Jenkins前端自动化部署
date: 2023-08-10 01:43:40
permalink: false
categories:
  - 工程化
tags:
  - jenkins
  - 部署
---


# Jenkins前端自动化部署

> Jenkins 是开源 CI&CD 软件领导者，提供超过 1000 个插件来支持构建、部署、自动化，满足任何项目的需要。

Jenkins 是一款以插件化的方式实现 CI/CD 的软件。

[jenkins](https://www.jenkins.io/zh/)

## 准备

1. ECS服务器


> 一个ECS服务器，我的是阿里云 CentOS 服务器：2核(vCPU) 2 GiB~

> 在操作之前，假设你的服务器已经安装了`git, nginx, node`，并且已经配置了`nginx.conf`~

2. 有一个开发完成，即将推送到github的项目，我的项目地址是[jenkins-vite-test](https://github.com/verneyZhou/jenkins-vite-test)






## 安装jenkins


- 登录ECS云服务器

``` sh
➜  ~ ssh root@123.57.172.182
Last login: Thu Aug 10 02:17:58 2023 from 222.128.185.117

Welcome to Alibaba Cloud Elastic Compute Service !
```

>  Jenkins 默认占用`8080`端口，同时需要在[安全组](https://ecs.console.aliyun.com/server/i-2zef9ue9eyhqrvjxs3aq/group/group?regionId=cn-beijing)中增加~


- 安装 Java JDK
> Jenkins 依赖于 java 所以需要安装 `Java JDK`; 因为最新的 Jenkins 版本需要 Java11 或者 Java17，更多 Jenkins 版本查看[pkg.jenkins.io](https://pkg.origin.jenkins.io/redhat/)，所以我们选择安装`Java11`

``` sh
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# yum -y list java*   # 查看可用的java版本
已加载插件：fastestmirror
Loading mirror speeds from cached hostfile
已安装的软件包
java-11-openjdk.x86_64                                 1:11.0.19.0.7-1.el7_9                      @updates
java-11-openjdk-headless.x86_64                        1:11.0.19.0.7-1.el7_9                      @updates
javapackages-tools.noarch                              3.4.1-11.el7                               @base
可安装的软件包
java-1.6.0-openjdk.x86_64                              1:1.6.0.41-1.13.13.1.el7_3                 base
java-1.6.0-openjdk-demo.x86_64                         1:1.6.0.41-1.13.13.1.el7_3                 base
java-1.6.0-openjdk-devel.x86_64


# 安装指定版本java依赖包
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# yum install java-11-openjdk-devel.x86_64  # 或  sudo yum install java-11-openjdk


# 安装成功后，查看java版本
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# java --version
openjdk 11.0.19 2023-04-18 LTS
OpenJDK Runtime Environment (Red_Hat-11.0.19.0.7-1.el7_9) (build 11.0.19+7-LTS)
OpenJDK 64-Bit Server VM (Red_Hat-11.0.19.0.7-1.el7_9) (build 11.0.19+7-LTS, mixed mode, sharing)




```


- 安装Jenkins

``` sh
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
--2023-08-10 02:38:35--  https://pkg.jenkins.io/redhat-stable/jenkins.repo
正在解析主机 pkg.jenkins.io (pkg.jenkins.io)... 151.101.110.133, 2a04:4e42:1a::645
正在连接 pkg.jenkins.io (pkg.jenkins.io)|151.101.110.133|:443... 已连接。
# 错误: 无法验证 pkg.jenkins.io 的由 “/C=US/O=Let's Encrypt/CN=R3” 颁发的证书: 颁发的证书已经过期。
# 要以不安全的方式连接至 pkg.jenkins.io，使用“--no-check-certificate”。

[root@iz2zef9ue9eyhqrvjxs3aqz ~]# sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo --no-check-certificate

[root@iz2zef9ue9eyhqrvjxs3aqz ~]# sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key

[root@iz2zef9ue9eyhqrvjxs3aqz ~]# yum install jenkins
```

- 启动 Jenkins:

``` sh
# 启动 Jenkins 服务
systemctl start jenkins
# 重启 Jenkins 服务
systemctl restart jenkins
# 停止 Jenkins 服务
systemctl stop jenkins
# 查看 Jenkins 服务状态
systemctl status jenkins
```

- 启动后，在浏览器输入：`http://123.57.172.182:8080/`, 就可以访问到以下页面，代表 Jenkins 安装成功：

<img :src="$withBase('/images/more/jenkins01.png')" width="auto"/>



## 配置Jenkins
> 接下来可以开始配置Jenkins了~

- 如上图所示，需要先获取密码：

``` sh
# 查看密码
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# cat /var/lib/jenkins/secrets/initialAdminPassword
f63310f95***********bc45b2
```

- 复制密码，粘贴，点击继续；选择【安装推荐的组件】:

<img :src="$withBase('/images/more/jenkins02.png')" width="auto"/>


- 等待安装插件，可能需要几分钟，安装完成后设置管理员账号；设置完成后，点击【保存并完成】，跟着提示进入下一步，就来到了 Jenkins 首页：


<img :src="$withBase('/images/more/jenkins03.png')" width="auto"/>



### 配置Node

> 在构建流程中，想要部署前端项目，需要执行我们编写的shell脚本，还需要依赖一个 Node 环境~

1. 安装：Manage Jenkins   =>  System Configuration   =>  插件管理  =>  Available Plugins =>  输入 `NodeJS`，安装：

<img :src="$withBase('/images/more/jenkins04.jpg')" width="auto"/>


2.  配置：安装完成后，Manage Jenkins  =>  Tools => 滑到底部，选择 NodeJS 安装：

<img :src="$withBase('/images/more/jenkins041.jpg')" width="auto"/>

> 之后创建的构建任务时，在 【构建环境】 中会多出一个选项 `Provide Node & npm bin/ folder to PATH` 勾选即可~



### 配置Publish Over SSH

> 在真实的开发场景中，Jenkins 几乎不会和前端资源放到一个服务器。大多数情况下 Jenkins 所处的服务器环境就是一个工具用的服务器，放置了一些公司中常用的工具。因此构建到指定的服务器也至关重要。所以部署到目标主机就需要安装这个插件~

1. 安装：Manage Jenkins   =>  System Configuration   =>  插件管理  =>  Available Plugins =>  输入 `Publish Over SSH`，安装：

<img :src="$withBase('/images/more/jenkins16.jpeg')" width="auto"/>

> 安装完成后，原本默认的英文界面可能会自动转成中文~~~


2. 配置：安装重启后jenkins后，`系统管理 => 系统配置`，页面往下滑，找到` Publish over SSH`，点击新增`SSH Servers`：

<img :src="$withBase('/images/more/jenkins17.jpeg')" width="auto"/>

> 上面的密码是服务器密码~

如图所示添加服务器信息，填完后点击下方的`Test Configuration`进行连接测试，如果测试成功，会显示`Success`；之后保存即可~

> 我这里配置的就是jenkins所在的服务器，刚开始报错了，后来在阿里云安全规则里添加了如下配置，重新测试就连上了~

<img :src="$withBase('/images/more/jenkins18.jpeg')" width="auto"/>







### 添加 Github Token
> 为了我们能够在`github`上拉取代码，需要我们添加`git token`，在`github`中添加一个 `token`~


使用 GitHub API 或命令行时，可使用 Personal access token 替代密码向 GitHub 进行身份验证。[Github-管理个人访问令牌](https://docs.github.com/zh/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

> Personal access token 旨在代表你自己访问 GitHub 资源。


- 安装Github API
> 在配置`Github Token`之前需要先安装`Github API`插件，安装方式跟上面的`Publish Over SSH`一样；可以现在插件管理的`avaliable plugins`处查询是否已安装该插件，如果没有则需要安装（因为刚开始 配置jenkins 选择 安装推荐插件 时可能已经安装了~）


1. 进入 [GitHub](https://github.com/settings/apps)，点击右上角 头像 - 【Settings】； 滑到最底部，点击【Developer settings】，然后选中 【Personal access tokens】，点击右上角 【Generate new token】：

<img :src="$withBase('/images/more/jenkins05.jpg')" width="auto"/>


2. 输入Note, 配置有效期，勾选 相应Auth，如图所示：

<img :src="$withBase('/images/more/jenkins06.jpg')" width="auto"/>

> 既然是要实现代码 push 到仓库就自动构建并发布，那么我们肯定得用到 Webhook，不过我们不需要手动创建 Webhook，插件会帮我们自动创建。

勾选后，点击【Generate】生成一段 token；token 只会显示一次，建议用记事本记一下。



3. 接着回到Jenkins中：Manage Jenkins  =>  System  => 滑到下面找到GitHub, 点击添加 Github服务器  => 输入名称，凭据下面点击添加Jenkins：

<img :src="$withBase('/images/more/jenkins07.jpg')" width="auto"/>


4. 出来弹窗，类型选择 Secret Text；Secret 中添加刚生成的 Token；点击添加：

<img :src="$withBase('/images/more/jenkins08.jpg')" width="auto"/>


5. 之后在 Github服务器 中选择 Secret Text 凭据，勾选 管理Hooks, 点击 连接测试；如果出现你的 github账号名称 则说明配置成功：

<img :src="$withBase('/images/more/jenkins09.jpg')" width="auto"/>




### 新建构建任务

> 在新建项目之前，需要先把自己的本地的项目推送到github上~

1. Create A Job：

<img :src="$withBase('/images/more/jenkins10.jpg')" width="auto"/>


输入名称  => 选择 Freestyle Project：

<img :src="$withBase('/images/more/jenkins101.jpg')" width="auto"/>


2. 如图所示，进行github配置:

<img :src="$withBase('/images/more/jenkins11.jpg')" width="auto"/>


3. 添加git仓库Url后，可能会因为没有认证而报错：

<img :src="$withBase('/images/more/jenkins12.jpg')" width="auto"/>

> 跟添加 Token 凭证类似，点击下方【添加】，添加jenkins凭证~


4. 出来弹窗，选择【Username and Password】，输入Github账号和密码，保存：

<img :src="$withBase('/images/more/jenkins13.jpg')" width="auto"/>

> 也可添加 `SSH Username with private key`，都是一种获取github登录权限的凭据~


5. 之后选择新生成的凭证，报错消失则说明凭证生效了：

<img :src="$withBase('/images/more/jenkins14.jpg')" width="auto"/>




6. 之后配置构建触发器和构建环境，如图所示勾选：

<img :src="$withBase('/images/more/jenkins15.jpg')" width="auto"/>



7. 接着添加构建步骤：

点击【增加构建步骤】 ===>  选择 【执行shell】, 然后可先输入如下简单的打包命令试下是否能执行成功~

<img :src="$withBase('/images/more/jenkins19.jpeg')" width="auto"/>


8. 保存配置之后回到构建任务，点击【立即构建】下方会出现构建历史记录，点击则能查看脚本执行详情~

<img :src="$withBase('/images/more/jenkins20.jpeg')" width="auto"/>


9. 点击【控制台输出】则能看到详细的脚本执行信息，可看到执行了刚才在配置的脚本命令~

<img :src="$withBase('/images/more/jenkins21.jpeg')" width="auto"/>

> 不出意外的话，构建任务结束后会提示`success`，但刚开始执行也很可能会出现报错，一般可能是权限相关问题~




## 继续配置jenkins


### 优化构建脚本

接下来，继续添加构建脚本，把构建后的打包文件复制到指定目录:

``` sh
git ls-remote -t # 查看远程tags
git tag -l #查看本地tag

echo "当前目录为："
pwd # 查看当前目录
node -v
npm -v

# rm -rf node_modules

echo "正在加载安装包..."
# npm install
echo "下载安装包成功！！！"
echo "正在构建..."
npm run build

echo "构建成功！！！"

rm -rf /root/nginx/upload/jenkins-vite-test/
mkdir /root/nginx/upload/jenkins-vite-test/
echo "正在复制..."
cp -rf ./dist/* /root/nginx/upload/jenkins-vite-test
echo "复制成功！！！"

```

这里的 `/root/nginx/upload/` 是已经在`nginx.conf`里配置好的项目访问目录：

``` sh
# nginx.conf

server {
        listen 80;
        #  http默认端口号80,这里用了80之后，直接在浏览器输入ip就可以访问了~
        #  最好把/usr/local/nginx/conf/nginx.conf中的端口改成其他，不然会有冲突
        server_name localhost;
        root /root/nginx/upload;  # 资源访问路径
        autoindex on; # 打开索引
        add_header Cache-Control "no-cache,must-revalidate";  #  http中添加不进行缓存的配置
        location / { # 所有路由匹配
                add_header Access-Control-Allow-Origin *;  #  添加跨域支持
        }
}
```

- 构建成功后，我们的项目就已经部署到服务器上了，直接访问`http://123.57.172.182/jenkins-vite-test`即可访问最新的页面！！！

> 至此，我们也算是大致完成了jenkins自动部署的主要流程，接下来继续优化~





### SSH推送部署

上面部署脚本中，在`run build`之后是通过执行`cp`来将打包后的产物复制到指定目录，接下来我试试通过配置`SSH`来自动推送部署~


1. 首先进到`deplot-test01`的`Configure`，增加【构建后操作】：

<img :src="$withBase('/images/more/jenkins31.jpeg')" width="auto"/>



2. 选择在配置`Publish Over SSH`时添加的服务器，配置路径，保存；

<img :src="$withBase('/images/more/jenkins32.jpeg')" width="auto"/>

- `Rransfer Set Source files`：要上传到目标服务器的文件。它是一个相对路径，相对于 Jenkins 的工作目录，默认是`/var/lib/jenkins/workspace/deploy-test01`

- `Remove prefix`：去前缀。
> 假设此时打包文件在 `/var/lib/jenkins/workspace/deploy-test01/dist/`，那么 `Rransfer Set Source files` 则应该为 `/dist/**/*`，此时 `Remove prefix` 配置为 `dist` 则可以去除这个前缀，否则会在目标服务中创建 `dist` 。

- `Remote directory`：远程的静态资源托管目录。由于配置服务器默认为` /`，所以 `root/nginx/upload/jenkins-vite-test` 不用以 `/` 开头。


- `Exec command`：远程机执行 `shell`，由于配置服务器默认为 `/`， 所以 工作目录也是以 `/` 开始。



3. 注释掉【Build Steps】中的脚本命令，然后重新构建：

``` sh
##### 注释掉复制部分代码
# rm -rf /root/nginx/upload/jenkins-vite-test/
# mkdir /root/nginx/upload/jenkins-vite-test/
# echo "正在复制..."
# cp -rf ./dist/* /root/nginx/upload/jenkins-vite-test
# echo "复制成功！！！"
```



4. 构建成功后，可点击【控制台输出】查看构建详情：

<img :src="$withBase('/images/more/jenkins33.jpeg')" width="auto"/>

> 如果 `Transferred 0 file` 则需要查看配置的路径是否正确。表示文件并没有被移动到远程主机中。


5. 构建成功后访问`http://123.57.172.182/jenkins-vite-test`也可以看到最新的修改；
> 这里我配置的服务器ip就是jenkins所在的服务器（因为我只有这一个服务器...），以后如果想推送到其他服务器也是完全可以的，在`SSH`里更新配置即可~




### Git Webhooks


> 我们向github/码云等远程仓库push我们的代码时，jenkins能知道我们提交了代码，这是自动构建自动部署的前提，钩子的实现原理是在远端仓库上配置一个Jenkins服务器的接口地址，当本地向远端仓库发起push时，远端仓库会向配置的Jenkins服务器的接口地址发起一个带参数的请求，jenkins收到后开始工作。


- 在上面`新建构建任务  => 构建触发器` 时，我已经选择的是【**GitHub hook trigger for GITScm polling**】，意思就是：

**在上面的源码管理中指定的 main 分支的代码有改动，就会触发自动构建**。


- 接着可以看下github上是否已经添加了`webhooks`:

<img :src="$withBase('/images/more/jenkins34.jpeg')" width="auto"/>

> 可以看到 github 上已经添加了我的jenkins服务器所在的地址: http://123.57.172.182:8080/github-webhook/，可能是在配置构建任务勾选【GitHub hook trigger for GITScm polling】就自动加上了吧，如果没有，那就手动加上~


- 如果上面配置没问题，之后我们每次`git push`代码到github，我们的jenkins应该都会自动构建`deploy-test01`项目~






### 增加钉钉提醒


[钉钉机器人插件](https://jenkinsci.github.io/dingtalk-plugin/guide/getting-started.html)


1. 首先在jenkins插件管理中安装 `DingTalk` 插件：

<img :src="$withBase('/images/more/jenkins41.jpg')" width="auto"/>


2. 之后在钉钉中新建一个群，添加机器人：

<img :src="$withBase('/images/more/jenkins43.jpg')" width="auto"/>


然后填写机器人信息：

<img :src="$withBase('/images/more/jenkins44.jpg')" width="auto"/>

复制Webhook: 

<img :src="$withBase('/images/more/jenkins45.jpg')" width="auto"/>


3. 之后回到 `Jenkins => 系统管理` 中，配置钉钉机器人：
> 当我们安装了 `DingTalk` 插件后，系统配置下方中就会自动出现钉钉tab~

<img :src="$withBase('/images/more/jenkins42.jpg')" width="auto"/>



4. 【新增】，配置信息：id随便输入，名称自定义，webhook是刚在钉钉复制的链接，关键词是刚在钉钉中输入的；

<img :src="$withBase('/images/more/jenkins46.jpg')" width="auto"/>

输入完成，点击右下角【测试】，显示`测试成功`即表示配置成功，【submit】~


5. 最后进入需要钉钉通知的构建任务，修改构建配置：

<img :src="$withBase('/images/more/jenkins47.jpg')" width="auto"/>


6. 提交之后，重新构建，构建成功后，不出意外我们的钉钉群就会收到如下通知~

<img :src="$withBase('/images/more/jenkins48.jpg')" width="auto"/>





### 配置分支和环境

> 在实际项目构建中，我们需要部署不同的分支，也需要部署到不同的环境，所以也需要参数化构建~


1. jenkins插件管理，安装`Git Parameter`:

<img :src="$withBase('/images/more/jenkins51.jpg')" width="auto"/>


2. 安装完成后，进入构建任务【配置】，这是会出现如下【参数化构建过程】选项，选中，新增【选项参数】，填入自己的分支和环境信息：

<img :src="$withBase('/images/more/jenkins52.jpg')" width="auto"/>


3. 之后修改【源码管理】配置，分支修改为`*/${feature}`：

<img :src="$withBase('/images/more/jenkins53.jpg')" width="auto"/>


4. 然后在【构建触发器】中取消【GitHub hook trigger for GITScm polling】勾选，之后在 github 上 Webhooks 中就会自动取消该配置项~
> 因为这里需要用户手动选择分支和环境，所以就暂不需要监听`git push`提交，自动构建功能了~


5. 接着修改 SSH 中的 `Remote direcotory`路径如下：

<img :src="$withBase('/images/more/jenkins54.jpg')" width="auto"/>


6. 还需要修改下项目代码的构建配置：
> 因为现在是用户手动选择环境，所以构建的目录是不固定的，那就需要获取用户所选环境参数来进行静态资源的构建~

``` js
// vite.config.js

// 获取环境变量
const env = process.env.ENV || ''; // 环境
export default ({command, mode}) => {
  return defineConfig({
    base: env ? `/${env}/jenkins-vite-test/` : '/jenkins-vite-test/', // 根据环境变量生成公共路径前缀
    plugins: [vue()],
  })
}
```

7. 最后回到jenkins的构建任务配置，修改【Build Steps】的 Shell 脚本命令：

``` sh
# npm run build
ENV=${env} npm run build  #  获取用户选择的环境变量
```


8. 至此配置完成，项目提交后，选择分支，环境，重新构建；

成功后，直接访问：`http://123.57.172.182/dev/jenkins-vite-test`就可以访问到我们的项目了！！！






## 报错记录

1. 安装`jenkins`提示：

``` sh
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# sudo yum install jenkins
已加载插件：fastestmirror
Loading mirror speeds from cached hostfile
没有可用软件包 jenkins。
错误：无须任何处理
```
> Centos 有个很方便的软件安装工具 yum，但是默认安装完centos，系统里使用的是国外的centos更新源，这就造成了我们使用默认更新源安装或者更新软件时速度很慢的问题。为了使用yum工具能快速的安装更新软件，我们需要将默认的yum更新源配置为国内的更新源。yum更新源配置文件位于centos目录  `/etc/yum.repos.d/`  下。


``` sh
# 查看服务器所有的默认源
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# yum repolist all
已加载插件：fastestmirror
Loading mirror speeds from cached hostfile
源标识                              源名称                          状态
C7.0.1406-base/x86_64               CentOS-7.0.1406 - Base          禁用
C7.0.1406-centosplus/x86_64         CentOS-7.0.1406 - CentOSPlus    禁用
...
C7.7.1908-updates/x86_64            CentOS-7.7.1908 - Updates       禁用
C7.8.2003-fasttrack/x86_64          CentOS-7.8.2003 - Fasttrack     禁用
C7.8.2003-updates/x86_64            CentOS-7.8.2003 - Updates       禁用
!aegisbase/7/x86_64                 CentOS-7                        禁用
!aegisextras/7/x86_64               CentOS-7                        禁用
!aegisupdates/7/x86_64              CentOS-7                        禁用
base/7/x86_64                       CentOS-7                        启用: 10,072 # 默认源
base-debuginfo/x86_64               CentOS-7 - Debuginfo            禁用
base-source/7                       CentOS-7 - Base Sources         禁用

# 如果上面查到都为禁用的话，将默认的yum更新源配置为国内的更新源
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.163.com/.help/CentOS7-Base-163.repo


!aegisbase/7/x86_64                 CentOS-7                                                  禁用
!aegisextras/7/x86_64               CentOS-7                                                  禁用
!aegisupdates/7/x86_64              CentOS-7                                                  禁用
base/7/x86_64                       CentOS-7 - Base - 163.com                                 启用: 10,072  # 更新之后
base-debuginfo/x86_64               CentOS-7 - Debuginfo                                      禁用
```

[CentOS镜像使用帮助](http://mirrors.163.com/.help/centos.html)

[Linux的默认源出现问题无法yum解决办法](https://jingyan.baidu.com/article/0bc808fcee5d471bd485b901.html)

> 实践之后，发现上面提示 jenkins 没有其实不是这个原因，这里记录下方便以后学习~




2. jenkins新建任务时，添加git项目时报错：

- 报错1：
``` sh
无法连接仓库：Command "git ls-remote -h https://github.com/verneyZhou/jenkins-vite-test.git HEAD" returned status code 128:
stdout:
stderr: fatal: unable to access 'https://github.com/verneyZhou/jenkins-vite-test.git/': Failed connect to github.com:443; Connection timed out
```
> 可能是权限问题，可以在 `Credentials` 中添加凭证；可以选择`Secret Text` 或  `SSH Username with private key`;

`Secret Text`在github中生成的Token, `private key`就是在服务器的`/root/.ssh/id_rsa`中的内容，添加见下方备注~



- 报错2：
``` sh
Failed to connect to repository : Command "git ls-remote -h -- git@github.com:xxx/xxx.git HEAD" returned status code 128:
stdout:
stderr: No ECDSA host key is known for github.com and you have requested strict checking.
Host key verification failed.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```
> 权限校验问题，可能是更新了github的ssh key导致的~


3. jenkins构建过程报错：

``` sh
# 报错1：
ERROR: Error fetching remote repo 'origin'
hudson.plugins.git.GitException: Failed to fetch from https://github.com/verneyZhou/jenkins-vite-test.git
	at hudson.plugins.git.GitSCM.fetchFrom(GitSCM.java:999)
	at hudson.plugins.git.GitSCM.retrieveChanges(GitSCM.java:1241)
	at hudson.plugins.git.GitSCM.checkout(GitSCM.java:1305)
	at hudson.scm.SCM.checkout(SCM.java:540)
	at hudson.model.AbstractProject.checkout(AbstractProject.java:1240)
	at hudson.model.AbstractBuild$AbstractBuildExecution.defaultCheckout(AbstractBuild.java:649)
	at jenkins.scm.SCMCheckoutStrategy.checkout(SCMCheckoutStrategy.java:85)
	at hudson.model.AbstractBuild$AbstractBuildExecution.run(AbstractBuild.java:521)
	at hudson.model.Run.execute(Run.java:1900)
	at hudson.model.FreeStyleBuild.run(FreeStyleBuild.java:44)
	at hudson.model.ResourceController.execute(ResourceController.java:101)
	at hudson.model.Executor.run(Executor.java:442)
Caused by: hudson.plugins.git.GitException: Command "git fetch --tags --progress https://github.com/verneyZhou/jenkins-vite-test.git +refs/heads/*:refs/remotes/origin/*" returned status code 128:
stdout: 
stderr: fatal: unable to access 'https://github.com/verneyZhou/jenkins-vite-test.git/': Encountered end of file
# 暂无无解，可能也是权限问题


# 报错2：
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
# 权限问题


# 报错3：
eturned status code 128:
stdout: 
stderr: Warning: the ECDSA host key for 'github.com' differs from the key for the IP address '20.205.243.166'
Offending key for IP in /root/.ssh/known_hosts:3
Matching host key in /root/.ssh/known_hosts:4
Exiting, you have requested strict checking.
Host key verification failed.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
# 警告:“github.com”的 ecdsa 主机密钥与 ip 地址“20.205.243.166”的密钥不同，更新了github的ssh key导致的~

```


权限问题：登录服务器，修改 `/lib/systemed/system/jenkins.service` 文件，将 `User=jenkins` 修改为 `User=root`，表示给 Jenkins 赋权限。修改配置文件后记得重启服务。



ssh key不一致问题：最简单粗暴的方法就是ssh登录服务器，**直接删除`~/.ssh/known_hosts`文件**，然后再重新clone~

[Has GitHub changed his remote host key](https://github.com/orgs/community/discussions/50878)





- jenkins部署, 准备从git上拉取代码时报错：

``` sh
You're using 'Known hosts file' strategy to verify ssh host keys, but your known_hosts file does not exist, please go to 'Manage Jenkins' -> 'Configure Global Security' -> 'Git Host Key Verification Configuration' and configure host key verification.
```
> 应该是服务器上的`known_hosts`文件被误删了，该文件会把每一个访问过服务器的公钥（public key）保存下来，这里服务器准备访问github，但`known_hosts`被删了，公钥核验不通过，就会报错；

解决方法：`ssh`登录服务器，手动`git clone`一个项目到服务器，会提示是否添加`github`的`rsa`信息到`known_hosts`，按提示输入`yes`后就会自动添加上了；之后`git clone`就不会报错了~




- jenkins部署时报错：

``` sh
SSH: Connecting from host [iz2zef9ue9eyhqrvjxs3aqz]
SSH: Connecting with configuration [阿里云] ...
ERROR: Exception when publishing, exception message [Failed to connect and initialize SSH connection. Message: [Failed to connect session for config [阿里云]. Message [Auth fail for methods 'publickey,gssapi-keyex,gssapi-with-mic']]]
Build step 'Send build artifacts over SSH' changed build result to UNSTABLE
Finished: UNSTABLE
```
> `Publish Over SSH`的权限问题，在系统配置中添加服务器私钥：

<img :src="$withBase('/images/more/jenkins55.jpeg')" width="auto"/>






## 备注



### jenkins工作目录

jenkins默认安装目录是在：`/var/lib/jenkins`，可在`系统管理 => 系统配置 => 主目录`中查看~

当执行构建任务时，Jenkins 的执行目录是 `/var/lib/jenkins/workspace/deploy-test01`, 前面的`/var/lib/jenkins/workspace/`是前缀，后面的`deploy-test01`是构建任务名称。




### 添加 SSH Username with private key


1. ssh登录服务器，进入`vim /root/.ssh/id_rsa`, 复制private key; 

2. Credentials > 添加 > 类型选【SSH Username with private key】 > 范围选【全局】，Username自定义 > Private Key处点击【Enter directly】, 【Add】，粘贴 > 保存；

[Jenkins连接gitlab报错：returned status code 128](https://blog.csdn.net/tt75281920/article/details/105434989)






### 查看内存占用

``` sh
# free 命令是Linux系统中最简单和最常用的内存查看命令
# -m 选项是以MB为单位来展示内存使用信息; -h 选项则是以人类(human)可读的单位来展示。
[root@iz2zef9ue9eyhqrvjxs3aqz ebook-admin-vue]# free -h
              total        used        free      shared  buff/cache   available
Mem:           1.8G        1.5G         77M        460K        188M        116M
Swap:            0B          0B          0B
[root@iz2zef9ue9eyhqrvjxs3aqz ebook-admin-vue]# free -m
              total        used        free      shared  buff/cache   available
Mem:           1837        1571          76           0         189         116
Swap:             0           0           0

##### Mem这一行表示内存信息；Swap 这一行表示交换内存
total 表示总共有 1837MB 的物理内存(RAM)，即1.8G。
used 表示物理内存的使用量，大约是 1571M。
free 表示空闲内存;
shared 表示共享内存?;
buff/cache 表示缓存和缓冲内存量; Linux 系统会将很多东西缓存起来以提高性能，这部分内存可以在必要时进行释放，给其他程序使用。
available 表示可用内存;
 */


```


### top 命令
> 一般用于查看进程的CPU和内存使用情况~

``` sh
# CentOS
top -o %MEM  # 查看内存
top -o %CPU  # 查看cpu

# mac
top -o mem
top -o cpu


# 查看内存
[root@iz2zef9ue9eyhqrvjxs3aqz ebook-admin-vue]# top -o %MEM
top - 01:19:09 up 186 days,  6:58,  1 user,  load average: 0.00, 0.01, 0.05
Tasks:  87 total,   1 running,  86 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.8 us,  0.7 sy,  0.0 ni, 98.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
# KiB Mem 和 KiB Swap 这两行： 表示内存的总量、使用量，以及可用量。
KiB Mem :  1881776 total,    70156 free,  1609356 used,   202264 buff/cache
KiB Swap:        0 total,        0 free,        0 used.   119020 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
24208 jenkins   20   0 3317808 730432   9468 S   0.0 38.8   1:35.81 java
16584 root      20   0   11.8g 470364   2212 S   0.3 25.0 578:37.80 node /root/ngin
 1244 mysql     20   0 1490140 122876    684 S   0.0  6.5 171:49.30 mysqld
20274 root      10 -10  167036  39552   1944 S   1.7  2.1 258:36.61 AliYunDunMonito
```

### centos查看文件占用空间大小

``` sh
du -sh # 查看当前目录总共占的容量。而不单独列出各子项占用的容量

du -sh * | sort -n   # 统计当前文件夹(目录)大小，并按文件大小排序

du -sk filename    # 查看指定文件大小

du -lh --max-depth=1    # 查看当前目录下一级子文件和子目录占用的磁盘容量
```



### scp命令

> SCP (Secure Copy) 是一种在 Linux 和 Unix 系统之间进行文件传输的方式。它使用 SSH (Secure Shell) 协议进行加密，可以安全地、可靠地将文件从一个系统复制到另一个系统。

- 基本语法：`scp [options] source_file destination_file`

- 将本地文件复制到远程服务器：`scp local_file user@remote_host:remote_folder`

- SCP命令默认使用22号端口进行传输，但是有时候需要使用其他端口进行传输。可以使用-P选项指定端口号。

``` sh
# 将本地文件 /home/user/test.txt 复制到远程服务器 192.168.1.100 的 /home/user 目录下:
scp /home/user/test.txt user@192.168.1.100:/home/user/

# 使用端口号 2222 将本地文件复制到远程服务器 192.168.1.100 的 /home/user 目录下
scp -P 2222 /home/user/test.txt user@192.168.1.100:/home/user/

scp -r  # -r 递归复制整个目录

scp -v  # SCP命令默认不显示传输进度，但是可以使用-v选项显示详细输出，包括传输进度


# SCP命令默认复制所有文件，但是有时候只需要复制新文件。可以使用-u选项只复制新文件。
scp -ru /home/user/test user@192.168.1.100:/home/user/


scp /home/user/*.test user@192.168.1.100:/home/user/ # 通配符匹配：将本地目录下所有以.test结尾的文件复制到远程服务器的/home/user目录下

```

[scp命令详解](https://blog.csdn.net/tott_0322/article/details/88107026)




### Docker vs Jenkins

- **Jenkins**
> 它就像一个尽职尽责的管家，时刻替我们监控 git 仓库，当我们提交了新代码，需要让新代码发生作用，我们只需要在 Jenkins 上点击构建，它就会主动去 git 仓库拉取对应分支最新的代码，然后进行build打包，把打包好的文件放置到 nginx 的指定目录去，这样我们就能在浏览器看到最新的效果


- **Docker**
> docker 的中文意思是码头工人，它管理着码头的多个集装箱。docker 可以为每个服务提供一个容器(container)，容器包含服务所需的所有条件，服务运行其中，不同容器之间互不干扰。另外，docker 是根据镜像来创建容器的。


它们二者可以分开使用，也可以合作起到更好的效果。jenkins 是构建服务并将服务推送到指定位置去的，这个服务本身也可以是个 docker 镜像。

jenkins 本身就是一个服务，可以把它放进一个 docker 容器来运行，可以在[Dock Hub](https://hub.docker.com/search?q=jenkins)中搜索`jenkins`镜像，服务器上安装`jenkins`服务也可以通过docker镜像安装。














## 参考


- [如何使用jenkins搭建一个中小企业前端项目部署环境](https://juejin.cn/post/7191076198506561573)
- [CentOS 安装Jenkins踩坑](https://juejin.cn/post/7144989607757611045)

- [前端工程化：保姆级教学 Jenkins 部署前端项目](https://juejin.cn/post/7102360505313918983)
- [写给前端的 Jenkins 教程——10分钟实现前端/ Node.js 项目的 CI/CD](https://juejin.cn/post/6896151951545729031)




