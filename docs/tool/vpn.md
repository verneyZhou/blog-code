

<!-- 
vultr.tom   https://my.vultr.com/welcome/
zhou
verneyzhou@163.com
20210509zyZY
 -->



# 搭梯子
> 最近发现访问[github](https://github.com/)经常加载不了，这严重打击了我认真学习（上班摸鱼）的积极性；所以最终还是想学习下怎么搭梯子，顺利的访问github，同时也可以看看油管、facebook啥的~这里就是我的搭梯子笔记~

## 购买服务器
要搭梯子，首先得有一台国外的服务器，有很多国外服务商，像aws、google、vultr、搬瓦工，等等；这里我选择的是**vultr**，因为它按小时计费，可以随时删除服务器对应ip被封的情况，而且价格相对便宜，网站简洁，操作简单，支持支付宝支付。

[vultr官网](https://www.vultr.com/)

- 首先就是进到vultr的官网，在下方的输入邮箱、密码，注册账号：

<img :src="$withBase('/images/tool/datizi01.png')" width="auto"/>

> 注：点击中间的`Create acount`会有限时注册的活动，会送100刀，如果点击右上角的就没有啦~！

- 注册成功后会进入这个页面：

<img :src="$withBase('/images/tool/datizi002.png')" width="auto"/>

这里选择`Alipay`，但需要最低充值10刀验证，没办法，必须的，充吧，反正充了也是到自己账户里~


- 注册成功后进入到这个页面，接下来就开始开启实例：
> 第一次进来左上角会有一个邮箱验证的提示，要先去邮箱验证才能开启！

<img :src="$withBase('/images/tool/datizi003.png')" width="auto"/>

点击右上角的`+`号，选择`Deploy New Server`：

<img :src="$withBase('/images/tool/datizi004.png')" width="auto"/>

进入这个页面，开始配置服务器信息：选择`Cloud Compute`；

Server Location选择`Tokyo`或`Singapore`，这两个地方离中国近，速度相对快；

Server Type，就是选择操作系统，推荐选择`Ubuntu 18.04 x64`；

Server Size，当然是选择第一个最便宜的了，`$0.007/h`，配置为1核cpu、1G内存、1000G流量，一个人日常浏览外网完全够用

<img :src="$withBase('/images/tool/datizi005.png')" width="auto"/>

其他的选项都保持默认就行，不用管他，直接点右下角的`Deploy Now`，然后会跳到以下页面，会在列表里自动添加刚刚创建的实例，等待它自动安装完成：

<img :src="$withBase('/images/tool/datizi006.png')" width="auto"/>

等到实例`Status`变为`Running`时，即表示实例生效，接下来点击实例，就进入到这个页面：

<img :src="$withBase('/images/tool/datizi007.png')" width="auto"/>

> 这里会看到当前实例的`ip地址`，用户名和密码，以及其他配置信息和使用情况~

接下来就开始连接服务器吧~

## 连接实例
> 可以下载一个客户端进行连接，mac可以下载`ShellCraft`，我这里就直接用终端连接了，连接方式跟连接阿里云服务器一样~

- 首先打开终端，直接输入`ssh root@45.76.48.38`即可开始连接刚刚创建的远程服务器：
> 这里`root`是刚刚创建实例详情中的`Username`，@后面的ip地址就是实例详情中的`IP Address`；输入之后直接`enter`，会有提示，继续`enter`；然后让输入密码，把实例详情中`Password`复制粘贴过来（注：这里粘贴后是不会展示的，粘贴完直接`enter`就可以）：

``` shell
ssh root@45.76.48.38 # 这里root是刚刚创建实例详情中的 Username
The authenticity of host '45.76.48.38 (45.76.48.38)' can't be established.
ECDSA key fingerprint is SHA256:tR5GCMvSi4yvs/Wz8slMe3gm5z+jMBRO09uuR1aaKys.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '45.76.48.38' (ECDSA) to the list of known hosts.
root@45.76.48.38's password:
Welcome to Ubuntu 18.04.5 LTS (GNU/Linux 4.15.0-141-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

 System information disabled due to load higher than 1.0


30 packages can be updated.
20 of these updates are security updates.
To see these additional updates run: apt list --upgradable


root@vultr:~#
```
> 如上，就表示远程连接服务器成功了~

注：以上只是理想的情况，说明这个ip地址可用，因为还存在创建的实例ip不能用的情况，即通过`ssh`远程连接后没反应；这样就可以考虑重新再创建一个实例，换一个ip地址；等到创建的实例ip地址可以用，再把之前创建的不能用的实例`Server Destroy`删除即可~

## v2ray的配置与安装
> 上面连接上远程服务器后，接下来先配置v2ray~


1. **配置v2Ray**
- 直接输入`bash <(curl -s -L https://git.io/v2ray.sh)`，一键安装：
``` shell
root@vultr:~# bash <(curl -s -L https://git.io/v2ray.sh)

 1. 安装
 2. 卸载
请选择 [1-2]:1 # 选择1
```
之后就是安装 V2Ray 传输协议、选择端口、其他一些配置，一路回车选择默认就可以~

配置之后会让你确认一下信息，确认无误，按回车~

``` shell
---------- 安装信息 -------------

 V2Ray 传输协议 = TCP

 V2Ray 端口 = 33089

 是否配置 Shadowsocks = 未配置

---------- END -------------

按  Enter 回车键  继续....或按  Ctrl + C  取消.
```

安装完成，最后会提示你连接配置信息：


``` shell
---------- V2Ray 配置信息 -------------

 地址 (Address) = 45.76.48.38

 端口 (Port) = 33089

 用户ID (User ID / UUID) = 9ecd08b5-a9f1-49cd-afb3-0c8fbaad72c9

 额外ID (Alter Id) = 0

 传输协议 (Network) = tcp

 伪装类型 (header type) = none

---------- END -------------

V2Ray 客户端使用教程: https://233v2.com/post/4/

提示: 输入  v2ray url  可生成 vmess URL 链接 / 输入  v2ray qr  可生成二维码链接

免被墙..推荐使用JMS: https://getjms.com

root@vultr:~#
```
> 可通过`v2ray qr`生成二维码链接，稍后手机上配置时会用到这个功能；这里面的配置信息稍后会用到~


2. **v2Ray软件安装**

[v2Ray软件下载地址（mac版）](https://github.com/Cenmrev/V2RayX/releases)

- 点击上方地址进行下载安装~

- 安装完成后进行配置：

<img :src="$withBase('/images/tool/datizi101.png')" width="auto"/>

选择`Configure`：

<img :src="$withBase('/images/tool/datizi102.png')" width="auto"/>

这里面填入的**ip地址、端口号、User ID、alterId**就是刚才 **V2Ray 配置信息**里的内容；**Tag** 自定义~

- 创建之后，选择刚刚配置的服务：

<img :src="$withBase('/images/tool/datizi103.png')" width="auto"/>

- 然后load core就是开启：

<img :src="$withBase('/images/tool/datizi104.png')" width="auto"/>

> 到这里我们的梯子就算搭好了~！！！


接下来是见证奇迹的时刻了~随便找个浏览器输入一个外网链接试下：

<img :src="$withBase('/images/tool/datizi106.png')" width="auto"/>

> 这里输入油管的官网：`https://www.youtube.com/`，还真的能访问了~!首页还有我们的李子柒小姐姐~！看来李子柒小姐姐在外网上确实很火呀~哈哈哈...嗝~😁 

之后再访问[github](https://github.com/)也是同样飞一般的感觉~~


- 之后如果想关闭访问，直接将v2Ray的状态切换成`Upload Core`即可~




## 手机端的配置
> pc端配置好了，接下来给手机也配置下~

手机端配置其实也比较简单，就是下载`v2rayNG`软件，然后添加我们创建的服务器，连接就可以了~

这里以安卓机为例：

- 手机端浏览器点击链接进行下载：[下载链接](http://v2rayng.apks.software/)

- 下载完成，安装到手机，打开手机上安装的 v2rayNG 客户端，点击右上角的菜单选项，根据你的需求进行选择即可：

<img :src="$withBase('/images/tool/datizi201.jpeg')" width="auto"/>

这里我选择的是扫描二维码，还记得刚才在远程服务器上配置v2Ray时有个`v2ray qr`生成二维码链接的命令么？在pc浏览器上输入这个命令生成的链接，即得到一个二维码，用`v2rayNG`扫描，就能直接在`v2rayNG`上添加上这个服务器

- 接着返回 v2rayNG 客户端主界面，点击右上角的菜单选项，选择**更新订阅**：

- 很快就可以看到所有的节点信息，点击自己心仪的节点，即可使用相应的节点，选择节点后，点击**右下角的连接图标**，第一次链接会提示 v2rayNG 需要设置一个 vpn 连接，点击确定，即连接上了；再次点击图标即关闭连接；可点击下方测试是否链接成功~

- 可以在手机上下载一个chrome浏览器，然后用这个浏览器随便输入一个外网链接就可以访问，比如`https://m.youtube.com`，等等~

至此，手机上的梯子也搭建好了，接下来就可以翻墙出去尽情撒欢了~！！！



## 参考

- [Vultr注册并购买服务器搭VPN](https://viencoding.com/article/114)
- [如何搭建v2ray，放弃使用ss和ssr](https://viencoding.com/article/207)
- [下载V2RayNG安卓客户端](http://www.wangchao.info/1795.html)
- [v2Ray使用文档](https://qv2ray.net/lang/zh/)


<!-- 2021-05-09 -->
