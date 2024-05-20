---
title: 面试题收集2024
date: 2024-01-31 11:31:46
permalink: false
article: false
categories: 
  - null
tags: 
  - null
---


# 面试题收集2024



## HTML/CSS部分



### HTML5新增标签？

`<article>, <aside>, <audio>, <canvas>, <datalist>, <details>, <figure>, <footer>, <header>, <mark>, <nav>, <source>, <video>`



### CSS3新属性？

text-shadow, box-shadow, border-raduis, transform, transition, animation, RGBA和透明度，媒体查询


- css可继承属性：`font-family、font-size、font-style、color、line-height、text-align、text-indent`
- css不可继承属性：`display、margin、border、padding、background、height、min-height、max-height、width、min-width、max-width、overflow`



### 伪类选择器有哪些？

- 伪类：css选择器，向已经存在的元素的某些特殊状态添加一些样式；

`:hover, :active, :focus, :visited, :link, :disabeld, :nth-child()`


- 伪元素：伪元素是用于在元素之前或之后插入额外的虚拟元素，并为这些虚拟元素应用样式；它们用于创建文档中不存在的元素或者生成特殊的效果

`::before, ::after, ::selection`




### css盒模型

默认标准盒模型（content-box）：width = content；`box-sizing:content-box`;

ie盒模型（border-box）: width = content + padding + border; `box-sizing: border-box;`



### CSS 实现文本的单行和多行溢出省略效果？

``` css
.ellipse {
    overflow: hidden; /*文字长度超出限定宽度，则隐藏超出的内容*/
    text-overflow: ellipsis; /* 规定当文本溢出时，显示省略符号来代表被修剪的文本 */
    white-space: nowrap; /* 设置文字在一行显示，不能换行 */
}

.ellipse-2 {
    display: -webkit-box; /* 将对象作为弹性伸缩盒子模型显示  */
    -webkit-line-clamp: 2; /* 用来限制在一个块元素显示的文本的行数, 2 表示最多显示 2 行。 为了实现该效果，它需要组合其他的WebKit属性 */
    -webkit-box-orient: vertical; /* 设置或检索伸缩盒对象的子元素的排列方式 */
    overflow: hidden;
    text-overflow: ellipsis;
}

.ellipse-2 {
  position: relative;
  max-height: 40px;
  overflow: hidden;
  line-height: 20px;
  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 0 20px 0 10px;
    content: '...';
  }
}
```


### BFC

块格式上下文，是一块`独立的渲染区域，内部元素不会影响外部的元素`。

BFC是浏览器中的一个独立渲染区域，拥有一套渲染规则，决定了其子元素如何定位以及与其他元素的相互关系和作用。可以把BFC理解为一个封闭的大箱子，箱子内部的元素无论如何翻江倒海，都不会影响到外部。反之亦然，计算BFC的高度时，浮动元素也参与计算。

哪些元素会产生BFC：
- 根元素。
- float属性不为none。
- `position为absolute或fixed`。
- display为inline-block, table-cell, table-caption, `flex`, inline-flex。
- `overflow为hidden`。


BFC有以下应用场景：
- 防止margin重叠：`清除盒子垂直方向上外边距合并`：给其中一个盒子再包裹一个盒子父元素，并触发其BFC功能（例如添加overflow:hidden;）
- 清除浮动：`解决父元素高度塌陷的问题`：当子元素设置成浮动元素时，会产生父元素高度塌陷的问题。可以给父元素设置overflow:hidden;来产生BFC，从而解决这个问题。



### 什么是float浮动？

float属性的使用可以使元素脱离标准流，浮动在其他元素之上，不再占用原本属于该元素的空间，从而导致后面的元素上移并占用原本属于该元素的空间。

准确的说，float浮动属于**半脱离文档流**：`浮动的块虽然脱离的正常的文档流，但是还会占有正常文档流的文本空间`，所以会出现文字环绕的情况

float和absolute都会使元素脱离文档流，但方式有所不同。float是半脱离文档流，元素虽然脱离了正常的文档流，但仍然会影响布局。而absolute则是完全脱离文档流，元素的位置和尺寸不再受文档流的影响。

内联元素使用了float属性后会变成块级元素，可以设置元素的高度和宽度

- **怎么清除浮动？**
> 清除浮动主要是为了解决`父元素因为子级元素浮动引起的内部高度为0`的问题
1. 给父元素添加空的子元素，添加`clear: both`;
2. 给父盒子添加 `overflow: hidden`触发`BFC`;
> 独立的块级上下文可以包裹浮动流，`全部浮动子元素也不会引起容器高度塌陷`，就是说包含块会把浮动元素的高度也计算在内，所以就不用清除浮动来撑起包含块的高度。
3. 给父元素添加`::after`伪元素，设置`clear: both`;
4. 给父元素设置高度




### 什么是flex布局？

Flexbox布局也叫Flex布局，`弹性盒子布局`。它的目标是提供一个更有效地布局、对齐方式。

采用 Flex 布局的元素，称为 `Flex 容器`，简称"容器"。它的所有子元素就是容器成员，称为 `Flex 项目`，简称"项目"。

容器默认存在两个轴：水平轴（main axis）和垂直轴（cross axis），项目默认沿主轴排列（水平轴）

- justify-content：元素在主轴的对齐方式: `flex-start | flex-end | center | space-between | space-around`
- align-item：元素在交叉轴上的对齐方式: `flex-start | flex-end | center | baseline | stretch`


### flex vs grid

1. Flex布局是`一维布局`模型，主要在`一个方向上（行或列）对元素进行排列和对齐`。它更适合于较小的布局范围，如单个组件或页面上的特定区域。
2. Grid布局是`二维布局`模型，`可以同时处理行和列`，更适合于更复杂的布局，如整个页面的布局或大型区域的布局。
3. 在Flex布局中，项目通常是沿着`主轴排列`的，而在Grid布局中，项目是在`行和列的交叉点上进行定位`的。
4. Flex布局更侧重于`项目在容器中的对齐和分布`，而Grid布局则更侧重于`定义行和列的结构以及项目在这些行和列中的位置`。


### flex:1

`flex-grow: 1`：设置子元素的放大比例，决定了子元素在剩余空间中的占比，默认为`0`, 即元素不会放大来占用多余空间。当为 `1` 时，表示子元素会根据剩余空间等比例地放大，使得所有子元素填满父容器的剩余空间。

`flex-shrink: 1`: 设置子元素的收缩比例，当容器空间不足时，元素会按照其flex-shrink值与其他元素的比例来缩小。为 1表示子元素会按照等比例收缩。

`flex-basis: 0%`: 设置子元素的基础尺寸(设置子项的占用空间),默认为`auto`, 意味着元素的大小会根据其内容自动计算；`0%`表示子元素的尺寸会尽可能地被拉伸以填充剩余空间。

这样设置后，子元素会根据剩余空间等比例地放大，并在空间不足时按照等比例收缩，同时初始尺寸为 0%，以适应父容器的大小。



### flex-direction: column; align-item: center; 是怎么布局

- `flex-direction: column`设置flex主轴方向：规定子元素排列方向是从上往下垂直排列（主轴是垂直方向）

- `align-item: center`: 设置交叉轴对齐方式：表示子元素水平方向（交叉轴，因为主轴是垂直方向）居中对齐




### 使用 CSS 预处理的优缺点分别是什么？

css预处理器：less/scss/sass/...

- **优点：**
1. 提高 CSS 可维护性。
2. 易于编写`嵌套选择器`。
3. 引入变量，增添主题功能。可以在不同的项目中共享主题文件。
4. 通过混合（Mixins）生成重复的 CSS。
5. 将代码分割成多个文件。不进行预处理的 CSS，虽然也可以分割成多个文件，但需要建立多个 HTTP 请求加载这些文件。

- **缺点：**
1. 需要预处理工具。
2. 重新编译的时间可能会很慢。



### 回流（重排）与重绘


`回流（reflow）`是更明显的一种改变，可以理解为渲染树需要重新计算。（当render树中因为大小边距等问题发生改变而需要重建的过程就是回流）

因为只要不是改变物理的位置、尺寸、显示，就不会引起回流。


`重绘（repaints）`是一个元素外观的改变所触发的浏览器行为，（也就是当元素的一部分属性发生变化，如外观背景色不会引起布局变化而需要重新渲染的过程就是重绘）


`v-if`通过增删dom节点实现显隐，`v-show`通过设置`display`属性实现dom显隐；两个都会触发回流和重绘；`visibility`属性不会触发重排，会触发重绘。


**会触发回流的属性**：`offsetTop、offsetLeft、 offsetWidth、offsetHeight、scrollTop、scrollLeft、scrollWidth、scrollHeight、clientTop、clientLeft、clientWidth、clientHeight`, 需要通过即时计算得到。因此浏览器为了获取这些值，也会进行回流; 除此还包括`getComputedStyle`方法，原理是一样的.

1. 全局范围：就是从根节点html开始对整个渲染树进行重新布局，例如当我们改变了窗口尺寸或方向或者是修改了根元素的尺寸或者字体大小等。
2. 局部范围：对渲染树的某部分或某一个渲染对象进行重新布局。



**触发重绘**：颜色改变，透明度改变，元素的border-radius、visibility、box-shadow等属性发生变化, 不改变大小位置的改变

`transform、opacity、filters`这些动画不会引起回流重绘
> 改变 transform 或 opacity 不会触发浏览器重新布局（reflow）或重绘（repaint），只会触发`复合（compositions）`。而改变绝对定位会触发重新布局，进而触发重绘和复合。transform 使浏览器为元素创建一个 `GPU` 图层，但改变绝对定位会使用到 CPU。因此 translate() 更高效，可以缩短平滑动画的绘制时间。



- **如何避免不必要的回流和重绘？**

1. 减少DOM操作：减少DOM访问次数，缓存DOM样式信息；用事件委托；`querySelectorAll`替换`getElementByXX`
    - `querySelectorAll()`：获取**静态集合**，通过函数获取元素之后，元素之后的改变并不会影响之前获取后存储到的变量。也就是获取到元素之后就和html中的这个元素没有关系了
    - `getElementByXX()`：获取**动态集合**，通过函数获取元素之后，元素之后的改变还是会动态添加到已经获取的这个元素中。换句话说，通过这个方法获取到元素存储到变量的时候，以后每一次在Javascript函数中使用这个变量的时候都会再去访问一下这个变量对应的html元素。

2. 减少重排：`虚拟dom、避免内联样式、不要使用table布局、visibility:hidden替换display:none、防抖节流、分离读写操作减少重排、缓存布局信息`
    - 避免设置大量的style内联属性，因为通过设置style属性改变结点样式的话，每一次设置都会触发一次reflow，所以最好是使用class属性。
    - 不要使用table布局，因为table中某个元素一旦触发了reflow，那么整个table的元素都会触发reflow。

3. css及动画优化：样式集中改变、开启css3动画硬件加速，把渲染计算交给GPU
    - 能用transform做的就不要用其他的，因为transform可以开启硬件加速，而硬件加速可以规避重排。直接跳过重排、重绘，走合成进程




### 合成（compositions）

> 更改了一个既不要布局也不要绘制的属性，那么渲染引擎会跳过布局和绘制，直接执行后续的合成操作，这个过程就叫合成。

**定义**：合成是一种将页面的各个部分分离成层（Layer Tree），分别将它们栅格化，然后在称为“合成线程”的中组合为页面的技术。

**触发时机和影响范围**：在GUI`渲染线程后执行`，将GUI渲染线程生成的`绘制列表转换为位图`,然后发送绘制图块命令 DrawQuad 给浏览器进程，浏览器进程根据 DrawQuad 消息生成页面，将页面显示到显示器上

比如使用CSS的transform来实现动画效果，避免了回流跟重绘，直接`在非主线程中执行合成动画操作`。显然这样子的效率更高，毕竟这个是在非主线程上合成的，没有占用主线程资源，另外也避开了布局和绘制两个子阶段，所以相对于重绘和重排，合成能大大提升绘制效率。


1. 合成层的位图，会交由 `GPU` 合成，比 CPU 处理要快
2. 当需要 repaint 时，只需要 repaint 本身，不会影响到其他的层
3. 对于 transform 和 opacity 效果，不会触发 layout 和 paint

`transform, opacity, filter`

**使用：**
1. 将元素的`will-change` 设置为 `opacity、transform、top、left、bottom、right`, 这样子渲染引擎会为其单独实现一个图层，当这些变换发生时，仅仅只是利用合成线程去处理这些变换，而不牵扯到主线程，大大提高渲染效率。
2. 对于不支持will-change 属性的浏览器，使用一个3D transform属性来强制提升为合成`transform: translateZ(0)`;


- **GPU加速原因？**
> `直接跳过布局和绘制流程，直接交给合成线程处理`、`没有占用主线程的资源`、`使用GPU进行加速生成，而GPU 是擅长处理位图数据的`。



### 页面渲染流程？

1. `解析html/css`: 解析HTML,生成HTMLDOM树；同时解析css，生成CSSDOM树；
2. `构建渲染树`：在DOM树和CSSOM树都构建完成后，浏览器会将它们合并成一个渲染树；
3. `布局`：在渲染树构建完成后，浏览器会开始布局过程，生成Layout Tree。这个过程主要是计算每个元素在屏幕上的确切位置和大小。这通常包括确定元素的盒模型（即元素的边距、边框、填充和内容区域的大小和位置）以及元素之间的相对位置等。
4. `绘制`：最后，浏览器会根据计算出的布局信息，将每个元素绘制到屏幕上。这个过程通常包括填充元素的背景、边框和颜色等，并显示文本和图像等内容。渲染绘制(Paint)。根据计算好的绘制列表信息绘制整个页面，并将其提交到合成线程。
5. `合成`：浏览器会将所有层合并成一个图层，然后将这个图层提交给GPU进行`光栅化`。光栅化的结果就是一块一块的`位图`，这些位图会被合成到屏幕上，最终显示出完整的页面。

总结：`GUI渲染线程 => 合成线程 => 浏览器进程`


`css加载不会阻塞DOM树的解析，css加载会阻塞DOM树的渲染，css加载会阻塞后面js语句的执行。`



### DOMContentLoaded在什么时候触发？

DOMContentLoaded事件在文档对象模型（DOM）完全加载和解析完成后触发，无需等待样式表、图像和子框架的完全加载。

换句话说，`当HTML解析完毕，DOM树构建完毕，且所有延迟脚本（<script defer src="…"> 和 <script type="module">）下载和执行完毕后，但图片和样式表等其他资源还没有加载完成时`，就会触发DOMContentLoaded事件。

这个事件与window.onload事件相似，但有一个主要区别：`window.onload事件必须等到整个页面及所有依赖资源如样式表和图片都已完成加载后才会触发`。因此，如果页面的图片很多，从用户访问到window.onload触发可能需要较长的时间，这会影响用户的体验。

DOMContentLoaded事件在DOM树构建完成后就会触发，因此可以更早地执行脚本和绑定事件到元素，而无需等待所有图片等资源加载完成。


> js会阻塞DOM解析，`DOMContentLoaded是在DOM解析完成后才触发`。因此，当css后面有js的时候，css会阻塞js运行，而js会阻塞DOM解析，从而导致DOMContentLoaded必须等到css以及css后面的js执行完成后，才会触发。而当css后面没有js的时候，由于css不阻塞DOM的解析，因此DOMContentLoaded不会等待css的加载。



`html解析+DOM构建 => defer script => DOMContentLoaded => css/img加载 => onload`




### meta 标签

