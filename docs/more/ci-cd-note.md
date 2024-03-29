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

CI（continuous integration） 的意思是 **持续构建** ,也被称为**持续集成**。

负责拉取代码库中的代码后，执行用户预置定义好的操作脚本，通过一系列编译操作构建出一个 **制品** ，并将制品推送至到制品库里面。常用工具有 `Gitlab CI，Github CI，Jenkins` 等。这个环节不参与部署，只负责构建代码，然后保存构建物。构建物被称为 制品，保存制品的地方被称为 “制品库”。

持续集成CI是在源代码变更后自动检测、拉取、构建的过程。

CI的全称是Continuous Integration，直译为可持续集成，而普遍对其的解释是**频繁地（一天多次）将代码集成到主干**。对于这个解释我们要搞懂其中的两个概念：
- 主干：是指包含多个已上和即将上线的特性的分支。
- 集成：是指把含新特性的分支合并(merge)到主干上的行为



- **CD**

CD 则有2层含义：**持续部署（Continuous Deployment） 和 持续交付（Continuous Delivery） 。** 

持续交付 的概念是：将制品库的制品拿出后，部署在测试环境 / 交付给客户提前测试。 

持续部署 则是将制品部署在生产环境。可以进行持续部署的工具也有很多： `Ansible` 批量部署， `Kubernetes` 集群部署，`Docker` 直接推拉镜像等等。

> 采用持续交付时，系统会构建并测试每一个代码变更，然后将其推送到非生产测试环境或临时环境中。生产部署前可能存在多个并行测试阶段。持续交付与持续部署之间的区别在于，需要手动批准才能更新到生产环境。对于持续部署，生产会在没有明确批准的情况下自动发生。


从上面的解释中可知其有三个步骤：
1. 生成制品
2. 自动部署到测试环境以校验其稳定性
3. 部署到生产环境（自动的是持续部署，手动的是持续交付）


CI/CD 既可能仅指持续集成和持续交付构成的关联环节，也可以指持续集成、持续交付和持续部署这三项构成的关联环节。更为复杂的是，有时"持续交付"也包含了持续部署流程。

> 归根结底，我们没必要纠结于这些语义，您只需记得 CI/CD 其实就是一个流程（通常形象地表述为管道），用于实现应用开发中的高度持续自动化和持续监控。因案例而异，该术语的具体含义取决于 CI/CD 管道的自动化程度。许多企业最开始先添加 CI，然后逐步实现交付和部署的自动化（例如作为云原生应用的一部分）。


::: tip 写一个自己的网站放到服务器上：
编写代码 -> （单元测试/集成测试） -> 上传至代码仓库 -> 打包构建 -> 上传至服务器 -> 配置 Nginx/Apache 将 80 端口映射至网站文件夹
:::
> 有了 CI/CD 的系统之后，我们就只需要编写代码，剩下的步骤都交给 CI/CD 系统来处理，这极大地解放了我们的双手，提升了开发效率。


<img :src="$withBase('/images/more/ci-cd01.png')" width="auto"/>


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




