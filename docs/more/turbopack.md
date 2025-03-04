---
title: Turbopack初印象
date: 2023-06-02 19:14:00
permalink: false # 8e5791/
categories:
  - 工程化
  - Turbopack
tags:
  - Turbopack
---


# Turbopack初印象


## 简介




> 22 年 10 月 25 日，Next.js 13 正式发布。同时，Vercel 还推出并开源了下一代打包工具：Turbopack。Turbopack 是针对 JavaScript 和 TypeScript 优化的增量打包工具，由 Webpack 的创建者 Tobias Koppers 和 Next.js 团队使用 Rust 编写。

Turbopack 是由 Vercel 公司（也就是维护 next.js 项目背后的公司）出品的打包工具，适用于 JavaScript 和 TypeScript 项目，底层使用 Rust 语言编写。 Turbopack 被 vercel 公司定义为 webpack 的后继，而不是替代品。


Turbopack 性能的秘诀有两个：**高度优化的机器代码和低层级增量计算引擎**，可以缓存到单个函数的级别。它的架构吸取了 Turborepo 和 Google 的 Bazel 等工具的经验教训，它们都专注于使用缓存来避免重复执行相同的工作。

> Turbopack 之所以如此之快，是因为它建立在一个可重用的 Rust 库之上，该库支持增量计算，称为 **Turbo 引擎**。其工作原理是：在 Turbopack 驱动的程序中，可以将某些函数标记为“to be remembered”。当这些函数被调用时，Turbo 引擎会记住它们被调用的内容，以及它们返回的内容，然后将其保存在内存缓存中。

而这种速度的实现机制是由 Rust 的高效率和 Turbopack 主打的**增量打包引擎**共同实现的。 Rust 是系统级的编程语言，以高效著称，对标 c/c++，但是更安全，不容易发生内存泄露。 Turbopack 主打的增量打包引擎，可以把已经打包好的代码进行缓存，后面只打包新加入的代码，这个缓存级别可以达到单个函数级。



### Turbo

Turbopack 是建立在 Turbo 之上的，Turbo 是基于 Rust 的开源、增量记忆化框架。Turbo 可以缓存程序中任何函数的结果。当程序再次运行时，函数将不会重新运行，除非它的参数改变了。这种粒度的架构使您的程序能够在函数级别跳过大量工作。

> 目前，Turbo引擎将缓存存储在内存中，这意味着缓存的时间与运行它的进程一样长，这对开发服务器来说是很好的，不必每次运行都由服务器进行处理。默认情况下，Next v13 会启动 Turbo引擎的缓存，如果手动取消开发服务器缓存，那么Turbo缓存也会被清空。

> 在未来，官方还计划将这个缓存持久化到文件系统或者像 Turborepo 那样的远程缓存中，这将意味着 Turbopack 可以在不同的运行和机器上记住所做的工作。这种方法使得 Turbopack 在处理应用程序的增量更新时非常快，开发服务器进而将对变化作出迅速的反应。


**请求级编译**：Turbopack 足够智能，可以只编译请求的代码。这意味着如果浏览器请求 HTML，就只会编译 HTML，而不会编译 HTML 引用的任何内容。如果浏览器需要 CSS，将只编译 CSS，而不编译其引用的图片，Turbopack 甚至知道不编译 source map，除非 Chrome DevTools 是打开的。通过请求级编译，减少了请求的数量，性能方面改进显着。



### Why Turbopack?

