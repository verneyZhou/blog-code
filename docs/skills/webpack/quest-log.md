---
title: webpack配置相关问题记录
date: 2021-11-23 10:27:40
# permalink: false # ea3b91/
article: false
categories: 
  - null
tags: 
  - null
permalink: false # 351566/
---



# webpack配置相关问题记录



1. 打包时懒加载的js数量较多会影响打包速度吗？为什么？




## eslint相关


- `ctrl+s`时，自动eslint格式化没生效



- `ctrl+s`自动格式化时报错：
``` shell
ESLint: Failed to load plugin 'vue' declared in 'vue3-vite-admin/.eslintrc.js': createRequire is not a function Referenced from: /Users/admin/my-code/self/byme/vue3-study/vue3-vite-admin/.eslintrc.js. Please see the 'ESLint' output channel for details.
```