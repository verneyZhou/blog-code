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

> 这里主要记录下 Chrome Devtools 的使用技巧~


打开控制台：
- 方法1：页面单击鼠标右键 => 点击【检查】
- 方法2：mac快捷键：【command】 + 【option】+ i



## 截图

1. 打开控制台 => 【...】 => 【Run command】:

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



## Console


- `$_` 是一个特殊变量，其值始终等于控制台中上一次操作的结果, 此技术是调试代码的便捷方法~

``` shell
1 + 2 # 3
$_ * 3 # 9
$_ # 9
$_ + 4 # 13
```

- `$0`也是一个特殊变量，它引用“元素”面板中当前选定的元素：

``` sh
$0
<img data-v-5244ef91="" data-v-03256cc6="" src="....." />
```


- `copy`复制变量：

``` sh
location # 控制台输入location显示相应信息
copy(location) # 即可复制，之后在其他地方粘贴即可~
```
> 该copy功能不是由ECMAScript定义的，而是由Chrome提供的。使用此功能，你可以将JavaScript变量的值复制到剪贴板。


- `table`列表化：

``` sh
let users = [{name: 'tom', age: 12, gender: 1}, {name: 'nice', age: 30, gender: 0}, {name: 'rose', age: 20, gender: 2}]
undefined
table(users) # 表格化
console.table(users)
```




## Element


- 在“元素”面板中拖放: Element中单击选中Node节点，可拖放改变其在页面中的位置

- 调试元素伪类样式：Element => 选中Node节点 => Styles, 点击`:hov`，勾选需要显示的伪类，有`:hover, :active, :focus, ...`，这样就可以调试这些伪类样式了~


- 隐藏元素快捷方式：选中Node节点，按`H`键即可；此操作是将`visibility: hidden !important;`样式添加到相应的元素


- 快速获取Dom元素引用：Element => 选中元素 => 鼠标右键，【Store as global variable】,之后就会在控制台打印选中的dom




## 调试


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


















## 性能分析



## 其他技巧


- 重新发送 XHR 请求：打开网络面板【Network】 =>  单击【XHR】按钮  => 选择你要重新发送的XHR请求  => 【Replay XHR】


- 获取图片的base64地址：Network => Img => 选中请求 => Preview => 双击图片 => 【Copy image as data URL】







## 备注


### Chrome DevTools 原理

> Chrome DevTools 分为两部分，backend 和 frontend：

- backend 和 Chrome 集成，负责把 Chrome 的网页运行时状态通过调试协议暴露出来。

- frontend 是独立的，负责对接调试协议，做 UI 的展示和交互。

两者之间的调试协议叫做 `Chrome DevTools Protocol`，简称 `CDP`。

传输协议数据的方式叫做**信道（message channel）**，有很多种，比如 Chrome DevTools 嵌入在 Chrome 里时，两者通过全局的函数通信；当 Chrome DevTools 远程调试某个目标的代码时，两者通过 WebSocket 通信。

frontend、backend、调试协议（CDP）、信道，这是 Chrome DevTools 的 4 个组成部分。

> backend 可以是 Chromium，也可以是 Node.js 或者 V8，这些 JS 的运行时都支持 Chrome DevTools Protocol。


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

> 有的时候我们只想在满足一定条件的时候才断住，这时候就可以用条件断点


- VSCode: `add Conditional Breakpoint（添加条件断点）`, 添加表达式，满足条件才断住




- **LogPoint**

> 当你觉得断住次数太多了，太麻烦，不想在断点处断住，但却想看下这时候的值，绝大部分同学会选择`console.log`，但其实有更好的方式: 添加一个 `LogPoint`

- VSCode: `Add Logpoints（添加记录点）`


> 相较于`console.log`, 打印了调试用的日志，但没有污染代码 


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

- Chrome DevTools： `Source => XHR/fetch Breakpoints`, 添加；不输入内容就是在任何请求处断住，你可以可以输入内容，那会在 url 包含该内容的请求处断住

> 这在调试网络请求的代码的时候，是很有用的。








## 收藏



## 参考


- [11个程序员必须知道的实用Chrome DevTools开发技巧](https://mp.weixin.qq.com/s/uuiXyDYJbElkSB6hFbvMOQ)