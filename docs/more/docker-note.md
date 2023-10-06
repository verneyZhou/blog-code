---
title: Docker入门学习笔记
date: 2023-08-05 00:33:46
permalink: false
categories:
  - 工程化
tags:
  - docker
  - 自动化部署
---


# Docker入门学习笔记

> 从事前端开发这么几年来，过去一直专注于项目的业务开发，对于项目编译完成后的部署流程一直处于一知半解的状态，而Docker作为这几年项目自动化部署的热门技术，我一直以来都想好好花时间学习一下~ 所以最近花了一些时间整理了这篇笔记，梳理下我的Docker入门之路~


## 部署流程发展


1. 无虚拟机时代

第一步肯定是先要准备一台**物理服务器**，然后在物理服务器上安装一个**操作系统**(Operating System)，有了操作系统之后，便在操作系统上安装运行我们的**应用程序**。


::: warning 缺点
- 部署非常慢：因为我们得先准备硬件服务器，接着还要安装操作系统，然后再部署应用程序，而且应用程序还有很多的依赖软件，所以这个过程是比较慢的。
- 成本非常高：主要是物理器成本太高，即使是部署一个简单的应用，也需要一台服务器。
- 资源浪费：如果应用太简单，也容易浪费硬件资源，比如CPU和内存
:::


2. 虚拟机部署

虚拟机（VM, virtual machine）允许我们在一台物理计算机模拟出多台机器,简单地理解，虚拟化技术就是**在一台物理计算机上，通过中间虚拟软件层Hypervisor隔离CPU、内存等硬件资源，虚拟出多台虚拟服务器**。这样做的话，一台物理服务器便可以安装多个应用程序，达到资源利用的最大化，而且多个应用之间相互隔离。


::: tip 优点
- 可以把资源分配到不同的虚拟机，达到硬件资源的最大化利用
- 与直接在物理机上部署应用，虚拟机更容易扩展应用。
- 云服务:通过虚拟机虚拟出不同的物理资源，可以快速搭建云服务。
:::

- 缺点
> 虚拟机的不足之处在于对物理服务器资源的消耗，当我们在物理服务器创建一台虚拟机时，便需要虚拟出一套硬件并在上面运行完整的操作系统，每台虚拟机都占用许多的服务器资源。



3. Docker部署

> Docker 是使用时下很火的 Golang 语言进行开发的，其技术核心是 Linux 内核的 Cgroup,Namespace 和 AUFS 类的 Union FS 等技术，这些技术都是 Linux 内核中早已存在很多年的技术，所以严格来说 Docker 并不是一个完全创新的技术，Docker 通过这些底层的 Linux 技术，对 Linux 进程进行封装隔离，而被隔离的进程也被称为容器，完全独立于宿主机的进程。

Docker是**容器**技术的一种实现，也是操作系统层面的一种虚拟化，与虚拟机通过一套硬件再安装操作系统完全不同。

相对于虚拟机的笨重，Docker则更显得轻量化，因此不会占用太多的系统资源。



## 虚拟机 


虚拟机 Virtual Machine 指通过软件模拟的具有完整硬件系统功能的、运行在一个完全隔离环境中的完整计算机系统。在实体计算机中能够完成的工作在虚拟机中都能够实现。

VM允许将操作系统安装在仿真的硬件环境中。从本质上讲，它是在你的PC上运行的PC。


> 从理论上讲，可以使用你的应用程序及其所有依赖项来创建Linux（或其他）VM。VM只是数据：可以将其复制并在任何实际的Windows，macOS或Linux设备上运行。每个开发人员以及实时服务器都可以运行相同的环境。


在计算机中创建虚拟机时，需要将实体机的部分硬盘和内存容量作为虚拟机的硬盘和内存容量。每个虚拟机都有独立的 CMOS、硬盘和操作系统，可以像使用实体机一样对虚拟机进行操作。在容器技术之前，业界的网红是虚拟机。虚拟机技术的代表，是 VMWare 和 OpenStack。


::: warning 缺点
- VM磁盘映像很大，难以复制
- 单个VM可以自动更新，也可以由单个开发人员更新，因此与其他VM不同步
- 一个VM需要大量的计算资源：它是一个完整的OS，在另一个OS内的仿真硬件上运行。
:::


### Linux 容器

由于虚拟机存在这些缺点，Linux 发展出了另一种虚拟化技术：**Linux 容器（Linux Containers，缩写为 LXC）**。


**Linux 容器不是模拟一个完整的操作系统，而是对进程进行隔离。**


1. 随处运行：容器可以将代码与配置文件和相关依赖库进行打包，从而确保在任何环境下的运行都是一致的。
2. 高资源利用率：**容器提供进程级的隔离**，因此可以更加精细地设置 CPU 和内存的使用率，进而更好地利用服务器的计算资源。
3. 快速扩展：每个容器都可作为单独的进程予以运行，并且可以共享底层操作系统的系统资源，这样一来可以加快容器的启动和停止效率。

> 容器有点像轻量级的虚拟机，能够提供虚拟化的环境，但是成本开销小得多。


- 区别

