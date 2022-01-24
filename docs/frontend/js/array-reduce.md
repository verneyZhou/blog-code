---
title: 数组的reduce学习笔记
date: 2021-04-17 13:11:38
# permalink: false # 91f4c0/
categories: 
  - js
tags: 
  - js
  - reduce
permalink: false # bcba6e/
---
# 数组的reduce学习笔记
这里是我的数组reduce方法学习记录。


## 简介
> reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。

- **语法：**

`array.reduce(function(total, currentValue, currentIndex, arr), initialValue)`

::: tip 参数
- `total`：累计器累计回调的返回值，它是上一次调用回调时返回的累积值；必需。
- `currentValue`：数组中正在处理的元素；必需。
- `currentIndex`：当前元素索引；如果提供了initialValue，则起始索引号为0，否则从索引1起始；非必需。
- `arr`：调用reduce()的数组；非必需。
- `initialValue`：作为第一次调用 callback函数时的第一个参数的值。 如果没有提供初始值，则将使用数组中的第一个元素。 在没有初始值的空数组上调用 reduce 将报错。
:::
具体讲解见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)。
> 如果没有提供`initialValue`，`reduce`会从索引`1`的地方开始执行`callback`方法，跳过第一个索引。如果提供`initialValue`，从索引`0`开始。如果**数组为空且没有提供initialValue**，会抛出`TypeError`。

- **例子**
```js
var arr = [1,2,3,4,5];
// 计算数组arr每项累加之和
var sum = arr.reduce((pre, cur, index) => {
    console.log(pre, cur, index); // 循环执行5次
    return pre + cur;
}, 0)
console.log(sum); // 15
```

## 用法

### 1.数组求和、求乘积
> `reduce`常用的场景就是用来进行数组求和、求乘积等操作，求和上面已经展示过了，下面展示求乘积的写法：
```js
var arr = [1,2,3,4,5];
var sum = arr.reduce((pre, cur, index) => {
    return pre * cur;
})
console.log(sum); // 120
```

