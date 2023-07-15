---
title: 瀑布流布局学习笔记
date: 2023-06-05 23:02:21
permalink: false
categories:
  - js
tags:
  - 瀑布流
---


# 瀑布流布局学习笔记

> 瀑布流又称瀑布流式布局，是一种比较流行的页面布局方式，与传统的分页显示不同，视觉表现为参差不齐的多栏布局。

## 简介


瀑布流，是比较流行的一种网站页面布局，视觉表现为参差不齐的多栏布局，随着页面滚动条向下滚动，这种布局还会不断加载数据块并附加至当前尾部。



**特点：**

1. **等宽不等高**：内容框宽度固定，高度不固定。
2. 内容框从左到右排列，一行排满后，其余内容框就会按顺序排在短的一列后。


**瀑布流适用的场景：**

1. 内容以图片为主的时候；
2. 信息与信息之间相对独立时；
3. 信息与搜索匹配比较模糊时；
4. 用户目的性不强的时候；

::: tip 优点
- 节省空间，外表美观，更有艺术性。
- 对于触屏设备非常友好，通过向上滑动浏览
- 用户浏览时的观赏和思维不容易被打断，留存更容易。
- 吸引用户，良好的视觉效果
:::

::: warning 缺点
- 用户无法了解内容总长度，对内容没有宏观掌控。
- 用户无法了解现在所处的具体位置，不知道离终点还有多远。
- 回溯时不容易定位到之前看到的内容。
- 容易造成页面加载的负荷。
- 容易造成用户浏览的疲劳，没有短暂的休息时间。
:::












## 实现


- 原理分析：
> 首先我们先通过计算一行能够容纳几列元素（因为我们需要在不同的设备上浏览），然后在通过计算比较找出这一列元素中高度之和最小一列，然后将下一行的第一个元素添加至高度之和最小的这一列的下面，然后继续计算所有列中高度之和最小的那一列，然后继续将新元素添加至高度之和最小的那一列后面，直至所有元素添加完毕。



### Column多列布局

运用 CSS3 属性 `column-count`进行布局，该属性可以将文本内容设计成像报纸一样的多列布局。

