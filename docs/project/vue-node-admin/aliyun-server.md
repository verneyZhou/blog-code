---
title: 阿里云服务器相关
date: 2021-04-26 14:45:31
# permalink: false # 2dc970/
categories: 
  - project
  - vue-node-admin
tags: 
  - 服务器
  - 阿里云
permalink: false # 1b4c54/
---
# 阿里云服务器相关


## 阿里云域名注册
---

1. [注册](https://help.aliyun.com/document_detail/54068.html)

    - 注册步骤比较简单：选择域名，购买即可~
    - 在支付之前，必须选择一个已经进行过实名认证的邮箱作为域名信息
    - 购买成功后就可以在[域名列表](https://dc.console.aliyun.com/next/index#/domain/list/all-domain)看到自己的域名；
    - 域名状态如果显示：未实名认证，需要进行实名认证~

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image02.png')" width="auto"/>


2. **解析**
- 上图列表中点击操作下的【解析】，进入解析列表页面，添加记录：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image03.png')" width="auto"/>

> 添加一条测试记录~

- 添加成功后列表中就多了一条解析记录，这时在浏览器中输入：test.verneyzhou-code.cn就可以访问到github.com~

- 这里域名解析可以指定到另一个域名，也可以**和开通的阿里云服务器ip地址地址绑定到一起**

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image04.png')" width="auto"/>

> 添加成功之后就可以通过`master.verneyzhou-code.cn`访问到`123.57.172.182`这个ip地址~但如果不备案的话这样的访问形式很快就会失效

3. __备案__
> 一般只有.cn这类域名才需要备案

- 点击控制台右上角的【备案】，进入备案列表：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image05.png')" width="auto"/>

- 满三月后，右侧会出现【申请】，点击进入【去备案】，然后按官方操作流程备案即可~（？应该也可以直接备案~）

- 一般备案成功后拿到备案号，你的与这个ip绑定的域名就可以正常访问了~




## 阿里云https证书申请
---

1. 进入SSL证书页面：[链接](https://yundun.console.aliyun.com/?p=cas#/overview/cn-hangzhou)

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image06.png')" width="auto"/>

2. 点击购买证书，进入选择页面：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image07.png')" width="auto"/>

> 个人测试用可以选择免费版~

3. 按照流程购买成功后，进入控制台列表页会新增一条数据：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image08.png')" width="auto"/>

4. 点击去申请，填写信息，验证，提交审核~

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image09.png')" width="auto"/>

5. 提交审核后，等待状态更改为【已签发】，然后就可以下载，让证书生效~

<img class="zoom-custom-imgs" :src="$withBase('/images/project/image10.png')" width="auto"/>

> 下载证书后，就可以在后端node代码和配置nginx中使用这个证书了~



## 阿里云ECS服务器开通
---

1. 打开[链接](https://www.aliyun.com) ，选择产品，云服务ECS，立即购买~

2. 基础配置，网络和安全组，系统配置，分组配置，支付~

> 基础配置：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/aliyun001.png')" width="auto"/>

> 网络安全组：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/aliyun002.png')" width="auto"/>

> 系统配置：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/aliyun003.png')" width="auto"/>

- 分组配置一般不用自定义，默认就行~

- 最后，生成订单，支付~

<img class="zoom-custom-imgs" :src="$withBase('/images/project/aliyun004.png')" width="auto"/>


3. 支付成功进入[管理控制台](https://ecs.console.aliyun.com/?spm=5176.12818093.recommends.decs.488716d030QA02#/server/region/cn-beijing)
> 等待状态变为【运行中】，操作栏中重置密码，重启，等待再次状态更改为【运行中】

<img class="zoom-custom-imgs" :src="$withBase('/images/project/aliyun005.png')" width="auto"/>

4. 电脑打开终端，连接云服务器：
``` shell
ssh root@123.57.172.182 # ssh链接服务器，root是用户名，@后面是ip地址
#  首次输入后会有以下提示：yes,输入设置的服务器密码，回车，连接成功
The authenticity of host '123.57.172.182 (123.57.172.182)' can't be established.
RSA key fingerprint is SHA256:s4suihRFD5ZUuWJHnSX9vbKr8KBsF1cT1ATjhtxjCrI.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '123.57.172.182' (RSA) to the list of known hosts.
root@123.57.172.182's password:

Welcome to Alibaba Cloud Elastic Compute Service !

[root@iZ2zef9ue9eyhqrvjxs3aqZ ~]# who  # 查看当前用户
root     pts/0        2020-10-28 17:48 (103.90.188.234)
[root@iZ2zef9ue9eyhqrvjxs3aqZ ~]# exit # 退出登录
logout
Connection to 123.57.172.182 closed.
```

5. 设置免密登录

- 配置rsa密钥

``` shell
#  命令行输入以下命令，生成rsa密钥
ssh-keygen -t rsa

#  一般之前没有生成过，则三次回车之后就可以生成了
#  如果之前生成过则会有以下提示，可以选择不用覆盖，直接使用之前的
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/admin/.ssh/id_rsa):
/Users/admin/.ssh/id_rsa already exists.
Overwrite (y/n)? n

#  生成成功后，会在~/.ssh/目录下生成id_rsa.pub文件
#  输入以下命令，复制该文件，输入密码
➜  ~ ssh-copy-id -i ~/.ssh/id_rsa.pub root@123.57.172.182
# /usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/Users/admin/.ssh/id_rsa.pub"
# /usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
# /usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
# root@123.57.172.182's password:

# Number of key(s) added:        1

Now try logging into the machine, with:   "ssh 'root@123.57.172.182'"
and check to make sure that only the key(s) you wanted were added.

# 这时，直接在命令行输入：ssh root@123.57.172.182，无需输入密码即可连接上服务器了~
➜  ~ ssh root@123.57.172.182
Last login: Wed Oct 28 17:48:29 2020 from 103.90.188.234

Welcome to Alibaba Cloud Elastic Compute Service !

[root@iZ2zef9ue9eyhqrvjxs3aqZ ~]#
```

- 如果觉得每次输入ip地址比较麻烦，可通过修改host文件设置别名：

``` shell
#  终端输入以下命令：
sudo vim /etc/hosts
Password: # 提示输入密码（注意：这里是电脑的开机密码）

#  打开hosts文件内容：
# My hosts

127.0.0.1 www.verneyzhou-code.cn


##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1       localhost
255.255.255.255 broadcasthost
::1             localhost
123.57.172.182  verney-zhou # 输入i，进入编辑模式，输入IP地址和别名；ESC退出，:wq保存退出
~
~

#  ping一下别名，将它指向ip地址
ping verney-zhou
PING verney-zhou (123.57.172.182): 56 data bytes
64 bytes from 123.57.172.182: icmp_seq=0 ttl=50 time=15.344 ms
64 bytes from 123.57.172.182: icmp_seq=1 ttl=50 time=20.342 ms
64 bytes from 123.57.172.182: icmp_seq=2 ttl=50 time=17.580 ms
^C
--- verney-zhou ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 15.344/17.755/20.342/2.044 ms

#  然后输入以下命令，第一次会有提示，输入：yes，即连接成功
➜  ~ ssh root@verney-zhou
# The authenticity of host 'verney-zhou (123.57.172.182)' can't be established.
# RSA key fingerprint is SHA256:s4suihRFD5ZUuWJHnSX9vbKr8KBsF1cT1ATjhtxjCrI.
# Are you sure you want to continue connecting (yes/no)? y
# Please type 'yes' or 'no': yes
# Warning: Permanently added 'verney-zhou' (RSA) to the list of known hosts.
# Last login: Wed Oct 28 18:02:26 2020 from 103.90.188.234

Welcome to Alibaba Cloud Elastic Compute Service !

[root@iZ2zef9ue9eyhqrvjxs3aqZ ~]# exit
logout
Connection to verney-zhou closed.

#  可exit退出之后，再次输入即可直接连接成功！
➜  ~ ssh root@verney-zhou
Last login: Wed Oct 28 18:26:34 2020 from 103.90.188.234

Welcome to Alibaba Cloud Elastic Compute Service !

[root@iZ2zef9ue9eyhqrvjxs3aqZ ~]#
```

> 解决服务器连接成功之后一段时间自动断开的情况：
``` shell
# 打开ssh配置文件：
vim /etc/ssh/sshd_config

# 将ClientAliveInterval修改为30，每30秒客户端保持与服务器的连接
ClientAliveInterval 30

# 退出后输入以下命令，重启配置
service sshd restart
```


## 对象存储OSS
---

1. [购买](https://oss.console.aliyun.com/bucket)
2. 上传



## 备注
---

1. 如果想通过https访问，就需要给这个域名添加ssl证书；
2. 有些域名需要备案才能使用，如.cn结尾的；有些则不需要，如.com，.xyz这种测试用的；域名通过域名解析关联ip地址后，需要备案的域名备案成功后，才能在浏览器访问，不需要备案的则可以直接通过输入域名访问ip地址了~
3. 有时访问已经添加ssl证书的域名会访问不了，提示证书已撤销，重新购买证书，绑定域名，下载证书放到node项目的`https/`目录下，和niginx服务器的`upload/https/`目录下，注意这里本地的nginx服务器和远程的ngnix服务器都要更证书；重新把项目跑起来就可以了~



<fix-link label="Back" href="/project/vue-node-admin/"></fix-link>

<!-- 2021-04-26 -->


