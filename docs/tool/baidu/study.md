---
title: 学习笔记
date: 2024-10-09 10:46:53
article: false
permalink: false
categories: 
  - null
tags: 
  - null
---


# 学习笔记


## 用增调起

H5调起百度APP：技术层面拉新和促活，提高用户转化？

调起与新增：H5/app
- 已安装: 目标APP => 调起
- 未安装：app store/APK => 目标APP => 新增


### 调起方式

- Scheme调起
- IOS的universal link、
- 安卓的app links
- deep link


#### Scheme调起

- URL Scheme
> 某个APP中的某个资源路径或能力，只要app中注册了某个scheme，访问这个scheme就可以到达相应的目标页面或调用某个能力


百度APP首页scheme: `baiduboxapp://v11/appTab/select?item=home&upgrade=0`

1. 跳转Scheme: 
`location.href = 'baiduboxapp://v11/appTab/select?item=home&upgrade=0'`

2. iframe设置src：
``` js
let node = document.createElement('iframe');
node.style.display = 'none';
node.src = 'baiduboxapp://v11/appTab/select?item=home&upgrade=0';
document.body.appendChild(node);
```


- 优点：最常用，简单，双端支持，没有系统版本限制
- 缺点：
    1. safari下会出现确认/失效弹窗；
    2. 确认弹窗阻塞js进程，失效弹窗不阻塞；
    3. 厂商封禁严重，如UC, 微信，微博等；
    4. scheme无法判断是否安装了目标APP



#### Universal Link
> 苹果15年提出的 ios9 新特性，可通过打开一个https链接直接启动客户端应用（已安装）,提供无缝衔接的用户体验。

ulink就是一个https的链接，当用户没有安装这个app时就是访问一个普通的url，会进入这个页面，可以在这个页面进行下载和跳转等操作


限制：
- ios9+
- https
- APP配置Assoicate Domains
- 跳转不能同域


运作流程:
1. APP第一次启动，或更新版本后第一次启动；
2. APP向工程里配置的域名发起get请求，拉取 apple-app-association Json File 文件；
3. APP将 apple-app-association 注册给系统；
4. 由任意 webview 发起跳转的url, 如果命中 apple-app-association 注册过的通用链接，则打开APP, 触发 Universal Link deleagte;
5. 没命中，继续跳转url;


以百度APP ulink为例：

标准协议：`http[s]://boxer.baidu.com/scheme?scheme=xxx&from=xxx&target=xxx`

- 参数说明：
    - `http[s]://boxer.baidu.com/scheme`: ios接入标准协议主机及路径
    - scheme参数：必选，兼容scheme调起
    - from参数：可选，来源标识
    - target参数：可选，中间页url，调起手百失败后，调起的webview将进入此页面


#### 安卓的app links
> google在 android 6.0+系统上实现的一种深度链接技术，用户可通过打开直接连接，打开APP，跳转到指定页面；如果没有安装，则跳转中间页或应用商店；

国内几乎不可用，google封禁严重，国内厂商基本没有适配

> 目前安卓主要以scheme调起为主


#### Deep Link


借助端能力：如果调起像百度APP这样的端环境，可以借助端能力实现调起，相比浏览器，端环境更强大，更可控


端能力
> h5/RN组件通信的方式，增强调起协议访问安全性




### 调起路径

IOS首选 ulink 调起，安卓使用 scheme 调起

数据统计挂在 scheme 参数上，新增用户通过剪贴板进入目标页面


- 检查是否调起: 通过定时器判断用户是否离开了当前页面

    - 调起黑名单，如微信，微博等
    - 用户权限弹窗：高版本安卓系统...
    - 定时器时间不能太短，一般 2~3s左右


### 调起环境攻防

调起环境封禁：
- 微信封禁 scheme 调起
- uc 夸克封禁手百系 appstore 地址
- 微博封禁矩阵app: 只对合作厂商进行跳转

防封手段：
- 切换host
- 文字、图片口令
- 引导新窗口或浏览器打开




### 口令原理