[菜鸟教程：CSS3多列属性](https://www.runoob.com/css3/css3-multiple-columns.html)、[counter-increment](https://www.runoob.com/cssref/pr-gen-counter-increment.html)

- demo:
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Column 多列布局</title>
    <style>
        body {
            margin: 4px;
            font-family: Arial, Helvetica, sans-serif;
        }

        .masonry {
            column-count: 5; /* 指定元素应该被分割的列数。 */
            /* column-width: 200px; /*设置每列宽度，列数由总宽度与每列宽度计算得出 */
            column-gap: 0; /* 指定列与列之间的间隙。 */

            /**
            column-count和column-width都可以用来定义分栏的数目，而且并没有明确的优先级之分。优先级的计算取决与具体的场景。
            计算方式为：计算column-count和column-width转换后具体的列数，哪个小就用哪个。
             */
        }

        .item {
            padding: 2px;
            position: relative;
            counter-increment: count; /* counter-increment属性递增一个或多个计数器值。*/
            break-inside: avoid; /* 保证每个子元素渲染完在换行 */

            /* 
            break-inside: auto; 为auto则最后一个元素的文本内容可能会被自动断开，一部分在当前列尾，一部分在下一列的列头。
             */
        }

        .item img {
            display: block;
            width: 100%;
            height: auto;
        }

        .item::after {
            position: absolute;
            display: block;
            top: 2px;
            left: 2px;
            width: 24px;
            height: 24px;
            text-align: center;
            line-height: 24px;
            background-color: #000;
            color: #fff;
            content: counter(count); /* 显示count: 1 2 3 4 ... */
        }
    </style>
</head>
<body>
    <div class="masonry">
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=1" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/520?radom=2" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=3" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/500?radom=4" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=5" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=6" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/480?radom=7" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=8" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=9" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/500?radom=10" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=11" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/360?radom=12" alt="">
        </div>
    </div>
</body>
</html>
```
> 适合于简单的瀑布流排版，图片顺序是从上到下排列，不是从左至右排列；所以目前这种方式虽然简单，但是很多场景中不适合使用；且`column`属于CSS3属性，在一些浏览器上可能存在兼容性问题~

**在多列布局中，项目是按列显示的**。通常在瀑布流布局中，你希望它们是按行显示。




### Flex布局

[Flex 布局语法教程](https://www.runoob.com/w3cnote/flex-grammar.html)

继续用上面的例子，css布局方式改成flex布局。如果将flex容器的高度设置为1000px固定高度，且`flex-direction`设置为`colunm`方式，那么，当高度无法容纳所有图片时候，在`flex-wrap: wrap`的情况下，多余的图片便会在主轴方向换行~

``` css
.masonry {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 1000px;
}
```
> 展示的图片排序还是自上而下的顺序排序，可以使用order值来改变图片顺序，从而满足有从左至右排序的要求，完整demo如下：

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>flex布局</title>
    <style>
        body {
            margin: 4px;
            font-family: Arial, Helvetica, sans-serif;
        }

        .masonry {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            height: 1000px;
        }

        .item {
            position: relative;
            width: 25%;
            padding: 2px;
            counter-increment: count;
        }

        /**因为column为主轴，那么我们就规定第1，5，9张照片顺序优先，在主轴，也就是纵列先展示，
        2，6，10张照片在第二列展示，以此类推，这里用了数学方式取了个巧**/
        .item:nth-child(4n+1) {
        order: 1;
        }

        .item:nth-child(4n+2) {
        order: 2;
        }

        .item:nth-child(4n+3) {
        order: 3;
        }

        .item:nth-child(4n+4) {
        order: 4;
        }

        .item img {
            display: block;
            width: 100%;
            height: auto;
        }

        .item::after {
            position: absolute;
            display: block;
            top: 2px;
            left: 2px;
            width: 24px;
            height: 24px;
            text-align: center;
            line-height: 24px;
            background-color: #000;
            color: #fff;
            content: counter(count); /* 显示count: 1 2 3 4 ... */
        }
    </style>
</head>
<body>
    <div class="masonry">
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=1" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/520?radom=2" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=3" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/500?radom=4" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=5" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=6" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/480?radom=7" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=8" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=9" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/500?radom=10" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=11" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/360?radom=12" alt="">
        </div>
    </div>
</body>
</html>
```
> 这样虽然能实现瀑布流布局效果，但如果缩放页面的话，页面布局就会乱~

这是因为：由于**flex的容量的高度是固定的**，这时候缩小容器的宽度，而容器内的图片高度又因为宽度而改变（图片宽度设置成width: 100%），这时候flex只需要分成两列，便可以容纳所有图片，而我们只是用了数学方式来取巧规定了顺序，而交叉轴宽度变小，打乱了原先布局，那么这时候图片顺序又会被打乱。




### Grid布局

网格布局（Grid）是很强大的 CSS 布局方案；它将网页划分成一个个网格，可以任意组合不同的网格，做出各种各样的布局。以前，只能通过复杂的 CSS 框架达到的效果，现在浏览器内置了。

[CSS Grid 网格布局教程](https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)


- **Grid Vs Flex**
> Grid 布局与 Flex 布局有一定的相似性，都可以指定容器内部多个项目的位置。但是，它们也存在重大区别。Flex 布局是轴线布局，只能指定"项目"针对轴线的位置，可以看作是**一维布局**。Grid 布局则是将容器划分成"行"和"列"，产生单元格，然后指定"项目所在"的单元格，可以看作是**二维布局**。Grid 布局远比 Flex 布局强大。


**基本属性：**

- `display: grid;` 设置为grid指明当前容器为Grid布局
- `grid-template-columns: 1fr 1fr 1fr;` 定义每一列的列宽, 表示分为3行
- `grid-template-rows: 1fr 1fr 1fr;` 定义每一行的行高，表示分为3列
> `grid-template-columns`和`grid-template-rows`，可以使用绝对单位，也可以使用百分比。并且为了表示比例关系，Grid布局提供了`fr`关键字，如果设置`1fr`和`2fr`，表示后者是前者的两倍。
- `column-gap：5px;` 用于设置列间距


**网格线属性：**
- `grid-row-start`：上边框所在的水平网格线
- `grid-row-end`：下边框所在的水平网格线
- `grid-column-start`：左边框所在的垂直网格线
- `grid-column-end`：右边框所在的垂直网格线
> 水平网格线划分出行，垂直网格线划分出列; 正常情况下，`n`行有`n + 1`根水平网格线，`m`列有`m + 1`根垂直网格线，比如三行就有四根水平网格线。

这4个属性可接收如下属性：
1. `auto`：表示自动放置
2. `自定义名称`：可以给予网格线一个名称，并在此处引用
3. `网格线索引`: 代表第几条网格线(从1开始)
4. `span + 数字` : 表示上下边框或左右边框跨越多少网格


- **`grid-auto-rows`：用来设置多余网格的行高**
> 不设置行高(grid-template-rows),此时设置grid-auto-rows后，所有单元格的高度均为grid-auto-rows指定的值。

- **Grid布局实现瀑布流原理：**
> 由于`grid-row-start`和`grid-row-end`可以指定单元格的上边距和下边距位置，也就是说可以将单元格的高度拉伸，而原有高度由`grid-auto-rows`决定，我们仅需将`grid-auto-rows`设置一个很小的值，比如`10px`，然后对其进行拉伸将其高度指定为真实高度，每一个单元格都做如下操作，那么瀑布流就实现了~


完整demo如下：

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Grid瀑布流布局</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
        body {
            margin: 4px;
            font-family: Arial, Helvetica, sans-serif;
        }
        #box {
          display: grid;
          /*grid-template-rows: 1fr 1fr 1fr; /*分为3行 */
          grid-template-columns: 1fr 1fr 1fr; /*分为3列*/
          column-gap:5px; /*列间距5px*/
          row-gap: 5px; /*行间距5px*/
          /* 不设置行高(grid-template-rows),此时设置grid-auto-rows后，所有单元格的高度均为grid-auto-rows指定的值 */
          grid-auto-rows: 10px; 
          

          /*
          grid-template-columns和grid-template-rows，可以使用绝对单位，也可以使用百分比。并且为了表示比例关系，Grid布局提供了fr关键字，如果设置1fr和2fr，表示后者是前者的两倍。
          */
        }

        .item{
            grid-row-start: auto;
        }

        /*
        .item:first-child{
            grid-row-start:1; 令其上边框位于1水平网格线 
            grid-row-end:span 2; 下边框距上边框跨越2个水平网格线 
        }
        */
    </style>
</head>
<body>
    <div id="box"></div>
