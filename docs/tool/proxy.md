---
title: 常用代理工具整理
date: 2023-02-04 22:23:59
# permalink: false # de7cf6/
# article: false
categories: 
  - 代理
tags: 
  - 代理
  - Charles
  - Whistle
permalink: false # efd9fd/
---



# 常用代理工具整理
> 工欲善其事，必先利其器。前端开发中好用的代理工具对于开发和调试来讲往往能起到事半功倍的效果~这里会收集整理一些常用的代理工具，也会记录些如远程真机调试的玩法，以便日后工作中会用到~


## Charles
> Charles 是在 PC 端常用的网络封包截取工具，在做移动开发时，我们为了调试与服务器端的网络通讯协议，常常需要截取网络封包来分析。Charles 通过将自己设置成系统的网络访问代理服务器，使得所有的网络访问请求都通过它来完成，从而实现了网络封包的截取和分析。[Charles官网](https://www.charlesproxy.com/)

关于Charles的介绍和使用这篇博文已经介绍得很详细的，具体见这里：[Charles 功能介绍和使用教程](https://juejin.cn/post/6844903665304600589)


官方版本有时可能因为墙的原因下载不了，[Charles 4.6.1 Mac上的抓包工具](https://xclient.info/s/charles.html)上面有破解版可以下载；

下载安装具体流程可参照这里：[CharlesMac破解版安装以及使用](https://www.jianshu.com/p/0bc767840e42)




### https代理

- **CA证书安装**
> 安装 CA 证书的目的是为了抓包 https 请求，完成 SSL 证书校验~

**mac端：**
1. 打开Charles > help > SSL Proxying > Install Charles Root Certifacate，进行添加；
2. 设置证书为始终信任：
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/charles01.png')" width="auto"/>


**安卓端：**
> 安装端的抓包配置可以参照这篇博文：[使用Charles和小米手机MIX3进行手机HTTPS抓包](https://blog.csdn.net/barnett_xxf/article/details/91126255)

- **SSL Proxying设置**

Charles > Proxy > SSL Proxying Settings：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/charles02.png')" width="auto"/>

> 设置完毕，重新启动即可~



具体的https代理、移动端抓包配置可以参考这里：[前端工程师应该掌握的抓包神器工具—Charles，会了真香](https://juejin.cn/post/7121496066591031310)


- **Breakpoint Settings(断点设置)**

Proxy > Breakpoints Settings：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/charles03.png')" width="auto"/>

> 参考：[抓包工具：Charles-断点](https://www.jianshu.com/p/7479866a1d8e)

抓包的时候如果出现的unknown问题，应该是没有安装ssl证书，安装并添加后就可以了~

## Whistle
> whistle是基于Node实现的跨平台web调试代理工具，类似的工具有Windows平台上的Fiddler，主要用于查看、修改HTTP、HTTPS、Websocket的请求、响应，也可以作为HTTP代理服务器使用，不同于Fiddler通过断点修改请求响应的方式，whistle采用的是类似配置系统hosts的方式，一切操作都可以通过配置实现。[whistle官网](http://wproxy.org/whistle/)

具体的安装启动，代理和https证书的配置上方官网已经很详细了

也可参考这篇博文进行学习，也讲得很详细：[前端应该知道的web调试工具——whistle](https://cloud.tencent.com/developer/article/1704552)

下面简单记录下安装配置过程~



### 安装启动
> 参考：[安装启动](http://wproxy.org/whistle/install.html)

1. `npm install -g whistle`
2. `w2 start`
3. 浏览器打开：`http://127.0.0.1:8899/`


### SwitchyOmega
> [SwitchyOmega](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif)是chrome的插件，通过它我们可以很方便的切换chrome的代理。

上方链接是chrome应用商店官方下载链接，如果我们没有翻墙工具可能访问不了，可直接下载SwitchyOmega的安装包进行安装，参考：[SwitchyOmega安装与使用](https://blog.csdn.net/weixin_42940480/article/details/107567262)、[SwitchyOmega Github地址](https://github.com/FelisCatus/SwitchyOmega/releases/tag/v2.5.20)

1. 下载`.crx`文件，并将后缀改成`.zip`
2. chrome浏览器输入：`chrome:/extensions/`
3. 将`.zip`文件拖入浏览器即可
4. 配置`proxy：127.0.0.1:8899`, 并选中打开（浏览器插件`SwitchyOmega`中`proxy`应为高亮状态～）



### 添加CA证书
> 如果需要代理https链接，还需要安装CA证书，参考：[安装根证书](http://wproxy.org/whistle/webui/https.html)

1. 下载证书 》 双击打开 》 添加到钥匙串中
2. 启动台 》 其他 》 钥匙串访问 》 输入`whistle`搜索 》 双击 》 【信任】改为“始终信任” 》 关闭



### 访问

配置完成后，这时在浏览器中随便访问一个网页，即可在`http://127.0.0.1:8899/`的`network`中可以看到拦截的`http`和`https`（如果安装了CA证书）请求~

接着在`rules`中添加一条配置：`www.baidu.com 127.0.0.1:8081`，访问`https://www.baidu.com`，即可访问到你本地的服务了~
> 关于`Whistle`中`rules`的具体配置模式可参考这里：[配置方式](http://wproxy.org/whistle/mode.html)


### 移动端代理
> 这里主要记录安卓机的配置~

1. 手机连上跟电脑同一个WIFI，在这个wifi下代理切换为【手动】，配置主机名：xx.xx.xx.xx（自己电脑ip地址）、端口：8899，保存；
2. 手机下载`chrome`浏览器，地址输入：`rootca.pro` 下载`CA`证书；下载完成，进入手机【设置】，搜索【证书】，可进行安装；
3. 安装完成，即可访问测试链接，在`PC whistle`控制台即可抓到网络请求~


### 问题记录

- 重启电脑后会连不上网，应该是chrome插件`Proxy SwitchyOmega`的问题，找到它的`.zip`文件，重新拖入 `chrome://extensions`，由 【proxy】切换为【直接连接】即可~
- 重启电脑后，终端输入`w2 start`不生效，应该是`whistle`没了，全局重装下就可以~



### 其他

- 关于switchhost和whistle用法区别：[关于代理的理解](https://www.jianshu.com/p/c9c30bba3b90)
- [前端代理浅析](https://blog.csdn.net/qq_38217940/article/details/123611058)





## Fiddler
> Fiddler是一款常用的免费代理工具，用于调试Web应用程序和HTTP API。它能够监控和分析网络流量，并提供许多有用的功能，如请求和响应分析、断点调试、修改请求和响应、重定向、缓存等；

Fiddler最初是为Windows操作系统设计的，但是现在也有Mac和Linux版本。它提供了一个易于使用的用户界面，允许用户通过HTTP/HTTPS代理来查看请求和响应的详细信息，包括头部信息、响应体、Cookie、SSL信息等等。此外，它还提供了一个强大的脚本编辑器，允许用户编写自定义的脚本来扩展其功能。

Fiddler广泛应用于Web开发和测试中，可用于调试前端页面、API、移动应用程序等。它也被广泛用于网络安全领域，用于网络流量分析、漏洞测试等。

[Fiddler官网](https://www.telerik.com/fiddler)

[Fiddler “抓包“最新详细教程](https://juejin.cn/post/6844904042422861831)




