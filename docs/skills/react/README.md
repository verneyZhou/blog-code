---
title: React学习笔记
date: 2024-09-27 14:20:03
# permalink: false # 85a4fa/
article: false
categories: 
  - null
  - null
tags: 
  - null
permalink: false # 233a67/
---

# React相关学习笔记

> 这里是我的 React 相关学习笔记~



## 笔记

- [turborepo + pnpm搭建react组件库](./component-library.html)


## 问题记录

- 有时useState更新数组会有延迟的问题？
``` js
// 使用prevState可解决
setState((prevState: any[]) => {
    prevState[index] = res;
    return [...prevState];
});
```


## 收藏


- [50天用react.js重写50个web项目，我学到了什么？](https://segmentfault.com/a/1190000040813435)
- [React 性能优化 | 包括原理、技巧、Demo、工具使用](https://juejin.cn/post/6935584878071119885)
- [「记录篇」我是如何一步步为公司搭建react项目脚手架的](https://juejin.cn/post/7235547967112806437)
- [一篇文章带你理解 React 中最“臭名昭著”的 useMemo 和 useCallback](https://juejin.cn/post/7165338403465068552)
- [用TypeScript编写React的最佳实践](https://mp.weixin.qq.com/s/XhwVwTw8ZXZdqY9cCJWsQg)
- [2024 年 React 生态系统一览](https://mp.weixin.qq.com/s/-Qz5v4X3Nm8j3tjUILgwaQ)
- [React 性能优化 | 包括原理、技巧、Demo、工具使用](https://juejin.cn/post/6935584878071119885)

- [useEffect 一定在页面渲染后才会执行吗？](https://juejin.cn/post/7370138993062887476)
- [React18-Hooks初识（一）：useEffect执行机制+清理副作用](https://juejin.cn/post/7454024890220724260)

- [50个开发人员都应该知道的 React.js 超级技巧（上）](https://mp.weixin.qq.com/s/63kXKIGx0PgQlTK-YDj5Fg)、[50个开发人员都应该知道的 React.js 超级技巧（下）](https://mp.weixin.qq.com/s/iqmz96LIH9_V7RvadEW-wA)

- [搞懂这12个Hooks，保证让你玩转React](https://juejin.cn/post/7101486767336849421)
- [作为一名React，我是这样理解HOC的](https://juejin.cn/post/7103345085089054727)
- [深入React，彻底搞懂React](https://juejin.cn/column/7088194204316205092)

- [2024/2025 年 React 组件库 与 相关库 推荐](https://zhuanlan.zhihu.com/p/546697951)
- [flow流程图工具库](https://github.com/xyflow/xyflow)
