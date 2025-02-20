---
title: 微信小程序开发笔记
date: 2021-04-26 15:00:30
# permalink: false # 22e8ca/
article: false
categories: 
  - null
  - null
tags: 
  - null
permalink: false # 88cb28/
---


# 微信小程序开发笔记

[小程序开发指南](https://developers.weixin.qq.com/miniprogram/dev/framework/)


## 开发流程


- 打开[微信公众平台](https://mp.weixin.qq.com/)，注册账号；账号为没有注册过公众号或小程序的邮箱，需要填写身份证号、手机号，跟着提示操作即可。

注册成功之后，登录进来就进入到如下页面：

<img class="zoom-custom-imgs" :src="$withBase('/images/mobile/mini001.png')" width="auto"/>

> 查看小程序AppID:开发 》 开发管理 》  开发设置 》 开发者ID



- 下载[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html), 下载成功之后，打开微信开发者工具，选择小程序，微信扫码登录，进入到如下页面：

<img class="zoom-custom-imgs" :src="$withBase('/images/mobile/mini002.png')" width="auto"/>


- 点击上图`+`号，新建一个小程序，进入如下界面：

<img class="zoom-custom-imgs" :src="$withBase('/images/mobile/mini003.png')" width="auto"/>

自定义项目名称，选择项目目录(若无则在该目录下新建一个文件夹)，输入小程序的AppID，先选择【不使用云服务】，点击创建；创建成功之后则进入到如下界面：

<img class="zoom-custom-imgs" :src="$withBase('/images/mobile/mini004.png')" width="auto"/>

> 打开项目之后，就可以在开发者工具或vscode中进行代码编辑~


- 添加如button按钮客服功能：代码中添加button组件`<button type="primary" open-type="contact">客服</button>`；开发者平台：`功能 》 客服`，添加微信号；这样点击按钮就自动跳转

<img class="zoom-custom-imgs" :src="$withBase('/images/mobile/mini005.png')" width="auto"/>


[小程序组件](https://developers.weixin.qq.com/miniprogram/dev/component/)


- 真机调试：开发者工具顶部【预览】，微信扫码即可调试~




### 云开发

