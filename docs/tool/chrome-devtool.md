---
title: Chrome-DevTools使用笔记
date: 2023-11-16 17:39:45
permalink: false
categories:
  - devtools
  - 调试
tags:
  - devtools
---


# Chrome-DevTools使用笔记


Chrome开发者工具（简称DevTools）是一组网页制作和调试的工具，内嵌于Google Chrome浏览器中。DevTools使开发者更加深入的了解浏览器内部以及他们编写的应用。通过使用DevTools，可以更加高效的定位页面布局问题，设置JavaScript断点并且更好的理解代码优化。


**打开DevTools：**

- 方法1：页面单击鼠标右键 => 点击【检查】
- 方法2：浏览器右上角【...】 => 【更多工具】=> 【开发者工具】
- 方法3：mac快捷键：`command + option+ I`打开DevTools的`Performance`; `command + option+ J`打开`Console`; `command + option+ C`打开`Element`
> Windows为`Ctrl + Shift + ...`



## Console

- 错误和警告: 
    - `console.error()`打印的结果是红色的，
    - `console.warn()`打印的信息是黄色的; 
    - `console.assert()`接受两个参数，如果第一个参数的结果为false，则该方法会将第二个参数输出到控制台: `console.assert(list.length < 500, "count is > 500")`; 




- `$_` 是一个特殊变量，其值始终等于控制台中上一次操作的结果, 此技术是调试代码的便捷方法~

``` js
1 + 2 // 3
$_ * 3 // 9
$_   //  9
$_ + 4 // 13
```

- `$0`也是一个特殊变量，它引用“元素”面板中当前选定的元素：

``` js
$0
<img data-v-5244ef91="" data-v-03256cc6="" src="....." />
// 可用该变量快速获取dom的属性
$0.offsetHeight
```
> `$1`对上次的节点引用，`$2`对上上次节点的引用，一直到`$4`


- 使用`XPath`查询DOM: XPath是一种查询语言，用于从DOM文档中查找node，返回结果可能是一组node，字符串，布尔值或者数字。你可以直接在DevTools的JavaScript控制台中直接使用XPath查询语句。
``` js
// 在指定的frame中查找img元素
var frame = document.getElementsByTagName('iframe')[0].contentWindow.document.body;
$x('//img', frame);
// $x(xpath, context)。通过扩展参数，你可以选择特定上下文里的DOM元素。
```

- 选择元素: 

``` js
//  $(selector, [startNode])：单选择器, 返回满足指定CSS规则的第一个元素，此方法为document.querySelector()的简化。
// 第二个参数startNode，该参数指定从中搜索元素的“元素”或Node。此参数的默认值为document

//  $$() - 返回满足指定CSS规则的所有元素，此方法为querySelectorAll()的简化。
//  $x() - 返回满足指定XPath的所有元素。

$('code') // Returns the first code element in the document.
$$('figure') // Returns an array of all figure elements in the document.
$x('html/body/p') // Returns an array of all paragraphs in the document body.
```



- `copy`复制变量：

``` js
location // 控制台输入location显示相应信息
copy(location) // 即可复制，之后在其他地方粘贴即可~
```
> 该copy功能不是由ECMAScript定义的，而是由Chrome提供的。使用此功能，你可以将JavaScript变量的值复制到剪贴板。


- `table`列表化：

``` js
let users = [{name: 'tom', age: 12, gender: 1}, {name: 'nice', age: 30, gender: 0}, {name: 'rose', age: 20, gender: 2}]
undefined
table(users) // 表格化
console.table(users)
```

- 打印DOM对象节点：`console.dir()`
``` js
console.log(document) // 打印出纯标签
console.dir(document) // 输出DOM树对象
```


- 给console编组：`console.group()`
``` js
console.group('用户列表');
console.log('name: 张三');
console.log('job: 🐶前端');
// 内层
console.group('地址');
console.log('Street: 123 街');
console.log('City: 北京');
console.log('State: 在职');
console.groupEnd(); // 结束内层
console.groupEnd(); // 结束外层

```




- 变量打印：`%s、%o、%d`
``` js
%s：字符串
%o：对象
%d：数字或小数

const text = "文本1";const obj={a: 1};const num = 3;
console.log(`打印${text}`)  // 打印文本1
console.log("打印==%s", text) // 打印==文本1
console.log('打印===%o', obj); // 打印==={a: 1}
console.log('打印====%d', num); // 打印====3
```

- 可以使用`%c`格式符，来为控制台增加样式：
``` js
console.log('%cBlue! %cRed!', 'color: blue;', 'color: red;');
console.log("%cThis will be formatted with large, blue text", "color: blue; font-size: x-large");

```

- 快速清空控制台历史：`clear()`或者`command + K`


- 保留上一个页面的console记录：`Console => 右上角设置图标 => 勾选【Preserve log】`


- 使用 `console.time()` 和 `console.timeEnd()` 分析循环的性能
> 调用`console.time()`开启一个计时器，调用 `console.timeEnd()`关闭计时器，并在终端输出计时器消耗的时间。计时器在分析循环这样的非函数内操作的时候还是蛮有用的。

