---
title: 《从 0 到 1 实现一套 CI/CD 流程》学习笔记
date: 2023-07-18 23:45:57
permalink: false
categories:
  - CI/CD
  - 工程化
tags:
  - CI/CD
---

# 《从 0 到 1 实现一套 CI/CD 流程》学习笔记

课程地址：[从 0 到 1 实现一套 CI/CD 流程](https://juejin.cn/book/6897616008173846543)



## 笔记

- **以前的构建部署流程：**
1. 开发人员将源代码，经过编译、压缩等一系列流程打包为制品（意思为打包后的成品）
2. 将制品上传到服务器。
3. 在服务器将编译后的文件，手动上传到可用的容器服务内（例如`Nginx，Tomcat，Apache` 等服务）

**总结**：编写代码 => 上传代码库 => 编译代码并压缩，生成制品 => 上传至服务器

> **缺点**：繁琐，且容易出错，是非常影响开发效率


### CI/CD

- **CI**

CI（continuous integration） 的意思是 **持续构建** 。

负责拉取代码库中的代码后，执行用户预置定义好的操作脚本，通过一系列编译操作构建出一个 **制品** ，并将制品推送至到制品库里面。常用工具有 `Gitlab CI，Github CI，Jenkins` 等。这个环节不参与部署，只负责构建代码，然后保存构建物。构建物被称为 制品，保存制品的地方被称为 “制品库”。

持续集成CI是在源代码变更后自动检测、拉取、构建的过程。


- **CD**

CD 则有2层含义：**持续部署（Continuous Deployment） 和 持续交付（Continuous Delivery） 。** 

持续交付 的概念是：将制品库的制品拿出后，部署在测试环境 / 交付给客户提前测试。 

持续部署 则是将制品部署在生产环境。可以进行持续部署的工具也有很多： `Ansible` 批量部署， `Kubernetes` 集群部署，`Docker` 直接推拉镜像等等。



::: tip 写一个自己的网站放到服务器上：
编写代码 -> （单元测试/集成测试） -> 上传至代码仓库 -> 打包构建 -> 上传至服务器 -> 配置 Nginx/Apache 将 80 端口映射至网站文件夹
:::
> 有了 CI/CD 的系统之后，我们就只需要编写代码，剩下的步骤都交给 CI/CD 系统来处理，这极大地解放了我们的双手，提升了开发效率。





::: tip 小册学习内容
1. 你写完了代码，提交到了 Git 代码库
2. 随后，代码库配置的 WebHook 钩子或人工手动启动了 Jenkins 的构建流程
3. Jenkins 启动构建流程。按照你之前配置好的构建脚本，将代码编译成功。
4. 编译成功后，将编译后的文件打包为 docker 镜像，并将镜像上传到私有镜像库。
5. 随后，使用 kubectl 指定远程的k8s集群，发送镜像版本更新指令
6. 远程的k8s集群接收到指令后，去镜像库拉取新镜像
7. 镜像拉取成功，按照升级策略（滚动升级）进行升级，此时不会停机。
8. 升级完毕。
:::



















## 备注


### Mac查看系统信息

- Mac终端输入shell命令`sw_vers`, 获取当前Mac 操作系统 版本号和编译版本号:
``` shell
➜  ~ sw_vers
ProductName:	macOS # 操作系统
ProductVersion:	12.1 # 版本号
BuildVersion:	21C52 # 编译版本号
➜  ~ uname -a # 读取到Mac 操作系统的信息
Darwin APB22015030.local 21.2.0 Darwin Kernel Version 21.2.0: Sun Nov 28 20:29:10 PST 2021; root:xnu-8019.61.5~1/RELEASE_ARM64_T8101 arm64
```

- Mac终端输入`system_profiler`查看系统信息：

``` shell
➜  ~ system_profiler SPHardwareDataType # 获取系统硬件信息
Hardware:

    Hardware Overview:

      Model Name: MacBook Pro # 型号名称
      Model Identifier: MacBookPro17,1  # 型号标识符：
      Chip: Apple M1  # 芯片
      Total Number of Cores: 8 (4 performance and 4 efficiency)  #  核总数：8（4性能和4能效）
      Memory: 16 GB  # 内存
      System Firmware Version: 7429.61.2  # 系统固件版本
      OS Loader Version: 7429.61.2   # 操作系统加载程序版本
      Serial Number (system): C02GX3NSQ05P #   序列号（系统）
      Hardware UUID: BA50DA8D-9B6E-559C-9D41-DB9018BF0805   
      Provisioning UDID: 00008103-000634911150801E
      Activation Lock Status: Enabled   # 激活锁状态


➜  ~ system_profiler SPSoftwareDataType # 获取系统软件信息
Software:

    System Software Overview:

      System Version: macOS 12.1 (21C52)  # 系统版本
      Kernel Version: Darwin 21.2.0  # 内核版本
      Boot Volume: Macintosh HD  # 启动宗卷
      Boot Mode: Normal   # 启动模式
      Computer Name: APB22015030  #   电脑名称
      User Name: zhouyuan10 (zhouyuan10) 
      Secure Virtual Memory: Enabled  # 安全虚拟内存
      System Integrity Protection: Enabled   # 系统完整性保护
      Time since boot: 5 days 10:32  #  启动后的时间长度

➜  ~
```
> 操作：点击桌面左上角 》关于本机 》系统报告，也能查看系统信息~


- macOS Ventura（版本13.0）是苹果公司用于麦金塔桌面操作系统macOS的第19个主要版本；
- macOS Monterey（版本12）是苹果公司用于麦金塔桌面操作系统macOS的第18个主要版本；
- macOS Big Sur（版本11.0）是苹果公司用于麦金塔桌面操作系统macOS的第17个主要版本，也是现时的主要版本，并且是macOS Catalina（版本10.15）的继任版本；
- 搭载 Apple 芯片的 Mac 电脑: 从 2020 年末推出的某些机型开始，Apple 开启了 Mac 电脑从 Intel 处理器到 Apple 芯片的过渡。







### 服务器


ECS 云服务器

实例：2核 2GB

CPU：2核，  内存：2GB

操作系统: centos lunix 

Centos 是一个基于 Linux 的开源免费操作系统



### DevOps

DevOps Development 和 Operations 的组合，是一种方法论，并不特指某种技术或者工具。DevOps 是一种重视 Dev 开发人员和 Ops 运维人员之间沟通、协作的流程。通过自动化的软件交付，使软件的构建，测试，发布更加的快捷、稳定、可靠。




### 前端部署


- FTP部署

- nginx + jenkins 部署


- nginx + jenkins + docker 部署







