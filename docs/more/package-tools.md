---
title: 前端打包工具
date: 2021-11-14 09:20:58
permalink: /pages/819ca8/
article: false
categories:
  - 
tags:
  - 
---

# 前端打包工具

## esbuild

https://www.zhihu.com/question/394060026

::: tip 为什么 esbuild 这么快？
- 使用 Go 编写，并且编译成了机器码
    > 现在的构建工具一般都是用 JavaScript 进行编写的，对于这种解释型语言（动态语言）来说，在命令行下的性能非常糟糕。因为每次运行编译的时候 V8 引擎都是第一次遇见代码，无法进行任何优化措施。而 esbuild 使用 Go 这种编译型语言（静态语言）编写而成，已经编译成了机器可以直接执行的机器码。当 esbuild 在编译你的 javaScript 代码的时候，可能 Node 还在忙着解析你的构建工具的代码。
- 大量使用并行算法
    > 除了 Go 语言天生对于并发的优势，使得其处理并发任务性能远远优于 JavaScript， Esbuild 的内部算法也是经过精心设计的，尽可能的压榨所有的 CPU 核心。
- esbuild 的所有内容都是从零编写的
    > 自己编写一切而不是使用第三方库有很多性能上的好处。可以从一开始就考虑到性能，可以确保所有的东西都使用一致的数据结构以避免昂贵的转换，当然，缺点就是这工作量非常大。
- 更有效利用内存
    > esbuild 通过减少 AST 遍历次数（三次），来减小内存访问速度对于打包速度的影响; Go 语言还有一个好处就是可以把数据更加紧凑的储存在内存中，从而使得高速 CPU 缓存可以存下更多的内容。
:::



## webpack


## rollup



## Snowpack

- 跟vite的比较：https://vitejs.cn/guide/comparisons.html


## vite

https://vitejs.cn/

## parcel

