---
title: Github Actions自动部署
date: 2023-09-17 14:58:58
permalink: false
categories:
  - CI/CD
  - 工程化
tags:
  - 工程化
---

# Github Actions自动部署

> 其实前端部署无非就是把打包之后的代码丢到 `nginx html` 目录下。

> 但如果每次上线总是手动：`修改、打包、登录服务器、上传代码、重启服务器`的话，就太低效了。这个时候，如果有个机器人能帮我们完成以上这些重复又没技术含量的活，那样部署工作就会轻松很多；而 `Github Actions` 就是我们需要的那个机器人。



## 简介

**GitHub Actions 是一种持续集成和持续交付 (CI/CD) 平台，可用于自动执行生成、测试和部署管道。** 您可以创建工作流程来构建和测试存储库的每个拉取请求，或将合并的拉取请求部署到生产环境。

[GitHub Actions 文档](https://docs.github.com/zh/actions)

> github于2019年11月后对该功能全面开放，现在所有的github用户可以直接使用该功能。GitHub 提供 Linux、Windows 和 macOS 虚拟机来运行您的工作流程，或者您可以在自己的数据中心或云基础架构中托管自己的自托管运行器。


CI（持续集成）由很多操作组成，比如拉取最新代码、运行测试、登录服务器、部署服务器等，GitHub 把这些操作统一称为 **Actions** 。

> GitHub Actions是GitHub提供的一种自动化工作流程（workflow）管理工具。它可以根据特定的事件触发，执行各种操作和任务，例如编译代码、运行测试、部署应用等。

> 使用GitHub Actions，开发者可以定义一个或多个工作流程，每个工作流程由一系列步骤（steps）组成。每个步骤可以包含命令行脚本、调用API、运行测试等任务。这些步骤可以在不同的操作系统环境下执行，如Linux、macOS和Windows。

> GitHub Actions提供了一系列预定义的事件（events），如提交代码、创建分支、打标签等，当这些事件发生时，可以触发相应的工作流程执行。同时，开发者也可以通过手动方式触发工作流程的执行。




正常需求的开发流程为：`需求 => 开发 => 构建 => 测试 => 预发 => 部署`，这些操作是可重复利用的，利用这一概念，Github 集成了 Actions 市场，允许开发者把操作写成独立的脚本，发布到 Actions 市场，允许所有开发者使用。


[Actions 市场](https://github.com/marketplace?type=actions)



> 公共仓库和自托管运行器免费使用 GitHub Actions。 对于私有仓库，每个 GitHub 帐户可获得一定数量的免费记录和存储，具体取决于帐户所使用的产品。 超出包含金额的任何使用量都由支出限制控制。







### Github Action基本概念


> 当我们想往自己的项目里接入`Github Actions`时，要在根项目目录里新建`.github/workflows`目录。然后通过编写`yml`格式文件定义`Workflow(工作流程)`去实现CI。在阅读yml文件之前，我们要先搞懂在Workflow中一些比较重要的概念：


1. **Workflows 工作流**

`Workflows`（工作流程）持续集成的运行过程称为一次工作流程，也就是我们项目开始自动化部署到部署结束的这一段过程可以称为工作流程.

> 工作流是一个可配置的自动化流程，它将运行一个或多个作业。工作流是由签入存储库的 `YAML` 文件定义的，并且在由 `repository` 中的事件触发时运行，或者可以手动触发，或者按照定义的时间表运行。

> 工作流在`.github/workflows` 目录中定义, 并且存储库可以有多个工作流，每个工作流可以执行不同的任务集。例如，您可以使用一个工作流来构建和测试拉请求，使用另一个工作流在每次创建发行版时部署您的应用程序，还可以使用另一个工作流在每次有人打开新问题时添加标签。


2. **Events 事件**

事件是存储库中触发工作流运行的特定活动。例如，活动可以来自 GitHub 创建请求(`pull request`)、打开问题(`open an issue`)或向存储库提交(`push an commit`)。您还可以通过向 REST API 发布或手动触发按计划运行的工作流。

> 工作流可以由各种GitHub事件触发，例如代码推送、`pull request` 或发布。


3. **Jobs 作业**

作业是工作流中在同一运行程序上执行的一组步骤。每个步骤要么是将要执行的 shell 脚本，要么是将要运行的操作。步骤按顺序执行，并相互依赖。由于每个步骤都在同一个运行程序上执行，因此可以将数据从一个步骤共享到另一个步骤。例如，您可以有一个生成应用程序的步骤，然后有一个测试生成的应用程序的步骤。


`job` （任务）一个工作流程中包含多个任务，简单来说就是一次自动部署的过程需要完成一个或多个任务.

`step`（步骤）部署项目需要按照一个一个的步骤来进行，每个job由多个step构成.


4. **Actions 动作**

动作是 GitHub Actions 平台的自定义应用程序，它执行复杂但经常重复的任务。使用一个操作来帮助减少在工作流文件中编写的重复代码的数量。操作可以从 GitHub 获取 git 存储库，为构建环境设置正确的工具链等。


`action`（动作）每个步骤step可以包含一个或多个动作，比如我们在一个步骤中执行打包命令这个Action.



5. **Runners 运行器**

运行器是在工作流被触发时运行它们的服务器。每个运行器可以一次运行一个作业。GitHub 提供 Ubuntu Linux、 Microsoft Windows 和 macOS 运行程序来运行您的工作流; 每个工作流运行在一个全新的、新配置的虚拟机中执行。GitHub 还提供了更大的运行器，可以进行更大的配置。




- **Docker 集成**：支持使用 Docker 容器运行工作流中的步骤。

- **共享与重用**：开发者可以在 `GitHub Marketplace` 上共享自己的 Actions，并使用其他开发者分享的 Actions。





### Yaml

编写 Github Action 的流程时，需要创建一个 workflow 工作流，workflow 必须存储在你的项目库根路径下的`.github/workflows`目录中，每一个 workflow 对应一个具体的`.yml` 文件（或者 `.yaml`）。

> yml是`YAML（YAML Ain’t Markup Language）`语言的文件，以数据为中心，比properties、xml等更适合做配置文件。

::: tip 特点
- 大小写敏感。
- 使用缩进表示层级关系。
- 缩进只能使用空格，不能用 `TAB` 字符。
- 缩进的空格数量不重要，只要层级相同的元素左对齐即可。
- `‘#’` 表示注释。
:::


[GitHub Actions 的工作流语法](https://docs.github.com/zh/actions/using-workflows/workflow-syntax-for-github-actions)


- 一个示例：`learn-github-actions.yml`：

``` yml
# 指定工作流程的名称
name: learn-github-actions
# 指定此工作流程的触发事件Event。 此示例使用 推送 事件，即执行push后，触发该流水线的执行
on: [push]
# 存放 learn-github-actions 工作流程中的所有Job
jobs:
  # 指定一个Job的名称为check-bats-version
  check-bats-version:
    # 指定该Job在最新版本的 Ubuntu Linux 的 Runner(运行器)上运行
    runs-on: ubuntu-latest
    # 存放 check-bats-version 作业中的所有Step
    steps:
      # step-no.1: 运行actions/checkout@v3操作，操作一般用uses来调用，
      # 一般用于处理一些复杂又频繁的操作例如拉取分支，安装插件
      # 此处 actions/checkout 操作是从仓库拉取代码到Runner里的操作
      - uses: actions/checkout@v3
      # step-no.2: actions/setup-node@v3 操作来安装指定版本的 Node.js，此处指定安装的版本为v14
      - uses: actions/setup-node@v3
        with:
          node-version: "14"
      # step-no.3: 运行命令行下载bats依赖到全局环境中
      - run: npm install -g bats
      # step-no.4: 运行命令行查看bats依赖的版本
      - run: bats -v

```

- 又一个示例：`hello-github-actions.yml`

``` yml
name: hello-github-actions
# 触发 workflow 的事件
on:
  push:
    # 分支随意
    branches:
      - master
# 一个workflow由执行的一项或多项job
jobs:
  # 一个job任务，任务名为build
  build:
    #运行在最新版ubuntu系统中
    runs-on: ubuntu-latest
    #步骤合集
    steps:
      #新建一个名为checkout_actions的步骤
      - name: checkout_actions
        #使用checkout@v2这个action获取源码
        uses: actions/checkout@v2 
      #使用建一个名为setup-node的步骤
      - name: setup-node
        #使用setup-node@v1这个action
        uses: actions/setup-node@v1
        #指定某个action 可能需要输入的参数
        with:
          node-version: '14'
      - name: npm install and build
        #执行执行某个shell命令或脚本
        run: |
          npm install
          npm run build
      - name: commit push
        #执行执行某个shell命令或脚本
        run: |
          git config --global user.email xxx@163.com
          git config --global user.name xxxx
          git add .
          git commit -m "update" -a
          git push
         # 环境变量
        env:
          email: xxx@163.com   

```

- `job->steps`：steps字段指定每个 Job 的运行步骤，每个job由多个step构成，它会从上至下依次执行。steps可以包含一个或多个步骤

- 环境变量可以配置在以下地方: `jobs->job->env`, `jobs->job->steps.env`

- 使用`uses`指的是这一步骤需要先调用哪个 Action。 Action 是组成工作流最核心最基础的元素。 每个 Action 可以看作封装的独立脚本，有自己的操作逻辑，我们只需要 uses 并通过 with 传入参数即可。
>  比如 `actions/checkout@v2` 就是官方社区贡献的用来拉取仓库分支的 Action， 你不需要考虑安装 git 命令工具，只需要把分支参数传入即可。


- `steps` 其实是一个步骤数组，在 `YAML` 语法中，以 `-` 开始就是一个数组项, 每一个小步骤都有几个相关的选项：

    ::: tip
    - `name`，小步骤的名称。
    - `uses`，小步骤使用的 `actions` 库名称或路径，`Github Actions` 允许你使用别人写好的 `Actions` 库。
    - `run`，小步骤要执行的 `shell` 命令。
    - `env`，设置与小步骤相关的环境变量。
    - `with`，提供参数。
    :::



**Action**

Github Actions 是GitHub的持续集成服务。持续集成由很多操作组成，比如登录远程服务器，发布内容到第三方服务等等，这些相同的操作完全可以提取出来制作成脚本供所有人使用。

GitHub允许开发者把每个操作写成独立的脚本文件，存放到代码仓库，使得其他开发者可以引用该脚本，这个脚本就是一个Action。

如果你需要某种功能的Action可以从GitHub社区共享的[action官方市场](https://github.com/marketplace?type=actions)查找，也可以自己编程Action开源出来供大家使用。既然 actions 是代码仓库，当然就有版本的概念，用户可以引用某个具体版本的 action。 




### Context 上下文


[Context 上下文](https://docs.github.com/en/actions/learn-github-actions/contexts)就是工作流各个步骤的信息。例如`env.sha`，就是自己设置的环境变量里面的sha变量。

上下文种类和工作流步骤相关, 共有十一种:`github、env、job、jobs、steps、runner、secrets、strategy、matrix、needs、inputs`


- **secrets上下文**

> 在持续集成的过程中，我们可能会使用到自己的敏感数据，这些数据不应该被开源并泄露。那么如何才能安全的使用这些敏感数据呢? 

`GithubActions`提供了`Secrets`变量来实现这一效果, 我们可以在 github repo 上依次点击 `Settings -> Secrets-> Actions->New repository secret`创建一个敏感数据例如:`OSS_KEY_ID，OSS_KEY_SECRET`， 然后我们就可以在`GithubAction`脚本中使用这一变量了:

``` yml
-  name:  setup  aliyun  oss
    uses:  manyuanrong/setup-ossutil@master
    with:
        endpoint:  oss-cn-beijing.aliyuncs.com
        access-key-id:  ${{  secrets.OSS_KEY_ID  }}
        access-key-secret:  ${{  secrets.OSS_KEY_SECRET  }}

```





## 实践



### 新增Git Page

> Git Page 可以将我们托管在 GitHub 仓库的项目部署为一个可以对外访问的网站，免去了我们自己购买与配置服务器的麻烦。

1. 首先新建一个项目，项目搭建与配置不再赘述；
> 这里我直接用 Vite 搭建了一个项目，并且推送到github上，项目地址：[githook-vite-test](https://github.com/verneyZhou/githook-vite-test)

2. 项目推送上去以后，可以先在github上看下是否推送成功；之后需要新建一个GitPage分支, 就命名为`feature/git-page`吧~

3. 在这个分支上`npm run build`打包生成 dist文件，然后执行`cp -rf dist/* ./`将 dist 里面的内容都复制到根目录下；之后就可以`git push`提交了；
> github pages 默认只能识别项目根目录的 index 文件，所以需要把打包产物放在根目录下~

4. 项目提交后，进入github上该项目的 `GitHub Pages`配置项：

<img :src="$withBase('/images/more/git01.jpeg')" width="auto"/>

> 选择`feature/git-page`分支后，保存，刷新，等一会儿上方就会出现可访问链接，点击就能访问该项目了~！！！


**注：** 上面可访问的域名理论上其实应该是`https://verneyzhou.github.io/githook-vite-test`这种形式，但因为我之前买了个的域名，已经添加过解析设置，所以这里自动解析为我自己的域名；自己如果想自定义域名也可以在【Custom domain】中添加自己的域名~



5. 之后如果我们再在`feature/git-page`分支上做修改，push提交后，github会在【Actions】自动执行`pages build and deployment`工作流，将`feature/git-page`的代码自动部署到git page~





### Git Actions自动部署

> 上面的项目每一次修改后都要重新打包，切换分支拷贝dist文件夹，比较麻烦，能不能让GitHub自动检测push动作,自动进行打包部署吗？那就是GitHub Actions的工作了.


#### 配置`.yml`
> 在main分支下，新建`.github/workflows/git-page.yml`文件，添加如下命令：

``` yml
# git-page.yml

name: CI Github Pages # workflow 名称, 若省略则为文件名

# 设置触发条件，指定触发workflow的条件，通常是某些事件,比如代码推送push,拉取pull_request,可以是事件的数组
# on: [push, pull_request]
on:
  #监听push操作
  push:
    branches:
      - main # 这里只配置了main分支，所以只有推送main分支才会触发以下任务


# 设置权限为write，这样才能推送代码到仓库，否则会报错
permissions:
  contents: write


# 任务，可以有多个
# workflow的核心就是jobs，任务job放在jobs这个集合下，每一个job都有job_id，用job_id标识一个具体任务
jobs:
  # 任务ID，可以自定义
  build-and-deploy:
    # 指定运行所需要的虚拟机环境,必填字段
    runs-on: ubuntu-latest # 构建环境使用 ubuntu
    # 任务步骤，一个job可以包含多个步骤
    steps:
      # 官方action，将代码拉取到虚拟机
      - name: Checkout   
        uses: actions/checkout@v3

      - name: Install and Build   # 安装依赖、打包，如果提前已打包好无需这一步
        run: |
          npm install
          npm run build

      - name: Deploy   # 部署， 将打包内容发布到 github page
        uses: JamesIves/github-pages-deploy-action@3.7.1 # 使用别人写好的 actions
        with:  # 自定义环境变量
          ACCESS_TOKEN: ${{ secrets.GITHOOK_VITE_TEST }}  # github token，需要在仓库的 secrets 中配置
          BRANCH: feature/git-page # 部署到哪个分支
          FOLDER: dist # 打包后的文件夹
        #   REPOSITORY_NAME: verneyzhou/verneyzhou.github.io # 这是我的 github page 仓库
        #   TARGET_FOLDER: githook-vite-test # 打包的文件将放到静态服务器 githook-vite-test 目录下

```


::: tip 流程梳理
1. 只有当 main 分支有新的 push 推送时候才会执行整个 `workflow`；
2. 整个 `workflow` 只有一个 job, job_id 是 `build-and-deploy` ,name 被省略；
3. job 有三个`step`：
    - 第一步是 `Checkout`,获取源码，使用的 `action` 是GitHub官方的 `actions/checkout`;
    - 第二步：`Install and Build,`执行了两条命令：`npm install,npm run build`,分别安装依赖与打包应用.
    - 第三步：`Deploy` 部署，使用的第三方action：`JamesIves/github-pages-deploy-action@3.7.1`,它有两个参数：分别是`ACCESS_TOKEN, BRANCH, FOLDER`，更多关于这个 action 的详情可以去查看[github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action).
:::

> 如果你需要某个action，不必自己写复杂的脚本，直接引用他人写好的 action即可，整个持续集成过程，就变成了一个actions的组合，你可以在GitHub的官方市场，可以搜索到他人提交的actions。



`runs-on`: GitHub Actions给我们提提供的运行环境主要有以下几种：

`ubuntu-latest，ubuntu-18.04或ubuntu-16.04windows-latest，windows-2019或windows-2016macOS-latest或macOS-10.14`


上面`.yml`里面的内容也可以在github里面直接进行添加：进入项目主页, `Actions -> New workflow -> set up a workflow yourself`，添加上述`.yml`模板，点击`Commit changes`即可~


#### 添加Token

> 在上面的`.yml`中需要传一个`ACCESS_TOKEN`，这个需要在github中配置~

1. 生成`Personal access tokens（个人访问令牌）`: 进入github个人主页，`Settings => Developer settings => Personal access tokens`，选择`Tokens(classic)`，再选择`Generate new token(calssic)`，生成token:


<img :src="$withBase('/images/more/git02.jpg')" width="auto"/>

> 如上图勾选之后，点击【Gernerate Token】，即可生成~


2. 个人token生成之后，赶紧复制（只会显示一次！！！）；之后进入项目主页，`settings => Secrets and varibles`，生成 secret:

<img :src="$withBase('/images/more/git03.jpg')" width="auto"/>


名称自定义，然后将刚才复制的token粘贴到这里即可，保存~


<img :src="$withBase('/images/more/git04.jpg')" width="auto"/>


> 这个创建的scret`GITHOOK_VITE_TEST`就是我们在`.yml`配置中需要用的到token了~



3. 等到token配置完毕，之后直接`git push`提交 main 分支代码，就会自动触发 Actions 就行 Git Page 的自动部署了~

<img :src="$withBase('/images/more/git05.jpg')" width="auto"/>

> 部署完成后就可以在`https://verneyzhou.github.io/githook-vite-test`中访问到最新的修改了~~~！！！





### 自动部署阿里云服务器

> 上面是通过`git-page.yml`脚本执行`Git Actions`让我们的项目自动部署到`Git Page`，那接下来实现怎么通过`Git Actions`自动部署项目到我们自己的服务器~


在配置工作流之前，我们需要先在阿里云服务器中生成SSH密钥对~ [通过密钥认证登录Linux实例](https://www.alibabacloud.com/help/zh/ecs/user-guide/connect-to-a-linux-instance-by-using-an-ssh-key-pair)
> SSH密钥对是一种安全便捷的登录认证方式。在Windows环境和支持SSH命令的环境（例如Linux环境、Windows下的MobaXterm）中，您均可以使用SSH密钥对连接Linux实例。




1.**创建密钥对**：`ECS控制台 => 网络与安全 => 密钥对`

[创建SSH密钥对](https://www.alibabacloud.com/help/zh/ecs/user-guide/create-an-ssh-key-pair)

创建密钥对流程比较简单，按上面官方文档操作即可~创建后会自动在本地下载`.pem`私钥文件



2. **绑定密钥对**：`ECS控制台 => 实例与镜像 => 实例 => 实例属性 => 绑定密钥对`


[绑定SSH密钥对](https://www.alibabacloud.com/help/zh/ecs/user-guide/bind-an-ssh-key-pair-to-an-instance)


创建秘钥对之后，接着就是绑定ECS实例；流程简单，按上面官网操作即可~
> 绑定之后需要重启服务器，重启之后服务器中的nginx,node，jenkins服务可能会关闭，也需要重启（没有就算了）~



3. **github中添加秘钥**：项目 => `Settings => Secrets and variables => New repository secret`
> 跟上面添加`ACCESS_TOKEN`流程一样，这里填入的key就是创建秘钥时下载到本地私钥~


4. **项目中添加`yml`文件**：

``` yml
# aliyun-deploy.yml

name: Build app and deploy to aliyun  # 工作流名称
on:
  #监听push操作
  push:
    branches:
      # 所监听的分支
      - feature/git-aliyun
jobs:
  build:

    runs-on: ubuntu-latest # 服务器环境，表示你这个工作流程要运行在什么操作系统上

    steps: # 步骤
    - uses: actions/checkout@v1
    - name: Install Node.js
      uses: actions/setup-node@v1  # 安装 node 环境
      with:
       node-version: '16'  # 你的node版本
    - name: Install npm dependencies
      run: npm install
    - name: Run build task
      run: OUTDIR=githook-vite npm run build  # 打包到 githook-vite 文件夹
    - name: Deploy to Server
      uses: easingthemes/ssh-deploy@main # 使用的 action, 部署到阿里云服务器
      env: # 环境变量
          SSH_PRIVATE_KEY: ${{ secrets.ALIYUN_ECS_KEY }}  # 保存在github上的私钥
          ARGS: '-rltgoDzvO --delete'
          SOURCE: githook-vite # 这是要复制到阿里云静态服务器的文件夹名称
          REMOTE_HOST: '123.57.172.182' # 你的阿里云公网地址
          REMOTE_USER: root # 阿里云登录后默认为 root 用户，并且所在文件夹为 root
          TARGET: /root/nginx/upload/dev # 打包后的文件夹将放在 /root/nginx/upload/dev 目录下
```

::: tip 流程
1. 使用 `actions/checkout@v1` 库克隆代码到 `ubuntu` 上。
2. 使用 `actions/setup-node@v1` 库安装 `nodejs`，`with` 提供了一个参数 `node-version` 表示要安装的 `nodejs` 版本。
3. 在 `ubuntu` 的 `shell` 上执行 `npm install` 下载依赖。
4. 执行 `npm run build` 打包项目。
5. 使用 `easingthemes/ssh-deploy@main` 库，这个库的作用就是用 `SSH` 的方式远程登录到阿里云服务器，将打包好的文件夹复制到阿里云指定的目录上。
:::

> 这里使用了第三方脚本来实现部署到阿里云服务器：[easingthemes/ssh-deploy@main](https://github.com/easingthemes/ssh-deploy)


5. yml文件配置完成后，之后将`feature/git-aliyun`分支`git push`提交，就会自动执行该脚本，将我们打包后的文件部署到阿里云服务器了，部署成功后，直接访问`http://123.57.172.182/dev/githook-vite`就可以看到我们的项目了~~~！！！
> 我在部署过程中报错了，下方【报错记录】有备注，应该是ssh登录权限问题，我先在服务器安全规则处配上`0.0.0.0`把权限放开，才能部署成功...暂时无其他解...




上面的`Git Page`自动部署和自动部署阿里云服务器是属于`CD`的流程；作为`CI/CD`工具，`Git Actions`肯定是还可以添加一些`CI`操作的。



### 代码规范

> 代码规范离不开各种 `Linter`, 一般前端项目都是使用 `Prettier` 解决代码格式问题，使用 `linters` 解决代码质量问题~



#### Eslint&Prettier

- **集成Prettier配置**

> [Prettier](https://prettier.io/)是一款强大的代码格式化工具，支持 `JavaScript、TypeScript、CSS、SCSS、Less、JSX、Angular、Vue、GraphQL、JSON、Markdown` 等语言，基本上前端能用到的文件格式它都可以搞定，是当下最流行的代码格式化工具。

VSCode 编辑器使用 Prettier 配置需要下载插件: `Code formatter`

1. 安装：`npm i prettier -D`
2. 在根目录下创建 `.prettierrc` 文件，配置



- **集成Eslint配置**

> ESLint 是一款用于查找并报告代码中问题的工具，并且支持部分问题自动修复。

VSCode 使用 ESLint 配置文件需要去插件市场下载插件: `ESLint` 。

1. 安装：`npm i eslint -D`
2. 执行`npx eslint --init`配置 ESlint

> 关于 Eslint 与 Prettier 的具体配置不是这篇博文的重点，这里不再赘述~



- **解决Eslint 与 Prettier 冲突问题**

1. `npm i eslint-plugin-prettier eslint-config-prettier -D`
    - `eslint-plugin-prettier`: 将 `Prettier` 的规则设置到 `ESLint` 的规则中；
    - `eslint-config-prettier`: 关闭 `ESLint` 中与 `Prettier` 中会发生冲突的规则。

2. 在 `.eslintrc.js` 添加 prettier 插件, 形成优先级：`Prettier 配置规则 > ESLint 配置规则`




- 配置完成后，还需要在`package.json`中添加命令：
``` json
"lint": "eslint --ext .js,.vue src",
"lint:fix": "eslint --ext .js,.vue src --fix"
```


- 之后在项目中添加如下代码：

``` js
const addFn = (a, b) => {
    return a + b;
};
// console.log('====addFn', addFn(3, 4));
```
然后执行`npm run lint`看下eslint配置是否生效~ 正常命令行应该会有提示; 执行`npm run lint:fix`, 一般的格式会问题应该也会修复，但像上面代码应该会报错误：

`Error:   4:7  error  'addFn' is assigned a value but never used  no-unused-vars`

不能自动修复，就需要手动修复了~



#### 配置`ci.yml`
> 代码规范配置完成，项目中试着`npm run lint`看下是否生效；没问题后，接着配置ci流程~


``` yml
name: CI

# 监听任意分支的pull或push都会触发
on:
  push:
    branches:
      - '**' # 任意分支
  pull_request:
    branches:
      - '**'

jobs:
  linter: # 任务ID，可以自定义
    runs-on: ubuntu-latest # 构建环境使用 ubuntu
    steps:
      - uses: actions/checkout@v3 # 官方action，将代码拉取到虚拟机
      - uses: actions/setup-node@v2 # 安装node环境
        with:
          node-version: 16
      
      # 检查缓存
      # 如果key命中缓存则直接将缓存的文件还原到 path 目录，从而减少流水线运行时间
      # 若 key 没命中缓存时，在当前Job成功完成时将自动创建一个新缓存
      - name: Cache
        # 缓存命中结果会存储在steps.[id].outputs.cache-hit里，该变量在继后的step中可读
        id: cache-dependencies
        uses: actions/cache@v3
        with:
          path: ./node_modules # 缓存文件目录的路径
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }} # key中定义缓存标志位的生成方式。runner.OS指当前环境的系统
          restore-keys: |
            ${{ runner.os }}-node-
      
      # 安装依赖
      - name: Install Dependencies
        # 如果缓存标志位没命中，则执行该step。否则就跳过该step
        if: steps.cache-dependencies.outputs.cache-hit != 'true'
        run: npm ci  # npm ci和npm install命令一样，是用来安装依赖的命令, npm i依赖package.json，而npm ci依赖package-lock.json

      # 代码格式检查
      - name: Running Lint
        run: npm run lint
```
> 关于上面的`Cahe`步骤中，7 天内未被访问的任何缓存条目将会被删除。 可以存储的缓存数没有限制，但存储库中所有缓存的总大小限制为 10 GB。

上面的`ci.yml`配置完成后，然后执行`git push`,会在`github`的 Actions 上发现有 workflows 在执行，如果代码中有格式问题的话，应该是会报错的~



#### Husky

> 上面添加了`npm run lint`虽然能够暴露出来不规范的语法，但不能保证每个人在提交代码之前执行一遍`lint`校验; 而且`ci.yml`运行报错也只是一个提示而已，用户还是很有可能提交不符合规范的代码的~ 所以就需要 `git hooks` 来自动化校验的过程，否则禁止提交。

[Git hooks](https://git-scm.com/docs/githooks)是可以设置在 `Git` 生命周期的在某些事件下运行的脚本。 这些事件包括提交的不同阶段，例如在提交之前（`pre-commit`,提交之后（`post-commit`）。


[Husky](https://github.com/typicode/husky)是一种工具:让我们可以轻松地接入 `Git hooks` ，并在我们需要的某些阶段运行脚本。

> 它的工作方式是在`package.json`文件中包含一个对象，该对象通过配置 `Husky` 来运行我们指定的脚本。 之后，`Husky` 负责管理我们的脚本(`hooks` 将在 `Git` 生命周期中的哪一点运行)~



- **husky初体验**

1. 安装 husky：

```
npm i husky -D
npx husky install
```

2. `package.json`脚本中添加命令：

```
"prepare": "husky install"
```
如果如果你的`npm`版本大于等于`7.1.0`, 可以执行：`npm set-script prepare "husky install"`自动添加~


3. 添加一个`lint`钩子：新建`.husky/pre-commit`，写入以下内容：

```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npm run lint
```
或者执行`npx husky add .husky/pre-commit "npm run lint"`，也会自动生成上述文件~


4. 之后项目中添加如下代码：

``` js
const addFn = (a, b) => {
    return a + b;
};
// console.log('====addFn', addFn(3, 4));
```

5. 最后`git commit`提交修改，会发现报错了：
``` sh
➜  githook-vite-test git:(feature/dev) ✗ git commit -am添加husky

> githook-vite-test@0.0.0 lint
> eslint --ext .js,.vue src


/Users/zhouyuan10/test-code/githook-vite-test/src/App.vue
  4:7  error  'addFn' is assigned a value but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)

husky - pre-commit hook exited with code 1 (error)
```
> 说明在`pre-commmit`这个`hook`里执行了`npm run lint`，存在报错信息，则`commit`提交将会失效~


运用`Husky`我们就可以在`commit, push`等这些钩子中执行一些如代码校验，代码格式化等任务，在这个项目中添加了`Husky`以后每次提交都会强制进行校验，能很大程度确保代码格式规范~


- [如何通过 Git 和 Husky 添加提交钩子并实现代码任务自动化](https://juejin.cn/post/6904150964266074119)



#### Commitlint

> 既然已经到这里了，那就顺手再把`commitlint`加了吧~

为什么需要 `Commitlint`，除了在后续的生成`changelog`文件和语义发版中需要提取`commit`中的信息，也利于其他同学分析你提交的代码，所以我们要约定`commit`的规范。


1. 安装`Commitlint`: `npm i @commitlint/config-conventional @commitlint/cli -D`



2. 将`commitlint`添加到钩子：`npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'`
> 也可以新建`.husky/commit-msg`, 手动添加内容：
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit ""
```


3. 项目根目录下创建`.commitlintrc`，并写入配置：

``` js
{
  "extends": [
    "@commitlint/config-conventional"
  ]
}
```


4. 最后随便修改一下，提交一条不符合规范的`commit`，测试下是否生效，如：`git commit -amsubmit`；正常情况应该会像下面一样报错：

``` sh
➜  githook-vite-test git:(feature/dev) ✗ git commit -amsubmit

> githook-vite-test@0.0.0 lint
> eslint --ext .js,.vue src

⧗   input: submit
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint

husky - commit-msg hook exited with code 1 (error)
```

提交一个符合规范的commit:`git commit -am"ci: 添加commitlint"`, 就提交成功了~

::: tip @commitlint/config-conventional 规范
- `feat`：新功能
- `fix`：修补 BUG
- `docs`：修改文档，比如 `README, CHANGELOG, CONTRIBUTE` 等等
- `style`：不改变代码逻辑 (仅仅修改了空格、格式缩进、逗号等等)
- `refactor`：重构（既不修复错误也不添加功能）
- `perf`：优化相关，比如提升性能、体验
- `test`：增加测试，包括单元测试、集成测试等
- `build`：构建系统或外部依赖项的更改
- `ci`：自动化流程配置或脚本修改
- `chore`：非 src 和 test 的修改，发布版本等
- `revert`：恢复先前的提交
:::


[@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)



### 代码测试

> 前端测试主要有单元测试（Unit Test）、集成测试（Integration Test）、UI 测试（UI Test）。由于项目里只有一个页面组件，且本章节的重点是实现CI而不是前端自动化测试，因此这里用单元测试来实现一下~

所谓**单元测试**，指的是对最小测试单元进行测试。比如在项目中写了一个计算文本宽度的方法，方法写好之后如果直接拿过去用，除非是经过验证的现有方法，否则是容易出现处理上的漏洞的。因此我们可以把这个方法单独提取出来，放到测试文件夹中。

在前端项目中，有很多用于单元测试的工具，如最常见的[Jest](https://jestjs.io/zh-Hans/)。但对于由`vite`构建的前端项目而言，使用`vite`配套的`vitest`会更加方便、舒适。

[vitest官方文档](https://cn.vitest.dev/guide/)


1. 安装`vitest`: `npm install vitest -D`


2. `package.json`中添加脚本命令：`"test": "vitest"`

3. 根目录下新建`test`目录，新建`sum.js`和`sum.text.js`文件：

``` js
/**
 * sum.js
 */
export function sum(a, b) {
    return a + b;
}

/**
 * sum.test.js
 */
import { expect, test } from 'vitest';
import { sum } from './sum';

// test方法是用于编写单元测试的函数。test方法接受两个参数：测试名称和测试函数
// test(name: string, testFn: Function, timeout?: number | TestOptions): Promise<void>;
test('adds 1 + 2 to equal 3', () => {
    // expect方法是用于创建断言的函数。断言是一种用于验证代码的行为和输出是否符合预期的方式。
    // expect(actual).matcher(expected)
    // actual是一个表达式或变量，表示要检查的实际值。matcher是一个函数，表示要使用的比较方法。expected是一个值或对象，表示期望的结果。
    expect(sum(1, 2)).toBe(3);
});
```

4. 然后执行`npm run test`，会发现：
``` sh
> vitest

command serve test 

 DEV  v0.34.5 /Users/zhouyuan10/test-code/githook-vite-test

 ✓ test/sum.test.js (1)
   ✓ adds 1 + 2 to equal 3

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  23:12:59
   Duration  156ms (transform 19ms, setup 0ms, collect 10ms, tests 1ms, environment 0ms, prepare 52ms)


 PASS  Waiting for file changes...
       press h to show help, press q to quit
```
> 说明添加单元测试成功了~



5. 之后在`ci.yml`后面添加测试step:

``` yml
tests: # 测试
    needs: linter # 依赖linter任务
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v2
        with:
          node-version: 16 
      # 安装依赖
      - name: Install Dependencies
        # 如果缓存标志位没命中，则执行该step。否则就跳过该step
        if: steps.cache-dependencies.outputs.cache-hit != 'true'
        run: npm ci
      - run: npm run test
```

6. 添加完成后，就可以提交，这样就每次提交会执行`npm run test`了，在github的 Actions 上就能看到`tests`任务的自动执行~




- 测试覆盖率
> 代码覆盖率是一种用于评估代码的质量和完整性的指标，它表示代码中有多少比例被测试用例所覆盖。测试覆盖率的工具可以帮助开发者生成和查看覆盖率报告，从而发现代码中的潜在问题和改进点。


关于`vitest`更多的使用这里不做阐述了，具体可参考下面链接：

- [【前端】前端单元测试、覆盖率测试工具Vitest入门指南](https://blog.csdn.net/qq_28255733/article/details/132479859)
- [年轻人的第一款单元测试框架———vitest](https://juejin.cn/post/7190159077908381756)




### 生成压缩包并发版

这里在`git-page.yml`中添加一个新的任务, 实现自动生成压缩包并发版，这里就直接上代码了~

``` yml
# git-page.yml

jobs:
    zip-and-release: # 生成压缩包并发版
        needs: build-and-deploy # 依赖前面的build-and-deploy任务
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v2
            with:
            node-version: 16

        - name: Cache
            # 缓存命中结果会存储在steps.[id].outputs.cache-hit里，该变量在继后的step中可读
            id: cache-dependencies
            uses: actions/cache@v3
            with:
            path: ./node_modules # 缓存文件目录的路径
            key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }} # key中定义缓存标志位的生成方式。runner.OS指当前环境的系统
            restore-keys: |
                ${{ runner.os }}-node-

        - name: Install npm dependencies
            # 如果缓存标志位没命中，则执行该step。否则就跳过该step
            if: steps.cache-dependencies.outputs.cache-hit != 'true'
            run: npm install

        # 从package.json里获取version属性的值
        # 在CD Workflow中会给每个生成的制品打上标签，而标签取值于version值
        - name: Read Version
            # 读取出来的值会放在steps.[id].outputs.value供其他步骤step读取
            id: version
            uses: ashley-taylor/read-json-property-action@v1.0
            with:
            path: ./package.json
            property: version

        

        # 打包, 压缩制品，压缩到bundle.zip压缩包里
        - name: Building
            run: |
            npm run build
            pwd & ls
            zip -r bundle ./dist/**

        # 基于当前commit进行版本发布(Create a release)，tag_name是v前缀加上package.json的version值
        - name: Create GitHub Release
            # 此步骤中，版本发布后会返回对应的url，以供下面上传制品的步骤中读取使用
            id: create_release
            uses: actions/create-release@v1
            env:
            GITHUB_TOKEN: ${{ secrets.GITHOOK_VITE_TEST }}
            with:
            tag_name: v${{steps.version.outputs.value}}
            release_name: v${{steps.version.outputs.value}}
            draft: false
            prerelease: false

        # 把bundle.zip上传到仓库对应的发布版本Release上
        - name: Update Release Asset
            id: upload-release-asset
            uses: actions/upload-release-asset@v1
            env:
            GITHUB_TOKEN: ${{ secrets.GITHOOK_VITE_TEST }}
            with:
            upload_url: ${{ steps.create_release.outputs.upload_url }}
            asset_path: ./bundle.zip
            asset_name: bundle.zip
            asset_content_type: application/zip # 格式
```

1. 配置完成后，在`main`分支上提交新的修改，之后github上就会自动执行`git-page.yml`里面的工作流；
2. 等到`Git Page`部署完成后，就开始获取`package.json`中的版本信息，打包压缩成`.zip`文件；
3. 压缩完成后就添加版本信息，并把压缩包上传到`Release`上；执行完毕后，就可以在github上看到信息了：

<img :src="$withBase('/images/more/git20.jpeg')" width="auto"/>

点进去就可以看到`Release`压缩包信息：

<img :src="$withBase('/images/more/git21.png')" width="auto"/>


> 在每次主干更新后进行版本发布不仅符合开源项目的更新流程，而且利于我们之后部署特定发布版本的制品~

Q: 为什么需要 `Update Release Asset` 这个流程?
> 首先，把制品放在对应的发布版本上是很常见的开源行为，读者也可以把制品下载下来放到nginx直接查看页面效果。其次也是很重要的，是为了回滚（下面深入篇会写回滚机制的实现）的实现，回滚需要快速获取前一个发布版本的制品覆盖到部署机器上。因此需要我们把每个制品都存放在对应的发布版本以实现持久化。


**注：**每次提 pr 时要确保 `package.json` 中的 `version` 值有变化，不然 `CD Workflow` 会在 `Create GitHub Release` 的步骤里报已存在 `Tag` 的错误; `version`值在`CD Workflow`主要用于版本发布，此过程需要填写指定的`tag_name`。




### 邮箱自动通知
> `github action`执行流程的时候，成功后不会发送通知，只有失败才会，需要我们手动开启一下~

进入github，点击右侧头像 => settings, 进入个人主页  => 点击左侧【Notifations】 => 往下滑，System => Actions, 【Only notify failed workflows】取消，保存~

<img :src="$withBase('/images/more/git10.jpeg')" width="auto"/>



### 添加状态徽章

我们可以在项目的`README.md`中加了`CI`和`CD`两个状态徽章来代表这个项目已成功实现了`CI`和`CD`的流程，如上图所示。这两个状态徽章是根据你指定的`Workflow`的名称和最近一次运行的结果动态变化的

- 直接在`README.md`中添加即可：

```
![CI](https://github.com/verneyZhou/githook-vite-test/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/verneyZhou/githook-vite-test/actions/workflows/git-page.yml/badge.svg)
```

- 添加完成，提交，就会有这个：

<img :src="$withBase('/images/more/git22.jpeg')" width="auto"/>



### 添加回滚机制

在项目发布后，如果发现当前项目存在重大bug时，一般操作就是手动回滚到上一个版本。因此需要新增一个用于回滚的workflow(下称`Rollback Workflow`)。

- 新增`rollback.yml`:

``` yml
name: Rollback
on:
  workflow_dispatch: # 触发条件Event: workflow_dispatch; 该事件还能支持手动输入信息，然后把这个信息当作环境变量供整个Workflow读取
    inputs:
      # 这里的version指的是我们要部署的哪个发布版本的制品
      # 这里输入的信息会作为github.event.inputs.version供此Workflow下的job读取
      version:
        description: "choose a version to deploy"
        required: true
jobs:
  Rollback:
    runs-on: ubuntu-latest
    steps:
      # 输出我们输入的version值
      - name: Echo Version
        env:
          VERSION: ${{ github.event.inputs.version }}
        run: |
          echo "Version: $VERSION"
  
      # 获取对应发布版本的制品
      - name: Download Artifact
        uses: dsaltares/fetch-gh-release-asset@master
        with:
          version: "tags/${{ github.event.inputs.version }}"
          # 指定存放制品的压缩包
          file: "bundle.zip"
          # 这里需要CD Workflow中准备工作里的Github Personal Access Token
          token: ${{ secrets.GITHOOK_VITE_TEST }}
  
      # 下载压缩包后解压
      - name: Unzip
        run: |
          unzip bundle.zip
          ls -a ./dist

      # 把部署到git page
      - name: Upload to GitPage Deploy   # 部署， 将打包内容发布到 github page
        uses: JamesIves/github-pages-deploy-action@3.7.1 # 使用别人写好的 actions
        with:  # 自定义环境变量
          ACCESS_TOKEN: ${{ secrets.GITHOOK_VITE_TEST }}  # github token，需要在仓库的 secrets 中配置
          BRANCH: feature/git-page # 部署到哪个分支
          FOLDER: dist # 打包后的文件夹
```

> `Rollback Workflow`的触发条件`Event`, 这里我们选择`workflow_dispatch`: 该事件还能支持手动输入信息，然后把这个信息当作环境变量供整个`Workflow`读取。


- 配置好`rollback.yml`之后，`main`分支提交代码，之后如果发现线上版本有问题，需要回滚时，在 github 上直接手动操作：

<img :src="$withBase('/images/more/git23.jpeg')" width="auto"/>

> 手动执行成功后，即将线上代码回滚到了指定版本~








### 搭配Docker


### Gitlab-ci


- **gitlab-ci && 自动化部署工具的运行机制**

1. 通过在项目根目录下配置`.gitlab-ci.yml`文件，可以控制ci流程的不同阶段，例如`install/检查/编译/部署服务器`；gitlab平台会扫描`.gitlab-ci.yml`文件，并据此处理ci流程；


2. ci流程在每次团队成员`push/merge`后之后触发。每当你`push/merge`一次，`gitlab-ci`都会检查项目下有没有`.gitlab-ci.yml`文件，如果有，它会执行你在里面编写的脚本，并完整地走一遍从`intall => eslint检查=>编译 =>部署服务器`的流程；

3. gitlab-ci提供了指定ci运行平台的机制，它提供了一个叫`gitlab-runner`的软件，只要在对应的平台(机器或docker)上下载并运行这个命令行软件，并输入从gitlab交互界面获取的token,就可以把当前机器和对应的gitlab-ci流程绑定，也即：每次跑ci都在这个平台上进行。


4. `.gitlab-ci`的所有流程都是可视化的，每个流程节点的状态可以在gitlab的交互界面上看到，包括执行成功或失败。因为它的执行看上去就和多节管道一样，所以我们通常用`pipeLine`来称呼它;

5. 不同`push/merge`所触发的CI流程不会互相影响，也就是说，你的一次push引发的CI流程并不会因为接下来另一位同事的push而阻断，它们是互不影响的。这一个特点方便让测试同学根据不同版本进行测试。


6. `pipeline`不仅能被动触发，也是可以手动触发的。



[Gitlab-ci:从零开始的前端自动化部署](https://zhuanlan.zhihu.com/p/184936276)








## 备注



### 与其他CI/CD工具的比较

Gitlab CI：与Gitlab高度绑定，项目放在Gitlab就谈不上开源了

Travic CI：限时免费，过后按进程收费

Drone CI：执行任务时，国内机器从Github拉取仓库代码时会偶尔超时，从而导致任务失败

Jenkins CI：除了存在与Drone CI一样的缺点外，自身比较重量，占用宿主机较多资源











## 报错记录



- `git push`后自行执行`.yml`时报错：

``` sh
remote: Permission to verneyzhou/verneyzhou.github.io.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/verneyzhou/verneyzhou.github.io.git/': The requested URL returned error: 403
Running post deployment cleanup jobs… 🗑️
/usr/bin/git worktree remove github-pages-deploy-action-temp-deployment-folder --force
fatal: 'github-pages-deploy-action-temp-deployment-folder' is not a working tree
Error: The process '/usr/bin/git' failed with exit code 128
Deployment failed! ❌
```
> 因为在我的`git-page.yml`文件是使用第三方脚本来部署git page,这里报的是用户没有权限的问题，在 `.yml`中添加如下命令即可~
``` yml
permissions:
  contents: write
```


- 自动部署到阿里云服务器时报错：

``` sh
# 报错1：
❌ [Rsync] stderr: 
ssh: connect to host 123.57.172.182 port 22: Connection timed out
rsync: connection unexpectedly closed (0 bytes received so far) [sender]
rsync error: unexplained error (code 255) at io.c(231) [sender=3.2.7]

❌️ [Rsync] stdout: 

❌ [Rsync] command: 
================================================================
================================================================
Error: R] rsync exited with code 255


# 报错2：
❌ [SSH] Adding host to `known_hosts` ERROR 123.57.172.182 Command failed: ssh-keyscan -p 22 -H 123.57.172.182  >> 
```
> ssh 22 端口访问权限问题，需要在[安全组规则](https://ecs.console.aliyun.com/server/i-2zef9ue9eyhqrvjxs3aq/group/ingress)添加~

方法1：安全组规则`22`的端口授权对象直接配置为`0.0.0.0`，但这样比较危险，意味着谁都可以访问，比较容易被攻击，慎用~

方法2：暂没找到...😌






## 参考

- [GitHub Actions 自动部署前端 Vue 项目](https://mp.weixin.qq.com/s/_MhYVCoJwgd0VsFVxPpxuw)
- [Github Actions 自动构建前端项目并部署到服务器](https://juejin.cn/post/6887751398499287054#heading-7)
- [GitHubActions详解](https://blog.csdn.net/unreliable_narrator/article/details/124468384)
- [手把手教你用 Github Actions 部署前端项目](https://juejin.cn/post/6950799922178310152)
- [作为前端，要学会用Github Action给自己的项目加上CICD](https://juejin.cn/post/7113562222852309023)
- [前端工程化配置指南](https://juejin.cn/post/6971812117993226248)
