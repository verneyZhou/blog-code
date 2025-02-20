---
title: Turborepo + pnpm 搭建 React 组件库
date: 2025-01-22 14:47:22
permalink: false
categories:
  - Turbo
  - React
  - 组件库
  - MonoRepo
tags:
  - Turbo
  - React
  - 组件库
  - MonoRepo
---

# Turborepo + pnpm 搭建 React 组件库


单纯使用 pnpm 就能实现 Monorepo 项目我们都知道，因为它原生支持 workspace，但是它也依然存在一些缺点:

1. `任务运行策略`：虽然 pnpm 支持工作空间间的依赖管理和一些任务的并行执行，但是它并不那么灵活或高效地处理跨包的构建、测试和发布任务比如增量构建和任务缓存。
2. `自定义构建和发布流程`：pnpm 在自定义构建流程、测试流程和发布流程方面的能力有限。对于需要高度定制化工作流的复杂 Monorepo 项目，可能需要额外的脚本或配置来满足这些需求。
3. `构建效率`：在没有专门的构建缓存机制的情况下，pnpm 对于大型 Monorepo 项目的构建效率可能不如使用了缓存策略的工具。这可能导致在持续集成/持续部署（CI/CD）环境中，构建和部署的时间增长。
4. `高级任务调度和资源管理`：pnpm 本身可能不提供高级的任务调度和资源管理特性，如限制并行任务数目以避免过度占用系统资源，或者根据任务的资源使用情况动态调整优先级。




## Turborepo
> Turborepo是一个高性能的构建系统，专为 JavaScript 和 TypeScript 的 Monorepo 项目设计。它提供了一种高效管理和构建项目中多个包的方式，通过缓存先前构建和测试的结果来显著减少重复工作的需要，从而加快开发和持续集成的流程。Turborepo 旨在提高大型 Monorepo 项目的构建效率，特别是在复杂的项目中，它可以处理依赖关系、执行任务、并确保构建的正确性和效率。

