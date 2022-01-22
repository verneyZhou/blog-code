---
title: 记一次服务器中毒经历
date: 2021-05-23 20:24:18
permalink: /pages/084373/
categories:
  - 
tags:
  - 
---
# 记一次服务器中毒经历


## 背景
发现问题的时候是夜里两点。

当时正准备关电脑睡觉，临睡前在手机点了点刚推上去的博客，后来想换个浏览器试试，看看有没有兼容性问题，因为之前一直都是在微信里打开的~ 结果当换用chrome打开时，页面直接崩溃404了....我复制链接在其他浏览器试试，还是404，于是我马上打开电脑，ping下ip地址，能ping通，但ssh连接的时候报错了，连不上~
> 报错信息：`Connection closed by 123.57.172.182 port 22`

我的服务器突然莫名奇妙得就连不上了~为何？

网上百度一遍，有说改 ssh 配置的，有说改阿里云控制台安全组规则的，还有说是防火墙限制问题的，看了一会儿，还是不知所云~算了，明天再看吧，老年人，肝不起~

于是，第二天上午啥事没干，就研究这个问题了~之前还好好的，突然就连不上了，难道是跟我最近连的另一个 vultr 的服务器有关？我把它关了，再试也不行，永远的`Connection closed`，哎~

中午想着要不重启下服务器吧，毕竟重启能解决90%的问题~然而等我重启之后，连 ping 都 ping 不通了...
> 报错信息：`Request timeout for icmp_seq 0; 2 packets transmitted, 0 packets received, 100.0% packet loss`

旧的问题没解决，新的问题又出现，又是百度一圈，更疑惑了，找阿里云官方文档看看吧~ 阿里云官方文档回答得也很官方，说造成 ping 不通的原因有很多，先检查服务器的配置，巴拉巴拉一大堆，又给了一连串文档，点进去看了还是不得其解~

我先是看看防火墙设置，增加了ip白名单，然后在控制台通过远程连接，结果 VNC 能连接上，但连上后的界面和正常的不一样~

<img class="zoom-custom-imgs" :src="$withBase('/images/project/aliyun-reset-vnc.png')" width="auto"/>

隐约感觉我的服务器好像被攻击了~~~但还是不得其解~

然后问题就搁置到周日了，最后实在没办法，给阿里云提了个工单，说了我的问题，响应倒是挺及时，夜里三点给我回复，只是当时我已经睡了~~~

第二天阿里的工程师告诉我说，他通过挂盘看我的服务器，说我的服务器中毒了：

<img class="zoom-custom-imgs" :src="$withBase('/images/project/aliyun-reset002.png')" width="auto"/>

莫名奇妙就中毒了...看了控制台的报警，昨天有个进程占了CPU 90%，可能是被人占了用来挖矿了吧...哎~

当时我配置系统一步一步坑踩过来就花了好长时间...那就重装一遍吧，顺便加固下服务器，不能再这么容易被人攻击了~


## 解决流程

1. 初始化实例，重装系统

