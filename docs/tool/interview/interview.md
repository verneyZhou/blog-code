---
title: 面试题收集
date: 2021-09-04 19:51:21
# permalink: false # 0b758e/
article: false
categories: 
  - null
tags: 
  - null
permalink: false # e82559/
---

# 面试题收集




## 题目

- localStorage、cookie 区别

  [cookie和localstorage的区别](https://blog.csdn.net/net343/article/details/84989452)

- http 缓存

  [一文读懂http缓存（超详细）](https://www.jianshu.com/p/227cee9c8d15)

- 如何获取页面的所有标签种类
> `[...new Set(Array.from(document.querySelectorAll('*')).map(v => v.tagName))]`

- 盒模型有几种?有什么区别？

  [HTML的两种盒子模型](https://blog.csdn.net/konghouy/article/details/80643610)


- 前端性能优化？

  [前端性能优化 24 条建议（2020）](https://segmentfault.com/a/1190000022205291)


- node.js的运行原理

  [Nodejs的运行原理-科普篇](https://www.cnblogs.com/peiyu1988/p/8032982.html)


- koa、express的对比


- http / https 区别
```
HTTPS协议需要CA证书，费用较高；而HTTP协议不需要；
HTTP协议是超文本传输协议，信息是明文传输的，HTTPS则是具有安全性的SSL加密传输协议；
使用不同的连接方式，端口也不同，HTTP协议端口是80，HTTPS协议端口是443；
HTTP协议连接很简单，是无状态的；HTTPS协议是有SSL和HTTP协议构建的可进行加密传输、身份认证的网络协议，比HTTP更加安全。

中间人攻击：
针对SSL的中间人攻击方式主要有两类，分别是SSL劫持攻击和SSL剥离攻击
1. SSL劫持攻击即SSL证书欺骗攻击，攻击者为了获得HTTPS传输的明文数据，需要先将自己接入到客户端和目标网站之间；在传输过程中伪造服务器的证书，将服务器的公钥替换成自己的公钥，这样，中间人就可以得到明文传输带Key1、Key2和Pre-Master-Key，从而窃取客户端和服务端的通信数据；
2. 但是对于客户端来说，如果中间人伪造了证书，在校验证书过程中会提示证书错误，由用户选择继续操作还是返回，由于大多数用户的安全意识不强，会选择继续操作，此时，中间人就可以获取浏览器和服务器之间的通信数据
```

- 移动端 1px 问题
> 一种是利用 css 中的transfrom：scaleY(0.5)，另一种是设置 媒体查询根据不同 DPR 缩放，[https://zhuanlan.zhihu.com/p/100752129](https://zhuanlan.zhihu.com/p/100752129)


- visibility: hidden 与 opacity: 0 有什么区别
> visibility:hidden 会被子元素继承，可以通过设置子元素visibility:visible 使子元素显示出来; opacity: 0 也会被子元素继承，但是不能通过设置子元素opacity: 0使其重新显示; visibility:hidden 元素上绑定的事件也无法触发；opacity: 0元素上面绑定的事件是可以触发的。


- webpack编译流程
::: tip webpack编译流程
1. 初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
2. 开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
3. 确定入口：根据配置中的 entry 找出所有的入口文件；
4. 编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
5. 完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
7. 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。
:::




## 收藏 

- [三本毕业（非科班），四次阿里面试，终拿 offer](https://mp.weixin.qq.com/s/8N14ABzLrAJyUZsZmvpTrA)
- [阿里终面：如何才能盛下最多的水？](https://mp.weixin.qq.com/s/PMsFcmKAk7-fVk9aUwjygA)
- [阿里巴巴前端面试分享-社招（p6）](https://blog.csdn.net/weixin_34096182/article/details/91462396)
- [前端面试集合](https://juejin.cn/column/7004656346549207077)
  - [最新的前端大厂面经（详解答案）](https://juejin.cn/post/7004638318843412493)
  - [30 道 Vue 面试题，内含详细讲解（涵盖入门到精通，自测 Vue 掌握程度）](https://juejin.cn/post/6844903918753808398)
  - [最全的 Vue 面试题+详解答案](https://juejin.cn/post/6961222829979697165)
- [「吐血整理」再来一打Webpack面试题](https://juejin.cn/post/6844904094281236487)
- [蚂蚁、字节、滴滴面试经历总结](https://juejin.cn/post/6844904161830502407)
- [2021年前端各大公司都考了那些手写题(附带代码)](https://juejin.cn/post/7033275515880341512)
- [面试官：如何中断已发出去的请求？](https://juejin.cn/post/7033906910583586829)
- [你不知道的浏览器页面渲染机制](https://juejin.cn/post/6844903815758479374)
- [阿里Node.js面试题集合](https://blog.csdn.net/qq_40126542/article/details/80984761)
- [前端面试—Koa与Express的区别](https://juejin.cn/post/6875152985949732872)
- [当面试官让我回答React和Vue框架的区别......](https://juejin.cn/post/7144648542472044558)
- [阿里面试官：请设计一个不能操作DOM和调接口的环境](https://juejin.cn/post/7157570429928865828)
- [vue中动态引入图片为什么要是require， 你不知道的那些事](https://juejin.cn/post/7159921545144434718)
- [面试官：你确定多窗口之间sessionStorage不能共享状态吗？？？🤔](https://juejin.cn/post/7076767687828832286)

- [25 道常见的 TypeScript 面试题及答案](https://mp.weixin.qq.com/s/jb3B9ltv3gvg2V4G8ESGZw)
