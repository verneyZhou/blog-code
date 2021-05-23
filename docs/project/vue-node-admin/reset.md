# 记一次服务中毒经历


## 背景
发现问题的时候是夜里两点。

当时正准备关电脑睡觉，临睡前又在手机点了点我的博客，看看有没有什么问题~后来想之前我一直都是在微信里打开，还没在其他浏览器试过，于是就直接在其他浏览器打开看看，结果直接404了....我复制链接在其他浏览器试试，还是404，于是我马上打开电脑，ping下ip地址，能ping通，但ssh连接的时候报错了，连不上~
> 报错信息：`Connection closed by 123.57.172.182 port 22`

初步得出结论：我的阿里云服务器突然莫名奇妙得就连不上了~为何？

网上百度一遍，有说改ssh配置的，有说改阿里云控制台安全组规则的，还有说是防火墙限制问题的，看到三点，还是不知所云~算了，明天再看吧，老年人，肝不起~

于是，第二天上午啥事没干，就研究这个问题了~之前还好好的，突然就连不上了，难道是我跟我最近连的另一个 vultr 的服务器有关？我把它关了，再试也不行，永远的`Connection closed`，哎~

中午想着要不重启下服务器吧，毕竟重启能解决90%的问题~然而等我重启之后，连 ping 都 ping 不通了...

旧的问题没解决，新的问题又出现，又是百度一圈，更疑惑了，找阿里云官方文档看看吧~ 阿里云官方文档回答得也很官方，说造成 ping 不通的原因有很多，先检查



## 解决问题的过程


## 方案

初始化实例，重装系统


## 重新配置


## 加固


## 问题记录

- `ssh root@ip` 之后提示 `Connection closed by 123.57.172.182 port 22`，连接不上远程服务器~


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