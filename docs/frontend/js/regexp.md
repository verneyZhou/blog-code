---
title: js正则学习笔记
date: 2021-04-19 23:44:26
# permalink: false # 1e7f47/
article: false
categories: 
  - null
tags: 
  - null
permalink: false # f364dc/
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

- [可能是最好的正则表达式的教程笔记了吧...](https://juejin.cn/post/6844903648309297166)
- [这些常用正则表达式是怎么写出来的？](https://juejin.cn/post/7073360739410378760)
- [厉害！这篇正则表达式竟写的如此详尽](https://mp.weixin.qq.com/s/s5CfAQTLNnXYJwCAerZcYA)
