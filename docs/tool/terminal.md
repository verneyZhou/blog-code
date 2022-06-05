---
title: 终端学习笔记
date: 2021-04-28 21:16:47
# permalink: false # be4775/
categories: 
  - terminal
tags: 
  - terminal
permalink: false # e2cd19/
---


# 终端学习笔记


## 定义
要说清终端是什么，我们先来看看操作系统的组成。简化来说，操作系统分为两个部分，一部分称作内核，另一部分成为用户交互界面。内核部分负责系统的全部逻辑操作，由海量命令组成，这一部分是系统运行的命脉，不与用户接触；交互界面则是开机之后所有我们所看到的东西，比如窗口，软件，应用程序等等。

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/terminal001.jpeg')" width="auto"/>

终端就是连接内核与交互界面的这座桥，**提供一个命令的输入输出环境**，它允许用户在交互界面上打开一个叫做「Terminal 终端」的应用程序，在其中输入命令，系统会直接给出反馈。


## 与shell的关系
**shell是一个命令行解释器**，是linux内核的一个外壳,负责外界与linux内核的交互。shell接收用户或者其他应用程序的命令, 然后将这些命令转化成内核能理解的语言并传给内核, 内核执行命令完成后将结果返回给用户或者应用程序。当你打开一个terminal时，操作系统会将terminal和shell关联起来，当我们在terminal中输入命令后，shell就负责解释命令。

## bash
**bash 是一个为GNU计划编写的Unix shell；Bourne-Again SHell**。Bash是许多Linux发行版的默认Shell 。事实上，还有许多传统UNIX上用的Shell，例如tcsh、csh、ash、bsh、ksh等等，Shell Script大致都类同，当您学会一种Shell以后，其它的Shell会很快就上手，大多数的时候，一个Shell Script通常可以在很多种Shell上使用。

## zsh
**Zsh是一个Linux用户很少使用的shell**。这是由于大多数Linux产品安装，以及默认使用bash shell。几乎每一款Linux产品都包含有zsh，通常可以用apt-get、urpmi或yum等包管理器进行安装。

## 运行
终端是系统中一个应用程序，你可以直接在所有程序中找到它，点击打开就行。或者使用聚焦搜索，输入「终端」或「Terminal」，看到终端被选中了按下回车即可


## 基础指令
``` shell
echo $SHELL   # 显示环境变量$SHELL的值
cat /etc/shells   # 查询可用的shell列表
pwd    # 查看当前路径
ls    # 查看当前路径有什么文件；ls -R 可查看所有子文件
ll    # ls -l 的简写，显示当前目录下文件详细信息
cd pathName  # 打开文件夹；pathName也可把文件拖入终端自动提取; cd ~ 返回根目录
clear  # 清除输入记录
mkdir filename  # 新建文件夹
rmdir filename  # 删除空文件夹
rm -r -f filename    # 强制删除文件夹
# 注：rm表示删除文件；-r 表示删除当前路径下所有子文件；-f表示无视被保护的文件依旧删除
open fileName  # 使用默认程序打开文件夹
touch fileName # 新建文件
vim filename # 终端打开文件；打开之后输入 i 进入编辑模式；点击 ESC 退出编辑模式；输入 :wq 保存并退出 :q!强制退出 :wq!强制保存退出
    :set nu  # 当vim nginx.conf 打开配置文件后可输入此命令显示行数
cp -r copyUrl newUrl   # 拷贝文件   copyUrl：被拷贝文件路径   newUrl：新路径
du -hd 1 .   # 查看文件存储大小

mv fromfile tofile  # 移动命令，如果tofile已经存在的话，会直接装原文件覆盖，从而造成文件的丢失

```



## 小技巧
``` shell
touch -t 199505090000 pathName  # 修改文件创建或修改日期，这条命令是把创建时间改为1995 年 5 月 9 日 00:00 分
caffeinate   # 让电脑不就如休眠状态；恢复正常：ctrl + C
killall WeChat  # 程序假死了强行退出没用时可用这个命令强退，此为强退weChat
passwd  # 修改电脑密码
banner -w 80 hello world  # 打印机械感十足的文字
```

- iTerm
> `command + d` :左右分屏

> `command + shift + d` :垂直分屏


## 参考
1. [Terminal终端入门](https://www.jianshu.com/p/eedf9209150f)
2. [linux命令](https://www.cnblogs.com/peida/archive/2012/12/05/2803591.html)
3. [shell、终端](https://www.cnblogs.com/sench/p/8920292.html)
4. [shell菜鸟教程](https://www.runoob.com/linux/linux-shell.html)



<!-- 2021-04-29 -->