``` js
let i = 0;
console.time("While loop");
while (i < 1000000) {
  i++;
}
console.timeEnd("While loop");
console.time("For loop");
for (i = 0; i < 1000000; i++) {
  // For Loop
}
console.timeEnd("For loop");

```


- 使用 `console.profile()` 和 `console.profileEnd()`分析程序性能
> 在DevTools窗口控制台中，调用 `console.profile()`开启一个`JavaScript CPU` 分析器.结束分析器直接调用 `console.profileEnd()`; 具体的性能分析会在`Performance`分析器面板中展示~



- 监听事件：`monitorEvents()`
``` js
// 该方法有两个参数，第一个参数是要监听的对象。如果未提供第二个参数，所有事件都会返回
monitorEvents(document.body, 'click'); // 监听document的点击事件
unmonitorEvents(document.body) // 停止监听事件
```


- 获取指定对象的绑定事件: `getEventListeners(object)`




- 置顶 `JavaScript` 表达式: 打开 Console 面板 => 点击面板上方小眼睛的图标，输入 Expression，就可以置顶了；


- 保留 log 记录：`Console => 右上角设置图标 => 勾选Preserve log`；同样在 Network 面板下也有该选项可保留网络记录；



## Element


- 在“元素”面板中拖放: Element中单击选中Node节点，可拖放改变其在页面中的位置

- 调试元素伪类样式：Element => 选中Node节点 => Styles, 点击`:hov`，勾选需要显示的伪类，有`:hover, :active, :focus, ...`，这样就可以调试这些伪类样式了~


- 隐藏元素快捷方式：选中Node节点，按`H`键即可；此操作是将`visibility: hidden !important;`样式添加到相应的元素


- 快速获取Dom元素引用：Element => 选中元素 => 鼠标右键，`Store as global variable`, 之后就会在控制台打印选中的dom

- 强制触发元素的`hover`等状态：Element => 选中元素 => Force state => 选择需要显示的状态，有：`:active, :hover, :focus`等状态，这样就可以看到某些元素hover等状态时的样式了~


- 给选中元素快速添加类名：Element => 选中Node节点 => Styles, 点击`.cls`;


- 显示完整的可访问性树视图：
    1. 点击右上角设置图标 => `Experiments` => `Enable the Full accessibility tree view in the Elements panel`;
    2. 之后重启DevTool, 在`Elements`面板中点击右上角的`无障碍按钮`，即可将元素视图模式切换为无障碍树视图




## Network

- 重新发送 XHR 请求：打开网络面板【Network】 =>  单击【XHR】按钮  => 选择你要重新发送的XHR请求  => `【Replay XHR】`
> 如果要修改参数，可以`【Copy】 => 【Copy as fetch】`；然后在控制台修改参数，回车直接请求；


- 阻断请求: 打开网络面板【Network】 =>  单击【XHR】按钮  => 选择你要重新发送的XHR请求  => `【Block request URL】`或`Block request domain`
> 可以阻断请求URL和当前域名，阻断后刷新页面，该接口就会飘红; 选择之后下方`Network request blocking`会显示

- 修改用户代理: `command + shift + p`，输入：`network conditions`, 选择即可打开 network conditions 面板，可进行 User Agent 配置；
> 也可通过点击`Network`面板上方的网络图标，呼出该面板~


- 自定义`network`速率: Network面板上方有一个默认值为`No throtting`下拉选择项，这里可设置网速，有：`No throtting / Fast 3G / Slow 3G / Offline`等选项，还可以通过`add`自定义网速为多少`kb/s`~


- 快速复制接口属性值: 点击接口返回数据的某一字段，选择`Copy property path`可复制属性路径；`Copy value`可复制属性值；





## Source



### 调试


代码在某个平台运行，把运行时的状态通过某种方式暴露出来，传递给开发工具做 UI 的展示和交互，辅助开发者排查问题、梳理流程、了解代码运行状态等，这个就是**调试**。


> 首先本地启动一个项目，这里以 Vite 项目为例；可以本地代码添加`debugger`打断点，也可以在控制台`Sources`对应源码中点击添加断点，然后刷新页面就可以调试了，代码会在断点处断住：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/tool-dev01.jpg')" width="auto"/>


- 右边操作栏区域的按钮从左到右分别：
  - `恢复执行`：跳过当前断点，直接执行到下一个断点（如果有）；
  - `单步执行`：从当前断点开始，代码按js执行顺序一步步执行；
  - `进入函数调用`：方便进入一些第三方源码进行调试；
  - `跳出函数调用`：
  - `xx`
  - `让断点失效`：高亮后设置的断点就会失效；

- `Block`会显示当前代码使用函数变量信息，`Local`显示已经加载的本地变量，`Global`是全局变量；
- `Call stack`是调用栈信息；


### 其他


- 快速调试代码片段：左上角 选择`>>`图标，选择`Snippets`，`+`添加New snippet, 即可输入代码片段进行调试：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/tool-dev201.jpg')" width="auto"/>


