---
title: 前端监控学习笔记
date: 2022-08-17 10:00:55
permalink: false
categories:
  - 工程化
  - 前端监控
tags:
  - 前端监控
  - 工程化
---


# 前端监控学习笔记

> 最近对前端监控系统的搭建比较感兴趣，因为一个优秀的监控系统能实时的知道线上项目的运行情况，bug及时报警，也可用于用户追踪，数据分析等等，可谓是好处多多；同时如果有机会能参与到像前端监控系统这样一个既有技术深度，也对业务很有用的项目（虽然迄今没有），我也是很开心的~ 所以在真正遇到有这样的项目之前，我觉得需要先把理论知识先了解下，所以以下就是我的前端监控学习笔记——理论篇~

## 前端监控类型

### 数据监控（监控用户行为）

- PV/UV: PV(page view)：即页面浏览量或点击量；UV：指访问某个站点或点击某条新闻的不同 IP 地址的人数
- 用户在每一个页面的停留时间
- 用户通过什么入口来访问该网页
- 用户在相应的页面中触发的行为，等...


### 性能监控（监控页面性能）
> 监测页面的性能情况，将各种的性能数据指标量化并收集

- 不同用户，不同机型和不同系统下的首屏加载时间
- 白屏时间
- http 等请求的响应时间
- 静态资源整体下载时间
- 页面渲染时间
- 页面交互动画完成时间，等...


### 异常（错误）监控

及时的上报异常情况，可以避免线上故障的发上。虽然大部分异常可以通过 try catch 的方式捕获，但是比如内存泄漏以及其他偶现的异常难以捕获。常见的需要监控的异常包括：

- Javascript 的异常监控
- 样式丢失的异常监控，静态资源加载异常
- Promise异常
- 接口异常
- 跨域异常




## 监控实现方式


### 埋点上报

实现前端监控，第一步肯定是将我们要监控的事项（数据）给收集起来，再提交给后台进行入库，最后再给数据分析组进行数据分析，最后处理好的数据再同步给运营或者是产品。


- 手动埋点

手动埋点，也叫代码埋点，即纯手动写代码，调用埋点 SDK 的函数，在需要埋点的业务逻辑功能位置调用接口，上报埋点数据，像`友盟、百度统计`等第三方数据统计服务商大都采用这种方案。手动埋点让使用者可以方便地设置自定义属性、自定义事件；所以当你需要深入下钻，并精细化自定义分析时，比较适合使用手动埋点。

手动埋点的缺陷就是，项目工程量大，需要埋点的位置太多，而且需要产品开发运营之间相互反复沟通，容易出现手动差错，如果错误，重新埋点的成本也很高。


- 可视化埋点

通过可视化交互的手段，代替上述的代码埋点。将业务代码和埋点代码分离，提供一个可视化交互的页面，输入为业务代码，通过这个可视化系统，可以在业务代码中自定义的增加埋点事件等等，最后输出的代码耦合了业务代码和埋点代码。


- 无埋点

无埋点则是前端自动采集全部事件，上报埋点数据，由后端来过滤和计算出有用的数据。优点是前端只要一次加载埋点脚本，缺点是流量和采集的数据过于庞大，服务器性能压力山大。




### 监控


- Q:为什么要搞自建监控？

1. 方便团队做自定义的UV用户识别，比如通过登录账号ID或者通过设备信息；甚至从设备信息转入登录态后的继承
2. 方便接入自己团队的各种告警业务等
3. 方便做各维度数据的联合分析，比如发生错误可以联动查询用户行为追溯数据等
4. 方便做业务需求上的拓展，比如自定义埋点、特殊的数据分析维度
5. 方便前后端全链路的一个API请求链路分析；


::: tip 前端监控的搭建流程分以下几个阶段：
- **采集阶段**：数据的采集
- **数据上报**：搭建 API 应用，接收采集到的数据
- **数据存储**：API 应用对接数据库，将采集到的数据存起来
- **查询统计**：对采集到的数据进行查询，统计，分析
- **可视化**：前端通过 API 查询统计数据，做可视化展示
- **报警**：API 对接报警通知服务，如钉钉
- **部署**：应用整体部署上线
:::



## 数据采集

采集数据包括：
1. **页面的性能**情况：包括各阶段加载耗时，一些关键性的用户体验指标等；
2. 记录用户在使用产品过程中的真实操作: **异常数据** 和 **行为数据**




### 页面性能监控
> 为了帮助开发者更好地衡量和改进前端页面性能，W3C性能小组引入了`Navigation Timing API` ，实现了自动、精准的页面性能打点；开发者可以通过[window.performance](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceTiming)属性获取。


**以用户为中心的性能指标**
> 可以简单归纳为 **加载速度、视觉稳定、交互延迟**等几个方面。


- FP（白屏） First-Paint 首次渲染：页面视觉首次发生变化的时间点。FP不包含默认背景绘制，但包含非默认的背景绘制。
> 表示浏览器从开始请求网站到屏幕渲染第一个像素点的时间。

- FCP（灰屏） First-Contentful-Paint 首次内容渲染：表示浏览器渲染出第一个内容的时间，这个内容可以是文本、图片或SVG元素等等，不包括iframe和白色背景的canvas元素。
> FP和FCP的区别：FCP是首次绘制来自DOM的有效内容的时间点；所以FP可能=FCP，也可能先于FCP。大部分情况下得到的值两者相等；但假如，我给单页面应用的 body 元素加了一个背景色，那么FP记录的时间就是开始绘制带背景色的body的时间点，而FCP记录的则是 body 生成之后，首次绘制来自DOM的有效内容的时间点，这个时候FP的时间点就先于FCP