1. 虚拟机虽然可以隔离出很多「子电脑」，但占用空间更大，启动更慢。虚拟机软件可能还要花钱，例如VMWare；
2. 容器技术不需要虚拟出整个操作系统，只需要虚拟一个小规模的环境，类似「沙箱」；
3. 运行空间，虚拟机一般要几 GB 到 几十 GB 的空间，而容器只需要 MB 级甚至 KB 级；



### 安装虚拟机


跨平台 VM 选项包括[VMware](https://www.vmware.com/cn.html)、[VirtualBox](https://www.virtualbox.org/)和[Parallels Desktop](https://www.parallels.cn/)。


[virtualbox官方下载](https://www.oracle.com/virtualization/technologies/vm/downloads/virtualbox-downloads.html)
> 看自己电脑配置，我选择的 `Mac OS X Apple Silicon (Beta 4 Release)`

- [Parallels Desktop还是VMware Fusion？在Mac上使用Windows](https://zhuanlan.zhihu.com/p/608044681)
- [Parallels Desktop 和 VMware Fusion 哪个更好用？ 有别的推荐吗？](https://www.zhihu.com/question/20677363)



## Docker

> Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。

Docker 相比于传统虚拟机的技术来说先进了不少，具体表现在 **Docker 不是在宿主机上虚拟出一套硬件后再虚拟出一个操作系统，而是让 Docker 容器里面的进程直接运行在宿主机上**（Docker 会做文件、网络等的隔离），这样一来 Docker 会 “体积更轻、跑的更快、同宿主机下可创建的个数更多”。

> Docker 是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的容器中，然后发布到任何流行的 Linux 机器上，也可以实现虚拟化。容器是完全使用沙箱机制，相互之间不会有任何接口。

- [Docker官网](https://www.docker.com/get-started/)



docker 的[架构图](https://docs.docker.com/get-started/overview/#docker-architecture)如下: 

<img :src="$withBase('/images/more/docker04.svg')" width="auto"/>


::: tip
- `docker client`: 即 docker 命令行工具
- `docker host`: 宿主机，`docker daemon` 的运行环境服务器
- `docker daemon`: docker 的守护进程，`docker client` 通过命令行与 `docker daemon` 交互
- `image`: 镜像，可以理解为一个容器的模板，通过一个镜像可以创建多个容器
- `container`: 最小型的一个操作系统环境，可以对各种服务以及应用容器化，是镜像的运行实例
- `registry`: 镜像仓库，存储大量镜像，可以从镜像仓库拉取和推送镜像
:::


Docker 技术的三大核心概念，分别是：**镜像 Image、容器 Container、仓库 Repository**。

Docker本质上是一个运行在Linux操作系统上的应用，而Linux操作系统分为内核和用户空间，无论是Centos还是Ubuntu，都是在启动内核之后，通过挂载`Root文件系统`来提供用户空间的,而**Docker镜像就是一个Root文件系统**。


### Image镜像

Docker 的镜像可以简单的类比为电脑装系统用的系统盘，包括操作系统，以及必要的软件。例如，一个镜像可以包含一个完整的 `centos` 操作系统环境，并安装了 `Nginx` 和 `Tomcat` 服务器。

> 注意的是，镜像是只读的。这一点也很好理解，就像我们刻录的系统盘其实也是可读的。我们可以使用 `docker images` 来查看本地镜像列表。


> 镜像是一个可执行包，其包含运行应用程序所需的代码、运行时、库、环境变量和配置文件，**容器是镜像的运行时实例**。镜像是一个静态的概念，不包含任何动态数据，其内容在构建之后也不会被改变。

开发者可以将自己的应用打包在自己的镜像里面，然后迁移到其他平台的 Docker 中。镜像中可以存放你自己自定义的运行环境，文件，代码，设置等等内容，再也不用担心环境造成的运行问题。镜像共享运行机器的系统内核。

> 同样， Docker 也支持跨平台。你的镜像也可以加载在 Windows 和 Linux，实现快速运行和部署。


### Container容器

Docker 的容器可以简单理解为提供了系统硬件环境，它是真正跑项目程序、消耗机器资源、提供服务的东西。例如，我们可以暂时把容器看作一个 Linux 的电脑，它可以直接运行。那么，容器是基于镜像启动的，并且每个容器都是相互隔离的。注意的是，容器在启动的时候基于镜像创建一层可写层作为最上层。我们可以使用 `docker ps -a` 查看本地运行过的容器。

> 容器的存在离不开镜像的支持，他是镜像运行时的一个载体（类似于实例和类的关系）。依托 Docker 的虚拟化技术，给容器创建了独立的端口、进程、文件等“空间”，Container 就是一个与宿机隔离 “容器”。容器可宿主机之间可以进行 port、volumes、network 等的通信。

Docker的镜像是用于生成容器的模板，镜像分层的，镜像与容器的关系，就是面向对象编程中类与对象的关系，我们定好每一个类，然后使用类创建对象，对应到Docker的使用上，则是构建好每一个镜像，然后使用镜像创建我们需要的容器。


> 容器就是一个不错的解决方案，容器能成为开发与运维之间沟通的语言，因为容器就像一个集装箱一样，提供了软件运行的最小化环境，将应用与其需要的环境一起打包成为镜像，便可以在开发与运维之间沟通与传输。


::: tip 注：
Docker 的镜像就是它的文件系统，一个镜像可以放在另外一个镜像的上层，那么位于下层的就是它的父镜像。所以，Docker 会存在很多镜像层，每个镜像层都是只读的，并且不会改变。当我们创建一个新的容器时，Docker 会构建出一个镜像栈，并在栈的最顶层添加一个读写层。
:::

<img :src="$withBase('/images/more/docker03.png')" width="auto"/>



### Repository仓库

> 构建镜像完成之后，可以在本地运行镜像，生成容器，但如何在更多的服务器运行镜像呢？很明显，这时候我们需要一个可以让我们集中存储和分发镜像的服务，就像Github可以让我们自己存储和分发代码一样。


**Docker 的仓库用于存放镜像**。这一点，和 Git 非常类似。我们可以从中心仓库下载镜像，也可以从自建仓库下载。同时，我们可以把制作好的镜像 `commit` 到本地，然后 `push` 到远程仓库。

Docker Hub就是Docker提供用于存储和分布镜像的官方Docker Registry，也是默认的Registry，前面我们使用`docker pull`命令便从`Docker Hub`上拉取镜像。

> 仓库分为公开仓库和私有仓库，最大的公开仓库是官方仓库[ Dock Hub](https://hub.docker.com)，国内的公开仓库也有很多选择，例如[阿里云](https://cr.console.aliyun.com/)等。





###  Docker的优点

Docker 的优势在于 快速，轻量，灵活。开发者可以制作一个自己自定义的镜像，也可以使用官方或者其他开发者的镜像来启动一个服务。通过将镜像创建为容器，容器之间相互隔离资源和进程不冲突。但硬件资源又是共享的。 创建的镜像也可以通过文件快速分享，也可以上传到镜像库进行存取和管理。同时 Docker 的镜像有 `分层策略` ，每次对镜像的更新操作，都会堆叠一个新层。当你拉取 / 推送新版本镜像时，只推送 / 拉取修改的部分。大大加快了镜像的传输效率。

> Docker 贯穿 CI/CD 中整个流程。作为应用服务的载体有着非常重要的地位。我们可以使用 Docker 将应用打包成一个镜像，交给 Kubernetes 去部署在目标服务集群。并且可以将镜像上传到自己的镜像仓库，做好版本分类处理。

Docker 技术使用 Linux 内核和内核功能（例如 Cgroups 和 namespaces）来分隔进程，以便各进程相互独立运行。


1. **多环境的部署切换**

业务开发中往往需要区分开发环境与线上环境，利用 Docker 能**原封不动的将开发环境中的代码与环境原封不动无污染的迁移到线上环境**，配合一定的自动化流程即可实现自动的发布。


2. **前端云构建**

因为 `node_modules` 的蛋疼问题，同一个仓库下不同人开发往往会遇到不同的人使用不同的 包版本 且自己根本不知道与别人不一样，最终导致发布之后产生线上问题。利用 Docker 可以在云端新建容器，远程 **无污染、低成本** 构建代码，实现 **不同人用的一定是同一个版本**。


3. **复杂环境一键配置**

某些场景下可能会配一些超级复杂的环境，这个时候可以利用 Docker 对环境配置做封装，直接生成镜像，让大家低成本使用。



### Docker vs 传统虚拟机
Docker 相比于传统虚拟机的技术来说先进了不少，具体表现在 Docker 不是在宿主机上虚拟出一套硬件后再虚拟出一个操作系统，而是让 Docker 容器里面的进程直接运行在宿主机上（Docker 会做文件、网络等的隔离），这样一来 Docker 会 “体积更轻、跑的更快、同宿主机下可创建的个数更多”。


Docker是在操作系统进程层面的隔离，而虚拟机是在物理资源层面的隔离，两者完全不同。


| 特性      | Docker | 虚拟机 |
| ----------- | ----------- | ----------- |
| 启动速度      | 秒级       | 分钟级       |
| 交付/部署   | 开发、测试、生产环境一致     | 无成熟体系       |
| 性能   | 近似物理机     | 性能损耗大       |
| 体量   | 极小（MB）     | 较大（GB）       |
| 系统支持量   | 单机支持上千个容器     | 一般为几十个       |
| 迁移/扩展   | 跨平台，可复制     | 较为复杂       |




**Q: Docker 轻量级的原因？**
> 当我们请求 Docker 运行容器时，Docker 会在计算机上设置一个资源隔离的环境。然后将打包的应用程序和关联的文件复制到 Namespace 内的文件系统中，此时环境的配置就完成了。之后 Docker 会执行我们预先指定的命令，运行应用程序。

> 注意：镜像不包含任何动态数据，其内容在构建之后也不会被改变。


**Q:  Docker 如何在 macOS 或 Windows 上运行？**
> 由于 Namespace 和 Cgroups 功能仅在 Linux 上可用，因此容器无法在其他操作系统上运行。那么 Docker 如何在 macOS 或 Windows 上运行？ Docker 实际上使用了一个技巧，并在非 Linux 操作系统上安装 Linux 虚拟机，然后在虚拟机内运行容器。


**Q: 为什么要使用Docker?**
> 例如，原来我们存在三个环境：开发（日常）环境、测试环境、生产环境。这里，我们对于每个环境都需要部署相同的软件、脚本和运行程序。事实上，对于启动脚本内容都是一致的，但是没有统一维护，经常会出问题。此外，对于运行程序而言，如果所依赖的底层运行环境不一致，也会造成困扰和异常。

> 现在，我们通过引入 Docker 之后，我们只需要维护一个 Docker 镜像。换句话说，**多套环境，一个镜像，实现系统级别的一次构建到处运行**。此时，我们把运行脚本标准化了，把底层软件镜像化了，然后对于相同的将要部署的程序实行标准化部署。因此，Docker 为我们提供了一个标准化的运维模式，并固化运维步骤和流程。

> 通过这个流程的改进，我们更容易实现 DevOps 的目标，因为我们的镜像生成后可以跑在任何系统，并快速部署。此外，使用 Docker 的很大动力是基于 Docker 实现弹性调度，以更充分地利用机器资源，节省成本。



### Docker的安装


1. 注册账号：[hub.docker.com](https://hub.docker.com/)

2. 安装：[Install Docker Desktop on Mac](https://docs.docker.com/desktop/install/mac-install/)

> 安装完后在终端输入`docker`，展示使用说明，或输入`docker -v`展示版本信息，则表示 `docker` 安装成功~



### Docker常见命令

[Use the Docker command line](https://docs.docker.com/engine/reference/commandline/cli/)

#### 基础操作

``` shell
docker login -u [username] -p [password]  # 登录 Docker Hub
docker verion # 打印docker的版本信息

docker images   # 列出所有镜像, 或：docker image ls
/**
REPOSITORY              TAG       IMAGE ID       CREATED             SIZE
verneyzhou/nginx-test   v1        110b1afbac5a   About an hour ago   414MB
nginx                   latest    2002d33a54f7   4 weeks ago         192MB
hello-world             latest    b038788ddb22   3 months ago        9.14kB
 */
# REPOSITORY：仓库名称。
# TAG： 镜像标签，其中 lastest 表示最新版本。注意的是，一个镜像可以有多个标签，那么我们就可以通过标签来管理有用的版本和功能标签。
# IMAGE ID ：镜像唯一ID。
# CREATED ：创建时间。
# SIZE ：镜像大小。


docker pull centos  # 拉取nginx镜像, 相当于 docker pull centos:latest， 或 docker pull registry.hub.docker.com/centos:latest

# docker pull命令的完整写法如下：
docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]
# 拉取一个镜像，需要指定Docker Registry的地址和端口号，默认是Docker Hub，还需要指定仓库名和标签，仓库名和标签唯一确定一个镜像，而标签是可能省略，如果省略，则默认使用latest作为标签名，另外，仓库名则由作者名和软件名组成。
docker pull mysql/mysql-server:latest  # 拉取非官方的第三方镜像，则需要指定完整仓库名


docker image rm image_name/image_id #  删除镜像，image_name表示镜像名，image_id表示镜像id
docker rmi image_name/image_id # 删除镜像快捷命令

docker inspect image_name  # 查看镜像信息

docker build -t username/image_name:tag_name  # 构建 Docker 镜像
docker push username/image_name  #  要将镜像推送到 Docker Hub



# 容器相关

# docker create [OPTIONS] IMAGE [COMMAND] [ARG...]： 通过镜像去创建一个容器，同时吐出容器 id
docker create --name containerName ubuntu:18.04
# docker run [OPTIONS] [imageName][tag] [COMMAND] [ARG...]
docker run -it --name containerName ubuntu:18.04 /bin/bash # 创建并运行一个容器，然后进入该容器
# docker run 等于  docker create + docker start

docker start container_id  # 启动一个已经停止运行的容器, container_id表示容器的id; Docker 容器重启后会沿用 docker run 命令指定的参数来运行
docker stop container_id # 停止正在运行的容器, container_id表示容器的id
docker restart container_id   # 重启一个容器

docker ps -a  # 查看本地所有容器 
docker container ls  # 查看运行中的镜像，或： docker ps

docker container rm container_id  # 删除容器（运行中的容器，应该先停止，再删除）, container_id表示容器id,通过docker ps可以看到容器id
# docker rm container_id # 同上
docker rm $(docker ps -q)  # 删除所有容器
docker container prune # 删除所有退出的容器


docker exec -it container_id command # 进入容器,container_id表示容器的id,command表示linux命令,如 /bin/bash
docker exec -it c40251c943ff sh  # 进入容器c40251c943ff，并打开一个 shell
whoami  # 进入容器后可查看当前用户，默认为root
exit # 退出关闭容器




# 其他

docker port container_id  # 查看容器端口信息
docker stats container_id  # 查看容器资源占用
docker logs container_id  # 查看正在运行的容器的日志,比如看看为什么没有运行起来、为什么报错了、谁来访问过了等等
docker container cp [containID]:[/path/to/file] .  # 从正在运行的 Docker 容器里面，将文件拷贝到本机当前目录

docker inspect [containerId]  # 查看容器信息

docker cp /tmp [containerId]:/usr/local/ # 将宿主机 tmp 文件夹复制到容器中的 /usr/local/ 路径下面
docker cp [containerId]:/usr/local/ # 将容器中的 /usr/local/ 下的文件复制到宿主机下


```


1. `docker run`流程：
  - Docker首先在本机中寻找该镜像  `=>` 如果没有安装 `=>` Docker 在 Docker Hub 上查找该镜像 `=>` 并拉取下载安装到本机 `=>` 最后 Docker 创建一个新的容器并启动该程序
  - 第二次执行  docker run 时  `=>` Docker 在本机中已经安装该镜像  `=>` Docker 会直接创建一个新的容器并启动该程序
  > 当执行`docker run`时，Docker会启动一个进程，同时给这个进程分配其独占的文件系统~


[软件测试|深入解析Docker Run命令：创建和启动容器的完全指南](https://blog.csdn.net/Tester_muller/article/details/131639725)



2. `docker stop` 和 `docker kill` 略有不同，`docker stop` 发送 `SIGTERM` 信号，然后过一段时间再发出 `SIGKILL` 信号; 而 `docker kill` 是直接发送 `SIGKILL` 信号





#### 容器内操作

``` sh
# 在容器内安装node, 跟在本地和云服务器上安装node差不多~
apt-get update
apt-get install wget
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
# 安装完之后可能当前 session 读不到 nvm 命令，可以 exit 之后再进入中终端环境
nvm install 8.0.0
node -v


cat /etc/hosts  # 查看容器ip信息


# commit 容器，创建新镜像





# push 镜像到 docker hub



```



- 来自网友整理的Docker命令图谱：

<img :src="$withBase('/images/more/docker02.png')" width="auto"/>



### Docker的使用

> [DockerHub](https://hub.docker.com/) 等网站都提供了众多镜像，一般情况下我们都会从它那找个镜像作为基础镜像，然后再进行我们的后续操作。

[Docker 新手引导](https://docs.docker.com/get-started/overview/)



- 搭建一个搭建 Web 服务器

``` sh
docker run -p 8689:80 --name web -i -t centos /bin/bash # 拉取 centos 镜像
# -i 选项告诉 Docker 容器保持标准输入流对容器开放，即使容器没有终端连接
# -t 选项告诉 Docker 为容器分配一个虚拟终端，以便于我们接下来安装 Nginx 服务器
# --rm：当停止容器时自动清除容器
# Docker 还支持输入 -d 选项告诉 Docker 在后台运行容器的守护进程
# --name web 选项告诉 Docker 创建一个名称是 web 的容器
# 通过 -p 8689:80 告诉 Docker 8689 端口是对外开放的端口，80 端口对外开放的端口映射到容器里的端口号
rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm # 安装 nginx 源
yum install -y nginx  # 安装nginx
whereis nginx # 查看安装的路径
nginx # 运行nginx
# 之后浏览器访问 http://localhost:8689/ 就可以了~

docker stop web # 关闭web服务器
docker start web # 重启web服务器
```


- 构建一个 nginx 服务器

``` sh
docker pull nginx # 拉取 nginx 镜像
docker run -p 8753:80 -d --name nginx-test01 nginx # 新建 nginx-test01 容器，并运行
# 之后浏览器访问 http://localhost:8753/ 即可
```




### Dockerfile

 Dockerfile 文件是一个文本文件，用来配置 image。Docker 根据 该文件生成二进制的 image 文件。

> Docker 构建镜像有两种方式，一种方式是使用 `docker commit` 命令，另外一种方式使用 `docker build` 命令和 `Dockerfile` 文件。其中，不推荐使用 `docker commit` 命令进行构建，因为它没有使得整个流程标准化，因此，在企业的中更加推荐使用 `docker build` 命令和 `Dockerfile` 文件来构建我们的镜像。我们使用 `Dockerfile` 文件可以让构建镜像更具备可重复性，同时保证启动脚本和运行程序的标准化。

[Dockerfile reference](https://docs.docker.com/engine/reference/builder/)


- 一个例子：构建我的镜像

1. 构建`Dockerfile`文件：
``` sh
mkdir docker-test
cd docker-test
touch Dockerfile
```

2. 编写`Dockerfile` 文件：
``` sh
FROM centos:7 #  Dockerfile 必须要的第一步，它会从一个已经存在的镜像运行一个容器，换句话说，Docker 需要依赖于一个基础镜像进行构建。这里，我们指定 centos 作为基础镜像，它的版本是 7 (CentOS 7)
MAINTAINER VerneyZhou "VerneyZhou@163.com" # 指定作者和邮箱
# 执行两个 RUN 指令进行 Nginx 的下载安装
RUN rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm # 安装 Nginx 源
RUN yum install -y nginx # 安装nginx
EXPOSE 80 # 暴露 Dokcer 容器的 80 端口
```

3. 最后，通过 `docker build` 命令进行构建: 
``` sh
docker build -t="verneyzhou/nginx-test:v1" .
# - t 告诉 Docker 镜像的名称和版本。注意的是，如果没有指定任何标签，Docker 将会自动为镜像设置一个 lastest 标签
# 最后还有一个 . 是为了让 Docker 到当前本地目录去寻找 Dockerfile 文件
```
> 注意的是，Docker 会在每一步构建都会将结果提交为镜像，然后将之前的镜像层看作缓存，因此我们重新构建类似的镜像层时会直接复用之前的镜像。如果我们需要跳过，可以使用 `--no-cache` 选项告诉 Docker 不进行缓存。

构建成功后，通过 `docker scout quickview` 可以查看：
``` sh
➜  docker-test docker scout quickview
INFO New version 0.22.3 available (installed version is 0.16.1)
    ✓ SBOM of image already cached, 188 packages indexed

  Your image  verneyzhou/nginx-test  │    1C    28H    68M    22L     2?   
  Base image  centos:7               │    1C    11H    30M    11L          

What's Next?
  Learn more about vulnerabilities → docker scout cves verneyzhou/nginx-test

➜  docker-test 
```


4. 将镜像推送到远程仓库 Docker Hub: 

``` sh
docker login # 登录docker
docker push verneyzhou/nginx-test:v1
# docker push [OPTIONS] NAME[:TAG] ，其中，NAME 是 verneyzhou/nginx-test，TAG 是 v1
```
推送成功后，就可以在[https://hub.docker.com/u/verneyzhou](https://hub.docker.com/u/verneyzhou)看到了；或者通过`docker iamges`、在`Docker Desktop`上，都能看到~
> 推送 Docker Hub 速度很慢，也可以使用国内的仓库，比如[阿里云](https://cr.console.aliyun.com/cn-hangzhou/instances)



- 网上找的别人整理的`Dockerfile`命令：

<img :src="$withBase('/images/more/docker01.png')" width="auto"/>

1. `RUN 、 CMD 、 ENTRYPOINT`  三个指令的用途非常相识，不同在于，RUN 指令是在容器被构建时运行的命令，而`CMD 、 ENTRYPOINT` 是启动容器时执行 `shell` 命令，而 RUN 会被 `docker run` 命令覆盖，但是 `ENTRYPOINT` 不会被覆盖。
> `RUN` 命令在 `image` 文件的构建阶段执行，执行结果都会打包进入 `image` 文件；`CMD` 命令则是在容器启动后执行。另外，一个 `Dockerfile` 可以包含多个 RUN 命令，但是只能有一个 CMD 命令。

2. `ADD 、 COPY` 指令用法一样，唯一不同的是 ADD  支持将归档文件（`tar, gzip, bzip2, etc`）做提取和解压操作。注意的是，COPY 指令需要复制的目录一定要放在 Dockerfile 文件的同级目录下。

3. 指定了 `CMD` 命令以后，`docker container run`命令就不能附加命令了（比如前面的`/bin/bash`），否则它会覆盖 CMD 命令。



### docker-compose

docker-compose 是用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YML 文件来配置应用程序需要的所有服务。然后，使用一个命令，就可以从 YML 文件配置中创建并启动所有服务。

> 在 `docker compose v2` 中，使用了 `docker compose` 命令去替代了 `docker-compose` 命令，可以通过 `docker compose version` 查看版本号。

``` sh
$ docker compose version
Docker Compose version v2.6.0

# 使用 docker compose ls，可列出系统全局有多少容器是根据 docker compose 启动，比 v1 版本方便很多
$ docker compose ls
NAME                STATUS              CONFIG FILES
cra-deploy          running(1)          /home/train/Documents/cra-deploy/domain.docker-compose.yaml
traefik             running(1)          /home/train/Documents/traefik/docker-compose.yml
```

- 在当前目录，新建配置文件为 `docker-compose.yaml`:

``` sh
version: "3" # 表示该 Docker-Compose 文件使用的版本为3
services:
    nginx:
        image: nginx:latest
        container_name: vue-crayon
        volumes:
            - ./dist:/usr/share/nginx/html
            - ./configs/conf.d:/etc/nginx/conf.d
        ports:
            - "80:80"
        networks:
            - crayonnet
        restart: on-failure
networks:
    crayonnet:
```
> 此时可通过 `docker compose up` 启动容器。



### .dockerignore

COPY命令将所有应用程序文件从主机目录复制到Docker镜像，通常情况下不需要复制所有文件，这个时候可以通过 `.dockerignore` 来定义不需要复制的文件或者文件夹。

``` sh
Dockerfile

.git
.gitignore
.config

.npm
.vscode
node_modules
package-lock.json
README.md
```


### 例一：使用Docker启动一个Vite项目



1. 新建vite项目

``` sh
npm create vite@latest
# 按提示操作即可，随便新建一个新的vite项目即可~

cd docker-vite-test
nvm use v16 # node使用 v16+
npm install
npm run dev
```
> 安装依赖，启动项目后，本地会正常运行~


2. 新增打包配置

- 项目打包：`npm run build`，默认打包后会生成`dist`文件；


- 在根目录下新建 `Nginx` 配置文件：`touch default.conf`，添加如下代码：

``` sh
# default.conf

server {
    listen       80;
    server_name  localhost;

    #charset koi8-r;
    access_log  /var/log/nginx/host.access.log  main;
    error_log  /var/log/nginx/error.log  error;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```


- 新建 `Dockerfile`文件：
``` sh
# 在项目根目录下执行：
touch Dockerfile

docker pull nginx # 拉取最新的nginx镜像
```

- 添加 `Dockerfile`配置：
``` sh
# Dockerfile

FROM nginx  # 指定该镜像是基于 nginx:latest 镜像而构建的

# 将项目根目录下 dist 文件夹中的所有文件复制到镜像中 /usr/share/nginx/html/ 目录下
COPY dist/ /usr/share/nginx/html/
# 将 default.conf 复制到 etc/nginx/conf.d/default.conf，用本地的 default.conf 配置来替换 Nginx 镜像里的默认配置。
COPY default.conf /etc/nginx/conf.d/default.conf  
```


3. 构建镜像：

``` sh
docker build -t="verneyzhou/docker-vite-test" .
# 基于当前目录的 Dockerfile 来构建镜像，并给镜像命名为：verneyzhou/docker-vite-test，并添加默认标签：lastest

docker image ls | grep verneyzhou/docker-vite-test # 构建成功，查看镜像：
/**
verneyzhou/docker-vite-test   latest    094000583d8c   About an hour ago   192MB
 */
```
> 可以看到我们构建了一个192MB的项目镜像；也可以在`Docker Desktop`上查看~


4. 创建容器，并运行

``` sh
docker run -d -p 8894:80 --name vite-test-container verneyzhou/docker-vite-test
# -d 设置容器在后台运行
# -p 表示端口映射，把本机的 8894 端口映射到 container 的 80 端口（这样外网就能通过本机的 8894 端口访问了）。
# --name 设置容器名 vite-test-container
# verneyzhou/docker-vite-test 是我们上面构建的镜像名字

docker ps  # 运行成功后，查看运行中的容器信息：
/**
CONTAINER ID   IMAGE                         COMMAND                   CREATED          STATUS          PORTS                  NAMES
6b5c6150db14   verneyzhou/docker-vite-test   "/docker-entrypoint.…"   57 minutes ago   Up 57 minutes   0.0.0.0:8894->80/tcp   vite-test-container
 */
```


5. 访问项目

这时浏览器打开 `http://localhost:8894/`，就可以看到对应的页面，跟我们前面创建项目的时候看到的界面是一样的；也可以通过：`curl -v -i localhost:8894` 去查看对应的静态文件；

> 这样就说明我们用把项目打包后的文件放在了 docker 创建的的容器里了，并可以通过启动的本地服务进行访问~


6. 发布镜像

``` sh
docker login # 登录镜像，已登录可忽略
docker push verneyzhou/docker-vite-test # 将该镜像推送到 hub.docker 上
```
> 推送完成后，就可以在[https://hub.docker.com/](https://hub.docker.com/)上搜到你的镜像了~




### 例二：Docker实现ECS自动部署

> 上面关于Docker的安装，生成镜像，容器，运行都是在本地操作的，那如果想把我们的项目自动部署到远程ECS服务器应该怎么办呢？

这里继续使用上面的vite项目`docker-vite-test`来实现服务器部署~

1. 流程跟在本地的操作差不多，首先是在服务器上安装`docker`:

> 本地直接安装客户端即可，服务器上需要通过`yum`安装`docker`安装包; 我的服务器安装环境为`centos7`~

``` sh
# 首先需要 ssh 登录服务器，然后安装docker
yum install docker -y

docker -v # 查看是否安装成功

service docker start # 启动
service docker restart  # 重启docker服务
service docker stop     # 停止docker服务
```


2. docker安装完成后，因为在例一中已经将镜像`verneyzhou/docker-vite-test`push到dockerhub了，之后直接拉下来使用即可~

``` sh
docker login -u [docker-username] -p [docker-password] # 登录docker

docker pull verneyzhou/docker-vite-test # 拉取镜像

docker run -d -p 8894:80 --name vite-test-container verneyzhou/docker-vite-test # 运行容器
```


之后如果运行成功的话，访问`http://[服务器ip]:8894`应该就能访问到该项目了~（待验证...）


3. 自动化部署
> 上面的整个流程中，不管是镜像构建还是容器运行，都是手动去敲命令的，然而，重复的工作都可以被优化。现在使用 `sh` 脚本来自动化执行整个部署流程。

- sh 脚本文件一般放在服务器的 `root` 目录下: 登录服务器，在 `root` 目录下新建文件 `setup_host.sh` 文件：

``` sh
# setup_host.sh

# 构建镜像
image_name=verneyzhou/docker-vite-test # 表示镜像名称
# version=$(date +'%Y%m%d-%H%M%S') # 表示镜像版本（用时间表示）
version=latest
contianer_name=vite-test-container # 运行的容器名称
host_port=8894 # 本机端口
container_port=80 # 运行的容器端口

echo 'docker build...' # 构建镜像
docker build -t $image_name:$version .
echo 'docker rm...' # 清理同名容器
# 如果已经有同名的容器，删除掉
if [ "$(docker ps -aq -f name=$contianer_name)" ]; then
  echo 'docker rm ...'
  docker rm -f $contianer_name
fi
echo 'docker run...' # 启动容器
docker run -d --name $contianer_name -p $host_port:$container_port $image_name:$version
echo 'Done!'

```
> 如果有其他容器占用了`8894`端口，则需要先删除该容器：`docker rm container_id`

- 登录服务器，根目录下执行脚本：

``` sh
chmod +x ./setup_host.sh # 添加可执行权限
./setup_host.sh # 执行自动化部署
```


- 其他命令
``` sh
docker exec -it 6b5c6150db14 sh # 进入容器, 或 docker exec -it vite-test-container sh
exit # 退出容器
docker stop vite-test-container # 退出容器
docker start vite-test-container # 重启容器
```




- 查看docker安装目录：

``` sh
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# whereis docker
docker: /usr/bin/docker /etc/docker /usr/libexec/docker /usr/share/man/man1/docker.1.gz
[root@iz2zef9ue9eyhqrvjxs3aqz ~]#
```




### 例三：部署Node服务应用


1. 新建一个node项目：

``` sh
mkdir docker-node-test
cd docker-node-test
npm init -y # npm初始化
npm i express # 安装express
touch server.js # 新建server.js文件
```

- `server.js`添加内容：

``` js
'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
```

- `package.json`中添加命令：
``` json
"scripts": {
  "start": "node server.js"
},
```
> `npm run start` 执行看下是否运行正常~

或者`curl -i localhost:8080`，查看响应是否正常：

``` sh
curl -i localhost:8080

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 11
ETag: W/"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"
Date: Sun, 06 Aug 2023 17:25:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Hello World% 
```


2. 添加 `.dockerignore` 和 `Docerkfile`

- `.dockerignore`:

``` sh
node_modules
npm-debug.log
```

- `Docerkfile`:

``` sh
# 使用更轻量的 node18
FROM node:18-alpine
# 创建工作目录 /app
WORKDIR /app

# 把安装依赖所需的 package.json AND package-lock.json 复制到 /app
COPY package*.json ./
# 安装依赖
RUN npm install
# 如果是生产环境使用 ci
# RUN npm ci --omit=dev

# 打包源码到 /app
COPY . .

# 暴露端口 8989
EXPOSE 8989
# 启动容器后，执行 node server.js
CMD ["node", "server.js"]
```


3. 构建镜像 + 启动容器
> 这一步跟上一个例子部署 Vite 项目一样~

``` sh
docker build -t my-node-test .  # 构建镜像
docker run -d --name my-node-container -p 8995:8989 my-node-test  # 启动容器
```


4. 访问

之后浏览器通过 `http://localhost:8995/`就可以进行访问；也可通过`curl -i localhost:8995`查看网页连接情况：

``` sh
curl -i localhost:8995

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 11
ETag: W/"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"
Date: Sun, 06 Aug 2023 17:33:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Hello World%  



### 其他命令
docker stop my-node-container # 停止容器
docker start my-node-container # 启动容器
docker exec -it my-node-container ash # 进入容器；因为使用 apline 版本的镜像，所以不能用 bash，这里用 sh 或者 ash 代替
```

> 后续也可以添加自动化部署~






## 备注



### 报错记录


- 在执行`docker build -t="verneyzhou/githook-vite-test" .`，想通过`Dockerfile`编译镜像时报错：

``` sh
Dockerfile:39
--------------------
  37 |     RUN pwd & ls
  38 |     # 把上一步编译出来dist文件夹拷贝到刚才新建的/app/www文件夹中
  39 | >>> COPY --from=builder /data/web/dist /app/www
  40 |     
  41 |     
--------------------
ERROR: failed to solve: builder: pull access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed
```
> 上面`COPY`命令后面加了参数`--from=builder`, 意思是引用前一步骤的`builder`的构建产物，需要前面有声明,如：`FROM node:16-alpine as builder`, 才能调用~



- 报错：`bash: ./docker-githook-deploy.sh: Permission denied`
> 权限受限，添加命令：`chmod +x ./docker-githook-deploy.sh`再执行 `./docker-githook-deploy.sh`~




- 服务器使用`docker run`后状态为容器状态为`Exited (1)`，未运行~
> 暂时无解...




### 其他

``` sh
# 查看服务器linux版本
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# uname -sr
Linux 3.10.0-1160.95.1.el7.x86_64

# 查看centos的版本信息
[root@iz2zef9ue9eyhqrvjxs3aqz ~]# cat /etc/redhat-release
CentOS Linux release 7.9.2009 (Core)
```



## 收藏

- [Docker技术入门与实战](https://yeasy.gitbook.io/docker_practice/)
- [面向WEB开发人员的Docker](https://juejin.cn/column/6965049243660714021)

- docker-compose版本信息：[https://github.com/docker/compose/releases](https://github.com/docker/compose/releases)


## 参考

- [10分钟快速掌握Docker必备基础知识](https://juejin.cn/post/6844903918372143112)
- [从 0 开始了解 Docker](https://juejin.cn/post/6844903591375814669)
- [30 分钟快速入门 Docker 教程](https://juejin.cn/post/6844903815729119245)
- [写给前端的 docker 使用指南](https://juejin.cn/post/7139724794672447518)
- [前端工程师也应该了解的docker](https://juejin.cn/post/7250029395023544376)