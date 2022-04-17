---
title: 关于代理：Charles、whistle...
date: 2021-05-18 22:23:59
# permalink: false # de7cf6/
article: false
categories: 
  - null
tags: 
  - null
permalink: false # efd9fd/
---



# 关于代理：Charles、whistle...


## Charles

- [Charles 功能介绍和使用教程](https://juejin.cn/post/6844903665304600589)
- [Charles基本使用](http://www.360doc.com/content/21/0329/09/14775740_969511238.shtml)

## whistle


- [whistle Github地址](https://github.com/avwo/whistle/blob/master/README-zh_CN.md)
- [前端应该知道的web调试工具——whistle](https://cloud.tencent.com/developer/article/1704552)
- [关于代理的理解](https://www.jianshu.com/p/c9c30bba3b90)
- [前端代理浅析](https://blog.csdn.net/qq_38217940/article/details/123611058)


1. [安装启动](http://wproxy.org/whistle/install.html)
  - npm install -g whistle
  - w2 start
  - 浏览器打开：http://127.0.0.1:8899/

2. [添加证书](http://wproxy.org/whistle/webui/https.html)
  - 下载证书 》 双击打开 》 添加到钥匙串中
  - 启动台 》 其他 》 钥匙串访问 》 输入“whist”搜索 》 双击 》 【信任】改为“始终信任” 》 关闭


### 浏览器代理：SwitchyOmega

- [SwitchyOmega安装与使用](https://blog.csdn.net/weixin_42940480/article/details/107567262)
- [SwitchyOmega Github地址](https://github.com/FelisCatus/SwitchyOmega/releases/tag/v2.5.20)

下载.crx文件，并将后缀改成.zip 》chrome浏览器输入：chrome:/extensions/  》 将.zip文件拖入浏览器即可 》 配置proxy：127.0.0.1:8899 》 并选中打开（浏览器插件SwitchyOmega中proxy应为高亮状态～）

## 参考




- [https://developer.chrome.com/docs/devtools/remote-debugging/](https://developer.chrome.com/docs/devtools/remote-debugging/)