手百冷启动 =》检测剪贴板内容 =》 是否有符合规则的口令 =》是，上传口令内容到server => server检查是否有指定调起协议 =》有，调起口令弹窗，清除剪贴板内容


- ios写如剪贴板有系统限制，不能静默或异步写入，要在点击事件一秒内完成写入





## 增长类小程序



### 小程序登录

h5: 接口请求会自动带上cookie

小程序：`swan.reqeust`不会携带cookie


小程序模拟cookie实现：storage


- 一键登录：登录成功后再回调里手动更新用户状态
- 三方登录
- 蓝白页登录



### 开发前注意事项

- 显性依赖：文档，埋点,...
- 隐性依赖：sdk，组件，第三方api， 权限

- 网络请求：
    - 请求时机：哪个生命周期发起？
    - 请求参数
    - 请求容错：出错如何处理？
    - 高峰处理：高QPS(req/sec = 请求数/秒)下如何处理？

- 小程序包大小：主包，分包

- 特性检测：
    - 端：小程序宿主环境，如百度APP，微信
    - SwanCore: 百度智能小程序核心框架
    - extension: 百度小程序宿主扩展包


- 日志打点

- 测试
  - 开发者工具
  - 抓包
  - 真机测试
  - 异常测试：弱网，断网，抽奖接口异常下测试



### 上线前注意事项

- 小程序后台：名称，图标，...
- 关联平台
- 代码质量







## SSR


- FMP更短

- TTFB更长，服务端时间更长
- 维护成本更高：需要考虑node和浏览器两种环境


适合ssr场景：
1. 后台系统
2. 功能型页面：个人中心，我的收藏
3. 静态内容：用户无关页面，可考虑预渲染



内容型页面适合ssr, 用户更早看到内容




## Serverless

- 无需服务器维护
- 动态扩缩容
- 按需付费


- Fass：Function as a Service 函数计算
- BaaS：Backend as a Service 后端服务



- Trandition IT: 传统it，应用 =》 机房 + 服务器 + 存储 + ...
- Iaas: Infrastructure as a Service 基础设施即服务
- Cass: Containers as a Service 容器服务
- PaaS: Platform as a Service 平台即服务
- Sass: Software as a Service 软件服务



例：做一个学生管理系统

- 传统模式：机器 =》网络 =》 前后端开发 =》 部署 =》 监控

- 云计算服务：
    - Iaas/Cass；如：K8s
    - PaaS；如：Baidu BAE
    - Sass；如：Saas企业管理软件
    - Serverless；如：Cloud Function




## 前端一站式：F-CNAP

当想新建一个前端应用，所需**资源**：

代码库、域名、HTTPS证书、域名解析、http/2协议、资源存储、网络分发（CDN）、流量分配、流水线配置（iPipe）


**环境**：
- 生产环境
- 阶段性环境：开发，测试，灰度发布
- 需求用环境：某次项目、迭代，最新的状态
- 专人专用环境：可信地永远指向自己最新的提交
- 人对人沟通环境：与RD联调、供PM查看
- 临时环境


**传统的搭建一个环境：**

申请域名 =》申请新机器 =》配置域名解析 =》 配置ssl证书、http/2 =》nginx配置，复制配置文件 =》创建流水线 =》复制部署脚本 =》测试环境可用





社区解决方案：`GitHub Pages / Vercel / Netlify`
> 代码提交即可用，弱化运维成本；工程师专注于代码开发，不用关心环境、部署


- 部署预览：代码提交，自动部署，生成唯一的url，可预览


F-CNAP是基于云原生的应用托管平台，提供一站式的流程、环境、部署等能力
> 零配置、多套环境、集成 iCode,iPipe 等 Devops 工具




## 微前端

微前端发展历程：`巨石应用 =》 前后端分离 =》微服务 =》 微前端`




微前端 vs 组件化

- 微前端关注点在架构体系，隔离子系统，单独构建 / 单独发布；
- 组件化是功能/代码复用，整体构建、发布


框架：`EMP, single-spa, qiankun, micro-app, wujie`












