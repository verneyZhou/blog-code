---
title: Vercel部署笔记
date: 2023-10-31 00:32:01
permalink: false
categories:
  - 部署
tags:
  - Vercel
---

# Vercel部署笔记


## Vercel简介

> [Vercel](https://vercel.com) 是由 Guillermo Rauch 创立的云服务公司，前身为 Zeit，有 [Next.js](https://nextjs.org/)、Node.js 的 websocket 框架 socket.io 和 MongoDB 客户端 [Mongoose](http://www.mongoosejs.net/) 等知名开源项目为大众所知。

Vercel 是一个**面向现代 Web 应用程序的全球托管平台**，可以帮助开发者在不需要管理服务器的情况下，轻松地将网站和应用程序部署到各种基础架构之上。它提供了一个强大的、可扩展的平台，可以让开发者在不同的平台和环境中部署和管理他们的代码。

- [https://github.com/vercel](https://github.com/vercel)

- [Vercel官方文档](https://vercel.com/docs)、[Vercel快速上手](https://vercel.com/docs/concepts/get-started)


> Vercel 是一个云服务平台，支持静态网站（纯静态页面，没有接口数据交互）和动态网站的应用部署、预览和上线。同类的平台有Netlify 和 Github Pages，相比之下，vercel 国内的访问速度更快，并且提供Production环境和development环境，对于项目开发非常的有用的，并且支持持续集成，一次push或者一次PR会自动化构建发布，发布在development环境，都会生成不一样的链接可供预览。



::: tip 特点
- 从开发到生产，Vercel 的内置 CI/CD 可以轻松自动化您的工作流程，从而简化协作。
- 专为 Web 设计的无服务器存储
- Vercel 与 Github 仓库关联，当仓库代码有变动的时候，就会自动触发 Vercel 的部署。
- 支持自定义域名
- 支持很多前端框架，例如 next.js，vitepress 等。
- 支持 Serverless Function，可以很方便的写一些后端 API 接口。
:::




<!-- ::: tip Vercel特点
- 前端代码的零配置无缝部署
> Vercel 提供前端代码的无缝部署，无需配置。这意味着开发人员可以专注于构建他们的应用程序，而不是配置服务器、Docker 容器或 Nginx。

- 实时洞察、分析和性能指标
> Vercel 提供实时洞察、分析和性能指标，帮助开发人员了解其应用程序的性能。

- “无限”可扩展性
> Vercel提供了无限的可扩展性，这意味着应用程序可以处理任何数量的流量，只要人们负担得起。

- 边缘网络（CDN、缓存、边缘功能）
> Vercel使用全球边缘网络，减少Web应用程序的加载时间，添加缓存层，甚至通过无服务器功能实现后端功能。

- 静态资产托管（图像、媒体）
> Vercel为各种图像和媒体提供静态资产托管。

- 部署预览和 A/B 测试
> Vercel允许开发人员通过部署预览和A / B测试来测试新功能。

- 99.99% uptime
> Vercel提供99.99%的正常运行时间，确保应用程序始终可用并运行良好。

- 持续集成和部署 （CI/CD）
> Vercel 提供持续集成和部署，使开发人员能够快速轻松地将更改推送到生产环境。

- 基于 Git 的工作流
> Vercel 使用基于 git 的工作流程，使协作和版本控制变得容易。

- 免费套餐
> Vercel有一个免费套餐，允许开发人员测试和部署他们的应用程序，没有任何财务障碍进入。
::: -->


- **优势**
1. 个人版永久免费，每个月 100G 带宽（别人访问你的项目所耗费的流量）），个人项目部署完全够用，需要注意的是团队模式收费;
2. 内置 `CI CD`，只需要将项目导入 vercel ，一句命令自动部署，上手成本极低; 
3. Vercel支持各种编程语言和框架，使开发人员能够使用他们喜欢的工具构建和部署应用程序: `Next.js, Nuxt.js, Svelte, ...`
4. Vercel实施了多种安全功能和实践来保护用户数据和应用程序：`自动 SSL, DDoS 保护, ...`



- **Vercel用例**
> Vercel是一个多功能平台，可用于各种用例。以下是Vercel的一些最常见的用例:

1. **Web 应用程序**: 如果您希望构建和启动快速响应的Web应用程序，Vercel是必经之路！它针对性能进行了优化，将帮助您提供一流的用户体验。
2. **静态网站**: Vercel也非常适合托管和部署静态网站。无论您的用户身在何处，它们都能快速加载并无缝工作。
3. **无服务器函数**: 想要为应用程序构建后端逻辑，而无需使用专用服务器？Vercel为您提供了对无服务器功能的支持。
4. **渐进式 Web 应用程序**: Vercel 还可以轻松构建和部署跨多个设备和平台工作的 PWA。
5. **电子商务网站**: 如果您正在构建一个可组合的商业店面，Vercel 是一个绝佳的选择。它针对这些网站进行了优化，并支持流行的电子商务框架，如 Shopify 和 Magento.
6. **开发人员作品集**: 最后，如果您是希望展示您的作品的开发人员，Vercel 是构建和部署您的作品集的绝佳选择。它们支持流行的前端框架，如 React 和 Next.js，因此您可以真正制作自己的框架。




## 例一：Vercel部署
> 这里通过手动部署一个项目来实践一下~

1. 首先是新建一个项目，这里假设你的项目已经建好，并已经`push`到github上了；这里我以[githook-vite-test](https://github.com/verneyZhou/githook-vite-test)为例进行部署；


2. 之后进入[Vercel官网](https://vercel.com)，第一次进来需要注册账号；有 github 账号的也可以直接用github登录（推荐）；
> 登录成功后需要选择`Hobby模式`还是`Pro模式`，像我们自己玩的选择`Hobby模式`就可以了~

账号创建成功后，就可以开始导入项目了~ 
> 在`Vercel`上你可以基于它提供的模板快速创建项目，如：`Next.js, Vite, Nuxt.js, Svelte, ...`，也可以拉取`github`上自己新建的项目来快速部署~ 


3. 首先进入[Github](https://github.com/)，点击右上角头像 >> 【Settings】，如图所示安装`Vercel`；之后就点击【Configure】进行配置；

<img :src="$withBase('/images/more/vercel01.jpg')" width="auto"/>

4. 之后就可以选择需要关联`Vercel`的项目，选择完后，【Save】即可~

<img :src="$withBase('/images/more/vercel02.jpg')" width="auto"/>

> 通过授权Github给Vercel后，就可以选择我们要部署的项目Github仓库~


5. 之后回到`Vercel`页面，会看到你的账号下就会看到刚添加的项目，直接【Import】即可；

<img :src="$withBase('/images/more/vercel03.jpg')" width="auto"/>


6. import之后需要简单配置下，一般就是你项目的打包命令和打包输出文件；配置完成后，直接【Deploy】，等待部署完成；

<img :src="$withBase('/images/more/vercel04.jpg')" width="auto"/>


7. 不出意外部署成功后，就可以进去到这个页面，点击[https://githook-vite-test.vercel.app](https://githook-vite-test.vercel.app)就可以访问到刚部署的项目了~~！！！

<img :src="$withBase('/images/more/vercel05.jpg')" width="auto"/>



> Vercel配置时默认关联的是`main`分支，以后只要是`main`分支的更改`push`到仓库里，`Vercel`就会自动拉取代码，自动部署了，不需要单独配置`Git Actions`，可以说是很简单好用了~~

注：Vercel 能自动部署，且已经做了提前预设：假设你的代码变动发生在 `main` 或者 `master` 分支，那么 `vercel` 就会自动构建部署生产环境，除此之外的分支，vercel 都会更新预览（测试）环境。



- Vercel操作面板：

<img :src="$withBase('/images/more/vercel06.jpeg')" width="auto"/>



## 例二：Vercel-Cli部署

> 如果你不想每次都在Vercel官网上手动点击部署，也可以通过`Vercel cli`在命令行进行部署，操作也比较简单~


1. 首先是在本地重新创建一个项目，简单修改一下，本地启动运行，打包没问题即可；之后就可以开始准备部署了；


2. 先全局安装vercel的脚手架工具：`npm i -g vercel`；安装完成后也可通过`vercel -v`查看是否安装成功；
> 用脚本部署项目可以直接用`vercel-cli`部署本地项目，无需将项目推送到github，也无需授权，按提示操作即可~


3. vercel安装完成后，输入：`vercel login` 进行登录；
> 执行该命令后会让你选择用哪个平台登陆，选择`GitHub`即可，之后会自动打开浏览器进行权限认证，认证成功后即登陆成功；


4. 然后项目里可以做一些修改，然后`npm run build`本地打包；之后执行：`vercel --prod`开始部署：

``` sh
# 如果部署的是一个本地新创建的项目：
➜  nest-test-project git:(master) ✗ vercel --prod
Vercel CLI 32.5.0
? Set up and deploy “~/test-code/nest-test-project”? [Y/n] y
? Which scope do you want to deploy to? verneyzhou
? Link to existing project? [y/N] n
? What’s your project’s name? nest-test-project
? In which directory is your code located? ./dist
❗️  The vercel.json file should be inside of the provided root directory.
❗️  The `name` property in vercel.json is deprecated (https://vercel.link/name-prop)
🔗  Linked to verneyzhou/nest-test-project (created .vercel and added it to .gitignore)
🔍  Inspect: https://vercel.com/verneyzhou/nest-test-project/219SsSAaZ5Tsr9BHLqLoGgWB7T3T [6s]
✅  Production: https://nest-test-project-pxdu9y7fv-verneyzhou.vercel.app [6s]
```

> 按提示操作后，等待部署；部署成功后访问[dashboard](https://vercel.com/dashboard)就会发现刚才本地新建的项目添加上去了；再次访问[nest-test-project-eight.vercel.app](https://nest-test-project-eight.vercel.app)就能访问到项目内容了~

<img :src="$withBase('/images/more/vercel101.jpeg')" width="auto"/>

> 上面说明没有跟Github关联：`No Git Repository connected`


同时也会发现在部署成功后在原项目中会多出来一个`.vercel`文件夹~

``` sh
.vercel/
    -- project.json # 里面会生成 projectId 和 orgId
```


- **Velcel命令**

vercel 其实也分为开发环境，预览环境（测试环境）以及生产环境三个概念，在 vercel 团队版，你甚至能在预览环境直接进行评论（而且评论也能集成到 slack，挺符合目前我们的生态），比如 UI 觉得某些页面还原度不够他就能在预览环境进行评论，所以不同环境确实有本质上的区别以及作用。

- `vercel dev`: 这个命令用于启动本地的开发环境。它会模拟 Vercel 的云环境，让你可以在本地进行开发和测试。使用这个命令，你可以实时看到你的更改效果，而不需要将它们部署到预览或生产环境;

- `vercel`: 这个命令用于将你的项目部署到 Vercel 的预览环境。预览环境是一个为了测试和分享而设立的临时环境，你可以在里面看到你的更改会在生产环境中出现的样子。这个命令非常适用于团队合作的场景，你可以用它来分享你的更改，获取反馈，然后在推向生产环境之前进行进一步的调整。


- `vercel --prod`： 这个命令会将你的应用部署到生产环境。生产环境通常代表了你的应用的正式发布版本，所部署的内容会对公众可见。这个命令就是将你的项目部署上线的最终步骤。




## 例三：Git-Actions自动部署


> 上面例一直接在`Vercel`管理面板添加`Github`项目可以实现代码推送自动部署；但例二部署本地项目时，就需要手动输入脚本执行；那有什么方法可以自动部署我们本地新创建的项目呢？除了采用例一的方法，还可以通过配置 `Git Actions` 来实现~

> 接下来我们通过配置`Github Actions`实现自动部署~


1. 这里继续以例二的项目进行实践；由于该项目还在本地，所以首先得先将该项目推送到`Github`：[nest-test-project](https://github.com/verneyZhou/nest-test-project)


2. 之后在该项目根目录下新建`.github/workflows/deploy.yml`文件：
``` yml

# 部署到 Vercel
name: deploy

on:
  push:
    branches: [ main ] # 监听main分支push操作
  pull_request:
    branches: [ main ] # 监听main分支pull_request操作

jobs:
  build-deploy:

    runs-on: ubuntu-latest # 服务器环境

    steps:
    - uses: actions/checkout@v1
    - name: Install Node.js
      uses: actions/setup-node@v1  # 安装 node 环境
      with:
        node-version: '16'  # 你的node版本
    
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

    - name: Run build
      run: npm run build # 打包

    - name: Deploy to Vercel # 部署到 Vercel
      run: npx vercel --token ${VERCEL_TOKEN} --prod
      env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
```

3. 在上面的脚本最后`Deploy to Vercel`需要用到几个变量来授权登录部署，接下来配置一下：

  - 首先创建`VERCEL_TOKEN`: 进入Vercel[设置](https://vercel.com/account)页面 ==> 【Tokens】 ==> Create Token: 

  <img :src="$withBase('/images/more/vercel102.jpg')" width="auto"/>

  > 创建成功后需要复制生成的Token~

  - 打开项目Github页面 => 点击【Settings】，点击【New repository secret】添加 `Actions Secret`；

  <img :src="$withBase('/images/more/vercel103.jpg')" width="auto"/>

  - 这里`VERCEL_TOKEN`就是刚才在Vercel中创建的Token；`VERCEL_PROJECT_ID`就是项目`.vercel/project.json`文件中生成的`projectId`；`VERCEL_ORG_ID`就是生成的`orgId`；

  <img :src="$withBase('/images/more/vercel104.jpg')" width="auto"/>


4. 至此，我们的配置工作就已经完成了，之后在`main`分支做一些修改，`git push`推上去；之后就能在`github`的`Actions`中看到`deploy.html`的脚本在自动执行；

不出意外执行结束即表示部署成功，这时在Velcel的[Deployment](https://vercel.com/verneyzhou/nest-test-project/deployments)就会看到新的部署记录，重新访问生成的url就可看到修改的内容了~~！！！




## 其他

### 配置域名

- 在Vercel如果不想用它给我们提供的域名，也可以配置第三方域名：

<img :src="$withBase('/images/more/vercel07.jpeg')" width="auto"/>

> 但个人配置的域名必须是有效域名，不然会校验不通过；可去域名管理处添加解析，解析`CNAME`到`cname.vercel-dns.com`~

- 进入[阿里云域名解析](https://dns.console.aliyun.com), 【解析设置】 > 【添加记录】；输入上面Vercel中的值，保存~

<img :src="$withBase('/images/more/vercel108.jpeg')" width="auto"/>

- 添加成功后，重新添加域名: `githook.verneyzhou-code.cn`, 就可以保存成功了；之后访问[https://githook.verneyzhou-code.cn/](https://githook.verneyzhou-code.cn/)即可访问项目了~



### 添加Serverless接口

- 什么是 Serverless？

Serverless 又叫无服务器，是一种计算模型，这种模型使开发人员能够构建和运行应用程序而无需管理底层的服务器基础设施。 在传统的服务器模型中，开发人员需要自行购买、配置和管理服务器来运行应用程序。 而在 Serverless 模型中，开发人员只需关注应用程序的代码逻辑，而不需要担心服务器的管理。

> Vercel 提供了 Serverless Function，而且支持各种前端框架的 Serverless 部署解决方案；用vercel部署Serverless Api，不购买云服务器也能拥有自己的动态网站~


这里以例一项目继续实践，添加Serverless接口：

1. 首先是安装vercel的脚手架工具：`npm i -g vercel`；安装完成后也可通过`vercel -v`查看是否安装成功；之后`vercel login`登录；


2. 创建接口：根目录新增`api/`文件夹，里面添加接口：
``` js
// api/hello.js

export default function (req, res) {
    console.log('===hello===req', req.query);
    const { name } = req.query;
    res.status(200).json({
        code: 200,
        msg: 'hello! this is a test vercel serverless api',
        data: {
            name,
        },
    });
}
```
> 这里是js写法，也可以用ts，但需要安装`@vercel/node`，这里不阐述了~


3. 根目录新增`vercel.json`，自定义配置信息：
``` json
// vercel.json

{
  // vercel 允许响应携带自定义的协议头，例如设置允许跨域的协议头。
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "content-type"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "DELETE,PUT,POST,GET,OPTIONS"
        }
      ]
    }
  ]
}
```
> `vercel.json`可覆盖默认配置信息，具体配置信息参考这里：[Configuring Projects with vercel.json](https://vercel.com/docs/projects/project-configuration)


4. 本地开发：vercel dev --listen 3037
> 可指定端口号，command参考：[vercel dev](https://vercel.com/docs/cli/dev)；


5. 本地运行起来后，可在前端代码中调用该接口：

``` js
// App.vue

const getHelloAPI = async () => {
    try {
        const res = await fetch(`/api/hello?name=${'test'}`, {
            method: 'GET',
        });
        hello.value = await res.json();
        console.log('====hello', hello);
    } catch (err) {
        console.log('===hello=err', err);
    }
};
```
> 执行该事件，如果接口请求成功，表示调用成功~


5. 本地接口开发完毕，开始部署：
  - 方法一：`npm run build`打包，`vercel prod`直接脚本部署~
  - 方法二：`git push`提交最新修改，自动触发 vercel 部署~


6. 部署成功后，直接访问[https://githook-vite-test.vercel.app/](https://githook-vite-test.vercel.app/)就可以看到最新修改了；请求[https://githook-vite-test.vercel.app/api/hello](https://githook-vite-test.vercel.app/api/hello)就访问了新增的接口~




**参考：**
  - [Vercel部署Serverless](https://juejin.cn/post/7096849494687350820)
  - [你学BFF和Serverless了吗](https://juejin.cn/post/6844904185427673095)




### 配置数据库

> 上面能通过 serverless 部署简单的接口，到这里前端其实已经可以通过 Vercel 来部署一些简单的工具了；但如果想实现一个有 CRUD 功能的项目可能还不够，因为还需要数据库支持~

这里引入[Mongodb免费云数据库](https://cloud.mongodb.com)实现数据持久化，该数据库提供`512M`免费存储额度，个人使用足够~


- [MongoDB 教程](https://www.runoob.com/mongodb/mongodb-tutorial.html)
- [MongoDB中文手册|官方文档中文版](https://docs.mongoing.com/)


1. 直接开始实践吧，首先创建数据库：[cloud.mongodb](https://cloud.mongodb.com)上注册账号，注册成功后会进入到一个操作面板页面；



2. 【Data Services】选择【Build a Data base】, 选择【FREE】版，服务商和地区随便选，我这里选择的是【Google Clound】 + 【Singapore】; `name`默认为`Cluster0`, 可自定义；选完后点击【Create】;



3. 创建成功后配置连接参数：
  - 添加`Database Users`：【SECURITY】=> 【Database Access】， 选择【Password】形式，输入`用户名+密码`，`role`选择【Atlas Amin】 => 【Add User】;
  > 这里配置的用户和密码之后在`Navicat`客户端连接数据库、项目中连接数据库都需要用到~

  - 添加允许访问改数据库的IP地址: 【SECURITY】=> 【Network Access】=> 【Add IP address】, 选择添加；
  > 这里可以点`Add current ip address` 表示添加当前电脑ip地址，点击 `Allow access from anywhere` 表示允许所有网络ip地址访问该数据库（这样可能会有风险）


至此我们已经有了一个属于我们自己的数据库的，可以在[Database Deployments](https://cloud.mongodb.com/v2/65474095c5df044009ce7a55#/clusters)页面看到刚创建好的`MongoDB`数据库: 

<img :src="$withBase('/images/more/vercel201.jpg')" width="auto"/>

> 接下来，我们要通过`Navicat`数据库可视化管理工具连接一下吧~


在连接数据库之前，先下载[Navicat](https://www.navicat.com.cn/products/navicat-for-mysql)客户端~


4. 进入[Database Deployments](https://cloud.mongodb.com/v2/65474095c5df044009ce7a55#/clusters)，选择【Connect】, 选择【Compass】采用图形界面连接；复制如下图所示代码：


<img :src="$withBase('/images/more/vercel202.jpg')" width="auto"/>


5. 打开`Navcat`客户端，左上角点击【连接】，选择新建`MongoDB`，点击【URI】,输入刚复制的代码，密码输入在添加`Database Users`时创建的密码，然后【测试连接】，显示连接成功，【保存】；


<img :src="$withBase('/images/more/vercel203.jpg')" width="auto"/>


6. 创建连接成功后，进入 Navicat 面板会显示多一条连接数据，双击选中，选择【打开连接】，然后【新建数据库】,数据库名称为`vercel`；新建成功后【打开数据库】,【新建集合】，集合名称为`user`; 集合新建成功后，【打开集合】，点击最下方【+】添加一条数据: `{name:"zhou"}...`, 之后就会显示新增的数据~


<img :src="$withBase('/images/more/vercel204.jpg')" width="auto"/>

> 这里可以继续新添加几条数据~


数据库配置连接完成后，接下来就可以在项目中使用它了~


7. 打开项目，这里继续以例一中项目[githook-vite-test](https://github.com/verneyZhou/githook-vite-test)继续实践；首先安装`mongodb`: 

``` sh
npm i mongodb

# ts需安装
npm i @types/mongodb -D
```


8. 新建`api/getUserName.js`接口：

``` js
// api/getUserName.js

import { MongoClient } from 'mongodb';

// CONNECTION_STRING变量的值，和之前用Navicat连接的代码不太一样，可以在MongoDB网站后台这里找到
// 并将<password>替换为你的密码
const CONNECTION_STRING =
    'mongodb+srv://zhou-mongodb-user01:<password>@cluster0.8sagmtl.mongodb.net/?retryWrites=true&w=majority';
const database = 'vercel'; // 数据库名称
const collection = 'userName'; // 集合名称

export default async function (req, res) {
    // 连接MongoDB
    const client = await MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        // console.log('===getUserName===client', client);
        const db = await client.db(database); // 获取数据库
        const userName = await db.collection(collection); // 获取集合
        const result = await userName.find({}).toArray(); // 获取集合中的所有数据
        console.log('===getUserName===result', result);
        res.status(200).json({
            code: 200,
            msg: 'success',
            data: [...(result || [])],
        });
    } catch (err) {
        console.log('===getUserName===err', err);
        res.status(400).json({
            code: 400,
            msg: JSON.stringify(err),
        });
    } finally {
        client.close(); // 关闭连接
    }
}

```
> 代码中`CONNECTION_STRING`可在[Database Deployments](https://cloud.mongodb.com/v2/65474095c5df044009ce7a55#/clusters) => 【Connect】 => 【Connect to your application】中查看，复制粘贴，然后将密码换成自己配置的密码~


9. 接口编写好后，前端代码中调用：

``` js
// App.vue

const getUserNameAPI = async () => {
    try {
        const res = await fetch(`/api/getUserName`, {
            method: 'GET',
        });
        const resJson = await res.json();
        console.log('====username', resJson);
        userNameList.value = resJson.data || [];
    } catch (err) {
        console.log('===username=err', err);
    }
};
```


10. 之后`vercel dev`启动项目，不出意外的话，应该是能拿到我刚在`Navicat`中添加的用户数据的；


11. 本地调试没问题的话，就可以部署到`vercel`生成环境进行使用了，操作前面已经讲过，这里不再赘述了~


以上，就算是简单的实现了一个接口对数据库的调用了；参照上述接口，我们可以实现简单的CRUD接口，从而不需要后端，前端就能写接口，连数据库，并且一键部署到Vercel上进行调用了~~！！！





**参考：**
- [vercel是什么神仙网站？](https://zhuanlan.zhihu.com/p/347990778)
- [Vercel搭建API 服务，无需服务器](https://blog.tangly1024.com/article/vercel-free-serverless-api)




## 报错记录

- `vercel dev`报错：
``` sh
➜  client git:(main) ✗ vercel dev
Vercel CLI 32.5.0
> Running Dev Command “npm install”

up to date, audited 127 packages in 1s

19 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```
> 首先看下是不是`vercel`版本问题，升级到`v33+`试下；如果不行检查下 vercel 上面`Development Command`的配置是否有问题~



## 备注


### 原理

略略略~~~




## 参考

- [什么是Vercel？](https://blog.csdn.net/jslygwx/article/details/132801799)
- [基于Vercel+Github Action 部署Nest.js项目](https://juejin.cn/post/7023690214803505166)
- [快速上手 vercel，手把手教你白嫖部署上线你的个人项目](https://zhuanlan.zhihu.com/p/641263373)
- [vercel是什么神仙网站？](https://zhuanlan.zhihu.com/p/347990778)


