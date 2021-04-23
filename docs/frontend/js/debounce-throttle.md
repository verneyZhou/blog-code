# 防抖与节流
这里是我的防抖和节流函数学习记录。

## 前言
浏览器的`resize、scroll、keypress、mousemove`等事件在触发时，会不断地调用绑定在事件上的回调函数；如果这些回调函数是较为复杂的逻辑或页面频繁渲染等操作，那么当事件触发的频率没有限制时，将会极大地浪费资源，降低前端性能。为了优化体验，需要对这类事件进行调用次数的限制。

于是**防抖和节流**应运而生。

## 防抖（debounce）
> 防抖，防止抖动。当持续触发事件时，`debounce`会合并事件且不会去触发事件，当一定时间内没有再触发这个事件时，才真正去触发事件。

- 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
- 回调函数只执行一次。

以页面缩放事件`resize`为例：
```js
function resizeFn() {
    console.log('====resize');
}
window.addEventListener('resize', resizeFn);
```
当拖动页面时，发现`resizeFn`事件会被频繁触发，如何减少这个事件的触发频率呢？

下面手写一个简单版的`debounce`函数实现一下：

### 实现
```js
function debounce (fn, delay) {
    var context = this;
    var timer = null; // 初始化延时器

    // 返回匿名函数
    return function () {
        var args = arguments; // 获取fn入参
        if (timer) clearTimeout(timer); // 如果设置了延时器，先清除它
        // 再设置延时器
        timer = setTimeout(function () {
            fn.apply(context, args); // 改变this指向，传入参数
        }, delay);
    };
};

// 使用
window.addEventListener('resize', debounce(resizeFn, 500));
```
这样只有当页面缩放停止`500ms`后才会触发`resizeFn`事件，且只会触发一次。
> 分析下`debounce`函数的执行流程：
- 在`resize`事件上绑定处理函数，这时`debounce`函数会立即调用，实际上绑定的函数是`debounce`内部返回的匿名函数；
- 每一次事件被触发，都会清除当前的`timer`然后重新设置延时器；
- 只有当最后一次触发结束，过了`delay`时间之后才会触发`fn`。

上面这个版本不能立即执行，只能等触发结束后才能执行一次，下面改进一下，兼容可以立即执行的情况：
```js
// 改进版
function debounce (fn, delay, now) {
    var context = this;
    var timer = null;
    var start = false;

    var res = function () {
        let args = arguments;
        if (timer) clearTimeout(timer);
        if (now && !start) {
            fn.apply(context, args); // 立即执行
            start = true;
        }
        timer = setTimeout(function () {
            fn.apply(context, args);
            start = false;
        }, delay);
       
    };

    // 添加取消方法
    res.cancel = function() {
        clearTimeout(timer);
        timer = null;
        start = false;
    };

    return res; // 设置一个返回值
};
```
这个版本兼容了立即执行的情况，提供了返回值、取消方法。
```js
// 使用
function resizeFn(el) {
    console.log('====resize',el);
}

let debounceFn = debounce(resizeFn, 500, true);
window.addEventListener('resize', debounceFn);

document.getElementById('btn').onclick = function () {
    debounceFn.cancel(); // 取消
}
```



## 节流（throttle）
> throttle（节流），规定在一个时间阈值内，只能触发一次回调。如果这个时间阈值内触发多次，只有一次生效。

- 持续触发事件时，throttle会合并一定时间内的事件，并在该时间结束时真正去触发一次事件。
- 设定一个时间阈值，在这段时间内事件只能执行一次，降低事件的执行频率。

以鼠标移动事件`mousemove`为例：
```js
function mousemoveFn() {
    console.log('====mousemove');
}
document.body.addEventListener('mousemove', mousemoveFn);
```
当在页面滑动鼠标时，发现`mousemoveFn`事件会被频繁触发，如何减少这个事件的触发频率呢？

下面手写一个简单版的`throttle`函数实现一下：
```js
// 节流函数
function throttle(fn, wait) {
    var context = this;
    var timer = null;
    var previous = null; // 保存上一次触发时间

    // 返回匿名函数
    return function () {
        var now = +new Date(); // 现在的时间
        if (!previous) previous = now; // 获取时间

        if (timer) clearTimeout(timer);
        if (now - previous > wait) { // 达到时间阈值，执行一次
            fn.apply(context, arguments); // 立即执行回调
            previous = now; // 更新上一次触发时间
        } else { // 时间阈值内如果再次触发，设置延时器
            timer = setTimeout(() => {
                fn.apply(context, arguments); // 立即执行回调
            }, wait);
        }
    }
}

// 使用
document.body.addEventListener('mousemove', throttle(mousemoveFn, 200))
```
这样当鼠标在`body`内滑动时，每`200ms`执行一次。

> `throttle`的执行流程和`debounce`类似：
- 在`mousemove`事件上绑定处理函数，这时`throttle`函数会立即调用，实际上绑定的函数是`throttle`内部返回的匿名函数；
- 每一次事件被触发，会记录当前时间`now`，和上一次触发时间`previous`；并清除当前的`timer`；
- 在事件不停触发的过程中，当达到设置的时间阈值`wait`时，立即执行回调`fn`；
- 如果再次触发事件时还未达到`wait`，则设置延时器。

可以给`throttle`添加取消方法，跟`debounce`类似，这里不再赘述了。

## 区别
- 防抖和节流都是防止某一事件的频繁触发，但原理不同：防抖是事件触发期间不执行，结束后执行一次；节流是时间触发期间每隔一段时间执行一次。


## 应用场景

### debounce
- 页面缩放事件：`resize`；
- 鼠标连续点击事件，如`keydown、keyup`等；
- `input`输入框内容变化`change`事件

### throttle
- 页面滚动事件：`scroll`；
- 鼠标拖拽事件：`mousemove`

## 备注
1. `lodash`[源码](https://github.com/lodash/lodash/blob/master/debounce.js)比较