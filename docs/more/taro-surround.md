---
title: taro开发实操笔记
date: 2024-09-29 11:04:56
permalink: false
categories:
  - 跨端
tags:
  - 跨端
  - taro
---

# taro开发实操笔记


## TODO

- 多端适配：微信，百度，抖音，h5，ios，android
- 小程序登录授权
- docker自动化部署
- 后台管理系统：vite+vue3



## 开发流程

[taro-快速开始](https://docs.taro.zone/docs/next/GETTING-STARTED)


### 项目初始化

> node v18+

- 全局安装taro：`npm install -g @tarojs/cli`

- 初始化：`taro init taro-fe-react`; 根据提示选择对应模板:

``` sh
$ taro init taro-fe-project
👽 Taro v4.0.5

Taro 即将创建一个新项目!
Need help? Go and open issue: https://tls.jd.com/taro-issue-helper

? 请输入项目介绍 taro-fe-project
? 请选择框架 React
? 是否需要使用 TypeScript ？ Yes
? 请选择 CSS 预处理器（Sass/Less/Stylus） Sass
? 请选择包管理工具 yarn
? 请选择编译工具 Webpack5
? 请选择模板源 Github（最新）
✔ 拉取远程模板仓库成功！
? 请选择模板 
  react-native-harmony 
  redux 
❯ taro-hooks@2x（使用 taro-hooks@2x 版本的模板） 
  taro-ui（使用 taro-ui 的模板） 
  wxcloud（云开发模板） 
  wxplugin 
  youshu（腾讯有数统计模板（https://nervjs.github.io/taro/docs/youshu）） 
(Move up and down to reveal more choices)
```
> 选择完成后，等待脚手架创建完成即可~


- 创建完成后，进入项目目录，`yarn install`安装依赖；



### 多端开发

#### 微信小程序

> 关于微信小程序的开发流程具体见[微信小程序开发笔记](/project/mini-program)，这里不再赘述~

- 确认项目根目录下是否有`project.config.json`文件，保证该文件中`miniprogramRoot`和`config/index.js`下的`outputRoot`保持一致，如都为`dist/weapp/`;

- `npm run dev:weapp`启动微信小程序本地编译；

- 微信开发者工具下载完成后，打开，选择当前项目进行预览，不出意外的话就能打开当前项目了~ 

- 之后在编辑器中修改点本地代码，可以看到开发者工具也同步刷新了，就可以进行项目开发了~


#### 百度小程序

[百度小程序开发指南](https://smartprogram.baidu.com/docs/develop/tutorial/intro/)、[百度小程序-taro框架开发](https://smartprogram.baidu.com/docs/develop/tutorial/frameworkdevelop/)


- 确保项目根目录下已有配置文件 `project.swan.json`，且`smartProgramRoot`需与项目根目录 `config` 中的 `outputRoot` 设置的目录一样，如为`dist/swan`

- `npm run dev:swan`启动百度小程序编译；

- 下载[百度开发者工具](https://smartprogram.baidu.com/docs/develop/devtools/page_start/)，登录，添加项目，流程跟上面的微信开发者工具差不多~ 开发者工具打开项目后，点击【刷新】即可看到编译后的项目了~ 


- 之后更新代码后，开发者工具也会同步更新，就可以进行开发了~


**抖音小程序**
> 本来想再输出各抖音小程序版本，但发现抖音小程序需要注册企业账号才能开发小程序，流程比较复杂，就先不考虑它了~ 其实开发流程跟微信小程序类似~ 


#### H5

[taro-h5](https://docs.taro.zone/docs/next/h5)

- h5开发比较简单，直接`npm run dev:h5`即可启动服务，直接在浏览器中打开即可~



#### React Native 端

Taro开发 RN 项目稍微复杂些，官方提供了 `集成模式` 和 `分离模式` 两种方式，具体可以查看官方文档[React Native 端开发流程](https://docs.taro.zone/docs/next/react-native)~

- **集成模式**大致就是在 taro 初始化创建项目的时候直接选择 `react-native` 模板，然后就可以得到一个`JS、iOS、Android`集成在一起的项目

- **分离模式**就是JS 代码在一个仓库，iOS 和 Android 代码在另外一个仓库；JS部分就是在taro初始化的时候选择任意模板生成，iOS 和 Android 部分在另一个壳工程仓库中
> 集成模式需要在两个仓库分别开发，两个仓库都需要安装依赖，并且需要保持某些依赖版本的一致性，项目也依赖原生的运行环境，这些对于一个没有开发过 React Native 项目的新手可能不太友好，所以后面 taro 出了集成模式，将 JS 和 iOS、Android 代码集成在一起，这样开发起来会方便很多。[Taro React Native 重大更新：帮助开发者高效开发APP](https://taro.redwoodjs.cn/blog/)


想了解RN开发环境搭建，可以参考：
- [React Native搭建开发环境](https://reactnative.cn/docs/environment-setup)
- [详解最新版 React Native搭建IOS环境过程](https://juejin.cn/post/7220425465294307383)
> 按上述文档安装环境搭建，注意node版本v18+，Ruby 版本切换到 2.7.6~

> 看了下文档，搭建 RN 开发环境确实比较复杂，ios需要安装 xcode和模拟器等等，安卓开发环境搭建那就更复杂了.....综上，还是选择集成模式吧.....


由于我这里是先选择的taro-ui模板进行项目搭建，并且已经进行了一些工程化配置，所以如果重新选择 `react-native` 模板新建项目心里肯定一百个不愿意，所以我的做法是先新建另一个选择了 `react-native` 模板的项目，然后跟我现在的`taro-fe-proejct`项目比较，然后把rn部分的配置粘过去😶....



- 安装rn依赖：`yarn add @react-native-community/cli-platform-android @react-native/gradle-plugin @tarojs/components-rn @tarojs/rn-supporter @tarojs/runtime-rn @tarojs/taro-rn react-native tsconfig-paths-webpack-plugin -S`

- 继续安装rn依赖：`yarn add @tarojs/rn-runner @react-native/metro-config @react-native/typescript-config install-peerdeps pod-install -D`

- 然后将rn相关的配置文件复制到现在的项目目录下；











### 项目基础配置
> 项目初始化完成，也能在各小程序端跑起来了，之后就可以做一些项目工程化的配置了~

- axios配置....
- tailwindcss配置...



### CI/CD配置



## 问题记录


- 微信小程序【预览】报错：
``` sh
message：预览 Error: 非法的文件，错误信息：invalid file: subpackages/login/index.js, 264:42, SyntaxError: Unexpected token .    console.log('请求取消url:>> ', err.config?.url); [20240929 11:06:51][wxf9c770dde77eb718]
appid: wxf9c770dde77eb718
openid: o6zAJszeDwjewNb0_FiV-dQ-9gJ0
ideVersion: 1.06.2405020
osType: darwin-arm64
time: 2024-09-29 11:06:57
```
> 代码中使用可`?.`可选链，`微信小程序开发者工具 => 项目设置 => 本地设置` 未勾选`将js编译成es5`，勾选即可~



- 警告：`Deprecation The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.`
> sass版本过高，需要降级：`npm install sass@1.78.0 --save-dev`; [参考](https://blog.csdn.net/2401_84779204/article/details/142468290)


- 警告：
``` sh
Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.
```
> sass版本原因，降级可取消警告：`npm install sass@1.7.6 --save-dev`



- `yarn upgradePeerdeps`时报错：
``` sh
> pod install

[!] Invalid `Podfile` file: undefined local variable or method `min_ios_version_supported' for #<Pod::Podfile:0x00000001289bc778>.

 #  from /Users/zhouyuan17/code/baidu-test-code/surround-project/taro-fe-react/ios/Podfile:9
 #  -------------------------------------------
 #  
 >  platform :ios, min_ios_version_supported
 #  prepare_react_native_project!
 #  -------------------------------------------
Couldn't install Pods. Updating the Pods project and trying again...
> pod install --repo-update

[!] Invalid `Podfile` file: undefined local variable or method `min_ios_version_supported' for #<Pod::Podfile:0x0000000144a814f8>.

 #  from /Users/zhouyuan17/code/baidu-test-code/surround-project/taro-fe-react/ios/Podfile:9
 #  -------------------------------------------
 #  
 >  platform :ios, min_ios_version_supported
 #  prepare_react_native_project!
 #  -------------------------------------------
Couldn't install Pods. Updating the Pods project and trying again...
Command `pod install` failed.
└─ Cause: Invalid `Podfile` file: undefined local variable or method `min_ios_version_supported' for #<Pod::Podfile:0x0000000144a814f8>.

 #  from /Users/zhouyuan17/code/baidu-test-code/surround-project/taro-fe-react/ios/Podfile:9
 #  -------------------------------------------
 #  
 >  platform :ios, min_ios_version_supported
 #  prepare_react_native_project!
 #  -------------------------------------------

pod install --repo-update --ansi exited with non-zero code: 1
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```