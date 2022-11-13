---
title: 移动端真机调试
date: 2022-11-02 19:45:05
permalink: false
categories:
  - 移动端
  - debug
tags:
  - debug
---


# 移动端真机调试

## Whistle

http://wproxy.org/whistle/


### 手机抓包

- 下载 Whistle, 启动， 添加浏览器代理SwitchyOmega， 配置证书
- 手机端添加手动代理，访问 url，就可以在pc端抓到访问的接口


### weinre 真机调试

http://t.zoukankan.com/fafa-coding-p-10833547.html



- 本地启动项目，生成访问链接：ip://端口
- whistle中添加rules: `merpproxy.sina.com weinre://test`
- 手机访问上述链接下url,访问Weinre,可看到 test 目录下有链接出现，则可看到该项目的console,接口等信息（但好像样式信息补全...）




## vConsole



## chrome浏览器调试

chrome://inspect


https://blog.csdn.net/sansan_7957/article/details/90641505
