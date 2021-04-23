



https://juejin.cn/post/6844903747617832973

变量提升（hoisting）

```js
{
    function a() {
        console.log(20);
    }
    window.a = a;
    a = 10;
    a = 20;
    
    window.a = a;
    a = 30;
}
    
    console.log(a);
```

递归：尾递归




### 面试题

[let](https://mp.weixin.qq.com/s/AIMxdo3P466jYzdI1_i5lQ)