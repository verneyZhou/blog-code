

## 一些笔试题
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
let value = 1;
Object.defineProperty(window, 'a', {
    get() {
        return value ++;
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


[一些代码片段](https://mp.weixin.qq.com/s/CxrzdjEDFuaL57lh3dLgpg)