- 首次有效绘制（FMP，first meaning paint）(首屏）：可以定义为 页面渲染过中 **元素增量最大的点**，因为元素增量最大的时候，页面主要内容也就一般都渲染完成了；
> 如果想系统化首屏的计算，可以参考[前端监控 - 首屏统计的前世今生](https://zhuanlan.zhihu.com/p/44933789)；或者手动在代码中埋点进行计算.
``` js
export const initFMP = (): void => {
  new MutationObserver((records: Array<MutationRecord>) => {
    // 对当前的 document 进行计算评分
    // 或者对 records.addedNodes的每个 node 元素，计算评分累加;每次遍历元素还需要判断此元素是否在可视区域
  }).observe(document, { childList: true, subtree: true });
};
```

- LCP Largest Contentful Paint,最大内容绘制：LCP 是页面内首次开始加载的时间点，到 **可视区域内最大的图像或者文本块完成渲染** 的 相对时间，是一个以用户为中心的性能指标，可以测试用户主观感知到的页面加载速度，因为最大内容绘制完成时，往往可以认为 页面将要加载完成。
> 通常来说，为了提供良好的用户体验，我们应该努力将 最大内容绘制控（LCP） 制在2.5 秒或以内。


- 首次输入延迟（FID）: FID 是从用户第一次与页面交互（例如当他们单击链接、点按按钮或使用由 JavaScript 驱动的自定义控件）直到浏览器对交互作出响应，并实际能够开始处理事件处理程序所经过的时间。
> 通常来说，我们可以认为，FID 时间在 100ms 内的能 让用户得到良好的使用体验

- 累计布局偏移（CLS）: CLS 是测量整个页面生命周期（页面可见性变成隐藏）内发生的所有 意外布局偏移 中最大一的 布局偏移分数；每当一个已渲染的可见元素的位置从一个可见位置变更到下一个可见位置时，就发生了 布局偏移 。
> CLS 会衡量在网页的整个生命周期内发生的所有意外布局偏移的得分总和, 通常来说，我们应该将 CLS 分数控制在 0.1 或以下





**以技术为中心的性能指标**

::: tip 关键时间点
- FP, 白屏时间: `responseEnd - fetchStart`, 从请求开始到浏览器开始解析第一批HTML文档字节的时间。
- TTI, 首次可交互时间: `domInteractive - fetchStart`, 浏览器完成所有HTML解析并且完成DOM构建，此时浏览器开始加载资源。
- DomReady, HTML加载完成时间也就是 DOM Ready 时间, `domContentLoadEventEnd - fetchStart`, 单页面客户端渲染下，为生成模板dom树所花费时间；非单页面或单页面服务端渲染下，为生成实际dom树所花费时间'.
- Load, 页面完全加载时间, `loadEventStart - fetchStart`, Load=`首次渲染时间+DOM解析耗时+同步JS执行+资源加载耗时`。
- FirstByte, 首包时间, `responseStart - domainLookupStart`, 从DNS解析到响应返回给浏览器第一个字节的时间
:::


::: tip 关键时间段
- DNS， 查询耗时， `domainLookupEnd - domainLookupStart`, 如果使用长连接或本地缓存，则数值为0
- TCP, 连接耗时, `connectEnd - connectStart`, 如果使用长连接或本地缓存，则数值为0
- SSL, 安全连接耗时, `connectEnd - secureConnectionStart`, 只在HTTPS下有效，判断secureConnectionStart的值是否大于0,如果为0，转为减connectEnd
- TTFB, 请求响应耗时, `responseStart - requestStart`, TTFB有多种计算方式，相减的参数可以是 requestStart 或者 startTime
- Trans, 内容传输耗时, `responseEnd - responseStart`,
- DOM, DOM解析耗时, `domInteractive - responseEnd`,
- Res, 资源加载耗时, `loadEventStart - domContentLoadedEventEnd`, 表示页面中的同步加载资源。
:::


``` js
/**
 * 
FP、FCP、LCP、CLS、FID、FMP 可通过 PerformanceObserver获取
TCP连接耗时、首字节到达时间、response响应耗时、DOM解析渲染的时间、TTI、DCL、L等可通过performance.timing获取
长任务监听，PerformanceObserver 监听 longTask
 */
const {
    fetchStart,
    connectStart,
    connectEnd,
    requestStart,
    responseStart,
    responseEnd,
    domLoading,
    domInteractive,
    domContentLoadedEventStart,
    domContentLoadedEventEnd,
    loadEventStart,
} = window.performance.timing;
const obj = {
    kind: "experience", // 用户体验指标
    type: "timing", // 统计每个阶段的时间
    dnsTime: domainLookupEnd - domainLookupStart, // DNS查询时间
    connectTime: connectEnd - connectStart, // TCP连接耗时
    ttfbTime: responseStart - requestStart, // 首字节到达时间
    responseTime: responseEnd - responseStart, // response响应耗时
    parseDOMTime: loadEventStart - domLoading, // DOM解析渲染的时间
    domContentLoadedTime:
      domContentLoadedEventEnd - domContentLoadedEventStart, // DOMContentLoaded事件回调耗时
    timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
    loadTime: loadEventStart - fetchStart, // 完整的加载时间
}
```


采集了上述的关键时间段后，我们可以做出一次页面加载的具体性能瀑图，我们可以根据这个图分析性能优化的方向。


- 静态资源加载： 我们可以获取每次加载时所访问的静态资源，将收集到的静态资源做成瀑图等分析图形，来找出导致静态资源加载时间过长的问题所在。

- 静态资源加载的缓存命中率：很多的一些资源，比如 img图片等，在用户加载后这些资源就会被缓存起来，再下一次进入时判断缓存类型、是否过期来决定是否使用缓存；那么我们就可以统计每一次用户进入时的一个**缓存命中率**；
> 如果静态资源被缓存了：静态资源的 duration 为0；静态资源的 transferSize 不为0；

- 首次加载跳出率：第一个页面完全加载前用户跳出率；
- 慢开比：完全加载耗时超过5s的PV占比；
- 多维度分析：对地域、网络、页面等多个维度下的性能情况；

参考：[一文摸清前端监控自研实践（一）性能监控](https://juejin.cn/post/7097157902862909471)


### 错误（异常）监控

完善的错误监控体系可以做以下的事情：
1. 应用报错时，及时知晓线上应用出现了错误，及时安排修复止损；
2. 应用报错后，根据上报的用户行为追踪记录数据，迅速进行bug复现；
3. 应用报错后，通过上报的错误行列以及错误信息，找到报错源码并快速修正；
4. 数据采集后，进行分析提供宏观的 错误数、错误率、影响用户数等关键指标；



- **生成错误 uid**

Q: 生成的 uid 有什么用？
1. 一次用户访问（页签未关闭），上报过一次错误后，后续产生重复错误不再上报
2. 多个用户产生的同一个错误，在服务端可以归类，分析影响用户数、错误数等指标
3. 需要注意的是，对于同一个原因产生的同一个错误，生成的 uid 是相同的


``` js
// 对每一个错误详情，生成一串编码
export const getErrorUid = (input: string) => {
  return window.btoa(unescape(encodeURIComponent(input)));
};
```


- **错误堆栈**
> 我们写代码经常报错的时候能够看到，一个错误加上很多条很多条的调用信息组成的错误；这就是抛出的 Error对象 里的 Stack错误堆栈，里面包含了很多信息：包括调用链、文件名、调用地址行列信息等等；


``` js
// 正则表达式，用以解析堆栈split后得到的字符串
const FULL_MATCH =
  /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

// 限制只追溯10个
const STACKTRACE_LIMIT = 10;

// 解析每一行
export function parseStackLine(line: string) {
  const lineMatch = line.match(FULL_MATCH);
  if (!lineMatch) return {};
  const filename = lineMatch[2];
  const functionName = lineMatch[1] || '';
  const lineno = parseInt(lineMatch[3], 10) || undefined;
  const colno = parseInt(lineMatch[4], 10) || undefined;
  return {
    filename,
    functionName,
    lineno,
    colno,
  };
}

// 解析错误堆栈
export function parseStackFrames(error: Error) {
  const { stack } = error;
  // 无 stack 时直接返回
  if (!stack) return [];
  const frames = [];
  for (const line of stack.split('\n').slice(1)) {
    const frame = parseStackLine(line);
    if (frame) {
      frames.push(frame);
    }
  }
  return frames.slice(0, STACKTRACE_LIMIT);
}
```
> 调用 parseStackFrames() 方法将 error对象 传入后，可以看到解析的效果





#### 异常数据类型
> 项目中的异常总体可以分为两大类，一类是**前端异常**，一类是**接口异常**


::: tip 前端异常:
- JS 代码执行错误
    > 类型错误，引用错误等等，这些异常大多是我们编码不严谨导致的
    1. `SyntaxError`：解析时发生语法错误, window.onerror捕获不到SyntxError，一般SyntaxError在构建阶段，甚至本地开发阶段就会被发现。
    2. `TypeError`: 值不是所期待的类型
    3. `ReferenceError`: 引用未声明的变量
    4. `RangeError`: 当一个值不在其所允许的范围或者集合中

- Promise 异常
    > 考验我们的 js 异步编程能力，集中体现在接口请求上面

- 静态资源加载异常
    > 静态资源加载异常，一般指在 html 中引用一些图片地址，第三方 js 地址等，各种原因不能正常加载了
    1. `ResourceError`: 资源加载错误
    2. `HttpError`: Http请求错误

- console.error 异常
    > 一般是在用某个第三方前端框架，他里面自定义了一些错误，会用 console.error 抛出来

- 跨域异常
:::


::: tip 接口异常：
- 未响应/超时响应异常
    > 有时候因为网络问题或者服务器问题，前端在发起请求之后迟迟未收到响应，请求被挂起，这种时候就属于未响应/超时响应异常。这类异常我们可以设置最大请求时间，超时之后主动断开请求，并添加一条接口超时记录。
- 4xx 请求异常
    > 请求异常，一般是前端传递的参数问题，或者接口验证参数的问题。处理这类异常的关键是保存请求参数，可以方便前端排错。
- 5xx 服务器异常
    > 服务器内部处理的异常，这类异常的关键信息是报错时间，以及返回的异常说明，将这些保存下来，可以方便后端去查找日志。
- 权限不足
:::



#### 捕获错误方法

- `try/catch`
> 能捕获常规运行时错误，语法错误和异步错误不行

``` js
// 常规运行时错误，可以捕获 ✅
try {
  console.log(notdefined);
} catch(e) {
  console.log('捕获到异常：', e);
}

// 语法错误，不能捕获 ❌
// 语法错误，在编译解析阶段就已经报错了，而拥有语法错误的脚本不会放入任务队列进行执行，自然也就不会有错误冒泡到我们的捕获代码；
// 早在编写代码时这种语法错误就被代码检查避免掉了，一般我们碰不上语法错误的~
try {
  const notdefined,
} catch(e) {
  console.log('捕获到异常：', e);
}

// 异步错误，不能捕获 ❌
try {
  setTimeout(() => {
    console.log(notdefined);
  }, 0)
} catch(e) {
  console.log('捕获到异常：',e);
}
```


- `window.onerror`
> 当 JS 运行时错误发生时，window 会触发一个 ErrorEvent 接口的 error 事件。

``` js
// 常规运行时错误，可以捕获 ✅

window.onerror = function(message, source, lineno, colno, error) {
  console.log('捕获到异常：',{message, source, lineno, colno, error});
}
console.log(notdefined);

// 语法错误，不能捕获 ❌
window.onerror = function(message, source, lineno, colno, error) {
  console.log('捕获到异常：',{message, source, lineno, colno, error});
}
const notdefined,
      
// 异步错误，可以捕获 ✅
window.onerror = function(message, source, lineno, colno, error) {
  console.log('捕获到异常：',{message, source, lineno, colno, error});
}
setTimeout(() => {
  console.log(notdefined);
}, 0)

// 资源错误，不能捕获 ❌
<script>
  window.onerror = function(message, source, lineno, colno, error) {
  console.log('捕获到异常：',{message, source, lineno, colno, error});
  return true;
}
</script>
<img src="https://yun.tuia.cn/image/kkk.png">
```
> window.onerror 不能捕获资源错误.

- `window.addEventListener`
> 当一项资源（如图片或脚本）加载失败，加载资源的元素会触发一个 Event 接口的 error 事件，这些 error 事件不会向上冒泡到 window，但能被捕获。而window.onerror不能监测捕获。

``` js
// 图片、script、css加载错误，都能被捕获 ✅
<script>
  window.addEventListener('error', (error) => {
     console.log('捕获到异常：', error);
  }, true)
</script>
<img src="https://yun.tuia.cn/image/kkk.png">
<script src="https://yun.tuia.cn/foundnull.js"></script>
<link href="https://yun.tuia.cn/foundnull.css" rel="stylesheet"/>
  
// new Image错误，不能捕获 ❌
<script>
  window.addEventListener('error', (error) => {
    console.log('捕获到异常：', error);
  }, true)
</script>
<script>
  new Image().src = 'https://yun.tuia.cn/image/lll.png'
</script>

// fetch错误，不能捕获 ❌
<script>
  window.addEventListener('error', (error) => {
    console.log('捕获到异常：', error);
  }, true)
</script>
<script>
  fetch('https://tuia.cn/test')
</script>
```
> `new Image`错误不能被捕获, `Promise`的错误不能被捕获


- `unhandledrejection`
> 捕获`Promise`类型错误, 通过unhandledrejection用来全局监听`Uncaught Promise Error`

[unhandledrejection](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/unhandledrejection_event) 事件会在 Promise 发生异常并且没有指定 catch 的时候触发，相当于一个全局的 Promise 异常兜底方案

``` js
window.addEventListener("unhandledrejection", (e) => {
    console.log('错误了', e);
})
window.addEventListener("rejectionhandled", (e) => {
    console.log('错误已经处理了' ,e)
})

new Promise(() => {
    s
})
```

- Vue错误
> 由于Vue会捕获所有Vue单文件组件或者Vue.extend继承的代码，所以在Vue里面出现的错误，并不会直接被window.onerror捕获，而是会抛给`Vue.config.errorHandler`。

``` js
/**
 * 全局捕获Vue错误，直接扔出给onerror处理
 */
Vue.config.errorHandler = function (err, vm, info) {
  // err 错误处理
  // vm vue实例
  // info 是特定于vue的错误信息，比如哪个生命周期勾子
  setTimeout(() => {
    throw err
  })
}

// renderError 默认的渲染函数遇到错误时，提供了一个代替渲染输出的
new Vue({
    render (h){
        throw new Error('oops')
    },
    renderError (h, err){
        return h('per',{ style: { color: red } }, err.stack)
    }
}).$mount('#app')


// errorCaptured
// 任何派生组件捕获错误时调用。它可以 return false 来阻止错误传播。可以在这个勾子里修改组件状态。不过如果是在模板或呈现函数里有条件语句，在捕获到错误时，这些条件语句会短路，可能进入一个无限渲染循环
Vue.component('ErrorBoundary',{
    data: () => { ... }
    errorCaptured(err, vm, info){
        // err 错误信息  
        // vm 触发错误的组件实例 
        // info 错误捕获位置信息
        return false
    }
})
```


- React错误


- 跨域报错

如果当前投放页面和云端JS所在不同域名，如果云端JS出现错误，window.onerror会出现`Script Error`
> 浏览器的一个安全机制：当跨域加载的脚本中发生语法错误时，浏览器出于安全考虑，不会报告错误的细节，而只报告简单的 `Script error`。浏览器只允许同域下的脚本捕获具体错误信息，而其他脚本只知道发生了一个错误，但无法获知错误的具体内容（控制台仍然可以看到，JS脚本无法捕获）。

1. 后端配置`Access-Control-Allow-Origin`、前端`script`加`crossorigin`
2. 如果不能修改服务端的请求头，可以考虑通过使用 `try/catch` 绕过，将错误抛出
``` js
<script src="https://yun.dui88.com/tuia/cdn/remote/testerror.js"></script>
<script>
  window.onerror = function (message, url, line, column, error) {
    console.log(message, url, line, column, error);
  }

  try {
    foo(); // 调用testerror.js中定义的foo方法
  } catch (e) {
    throw e;
  }
</script>
```
> 如果不加try catch，console.log就会打印script error。加上try catch就能捕获到



一般调用远端js，有三种常见情况: 调用远端JS的方法出错、远端JS内部的事件出问题、要么在setTimeout等回调内出错


1. 通过封装一个函数，能装饰原方法，使得其能被try/catch: 
``` html
<!doctype html>
<html>
<head>
  <title>Test page in http://test.com</title>
</head>
<body>
  <script src="https://yun.dui88.com/tuia/cdn/remote/testerror.js"></script>
  <script>
  window.onerror = function (message, url, line, column, error) {
    console.log('====onerror', message, url, line, column, error);
  }

  function wrapErrors(fn) {
    // don't wrap function more than once
    if (!fn.__wrapped__) {
      fn.__wrapped__ = function () {
        try {
          return fn.apply(this, arguments);
        } catch (e) {
          throw e; // re-throw the error
        }
      };
    }

    return fn.__wrapped__;
  }


  foo(); // 不能捕获
  //  ====onerror Script error.  0 0 null


  wrapErrors(foo)() // 可以捕获
//   ====onerror Uncaught ReferenceError: notundefined is not defined file:///Users/zhouyuan10/work/office_blockchain_web3/test.html 21 11 ReferenceError: notundefined is not defined
  </script>
</body>
</html>
```

2. 劫持原生方法
``` html

<!doctype html>
<html>
<head>
  <title>Test page in http://test.com</title>
</head>
<body>
  <script>
    const originAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      const wrappedListener = function (...args) {
        try {
          return listener.apply(this, args);
        }
        catch (err) {
          throw err;
        }
      }
      return originAddEventListener.call(this, type, wrappedListener, options);
    }
  </script>
  <div style="height: 9999px;">http://test.com</div>
  <script src="https://yun.dui88.com/tuia/cdn/remote/error_scroll.js"></script>
  <script>
  window.onerror = function (message, url, line, column, error) {
    console.log(message, url, line, column, error);
  }
  </script>
</body>
</html>
```





#### 前端异常采集


全局捕获 js 的异常也比较简单，用 `window.addEventListener('error')` 即可：
``` js
// js 错误捕获
window.addEventListener('error', (error) => {
  // error 就是js的异常
});
```

资源加载的异常只会在当前元素触发，异常不会冒泡到 `window`; 给 `window.addEventListener` 函数指定第三个参数，很简单就是 true，表示该监听函数会在`捕获阶段`执行，这样就能监听到资源加载异常了
``` js
// 捕获阶段全局监听, 就可以全局捕获到 JS 异常和资源加载异常
window.addEventListener(
  'error',
  (error) => {
    if (error.target != window) {
      console.log(error.target.tagName, error.target.src);
    }
    handleError(error);
  },
  true,
);
```

window.addEventListener 不能捕获 Promise 异常。不管是` Promise.then()` 写法还是 `async/await` 写法，发生异常时都不能捕获; 
``` js
// promise 错误捕获
window.addEventListener('unhandledrejection', (error) => {
  // 打印异常原因
  console.log(error.reason);
  handleError(error);
  // 阻止控制台打印: 默认情况下，Promise 发生异常且未被 catch 时，会在控制台打印异常。如果我们想阻止异常打印，可以用上面的 error.preventDefault() 方法。
  error.preventDefault();
});
```



#### 接口异常采集

``` js
async () => {
  try {
    let res = await axios.post('/test');
    console.log(res);
  } catch (err) {
    // err 就是捕获到的错误对象
    handleError(err);
  }
};
```
当捕获到异常之后，统一交给 `handleError` 函数处理，这个函数会将接收到的异常进行处理，并调用 上报接口 将异常数据传到服务器，从而完成采集。

axios响应拦截器中捕获异常：
``` js
// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 发生异常会走到这里
    if (error.response) {
      let response = error.response;
      if (response.status >= 400) {
        handleError(response);
      }
    } else {
      handleError(null);
    }
    return Promise.reject(error);
  },
);
```


**handleError**


``` js
/**
 * @type 1 接口异常  2 前端异常  
 */
const handleError = (error: any, type: 1 | 2) {
  if(type == 1) { // 接口异常
    // 此时的 error 响应，它的 config 字段中包含请求信息
    let { url, method, params, data } = error.config
    let err_data = {
       url, method,
       // config 对象中的 params 表示 GET 请求的 query 参数，data 表示 POST 请求的 body 参数
       params: { query: params, body: data },
      //  error 属性表示错误信息，这个获取方式要根据你的接口返回格式来拿, 提前跟后端约定好
       error: error.data?.message || JSON.stringify(error.data),
    })
  } else { // 前端异常
        let err_data = null
        // 监测 error 是否是标准类型
        // 首先判断异常是否是 Error 的实例。事实上绝大部分的代码异常都是标准的 JS Error，但我们这里还是判断一下，如果是的话直接获取异常类型和异常信息，不是的话将异常类型设置为 other 即可。
        if(error instanceof Error) {
            let { name, message } = error
            err_data = {
                type: name,
                error: message
            }
        } else {
            err_data = {
                type: 'other',
                error: JSON.strigify(error)
            }
        }
  }
}
```


#### 环境信息

**环境数据**: 就是触发异常时所在的环境。比如是谁在哪个页面的哪个地方触发的错误，有了这些，我们就能马上找到错误来源，再根据异常信息解决错误；主要包含**业务信息，设备信息，网络信息，SDK信息**。

::: tip 环境数据
- app：应用的名称/标识
- version：应用的版本号
    > app 和 version 都是应用配置，可以判断异常出现在哪个应用的哪个版本, 可直接获取 package.json 下的 name 和 version 属性，在应用升级的时候，及时修改 version 版本号即可。
- env：应用环境，一般是开发，测试，生产, 如：`process.env.VUE_APP_ENV`
- user_id：触发异常的用户 ID
- user_name：触发异常的用户名
- page_route：异常的页面路由
- page_title：异常的页面名称
:::








### 行为数据监控
> 行为数据就比较宽泛了，用户任何有意义的操作我们都可以定义为行为数据; 比如点击某个按钮，停留了多久，新功能的点击率，什么时候使用，等等。

我们简单将行为分类为：**用户行为、浏览器行为、控制台打印行为**。
- 其中，用户行为中包含了我们常见的点击、滚动、聚焦/失焦、长按等；
- 浏览器行为包含了发起请求、跳转、前进/后退、关闭、新开窗口等；
- 控制台行为包括了 `console.log/error/warn` 等。


#### 通用数据

1. 用户基本信息；包括：当前访问的网页路径、浏览器语种、屏幕大小、等等
2. 用户行为记录栈: 我们需要去获取用户的一个行为追踪记录，需要追踪的事件包括以下：`路由跳转行为、点击行为、ajax 请求行为、用户自定义事件`
    - 一般的路由跳转行为，都是针对于 SPA单页应用的，因为对于非单页应用来说，url跳转都以页面刷新的形式;
    - PV、UV
    - 点击事件
    - 用户自定义埋点
    - HTTP 请求捕获
    - 页面停留时间
    - 访客来源
    - User Agent 解析
    - IP 采集解析




**切换页面:监听路由变化来拿到新页面的数据**

``` js
// Vue3 路由写法
const router = createRouter({ ... })
router.beforeEach(to => {
  // to 代表新页面的路由对象
  recordBehaviors(to)
})
```

收集行为数据最基本的字段如下：
```
app：应用的名称/标识
env：应用环境，一般是开发，测试，生产
version：应用的版本号
user_id：当前用户 ID
user_name：当前用户名
page_route：页面路由
page_title：页面名称
start_at：进入时间
end_at：离开时间
```
> 应用标识、环境、版本号统称应用字段，用于标志数据的来源。其他字段主要分为 用户，页面，时间三类，通过这三类数据就可以简单的判断出一件事：谁到过哪个页面，并停留了多长时间。


**用户信息、页面信息（page_route/page_title）**

进入/离开时间：
``` js
// 进入页面时调用
const recordBehaviors = () => {
  let report_date = {...} // 此时 end_at 为空
  localStorage.setItem('CURRENT_BEHAVIOR', JSON.stringify(report_date));
}

// 离开页面时调用
const reportBehaviors = () => {
  let end_at = new Date()
  let report_str = localStorage.getItem('CURRENT_BEHAVIOR')
  if(report_str) {
    let report_date = JSON.parse(report_str)
    report_date.end_at = end_at
    http.post('/behaviors/insert', report_date)
  } else {
    console.log('无行为数据')
  }
}
```



**访客来源**

我们可以直接用 `document.referrer` 来获取用户在我们的网页上的前一个网页地址；但是需要注意的是，有几个场景我们获取到的值会是空：
1. 直接在地址栏中输入地址跳转
2. 直接通过浏览器收藏夹打开
3. 从https的网站直接进入一个http协议的网站

可以直接使用 `window.performance.navigation.type` 来获取用户在我们网页上的来路方式, 该属性返回一个整数值，可能有以下4种情况: 
```
0: 点击链接、地址栏输入、表单提交、脚本操作等。
1: 点击重新加载按钮、location.reload。
2: 点击前进或后退按钮。
255: 任何其他来源。即非刷新/非前进后退、非点击链接/地址栏输入/表单提交/脚本操作等。
```


**User Agent 解析**

我们的 User Agent 信息里面有带有很多的信息，比如浏览器内核、设备类型等等，但是解析它并不是个简单的事情，如果我们自己写的话，会用到很多的正则表达式去解析它，所以这边推荐两个现成的插件来使用：bowser 和 ua-parser-js

``` js
// nodejs 环境下 require
const parser = require('ua-parser-js');
const Bowser = require('bowser');
// 获取user-agent解析
function getFeature(userAgent) {
  const browserData = Bowser.parse(userAgent);
  const parserData = parser(userAgent);
  const browserName = browserData.browser.name || parserData.browser.name; // 浏览器名
  const browserVersion = browserData.browser.version || parserData.browser.version; // 浏览器版本号
  const osName = browserData.os.name || parserData.os.name; // 操作系统名
  const osVersion = parserData.os.version || browserData.os.version; // 操作系统版本号
  const deviceType = browserData.platform.type || parserData.device.type; // 设备类型
  const deviceVendor = browserData.platform.vendor || parserData.device.vendor || ''; // 设备所属公司
  const deviceModel = browserData.platform.model || parserData.device.model || ''; // 设备型号
  const engineName = browserData.engine.name || parserData.engine.name; // engine名
  const engineVersion = browserData.engine.version || parserData.engine.version; // engine版本号
  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType,
    deviceVendor,
    deviceModel,
    engineName,
    engineVersion,
  };
}
```



**IP 采集解析**

可以通过解析 IP 地址，来解析出用户的地域、网络运营商等信息；而解析IP我们可以使用诸如腾讯云、阿里云等各种的 三方API 来实现；但是采集 IP 信息就需要我们自己来进行实现了；



参考：[一文摸清前端监控自研实践（二）行为监控](https://juejin.cn/post/7098656658649251877)



#### 特定数据
> 除了通用数据，大部分情况我们还要在具体的页面中收集某些特定的行为。比如某个关键的按钮有没有点击，点了多少次；或者某个关键区域用户有没有看到，看到（曝光）了多少次等等。



#### 埋点

收集数据还有一个更专业的叫法 ———— **埋点**。直观理解是，哪里需要上报数据，就埋一个上报函数进去。通用数据针对所有页面自动收集，特定数据就需要根据每个页面的实际需求手动添加。
``` js
<button onClick={onClick}>点击</button>;
const onClick = (e) => {
  // console.log(e);
  repoerEvents(e); // 埋点
};
```
特定数据与通用数据的许多字段是一样的，收集特定数据需要的基本字段如下：

```
app：应用的名称/标识
env：应用环境，一般是开发，测试，生产
version：应用的版本号
user_id：当前用户 ID
user_name：当前用户名
page_route：页面路由
page_title：页面名称
created_at：触发时间
event_type：事件类型
action_tag：行为标识
action_label：行为描述
```

::: tip 常见的埋点方案
- **代码埋点**: 嵌入代码的形式; 精确（任意时刻，数据量全面）; 代码工作量点较大
- **可视化埋点**： 通过可视化交互的手段，代替代码埋点；将业务代码和埋点代码分离，提供一个可视化交互的页面，输入为业务代码，通过这个系统，可以在业务代码中自定义的增加埋点事件等等，最后输出的代码耦合了业务代码和埋点代码；用系统来代替手工插入埋点代码。
- **无痕埋点**：前端的任意一个事件被绑定一个标识，所有的事件都被记录下来；通过定期上传记录文件，配合文件解析，解析出来我们想要的数据，并生成可视化报告供专业人员分析；无痕埋点的优点是采集全量数据，不会出现漏埋和误埋等现象；缺点是给数据传输和服务器增加压力，也无法灵活定制数据结构。
:::


- **手动埋点上报**

``` js
// 埋点上报函数
const repoerEvents = (e)=> {
  let report_date = {...}
  let { tag, label } = e.target.dataset
  if(!tag || !label) {
    return new Error('上报元素属性缺失')
  }
  report_date.event_type = e.type
  report_date.action_tag = tag
  report_date.action_label = label

  // 上报数据
  http.post('/events/insert', report_date)
}
```

- **全局埋点上报**

``` js
window.addEventListener('click', (event) => {
  let { tag, label, trigger } = event.target.dataset;
  if (tag && label && trigger == 'click') {
    // 说明该元素需要埋点
    repoerEvents(event);
  }
});

<button data-tag="form_save" data-label="表单保存" data-trigger="click">
  保存
</button>
```
> 这样的话就不需要在每一个元素上添加或修改事件处理函数了，只需要在元素中添加三个自定义属性 `data-tag，data-label，data-trigger` 就能自动实现数据埋点上报。


- **组件上报**
> 一般情况下当埋点功能成熟之后，会封装成一个 SDK 供其他项目使用; 如果是一个 SDK，那么最好的方式是将所有内容聚合成一个组件，在组件内实现上报的所有功能，而不是让使用者在项目中添加监听事件。

``` js
// 以React为例：

import { useEffect, useRef } from 'react';

const CusReport = (props) => {
  const dom = useRef(null);
  const handelEvent = () => {
    console.log(props); // {tag:xx, label:xx, trigger:xx}
    repoerEvents(props); // 上报
  };
  useEffect(() => {
    if (dom.current instanceof HTMLElement) {
      dom.current.addEventListener(props.trigger, handelEvent);
    }
  }, []);
  return (
    <span ref={dom} className="custom-report">
      {props.children}
    </span>
  );
};

export default CusReport;

// 使用
<CusReport tag="test" label="功能测试" trigger="click">
  <button>测试</button>
</CusReport>
```











## 数据上报
> 调用一个 API 接口将这些数据传过去然后存在数据库中，因此本阶段的任务就是搭建上报数据的 API 接口应用。


搭建 API 应用要做的事情有：目录结构设计、路由设计、鉴权认证、参数验证、请求响应封装、错误处理；框架搭好之后，主要做的就是设计接口 URL 然后写处理逻辑，保证这一步设计的接口能调通，并且能接收到数据。


- 为什么使用` 1x1 gif`？
```
可以进行跨域
不会携带cookie
发 POST 请求之后不需要获取和处理数据、服务器也不需要发送数据
不会阻塞页面加载，影响用户的体验，只需 new Image 对象
相比于 png/bmp 体积最小，可以节约网络资源
```
总结：**监听/劫持原始方法，获取需要上报的数据，在错误发生时触发函数，使用 gif 上报。**




### Source Map

我们的项目想要部署上线，就需要将项目源码经过混淆、压缩、babel编译转化等等的操作之后，生成最终的打包产物，再进行线上部署；而这样混淆后的代码，我们基本上无法阅读，即使在上文的错误监控里，我们获取了报错代码的行号、列号等关键信息，我们也无法找到具体的源码位置所在；这个时候就需要请出我们的 Sourcemap 了

Sourcemap 本质上是一个信息文件，里面储存着代码转换前后的对应位置信息。它记录了转换压缩后的代码所对应的转换前的源代码位置，是源代码和生产代码的映射。

如果开启了 Sourcemap 功能，就会在打包产物里发现后缀为 .map 的文件，通过对它的解析，我们就可以得到项目的源代码；







## 数据存储
> 接口对接数据库，`MongoDB`

数据存储阶段，主要介绍数据库的基本信息和操作：数据库怎么连接、怎么设计字段、怎么做验证、怎么写入、怎么查询


这个阶段比较关键的是 **数据验证**，在设计好数据库字段之后，我们希望所有写入的数据都要符合我们想要的数据格式。如果在验证之后不符合，我们可以补充或修改数据字段，或者直接拒绝写入，这样能保证数据的可靠性，也避免了不必要的数据清理。


数据存储方案：`MySQL、HBase、ES`；`MySQL`可作为数据持久化存储的方案，为可视化提供数据；而`ES`可作为数据的临时存储方案，在这个环节，我们可以对这部分数据进行清洗。


### 数据清洗

SDK 上报的原始数据有这么几个特征：
- 数据量大、体积大：动辄几兆、十几兆、还碰到过几十兆的；
- 没有分类、聚合：同一类型的错误只是时间维度不同，没必要每条都去存储；
- 没有对非法数据进行过滤：无用信息太多，不利于聚合啊，也加重了服务器负担。


我们将清洗流程分为下面 3 步：**获取数据、数据预处理、数据聚合**。


#### 获取数据


1. 通过GET请求，从 ES 获取最近一分钟的数据信息
2. 设置阈值（**削峰机制**），由于错误大量爆发的时候为了“不让服务器承受他不该承受的压力”，我们使用了下面两种方法做削峰机制：
- 每分钟数据获取上限 1000 条，超过就采样入库；
- 同类型错误数量大于 200 条，只统计数量

**削峰处理：当有大量错误发生时，每次处理任务从 ES 中拉取最新的1000条，同类型的错误只取200条写入具体的事件数据库，其余只存数量。**
- 关心当前最新错误
- 仅存储部分详情，缓解db
- 加速任务，及时处理完，触发报警


#### 数据预处理
> 由于 ES 中的 data 是 String 格式，并且代码有被转译，所以我们需要将其 JSON.parse()。并且有时候会出现里面还不完全是个字符串包裹的对象，所以我们需要将里面我们需要的字段提取出来。并且，我们还要取出原始数据中的无用信息，减小存储体积。

#### 数据聚合

先来思考我们为什么需要做数据聚合这件事，目的有两个：1、存储性能：存储小；2、查询性能：查询快；

主要三个维度来做：1、业务名；2、错误类型；3、错误信息。
> 如：`shangcheng` 是业务名，`SyntaxError` 是语法错误，`SyntaxError：The string did not match the expected pattern… `是错误信息。我们将他们拼到一起，然后用 md5 得到这么一串东西：`ecf9f6d430bea229473782dc63407673`。接下来上报的错误都会同样采用这种方式去聚合，看他们的这一串东西是否一样，如果一样，那我们就将他们识别为同一类错误，将他们在 MySQL 中存为同一条。


#### 清洗过程监控
> 线上错误有了 SDK 进行监控，但是对于监控脚本本身是没有进行监控的，也需要监控平台会对清洗任务做一个监控，观察脚本是否有问题。 




## 查询统计
> 主要任务就是对数据进行检索和统计分析，基本上都是“查询”的操作.


在分析客户端问题时，仅靠**错误日志上报**的信息，很多时候是不够的，因为缺少了**用户浏览路径、操作行为**等信息，而客户端很多错误是在特定触发条件下产生的，仅有**错误堆栈**很难复现问题，这就导致了开发排查问题的体验很差，要么需要去猜测错误是怎么发生的，要么需要自己从海量的行为日志中去查找用户行为日志，费时费力。

于是我们给客户端建立了一套日志链路，从客户端一次冷启动开始，我们会用 uuid 生成一个**链路id**, 后续的所有**行为日志，网络日志和崩溃日志**都会带上这个链路id, 我们会记录一些**关键节点，页面调整，网络环境变化，错误的网络请求**，一些用户操作行为等。这样可以通过链路id直接关联到相关的行为日志，方便后续的问题排查。


- 行为数据：整体统计查询，看某个时间段的趋势
    > 行为数据也会单条查询，比如我要看某个时间某个用户做了什么操作，这就属于精确查找。
- 异常数据：单条查询，精确定位，排查具体的错误
    > 异常数据也有统计，比如异常接口触发频率的排行等。

行为数据的数据量会非常大，在用户使用系统的过程中会频繁产生然后频繁被写入数据库。因此这类数据绝大多数情况是通过 **聚合查询** 的方式从页面，时间等多个维度做总体统计，最后得出一些百分比的结论。这些统计值可以大致反应出产品的实际使用情况。
> 这里有个优化点，因为频繁请求会加重接口负担，因此数据也可以本地先存储一部分，达到一定量之后再请求接口，一次性存入。

异常数据对开发人员来说非常重要, 异常数据查询也比较简单，和普通的列表查询一样，返回最新的异常数据即可。当然了我们排查问题之后，还应该对处理好的异常标记为已处理，这样可以防止重复排查。




## 可视化
> 最终的数据图表展现, 接入上一步的统计接口，再集成前端图表库，将统计结果用图表展现出来。




## 报警
> 在异常发生时，第一时间推送给开发人员，这样大家才能立即发现问题，然后用最快的速度去解决，避免遗漏。

报警通知，一般现在通用的方案是对接钉钉或者是企业微信的机器人，在发送报警通知时，可以直接用手机号来 @ 你的任意组员，实现更精准的提醒。





## 部署
> 部署这块主要是 nginx 解析，https 配置，数据库安装，和 nodejs 的应用部署等




## 其他


### 前端容灾

前端容灾指的因为各种原因后端接口挂了(比如服务器断电断网等等)，前端依然能保证页面信息能完整展示。比如 banner 或者列表之类的等等数据是从接口获取的，要是接口获取不到了，怎么办呢？

- LocalStorage
> 在接口正常返回的时候把数据都存到 LocalStorage ，可以把接口路径作为 key，返回的数据作为 value；然后之次再请求，只要请求失败，就读取 LocalStorage，把上次的数据拿出来展示，并上报错误信息，以获得缓冲时间。



- CDN
> 每次更新都要备份一份静态数据放到CDN；在接口请求失败的时候，并且 LocalStorage 也没有数据的情况下，就去 CDN 摘取备份的静态数据。



- Service Worker
> 假如不只是接口数据，整个 html 都想存起来，就可以使用 Service Worker 做离线存储；利用 Service Worker 的请求拦截，不管是存接口数据，还是存页面静态资源文件都可以。

``` js
// 拦截所有请求事件 缓存中有请求的数据就直接用缓存，否则去请求数据 
self.addEventListener('fetch', e => { 
    // 查找request中被缓存命中的response 
    e.respondWith(caches.match(e.request).then( response => { 
        if (response) { 
            return response 
        } 
        console.log('fetch source') 
    })) 
})
```


## 备注

- 如何支持千万级别PV的统计？




## 收藏

- [Fundebug](https://www.fundebug.com/)
> Fundebug是专业的应用 BUG 监控平台。当线上应用出现 BUG 时，Fundebug 会通过邮件或者第三方工具立即给开发者发送报警，这样能够帮助开发者及时发现并且修复应用 BUG，从而提升用户体验。

- [Webfunny](https://www.webfunny.cn/home.html)、[github地址](https://github.com/a597873885/webfunny_monitor)
> webfunny是一款轻量级的前端监控系统，webfunny也是一款前端性能监控系统，无埋点监控前端日志，实时分析前端健康状态: 运营数据、前端报错、页面性能、接口性能、以及小程序监控

- [Sentry](https://sentry.io/welcome/)
> Sentry是一个基于Django构建的现代化的实时事件日志监控、记录和聚合平台,主要用于如何快速的发现故障。支持几乎所有主流开发语言和平台,并提供了现代化UI,它专门用于监视错误和提取执行适当的事后操作所需的所有信息,而无需使用标准用户反馈循环的任何麻烦。

[前端异常监控之 Sentry的部署和使用](https://juejin.cn/post/6844903657381593096)


- [web-tracing](https://m-cheng-web.github.io/web-tracing-docu/)
> 基于 JS 的 【行为埋点 & 性能采集 & 异常采集 & 请求采集 & 路由采集】 插件


- [bombayjs-admin](https://github.com/bombayjs/bombayjs-admin)，[参考](https://juejin.cn/post/6844903956267663367)
> 从零开始搭建前端监控系统, bombayjs是前端监控解决方案，包括bombayjs、bombayjs-server、bombayjs-admin三个项目。


## 参考

- [为什么大厂前端监控都在用GIF做埋点？](https://juejin.cn/post/7065123244881215518)
- [前端监控的搭建步骤](https://juejin.cn/column/7008034440890810398)
- [一篇讲透自研的前端错误监控](https://juejin.cn/post/6987681953424080926)
- [一文摸清前端监控实践要点](https://juejin.cn/column/7097156230489047047)
- [前端搞监控|Allan - 如何实现一套多端错误监控平台](https://www.yuque.com/zaotalk/posts/c5-5)
- [前端搞监控|能翔 - 如何基于错误日志进行分析和告警](https://www.yuque.com/zaotalk/posts/c5-6)
- [前端监控体系搭建](https://juejin.cn/post/7078512301665419295)
- [5 分钟撸一个前端性能监控工具](https://juejin.cn/post/6844903662020460552)
- [web.dev指标](https://web.dev/metrics/)



## TODO

1. 试着接入`Webfunny`监控系统，学习`Webfunny`源码；
2. 学习了解`Sentry`；
3. 找一个优秀的监控全栈项目，从学习到实践~




<fix-link label="Back" href="/more/"></fix-link>