</body>
<script>
    var box = document.getElementById('box');
    for(let i = 1; i <= 30; i ++) {
        var div = document.createElement('div');
        div.className = 'item item-' + i;
        div.innerHTML = i;
        let index1 = Math.floor(Math.random() * 255);
        let index2 = Math.floor(Math.random() * 255);
        let index3 = Math.floor(Math.random() * 255);
        div.style.backgroundColor = `rgb(${index1}, ${index2}, ${index3})`;
        let height = Math.floor(Math.random() * 300) + 100;
        // 关键代码：设置当前跨越几个网格(每个网格10px)
        div.style.gridRowEnd = `span ${~~(height/10)}` // ~~(height/10)表示向下取整
        box.appendChild(div);
    }
</script>
</html>
```

参考：[grid 布局实现瀑布流](https://juejin.cn/post/6844904004720263176#heading-6)



### 绝对定位布局
> 通过给每个盒子设置绝对定位属性后，我们就可以通过动态的设置相应的top，left值来让盒子规规矩矩的为我们排列。

1. 给所有盒子的父元素加上相对定位属性，给所有盒子加上绝对定位属性;
2. 获取一行列数：`显示的列数(column) = 页面宽度(pageWidth) /（盒子宽度(itemWidth)+间隙(gap)`;
3. 排列第一行：
``` js
if (i < columns) { //确定第一行 
    items[i].style.top = 0;
    items[i].style.left = (itemWidth + gap) * i + 'px';
}
```
同时，需要计算出第一行所有列的高度和并保存，定义一个数组arr来保存高度~

4. 排列第二行：
    - 获取到刚刚数组中，高度最小的那一列，将第2行的第1个盒子放置在它的下方；此时的left值就是高度最小列的`offsetLeft`；top值就是第1行高度最小列的高度(为了布局美观可以加上上下间隙`gap`)。
    - 记录下高度最小列的索引index，后面计算会用到；
    - 设置完成之后，应该加上下面盒子的高度，得出一个新高度；我们需要在最小列后面加了一个盒子之后重新计算所有列的最小高度的列。
5. 重新获取最小高度列的高度：`arr[index] = arr[index] + gap + item[i].offsetHeight`；

6. 设置响应式：将整个设置样式的部分封装成一个函数，在onload里面注册一个resize事件，只要页面一发生改变，就触发样式部分的代码。


- 完整demo：

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>JS绝对定位瀑布流布局</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
        .item {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 30px;
            font-weight: 700;
            color: aliceblue;
            width: 205px;
            position: absolute;
        }
    </style>
</head>
<body>
    <div id="box"></div>
</body>
<script>
    var box = document.getElementById('box');
    for(let i = 1; i <= 30; i ++) {
        var div = document.createElement('div');
        div.className = 'item item-' + i;
        div.innerHTML = i;
        let index1 = Math.floor(Math.random() * 255);
        let index2 = Math.floor(Math.random() * 255);
        let index3 = Math.floor(Math.random() * 255);
        div.style.backgroundColor = `rgb(${index1}, ${index2}, ${index3})`;
        div.style.height = Math.floor(Math.random() * 300) + 100 + 'px';
        box.appendChild(div);
    }
    //进页面执行函数
    window.onload = function () {
        waterFall();
    }

    function waterFall() {
        var items = document.getElementsByClassName('item');
        //定义间隙10像素
        var gap = 10;

        //首先确定列数 = 页面的宽度 / 图片的宽度
        var pageWidth = getClient().width;
        var itemWidth = items[0].offsetWidth;
        var columns = parseInt(pageWidth / (itemWidth + gap));
        var arr = [];//定义一个数组，用来存储元素的高度
        for(var i = 0;i < items.length; i++){
            if(i < columns) {
                //满足这个条件则说明在第一行，文章里面有提到
                items[i].style.top = 0;
                items[i].style.left = (itemWidth + gap) * i + 'px';
                arr.push(items[i].offsetHeight);
            }else {
                //其他行，先找出最小高度列，和索引
                //假设最小高度是第一个元素
                var minHeight = arr[0];
                var index = 0;
                for(var j = 0; j < arr.length; j++){//找出最小高度
                   if(minHeight > arr[j]){
                       minHeight = arr[j];
                       index = j;
                   } 
                }
                //设置下一行的第一个盒子的位置
                //top值就是最小列的高度+gap
                items[i].style.top = arr[index] + gap + 'px';
                items[i].style.left = items[index].offsetLeft + 'px';

                //修改最小列的高度
                //最小列的高度 = 当前自己的高度 + 拼接过来的高度 + 间隙的高度
                arr[index] = arr[index] + items[i].offsetHeight + gap;
            }
        }
    }

    //当页面尺寸发生变化时，触发函数，实现响应式
    window.onresize = function () {
        waterFall();
    }

    // clientWidth 处理兼容性
    function getClient() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        }
    }
    // scrollTop兼容性处理
    function getScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop;
    }
</script>
</html>
```

对于使用绝对定位实现瀑布流布局，实现原理比较简单，有一些开源的插件也是使用这种方案来实现，我们也可以封装一个类似的class类，来实现自己的瀑布流插件，比如：
``` js
// 封装
class Waterfall {
    constructor(options) {
        this.$el = null;             // 父容器
        this.count = 4;              // 列数
        this.gap = 10;               // 间距
        Object.assign(this, options);
        this.init();
    }
    init(){...},
}

// 调用
window.onload = new Waterfall({
    $el: document.querySelector("#box"),
    count: 4,
    gap: 10
})
```

**Q: 怎么实现加载更多？**
> 平时在业务开发中需要考虑加载更多的问题，可在遍历`item`的时候获取所有列的`maxHeight`, 同时将 box 的 height 设置为 maxHeight，监听滚动事件，直到box滚至底部时，触发`loadMore`事件即可~

### 常规动态布局
> 大多数瀑布流组件都是采用绝对定位布局，但也可以不用绝对定位实现瀑布流~