- [持续集成是什么？](https://www.ruanyifeng.com/blog/2015/09/continuous-integration.html)



### Docker

Docker 是一个开源的应用容器引擎。开发者可以将自己的应用打包在自己的镜像里面，然后迁移到其他平台的 Docker 中。镜像中可以存放你自己自定义的运行环境，文件，代码，设置等等内容，再也不用担心环境造成的运行问题。镜像共享运行机器的系统内核。

> 同样， Docker 也支持跨平台。你的镜像也可以加载在 Windows 和 Linux，实现快速运行和部署。

Docker 的优势在于 快速，轻量，灵活。开发者可以制作一个自己自定义的镜像，也可以使用官方或者其他开发者的镜像来启动一个服务。通过将镜像创建为容器，容器之间相互隔离资源和进程不冲突。但硬件资源又是共享的。 创建的镜像也可以通过文件快速分享，也可以上传到镜像库进行存取和管理。


Q: Docker 在 CI/CD 中的作用是什么呢？
> Docker 贯穿 `CI/CD` 中整个流程。作为应用服务的载体有着非常重要的地位。我们可以使用 `Docker` 将应用打包成一个镜像，交给 `Kubernetes` 去部署在目标服务集群。并且可以将镜像上传到自己的镜像仓库，做好版本分类处理。





### Jenkins


Jenkins 是一个基于 Java 语言开发的持续构建工具平台，主要用于持续、自动的构建/测试你的软件和项目。它可以执行你预先设定好的设置和构建脚本，也可以和 Git 代码库做集成，实现自动触发和定时触发构建。


- 凭证
> 在 Jenkins 中，私钥/密码 等认证信息都是以 **凭证** 的方式管理的，所以可以做到全局都通用。




### Dockerfile

> Dockerfile  是一个 Docker 镜像的基础描述文件，里面描述了生成一个镜像所需要的执行步骤。我们也可以自定义一份 Dockerfile 来创建一个自己的镜像。

``` yml
FROM nginx:1.15-alpine
COPY html /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html

# 基于 nginx:1.15 镜像做底座。
# 拷贝本地 html 文件夹内的文件，到镜像内 /etc/nginx/html 文件夹。
# 拷贝本地 conf 文件夹内的文件，到镜像内 /etc/nginx/  文件夹。
```

### 镜像库

镜像库就是集中存放镜像的一个文件服务。镜像库在 `CI/CD` 中，又称 **制品库** 。构建后的产物称为制品，制品则要放到制品库做中转和版本管理。常用平台有Nexus，Jfrog，Harbor或其他对象存储平台。


`daemon.json`: 该文件描述了当前 docker 配置的镜像加速地址，和配置过的私服地址。

``` sh
vi /etc/docker/daemon.json

# daemon.json
{
  "insecure-registries": ["http://[私有库地址]:[私有库端口]"],
  "registry-mirrors": ["https://*****.mirror.aliyuncs.com"]
}


```


### Kubernetes

`Kubernetes` 是 Google 开源的一个容器编排引擎，它支持自动化部署、大规模可伸缩、应用容器化管理。在生产环境中部署一个应用程序时，通常要部署该应用的多个实例以便对应用请求进行负载均衡。

> 通俗些讲，可以将 Kubernetes 看作是用来是一个部署镜像的平台。可以用来操作多台机器调度部署镜像，大大地降低了运维成本。


Q: Kubernetes 和 Docker 的关系又是怎样的呢？
> 一个形象的比喻：如果你将 docker 看作是飞机，那么 kubernetes 就是飞机场。在飞机场的加持下，飞机可以根据机场调度选择在合适的时间降落或起飞。


在 Kubernetes 中，可以使用集群来组织服务器的。集群中会存在一个 Master 节点，该节点是 Kubernetes 集群的控制节点，负责调度集群中其他服务器的资源。其他节点被称为 Node ， Node 可以是物理机也可以是虚拟机。


- **Pod**

Pod 是 `K8S` 中最小的可调度单元（可操作/可部署单元），它里面可以包含1个或者多个 Docker 容器。在 Pod 内的所有 Docker 容器，都会共享同一个网络、存储卷、端口映射规则。一个 Pod 拥有一个 IP。

> 但这个 IP 会随着Pod的重启，创建，删除等跟着改变，所以不固定且不完全可靠。这也就是 Pod 的 IP 漂移问题。这个问题可以使用 Service 去自动映射~

我们经常会把 Pod 和 Docker 搞混，这两者的关系就像是豌豆和豌豆荚，Pod 是一个容器组，里面有很多容器，容器组内共享资源。



- **Service**

deployment 是停机坪，那么 Service 则是一块停机坪的统一通信入口。它负责自动调度和组织deployment中 Pod 的服务访问。由于自动映射 Pod 的IP，同时也解决了 Pod 的IP漂移问题。



- **Secret**

Secret 是 Kubernetes 内的一种资源类型，可以用它来存放一些机密信息（密码，token，密钥等）。信息被存入后，我们可以使用挂载卷的方式挂载进我们的 Pod 内。当然也可以存放docker私有镜像库的登录名和密码，用于拉取私有镜像。



- **ConfigMap**

ConfigMap 是 Kubernetes 的一种资源类型，我们可以使用它存放一些环境变量和配置文件。信息存入后，我们可以使用挂载卷的方式挂载进我们的 Pod 内，也可以通过环境变量注入。和 Secret 类型最大的不同是，存在 ConfigMap 内的内容不会加密。



### 灰度发布

灰度发布是一种发布方式，也叫 `金丝雀发布` 。**起源是矿工在下井之前会先放一只金丝雀到井里，如果金丝雀不叫了，就代表瓦斯浓度高。原因是金丝雀对瓦斯气体很敏感。**这就是金丝雀发布的又来，非常形象地描述了我们的发布行为。


灰度发布的做法是：会在现存旧应用的基础上，启动一个新版应用。但是新版应用并不会直接让用户访问。而是先让测试同学去进行测试。如果没有问题，则可以将真正的用户流量慢慢导入到新版上。在这中间，持续对新版本运行状态做观察，直到慢慢切换过去，这就是所谓的**A/B测试**。 当然，你也可以招募一些 **灰度用户**， 给他们设置独有的灰度标示（Cookie，Header），来让他们可以访问到新版应用。

> 当然，如果中间切换出现问题，也应该将流量迅速地切换到老应用上。



### 滚动发布

滚动发布，则是我们一般所说的无宕机发布。其发布方式如同名称一样，一次取出一台/多台服务器（看策略配置）进行新版本更新。当取出的服务器新版确保无问题后，接着采用同等方式更新后面的服务器。



### 健康度检查

> 当 Pod 的状态为 Running 时，该 Pod 就可以被分配流量（可以访问到）了。但是，这种检查方式对于一部分Pod来说是不靠谱的。

> 一般一个后端容器启动成功，不一定不代表服务启动成功。在后端容器启动后，部分 MySQL，消息队列，配置文件等其他服务的连接还在初始化，但是容器的外部状态却是启动成功。在这种情况下，直接去访问 Pod 必然会有问题。


在 kubernetes 中，探针用来检测 Pod 可用情况的。在 kubernetes 中，有三种探针可以使用：

::: tip 服务探针
- **存活探针 LivenessProbe**: 存活探针是对运行中的容器检测的。如果想检测你的服务在运行中有没有发生崩溃，服务有没有中途退出或无响应，可以使用这个探针。
> 如果探针探测到错误， Kubernetes 就会杀掉这个 Pod；否则就不会进行处理。如果默认没有配置这个探针， Pod 不会被杀死。

- **可用探针 ReadinessProbe**: 作用是用来检测 Pod 是否允许被访问到（是否准备好接受流量）。如果你的服务加载很多数据，或者有其他需求要求在特定情况下不被分配到流量，那么可以用这个探针。
> 如果探针检测失败，流量就不会分配给该 Pod。在没有配置该探针的情况下，会一直将流量分配给 Pod。当然，探针检测失败，Pod 不会被杀死。

- **启动探针 StartupProbe**: 作用是用来检测 Pod 是否已经启动成功。如果你的服务启动需要一些加载时长（例如初始化日志，等待其他调用的服务启动成功）才代表服务启动成功，则可以用这个探针。
> 如果探针检测失败，该 Pod 就会被杀死重启。在没有配置该探针的情况下，默认不会杀死 Pod 。在启动探针运行时，其他所有的探针检测都会失效。
:::

Kubernetes 里面内置了三种健康度探针，可以分别在启动时和运行时为我们的 Pod 做检测。




### 服务发现

> 我们在项目中经常遇到: A服务 依赖另一个 B服务 ，而我们常常不知道 B服务 的端口和IP，且端口和IP也相对不固定有可能经常更改。

**服务发现**是指使用一个注册中心来记录分布式系统中的全部服务的信息，以便其他服务能够快速的找到这些已注册的服务。

> 当我们通过域名访问一个网站时，浏览器不会直接访问域名。而是先将域名发送至 DNS 服务器，获取到域名对应的IP后，再通过IP去访问真实服务器; 其实我们日常上网，**DNS服务器将域名映射为真实IP的过程，就是一个服务发现的过程**。而我们再也不需要记住每个网站的IP，只需要记住永远不会更改的域名即可。



Q: 在 Kubernetes 中，如何做服务发现呢？
> 我们前面写到过， Pod 的 IP 常常是漂移且不固定的，所以我们要使用 Service 这个神器来将它的访问入口固定住。但是，我们在部署 Service 时，也不知道部署后的ip和端口如何。那么在 Kubernetes 中，我们可以利用 DNS 的机制给每个 Service 加一个内部的域名，指向其真实的IP。


- **Kubernetes CoreDNS**

> 在Kubernetes中，对 Service 的服务发现，是通过一种叫做 `CoreDNS` 的组件去实现的。

CoreDNS 是使用 Go 语言实现的一个DNS服务器。当然，它也不只是可以用在 Kubernetes 上。也可以用作日常 DNS 服务器使用。在 Kubernetes 1.11版本后，CoreDNS 已经被默认安装进了 Kubernetes 内。


### 污点与容忍度

> 在 Kubernetes 中， Pod 被部署到 Node 上面去的规则和逻辑是由 Kubernetes 的调度组件根据 Node 的剩余资源，地位，以及其他规则自动选择调度的。但是有时候在设计架构时，前端和后端往往服务器资源的分配都是不均衡的，甚至有的服务只能让特定的服务器来跑。

在这种情况下，我们选择自动调度是不均衡的，就需要人工去干预匹配选择规则了。这时候，就需要在给 Node 添加一个叫做**污点**的东西，以确保 Node 不被 Pod 调度到。

当你给 Node 设置一个污点后，除非给 Pod 设置一个相对应的**容忍度，**否则 Pod 才能被调度上去。这也就是污点和容忍的来源。

污点的格式是 `key=value`，可以自定义自己的内容，就像是一组 Tag 一样。




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

服务器操作系统主要分为四大流派：`Unix`、`Linux`、`Windows Server`和`Netware`。

- UNIX

> Unix是20世纪70年代出来的一个操作系统，Unix作为一种开发平台和台式操作系统获得了广泛使用，目前主要用于工程应用和科学计算等领域。

Unix系统和windows系统 一样都是有桌面，Unix是一款桌面级编程系统 咱们一般所见的程序员业务基本上都是用这种系统。

> Unix具有很高的安全性，所以一般用于银行政府等重要场合。


- Linux

> Linux是一套免费使用和自由传播的类Unix操作系统，是一个基于POSIX和UNIX的多用户、多任务、支持多线程和多CPU的操作系统。

它继承了Unix以网络为核心的设计思想，是一个性能稳定的多用户网络操作系统。Linux操作系统虽然与UNIX操作系统类似，但是它不是UNIX操作系统的变种。Torvald从开始编写内核代码时就仿效UNIX，几乎所有UNIX的工具与外壳都可以运行在LINUX上。

Linux服务器操作系统细分有很多: 

1. `Debian`：用的deb包，使用APT包管理系统。
2. `CentOS`：是一款企业级Linux发行版，用rpm包，使用yum包管理系统。
3. `Ubuntu`: 是Debian的一款衍生版，也是当今最受欢迎的免费操作系统。Ubuntu侧重于它在这个市场的应用，在服务器、云计算、甚至一些运行Ubuntu Linux的移动设备上很常见。




- Windows系统

> `MicrosoftWindows`操作系统是美国微软公司研发的一套操作系统，后续的系统版本由于微软不断更新升级，不但易用，也是当前应用最广泛的操作系统。

一般windows系统分 32位系统和 64位等；32位系统对民用化软件兼容性比较强, 64位系统可以进行更广大范围的整数运算，而且可以支持更大的内存，运行速度更快。

`Windows Server`于2003年4月24日由微软推出，其核心是WSS（Microsoft Windows Server System）



- Netware

> Netware是由NOVELL公司推出的网络操作系统。NetWare操作系统是以文件服务器为中心，主要由三个部分组成：文件服务器内核，工作站外壳，低层通信协议。




```
ECS 云服务器

实例：2核 2GB

CPU：2核，  内存：2GB

操作系统: centos lunix 

Centos 是一个基于 Linux 的开源免费操作系统
```


### DevOps

DevOps Development 和 Operations 的组合，是一种方法论，并不特指某种技术或者工具。DevOps 是一种重视 Dev 开发人员和 Ops 运维人员之间沟通、协作的流程。通过自动化的软件交付，使软件的构建，测试，发布更加的快捷、稳定、可靠。




### 前端部署


- FTP部署

- nginx + jenkins 部署


- nginx + jenkins + docker 部署







