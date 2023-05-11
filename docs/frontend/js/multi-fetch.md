---
title: JS实现异步请求并发数量控制
date: 2023-02-26 21:00:33
# permalink: /pages/e4e235/
permalink: false
categories:
  - frontend
  - js
tags:
  - js
---

# 如何实现并发请求数量控制？


面试或工作中经常遇到接口并发数量控制的问题，如下所述：
::: warning 实现一个并发请求函数concurrencyRequest(urls, maxNum)，要求如下：
1. 要求最大并发数 maxNum
2. 每当有一个请求返回，就留下一个空位，可以增加新的请求
3. 所有请求完成后，结果按照 urls 里面的顺序依次打出（发送请求的函数可以直接使用fetch即可）
:::

这里简单记录几个实现方案~


## 方案一：for循环遍历实现
首先新建一个`test.html`页面，实现点击按钮请求20个异步接口~
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <button id="btn">并发请求</button>
</body>
<script>
     document.getElementById('btn').addEventListener('click', () => {
        const urls = [];
        for (let i = 1; i <= 20; i++) {
            urls.push(`https://jsonplaceholder.typicode.com/todos/${i}`);
        }
        concurrencyRequest01(urls, 3).then(res => {
            console.log('===results', res);
        })
    })

    // 异步请求方法
    async function concurrencyRequest01(urls, maxNum) {
        // ...
    }
</script>
```

- `concurrencyRequest1`实现：
``` js
async function concurrencyRequest1(urls, maxNum) {
    return new Promise((resolve) => {
        if (urls.length === 0) {
            resolve([]);
            return;
        }
        const results = [];
        let index = 0; // 下一个请求的下标
        let count = 0; // 当前请求完成的数量

        // 发送请求
        async function request() {
            if (index === urls.length) return;
            const i = index; // 保存序号，使result和urls相对应
            const url = urls[index];
            index++;
            console.log('====concurrencyRequest1', url, i);
            try {
                const resp = await fetch(url);
                // resp 加入到results
                results[i] = resp;
            } catch (err) {
                // err 加入到results
                results[i] = err;
            } finally {
                count++;
                // 判断是否所有的请求都已完成
                if (count === urls.length) {
                    console.log('完成了');
                    resolve(results);
                }
                request();
            }
        }

        // maxNum和urls.length取最小进行调用
        const times = Math.min(maxNum, urls.length);
        for(let i = 0; i < times; i++) {
            request();
        }
    })
}
```
> 初始时，通过for循环遍历进行接口请求，执行`request()`方法；然后在`request()`方法里当有接口执行结束，就递归再次执行`request`方法，实现对其他接口的调用~

参考：[关于前端：如何实现并发请求数量控制？](https://juejin.cn/post/7163522138698153997)


## 方案二：while循环遍历实现

``` js
function concurrencyRequest02(urls, maxNum) {
    const fetchFunc = url => fetch(url).then(res => res.json()); // 将fetch结果转为json
    const len = urls.length;
    const results = new Array(len).fill(null); // 存储请求结果
    let currentIndex = 0; // 当前已完成的请求数
    let runningCount = 0; // 当前正在执行的请求数

    function run() {
        // 当前请求数小于maxNum, 且 未请求完，循环遍历
        while (runningCount < maxNum && currentIndex < len) {
            let i = currentIndex;
            const url = urls[currentIndex];
            console.log('===concurrencyRequest02', url, currentIndex);
            currentIndex++;
            runningCount++;
            fetchFunc(url).then(data => { 
                // results[urls.indexOf(url)] = data;
                results[i] = data;
                runningCount--;
                run(); // 递归继续执行
            });
        }
    }

    return new Promise((resolve, reject) => {
        run(); // 先执行一波
        // 轮询判断是否已执行完毕
        const timer = setInterval(() => {
            if (currentIndex >= len && runningCount <= 0) {
                clearInterval(timer);
                console.log('=====finally fetch')
                resolve(results);
            }
        }, 10);
    });
}
```
> 原理上跟方案一差不多，都是通过循环遍历实现限制，只是这个方案会先封装一个`fetchFunc`方法，然后循环调用这个方法实现异步调用；并且这个方案是通过一个定时器轮询判断所有接口是否已执行结束。



## 方案三：`Promise.all`实现
> 使用了`async/await`来处理异步操作，并且在外部使用`Promise.all`来等待所有任务完成, 代码更简洁

``` js
async function concurrencyRequest03(urls, maxNum) {
    let i = 0;
    const len = urls.length;
    const result = [];

    // 异步函数doFetch来发送请求并将结果保存到一个数组中
    async function doFetch() {
        while (i < len) {
            const url = urls[i++];
            console.log('===concurrencyRequest03', url, i);
            try {
                const response = await fetch(url);
                const data = await response.json();
                result.push(data);
            } catch (error) {
                console.log(error);
            }
        }
    }

    const tasks = [];
    for (let j = 0; j < maxNum; j++) {
        tasks.push(doFetch());
    }

    // 在外部使用Promise.all来等待所有任务完成
    await Promise.all(tasks);

    console.log('===finally fetch');
    return result;
}
```
> 这个实现方式和前一个方式有些类似，也是使用了一个异步函数`doFetch`来发送请求并将结果保存到一个数组中。不同的是，这里使用了`async/await`来处理异步操作，并且在外部使用`Promise.all`来等待所有任务完成。这种实现方式代码比较简洁，同时也可以实现我们的要求。



## 备注

- 这里记录一个只能串行执行异步请求的方法，以后有需要用到的地方可以借鉴~

``` js
async function concurrencyRequest_T(urls, maxNum) {
    let count = 0; // 定义一个计数器，用于记录当前正在进行的请求数量，初始值为0
    const results = []; // 存储请求结果的数组
    const queue = urls.map((url, index) => ({ url, index })); // 定义一个请求队列，用于存储还未发送的请求

    // 定义一个发送请求的函数 sendRequest(url)，使用 fetch 发送请求，并返回 Promise 对象
    async function sendRequest(url) {
        const response = await fetch(url);
        return response.json();
    }

    // 循环函数
    // 定义一个循环函数 run()，每次取出请求队列中的一个请求并发送。
    // 当正在进行的请求数量达到最大并发数 maxNum 时，暂停发送请求，等待有请求完成后再继续发送请求。
    async function run() {
        while (queue.length > 0) {
            if (count < maxNum) {
                const { url, index } = queue.shift(); // 返回第一个元素
                console.log(url, index);
                count++;
                const result = await sendRequest(url);
                results[index] = result;
                count--;
            } else { // 如果正在请求的数量超过maxNum，就100ms后再访问
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    // 启动循环
    await run();

    console.log('====finish fetch');
    return results;
}

```