下面要介绍的第三方插件[vue-waterfall2](#vue-waterfall2)就不是用的绝对定位，具体可看下面插件原理分析，这里不再赘述了~




## 第三方插件


### Masonry
> Masonry是一个JavaScript网格布局库。它的工作原理是根据可用的垂直空间将元素放置在最佳位置，有点像泥瓦匠在墙上安装石头。
[Masonry官网](https://masonry.desandro.com/)

- demo:

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>masonry 布局</title>
    <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
    <script src="https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js"></script>
    <style>
        body {
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        }

        .item {
        position: relative;
        /* width: 25%; */
        width: 200px;
        border: 2px solid hsla(0, 0%, 0%, 0.5);
        box-sizing: border-box;
        counter-increment: count;
        }


        .item img {
        display: block;
        height: auto;
        width: 100%;
        }


        .item::after {
        position: absolute;
        display: block;
        top: 2px;
        left: 2px;
        width: 24px;
        height: 24px;
        text-align: center;
        line-height: 24px;
        background-color: #000;
        color: #fff;
        content: counter(count);
        }
    </style>
</head>
<body>
    <div class="grid">
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=1" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/520?radom=2" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=3" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/500?radom=4" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=5" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=6" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/480?radom=7" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=8" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=9" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/500?radom=10" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/460?radom=11" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/360?radom=12" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/420?radom=13" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/500?radom=14" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/200?radom=15" alt="">
        </div>
        <div class="item">
            <img src="https://picsum.photos/360/300?radom=16" alt="">
        </div>
    </div>
</body>
<script>
    var $grid = $('.grid').masonry({
        itemSelector: '.item', 
        // percentPosition: true, //使用百分比宽度的响应式布局
        horizontalOrder: true, //对项目进行布局以保持水平的从左到右的顺序,定义了此条件，照片一般会按照从左到右顺序排列，但也不是绝对的。
        originLeft: true, //设置布局方式为从左到右，此项是默认值，可以不填写，如果你设置值为false，则会从右到左排序
        originTop: true,//设置布局方式为从上到下，此项是默认值，可以不填写，如果你设置值为false，则会从下到上排序
        transitionDuration: '0.8s',//更改位置或外观时的过渡持续时间,默认是0.4s
        resize:true, //调整窗口大小时自动调整元素大小和位置，此项不推荐关闭
        initLayout: true,//默认为true，在初始化时候启用布局，如果设置为在初始化时禁用布局，可以在初始布局之前使用方法或添加事件，执行玩自定义方法后，在使用$grid.masonry()方法来初始化
    })

        //如果我initLayout: false,那么在初始化布局前，会先执行此方法，然后在调用$('.grid').masonry()方法进行初始化，下面方法只是举例
        $grid.masonry( 'on', 'layoutComplete', function() {
        console.log('layout is complete');
        });
        // 如果initLayout: true,则不需要此方法
        $grid.masonry();

        /** masonry的配置项一共有以下，不再多做介绍，可以自行去看英文官网。
        - Recommended 
        - itemSelector 
        - columnWidth 
        - Layout
        - Element sizing 
        - gutter
        - horizontalOrder 
        - percentPosition
        - stamp 
        - fitWidth
        - originLeft 
        - originTop
        - Setup 
        - containerStyle 
        - transitionDuration 
        - stagger 
        - resize 
        - initLayout
        **/
</script>
</html>
```
> Mosonry插件用起来比较简单，按照官网API进行配置就可以，只是可能会存在浏览器兼容性问题，需要注意一下；

它的布局原理通过控制台能看出其实就是用绝对定位来实现瀑布流：`position: absolute`


### waterfall
> 这是一个使用JS实现瀑布流布局的库，兼容到IE8，也是通过绝对定位`position:absolute`来实现瀑布流，实现原理跟上面的`Mosonry`比较类似；

[github地址](https://github.com/mqyqingfeng/waterfall)，该源码原生JS实现，无依赖，源码内容不多，核心逻辑都在[waterfall.js](https://github.com/mqyqingfeng/waterfall/blob/master/waterfall.js)里面，很适合用来学习~

具体使用及源码阅读直接看上方代码仓库即可，不再赘述~

参考：[原生 JS 实现一个瀑布流插件](https://juejin.cn/post/6844903557699731464)

#### EventEmitter
> 源码中定义了一个`EventEmitter`构造函数来管理事件，这里是使用了**发布/订阅模式**，即通过订阅事件将方法添加到缓存中，然后通过发布事件实现异步调用；

``` js

    // 创建事件订阅构造函数
    function EventEmitter() {
        this.__events = {}
    }

    // 订阅事件on
    EventEmitter.prototype.on = function(eventName, listener) {
        var events = this.__events;
        var listeners = events[eventName] = events[eventName] || [];
        var listenerIsWrapped = typeof listener === 'object';

        // 不重复添加事件
        if (util.indexOf(listeners, listener) === -1) {
            // 添加事件监听
            listeners.push(listenerIsWrapped ? listener : {
                listener: listener,
                once: false
            });
        }
        return this;
    };

    // 订阅事件once：只执行一次
    EventEmitter.prototype.once = function(eventName, listener) {
        return this.on(eventName, {
            listener: listener,
            once: true
        })
    };

    // 事件解绑
    EventEmitter.prototype.off = function(eventName, listener) {
        var listeners = this.__events[eventName];
        if (!listeners) return;

        var index;
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] && listeners[i].listener === listener) {
                index = i;
                break;
            }
        }

        if (typeof index !== 'undefined') {
            listeners.splice(index, 1, null) // 移除事件
        }

        return this;
    };

    // 发布事件
    EventEmitter.prototype.emit = function(eventName, args) {
        var listeners = this.__events[eventName];
        if (!listeners) return;

        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            if (listener) {
                listener.listener.apply(this, args || []); // 事件执行
                if (listener.once) { // 如果事件只需要执行一次，执行完毕，解绑事件
                    this.off(eventName, listener.listener)
                }
            }
        }

        return this;
    };
