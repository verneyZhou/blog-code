---
title: 前端跨端技术调研报告
date: 2024-07-28 02:34:18
permalink: false
categories:
  - 跨端
tags:
  - 跨端
---

# 前端跨端技术调研报告




## Taro


官方文档参考：
- [Taro官方文档](https://taro-docs.jd.com/docs/)、[github-taro](https://github.com/NervJS/taro)
- [awesome-taro:Taro 优秀学习资源汇总](https://github.com/NervJS/awesome-taro)
- [Taro官方文档-博客](https://nervjs.github.io/taro-docs/blog)
- [Taro官方-组件库](https://docs.taro.zone/docs/components-desc)
- [Taro官方-API](https://docs.taro.zone/docs/apis/about/desc)
- [Taro UI](https://taro-ui.jd.com/#/docs/introduction)
- [微信小程序开发指南](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [百度小程序开发指南](https://smartprogram.baidu.com/docs/develop/tutorial/intro/)
  - [百度小程序-taro框架开发](https://smartprogram.baidu.com/docs/develop/tutorial/frameworkdevelop/)



博客文档参考：
- [前端开发框架“taro”从入门到爆哭--taro组件库（一）](https://blog.csdn.net/qq_43491495/article/details/135192568)
- [记一次微信小程序从原生到Taro的迁移](https://blog.csdn.net/weixin_41849462/article/details/127488953)
- [基于Taro的多端(小程序+H5)开发实践](https://cloud.tencent.com/developer/article/2049135)
- [使用Taro搭建微信小程序（第一章-创建项目与页面）](https://juejin.cn/post/7397292869604622351)
- [Taro小程序跨端开发入门实战](https://juejin.cn/post/7201665010200248381)
- [Taro 3.x 跨版本升级踩坑指南](https://juejin.cn/post/7148430666906992647)





**小程序开发：**
- `npm run build:weapp`
- `npm run dev:weapp`, 注意根目录下`project.config.json`下`miniprogramRoot`配置~




### 原生混合

- [原生项目使用 Taro](https://docs.taro.zone/docs/taro-in-miniapp)

- [京东购物小程序 | Taro3 项目分包实践](https://juejin.cn/post/6992909883993489422)
- [taro-plugin-indie](https://github.com/NervJS/taro-plugin-indie)
- [小程序使用 Taro 和原生混合开发方案的探索](https://github.com/rottenpen/blog/issues/22)

1. 原生微信小程序跳转taro,百度小程序跳转taro, 跳转登录态保持、分享、
2. 原生小程序使用taro组件，地图组件
3. taro小程序跳转原生小程序


- [实现Taro 项目拆分到多个分包（Taro和原生混合开发）](https://blog.csdn.net/SwingDance/article/details/126501608)、[Taro 项目拆分到多个分包后分包之间的redux状态共享](https://blog.csdn.net/SwingDance/article/details/126827961)、[blended-apart](https://github.com/Zhangwai/blended-apart/tree/dev)






#### 备注

- 百度小程序开发时，根目录下`project.swan.json`中`smartProgramRoot`需与项目根目录 `config` 中的 `outputRoot` 设置的目一样；打包时需将`smartProgramRoot`改为`.`

- Harmony Hybrid开发，通过 TaroWebContainer 集成打包后的h5页面时，如果页面白屏，报`page not found`，原因可能有二：
1. 打包时`publicPath`配置错误，`/` => `./`试下；
2. 将路由模式由`browser` 改为 `hash`



**微信原生小程序 => taro？**
1. 原生小程序中用的一些只适配小程序的第三方node包，taro怎么适配？
  - 比如 tdesign-miniprogram 组件库，转换后会报`Tloading is not defined`之类的错误~
2. 不支持js高级语法，例如扩展运算符，可选链操作符，需要手动改写
3. 不支持小程序插件引入

[weixin-pages-convert](https://github.com/brainee/weixin-pages-convert)


- `npx @tarojs/cli-convertor`报错：
``` bash
Error: Failed to load plugin 'taro' declared in 'BaseConfig': Cannot find module 'eslint-plugin-taro'
Require stack:
- /Users/zhouyuan17/workplace/baidu/adinf/apollo-go-wechat-miniprogram/src/__placeholder__.js
Referenced from: BaseConfig
    at Module._resolveFilena
```



**使用 HTML 标签**

- [使用 HTML 标签](https://docs.taro.zone/docs/use-h5)
- [taro-antd-mobile](https://github.com/NervJS/taro-antd-mobile/tree/master)






### RN开发

- [Taro: React Native 端开发流程](https://docs.taro.zone/docs/react-native)
- [React Native搭建开发环境](https://reactnative.cn/docs/environment-setup)
- [详解最新版 React Native搭建IOS环境过程](https://juejin.cn/post/7220425465294307383)
> 按上述文档安装环境搭建，注意node版本v18+，Ruby 版本切换到 2.7.6~



ios开发调试：
- 本地启动服务，自动打开ios模拟器: `react-native run-ios`
- 本地启动服务，并生成二维码，通过 taro-playground APP 扫码可调试: 
  - 开发调试：`taro build --type rn -- --watch --qr`



**ios打包**

``` json
"bundle-ios":"react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ./ios/bundle/index.ios.jsbundle --assets-dest ./ios/bundle"

// --entry-file ,ios或者android入口的js名称，比如index.js
// --platform ,平台名称(ios或者android)
// --dev ,设置为false的时候将会对JavaScript代码进行优化处理。
// --bundle-output, 生成的jsbundle文件的名称，比如./ios/bundle/index.ios.jsbundle
// --assets-dest 图片以及其他资源存放的目录,比如./ios/bundle
```


- [react-native 打包app发布android / ios详细教程](https://blog.csdn.net/ych1274816963/article/details/120967009)



遗留问题：
1. 怎么产出ios测试包？
2. taro-rn项目在ios模拟器上运行失败




### 报错记录


- `pod-install`报错：
``` shell
> pod-install

Scanning for pods...
1.15.2
> pod install

[!] Invalid `Podfile` file: undefined local variable or method `min_ios_version_supported' for #<Pod::Podfile:0x000000012c6c6380>. 
 #  from /Users/zhouyuan17/code/baidu-test-code/kuaduan/taro-rn/ios/Podfile:9
 #  -------------------------------------------
 #  
 >  platform :ios, min_ios_version_supported
 #  prepare_react_native_project!
 #  -------------------------------------------
Couldn't install Pods. Updating the Pods project and trying again...
> pod install --repo-update
```



- `Error: error:0308010C:digital envelope routines::unsupported`
> 大致的意思是 node版本在 17+版本后增加了OpenSSL3.0，对允许算法和密钥大小增加了严格的限制，将node版本将至 v16+ 试试~





- `WARNING in external "taro_app_library@/remoteEntry.js"`
> https://github.com/NervJS/taro/issues/15413





### 鸿蒙开发
- [鸿蒙 & OpenHarmony](https://docs.taro.zone/docs/harmony/)
- [Harmony Hybrid](https://docs.taro.zone/docs/harmony-hybrid/)
- [使用 harmony-hybrid 平台插件开发鸿蒙应用](https://docs.taro.zone/blog/2024/01/18/harmony-hybrid)
- [@hybrid/web-container](https://ohpm.openharmony.cn/#/cn/detail/@hybrid/web-container)


- [使用 Taro 开发鸿蒙原生应用 —— 快速上手，鸿蒙应用开发指南](https://juejin.cn/post/7325623087210037286)
- [使用Taro4.0开发鸿蒙APP（一）](https://blog.csdn.net/xiaojingling0311/article/details/140378614)
- [Taro 3.5 canary 发布：支持适配 鸿蒙](https://mp.weixin.qq.com/s/Hud405mLileIEzHX3Z-ueQ)



**开发流程：**
1. 打开鸿蒙编辑器 DevEco-Studio，打开项目 harmonyDemo（或者新建一个新项目，选择空白模板）；
  - 项目入口页面：`harmonyDemo/entry/src/main/ets/pages/Index.ets`
  - 查看项目脚本文件 `harmonyDemo/entry/oh-package.json5`，查看是否安装依赖：`@hybrid/web-container`，更新版本后点击右上角`Sync Now`即可自动安装依赖；
2. 右上角设备：`Device Manager` => 登录华为开发者账号，选择设备（之前没有安装设备的需要先申请），Actions选择三角图标运行；
3. 之后回到项目，点击编辑器右上角`Run entry`按钮运行项目；
4. 启动TaroWebController页面：
  - 回到Taro项目，执行`npm run build:harmony`，生成h5文件；
  - 将生成的h5文件复制到`harmonyDemo/entry/src/main/resources/rawfile/`目录下，即可运行；




### 收藏

**参考项目：**
- Taro 使用小程序原生的页面、组件和插件：[taro-sample-weap](https://github.com/NervJS/taro-sample-weapp)
- 基于 Taro3 + React 的开箱即用多端项目模板：[taro3-react-template](https://github.com/lexmin0412/taro3-react-template)
- [taro-template](https://github.com/dshuais/taro-template)：采用 `Taro + React + TypeScript + Webpack + Tailwind css + Zustand + ahooks + Taro-ui` 等技术栈和Taro常用库构建
- [GitHub-Pro](https://github.com/zenghongtu/GitHub-Pro)：一个基于 Taro3 搭建的 GitHub 小程序客户端, 技术栈：`Taro3 / Taro-ui / React-query / React18 / TypeScript`
- [c-shopping-weapp](https://github.com/huanghanzhilian/c-shopping-weapp): taro3开发的电商微信小程序


**其他：**
- [tarojs-plugin-ssr](https://github.com/NervJS/tarojs-plugin-ssr)
- [taro-react-router](https://github.com/AdvancedCat/taro-react-router):  Taro 项目使用 react-router 开发多路由页面
- [taro-music](https://github.com/lsqy/taro-music): `typescript+taro+taro-ui+redux+react-hooks`，基于`Taro`与网易云音乐 api 开发的微信小程序
- [taro-playground](https://github.com/wuba/taro-playground): 官方提供了高度集成的开发环境 Taro Playground。开发者仅需要正常运行 JS 工程，即可进行 APP 调试。




**taro+vue:**
- [taro-vue3-pinia](https://github.com/yanbowe/taro-vue3-pinia)
- [taro3-vue3-template](https://github.com/Yill625/taro3-vue3-template)
- [使用 Taro + Vue3 开发微信小程序](https://juejin.cn/post/7051828074362437663)





## uni-app

- [uni-app官方文档](https://uniapp.dcloud.net.cn/)、[uniapp-github](https://github.com/dcloudio/uni-app)
- [uni-app 开发鸿蒙应用](https://zh.uniapp.dcloud.io/tutorial/harmony/dev.html)
- [uni-app 案例](https://uniapp.dcloud.net.cn/case.html)
- [Uni Helper](https://uni-helper.js.org/)

- [还学鸿蒙原生？vue3 + uniapp 可以直接开发鸿蒙啦！](https://juejin.cn/post/7395964591799025679)

- [uniapp开发微信小程序，我踩了大家都会踩的坑](https://juejin.cn/post/7361688292351967259)








## Flutter

[Flutter学习笔记](./flutter.html)








## HarmonyOS

- [HarmonyOS NEXT 开发文档](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)
- [HarmonyOS开发-快速入门](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/quick-start-V5)
- [HarmonyOS开发-创建模拟器](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-emulator-create-0000001885957357-V5)

- [鸿蒙开发实践-基础入门](https://juejin.cn/column/7392535991972266035)





## 收藏


## 参考