[meta 标签](https://juejin.cn/post/6987919006468407309)

head标签用于定于文档头部信息，它是所有头部元素的容器。head中的元素可以引用脚本、指示浏览器在哪里找到样式表、提供元信息等等: 

`base, link, meta, script, style, 以及 title`


meta: `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`

1. `http-equiv` 属性: 一般设置的都是与http请求头相关的信息，设置的值会关联到http头部。也就是说浏览器在请求服务器获取html的时候，服务器会将html中设置的meta放在响应头中返回给浏览器: 

`<meta http-equiv="content-type" content="text/html charset=utf8">` 用来声明文档类型、设字符集，目前content-type只能在html文档中使用; 

`<meta http-equiv="expires" content="31 Dec 2021">` 用于设置浏览器的过期时间, 其实就是响应头中的expires属性。

`<meta http-equiv="pragma" content="no-cache">`: 禁止浏览器从本地计算机的缓存中访问页面的内容



2. `name`属性：主要用于描述网页，与对应的content中的内容主要是便于搜索引擎查找信息和分类信息用的, 用法与http-equiv相同，name设置属性名，content设置属性值:

`<meta name="author" content="aaa@mail.abc.com">`、`<meta name="keywords" content="Hello world">`

`<meta name="robots" content="all">`: 告诉搜索引擎机器人抓取哪些页面, all：文件将被检索，且页面上的链接可以被查询； none：文件将不被检索，且页面上的链接不可以被查询；




### 解决移动端 Retina 屏 1px 像素问题

1. 伪元素 + `transform` 实现: 伪元素 `::after` 或 `::before` 是独立于当前元素，可以单独对其缩放而不影响元素本身的缩放; 基于 `media` 查询判断不同的设备像素比对线条进行缩放
2. media媒体查询设备像素比
3. 新项目可以尝试使用 `viewport + rem` 方案


[最后一次探究1px](https://juejin.cn/post/6870691193353666568)



### visibility: hidden 与 opacity: 0 有什么区别

1. visibility:hidden 会被子元素继承，可以通过设置子元素visibility:visible 使子元素显示出来; opacity: 0 也会被子元素继承，但是不能通过设置子元素opacity: 0使其重新显示; 
2. visibility:hidden 元素上绑定的事件也无法触发；opacity: 0元素上面绑定的事件是可以触发的。



### 说说你知道的移动端适配方式?

- 自适应：根据不同的设备屏幕大小来自动调整尺寸、大小
- 响应式：会随着屏幕的实时变动而自动调整，是一种更强的自适应

**当前流行的几种适配方案**

1. 百分比设置（不推荐）：相对的可能是不同参照物，很难统一
2. rem单位+动态html的font-size
    - 通过媒体查询来设置不同尺寸屏幕下 html 的 font-size
    - 编写js代码：通过监听屏幕尺寸的变化来动态修改 html 元素的 font-size 大小
    - lib-flexible 库： lib-flexible 是淘宝团队出品的一个移动端自适应解决方案，通过`动态计算 viewport 设置 font-size` 实现不同屏幕宽度下的 UI 自适应缩放。

3. vw单位（推荐）: 100vw 相当于整个视口的宽度 innerWidth，1vw 相当于视口宽度的 1%
4. flex的弹性布局
5. 媒体查询`@media`




### 移动端rem、px 转换逻辑？

rem是指根元素(root element html) 的字体大小

rootFontSize = screenWidth * DPR / baseValue；
> `根元素 html 的文字大小 = 视口宽度/分成的份数`(一般为10份，方便计算)

1rem等于75px,以width为750px的设计稿为标准，当width为750px时，根元素font-size为37.5px （375 * 1 / 10）

比如p标签内设置font-size为24px：
1. 打包的时候转为rem,24 / 75 = 0.32rem;
2. 由lib-flexible动态计算得根元素font-size为37.5px，即该宽度下，1rem为37.5px;
3. 计算p标签内字体展示大小：0.32 * 37.5 = 12px


- pt是长度单位，印刷行业会用到，表示绝对长度；

- px是像素单位，是屏幕上显示数据的最基本的点，表示相对大小。不同分辨率下相同长度的px元素显示会不一样

- `设备像素比DPR = 物理像素 / 设备独立像素（css像素）`

`物理像素`（也叫设备像素）是显示器（如手机屏幕）上最小的物理显示单元。物理像素的数量是固定的，且任何设备上1物理像素的大小不会改变，但不同设备上的物理像素大小可能不同。

`设备独立像素`（Device Independent Pixels，简称DIP或DP）则是一种`逻辑单位`，它主要用于程序设计和开发。设备独立像素可以看作是计算机坐标系统中的一个点，这个点代表一个可以由程序使用的虚拟像素（如CSS像素）。







### svg 与 canvas 有什么区别？

SVG和Canvas都是用于在Web页面上绘制图形的技术

1. `图像类型`：SVG是`基于XML的矢量图形语言`，而Canvas则是基于`HTML5的位图图形绘制API`。这意味着`SVG绘制的图形是矢量图，无论放大多少倍都不会失真`，而`Canvas绘制的图形是像素图`，放大后会出现锯齿状边缘。

2. `操作方式`：SVG中的每个图形都是DOM节点，可以通过JavaScript直接操作这些节点，改变其颜色、形状等属性。而Canvas则是通过JavaScript在画布上绘制图形，一旦绘制完成，就不能直接修改图形本身，只能通过清除整个画布然后重新绘制来实现修改。

3. `性能`：Canvas在绘制大量图形或进行频繁更新时性能更好，因为`它基于像素渲染`，可以直接在内存中操作。而`SVG由于是基于DOM`的，所以在处理大量图形或复杂交互时可能会显得较慢。

4. `兼容性`：SVG和Canvas都只能在IE8（不包含IE8）以上版本的浏览器中运行。不过，Canvas在移动端的兼容性更好。

5. `颜色支持`：Canvas支持的颜色比SVG更多，因此更适合绘制色彩丰富的图像



### jpg, png, webp 的区别？

- JPG（JPEG）格式是一种`有损压缩格式`，它支持16百万种颜色，适合显示真实摄影图像; 保存图像时会损失一些细节, 压缩会导致失真。此外，JPG格式不支持透明度。

- PNG格式是一种`无损压缩格式`，它支持透明度，可创建带有透明背景的图像, PNG图像的优点是图像质量不会受到损失，但文件大小相对较大，不如JPG和WebP压缩得那么好

- WebP格式是一种新的图像格式，由Google开发。它支持有损和无损压缩，`具有更高的压缩比，同时保留较好的图像质量`。WebP图像支持透明度，可用于制作带有透明背景的图像，还支持动画。然而，WebP尚未被所有设备和软件广泛支持，但在现代浏览器中得到了很好的支持。图片压缩内存较小







## JS部分




### 基本类型和引用类型

基本类型就包括`Number、String、Boolean、null、undefined、Symbol、BigInt`这几种，剩下的（`Array、Regex、Object、Function`等等）都是引用类型。

基本类型的值是直接在栈中保存它的值；引用类型的值是保存在堆空间中的，它的引用地址保存在栈中；


`let string = 'abc'; string2 = 'dcba'`
> 这一句，计算机在执行这个语句时，并不是简单的把栈空间中叫做`string2`的内存块中存储的值修改为dcba，而是会重新申请一块内存块并命名为string2，再将dcba存入这个内存块；这种现象只有在字符串才会发生，因为存储在栈中的数据大小都是固定的，数字等其他基本类型的重新赋值之后在内存中所占的大小都是一样的，所以不需要重新申请空间，直接修改原有的值就可以。而对于字符串，比如上面的例子，它的长度比之前增加了1，因此原本存储abc的空间是无法存储dcba的，因此编译器在处理字符串的重新赋值时是统一重新申请栈空间。这就是`字符串的不可变性`（字符串的值是无法被修改的）。




### js数据类型判断


- `typeof`: `undefined、object、boolean、number、string、function`, 常用于检查基本数据类型

- `Object.prototype.toString`: 常用于检查引用数据类型
``` js
// 以下是11种：
var number = 1;          // [object Number]
var string = '123';      // [object String]
var boolean = true;      // [object Boolean]
var und = undefined;     // [object Undefined]
var nul = null;          // [object Null]
var obj = {a: 1}         // [object Object]
var array = [1, 2, 3];   // [object Array]
var date = new Date();   // [object Date]
var error = new Error(); // [object Error]
var reg = /a/g;          // [object RegExp]
var func = function a(){}; // [object Function]
function checkType() {
    for (var i = 0; i < arguments.length; i++) {
        console.log(Object.prototype.toString.call(arguments[i]))
    }
}
checkType(number, string, boolean, und, nul, obj, array, date, error, reg, func)
```


### js浮点数运算不精确 如何解决? 

JavaScript中的浮点数运算不精确问题主要源于`计算机内部使用二进制表示浮点数，而某些十进制小数无法精确地用二进制小数来表示`。这会导致在进行浮点数运算时，结果可能会有微小的精度损失。

1. 使用toFixed()或toPrecision()方法格式化输出：`num.toFixed(2); num.toPrecision(2)`
2. 使用第三方库：`decimal.js`





### 原型


- **什么是原型？**

> 我们创建的每一个构造函数都会有一个 `prototype` 属性，这个属性指向一个对象，这个对象`包含该构造函数创建的所有实例能够共享的属性和方法`；这个对象就是原型，也叫做原型对象。


- **什么是原型链？**

> js的每个对象都会从它的原型对象那里继承一些属性，而原型对象也会有自己的原型；这样`每个对象沿着它的原型一层层往上面查找形成的链式结构`，就称为原型链，一般原型链找到最顶层`Object.prototype`就停止查找了。js对象间就是通过原型链产生关联, 实现继承。

`__proto__`查找: person ===> Person.prototype ===> Object.prototype ===> null


`Object.__proto__ === Function.prototype`, `Function.__proto__ === Function.prototype`
> 所有的构造函数都是对象，都是Function的一个实例；而原生构造函数Function也是一个对象。





### 进程与线程

进程：cpu分配资源的最小单位。
> 电脑打开一个软件产生一个或多个进程，每个进程之间是相互独立的，CPU使用 `时间片轮转调度算法` 来实现同时运行多个进程。

线程：程序执行的最小单位。

1. 一个进程可以有多个线程，一个进程中只有一个**执行流**称作单线程；
2. 进程之间相互独立，但同一进程下的各个线程间共享程序的内存空间；


Chrome：每打开一个Tab页就会产生一个进程。

**渲染进程：页面的渲染，JS的执行，事件的循环，都在渲染进程内执行。**
1. GPU的渲染线程：负责渲染浏览器界面，解析HTML, 布局和绘制；与JS的执行线程互斥，GUI更新会被保存在一个队列中等到JS引擎空闲时立即被执行
2. **JS引擎线程**：负责处理js脚本（v8引擎）, 浏览器同时只能有一个JS引擎线程在运行JS程序，所以js是单线程运行的。
    - `defer`: 要等到整个页面在内存中正常渲染结束（DOM 结构完全生成，以及其他脚本执行完成），`在DOMContentLoaded事件之前执行`；
    - `async`: js加载时不阻塞渲染，一旦下载完，渲染引擎就会中断渲染，执行这个脚本以后，再继续渲染；
3. 事件触发线程：属于浏览器而不是JS引擎，用来控制事件循环，并且管理着一个事件队列(task queue)
4. 定时器触发线程：setInterval与setTimeout
5. Http异步请求线程： ajax



`同步任务 -> 微任务 -> GUI渲染 -> 宏任务 -> ...`



- **JS为什么是单线程？**

> JavaScript之所以是单线程的，是因为它的设计初衷是为了`简化并发问题`、避免浏览器环境下的限制，并且`通过事件循环机制实现异步编程`。

1. 单线程模型使得 JavaScript 的设计更为简单。开发者不需要考虑多线程编程中常见的复杂问题，如线程间的`同步、互斥、死锁`等。
2. JavaScript 最初是为浏览器环境设计的，其`主要任务是与用户交互和操作 DOM`。在这样的环境中，多线程可能会导致一系列问题，如 UI 渲染不一致、线程安全问题等。如果js被设计了多线程，如果有一个线程要修改一个dom元素，另一个线程要删除这个dom元素，此时浏览器就会一脸茫然，不知所措。所以，为了避免复杂性，从一诞生，JavaScript就是单线程。
3. JavaScript的单线程设计是建立在事件循环机制之上的。事件循环是JavaScript实现异步编程的关键，它使得JavaScript可以在单线程中实现非阻塞的I/O操作，从而实现异步编程。
4. 为了利用多核CPU的计算能力，HTML5提出`Web Worker`标准，允许JavaScript脚本创建多个线程，但是`子线程完全受主线程控制，且不得操作DOM`。所以，这个新标准并没有改变JavaScript单线程的本质。




### Event Loop

1. 整体的js脚本是第一个宏任务，它开始执行时，会把所有代码分为同步任务和异步任务；同步任务直接进行主线程执行，异步任务再分为宏任务和微任务，分别将各自的回调事件放置在任务队列中等到调用；
2. 当调用栈上的同步任务执行完成后，先检查微任务队列，有则执行，没有则将宏任务队列的第一个宏任务添加到主线程执行栈上，开始执行；
3. 重复上述流程；


`macrotasks`: script(整体代码)、setTimeout、setInterval、setImmediate（node独有）、I/O、UI rendering（浏览器独有）、requestAnimationFrame（浏览器独有）

`microtasks`: process.nextTick（node独有）、Promises、Object.observe(废弃)、MutationObserver

- `requestAnimationFrame`回调的执行与task和microtask无关，而是与浏览器是否渲染相关联的。`它是在浏览器渲染前，在微任务执行后执行`。
- requestAnimationFrame会在每次屏幕刷新的时候被调用，而`requestIdleCallback`则会在每次屏幕刷新时，判断当前帧是否还有多余的时间，如果有，则会调用requestAnimationFrame的回调函数; requestIdleCallback中的回调函数仅会在`每次屏幕刷新并且有空闲时间时才会被调用`。


### node.js的运行机制

node中的Event Loop跟浏览器中执行流程大致类似，也是`同步任务 》 微任务 》 宏任务`; 

但node中的宏队列不像浏览器中只有一个宏队列，而是细分出4个阶段的宏队列：`Timers Queue、 IO Callbacks Queue、Check Queue、Close Callbacks Queue`；同样微队列也是细分成2个阶段的微队列：`Next Tick Queue、Other Micro Queue`

1. 执行全局Script的同步代码
2. 执行microtask微任务，先执行所有Next Tick Queue中的所有任务，再执行Other Microtask Queue中的所有任务
3. 开始执行macrotask宏任务，共6个阶段，从第1个阶段开始执行相应每一个阶段macrotask中的所有任务，注意，**这里“所有任务”是指每个阶段宏任务队列的所有任务，在浏览器的Event Loop中是只取宏队列的第一个任务出来执行，每一个阶段的macrotask任务执行完毕后，开始执行微任务**，也就是步骤2
4. `Timers Queue -> 步骤2 -> I/O Queue -> 步骤2 -> Check Queue -> 步骤2 -> Close Callback Queue -> 步骤2 -> Timers Queue ......`
5. 这就是Node的Event Loop








### js执行流程


js执行主要分为`分析（预编译）`和`执行`两个阶段。


**作用域链**
> 当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样`由多个执行上下文的变量对象构成的链表就叫做作用域链`。


`分析`:
1. 当js在读取js脚本时，会首先创建一个**全局执行上下文**，并将该上下文push到**js调用栈**中；如果有函数调用时，会创建新的**函数执行上下文**push到调用栈；每调用一个函数，js就会把该函数添加进调用栈并开始执行。
> js是一门单线程语言：同一时间只能做一件事；Js 有一个`主线程（main thread）`和`call-stack 调用栈(执行栈)`，所有的任务都会被放到调用栈等待主线程执行。

2. 在创建上下文时，这时候还没有执行代码，主要初始化三个属性：`变量对象（VO）、作用域链、this指向`
    - 变量对象：上下文中定义的变量和函数的声明；进行初始化，变量不会赋值只会先声明，等到后面执行时再赋值；函数会直接声明+赋值；这个阶段的变量对象不可以访问；

`执行`:
1. 当js进入函数上下文开始执行时，变量对象会激活成活动对象（AO）,这时它上面的属性才可以被访问；这时开始修改AO的属性值；
2. 当函数执行完毕，就会将该上下文从调用栈中弹出；执行下一个上下文；




### 变量提升（hoisted）

1. 在js的`分析`阶段，会进行`上下文初始化：创建作用域链、创建变量对象、创建this指向`；在`创建对象`的时候会首先进行`函数声明`，并将函数名指向函数在内存中的地址；之后便进行`变量声明`，赋值为undefined;
2. 等到上下文进行`执行`阶段再对已经声明的变量进行赋值，这就是js中出现变量提升和函数提升原因。


- **暂时性死区（TDZ）**: let声明的变量在被声明之前不能被访问。


**作用域：**

1. let、const可以形成块级作用域，var不会形成块级作用域: {} （es6新增）; 函数全局、函数、块级作用域都会形成
2. 在全局作用域中，用 let 和 const 声明的全局变量没有在全局对象中，只是一个`块级作用域（Script）`中。






### 什么是闭包？

> 闭包主要是指那些能够访问到自由变量的函数；`自由变量是指能够在函数中使用，但既不是函数参数也不是函数局部变量的变量`。

1. 在代码中引用了自由变量
2. **自由变量的上下文已经销毁，但还是能引用它**
> 这是因为当在一个函数上下文中查找变量时，会沿着**作用域链**往上查找；当函数引用自由变量时，即使这个自由变量的上下文被销毁了，但是js依然会让这个上下文的AO活在内存中；函数依然可以通过它的作用域链找到它，正是因为JS做到了这一点，从而实现了闭包这个概念。



优点：闭包是一种**保护私有变量**的机制，`在函数执行时形成私有的作用域，保护里面的私有变量不受外界干扰`。

缺点：创建闭包必须维护额外的作用域，过度使用它们可能会占用大量内存，比较常见的问题就是造成**内存泄露**


应用场景：
1. `封装私有变量`：闭包可以用来创建私有变量和方法，这些变量和方法对外部是不可见的，只能在闭包内部访问和修改。
2. `模块化开发`：闭包可以用于模块化开发，通过创建私有作用域，可以防止变量污染和命名冲突。
3. `函数柯里化`：闭包可以用于实现函数的柯里化（Currying），即`将一个多参数的函数转换为一系列单参数函数`的过程。
4. 异步编程：`闭包可以用于处理异步编程中的回调函数，可以捕获和保存回调函数的上下文`，使其在异步执行时仍能访问所需的变量。
5. `函数记忆`：闭包可以用于实现函数记忆（Memoization），即缓存函数的计算结果，避免重复计算，提高性能。



- `IIFE` 可以模拟块级作用域，目的是为了`隔离作用域，防止污染全局命名空间`。
> 可以减少闭包占用的内存问题，因为没有指向匿名函数的引用。只要函数执行完毕，就可以立即销毁其作用域链了。



``` js
var fn = [];

for (var i = 0; i < 3; i++) {
  fn[i] = function () {
    console.log(i);
  };
}
fn[0](); // 3： 当执行fn[0]函数的时候，fn[0]函数的作用域链: [AO, globalContext.VO] 中的AO没有i值，所以往上找到全局变量i=3
fn[1](); // 3
fn[2](); // 3


////// 改成闭包
for(var i = 0; i < 3; i ++) {
    fn[i] = (function(j) { // 等于匿名自执行函数
        return function() { // 返回一个闭包
            console.log(j);
        }
    })(i)
}
fn[0](); // 0: 当执行fn[0]函数的时候，匿名函数的AO中传入i=0；fn[0]函数的作用域链: [AO, 匿名函数Context.AO, globalContext.VO], 往上找到匿名函数AO中i=0
fn[1](); // 1
fn[2](); // 2



// IIFE例子：
for (var i = 0; i < 5; i++) {
    (function(j) {
        setTimeout(function() {
            console.log(j);
        }, 1000);
    })(i)
}
console.log(i);
// 5 0 1 2 3 4


// iife实现依次输出：0 1 2 3 4 5
async function sleep (time) {
    return new Promise(resolve => setTimeout(resolve, time))
}
(async function() {
        for(var i = 0; i <= 5; i ++) {
            if (i > 0) await sleep(1000);
            console.log(i);
        }
    }
)()

```


### 什么是闭包陷阱？

如果`过度或不当地使用闭包`，可能会导致一些不易察觉的错误或性能问题，这就是所谓的闭包陷阱。

`在React框架中，闭包陷阱可能出现在使用Hooks时。当state更新时，如果闭包引用了旧的state值，而不是最新的state值，就可能导致问题`。这是因为闭包会捕获其定义时的变量值，而不是运行时的变量值。

常见的闭包陷阱包括：

1. `内存泄漏`：如果闭包中包含对外部作用域中的大量变量的引用，而且这些变量不再被使用，那么这些变量及其相关的作用域将无法被垃圾回收，从而导致内存泄漏。
2. `变量共享`：由于闭包中的函数共享同一作用域链中的变量，因此闭包中对变量的修改会影响到其他闭包中相同作用域链中的变量，可能导致意外的行为。
3. `循环中的闭包`：在循环中创建闭包时，由于闭包共享了相同的外部作用域，可能会导致意外的结果。比如，在使用 setTimeout 或 setInterval 时，在循环内部创建闭包，会导致闭包中的变量捕获的是循环结束时的值，而不是循环每次迭代的值。
4. `性能问题`：过度使用闭包可能会导致性能问题，因为闭包中的变量在函数执行时需要保持其引用的作用域链，这可能会导致`内存消耗增加`和性能下降。


为了避免闭包陷阱，开发者应该谨慎地使用闭包，并遵循以下原则：
1. `注意内存管理，避免过度依赖闭包引用外部变量`，确保及时释放不再使用的资源。
避免在循环内部创建闭包，以免出现意外的行为。
2. `尽量减少闭包的嵌套和使用范围`，避免性能问题和变量共享带来的意外结果。



### js垃圾回收机制

在JavaScript中，垃圾回收（Garbage Collection，GC）是由JavaScript引擎自动管理的，引擎会在适当的时候执行垃圾回收，以回收不再使用的对象所占用的内存。

JavaScript的垃圾回收通常会在`程序空闲时间`内运行，或者是在执行过程中检测到`内存使用达到一定阈值时`，会`定期找出那些不再用到的内存`（变量），然后释放其内存


1. 引用计数
> 这其实是早先的一种垃圾回收算法，它把 对象是否不再需要 简化定义为 `对象有没有其他对象引用到它`

`跟踪记录每个值被引用的次数`。当声明了一个变量并将一个引用类型赋值给该变量时，则这个值的引用次数就是1。相反，如果包含对这个值引用的变量又取得了另外一个值，则这个值的引用次数就减1。当这个引用次数变成0时，则说明没有办法再访问这个值了, 垃圾回收器会在运行的时候清理掉引用次数为 0 的值占用的内存.

**缺点**：引用计数有一个严重的问题，那就是`循环引用`。例如，如果两个对象相互引用，即使外部没有引用它们，它们的引用计数也永远不会为0，因此它们将永远不会被垃圾回收，从而导致`内存泄漏`。


2. 标记清除
> 目前在 JavaScript引擎 里这种算法是最常用的，到目前为止的大多数浏览器的 JavaScript引擎 都在采用标记清除算法

垃圾收集器在运行时会给内存中的所有变量都加上一个`标记`，假设内存中所有对象都是垃圾，全标记为0；然后`从各个根对象开始遍历`，把不是垃圾的节点改成1；`清理所有标记为0的垃圾`，销毁并回收它们所占用的内存空间；最后，把所有内存中对象标记修改为0，等待下一轮垃圾回收

**缺点**：内存碎片化，空闲内存块是不连续的，`容易出现很多空闲内存块`，还可能会出现分配所需内存过大的对象时找不到合适的块
> `标记整理（Mark-Compact）算法` 就可以有效地解决，它的标记阶段和标记清除算法没有什么不同，只是标记结束后，标记整理算法会将活着的对象（即不需要清理的对象）向内存的一端移动，最后清理掉边界的内存

常见的内存泄露：`意外的全局变量、没有及时清理的计时器或回调函数、闭包、没有清理的DOM元素引用、Map/Set对象、console`


- **V8对GC的优化**

V8 的垃圾回收策略主要基于分代式垃圾回收机制，V8 中`将堆内存分为新生代和老生代两区域`，采用不同的垃圾回收器也就是不同的策略管理垃圾回收

1. `新生代`的对象为存活时间较短的对象，简单来说就是新产生的对象，通常只支持 1～8M 的容量
> 使用`Cheney算法`：将堆内存一分为二，一个是处于使用状态的空间我们暂且称之为 `使用区`，一个是处于闲置状态的空间我们称之为 `空闲区`

2. `老生代`的对象为存活事件较长或常驻内存的对象，简单来说就是`经历过新生代垃圾回收后还存活下来的对象`，容量通常比较大
> 使用`标记清除算法`


**并行回收(Parallel)**
> 新生代对象空间就采用并行策略，在执行垃圾回收的过程中，会启动了`多个线程`来负责新生代中的垃圾清理操作

主线程在执行 JavaScript 的过程中，`辅助线程`能够在后台完成执行垃圾回收的操作，辅助线程在执行垃圾回收的时候，主线程也可以自由执行而不会被挂起

**增量标记**
- 三色标记法：`白色`指的是未被标记的对象；`灰色`指自身被标记，成员变量（该对象的引用对象）未被标记；`黑色`指自身和成员变量皆被标记

**懒性清理**: 增量标记完成后，惰性清理就开始了。当增量标记完成后，无需一次性清理完所有非活动对象内存，可以按需逐一进行清理直到所有的非活动对象内存都清理完毕，后面再接着执行增量标记






### js模块化

`全局function模式`: 污染全局命名空间, 容易引起命名冲突或数据不安全，而且模块成员之间看不出直接关系。

`namespace模式`: 减少了全局变量，解决命名冲突; 会暴露所有模块成员，数据不安全

`IIFE模式`: 匿名函数自调用(闭包)，数据是私有的, 外部只能通过暴露的方法操作
> 保证模块的独立性，还使得模块之间的依赖关系变得明显。


`CommonJS`：服务端模块规范，`module.exports、require`

1. 第一次加载某个模块时，Node会缓存该模块。以后再加载该模块，就直接从缓存取出;
2. `输入的是被输出的值的拷贝。也就是说，一旦输出一个值，模块内部的变化就影响不到这个值;`
3. `采用同步的方式加载模块`: 这并不适合在浏览器环境，同步意味着阻塞加载，浏览器资源是异步加载的；
4. 运行时加载：当使用require命令加载某一个模块时，就会运行整个模块的代码。


`AMD`: （Asynchronous Module Definition，异步模块定义）
> 对于依赖的模块提前执行，依赖前置。

requireJS


`CMD`：（Common Module Definition，通用模块定义）
> CMD 规范专门用于浏览器端，模块的加载是异步的，模块使用时才会加载执行。CMD规范整合了 CommonJS 和 AMD 规范的特点。

SeaJS


AMD vs CMD: 
1. AMD是**依赖关系前置**，在定义模块的时候就要声明其依赖的模块；
2. CMD是**按需加载、依赖就近**，只有在用到某个模块的时候再去require。




`UMD`: 通用模块定义规范（Universal Module Definition）
> 它可以通过运行时或者编译时让同一个代码模块在使用 CommonJs、CMD 甚至是 AMD 的项目中运行, 它没有自己专有的规范，是集结了 CommonJs、CMD、AMD 的规范于一身.



`ES6`: 尽量的静态化，使得编译时就能确定模块的依赖关系

`export, export default, import`

ES6 可以在编译时就完成模块加载，效率要比 CommonJS 模块的加载方式高


es6 vs commonjs:
1. CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用；
2. CommonJS 模块是运行时加载，ES6 模块是编译时输出接口；
3. CommonJS 模块的require()是同步加载模块，ES6 模块的import命令是异步加载，有一个独立的模块依赖的解析阶段。


### this指向

1. 方法调用模式下，`this 总是指向调用它所在方法的对象`，this 的指向与所在方法的调用位置有关，而与方法的声明位置无关（箭头函数特殊）；
2. 函数调用下，this 指向 window ,`调用方法没有明确对象的时候，this 指向 window`，如 setTimeout、匿名函数等；
3. `构造函数调用模式下，this 指向被构造的对象`；
4. `apply,call,bind` 调用模式下，this 指向第一个参数；
5.  箭头函数里面的 this 是上下文( context ), 外部作用域的 this 就是箭头函数内的 this。
6. 严格模式下，如果 this 没有被执行环境（execution context）定义，那 this是 为undefined；



- **箭头函数**

1. 没有自己的this: 指向上一层函数的this;
2. 不能作为构造函数，没有prototype，arguments 属性；
3. 适用于需要匿名函数的地方




### ES6及ES6+新增了哪些新语法特性

- es6(es2015): `let,const,箭头函数,map,set,promise,变量的解构赋值，模板字符串`${}`,Proxy, class类，块级作用域`
- es7: Array.prototype.includes()
- es8: async/await, 字符串：padStart()用于头部补全，padEnd()用于尾部补全；Object.values()和Object.entries
- es9: for await of、 Promise.finally()



### Map和WeakMap的区别？

- `键的类型`：Map 允许任何类型的键（对象或原始值）。`WeakMap 只接受对象作为键`。如果尝试使用非对象作为键，它会抛出错误。
- `键的弱引用：` Map 保持对其键的`强引用`，就不会被垃圾回收。WeakMap 对其键持有`弱引用`, 如果外部没有其他引用指向某个键，垃圾回收器也可以将其清理掉: 可以`帮助防止内存泄漏`。
- `迭代`：两者都可以被迭代，但 WeakMap 不暴露其键的列表。不能获取 WeakMap 的所有键，也不能检查某个对象是否作为键存在于 WeakMap 中。你只能通过键来访问或删除对应的值。
- `用途`：Map 通常用于需要存储键值对且需要保留这些键值对直到`显式删除它们`的情况。WeakMap 特别适用于存储与对象关联的数据，且这些数据不需要在对象被垃圾回收后继续存在。




### js设计模式

1. 单例模式：保证一个类仅有一个实例，并提供一个访问它的全局访问点；确保只有一个实例，并提供全局访问。
> 实例如果已经创建，则直接返回；如全局弹窗组件

2. 策略模式: 定义一系列的算法，把它们一个个封装起来，并且使它们可以相互替换; 将算法的使用和算法的实现分离开来; 表单验证

3. **发布订阅模式**：定义了对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。
> 消息的发布者，不会将消息直接发送给特定的订阅者，而是通过消息通道广播出去，然后呢，订阅者通过订阅获取到想要的消息。

4. 装饰者模式：动态地给某个对象添加一些额外的职责，是一种实现继承的替代方案；`在不改变原对象的基础上，通过对其进行包装扩展，使原有对象可以满足用户的更复杂需求`，而不会影响从这个类中派生的其他对象。



- 观察者模式 vs 发布订阅模式

1. 观察者模式和发布订阅模式最大的区别就是发布订阅模式有个`事件调度中心`。
2. 观察者模式由具体目标调度，每个被订阅的目标里面都需要有对观察者的处理，这种处理方式比较直接粗暴，但是会造成代码的冗余。
3. 而发布订阅模式中统一由`调度中心`进行处理，`订阅者和发布者互不干扰，消除了发布者和订阅者之间的依赖`。这样一方面实现了解耦，还有就是可以实现更细粒度的一些控制。比如发布者发布了很多消息，但是不想所有的订阅者都接收到，就可以在调度中心做一些处理，类似于权限控制之类的。还可以做一些节流操作。




### js跨域方案

1. jsonp: 利用script向服务器端发送请求，仅支持get, 不安全，容易被攻击；
2. CORS: 跨越资源共享, 服务端设置 `Access-Control-Allow-Origin` 就可以开启 CORS
3. postMessage: 允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨文本档、多窗口、跨域消息传递。
4. websocket: Websocket是HTML5的一个持久化的协议，它实现了浏览器与服务器的全双工通信，同时也是跨域的一种解决方案
5. node正向代理：前端在webpack中配置`proxy`
6. nginx反向代理：使用nginx反向代理实现跨域，是最简单的跨域方式。只需要修改nginx的配置即可解决跨域问题，支持所有浏览器
> 通过nginx配置一个代理服务器（域名与domain1相同，端口不同）做跳板机，反向代理访问domain2接口~
7. window.name + iframe；window.location.hash + Iframe：监听`onhashchange`事件



### 正向代理和反向代理

- 正向代理：正向代理服务器位于客户端和目标服务器之间，`客户端通过正向代理服务器来访问目标服务器`，所有的请求都需要经过正向代理服务器进行转发。
> 如前端本地开发时，webpack配置的proxy接口代理就是正向代理~


正向代理服务器可以实现**访问控制和内容过滤**，例如限制访问某些特定的网站或内容，从而提高网络安全性。


- 反向代理：反向代理服务器位于目标服务器和客户端之间，`客户端向反向代理服务器发送请求，然后反向代理服务器将请求转发到目标服务器`，并将目标服务器的响应返回给客户端。
> 如服务端的nginx配置就是反向代理~

反向代理服务器可以实现**负载均衡**，将请求分发到多个后端服务器上，从而提高服务器的性能和可靠性。

`正向代理代替客户端向服务端发送请求, 反向代理代替服务端向客户端响应请求。`


### 如何解决递归容易造成的栈溢出？

尾递归：当一个函数执行时的最后一个步骤是返回另一个函数的调用，这就叫做尾调用。这样就能保证在调用栈中始终只有一个调用记录，避免堆栈溢出。
``` js
// n * n-1 * n-2 * ... * 1
function fn(n, total = 1) {
    if (n===1) return total;
    return fn(n-1, n*total);
}
fn(5) = 120;
```


### 深拷贝问题

`赋值`：对于引用数据类型来说，在进行赋值操作时，实际上是按址传递，两个变量就指向同一个地址

`浅拷贝`：创建一个新对象，只复制对象的顶层属性。
> 如果属性是基本类型，拷贝的就是基本类型的值，如果属性是引用类型，拷贝的就是内存地址 ，所以如果其中一个对象改变了这个地址，就会影响到另一个对象。

`深拷贝`：创建一个新对象，该对象有着对原始对象所有层级属性的递归精确拷贝。
> 将一个对象从内存中完整的拷贝一份出来,从堆内存中开辟一个新的区域存放新对象,且修改新对象不会影响原对象。



- **JSON.parse(JSON.stringify(object))弊端**
1. 会忽略 undefined
2. 会忽略 symbol
3. 不能序列化函数
4. 不能解决循环引用的对象



**栈溢出**
> 栈溢出的主要原因还是递归；在js中递归非常耗费内存，因为需要同时保存成千上百个调用帧，很容易发生“栈溢出”错误。解决这个问题的方法就是不用递归，改用循环来实现。`while`


**循环引用**
> 循环引用是因为`对象的属性间接或直接的引用了自身`，最终导致死循环；解决循环引用问题，`可以额外开辟一个存储空间，来存储当前对象和拷贝对象的对应关系`，当需要拷贝当前对象时，先去存储空间中找，有没有拷贝过这个对象，如果有的话直接返回，如果没有的话继续拷贝，这样就巧妙化解的循环引用的问题。`WeakMap`


**引用丢失**
> 一个对象a，a下面的两个键值都引用同一个对象b，经过深拷贝后，a的两个键值会丢失引用关系，从而变成两个不同的对象.

> 如果我们发现一个新对象就把这个对象和他的拷贝存下来，每次拷贝对象前，都先看一下这个对象是不是已经拷贝过了，如果拷贝过了，就不需要拷贝了，直接用原来的，这样我们就能够保留引用关系了；解决方法和循环引用的方法差不多。




### 浅比较与深比较

- `浅比较`也称引用相等，基本类型会比较值是否相等，复杂类型会比较引用地址是否相等; 在 javascript 中， `===` 是作浅比较,只检查左右两边是否是同一个对象的引用

- `深比较`也称原值相等，深比较是指`检查两个对象的所有属性是否都相等`,深比较需要以`递归`的方式遍历两个对象的所有属性，操作比较耗时，深比较不管这两个对象是不是同一对象的引用。

``` js
console.log({a:1} === {a:1}) // false
const m = {a:1};
const n = {a:1};
console.log(m === n) // false
const k = m;
console.log(k === m); // true
```






### 防抖与节流


- 防抖：debounce, 等事件持续触发结束后才去执行一次回调；`resize事件, input搜索事件, keypress事件，按钮点击接口请求`

- 节流：throttle, 在规定的某个时间范围内，该事件最多只执行一次，降低执行频率；`mousemove, srcoll`



### call,apply,bind异同？

- 改变函数this指向；
- apply传参是数组；call是多个参数依次列出；都会立即执行；
- bind函数的特点：
1. 返回一个新的函数,`不会立即执行`
2. 函数在声明和执行的时候都可以传参
3. 返回的函数`可以作为构造函数使用`
4. 生成实例能获取绑定函数原型中的值



### bind 返回的函数，再次 bind 后，上下文是指向哪个？

在 JavaScript 中，bind 方法用于创建一个新的函数，该函数会永久绑定指定的上下文（即函数被调用时的 this 值）。当你再次对已经通过 bind 绑定过上下文的函数使用 bind 方法时，新的 bind 不会影响已经绑定的上下文，而是创建一个新的函数，并保留已绑定的上下文。

``` js
function originalFunction() {
  console.log(this.name);
}

const obj1 = { name: 'Object 1' };
const obj2 = { name: 'Object 2' };

// 第一次绑定上下文
const boundFunction1 = originalFunction.bind(obj1);
boundFunction1(); // 输出: Object 1

// 第二次绑定上下文
const boundFunction2 = boundFunction1.bind(obj2);
boundFunction2(); // 输出: Object 1，因为已经绑定的上下文不受新的 bind 影响
```



### for in 跟 for of 有什么区别，哪个性能更好一些？

1. 迭代对象的方式:
- `for...in`: `用于迭代对象的可枚举属性`，包括对象自身的属性以及继承的属性。在迭代对象时，for...in 循环会遍历对象的键（即`属性名`）。
- `for...of`: `用于迭代可迭代对象`（比如数组、字符串、Set、Map 等），遍历对象的可迭代的属性值。在迭代对象时，for...of 循环会遍历`对象的值`。

2. 迭代效果:
- for...in: 返回的是`键（属性名）`，可以通过键访问到对象的值。
- for...of: 返回的是`值`，可以直接访问到对象的值。

3. 性能:
通常情况下，`for...of 的性能更好`，因为它是`专门用于迭代可迭代对象的语法结构，不会受到原型链的影响`。而 `for...in 则会遍历对象的原型链上的所有可枚举属性，可能会导致性能上的损耗`。不过，在实际开发中，性能差异可能并不明显，而且在迭代对象时，应该根据具体的需求选择合适的迭代方式。




### js中常用的对象继承有哪些？

1. 原型链继承
2. 构造函数继承：在子类型构造函数的内部调用超类型构造函数来实现继承。
3. 组合继承（原型链 + 借用构造函数）：这是最常用的继承模式，结合了原型链和借用构造函数的特点，可以充分发挥二者优势。
4. es6 class继承：extend

``` js
// 使用原型链实现继承
function SuperType(age) {
  this.name = 'a';
  this.age = age;
}
SuperType.prototype.sayName = function() {
  console.log(this.name);
}

function SubType(name) {
  this.name = name;
  this.age = 18;
}
SubType.prototype = new SuperType(10);
const instance = new SubType('b');
instance.sayName() // b


// 使用构造函数继承
function  SuperType(){
    this.color=["red","green","blue"];
}
function  SubType(){
    //继承自SuperType
    SuperType.call(this);
}
var instance1 = new SubType();
instance1.color.push("black");
alert(instance1.color);//"red,green,blue,black"

// es6 继承
class Square extends Rectangle {...}
```


### js中 new 有什么用？

1. 创建临时对象，并将this指向临时对象；
2. 将构造函数的prototype挂载到新对象的原型指针`__proto__`上；
3. 返回新对象




### IntersectionObserver


- IntersectionObserver：可以监听一个元素和可视区域相交部分的比例，然后在可视比例达到某个阈值的时候触发回调。
> 场景：滚动加载更多

- MutationObserver：可以监听对元素的属性的修改、对它的子节点的增删改。
> 场景：监听页面水印是否去掉、监听编辑器变化、画布变化

- ResizeObserver：元素可以用 ResizeObserver 监听大小的改变，当 width、height 被修改时会触发回调。

- PerformanceObserver：用于监听记录 performance 数据的行为，一旦记录了就会触发回调，这样我们就可以在回调里把这些数据上报。
> 浏览器提供了 performance 的 api 用于记录一些时间点、某个时间段、资源加载的耗时等。

- ReportingObserver: 可以监听过时的 api、浏览器干预等报告等的打印，在回调里上报，这些是错误监听无法监听到但对了解网页运行情况很有用的数据。



### requestAnimationFrame比定时器好在哪里？

普通显示器的刷新率约为`60Hz（每秒刷新60次）`, requestAnimationFrame和js中的setTimeout定时器函数基本一致，不过setTimeout可以自由设置间隔时间，而requestAnimationFrame的间隔时间是由浏览器自身决定的，大约是17毫秒（1/60s）左右

定时器的回调函数，会受到js的事件队列宏任务、微任务影响，可能设定的是17毫秒执行一次，但是实际上这次是17毫秒、下次21毫秒、再下次13毫秒执行，所以并不是严格的卡住了这个60HZ的时间，所以有时页面会卡；

requestAnimationFrame能在`浏览器下次重绘之前执行指定的回调`，能够做到精准严格的卡住显示器刷新的时间，所以不卡




### 请描述一下 cookies、 sessionStorage和localstorage区别？

1. 存储位置：`Cookie是由服务器端写入的`，而sessionStorage和localStorage都是由前端写入的。
2. 存储大小：Cookie的存储空间比较小，大概为`4KB`，因此只适合保存很小的数据，如会话标识。相比之下，sessionStorage和localStorage的存储空间要大得多，可以达到`5MB`或更大。

3. 生命周期：
    - Cookie的生命周期是由服务器端在写入的时候就设置好的，它可以在浏览器关闭后依然存在，直到过期时间。
    - sessionStorage的生命周期则仅限于当前浏览器窗口或标签页的生命周期，当窗口或标签页关闭时，sessionStorage中的数据就会被清除。
    - 而localStorage的生命周期则是永久的，除非用户手动清除数据或者开发人员通过代码删除数据，否则数据将一直存在。

4. 数据共享：`sessionStorage的作用域是限制在同一个窗口或标签页中`，即使两个窗口或标签页属于同一个源，它们也无法共享sessionStorage中的数据。而`localStorage和Cookie则可以在同源的所有窗口或标签页中共享数据`。

5. 与服务器之间的交互方式：`Cookie的数据会自动传递到服务器`，服务器端也可以写Cookie到客户端。而sessionStorage和localStorage则不会自动把数据发给服务器，仅在`本地保存`。


- **服务端是怎么给浏览器写入cookie的?**

> 服务端给浏览器写入cookie通常是`在HTTP响应头中设置Set-Cookie字段`来完成的。当浏览器接收到包含Set-Cookie字段的HTTP响应时，它会根据这个字段的内容创建或更新一个cookie，并将其保存在本地。之后，浏览器在发送请求时会自动携带这个cookie，以便服务端能够识别出用户身份或状态等信息。




- **localStorage存储能够在刷新页面后还保留存储数据，它是怎么实现的呢？**

> localStorage 是 Web Storage API 的一部分，它允许网页在用户的浏览器中存储键值对数据。这些数据没有过期时间，除非被脚本显式删除或用户清除浏览器缓存，否则它们会持久保留。localStorage 之所以能够在刷新页面后还保留存储数据，是因为它利用了浏览器的持久化存储机制。

1. `浏览器内部存储`：当你使用 localStorage.setItem(key, value) 方法存储数据时，浏览器会在其内部存储机制中为该网站创建一个存储区域。这个存储区域与该网站相关联，通常基于网站的域名。这意味着不同的网站有它们自己的 localStorage 空间，彼此之间不会相互干扰。

2. `键值对存储`：存储的数据是以键值对的形式保存的。这意味着你可以为每个存储项指定一个唯一的键，并通过这个键来检索或更新相应的值。这种存储方式使得数据查找和更新非常高效。

3. `持久化机制`：浏览器使用了一种持久化机制来保存 localStorage 中的数据。这通常涉及到`将数据写入到浏览器的存储系统中，可能是文件系统的一部分，或者是浏览器使用的特定数据库系统`。这样，即使浏览器关闭或页面刷新，数据仍然保留在浏览器中。

4. `安全性`：由于 localStorage 存储的数据是持久化的，并且与特定网站相关联，因此它提供了一定程度的安全性。`只有来自同一域名的脚本才能访问和修改与该域名关联的 localStorage 数据`。这有助于防止跨站脚本攻击（XSS）中恶意脚本访问或篡改其他网站的数据。

5. `限制和配额`：尽管 localStorage 提供了持久化存储的能力，但它通常有一定的存储配额限制。不同的浏览器可能会有不同的配额限制，并且这些限制可能会随着浏览器的更新而发生变化。当达到配额限制时，尝试存储更多数据可能会导致错误。



- **在js中，不使用localStorage，有其他方案实现持久化存储吗?**

1. `IndexedDB`: IndexedDB 是一个事务型数据库系统，用于客户端存储大量结构化数据（包括文件/blobs）。它使用索引实现高性能搜索，并且可以在Web Worker中运行，不会阻塞主线程。IndexedDB比localStorage更复杂，但提供了更多的功能和灵活性。
2. `WebSQL`: WebSQL是一个早期的浏览器数据库规范，它提供了一套完整的SQL数据库操作接口。然而，WebSQL已被大多数现代浏览器弃用，因此不推荐使用。
3. `Cookies`: 虽然Cookies主要用于跟踪用户会话，但它们也可以用于存储少量数据。Cookies的大小有限制（通常不超过4KB），并且每次HTTP请求都会发送它们，这可能会影响性能。因此，Cookies不适合存储大量数据或敏感信息。
4. `SessionStorage`: 与localStorage类似，sessionStorage也在用户的浏览器中提供了存储机制。然而，与localStorage不同的是，sessionStorage中的数据只在当前浏览器窗口或标签页的生命周期内存在。一旦窗口或标签页关闭，数据就会被删除。
5. `缓存（Cache API）`: Cache API 提供了一种存储和检索网络请求响应的方法。虽然它主要用于缓存网络资源以提高性能，但也可以用于存储数据。然而，Cache API主要用于与Service Workers结合使用，以拦截和修改网络请求，因此可能不适合所有用例。
6. `文件系统API（例如File System Access API）`: 在支持的环境中，可以使用文件系统API直接读取和写入用户的本地文件系统。这允许应用创建、读取和修改文件，从而实现持久化存储。然而，这种方法可能需要用户的明确许可，并且可能受到浏览器安全策略的限制。
7. `第三方服务`: 如果你的应用运行在服务器端或需要与后端交互，你可以考虑使用第三方服务（如数据库、对象存储等）来存储数据。然后，你的JavaScript应用可以通过API与这些服务进行通信，以读取和写入数据。



### 什么IndexedDB？

IndexedDB 就是`浏览器提供的本地数据库`，它可以被网页脚本创建和操作。IndexedDB 允许储存大量数据，提供查找接口，还能建立索引。这些都是 LocalStorage 所不具备的。就数据库类型而言，IndexedDB 不属于关系型数据库（不支持 SQL 查询语句），更接近 NoSQL 数据库。


特点：
1. `键值对储存。` IndexedDB 内部采用对象仓库（object store）存放数据。所有类型的数据都可以直接存入，包括 JavaScript 对象。对象仓库中，数据以"键值对"的形式保存，每一个数据记录都有对应的主键，主键是独一无二的，不能有重复，否则会抛出一个错误。
2. `异步。` IndexedDB 操作时不会锁死浏览器，用户依然可以进行其他操作，这与 LocalStorage 形成对比，后者的操作是同步的。异步设计是为了防止大量数据的读写，拖慢网页的表现。
3. `支持事务。` IndexedDB 支持事务（transaction），这意味着一系列操作步骤之中，只要有一步失败，整个事务就都取消，数据库回滚到事务发生之前的状态，不存在只改写一部分数据的情况。
4. `同源限制` IndexedDB 受到同源限制，每一个数据库对应创建它的域名。网页只能访问自身域名下的数据库，而不能访问跨域的数据库。
5. `储存空间大` IndexedDB 的储存空间比 LocalStorage 大得多，一般来说不少于 250MB，甚至没有上限。
6. `支持二进制储存。` IndexedDB 不仅可以储存字符串，还可以储存二进制数据（ArrayBuffer 对象和 Blob 对象）。



### cookie 与 session 的区别

Session是在服务端保存的一个数据结构，用来跟踪用户的状态，这个数据可以保存在集群、数据库、文件中；
> 服务端要为特定的用户创建了特定的Session，用于标识这个用户，并且跟踪用户

Cookie是客户端保存用户信息的一种机制，用来记录用户的一些信息，也是实现Session的一种方式。





### 多窗口之间sessionStorage能共享状态吗?

多窗口之间，sessionStorage不能共享状态。这是因为sessionStorage是`浏览器会话级别的存储机制`，它只在单个浏览器标签页（tab）或窗口之间共享数据。每当用户打开一个新的tab页或一个窗口时，sessionStorage会重新初始化，`每个tab页和窗口都有自己独立的sessionStorage`。

但如果通过A页面打开的B页面（例如使用`window.open或a链接`打开同源网址），那么B页面会复制A页面的sessionStorage数据：`在该标签或窗口打开一个新页面时会复制顶级浏览会话的上下文作为新会话的上下文`
> 然而，这种`复制并不意味着共享`，因为修改A页面的sessionStorage数据，并不会影响B页面中的sessionStorage数据。





### setTimeout 和 setInterval

> JavaScript 定时器函数像 setTimeout 和 setInterval 都不是 ECMAScript 规范或者任何 JavaScript 实现的一部分。 `定时器功能由浏览器实现，它们的实现在不同浏览器之间会有所不同`。 定时器也可以由 Node.js 运行时本身实现。


- **js中setTimeout和setInterval都能实现定时器效果，但二者有什么区别？**
> setTimeout只会往队列中添加一次，而setInterval会每隔一段时间往队列中添加一次；setInterval 的性能可能会更低，因为它的回调函数每隔一定时间就会被执行一次，如果`回调函数的执行时间比时间间隔还长，那么会导致回调函数的堆积，多个回调函数同时进行，从而导致性能问题`；而 setTimeout 则可以通过递归的方式实现反复执行的效果，这样每次只有一个回调函数正在执行，相对来说更容易控制性能。




### js异步接口请求方案

- `ajax`: Asynchronous JavaScript And XML，翻译过来就是“异步的 Javascript 和 XML”。

Ajax 是一种思想，`XMLHttpRequest` 只是实现 Ajax 的一种方式。其中 XMLHttpRequest 模块就是实现 Ajax 的一种很好的方式。

``` js
/*
1. 创建XMLHttpRequest对象
2. 设置请求方法、URL和是否异步处理; 使用setRequestHeader()方法设置请求头
3. send()方法发送请求
4. 监听 onreadystatechange 事件，当请求状态发生变化时执行回调函数
*/
var xhr = new XMLHttpRequest();  
xhr.open('GET', 'https://api.example.com/data', true);  
xhr.onreadystatechange = function() {  
    if (xhr.readyState === 4 && xhr.status === 200) {  
        var response = xhr.responseText;  
        console.log(response);  
    }  
};  
xhr.send();
```


- `fetch`: Fetch 是 ES6 新推出的一套异步请求方案，它天生自带 Promise，同时也是原生的

- `axios`: axios是一个用于网络请求的第三方库，是一个基于Promise 用于浏览器和 nodejs 的 HTTP 客户端



### 怎么取消已经发出去的接口请求？

- `fetch`: 原生的Fetch API本身并不直接支持取消请求。然而，你可以使用`AbortController`和`AbortSignal`接口来实现这一功能。

``` js
// 通过 AbortController 创建一个控制器对象  
const controller = new AbortController();  
const signal = controller.signal;  
  
// 发起fetch请求，并传入signal  
fetch('https://api.example.com/data', { signal })  
  .then(response => response.json())  
  .then(data => console.log(data))  
  .catch(error => {  
    if (error.name === 'AbortError') {  
      console.log('Fetch aborted');  
    } else {  
      console.error('Error:', error);  
    }  
  });  
  
// 当需要取消请求时  
controller.abort();
```



- Axios库: Axios库提供了内置的取消请求功能。你可以使用`CancelToken`来创建一个可以取消的请求。

> 当我们中止请求后，网络请求就会变成`canceled`状态~



### axios面试题


- **问：为什么 axios 既可以当函数调用，也可以当对象使用，比如axios({})、axios.get**
> 答：axios本质是函数，赋值了一些别名方法，比如get、post方法，可被调用，最终调用的还是Axios.prototype.request函数。

- **问：简述 axios 调用流程**
> 答：实际是调用的Axios.prototype.request方法，最终返回的是promise链式调用，实际请求是在dispatchRequest中派发的

- **问：有用过拦截器吗？原理是怎样的**
> 答：用过，用`axios.interceptors.request.use`添加请求成功和失败拦截器函数，用`axios.interceptors.response.use`添加响应成功和失败拦截器函数。在Axios.prototype.request函数组成promise链式调用时，Interceptors.protype.forEach遍历请求和响应拦截器添加到真正发送请求dispatchRequest的两端，从而做到请求前拦截和响应后拦截。拦截器也支持用Interceptors.protype.eject方法移除


- **问：有使用axios的取消功能吗？是怎么实现的**
> Axios 提供了一个取消请求的功能，通过创建一个 `CancelToken` 的源，并将其传递给请求配置，你可以在任何时候取消请求。Axios 的取消功能依赖于 Promise 的特性，因此它只能在支持 Promise 的环境中使用

``` js
import axios from 'axios';  
let CancelToken = axios.CancelToken;  
let source = CancelToken.source();  
  
axios.get('/user/12345', {  
  cancelToken: source.token  
}).catch(function (thrown) {  // 如果请求被取消，那么 catch 块中的代码将被执行。
  if (axios.isCancel(thrown)) {  
    console.log('Request canceled', thrown.message);  
  } else {  
    // 处理错误  
  }  
});
// 要取消请求，你可以调用源上的 cancel 方法，并传递一个可选的消息字符串：
// 这将导致 axios.get 请求被取消，并且 catch 块中的代码将被执行。如果提供了消息字符串，那么它将被包含在取消错误中，并可以通过 thrown.message 访问。
source.cancel('Operation canceled by the user.');
```
> 原理：当 `cancel` 触发处于 pending 中的 tokens.promise ，取消请求，把 axios 的 promise 走向 `rejected` 状态




- **问：为什么支持浏览器中发送请求也支持node发送请求**
> 答：`axios.defaults.adapter`默认配置中根据环境判断是浏览器还是node环境，使用对应的适配器。适配器支持自定义




### 前端接口防止重复请求实现方案


- 通过使用axios拦截器，`在请求拦截器中开启全屏Loading，然后在响应拦截器中将Loading关闭`。
> 不太美观，可能会出现Loading套Loading

- 使用防抖（debounce）和节流（throttle）

- 设置请求标志位：在发起请求前，设置一个标志位（如isFetching）为true，请求结束后设置为false

- 使用队列或堆栈管理请求：所有`待处理的请求放入一个队列`或堆栈中，每次只处理队列或堆栈顶部的请求。`如果相同的请求再次被加入，可以先检查队列或堆栈中是否已存在该请求，如果存在则不加入`。

- 取消未完成的请求：如果使用axios等支持取消请求的库，可以`在发起新请求前取消之前的请求`。这通常用于搜索、分页等场景，当用户输入新的搜索词或点击新的页码时，取消之前的请求。

- 使用请求ID或唯一键识别重复请求：为每个请求生成一个唯一的ID或键，并在请求前检查这个ID或键是否已存在。如果存在，则认为是重复请求并拒绝处理。

- 在服务器端处理重复请求, 设置请求超时时间



## TS部分

TypeScript 是一种静态类型的面向对象的编程语言; TypeScript 是 JavaScript 的超集; Typescript 使用类型系统在编译时执行类型检查;


**常用类型**

- `Enum` 类型：枚举类型用于定义数值集合，使用枚举我们可以定义一些带名字的常量。 使用枚举可以清晰地表达意图或创建一组有区别的用例。
- 基本类型：`数组[]，undefined, null, string, number, object, boolean`
- `any, void, unknown, never`
> void 意思就是无效的, 一般只用在函数上，告诉别人这个函数没有返回值; never 类型表示的是那些不存在的值的类型; any <=> 任何类型，unknown 任何类型的值都可以赋值给它，但它只能赋值给unknown和any。
- interface, type, 
- 继承：implements, extends
- `public` 类的内部和外部都能访问; `private` 只能在类的内部进行访问; `protected` 只能在类的内部，和类的继承中使用
- class; abstract: 抽象类做为其它派生类的基类使用, 它们一般不会直接被实例化。 


### 泛型

泛型（Generics）是 TypeScript 中的一个重要概念，它允许在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再为其指定类型。泛型提供了类型参数化，即可以将类型当作参数来传递和使用。

是指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。 `<T>`


### type和interface的区别

`type 是 类型别名`，`给一些类型的组合起别名`，这样能够更方便地在各个地方使用: `type ID = string | number;`

`interface 是 接口`。有点像 type，可以用来代表一种类型组合，但它范围更小一些，只能描述对象结构:

``` ts
interface Position {
    x: number;
    y: string;
}
```

1. type 能表示的任何类型组合。interface 只能表示对象结构的类型。
2. `interface`可以重复声明，`type`不行，继承方式不一样，interface使用`extends`实现; type 可以通过 `交叉类型&` 的写法来继承 type 或 interface，得到一个交叉类型：
``` ts
interface Rect extends Shape {
  width: number;
  height: number;
}
type Circle = Shape & { r: number }
```

3. interface 支持声明合并，文件下多个同名的 interface，它们的属性会进行合并, 但同名属性的不能进行类型覆盖修改，否则编译不通过；type 不支持声明合并，`一个作用域内不允许有多个同名 type`。



### 装饰器

TypeScript 装饰器是一种向类、方法或属性添加额外行为的方法。

在 TypeScript 中，装饰器（Decorators）是一种特殊类型的声明，它可以被附加到类声明、方法、属性或参数上，以修改其行为。装饰器使用 `@expression` 这样的形式，其中 expression 必须计算为一个函数，该函数将在运行时被调用。

``` js
function Logger(target: any, propertyKey: string) {
  console.log(`Calling ${propertyKey}`);
}

class MyClass {
  @Logger
  greet() {
    console.log('Hello');
  }
}

const instance = new MyClass();
instance.greet(); // Calling greet \n Hello
```






## Vue部分


### vue2 vs vue3

1. optionsAPI和compositionAPI
    - optionAPI缺点：
        - 由于所有数据都挂载在 this 之上，因而 Options API 的写法对 TypeScript 的类型推导很不友好，并且这样也不好做 Tree-shaking 清理代码
        - 代码不好复用，Vue 2 的组件很难抽离通用逻辑，只能使用 mixin，还会带来命名冲突的问题。

    - compositionAPI优点：
        - 所有 API 都是 import 引入的。用到的功能都 import 进来，对 Tree-shaking 很友好，没用到功能，打包的时候会被清理掉 ，减小包的大小。
        - 代码方便复用

2. 响应式：Object.defineProperty 和 Proxy
    - defineProperty缺点：不能监听数组的变化、只能劫持对象的属性、必须递归深层遍历
    - proxy优点：针对整个对象、支持数组、api丰富
3. diff算法提升: vue3对于静态的标签和属性会作`静态标记`
4. 写法改变：
    - setup, createApp, 声明周期，...
    - `ref, reactive, toRefs, computed,watch,watchEffect`
    - vue3支持多个v-model绑定，
    - vue3新增Teleport组件：可以将一个组件内部的一部分模板“传送”到该组件的 DOM 结构外层的位置去
5. ts支持：vue2是用flow.js做类型检查，vue3直接用ts写
6. vue3有更好的tree shaking


### ref VS reactive?

- ref可以存放任何数据类型，而reactive声明的数据类型则仅限于引用数据类型。
- ref 用于将基本类型的数据和引用数据类型（对象）转换为响应式数据，通过 `.value` 访问和修改。reactive 用于将对象转换为响应式数据，可以直接访问和修改属性，适用于复杂的嵌套对象和数组。
- `reactive 使用不当会失去响应`：reactive 重新赋值丢失响应是因为`引用地址变了`，被 proxy 代理的对象已经不是原来的那个，所以丢失响应了。



### vue如何控制按钮权限？

1. v-if
2. 封装一个权限检验组件
3. 封装一个指令


### vue 3 中用 proxy 缺点是什么？除了兼容性，还有其它缺点吗？

1. `性能开销`：虽然 Proxy 在大多数情况下性能足够好，但它确实比传统的 Object.defineProperty 方法有一些额外的性能开销。
> 因为 Proxy 需要创建一个新的代理对象，并且在每次访问或修改属性时都需要进行额外的拦截和处理。

2. `无法检测原生对象或函数的属性`：Proxy 只能拦截目标对象自身的属性，对于继承自原型链的属性或原生对象（如 Date、RegExp 等）的属性，Proxy 无法进行拦截。

3. `需要谨慎处理循环引用`：在 Vue 3 中，如果响应式对象之间存在循环引用，可能会导致一些问题。因为 `Proxy 是基于引用进行拦截的`，所以`循环引用可能会导致无限递归或内存泄漏`等问题。

4. `调试和排查问题可能更困难`：由于 Proxy 的工作方式相对复杂，当出现问题时，调试和排查可能会比使用 Object.defineProperty 更困难。







### React Hooks 与 Vue3 compositon API 的比较?

> Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

1. `React Hooks 在每次组件渲染时都会调用`，通过隐式地将状态挂载在当前的内部组件节点上，在下一次渲染时根据调用顺序取出；而 `Vue 的 setup() 每个组件实例只会在初始化时调用一次` ，状态通过引用储存在 setup() 的闭包内。

2. 昂贵的计算需要使用 useMemo，这也需要传入正确的依赖数组; Vue 的响应性系统运行时会自动收集计算属性和侦听器的依赖，因此无需手动声明依赖。

3. 子组件默认更新，并需要显式的调用 useCallback 作优化。这个优化同样需要正确的依赖数组；vue无需手动缓存回调函数来避免不必要的组件更新。Vue 细粒度的响应性系统能够确保在绝大部分情况下组件仅执行必要的更新。

4. React Hooks 有严格的调用顺序，并不可以写在条件分支中; Vue组合式 API 也并不限制调用顺序，还可以有条件地进行调用。


[和 React Hooks 的对比](https://cn.vuejs.org/guide/extras/composition-api-faq.html#comparison-with-react-hooks)



### MVC 和 MVVM

mvc: `view => controller => model => view`；通信是单向的

> View 传送指令到 Controller；Controller 完成业务逻辑后，要求 Model 改变状态；Model 将新的数据发送到 View，用户得到反馈。


mvvm: `view <===> viewmodel <===> model`；

>【模型】指的是后端传递的数据。【视图】指的是所看到的页面。【视图模型】mvvm 模式的核心，它是连接 view 和 model 的桥梁。

视图和模型是不能直接通信的。它们通过ViewModel来通信，ViewModel通常要实现一个observer观察者，当数据发生变化，ViewModel能够监听到数据的这种变化；然后通知到对应的视图做自动更新，而当用户操作视图，ViewModel也能监听到视图的变化，然后通知数据做改动，这实际上就实现了数据的`双向绑定`。

1.  MVC模型关注的是Model的不变，所以在MVC模型里，Model不依赖于View，但是 View是依赖于Model的。

2.  MVVM在概念上是真正将页面与数据逻辑分离的模式



### 双向绑定

单向绑定：非常简单，就是把Model绑定到View，当我们用JavaScript代码更新Model时，View就会自动更新

如果用户更新了View，Model的数据也自动被更新了，这种情况就是双向绑定。

实现双向绑定方法：观察者模式（KnockoutJS）、数据模型（Ember）、发布者-订阅者模式（backbone.js）、脏值检查（angular.js）、数据劫持（vue.js）

所谓`数据劫持（也叫数据代理）`，指的是在访问或者修改对象的某个属性时，通过一段代码拦截这个行为，进行额外的操作或者修改返回结果。


基于数据劫持实现双向绑定的实现思路:
1. 利用`Proxy或Object.defineProperty`对对象/对象的属性进行"劫持",在属性发生变化后通知订阅者;
2. 解析器`解析模板中的指令，收集指令所依赖的方法和数据`, 等待数据变化然后进行渲染;
3. 订阅者接收到数据发生变化,并`根据解析器提供的指令进行视图渲染`, 使得数据变化促使视图变化。
4. 实现一个调度中心：用来收集订阅者，对监听器和订阅者进行统一管理



### 虚拟Dom/Diff算法

虚拟DOM，Virtual DOM 就是一个用来描述真实DOM的javaScript对象。虚拟DOM就是`为了解决浏览器性能问题`而被设计出来的

Diff算法是一种对比算法: 对比两者是旧虚拟DOM和新虚拟DOM，对比出是哪个虚拟节点更改了，找出这个虚拟节点，并只更新这个虚拟节点所对应的真实节点，而不用更新其他数据没发生改变的节点，实现精准地更新真实DOM，进而提高效率。



- 虚拟 DOM 的总损耗等于： `虚拟 DOM 增删改 + diff 算法 + 真实 DOM 差异增删改 + 排版与重绘`

- 真实 DOM 的总损耗是: `真实 DOM 完全增删改 + 排版与重绘`


1. 传统的Diff算法通过`循环递归`对节点进行比较，然后判断每个节点的状态以及要做的操作（add，remove，change），最后 根据Virtual DOM进行DOM的渲染; 复杂度为O(n^3)

2. 框架层的diff算法：Web UI 中 DOM 节点跨层级的移动操作特别少，可以忽略不计，所以核心就在于`只对同层节点进行比较，忽略跨层节点的复用`。
> 同层节点的比较也不会两两进行，而是按照一定的顺序比较，或通过 key 属性判断，所以只需要遍历一次新节点，因此算法的复杂度就降低到了O(n)。


React的思路是递增法。通过`从头到尾进行循环遍历`，对比新的列表中的节点，在原本的列表中的位置是否是递增，来判断当前节点是否需要移动。

> 当出现节点跨层级移动时，并不会出现想象中的移动操作，而是把根节点的树被整个重新创建，这是一种影响 React 性能的操作，因此 React 官方建议不要进行 DOM 节点跨层级的操作。

> React 为了突破性能瓶颈，借鉴了`操作系统时间分片`的概念，引入了 `Fiber` 架构。 通俗来说，就是把整个虚拟 DOM 树微观化，变成链表，然后我们利用浏览器的空闲时间计算 Diff。一旦浏览器有需求，我们可以把没计算完的任务放在一旁，把主进程控制权还给浏览器，等待浏览器下次空闲。



Vue2.X Diff `双端比较`：所谓双端比较就是新列表和旧列表两个列表的头与尾互相对比，，在对比的过程中指针会逐渐向内靠拢，直到某一个列表的节点全部遍历过，对比停止。

Vue3 的 Diff 算法与 Vue2 的 Diff 算法一样，也会先进行双端比对，只是双端比对的方式不一样。Vue3 的 `快速Diff算法`借鉴了字符串比对时的双端比对方式，即`优先处理可复用的前置元素和后置元素`。Vue3 采用了`最长递增子序列`更进一步地提升了 Diff 算法的性能
> vue3提供了`静态提升方式来优化重复渲染静态节点的问题`，结合静态提升，还对静态节点进行预字符串化，减少了虚拟节点的性能开销，降低了内存占用。




### vue普通插槽的实现原理

Vue模板到真实DOM渲染的过程都会经历：`编译 =》 生成AST => 生成可执行性代码（codegen）` 的过程；

1. 首先父组件在编译过程中，遇到带有`slot属性或v-slot`的dom会生成一个特定属性，并给生成的AST元素节点添加该属性；

2. 之后在生成可执行性代码过程中，会给当前父组件 data 添加一个 slot 属性，指向该带有slot属性的dom；

3. 之后子组件在编译时如果遇到`<slot>`模块，则给对应的 AST 元素节点添加 `slotName` 属性；

4. 接着子组件在生成可执行性代码过程中，会通过这个`slotName`生成需要渲染的slot内容; 又因为子组件在渲染初始化时其实父组件已经编译完成，那么，子组件在渲染初始化的时候，可以拿到父组件中已经生成的所有 children；

5. 通过循环遍历这些 children 就可以拿到父组件里面嵌套的 vnodes; 这样子组件在渲染时，就可以通过 slotName 来获取需要渲染的内容了，从而实现子组件渲染时把`<slot></slot>`里面的内容渲染为在外层父组件中传入的 dom。


### v-model实现原理

v-model是`value属性+$emit('input')事件`的语法糖。数据双向绑定

1. 首先在编译阶段，v-model 被当做普通的指令解析到 el.directives 中；在编译的时候会传入vue内置的指令：`v-model, v-text, v-html...`；
2. 接着在 `生成可执行性代码` 阶段，会遍历 el.directives，然后获取`v-model`指令对应的方法；
3. 其实就是动态绑定了 input 的 value 指向了 msg 变量，并且在触发 input 事件的时候去动态把 msg 设置为目标值，这样实际上就完成了数据双向绑定了，所以说 v-model 实际上就是语法糖。

`v-bind`数据单向绑定：数据 => 视图



### vue中keep-alive的实现原理

keep-alive 组件是一个抽象组件，它的实现通过自定义 render 函数并且利用了插槽，会 缓存 vnode。

- 最常用的两个属性：`include 、 exculde` ，用于组件进行有条件的缓存，可以用逗号分隔字符串、正则表达式或一个数组来表示
- 在 2.5.0 版本中，keep-alive 新增了 `max` 属性，用于最多可以缓存多少组件实例

1. 在组件首次渲染的时候，它的父组件`<keep-alive>` 的 `render` 函数会先执行，keep-alive会将该组件实例缓存起来；
2. 当再次渲染该组件时，在它的父组件`keep-alive`做 `diff` 数据更新的逻辑中，需要对自己的 `children`，也就是这些 `slots` 做重新解析, 并触发 `<keep-alive`> 组件实例 `$forceUpdate` 逻辑，也就是重新执行 `<keep-alive>` 的 render 方法；
3. 这时组件如果命中keep-alive的缓存，那就直接返回缓存的组件实例；
4. 之后组件就不会走跟首次渲染一样创建组件实例的逻辑，也不会执行组件的 `created、mounted` 等钩子函数了，而是直接将缓存的 DOM 对象直接插入到目标元素中；
5. 在渲染的最后一步，会有一个处理：如果是被 `<keep-alive>` 包裹的组件已经渲染完毕, 则给所有组件加上`activated`的生命周期；同时在`destroy`钩子函数中加上`deactivated`生命周期。


keep-alive 的中还运用了 `LRU(最近最少使用) 算法`，选择最近最久未使用的组件予以淘汰
> LRU 的核心思想是如果数据最近被访问过，那么将来被访问的几率也更高，所以我们将命中缓存的组件 key 重新插入到 `缓存队列` 的尾部，这样一来，缓存组件队列 中越往头部的数据即将来被访问几率越低，所以当缓存数量达到最大值时，我们就删除将来被访问几率最低的数据，即 缓存队列 中第一个缓存的组件。


- **LRU 缓存淘汰策略**

> 浏览器中的缓存是一种在本地保存资源副本，它的大小是有限的，当我们请求数过多时，缓存空间会被用满，此时，继续进行网络请求就需要确定缓存中哪些数据被保留，哪些数据被移除，这就是浏览器缓存淘汰策略，最常见的淘汰策略有 `FIFO（先进先出）、LFU（最少使用）、LRU（最近最少使用）`。


**LRU （ Least Recently Used ：最近最少使用 ）缓存淘汰策略**，故名思义，就是根据数据的历史访问记录来进行淘汰数据，其核心思想是 `如果数据最近被访问过，那么将来被访问的几率也更高 ，优先淘汰最近没有被访问到的数据`。


**keep-alive 中LRU的实现：**
1. 如果命中缓存，则从缓存中获取 vnode 的组件实例，并且调整 key 的顺序放入 keys 数组的末尾
2. 如果没有命中缓存,就把 vnode 放进缓存；如果配置了 max 并且缓存的长度超过了 this.max，还要从缓存中删除第一个









### vue生命周期

加载渲染：父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted


子组件更新：父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated

销毁过程：父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed

可以在钩子函数 created、beforeMount、mounted 中进行异步请求



优先级：组件 > mixin > extend



### 组件data为什么是一个函数？

为了确保每个实例可以维护一个独立的、互不干扰的数据副本； `隔离作用域`。


当 Vue 实例化一个组件时，它会调用 data 函数来初始化该实例的数据对象。如果 data 是一个对象，那么所有的实例将会共享同一个数据对象，这意味着对任何一个实例的数据修改都会影响到其他所有实例。

当 data 被定义为一个函数时，每次创建组件的新实例时，Vue 都会调用这个函数来初始化数据。由于`函数调用会创建一个新的执行上下文，并返回一个新的对象，因此每个实例都会得到一个独立的数据副本`。这样，修改一个实例的数据就不会影响到其他实例。



### vm.$set 的实现原理

1. 如果目标是数组，直接使用数组的 splice 方法触发响应式；
2. 如果目标是对象，会先判读属性是否存在、对象是否是响应式，最终如果要对属性进行响应式处理，则是通过调用 `defineReactive` 方法进行响应式处理
> defineReactive 方法就是  Vue 在初始化对象时，给对象属性采用 Object.defineProperty 动态添加 getter 和 setter 的功能所调用的方法



### provide/inject实现原理？


``` js
///// vue2使用：
// 父组件
provide() {
    return elRoot: {name: 'test'}
}

// 子组件
inject: ['elRoot']


///// vue3使用：
// 父组件
import { ref, provide } from 'vue'
const count = ref(0)
provide('key', count)

// 子组件
import { inject } from 'vue'
const message = inject('key')
```

依赖注入`provide/inject`的优缺点如下：
- 优点：
1. 祖先组件不需要知道哪些后代组件使用它提供的数据；
2. 后代组件不需要知道被注入的数据来自哪里；
- 缺点：
1. 组件间的耦合较为紧密，不易重构；
2. vue2中提供的属性是非响应式的；


**实现原理：**
1. 在vue初始化的时候，在初始化data/props之前，会执行`initInjections(vm)`方法, 这样做的目的是让用户可以在data/props中使用inject所注入的内容；
2. `initInjections`方法首先根据注册的inject，通过$parent向上查找对应的provide;
3. 然后`通过$parent一层一层向上查找祖先节点的provide，找到则对inject进行赋值`；
4. 在初始化data/props之后，会执行`initProvide(vm)`, 该方法单纯把组件注册的provide值，赋值给`vm._provided`，initInjections中有使用到。

https://github.com/webharry/blog/issues/2



### vue mixins有什么缺点?

1. 命名冲突：如果不小心，混入的属性或方法可能会`与组件本身的属性或方法产生命名冲突`，导致意外行为或错误。

2. 隐式依赖：使用混入时，组件的行为可能依赖于未在组件定义中明确列出的混入。这`使得组件的行为更难以理解和跟踪`。

3. 多重继承：如果`多个混入对象具有相同名称的属性或方法`，Vue将无法正确确定哪个混入对象应该拥有优先级。

4. `耦合度增加`：混入增加了组件与混入对象之间的耦合度，导致代码更难以维护和理解。

5. `不利于代码追踪和调试`：当组件使用了多个混入时，如果出现了问题，追踪和调试起来可能会变得更加困难，因为组件的行为分散在多个混入对象中。





### new Vue()执行了哪些流程?


``` js
// Vue.prototype._init源码：

vm._self = vm
initLifecycle(vm)
initEvents(vm)
initRender(vm)
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created')
```

1. `初始化Vue实例`： 创建一个新的 Vue 实例对象，并执行 Vue 构造函数。

2. `合并配置`： 将用户传入的配置选项与默认配置选项进行合并，生成最终的配置对象。通常配置选项包括 data、methods、computed、watch、props、components、created、mounted 等。

3. `初始化生命周期钩子`： 在合并配置完成后，Vue 将初始化实例的生命周期钩子，如 beforeCreate、created、beforeMount、mounted 等。

4. `初始化事件系统`： Vue 实例化过程会初始化事件系统，即为实例绑定事件监听器，以便在实例的生命周期中触发对应的事件。

5. `初始化数据响应式`： Vue 会对配置中的 data 属性进行响应式处理，`通过 Object.defineProperty 或 Proxy 等机制实现对数据的监听`，并为数据添加 getter 和 setter。

6. `初始化依赖注入`： Vue 实例化过程会初始化依赖注入系统，以便在组件中进行依赖注入。

7. `初始化组件`： 如果配置选项中包含 components，Vue 将初始化组件，即注册组件，使其在模板中可以使用。

8. `编译模板`： 如果配置选项中包含 template，Vue 将对模板进行编译，生成渲染函数。

9. `挂载实例`： 将实例挂载到 DOM 上，即执行 vm.$mount() 方法，将 Vue 实例与页面中的 DOM 元素进行关联。

10. `触发生命周期钩子`： 在实例挂载完成后，Vue 将依次触发 beforeMount 和 mounted 生命周期钩子。

11. `完成实例化`： 当上述步骤全部完成后，Vue 实例化过程就完成了，此时可以通过实例对象访问数据、方法、计算属性等，并可以响应用户的操作和事件。





### vue组件中style标签设置scoped的作用是什么，原理是什么

在Vue组件中，当你使用 scoped 属性添加到 `<style>` 标签时，它的作用是`限制该样式仅在当前组件内生效`，而不会影响到其他组件或全局样式。这种方式被称为 "Scoped CSS"。


原理是通过 Vue 编译器`在编译过程中`，将 scoped 属性添加到样式标签后，`会自动为该组件的每个样式规则（包括选择器）生成一个唯一的属性`，用于标识当前组件内的元素; 然后将该属性添加到相应的 HTML 元素上。这样一来，该样式规则就只会应用于带有相应唯一属性的元素，从而实现了`样式的局部作用域`。



### vue的template中为什么不用this也能引用data中的变量？

在 Vue 的模板中，你不需要使用 this 来引用 data 中的变量，这是`因为 Vue 的模板语法已经被设计为可以自动地访问组件实例的数据`。当你在模板中使用一个变量时，Vue 会自动地在组件的 data 对象中查找这个变量。


### vue子组件在哪一个生命周期可以获取props？

`created`: 实例创建完成后调用，此时可以访问到 props、methods、computed 和 data 等属性。
> 但$el 属性还没有显示出来，$refs 属性也没有被填充。



### watchEffect执行机制

watchEffect 的回调函数会在所有依赖变化后执行一次。

watchEffect 的回调函数在 Vue 的渲染过程中是`在组件的 beforeMount 和 mounted 生命周期钩子之间`执行的，具体地说，是在组件的 DOM 被挂载之前执行。

watchEffect 是`在组件实例被创建后，但在 DOM 挂载之前`立即执行的。这意味着在 watchEffect 的回调函数中，你可以安全地访问组件的响应式数据，但此时组件的 DOM 可能还没有被创建。如果你需要在 DOM 挂载后执行某些操作，你应该在 mounted 或 onMounted 钩子中执行这些操作。




### 做过哪些Vue的性能优化?

1. `编码阶段`:
    - 如果需要使用v-for给每项元素绑定事件时使用事件代理；
    - SPA 页面采用keep-alive缓存组件；
    - v-if/v-show；
    - key保证唯一；
    - 使用路由懒加载、异步组件；
    - 防抖、节流；
    - 第三方模块按需导入；
    - 长列表优化：虚拟滚动，分页，瀑布流布局；
    - 图片懒加载；

2. `用户体验`：骨架屏；PWA；缓存(客户端缓存、服务端缓存)优化、服务端开启gzip压缩等。
> PWA，全称Progressive Web App，即`渐进式web应用`。它使用多种技术来增强web app的功能，让网站的体验变得更好，`能够模拟一些原生功能`，比如通知推送。PWA具有快速加载、离线访问、推送通知等特性，能够提升用户体验并节省企业成本。

3. `SEO优化`: 预渲染；服务端渲染SSR；

4. `打包优化`: 压缩代码；Tree Shaking/Scope Hoisting；使用cdn加载第三方模块；多线程打包happypack；splitChunks抽离公共文件；sourceMap优化；










## Webpack部分


### webpack devServer 热更新（HMR）原理？

动态模块热加载, Hot Module Replacement，简称HMR，无需完全刷新整个页面的同时，更新模块。


1. 启动一个本地http服务，让浏览器可以请求本地静态资源；再去启动 websocket 服务，通过 websocket，可以建立本地服务和浏览器的双向通信。这样就可以实现当本地文件发生变化，立马告知浏览器可以热更新代码。

2. 之后每次修改代码，就会触发编译；这是通过 webpack-dev-middleware 实现的：编译结束后，开启对本地文件的监听，当文件发生变化，重新编译，编译完成之后继续监听。
> 监听本地文件的变化主要是通过文件的生成时间是否有变化, 从而实现代码的改动保存会自动编译，重新打包。

3. 每次编译都会生成`hash值、已改动模块的json文件、已改动模块代码的js文件`, 编译完成后通过socket向客户端推送`当前编译的hash戳`；
> 将编译后的文件打包到内存：开发的过程中，你会发现dist目录没有打包后的代码，因为都在内存中。原因就在于访问内存中的代码比访问文件系统中的文件更快，而且也减少了代码写入文件的开销。

4. 客户端的websocket监听到有文件改动推送过来的hash戳，会和上一次对比：一致则走缓存，不一致则通过向服务端获取最新资源；使用内存文件系统去替换有修改的内容实现局部刷新.





### postcss-loader 与 less/scss的区别？

postcss 一种对css编译的工具，类似babel对js的处理。常见功能有：`自动补全浏览器前缀、使用下一代css语法`等等

less sass 是预处理器，用来支持扩充css语法；

postcss 既不是 预处理器也不是 后处理器, 它鼓励开发者使用规范的CSS原生语法编写源代码，支持未来的css语法，就像babel支持ES6。

postcss功能：把 CSS 解析成 JavaScript AST；然后调用插件来处理 AST 并得到结果，如`autoprefixer`自动补齐css3前缀~

> autoprefixer是css的后置处理器(打包之后进行处理)，sass、less是css的预处理器(在打包之前进行处理)。


### module、chunk、bundle

module：对于一份同逻辑的代码，当我们手写下一个一个的文件，它们无论是 ESM 还是 commonJS 或是 AMD，他们都是 module ；

chunk：当我们写的 module 源文件传到 webpack 进行打包时，webpack 会根据文件引用关系生成 chunk 文件，webpack 会对这个 chunk 文件进行一些操作；表示的是`文件依赖关系`

bundle：webpack 处理好 chunk 文件后，最后会输出 bundle 文件，这个 bundle 文件包含了经过加载和编译的最终源文件，所以它可以直接在浏览器中运行。

> 我们直接写出来的是 module，webpack 处理时是 chunk，最后生成浏览器可以直接运行的 bundle。


### hash、chunkhash、contenthash

hash：hash 是跟整个 webpack 构建项目相关的，每次项目构建 hash 对应的值都是不同的，即使项目文件没有做“任何修改”；

chunkhash：跟 webpack 打包的 chunk 相关，具体来说webpack是根据入口 entry 配置文件来分析其依赖项并由此来构建该 entry 的 chunk，并生成对应的 hash 值；不同的 chunk 会有不同的 hash 值。

contenthash：表示由文件内容产生的hash值，内容不同产生的contenthash值也不一样。在项目中，通常做法是把项目中css都抽离出对应的css文件来加以引用。所以css文件最好使用contenthash。


### treeing shaking(摇树优化)

1个模块可能有多个方法，只要其中的某个方法使用到了，则整个文件都会被打到bundle里面去，tree shaking就是只把用到的方法打到bundle，没用到的方法会在uglify阶段被擦除掉。



`必须是es6的语法`; 通过静态分析，将没用的代码注释标记，在编译阶段删除无用代码
> esm 要求所有的导入导出语句只能出现在模块顶层，且导入导出的模块名必须为字符串常量; 所以，ESM 下模块之间的依赖关系是高度确定的，与运行状态无关，编译工具只需要对 ESM 模块做`静态分析`，就可以从代码字面量中推断出哪些模块值未曾被其它模块使用，这是实现 Tree Shaking 技术的必要条件。


DCE(dead code elimination)死码消除: 编译过程中，移除对程序运行结果没有任何影响的代码。

1. 收集模块导出变量；模块导出信息收集完毕后，Webpack 需要标记出各个模块的导出列表中哪些导出值有被其它模块用到，哪些没有;
2. 经过前面的收集与标记步骤后，Webpack 已经记录了每个模块都导出了哪些值，每个导出值又没被哪些模块所使用；
3. 最终模块导出列表中未被使用的值都不会定义在webpack的导出对象中，形成一段不可能被执行的 `Dead Code`；
4. 在此之后，将由 `Terser、UglifyJS` 等 DCE 工具“摇”掉这部分无效代码，构成完整的 Tree Shaking 操作。
> 标记功能只会影响到模块的导出语句，真正执行“Shaking”操作的是 Terser 插件。



- Scope Hoisting: 通过scope hoisting可以减少函数声明代码和内存开销。
> 分析出模块之间的依赖关系，尽可能的把打散的模块合并到一个函数中去，但前提是不能造成代码冗余。



### webpack5 vs webpack4

1. Webpack5 提供了内置的静态资源构建能力，我们不需要安装额外的 loader（url-loader，file-loader，raw-loader）
2. webpack5 中内置了 Cache 来实现启动缓存，实现了二次构建的提速, v4 需要引入插件hard-source-webpack-plugin
3. js压缩：webpack v5 开箱即带有最新版本的 terser-webpack-plugin。如果希望自定义配置，那么仍需要安装 terser-webpack-plugin。v4 则必须安装 terser-webpack-plugin v4 的版本
4. 启动服务差别：v4 通过 webpack-dev-server 启动服务，v5 内置使用 webpack serve 启动
5. tree-shaking的优化：v5 能够处理对嵌套模块的 tree shaking，也能处理对 Commonjs 的 tree shaking




### eslint, prettier, stylelint

ESLint 是JavaScript 的代码检验工具, 用于查找并修复 JS 代码中的问题，并且支持部分问题自动修复。其核心是通过对代码解析得到的 AST 进行模式匹配，来分析代码达到检查代码质量和风格问题的能力。

Prettier 代码格式化工具，聚焦于代码的格式化，通过语法分析，重新整理代码的格式，让所有人的代码都保持同样的风格; 能对 html, css, js 文件进行格式化
> 原理是将代码生成AST语法树，之后是处理AST，最后生成代码。

StyleLint 是『一个强大的、现代化的 CSS 检测工具』, 与 ESLint 类似, 是通过定义一系列的编码风格规则帮助我们避免在样式表中出现错误。



### webpack vs vite

1. webpack 的本质就是`先打包，再加载`；Vite 在开发环境下，`模块以原生 esm 的形式被浏览器加载, 生产环境下，模块被 Rollup 以传统方式打包`。
2. Webpack 会先打包，然后启动开发服务器，请求服务器时直接给予打包结果；而 Vite 是直接启动开发服务器，`请求哪个模块再对该模块进行实时编译`; vite在启动时不需要分析模块的依赖、不需要编译, 因此启动速度非常快.
3. webpack 因为只针对打包不预设场景，所以设计得极其灵活，不局限于针对 web 打包，几乎所有可配置的环节都做成了可配置的, 缺点就是配置项极度复杂; Vite 的选择是`缩窄预设场景来降低复杂度`。如果预设了 web 的场景，那么大部分常见的 web 构建需求都可以直接做成默认内置
4. Vite 支持开箱即用的引入 .ts 文件，.jsx 与 .tsx 也是开箱即用，也为 Vue 提供第一优先级的支持; 而webpack则需要引入各种loader将文件编译为.js文件。
4. 从打包成品来看：webpack是包了一大堆iife闭包， Vite用 Rollup 打包，rollup则简洁得多


### vite快的原因?

1. 减少了开发服务器启动时间：
    - webpack 需要对所有运行资源进行`提前编译处理，对依赖模块进行了语法分析转义`，最终将模块被打包到内存中；
    - Vite 在第一次加载的时候会使用 esbuild 预构建依赖, 预构建可以提高页面加载速度：`通过依赖预构建，Vite 将有许多内部模块的 ESM 依赖关系转换为单个模块，以提高后续页面加载性能。` 
    - Vite 以原生 ESM 方式提供源码，在浏览器请求对应URL时，再提供文件，实施了真正的路由懒加载，这个比起Webpack就要节省了不少时间。
2. Vite减少了热更新时间:
    - webpack虽然支持动态模块热重载（HMR），即允许一个模块 “热替换” 它自己，而不会影响页面其余部分，但实践证明，其`热更新速度也会随着应用规模的增长而显著下降`。
    - 在 Vite 中，HMR 是在原生 ESM 上执行的。当`改动了一个模块后，仅需让浏览器重新请求该模块即可，不像webpack那样需要把该模块的相关依赖模块全部编译一次，效率更高`。
3. Vite 同时利用 HTTP 头来加速整个页面的重新加载：源码模块的请求会根据 304 进行协商缓存，而依赖模块请求则会进行强缓存，因此一旦被缓存它们将不需要再次请求。 




### webpack原理？

1. 初始化：读取传入的脚本命令参数；传入配置参数，通过调用webpack提供的编译方法，创建编译对象；开始注册传入的webpack插件, 之后开始进行打包；

Webpack 中的插件机制就是基于 `Tapable` 实现与打包流程解耦，插件的所有形式都是基于 `Tapable` 实现。

tapable提供了各种各样的hook来帮我们管理事件是如何执行; 比如我注册了三个事件，我可以希望他们是并发的，或者是同步依次执行，又或者其中一个出错后，后面的事件就不执行了，这些功能都可以通过 tapable 的 hook 实现。

整个过程中webpack会通过发布订阅模式，向外抛出一些hooks，而webpack的插件即可通过监听这些关键的事件节点，执行插件任务进而达到干预输出结果的目的。


2. 模板编译阶段：从入口文件（entry）开始解析，并且找到其导入的依赖模块，递归遍历分析，形成依赖关系树；

对不同文件类型的依赖模块文件使用对应的Loader进行编译，最终转为Javascript文件；

每个模块间的依赖关系，依赖于AST语法树。每个模块文件在通过Loader解析完成之后，会通过acorn库生成模块代码的AST语法树，通过语法树就可以分析这个模块是否还有依赖的模块，进而继续循环执行下一个模块的编译解析。


3. 输出文件阶段: 整理模块依赖关系，同时将处理后的文件输出到ouput的目录中; 最终Webpack打包出来的bundle文件是一个IIFE的执行函数。



::: tip **具体来说，Webpack 会做以下几件事情：**
1. `解析模块`：Webpack 会解析项目的所有模块，包括 JavaScript 文件、CSS 文件、图片等，将它们转换为模块。
2. `构建依赖图`：Webpack 会根据模块的导入和导出关系，构建一个依赖图，确保所有依赖关系都被正确解析。
3. `转换和优化`：根据配置，Webpack 会对模块进行各种转换和优化操作，如 Babel 转译、压缩、代码分割等。
4. `打包输出`：最后，Webpack 会将处理后的模块打包成一个或多个 bundle，输出到指定的目录。
:::



### webpack Loader

Webpack中的Loader本质上就是一个函数，这个函数会在我们加载一些文件时执行, 比如常见的file-loader、vue-loader、babel-loader等，专门用于打包时解析各种类型的文件。

实现箭头函数转普通函数：
1. 分析AST结构: 变成普通函数之后就不叫箭头函数ArrowFunctionExpression，而是函数表达式FunctionExpression
2. 修改AST结构，生成新的语法树；（@babel/types 集成了一些快速生成、修改、删除 AST Node的方法）
3. 跟其他loader一样在配置中引入，运行，bundle.js中就会看到箭头函数转成普通函数了


### webpack plugins

plugin通常是在webpack在打包的某个时间节点做一些操作，我们使用plugin的时候，一般都是new Plugin()这种形式使用，所以，首先应该明确的是，plugin应该是一个类。


plugin的核心在于，可以操作webpack本次打包的各个时间节点（hooks，也就是生命周期勾子），在不同的时间节点做一些操作。





### AST原理

`抽象语法树（Abstract Syntax Tree，AST）`，或简称语法树（Syntax tree），是源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。webpack、eslint 等很多工具库的核心都是通过抽象语法书这个概念来实现对代码的检查、分析等操作。

1. 词法分析：读取我们的代码，然后把它们按照预定的规则合并成一个个的标记（tokens），整个代码将被分割进一个tokens列表；（类似英语中将句子拆成单词）

2. 语法分析：它会将词法分析出来的列表转化成树形的表达形式。同时，验证语法，语法如果有错的话，抛出语法错误；即生成AST语法树；

3. 代码生成：将 AST 转换成一系列可执行的机器指令代码：遍历初始的 AST，对其结构进行改造，再将改造后的结构生成对应的代码字符串。


AST使用场景：
1. 语法检查、代码风格检查、格式化代码、语法高亮、错误提示、自动补全：ESlint、Prettier、Vetur等; 
2. 代码混淆压缩：uglifyJS等。
3. 代码转译：webpack、babel、TypeScript等。



### babel原理

1. 解析 (Parsing)：这个过程由编译器实现，会经过词法分析过程和语法分析过程，从而生成 AST。
2. 读取/遍历 (Traverse)：深度优先遍历 AST ，访问树上各个节点的信息（Node）。
3. 修改/转换 (Transform)：在遍历的过程中可对节点信息进行修改，生成新的 AST。
4. 输出 (Printing)：对初始 AST 进行转换后，根据不同的场景，既可以直接输出新的 AST，也可以转译成新的代码块。



### SouceMap

sourceMap是一项将编译、打包、压缩后的代码映射回源代码的技术，里面`储存着源码的位置信息`。

映射文件以`.map`结尾，这个文件里保存的是转换后代码的位置，和对应的转换前的位置。

devtool:
1. source-map // 单独生成.map文件 可定位到源代码
2. eval-source-map：内联。每一个文件都生成对应的 Source Map，都在 eval 中，可以查看错误代码准确信息 和 源代码的错误位置。
3. cheap-source-map // 只能定义行的信息，定位不到列的信息




### package.json vs package.lock.json

package.json 用来描述项目及项目所依赖的模块信息。

package-lock.json： 锁定node包版本号，对整个依赖树进行版本固定的；为了解决这个不同人电脑安装的所有依赖版本都是一致的，确保项目代码在安装所执行的运行结果都一样



版本号由三部分组成：`major.minor.patch，主版本号.次版本号.修补版本号（补丁）`。
1. `补丁`中的更改表示不会破坏任何内容的错误修复。
2. `次要版本`的更改表示不会破坏任何内容的新功能。
3. `主要版本`的更改代表了一个破坏兼容性的大变化。 如果用户不适应主要版本更改，则内容将无法正常工作。


`~` 锁定次要版本：会匹配最近的小版本依赖包，比如 ~1.2.3 会匹配所有 1.2.x 版本，但是不包括 1.3.0

`^` 只是锁定主要版本：会匹配最新的大版本依赖包，比如 ^1.2.3 会匹配所有 1.x.x 的包，包括 1.3.0，但是不包括 2.0.0

`*` 安装最新版本的依赖包，比如 *1.2.3 会匹配 x.x.x，



### npm run serve 执行流程？

``` js
"scripts": {
  "start": "node index.js",
  "serve": "vue-cli-service serve",
  // 其他命令...
```
运行 `npm run serve` 实际上是在执行 `vue-cli-service serve` 命令。

1. `查找命令`：npm 首先在当前项目目录的 `node_modules/.bin` 目录下查找是否存在 vue-cli-service 可执行文件。
2. `查找全局安装`：如果在项目的 node_modules/.bin 中没有找到 vue-cli-service，npm 会继续在`全局 node_modules/.bin 目录下`查找 `<script>` 对应的可执行文件。
3. `执行命令`：找到 vue-cli-service 后，npm 将执行该命令，相当于执行了 `./node_modules/.bin/vue-cli-service serve`



### webpack项目中动态引入图片为什么要是require？

> 当我们静态地引入一个图片时，Webpack 可以直接处理这个图片资源，并将其包含在最终的 bundle 中。但是，如果我们尝试动态地引入图片（例如，根据某个变量的值来引入不同的图片），那么 Webpack 就无法提前知道需要包含哪些图片资源。

为了解决这个问题，我们可以使用 require 语法来动态地引入图片。当使用 require来引入图片时，`Webpack 会根据 require 的参数来解析并打包相应的图片资源。`

使用 require 动态引入图片时，`Webpack 会为每个动态引入的图片创建一个单独的模块，这可能会导致打包后的文件体积增大`。因此，在实际应用中，我们应该尽量避免过度使用动态引入图片的方式，而是尽可能地使用静态引入或按需加载的方式来优化性能。





## 前端监控


`数据监控`：pv, uv, 用户在每一个页面的停留时间, 用户通过什么入口来访问该网页, 用户在相应的页面中触发的行为,...

pv: page view, 页面浏览量或点击量

uv: user view, 访问某个站点或点击某条新闻的不同 IP 地址的人数

`性能监控`：首屏加载时间，白屏时间，http请求响应时间，静态资源下载时间，页面渲染时间，页面交互动画完成时间 。。。


`异常错误监控`：javascript 的异常监控，样式丢失的异常监控，静态资源加载异常，Promise异常，接口异常，跨域异常 。。。


vue 项目在 `Vue.config.errorHandler` 中上报错误，react 项目在 `ErrorBoundary` 中上报错误


`前端监控的搭建流程`分以下几个阶段：
1. 采集阶段：数据的采集, 开发者可以通过 window.performance 属性获取。
    - 页面性能情况：
        - FP（白屏）First-Paint 首次渲染：表示浏览器从开始请求网站到屏幕渲染第一个像素点的时间。`<= 2s`
        - FCP（灰屏） First-Contentful-Paint 首次内容渲染：表示浏览器渲染出第一个内容的时间，这个内容可以是文本、图片或SVG元素等等，不包括iframe和白色背景的canvas元素。`<= 2s`
        - FMP: 首次有效绘制；页面渲染过中 元素增量最大的点，因为元素增量最大的时候，页面主要内容也就一般都渲染完成了；
        - LCP: 最大内容绘制：LCP 是页面内首次开始加载的时间点，到可视区域内最大的图像或者文本块完成渲染的相对时间. `<= 2.5s`
        - `首次输入延迟（FID）`: FID 是`从用户第一次与页面交互直到浏览器对交互作出响应`，并实际能够开始处理事件处理程序所经过的时间。`<= 100ms`
    - 异常数据收集：`try/catch, window.onerror, window.addEventListener('error'), unhandledrejection`
        - 前端异常：js报错、promise异常、静态资源加载异常...
        - 接口异常：未响应/响应超时，4xx请求异常, 5xx服务器异常
    - 环境信息：业务信息，设备信息，网络信息，SDK信息。
    - 行为数据：用户行为（pv,uv,点击事件,埋点...）、浏览器行为、控制台打印行为。

2. 数据上报：搭建 API 应用，接收采集到的数据: `sourcemap，第三方sdk, 1*1gif`
    - 图片打点上报`1*1gif优点`：可以进行跨域，不会携带cookie；只需要发送数据；不会阻塞页面加载；可以节约网络资源
    - fetch 请求上报

3. 数据存储：API 应用对接数据库，将采集到的数据存起来: `MongoDB`
    - 数据清洗：削峰处理，预处理，分类，聚合

4. 查询统计：对采集到的数据进行查询，统计，分析：
5. 可视化：前端通过 API 查询统计数据，做可视化展示
6. 报警：API 对接报警通知服务，如钉钉
7. 部署：应用整体部署上线


- **前端容灾**

前端容灾指的因为各种原因后端接口挂了(比如服务器断电断网等等)，前端依然能保证页面信息能完整展示。比如 banner 或者列表之类的等等数据是从接口获取的，要是接口获取不到了，怎么办呢？

1. LocalStorage：在接口正常返回的时候把数据都存到 LocalStorage
2. CDN：每次更新都要备份一份静态数据放到CDN；在接口请求失败的时候，并且 LocalStorage 也没有数据的情况下，就去 CDN 摘取备份的静态数据。
3. Service Worker：假如不只是接口数据，整个 html 都想存起来，就可以使用 Service Worker 做离线存储；利用 Service Worker 的请求拦截，不管是存接口数据，还是存页面静态资源文件都可以。


### 前端埋点

1. `代码埋点（也称为手动埋点或侵入式埋点）`：这是由开发人员手动在代码内植入预埋点的方式。开发人员需要确定埋点的位置、时间和触发机制。代码埋点有两种常见类型：命令式和声明式。命令式埋点通常在一些事件操作的回调函数中进行，如点击事件的回调函数、页面的生命周期、ajax回调等。而声明式埋点则是将埋点信息封装在自定义属性中，通过SDK识别自定义属性然后获取埋点数据。

2. `可视化埋点`：这种埋点方式`以业务代码为输入，通过可视化系统配置埋点，最后以耦合的形式输出业务代码和埋点代码`。这种方式可以简化埋点过程，提高开发效率。

3. `无痕埋点（也称为无差别埋点或全埋点）`：这种埋点方式无差别地对全局所有事件和页面加载生命周期等进行拦截全埋点。无痕埋点可以收集到更全面的用户行为数据，但可能会收集到一些不必要的信息, 需要后端进行数据清洗



### 比较下监控、日志与灰度


- **监控**：前端监控主要涉及`页面性能、异常捕获、用户行为`等多个方面。
> 监控工具通常可以自动收集和分析数据，提供可视化的报表和告警机制，帮助开发者快速定位问题并采取相应的解决措施。通过监控，前端开发者可以更好地了解用户需求，优化用户体验，提升应用的性能和稳定性。


- **日志**：前端日志主要用于记录应用运行过程中的关键信息和事件，包括`页面加载、用户操作、网络请求`等。
> 日志记录可以帮助开发者追踪和调试代码中的错误，分析性能瓶颈，优化代码结构。此外，日志还可以用于监控用户行为，分析用户习惯和需求，为产品迭代和优化提供数据支持。

- **灰度**：灰度发布是一种介于黑与白之间的发布方式，主要`用于新功能的逐步上线和验证`。对于前端开发者来说，灰度发布可以帮助他们在新功能上线前进行充分的测试和优化，确保新功能的稳定性和用户体验。
> 通过灰度发布，前端开发者可以将新功能逐步推送给一部分用户，观察用户反馈和异常情况，以便及时调整和优化。这种方式可以降低新功能上线带来的风险，确保应用的稳定性和可靠性。


### 首屏统计的数据是怎么统计的？

可以通过  `window.performance.timing`  来获取加载过程模型中各个阶段的耗时数据
> `navigationStart, domContentLoadedEventStart, loadEventStart`

新api: 通过 `PerformanceObserver` 来获取

chrome推出的 web-vitals 库


`首屏加载时间`: 首屏加载时间和首页加载时间不一样，首屏指的是屏幕内的 dom 渲染完成的时间
> 比如首页很长需要好几屏展示，这种情况下屏幕以外的元素不考虑在内

计算`首屏加载时间`流程：
1. 利用`MutationObserver`监听document对象，每当 dom 变化时触发该事件
2. 判断监听的 dom 是否在首屏内，如果在首屏内，将该 dom 放到指定的数组中，记录下当前 dom 变化的时间点
3. 在 MutationObserver 的 callback 函数中，通过防抖函数，监听document.readyState状态的变化
4. 当`document.readyState === 'complete'`，停止定时器和 取消对 document 的监听
5. 遍历存放 dom 的数组，找出最后变化节点的时间，用该时间点减去`performance.timing.navigationStart` 得出首屏的加载时间




**上报时机**：可以利用`requestIdleCallback`，浏览器空闲的时候上报，好处是：不阻塞其他流程的进行；如果浏览器不支持该requestIdleCallback，就使用`setTimeout`上报
> requestIdleCallback 是一个浏览器提供的 API，它允许开发者在浏览器的空闲时段执行低优先级的任务，从而避免阻塞用户界面的渲染和其他高优先级任务。



**三种错误还原方式**
- 定位源码：sourcemap
- 播放录屏：rrweb库支持，保存报错前 10s 的视频
- 记录用户行为: 用户行为列表记录了`鼠标点击、接口调用、资源加载、页面路由变化、代码报错`等信息



### 怎么对页面中所有图片的报错进行监控?

window.addEventListener: 当一项资源（如图片或脚本）加载失败，加载资源的元素会触发一个 Event 接口的 error 事件，这些 error 事件不会向上冒泡到 window，但能被捕获。而window.onerror不能监测捕获。

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
```







## CI/CD


**CI（continuous integration）** 的意思是 `持续构建` ,也被称为持续集成：在源代码变更后`自动检测、拉取、构建`的过程。

**CD**，持续部署（Continuous Deployment） 和 持续交付（Continuous Delivery）。持续交付的概念是：`将制品库的制品拿出后，部署在测试环境 / 交付给客户提前测试`。持续部署则是`将制品部署在生产环境`。


写一个自己的网站放到服务器上：`编写代码 -> （单元测试/集成测试） -> 上传至代码仓库 -> 打包构建 -> 上传至服务器 -> 配置 Nginx/Apache 将 80 端口映射至网站文件夹`
> 有了 `CI/CD` 的系统之后，我们就只需要编写代码，剩下的步骤都交给 CI/CD 系统来处理，这极大地解放了我们的双手，提升了开发效率。



### Docker

是一个开源的应用容器引擎。`开发者可以将自己的应用打包在自己的镜像里面`，然后迁移到其他平台的 Docker 中。镜像中可以存放你自己自定义的运行环境，文件，代码，设置等等内容，再也不用担心环境造成的运行问题。镜像共享运行机器的系统内核。

Docker 的优势在于 快速，轻量，灵活。开发者可以制作一个自己自定义的镜像，也可以使用官方或者其他开发者的镜像来启动一个服务。通过将镜像创建为容器，容器之间相互隔离资源和进程不冲突，但硬件资源又是共享的。

`镜像`是一个可执行包，其包含运行应用程序所需的代码、运行时、库、环境变量和配置文件，`容器`是镜像的运行时实例。镜像是一个静态的概念，不包含任何动态数据，其内容在构建之后也不会被改变。

我们可以使用 Docker 将应用打包成一个镜像，交给 Kubernetes 去部署在目标服务集群。并且可以将镜像上传到自己的镜像仓库，做好版本分类处理。


**Dockerfile** 文件是一个文本文件，用来配置 image; 使用 `Dockerfile` 文件可以让构建镜像更具备可重复性，同时保证启动脚本和运行程序的标准化。

**docker-compose** 是用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 `YML` 文件来配置应用程序需要的所有服务。



### Jenkins

是一个持续构建工具平台，主要`用于持续、自动的构建/测试你的软件和项目`。它可以执行你预先设定好的设置和构建脚本，也可以和 Git 代码库做集成，实现`自动触发和定时触发构建`。



### Docker vs Jenkins

1. Jenkins 时刻替我们监控 git 仓库，当我们提交了新代码，需要让新代码发生作用，我们只需要在 Jenkins 上点击构建，它就会主动去 git 仓库拉取对应分支最新的代码，然后进行build打包，把打包好的文件放置到 nginx 的指定目录去，这样我们就能在浏览器看到最新的效果；

2. docker 可以为每个服务提供一个容器(container)，容器包含服务所需的所有条件，服务运行其中，不同容器之间互不干扰。另外，docker 是根据镜像来创建容器的。

它们二者可以分开使用，也可以合作起到更好的效果。jenkins 是构建服务并将服务推送到指定位置去的，这个服务本身也可以是个 docker 镜像。
> 可以在 Dock Hub 中搜索jenkins镜像，服务器上安装jenkins服务也可以通过docker镜像安装。



### Kubernetes

看作是用来是一个部署镜像的平台。可以用来操作多台机器调度部署镜像，大大地降低了运维成本。
> 如果你将 docker 看作是飞机，那么 kubernetes 就是飞机场。在飞机场的加持下，飞机可以根据机场调度选择在合适的时间降落或起飞。


**灰度发布**是一种发布方式，也叫 `金丝雀发布`：会在现存旧应用的基础上，启动一个新版应用。但是新版应用并不会直接让用户访问。而是先让测试同学去进行测试。如果没有问题，则可以将真正的用户流量慢慢导入到新版上。在这中间，持续对新版本运行状态做观察，直到慢慢切换过去，这就是所谓的`A/B测试`。 当然，你也可以招募一些 `灰度用户`， 给他们设置独有的灰度标示（Cookie，Header），来让他们可以访问到新版应用。



### GitHub Actions

是一种持续集成和持续交付 (CI/CD) 平台，可用于自动执行生成、测试和部署管道。 您可以创建工作流程来构建和测试存储库的每个拉取请求，或将合并的拉取请求部署到生产环境。

正常需求的开发流程为：`需求 => 开发 => 构建 => 测试 => 预发 => 部署`

Github Actions 是GitHub的持续集成服务。持续集成由很多操作组成，比如登录远程服务器，发布内容到第三方服务等等，这些相同的操作完全可以提取出来制作成脚本供所有人使用。



## Serverless

又叫无服务器，是一种计算模型，这种模型使开发人员能够构建和运行应用程序而无需管理底层的服务器基础设施。 

在传统的服务器模型中，开发人员需要自行购买、配置和管理服务器来运行应用程序。 而在 Serverless 模型中，开发人员只需关注应用程序的代码逻辑，而不需要担心服务器的管理。



## 微前端

微前端是一种设计架构，并不是技术。是借鉴于微服务思想的设计架构，是一种为了解决庞大且难以维护的项目的方案。

微前端解决了什么问题: `大型应用程序的维护困难, 大型应用程序的可扩展性问题, 多团队协同开发问题`

微前端具备的核心价值: `技术栈无关, 独立开发、独立部署, 增量升级（渐进式重构）, 独立运行时`


### 微前端架构方案：
1. `基座模式`：将多个子应用程序作为模块加载到一个主应用程序中。这些模块是独立的小型应用程序。每个子应用程序都可以独立开发、测试、部署，而主应用程序主要就是将子应用进行集成和协调，子应用程序发生变化，主应用程序也会自动的完成更新。

`Single-SPA`：一个支持多框架、多技术栈的JavaScript微前端框架，用于构建大型单页应用程序。
> **它做的就是监听路由变化，路由切换的时候加载、卸载注册的应用的代码。**

`qiankun`：一个基于Single-SPA封装的微前端框架，支持React、Vue、Angular等技术栈。
> 它是`把 js 代码包裹了一层 function，然后再把内部的 window 用 Proxy 包一层，这样内部的代码就被完全隔离了`，这样就实现了一个 JS 沙箱。


`Micro-app`： 京东出的微前端框架，借鉴了WebComponent的思想，通过CustomElement结合自定义的`ShadowDom`，将微前端封装成一个类WebComponent组件，从而实现微前端的组件化渲染。并且`由于自定义ShadowDom的隔离特性`，micro-app不需要像single-spa和qiankun一样要求子应用修改渲染逻辑并暴露出方法，也不需要修改webpack配置，是目前市面上接入微前端成本最低的方案。



`wujie`： 腾讯出的微前端解决方案
- css 沙箱隔离： 无界将子应用的 dom 放置在 webcomponent + shadowdom 的容器中，除了可继承的 css 属性外实现了应用之间 css 的原生隔离。
- js 沙箱隔离：无界将子应用的 js 放置在 iframe（js-iframe）中运行，实现了应用之间 window、document、location、history 的完全解耦和隔离。



### WebComponent

> HTML5提供的一套自定义元素的接口，WebComponent是一套不同的技术，允许您创建可重用的定制元素（它们的功能封装在您的代码之外）并且在您的 web 应用中使用它们。以上是MDN社区对WebComponent的解释。

1. Custom elements（自定义元素）： 一组 JavaScript API，允许您定义 custom elements 及其行为，然后可以在您的用户界面中按照需要使用它们。
2. Shadow DOM（影子 DOM） ：一组 JavaScript API，用于将封装的“影子”DOM 树附加到元素（与主文档 DOM 分开呈现）并控制其关联的功能。通过这种方式，您`可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突`。
3. HTML templates（HTML 模板）： `<template>` 和 `<slot>` 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。


### why not iframe ?

iframe 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。但他的最大问题也在于他的隔离性无法被突破，导致`应用间上下文无法被共享，随之带来的开发体验、产品体验的问题`：`UI 不同步，DOM 结构不共享, 全局上下文完全隔离，内存变量不共享, 加载慢...`


`微前端解决的是隔离和通信，monorepo解决的是组件共享`



### 微前端qiankun通信方案？

- **Actions 通信**
> qiankun 官方提供的通信方式，是通过`全局状态池`和`观察者函数`进行应用间通信

1. qiankun 内部提供了 initGlobalState 方法用于注册 MicroAppStateActions 实例用于通信
2. 子应用可以先注册 `观察者` 到观察者池中，然后通过修改 `globalState` 可以触发所有的 `观察者` 函数，从而达到组件间通信的效果。


- **Shared 通信**

原理就是，`主应用基于 redux 维护一个状态池，通过 shared 实例暴露一些方法给子应用使用`。同时，子应用需要单独维护一份 shared 实例，在独立运行时使用自身的 shared 实例，在嵌入主应用时使用主应用的 shared 实例，这样就可以保证在使用和表现上的一致性。

Shared 通信方案需要自行维护状态池，这样会增加项目的复杂度。好处是可以使用市面上比较成熟的状态管理工具，如 redux、mobx，可以有更好的状态管理追踪和一些工具集。

Shared 通信方案也可以帮助主应用更好的管控子应用。子应用只可以通过 shared 实例来操作状态池，可以避免子应用对状态池随意操作引发的一系列问题。主应用的 Shared 相对于子应用来说是一个黑箱，子应用只需要了解 Shared 所暴露的 API 而无需关心实现细节。


### 微前端实现通信隔离的原理是什么呢？

1. `沙箱隔离`：微前端架构中，每个子应用都运行在自己的沙箱环境中，这意味着每个子应用都有自己独立的全局变量、DOM结构以及事件循环等。通过沙箱隔离，不同子应用之间的代码互不干扰，避免了全局状态污染和潜在的冲突。
2. `消息通信`：尽管子应用被隔离在各自的沙箱中，但它们之间以及主应用与子应用之间仍然需要通信。这通常通过定义明确的通信协议和接口来实现，例如`使用事件总线（Event Bus）或者基于消息队列的方式进行通信`。
3. `路由管理`：在微前端架构中，路由管理也是实现通信隔离的重要一环。每个子应用都有自己的路由系统，主应用负责管理和协调这些路由。通过路由管理，可以确保在切换子应用时，旧子应用的资源得到正确释放，新子应用能够正确加载和渲染，从而实现不同子应用之间的隔离。
4. `资源加载`：资源加载的隔离也是微前端通信隔离的重要方面。每个子应用的CSS、JavaScript等资源都是单独加载的，这可以避免样式冲突和脚本错误。



### qiankun的js沙箱机制？

qiankun框架为了实现`js隔离`，提供了三种不同场景使用的沙箱，分别是 `snapshotSandbox、proxySandbox、legacySandbox`。


1. **快照沙箱(snapshotSandbox)**: 把主应用的 window 对象做浅拷贝，将 window 的键值对存成一个 `Hash Map`。之后无论微应用对 window 做任何改动，当要恢复环境时，把这个 Hash Map 又应用到 window 上就可以了。
> snapshotSandbox会污染全局window，但是可以支持不兼容Proxy的浏览器; 每次微应用 unmount 时都要对每个属性值做一次 Diff

qiankun基于es6的Proxy实现了两种应用场景不同的沙箱，一种是legacySandbox(单例)，一种是proxySandbox(多例)。都是基于Proxy实现的, 都称为代理沙箱。
2. **legacySandbox(单例沙箱)**: 通过监听对 window 的修改来直接记录 Diff 内容
> 同样会对window造成污染，但是性能比快照沙箱好，不用遍历window对象。


3. **proxySandbox(多例沙箱)**：把当前 window 的一些原生属性（如document, location等）拷贝出来，单独放在一个对象上，这个对象也称为 fakeWindow
之后对每个微应用分配一个 fakeWindow；当微应用修改全局变量时：如果是原生属性，则修改全局的 window；如果不是原生属性，则修改 fakeWindow 里的内容
> 不会污染全局window，支持多个子应用同时加载。


原理很容易理解, 就是 function 包裹了一层，所以代码放在了单独作用域跑，又用 with 修改了 window，所以 window 也被隔离了。这是 qiankun 的 JS 沙箱实现方案，其他的微前端方式实现沙箱可能用 iframe、web components 等方式。

微前端方案的功能就那一句话：**当路由切换的时候，去下载对应应用的代码，然后跑在容器里。只不过这个容器的实现方案有差异。**


qiankun、wujie、micro-app 的区别主要还是实现容器（或者叫沙箱）上有区别，比如 qiankun 是 `function + proxy + with`，micro-app 是 `web components`，而 wujie 是 `web components 和 iframe`。




### 微前端样式隔离

qiankun 做了样式隔离，有 shadow dom 和 scoped 两种方案：
1. shadow dom 自带样式隔离，但是 shadow dom 内的样式和外界互不影响，导致挂在body上的弹窗的样式会加不上。父应用也没法设置子应用的样式。
2. scoped 的方案是给选择器加了一个 data-qiankun='应用名' 的选择器，这样父应用能设置子应用样式，这样能隔离样式，但是同样有挂在 body 的弹窗样式设置不上的问题，因为 qiankun 的 scoped 不支持全局样式

- react 和 vue 项目本身都会用 scoped css 或者 css modules 的组件级别样式隔离方案


> 微前端非常适合后台管理系统开发，尤其是在项目中往往拥有多个业务系统，每个系统都有自己的开发团队和技术栈，而这些系统之间需要进行数据共享和交互，微前端技术可以让这些系统更加灵活地集成在一起。








## Monorepo

`单仓库，多项目`。就是指在一个大的项目仓库中，管理多个模块/包（package），这种类型的项目大都在项目根目录下有一个packages文件夹，分多个项目管理。


包关联配置: `pnpm-workspace.yaml`， 在 pnpm 中使用 `workspace: 协议定义某个依赖包版本号`时，pnpm 将只解析存在工作空间内的依赖包，不会去下载解析 npm 上的依赖包。


### 组件库

**Q: 怎么展示我们的 demo 组件，以及怎么展示 demo 源码呢？**

> 组件直接渲染即可，难的是展示源码；可以约定一个语法规则，在模块加载的时候通过正则匹配拿到demo组件的路径和名称，同时也可以拿到demo源码；之后就可以通过改写模块属性，把源码内容转成字符串添加到模块中；之后在预览组件中拿到源码字符串sourceCode，就可以进行展示了~

这里我约定的语法规则是`source-code="ui:::xxx"`, 写一个简单的vite插件，用于将所有md模块中的`source-code="ui:::xxx"`提取出来，并通过路径获取源码信息


- 样式隔离：iframe

- 组件库打包：vite进行打包, 它提供了一个库模式 (opens new window)专门用于打包库组件~


### 代码规范

1. 通过 eslint 完成对规则的限制
2. 通过 prettier 完成对格式化定义，以及使用 eslint-config-prettier 抹平与 eslint 自带格式化的冲突问题
3. 通过 stylelint 完成对 css 的检查和格式化
4. 通过 husky 添加 pre-commit 钩子，在代码提交之前进行校验
5. 通过 commitLint规范代码提交格式
6. 通过 lint-staged 完成只对暂存区代码的校验和格式化工作



### 封装组件的原则

1. 单一原则：负责单一的页面渲染
2. 多重职责：负责多重职责，获取数据，复用逻辑，页面渲染等
3. 明确接受参数：必选，非必选，参数尽量设置以_开头，避免变量重复
4. 可扩展：需求变动能够及时调整，不影响之前代码
5. 代码逻辑清晰
6. 封装的组件必须具有`高性能，低耦合`的特性
7. 组件具有`单一职责`：封装业务组件或者基础组件，如果不能给这个组件起一个有意义的名字，证明这个组件承担的职责可能不够单一，需要继续抽组件，直到它可以是一个独立的组件即可



## 低代码


页面核心构成：
1. 组件区：提供可以被反复拖拽的组件
2. 设计区：可以将组件拖拽到设计区，并移动位置
3. 属性区：可以定制化的配置每一个拖到设计区的组件

Q：如何知道拖拽的是哪个组件？
> 拽事件中使用 `dataTransfer` 对象来携带一些自定义数据~




## SSR渲染

服务器端渲染（SSR）是一种用于在服务器上渲染网页并将完全渲染后的网页发送到客户端显示的技术。它允许服务器生成网页的完整 HTML 标记，包括动态内容，并作为对请求的响应发送给客户端。

`SSR的优势在于它利于搜索引擎优化（SEO）和解决了白屏问题`

react: next.js

vue: nuxt.js


优点：
1. `改善初始加载时间`： SSR 允许服务器向客户端发送完整呈现的 HTML 页面，从而减少客户端所需的处理量。这就改善了初始加载时间，因为用户可以更快地看到完整的页面。
2. `有利于搜索引擎优化`：由于搜索引擎爬取工具通常不会等待Ajax异步完成后再爬取页面内容，SPA页面的内容往往无法被搜索引擎有效抓取。而SSR将数据和组件在服务端转化为HTML，返回的页面内容完整，有利于搜索引擎的爬取和索引。
3. `可访问性`： SSR 可确保禁用 JavaScript 或使用辅助技术的用户可以访问内容。通过在服务器上生成 HTML，SSR 可为所有用户提供可靠、可访问的用户体验。
4. `低带宽环境下的性能`： SSR 减少了客户端需要下载的数据量，因此有利于低带宽或高延迟环境中的用户。这对于移动用户或网络连接速度较慢的用户尤为重要。


客户端渲染：请求一个url => 返回空的首屏html => 首屏请求数据 => 获取首屏数据 => 后端返回首屏数据 => 请求ajax数据，返回， 渲染

服务端渲染：请求一个url  => 获取首屏数据 => 后端返回渲染好的首屏html => 其他ajax请求...


客户端渲染是等js代码下载、加载、解析完成后再请求数据渲染，等待的过程页面是什么都没有的，就是用户看到的白屏。

就是服务端渲染不需要等待js代码下载完成并请求数据，就可以返回一个已有完整数据的首屏页面。





### 客户端渲染 vs 服务端渲染

- 没有ajax的web1.0时代：`浏览器向服务器请求页面 => 服务器向数据库查询数据 => 数据库返回数据 => 服务器向模板传递数据，渲染html片段 => 模板向服务器返回html片段 => 服务器组装html片段，向浏览器返回`


- 客户端渲染(CSR)：`浏览器向前端服务器请求页面 => 前端服务器返回静态html页面 => 浏览器继续向前端服器请求js脚本 => 前端服务器返回js脚本 => 浏览器执行js脚本 => js脚本向后端服务器请求数据 => 后端服务器向数据库查询数据，数据库返回数据 => 后端继续向js脚本返回数据 => js脚本处理好数据后，渲染html页面`


- 服务端渲染(SSR): 
1. `浏览器向前端服务器请求页面 => 前端服务器向后端服务器请求数据 => 后端服务器向数据库查询数据，数据库返回数据 => 后端服务器向前端服务器返回数据 => 前端服务器组装HTML，并返回 => 浏览器渲染页面`
2. `之后浏览器向前端服务器请求js脚本 => 前端服务器返回js脚本 => 浏览器执行js脚本，绑定js事件，向后端请求数据 => 后端服务器返回数据，js脚本动态渲染页面`


相对于客户端渲染，服务端渲染在浏览器请求URL之后已经得到了一个带有数据的HTML文本，浏览器只需要解析HTML，直接构建DOM树就可以。

而客户端渲染，需要先得到一个空的HTML页面，这个时候页面已经进入白屏，之后还需要经过加载并执行 JavaScript、请求后端服务器获取数据、JavaScript 渲染页面几个过程才可以看到最后的页面。特别是在复杂应用中，由于需要加载 JavaScript 脚本，越是复杂的应用，需要加载的 JavaScript 脚本就越多、越大，这会导致应用的首屏加载时间非常长，进而降低了体验感。


**缺点**
1. `需要更多的服务器负载均衡`: 由于服务器增加了渲染HTML的需求，使得原本只需要输出静态资源文件的nodejs服务，新增了数据获取的IO和渲染HTML的CPU占用，如果流量突然暴增，有可能导致服务器down机，因此需要使用响应的缓存策略和准备相应的服务器负载。
2. `生命周期不全，第三方库不全，学习成本大`



### SSR为什么会缩短首屏渲染时间？

`缩短了首屏请求数据的路径`，CSR需要先返回首屏html模板后，再请求后端数据；而SSR是前端服务器直接请求数据，组装好html模板后直接返回。

由于首屏页面已经在服务端完成了渲染，前端在接收到这个带有数据的HTML页面后，只需解析HTML并构建DOM树，而无需再次请求数据。这种方式避免了在客户端渲染中可能出现的等待数据加载的时间，从而大大缩短了首屏渲染时间。






### React服务端渲染遇到过哪些问题，怎么做性能优化?

1. SSR 需要服务器在每次请求时都渲染完整的页面，这可能会增加服务器的负担，尤其是在高并发的情况下。
> 缓存已经渲染过的页面，对于相同或相似的请求，直接返回缓存结果，避免重复渲染。异步加载非关键组件，减少单次渲染的计算量。

2. 在 SSR 中，数据需要在服务器端获取并注入到组件中，这可能会增加请求的延迟。
> 在组件渲染之前先获取数据。使用缓存策略来存储常用数据，减少实时获取的开销。可以考虑使用 CDN 来加速数据的获取。

3. 如果未正确实施代码分割和懒加载，可能导致渲染时间延长。
> 利用 Webpack 或其他打包工具进行代码分割。使用 React 的 React.lazy() 和 Suspense 组件实现组件级别的懒加载。


## Node.js

Node.js 是一个开源的、跨平台的 JavaScript 运行时环境。

特点：
1. `异步非阻塞`：采用了非阻塞型I/O机制，在做I/O操作的时候不会造成任何的阻塞，当完成之后，以时间的形式通知执行操作, 能够在单个线程上处理大量并发请求
> 例如在执行了访问数据库的代码之后，将立即转而执行其后面的代码，把数据库返回结果的处理代码放在回调函数中，从而提高了程序的执行效率

2. `事件驱动`：事件驱动就是当进来一个新的请求的时，请求将会被压入一个事件队列中，然后通过一个循环来检测队列中的事件状态变化，如果检测到有状态变化的事件，那么就执行该事件对应的处理代码，一般都是回调函数



Node.js底层的实现包括两个主要组件：
1. `V8引擎`: 这是一个高性能的JavaScript引擎，负责将JavaScript代码编译成机器码并执行。它是Node.js的核心组件，使得Node.js能够运行JavaScript代码。
2. `libuv库`: 这是一个跨平台的库，用于`处理事件循环、异步I/O、文件系统操作`等。它提供了对底层操作系统API的封装，使得Node.js`可以实现非阻塞式的异步操作，从而达到高性能和高并发`的目标。


优点：
1. 处理高并发场景性能更佳
2. 适合I/O密集型应用，值的是应用在运行极限时，CPU占用率仍然比较低，大部分时间是在做 I/O硬盘内存读写操作

因为Nodejs是单线程，带来的缺点有：
1. 不适合CPU密集型应用
2. 只支持单核CPU，不能充分利用CPU
3. 可靠性低，一旦代码某个环节崩溃，整个系统都崩溃


适合应用：
1. `善于I/O，不善于计算`: 因为Nodejs是一个单线程，如果计算（同步）太多，则会阻塞这个线程
    > 用户`表单收集系统、后台管理系统、实时交互系统、考试系统、联网软件、高并发量的web应用程序`

2. 与 websocket 配合，开发长连接的实时交互应用程序
    > 基于web的多人实时聊天客户端、聊天室、图文直播



### 怎么看 nodejs 可支持高并发？

1. 单线程架构，省去了线程间切换的开销
2. 核心就要在于 `js 引擎的事件循环机制`

结论： `nodejs 是异步非阻塞的，所以能扛住高并发`


- **同步**：在发起一个调用后，在没有得到结果前，该调用不返回，直到调用返回，才往下执行，也就是说调用者等待被调用方返回结果。


- **异步**：在发起一个调用后，调用就直接返回，不等待结果，继续往下执行，而执行的结果是由被调用方通过状态、通知等方式告知调用方，典型的异步编程模型比如 Node.js

- **阻塞**：在等待调用结果时，线程挂起了，不往下执行

- **非阻塞**：与上面相反，当前线程继续往下执行




### Node.js模块

Node.js有哪些全局对象：
1. 真正的全局对象：`process, console, clearInterval、setInterval, clearTimeout、setTimeout, global`
2. 模块级别的全局对象:
    - `__dirname`: 获取当前文件所在的路径，不包括后面的文件名;
    - `__filename`: 获取当前文件所在的路径和文件名称，包括后面的文件名称
    - `module.exports`: module.exports 用于指定一个模块所导出的内容，即可以通过 require() 访问的内容
    - `require`:用于引入模块、 JSON、或本地文件。 



**process** 对象是一个全局变量，提供了有关当前 Node.js进程的信息
1. `process.env`：环境变量，例如通过 `process.env.NODE_ENV` 获取不同环境项目配置信息
2. `process.cwd()`: 返回当前 Node进程执行的目录


**child_process**子进程：使用 `spawn()` 方法可以创建一个新的子进程，执行指定的命令


**Cluster**: 应用部署到多核服务器时，为了充分利用多核 CPU 资源一般启动多个 NodeJS 进程提供服务，这时就会使用到 NodeJS 内置的 Cluster 模块了
> Cluster模块可以创建同时运行的子进程（Worker进程），同时共享同一个端口。每个子进程都有自己的事件循环、内存和V8实例。

- 应用场景：`使用Cluster进行优雅的重启`
> 当我们更新代码的时候，可能需要重新启动NodeJS。重新启动应用程序时，会出现一个小的空窗期：在我们重启单进程的NodeJS过程中，服务器会无法处理用户的请求。使用Cluster可以解决这个问题，具体做法如下：`一次重新启动一个Worker，剩下的Worker可以继续运行处理用户的请求`



**worker_thread多线程**: 允许在一个 Node.js 实例中运行多个应用程序线程。相比创建多个进程更轻量，并且可以共享内存。进程间通过传输 ArrayBuffer 实例或共享 SharedArrayBuffer 实例来做到这一点。
> `worker_threads已被证明是充分利用CPU性能的最佳解决方案`




**fs（filesystem）**，该模块提供本地文件的读写能力，基本上是`POSIX`文件操作命令的简单包装; 可以说，所有与文件的操作都是通过fs核心模块实现; 
> 对所有文件系统操作提供异步和同步`.sync`两种操作方式
`readFileSync, writeFileSync, appendFile, copyFileSync`



**Buffer**: 在Node应用中，需要处理网络协议、操作数据库、处理图片、接收上传文件等，在网络流和文件的操作中，要处理大量二进制数据，而Buffer就是在内存中开辟一片区域（初次初始化为8KB），用来存放二进制数据
1. I/O操作：通过流的形式，将一个文件的内容读取到另外一个文件
2. 加解密


**流（Stream）**，是一个数据传输手段，是端到端信息交换的一种方式，而且是有顺序的,是`逐块读取数据、处理内容`，用于顺序读取输入或写入输出

> 流，可以理解成是一个管道，比如读取一个文件，常用的方法是从硬盘读取到内存中，在从内存中读取，这种方式对于小文件没问题，但若是大文件，效率就非常低，还有可能内存不足，采用流的方式，就好像给大文件插上一根吸管，持续的一点点读取文件的内容，管道的另一端收到数据，就可以进行处理

分成四个种类：
1. `可写流`：可写入数据的流。例如 `fs.createWriteStream()` 可以使用流将数据写入文件
2. `可读流`： 可读取数据的流。例如`fs.createReadStream()` 可以从文件读取内容
3. `双工流`： 既可读又可写的流。例如 `net.Socket`
4. `转换流`： 可以在数据写入和读取时修改或转换数据的流。例如，在文件压缩操作中，可以向文件写入压缩数据，并从文件中读取解压数据

> 在NodeJS中HTTP服务器模块中，request 是可读流，response 是可写流。还有fs 模块，能同时处理可读和可写文件流

stream的应用场景主要就是处理`IO操作`，而http请求和文件操作都属于IO操作: `get请求返回文件给客户端, 文件操作, 一些打包工具的底层操作`



**EventEmitter**

Node采用了事件驱动机制，而`EventEmitter就是Node实现事件驱动的基础`; 在EventEmitter的基础上，Node几乎所有的模块都继承了这个类，这些模块拥有了自己的事件，可以绑定／触发监听器，实现了异步操作



### 宏任务和微任务

在Node中，同样存在`宏任务和微任务`，与浏览器中的事件循环相似

**微任务对应有：**
1. `next tick queue`：process.nextTick
2. `other queue`：Promise的then回调、queueMicrotask


**宏任务对应有：**
1. `timer queue`：setTimeout、setInterval
2. `poll queue`：IO事件
3. `check queue`：setImmediate
4. `close queue`：close事件

其执行顺序为：`next tick microtask queue` > `other microtask queue` > `timer queue` > `poll queue` > `check queue` > `close queue`



### 文件查找的优先级

缓存的模块优先级最高 > 内置模块 > `绝对路径 / 开头，则从根目录找` > `相对路径 ./ 开头，则从当前require文件相对位置找` > `没有携带后缀，先从js、json、node按顺序查找` > `是目录，则根据 package.json的main属性值决定目录下入口文件，默认情况为 index.js` > 第三方模块



### 中间件（Middleware）

是介于应用系统和系统软件之间的一类软件，它使用系统软件所提供的基础服务（功能），衔接网络上应用系统的各个部分或不同的应用，能够达到资源共享、功能共享的目的

> 在NodeJS中，中间件主要是指`封装http请求细节处理`的方法。例如在express、koa等web框架中，中间件的本质为一个`回调函数`，参数包含请求对象、响应对象和执行下一个中间件的函数，我们可以执行业务逻辑代码，修改请求和响应对象、返回响应数据等操作。


Koa 中间件采用的是`洋葱圈模型`, Koa存在很多第三方的中间件，如`koa-bodyparser、koa-static`等, 都是函数, 会传入两个参数: 
1. ctx ：封装了request 和 response 的变量
2. next ：进入下一个要执行的中间件的函数

在实现中间件时候，单个中间件应该足够简单，职责单一，中间件的代码编写应该高效，必要的时候通过缓存重复获取数据; koa本身比较简洁，但是通过中间件的机制能够实现各种所需要的功能，使得web应用具备良好的可拓展性和组合性



### 如何实现jwt鉴权机制？

`JWT（JSON Web Token）`，本质就是一个字符串书写规范

在目前前后端分离的开发过程中，使用token鉴权机制用于身份验证是最常见的方案：
1. 服务器当验证用户账号和密码正确的时候，给用户颁发一个令牌，这个令牌作为后续用户访问一些接口的凭证
2. 后续访问会根据这个令牌判断用户时候有权限进行访问

Token，分成了三部分，`头部（Header）、载荷（Payload）、签名（Signature）`，并以`.`进行拼接。


如何实现：
1. 生成token: 借助第三方库`jsonwebtoken`，通过jsonwebtoken 的 sign 方法生成一个 token;
2. 校验token：使用 `koa-jwt` 中间件进行验证，方式比较简单
> secret 必须和 sign 时候保持一致; 可以配置接口白名单; 



### 如何实现文件上传？

1. 前端表单组件文件上传：`multipart/form-data`
2. 服务端文件解析：获取上传的文件，获取文件数据后，可以通过fs创建将文件保存到指定目录（可读流通过管道写入可写流）`fs.createWriteStream`



### Node性能如何进行监控以及优化？


nodejs性能衡量指标一般有如下：
1. CPU：CPU负载，CPU使用率; 用来评估系统当前CPU的繁忙程度的量化指标
2. 内存：内存占用率是评判一个系统的内存瓶颈的常见指标， `process.memoryUsage()`
3. 磁盘I/O：内存IO 比 磁盘IO 快非常多，所以使用内存缓存数据是有效的优化方法。常用的工具如 redis、memcached等
4. 网络




### Express vs Koa ?
1. 中间件链接方式：Express 中间件链是基于回调的，有回调地狱问题；而 Koa 的则是用 ES6+ 中的 async/await 来解决异步处理问题，使得代码更加清晰易读。
2. Express 是 NodeJS 的一个 Web 框架。它通过为 Node 的 req 和 res 对象添加有用的方法和属性来增强其功能；Koa 是 NodeJS 的一个中间件框架。Koa 使用自己的上下文（ctx）替换或提取 Node 的 req 和 res 对象属性。
3. 更加轻量 Koa 比 Express 更轻量级。Koa 不像 Express 那样包含路由器或视图引擎模块。



### 洋葱模型？

> 它借鉴了`函数式编程中的compose思想，将中间件（middleware）按照特定的顺序组织起来`，以处理HTTP请求和响应。

洋葱模型的核心思想是，Koa 中间件的执行顺序和处理流程类似于一个洋葱，请求在经过多个中间件处理时，会像剥洋葱一样，`从外向内逐步执行，然后再从内向外逐步返回结果`。

中间件函数有两个参数第一个是`上下文`，第二个是 `next`，当请求到达某个中间件时，该中间件会执行一些操作，然后`通过调用next函数将控制权传递给下一个中间件`。这个过程会一直持续到最后一个中间件执行完毕。
> Koa的洋葱模型是通过使用async/await和Promise来实现的。每个中间件都是一个async函数，当调用next函数时，会返回一个Promise对象。这样，Koa就可以通过Promise的链式调用来实现中间件的异步串行执行。

与传统的中间件模型不同，Koa的洋葱模型在请求处理完毕后，还会按照相反的顺序再次经过这些中间件。这就像是剥洋葱一样，`先一层层剥开，然后再一层层合上`。这种设计使得`每个中间件都有两次处理时机：一次是在请求进入时，另一次是在请求处理完毕后返回时`。

这种洋葱模型的设计带来了很多好处。首先，它使得中间件的编写更加灵活和强大。由于每个中间件都有两次处理时机，因此可以在进入时执行一些前置操作（如验证、记录日志等），在返回时执行一些后置操作（如清理资源、发送响应等）





### PM2

pm2 是 process manager，进程管理，它是第二个大版本，和前一个版本差异很大，所以叫 pm2；pm2 的主要功能就是`进程管理、日志管理、负载均衡、性能监控`这些。

- 进程管理的话就是可以手动启动、重启、停止某个进程，而且崩溃了会自动重启，也可以定时自动重启。

- 负载均衡: node 应用是单进程的，而为了充分利用多核 cpu，我们会使用多进程来提高性能。node 提供的 cluster 模块就是做这个的，pm2 就是基于这个实现了负载均衡。




### Node.js 怎么实现扫码登录？

1. 前端进入首页会自动请求服务端的`qrcode/generate` 接口，会生成一个随机的二维码 id，生成二维码确认页面url, 同时调二维码生成库qrcode, 将该url生成一个二维码图片的base64地址，返给前端；
> 二维码确认页面url，如: `http://localhost:3000/pages/confirm.html?id=${id}`

2. 前端拿到二维码图片，展示；同时轮询调 `qrcode/check` 接口，查询该二维码id的二维码状态（未扫码、已扫码待确认、已确认登录、已取消）

3. 当用户扫码访问二维码确认页面，首先从url中拿到了二维码id，然后调用 `qrcode/scan` 接口切换二维码状态为【`已扫描，等待用户确认`】，首页通过轮询也会及时更新状态；
> 点击取消或确认，可调不同的接口，修改二维码为不同的状态；

4. 如果用户之前没登录过，需要先登录账号，调`login`接口，传入用户名+密码；服务端通过`jwt`对用户信息加密，生成token，返回给前端；

4. 前端拿到token, 用户点击确认，调`qrcode/confirm`接口，服务端拿到用户token信息，也是用`jwt`校验token是否有效；校验通过后首页轮询到二维码状态更新，就可以进行后续处理了




### node 的内存管理跟垃圾回收机制有了解过吗？

在Node.js中，内存被分为几个不同的区域，包括`代码区（`存放即将执行的代码片段）、`栈`（存放局部变量）、`堆`（存放对象、闭包上下文）以及`堆外内存`（不通过V8分配，也不受V8管理，例如Buffer对象的数据就存放于此）。这些区域中的大部分（除了堆外内存）都由`V8引擎`进行管理。

关于`垃圾回收机制`，V8将内存分为`新生代和老年代`，`对新生代使用更高效的垃圾回收策略，而对老年代则使用更优化的策略`。当新生代中的对象存活时间超过一定阈值时，它们会被晋升到老年代。
> 同时，V8还使用了一种增量式的垃圾回收策略，以减小垃圾回收对程序运行的影响。`标记清除算法：标记存活的对象，未被标记的则被释放`

Node.js的内存管理和垃圾回收机制是一个复杂且重要的系统，它确保了Node.js在运行时能够有效地管理内存，防止内存泄漏，并优化程序的性能。



### 什么是node是守护进程？

Node.js的守护进程是一种在后台运行的特殊进程，它不受任何终端控制，主要用于监控Node.js应用程序的运行状态`·当应用程序出现错误或异常退出时，守护进程能够立即重启服务程序，防止服务器崩溃`。

常见的Node.js守护进程工具包括PM2和forever。PM2是一个用于Node.js应用程序的生产环境进程管理器，内置`负载均衡器`。它不仅可以启动、停止和重启Node.js应用程序进程，确保应用程序一直处于运行状态，还提供了容错机制，可以在进程崩溃时自动重新启动应用程序。同时，`PM2的负载均衡功能可以将传入的请求分发到多个Node.js进程中，提高应用程序的性能和可扩展性`。

而forever则是一个简单的命令式Node.js守护进程，通过命令行操作来监控Node.js子进程的运行情况。`一旦文件更新或者进程挂掉，forever会自动重启Node.js服务器，确保应用正常运行`。

这些守护进程工具使得Node.js应用程序能够持续、稳定地运行，提高了应用程序的可用性和可靠性。



## Nginx

Nginx 是一个轻量级的 HTTP 服务器，采用`事件驱动、异步非阻塞`处理方式的服务器，它具有极好的 IO 性能，常用于 HTTP服务器（包含动静分离）、正向代理、反向代理、负载均衡 等等.


Nginx 和 Node.js 在很多方面是类似的，例如都是 HTTP 服务器、事件驱动、异步非阻塞等，且 Nginx 的拥有的功能，也可以使用 Node.js 去实现，但它们的使用场景是不同的，`Nginx 擅长于底层服务器端资源的处理（静态资源处理转发、反向代理，负载均衡等），Node.js 更擅长上层具体业务逻辑的处理.`

Nginx 使用了`进程池 + 单线程`的工作模式。


### nginx的rewrite和location是什么作用

在 Nginx 中，rewrite 和 location 都是用于 URL 重写和请求匹配的指令，它们有不同的作用：

- `rewrite` 指令用于在服务器处理请求时，修改请求的 URL

``` sh
server {
    ...
    rewrite ^/old-url$ /new-url permanent; # 当客户端请求 /old-url 时，Nginx 会将请求重定向到 /new-url。
    ...
}
```

- `location` 指令用于匹配请求的 URL，根据匹配规则将请求交给相应的处理程序或者作特定的配置。

``` sh
server {
    ...
    location /static { # 当客户端请求 URL 中包含 /static 字符串时，Nginx 会将请求转发到指定的静态文件目录。
        alias /path/to/static/files;
    }
    ...
}
```

> rewrite 用于修改请求的 URL，实现重定向或路径重写的功能；而 location 用于根据请求的 URL 匹配规则，将请求交给不同的处理程序或者配置






## HTTP


### Http缓存


1. 减少了冗余的数据传输，节省了网费。
2. 缓解了服务器的压力， 大大提高了网站的性能
3. 加快了客户端加载网页的速度


**强缓存+协商缓存**

1. 第一次请求资源时，服务器返回资源，并在respone header头中回传资源的缓存参数；

2. 第二次请求时，浏览器判断这些请求参数，命中`强缓存`就直接200，否则就把请求参数加到request header头中传给服务器，看是否命中`协商缓存`，命中则返回304，否则服务器会返回新的资源。


- **强缓存**

`Cache-Control的max-age没有过期`或者`Expires的缓存时间没有过期`

那么就会直接使用浏览器的缓存数据，不会再向服务器发送任何请求。强制缓存生效时，http状态码为`200`。

控制强制缓存的有以下两个头部字段:

1. `Expire`: Expire是 HTTP 1.0 时期的字段，表示`资源过期时间`。当用户当前时间早于Expire设置的时间，则不再请求服务器，否则请求。
> Expire有一个缺陷，就是用户设备时间不靠谱，可能被篡改。

2. `Cache-Control`: Catche-Control 是HTTP 1.1新增的字段，可配置性更强。包括以下属性：
    - `max-age`，表示有效期时长，单位为秒
    - `public`
    - `private`，控制转发服务器能否缓存
    - `no-cache`，跳过强制缓存，走协商缓存
    - `no-store`，跳过强制缓存和协商缓存

- **协商缓存**

`当第一次请求时服务器返回的响应头中没有Cache-Control和Expires`或者`Cache-Control和Expires过期`, 或者`它的属性设置为no-cache`

1. 那么浏览器第二次请求时就会与服务器进行协商，与服务器端对比判断资源是否进行了修改更新。如果服务器端的资源没有修改，那么就会返回`304`状态码，告诉浏览器可以使用缓存中的数据，这样就减少了服务器的数据传输压力。

2. 如果数据有更新就会返回200状态码，服务器就会返回更新后的资源并且将缓存信息一起返回。

跟协商缓存相关的header头属性有: `ETag/If-Not-Match 、Last-Modified/If-Modified-Since`, 

**协商缓存的执行流程是这样的：**
1. 当浏览器第一次向服务器发送请求时，会在响应头中返回协商缓存的头属性：`ETag和Last-Modified`,其中**ETag返回的是一个hash值**，`Last-Modified`返回的是GMT格式的最后修改时间;
2. 然后浏览器在第二次发送请求的时候，会在请求头中带上与ETag对应的`If-Not-Match，其值就是响应头中返回的ETag的值`，Last-Modified对应的`If-Modified-Since`;
3. 服务器在接收到这两个参数后会做比较，如果返回的是304状态码，则说明请求的资源没有修改，浏览器可以直接在缓存中取数据，否则，服务器会直接返回数据。


`ETag/If-Not-Match`是在`HTTP/1.1`出现的，主要是解决以下问题：
1. ``Last-Modified标注的最后修改只能精确到秒级``，如果某些文件在1秒钟以内，被修改多次的话，它将不能准确标注文件的修改时间
2. 如果某些文件被修改了，但是内容并没有任何变化，而Last-Modified却改变了，导致文件没法使用缓存
3. 有可能存在服务器没有准确获取文件修改时间，或者与代理服务器时间不一致等情形
4. `当ETag和Last-Modified同时存在时，服务器先会检查ETag，然后再检查Last-Modified`


### Cache 和 Cookie 异同？

> Cache 和 Cookie 都是服务器发给客户端并存储的数据，你能比较一下两者的异同吗？

- 相同点：都会保存到浏览器中，并可以设置过期时间。

- 不同点：
1. Cookie 会随请求报文发送到服务器，而 Cache 不会，但验证资源是否过期。
2. Cookie 在浏览器可以通过脚本获取（如果 cookie 没有设置 HttpOnly），Cache 则无法在浏览器中获取（出于安全原因）。
3. Cookie 通过响应报文的 `Set-Cookie` 字段获得，cache 缓存的是完整的报文。
4. 用途不同。`Cookie 常用于身份识别，Cache 则是由浏览器管理`，用于节省带宽和加快响应速度。
5. Cookie 的 max-age 是从浏览器拿到响应报文时开始计算的，而 Cache 的 max-age 是从响应报文的生成时间（Date 头字段）开始计算。


### 强制刷新为什么会返回200？

> 即使有“Last-modified”和“ETag”，强制刷新（Ctrl+F5）也能够从服务器获取最新数据（返回 200 而不是 304），观察请求头和响应头，解释原因。

`强制刷新后请求头中 没有了 If-None-Match ，而且 Cache-Control: no-cache`；没有条件请求头，那么服务器就无法处理缓存，就只能返回最新的数据。



### DNS域名系统

在 TCP/IP 协议中使用 IP 地址来标识计算机，数字形式的地址对于计算机来说是方便了，但对于人类来说却既难以记忆又难以输入。

于是域名系统（Domain Name System）出现了，`用域名来作为 IP 地址的等价替代`。

域名解析：通过域名，映射它的真实ip地址。

``` js
www.bidu.com
// www 主机名
// baidu 二级域名
// com 顶级域名
```


域名解析流程，如访问`www.baidu.com`：
1. 访问`根域名服务器`，它会告诉你`com`顶级域名服务器的地址；
2. 访问com`顶级域名服务器`，它再告诉你`apple.com`域名服务器的地址；
3. 最后访问apple.com`权威域名服务器`，就得到了`www.apple.com`的地址。


浏览器输入一个域名，完整的解析流程：

`浏览器缓存 -> 操作系统缓存 -> hosts文件 -> 非权威域名服务器 -> 根域名服务器 -> 顶级域名服务器 -> 权威域名服务器。`



### 从输入url,发生了什么？

- DNS解析：输入域名，域名解析成ip地址；可能解析成CDN的ip地址（缓存，直接响应）；

- TCP三次握手建立连接

- 浏览器向服务端发送请求报文：
    - HTTP 请求经过无数的路由器、网关、代理，最后到达服务器
    - 负载均衡：它会先访问系统里的缓存服务器，它们的作用与 CDN 类似，减轻后端应用服务器的压力；
    - 如果缓存服务器里也没有，那么负载均衡设备就要把请求转发给应用服务器，它们又会再访问后面的 MySQL、MongoDB 等数据库服务，然后把执行的结果返给负载均衡设备，同时也可能给缓存服务器里也放一份。
    - 按原路返回，还是要经过路由器、网关、代理。如果这个资源允许缓存，经过 CDN 的时候会进行缓存。

- 服务器收到报文后解析报文，处理请求，生成响应报文；发送给浏览器；

- 浏览器解析报文，渲染；

**具体流程：**
1. DNS解析：判断url是否合法；没问题则依次判断本地DNS服服务器、操作系统、hosts文件是否有缓存；无则再依次向根域名服务器、顶级域名服务器、权威域名服务器获取完整域名ip地址；
    - 用户向本地 DNS 服务器发起请求属于递归请求，本地 DNS 服务器向各级域名服务器发起请求属于迭代请求。

2. 通过TCP/IP协议栈获取目的主机的MAC地址；
3. TCP三次握手建立连接：
    - 首先客户端向服务器发送一个 `SYN 连接请求报文段`和一个`随机序号`，
    - 服务端接收到请求后向服务器端发送一个 `SYN ACK报文段`，确认连接请求，并且也向客户端发送一个`随机序号`。
    - 客户端接收服务器的确认应答后，进入连接建立的状态，同时向服务器也发送一个`ACK 确认报文段`；服务器端接收到确认后，也进入连接建立状态，此时双方的连接就建立起来了。

4. HTTPS握手：如果使用的是 HTTPS 协议，在通信前还存在 TLS 的一个四次握手的过程
    - 首先由客户端向服务器端发送使用的`协议的版本号`、一个`随机数`和可以使用的`加密方法`;
    - 服务器端收到后，确认加密的方法，也向客户端发送一个`随机数`和自己的`数字证书`;
    - 客户端收到后，首先检查数字证书是否有效，如果有效，则再生成一个`随机数`，并`使用证书中的公钥对随机数加密`，然后发送给服务器端，并且还会提供一个前面所有内容的 `hash 值`供服务器端检验;
    - 服务器端接收后，使用自己的`私钥对数据解密`，同时向客户端发送一个前面所有内容的 `hash 值`供客户端检验；
    
这个时候双方都有了`三个随机数`，按照之前所约定的加密方法，`使用这三个随机数生成一把秘钥`，以后双方通信前，就`使用这个秘钥对数据进行加密`后再传输。

5. 浏览器向服务端发送请求报文：路由器、网关、代理 => 后端缓存服务器、应用服务器，拿到数据；原路返回，前端CDN缓存；

6. 页面渲染：HTMLDom + CSSDom => renderDom；布局；绘制；如果遇到 script 标签，则判端是否含有 defer 或者 async 属性，要不然 script 的加载和执行会造成页面的渲染的阻塞；

7. TCP四次挥手：
    - 若客户端认为数据发送完成，则它需要向服务端发送连接释放请求；
    - 服务端收到连接释放请求后，会告诉应用层要释放 TCP 链接。然后会发送 ACK 包，并进入 CLOSE_WAIT 状态；
    - 服务端数据发送完毕后会向客户端发送连接释放请求，然后服务端便进入 LAST-ACK 状态;
    - 客户端收到释放请求后，向服务端发送确认应答，此时客户端进入 TIME-WAIT 状态；








### 三次握手

> 在真正的读写操作之前，客户端与服务器端之间必须建立一个连接，连接的建立依靠三次握手

握手过程中使用了 TCP 的标志（flag）：`SYN`（synchronize:同步） 和 `ACK`（acknowledgement:承认,应答）。


**第一次握手**：起初两端都处于`关闭状态`，客户端将`标志位SYN`置为1，随机产生一个`初始化序列号seq=J`，并将该数据包发送给服务端，客户端进入`同步已发送状态`，等待服务端确认；服务端被动打开连接，处于`LISTEN状态`；


**第二次握手**: 服务端收到连接请求报文段后，如同意建立连接，则向客户端发送确认报文：`SYN=1，ACK=1，确认号ack=J+1，初始序号seq=K`，服务端进程进入`同步已收到状态`；


**第三次握手**: 客户端收到服务端的确认后，要向服务端给出确认报文段: `ACK=1，确认号ack=K+1，序号seq=J+1`（初始为seq=J，第二个报文段所以要+1），ACK报文段可以携带数据，不携带数据则不消耗序号。TCP连接已经建立，客户端进入`已建立连接状态`。当服务端收到客户端的确认后，也进入`已建立连接状态`。


### 为什么服务端还要发送一次确认呢？可以二次握手吗？

1. 确认双方的接收与发送能力是否正常：

- `第一次握手`：客户端发送网络包，服务端收到了。这样服务端就能得出结论：客户端的发送能力、服务端的接收能力是正常的。
- `第二次握手`：服务端发包，客户端收到了。这样客户端就能得出结论：服务端的接收、发送能力，客户端的接收、发送能力是正常的。不过此时服务器并不能确认客户端的接收能力是否正常。
- `第三次握手`：客户端发包，服务端收到了。这样服务端就能得出结论：客户端的接收、发送能力正常，服务器自己的发送、接收能力也正常。
因此，`需要三次握手才能确认双方的接收与发送能力是否正常`。

2. 指定自己的`初始化序列号seq`(Initial Sequence Number)，为后面的可靠传送做准备。

3. 如果是 `https` 协议的话，三次握手这个过程，还会进行`数字证书的验证以及加密密钥的生成`。


### 什么是半连接队列？

服务器第一次收到客户端的 SYN 之后，就会处于 `同步已收到状态`，此时双方还没有完全建立其连接，服务器会把此种状态下请求连接放在一个队列里，我们把这种队列称之为`半连接队列`。当然还有一个全连接队列，就是已经完成三次握手，建立起连接的就会放在全连接队列中。


### 三次握手过程中可以携带数据吗？

第一次、第二次握手不可以携带数据，而第三次握手是可以携带数据的。

假如第一次握手可以携带数据的话，如果有人要恶意攻击服务器，那他每次都在第一次握手中的 SYN 报文中放入大量的数据，因为攻击者根本就不理服务器的接收、发送能力是否正常，然后疯狂着重复发 SYN 报文的话，这会让服务器花费很多时间、内存空间来接收这些报文。


### 四次挥手

当读写操作完成后，双方不再需要这个连接时可以释放这个连接，而释放则需要四次握手。

**第一次挥手**: 刚开始双方都处于 establised 状态，若客户端 A 认为数据发送完成，则它需要向服务端 B 发送连接释放请求；随后客户端发送一个 FIN 报文，`报文中会指定一个序列号`；此时客户端处于 FIN_WAIT1 状态。

**第二次挥手**：服务端收到 FIN 之后，会发送 ACK 报文，且`把客户端的序列号值 + 1 作为 ACK 报文的序列号值，表明已经收到客户端的报文了`，此时服务端处于 CLOSE_WAIT 状态。
> 此时表明 A 到 B 的连接已经释放，不再接收 A 发的数据了。但是因为 TCP 连接是双向的，所以 B 仍旧可以发送数据给 A。

**第三次挥手**: 如果服务端也想断开连接了，和客户端的第一次挥手一样，发给 FIN 报文，且`指定一个序列号`。此时服务端处于 LAST_ACK（最后确认）状态。

**第四次挥手**: 客户端收到 FIN 之后，一样`发送一个 ACK 报文作为应答，且把服务端的序列号值 + 1 作为自己 ACK 报文的序列号值`，此时客户端处于 TIME_WAIT（时间等待） 状态。需要过一阵子以确保服务端收到自己的 ACK 报文之后才会进入 CLOSED 状态；

> 服务端收到 ACK 报文之后，就关闭连接了，处于 CLOSED 状态。



### 第四次挥手客户端有一个 TIME_WAIT 状态，为什么客户端发送 ACK 之后不直接关闭，而是要等一阵子才关闭？

`要确保服务器是否已经收到了我们的 ACK 报文，如果没有收到的话，服务器会重新发 FIN 报文给客户端`，客户端再次收到 ACK 报文之后，就知道之前的 ACK 报文丢失了，然后再次发送 ACK 报文。

`至于 TIME_WAIT 持续的时间至少是一个报文的来回时间`：2MSL（MSL 最长报文段寿命Maximum Segment Lifetime）。如果过了 2MSL 没有再次收到 FIN 报文，则代表对方成功就是 ACK 报文，此时处于 CLOSED 状态。


### 为什么连接的时候是三次握手，关闭的时候却是四次握手？

因为当Server端收到Client端的SYN连接请求报文后，可以直接发送SYN+ACK报文。其中`ACK报文是用来应答的，SYN报文是用来同步的`。但是关闭连接时，当Server端收到FIN报文时，很可能并不会立即关闭SOCKET，所以只能先回复一个ACK报文，告诉Client端，"你发的FIN报文我收到了"。`只有等到我Server端所有的报文都发送完了，我才能发送FIN报文`，因此不能一起发送。故需要四步握手。



### HTTP报文结构

纯文本”的协议，所以头数据都是 ASCII 码的文本

HTTP 协议的请求报文和响应报文的结构: `起始行 / 头部 / 空行 / 实体`


- **请求行**

请求报文里的起始行也就是请求行（request line），它简要地描述了客户端想要如何操作服务器端的资源。

`GET / HTTP/1.1`: “GET”是请求方法；“/”是请求目标；“HTTP/1.1”是版本号


- **状态行**

响应报文里的起始行叫状态行（status line），意思是服务器响应的状态。

`HTTP/1.1 200 OK`: 协议版本号：1.1，状态码：200，说明：OK



- **状态码**
1. 1××：提示信息，表示目前是协议处理的中间状态，还需要后续的操作；
2. 2××：成功，服务器收到并成功处理了客户端的请求, 报文已经收到并被正确处理；
    - `206 Partial Content` 是 HTTP 分块下载或断点续传的基础，在客户端发送“范围请求”、要求获取资源的部分数据时出现。
3. 3××：重定向，资源位置发生变动，需要客户端重新发送请求；
    - 301：永久重定向，含义是此次请求的资源已经不存在了
    - 302：临时重定向，意思是请求的资源还在，但需要暂时用另一个 URI 来访问
    - 304 Not Modified：协商缓存重定向, 表示资源未修改，用于缓存控制
4. 4××：客户端错误，请求报文有误，服务器无法处理；
5. 5××：服务器错误，服务器在处理请求时内部发生了错误。



- **头部字段**

请求行或状态行再加上头部字段集合就构成了 HTTP 报文里完整的请求头或响应头

头部字段是 `key-value` 的形式，key 和 value 之间用“:”分隔, 用 `CRLF 换行`表示字段结束


常用头部字段:
1. 通用字段：在请求头和响应头里都可以出现；`Date, `
2. 请求字段：仅能出现在请求头里，进一步说明请求信息或者额外的附加条件; `Host,User-Agent, `
3. 响应字段：仅能出现在响应头里，补充说明响应报文的信息；`Server`
4. 实体字段：它实际上属于通用字段，但专门描述 body 的额外信息。`Content-Length`



- **实体**

MIME 是一个很大的标准规范，HTTP 只取了其中的一部分，用来标记 body 的数据类型，这就是我们平常总能听到的MIME type。

MIME type 常用类别：`text、image、application/json...`

Encoding type 常用类别：`gzip...`：告诉数据是用的什么编码格式

``` js
Accept: text/html,application/xml,image/webp,image/png // 告诉服务器希望接收什么样的数据
Content-Type: text/html // 服务器会在响应报文里用头字段 Content-Type 告诉实体数据的真实类型
Accept-Encoding: gzip, deflate, br // 客户端支持的压缩格式
Content-Encoding: gzip // 实际使用的压缩格式放在响应头字段
Accept-Language: zh-CN, zh, en
```

- **OPTIONS请求**

对那些可能对服务器数据产生副作用的 HTTP 请求方法（特别是 GET 以外的 HTTP 请求，或者搭配某些 MIME 类型的 POST 请求），浏览器必须首先使用 OPTIONS 方法发起一个`预检请求`（preflight request），从而`获知服务端是否允许该跨域请求。服务器确认允许之后，才发起实际的 HTTP 请求`。




### http 301 302 307 308之间的区别

- “301 Moved Permanently”俗称“`永久重定向`”，含义是此次请求的资源已经不存在了，需要改用新的 URI 再次访问。
- “302 Moved Temporarily”，俗称“`临时重定向`”，意思是请求的资源还在，但需要暂时用另一个 URI 来访问。

- 301和308状态码表示永久重定向, 301状态码在重定向时可能`会改变请求方法`，例如将POST方法改变为GET方法。而308状态码则要求客户端在新地址上重复同样的请求方法，即`不允许重定向时改变请求方法`
- 302和307状态码表示临时重定向。主要的区别在于，当发送重定向请求时，`307状态码确保请求方法和消息主体不会发生变化`，这对于保持POST请求的原始数据尤为重要

- `304` Not Modified 用于 If-Modified-Since 等条件请求，表示资源未修改，用于缓存控制。它不具有通常的跳转含义，但可以理解成“重定向到已缓存的文件”（即“`缓存重定向`”）。


### HTTP传输大文件的方法

1. **数据压缩**

通常浏览器在发送请求时都会带着“Accept-Encoding”头字段，里面是浏览器支持的压缩格式列表，例如 gzip、deflate、br 等，这样服务器就可以从中选择一种压缩算法，放进“Content-Encoding”响应头里，再把原数据压缩后发给浏览器。

2. **分块传输**

在响应报文里用头字段“`Transfer-Encoding: chunked`”来表示分块传输，意思是报文里的 body 部分不是一次性发过来的，而是分成了许多的块（chunk）逐个发送。

> `Transfer-Encoding: chunked”和“Content-Length”这两个字段是互斥的`，也就是说响应报文里这两个字段不能同时出现，一个响应报文的传输要么是长度已知，要么是长度未知（chunked）。


3. **范围请求**

允许客户端在请求头里使用专用字段来表示只获取文件的一部分。

服务器在响应头里使用字段`Accept-Ranges: bytes`则表示支持范围请求。如果服务器发送Accept-Ranges: none，或不发送“Accept-Ranges”字段，就表示不支持范围请求。

``` sh
###### 发送的请求报文 ########
GET /16-2 HTTP/1.1
Host: www.chrono.com
Range: bytes=0-31 # 获取了文件的前 32 个字节

###### 返回的响应报文 ########
HTTP/1.1 206 Partial Content
Content-Length: 32
Accept-Ranges: bytes
Content-Range: bytes 0-31/96 # 返回文件的前 32 个字节，并返回文件总长度 96 字节
```

多段下载、断点续传也是基于它实现的：

1. 先发个 HEAD，看服务器是否支持范围请求，同时获取文件的大小；
2. 开 N 个线程，每个线程使用 Range 字段划分出各自负责下载的片段，发请求传输数据；
3. 下载意外中断也不怕，不必重头再来一遍，只要根据上次的下载记录，用 Range 请求剩下的那一部分就可以了。


4. **多段数据**

范围请求一次只获取一个片段，其实它还支持在 Range 头里使用多个“x-y”，一次性获取多个片段数据

MIME 类型：`multipart/byteranges`，表示报文的 body 是由多段字节序列组成的，并且还要用一个参数`boundary=xxx`给出段之间的分隔标记。

``` sh
GET /16-2 HTTP/1.1
Host: www.chrono.com
Range: bytes=0-9, 20-29  # 发出两个范围的请求
```


### HTTP的连接管理

- 短连接：短连接的缺点相当严重，因为在 TCP 协议里，建立连接和关闭连接都是非常“昂贵”的操作。

- 长连接：`Connection：keep-alive`

服务器端通常不会主动关闭连接，但也可以使用一些策略。拿 Nginx 来举例，它有两种方式：
1. 使用`keepalive_timeout`指令，设置长连接的超时时间，如果在一段时间内连接上没有任何数据收发就主动断开连接，避免空闲连接占用系统资源。
2. 使用`keepalive_requests`指令，设置长连接上可发送的最大请求次数。



### 队头阻塞

因为 HTTP 规定报文必须是“一发一收”，这就形成了一个`先进先出的“串行”队列`。队列里的请求没有轻重缓急的优先级，只有入队的先后顺序，排在最前面的请求被最优先处理。

如果队首的请求因为处理的太慢耽误了时间，那么队列里后面的所有请求也不得不跟着一起等待，结果就是其他的请求承担了不应有的时间成本。

解决：
1. 并发连接（concurrent connections）：同时对一个域名发起多个长连接，用数量来解决质量的问题。
2. 域名分片（domain sharding）：HTTP 协议和浏览器会限制并发连接数量，那就多开几个域名，这些域名都指向同一台服务器，这样实际长连接的数量就又上去了。还是用数量来解决质量的思路。


### DDoS攻击

利用 HTTP 长连接特性对服务器发起大量请求，导致服务器最终耗尽资源“拒绝服务”，这就是常说的DDoS。


### Cookie 的工作过程

1. 当用户通过浏览器第一次访问服务器的时候，服务器肯定是不知道他的身份的。所以，就要创建一个独特的身份标识数据，格式是key=value，然后放进 Set-Cookie 字段里，随着`响应报文一同发给浏览器`。

2. 浏览器收到响应报文，看到里面有 Set-Cookie，知道这是服务器给的身份标识，于是就保存起来，下次再请求的时候就自动把这个值放进 Cookie 字段里发给服务器。




### 爬虫

一种可以自动访问 Web 资源的应用程序。

绝大多数爬虫是由各大搜索引擎“放”出来的，抓取网页存入庞大的数据库，再建立关键字索引，这样我们才能够在搜索引擎中快速地搜索到互联网角落里的页面。
> 但它会过度消耗网络资源，占用服务器和带宽，影响网站对真实数据的分析，甚至导致敏感信息泄漏。所以，又出现了“反爬虫”技术，通过各种手段来限制爬虫。


### TCP/IP 网络分层模型

TCP/IP 协议实际上是一系列网络通信协议的统称，其中最核心的两个协议是 TCP 和 IP，其他的还有 UDP、ICMP、ARP 等等，共同构成了一个复杂但有层次的协议栈。

TCP/IP 协议总共有四层: **链接层 》 网络层 》 传输层 》 应用层** （从下往上）

1. `第一层叫链接层（link layer）`，负责在以太网、WiFi 这样的底层网络上发送原始数据包，工作在网卡这个层次，使用`MAC地址（局域网地址）来标记网络上的设备`，所以有时候也叫 MAC 层。
2. `第二层叫网际层或者网络互连层（internet layer），IP 协议就处在这一层`。因为 IP 协议定义了“IP 地址”的概念，所以就可以在“链接层”的基础上，`用 IP 地址取代 MAC 地址，把许许多多的局域网、广域网连接成一个虚拟的巨大网络`，在这个网络里找设备时只要把 IP 地址再“翻译”成 MAC 地址就可以了。
3. 第三层叫`传输层（transport layer）`，这个层次协议的职责是`保证数据在 IP 地址标记的两点之间“可靠”地传输，是 TCP 协议工作的层次`，另外还有它的一个“小伙伴”UDP。
    - TCP 的数据是`连续的字节流`，有先后顺序，而 UDP 则是`分散的小数据包`，是顺序发，乱序收。
    
4. 协议栈的第四层叫`应用层（application layer）`，由于下面的三层把基础打得非常好，所以在这一层就“百花齐放”了，有各种面向具体应用的协议。例如 Telnet、SSH、FTP、SMTP 等等，当然还有我们的 `HTTP`。


### OSI 网络分层模型

从下往上：物理层 《 数据链路层 《 网络层 《 传输层 《 `会话层 《 表示层 《 应用层`



所谓的`四层负载均衡`就是指工作在传输层上，基于 TCP/IP 协议的特性，例如 IP 地址、端口号等实现对后端服务器的负载均衡。

所谓的`七层负载均衡`就是指工作在应用层上，看到的是 HTTP 协议，解析 HTTP 报文里的 URI、主机名、资源类型等数据，再用适当的策略转发给后端服务器。


### TCP/IP 协议栈的工作方式

HTTP 协议的`传输过程`通过协议栈`逐层向下`，每一层都添加本层的专有数据，层层打包，然后通过下层发送出去。

`接收数据`则是相反的操作，`从下往上穿过协议栈`，逐层拆包，每层去掉本层的专有头，上层就会拿到自己的数据。





### TCP与UDP的区别？

TCP和UDP都是网络层之上的，传输层协议，都能保护网络层的传输，双方的通信都需要开放端口，TCP和UDP中都存在复用和分用技术。

1. `连接性质`：TCP是面向连接的协议，这意味着在发送和接收数据之前，`需要建立连接`。而`UDP则是一种无连接的协议`，每个数据报都是独立发送的，无需建立和维护连接。
2. `可靠性`：TCP提供可靠交付的服务，使用流量控制和拥塞控制等服务保证可靠通信。相比之下，UDP尽最大努力交付，但`不保证数据的可靠性`，因此`可能会有数据丢失`的风险。
3. `效率`：由于UDP无需建立和维护连接，以及无需处理复杂的控制机制，因此`其工作效率通常比TCP高`。然而，这种效率的提升是以牺牲数据的可靠性为代价的。
4. `数据传输方式`：`TCP是面向字节流的`，它将数据视为一个无结构的字节流。而`UDP则是面向报文的`，每个UDP报文都包含完整的数据报，应用程序必须能够处理定长或不定长的报文。
5. `应用场景`：TCP因其可靠性而适用于需要确保数据完整性和顺序的应用，如`文件传输、网页浏览`等。而UDP则因其高效率适用于对实时性要求高且可以容忍部分数据丢失的应用，如`实时音视频流媒体、DNS域名解析和实时游戏`等。
6. `传输方式`: `TCP点对点`（不支持广播和多播）; `UDP一对一，一对多，多对一，多对多`





### HTTP协议的优点和缺点

优点：
1. `支持客户端/服务器模式`
2. `简单快速`：客户向服务器请求服务时，只需传送请求方法和路径。由于 HTTP 协议简单，使得 HTTP 服务器的程序规模小，因而通信速度很快。
3. `无连接`：无连接就是限制每次连接只处理一个请求。服务器处理完客户的请求，并收到客户的应答后，即断开连接，采用这种方式可以节省传输时间。
4. `无状态`：HTTP 协议是无状态协议，这里的状态是指通信过程的上下文信息。缺少状态意味着如果后续处理需要前面的信息，则它必须重传，这样可能会导致每次连接传送的数据量增大。另一方面，在服务器不需要先前信息时它的应答就比较快。
5. `灵活`：HTTP 允许传输任意类型的数据对象。正在传输的类型由 Content-Type 加以标记。

缺点：
1. 无状态：不会存储信息；
2. 明文传输：不安全；



### HTTPS

HTTPS 名字里的“S”，它把 HTTP 下层的传输协议由 TCP/IP 换成了 SSL/TLS，由“HTTP over TCP/IP”变成了 ``HTTP over SSL/TLS`` ，让 HTTP 运行在了安全的 SSL/TLS 协议上。

HTTP = `HTTP + TCP + IP + MAC`

HTTPS = `HTTP + SSL/TLS + TCP + IP + MAC`



**对称加密**: 指加密和解密时使用的密钥都是同一个，是“对称”的。只要保证了密钥的安全，那整个通信过程就可以说具有了机密性。

**非对称加密**（也叫公钥加密算法）: 它有两个密钥，一个叫公钥（public key），一个叫私钥（private key）。两个密钥是不同的，“不对称”，公钥可以公开给任何人使用，而私钥必须严格保密。`公钥加密后只能用私钥解密`

网站秘密保管私钥，在网上任意分发公钥，你想要登录网站只要用公钥加密就行了，密文只能由私钥持有者才能解密。而黑客因为没有私钥，所以就无法破解密文。



**摘要算法**近似地理解成一种特殊的压缩算法，它能够`把任意长度的数据“压缩”成固定长度、而且独一无二的“摘要”字符串`，就好像是给这段数据生成了一个数字“指纹”；这也是一种特殊的“单向”加密算法，它只有算法，没有密钥，`加密后的数据无法解密`，不能从摘要逆推出原文。

> `MD5、SHA-2`，它们就是最常用的两个摘要算法，能够生成 16 字节和 20 字节长度的数字摘要




**数字签名**：数字签名的原理其实很简单，就是把公钥私钥的用法反过来，之前是公钥加密、私钥解密，现在是`私钥加密、公钥解密`。
> 私钥只加密原文的摘要，这样运算量就小的多，而且得到的数字签名也很小，方便保管和传输。

签名和公钥一样完全公开，任何人都可以获取。但这个签名只有用私钥对应的公钥才能解开，拿到摘要后，再比对原文验证完整性，就可以像签署文件一样证明消息确实是你发的。


1. 摘要算法用来实现完整性，能够为数据生成独一无二的“指纹”，常用的算法是 SHA-2；
2. 数字签名是私钥对摘要的加密，可以由公钥解密后验证，实现身份认证和不可否认；
3. 公钥的分发需要使用数字证书，必须由 CA 的信任链来验证，否则就是不可信的；
4. 作为信任链的源头 CA 有时也会不可信，解决办法有 CRL、OCSP，还有终止信任。



### HTTP与HTTPS区别

1. HTTPS协议需要CA证书，费用较高；而HTTP协议不需要；
2. HTTP协议是超文本传输协议，信息是明文传输的，HTTPS则是具有安全性的SSL加密传输协议；
3. 使用不同的连接方式，端口也不同，HTTP协议端口是80，HTTPS协议端口是443；
4. HTTP协议连接很简单，是无状态的；`HTTPS协议是有SSL和HTTP协议构建的可进行加密传输、身份认证的网络协议`，比HTTP更加安全。


### HTTP/2的改造

- **头部压缩**: HTTP/2 并没有使用传统的压缩算法，而是开发了专门的“`HPACK`”算法：用`索引号表示重复的字符串`，采用`哈夫曼编码来压缩整数和字符串`，可以达到50%~90%的高压缩率。

- **二进制格式**: HTTP/1 里是纯文本形式的报文，HTTP/2 不再使用肉眼可见的 ASCII 码，而是向下层的 TCP/IP 协议“靠拢”，全面采用二进制格式。`二进制帧`

- **数据流**: HTTP/2 为此定义了一个流（`Stream`）的概念, 它是二进制帧的双向传输序列，同一个消息往返的帧会分配一个`唯一的流 ID`。在里面流动的是一串有先后顺序的`数据帧`，这些数据帧按照次序组装起来就是 HTTP/1 里的请求报文和响应报文。

> 多个请求 / 响应之间没有了顺序关系，不需要排队等待，也就`不会再出现“队头阻塞”问题`，降低了延迟，大幅度提高了连接的利用率

接收方使用它就可以从乱序的帧里识别出具有相同流 ID 的帧序列，按顺序组装起来就实现了虚拟的“流”。


- **服务端推送**： HTTP/2 还在一定程度上改变了传统的“请求 - 应答”工作模式，服务器不再是完全被动地响应请求，也可以新建“流”主动向客户端发送消息。


HTTP/2协议栈：`HTTP > HPack/Stream > TLS > TCP > IP > MAC`



### 常见的攻击方式

- `CSRF，跨站请求伪造`，是指`攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求`。
    1. 攻击者将支付的接口请求隐藏在 img 标签内，在加载这个标签时，浏览器会自动发起 img 的资源请求
    2. 访问页面后，表单会自动提交，相当于模拟用户完成了一次 POST 操作。
    3. 在论坛中发布的图片中嵌入恶意链接，或者以广告的形式诱导用户中招

解决方案：设置 Cookie 中的 SameSite 属性解决: `Strict：浏览器完全禁止第三方拿到 Cookie`; 同源策略，token认证；其他属性：Lax / None
> 衍生：[如何解决 Chrome Cookie Same-Site 跨域问题](https://juejin.cn/post/6980262495613091848)


- `XSS 是跨站脚本攻击`（Cross Site Scripting），为了与 CSS 区别开来，故简称 XSS。`往页面恶意的注入脚代码本`。当用户浏览该页时，嵌入其中的 Script 代码会被执行，从而达到恶意攻击用户的目的。

解决方案：过滤特殊字符，或对特定字符进行编译转码；对重要的 cookie 设置 `httpOnly`

- `DDoS 攻击`: 分布式拒绝服务攻击（Distributed Denial of Service Attack），有时候也叫“洪水攻击”。

黑客会控制许多“僵尸”计算机，向目标服务器发起大量无效请求。因为服务器无法区分正常用户和黑客，只能“照单全收”，这样就挤占了正常用户所应有的资源。

方案：`检测技术`就是检测网站是否正在遭受 DDoS 攻击，而`清洗技术`就是清洗掉异常流量。




### CDN

CDN（Content Delivery Network 或 Content Distribution Network），中文名叫“内容分发网络”。

CDN 就是专门为解决“长距离”上网络访问速度慢而诞生的一种网络应用服务。

CDN 的最核心原则是“就近访问”, 


### HTTP 1.0和 HTTP 1.1 的区别

1. `http1.0 默认使用非持久连接，而 http1.1 默认使用持久连接`。http1.1 通过使用持久连接来使多个 http 请求复用同一个 TCP 连接，以此来避免使用非持久连接时每次需要建立连接的时延。

2. 在 http1.0 中，存在一些浪费带宽的现象，例如客户端只是需要某个对象的一部分，而服务器却将整个对象送过来了，并且不支持断点续传功能，http1.1 则在请求头引入了 `range` 头域，它允许只请求资源的某个部分，即返回码是 206（Partial Content），这样就方便了开发者自由的选择以便于充分利用带宽和连接。

3. 在 http1.0 中主要使用 header 里的 If-Modified-Since、Expires 来做为缓存判断的标准，http1.1 则引入了更多的缓存控制策略，例如 `Etag`、If-Unmodified-Since、If-Match、`If-None-Match` 等更多可供选择的缓存头来控制缓存策略。

4. http1.1 相对于 http1.0 还新增了很多请求方法，如 PUT、HEAD、OPTIONS 等。




### http2的多路复用为什么会解决队头阻塞的问题？

在传统的HTTP/1.1中，由于`每个请求都需要在单独的TCP连接中按顺序发送和接收`，因此如果一个请求因为某种原因被阻塞（例如，等待服务器响应或网络拥塞），那么后续的所有请求都会受到影响，无法并行处理。这种阻塞现象被称为`队头阻塞`。

在HTTP/2中，引入了`多路复用`的概念，`它允许在同一个TCP连接中并行发送和接收多个请求和响应`。这是通过使用`帧（Frame）`作为通信的基本单位来实现的。`每个请求或响应都被拆分成多个帧，并在单个TCP连接中乱序发送。每个帧都有一个唯一的标识符，这样接收端就可以根据标识符重新组装消息，确保消息的顺序正确`。

由于HTTP/2使用了多路复用技术，`当一个请求被阻塞时，其他请求可以继续在相同的TCP连接中发送和接收`。这样，即使某个请求因为某种原因被阻塞，也不会影响到其他请求的处理。因此，队头阻塞的问题得到了解决。




### http2 下服务器主动推送和WebSocket有什么区别？

1. 协议和技术基础:
- HTTP/2 服务器推送: `HTTP/2 服务器推送是基于 HTTP/2 协议的一种机制`，它允许服务器在客户端请求资源时主动推送额外的资源给客户端。推送的资源通常是与客户端请求的资源相关联的其他资源，从而提高页面加载速度。
- WebSocket: `WebSocket 是一种独立的协议`，它建立在 TCP 上，并提供了全双工的通信通道，允许客户端和服务器之间进行实时的双向数据传输。与 HTTP/2 服务器推送不同，WebSocket 不依赖于 HTTP 协议，而是有自己的协议标准。

2. 使用场景:
- HTTP/2 服务器推送: `主要用于优化 Web 页面加载速度`。服务器可以根据客户端请求的资源，提前将可能需要的其他资源推送给客户端，从而减少客户端的等待时间，加快页面加载速度。
- WebSocket: `主要用于实时通信`，例如在线聊天、实时数据更新等场景。WebSocket 提供了一个持久的连接通道，允许客户端和服务器之间双向实时通信，而不需要客户端发起新的 HTTP 请求。

3. 连接机制:
- HTTP/2 服务器推送: 服务器推送是基于 HTTP/2 的单向通信机制。`客户端发起一个请求，服务器可以通过推送响应来发送额外的资源，但客户端不能直接在同一个连接上向服务器发送数据（静态资源）。`
- WebSocket: `WebSocket 提供了一个双向通信的持久连接`。客户端和服务器之间可以自由地发送和接收数据，而不需要依赖于 HTTP 请求-响应周期。




### post为什么会发送两次请求？

预检请求是在进行`跨域资源共享` CORS 时，由浏览器自动发起的一种 `OPTIONS` 请求。它的存在是为了保障安全，并允许服务器决定是否允许跨域请求。

跨域请求是指在浏览器中向不同域名、不同端口或不同协议的资源发送请求。出于安全原因，浏览器默认禁止跨域请求，只允许同源策略。而当网页需要进行跨域请求时，浏览器会自动发送一个预检请求，以确定是否服务器允许实际的跨域请求。

预检请求中包含了一些额外的头部信息，如 Origin 和 Access-Control-Request-Method 等，`用于告知服务器实际请求的方法和来源`。服务器收到预检请求后，可以根据这些头部信息，进行验证和授权判断。如果服务器认可该跨域请求，将返回一个包含 Access-Control-Allow-Origin 等头部信息的响应，浏览器才会继续发送实际的跨域请求。

> 使用预检请求机制可以有效地防范跨域请求带来的安全风险，保护用户数据和隐私。






### 浏览器渲染优化方案

1. `减少 HTTP 请求`：合并 CSS 和 JavaScript 文件、使用 CSS Sprites 雪碧图、图片懒加载/按需加载。

2. `优化资源加载`：使用 CDN 加载静态资源；js使用异步加载（async 和 defer）加载 JavaScript 脚本，提高页面加载速度。

3. `使用缓存`：启用浏览器缓存，使用合适的缓存策略。使用服务端缓存，如使用缓存服务器、CDN 缓存等。

4. `DOM 操作优化`：减少 DOM 操作，尽量在 JavaScript 中减少对 DOM 的访问和修改。使用事件委托来减少事件处理器的数量，提高性能。

5. `CSS 和样式优化`：避免使用昂贵的 CSS 选择器，如后代选择器和通配符选择器。使用 CSS3 动画代替 JavaScript 动画，以利用硬件加速。使用 CSS3 Transform 和 CSS3 Transition 来优化动画效果。

6. `JavaScript 优化`：避免使用全局变量，使用局部变量或模块化的方式来管理变量。尽量减少 JavaScript 的执行时间，避免长时间的脚本执行。使用事件委托来优化事件处理，减少事件处理器的数量。

7. `图像优化`：使用适当的图像格式，如 PNG、JPEG、WebP 等。使用适当的图像尺寸和质量，避免图像过大导致加载缓慢。

8. `响应式设计和移动优化`：使用响应式设计来适配不同设备和屏幕大小。优化移动端页面加载速度，减少不必要的资源加载和功能。

9. `性能监控和分析`：使用性能分析工具和浏览器开发者工具来检查和分析网页性能问题。监控网站性能指标，如页面加载时间、资源加载时间、渲染时间等，及时发现和解决性能问题。



## 小程序


### mpvue 原理是什么？

mpvue 是一个使用 Vue.js 开发小程序的前端框架。

- mpvue 的底层是基于 Vue.js 构建的，因此它继承了 Vue.js 的语法和特性，开发者可以使用 Vue.js 的语法来开发小程序; 支持使用 Vue 的组件化开发；

- mpvue保留了Vue的核心方法，继承了Vue.js的基础能力；`mpvue-template-compiler`提供了将Vue的模板语法转换到小程序的wxml语法的能力；

- mpvue还修改了Vue的建构配置，使之构建出符合小程序项目结构的代码格式，包括json、wxml、wxss和js文件;

- mpvue的实现原理是`将小程序的功能托管给Vue.js，在正确的时机将数据变更同步到小程序`，从而达到开发小程序的目的; 开发者可以参照Vue.js编写与之对应的小程序代码，`小程序负责视图层展示，所有业务逻辑收敛到Vue.js中，Vue.js数据变更后同步到小程序`。



### 小程序与普通网页开发的区别

网页开发中渲染线程和 JavaScript 线程是互斥 的。即这两个线程不能够穿插执行，必须串行。当其中一个线程执行时，另一个线程只能挂起等待。这也是 JavaScript线程占用主线程时间过长，可能会导致页面失去响应 的原因。

而在小程序中，二者是分开的，分别运行在不同的线程中，即`渲染线程和逻辑线程`。
> 渲染线程使用 WebView 进行 UI 的渲染呈现，逻辑层是用 JavaScript 引擎运行逻辑代码; 小程序的渲染层和逻辑层之间的通信并不是直接传递数据或事件，而是由 Native(微信客户端) 作为中间媒介进行转发。逻辑层发送网络请求也是经由 Native 转发。逻辑层运行在 JSCore 中，并没有一个完整浏览器对象，因而缺少相关的DOM API和BOM API。

​网页开发者需要面对的环境是各式各样的浏览器，PC 端需要面对 IE、Chrome、QQ浏览器等，在移动端需要面对Safari、Chrome以及 iOS、Android 系统中的各式 WebView 。而小程序开发过程中需要面对的是两大操作系统 iOS 和 Android 的微信客户端，以及用于辅助开发的小程序开发者工具


### 小程序解决了什么问题？

1. 小程序的展示是`原生与webview的混合`，原生的组件，毫无疑问比webview的有优势；在web开发中, 渲染线程和脚本线程是互斥的；而小程序将他们`分别运行在不同的线程中`，这样就不会互相影响。特别是针对首屏，优势会更加明显。

2. web资源离线存储：通过使用微信离线存储，Web 开发者可借助微信提供的资源存储能力，直接从微信本地加载 Web 资源而不需要再从服务端拉取，从而减少网页加载时间，为微信用户提供更优质的网页浏览体验。

3. 强大的原生能力，拍照，蓝牙，客服等：小程序直接将`JS-JDK`内置在api中，而且扩展了一些，使得小程序的原生能力更加强大


### 小程序缺点

1. 过度依赖微信的底层，遇到问题只能等待官方修复；
2. es6, npm，typescript等，在web端"火爆"一两年后，小程序才逐步引入；
3. 包大小，审核机制，各种资质，页面栈不能超过10个等，这些经常成为开发，或者是业务上的障碍



### 小程序与 H5 的不同

1. 运行环境的不同
- 传统的 H5 的运行环境是浏览器，其中浏览器提供 window、document 等 BOM 对象；
- 小程序的逻辑层和渲染层是分开的，逻辑层运行在 `JSCore` 中，并没有一个完整的浏览器对象，所以缺少相关的 `DOM API 和 BOM API`。

2. 开发成本的不同
- H5 的开发，涉及到开发工具、前端框架、模块管理工具、任务管理工具、UI 库的选择、接口调用工具及浏览器兼容性等；
- 小程序的开发，指定环境的小程序会提供开发者工具、API 及规范的开发标准。由于小程序是跑在指定的环境下的，同时 API 是指定环境下提供的，所以不用考虑浏览器的兼容性。

3. 使用体验的不同
- H5 页面需要在浏览器中渲染，在复杂的业务逻辑或者丰富的页面交互时会有卡顿情况；
- 小程序除首次使用略慢，页面切换及跳转等非常顺滑，接近 Native。





## 其他



### npm vs yarn vs pnpm 区别？

npm、yarn和pnpm都是用于Node.js项目的包管理工具，它们都有一些共同点，如安装、更新和管理项目的依赖项。

- npm: 嵌套结构的依赖
1. 依赖包重复安装
2. 嵌套层级太深


- yarn: 扁平化目录结构

yarn 虽然在 npm 之上做出了一定的创新和相应的改进，但是在依赖包管理方式上还是借鉴的 npm 的扁平化 node_modules 方式，并没有解决 npm 相应的痛点。


- pnpm 在依赖包管理方式上完全舍弃了 npm 的那一套，利用`符号链接的方式`重新设计了 node_modules 的结构来处理扁平化带来的问题。


1. `安装速度和性能`：pnpm通常被认为是最快的，因为它采用了`只下载必需的模块`的方法，而不是下载整个依赖树。此外，`pnpm还可以并行下载模块`，从而进一步提高下载速度。yarn也使用并行安装和缓存机制来提高安装速度，尤其是当之前已经安装过某个软件包时，yarn会从缓存中获取，而不是重新下载。相比之下，npm按照队列依次安装每个包，安装速度可能较慢。

2. `磁盘空间占用`：由于pnpm只下载必需的模块，并且`使用硬链接来减少空间占用`，因此它的磁盘空间占用通常比npm和yarn小。yarn也会缓存已安装的包，从而避免重复下载，但它不会像pnpm那样使用硬链接。`npm则会为每个安装的包创建一个新的目录，这可能导致磁盘空间占用较大`。

3. `兼容性和可靠性`：npm是Node.js的官方包管理器，因此它具有最好的兼容性。yarn和pnpm都与npm兼容，但在使用旧版本的Node.js时可能会遇到一些问题。yarn被认为比npm和pnpm更可靠，因为它使用了`多线程下载和安装`，减少了下载和安装失败的风险。此外，yarn还使用锁定文件（如yarn.lock）来确保安装的模块与项目的依赖项相匹配，这也有助于提高可靠性。

4. `功能和扩展性`：yarn提供了一些额外的功能，如缓存、自动解析和自动重试等，这些功能可以提高开发效率。npm和pnpm也有一些额外的功能，但它们的功能不如yarn丰富。此外，yarn和pnpm都支持插件系统，可以通过安装插件来扩展其功能。











### 一次请求大量数据怎么优化，数据多导致渲染慢怎么优化?

1. 数据分片处理, 分页
2. 虚拟列表



### 从页面 A 打开一个新页面 B，B 页面关闭后，如何通知 A 页面？

[https://mp.weixin.qq.com/s/VfZuyFDDkxHWADl443KFKw](https://mp.weixin.qq.com/s/VfZuyFDDkxHWADl443KFKw)

方案：postmessage、localStorage（需同源）、WebSocket。。。

`onbeforeunload`: 在即将离开当前页面(刷新或关闭)时执行
> 页面正常关闭时，会先执行 window.onbeforeunload ，然后执行 window.onunload ，我们可以在这两个方法里向 A 页面通信





### 衍生：B 页面意外崩溃，又该如何通知 A 页面？

> Service Worker 有自己独立的工作线程，与网页区分开，网页崩溃了，Service Worker 一般情况下不会崩溃；Service Worker 生命周期一般要比网页还要长，可以用来监控网页的状态；网页可以通过 `navigator.serviceWorker.controller.postMessage` API 向掌管自己的 SW 发送消息

```
B 页面加载后，通过 postMessage API 每 5s 给 sw 发送一个心跳，表示自己的在线，sw 将在线的网页登记下来，更新登记时间；
B 页面在 beforeunload 时，通过 postMessage API 告知自己已经正常关闭，sw 将登记的网页清除；
如果 B页面在运行的过程中 crash 了，sw 中的 running 状态将不会被清除，更新时间停留在奔溃前的最后一次心跳；
A 页面 Service Worker 每 10s 查看一遍登记中的网页，发现登记时间已经超出了一定时间（比如 15s）即可判定该网页 crash 了。
```


### 后端一次性返回10万条数据给你，你如何处理？

1. 使用定时器分组分批分堆依次渲染（定时加载、分堆思想）
2. 使用 requestAnimationFrame 替代定时器去做渲染: 优化页面卡顿，解决定时器太多资源浪费
3. 搭配分页组件，前端进行分页；或者滚动触底加载；
4. 使用无限加载/虚拟列表进行展示
5. 开启多线程Web Worker进行操作



### 当页面使用级联选择器，数据比较多时页面会卡顿，怎么优化？

当页面使用级联选择器（如常见的省市区选择器）并且数据较多时，确实可能会出现页面卡顿的情况。这种情况通常是由于浏览器渲染大量DOM元素、执行大量JavaScript代码或处理大量数据导致的。

1. 虚拟滚动（Virtual Scrolling）：

虚拟滚动是一种技术，`它只渲染可视区域内的元素，而不是一次性渲染所有元素`。当用户滚动时，它会动态地加载和卸载DOM元素，从而显著提高性能。

2. 分页加载（Pagination）：

对于级联选择器，可以考虑分页加载数据。例如，当用户选择省份后，再加载对应省份的城市列表，而不是一次性加载所有城市。

3. 延迟加载（Lazy Loading）：

延迟加载是另一种技术，它只在需要时才加载数据。例如，当用户开始滚动到某个区域时，才开始加载该区域的数据。


4. 使用Web Workers：

Web Workers允许在后台线程中运行JavaScript，从而不会阻塞主线程。可以将数据处理逻辑（如数据转换、排序等）放在Web Worker中执行，避免阻塞UI渲染。

5. 缓存数据：

如果数据不经常变化，可以考虑缓存数据。这样，当用户再次访问相同的选项时，可以直接从缓存中获取，而不需要重新加载。

6. 减少渲染次数：

使用CSS的display: none或visibility: hidden来隐藏不需要显示的元素，而不是频繁地添加和删除DOM元素。



### 虚拟滚动的原理是什么？

在虚拟滚动中，`根据当前可视区域的高度，计算并渲染显示的数据量，而对超出视口之外的数据则不进行渲染`。

这样可以确保每一次滚动渲染的DOM元素都是可控的，不会一次性渲染过多数据，也不会发生数据堆积的问题。这种技术有助于提高数据处理的效率和性能，特别是在处理大量数据时，可以显著提升用户体验。



### 前端怎么处理菜单权限校验？

1. 前端拿到用户身份，判断用户权限；
2. 遍历路由菜单数组，根据用户权限，生成一个动态菜单列表；权限校验从高到低：超管 》管理员 》 普通
3. 同时在路由守卫那里也添加权限校验判断



### vuex的源码实现原理？

在源码层面，Vuex 利用 Vue 的响应式系统（Observer、Dep、Watcher）来监听和触发状态的改变。Vuex 的状态管理实际上是一个 Vue 实例，它的 state 是一个响应式对象。当调用 mutation 方法时，Vue 的响应式系统会自动更新所有依赖于这个状态的组件。

- `状态管理`：Vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。这使得我们能够直接地定位任一特定的状态片段，也能在调试的过程中进行高效的状态快照管理。

- `状态改变`：Vuex 的状态改变的唯一途径就是显式地提交 (commit) mutation。这个规则确保了视图和网络请求都不能直接改变状态，这使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用

- `模块`：由于使用单一状态树，应用的所有状态会集中到一个比较大的对象中。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。为了解决这个问题，Vuex 允许我们将 store 分割成模块（modules）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割。

- `插件`：Vuex 允许你使用 store.plugin 方法安装插件，以扩展 Vuex 的功能


Vuex的源码主要做了什么：

1. 首先肯定是要定义一个install方法，因为我们是通过Vue.use(Vuex)进行安装，那这个方法具体都做了什么呢？我们回顾下源码发现：

先是初始化全局变量Vue,之后获取这个传入的Vue的$options参数里的store，最后是通过一层层往上查询的方式实现所有组件都挂载了store，这样我们就能在所有组件中通过this.$store获取生成的Store对象了；

2. 之后就是Store实例的初始化：首先是初始化一些内部变量，然后生成ModuleCollection实例_module；之后就是调用installModule方法，通过递归注册所有模块；

3. 之后就是调用resetStoreVM方法注册vm：对所有已经注册的getters、state设置代理监听，通过给store生成一个Vue实例_vm，来实现数据变化的动态更新，其实说白了还是用了Vue的双向数据绑定来实现数据的响应更新




### AngularJS中的脏检查原理？

AngularJS中的脏检查（Dirty Checking）是一种机制，它基于AngularJS的数据绑定和监控机制，实现了自动化的UI更新。脏检查机制的核心是digest循环，当AngularJS启动时，它会自动调用apply函数来开始脏检查循环。

apply函数会检查当前scope对象中所有绑定到属性的watcher函数，如果属性的值发生了变化，它会执行watcher函数，以便更新UI界面。这个过程`会递归地检查所有的watch表达式，直到model值不再发生变化`，此时浏览器会重新渲染DOM来体现model的改变。

需要注意的是，AngularJS并不是周期性触发脏检查，`只有当view中事件、ajax请求或者timeout延迟事件等触发时，才会开始脏检查`。因此，脏检查机制能够确保只有在数据实际发生变化时才进行UI更新，提高了性能和效率。



### 大文件的分片上传和断点续传怎么做的？

- **分片上传：**

1. 将需要上传的大文件按照一定的分割规则，分割成相同大小的数据块。
2. 初始化一个分片上传任务，返回本次分片上传的唯一标识。
3. 按照一定的策略（串行或并行）发送各个分片数据块。


- **断点续传：**

1. 前端（客户端）需要根据固定大小对文件进行分片，请求后端（服务端）时要带上分片序号和大小。
2. 服务端创建conf文件用来记录分块位置，conf文件长度为总分片数，每上传一个分块即向conf文件中写入一个标识，那么没上传的位置就是默认的标识，已上传的就是另一标识（这步是实现断点续传和秒传的核心步骤）。
3. 服务器按照请求数据中给的分片序号和每片分块大小（分片大小是固定且一样的）算出开始位置，与读取到的文件片段数据，写入文件。
4. 当文件下载中断在续传时，判断小文件名称若存在则不存了，此时还需要判断文件若不是最后一个分片则大小为缓冲区固定大小，若没达到则证明小文件没传完需要重新传输。




- **git rebase  和 git merge 的区别？**

1. Git Merge：合并操作会创建一个新的合并提交（merge commit），将两个分支的历史记录合并在一起。这样会保留每个分支的提交历史，产生一个合并节点，它显示了两个分支的合并点；用 merge 拉取远程变更的结果是，每次你想获取项目的最新进展时，都会有一个多余的 merge 提交；

rebase 通常用于重写提交历史, 使用 rebase 可以使我们保持一个线性且更加整洁的提交历史；

2. Git Merge：合并操作不会改变提交历史，因此是一种相对安全的合并方式。Git Rebase：重新基于操作会重写提交历史，可能会造成团队协作时的混乱，特别是在公共分支上使用时

3. Git Merge：通常用于合并独立的开发分支或者在合并时不需要修改历史记录的情况。适合在公共分支上进行合并操作。Git Rebase：通常用于将一个分支的更改整合到另一个分支上，并且保持项目历史记录的整洁和线性。适合在私有分支上进行整理提交历史操作。



- `Promise.resolve()`: 创建一个 Promise 实例，将 Promise 实例设置为 resolve 状态，这个 Promise.resolve() 是同步的，且该 Promise 已经完成了



### 页面怎么做强制刷新？

`location.reload(true)`, `<meta http-equiv="refresh" content="0">`, `Ctrl + F5`




### 前端性能优化

1. `图片资源优化：`
    - 图片压缩：png, webp
    - 响应式图片: 媒体查询，不同的窗口大小、不同设备像素下来展示不同图片
    - 图片延迟加载：在真实的图片加载出来之前，先展示默认图片
    - 小图标：webfont，base64，雪碧图
    - 懒加载：滚到到视图再加载
    - 预加载：将所需要的资源提前加载到浏览器本地，后面在需要的时候可以直接从浏览器的缓存中获取，而不用再重新开始加载：`preload，prefetch， preconnect，prerender`

2. `HTML的优化方法：`
    - 减少html的嵌套层级关系
    - 减少一些无语义的代码，删除多余的空格，换行符，缩进和不必要的注释（打包工具会处理）
    - css文件链接尽量放在页面头部：css加载不会阻塞DOM Tree解析，但是会阻塞DOM Tree渲染，也会阻塞后面js执行。`css放在页面底部会导致页面白屏时间变长`。
    - js文件一般放在页面底部: 这是`防止js的加载和解析阻塞页面元素的正常渲染`
    - 动画优化：延迟加载，css动画>js动画
    - 减少页面回流和重绘
    - 简化DOM操作
    - 静态文件压缩工具

3. `接口服务调用优化：`
    - 接口合并
    - 接口监控：弱网，超时，网络异常，网络切换等情况
    - 接口缓存优化




### 说一下在平时的前端业务中，在技术层面上做过哪些优化？

> 以提高用户体验、加快页面加载速度和提升系统性能~

- `性能优化：`
1. `代码压缩与合并`：利用如UglifyJS、Terser等工具对JavaScript代码进行压缩，减少文件大小，提高加载速度。同时，通过Webpack等模块打包工具合并多个文件，减少HTTP请求次数。
2. `图片优化`：使用适当的图片格式（如WebP、JPEG、PNG等），根据图片内容选择合适的压缩级别。利用CDN加速图片加载，对图片进行懒加载，以减少不必要的带宽消耗和提高页面加载速度。
3. `缓存策略`：利用HTTP缓存机制，设置合适的缓存头（如Cache-Control、ETag等），减少服务器请求次数，提高页面加载速度。同时，使用浏览器缓存（如localStorage、sessionStorage）存储常用数据，减少网络请求。
4. `异步加载`：将非关键代码和资源进行异步加载，如使用async和defer属性加载JavaScript脚本，使页面能够更快地呈现给用户。

- `用户体验优化：`
1. `响应式设计`：使用媒体查询和流式布局等技术，确保应用在不同设备和屏幕尺寸上都能良好地显示和交互。
2. `动画与过渡`：利用CSS3动画和过渡效果，提高应用的交互性和用户体验。同时，注意控制动画的复杂度和性能开销，避免影响页面性能。
3. `错误处理与反馈`：合理处理页面错误和异常，给予用户友好的提示和反馈，提升用户体验。

- `代码质量优化：`
1. `模块化与组件化`：将代码拆分为可复用的模块和组件，提高代码的可维护性和可重用性。
2. `代码规范与文档`：遵循统一的代码规范，使用ESLint等工具进行代码检查，确保代码质量。同时，编写详细的文档和注释，方便其他开发人员理解和维护代码。
3. `测试与调试`：编写单元测试和集成测试，确保代码的正确性和稳定性。使用浏览器的开发者工具进行调试和性能分析，定位和解决潜在问题。

- `技术选型与创新`：
1. `选择合适的技术栈`：根据项目需求和团队能力，选择合适的前端技术栈，如React、Vue、Angular等，确保项目的顺利进行。
2. `引入新技术`：关注前端技术的发展趋势，积极引入新技术和工具，如WebAssembly、WebGPU等，提升应用的性能和功能。


### 前端开发中怎么改进开发流程？怎么提高开发效率？

**改进开发流程**

- `代码规范与约定：`
    1. 制定并遵循一致的代码规范，包括命名规范、缩进风格、注释风格等。
    2. 使用代码审查（Code Review）工具，确保代码质量，同时分享和学习更好的编码实践。
- `模块化与组件化：`
    1. 将代码拆分为独立的模块或组件，每个模块或组件负责单一的功能或视图。
    2. 使用前端框架（如React、Vue、Angular等）提供的组件化开发方式，提高代码复用性和可维护性。
- `版本控制：`
    1. 使用Git等版本控制系统，管理代码的变更历史，方便协作和追踪问题。
    2. 定期进行代码合并（Merge）和冲突解决，保持代码库的整洁和一致性。
- `自动化构建与部署：`
    1. 设置自动化构建流程，使用如Webpack、Rollup等构建工具，自动打包和压缩代码。
    2. 实现持续集成（CI）和持续部署（CD），自动运行测试、构建和部署流程，减少手动操作。
- `测试：`
    1. 编写单元测试和集成测试，确保代码的正确性和稳定性。
    2. 使用测试覆盖率工具，确保关键代码都有对应的测试。


**提高开发效率**

- `使用合适的工具：`
    1. 选择高效的编辑器（如VS Code、WebStorm等）和调试工具。
    2. 利用代码片段（Snippets）和快捷键，加速编码过程。

- `代码重用与库的使用：`
    1. 避免重复造轮子，尽量使用现有的库和框架，减少重复劳动。
    2. 对于常用功能，可以封装成自定义的库或工具函数，方便在其他项目中复用。

- `状态管理：`
    1. 使用状态管理库（如Redux、Vuex等），管理应用的状态，避免复杂的组件间通信。
    2. 结合Context API或React Hooks等特性，简化状态管理逻辑。

- `性能优化：`
    1. 对代码进行性能分析和优化，减少不必要的计算和渲染。
    2. 使用懒加载、代码分割等技术，提高页面加载速度。

- `团队协作：`
    1. 划分清晰的职责和任务，确保团队成员能够高效协作。
    2. 定期进行技术分享和讨论，共同学习和成长。

- `知识积累与分享`
    1. 建立技术文档和知识库，方便团队成员快速查找和解决问题。
    2. 鼓励团队成员分享自己的技术经验和解决方案，提高团队整体技术水平。


### 如何减少卡顿?

- 不要阻塞主线程：使用异步任务，promise/async/settimeout/requestIdleCallback
- 减少长耗时：任务拆分




### 前端首屏性能优化

- `资源加载优化`
1. 减少资源大小：代码压缩，Gzip, 图片压缩，代码拆分
2. 减少http请求次数：http强缓存，service worker, 本地存储，合并请求
3. 提高http请求响应速度：cdn, http协商缓存，DNS预解析(dns-prefetch)，http2
4. 优化资源加载时机：按需加载，懒加载，预加载（preload）
5. 优化资源内容加载方式：客户端h5离线包，内容直出

- `页面渲染优化`
1. 优化html代码：js外链放底部，css外链放顶部，减少dom数量
2. 优化js,css代码：使用webworker, 长任务拆分子线程，减少重排重绘，降低css选择器复杂度
3. 优化动画效果：使用requestAnimationIframe, 使用transtion和opacity, 使用will-change或translateZ来调用合成图层




### WebView性能优化

- 减少首次打开WebView的时间：`在客户端启动的时候，就初始化一个全局的WebView待用`，当用户访问Webview的时候直接使用这个WebView加载对应网页；
- 导航栏预加载：和webview并行一起加载；
- 统一在Webview中设置cookie：初始化Webview的时候判断是否登录，如果登录了就打开H5页面，如果没登录就自动跳转登录页面；
- 减少页面的白屏时间：webview加载页面的url尽量前置，不要放在最后，可以和业务逻辑并行处理
- js-sdk优化：oc和js通信方式：scheme, iframe, webkit
- 浏览器缓存策略



### H5离线化的实现方式

1. 首先会加载一个全局的包就是一些基础的文件，加载之后会把包释放放在内存里；
2. 接着会做一个检测，查看本地是否安装，如果已经安装就释放到内存，如果没有安装就触发离线包的下载；
3. 就是我们做好的包放在服务器中，然后从服务器获取过来，在下载之前会进行一个本地和线上版本的对比，版本不一致的话就会下载最新的包，如果一致就取本地的就可以了。
4. 最终这个包会解压释放在内存里面，当webview在加载url的时候会直接从内存里面读取，如果能读取到就加载内存中的页面数据进行展示，假设读取不到也就是说本地没有这个业务就会使用线上的url地址让页面加载就可以了。

从服务器请求的离线包信息存储到本地数据库的过程中，离线包信息包括离线包的下载地址，离线包版本号，加密签名信息等，`安装离线包其实就是将离线包从下载目录拷贝到手机安装目录`。


### 移动端优化方式? 离线包是如何实现的?

移动端优化方式：`代码优化，图片优化，网络请求优化，利用缓存，使用CDN，响应式设计，减少DOM操作`

`离线包（Offline Package）`的实现，它主要是一种用于移动端应用的优化技术，旨在提高应用的启动速度和用户体验。离线包包含了应用所需的一些`静态资源`，如HTML、CSS、JavaScript、图片等，这些资源在应用安装或首次启动时下载到本地，之后用户就可以在没有网络连接的情况下访问这些资源。

离线包的实现通常包括以下几个步骤：
1. `资源打包`：将应用所需的静态资源打包成一个或多个离线包文件。这些文件可以是压缩的，以减小文件大小。
2. `下载与存储`：在应用安装或首次启动时，从服务器下载离线包文件，并存储在设备的本地存储中。
3. `版本控制`：为离线包添加版本号，以便在应用更新时能够判断是否需要重新下载离线包。
4. `资源加载`：当应用需要加载某个资源时，首先检查本地存储中是否有对应的离线包文件。如果有，则直接从离线包中加载资源；否则，从网络加载资源。
5. `更新机制`：当服务器上的离线包文件更新时，应用可以通过某种机制（如`轮询、推送通知等）检测到更新`，并提示用户下载新的离线包。





### h5页面怎么嵌在native里面，怎么设置沉浸式等样式？

1. 使用`WebView`: 在原生应用中，你可以使用WebView组件来加载和显示H5页面
2. 加载H5页面: 你可以通过WebView加载本地的H5页面（存储在应用的资源文件夹中）或远程的H5页面（通过URL加载）。

**设置沉浸式样式**: 通过原生app提供的js sdk设置



### node.js写接口怎么统计收集报错情况？

- `使用日志库`：使用像`pino`或`bunyan`这样的日志库，它们提供了丰富的日志级别（如`debug、info、warn、error`等）和格式化选项。
> 在代码中捕获错误并使用这些库记录错误信息。可以将日志输出到控制台、文件或远程日志系统。

- `自定义错误处理中间件`：如果你的应用是基于Express或其他框架构建的，可以创建一个自定义的错误处理中间件来捕获和处理未捕获的异常。
> 在这个中间件中，你可以记录错误信息，并返回适当的错误响应给客户端。

- `使用错误追踪服务：` 服务如`Sentry`、New Relic或Datadog等提供了强大的错误追踪功能。这些服务可以集成到你的Node.js应用中，自动捕获和报告错误。它们通常提供了详细的`错误堆栈、用户信息、环境数据`等，有助于快速定位问题。

- `集成监控工具：` 使用像Prometheus、Grafana或Zabbix这样的监控工具来监控你的Node.js应用的性能和健康状况。这些工具可以收集各种指标，包括错误率、响应时间、内存使用情况等。通过`设置警报`，你可以在错误率上升或性能下降时及时得到通知。

- `主动测试和模拟错误`：通过编写单元测试和集成测试来验证你的代码是否能够正确处理各种错误情况。


**报错通知客户端：**

HTTP状态码、错误响应体、自定义错误处理中间件



### 单点登录怎么做？


**普通登录**

通过登录页面根据用户名查询用户信息，判断密码是否正确，正确则将用户信息写到session，访问的时候通过从session中获取用户信息，判断是否已登录，登录则允许访问。

`缺点`：由于session不能共享，服务越来越多，并且还服务还搭建集群，导致每访问另外一个服务都需要重新登录。


**SSO (single sign on) 单点登录**

通过单点登录可以让用户只需要登录一次软件或者系统，那么`同系统下的平台都可以免去再次注册、验证、访问权限的麻烦程序`，通俗易懂的理解为一次性登录也可以一次性下线。



**域名结构**

`email.google.com`：`子域名(主机名).二级域名.顶级域名`

如主域名`example.com`，`www.example.com、blog.example.com和shop.example.com`都是其子域名。
> 在技术上，这些子域名通常指向不同的服务器或网站内容，但它们都属于同一个主域名；但会有同源策略限制

`同源策略`: 协议（如http或https）、域名（即网站地址）和端口号（如80或443）都相同


**不同域名下的单点登录**

1. 用户登录子系统 a.com 时未登录，跳转到 sso.com 登录界面，成功登录后，SSO 生成一个 `ST （service ticket ）`;
2. 然后重定向 `a.com?ticket=123` 带上授权码 ticket，并将认证中心 sso.com 的登录态写入 Cookie; 在 a.com 服务器中，拿着 ticket 向认证中心确认，授权码 ticket 真实有效; 
3. 验证成功后，服务器将登录信息写入 Cookie（此时客户端有 2 个 Cookie 分别存有 a.com 和 sso.com 的登录台）。

4. 认证中心登录完成之后，继续访问 a.com 下的其他页面：这个时候，由于 a.com 存在已登录的 Cookie 信息，所以服务器端直接认证成功。

5. 如果认证中心登录完成之后，访问 b.com 下的页面：由于认证中心存在之前登录过的 Cookie，所以也不用再次输入账号密码，直接下发 ticket 给 b.com 即可。

用户登录不同的域名时，都会跳转到 SSO，然后 SSO 带着 ST 返回到不同的子域名，子域名中发出请求验证 ST 的正确性（防止篡改请求）。验证通过后即可完成不同的业务。



**SSO 机制实现方式**

实现单点登录的关键在于，如何让 Token 在多个域中共享。


- 父域cookie

Cookie 的作用域由 `domain` 属性和 `path` 属性共同决定。domain 属性的有效值为`当前域或其父域的域名/IP地址`; path 属性的有效值是以“/”开头的路径。

将 Cookie 的 `domain 属性设置为父域的域名（主域名），同时将 Cookie 的 path 属性设置为根路径`，这样所有的子域应用就都可以访问到这个 Cookie 了.
> 要求应用系统的域名需建立在一个共同的主域名之下，如 tieba.baidu.com 和 map.baidu.com，它们都建立在 baidu.com 这个主域名之下，那么它们就可以通过这种方式来实现单点登录。


- 认证中心

认证中心就是一个专门负责处理登录请求的独立的 Web 服务。

用户统一在认证中心进行登录，登录成功后，认证中心记录用户的登录状态，并将 Token 写入 Cookie。（注意这个 Cookie 是认证中心的，应用系统是访问不到的）

> 此种实现方式相对复杂，支持跨域，扩展性好，是单点登录的标准做法。


**SSO 单点登录退出**

在每一个产品在向认证中心验证 ticket(token) 时，其实可以顺带将自己的退出登录 api 发送到认证中心。

当某个产品 c.com 退出登录时：清空 c.com 中的登录态 Cookie。请求认证中心 sso.com 中的退出 api。认证中心遍历下发过 ticket(token) 的所有产品，并调用对应的退出 api，完成退出。




### 前端中使用虚拟列表滚动过快时会出现页面抖动的情况吗

> 在前端中使用虚拟列表时，滚动过快确实可能会出现页面抖动的情况。这主要是因为虚拟列表通过只渲染可视区域内的列表项来优化性能，当滚动速度过快时，列表的渲染和更新可能跟不上滚动的速度，导致页面出现抖动或跳动的现象。

1. 优化渲染性能：尽量减少每次渲染的计算量，使用高效的渲染技术，如使用`requestAnimationFrame`代替setTimeout或setInterval进行动画渲染，避免不必要的重绘和回流。
2. 预加载和缓存：在滚动过程中，可以`预加载`一些即将进入可视区域的列表项，或者在内存中缓存已经渲染过的列表项，以减少渲染时的计算量。
3. 使用`防抖和节流`：对于滚动事件的处理，可以使用防抖（debounce）或节流（throttle）技术来限制事件处理的频率，避免过于频繁的事件处理导致性能问题。
4. 滚动优化：考虑使用原生滚动或者自定义滚动实现，并优化滚动性能，如使用will-change属性或者`transform属性进行滚动动画，减少重排和重绘`。
5. 调整滚动容器的大小：如果可能的话，适当调整滚动容器的大小，使其与可视区域匹配或接近，这样可以减少滚动时计算量，降低抖动的可能性。




### 封装一个虚拟滚动列表组件需要做哪些事情？

1. `理解虚拟滚动原理`：虚拟滚动是一种优化技术，它`只渲染可视区域内的列表项，对于非可视区域的列表项则不进行渲染`，从而极大地提高了大量数据列表的性能和响应速度。
2. `定义组件接口`：确定组件的输入和输出。输入可能包括列表数据、每行的高度、可视区域的高度等；输出可能包括滚动事件、点击事件等。
3. `实现滚动容器`：创建一个可以滚动的容器，并设置其高度和样式。这个容器将用于容纳可视区域内的列表项。
4. `计算可视区域和列表项`：根据滚动容器的高度和每行的高度，计算出可视区域内可以显示的列表项数量。同时，也需要计算出总的列表项数量，以便在滚动时能够正确地更新可视区域内的列表项。
5. `实现滚动监听`：监听滚动容器的滚动事件，当滚动发生时，`根据滚动的距离计算出当前应该显示的列表项`，并更新可视区域内的列表项。
6. `渲染列表项`：使用Vue的模板或render函数来渲染列表项。注意，只需要渲染可视区域内的列表项，对于非可视区域的列表项，不需要进行渲染。
7. `优化性能`：注意在组件的生命周期钩子中进行必要的优化，如使用Vue的v-show或v-if来避免不必要的渲染，使用computed属性来进行高效的计算等。
8. `处理边界情况`：考虑处理一些边界情况，如列表数据为空、滚动到顶部或底部时的特殊处理等。
9. `编写文档和示例`：为你的组件编写清晰的文档，说明如何使用它以及它的各种属性和事件。同时，提供一个或多个示例，以便其他开发者能够更容易地理解和使用你的组件。
10. `测试`：对你的组件进行充分的测试，确保它在各种情况下都能正常工作。这包括单元测试、集成测试以及实际项目中的使用测试。



### 哪些场景不需要使用防抖节流?

1. `一次性的或低频触发的事件`：如果某个事件只会在特定条件下触发一次，或者触发频率非常低，那么通常不需要使用防抖或节流。
2. `实时性要求非常高的场景`：在某些需要实时响应用户操作的场景中，如实时搜索、实时渲染等，使用防抖或节流可能会导致响应延迟，影响用户体验。
3. `性能影响不大的场景`：如果事件处理函数的执行对性能的影响非常小，或者可以通过其他方式优化性能（如使用Web Workers进行后台处理），那么可能不需要使用防抖或节流。




### url为www.baidu.com的A页面里面嵌套了一个url为www.zhihu.com的iframe页面B，那么B页面发送请求的时候能拿到A页面的cookie信息吗？




### 移动端跨平台开发


#### React Native

> Facebook 出品，JavaScript语言，JSCore引擎，React设计模式，原生渲染。

使用 React 来创建 Android 和 iOS 的原生应用。

react native 用了 react 的设计模式，但UI渲染、动画效果、网络请求等均由原生端实现。开发者编写的js代码，通过 react native 的中间层转化为原生控件和操作。

`总结起来其实就是利用 JS 来调用 Native 端的组件，从而实现相应的功能。`

react native 的跨平台是实现主要由三层构成，其中 C++ 实现的动态连结库(`.so`)，作为`中间适配层`桥接，实现了`js端`与`原生端`的双向通信交互。

- 和前端开发不同，react native 所有的标签都不是真实控件，JS代码中所写控件的作用，类似 Map 中的 key 值。JS端通过这个 key 组合的 Dom ，最后Native端会解析这个 Dom ，得到对应的Native控件渲染，如 Android 中`<view>` 标签对应 `ViewGroup` 控件。

- 在 react native  中，JS端是运行在独立的线程中（称为JS Thread ）。JS Thread 作为单线程逻辑，不可能处理耗时的操作。那么如 `fetch 、图片加载 、 数据持久化` 等操作，在 Android 中实际对应的是 okhttp 、Fresco 、SharedPreferences等。而跨线程通信，也意味着 Js Thread 和原生之间交互与通讯是异步的。


**通信**：跨平台的关键在于C++层，开发人员大部分时候，只专注于JS 端的代码实现。 在原生端提供的各种 Native Module 模块（如网络请求，ViewGroup控件），和 JS 端提供的各种 JS Module（如JS EventEmiter模块），都会在C++实现的so中保存起来，双方的通讯通过C++中的保存的映射，最终实现两端的交互。



#### WEEX

> Alibaba 出品，JavaScript语言，JS V8引擎，Vue设计模式，原生渲染

支持Vue和Rax两个框架，支持 `web、android、ios` 三端，原生端同样通过中间层转化，将控件和操作转化为原生逻辑来提高用户体验。

在 weex 中，主要包括三大部分：`JS Bridge、Render、Dom`，分别对应`WXBridgeManager、WXRenderManager、WXDomManager`，三部分通过`WXSDKManager`统一管理。其中 JS Bridge 和 Dom 都运行在独立的 HandlerThread 中，而 Render 运行在 UI 线程。

`JS Bridge` 主要用来和 JS 端实现进行双向通信，比如把 JS 端的 dom 结构传递给 Dom 线程。`Dom` 主要是用于负责 dom 的解析、映射、添加等等的操作，最后通知UI线程更新。而 `Render` 负责在UI线程中对 dom 实现渲染。

- 和 react native一样，weex 所有的标签也不是真实控件，JS 代码中所生成存的 dom，最后都是由 Native 端解析，再得到对应的Native控件渲染，如 Android 中 `<text>` 标签对应 `WXTextView` 控件。

- **Weex可以做到跨三端的原理在于**：在开发过程中，`代码模式、编译过程、模板组件、数据绑定、生命周期等上层语法`是一致的。不同的是在 JS Framework 层的最后，web 平台和 Native 平台，对 Virtual DOM 执行的解析方法是有区别的。

weex 比起react native，主要是在JS V8的引擎上，多了 `JS Framework` 承当了重要的职责，使得上层具备统一性，可以支持跨三个平台。总的来说它主要负责是：**管理Weex的生命周期；解析JS Bundle，转为Virtual DOM，再通过所在平台不同的API方法，构建页面；进行双向的数据交互和响应。**



### Flutter

> Google 出品，Dart语言，Flutter Engine引擎，响应式设计模式，原生渲染

与 react native 和 weex 的通过 Javascript 开发不同，Flutter 的编程语言是`Dart`，所以执行时并不需要 Javascript 引擎，但实际效果最终也通过原生渲染。

Flutter 主要分为 `Framework` 和 `Engine`，我们基于Framework 开发App，运行在 Engine 上。Engine 是 Flutter 的独立虚拟机，由它适配和提供跨平台支持。

得益于 Engine 层，Flutter 甚至不使用移动平台的原生控件，而是使用自己  Engine 来绘制 Widget （Flutter的显示单元），而 Dart 代码都是通过 AOT 编译为平台的原生代码，所以 `Flutter 可以 直接与平台通信，不需要JS引擎的桥接`。


在理论上 Flutter 的设计性能是强于 React Native ，这是框架设计的理念导致的，Flutter 在少了 OEM Widget ，直接与 CPU / GPU 交互的特性，决定了它先天性能的优势。


- [全网最全 Flutter 与 React Native 深入对比分析](https://zhuanlan.zhihu.com/p/70070316)
- [移动端跨平台开发的深度解析](https://juejin.cn/post/6844903630584152072)




### Uni-app

[uni-app](https://zh.uniapp.dcloud.io/)


uni-app 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/飞书/QQ/快手/钉钉/淘宝）、快应用等多个平台。


实现方案：基本都是 `编译器+运行时` 配合实现
1. 编译器负责转化: `.vue => .wxml/.js/.wxss`；
2. 运行时处理：`vue: 生命周期、事件函数、data` ===> `uni-app runtime: 事件代理机制、数据同步机制` <=== `小程序：生命周期、事件函数、AppData`；数据vue管理，视图小程序负责


- 小程序负责视图渲染，页面dom有小程序负责生成；小程序只接受data数据传递
- vue的vnode很难和小程序的真实dom对应，vnode遍历对比维度复杂；


渲染性能优化：
1. 减少setData调用频次：vue的nextTick机制自动优化
2. 减少setData传输数据量：框架做了自动差量计算，改变最小化
3. 改写vue的patch实现，删掉vnode，仅做了diff data数据
4. 借鉴westore JSON Diff 库，实现高效、精确的差量数据
5. 自定义组件实现局部数据刷新；
6. 注意onPageScroll使用：避免频繁通讯，部分场景考虑intersectionObserver替代
> pageScroll通讯：视图层（webview） => Native <= 逻辑层（JS引擎）
7. 避免后台页面执行js逻辑，比如定时器


加载性能优化：
1. 分包加载
2. 开启上传时代码压缩
3. 资源文件上传CDN



### Taro

Taro 是由京东 - 凹凸实验室打造的一套遵循 React 语法规范的多端统一开发框架。一套代码，通过 Taro 的编译工具，将源代码分别编译出可以在不同端（微信小程序、H5. App 端等）运行的代码。

Taro 3 则可以大致理解为解释型架构（相对于 Taro 1/2 而言），主要通过`在小程序端模拟实现 DOM、BOM API 来让前端框架直接运行在小程序环境中，从而达到小程序和 H5 统一的目的`;






### Electron

Electron 是一个前端框架，可用于构建跨平台的桌面应用程序，桌面应用程序指的是可以在电脑上安装的软件（如QQ、浏览器、酷狗音乐等）。与 Java、C++ 等语言相同，前端技术也可用于桌面应用程序的开发。开发者可使用 JavaScript、HTML 和 CSS 等前端基础技术，结合 Node.js 进行开发。最重要的是，使用 Electron 开发的桌面应用程序，可以在 Windows、macOS 和 Linux 系统上无缝运行，实现跨平台开发。

我们可以使用 HTML 和 CSS 创建一个漂亮的用户界面，使用 JavaScript 处理用户输入和数据，使用 Node.js 处理系统调用和后台任务等等，使用 Electron 构建桌面应用程序就像在编写网页一样，相当容易上手。



### Saas

SaaS，Software as a service，软件即服务。

电商saas系统是指SaaS模式的电商系统，卖家想弄个自己的商城，不需要卖家再去搭建服务器、开发程序，直接租用软件服务商saas系统使用即可。

SaaS是一种通过Internet提供软件的模式，用户不用再购买软件，而改用向提供商租用基于Web的软件，来管理企业经营活动，且无需对软件进行维护，服务提供商会全权管理和维护软件，对于许多小型企业来说，SaaS是采用先进技术的最好途径，它消除了企业购买、构建和维护基础设施和应用程序的需要，近年来，SaaS的兴起已经给传统套装软件厂商带来真实的压力。

> 比如有赞、微盟、小鹅通这种平台提供的就是电商saas系统。







