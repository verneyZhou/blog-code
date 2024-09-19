---
title: 监控埋点调研报告
date: 2024-06-16 10:10:44
permalink: false
categories:
  - 工程化
  - 前端监控
tags:
  - 前端监控
  - 工程化
---

# 监控埋点调研报告



## 调研


浏览器内核:
- Safari: webkit内核
    - WebCore: 负责HTML解析、布局、渲染等等相关的工作，将网页内容转化为用户可以看到和与之互动的视觉表示。
    - JavaScript引擎：JavaScriptCore: 解析、执行JavaScript代码。

- Chrome: V8

WebCore 的渲染过程：
- HTML => HTML Parser => DOM Tree  => 合并 => Render Tree => Layout => 绘制 => 合成
- CSS  => CSS Parser => CSSDOM Tree ↑


小程序：
    - 渲染层：Webview
    - 逻辑层：JsCore



### 统计数据

前端监控一般也分为三大类：
1. 数据监控（监控用户行为）
2. 性能监控（监控页面性能）
3. 异常监控（监控产品、系统异常）


pv, uv，首屏加载时间，白屏时间，http请求响应时间，静态资源下载时间，页面渲染时间，页面交互动画完成时间

页面性能数据：
- FP（白屏）First-Paint 首次渲染：表示浏览器从开始请求网站到屏幕渲染第一个像素点的时间。`<= 2s`
- FCP（灰屏） First-Contentful-Paint 首次内容渲染：表示浏览器渲染出第一个内容的时间，这个内容可以是文本、图片或SVG元素等等，不包括iframe和白色背景的canvas元素。`<= 1.8s`
> 提高FCP的时间其实就是在优化[关键渲染路径](https://developer.mozilla.org/zh-CN/docs/Web/Performance/Critical_rendering_path); 提高FCP 的核心只有理念之后两个 `减少初始化视图内容和` `减少初始化下载资源大小`

> FP 指的是绘制像素，比如说页面的背景色是灰色的，那么在显示灰色背景时就记录下了 FP 指标。但是此时 DOM 内容还没开始绘制，可能需要文件下载、解析等过程，只有当 DOM 内容发生变化才会触发，比如说渲染出了一段文字，此时就会记录下 FCP 指标。因此说我们可以把这两个指标认为是和白屏时间相关的指标，所以肯定是最快越好。


- FMP: 首次有效绘制；页面渲染过中 元素增量最大的点，因为元素增量最大的时候，页面主要内容也就一般都渲染完成了；
- `LCP: 最大内容绘制（Largest Contentful Paint）`：LCP 是视口中可见最大图片或文本块相对于用户首次导航到网页的呈现时间. `<= 2.5s`
> 通常情况下，图片、视频以及大量文本绘制完成后就会报告LCP; https://web.dev/articles/lcp?hl=zh-cn


- `首次输入延迟（FID）`: FID 是`从用户第一次与页面交互直到浏览器对交互作出响应`，并实际能够开始处理事件处理程序所经过的时间。`<= 100ms`
- 首屏加载时间
- 交互中最大延时（ MPFID ） ：页面加载阶段，用户交互操作可能遇到的最大延时时间。
- 完全可交互时间（TTI）：即 Time to interactive，记录从页面加载开始，到页面处于完全可交互状态所花费的时间。

- 首次加载 跳出率：第一个页面完全加载前用户跳出率。
- 慢开比：完全加载耗时超过 5s 的 PV 占比。
- 静态资源加载的缓存命中率：

- TTFB(Time To First Byte)：加载第一个字节所需时间，https://web.dev/articles/ttfb?hl=zh-cn。 `<= 0.8s`
- Total Blocking Time: TBT 衡量的是网页被禁止响应用户输入（例如鼠标点击、屏幕点按或键盘按下操作）的总时长, https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time?hl=zh-cn
- Speed Index: 速度指数用于衡量在网页加载期间内容直观地显示的速度; 采用可视页面加载的视觉进度，计算内容绘制速度的总分



- Cumulative Layout Shift (CLS): `意外的布局偏移`可能会在很多方面干扰用户体验，包括导致用户在阅读时失去阅读位置（如果文本突然移动），以及让用户点击错误的链接或按钮。
- Interaction to Next Paint (INP): INP 是一项指标，通过观察用户在访问网页期间发生的所有点击、点按和键盘互动的延迟时间，评估网页对用户互动的总体响应情况。
> [INP](https://web.dev/articles/inp?hl=zh-cn), INP 是 FID 的继任指标。虽然两者都是响应速度指标，但 FID 仅衡量了网页上首次互动的“输入延迟”。INP 通过观察网页上的所有互动来改进 FID，即从输入延迟开始，到运行事件处理脚本所需的时间，再到浏览器绘制下一帧。


- 静态资源加载时间：`performance.getEntriesByType('resource')`


- 环境信息：业务信息，设备信息，网络信息，SDK信息。
- 行为数据：用户行为（pv,uv,点击事件,埋点...）、浏览器行为、控制台打印行为。
- 错误数据：js异常，异步错误，vue错误，react错误


- 路径录制：连续，聚合
    dom快照录制：https://www.rrweb.io/
- 埋点：瞬时，单一



2020 年，核心网页指标有三个指标：`Largest Contentful Paint (LCP)、First Input Delay (FID) 和 Cumulative Layout Shift (CLS)`。每个指标衡量用户体验的不同方面：
1. LCP 衡量感知到的`加载速度`，并在网页加载时间轴中标记页面主要内容可能已加载的时间点；
2. FID 用于衡量`响应速度`，并量化用户尝试首次与网页互动时的感受；
3. CLS 则用于衡量`视觉稳定性`，并量化可见网页内容的意外布局偏移的数量。



- RUM (Real User Monitoring) 指标,包括 FP, TTI, FCP, FMP, FID, MPFID: 通过 PerformanceObserver 获取
> https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceObserver/PerformanceObserver

- Navigation Timing，包括 DNS, TCP, DOM 解析等阶段的指标: 通过 PerformanceTiming 接口得到






### 页面加载流程




### 前端监控的搭建流程

- 采集阶段：`window.performance.timing、PerformanceObserver`
- 数据上报：`信标（Beacon API）,Ajax, Image（GIF、PNG）`
    - 上报时机：requestIdleCallback, setTimeout
- 数据存储
- 查询统计：对采集到的数据进行查询，统计，分析：
- 可视化：前端通过 API 查询统计数据，做可视化展示
- 报警：API 对接报警通知服务，如钉钉
- 部署：应用整体部署上线





## 方案

- FP、FCP、LCP、CLS、FID、FMP 可通过 PerformanceObserver获取
- TCP连接耗时、首字节到达时间、response响应耗时、DOM解析渲染的时间、TTI、DCL、L等可通过performance.timing获取
- 长任务监听，PerformanceObserver 监听 longTask

performance.timing

performance.getEntriesByType("navigation")[0]






### SDK设计

``` js
- packages/
    - core/ // 无关平台的公共方法，生命周期管理...
    - web/ // web平台sdk
        - core/ // 平台相关公共方法: 参数初始化、数据格式化、上报
        - plugins/ // 插件：性能采集、错误捕获、...
    - wx/ // 微信平台sdk..
    - node
    ...
```

**Q: SDK 如何方便的进行业务拓展和定制？**

SDK 内部的一个架构设计：`内核+插件` 的设计: 
1. `内核`里是SDK内的`公共逻辑或者基础逻辑`；比如数据格式化和数据上报是底下插件都要用到的公共逻辑；而配置初始化是SDK运行的一个基础逻辑；
2. `插件`里是SDK的`上层拓展业务`，比如说`监听js错误、监听promise错误，每一个小功能都是一个插件`；内核和插件一起组成了 `SDK实例` Instance，最后暴露给客户端使用；

我们需要拓展业务，只需要在内核的基础上，不断的往上叠加 `Monitor 插件`的数量就可以了；





## 项目


- chrome官方性能统计库：[web-vitals](https://github.com/GoogleChrome/web-vitals)


- [rrweb](https://github.com/rrweb-io/rrweb/tree/master): 通过记录DOM快照实现录屏
- [web-see](https://github.com/xy-sea/web-see): 前端监控SDK，可用来收集并上报：代码报错、性能数据、页面录屏、用户行为、白屏检测等个性化指标数据
> 通过 SourceMap 定位源码，通过 rrweb 实现前端录屏





## 参考


- [10分钟彻底搞懂前端页面性能监控](https://zhuanlan.zhihu.com/p/82981365)
- [前端性能优化](https://juejin.cn/post/7363830946908979239)
- [当谈及 Web 性能优化时，我们该关注哪些性能指标](https://github.com/sisterAn/blog/issues/112)
- [前端监控 SDK 的一些技术要点原理分析](https://juejin.cn/post/7017974567943536671)

- [ FP、FCP、LCP、DCL(DOMContentLoaded) 、L(Load) 出现的时机](https://juejin.cn/post/7169842522779287560)



### Chrome官方参考

- [w3c-web-performance](https://github.com/w3c/web-performance)

- [Navigation Timing Level 2](https://www.w3.org/TR/navigation-timing-2/)
- [Navigation timing API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing)
> 为了帮助开发者更好地衡量和改进前端页面性能，W3C性能小组引入了 Navigation Timing API ，实现了自动、精准的页面性能打点；开发者可以通过 window.performance 属性获取
- [resource-timing](https://w3c.github.io/resource-timing/)

- [Core Web Vitals](https://web.dev/articles/vitals?hl=zh-cn)
- [First Contentful Paint (FCP)](https://web.dev/articles/fcp?hl=zh-cn)
- [自定义指标](https://web.dev/articles/custom-metrics?hl=zh-cn)

- [web-dev: 加载时间短](https://web.dev/explore/fast?hl=zh-cn)
- [Chrome for Developers:分析运行时性能](https://developer.chrome.com/docs/devtools/performance?hl=zh-cn)