```
- 接着，要让 Waterfall 能使用发布/订阅模式，只需让 Waterfall 继承 eventEmitter 函数：
``` js
function WaterFall(opts) {
    EventEmitter.call(this);
    this.init();
}

var proto = WaterFall.prototype = new EventEmitter();
proto.constructor = WaterFall;
```

#### 获取图片高度
> 这里对于卡片有图片的情况，会通过`setInterval`轮询查询是否已获取了所有图片高度，等到都获取了，再最后一次性进行DOM绘制~

``` js
/**
 * 项目中使用：
 */
window.onload = function(){
    var waterfall = new WaterFall({
        container: '#waterfall',
        ...
    });
    // 调用waterfall实例的on事件
    waterfall.on("load", function(){
        setTimeout(function(){
            var arr = [];
            for (var i = 0, len = datas.length; i < len; i++) {
                var data = datas[i];
                arr.push('<div class="pin"><img src="' + data.src + '" class="img" alt="'+ data.title +'"> <p class="description">'+ data.title +'</p></div>')
            }
            // 调用 append 方法 检验是否所有的图片都具有高度后才会 append 进文档树中
            waterfall.append(arr.join(''), '.img')
        }, 1000)
    })
}

/**
 * 源码
 */
// append方法
proto.append = function(html, selector) {
    this._checkResult = [];

    var div = document.createElement("div")
    div.innerHTML = html;
    children = div.querySelectorAll(this.opts.pins) // 获取所有item卡片
    // 循环遍历添加所有item卡片
    var fragment = document.createDocumentFragment();
    for (var j = 0, len = children.length; j < len; j++) {
        fragment.appendChild(children[j])
        this._checkResult[j] = false;
        this._checkImgHeight(children[j], selector, j) // 检查图片高度
    }
    // 检查是否需要append到container
    this.isReadyAppend(fragment)
};

// 检查图片高度
proto._checkImgHeight = function(childNode, selector, index) {
    // 获取当前item图片
    var img = childNode.querySelector(selector);
    var self = this;
    // 本地图片会先执行 onload 事件
    img.onload = function() {
        if (img.getAttribute('height')) return;
        // 得到高度后，设置高度
        img.setAttribute('height', Math.floor(img.height / img.width * self.opts.pinWidth));
        // 通过标志量表示该图片已经设置了高度
        self._checkResult[index] = true
        clearInterval(timer)
    }
    // 加载失败
    img.onerror = function() {
        if (img.getAttribute('height')) return;
        img.setAttribute('height', 250); // 图片加载出错，设置默认高度
        self._checkResult[index] = true // 标记
        clearInterval(timer)
    }
    if (img.getAttribute('height')) return img;
    // 轮询检查: 通过设置 interval 来最快得到加载中的图片高度
    var check = function() {
        // 有宽高了
        if (img.width > 0 && img.height > 0) {
            // 设置图片宽高
            img.setAttribute('height', Math.floor(img.height / img.width * self.opts.pinWidth));
            self._checkResult[index] = true // 标记
            clearInterval(timer)
        }
    }
    var timer = setInterval(check, 40)

};
// 检查是否需要append到container
proto.isReadyAppend = function(fragment) {
    var self = this;
    // 轮询check
    var checkAllHaveHeight = function() {
        // 只有当所有图片都具有高度的时候，才添加进文档树
        if (util.indexOf(self._checkResult, false) == -1) {
            self._container.appendChild(fragment);
            // 重新设置位置
            self.setPosition(self._newPins);
            clearTimeout(timer)
        } else { // 否则继续查询
            setTimeout(checkAllHaveHeight)
        }
    }
    var timer = setTimeout(checkAllHaveHeight, 40);
};
```

#### scroll/resize
> 通过对`scroll`事件进行监听，来触发加载更多；对`resize`事件进行监听来触发重新加载；

``` js
// 滚动事件
proto.handleScroll = function() {
    var self = this;
    // 是否需要加载更多：
    if (self.checkScroll()) {
        self.appendPins();
    }
};
proto.checkScroll = function() {
    // 是否滚至底部
    if (this.getMin() - (window.pageYOffset || document.documentElement.scrollTop) < this._viewPortHeight + this.opts.threshold) {
        return true
    }
    return false;
};

