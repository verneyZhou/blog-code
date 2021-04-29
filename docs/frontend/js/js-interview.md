

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