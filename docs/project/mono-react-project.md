---
title: MonoRepo——React项目实践
date: 2023-09-11 19:56:00
permalink: false
categories:
  - MonoRepo
  - React
tags:
  - MonoRepo
  - React
  - 工程化
---

# MonoRepo——React项目实践


[github项目地址](https://github.com/verneyZhou/teach-react-mono/tree/master)

## MonoRepo

**单仓库多模块应用**

随着业务复杂度的提升，模块仓库越来越多，MultiRepo（多仓库多模块）这种方式虽然从业务上解耦了，但增加了项目工程管理的难度，随着模块仓库达到一定数量级，会有几个问题：
1. 跨仓库代码难共享；
2. 分散在单仓库的模块依赖管理复杂（底层模块升级后，其他上层依赖需要及时更新，否则有问题）；
3. 增加了构建耗时。

于是将多个项目集成到一个仓库下，共享工程配置，同时又快捷地共享模块代码，成为趋势，这种代码管理方式称之为 MonoRepo。

**项目功能分离 和 避免重复代码**

在 Monorepo 中，我们可以对每个拆离出来的项目进行一套单独的配置，他们彼此之间互不影响，但是又可以通过总体的配置来互相结合和引用，从而达到协作的效果。




> 以下指南需配合上方github完整代码食用~

## 项目目录


```

└── packages
    ├── apps  // 项目目录
        ├── back-end   // 后端node项目
            ...
        ├── react-x    // 前端react项目
            ├── src
                 ├── components // 组件
                 ├── pages  // 页面
                 ├── router // 路由
                 ├── index.tsx  // 入口
            ├── package.json // 配置信息
        ├── vue-x    // 前端vue项目
            ...
    ├── components // 公共组件目录
        ├── react-app-components    // 前端react组件库
            ├── script       // 打包配置
            ├── src          // 组件
            ├── package.json // 组件库配置信息
        ├── vue-app-components    // 前端vue组件库  
            ...
    ├── libs // 工具库
        ├── index.js
        ├── utils
        ├── package.json // 工具库配置信息
├── .eslintrc.json // eslint配置
└── package.json // 脚本配置文件

```


## 项目搭建

> node版本 >= v16+; 

> 包管理工具：pnpm（可以添加软链~）

- mkdir teach-react-mono
- pnpm init
- 新建 `pnpm-workspace.yaml`
- 新建`packages/`, 创建文件夹：
  1. apps: web 项目
  2. components: 组件库
  3. libs: 工具

- 添加软连接：
``` sh
➜  teach-react-mono `pnpm add  @proz/utils --filter @proz/react-x`
```
> 之后在 `packages/app/react-x`的`package.json`中就会增加一个软连：
``` json
"dependencies": {
    "@proz/utils": "workspace:^1.0.0"
  }
```

- `package.json`中添加`"type": "module"`

- 之后在`react-x`中引入:

``` js
import { getRandom } from "@proz/utils";
```
> 即可在项目中使用我们本地开发的库



- 如果说要自己构建：
packages/libs/utils:  `npm link`
packages/apps/react-x: `npm link @proz/utils`



### 配置eslint：
> 一般多用代码的检测（逻辑、功能）

``` sh
➜  teach-react-mono `pnpm add eslint -w -D`

➜  teach-react-mono `npx eslint --init`
You can also run this command directly using 'npm init @eslint/config'.
Need to install the following packages:
  @eslint/create-config
Ok to proceed? (y) y
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · none
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser
✔ What format do you want your config file to be in? · JSON
The config that you've selected requires the following dependencies:

@typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
✔ Would you like to install them now? · No / Yes
✔ Which package manager do you want to use? · pnpm
Installing @typescript-eslint/eslint-plugin@latest, @typescript-eslint/parser@latest
Packages: +28
++++++++++++++++++++++++++++
Progress: resolved 126, reused 117, downloaded 9, added 28, done
```

- 自动安装失败可手动装：

`pnpm add @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest -D -w`


- 添加`.eslintrc.json`文件



### 安装prettier
> 一般多用代码美化

1. vscode安装插件：`Prettier - Code formatter`

2. 根目录下新建`.prettierrc.json`

3. `pnpm add eslint-plugin-prettier eslint-config-prettier -D -w`
>  prettier 可能和 eslint 有冲突



### typescript配置

- 安装ts: `pnpm add typescript -D`
- `app/react-x`目录下初始化：`tsc --init`
- 配置`tsconfig.json`

``` json
{
  "compilerOptions": {
    /* Language and Environment */
    "target":"es2016",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "react",
    "experimentalDecorators": true, // 装饰器
    "emitDecoratorMetadata": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true, // 允许使用json文件
    "allowJs": true,
    "noEmit": true,  // 不输出文件，只做类型检查
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true      
  },
  "include": [
    "./src/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
```



Q: `tsc, ts-loader, @babel/preset-typescript` 有什么区别？

> `ts-loader`在内部调用了 `typescript` 的官方编译器 `tsc`, 所以 `ts-loader` 和 `tsc` 是可以共用 `tsconfig.json`; 

> `@babel/preser-typescript` 只会给你做编译（`ts => js`），不做类型检查; 所以，我们要自己做类型检查，就要用 `tsc` 的配置了。



### 安装webpack打包配置相关

```sh
# ➜  teach-react-mono 根目录下执行：
pnpm add webpack webpack-cli webpack-merge webpack-dev-server @babel/core @babel/preset-react @babel/preset-env @babel/preset-typescript babel-loader css-loader style-loader less less-loader postcss postcss-loader tailwindcss autoprefixer html-webpack-plugin cross-env -D --filter @proz/react-x
```
> 安装完成后，上述插件都安装到了`app/react-x`项目中了~


- 接下来就可以在`react-x`项目中添加 webpack 配置了：

```

  ├── scripts
    ├── webpack.base.js // 基础配置
    ├── webpack.dev.js  // 开发环境配置
    ├── webpack.prod.js // 生产环境配置

```

### 安装react

``` sh
# teach-react-mono 根目录下执行：
pnpm add react react-dom -S --filter @proz/react-x

pnpm add @types/react @types/react-dom @types/react-router -D --filter @proz/react-x
```

> react版本：v18+



### CSS方案


#### CSS In JS

- [emotion](https://github.com/emotion-js/emotion) 
```js
import { css, cx } from 'emotion';
const app = css`
  background-color: blue
`
return (
  <div classname=cx(app)></div>
)
```
- [styled-component](https://github.com/styled-components/styled-components) 
> React里面常用的styled-components库就是CSS in JS的实现。


#### CSS Modules
> CSS Modules 允许我们像 import 一个 JS Module 一样去 import 一个 CSS Module。每一个 CSS 文件都是一个独立的模块，每一个类名都是该模块所导出对象的一个属性。通过这种方式，便可在使用时明确指定所引用的 CSS 样式。并且，CSS Modules 在打包时会自动将 id 和 class 混淆成全局唯一的 hash 值，从而避免发生命名冲突问题。



#### utility-css

- [tailwindcss](https://www.tailwindcss.cn/)
> 原子化css~

``` sh
➜  react-x npx tailwindcss init
```
> 生成 `tailwind.config.js` 文件

vscode安装插件：`Tailwind CSS IntelliSense`


- windicss


Q； 在 tailwindcss 和 windicss 中，我们选择了 tailwind 而不是 windi.
> windi 过于灵活，难以构建有效地标准。


- [headlessui](https://headlessui.com/)
> 提供布局，样式自己写; 有时组件能力都差不多，但是布局和样式差别很大



### 状态管理


- solidJS
- redux
- mobx

- recoil: 原子化
``` sh
pnpm add @types/recoil -D --filter @proz/react-x
```

核心api: atom, selector

缺点：太散了, 不太好管理



### 其他

- 路由

- 国际化

- 组件库
  - antd 
  - headlessui







## 插件开发


### 编写wepback打包插件：zipPlugin
> webpack 本身有一系列的生命周期，通过plugin的形式，在某个生命周期里，调用一些方法: seal, afterEmit emit, compile

可实现如压缩，md转换等...

- 安装jszip
``` sh
pnpm add jszip webpack-sources -D --filter @proz/react-x
```

- `react-x/scripts/`目录下新建`zipPlugin.js`，编写插件;

- `webpack.prod.js`中引入，之后打包就会自动生产`.zip`压缩文件;



### 编写babel插件：consolePugin

- pnpm add @babel/parser @babel/traverse @babel/generator @babel/template -D --filter @proz/react-x


- 编写`consolePugin`插件，`.babelrc`中引入

- `npm run start`,之后在控制台就可以看到打印会带有行列信息~



**webpack插件本质上解决的是工程问题，babel插件解决的是词法问题。**



### postcss插件

比较小众, 如：将主题的颜色配置与项目分离，构建主题颜色设置的 DSL，色卡交给UI同学进行维护。满足颜色主题的标准化。





## Node

> 一般很少用node来写后端，单线程，并发不好


**QPS：Queries Per Second**，顾名思义：“每秒查询率”，是一台服务器每秒能够相应的查询次数，是对一个特定的查询服务器在规定时间内所处理流量多少的衡量标准。

**TPS**：是TransactionsPerSecond的缩写，也就是事务数/秒。它是软件测试结果的测量单位。一个事务是指一个客户机向服务器发送请求然后服务器做出反应的过程。客户机在发送请求时开始计时，收到服务器响应后结束计时，以此来计算使用的时间和完成的事务个数。

单核的CPU只能处理一个线程

后端考虑：扩容，多加几个服务器

前端考虑：在并发情况下，保证我的界面加载性能更好



### 项目搭建
> `app/back-end`是用 node 编写的后端项目；代码用 `esm` 来写，然后用 `Rollup` 将他构建成 `cjs`~


技术栈：`koa + rollup`

``` sh
pnpm add rollup core-js rollup-plugin-babel babelrc-rollup -D --filter back-end

pnpm add @babel/core @babel/preset-env @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties -D  --filter back-end

pnpm add koa koa-bodyparser koa-router  --filter back-end
```



### 鉴权

JWT 鉴权: 本质上是一个标准由三段 base 64 组成:

1. header: `{ alg: "HS256", tye:"JWT" }`

2. payload, 负载，载体: `{ username: 'luyi' }`
> 一般情况下，我们是不放置密码的。

3. signature, 基于这两段，进行一个二次加密，**加盐**。


- 安装插件
``` sh
pnpm add jsonwebtoken --filter back-end
```

- 在`src/utils/jwt.js`中编写`jwt验证、生成token、token验证逻辑`~


- 然后在`src/index.js`入口处调用：

``` js
// src/index.js

import {jwtVerify} from './utils/jwt';

// jwt鉴权
app.use(jwtVerify([
    '/user/login',
    '/user/register'
]))
// 传入白名单接口，其他的都需要token验证~
```



### 其他

- 跨域处理: `ctx.set('Access-Control-Allow-Origin', '*')`

- 装饰器
> 在运行之前，把访问路径、函数收集起来，等到运行时再执行~





## 组件库


- 新建组件库：`packages/components/react-app-components`;


- rollup打包：添加打包配置文件：`srcipts/rollup.config.js`;
> 两种模式：esm, umd

- 打包：`npm run build => rollup -c ./scripts/rollup.config.js`
> 打包之后会生成`esm`和`umd`两种格式的文件~


- src中编写组件，导出；

- 添加软连：

``` sh
# teach-react-mono 目录下
pnpm add @proz/react-omponents --filter @proz/react-x
```
> `@proz/react-omponents`为在`package.json`中定义的组件库名~


之后在 `packages/app/react-x`的`package.json`中就会增加一个软连：
``` json
"dependencies": {
    "@proz/react-omponents": "workspace:^1.0.0",
  }
```

- 使用：

``` js
import {Card} from '@proz/react-omponents'; // 组件库引入
```



### peerDependencies

在组件库的`package.json`中会有如下代码：

``` json
"peerDependencies": {
		"react": "^18.2.0",
		"react-dom": "^18.2.0"
},
```

peerDependencies 的目的是提示宿主环境去安装满足插件 peerDependencies所指定依赖的包; 然后在插件import或者require所依赖的包的时候，永远都是引用宿主环境统一安装的npm包，最终解决插件与所依赖包不一致的问题。


比如：在 MyProject 项目中安装 ProjectA, 而 ProjectA 的 package.json 中有如下代码：

``` json
{
    "peerDependencies": {
        "PackageB": "1.0.0"
    }
}
```
那么，当我们安装 ProjectA 时，它会告诉npm：如果某个package把我列为依赖的话，那么那个package也必需应该有对PackageB的依赖。

即：`npm install PackageA`时，会在 MyProject 项目中生成如下结构：

```
MyProject
|- node_modules
   |- PackageA
   |- PackageB
```

- 举个例子，就拿目前基于react的ui组件库ant-design@3.x来说，因该ui组件库只是提供一套react组件库，它要求宿主环境需要安装指定的react版本。具体可以看它package.json中的配置：

``` json
"peerDependencies": {
    "react": ">=16.0.0",
    "react-dom": ">=16.0.0"
}
```
> 它要求宿主环境安装react@>=16.0.0和react-dom@>=16.0.0的版本，组件中引入的react和react-dom包其实都是宿主环境提供的依赖包。




## 其他

### use API

 
```js
  const scrollRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState(commandMockList.slice(0, 5));

  useEffect(() => {
    // 浏览器中，有五个 observer, mutationObs, intersectionObs, 
    let intersectionObs: IntersectionObserver | undefined = new IntersectionObserver(function(entries) {
        if(entries[0].isIntersecting) {
            setList((list) => [...list, ...commandMockList])
        }
    })

    scrollRef.current && intersectionObs.observe(scrollRef.current);

    return () => {
        scrollRef.current && intersectionObs?.unobserve(scrollRef.current);
        intersectionObs = void 0;
    }
  }, [])

```

#### 类似 useEffect 
```js

function useObserver(fn: (b:boolean) => void, scrollRef: RefObject<HTMLDivElement> ) {
    useEffect(() => {
        // 浏览器中，有五个 observer, mutationObs, intersectionObs, 
        let intersectionObs: IntersectionObserver | undefined = new IntersectionObserver(function(entries) {
            fn(entries[0].isIntersecting);
        })
    
        scrollRef.current && intersectionObs.observe(scrollRef.current);
    
        return () => {
            scrollRef.current && intersectionObs?.unobserve(scrollRef.current);
            intersectionObs = void 0;
        }
      }, [])
    }

const CommandList: FC<Props> = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState(commandMockList.slice(0, 5));

  useObserver((bool: boolean) => {
    bool && setList((list) => [...list, ...commandMockList]);
  }, scrollRef)

  return (
    <div className='flex flex-col'>
        {
            list.map((item, idx) => <CommandData key={item.id + idx} item={item} />)
        }
        {/* 我只要 loading 出来显示了，我就继续加载。 */}
        <div ref={scrollRef}>loading...</div>
    </div>
  )
}

export default CommandList;
```



#### 类似 useState

```js

function useObserver(scrollRef: RefObject<HTMLDivElement> ) {
    const [list, setList] = useState(commandMockList.slice(0, 5));

    useEffect(() => {
        // 浏览器中，有五个 observer, mutationObs, intersectionObs, 
        let intersectionObs: IntersectionObserver | undefined = new IntersectionObserver(function(entries) {
            entries[0].isIntersecting && setList((list) => [...list, ...commandMockList]);
        })
    
        scrollRef.current && intersectionObs.observe(scrollRef.current);
    
        return () => {
            scrollRef.current && intersectionObs?.unobserve(scrollRef.current);
            intersectionObs = void 0;
        }
      }, []);

      return list;
}

const CommandList: FC<Props> = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const list = useObserver(scrollRef)

  return (
    <div className='flex flex-col'>
        {
            list.map((item, idx) => <CommandData key={item.id + idx} item={item} />)
        }
        {/* 我只要 loading 出来显示了，我就继续加载。 */}
        <div ref={scrollRef}>loading...</div>
    </div>
  )
}

export default CommandList;
```



### 埋点与监控

- 接口时序问题：按钮在数据渲染完成前就展示出来；小概率

- 业务分析

- 性能需求



#### 代码埋点

代码埋点最常用，最耗时，最灵活的一种方式。

上报什么信息？
1. 埋点的标志信息，如eventID, eventType
2. 业务自定义信息，比如教育行业，用户年级、教育水平等；
3. 通用设备信息，如：userId，userAgent，diviceId...



怎么上报？
1. 实时上报：业务方调用api后，立即发送上报请求；
2. 延时上报：sdk内部收集上报信息，在浏览器空闲时，统一上报；


#### 无埋点

不是没有埋点，而是不需要研发手动添加

一般会有一个sdk封装好了各种逻辑，业务方直接引用即可~

sdk一般是监听页面所有事件，上报所有点击事件以及元素，然后通过后台分析；

> 诸葛IO, 神策


### 实现

在事件捕获阶段执行
``` js
// 要监听所有元素，应在捕获阶段执行
window.addEventListener('click', (event) => {
    let e = window.event || event;
    let target = e.scrElement || e.target;
    console.log('====target', target);
})


// getXpath
```



- 埋点：是DA同学的需求 data analysics
- 错误监控：是RD的需求  reasearch & development
- 性能：PM, RD的需求





## 备注