// resize事件
proto.handleResize = function() {
    var self = this;
    clearTimeout(timer);
    timer = setTimeout(function() {
        self.resetPosition() // 重新计算位置，重新加载
    }, 100)
};
```



### vue-waterfall-plugin
> vue2 瀑布流插件，支持 PC 和移动端，支持 animate 的所有动画效果，支持图片懒加载~

[github地址](https://github.com/heikaimu/vue-waterfall-plugin)，[vue-waterfall.netlify.app](https://vue-waterfall.netlify.app/)

该插件是用vue2实现的瀑布流布局，实现原理也是先绝对定位`position:absolute;left:0;right:0`，然后计算行列宽高，通过`transfrom`
实现布局~




### vue3-waterfall-plugin
> 跟上面的插件同一个人写的，原理差不多，只是用vue3重新写了一遍~

这两个插件都是用vite开发的，可以阅读源码学习下怎么用`vue3 + vite`开发一个插件~


[github地址](https://github.com/heikaimu/vue3-waterfall-plugin)、[vue3-waterfall.netlify.app/](https://vue3-waterfall.netlify.app/)

参考：[vue3 写一个简单的瀑布流组件](https://juejin.cn/post/7087818215086260254)



### vue-waterfall-easy

用vue2实现的瀑布流布局组件，包含瀑布流布局和无限滚动加载，布局也是采用的绝对定位布局~

[github地址](https://github.com/lfyfly/vue-waterfall-easy)、[Demo预览](https://lfyfly.github.io/vue-waterfall-easy/demo)



### vue-waterfall2
> 使用vue2开发的瀑布流组件，布局没有使用绝对定位布局，不需知道元素宽高，可宽高自适应~

[github地址](https://github.com/AwesomeDevin/vue-waterfall2)、[vue-waterfall2 基于Vue.js 瀑布流 组件](https://juejin.cn/post/6844903715158097928)


- 使用：

``` js
// 引入
import waterfall from 'vue-waterfall2'
Vue.use(waterfall)

// 使用
<div class="waterfall">
    <waterfall
        :col="col" // 列
        :data="data" // 数据
        @loadmore="loadmore" // 加载更多
        :lazyDistance="50" // 懒加载边距
        :gutterWidth="gutterWidth" // 间隙距离
    >
    <template>
        {/* 自定义卡片内容 */}
        <div class="cell-item" v-for="(item, index) in data" :key="index">
            <img v-if="item.img" :lazy-src="item.img" alt="加载错误" />
            <div class="item-body">...</div>
            </div>
        </div>
    </template>
    </waterfall>
</div>
```


- **瀑布流布局原理**
> 大多数瀑布流布局都是采用绝对定位，但该组件没有使用绝对定位布局，可以看源码学习它的布局原理~

1. 在初始化的时候，先根据传入的列`col`动态生成每列的`div`，根据传入的参数，设置每列的宽度，然后将这些`div`都`appendChild`到父元素`root`上；
2. 然后在`resize`方法中，遍历所有传入的`cell-item`，调用`append`方法将当前`cell-item`添加到`dom`中；
3. 然后在`append`方法中，会遍历所有`col`，获取高度最小的列，将当前`cell-item` `appendChild`到当前列中；
> `append`方法是异步方法，必须在调用`__setDomImageHeight`方法返回结果之后，即所有图片加载完毕，设置好高度后，才能执行`appendChild`操作~
4. 在`__setDomImageHeight`方法中会遍历当前`cell-item`所有图片，加载，获取真实高度，设置图片高度~


源码实现如下：
``` js
// https://github.com/AwesomeDevin/vue-waterfall2/blob/master/lib/waterfall.vue

// 初始化
init() {
    //initialize
    this.root = this.$refs.vueWaterfall;
    var col = parseInt(this.col);
    // 初始化列
    for (var i = 0; i < col; i++) {
    let odiv = document.createElement("div");
    odiv.className = "vue-waterfall-column"; // 列
    // 设置列宽度
    odiv.style.width = this.width + "px";
    if (i != 0) {
    odiv.style.marginLeft = this.gutterWidth + "px";
    }
    this.columnWidth = this.width;
    this.root && this.root.appendChild(odiv); // 添加的root
    this.columns.push(odiv);
    }
    this.resize();
},

// 更新渲染
async resize(index, elements) {
    if (!index && index != 0 && !elements) { // 第一次加载
        elements = this.$slots.default; // 截取传入的默认slot
        this.loadedIndex = 0;
        this.clear();
    } else if (!elements) { // 加载更多
        this.loadedIndex = index;
        elements = this.$slots.default.splice(index); // 截取未加载的slot
    }
    // 遍历当前slot中的.cell-item
    for (var j = 0; j < elements.length; j++) {
        // 如果cell-item中有图片
        if (elements[j].elm && self.checkImg(elements[j].elm)) {
            var imgs = elements[j].elm.getElementsByTagName("img");
            var newImg = new Image();
            newImg.src = imgs[0].getAttribute("src") || imgs[0].getAttribute("lazy-src");
            if (newImg.complete) { // 图片已加载完成
                await self.append(elements[j].elm); // 将cell-item追加到dom中
                self.lazyLoad(imgs); // 懒加载
            } else {
                await new Promise((resolve, reject) => {
                    newImg.onload = async function () {
                        await self.append(elements[j].elm); //  将cell-item追加到dom中
                        self.lazyLoad(imgs); // 懒加载
                        resolve();
                    };
                    newImg.onerror = async function (e) {
                        await self.append(elements[j].elm);
                        self.lazyLoad(imgs);
                        resolve();
                    };
                });
            }
        } else { // 没有图片,直接将cell-item追加到dom中
            await self.append(elements[j].elm);
        }
        self.loadedIndex++;
    }
    self.$emit("finish"); // 加载完成
},

// 往每一列中添加元素
async append(dom) {
    //append dom element
    var self = this;
    if (this.columns.length > 0) {
        // 遍历获取高度最小的列
        let min = this.columns[0];
        for (var i = 1; i < this.columns.length; i++) {
            if (
            (await self.__getHeight(min)) >
            (await self.__getHeight(self.columns[i]))
            ) {
            min = self.columns[i];
            }
        }
        // 等待所有图片加载完成
        await this.__setDomImageHeight(dom);
        min && min.appendChild(dom); // 添加到高度最小的列中
    }
},