### 2. 数组去重
> 这个方法在**数组常用方法整理**里已经讲过，具体见那篇博文中的[includes+reduce去重](/frontend/js/array-methods.html#_5-includes-reduce去重)。

### 3. 将二维数组转化为一维数组
```js
let arr = [[1,2],[3,4],[5,6]]
let arr_flat = arr.reduce((pre,cur) => {
    return pre.concat(cur);
},[])
console.log(arr_flat); // [1,2,3,4,5,6]
```

### 4. 将多维数组转化为一维数组
> 这个方法也在**数组常用方法整理**里已经讲过，具体见那篇博文中的[reduce实现](/frontend/js/array-methods.html#_6-reduce实现)。

### 5. 统计字符串每个字符出现字次数
```js
let str = '2336fsdfsfdbfhv2354354';
let strObj = str.split('').reduce((pre, cur) => {
    if (pre[cur]) { // pre中已添加cur属性
        pre[cur] ++; // 次数累加
    } else { // 没有则向pre中添加cur属性
        pre[cur] = 1;
    }
    return pre;
},{})
console.log(strObj); // {2: 2, 3: 4, 4: 2, 5: 2, 6: 1, f: 4, s: 2, d: 2, b: 1, h: 1, s: 2, v: 1}
```

### 6. 组合筛选数组
> `reduce`可以根据具体条件，筛选判断返回一个新的数组，这里简单举个例子：
```js
let arr = [
    {name: 'tom', age: 20}, 
    {name: 'rose', age: 18},
    {name: 'jack', age: 20},
    {name: 'xiaoming', age: 19}
]

/***** 获取age为20的所有人的name *****/
// filter+map实现
// let nameArr = arr.filter(v => v.age === 20).map(v => v.name);
// reduce实现
let nameArr = arr.reduce((pre, cur) => {
    if (cur.age === 20) pre.push(cur.name);
    return pre;
},[])
console.log(nameArr); // ["tom", "jack"]
```
用`reduce`可以实现对原数组的筛选、过滤、分类等操作，比较灵活。
> 再举一个类似的例子：创建一个groupBy方法，能对原数组按指定条件进行分类。
```js
// 函数封装
const groupBy = (arr, condition) => {
    return arr.reduce((pre,cur) => {
        // 对传入的分类参数condition进行类型判断
        let key = typeof condition === 'function' ? condition(cur) : cur[condition];
        // 如果属性不存在，则创建一个
        if (!pre.hasOwnProperty(key)) {
            pre[key] = [];
        }
        // 将元素加入数组
        pre[key].push(cur);

        return pre;
    }, {})
}

/**使用**/
// 原数组
let arr = [1.2, 2.3, 3.4, 5.6, 3.6, 2.7, 7.8];
// 1. 把 arr 数组中的元素按照整数部分的值分组
let obj = groupBy(arr, (item) => {
    return parseInt(item); // 获取整数部分
})
console.log(obj); // {1: [1.2], 2: [2.3, 2.7], 3: [3.4, 3.6], 5: [5.6], 7: [7.8]}

// 2. 按字符串长度进行分类
let arr2 = ['one', 'two', 'three', 'four', 'five']
let obj2 = groupBy(arr2, 'length')
console.log(obj2); // { 3: ["one", "two"], 4: ["four", "five"], 5: ["three"] }
```

### 7. 按顺序调用异步操作
> 项目中会遇到好几个接口请求按顺序依次执行的情况，这里可以用reduce实现。
```js
let promise1 = (a) => {return new Promise((resolve) => {
    resolve(a);
})}
let promise2 = (a) => {return new Promise((resolve) => {
    resolve(a * 2);
})}
let promise3 = (a) => {return new Promise((resolve) => {
    resolve(a * 3);
})}

let arr = [promise1, promise2, promise3];
let result = arr.reduce((all, cur) => {
    return all.then(cur);
}, Promise.resolve(10))

result.then(res => {
    console.log(res); // 60;
})
```

### 8. 获取url后面的参数
在项目中会经常需要获取url路径后面传的参数，并将其转化成一个对象，这里可以用`reduce`实现：
```js
// '?a=1&b=2' ====>  {a:1,b:2}
function searchQuery (search) {
    const queryStr = search.split('?').pop(); // a=1&b=2
    if (!queryStr) return {};
    return queryStr.split('&').reduce((prev, cur) => {
        const [key, value] = cur.split('='); // 获取key和value
        return {
            ...prev,
            [key]: window.decodeURIComponent(value) // 对value进行解码，兼容url后面的参数被encodeURIComponent（编码）的情况。
        };
    }, {});
};
console.log(searchQuery(`?a=1&b=2&c=${window.encodeURIComponent('url=https://www.baidu.com')}`))
// {a: "1", b: "2", c: "url=https://www.baidu.com"}
```
当需要获取url的传参时，这个方法算是比较实用的。

### 9. 使用`reduce`实现`map`方法
```js
// callback：回调函数  context：this指向
Array.prototype.map2 = function(callback, context) {
    let arr = Array.prototype.slice.call(this); // 获取传入的arr；this为调用这个方法的数组;
    return arr.reduce((preArr,cur, index, array) => {
        preArr[index] = callback.call(context, cur, index, array) // 将回调返回的值添加的preArr[key]
        return preArr; // 返回新数组
    },[])
}

let arr = [1,2,3,4].map2((value, index, array) => {
    return `value:${value}; index: ${index}; length: ${array.length}`
})
console.log(arr);
[
    "value:1; index: 0; length: 4",
    "value:2; index: 1; length: 4",
    "value:3; index: 2; length: 4",
    "value:4; index: 3; length: 4"
]
```
其实`reduce`是一个很强大的方法，它的强大之处在于可以返回任意类型的数据，因此，只要具备可遍历结构，都可以使用reduce解决，不管是数组、字符串、对象、set、map。这里只是罗列我遇到过的可以用`reduce`处理的场景，其实它能处理的场景还有很多，后续遇到了也会继续补充。

## `reduce`的模拟实现

### 1.基础版
这里手写一个`reduce`方法，实现接收一个函数作为累加器的功能，直接上代码：
```js
Array.prototype.reduce2 = function (fn, initValue) {
    let arr = Array.prototype.slice.call(this); // slice浅拷贝：获取传入的arr
    let _this = this;
    let res,startIndex;
    if (initValue === undefined) { // 兼容没有传入初始值的情况
        // 找到第一个非空元素及其下标
        for(let i = 0; i < arr.length; i++) {
            if (!arr.hasOwnProperty(i)) continue; // 跳出当前循环，执行下一个循环
            startIndex = i;
            res = arr[i];
            break; // 跳出循环
        }
    }  else { // 
        res = initValue;
    }

    for (let i = startIndex || 0; i < arr.length; i ++) {
        if (!arr.hasOwnProperty(i)) continue;
        res = fn.call(_this, res, arr[i], i, _this); // 获取fn回调返回的值，赋给res
    }
    return res; // 返回res
};

// 使用一下：
let sum = [1,2,3,4,5].reduce2((pre, cur, index, array) => {
    console.log(pre, cur, index, array); // 循环执行5次
    return pre + cur;
}, 10)
console.log(sum); // 25
```
这个方法兼容了`initValue`没有传的情况，能够满足`reduce`的大多数使用场景；接下来完善下，兼下各种边缘情况：

### 2.完善版
```js
Array.prototype.reduce2 = function (fn, initValue) {
    if (this == undefined) {
        throw new TypeError('this is null or not defined');
    }
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not a function');
    }
    let arr = Array.prototype.slice.call(this);
    let _this = this;
    let res,startIndex, len = arr.length;
    if (initValue === undefined) { // 兼容没有传入初始值的情况
        // 找到第一个非空元素及其下标
        for(let i = 0; i < len; i++) {
            if (!arr.hasOwnProperty(i)) continue; // 跳出当前循环，执行下一个循环
            // 如果超出数组界限还没有找到累加器的初始值，则TypeError
            if (i >= len) {
                throw new TypeError('Reduce of empty array with no initial value');
            }
            startIndex = i;
            res = arr[i];
            break; // 跳出循环
        }
    }  else { // 
        res = initValue;
    }

    for (let i = startIndex || 0; i < len; i ++) {
        if (!arr.hasOwnProperty(i)) continue;
        res = fn.call(_this, res, arr[i], i, _this); // 获取fn回调返回的值，赋给res
    }
    return res; // 返回res
};
```

## 总结
1. `reduce`还是一个很强大的方法，它的强大之处在于可以返回任意类型的数据，因此，只要具备可遍历结构，都可以使用reduce解决，不管是数组、字符串、对象、set、map。


## 备注
1. reduce是ES6之前就已经提出了的方法，目前除了IE9以下，市面的的大多数浏览器都支持。


## 其他
暂无~