---
title: JS笔试题收集
date: 2021-04-28 20:44:03
permalink: /pages/ba1a9f/
article: false
categories:
  - js
tags:
  - 面试
---
# JS笔试题收集


## 收藏

- [JavaScript Questions](https://github.com/lydiahallie/javascript-questions)
- [一些代码片段](https://mp.weixin.qq.com/s/CxrzdjEDFuaL57lh3dLgpg)
- [这45道面试可能被问到的JS判断题！你能答对几道？](https://juejin.cn/post/7021704952586174478)
- [avascript 里的奇葩知识](https://segmentfault.com/a/1190000023941089)
- [44道JS难题，做对一半就是高手](https://www.jianshu.com/p/e161bd720e64)
- [牛客网最新百道前端 JavaScript 笔试题](https://juejin.cn/post/7023271065392513038)


## 记录

1. 题目如下，补全`?`的内容，使页面打印`1`
``` 
let a = ?
if (a == 1 && a == 2 && a == 3) {
    console.log(1);
}
```
解：
``` js
// 解法1
let a = {
    value: 1,
    toString: function() {
        return a.value ++
    }
}

// 解法2
let a = {
  i: 1,
  valueOf() {
    return a.i ++
  }
}

// 解法3
let value = 1;
Object.defineProperty(window, 'a', {
    get() {
        return value ++;
    }
})


// 解法4
var a = new Proxy({i: 1}, {
    get(target) {
        return () => target.i ++;
    }
})

if (a == 1 && a == 2 && a == 3) {
    console.log(1);
}

```
> 扩展：什么样的 a 可以满足 (a === 1 && a === 2 && a === 3) === true 呢？
``` js
let current = 0
Object.defineProperty(window, 'a', {
  get () {
    current++
    return current
  }
})
console.log(a === 1 && a === 2 && a === 3) // true
```
[参考](http://www.fly63.com/article/detial/851)



