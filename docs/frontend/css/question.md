---
title: 一些关于css的问题
date: 2021-08-03 23:51:30
# permalink: null
article: false
categories: 
  - css
tags: 
  - css
permalink: false # a2c276/
---
# 一些关于css的问题

## 原理篇

- **js执行会阻塞DOM树的解析和渲染，那么css加载会阻塞DOM树的解析和渲染吗？**

**答：** css加载不会阻塞DOM树的解析，css加载会阻塞DOM树的渲染，css加载会阻塞后面js语句的执行。

::: tip 浏览器渲染的流程：
1. HTML解析文件，生成DOM Tree，解析CSS文件生成CSSOM Tree；
    > DOM解析和CSS解析是两个并行的进程，所以CSS加载不会阻塞DOM的解析
2. 将Dom Tree和CSSOM Tree结合，生成Render Tree(渲染树)；
    > Render Tree是依赖于DOM Tree和CSSOM Tree的，所以他必须等待到CSSOM Tree构建完成才开始渲染。因此，CSS加载是会阻塞Dom的渲染的
3. 根据Render Tree渲染绘制，将像素渲染到屏幕上。
:::
[参考](https://juejin.cn/post/6844903667733118983?)


- **css的哪些属性会触发重排和重绘？**




## 实战篇



## 参考