- [Turbo官网](https://turbo.build/)
- [Turbo中文文档](https://tightenpreacher.github.io/Turborepo/Quickstart/)


### Turborepo优势

- **多任务并行处理**

> Turborepo 支持多个任务的并行运行，在执行任何任务之前，Turborepo 首先`分析项目中各个包之间的依赖关系`。这包括识别包之间的直接依赖以及跨包的间接依赖。通过这种依赖分析，Turborepo 能够构建出一个执行任务的`依赖图`，确保在执行任何特定任务之前，其所有依赖项都已经被处理。

> 依据构建的依赖图，Turborepo 使用一种智能调度算法来决定任务的执行顺序。它会`并行执行那些彼此之间没有依赖关系的任务，而将有依赖关系的任务按正确的顺序排队执行`。这种方法`最大化地利用了系统的 CPU 和内存资源`，同时确保了构建过程的正确性。

在传统的 Monorepo 任务管理中虽然可以执行一些基本的并行操作，但通常缺乏一个综合策略来最大化并行效率，可能导致资源未充分利用。在没有智能管理的情况下，同时运行多个重资源任务可能会导致性能瓶颈，影响任务执行效率。



- **增量构建**

增量构建意味着在构建过程中，`只有自上次成功构建以来发生变化的部分才会被重新构建`，而未更改的部分则会跳过，直接使用上次构建的结果。

Turborepo 使用`文件指纹（或哈希）技术`来确定文件自上次构建以来是否发生了更改。通过比较文件的当前指纹与存储在缓存中的上一次构建指纹，Turborepo 能够快速识别哪些文件需要重新构建。


- **云缓存**

> 云缓存基于一个简单的原理：`将构建任务的输出（如编译代码、测试结果等）存储在云端服务`中。当相同的任务在未来被触发时，Turborepo 首先检查云缓存中是否存在相应的输出。如果存在，它将直接使用缓存的结果，而不是重新执行任务。这种机制依赖于对任务输入（如源代码文件）的敏感度分析，确保仅当输入未发生变化时，才复用缓存结果。

1. `构建速度提升`：通过避免重复执行未更改的任务，云缓存显著减少了构建和测试所需的时间。

2. `团队协作优化`：云缓存支持跨团队成员共享，意味着一个团队成员的构建结果可以被其他成员复用，进一步提高了整个团队的工作效率。
s
3. `CI/CD 效率增强`：在持续集成/持续部署（CI/CD）流程中，云缓存可以跨不同构建和部署任务共享，减少了构建步骤，加快了软件交付速度。
> 开发人员团队和/或持续集成 (CI) 系统使用远程缓存来共享构建输出。如果您的构建是可重现的，那么一台机器的输出可以安全地在另一台机器上重复使用，这可以显着加快构建速度。

4. `资源优化`：减少了对计算资源的需求，尤其是在资源受限的环境中，如限制了并行构建数的 CI 服务。

**Q：怎么启动云缓存？**
1. 如果要将本地 turborepo 链接到远程缓存，请首先使用 Vercel 帐户对 Turborepo CLI 进行身份验证：`npx turbo login`;
2. 接下来，可以通过运行以下命令将您的 turborepo 链接到远程缓存：`npx turbo link`;
3. 在 turbo.json 中启用远程缓存，添加 remoteCache 配置：
``` json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local"
  ],
  "remoteCache": {
    "enabled": true,
    "team": "your-team-name"  // 你的团队名称
  },
  "pipeline": {
    // ... 现有配置保持不变
  }
}
```
3. 启用后，对当前缓存的包或应用程序进行一些更改，并使用`turbo run`, 您的缓存工件现在将存储在本地和您的远程缓存中。
4. `rm -rf ./node_modules/.cache/turbo`可删除本地 Turborepo 缓存


### Pipelines

Turborepo 的**任务管道 Pipelines**是其核心特性之一，`允许开发者定义和执行跨多个包（packages）的自定义任务序列`。任务管道使得在 Monorepo 环境中的构建、测试、部署等过程更加灵活、高效。通过在 `turbo.json` 配置文件中定义任务管道，Turborepo 能够根据依赖关系自动优化任务的执行顺序，实现并行处理，以及利用缓存来加速重复任务的执行。

在 `pipeline` 中的每一个 key 都指向我们在 `package.json` 中定义的 script 脚本执行命令,并且在 pipeline 中的每一个 key 都是可以被 turbo run 所执行 执行 pipeline 的脚本的名称。您可以使用其下方的键以及与缓存相关的一些其他选项来指定其依赖项。

在我们执行 `turbo run xxx` 命令的时候 turbo 会根据我们定义的 Pipelines 里对命令的各种配置去对我们的每个 package 中的 `package.json` 中 对应的 script 执行脚本进行有序的执行和缓存输出的文件。



### DependsOn

在 Turborepo 中，`DependsOn` 是一种配置属性，它允许你`明确指定任务之间的依赖关系`。通过使用 DependsOn，你可以确保在执行某个任务之前，其所有依赖的任务都已经完成。这是构建复杂 Monorepo 项目时确保正确执行顺序的关键机制。

DependsOn 的主要功能是定义任务执行的先决条件，这对于管理具有复杂依赖关系的大型项目尤其重要。在 Monorepo 设置中，不同的包可能需要按照特定的顺序构建，或者某些任务（如测试或部署）可能需要等待其他任务（如构建或编译）完成后才能开始。


**常规依赖 vs 拓扑依赖**
- 常规依赖 ( dependsOn )：直接指定任务的依赖关系，表示当前任务在执行前需要等待`指定的其他任务`完成
- 拓扑依赖 ( ^build )：使用 `^` 前缀表示工作空间的`拓扑依赖关系`，表示当前包需要等待其`所有依赖包的相同任务`完成


[Configuring turbo.json](https://turbo.build/repo/docs/reference/configuration)

``` json
// turo.json
{
  // "tasks": { // turbo v2+ pipeline 改成 tasks
  //   "build": {
  //     "dependsOn": ["^build"]
  //   }
  // },
  "globalDependencies": [ // 全局依赖项，影响所有任务的缓存失效。例如： **/.env.*local 表示环境变量文件变化会使所有缓存失效
    "**/.env.*local"
  ],
  "pipeline": {
    "dev": {
      "cache": false, // cache 表示是否缓存，通常我们执行 dev 命令的时候会结合 watch 模式，所以在项目启动模式下不需要开启 turbo 缓存机制
      "persistent": true // 表示该任务是持久运行的（如开发服务器）
    },
    "build": {
      "dependsOn": ["^build"], // 使用 ^ 前缀表示工作空间的拓扑依赖关系，^build 表示依赖所有上游包的构建任务
      "outputs": [
        "dist/**",
        ".next/**",
        "storybook-static/**"
      ], // 构建输出目录，包括 dist/** 、 .next/** 和 storybook-static/**
      "outputMode": "new-only", // 输出的模式类型
      // full:显示所有输出（默认）
      // hash-only:仅显示任务的哈希值
      // new-only:显示缓存未命中的完整输出和缓存命中的计算哈希值 
      // errors-only:仅显示任务失败的输出 
      // none:隐藏所有任务输出
    },
    "api:build": {
      "outputs": ["dist/**"] // outputs 表示输出文件，为空数组表示不缓存输出
    },
    "ui:build": {
      "inputs": ["src/**", "public/**"], // inputs 表示输入文件，当输入文件发生变化时，任务会重新执行，指定[]意味着任务在任何文件发生更改时重新运行。
      "dependsOn": ["api:build"] // 常规依赖，表示当前任务在执行前需要等待指定的其他任务完成，为空数组表示没有依赖
    }
  },

}
/*
拓扑依赖 具体举例说明：

假设你的项目结构是：
- packages/ui (被 docs 依赖)
- apps/docs (依赖 ui)

当你运行 turbo build 时：
- 使用 "dependsOn": ["^build"] 时，docs 的构建会自动等待 ui 的构建完成
- 这是因为 docs 在 package.json 中依赖了 ui 包，Turborepo 会自动识别这种依赖关系
*/
```
> 在这个例子中，`ui:build` 任务通过 `dependsOn` 属性声明了对 `api:build` 任务的依赖。**这意味着 Turborepo 会先执行 api:build 任务，确保 API 构建完成后，才开始执行 ui:build。**





### Filtering Packages

> 在 Turborepo 中，`--filter` 是一个非常有用的命令行选项，允许开发者有选择性地运行特定的任务或`针对特定的包执行操作`。这个功能特别适合在大型 Monorepo 项目中使用，因为它可以帮助你缩小命令的作用范围，仅对那些你确实想要操作的包或任务进行构建、测试或其他任何支持的命令。

在一个包含多个包（packages）的 Monorepo 中，如果你只想要构建或测试某些包，可以使用 `--filter` 来指定这些包：

``` sh
turbo run <command> --filter=<package name>

pnpm run dev --filter docs # turbo run dev会同时在所有工作区运行dev。但有时，我们可能只想选择一个工作区
```

[using-filters](https://turbo.build/repo/docs/crafting-your-repository/running-tasks#using-filters)






### Turborepo vs Pnpm

| 对比维度 | Turborepo | PNPM |
|---------|-----------|------|
| **核心优势** | - 增量构建和智能缓存<br>- 基于依赖图的任务调度<br>- CI/CD 友好，支持远程缓存 | - 高效的依赖管理(硬链接复用)<br>- 原生支持 monorepo<br>- 快速安装且节省空间 |
| **主要劣势** | - 不能独立管理依赖<br>- 需要配合包管理器使用 | - 缺乏构建优化能力<br>- 任务调度较为基础 |
| **适用场景** | 大型项目的构建优化 | 包管理和工作空间管理 |
| **最佳实践** | 大型项目推荐与 PNPM 配合使用 | 小型项目可单独使用 |


### Turbo vs Lerna


| 特性 | Turborepo | Lerna |
|------|-----------|-------|
| **构建性能** | - 支持增量构建<br>- 智能缓存机制<br>- 支持远程缓存<br>- 并行任务执行<br>- 构建速度快 | - **基本并行任务执行**<br>- 无内置缓存机制<br>- 构建速度相对较慢 |
| **依赖管理** | - 不直接处理依赖<br>- 需配合包管理器使用<br>- 专注于构建优化 | - 完整的依赖管理<br>- 版本关联处理<br>- 支持独立/统一版本 |
| **配置复杂度** | - 配置简单<br>- 主要通过 turbo.json<br>- 学习曲线平缓 | - 配置相对复杂<br>- 概念较多<br>- 学习曲线陡峭 |
| **功能特性** | - 专注构建优化<br>- 任务编排能力<br>- Pipeline 配置<br>- 现代化体验 | - 完整项目管理<br>- 发布版本管理<br>- 成熟生态系统<br>- 丰富社区插件 |
| **适用场景** | - 大型快速构建项目<br>- 现代前端工具链<br>- 配合 pnpm 使用 | - 需要完整包管理<br>- 传统 npm 包开发<br>- 精细版本控制 |
| **缓存机制** | - 本地缓存<br>- 远程缓存<br>- 智能缓存失效 | - 无内置缓存<br>- 依赖外部工具 |
| **工具集成** | - 与现代工具链集成好<br>- 支持主流 CI/CD | - 生态系统成熟<br>- 插件系统丰富 |


Lerna 中的`基本并行任务执行`指的是它提供的一个简单的并行执行任务的能力。

例如：`lerna run build --parallel`，lerna通过 `--parallel` 参数实现并行执行。它同时启动所有包的相同命令，不考虑包之间的依赖关系，不支持智能任务调度；

举个例子：假设有三个包：A 依赖 B，B 依赖 C，那么：
- Lerna 的 `--parallel` 会同时执行 A、B、C 的构建
- Turborepo 会先构建 C，然后是 B，最后是 A，同时利用缓存避免重复构建


`Turbo`它能够有效地安排任务类似于瀑布可以同时异步执行多个任务，而`lerna`一次只能执行一项任务


**选择建议:**

1. 选择 Turborepo 的情况：项目需要优化构建性能，喜欢简单的配置，使用现代前端工具链，使用 pnpm 作为包管理器，结合 changeset 进行版本控制
2. 选择 Lerna 的情况：需要完整的包管理功能，需要精细的版本控制，依赖成熟的社区支持，项目较为传统



### 常用命令

``` sh
turbo run build --continue # 默认为false,该标志告诉turbo是否在出现错误（即任务的非零退出代码）时继续执行。默认情况下，指定--parallel标志将自动设置--continue为true除非明确设置为false。

turbo run lint --parallel --no-cache # --no-cache 默认false, 禁用缓存，每次运行都会重新构建。
turbo run dev --parallel --no-cache
# --parallel 默认false, 脚本程序并行运行命令并忽略依赖关系图。这对于使用实时重新加载进行开发很有用。
# 例如我们启动vite项目的时候我们就需要忽略其他可能出现的dependsOn依赖关系

turbo run build --filter=my-pkg # 运行my-pkg包
turbo run test --filter=...^@scope/my-lib # 运行所有以^@scope/my-lib开头的包
turbo run build --filter=./apps/* --filter=!./apps/admin # 运行所有./apps/*包，但排除./apps/admin包

turbo run build --force # 强制构建所有包

pnpm install --filter @verney/ui # 安装ui库下面的依赖
pnpm install -w # 安装根目录下的依赖, -w 全称为 --workspace-root
pnpm -r run lint # -r 表示递归执行，会在所有包含 lint 脚本的子项目中执行该命令
pnpm --filter @verney/docs remove package-name # 卸载包
```

[Turborepo API reference](https://turbo.build/repo/docs/reference)





## 项目搭建

> 本项目是一个基于 Turborepo 和 pnpm 构建的 React 组件库开发框架，采用 monorepo 的方式管理代码。

- [源码地址](https://github.com/verneyZhou/verney-react-design)
- [组件docs文档](https://verney-react-design.vercel.app/)
- [组件storybook文档](https://verney-react-design-storybook.vercel.app)


### 初始化

> `node v20+`

[Turbo Getting started](https://turbo.build/repo/docs/getting-started)

- 安装turbo: `pnpm install turbo --global`

- 新建项目：`pnpm dlx create-turbo@latest`, 按提示操作即可~

> 这里如果按上面命令创建，会自动生成一个默认的项目模板，也可以按如下命令选择其他模板：

```sh
# Use an example listed below
pnpm dlx create-turbo@latest --example [example-name]
 
# Use a GitHub repository from the community
pnpm dlx create-turbo@latest --example [github-url]
```
[getting-started/examples](https://turbo.build/repo/docs/getting-started/examples)

这里如果按照默认模板创建后会生成如下目录结构：
```yml
.turbo # turbo缓存等配置信息
apps:
    - docs/ # next创建的文档项目
    - web/ # next创建的预览项目
packages:
    - ui/ # ui库
    - eslint-config/ # eslint配置
    - typescript-config/ # ts配置
turbo.json # turbo配置文件
```

这里需要将项目结构改成适合自己需求的配置，对于不同的子项目可供选择的技术方案有很多，具体需要具体场景具体分析，因项目而异，对于我的这个组件库项目而言，我的整体目录结构大致如下：

```yml
apps:
    - docs/** # 组件文档
    - storybook/** # storybook组件文档
    - playground/** # 组件预览项目
packages:
    - 'ui/**' # 里面会放组件库，工具库等子项目
    - 'hooks/**' # 里面会放hooks库
    - 'utils/**' # 里面会放utils库
    - 'eslint-config/**' # eslint配置
```
> 具体详细修改这里不再赘述，具体细节看源码~



### pnpm-workspace.yaml
> [pnpm-workspace.yaml](https://pnpm.io/zh/pnpm-workspace_yaml) 是包关联配置文件~

``` yaml
packages:
  - 'apps/*'
  - 'packages/*'
```
> 这样就能将我们项目apps下的子项目和packages下的子项目关联起来了~



### turbo.json
> turbo.json是turbo的配置文件，用来配置turbo的运行环境，以及一些运行时的配置，上面有介绍，这里不再赘述~


``` json
// package.json
"build": "turbo run build",
"dev": "turbo run dev",
"preinstall": "npx only-allow pnpm" // 只允许使用pnpm安装依赖

// turbo.json
"build": {
  "dependsOn": ["^build"],
},
"dev": {
  "cache": false, // 表示 dev 任务不会被缓存
  "persistent": true // 表示这是一个持久运行的任务（如开发服务器）
},
```

- 在 monorepo 项目根目录下执行`npm run dev` 时，Turbo 的执行流程如下：

1. 首先，Turbo 会读取根目录的 `package.json` 中的 dev 命令，该命令实际执行的是`turbo run dev`
2. 然后，Turbo 会根据 `turbo.json` 的配置进行任务调度，在开发模式下，Turbo 会并行启动所有项目的开发服务器，但会确保依赖项先准备就绪。


- 如果执行`npm run build`，它的执行流程如下：
1. 首先，Turbo 会根据 `package.json` 中各个项目的依赖关系构建依赖图：如果项目 A 依赖项目 B，会通过 `package.json` 中的 `dependencies` 声明，Turbo 会自动分析这些依赖关系，构建一个依赖图；
2. 然后，Turbo 会读取根目录的 `package.json` 中的 dev 命令，该命令实际执行的是`turbo run build`；
3. 然后通过 turbo.json 中 build 任务的`"dependsOn": ["^build"]` 配置，确保每个项目在构建前，其依赖的项目都已完成构建，具体到当前下面项目：
    - 首先构建基础包：`@verney/utils、@verney/hooks、@verney/eslint-config`
    - 然后构建依赖这些基础包的 `@verney/ui`
    - 最后构建依赖 UI 组件的应用：`docs、playground` 和 `storybook`
> 这种构建顺序确保了依赖关系的正确性，避免了构建过程中的依赖错误。



### eslint-config库

- 新建项目：`mkdir packages/eslint-config && cd packages/eslint-config`

- `pnpm init`创建pkg文件，完善脚本信息；这个库比较简单，就是创建一个公共文件存放eslint的配置信息，方便eslint代码规范的统一处理，这里就不多赘述了~

- 配置：
``` js
// package.json
"name": "@verney/eslint-config",
"main": "index.js",

// typescript.js
module.exports = {
    // 指定 TypeScript 的 ESLint 解析器
    parser: '@typescript-eslint/parser',
    // 继承的 ESLint 配置
    extends: [
        // ESLint 推荐规则
        'eslint:recommended',
        // TypeScript ESLint 推荐规则
        'plugin:@typescript-eslint/recommended',
        // import 插件错误检查规则
        'plugin:import/errors',
        // import 插件警告规则
        'plugin:import/warnings',
        // import 插件 TypeScript 支持
        'plugin:import/typescript',
        // prettier 覆盖 eslint 本身规则
        // 添加 prettier 插件、设置 prettier 规则、关闭所有可能与 prettier 冲突的 ESLint 规则
        'plugin:prettier/recommended'
    ],
    plugins: [ '@typescript-eslint', 'import' ],
    // 自定义规则配置
    rules: {...}
};


// react.js
module.exports = {
    // 继承的ESLint配置
    extends: [
        // 继承typescript的配置
        './typescript',
        // 使用React推荐的规则配置
        'plugin:react/recommended',
        // 使用React Hooks推荐的规则配置
        'plugin:react-hooks/recommended',
        // 使用JSX可访问性推荐的规则配置
        'plugin:jsx-a11y/recommended',
    ],
    // React相关设置
    settings: {
        react: {
            // 自动检测React版本
            version: 'detect',
        },
    },
    // 具体规则配置
    rules: {...},
};


// index.js
module.exports = {
    extends: ['./typescript'],
};
``` 


- 使用：

``` sh
# 其他项目 package.json 中引入：
"devDependencies": {
    "@verney/eslint-config": "workspace:*",
}

# 下载
pnpm install @verney/eslint-config


# 新建 .eslintrc.js ，添加配置：
module.exports = {
    extends: ['@verney/eslint-config/react'], # 引入 react.js 的配置
    ...
};
```

- 在 ESLint 配置中，`extends`继承现有的规则集合，包含了规则、插件和配置，可直接使用预设的规则包，这里的`@verney/eslint-config`就是一个预设的规则包，可以很方便的使用它的规则，不用再重复写规则了~

- `extends`用于继承配置，`plugins`用于添加特定功能，`rules`中自定义规则~

- 一般项目中会eslint和prettier一起使用，可能需要插件兼容处理，具体处理方案在之前的博客里介绍过，这里不再赘述~


::: tip
在 eslint-config 项目中，stylelint 应该放在 `peerDependencies` 中。因为 stylelint 是一个工具包，需要在使用 eslint-config 的项目中也能访问到这个命令行工具。将其放在 peerDependencies 中可以：

1. 确保使用该配置的项目必须安装兼容版本的 stylelint
2. 避免多个项目使用不同版本的 stylelint 导致的冲突
3. 让使用者明确知道需要安装这个依赖

这是一个比较常见的最佳实践，类似于` eslint-config-*` 包通常会将 eslint 放在 peerDependencies 中。
:::



| 插件/解析器 | 类型 | 作用 | 使用场景 |
|------------|------|------|----------|
| `babel-eslint`<br>(已废弃) | 解析器 | - 支持最新的 ES 语法<br>- 支持 Flow 类型注解<br>- 支持 JSX | 已被 @babel/eslint-parser 替代 |
| `@babel/eslint-parser` | 解析器 | - 解析现代 JavaScript 语法<br>- 支持实验性语法<br>- 支持 Babel 配置 | 使用 Babel 且需要 ESLint 支持的项目 |
| `eslint-plugin-babel`<br>(已废弃) | 插件 | - 提供一些特定的 Babel 语法规则 | 已被 @babel/eslint-plugin 替代 |
| `@babel/eslint-plugin` | 插件 | - 支持 Babel 特定语法规则<br>- 提供实验性特性的规则 | 配合 @babel/eslint-parser 使用 |
| `@typescript-eslint/parser` | 解析器 | - 解析 TypeScript 代码<br>- 生成 AST<br>- 支持类型检查 | TypeScript 项目 |
| `@typescript-eslint/eslint-plugin` | 插件 | - TypeScript 特定的 lint 规则<br>- 类型检查规则<br>- 最佳实践规则 | TypeScript 项目的代码质量控制 |
| `eslint-plugin-import` | 插件 | - 检查导入/导出语法<br>- 路径解析<br>- 导入顺序规则 | 模块化 JavaScript/TypeScript 项目 |
| `eslint-plugin-react` | 插件 | - React 语法规则<br>- JSX 规则<br>- React 最佳实践 | React 项目 |
| `eslint-plugin-react-hooks` | 插件 | - Hooks 规则检查<br>- Hooks 依赖检查<br>- Hooks 使用规范 | 使用 React Hooks 的项目 |
| `eslint-plugin-vue` | 插件 | - Vue 语法规则<br>- 模板语法检查<br>- Vue 最佳实践 | Vue 项目 |





### utils库
> 这个库主要收集一些常用的工具方法，比如：防抖、节流、深拷贝、深比较、深合并、深遍历、深校验等，这些方法可以减少重复的代码，提高代码的复用性~

- 项目目录结构如下：
``` sh
packages/utils/
    ├── src/                    # 源码目录
        ├── __tests__/          # 测试用例
        ├── debounce.ts
        ├── index.ts
    ├── .eslintrc.js            # eslint配置
    ├── tsconfig.json           # tsc配置
    ├── tsup.config.js          # tsup配置
    ├── vitest.config.ts         # vitest配置
    ├── package.json            # pkg脚本配置
```

- 这个工具库使用`tsup`进行打包，关于打包工具的对比见下方备注，这里选择`tsup`主要是配置简单，打包性能好~

- 使用`vitest`进行测试，具体测试配置见源码~


### hooks库
> 这个库主要收集一些常用的hooks方法，比如：`useDebounce、useThrottle、...`

这个库跟上方utils库配置逻辑几乎一致，这里不再赘述~



### ui组件库
> 组件库主要收集一些常用的组件，比如：`Button、Input、...`

- 项目目录结构如下：
``` sh
packages/ui/
    ├── src/                    # 源码目录
        ├── components/          # 组件目录
            ├── Button/           # 按钮组件
                ├── __tests__/      # 测试用例
                ├── button.tsx      # 按钮组件源码
                ├── style.scss      # 按钮组件样式
                ├── index.ts      # 按钮组件入口文件
        ├── styles/              # 样式目录
        ├── test/               # 测试入口配置
        ├── index.ts             # 入口文件
    ├── .eslintrc.js            # eslint配置
    ├── tsconfig.json           # tsc配置
    ├── vite.config.ts          # vite打包配置
    ├── package.json            # pkg脚本配置
```

- 这里考虑到可能需要对ui库的打包产物进行一些精细化的配置，所以使用`vite`进行打包~

``` ts
// vite.config.ts

/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        // React 插件支持
        react(),
        // TypeScript 声明文件生成插件
        dts({
            include: ['src'],
            exclude: ['src/**/*.test.tsx', 'src/**/*.stories.tsx'],
            rollupTypes: true,
        }),
    ],
    // 测试配置
    test: {
        globals: true, // 启用全局测试
        environment: 'jsdom', // 使用 jsdom 环境
        setupFiles: ['./src/test/setup.ts'], // 测试启动文件
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // 测试文件匹配模式
        coverage: {
            reporter: ['text', 'json', 'html'], // 覆盖率报告格式
            exclude: ['node_modules/', 'src/test/setup.ts'], // 排除的文件
        },
    },
    // 构建配置
    build: {
        target: 'modules', // 构建目标
        outDir: 'dist', // 输出目录
        minify: true, // 启用代码压缩
        // 库模式配置
        lib: {
            entry: resolve(__dirname, 'src/index.tsx'), // 入口文件
            name: 'verneyReactDesign', // 库名称
            formats: ['es', 'cjs', 'umd', 'iife'], // 输出格式
            fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`, // 文件名格式
        },
        // Rollup 配置项
        rollupOptions: {
            external: ['react', 'react-dom'], // 外部依赖
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
        sourcemap: true, // 生成 sourcemap
        cssCodeSplit: true, // 启用 CSS 代码分割
    },
});
```

- `package.json`:

``` json
  "name": "@verney/ui",
  "main": "dist/index.js", // ui库入口
  "module": "dist/index.mjs", // 如果环境支持ESM，构建工具会优先使用我们的module入口
  "types": "dist/index.d.ts", // 声明文件入口
  "style": "dist/index.css",
  "sideEffects": [ // 忽略 tree shaking 带来副作用的代码
    "**/*.css",
    "**/*.scss"
  ],
  "exports": {
    ".": { // 导出配置
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./dist/style.css": "./dist/index.css" // 样式导出
  },
  "scripts": {
    "build": "vite build", // 打包
    "dev": "vite build --watch", // 开发
  }
```

- 使用：

``` sh
# 其他项目 package.json 中引入：
"dependencies": {
    "@verney/ui": "workspace:*"
},

# 下载
pnpm install @verney/ui


# 新建 .eslintrc.js ，添加配置：
module.exports = {
    extends: ['@verney/eslint-config/react'], # 引入 react.js 的配置
    ...
};

# App.tsx
import { Button } from '@verney/ui';
import '@verney/ui/dist/style.css'; # 引入样式

<Button>Hello World</Button>;
```





### docs项目
> 该项目是一个组件文档站点，使用`next.js`进行搭建，`nextra`进行主题配置~

- 项目目录结构如下：
``` sh
apps/docs/
    ├── components/          # 组件目录
    ├── pages/               # 页面目录
        ├── components/          # 组件文档
            ├── button.mdx      # button组件文档
        ├── _app.tsx        # 入口文件
        ├── _meta.json      # meta配置
        ├── index.mdx       # 首页配置
    ├── styles/              # 样式目录
    ├── .eslintrc.js            # eslint配置
    ├── tsconfig.json           # tsc配置
    ├── next.config.ts          # next配置
    ├── tailwind.config.ts      # tailwind配置
    ├── theme.config.tsx        # 主题配置
    ├── package.json            # pkg脚本配置
```

- 这里使用`.mdx`文档展示组件文档，在`.mdx`文档中可以直接写`tsx`和`markdown`，比较适合编写组件文档说明~

``` mdx
{/* button.mdx */}
---
title: Button 按钮
---

import { Button } from '@verney/ui';

# Button 按钮

按钮用于开始一个即时操作。

## 基础用法

### 按钮类型

<CodeBlock
  language="tsx"
  code={`import { Button } from '@verney/ui';

// 基础按钮类型示例

<Button>默认按钮</Button>
<Button type="primary">主要按钮</Button>
<Button type="dashed">虚线按钮</Button>
<Button type="link">链接按钮</Button>
<Button type="text">文本按钮</Button>
`}>
  <div className="flex gap-2 flex-wrap">
    <Button>默认按钮</Button>
    <Button type="primary">主要按钮</Button>
    <Button type="dashed">虚线按钮</Button>
    <Button type="link">链接按钮</Button>
    <Button type="text">文本按钮</Button>
  </div>
</CodeBlock>

## API

| 属性     | 说明           | 类型                                                     | 默认值      |
| -------- | -------------- | -------------------------------------------------------- | ----------- |
| type     | 按钮类型       | `'default' \| 'primary' \| 'dashed' \| 'link' \| 'text'` | `'default'` |
| size     | 按钮大小       | `'small' \| 'medium' \| 'large'`                         | `'medium'`  |
| disabled | 是否禁用       | `boolean`                                                | `false`     |
| loading  | 是否加载中     | `boolean`                                                | `false`     |
| danger   | 是否为危险按钮 | `boolean`                                                | `false`     |
| block    | 是否为块级按钮 | `boolean`                                                | `false`     |
| onClick  | 点击事件       | `(event: React.MouseEvent<HTMLButtonElement>) => void`   | -           |
```



### storybook项目
> [Storybook](https://storybook.js.org/docs) 是一个用于独立构建 UI 组件和页面的前端开发工具。

平常的组件开发，需要把组件单独放置在一个页面不断的调试，而`storybook`就单独为开发人员提供了一个页面，将组件放置在他们提供的页面中清晰可见。

`Storybook` 是一个用于单独构建 UI 组件和页面的前端工具，我们可以通过 story 独立创建组件，并且每个组件都有一个独立开发调试环境。Storybook 是运行在主应用程序之外，不依赖于项目，因此我们不必担心开发环境、依赖等问题导致不能开发组件；Storybook 支持多个主流框架（`React, Vue, Angular, Mithril, Ember`）等。

> 有些用`storybook`开发组件的项目里，喜欢把`storybook`的配置信息耦合在组件开发的项目里，这样我觉得如果是一个`单仓库单模块`应用还好，但像我这个monorepo项目的话，耦合度太高可能不太方便管理，所以我这里把关于`storybook`的配置信息单独放在一个`storybook`项目里，方便解耦~

- 项目目录结构如下：

``` sh
apps/storybook/
    ├── .storybook/                 # 组件目录
        ├── main.ts                 # 配置文件
        ├── preview.ts              # 预览
    ├── stories/                    # 页面目录
        ├── button.stories.tsx      # button组件文档
    ├── storybook-static/           # 打包后的静态资源
    ├── .eslintrc.js            # eslint配置
    ├── tsconfig.json           # tsc配置 
    ├── package.json            # pkg脚本配置
```


- `button.stories.tsx`:

``` tsx
// 导入 Storybook 必要的类型定义
import type { Meta, StoryObj } from '@storybook/react';
// 导入 Button 组件
import { Button } from '@verney/ui';

// 定义 Button 组件的 meta 配置
const meta = {
    // 在 Storybook 侧边栏中的显示路径
    title: 'Components/Button',
    // 要展示的组件
    component: Button,
    // 组件展示参数
    parameters: {
        // 居中布局
        layout: 'centered',
    },
    // 启用自动文档生成
    tags: ['autodocs'],
    // 控制面板中可调整的参数
    argTypes: {
        // 按钮文本内容
        children: { control: 'text' },
        // 按钮类型选择
        type: {
            control: { type: 'select' },
            options: ['primary', 'default', 'dashed', 'text', 'link'],
        },
        // 按钮尺寸选择
        size: {
            control: { type: 'select' },
            options: ['large', 'middle', 'small'],
        },
        // 是否禁用按钮
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof Button>;

// 导出 meta 配置
export default meta;
// 定义 Story 类型
type Story = StoryObj<typeof meta>;

// 导出主要按钮的 Story
export const Primary: Story = {
    args: {
        // 设置按钮类型为主要按钮
        type: 'primary',
        // 设置按钮文本
        children: '主要按钮',
    },
};

// ... 其他 stories

```

- `package.json`:
``` json
"dev": "storybook dev -p 6006", // 启动 Storybook
"build": "storybook build", // 打包 Storybook
```



### playground项目

该项目是使用`vite + react + tailwindcss`搭建的一个比较简单的开发测试项目，用于展示ui组件，utils工具函数、hooks等的方法的测试~

> 项目结构比较简单常规，这里不再赘述，具体细节看源码~




- **工程化配置**

> 关于项目的工程化配置，这里主要是`eslint`、`prettier`、`husky`、`commitlint`、`lint-staged`这些东西，具体配置可参考我之前另一篇开发vue组件库的博客[vue-design](/skills/vue/vue-design.html#eslint)，配置流程大差不差，跟组件库框架没多大关系，这里不再展开了，具体配置可参考源码~



## 项目结构

``` yml
├── apps/                      # 应用目录
    ├── docs/                  # 文档站点
        ├── pages/             # 文档页面
        ├── next.config.js     # Next.js 配置
        ├── theme.config.tsx   # Nextra 主题配置
        └── package.json       # pkg脚本配置

│   ├── storybook/             # Storybook 组件文档
        ├── .storybook/        # Storybook 配置文件
        ├── stories/           # 组件 stories
        └── package.json       # pkg脚本配置

│   ├── playground/             # 开发测试预览项目: vite + react
        ├── src/
            ├── App.tsx
        ├── index.html
        ├── vite.config.ts       # vite配置
        └── package.json         # pkg脚本配置

├── packages/                  # 包目录
│   ├── eslint-config/         # ESLint 配置
        ├── react.js           # React 配置
        ├── typescript.js      # TypeScript 配置
        ├── index.js           # TypeScript 配置
        └── package.json       # pkg脚本配置

│   ├── ui/                   # UI 组件库
        ├── src/              # 组件源码
        ├── components/       # 构建产物
        ├── styles/           # 组件入口
        ├── index.tsx         # 组件导出
        ├── vite.config.ts    # vite配置
        └── package.json      # pkg脚本配置

│   ├── utils/                # 工具函数
        ├── src/              
        ├── tsup.config.ts    # tsup配置
        └── package.json      # pkg脚本配置

│   ├── hooks/                # hooks函数
        ├── src/              
        ├── tsup.config.ts    # tsup配置
        └── package.json      # pkg脚本配置

├── pnpm-workspace.yaml       # 工作空间配置
├── package.json              # pkg配置
└── turbo.json                # Turborepo 配置
```


## 开发流程


- git clone项目到本地，保证node版本`v20+`，pnpm版本`v9.0.0+`;

- 根目录下安装依赖：`pnpm install`；




方式一：
1. 直接在项目根目录下执行：`npm run dev`即可；
2. 运行结束后，分别打开`dosc,stotybook, playground`等调试页面即可，之后在组件库参考其他组件进行开发；

方式二：
``` sh
# 先启动工具函数库、hooks库
pnpm --filter @verney/utils dev
pnpm --filter @verney/hooks dev

# 再启动UI组件库
pnpm --filter @verney/ui dev

# 最后再启动文档站点、storybook、开发测试预览项目
pnpm --filter @verney/docs dev
pnpm --filter @verney/storybook dev
pnpm --filter @verney/playground dev
```

> 在 `packages/ui/src` 下创建组件；在 `apps/storybook/stories` 下添加组件 stories；在 `apps/docs/pages` 下编写组件文档~



## 构建与发布

- 根目录下构建：`pnpm build`；

- `git commit` 提交代码；
> 添加husky等配置之后commit之前会进行格式校验，如果格式不符合要求，会报错，需要修改代码重新提交；






### vercel部署
> 代码提交到github上后，可将`docs`、`storybook`项目部署到vercel进行预览，配置比较简单，这里不再赘述，具体配置可之前的博客~

1. github上在vercel配置中添加项目；

2. 然后在 vercel官网 中添加项目，关联github项目，分别部署docs、storybook；

3. 部署成功后，以后只要main分支提交，对应项目有更改，vercel就会自动部署~




### 组件库发布



### Changesets版本管理
> [@changesets/cli](https://www.npmjs.com/package/@changesets/cli) 是一个用于管理 monorepo 项目版本和发布的工具。它可以帮助我们追踪代码变更、自动生成 changelog、管理包的版本号，以及协调多个包之间的依赖关系。当我们需要发布新版本时，它可以帮助我们确定哪些包需要更新版本，并自动处理版本号的更新，特别适合像当前这样的 monorepo 项目结构。

- 根目录安装：`pnpm add -w @changesets/cli -D`

- 根目录下创建文件：`.changeset/config.json`
``` json
{
    // 指定 changesets 配置文件的 JSON Schema
    "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
    // 配置 changelog 生成器
    "changelog": [
        "@changesets/cli/changelog",
        {
            "repo": "verney-react-design"
        }
    ],
    // 是否自动提交变更
    "commit": false,
    // 固定版本的包组
    "fixed": [],
    // 相互关联的包组
    "linked": [],
    // 包的访问权限
    "access": "restricted",
    // 默认的基础分支
    "baseBranch": "main",
    // 更新内部依赖时的版本升级类型
    "updateInternalDependencies": "patch",
    // 忽略的包列表
    "ignore": [
        "@verney/docs",
        "@verney/playground",
        "@verney/storybook"
    ]
}
```


- package.json中添加命令：
``` json
"changeset": "changeset", // 创建变更集
"version-packages": "changeset version", // 更新包版本
"release": "turbo run build && changeset publish" // 构建并发布包
```

- 配置完成后，就可以进行操作了：
1. 在根目录下执行`pnpm changeset`，即可创建变更集：`选择需要发布的包、选择版本更新类型（major/minor/patch）、填写变更说明`
2. 然后执行`pnpm version-packages`，Changesets 会根据变更集自动更新相应包的版本号，同时会更新 `CHANGELOG.md` 文件
3. 然后执行`pnpm release`，该命令会先构建所有包，然后将更新后的包发布到 npm 仓库
> 发布前需要确保已经登录到 npm，可以使用`npm login` 命令进行登录





## TODO


1. eslint-config配置，`peerDependencies`使用？参考：@ecomfe/eslint-config

2. 组件库的按需加载配置？样式打包配置？参考：antd

3. docs和storybook样式隔离？及其原理？

4. 组件库、工具函数对低版本的兼容？验证在不同版本的react、ts/js的项目中是否可以正常使用？

5. 项目使用了v1.0.1的组件，这时组件库升级到v1.0.2，增加了功能A，删除了功能B，如果项目想兼容v1.0.1，需要如何处理？

---

- 完善构建配置: 支持ES Module和CommonJS两种格式

- Docs文档：添加组件库整体介绍、完善组件文档、添加贡献指南、添加更新日志、添加设计规范文档


- 主题定制：实现主题定制系统、支持暗黑模式、提供主题变量配置


- 性能优化：添加 Tree Shaking 支持、优化打包体积、添加性能监控指标


- 辅助功能：添加国际化支持、添加无障碍访问（ARIA）支持、添加组件动画效果


- 示例完善：为每个组件添加更多使用示例、添加最佳实践指南、添加常见问题解答


- docker自动部署：配置 CI/CD 流程；添加自动化发布流程


## 备注

### 打包工具对比

- **vite**

开发体验好，热更新快；配置简单；基于Rollup，但更现代化

`vite.config.js`

- **rollup**

1. 打包体积小，tree-shaking支持好
2. 配置灵活，插件生态丰富
3. 适合打包库文件
4. 支持ESM和CommonJS

`rollup.config.js`


- **esbuild**

性能好；构建速度极快；配置简单；支持TypeScript

``` js
// build.ts
import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  splitting: true,
  minify: true,
  sourcemap: true,
  target: ['es2019'],
  plugins: [sassPlugin()],
  external: ['react', 'react-dom'],
}).catch(() => process.exit(1));
```


- **tsup**

优点：
1. 配置极简
2. 开箱即用：内置TypeScript支持，自动生成.d.ts文件，内置压缩和Tree-shaking，支持CSS/SCSS处理
3. 构建速度快：基于esbuild，性能优秀；比Rollup和Webpack快很多；适合小到中型组件库；配置简单，维护成本低；满足基本打包需求

缺点：
1. 配置灵活性较差：无法像Rollup那样精细控制打包过程；插件生态不如Rollup丰富
2. 特殊需求支持有限：复杂的代码分割场景支持不够；自定义转换能力有限
3. CSS处理能力一般：CSS Modules支持不够完善；样式处理选项较少

``` ts
// tsup.config.js
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
```

- **webpack**

优点：功能最完整，生态最丰富，配置最灵活

缺点：配置较复杂，打包速度相对较慢

| 特性 | tsup | Rollup | Vite | esbuild | webpack |
|------|------|---------|------|----------|---------|
| 配置难度 | 极简 | 中等 | 简单 | 简单 | 复杂 |
| 构建速度 | 快 | 中等 | 快 | 极快 | 慢 |
| 功能完整度 | 基础够用 | 完善 | 完善 | 基础 | 最完善 |
| 插件生态 | 一般 | 丰富 | 丰富 | 有限 | 极其丰富 |
| TypeScript | 开箱支持 | 需配置 | 好 | 原生支持 | 需配置 |
| 适用场景 | 小型库 | 类库 | 组件库/应用 | 工具库 | 大型应用 |
| 学习成本 | 极低 | 中等 | 低 | 低 | 高 |




### ui组件库怎么实现在项目中的按需加载？

目前 UI 组件库的配置已经支持按需加载了，主要是通过以下方式实现：

1. 使用方式：
```ts
// 按需引入组件和样式
import { Button } from '@verney/ui';
import '@verney/ui/dist/lib/styles/index.css';
 ```

2. 配置支持：
- package.json 中已配置了 sideEffects，确保了样式文件不会被 tree-shaking
- 构建配置中启用了 preserveModules，保留了模块结构
- exports 字段正确配置了组件和样式的导出路径
这样在项目中使用时，打包工具会自动进行 tree-shaking，只打包实际使用到的组件代码。




### Docs和Storybook样式隔离？及其原理？

**差异：**
- docs 基于 Nextra 构建，`主要面向最终用户的使用文档`；而 Storybook `更侧重于组件开发过程中的调试和测试`
- docs 支持 MDX 格式，可以更好地整合文档和示例；Storybook 使用独立的 stories 文件管理示例
- docs 的样式继承自文档站点；Storybook 提供了独立的预览环境


**样式隔离：**
- docs 项目目前没有实现完全的样式隔离，组件样式可能会受到文档站点样式的影响
- Storybook 通过 iframe 实现了天然的样式隔离，每个组件故事都在独立的环境中运行

如果要在 docs 中实现样式隔离，可以考虑：
1. 使用 CSS Modules 或 CSS-in-JS 方案
2. 为组件示例添加独立的样式作用域
3. **使用 Shadow DOM 实现完全的样式隔离**






## 问题记录


### 依赖引用问题

- 场景1：比如有一个mpnorepo库，在ui库下需要用到一些依赖，这些依赖又是在其他子库下会用到，所有这些依赖就安装在根目录的pkg里了，但打包的时候这些依赖是怎么打包到ui库里的呢？因为使用的时候只会安装该ui库，不会安装该monorepo项目根目录下的pkg文件



### 样式问题

- 组件预览，样式隔离

- 样式不一致

- 组件库的样式重置是在哪里设置的？

- 样式文件单独打包？








## 收藏


参考项目：
- web-component组件库：[Pnpm + Turbo 搭建 Web Component Monorepo 组件库](https://juejin.cn/post/7353963878541230120)、[stencil-component-ui](https://github.com/WebJeffery/stencil-component-ui)
- [从零到一使用 turborepo + pnpm 搭建企业级 Monorepo 项目](https://juejin.cn/post/7343156956665839651)、[create-neat](https://github.com/xun082/create-neat)
- [Turborepo：发布当月就激增 3.8k Star，这款超神的新兴 Monorepo 方案，你不打算尝试下吗？](https://juejin.cn/post/7129267782515949575)、[turborepo-template](https://github.com/ErKeLost/turborepo-template)

- [turborepo:examples](https://github.com/vercel/turborepo/tree/main/examples)
- [sonner](https://github.com/emilkowalski/sonner)
- [heroui](https://github.com/heroui-inc/heroui)
- [shadcn-ui](https://github.com/shadcn-ui/ui)



所有框架都适用，基于 TailwindCSS 的组件库：
- [daisyui](https://github.com/saadeghi/daisyui)
- [TW-Elements](https://github.com/mdbootstrap/TW-Elements)
- [headlessui](https://github.com/tailwindlabs/headlessui)






## 参考

- [用Pnpm+Turbo实现一个前后端共享api的Todos项目](https://juejin.cn/post/7358306245349507098)
- [一个基于Turbo、Vue3.5+、TypeScript5+的 Monorepo 组件库模板项目，帮助快速搭建属于自己/企业级的组件库](https://juejin.cn/post/7440747801473122313)
- [可能是最详细的React组件库搭建总结](https://blog.csdn.net/weixin_41697143/article/details/129012375)