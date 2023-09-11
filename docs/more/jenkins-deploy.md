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




docker-compose版本信息：[https://github.com/docker/compose/releases](https://github.com/docker/compose/releases)


## 笔记


### 准备

1. 阿里云 CentOS 服务器


> 在操作之前，假设你的服务器已经安装了`git, nginx, node`~








### 安装jenkins


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

<img :src="$withBase('/images/more/jenkins16.jpg')" width="auto"/>
> 安装完成后，原本默认的英文界面可能会自动转成中文~~~


2. 配置：安装重启后jenkins后，`系统管理 => 系统配置`，页面往下滑，找到` Publish over SSH`，点击新增`SSH Servers`：

<img :src="$withBase('/images/more/jenkins17.jpg')" width="auto"/>


如图所示添加服务器信息，填完后点击下方的`Test Configuration`进行连接测试，如果测试成功，会显示`Success`；之后保存即可~

> 我这里配置的就是jenkins所在的服务器，刚开始报错了，后来在阿里云安全规则里添加了如下配置，重新测试就连上了~

<img :src="$withBase('/images/more/jenkins18.jpg')" width="auto"/>







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


5. 之后选择新生成的凭证，报错消失则说明凭证生效了：

<img :src="$withBase('/images/more/jenkins14.jpg')" width="auto"/>


6. 之后配置构建触发器和构建环境，如图所示勾选：

<img :src="$withBase('/images/more/jenkins15.jpg')" width="auto"/>


7. 接着添加构建步骤：








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








## 参考

- [CentOS 安装Jenkins踩坑](https://juejin.cn/post/7144989607757611045)



