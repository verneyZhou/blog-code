---
title: interview-log2026
date: 2026-03-30 20:25:20
permalink: false
article: false
categories:
  - tool
  - interview
tags:
  - 
---


# 面试记录

## 宇信科技一面 2026-03-30
主要围着低代码平台问了很多问题


## 美团一面 2026-03-30
1. 在电商业务场景下做过哪些优化项目？
说了秒杀，下单，支付；
收益指标是转换率提高了，运营反馈率下降了；后端高并发情况少了

2. 说下最近做过的优化项目；React中useContext和Redux的区别；HOC，hooks，redux的使用场景
说了H5首页加载性能优化，也说了B端低码平台；

3. AI龙虾在工作中的应用

4. 手写题：（妈蛋，居然没写出来....）
``` js
// 删除有序数组中的重复项2: 给你一个有序数组 nums ，请你 原地 删除重复出现的元素，使得出现次数超过两次的元素只出现两次 ，返回删除后数组的新长度。
// 不要使用额外的数组空间，你必须在 原地 修改输入数组 并在使用 O(1) 额外空间的条件下完成。


```



## 滴滴一面 2026-04-14

1. 讲一下langchain.js做rag的架构设计，面对知识库文档很多的情况，怎么提高准确率？有哪些优化策略？
2. for in 和 for of 的区别？for of 能迭代对象吗？什么是可迭代对象？
3. 手写实现instanceof
4. 手写题：
``` js
  // 假设本地机器无法做加减乘除法，需要通过远程请求让服务端来实现。
// 以加法为例，现有远程API的模拟实现
const addRemote = async (a, b) => new Promise(resolve => {
    setTimeout(() => resolve(a + b), 1000)
})

// 请实现本地的add方法，调用addRemote，能最优的实现输入数字的加法。
 async function add() {
	let args = [...arguments];
     console.log(args);
    let limit = addRemote.length;
    let sum;
    return new Promise(async (resolve) => {	
        while(args.length) {		
            let len = sum === undefined ? limit : limit - 1;		
            // let newArgs = args.slice(0, len);
            let newArgs = args.splice(0, len); // 返回移除数组，会修改原数组
            if (sum !== undefined) {
                newArgs = [sum, ...newArgs];
            }
            // args = args.slice(len);
            console.log(args);
            const res = await addRemote(...newArgs);		
            sum = res;	
        }
        resolve(sum);
    })
}
 // 请用示例验证运行结果:
add(1, 2)
    .then(result => {
    console.log(result) // 3
    })

add(3, 5, 2)
    .then(result => {
    console.log(result) // 10
    })

```
5. 问下AI方向的应用场景；提示我表达有点急，让我冷静清晰地表达，不要急躁...



## 腾讯云雀一面 2026-04-15
1. 说下最近做过的项目，低码平台组件渲染，怎么控制变量，怎么进行版本控制...
2. RAG项目中text2sql怎么做的，rag有哪些优化策略？怎么解决幻觉问题？
3. 问了AI coding，rules和skill的区别，什么是spec coding和Harness Engineering？有哪些AI实践？
4. 手写题：`实现一个函数，用于找出两个字符串的最长公共子串： 例如，输入`'abcde'`和`'cdefg'`，输出`'cde'`。`




## 滴滴二面 2026-04-16
1. 说一下最近参与过的项目，说了B端低码平台
2. 说下h5首页性能优化
3. 说下rag项目，平时在AI Coding上有没有什么积累？
4. 手写题：`数组排序，去重；输入([2,3,4,6,8], [1,3,4,5,7]), 返回[1,2,3,4,5,6,8]`