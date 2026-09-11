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




## 鼎桥一面 2026-05-21
1. 介绍下商业化主要做了什么，业务架构；地图服务做了什么；讲一下B端低码平台；
2. 讲一下微博电商AI助手；
3. react和vue底层原理有什么异同；
4. 浏览器从输入url到渲染完成经历了什么，找一个过程详细讲一下； 


## 鼎桥二面 2026-05-22
1. 感觉应该是hr面，没有问技术问题，主要问了工作经历，为什么离职，在百度学到了什么，自己有哪些需要改进的...



## OPPO一面 2026-05-24
1. 问了浏览器的事件循环机制，node.js的事件循环机制；2
2. 讲讲B端低码平台，怎么进行变量配置，怎么进行渲染，项目设计；C端低码平台组件物料怎么设计的？
3. node.js做过什么项目，怎么请求数据库，架构设计
4. 电商sku设计，webview H5怎么调app原生能力；讲讲前端组件库；
5. vue的nextTick实现原理是什么，跟Promise有什么区别？
``` sh
数据变更不会立刻同步改 DOM，而是把“需要更新的组件渲染任务”放进队列，合并去重后在“下一次调度”统一 flush； nextTick 就是把你的回调也塞进同一套 flush 之后的回调队列里，保证执行时机在 DOM 更新之后。

安排 flush”优先用 微任务 ： Promise.then 或 MutationObserver ；再降级到 setImmediate / setTimeout （宏任务）。

- Promise.then ：只保证“当前调用栈结束后，以微任务执行”，不关心 Vue 是否已经把 DOM 更新完。
- nextTick ：保证“Vue 已经把由你这次状态变更引起的渲染队列 flush 完、DOM 已更新”之后执行。
```



## UMU一面 2026-05-28
1. 隐藏一个dom元素有哪些方法，visibility和opacity有什么区别
2. react v16之后新版本有哪些更新？react diff算法有哪些优化
3. http缓存有哪些，什么场景用协商缓存，什么场景用强缓存；js静态缓存用什么缓存策略；http怎么做跨域，主域名相同和子域名不同算跨域吗，如何解决
4. 性能优化做过哪些，结合具体项目介绍下
5. node.js做过全栈吗，介绍下具体架构设计
6. 项目工程上用过哪些ai提效工具，工程化提效，用过哪些skill



## 字节一面 2026-07-06
1. 问了项目中有没有哪些影响比较深的项目，我说了商业化体系的搭建，B端低码平台，H5首页性能优化
2. 问了B端低码平台复杂点在哪里，RAG设计有哪些优化策略？怎么解决幻觉问题？skill怎么做的？设计一个agent会怎么设计？摘要怎么进行压缩的？...
3. H5首页性能优化做了什么，统计LCP这些指标的口径是什么？
4. 代码题：写一个控制高并发的方法，限制异步请求数量




1. 解决过什么具体的技术问题，怎么解决的
2. 首页加载白屏时间过长，怎么解决
3. AI修改代码后怎么保证修改后的代码达到安全标准