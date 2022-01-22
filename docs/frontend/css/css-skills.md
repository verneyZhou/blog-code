---
title: 一些CSS使用小技巧
date: 2021-04-08 17:05:47
permalink: /pages/d7d87c/
categories:
  - css
tags:
  - css
---
# 一些CSS使用小技巧



## 纯css实现


### 多行文本展开收起效果
> 以往我们实现文本展开收起、溢出隐藏都是css+js结合来实现的，这里记录一种纯css实现的方法~
``` html
<!-- 在元素外边包一层具有包裹性又具有定位特性的标签 -->
<div class="content">
    <!-- 使用 input type="checkbox" 控制展开与收起效果 -->
    <input type="checkbox" id="exp" />
    <div class="text">
    <!-- 展开、收起按钮 -->
    <label class="btn" for="exp"></label>
    <!-- 文本 -->
    <span class="main-cont">
        但听得蹄声如雷，十余乘马疾风般卷上山来。马上乘客一色都是玄色薄毡大氅，
        里面玄色布衣，但见人似虎，马如龙，人既矫捷，马亦雄骏，每一匹马都是高头
        长腿，通体黑毛，奔到近处，群雄眼前一亮，金光闪闪，却见每匹马的蹄铁竟然
        是黄金打就。来者一共是一十九骑，人数虽不甚多，气势之壮，却似有如千军万
        马一般，前面一十八骑奔到近处，拉马向两旁一分，最后一骑从中驰出马一般</span>
    </div>
</div>
```
``` css
/* 在 flex 布局的子项中，可以通过百分比来计算变化高度 */
.content {
   display: flex;
 }
.text {
    width: 475px;
    border: aqua solid 1px;
    color: #333;
    font-size: 14px;
    line-height: 20px;
    /*  溢出隐藏  */
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}
  /* 利用伪元素实现文字环绕效果 */
 .text::before{
   content: '';
   float: right;
   height: 100%;
   margin-bottom: -20px;
 }
 .btn {
   float: right;
   clear: both;
   margin-right: 8px;
   color: dodgerblue;
    cursor: pointer;
 }
.main-cont {

}

  #exp {
    visibility: hidden;
  }
  #exp:checked+.text{
    -webkit-line-clamp: 999; /*设置一个足够大的行数就可以了*/
  }

  .btn::after{
    content:'展开'
  }
  #exp:checked+.text .btn::after{
    content:'收起'
  }
```
> [codeopen预览](https://codepen.io/verneyzhou/pen/JjNprOj)

[参考](https://mp.weixin.qq.com/s/r2xgRA2_52vxpHmtw6Y1PQ)


### 图片手风琴过渡效果
``` html
<div class="box">
    <div><img src="https://images.unsplash.com/photo-1502877338535-766e1452684a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80" alt=""></div>
    <div><img src="https://images.unsplash.com/photo-1494905998402-395d579af36f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt=""></div>
    <div><img src="https://images.unsplash.com/photo-1590362891991-f776e747a588?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1349&q=80" alt=""></div>
    <div><img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt=""></div>
    <div><img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80" alt=""></div>
    
</div>
<style>
    .box{ width:  1000px; height: 500px; margin:100px auto; overflow: hidden;}
    .box div{ width: 10%;  float: left; transition: all 1s;}
        img{  width: 960px; cursor: pointer;}
    .box:hover div{ width: 5%; }
    .box div:hover{ width: 55%; }
</style>
```
[参考](https://codepen.io/shinewen189/pen/RwVgZGZ)


### 动态打字效果
``` html
<h1>Welcome to Beijing</h1>
<style>
@-webkit-keyframes typing { from { width: 0; } }
@-webkit-keyframes blink-caret { 50% { border-color: transparent; } }

h1 { 
	font: bold 300% Consolas, Monaco, monospace;
	border-right: .1em solid black;
	width: 16.5em; 
	width: 21ch;
	margin: 2em 1em;
	white-space: nowrap;
	overflow: hidden;
	-webkit-animation: typing 7s steps(19, end),
	blink-caret .5s step-end infinite alternate;
}

</style>
```
[codeopen预览](https://codepen.io/verneyzhou/pen/KKmQQyB)

### 文字动态加载效果
``` html
<h1 data-text="玩命加载中...">玩命加载中...</h1>

<style>
h1 {
    position: relative;
    color: rgba(0, 0, 0, .3);
    font-size: 5em
}
h1:before {
    content: attr(data-text);
    position: absolute;
    overflow: hidden;
    max-width: 7em;
    white-space: nowrap;
    color: #fff;
    animation: loading 8s linear;
}
@keyframes loading {
    0% {
        max-width: 0;
    }
}
</style>
```
[codeopen预览](https://codepen.io/verneyzhou/pen/KKmQQyB)
> 还可以伪类结合`clip-path`实现聚光灯效果：[参考](https://codepen.io/shinewen189/pen/XWRaWQG)



### 图片轮播滑动效果
`scroll-snap-type`结合`scroll-snap-align`属性实现轮播滑动效果~

[参考](https://codepen.io/shinewen189/pen/gOWWdxj)


### 使用线性渐变实现滚动进度条
核心代码：
``` css
body {
    position: relative;
    background-image: linear-gradient(to right top, #ffcc00 50%, #eee 50%);
    background-size: 100% calc(100% - 100vh + 5px);
    background-repeat: no-repeat;
    z-index: 1;
}
body::after {
    content: "";
    position: fixed;
    top: 5px;
    left: 0;
    bottom: 0;
    right: 0;
    background: #fff;
    z-index: -1;
}
```
[完整代码参考](https://codepen.io/Chokcoco/pen/KbBXQM)




## 小技巧


### 文本换行

- 强制不换行：`white-space:nowrap;`

::: tip  white-space 属性设置如何处理元素内的空白
- `normal` 默认。空白会被浏览器忽略。
- `pre` 空白会被浏览器保留。其行为方式类似 HTML 中的 `<pre>` 标签。
- `nowrap` 文本不会换行，文本会在在同一行上继续，直到遇到 `<br>` 标签为止。
- `pre-wrap` 保留空白符序列，但是正常地进行换行。
- `pre-line` 合并空白符序列，但是保留换行符。
- `inherit` 规定应该从父元素继承 `white-space` 属性的值。
:::
[参考](https://www.runoob.com/cssref/pr-text-white-space.html)

- 自动换行
``` css
word-wrap: break-word;
word-break: normal;
```
- 强制换行：`word-break:break-all;`

::: tip  word-wrap 属性允许长单词或 URL 地址换行到下一行
- `normal` 只在允许的断字点换行（浏览器保持默认处理）。
- `break-word` 在长单词或 URL 地址内部进行换行。
:::
[参考](https://www.runoob.com/cssref/css3-pr-word-wrap.html)

::: tip  word-break 属性规定自动换行的处理方法。(ie支持，无兼容性问题)
- `normal` 使用浏览器默认的换行规则。
- `break-all` 允许在单词内换行。
- `keep-all` 只能在半角空格或连字符处换行。
:::
[参考](https://www.runoob.com/cssref/css3-pr-word-break.html)




### 文字超出部分显示省略号

- 单行溢出隐藏
``` css
p{
    /* 一定要有宽度 */
    width:200px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
 }
```

- 多行文本溢出隐藏
``` css
/* 超出三行省略 */
.ellipse-3{
    display: -webkit-box;
    /* 单独写-webkit-box-orient这个属性wepack打包会被过滤掉 */
    /*! autoprefixer: off */
    -webkit-box-orient: vertical;
    /* autoprefixer: on */
    -webkit-line-clamp: 3;
    overflow: hidden;
}
```
[参考](https://segmentfault.com/q/1010000009360389)


### 设置placeholder的字体样式
``` css
input::-webkit-input-placeholder { /* Chrome/Opera/Safari */
  color: red;
}
input::-moz-placeholder { /* Firefox 19+ */
  color: red;
}
input:-ms-input-placeholder { /* IE 10+ */
  color: red;
}
input:-moz-placeholder { /* Firefox 18- */
  color: red;
}

/* 设置input聚焦时的样式 */
input:focus {   
  background-color: red;
}

/* 取消input的边框 */
input {
    border: none;
    outline: none;
}
```


### 设置滚动条样式
``` css
.test::-webkit-scrollbar{
  /*滚动条整体样式*/
  width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.test::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius   : 10px;
  ...
}
.test::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  background   : #ededed;
  border-radius: 10px;
}
```
[CSS设置滚动条样式](https://blog.csdn.net/cddcj/article/details/70332771)


### 隐藏滚动条又可以滚动
``` css
.demo::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.demo {
  scrollbar-width: none; /* firefox */
  -ms-overflow-style: none; /* IE 10+ */
  overflow-x: hidden;
  overflow-y: auto;
}
```


### css 绘制三角形
``` html
<div id="blue"><div>

<style>
#blue {
    position:relative;
    width: 0;
    height: 0;
    border-width: 0 40px 40px;
    border-style: solid;
    border-color: transparent transparent blue;
}
/* 给三角形添加边框 */
#blue:after {
    content: "";
    position: absolute;
    top: 1px;
    left: -38px;
    border-width: 0 38px 38px;
    border-style: solid;
    border-color: transparent transparent yellow;
}
</style>
```
> [预览](https://codepen.io/verneyzhou/pen/JjNPmyg)；如果想绘制右直角三角，则将左 border 设置为 0；如果想绘制左直角三角，将右 border 设置为 0 即可（其它情况同理）。


### Table表格边框合并
``` css
table,tr,td{
  border: 1px solid #666;
}
table{
  border-collapse: collapse;
}
```


### css 选取第 n 个标签元素
```
first-child 表示选择列表中的第一个标签。
last-child 表示选择列表中的最后一个标签
nth-child(3) 表示选择列表中的第 3 个标签
nth-child(2n) 这个表示选择列表中的偶数标签
nth-child(2n-1) 这个表示选择列表中的奇数标签
nth-child(n+3) 这个表示选择列表中的标签从第 3 个开始到最后。
nth-child(-n+3) 这个表示选择列表中的标签从 0 到 3，即小于 3 的标签。
nth-last-child(3) 这个表示选择列表中的倒数第 3 个标签。
```
> 例：`li:first-child{}`


### 文字之间的间距
> `text-indent`单词抬头距离，`letter-spacing`字与字间距
``` css
p{
  text-indent：10px；//单词抬头距离
  letter-spacing：10px；//间距
}
```

### 实现文本两端对齐
``` css
.wrap {
    text-align: justify;
    text-justify: distribute-all-lines;  //ie6-8
    text-align-last: justify;  //一个块或行的最后一行对齐方式
    -moz-text-align-last: justify;
    -webkit-text-align-last: justify;
}
```
[text-align-last](https://www.runoob.com/cssref/css3-pr-text-align-last.html)


### 实现文字竖向排版
``` css
.wrap {
    height: 210px;
    line-height: 30px;
    text-align: justify;
    writing-mode: vertical-lr;  //从左向右    
    writing-mode: tb-lr;        //IE从左向右
    /* writing-mode: vertical-rl;  -- 从右向左 */
    /* writing-mode: tb-rl;        -- 从右向左 */
}
```
[writing-mode](https://www.runoob.com/cssref/css-pr-writing-mode.html)


### 使元素鼠标事件失效
``` css
.wrap {
/* 如果按tab能选中该元素，如button，然后按回车还是能执行对应的事件，如click。 */
 pointer-events: none;
 cursor: default;
}
```


### 禁止用户选择
``` css
.wrap {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```


### 页面动画出现闪烁问题
> 在 Chrome and Safari中，当我们使用CSS transforms 或者 animations时可能会有页面闪烁的效果，下面的代码可以修复此情况：
``` css
.cube {
   -webkit-backface-visibility: hidden;
   backface-visibility: hidden;
 
   -webkit-perspective: 1000;
   perspective: 1000;
   /* Other transform properties here */
}
```
在webkit内核的浏览器中，另一个行之有效的方法是：
``` css
.cube {
   -webkit-transform: translate3d(0, 0, 0);
   transform: translate3d(0, 0, 0);
  /* Other transform properties here */
}
```

### 字母大小写转换
``` css
p {text-transform: uppercase}  // 将所有字母变成大写字母
p {text-transform: lowercase}  // 将所有字母变成小写字母
p {text-transform: capitalize} // 首字母大写
p {font-variant: small-caps}   // 将字体变成小型的大写字母
```
[font-variant](https://www.runoob.com/cssref/pr-font-font-variant.html)、[text-transform](https://www.runoob.com/cssref/pr-text-text-transform.html)


### 将一个容器设为透明
``` css
.wrap { 
  filter:alpha(opacity=50); 
  -moz-opacity:0.5; 
  -khtml-opacity: 0.5; 
  opacity: 0.5; 
}
```

### 消除transition闪屏
``` css
.wrap {
    -webkit-transform-style: preserve-3d;
    -webkit-backface-visibility: hidden;
    -webkit-perspective: 1000;
}
```

### 移除a标签被点链接的边框
``` css
a {
  outline: none；//或者outline: 0
  text-decoration:none; //取消默认下划线
}
```

### CSS显示链接之后的URL
``` html
<a href="//www.webqdkf.com">有课前端网</a>
<style>
    a:after {content: " (" attr(href) ")";}
</style>
```

### select内容居中显示、下拉内容右对齐
``` css
select{
    text-align: center;
    text-align-last: center;
}
select option {
    direction: rtl;
}
```

### 修改input输入框中光标的颜色
``` css
input{
    color:  #fff;
    caret-color: red;
}
```

### transfrom的rotate属性在span标签下失效
``` css
span {
  display: inline-block
}
```

### 全屏背景图片的实现
``` css
.swper{
  background-image: url(./img/bg.jpg);
  width:100%;
  height:100%;//父级高不为100%请使用100vh
  zoom: 1;
  background-color: #fff;
  background-repeat: no-repeat;
  background-size: cover;
  -webkit-background-size: cover;
  -o-background-size: cover;
  background-position: center 0;
}
```


### 实现文字描边
- 1、
``` css
.stroke {
      -webkit-text-stroke: 1px greenyellow;
     text-stroke: 1px greenyellow;
}
```
- 2、
``` css
.stroke {
  text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;
  -webkit-text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;
  -moz-text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;
  *filter: Glow(color=#000, strength=1);
}
```

### CSS实现文字模糊效果
``` css
.vague_text{
  color: transparent; 
  text-shadow: #111 0 0 5px;
}
```


### 图片自适应object-fit
> 当图片比例不固定时，想要让图片自适应，一般都会用`background-size:cover/contain`，但是这个只适用于背景图。css3中可使用`object-fit`属性来解决图片被拉伸或是被缩放的问题。使用的提前条件：图片的父级容器要有宽高。
``` css
img{
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```
[object-fit](https://www.runoob.com/cssref/pr-object-fit.html)


### 行内标签元素出现间隙问题
``` css
/* 方式一：父级font-size设置为0 */
.father{
 font-size:0;
}

/* 方式二：父元素上设置word-spacing的值为合适的负值 */
.father{
   word-spacing:-2px
}
```


### 解决vertical-align属性不生效
> 在使用`vertical-align:middle`实现垂直居中的时候，经常会发现不生效的情况。这里需要注意它生效需要满足的条件：
- 作用环境：父元素设置`line-height`。需要和`height`一致。或者将`display`属性设置为`table-cell`，将块元素转化为单元格。
- 作用对象：子元素中的`inline-block`和`inline`元素。
``` css
.box{
  width:300px; 
  line-height: 300px;
  font-size: 16px; 
}
.box img{
  width: 30px; 
  height:30px; 
  vertical-align:middle
}
```
> vertical-align不可继承，必须对子元素单独设置。同时需要注意的是line-height的高度基于font-size（即字体的高度），如果文字要转行会出现异常哦。


### ::marker伪类
> [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/::marker)

`::marker`可以用于设置`li`这类标签的的序号样式~
``` html
<ul>
  <li>Peaches</li>
  <li>Apples</li>
  <li>Plums</li>
</ul>

<style>
ul li::marker {
  color: red;
  font-size: 1.5em;
}
</style>
```

### 伪类中 content 属性 attr
> CSS 的伪元素是个很強大的东西，我们可以利用他做很多运用，通常为了做一些效果， `content:" "`多半会留空，但其实可以在里面写上`attr`
- 例：自定义hover样式
``` html
<div data-msg="这里是获取content的内容">  
hover
</div>

<style>
div{
    width:100px;
    border:1px solid red;  
    position:relative;
}
div:hover:after{
    content:attr(data-msg);
    position:absolute;
    font-size: 12px;
    width:200%;
    line-height:30px;
    text-align:center;
    left:0;
    top:25px;
    border:1px solid green;
}
</style>
```
[codeopen预览](https://codepen.io/verneyzhou/pen/KKmQQyB)



### background-clip设置元素的背景
> background-clip  设置元素的背景（背景图片或颜色）是否延伸到边框、内边距盒子、内容盒子下面。[MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-clip)
``` css
background-clip: border-box; // 背景延伸至边框外沿（但是在边框下层）。
background-clip: padding-box;  // 默认，背景延伸至内边距（padding）外沿。不会绘制到边框处。
background-clip: content-box; // 背景被裁剪至内容区（content box）外沿。
background-clip: text; // 背景被裁剪成文字的前景色。
```

### 实现边框内圆角
``` css
div {
    width: 200px;
    margin: 20px auto;
    padding: 10px;
    background: #f4f0ea;
    /* 添加边框圆角 */
     border-radius: 8px;
    /* 通过 outline 和 box-shadow 实现外边框去除圆角*/
    outline: 6px solid #b4a078;
    box-shadow: 0 0 0 5px #b4a078;
}
```

### ::selection文本选择颜色
``` css
::selection {
  color: #f00;
  backgroud:#000;
}
```

### ::first-letter实现首字下沉
> 使用 first-letter 伪元素来装饰第一个字母
``` css
p::fisrt-letter {
  line-height: 20px;
}
```


### @supports检查是否支持某个css特性
> @supports是CSS中常见的@规则，可以用来检测当前浏览器是否支持某个css特性。
``` css
    .loading{
         width:10px;
         heigth:10px;
         background:url(./loading.gif);
    }
    
    /* 判断是否支持animation 属性,支持则增加动画效果 */
    @support (animation:none) {
        .loading{
             width:10px;
             heigth:10px;
             background:url(./loading.png);
             animation: spin 1s linear infinite;
        }
        @keyframes spin{
            from { transform: rotate(360deg);}
            to {transform: rotate(0deg);}
        }
    }

```
``` js
    //js 判断是否支持positon:sticky 属性  CSS.supports(propertyName,value)
    if( !window.CSS || !CSS.supports || !CSS.supports('position','sticky'){
        //TODO 
    }
    
```

### 取消鼠标默认的双击选中事件

```
css:
 
body {
     -moz-user-select: none;  /*火狐*/
     -webkit-user-select: none;  /*webkit浏览器*/
     -ms-user-select: none;  /*IE10*/
     -khtml-user-select: none;  /*早期浏览器*/
     user-select: none;
}


js:
 
document.ondragstart = document.onselectstart =  function (){ return  false ;};
```
[参考](https://blog.csdn.net/litre_LDS/article/details/78754269)



## 常见问题

### hover抖动问题
> 有时元素 hover 需要添加边框会出现元素抖动，是因为元素原本没有边框，给原元素添加边框即可：`border: 1px solid transparent;`


### 移动端 Retina 屏 1px 像素问题
- [参考](https://mp.weixin.qq.com/s/k9ppPqi06jG7mvjf0ZZ82w)





## 参考

- [49 个在工作中常用且容易遗忘的 CSS 样式清单整理](https://mp.weixin.qq.com/s/qlhbUduUUxeSxYW8Gk5jmg)
- [能用CSS实现的就不用麻烦JavaScript — Part2](https://juejin.cn/post/6986967746453962782)




<fix-link label="Back" href="/frontend/css/"></fix-link>