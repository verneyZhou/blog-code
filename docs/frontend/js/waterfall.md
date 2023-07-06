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
            column-gap: 0; /* 指定列与列之间的间隙。 */
        }

        .item {
            padding: 2px;
            position: relative;
            counter-increment: count; /* counter-increment属性递增一个或多个计数器值。*/
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

**在多列布局中，项目是按列显示的**。通常在瀑布流布局中，你希望它们是按行显示。著作权归作者所有。




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

这是因为：由于flex的容量的高度是固定的，这时候缩小容器的宽度，而容器内的图片高度又因为宽度而改变（图片宽度设置成width: 100%），这时候flex只需要分成两列，便可以容纳所有图片，而我们只是用了数学方式来取巧规定了顺序，而交叉轴宽度变小，打乱了原先布局，能那么这时候图片顺序又会被打乱。




### Grid布局

网格布局（Grid）是很强大的 CSS 布局方案；它将网页划分成一个个网格，可以任意组合不同的网格，做出各种各样的布局。以前，只能通过复杂的 CSS 框架达到的效果，现在浏览器内置了。

[CSS Grid 网格布局教程](https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)


- **Grid Vs Flex**
> Grid 布局与 Flex 布局有一定的相似性，都可以指定容器内部多个项目的位置。但是，它们也存在重大区别。Flex 布局是轴线布局，只能指定"项目"针对轴线的位置，可以看作是**一维布局**。Grid 布局则是将容器划分成"行"和"列"，产生单元格，然后指定"项目所在"的单元格，可以看作是**二维布局**。Grid 布局远比 Flex 布局强大。







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


### multi-column 多栏布局


### 左右分栏布局


### 第三方插件


#### Masonry
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




## 实践




### npm包封装

::: tip 思考：
- 实现方案
- 兼容性：对不同框架的适用
- 性能：滚动监听，高度计算，
- 懒加载，滚动加载更多
:::




## 参考

- [瀑布流布局原理及详解](https://blog.csdn.net/qq_43432158/article/details/121903435)
- [「中高级前端」干货！深度解析瀑布流布局](https://juejin.cn/post/6844904004720263176)
- [瀑布流组件陷入商品重复怪圈？我是如何用心一解的！](http://zoo.zhengcaiyun.cn/blog/article/waterfall-flow)

- [css页面布局--瀑布流布局](https://segmentfault.com/a/1190000024512687)
- [2022年了！再来手撕一下前端瀑布流代码吧！](https://developer.aliyun.com/article/974879)