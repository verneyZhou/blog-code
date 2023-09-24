---
title: vue3+vite+ts 从0到1项目搭建
date: 2021-11-14 09:02:03
# permalink: false # 89d3e4/
categories: 
  - vue
tags: 
  - vue3
  - vite
  - ts
permalink: false # 7b5278/
---



# vue3+vite+ts 从0到1项目搭建

::: tip 技术栈
vue3、vite2、typescript、element-plus、vuex4、vue-router4
:::


- [项目Github地址](https://github.com/verneyZhou/vue3-vite-admin)
- [项目线上地址](https://www.verneyzhou-code.cn/vite-admin)


## 前言

### 什么是 Vite

Vite 是一种新型前端构建工具，能够显著提升前端开发体验。

它主要由两部分组成：

- 一个开发服务器，它基于 `原生 ES 模块` 提供了 丰富的内建功能，如速度快到惊人的 `模块热更新（HMR）`。

- 一套构建指令，它使用 `Rollup` 打包你的代码，并且它是预配置的，可以输出用于生产环境的优化过的静态资源。


::: tip 特点
- 快速的冷启动
- 即时的模块热更新
- 真正的按需编译
:::


### ESM

`script module` 是 ES 模块在浏览器端的实现，目前主流的浏览器都已经支持；其最大的特点是在浏览器端使用 `export、import` 的方式导入和导出模块，在 `script` 标签里设置 `type="module"`:
``` js
<script type="module">
  import { createApp } from './main.js‘;
  createApp();
</script>
```
浏览器会识别添加 `type="module"`的 `<script>` 元素，浏览器会把这段内联 `script` 或者外链 `script` 认为是 `ECMAScript` 模块，浏览器将对其内部的 `import` 引用发起 `http` 请求获取模块内容。



### 为什么选择Vite?

Vite 以 原生 ESM 方式服务源码。这实际上是让浏览器接管了打包程序的部分工作：
> Vite 只需要在浏览器请求源码时进行转换并按需提供源码。根据情景动态导入的代码，即只在当前屏幕上实际使用时才会被处理。

[参考](https://vitejs.cn/guide/why.html)


### 准备

node 版本: `>= 12.0.0`

[vue3官方文档](https://v3.cn.vuejs.org/api/)

[element-plus官方文档](https://element-plus.gitee.io/zh-CN/guide/quickstart.html#full-import)

[vite官方文档](https://vitejs.cn/guide/)

[typescript文档](https://www.tslang.cn/index.html)


::: tip 本项目版本信息说明
- vite: `v2.6.4`
- vue: `v3.2.16`
- vue-router: `v4.0.12`
- vuex: `v4.0.2`
- element-plus: `v1.1.0-beta.24`
- typescript: `v4.4.3`
:::


[项目预览](12345)

## 创建项目

1. 初始化：`npm init @vitejs/app`

2. 按照提示流程操作即可，这里自定义项目名称为`vue3-vite-admin`，选择 `vue-ts`

3. `cd vue3-vite-admin、npm install、npm run dev`

你还可以通过附加的命令行选项直接指定项目名称和你想要使用的模板:

```shell
# 要构建一个 Vite + Vue + ts 项目
# npm 7+（需要额外的双横线）
npm init @vitejs/app vue3-vite-admin -- --template vue-ts
```

## 项目配置

`npm run dev` 会执行 `vite` 命令，当以命令行方式运行 `vite` 时，`Vite` 会自动解析 项目根目录 下名为 `vite.config.ts` 的文件。

[vite.config.ts配置参考](https://vitejs.cn/config/)


### 项目目录

```
├── publish/
└── src/
    ├── assets/ // 静态资源目录
    ├── common/ // 通用类库目录
    ├── components/ // 公共组件目录
    ├── router/ // 路由配置目录
    ├── store/ // 状态管理目录
    ├── styles/ // 通用 CSS 目录
    ├── types/ // ts接口自定义
    ├── services/ // 接口配置
    ├── utils/ // 工具函数目录
    ├── views/ // 页面组件目录
    ├── App.vue
    ├── main.ts
    ├── shims-vue.d.ts // ts适配文件
├── tests/ // 单元测试目录
├── index.html // 入口
├── tsconfig.json // TypeScript 配置文件
├── vite.config.ts // Vite 配置文件
└── package.json
```


### 支持typescript

Vite 支持开箱即用地引入 .ts 文件， [官方参考](https://vitejs.cn/guide/features.html#typescript)。

Vite 仅执行 .ts 文件的翻译工作，并 不 执行任何类型检查。并假设类型检查已经被你的 IDE 或构建过程接管了。
>你可以在构建脚本中运行 `tsc --noEmit` 或者安装 `vue-tsc` 然后运行 `vue-tsc --noEmit` 来对你的 `*.vue` 文件做类型检查。

> Vite 使用 `esbuild` 将 `TypeScript` 翻译到 JavaScript，约是 `tsc` 速度的 `20~30` 倍，同时 HMR 更新反映到浏览器的时间小于 50ms。


- tsconfig.json

如果一个目录下存在一个`tsconfig.json`文件，那么它意味着这个目录是`TypeScript`项目的根目录。 `tsconfig.json`文件中指定了用来编译这个项目的根文件和编译选项。

[tsconfig.json配置参考](https://www.tslang.cn/docs/handbook/compiler-options.html)


- shims-vue.d.ts

新建`src/shims-vue.d.ts`文件，用于识别`.vue`类型文件:
``` ts
/**
 * shims-vue.d.ts的作用
 * 为了 typescript 做的适配定义文件，因为.vue 文件不是一个常规的文件类型，ts 是不能理解 vue 文件是干嘛的，
 * 加这一段是是告诉 ts，vue 文件是这种类型的。
 * 可以把这一段删除，会发现 import 的所有 vue 类型的文件都会报错。
 */


declare module '*.vue' {
  import { DefineComponent } from 'vue'
  interface Vue {
    // $router: VueRouter; // 这表示this下有这个东西
    // $route: Route;
    $https: any;
    $urls: any;
    $Message: any;
    $Modal: any;
  }
  const component: DefineComponent<{}, {}, Vue, any>
  // const component: DefineComponent<{}, {}, any>
  export default component
}
```

### Vue支持和jsx支持
> Vite 为 Vue 提供第一优先级支持，.jsx 和 .tsx 文件同样开箱即用。

``` ts
// vite.config.ts

import vue from "@vitejs/plugin-vue";
import vueJsx from '@vitejs/plugin-vue-jsx' // 支持jsx语法

export default ({command}: any) => {
  return defineConfig({
       plugins: [
        // 插件
        vue(),
        vueJsx(),
       ]
  })
}
```





### 集成 vue-router、vuex

- `Vue Router 4.0` 提供了 `Vue 3` 支持，[迁移指南](https://next.router.vuejs.org/zh/guide/migration/index.html)
  1. 安装：`npm i vue-router@4 -S`
  2. 创建 `src/router/index.ts` 文件，添加路由
  ``` ts
  // import Router from 'vue-router' // vue2的用法
  import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
    // 还有 createWebHashHistory 和 createMemoryHistory

    const routes: Array<RouteRecordRaw> = [
        {
            path: '/home',
            name: 'Home',
            component: () => import('@/views/home.vue') // 懒加载组件
        }
    ]

  createRouter({
    history: createWebHistory(),
    routes,
  })
  ```

  3. `src/main.ts` 中引入：
  ``` ts
    import { createApp } from 'vue'
    import App from './App.vue'
    const app = createApp(App);

    import router from './router/index'
    app.use(router).mount('#app')

  ```

- `Vuex 4.0` 提供了 `Vue 3` 支持， [迁移指南](https://next.vuex.vuejs.org/zh/guide/migrating-to-4-0-from-3-x.html)
  1. 安装：`npm i vuex@4 -S`
  2. 创建 `src/store/index.ts` 文件
  ``` ts
  import { createStore } from 'vuex'

  export const store = createStore({
    state () {...},
    mutations() {...},
    ...
  })
  ```

  3. `src/main.ts`中引入：
  ``` ts
    import store from './store/index'
    app.use(store).mount('#app')
  ```


### 集成 Element Plus
- element-plus 和 icons 安装: 

`npm i element-plus @element-plus/icons -S`

[参考](https://element-plus.gitee.io/zh-CN/guide/installation.html)

[@element-plus/icons](https://element-plus.gitee.io/zh-CN/component/icon.html)


**全局引入**

``` ts
// src/main.ts

import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);

// 全局引入 element-ui
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";

app.use(ElementPlus, { size: "mini", locale: zhCn })

// 全局注册elment-icon
import * as ElIconModules from '@element-plus/icons'
for(let iconName in ElIconModules){
  let comp = ElIconModules[iconName] || null;
  comp && app.component(comp.name, comp);
}

```



**按需加载**

可引入如下两个插件来实现：

- [vite-plugin-style-import](https://github.com/anncwb/vite-plugin-style-import)
- [vite-plugin-babel-import](https://github.com/0ahz/vite-plugin-babel-import)


### 集成 Axios

- axios安装: `npm i axios -S`
  1. 添加 `src/services/axios.ts` 文件
  ``` ts
    import Axios from "axios";

    const baseURL = "https://api.github.com";

    const axios = Axios.create({
    baseURL,
    timeout: 20000, // 请求超时 20s
    });

    // 前置拦截器（发起请求之前的拦截）
    axios.interceptors.request.use(
    (response) => {
        /**
        * 根据你的项目实际情况来对 config 做处理
        * 这里对 config 不做任何处理，直接返回
        */
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
    );

    // 后置拦截器（获取到响应时的拦截）
    axios.interceptors.response.use(
    (response) => {
        /**
        * 根据你的项目实际情况来对 response 和 error 做处理
        * 这里对 response 和 error 不做任何处理，直接返回
        */
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
    );

    export default axios;

  ```


### 集成 CSS 预编译器 Stylus/Sass/Less

Vite 同时提供了对 `.scss, .sass, .less, .styl` 和 `.stylus` 文件的内置支持。没有必要为他们安装特定的 vite 插件，但相应的预处理器依赖本身必须安装。

如果是用的是单文件组件，可以通过 `<style lang="sass">`（或其他与处理器）自动开启。

> 本项目使用 `CSS` 预编译器 `Less`，直接安装为开发依赖即可。Vite 内部已帮我们集成了相关的 `loader`，不需要额外配置。同理，你也可以使用 `Sass` 或 `Less` 等。 [参考](https://vitejs.cn/guide/features.html#css-%E9%A2%84%E5%A4%84%E7%90%86%E5%99%A8)

```shell
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```


### svg-icons的全局引入

1. 安装：`npm i vite-plugin-svg-icons -D`

2. `vite.config.ts`中添加配置：
``` ts
import viteSvgIcons from 'vite-plugin-svg-icons';
import path from 'path';

export default () => {
  return {
    plugins: [
      viteSvgIcons({
        // 指定需要缓存的图标文件夹
        iconDirs: [
            path.resolve(process.cwd(), 'src/assets/svg/common'),
            path.resolve(process.cwd(), 'src/assets/svg/nav-bar')
        ],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]',
      }),
    ],
  };
};

```

3. `src/assets/svg/`目录下加入添加所有`svg`文件;

4. 添加`svg-icon`组件：`src/components/svg-icon.g.vue`
``` vue
<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
export default defineComponent({
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    return {
      iconName: computed(() => `#icon-${props.iconClass}`),
      svgClass: computed(() => {
        if (props.className) {
          return `svg-icon ${props.className}`
        }
        return 'svg-icon'
      })
    }
  }
})
</script>

<style scope>
.sub-el-icon,
.nav-icon {
    display: inline-block;
    font-size: 15px;
    margin-right: 12px;
    position: relative;
}

.svg-icon {
    position: relative;
    top: -0.07em;
    width: 1em;
    height: 1em;
    fill: currentColor;
    vertical-align: middle;
}
</style>

```
5. 在 `src/main.ts` 内引入:
``` ts
import 'virtual:svg-icons-register'; // 注册脚本
import svgIcon from '@/components/svg-icon.g.vue'

app.component('svg-icon', svgIcon) // 全局注册组件
```

6. 使用：
``` html
<svg-icon icon-class="dashboard"></svg-icon>
<svg-icon icon-class="example"></svg-icon>
<svg-icon icon-class="eye-open"></svg-icon>
```

> 配置参考：[vite-plugin-svg-icons](https://github.com/anncwb/vite-plugin-svg-icons/blob/main/README.zh_CN.md)


### 本地mock接口模拟

这里是通过安装插件 `vite-plugin-mock` 来提供本地和生产模拟服务。

vite 的数据模拟插件，是基于 `vite.js` 开发的。 并同时支持本地环境和生产环境。 `Connect` 服务中间件在本地使用，`mockjs` 在生产环境中使用。

> 要求：`node version: >=12.0.0`， `vite version: >=2.0.0`

1. 安装 mockjs: `npm i mockjs -S`

2. 安装 vite-plugin-mock: `npm i vite-plugin-mock -D`

3. 开发环境使用配置：
> 开发环境是使用 Connect 中间件实现的，与生产环境不同，您可以在 Google Chrome 控制台中查看网络请求记录。

``` ts
// vite.config.ts

import { defineConfig } from "vite";
import { viteMockServe } from 'vite-plugin-mock'

export default ({command}: any) => {
  return defineConfig({
    plugins: [
       viteMockServe({
        supportTs: true, // 打开后，可以读取 ts 文件模块。 请注意，打开后将无法监视.js 文件。
        mockPath: 'mock', // 设置模拟.ts 文件的存储文件夹: 根目录下 mock/ 文件夹
        localEnabled: command === 'serve', // 设置是否启用本地 xxx.ts 文件，不要在生产环境中打开它.设置为 false 将禁用 mock 功能
        prodEnabled: command !== 'serve', // 设置打包是否启用 mock 功能
        injectCode: `
          import { setupProdMockServer } from './mockProdServer';
          setupProdMockServer();
        `, // 如果生产环境开启了 mock 功能,即prodEnabled=true.则该代码会被注入到injectFile对应的文件的底部; 这样做的好处是,可以动态控制生产环境是否开启 mock 且在没有开启的时候 mock.js 不会被打包。如果代码直接写在main.ts内，则不管有没有开启,最终的打包都会包含mock.js
        injectFile:`path.resolve(process.cwd(), 'src/main.{ts,js}')`, // injectCode代码注入的文件,默认为项目根目录下src/main.{ts,js}
        logger: true // 是否在控制台显示请求日志
      })
    ],
  })
}
```

4. 生产环境配置：创建`mockProdServer.ts` 文件
``` ts
// src/mockProdServer.ts

// 在生产环境中使用
import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer'

// 使用 import.meta.glob功能来进行全部导入
const modulesFiles = import.meta.globEager('../mock/*.ts')
const modules: Array<any> = []
for (const path in modulesFiles) {
  modules.push(...modulesFiles[path].default)
}

export function setupProdMockServer() {
  createProdMockServer(modules)
}
```

5. 添加接口：

``` ts
// mock/user.ts

import { MockMethod } from 'vite-plugin-mock' // 引入 MockMethod 接口

export default [
  {
    url: '/api/user/info', // 添加获取用户信息的接口，并自定义返回信息
    method: 'get',
    response: () => {
        return {
            code: 0,
            flag: 1,
            data: {
                username: 'admin',
                password: '123456',
                avatar: 'https://img2.bosszhipin.com/boss/avatar/avatar_15.png',
                roles: ['admin'],                
            }
        }
      },
  },
] as MockMethod[]

```

6. 最后，重新`npm run serve`，就可以本地模拟服务了~

::: tip 注意
无法在 mock.ts 文件中使用 node 模块，否则生产环境将失败

模拟数据如果用于生产环境，仅适用于某些测试环境。 不要在正式环境中打开它，以避免不必要的错误。 同时，在生产环境中，它可能会影响正常的 Ajax 请求，例如文件上传/下载失败等。
:::

参考：
1. [在vite项目中使用mock数据-vite-plugin-mock](https://blog.csdn.net/weixin_42067720/article/details/115579817)
2. [vite-plugin-mock](https://github.com/anncwb/vite-plugin-mock)


### 传统浏览器兼容性支持

[@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

1. 安装插件：` npm i @vitejs/plugin-legacy -D`

2. 配置：
``` ts
// vite.config.js
import legacy from '@vitejs/plugin-legacy'

export default {
  plugins: [
     legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ]
}
```



### 依赖预构建配置

当 `npm run dev`的时候，一般会有类似的提示：
``` shell
Pre-bundling dependencies: # 侦测到可优化的依赖
  vue
  element-plus
  element-plus/es/locale/lang/zh-cn
  @element-plus/icons
  vue-router
  (...and 5 more)
Pre-bundling them to speed up dev server page load...  # 将预构建它们以提升开发服务器页面加载速度
(this will be run only when your dependencies have changed)  # 这将只会在你的依赖发生变化时执行
```
这就是 Vite 执行的所谓的**依赖预构建**：Vite 将有许多内部模块的 ESM 依赖关系转换为单个模块，以提高后续页面加载性能。
> 一些包将它们的 ES 模块构建作为许多单独的文件相互导入。例如，`lodash-es` 有超过 600 个内置模块！当我们执行 `import { debounce } from 'lodash-es'` 时，浏览器同时发出 600 多个 HTTP 请求！尽管服务器在处理这些请求时没有问题，但大量的请求会在浏览器端造成网络拥塞，导致页面的加载速度相当慢。通过预构建 `lodash-es` 成为一个模块，我们就只需要一个 HTTP 请求了！

Vite 会将预构建的依赖缓存到 `node_modules/.vite`。

想显式地从列表中包含/排除依赖项, 可使用 `optimizeDeps` 进行配置:

``` ts
// vite.config.ts

optimizeDeps: { // 依赖优化
    include: ['element-plus/lib/locale/lang/zh-cn', 'element-plus/lib/locale/lang/en']
}
```
> include 和 exclude 都可以用来处理这个问题。如果依赖项很大（包含很多内部模块）或者是 CommonJS，那么你应该包含它；如果依赖项很小，并且已经是有效的 ESM，则可以排除它，让浏览器直接加载它。

[依赖预构建](https://vitejs.cn/guide/dep-pre-bundling.html)


### 引入 VueUse

[VueUse](https://vueuse.org/guide/) 是为Vue 2和3服务的一套Vue Composition API的常用工具集,它的初衷就是将一切原本并不支持响应式的JS API变得支持响应式。

安装：`npm i @vueuse/core -S`
> From `v6.0`, VueUse requires `vue >= v3.2` or `@vue/composition-api >= v1.1`





## 其他配置

### 环境变量与模式

默认情况下，开发服务器 (serve 命令) 运行在 development （开发）模式，而 build 命令运行在 production （生产）模式。

这意味着当执行 `vite build` 时，它会自动加载 `.env.production` 中可能存在的环境变量。

所以可以修改`npm run dev`的命令：`vite --mode dev`，再在根目录下新建`.env.dev`文件，就会自动加载该文件中的环境变量：
```
<!-- .env.dev -->

# 定义的变量必须以VITE_开头

VITE_APP_ENV = 'dev'
VITE_APP_BASE_URL = 'https://www.baidu.com/'
VITE_APP_BASE_WS_URL = '/dev/'
VITE_SELF_ENV = 'dev'
SELF_ENV = 'local' # 不会生效
```
之后就可以在项目中通过`import.meta.env`获取设置的环境变量:
``` js
// BASE_URL, DEV, MODE, SSR 为默认就有的环境变量
{
    BASE_URL: "/"
    DEV: true // 是否运行在开发环境
    MODE: "dev" // 取启动服务时 --mode 的值
    PROD: false // 是否运行在生产环境
    SSR: false
    VITE_APP_BASE_URL: "https://www.baidu.com/"
    VITE_APP_BASE_WS_URL: "/dev/"
    VITE_APP_ENV: "dev"
    VITE_SELF_ENV: "dev"
}
```

[环境变量与模式](https://vitejs.cn/guide/env-and-mode.html)



### resolve.alias配置

``` ts
// vite.config.ts

resolve: {
    alias: {
    "@": path.resolve(__dirname, "src"), // 设置 @ 指向 src 目录
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'] // 导入时想要省略的扩展名列表
},
```
[resolve-alias](https://vitejs.cn/config/#resolve-alias)


### Server 配置

[Server Options](https://vitejs.cn/config/#server-options)

``` ts
// vite.config.ts

server: {
    port: 8091, // 设置服务启动端口号
    open: true, // 设置服务启动时是否自动打开浏览器
    cors: true, // 允许跨域
    proxy: { // 代理

    },
},
```

### css的全局变量配置

[css.preprocessorOptions](https://vitejs.cn/config/#css-preprocessoroptions)

``` js
// vite.config.ts

// 指定传递给 CSS 预处理器的选项
css: {
    preprocessorOptions: {
    less: {
        additionalData: `@import "@/styles/variables.less";` // 添加变量，之后就可以在项目直接使用了
    },
    
    }
},
```

### build打包配置

[build-options](https://vitejs.cn/config/#build-options)



### .gitigonre
> 告诉Git哪些文件不需要添加到版本管理中

```
node_modules
.DS_Store
dist
dist-ssr
*.local
```




## 代码规范

### 集成 Prettier 配置

[Prettier](https://prettier.io/) 是一款强大的代码格式化工具，支持 JavaScript、TypeScript、CSS、SCSS、Less、JSX、Angular、Vue、GraphQL、JSON、Markdown 等语言，基本上前端能用到的文件格式它都可以搞定，是当下最流行的代码格式化工具。


VSCode 编辑器使用 Prettier 配置需要下载插件 Prettier: `Code formatter`

1. 安装：`npm i prettier -D`
2. 在根目录下创建 `.prettierrc` 文件，配置
3. 格式化所有文件（. 表示所有文件）: `npx prettier --write`



### 集成 ESLint 配置
> ESLint 是一款用于查找并报告代码中问题的工具，并且支持部分问题自动修复。其核心是通过对代码解析得到的 AST（Abstract Syntax Tree 抽象语法树）进行模式匹配，来分析代码达到检查代码质量和风格问题的能力。

VSCode 使用 ESLint 配置文件需要去插件市场下载插件 ESLint 。

1. 安装：`npm i eslint -D`
2. 执行`npx eslint --init`配置 ESlint
``` shell
vue3-vite-admin npx eslint --init
✔ How would you like to use ESLint? · style # To check syntax, find problems, and enforce code style
✔ What type of modules does your project use? · esm # JavaScript modules (import/export)
✔ Which framework does your project use? · vue
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser, node #  browser, node都选择
✔ How would you like to define a style for your project? · guide # Use a popular style guide
✔ Which style guide do you want to follow? · airbnb # 这里有三种风格可供选择：Airbnb、Standard、Google，这里选了 airbnb
✔ What format do you want your config file to be in? · JavaScript
✔ Would you like to install them now with npm? · No / Yes
```
> 自动安装失败就手动安装：
`npm i @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-airbnb-base eslint-plugin-import eslint-plugin-vue -D`

- `@typescript-eslint/parser`: `ESLint`的解析器，用于解析`TypeScript`，从而检查和规范`TypeScript`代码。
- `@typescript-eslint/eslint-plugin`: 作为 eslint 默认规则的补充，提供了一些额外的适用于 ts 语法的规则。
- `@vue/prettier/@typescript-eslint`：使得`@typescript-eslint`中的样式规范失效，遵循prettier中的样式规范，需要放在最后一项。 




3. 安装成功后，根目录下会自动生成 `.eslintrc.js` 文件
    > 根据项目实际情况，如果我们有额外的 ESLint 规则，也在此文件中追加
4. 根目录下新增 `.eslintignore` 文件
5. 可在 `vscode` 的 `settting.json` 中添加自动修复指令：
``` json
 "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
 }
```
6. 可在 package.json 中添加命令：
``` json
"lint": "eslint --ext .js,.vue src",
"lint:fix": "eslint --ext .ts,.vue src --fix"
```


7. 解决 Prettier 和 ESLint 的冲突
    - npm i eslint-plugin-prettier eslint-config-prettier -D
        - `eslint-plugin-prettier`: 将 Prettier 的规则设置到 ESLint 的规则中；
        - `eslint-config-prettier`: 关闭 ESLint 中与 Prettier 中会发生冲突的规则。
        
    - 在 .eslintrc.js 添加 prettier 插件
    ``` js
    module.exports = {
    ...
    extends: [
        'plugin:vue/essential',
        'airbnb-base',
        'plugin:prettier/recommended' // 添加 prettier 插件
    ],
    ...
    }
    ```
    形成优先级：Prettier 配置规则 > ESLint 配置规则




### 集成 husky 和 lint-staged
> 我们在项目中已集成 ESLint 和 Prettier，来规范我们的代码，但团队里有人按自己的一套风格来写代码，或者干脆禁用掉这些工具，开发完成就直接把代码提交到了仓库，规范就没有什么作用。

> 所以，可以做一些限制，让没通过 ESLint 检测和修复的代码禁止提交，从而保证仓库代码都是符合规范的。

- husky —— Git Hook 工具，可以设置在 git 各个阶段（pre-commit、commit-msg、pre-push 等）触发我们的命令
    > 在本地执行 git commit 的时候，就对所提交的代码进行 ESLint 检测和修复（即执行 eslint --fix），如果这些代码没通过 ESLint 规则校验，则禁止提交。
- lint-staged —— 在 git 暂存的文件上运行 linters。
    > 只用 ESLint 修复自己此次写的代码，而不去影响其他的代码


### 提交规范

- commit message 格式规范

- 集成 Commitizen 实现规范提交
    > Commitizen 是一个帮助撰写规范 commit message 的工具。它有一个命令行工具 cz-cli。



## 单元测试

- ` vue-test-utils` + `jest`


- [vitest](https://cn.vitest.dev/guide/)

- [Jest](https://jestjs.io/zh-Hans/)
## 自动部署

GitHub Actions



## vite.config.js

``` ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from '@vitejs/plugin-vue-jsx' // 支持jsx语法
import viteSvgIcons from 'vite-plugin-svg-icons' // 导入svg-icon
import { viteMockServe } from 'vite-plugin-mock' // mock
import legacy from '@vitejs/plugin-legacy' // 为打包后的文件提供传统浏览器兼容性支持

import setting from './src/settings'
const prodMock = setting.openProdMock

import path from "path";

// 配置参考：https://vitejs.cn/config/

export default ({command, mode}: any) => {

  console.log('===command', command, mode);

  return defineConfig({
    base: "./", // 打包路径
    define: {
      // 解决报错：Uncaught ReferenceError: process is not defined
      'process.platform': null,
      'process.version': null
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // 设置 @ 指向 src 目录
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'] // 导入时想要省略的扩展名列表
    },
    server: {
      port: 8091, // 设置服务启动端口号
      open: true, // 设置服务启动时是否自动打开浏览器
      cors: true, // 允许跨域
      // proxy: { // 代理
  
      // },
    },
    // 指定传递给 CSS 预处理器的选项
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "@/styles/variables.less";`
        },
        
      }
    },
    plugins: [
      // 插件
      vue(),
      vueJsx(),
      legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      }),
      viteSvgIcons({
        // config svg dir that can config multi
        iconDirs: [
          path.resolve(process.cwd(), 'src/assets/svg/common'),
          path.resolve(process.cwd(), 'src/assets/svg/nav-bar')
        ],
        // appoint svg icon using mode
        symbolId: 'icon-[dir]-[name]'
      }),
      viteMockServe({
        supportTs: true, // 打开后，可以读取 ts 文件模块。 请注意，打开后将无法监视.js 文件。
        mockPath: 'mock', // 设置模拟.ts 文件的存储文件夹: 根目录下 mock/ 文件夹
        localEnabled: command === 'serve', // 设置是否启用本地 xxx.ts 文件，不要在生产环境中打开它.设置为 false 将禁用 mock 功能
        prodEnabled: command !== 'serve' && prodMock, // 设置打包是否启用 mock 功能
        injectCode: `
          import { setupProdMockServer } from './mockProdServer';
          setupProdMockServer();
        `, // 如果生产环境开启了 mock 功能,即prodEnabled=true.则该代码会被注入到injectFile对应的文件的底部; 这样做的好处是,可以动态控制生产环境是否开启 mock 且在没有开启的时候 mock.js 不会被打包。如果代码直接写在main.ts内，则不管有没有开启,最终的打包都会包含mock.js
        injectFile:`path.resolve(process.cwd(), 'src/main.{ts,js}')`, // injectCode代码注入的文件,默认为项目根目录下src/main.{ts,js}
        logger: true // 是否在控制台显示请求日志
      })
    ],
    build:{ // 构建
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 2000,
    },
    optimizeDeps: { // 依赖预构建优化
      include: ['element-plus/lib/locale/lang/zh-cn', 'element-plus/lib/locale/lang/en']
    }
  });  
}

```



## 功能

### 动态路由与权限校验

添加权限校验和动态路由的配置：
``` js
// src/permission.ts

// 路由加载之前
router.beforeEach(async (to: any, from, next: any) => {
  // 开始加载
  if (settings.isNeedNprogress) NProgress.start() 
  // 设置标题
  document.title = getPageTitle(to.meta.title)

  /*
   * 过滤动态路由
   * 1.是否有token
   * 2.判断用户权限, 筛选动态路由
   * */
  const hasToken: string = settings.isNeedLogin ? getToken() : 'temp_token'
  // 是否有token
  if (hasToken) {
    if (to.path === '/login') {
      // 已登录，重定向到首页
      next({ path: '/' })
    } else {
      //是否获取过用户信息
      const isGetUserInfo: boolean = store.state.permission.isGetUserInfo
      if (isGetUserInfo) { // 已获取用户信息，放行
        next()
      } else { // 还未获取用户信息
        try {
          let accessRoutes = []
          if (settings.isNeedLogin) { // 需要登录
            // 获取用户角色信息
            const { roles } = await store.dispatch('user/getInfo')
            // 传入用户角色，获取筛选后的路由
            console.log('====roles', roles);
            accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          } else { // 无需登录
            accessRoutes = asyncRoutes // 不用筛选动态路由
            store.commit('permission/M_routes', accessRoutes) // 保存
          }
          
          // 添加路由
          accessRoutes.forEach((route: RouterRowTy) => {
            router.addRoute(route)
          })
          
          // 已经获取用户信息
          store.commit('permission/M_isGetUserInfo', true)
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (err) {
          // 报错则重置token
          await store.dispatch('user/resetToken')
          // 重定向到登录页
          next(`/login?redirect=${to.path}`)

          if (settings.isNeedNprogress) NProgress.done()
        }
      }
    }
  } else { // 无token
    // 判断路由
    if (whiteList.indexOf(to.path) !== -1) { // 无需登录，放行
      next()
    } else { // 否则直接跳至登录页，传入回调链接
      next(`/login?redirect=${to.path}`)

      if (settings.isNeedNprogress) NProgress.done()
    }
  }
})
```
> 详细配置见项目代码~

### 导航

面包屑导航、`tags-view`


### 流程图

插件: `npm i @logicflow/core @logicflow/extension vue-json-pretty@next -S`
> [@logicflow/core](http://logic-flow.org/)是滴滴开源的流程可视化插件

> [vue-json-pretty](https://github.com/leezng/vue-json-pretty)是 json 代码高亮显示插件


[参考项目](https://github.com/xiaoxian521/vue-pure-admin)



### 右键菜单

`npm i v-contextmenu@next -S`
> [v-contextmenu](https://heynext.xyz/v-contextmenu/)，适用于 Vue 3.0 的 Contextmenu 组件。


### 主题配置

https://github.com/anncwb/vue-vben-admin/blob/main/README.zh-CN.md


### 其他

- [Echarts](https://echarts.apache.org/zh/index.html)

- 编辑器
> [wangeditor](https://www.wangeditor.com/), Typescript 开发的 Web 富文本编辑器， 轻量、简洁、易用、开源免费

> [quill](http://doc.quilljs.cn/1409423)，Quill是一个跨平台的功能强大的富文本编辑器


- 国际化




## 备注

### pinia
> `pinia`: 一个`vue3+ts`项目中可以替换`vuex`的更加轻量的插件

[官方文档](https://pinia.esm.dev/)




## 问题记录

- `npm run build`打包报错:

```
[rollup-plugin-dynamic-import-variables] Unexpected token (15:20)
file: /Users/admin/my-code/self/byme/vue3-study/vue3-vite-admin/src/main.ts:15:20
error during build:
SyntaxError: Unexpected token (15:20)
    at Parser.pp$5.raise (/Users/admin/my-code/self/byme/vue3-study/vue3-vite-admin/node_modules/rollup/dist/shared/rollup.js:19495:13)
    at Parser.pp.unexpected (/Users/admin/my-code/self/byme/vue3-study/vue3-vite-admin/node_modules/rollup/dist/shared/rollup.js:16820:8)
    at Parser.pp.expect (/Users/admin/my-code/self/byme/vue3-study/vue3-vite-admin/node_modules/rollup/dist/shared/rollup.js:16814:26)
```
> 原因是在`main.ts`中执行了`console.log('=====import.meta.env', import.meta.env);`，把它注释即可, 至于原因，暂时无解~


## 收藏

- [ A curated list of awesome things related to Vite.js](https://github.com/vitejs/awesome-vite)
- [vue-vben-admin](https://github.com/anncwb/vue-vben-admin/blob/main/README.zh-CN.md)
- [vue-pure-admin](https://github.com/xiaoxian521/vue-pure-admin)
- [vue3-admin-ts](https://github.com/jzfai/vue3-admin-ts)



## 参考

- [从 0 开始手把手带你搭建一套规范的 Vue3.x 项目工程环境](https://juejin.cn/post/6951649464637636622)
- [vue3+vite2+elementPlus 的新一代的前端框架，It's fast!](https://juejin.cn/post/7016911278849409031)



<fix-link label="Back" href="/skills/"></fix-link>

<!-- 2021-11-13 -->