::: tip 初始化系统盘步骤如下：
- 第1步：您先对此服务器的系统盘和数据盘创建快照进行备份。
> 创建快照，[参看文档](https://help.aliyun.com/document_detail/25455.html)
- 第2步：重新初始化系统盘，恢复到最初始的状态，然后正常启动服务器。
> 重新初始化系统盘，[参看文档](https://help.aliyun.com/document_detail/25449.html)
- 第3步：如果是linux系统，重新初始化系统盘后，/etc/fstab文件中的挂载信息会被重置，您需要重新创建挂载点并挂载文件系统。
- 第4步：您通过系统盘快照创建一个按量付费的云盘，然后把该云盘挂载到服务器中作为数据盘，从数据盘中找回您所需数据。
> 使用快照创建云盘，[参看文档](https://help.aliyun.com/document_detail/32317.html)
- 第5步：挂载云盘到服务器上。[参考文档](https://help.aliyun.com/document_detail/25446.html)进行。
:::


2. 实例配置
> node、nginx、git、mySql...

具体参考[阿里云服务器相关](./aliyun-server.html) 和 [阿里云centOS服务器搭建](./aliyun-centos.html)


3. 添加安全组规则


## 加固
> 之前配置服务器的时候想的就我这个小服务器，应该不会被别人盯上，所以在安全配置上就没怎么在意，结果就轻而易举地被黑客攻击了~


### 参照

- 如果已经进行了初始化，请参考此[文档](https://help.aliyun.com/knowledge_detail/49809.html )对linux系统做安全加固；
> 并且建议通过快照策略，对服务器进行定期的备份，出现紧急情况，也可以用快照做恢复。快照策略的介绍，可[参考](https://help.aliyun.com/document_detail/127811.html)

- 可以通过安全组，对端口策略做加固。将非业务端口，仅对本地的出口IP放行。比如，如果搭建的是网站业务，只有`80`和`443`端口，是业务端口，业务端口可以保持对`0.0.0.0`开放。
> 您的本地公网IP，可以访问 ipip.net 或 ip138.com，通过页面显示的IP地址来获取。修改安全组规则，可[参考](https://help.aliyun.com/document_detail/101471.html)


### 操作

1. 操作系统加固

2. 创建自动快照策略

3. 云防火墙设置
> 随时关注漏洞报警，及时修复

4. 修改安全组规则
> 将`22`这种端口的授权对象改为仅限本机对外ip~

查询对外ip地址：[ip138](https://www.ip138.com/)





## 常见命令

``` shell

top  # 查看cpu使用情况

kill  -9 pid  # 强制结束进程

pstree -a  # 查看进程树

service sshd restart  # 重启服务

ifconfig -a  # 查看本地ip

```


## 问题记录


1. 初始化系统，第一次`ssh`登录远程ip地址报错：

``` shell
➜  ~ sudo ssh root@123.57.172.182
Password:
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
SHA256:FcqhNG5zlQvtY+qiIjlKBDKjxTJijsegK39HNzImHlU.
Please contact your system administrator.
Add correct host key in /var/root/.ssh/known_hosts to get rid of this message.
Offending RSA key in /var/root/.ssh/known_hosts:1
RSA host key for 123.57.172.182 has changed and you have requested strict checking.
Host key verification failed.
```
`ssh-keygen -R 要登录的171服务器ip（10.10.10.171）`

[参考](https://blog.csdn.net/liqi_q/article/details/78465949)





2. `yum install`安装的时候报错：

``` shell
[root@iZ2zef9ue9eyhqrvjxs3aqZ ~]# yum -y install pcre*
已加载插件：fastestmirror
设置安装进程
Loading mirror speeds from cached hostfile
http://mirrors.cloud.aliyuncs.com/centos/6/os/x86_64/repodata/repomd.xml: [Errno 14] PYCURL ERROR 22 - "The requested URL returned error: 404 Not Found"
尝试其他镜像。
To address this issue please refer to the below knowledge base article

https://access.redhat.com/articles/1320623

If above article doesn't help to resolve this issue please open a ticket with Red Hat Support.

错误：Cannot retrieve repository metadata (repomd.xml) for repository: base. Please verify its path and try again
[root@iZ2zef9ue9eyhqrvjxs3aqZ ~]#
```
- 报错2：

``` shell
http://mirrors.cloud.aliyuncs.com/epel/6/x86_64/repodata/repomd.xml: [Errno 14] PYCURL ERROR 22 - "The requested URL returned error: 404 Not Found"
尝试其他镜像。
```

[参考](https://blog.csdn.net/qq_43414199/article/details/111300080)、[参考](http://mirrors.aliyun.com/centos/)

或者在控制台将该实例的操作系统改为`CentOS v7`以上，然后重新连接，重新配置~



3. 配置`nginx.conf`报错：
``` shell
[root@iZ2zef9ue9eyhqrvjxs3aqZ nginx]# nginx -t
nginx: [emerg] the "ssl" parameter requires ngx_http_ssl_module in /root/nginx/nginx.conf:21
```
[参考](https://blog.csdn.net/chanlingmai5374/article/details/81217330)


4. `nginx -s reload`报错
``` shell
[root@iZ2zef9ue9eyhqrvjxs3aqZ https]# nginx -s reload
nginx: [warn] conflicting server name "localhost" on 0.0.0.0:80, ignored # 配置的80端口重复了，把默认的改成其他就行
nginx: [error] invalid PID number "" in "/usr/local/nginx/logs/nginx.pid"
```
解决：`/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf`

[参考](https://blog.csdn.net/cxs123678/article/details/80201412)


5. `git clone git@github...`报错
``` shell
[root@iZ2zef9ue9eyhqrvjxs3aqZ admin-book]# git clone git@github.com:verneyZhou/ebook-admin-node.git
正克隆到 'ebook-admin-node'...
The authenticity of host 'github.com (13.250.177.223)' can't be established.
RSA key fingerprint is 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'github.com,13.250.177.223' (RSA) to the list of known hosts.
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
[root@iZ2zef9ue9eyhqrvjxs3aqZ admin-book]#
```
安装了`git`后，还没有进行初始化，和密钥配置
- `git config --global user.email "verneyzhou@163.com"` 设置git账号
- `ssh-keygen -t rsa -C "verneyzhou@163.com"` 生成密钥，添加到github





6. `yum -y install mysql-server`提示：
``` shell
[root@iZ2zef9ue9eyhqrvjxs3aqZ nginx]# yum -y install mysql-server
已加载插件：fastestmirror
Loading mirror speeds from cached hostfile
没有可用软件包 mysql-server。
错误：无须任何处理
```
[参考](https://blog.csdn.net/looo000ngname/article/details/106545610)








## 备注

- `nginx.conf`
``` shell
server {
        listen 80;
        #  http默认端口号80,这里用了80之后，直接在浏览器输入ip就可以访问了~
        #  最好把/usr/local/nginx/conf/nginx.conf中的端口改成其他，不然会有冲突
        server_name localhost;
        root /root/nginx/upload;
        autoindex on; # 打开索引
        add_header Cache-Control "no-cache,must-revalidate";  #  http中添加不进行缓存的配置
        location / { # 所有路由匹配
                add_header Access-Control-Allow-Origin *;  #  添加跨域支持
        }
}


#  https配置：
server {
        listen 443 default ssl;
        server_name localhost;
        root /root/nginx/upload;
        autoindex on; # 打开索引
        add_header Cache-Control "no-cache,must-revalidate";  #  http中添加不进行缓存的配置
        location / { # 所有路由匹配
                add_header Access-Control-Allow-Origin *;  #  添加跨域支持
        }

         #  证书密钥:nginx新建https文件夹，将密钥放这里~
          ssl_certificate /root/nginx/https/verneyzhou-code.cn.pem;  #  证书
          ssl_certificate_key /root/nginx/https/verneyzhou-code.cn.key; #  密钥

          ssl_session_timeout  5m;  # 超时时间 5min
          ssl_protocols  SSLv3 TLSv1;
          ssl_ciphers  ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP;
          ssl_prefer_server_ciphers  on;
}
```

<fix-link label="上一级" href="/project/vue-node-admin/"></fix-link>

<!-- 2021-05-24 -->