- Local Overrides 本地资源覆盖：
> 使用我们自己的本地资源覆盖网页所使用的资源; 使用DevTools的工作区设置持久化，将本地的文件夹映射到网络，在chrome开发者功能里面对css 样式的修改，都会直接改动本地文件，页面重新加载，使用的资源也是本地资源，达到持久化的效果。

1. 创建一个文件夹以在本地添加替代内容；
2. `Sources` =>  `Overrides` => `Enable local Overrides`, 选择本地文件夹；
3. 打开`Elements`，编辑样式，自动生成本地文件；
4. 返回`Sources`，检查文件，编辑更改。





## Performance性能分析

> Performance是Google浏览器自带的页面性能插件，可以记录站点在运行过程中的性能数据，有了这些性能数据，我们就可以回放整个页面的执行过程，这样就方便我们来定位和诊断每个时间段内页面的运行情况，从而有效帮助我们找出页面的性能瓶颈。



### Performance面板

> 这里以[掘金首页](https://juejin.cn/)为例分析下~

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance06.jpg')" width="auto"/>

- 录制：点击开始录制；
- 重制：点击重新加载页面，并开始录制；
- 清除：清除录制记录
- 上传/下载：支持上传或下载record文件，下载可以把录制生成的json文件下载到本地；


> 录制成功后会生成如下录制分析报告：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance07.jpeg')" width="auto"/>

::: tip 颜色划分
- 蓝色（Loading）：网络通信和HTML解析
- 黄色（Scripting）: Javascript执行
- 紫色（Rendering）: 样式计算和布局（重排）
- 绿色（Painting）: 样式更改（重绘）
- 灰色（Other）: 其他事件
- 白色（Idle）: 空闲时间
- 红色（LongTasks）: 长任务出现
:::


**概览面板**

由**页面帧速 (FPS)**、CPU 资源消耗、网络请求流量、V8 内存使用量 (堆内存)几项指标按照时间顺序记录变化的面板;

- **时间线**：显示录制时长，可缩放范围；
> 概览面板和性能面板都是依赖于时间线的，假如我们录制了10000毫秒，那么它们的时间线就是10000毫秒~
- **红点**：FPS 图表上出现了红色块，那么就表示红色块附近渲染出一帧所需时间过久，帧的渲染时间过久，就有可能导致页面卡顿，你可以点击该红色块，那就可以把时间线聚焦到该问题区域。
> 红色下面的区域：`CPU 资源消耗、网络请求流量、V8 内存使用量 (堆内存)`
- **Memory**: 显示`JS, Documents, GPU`等内存使用情况；



**性能面板**

概览面板是用来定位到可能存在问题的时间节点，如果需要更进一步的数据，来分析导致性能问题的原因，需要从性能面板入手。我们介绍一下有哪些常见性能指标项：

- **Network指标**：该指标展示了页面中的每个网络请求所消耗的时长，并以瀑布流的形式展现。
> 点击请求，下方详情面板会展示对应请求信息：蓝色是html请求、紫色是css请求、黄色是js请求、绿色是图片~
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance08.jpg')" width="auto"/>
1. 左侧的一条线：请求准备；
2. 左侧浅色区域：发送请求，并等待服务器返回；
3. 中间深色区域：返回内容，下载；
4. 最右侧的一条线：线程空闲时间；

- **Frames**：帧信息，也就是浏览器生成每帧的记录；点击可在下方看到`CPU`渲染时长等信息~
> 我们知道页面所展现出来的画面都是由渲染进程一帧一帧渲染出来的，帧记录就是用来记录渲染进程生成所有帧信息，包括了渲染出每帧的时长、每帧的图层构造等信息，你可以点击对应的帧，然后在详细信息面板里面查看具体信息。

> 白色：没有变化; 绿色：按预期及时渲染; 黄色：浏览器尽最大努力及时呈现至少一些视觉更新，比如滚动了但主线程没空; 红色：掉帧，无法在合理的时间内渲染帧，比如：`scroll，resize`事件触发过于频繁,浏览器来不及处理导致在下一个事件被触发之前无法完成

- **Animations**: 动画渲染分析；

- **Timings**：用来记录一些关键的时间节点在何时产生的数据信息，像`FP、LCP、DOMContentLoaded、Onload` 等事件产生的时间点，它们体现在在几条不同颜色的竖线上。

- **Main**： **记录渲染主线程的任务执行过程，大部分流程、Jacvascirpt执行、V8垃圾回收、定时设置回调任务等等也是均跑在主线程的， 所以这也是我们最需要关注的一个指标**。

- **Layout shifts**: 意外布局偏移分析，记录页面加载过程中发生的视觉不稳定性

- **Compositor**：记录了合成线程的任务执行过程

- **GPU**： 记录了 GPU 进程主线程的任务执行过程

- **Chrome_ChildIOThread**： 渲染进程维护着一个IO线程，主要用来接收用户输入事件、网络事件、设备相关等事件，如果事件需要渲染主线程来处理，那么 IO 线程还会将这些事件转发给渲染主线程。在性能面板上，Chrome_ChildIOThread 指标对应的就是 IO 线程的任务记录。


**详情面板**

- Summary: 统计表，展示当前任务具体信息；
- Bttom-Up: 会展示当前任务的所有活动，按时间倒序排列；
- Call Tree: 当前任务的所有子任务；
- Event Log: 事件日志，活动在记录过程中先后顺序



### Main指标分析
> 其中 Main 这部分就是网页的**主线程**，也就是执行 Event Loop 的部分；这块区域包含了所有 task 执行的流程，每个 task 的调用栈。

Main 指标就记录渲染主线上所执行的全部任务，以及每个任务的详细执行过程，所以了解任务和过程在Performance面板的体现是很有必要的。

Event Loop 就是循环执行宏任务。每个 Task 都有自己的调用栈，可以看到函数的执行路径，耗时等信息。图中宽度代表了耗时，可以直观的通过块的宽窄来分析性能。


<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance09.jpg')" width="auto"/>

观察上图，图上几段灰色横条，灰色横条就对应了一个任务`Task`，灰色长条的长度对应了任务的执行时长。渲染主线程上的任务都是比较复杂的，灰线下面的横条就是一个个**任务的过程**, 同样这些横条的长度就代表这些过程执行的时长。

> 我们可以把任务看成是一个 Task 函数，在执行 Task 函数的过程中，它会调用一系列的子函数，这些子函数就是我们所提到的过程。

展示的信息中很多种颜色，这些颜色代表着不同的含义：**灰色就代表宏任务 task; 蓝色的是 html 的 parse，橙色的是浏览器内部的 JS; 紫色是样式的 reflow、repaint，绿色的部分就是渲染; 其余的颜色都是用户 JS 的执行了**~

> 右上角有红色三角形表示该`Task`是一个长任务(执行超过`50ms`), 长任务过多会导致页面出现卡顿~

> 一般网页加载的Main指标都比较复杂, 这里写一个简单的页面分析下：

``` js
<html>

<head>
    <title>Main指标分析</title>
    <style>
        .area {
            border: 2px black solid;
        }

        .block {
            background-color: green;
            height: 100px;
            margin: 10px;
            width: 100px;
        }
    </style>
</head>

<body>
    <div class="area">
        <div class="block"></div>
    </div> <br>
    <script> 
        function setBlockArea() { 
            var el = document.createElement('div'); 
            el.setAttribute('class', 'area');
            el.innerHTML = '<div class="block"></div>';
            document.body.append(el); 
        } 
        setBlockArea() 
    </script>
</body>
</html>
{/* 
首先页面渲染div;
然后执行setBlockArea方法，再插入一个div
 */}
```
> 本地直接在浏览器打开上面的`html`文件后，打开控制台`Performance`，点击`重制`录制页面重新加载流程，查看Main指标下的分析：


<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance10.jpg')" width="auto"/>


可以点击任意脚本活动查看，`anonymous`代表匿名函数，`Summary`面板中会显示耗时情况和函数调用的来源;

按记录期间发生的顺序查看活动，包括加载、脚本、渲染、绘制等，也提供了事件名和耗时时长搜索过滤。

`Call Tree`：调用树，顺序是从上到下，和`Buttom-Up`顺序相反; bottom-up 是列表展示， call tree 是树形展示；

`SelfTime`指的当前函数执行时间，不包括子函数执行时间，百分比是当前时间除以所有`SelfTime`时间之和。

`TotalTime`指的`SelfTime`和子函数的`TotalTime`之和，百分比是当前时间除以首个函数的`TotalTime`。

`Activity`列中的顶级项目，例如`Event、Paint`和`Composite Layers`是根活动，嵌套表示调用堆栈。

`Start Time`表示该活动开始的时间点，相对于记录的开始时间。比如103.6ms，表示活动在录制开始后103.6毫秒开始。



- **主要分为三个Task阶段：**

1. 导航阶段：
2. 解析HTML数据阶段（DOM跟CSS）：
3. 绘制阶段



#### 导航阶段

> 点击每个Task，发现下面都会执行一些事件，首先点击第一个导航Task并放大：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance12.jpg')" width="auto"/>

会在下方详细面板的`Event Log`看到具体的活动，依次执行`pagehide > visibilitychange > webkitvisibilitychange > unload > unloadEventEnd > Send request > Receive response > ...`：

1. 首先是触发`pagehide`事件，上一个页面隐藏；之后卸载上一个页面；
2. 页面卸载完成后发起请求，接受响应体，标志导航结束，同时开始下载HTML；
3. 接着接收返回的html文档（Recieve data）；


#### 解析HTML数据阶段

> 点击第二个Task，发现这一步主要是解析接收的HTML文档~

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance13.jpg')" width="auto"/>


在这一步首先执行`Parse HTML`方法；在该方法里会执行`Evaluate script`流程编译JS代码；接着执行`setBlockArea`,然后再次执行`Parse HTML`...

上图中的`DCL`是`DOMContentLoaded Event`, `L`是`Onload event`~





#### 绘制阶段

> DOM生成后进入下一个任务: 绘制阶段：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance14.jpg')" width="auto"/>

- Recalculate style：样式计算；在`DCL`事件后执行~

之后在`Onload event`事件后执行绘制操作：
- Layout: 布局
- Pre-paint: 预备绘制
- Paint: 绘制
- Layerise

> Paint会切分成很多绘制命令，Layerise会把绘制命令给到合成线程去绘制，合成线程会利用GPU来执行绘制命令；


**完成阶段**

绘制完成后，会执行`DOMContentLoaded`事件，接着执行：`domComplete、readystatechange、loadEventStart、load、loadEventEnd、pageshow`这些事件~



- **总结如下图：**

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/zhuawa-performance11.png')" width="auto"/>





### 总结


1. 通过 Network分析网络请求时长，看下是否有优化空间；

2. 通过`Main指标`下每个`Task`的`Event Log`，分析每个任务详细过程，子任务情况；

3. 网页渲染执行顺序：`rAF(requestAnimationFrame)回调 => 回流重绘(reflow、repaint) => 渲染`，构成一个宏任务，每 `16.7 ms`（与刷新率有关） 执行一次; 
> 在 Performance 中宽度代表时间，超过 `50ms` 就被认为是 `Long Task`，会被标红。因为如果 `16.7ms` 渲染一帧，那 50ms 就跨了 3、4 帧了; 我们做性能分析，就是要找到这些 Long Task，然后优化掉它。

4. Performance 可以看到代码执行全貌，而断点调试的调用栈只能看到某一条流程。所以调试代码的时候可以 Performance 和 Debugger 结合来看。

5. 因为渲染和 JS 执行都在主线程，在一个 Event Loop 中，会相互阻塞，如果 JS 有长时间执行的 Task，就会阻塞渲染，导致页面卡顿。所以，性能分析主要的目的是找到 `long task`，之后消除它。




## Rendering配置

1. `cmd + shift + P`, 输入`rendering`，选择`Show Rendering`，会在下方打开`Rendering`面板；里面可以勾选一些选项：
2. 右上角`...`图标 => `More tools` => `Rendering`


- `Paint Flashing`(绘画闪烁): 页面中需要重绘的区域会突显成绿色

- `Layer Shif Regions`(层移位区域): 页面中需要重排的区域会突显成蓝色

- `Scrolling Performance Issues`(滚动性能问题): 页面中减慢滚动速度的元素会突显成蓝绿色，包括触摸滚轮事件处理程序和其他主线程滚动情况

- `Core Web Vitals`(核心网络生命力): 勾选之后右上角面板中能够看到当前网站的三大核心指标所消耗的时间：
    1. `LCP` (Largest Contentful Paint) 显示最大内容元素所需的时间，衡量网站的载入效率
    2. `FID` (First Input Delay) 首次输入延迟时间，衡量网站互动性
    3. `CLS` (Cumulative Layout Shift) 累计版面配置转移，衡量网页稳定性

> 那我们拿到这些指标，再结合浏览器相关标准就能有目的性的做性能优化


## 页面图层Layers

`cmd + shift + P`, 输入`layer`，选择`Show layers`，会打开`Layers`面板:

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/tool-dev202.jpg')" width="auto"/>

左边会显示页面dom图层信息，右边会显示图层结构，滚动页面，图层会动态更新; 下方`Details`会显示对应图层信息~

`Slow scroll rects`的意思是慢速移动矩形，其实就是对应上面`Rendering`中的第3点，影响页面滚动的元素。
> 有时候在写页面的时候，页面出现横向滚动条又无法定位到哪个子集元素宽度超出了，这时候就可以打开Layers面板查看了，能快速定位我们的css问题。



## Memory

- 测试当前内存: `Memory` => 点击`Heap snapshot`，再点击左上角圆圈，获取当前快照; 可以看到当前内存占用情况

- 测试内存泄漏: `Allocation instrumentation on timeline`，再点击左上角圆圈，开始记录内存情况
> 如果内存泄漏会看到内存一直增加，可以查看具体哪个变量造成的内存泄露。

- performance查看内存泄露： `Performance`, 勾选`Menory`，再去录制即可; 如果内存一直在增加，没有平稳成一条直线就说明有泄露了。


## Lighthouse



## 截图

1. 打开控制台 => 【...】 => 【Run command】:
> 快键键：`command + shift + P`

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/devtool01.jpg')" width="auto"/>

2. 输入关键词`screen`, 可看到有四种截屏方式~

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/devtool02.jpg')" width="auto"/>


- Capture area screenshot
> 区域截屏：选择之后，鼠标会变成十字架，之后鼠标左键选中一个区域后，松开鼠标就会自动截取所选区域~


- Capture full size screenshot
> 全尺寸截屏：选择之后会截取页面全部内容，适合有滚动条页面的截屏~


- Capture node screenshot
> node节点截屏

1. 打开控制台后，先选中需要截取的node节点：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/devtool03.jpg')" width="auto"/>


2. 然后点击【 Capture node screenshot】 即可截取该node节点~


- Capture screenshot
> 直接截取页面可视区域部分内容~





## 其他技巧




- 获取图片的base64地址：`Network => Img => 选中请求 => Preview => 双击图片 => 【Copy image as data URL】`


- 颜色选择器：`Element => 选择有颜色样式的Dom => Styles`, 在颜色样式上点击即可弹出颜色选择器~
> 颜色选择器具有各种功能，例如: 色调控制、使用吸管从页面元素中选择颜色、切换调色板、可以在当前颜色的 RGBA、HSLA 和十六进制表示之间切换。。。



- 检查css/js的使用范围: 点击右上角【...】 => `More tools` => `Coverage` => 点击刷新按钮开始重新加载页面，以测试页面的代码覆盖率；
> 可以在 `Coverage` 面板查看页面加载时js和css未使用的大小和百分比，从而检查出页面中没有使用的 CSS 和 JavaScript，优化代码~


- 调试动画：右上角【...】 => More tools => Animations
> Chrome DevTools 提供了检查和修改动画的功能。它可以帮助我们播放动画、修改动画时间并分析特定时间范围内的视图。


- 选择DevTools语言：`右上角设置图标 => Preferences => Language`, 可选择不同的语言；

- 选择界面主题：
    1. `右上角设置图标 => Preferences => Theme`, 可选择`Light/Dark`不同主题；
    2. `右上角... => Run command`或者快捷键：`cmd + shift + P`，输入：`theme`，也可切换不同主题；


- 查看页面css概览：`cmd + shift + P`, 输入`css`，选择`Show css overview`，会在下方打开`CSS overview`面板；
> 面板会统计页面使用的字体、颜色等信息，`Unused declarations`中点击数值可以看到具体的元素，鼠标放上去能定位到DOM位置。


- 性能监视器: `cmd + shift + p`，输入`Show Performance Monitor`，选择，下方就会出现`Performance Monitor`面板；
> 可以看到：CPU使用情况、JS内存大小、DOM节点数等都可以实时监控。


- FPS监控：`cmd + shift + p`，输入`fps`，选择`show frames per second(FPS) meter`，页面左上方会出现弹窗，展示：`Frame Rate, GPU raster, GPU memory`信息；
> `FPS(Frames Per Second)`，表示每秒传输帧数，是速度单位，是用来分析动画的一个主要性能指标。一般在`50-60FPS`的动画会相当流程，`30FPS`就会感觉卡顿了。


- 全局搜索代码：右上角`...` => `Search`, 会自动显示`Search`面板，输入关键字即可，点击搜索结果即可跳到对应文件的代码


- 双屏模式：点击右上角设置图标 => `Experiments` => 勾选`Emulation: Support dual-screen mode`; 之后在`Devices`中勾选`Surface Duo`，重启DevTool；切换到移动设备调试模式，选择`Surface Duo`, 右上角点击双屏模式图标即可~
> 对于开发要适配折叠屏手机的应用是非常有用的~










## 备注


### Chrome DevTools 原理

> Chrome DevTools 分为两部分，backend 和 frontend：

- backend: backend 和 Chrome 集成，和 Js Runtime，内部的布局、渲染器深度绑定，用于将内部的状态通过协议暴露出来。

- frontend: frontend 是独立的，负责对接调试协议，做 UI 的展示和交互。

两者之间的调试协议叫做 `Chrome DevTools Protocol`，简称 `CDP`。

传输协议数据的方式叫做**信道（message channel）**，有很多种，比如 Chrome DevTools 嵌入在 Chrome 里时，两者通过全局的函数通信；当 Chrome DevTools 远程调试某个目标的代码时，**两者通过 WebSocket 通信**。

frontend、backend、调试协议（CDP）、信道，这是 Chrome DevTools 的 4 个组成部分。

> backend 可以是 Chromium，也可以是 Node.js 或者 V8，这些 JS 的运行时都支持 Chrome DevTools Protocol。

**CDP**

CDP 简单讲就是一组 API，用于与 Chrome DevTools 进行通信。它允许开发人员以编程方式控制 Chrome，例如在 Chrome 中打开一个新的选项卡，加载网页，设置网络条件等。CDP 可以通过 WebSocket 进行通信，也可以通过 HTTP 请求进行通信。Chrome DevTools 的大部分功能都是基于 CDP 实现的。

> [Puppeteer](https://github.com/puppeteer/puppeteer) 是一个著名的自动化库，用于自动化控制 Chrome 或 Chromium 浏览器。本质上就是使用 CDP 协议来与浏览器进行通信，相当于是对 CDP 的高级封装版。

> 基于 CDP，我们可以做很多有趣的事，比如自己打造一个独享版的 Devtools，也可以直接基于 Chrome Devtools 进行修改，比如小程序的调试器就可以基于 Devtools 项目做二次封装。

### VSCode Debugger


- 项目根目录下新建`.vscode/launch.json`文件，新建完成后点击右下角【添加配置】，然后选择【Chrome 启动】：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/tool-dev02.jpg')" width="auto"/>

> 之后就会添加默认配置, `url`修改为项目本地启动后的地址，`name`也可以自定义~

``` json
// launch.json

{
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome",
            "url": "http://localhost:3037",
            "webRoot": "${workspaceFolder}"
        }

    ]
}
```


- 配置完成后，打开`VSCode`左侧`Debug`窗口，会出现刚配置的`launch`，点击左侧绿色启动按钮，`Chrome`浏览器即可新开一个窗口，启动服务：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/tool-dev03.jpg')" width="auto"/>

这时鼠标悬浮代码左侧会出现小红点，点击即可添加断点；左下侧会显示添加的断点信息；

操作栏从左到右功能依次如下，和 `Chrome DevTools` 类似：

  - `继续/暂停`：跳过当前断点，直接执行到下一个断点（如果有）；
  - `单步跳过`：从当前断点开始，代码按js执行顺序一步步执行；
  - `单步调试`：进入函数体调用；
  - `单步跳出`：跳出函数
  - `重启`：刷新，从新开始~
  - `停止`：停止调试，关闭chrome窗口~

- 代码会执行到断点处断住，本地和全局作用域的变量，调用栈等都会展示在左边; 也可点击下方【调制控制台】查看代码打印信息；


> 之前调试是在 Chrome DevTools，写代码在 VSCode；而现在写代码和调试都可以在 VSCode 里，可以边调试边写代码~


Q: 为什么 `Chrome DevTools` 和 `VSCode Debugger` 都可以调试网页呢？
> 这是因为调试协议是一样的，都是 CDP。Chrome DevTools 可以对接 CDP 来调试网页，VSCode Debugger 也可以。VSCode Debugger 的原理和 Chrome DevTools 差不多，也是分为 frontend、backend、调试协议这几部分，只不过它多了一层**适配器协议 Debug Adapter Protocol**: 因为 VSCode 不是 JS 专用编辑器，它可能用来调试 Python 代码、Rust 代码等等，自然不能和某一种语言的调试协议深度耦合，所以多了一个适配器层。



### 断点类型


- **异常断点**

代码抛了异常，你想知道在哪抛的，这时候就可以用异常断点。

``` js
// 比如下面代码：
function add(a, b) {
    throw Error('add');
    return a + b;    
}

console.log(add(1, 2));

// add 函数里抛了个异常，你想在异常处断住，这时候就可以加个异常断点
```
> 示例代码比较简单，很多时候代码抛了错你不知道哪里抛的，就可以用异常断点来找原因，断住以后看看调用栈啥的

- Chrome DevTools：`Breakpoints`中勾选`Pause on caught exceptions`

- VSCode: 勾选` Uncaught Exceptions（未捕获的异常）`

> 它可以在没有被处理的错误或者 Promise 的 reject 处断住; 

`Caught Exception（捕获的异常）` 是在被 `catch` 处理的异常出断住; `Uncaught Exceptions` 更常用一些。



- **条件断点**

> 有的时候我们只想在满足一定条件的时候才断住，这时候就可以用条件断点，比如for循环中满足某一条件才断点


- VSCode: `add Conditional Breakpoint（添加条件断点）`, 添加表达式，满足条件才断住




- **LogPoint**

> 当你觉得断住次数太多了，太麻烦，不想在断点处断住，但却想看下这时候的值，绝大部分同学会选择`console.log`，但其实有更好的方式: 添加一个 `LogPoint`

`Logpoints` （日志点）是一种向控制台提供调试信息的方式，而无需使用 `console.log()`，这在线上应用调试时会很有用。

- Chrome-DevTools: 右键单击 DevTools 中的 Source 选项卡中的任何行并指定要记录的表达式来添加新的 Logpoint。

- VSCode: `Add Logpoints（添加记录点）`


> 相较于`console.log`, 使用该功能可以减少调试代码，提高代码的整洁性。并且，**线上应用也可以直接添加控制台输出**。




- **DOM断点**

> 想在 DOM 被修改的时候断住, 可以用DOM断点~

- Chrome DevTools： `Element => 选择Node节点 => Break on => subtree modifications`

有三种断点类型：subtree modifications（子树修改的时候断住）、attribute modifications（属性修改的时候断住）、node removal（节点删除的时候断住）。

> 之后该DOM存在修改时，就会自动断住~



- **Event Listener 断点**

调试事件发生之后的处理逻辑，需要找到事件监听器，然后打个断点

- Chrome DevTools： `Source => Event Listener Breakpoints`
> 里面有各种类型事件，如`Keyboard,Mouse,...`, 勾选即可~


- **url 请求断点**

当你想在某个请求发送的时候断住，但你不知道在哪里发的，这时候就可以用 url 请求断点

- Chrome DevTools： `Source => XHR/fetch Breakpoints`, 添加；不输入内容就是在任何请求处断住，你可以输入内容，那会在 url 包含该内容的请求处断住

> 这在调试网络请求的代码的时候，是很有用的。




## 例：Performance性能优化实践


- 首先新建一个`index.html`:

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>worker performance optimization</title>
</head>
<body>
    <div>worker performance optimization</div>
    <!-- 两个 script 标签是两个宏任务，第一个宏任务的调用栈是 a、b，第二个宏任务的调用栈是 c、d。 -->
    <script>
        function a() {
           b();
        }
        function b() {
            let total = 0;
            for(let i = 0; i< 10*10000*10000; i++) {
                total += i;
            }
            console.log('b:', total);
        }

        a();
    </script>
    <script>
        function c() {
            d();
        }
        function d() {
            let total = 0;
            for(let i = 0; i< 1*10000*10000; i++) {
                total += i;
            }
            console.log('c:', total);
        }
        c();
    </script>
</body>
</html>
```

- 然后用 Performance 分析下执行流程：`本地启动服务 => Chrome浏览器打开DevTools => 打开Performance面板 => reload，重新加载页面并记录`；
> 用无痕模式打开 chrome，无痕模式下没有插件，分析性能不会受插件影响~


- 记录结束后可看到记录信息如下：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/tool-dev301.jpg')" width="auto"/>

> 可以看到有两个 Task（宏任务），调用栈分别是 `a、b` 和 `c、d`;（还有一些浏览器内部的函数，比如 parseHtml、evaluateScript 等，这些可以忽略）

- 两个Task都时`long task`，耗时较长；点击第一个Task时，下方面板中`bottom-up`会显示调用栈详情；可看到执行`b`函数耗时较长，也点击后面的源码地址跳转到源码，可看到相应的执行时间：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/tool-dev302.jpg')" width="auto"/>

> 同样在第二个Task也发现这种循环累加耗时过长的问题；

**因为渲染和 JS 执行都在主线程，在一个 Event Loop 中，会相互阻塞，如果 JS 有长时间执行的 Task，就会阻塞渲染，导致页面卡顿。所以，性能分析主要的目的是找到 long task，之后消除它。**

所以 b 和 d 两个函数的循环累加耗时过长，需要优化。

::: tip 优化方案
1. 把两个 long task 中的耗时逻辑（循环累加）给去掉或者拆分成多个 task；
> 可以参考 React 从递归渲染 vdom 转为链表的可打断的渲染 vdom 的优化，也就是 fiber 的架构，它的目的也是为了拆分 long task。
2. 不放在主线程跑，放到其他线程跑, 比如浏览器的 `web worker`；
:::
因为这里代码比较简单，没什么好拆分的，所以选择第二种方案~

- 这里为了跟`index.html`对比，新建`index02.html`，代码如下：

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title> worker performance optimization02</title>
</head>
<body>
    <div>worker performance optimization02</div>
    <script>
        // 封装函数，传入 url 和数字，函数会创建一个 worker 线程，通过 postMessage 传递 num 过去，并且监听 message 事件来接收返回的数据。
        function runWorker(url, num) {
            return new Promise((resolve, reject) => {
                const worker = new Worker(url);
                worker.postMessage(num); // 传递数据
                // 接收数据
                worker.addEventListener('message', function (evt) {
                    resolve(evt.data);
                });
                worker.onerror = reject;
            });
        };

        function a() {
            console.log('a');
        }
        function b() {
            // 执行耗时任务，耗时逻辑移到了 worker 线程中
            runWorker('./worker2.js', 10*10000*10000).then(res => {
                console.log('b:', res);
            });
        }

        a();
        b();
    </script>
    <script>
        function c() {
            // 执行耗时任务
            runWorker('./worker.js', 1*10000*10000).then(res => {
                console.log('c:', res);
            });
        }
        function d() {
            console.log('d');
        }
        c();
        d();
    </script>
</body>
</html>
```

- 同时新建`worker.js`，代码如下：

``` js

// 监听 message 事件, 接收主线程发送的数据
addEventListener('message', function(evt) {
    let total = 0;
    let num = evt.data;
    for(let i = 0; i< num; i++) {
        total += i;
    }
    // 执行完毕，向主线程发送数据
    postMessage(total);
});
```
> 可以再新建一个`worker02.js`，代码跟`worker.js`一样，这样方便等会儿在`Performance`中进行分析~


- 之后启动服务，同样重载页面，录制`record`进行分析：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/tool-dev303.jpg')" width="auto"/>


会发现在`Main`主线程中`long task`消失了，并且在下面多了两个`Worker`线程；并且主线程的执行时间也大大减少了~！


这样，我们通过把计算量拆分到 worker 线程，充分利用了多核 cpu 的能力，解决了主线程的 long task 问题，界面交互会很流畅。


> 参考：[快速掌握 Performance 性能分析：一个真实的优化案例](https://mp.weixin.qq.com/s/oboA3aOw8BdzvMwMmPMSJg)


















## 收藏

- [Chrome DevTools中文手册](https://leeon.gitbooks.io/devtools/content/)
- [如何在 Chrome 中调试 TypeScript](https://mp.weixin.qq.com/s/GFHeCwMEdGROCCtTv1pHhw)




## 参考


- [11个程序员必须知道的实用Chrome DevTools开发技巧](https://mp.weixin.qq.com/s/uuiXyDYJbElkSB6hFbvMOQ)
- [浏览器DevTools你真的会用吗?](https://juejin.cn/post/7126188054821208100)