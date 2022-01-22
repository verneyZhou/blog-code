---
title: js正则学习笔记
date: 2021-04-19 23:44:26
permalink: /pages/1e7f47/
article: false
categories:
  - 
tags:
  - 
---
# js正则学习笔记
> 这里是我的js正则学习笔记。








## 例子

### 判断 url 中只包含 qq.com
```js
function check(url){
  return /^https?:\/\/w+\.qq\.com[^.]*$/.test(url);
}
```


## 参考

- [https://juejin.cn/post/6844903648309297166](https://juejin.cn/post/6844903648309297166)

