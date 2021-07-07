# css3使用笔记


## 特性

### filter
可通过`filter`实现滤镜效果，如：修改所有图片的颜色为黑白、图片模糊处理等等，filter的具体定义与使用可参考[菜鸟教程](https://www.runoob.com/cssref/css3-pr-filter.html)，这里只记录几个比较有意思的使用实例。



#### 网页置灰

``` css
html {
    -webkit-filter: grayscale(100%); // 非ie浏览器
    filter: progid:DXImageTransform.Microsoft.BasicImage(grayscale=1); // 兼容ie
}
```
> 本质上都是使用filter的grayscale属性，实现灰阶效果，灰阶是一种常用的图片滤镜。



#### 给透明元素添加阴影效果
> 在给元素添加阴影的时候，我们一般采用 box-shadow 属性，但 box-shadow 也有一个缺点，就是在给透明图片添加阴影效果时，无法穿透元素，只能添加到透明图片元素的盒模型上。

filter 属性的 drop-shadow 方法就能很好的解决这个问题，用它添加的阴影可以穿透元素，而不是添加到元素的盒模型边框上。
- 例：
``` css
/* filter: drop-shadow(x偏移, y偏移, 模糊大小, 色值); */
filter: drop-shadow(1px 1px 15px rgba(0, 0, 0, .5));
```


#### 毛玻璃效果
> 毛玻璃（Frosted glass）效果，顾名思义就是类似半透明毛玻璃的效果，在 iOS 系统、Windows 10 等系统 UI 中有广泛应用，使用毛玻璃效果可以增强视觉体验。
``` html
<div class="glass glass-by-filter"></div>
```

``` css
.glass {
  height: 100px;
  width: 100px;
  border: 1px groove #EFEFEF;
  border-radius: 12px;
  background: rgba(242, 242, 242, 0.5);
  box-shadow: 0 0.3px 0.7px rgba(0, 0, 0, 0.126),
    0 0.9px 1.7px rgba(0, 0, 0, 0.179), 0 1.8px 3.5px rgba(0, 0, 0, 0.224),
    0 3.7px 7.3px rgba(0, 0, 0, 0.277), 0 10px 20px rgba(0, 0, 0, 0.4);
}

.glass-by-filter {
  z-index: 1;
  box-sizing: border-box;
  position: relative;
}
.glass-by-filter::before {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  z-index: -1;
  background: inherit;
  filter: blur(10px);
}
```
> 效果预览：[codeopen](https://codepen.io/verneyzhou/pen/RwpBGbb)


#### 生成图像阴影

> 通常而言，我们生成阴影的方式大多是 `box-shadow 、filter: drop-shadow() 、text-shadow` ，但是，使用它们生成阴影是阴影只能是单色的。

利用`filter: blur`模糊滤镜，可以生成渐变色或者说是颜色丰富的阴影效果。

``` html
<div class="avatar"></div>
``` 
``` css
.avatar {
  width: 200px;
  height: 200px;
  background: url('https://www.verneyzhou-code.cn/blog/images/poster03.jpeg') no-repeat center;
  background-size: 100% 100%;
  border-radius: 50%;
  position: relative;
}

.avatar::after {
  content: "";
  position: absolute;
  top: 10%;
  width: 100%;
  height: 100%;
  /* 伪元素继承父元素背景 */
  background: inherit;
  border-radius: 50%;
  /* 再加一些稀奇古怪的滤镜，调一调参数 */
  filter: blur(10px) brightness(80%) opacity(.7);
  z-index: -1;
}
```
> 效果预览：[codeopen](https://codepen.io/verneyzhou/pen/RwpBGbb)




#### 融合效果

> `filter: blur()`：给图像设置高斯模糊效果；`filter: contrast()`：调整图像的对比度。

当他们“合体”的时候，产生了奇妙的融合现象，通过对比度滤镜把高斯模糊的模糊边缘给干掉，利用高斯模糊实现融合效果。

``` html
<div class="filter-mix"></div>
```
``` css
.filter-mix {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 200px;
    filter: contrast(20);
    background: #fff;
}
.filter-mix::before {
    content: "";
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #333;
    top: 40px;
    left: 40px;
    z-index: 2;
    filter: blur(6px);
    box-sizing: border-box;
    animation: filterBallMove 4s ease-out infinite;
}

.filter-mix::after {
    content: "";
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #3F51B5;
    top: 60px;
    right: 40px;
    z-index: 2;
    filter: blur(6px);
    animation: filterBallMove2 4s ease-out infinite;
}

@keyframes filterBallMove {
    50% {
        left: 140px;
    }
}

@keyframes filterBallMove2 {
    50% {
        right: 140px;
    }
}
```
> 效果预览：[codeopen](https://codepen.io/verneyzhou/pen/RwpBGbb)


#### 火焰效果

> `filter: contrast()` 与 `filter: blur()`和`animation`配合制作火焰效果。

``` html
<!-- 这里使用Pug模板语法 -->
.g-container
    .g-fire
        - for (var j = 1; j <=40; j++)
            .g-dot
```
``` scss
$douCount: 40;
$animationTime: 2;
$delayTime: 3;

@function randomNum($max, $min: 0) {
	@return ($min + random($max));
}

body {
    background: #000;
    overflow: hidden;
}

:root {
    --fireWidth: 115px;
    --fireHeight: 200px;
    --dotSize: 24px;
    --fireColor: #b5932f;
    // --fireColor: #008eff;
    // --fireColor: #ff9900;
    
}

.g-container {
    position: relative;
    width: 384px;
    height: 300px;
    margin: 0 auto;
    background-color: #000;
}

.g-fire {
    position: absolute;
    width: 0;
    height: 0;
    bottom: 100px;
    left: 50%;
    border-radius: 45%;
    box-sizing: border-box;
    border: 200px solid #000;
    border-bottom: 200px solid transparent;
    transform: translate(-50%, 0) scaleX(.4);
    background-color: var(--fireColor);
    filter: blur(20px) contrast(30);
}

.g-dot {
    position: absolute;
    bottom: -210px;
    left: 0;
    width: var(--dotSize);
    height: var(--dotSize);
    background: #000;
    border-radius: 50%;
}

@for $i from 1 to $douCount + 1 {
    .g-dot:nth-child(#{$i}) {
        bottom: -#{randomNum(120, 240)}px;
        left: #{randomNum(300, -160)}px;
        animation: move #{randomNum($animationTime * 13, 7) / 10}s infinite #{randomNum($delayTime * 20) / 10}s linear;
    }
}

@keyframes move {
    100% {
        transform: translate3d(0, -350px, 0);
    }
}
```
> 效果预览：[codeopen](https://codepen.io/verneyzhou/pen/xxdKyLo)
1. `.g-fire`增加了 `filter: blur(20px) contrast(30)`之后，纯色黑色和黄色的中间会生成了一条红色的边框，原因是两个不同滤镜的色值处理算法在边界处叠加作用得到了另外一种颜色（我也不清楚，网上copy的~）；
2. 火焰动态效果：只需要在火焰 `.fire` 这个 `div` 内部，用大量的黑色圆形，由下至上，无规律穿过火焰即可。由于滤镜的融合效果，火焰效果随之产生。


#### 文字融合动画
> 可以在动画的过程中，动态改变元素滤镜的 `filter: blur()` 的值来实现文字融合动画效果~
``` html
 <div class="text-container">
    <h1>Blur word Animation</h1>
  </div>
```
``` css
.text-container {
    width: 100%;
    height: 100px;
    position: relative;
    padding: 2em;
    filter: contrast(20);
    background-color: #000;
    overflow: hidden;
}

h1 {
    color: #fff;
    font-size: 4rem;
    text-transform: uppercase;
    line-height: 1;
    animation: letterspacing 5s infinite alternate ease-in-out;
    display: block;
    position: absolute;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    letter-spacing: -2.2rem;
}

@keyframes letterspacing {
    0% {
        letter-spacing: -2.2rem;
        filter: blur(.3rem);
    }

    50% {
        filter: blur(.5rem);
    }

    100% {
        letter-spacing: .5rem;
        filter: blur(0rem);
        color: #fff;
    }
}

```
1. CSS 滤镜可以给同个元素同时定义多个，例如 `filter: contrast(150%) brightness(1.5)` ，但是滤镜的先后顺序不同产生的效果也是不一样的；
2. 滤镜动画需要大量的计算，不断的重绘页面，属于非常消耗性能的动画，使用时要注意使用场景。

#### 果冻菜单特效
参考：[从酷炫的果冻菜单谈起 CSS3 filter 属性](https://github.com/fantasticit/coding/issues/18)







## 参考
- [CSS filter有哪些神奇用途](https://mp.weixin.qq.com/s/8CH8oUIIPF8yivnYPOPpFQ)
- [你所不知道的 CSS 滤镜技巧与细节](https://www.cnblogs.com/coco1s/p/7519460.html)


<fix-link label="Back" href="/frontend/css/"></fix-link>