// 设置cell-item高度
async __setDomImageHeight(dom) {
    var imgs = dom.getElementsByTagName("img");
    // 加载当前卡片所有图片
    for (var i = 0; i < imgs.length; i++) {
        var lazySrc = imgs[i].getAttribute("lazy-src");
        if (!imgs[i].getAttribute("src") && lazySrc) {
            var newImg = new Image();
            newImg.src = lazySrc;
            // 加载所有图片，获取真实高度，设置图片高度
            if (newImg.complete) {
                var trueWidth = imgs[i].offsetWidth || this.columnWidth;
                var imgColumnHeight = (newImg.height * trueWidth) / newImg.width;
            if (trueWidth) {
                imgs[i].style.height = imgColumnHeight + "px";
            }
        } else {
            await new Promise((resolve, reject) => {
                newImg.onload = function () {
                    var trueWidth = imgs[i].offsetWidth || this.columnWidth;
                    var imgColumnHeight = (newImg.height * trueWidth) / newImg.width;
                    if (trueWidth) {
                        imgs[i].style.height = imgColumnHeight + "px";
                    }
                    resolve();
                };
                newImg.onerror = function () {
                    resolve();
                };
            });
        }
        }
    }
},
```


### v3-waterfall

这是一个用 vite 开发的 vue3 瀑布流组件，我看原理应该也是用绝对定位布局实现，会用`IntersectionObserver`来监听元素是否进入可视区域内来实现加载更多~

[源码github地址](https://github.com/gk-shi/v3-waterfall)，有时间可阅读源码学习怎么用vite开发vue3组件~


## 备注


### 获取图片高度
> 封装一个获取图片高度的方法~

``` js
/**
 * 
naturalHeight: 1180    用于获取图片的真实高度
naturalWidth: 1200    用于获取图片的真实宽度
height: 98       用户获取图片当前的渲染高度（会受 css 影响）
width: 100     用户获取图片当前的渲染宽度（会受 css 影响）

complete 属性  :可返回浏览器是否已完成对图像的加载。如果加载完成，则返回 true，否则返回 fasle。
onload   :可以监听到图片加载完成的动作
 */

function getImageSize(img){
    if(img.complete){
        console.log('complete', img)
        return Promise.resolve({
            naturalHeight: img.naturalHeight,
            naturalWidth: img.naturalWidth,
            height: img.height,
            width: img.width,
        })
    }else{
        return new Promise((resolve, reject)=>{
            img.addEventListener('load', ()=>{
              console.log('load', img)
                resolve({
                    naturalHeight: img.naturalHeight,
                    naturalWidth: img.naturalWidth,
                    height: img.height,
                    width: img.width,
                })
            })
        })
    }
}

// 使用
el = document.createElement('img');
el.src = 'http://cors-www.lilnong.top/favicon.ico?'+Math.random()

getImageSize(el).then(console.log).catch(console.error)
setTimeout(()=>getImageSize(el).then(console.log).catch(console.error), 1000)
```


### 商品加载重复问题

- 如下用例：
``` js
// vue3写法

// dataList 就是我们整个的商品卡片列表的数据 ，用户滑动到底部会加载新一页的数据 会再次触发 watch
watch(() => props.dataList ,(newList) => {
  dataRender(newList)
},{
  immediate: true,
})

const dataRender = async (newList) => {
    // dom渲染逻辑...
}
```
> 在瀑布流渲染过程中，可能出现 DOM 在没有加载完成的情况下，用户再次滑动到底部会再次加载新的一页数据；导致 watch 又会被触发，dataRender 会再次被执行，相当于会存在多个 dataRender 同时在执行，可能出现数据重复的情况。

- **标记法**
> 控制异步任务的次数，在一个 dataRender 完全执行完成之后才能执行另一个 dataRender ，在这里我们首先添加一个全局标记 fallLoad， 在最后一个节点渲染完才可以执行 dataRender

``` js
const fallLoad = ref(true)
watch(() => {
  if(fallLoad.value) {
    dataRender()
    fallLoad.value = false
  }
})

const dataRender = async (newList) => {
    // dom渲染逻辑...

    // 最后一个节点
    fallLoad.value = true
}
```
> 这样的话会丢弃掉用户快速滑动时触发的 dataRender ，只有在 DOM 渲染完成后再次触发新的请求时才会再次触发。但是这样可能会存在另外一个问题，有部分的 dataRender 被丢弃掉了，同时用户把所有的数据都加载完成了，没有新的数据来触发 watch ，这就导致部分商品的数据准备好了但在页面上没有渲染；

要想解决上述问题，就还需要单独做一些处理，实现上也可能会变得不太优雅~

- **Promise队列**
> 抛开我们的业务场景，dataRender 就可以当做一个异步的请求，然后问题就变成了**在同一时间我们收到了多个异步的请求，我们怎么让这些异步请求自动、有序执行**。

``` js
/**
 * 
实现思路：
1. 我们需要一个队列，队列中存储每个异步任务
2. 当把这个任务添加到这个队列中的时候自动执行第一个任务
3. 我们需要使用 promise.then() 来保证任务有序的执行
4. 当存队列中在多个异步任务的时候，怎么在执行完成第一个之后再去自动的执行后续的任务
 */


// 封装一个 asyncQueue 类
class asyncQueue {
  constructor() {
    this.asyncList = [];
    this.inProgress = false;
  }

  // 添加新数据
  add(asyncFunc) {
    return new Promise((resolve, reject) => {
      this.asyncList.push({asyncFunc, resolve, reject});
      if (!this.inProgress) { // 没有进行中的渲染任务，重新执行渲染
        this.execute();
      }
    });
  }

