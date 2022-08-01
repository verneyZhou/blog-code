---
title: 前端登录相关知识梳理
date: 2021-08-02 23:08:34
# permalink: false # b6306f/
article: false
categories: 
  - null
tags: 
  - null
permalink: false # 7790d9/
---
# 前端登录相关知识梳理



## 单点登录（SSO）

单点登录（Single Sign On），简称为 SSO，是目前比较流行的企业业务整合的解决方案之一。SSO的定义是在多个应用系统中，用户只需要登录一次就可以访问所有相互信任的应用系统。
> SSO 一般都需要一个独立的认证中心（passport），子系统的登录均得通过passport，子系统本身将不参与登录操作；当一个系统成功登录以后，passport将会颁发一个令牌给各个子系统，子系统可以拿着令牌会获取各自的受保护资源，为了减少频繁认证，各个子系统在被passport授权以后，会建立一个局部会话，在一定时间内可以无需再次向passport发起认证


- [图文并茂，为你揭开“单点登录“的神秘面纱](https://juejin.cn/post/6844904038555729927)
- [封装 axios 拦截器实现用户无感刷新 access_token](https://juejin.cn/post/6854573219119104014)

## 二维码扫描登录


## 参考

- [前端鉴权必须了解的5个兄弟：cookie、session、token、jwt、单点登录](https://juejin.cn/post/6898630134530752520)
- [关于鉴权，看懂这篇就够了](https://mp.weixin.qq.com/s/qBizMF4MwcX4ORU_nrVUmg)