[why-turbopack](https://turbo.build/pack/docs/why-turbopack)

> 当我们开始创建Turbopack时，我们想要解决一个问题。我们一直在为Next.js进行速度改进。我们迁移了几个基于JS的工具。Babel，不再需要。Terser，不再需要。我们的下一个目标是另一个基于JS的工具，webpack。

用什么替换它成为我们的目标。但是用什么呢？

新一代本地速度打包程序正在出现，例如esbuild和swc。但是经过对市场上打包程序的评估，我们决定建立自己的打包程序。为什么？

- **打包(Turbopack) VS 原生ESM(Vite)**

在开发模式 (development mode) 下，Vite 不会打包应用源代码，而是利用浏览器原生的 ES Module 系统。由于只需要转换一个单文件，启动速度非常快。但是，一旦项目庞大，模块间的依赖关系变得非常复杂，浏览器中大量的请求可能导致启动时间变慢。因此，如果浏览器能够在尽可能少的网络请求中获取所需的代码，就会更快。

Turbopack 使用 Rust 编写，打包性能非常好。在生产环境 (production mode) 下，它跳过了打包过程，只打包开发环境下的代码。


- **Increment Computation (增量计算)**

有两种方法可以使进程更快：**做更少的工作或并行工作**。我们知道，如果我们想要创建最快的打包程序，我们需要在这两个杠杆上下功夫。
我们决定创建一个可重用的 **Turbo 构建引擎**，用于分布式和增量行为。Turbo 引擎的工作方式类似于函数调用的调度器，允许函数调用在所有可用的核心上并行执行。

Turbo 引擎还缓存它调度的所有函数的结果，这意味着它永远不需要重复执行相同的工作。简而言之，它以最大速度完成最少的工作。



- **Vite and esbuild**

其他工具对“做更少的工作”采取了不同的态度。Vite 在开发模式下使用原生 ESM 来最小化工作量。我们决定不采取这种方法，原因如上所述。
在幕后，Vite 在许多任务中使用 esbuild。esbuild 是一个打包工具 - 一个非常快的打包工具。它不强制您使用原生 ESM。但是，出于以下几个原因，我们决定不采用 esbuild。
1. esbuild 的代码是针对一个任务进行超级优化 - 快速打包。它**没有 HMR**，而我们不想从我们的开发服务器中失去它。
2. esbuild 是一个极快的打包工具，但它**没有太多的缓存**。这意味着即使这项工作的速度是原生的，您仍将一遍又一遍地做同样的工作。

> Evan Wallace 将 esbuild 称为下一代打包工具的概念验证。我们认为他是对的。我们认为，一个**由 Rust 驱动的具有增量计算功能的打包工具**可以在更大规模上表现得比 esbuild 更好。



- **惰性打包**


早期版本的Next.js尝试在开发模式下捆绑整个Web应用程序。我们很快意识到这种“急切”的方法不太理想。现代版本的Next.js仅捆绑开发服务器请求的页面。例如，如果您转到`localhost：3000`，它将仅捆绑`pages/index.jsx`以及它导入的模块。

这种更“懒惰”的方法（仅在绝对必要时捆绑资产）对于快速开发服务器至关重要。原生ESM处理此过程而无需太多魔法-您请求一个模块，该模块请求其他模块。但是，出于上述原因，我们想构建一个打包器。

> esbuild没有“懒惰”打包的概念-除非您专门针对某些入口点，否则它是全包或无包。

Turbopack的开发模式**根据收到的请求构建应用程序的导入和导出的最小图形，并仅捆绑必要的最小代码**。在[核心概念文档](https://turbo.build/pack/docs/core-concepts)中了解更多信息。

这种策略使Turbopack在首次启动开发服务器时非常快速。我们仅计算呈现页面所需的代码，然后将其一次性发送到浏览器中。在大规模情况下，这最终比原生ESM快得多。



我们的目标是：
1. **构建一个打包工具**。在处理大型应用程序时，打包工具的性能优于原生ESM。
2. **使用增量计算**。Turbo 引擎将其纳入 Turbopack 架构的核心，最大化速度并最小化工作量。
3. **优化我们的开发服务器的启动时间**。为此，我们构建了一个惰性资产图，仅计算所请求的资产。

这就是为什么我们选择构建 Turbopack 的原因。




### 核心概念

[core-concepts](https://turbo.build/pack/docs/core-concepts)



#### Turbo 引擎

Turbopack 之所以如此快速，是因为它建立在 Rust 的可重用库之上，该库使用增量计算技术称为 Turbo 引擎。以下是其工作原理：


- **Function-level caching（函数级缓存）**

在 Turbo 引擎驱动的程序中，您可以将某些函数标记为“需要记住”。当调用这些函数时，Turbo 引擎将记住它们的**调用方式和返回值**。然后将其保存在内存缓存中。

以下是在打包程序中可能看起来像的简化示例：

<img class="zoom-custom-imgs" :src="$withBase('/images/more/turbo-engine-first-run01.webp')" width="auto"/>


我们首先调用`readFile`来读取两个文件，`api.ts`和`sdk.ts`。然后将这些文件捆绑在一起，拼接在一起，最终得到`fullBundle`。所有这些函数调用的结果都会保存在缓存中以供以后使用。

假设我们正在运行开发服务器。您在计算机上保存了`sdk.ts`文件。Turbopack接收到文件系统事件，并知道它需要重新计算`readFile("sdk.ts")`:

<img class="zoom-custom-imgs" :src="$withBase('/images/more/turbo-engine-second-run02.webp')" width="auto"/>

由于 `sdk.ts` 的结果已经改变，我们需要再次打包它，然后再次连接它。

关键是，`api.ts` 没有改变。由于之前的缓存仍然存在，我们的 `readFile('api.ts')` 就不需要重新打包计算了，直接调用缓存结果。

现在想象一下在一个真正的打包程序中，有成千上万的文件需要读取和执行转换。思维模式是相同的。通过记住函数调用的结果，不重新执行已经完成的工作，可以节省大量的工作量。



- **The cache**

Turbo 引擎目前将其缓存存储在内存中。这意味着缓存将持续与运行它的进程一样长 - 这对于开发服务器非常有效。在 Next v13 中运行 `next dev --turbo` 时，您将启动 Turbo 引擎的缓存。当您取消开发服务器时，缓存将被清除。

在未来，我们计划将此缓存持久化 - 要么到文件系统，要么到像 Turborepo 这样的远程缓存。这将意味着 Turbopack 可以记住跨运行和机器完成的工作。

- 本地持久化
> 根据作者的想法，未来编译结果不仅仅缓存在内存当中，还会本地持久化。本地持久化的意义是什么？在实际的生产环境中， 中大型的项目往往都需要打包 15 分钟甚至更久，编译结果持久化可以节省大量的打包时间。假设项目里有 50 个页面，本次迭代只修改了其中 10 个页面，Webpack 打包会全量重新打包 50 个页面，而 Turbopack 只需重新打包 10 个被修改的页面，未修改的 40 个页面直接从硬盘读取上一次打包结果，打包效率则得到非常大的提升。



#### Compiling by Request（按请求编译）

> 本地开发时，Webpack 启动时要全量编译所有文件，这使得启动项目或者切换分支后需要花费大量的时间重新打包编译。而 Turbopack 则采用按需编译的方式。

Turbo引擎有助于在开发服务器上提供极快的更新，但还有另一个重要的指标需要考虑 - 启动时间。您的开发服务器启动得越快，您就能越快地开始工作。

让一个过程变快有两种方法 - **更快地工作，或者做更少的工作**。对于启动开发服务器，减少工作量的方法是只编译启动所需的代码。



- **page-level compilation （页面级编译）**

2-3年前的 Next.js 版本在显示开发服务器之前会编译整个应用程序。在 Next.js 13 中，我们开始仅编译您请求的页面上的代码。

这是更好的，但并不完美。当您导航到`/users`时，我们将捆绑所有客户端和服务器模块、动态导入的模块以及引用的CSS和图像。这意味着如果您页面的大部分被隐藏或隐藏在选项卡后面，我们仍然会编译它。



- **Request-level compilation （请求级编译）**


Turbopack 足够智能，只编译你请求的代码。这意味着如果浏览器请求 HTML，我们只编译 HTML - 而不是 HTML 引用的任何内容。

如果浏览器需要一些 CSS，我们将只编译 CSS - 而不编译引用的图像。Turbopack 甚至知道除非你的 Chrome DevTools 打开，否则不编译 source maps。

通过请求级编译，减少了请求的数量，性能方面改进显着。



### Turbopack vs Vite

> Vite是一个非常快速的（非）打包工具，Web开发社区对它非常兴奋，我们也是。Vite提高了Web开发的标准，展示了Web未来的可能性。如果我们要构建一个打包工具，它必须至少与（已经令人印象深刻的）Vite表现一样出色，以验证我们的努力。我们很自豪地说，我们做到了。

[comparisons-vite](https://turbo.build/pack/docs/comparisons/vite)


#### Dev server startup time

Vite 是一个非打包工具，这意味着它不会对你的代码进行打包处理，而是直接将每个模块发送到浏览器。这意味着浏览器会处理模块之间的依赖关系。

表面上看，这似乎是一场不公平的战斗。Turbopack 对你的应用程序进行打包处理，这意味着在将代码发送到浏览器之前需要进行更多的工作。

但事实证明，Turbopack 可以比浏览器更快地处理这些工作。通过预打包，我们可以比 Vite 的原生 ESM 系统节省大量时间。

这意味着 Turbopack 的开发服务器启动比 Vite 更快。在一个包含 1,000 个模块的应用程序中，Vite 需要1.8秒才能启动。Turbopack 启动时间为1.5秒-比 Vite 快1.2倍。

在大型应用程序中，这种差异保持一致。在一个包含 30,000 个模块的应用程序中，Turbopack 启动时间比 Vite 快1.4倍。

请注意，Vite 在这些基准测试中使用了官方的 SWC 插件（在新标签页中打开），这不是默认配置。


#### Code updates

Vite的开发速度非常快，因为它具有快速刷新功能。当你更新一个文件时，Vite使用它的Native ESM系统将更新后的模块发送给浏览器，并执行一些魔术将其集成到现有的模块图中。

在turbpack中，我们发现对于Fast Refresh，我们根本不需要做任何捆绑工作。我们可以用类似于Vite的方式发送更新。实际上——更有效率一点:turbpack直接通过WebSocket发送更改过的模块，根本不需要做任何绑定。

在包含1000个模块的应用程序中，turbpack对文件更改的响应速度比Vite快3.8倍。




### Turbopack vs Webpack

> webpack 已经被下载超过 30 亿次，成为当今最常用的 JavaScript 打包工具。然而，我们发现它的基于 JavaScript 的架构已经达到了极限。我们已经构建了 Turbopack 作为 webpack 的继任者：**速度更快，但同样灵活和可扩展**。

[comparisons-webpack](https://turbo.build/pack/docs/comparisons/webpack)


#### Dev server startup time

我们发现 webpack 的主要问题是**开发服务器的启动时间**。如果您在某个页面中导入了许多模块并在浏览器中打开该页面，则初始编译将需要几秒钟。如果您在开发环境中更改路由，则必须再次等待类似的编译以获取新页面。

我们设计 Turbopack 尽可能懒惰，只在请求时执行所需工作。在开发服务器中，这意味着在传入请求时，我们仅执行用户请求的工作。不再对按需加载的代码进行不必要的捆绑。

这意味着 Turbopack 的开发服务器启动比 webpack 快得多。使用 webpack 作为内部机制的 Next.js 12 可以在 1,000 模块应用程序中启动构建服务器，耗时 3.6s。Turbopack 可以在 1.5s 到 2.5 倍更快的速度启动。


#### Code updates

随着我们持续优化 webpack，我们发现快速刷新的速度存在一个性能瓶颈。在大约有 2,000 个组件的情况下，我们能够产生的最佳速度是 500 毫秒。在 Next.js 12 中，这是一个巨大的成就。以前，这个过程需要大约 10 秒钟。

通过 Turbopack，我们实现了我们的目标：快速刷新的性能保持接近恒定，无论您的应用程序大小如何。它不是根据应用程序大小进行缩放，而是根据所做更改的大小进行缩放。

在一个有 1,000 个模块的应用程序中，Turbopack 可以比 webpack 更快地响应文件更改 5.6 倍。在一个有 30,000 个模块的应用程序中，这个速度是 webpack 的 217.3 倍。




### 实践


Turbopack目前还处于alpha版本，只是Next 13提供的技术支持。按照官方文档所述，我们只需执行如下命令即可完成Turbopack项目的初始化。


[快速上手](https://turbo.build/pack/docs)



- Next.js + Nest.js + TurboPack 全栈项目：[打造属于你自己的 Mac（Next.js+Nest.js TS全栈项目）](https://juejin.cn/post/7220327699385532471)


### 展望

目前，Turbopack还处于alpha阶段，只能在 Next.js v13 中使用。未来，Turbopack将发布独立的 CLI、插件 API，以及开启对Svelte 和 Vue等框架的支持。并且，Turbopack 将用于 Next.js 13 Dev server。它将为闪电般快速的 HMR 提供动力，并将原生支持 React 服务端组件，以及 TypeScript、JSX、CSS 等。Webpack 用户还可以期待使用 Turbopack 进入基于 Rust 的未来的增量迁移路径。




## 其他



### Vercel

[Vercel](https://vercel.com) 是由 Guillermo Rauch 创立的云服务公司，前身为 Zeit，有 [Next.js](https://nextjs.org/)、Node.js 的 websocket 框架 socket.io 和 MongoDB 客户端 [Mongoose](http://www.mongoosejs.net/) 等知名开源项目为大众所知。Next.js 为了实现后端渲染，重度使用了 JS 生态中的打包构建工具 webpack。

[https://github.com/vercel](https://github.com/vercel)



[Vercel快速上手](https://vercel.com/docs/concepts/get-started)


### Monorepo


- Monolith
>**单仓库巨石应用**， 一个 Git 仓库维护着项目代码，随着迭代业务复杂度的提升，项目代码会变得越来越多，越来越复杂，大量代码构建效率也会降低，最终导致了单体巨石应用，这种代码管理方式称之为 Monolith。

- MultiRepo
> **多仓库多模块应用**，于是将项目拆解成多个业务模块，并在多个 Git 仓库管理，模块解耦，降低了巨石应用的复杂度，每个模块都可以独立编码、测试、发版，代码管理变得简化，构建效率也得以提升，这种代码管理方式称之为 MultiRepo。

- MonoRepo
> 单仓库多模块应用，随着业务复杂度的提升，模块仓库越来越多，MultiRepo这种方式虽然从业务上解耦了，但增加了项目工程管理的难度，随着模块仓库达到一定数量级，会有几个问题：跨仓库代码难共享；分散在单仓库的模块依赖管理复杂（底层模块升级后，其他上层依赖需要及时更新，否则有问题）；增加了构建耗时。于是将多个项目集成到一个仓库下，共享工程配置，同时又快捷地共享模块代码，成为趋势，这种代码管理方式称之为 MonoRepo。



Monorepo 的概念最早是由 Google 提出并实践的，随着各种技术的发展和超级应用的出现，人们开始考虑怎么才能将所有的小应用都集成在一个大项目中，特别是在这些项目互相影响时，而在实现过程中，工程师们最关注的两点就是：**项目功能分离 和 避免重复代码**。

在 Monorepo 中，我们可以对每个拆离出来的项目进行一套单独的配置，他们彼此之间互不影响，但是又可以通过总体的配置来互相结合和引用，从而达到协作的效果。




1. 代码复用非常简单
> 我们只需要将复用频率高的代码，单独抽离出来成为一个 shared 之类的项目，那么其他所有的项目都只需要直接引用这个项目下的代码就可以了。而不用将这个项目重新打包，再在其他项目中使用。

2. 简化依赖管理
> 由于我们是在同一个项目下，因此对于第三方依赖的管理也会简化很多，像是之前多个项目可能有一些相同的第三方依赖包，每个项目都需要下载一遍，而我们使用 Monorepo 的框架重构项目之后，这些依赖包就可以避免重复下载，同时也能通过配置在不同的项目之间复用。

3. 构建部署
> 构建性 Monorepo 工具可以配置依赖项目的构建优先级，可以实现一次命令完成所有的部署。

4. 工程配置
> 多项目在一个仓库，工程配置一致，代码质量标准及风格也很容易一致。

5. 开发迭代
> 多个项目都在一个仓库中，可看到相关项目全貌，编码非常方便；代码复用高，方便进行代码重构；依赖调试方便，依赖包迭代场景下，借助工具自动 npm link，直接使用最新版本依赖，简化了操作流程。


**技术实现方案**

> 项目代码仓库越来越庞大，工作流（int、构建、单元测试、集成测试）也会越来越慢；专门针对这样的场景进行极致的性能优化的工具应运而生；适用于包非常多、代码体积非常大的 Monorepo 项目。


#### Turborepo

[Turborepo](https://turbo.build/repo) 是 Vercel 团队开源的高性能构建代码仓库系统，允许开发者使用不同的构建系统。


[Quickstart](https://turbo.build/repo/docs/getting-started/create-new)


构建加速思路：
1. Multiple Running Task：构建任务并行进行，构建顺序交给开发者配置
2. Cache、Remote Cache：通过缓存 及 远程缓存，减少构建时间


具体构建思路可参考官方文档：[Running Tasks in a Monorepo](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)、[Caching Tasks](https://turbo.build/repo/docs/core-concepts/caching)



#### Rush
> Rush 是微软开发的可扩展的 Monorepo 工具及解决方案。早期，只提供了 Rush 作为构建调取器，其余事项交给用户灵活的选择任意构建工具链，由于过于灵活带来了很大的选型及维护成本，后来成立了 Rush Stack 来提供了一套可复用的解决方案，涵盖多项目的构建、测试、打包和发布，实现了更强大的工作流。

[Rush Stack](https://rushstack.io/zh-cn/)




#### Lerna
> Lerna 是 Babel 为实现 Monorepo 开发的工具；最擅长管理依赖关系和发布；优化了多包工作流，解决了多包依赖、发版手动维护版本等问题；Lerna 不提供构建、测试等任务，工程能力较弱，项目中往往需要基于它进行顶层能力的封装。


1. 为单个包或多个包运行命令 (lerna run)
2. 管理依赖项 (lerna bootstrap)
3. 发布依赖包，处理版本管理，并生成变更日志 (lerna publish)



参考：
- [带你了解更全面的 Monorepo - 优劣、踩坑、选型](https://juejin.cn/post/7215886869199896637)
- [Monorepo---让跨项目合作像搭积木一样简单](https://zhuanlan.zhihu.com/p/513171061)
- [Monorepo，大型前端项目管理模式实践](https://mp.weixin.qq.com/s/6_yGXHS_R6abx-G3yOCT8w)


### Turbopack vs Turborepo

> Turbopack 和 Turborepo 都是由 Vercel 推出的工具，但它们的定位和功能完全不同。


- **Turbopack**：是一个基于 Rust 的`增量打包工具`，旨在取代 Webpack，专注于提高 JavaScript 和 TypeScript 项目的构建速度。它特别适用于开发服务器和生产环境的打包，支持快速的热更新（HMR）和按需编译。
> 目标是提供最快的开发体验，特别是在大型项目中。它通过增量计算和函数级缓存，显著减少了构建和更新的时间。对标的是`webpack`和`vite`等打包工具。


- **Turborepo**：是一个针对 JavaScript 和 TypeScript 的 `Monorepo 构建工具`，专注于优化多包项目的任务执行效率。它通过缓存、并行执行和任务管道来加速构建、测试和发布流程
> 目标是优化 Monorepo 中的任务执行效率。它通过缓存和并行执行任务，减少重复工作，特别适合多包项目的构建和测试。对标的`Lerna`等Monorepo工具。




### SWC
> swc(Speedy Web Compiler) 是用 Rust 实现的一套 TypeScript/JavaScript compiler，性能较 babel/ts 快 5～20 倍。

大部分 Webpack 的项目编译都是使用 Babel 编译和转换，由于 Babel 本身也是使用 Javascript 编写，转换效率并不理想，而 Turbopack 原生使用 SWC 作为编译器。SWC 是一款 Rust 编写的 Javascript 代码编译器，官方宣称其编译速度是 Babel 的20倍（ Webpack 也可以使用SWC）。

[https://github.com/swc-project/swc](https://github.com/swc-project/swc)、[官方文档](https://swc.rs/)





### Rust
> Rust 速度惊人且内存利用率极高。由于没有运行时和垃圾回收，它能够胜任对性能要求特别高的服务，可以在嵌入式设备上运行，还能轻松和其他语言集成。

[https://www.rust-lang.org/zh-CN/](https://www.rust-lang.org/zh-CN/)


Rust 是由 Mozilla 主导开发的通用、编译型编程语言。设计准则为 “安全、并发、实用”，支持函数式、并发式、过程式以及面向对象的编程风格。Deno 使用 Rust 语言来封装 V8 引擎，通过 libdeno 绑定，我们就可以在 JavaScript 中调用隔离的功能。



### Deno
> Deno 是一个简单、先进且安全的 JavaScript 和 TypeScript 运行时环境，其基于 V8 引擎并采用 Rust 编程语言构建；跟 Node 比较类似~

[Deno中文网](https://www.denojs.cn/)、[了不起的 Deno 入门与实战](https://juejin.cn/post/6844904162321252360)



## 参考


- [Turbopack初印象](https://juejin.cn/post/7220301128990212154)
- [初识Turbopack](http://zoo.zhengcaiyun.cn/blog/article/turbopack)

- [前端又开撕了：用Rust写的Turbopack，比Vite快10倍？](https://mp.weixin.qq.com/s/SHyGq7siczG5TPIBB3HQ0Q)
- [Vercel 与 Next.js：开源全明星团队背后的商业逻辑](https://segmentfault.com/a/1190000041341813)
- [比 Webpack 快 700 倍、比 Vite 快 10 倍的打包器 Turbopack](https://juejin.cn/post/7158791870796169230)
- [尤雨溪：Turbopack真的比Vite快10倍吗？](https://blog.csdn.net/gtLBTNq9mr3/article/details/127680877)
