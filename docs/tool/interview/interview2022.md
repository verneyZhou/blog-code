---
title: 面试题2022
date: 2022-04-17 18:11:14
# permalink: /pages/8d01aa/
article: false
categories: 
  - null
tags: 
  - null
permalink: false
---

# 面试题2022
> 以下是我2022年2月到4月的面试题总结~



- 如何看待前端框架选型？
> [参考](https://www.cnblogs.com/wangqing01/p/12402488.html)
``` js
对于前端团队，可以实现企业受益最大化要点。
一、技术选型的策略
1、保证产品质量
（1）功能稳健：网页不白屏，不错位，不卡死；操作正常；数据精准。
（2）体验优秀：加载体验，交互体验，视觉体验，无障碍访问。
2、降低人力成本
（1）降低前期开发成本；
（2）降低后期维护成本。

二、前端开发模式选择
开发模式：1、纯前端开发；2、前后端分离开发；3、后端主导的开发。
```

- vue的如何实现双向绑定的?
``` js
基于数据劫持+发布订阅模式实现的双向绑定；
1. 实现一个监听器 Observer：利用Proxy或Object.defineProperty生成的Observer针对对象/对象的属性进行"劫持",在属性发生变化后通知订阅者;
2. 实现一个解析器 Compile：解析 Vue 模板指令；他会收集指令所依赖的方法和数据, 等待数据变化，然后将模板中的变量都替换成数据，然后渲染页面视图；
3. 实现一个订阅者 Watcher：Watcher 订阅者是 Observer 和 Compile 之间通信的桥梁 ，它将接收到的Observer产生的数据变化,并根据Compile提供的指令进行视图渲染, 使得数据变化促使视图变化。
4. 实现一个调度中心 Dep：订阅器采用 发布-订阅 设计模式，用来收集订阅者 Watcher，对监听器 Observer 和 订阅者 Watcher 进行统一管理。
```

- react 虚拟DOM 是什么? 如何实现? 说一下diff算法 ?
``` js
虚拟DOM，Virtual DOM 就是一个用来描述真实DOM的javaScript对象。

实现：基于React进行开发时所有的DOM构造都是通过虚拟DOM进行，每当数据变化时，React都会重新构建整个DOM树，然后React将当前整个DOM树和上一次的DOM树进行对比，得到DOM结构的区别，然后仅仅将需要变化的部分进行实际的浏览器DOM更新。

Diff算法是一种对比算法。对比两者是旧虚拟DOM和新虚拟DOM，对比出是哪个虚拟节点更改了，找出这个虚拟节点，并只更新这个虚拟节点所对应的真实节点，而不用更新其他数据没发生改变的节点，实现精准地更新真实DOM，进而提高效率。
复杂视图情况下使用虚拟DOM之所以提升渲染性能,是因为虚拟DOM+Diff算法可以精准找到DOM树变更的地方, 减少DOM的操作(重排重绘)。

React的思路是递增法。通过对比新的列表中的节点，在原本的列表中的位置是否是递增，来判断当前节点是否需要移动。
Vue: 所谓双端比较就是新列表和旧列表两个列表的头与尾互相对比，在对比的过程中指针会逐渐向内靠拢，直到某一个列表的节点全部遍历过，对比停止。
```

- react和vue的比较
> [参考](https://blog.csdn.net/CystalVon/article/details/78428036)
``` js
- react单向数据流；Vue双向数据绑定
- jsx与template
- mvc与mvvm
- 状态管理：Redux, Vuex
- 在操作界面时，要尽量减少对DOM的操作，Vue 和 React 都使用虚拟DOM来实现
```

- http报文头部有哪些字段? 有什么意义 ?
``` js
HTTP 协议规定了非常多的头部字段，实现各种各样的功能，但基本上可以分为四大类：

通用字段：在请求头和响应头里都可以出现；
    Date 字段是一个通用字段，但通常出现在响应头里，表示 HTTP 报文创建的时间，客户端可以使用这个时间再搭配其他字段决定缓存策略。
请求字段：仅能出现在请求头里，进一步说明请求信息或者额外的附加条件；
    Host 字段告诉服务器这个请求应该由哪个主机来处理
    User-Agent属于请求字段，只出现在请求头里。它使用一个字符串来描述发起 HTTP 请求的客户端，服务器可以依据它来返回最合适此浏览器显示的页面。
响应字段：仅能出现在响应头里，补充说明响应报文的信息；
    Server 字段是响应字段，只能出现在响应头里。它告诉客户端当前正在提供 Web 服务的软件名称和版本号;
实体字段：它实际上属于通用字段，但专门描述 body 的额外信息。
    Content-Length是一个实体字段，它表示报文里 body 的长度，也就是请求头或响应头空行后面数据的长度。
```

- 1px问题
1. 用媒体查询根据dpr用“伪元素+transform”对边框进行缩放；
``` css
/* 设计稿是750,采用1：100的比例,font-size为100*(100vw/750) */
.border-1px {
    position: relative;
}
@media screen and (-webkit-min-device-pixel-ratio: 2) {
    .border-1px:before {
        content: " ";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 1px;
        border-top: 1px solid #D9D9D9;
        color: #D9D9D9;
        -webkit-transform-origin: 0 0;
        transform-origin: 0 0;
        -webkit-transform: scaleY(0.5);
        transform: scaleY(0.5);
    }
}
```
2. 用JS根据屏幕尺寸和dpr精确地设置不同屏幕所应有的rem基准值和initial-scale缩放值。
``` js
/* 设计稿是750,采用1：100的比例,font-size为100 * (docEl.clientWidth * dpr / 750) */
var dpr, rem, scale;
var docEl = document.documentElement;
var fontEl = document.createElement('style');
var metaEl = document.querySelector('meta[name="viewport"]');
dpr = window.devicePixelRatio || 1;
rem = 100 * (docEl.clientWidth * dpr / 750);
scale = 1 / dpr;
// 设置viewport，进行缩放，达到高清效果
metaEl.setAttribute('content', 'width=' + dpr * docEl.clientWidth + ',initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale + ',user-scalable=no');
// 设置data-dpr属性，留作的css hack之用，解决图片模糊问题和1px细线问题
docEl.setAttribute('data-dpr', dpr);
// 动态写入样式
docEl.firstElementChild.appendChild(fontEl);
fontEl.innerHTML = 'html{font-size:' + rem + 'px!important;}';
```


- rem布局
> rem是css3新引入的单位，在pc端会有兼容性的问题，对移动端比较友好。简而言之就是通过动态设置html根元素的fontsize，等比缩放元素大小来自适应移动设备。
1. 根据设备屏幕的DPR（设备像素比，比如dpr=2时，表示1个CSS像素由2X2个物理像素点组成） 动态设置 html 的font-size
2. 同时根据设备DPR调整页面的缩放值，进而达到高清效果。



- webpack的原理, loader 和 plugin 是干什么的? 有自己手写过么?
``` js
1. 初始化参数：解析webpack配置参数，合并shell传入和webpack.config.js文件配置的参数，形成最后的配置结果。
（2）开始编译：上一步得到的参数初始化compiler对象，注册所有配置的插件，插件监听webpack构建生命周期的事件节点，做出相应的反应，执行对象的 run 方法开始执行编译。
（3）确定入口：从配置的entry入口，开始解析文件构建AST语法树，找出依赖，递归下去。
（4）编译模块：递归中根据文件类型和loader配置，调用所有配置的loader对文件进行转换，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
（5）完成模块编译并输出：递归完事后，得到每个文件结果，包含每个模块以及他们之间的依赖关系，根据entry配置生成代码块chunk。
（6）输出完成：输出所有的chunk到文件系统。

Loader: 用于对模块源码的转换，loader 描述了 webpack 如何处理非 javascript 模块，并且在 buld 中引入这些依赖。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript，或者将内联图像转换为 data URL。比如说：CSS-Loader，Style-Loader 等。

Plugin: 目的在于解决 loader 无法实现的其他事,它直接作用于 webpack，扩展了它的功能。在 webpack 运行的生命周期中会广播出许多事件，plugin 可以监听这些事件，在合适的时机通过 webpack 提供的 API 改变输出结果。插件的范围包括，从打包优化和压缩，一直到重新定义环境中的变量。插件接口功能极其强大，可以用来处理各种各样的任务。
```


- SSR 和 客户端渲染有什么区别？
> [参考](https://www.jianshu.com/p/c7fb1dbdea99)
``` js
数据请求：由服务端请求首屏数据，而不是客户端请求首屏数据，这是“快”的一个主要原因。服务端在内网进行请求，数据响应速度快。客户端在不同网络环境进行数据请求，且外网http请求开销大，导致时间差。
```

- vue是如何实现绑定事件的？
``` js
vuejs中的事件绑定，使用<v-on:事件名 = 函数名>来完成的，这里函数名是定义在Vue实例中的methods对象中的，Vue实例可以直接访问其中的方法。 
简写：@click=""
v-on实现原理：
1. 在模板编译阶段，生成AST语法树，AST处理后，会在对应的AST节点上生成events属性，events属性是一个对象，key值是v-on绑定的事件名称，值是事件的响应函数。
2. codegen时递归的对每一个AST节点进行处理。针对events属性，最终的data属性中有一个on属性(如果有native事件，还会有nativeOn属性)，on属性的值也是一个对象，其中的key值是事件名称，value值是事件响应函数。
3. 事件和对应的响应最终存储在vm._events属性中；事件在子组件中通过emit触发，emit就是从vm._events属性中取对应事件的响应函数，然后执行

对于原生标签使用了更为简单的处理，即使用原生DOM自带的addEventListener API
```


- 浏览器事件有哪些过程? 为什么一般在冒泡阶段, 而不是在捕获阶段注册监听? addEventListener 参数分别是什么 ?
``` js
js中时间执行的整个过程称之为事件流，分为三个阶段：事件捕获阶段，事件目标处理函数、事件冒泡。

当某个元素触发某个事件（如：click），顶级对象document发出一个事件流，顺着dom的树节点向触发它的目标节点流去，直到达到目标元素，这个层层递进，向下找目标的过程为事件的捕获阶段，此过程与事件相应的函数是不会触发的。
到达目标函数，便会执行绑定在此元素上的，与事件相应的函数，即事件目标处理函数阶段。
最后，从目标元素起，再依次往顶层元素对象传递，途中如果有节点绑定了同名事件，这些事件所对应的函数，在此过程中便称之为事件冒泡。
通常情况下，事件相应的函数在冒泡阶段执行的。addEventListener的第三个参数默认为false，表示冒泡阶段执行（为true的时候，表示捕获阶段执行）。

addEventListener('click', fn, false);
```


- 面向对象如何实现? 需要复用的变量 怎么处理 ?
> ES5: 构造函数+prototype; ES6: Class; 复用的变量放在构造函数的原型上

- 移动端300ms延时的原因? 如何处理?
> [参考](https://www.cnblogs.com/chengxs/p/11064469.html)
``` js
因为移动端的click有很大延迟（大约300ms），300ms延迟来自判断双击和长按，因为只有默认等待时间结束以确定没有后续动作发生时，才会触发click事件。而触摸事件的延迟则是非常短的，使用触摸事件的能够提高页面响应速度，带来更好的用户体验。

禁用缩放：
<meta name="viewport" content="user-scalable=no">
<meta name="viewport" content="initial-scale=1,maximum-scale=1">
表明这个页面是不可缩放的，那双击缩放的功能就没有意义了，此时浏览器可以禁用默认的双击缩放行为并且去掉300ms的点击延迟。

FastClick: FastClick是FT Labs专门为解决移动端浏览器 300 毫秒点击延迟问题所开发的一个轻量级的库。FastClick的实现原理是在检测到touchend事件的时候，会通过DOM自定义事件立即出发模拟一个click事件，并把浏览器在300ms之后的click事件阻止掉。
```

- 点击穿透问题
``` js
假如页面上有两个元素A和B。B元素在A元素之上。我们在B元素的touchstart事件上注册了一个回调函数，该回调函数的作用是隐藏B元素。我们发现，当我们点击B元素，B元素被隐藏了，随后，A元素触发了click事件。
这是因为在移动端浏览器，事件执行的顺序是touchstart > touchend > click。而click事件有300ms的延迟，当touchstart事件把B元素隐藏之后，隔了300ms，浏览器触发了click事件，但是此时B元素不见了，所以该事件被派发到了A元素身上。如果A元素是一个链接，那此时页面就会意外地跳转。

1. 点击穿透问题：点击蒙层（mask）上的关闭按钮，蒙层消失后发现触发了按钮下面元素的click事件。
（2）跨页面点击穿透问题：如果按钮下面恰好是一个有href属性的a标签，那么页面就会发生跳转因为 a标签跳转默认是click事件触发 ，所以原理和上面的完全相同
（3）点击穿透问题：这次没有mask了，直接点击页内按钮跳转至新页，然后发现新页面中对应位置元素的click事件被触发了。

解决方案：把页面内所有click全部换成touch事件 touchstart 、’touchend’、’tap’， 需要特别注意 a标签，a标签的href也是click，需要去掉换成js控制的跳转，或者直接改成span + tap控制跳转。
```


- 主流框架的数据单向/双向绑定实现原理？
``` js
AngularJs: 脏检查；只有当UI事件，ajax请求或者 timeout 延迟事件，才会触发脏检查。Angular 每一个绑定到UI的数据，就会有一个 $watch 对象。所有的watch存储在$$watchList中，一次脏检查就是调用一次 $apply() 或者 $digest()，遍历检查所有watch，将数据中最新的值呈现在界面上。$digest现在至少运行每个监听器一次了。如果第一次运行完，有监控值发生变更了，标记为dirty，所有监听器再运行第二次。这会一直运行，直到所有监控的值都不再变化，整个局面稳定下来了。

VueJs: 基于数据劫持，结合发布订阅模式，实现的双向数据绑定

React: 本身并没有提到双向绑定的概念，但是可以基于setState和onChange事件实现数据层于视图层的同步更新。例如每次修改表单值时执行onChange事件，调用setState更新数据层，从而更新视图。
```

- DIFF算法为什么是O(n)复杂度而不是O(n^3)?
``` js
传统Diff算法需要找到两个树的最小更新方式，所以需要[两两]对比每个叶子节点是否相同，对比就需要O(n^2)次了，找到差异后还要计算最小转换方式，所以是O(n^3)。
相较于传统的diff算法，框架层的 diff 有个大前提假设：Web UI 中 DOM 节点跨层级的移动操作特别少，可以忽略不计，所以 diff 的核心就在于，它只对同层节点进行比较，忽略跨层节点的复用。
同层节点的比较也不会两两进行，而是按照一定的顺序比较，或通过 key 属性判断，所以只需要遍历一次新节点，因此算法的复杂度就降低到了O(n)。
```

- 移动端rem布局如何实现? 简述原理?
``` js
动态计算html的font-size

* 1rem等于75px,以width为750px的设计稿为标准,
* 比如p标签内设置font-size为24px;当width为750px时，根元素font-size为37.5px;
* 第一步：打包的时候转为rem,24 / 75 = 0.32rem;
* 第二步：由lib-flexible动态计算得根元素font-size为37.5px，即该宽度下，1rem为37.5px;
* 第三步：计算p标签内字体展示大小：0.32 * 37.5 = 12px
```


- 常见的页面布局?
``` js
静态布局  px布局
流式布局（Liquid Layout） 主要的划分区域的尺寸使用百分数（搭配min-*、max-*属性使用）; 例子：左侧固定，右侧自适应
自适应布局（Adaptive Layout） 即创建多个静态布局，每个静态布局对应一个屏幕分辨率范围
响应式布局（Responsive Layout） 检测窗口大小利用bootstrap布局, 媒体查询
弹性布局（rem/em布局） css3 rem, flex
```


- JSbridge原理, js和native是如何通信的?
> [参考](https://blog.csdn.net/yuzhengfei7/article/details/93468914)
``` js
JSBridge: 主要是给 JavaScript 提供调用 Native 功能的接口，让混合开发中的前端部分可以方便地使用 Native 的功能（例如：地址位置、摄像头）。
而且 JSBridge 的功能不止调用 Native 功能这么简单宽泛。实际上，JSBridge 就像其名称中的Bridge的意义一样，是 Native 和非 Native 之间的桥梁，它的核心是构建 Native 和非 Native 间消息通信的通道，而且这个通信的通道是双向的。
```

- Rollup和webpack区别?
``` js
Webpack对于代码分割和静态资源导入有着“先天优势”，并且支持热模块替换(HMR)，而Rollup并不支持，所以当项目需要用到以上，则可以考虑选择Webpack。但是，Rollup对于代码的Tree-shaking和ES6模块有着算法优势上的支持，若你项目只需要打包出一个简单的bundle包，并是基于ES6模块开发的，可以考虑使用Rollup。其实Webpack从2.0开始支持Tree-shaking，并在使用babel-loader的情况下支持了es6 module的打包了，实际上，Rollup已经在渐渐地失去了当初的优势了。但是它并没有被抛弃，反而因其简单的API、使用方式被许多库开发者青睐，如React、Vue等，都是使用Rollup作为构建工具的。而Webpack目前在中大型项目中使用得非常广泛。最后，用一句话概括就是：在开发应用时使用 Webpack，开发库时使用 Rollup。
```


- 静态文件的浏览器缓存如何实现？
> 强缓存+协商缓存

- 前端跨域方案?
> jsonp, CORS, postMessage, websocket, node正向代理，Nginx反向代理， window.name+window.location.hash+document.domain


- http 请求包含哪些字段 分别是什么意思?
``` js
Connection: keep-alive/close  长链接还是短连接
Cookie
Content-Type
Cache-Control: no-cache  缓存控制
Accept-Language： 语言
Host, User-Agent
```


- js 有哪些数据类型 如何判断
``` js
typeof 用于判断基本数据类型
instanceof 只能用来判断两个对象是否属于实例关系， 而不能判断一个对象实例具体属于哪种类型。
Object.prototype.toString.call({})  toString() 是 Object 的原型方法，调用该方法，默认返回当前对象的 [[Class]]
// "[object Object]"
```


- new String('a') 和 'a' 是一样的么?
``` js
一个是字符串对象,一个是基本类型
'abc' 与 new String('abc') 的区别就是一个是原始类型、一个是引用类型，而它两的关系就是 new String('abc') 是 ‘abc’的包装对象，而包装对象的作用就是方便原始类型调用一些方法。
```


- 移动端如何优化首页白屏时间过长?
``` js
手机白屏主要是因为页面渲染阻塞导致的，导致的原因有：
1：css文件加载需要一定的时间，在加载的过程中页面是空白的
解决：将css代码前置或者内联html 即使用<style>

2.可能是等待异步加载数据再渲染页面导致白屏,数据量大加载慢，导致数据没请求到阻塞页面渲染
解决：在手机显示的首屏时同步渲染页面，后续的数据在页面滚动（滑屏时）时再采取异步请求渲染页面

3.手机页面的首屏JS的执行会阻塞页面的渲染
解决：尽量不要再首屏html代码中放置内联脚本。即：不要使用<script></script>, 使用defer

Gzip压缩： Accept-Encoding: gzip, deflate
CDN,http缓存
骨架屏
离线包: 是将包括 HTML、JavaScript、CSS 等页面内静态资源打包到一个压缩包内。预先下载该离线包到本地，然后通过客户端打开，直接从本地加载离线包，从而最大程度地摆脱网络环境对 H5 页面的影响。
```

- js浮点数运算不精确 如何解决？
``` js
JS浮点数精度的缺失实际上是因为浮点数的小数部分无法用二进制很精准的转换出来，而以近似值来进行运算的话，肯定就存在精度的问题
把需要计算的数字升级（乘以10的n次幂）成计算机能够精确识别的整数，等计算完毕再降级（除以10的n次幂），这是大部分编程语言处理精度差异的通用方法。 
```




- 正则表达式如何匹配手机号?
``` js
/^1[345789]\d{9}$/
```



- Doctype作用? 严格模式与混杂模式-如何触发这两种模式，区分它们有何意义?
``` js
doctype是一种标准通用标记语言的文档声明类型，目的是告知要有什么来解析文档。
**<!DOCTYPE>**声明是用来指示web浏览器关于页面使用哪个html版本进行编写的指令。声明必须是在文档的第一行，在html标签之前。
浏览器本身就分为两种模式，一种是严格模式（标准模式），一种是混杂模式（怪异模式），浏览器就是通过doctype来区分这两种模式的， doctype在html中的作用就是触发浏览器的严格模式，如果省略doctype，浏览器就会进入到混乱模式。
严格模式的排版和要求都是以js运作模式是以该浏览器支持的最高的标准来运行程序的。
混乱模式中，页面以宽松的渐进增强的方式来兼容显示，先以老旧的浏览器的行为来渲染页面。在这种模式下，有些样式会和标准模式存在差异，而在不同的浏览器下，界面的显示也会不同，所以一定要在开头使用doctype。
```


- 大文件的分片上传和断点续传怎么做的
> [参考](https://blog.csdn.net/weixin_44475093/article/details/115191898)



- 性能指标FP、FCP和FMP分别跟哪些因素有关?
``` js
首次绘制时间（ FP ） ：即 First Paint，为首次渲染的时间点。
首次内容绘制时间（ FCP ） ：即 First Contentful Paint，为首次有内容渲染的时间点。
首次有效绘制时间（ FMP ） ：用户启动页面加载与页面呈现首屏之间的时间。它是我们测量用户加载体验的主要指标。
首次交互时间（ FID ） ：即 First Input Delay，记录页面加载阶段，用户首次交互操作的延时时间。FID 指标影响用户对页面交互性和响应性的第一印象。

FP与FCP这两个指标之间的主要区别是：FP是当浏览器开始绘制内容到屏幕上的时候，只要在视觉上开始发生变化，无论是什么内容触发的视觉变化，在这一刻，这个时间点，叫做FP。
相比之下，FCP指的是浏览器首次绘制来自DOM的内容。例如：文本，图片，SVG，canvas元素等，这个时间点叫FCP。
```