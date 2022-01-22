---
title: 一些移动端开发小技巧
date: 2021-07-25 21:51:14
permalink: /pages/9544b3/
article: false
categories:
  - 
tags:
  - 
---

# 一些移动端开发小技巧


## 小技巧

### 移动端软键盘变为搜索方式
> 默认情况下软键盘上该键位为前往或者确认等文字，要使其变为搜索文字，需要在 input 上加上 type 声明：
``` html
<form action="#">
    <input type="search" placeholder="请输入..." name="search" />
</form>
```
> 需要一个 form 标签套起来,并且设置 action 属性,这样写完之后输入法的右下角就会自动变成搜索,同时，使用了 search 类型后，搜索框上会默认自带删除按钮。

### 解决IOS页面滑动卡顿
``` css
html, body {
    /* 解决 ios手机上，网页中可滚动区域滚动不流畅，手指滑动多少页面就只滚动多少，没有弹性效果 */
    -webkit-overflow-scrolling : touch;
}
```

## 常见问题



## 参考

- [H5常见问题及解决方案手册](https://mp.weixin.qq.com/s/kG7Df7nR_zu4DbiKfabeVQ)
- [微信H5页面前端开发，大多数人都会遇到的几个兼容性坑](https://segmentfault.com/a/1190000019986963)