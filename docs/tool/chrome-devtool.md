---
title: chrome-devtools使用技巧记录
date: 2023-10-16 17:39:45
permalink: false
categories:
  - devtools
  - 调试
tags:
  - devtools
---


# chrome-devtools使用技巧记录

> 这里主要记录下 Chrome Devtools 的使用技巧~



打开控制台：
- 方法1：页面单击鼠标右键 => 点击【检查】
- 方法2：mac快捷键：【command】 + 【option】+ i


## 截图

1. 打开控制台 => 【...】 => 【Run command】:

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/devtool01.jpg')" width="auto"/>

2. 输入关键词`screen`, 可看到有四种截屏方式~

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/devtool02.jpg')" width="auto"/>


- Capture area screenshot
> 区域截屏：选择之后，鼠标会变成十字架，之后鼠标左键选中一个区域后，松开鼠标就会自动截取所选区域~


- Capture full size screenshot
> 全尺寸截屏：选择之后会截取页面全部内容，适合有滚动条页面的截屏~


- Capture node screenshot
> node节点截屏

1. 打开控制台后，先选中需要截取的node节点：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/devtool03.jpg')" width="auto"/>


2. 然后点击【 Capture node screenshot】 即可截取该node节点~


- Capture screenshot
> 直接截取页面可视区域部分内容~



## Console


- `$_` 是一个特殊变量，其值始终等于控制台中上一次操作的结果, 此技术是调试代码的便捷方法~

``` shell
1 + 2 # 3
$_ * 3 # 9
$_ # 9
$_ + 4 # 13
```













## 性能分析



## 其他技巧


- 重新发送 XHR 请求：打开网络面板【Network】 =>  单击【XHR】按钮  => 选择你要重新发送的XHR请求  => 【Replay XHR】





## 备注



## 收藏