  // 执行渲染逻辑
  execute() {
    if (this.asyncList.length > 0) {
      const currentAsyncTask = this.asyncList.shift();
      currentAsyncTask.asyncFunc() // 执行dom渲染逻辑
        .then(result => {
          currentAsyncTask.resolve(result); // 渲染完成
          this.execute(); // 递归执行
        })
        .catch(error => {
          currentAsyncTask.reject(error);
          this.execute();
        });
      this.inProgress = true;
    } else {
      this.inProgress = false;
    }
  }
}
export default asyncQueue


// 调用
const queue = new asyncQueue()
watch(() => props.dataList, async (newVal, oldVal) => {
  queue.add(() => dataRender(newVal))
}, {
  immediate: true,
  deep: true
})
```
> 每次调用 add 方法会往队列中添加经过特殊包装过的异步任务，并且只有在没有正在执行中的任务的时候才开始执行 execute 方法。在每次执行异步任务时会从队列中 shift ，利用 promise.then 并且递归调用该方法，实现有序并且自动执行任务。在封装在这方法的过程中同样也使用到了我们的标记位大法 inProgress ，来保证我们正在执行当前队列时，突然又进来新的任务而导致队列执行错乱。


通过上述代码我们就可以，让我们的每一个异步任务有顺序的执行，并且让每一个异步任务执行完成以后自动执行下一个，完美的达到了我的需求。

> 参考：[瀑布流组件陷入商品重复怪圈？我是如何用心一解的！](http://zoo.zhengcaiyun.cn/blog/article/waterfall-flow)



### 获取各列最小高度

``` js
// 各列高度
let columsHeight = [column1.height, column2.height, column3.height, column4.height, ... ]
// 获取各列最小高度
let minHeight = Math.min.apply(null, columsHeight);
// 获取高度最小索引函数
function getMinhIndex(arr, value){
    return new Promise((reslove) => {
        let minIndex = 0;
        for(let i in arr){
            if(arr[i] == value){
                minIndex = i;
                break;
                reslove(minIndex);
            }
        }
    });
}

// 通过最小高度,得到第几列高度最小
this.getMinhIndex(columsHeight, minHeight).then(minIndex => {
	 // 渲染加载逻辑
});
```


### 绝对定位和transform
> 绝对定位以设置了相对定位的父元素左上角为基准点进行偏移，translate是以设置了该属性的元素起始位置左上角为基准点。

- 使用 top left 定位是直接改变元素真实位置的，用 `transform: translateY(-5px)` 只是改变了视觉位置，元素本身位置还是在 0px，只是视觉上向上偏移了 5px。
- 做动画的时候 `transform` 相对来说是比较方便的，比如你希望一个元素向左飞 50px 那就是 `transform: translateX(-50px)`; 但是如果用 left 而你的父子元素都是 position: absolute，那可能你用 left 就要写成从 left: 100px 到 left: 30px，这就很不直观。
- 使用绝对定位并改变元素的left和top属性时，可能会触发重排。因为这些属性的可能会影响元素的位置，从而改变导致其他元素的位置和大小发生变化，按下触发重排；
- translate 是 transform 属性的⼀个值。改变transform或opacity不会触发浏览器重排（reflow）或重绘（repaint），只会触发复合（compositions）。⽽改变绝对定位会触发重排，进⽽触发重绘和复合。
> transform使浏览器为元素创建⼀个 GPU 图层，支持硬件加速，并不需要软件⽅⾯的渲染，但改变绝对定位会使⽤到 CPU。 因此translate()更⾼效，可以缩短平滑动画的绘制时间。 ⽽translate改变位置时，元素依然会占据其原始空间，绝对定位就不会发⽣这种情况。

[前端性能优化-CSS的性能优化：--transform与position的区别、硬件加速工作原理及注意事项](https://blog.csdn.net/thewar196/article/details/124602244)



### IntersectionObserver实现懒加载
> [IntersectionObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver)是浏览器提供的可以**监听一个元素和可视区域相交部分的比例，然后在可视比例达到某个阈值的时候触发回调**的API，在瀑布流布局中可通过该API来实现卡片的懒加载；但可能有兼容性问题~

**实现思路**：IntersectionObserver 监听图片元素，出现在视图当中开始从瀑布流数据队列的列头中取出一个数据并渲染到当前瀑布流的最低列，如此循环往复实现瀑布流的懒加载。

具体实现可参考[教你如何实现一个完美的移动端瀑布流组件](https://juejin.cn/post/7086330043038695432)~







## 手动实现瀑布流组件

::: tip 思考：
- 布局实现方案：绝对定位、transform、动态计算高度？
- 兼容性：对不同框架的适用
- 性能：滚动监听，高度计算，
- 懒加载，滚动加载更多
- 对不需要瀑布流布局模块的兼容
:::


我用`Vite`开发了一个Vue3的瀑布流组件，放在我的组件库[Verney-UI](https://www.npmjs.com/package/vue3-verney-ui)里了，目前有些功能还不太完善，后续再细化下~ 具体组件库开发流程见这里：[使用npm开发一个自己的Vue3组件库](/more/npm-package.html)




## 参考

- [瀑布流布局原理及详解](https://blog.csdn.net/qq_43432158/article/details/121903435)
- [「中高级前端」干货！深度解析瀑布流布局](https://juejin.cn/post/6844904004720263176)

- [css页面布局--瀑布流布局](https://segmentfault.com/a/1190000024512687)
- [2022年了！再来手撕一下前端瀑布流代码吧！](https://developer.aliyun.com/article/974879)