---
title: vue3+vue-cli+ts 项目搭建
date: 2021-11-14 09:02:43
# permalink: false # 21af71/
categories: 
  - vue
tags: 
  - vue3
  - vue-cli
permalink: false # b29339/
---


# vue3+vue-cli+ts 项目搭建

::: tip 技术栈
vue3、@vue/cli、typescript、element-plus、vuex4、vue-router4
:::


- [项目Github地址](https://github.com/verneyZhou/vue3-cli-admin)



## 准备


`Vue CLI 4.x` 需要 `Node.js v8.9` 或更高版本 (推荐 `v10` 以上)。

[vue3官方文档](https://v3.cn.vuejs.org/api/)

[element-plus官方文档](https://element-plus.gitee.io/zh-CN/guide/quickstart.html#full-import)

vue-cli：[官方文档](https://cli.vuejs.org/zh/guide/)、[npm地址](https://www.npmjs.com/package/@vue/cli)

[typescript文档](https://www.tslang.cn/index.html)


::: tip 本项目版本信息说明
- @vue/cli: `v4.5.15`
- vue: `3.2.21`
- vue-router: `v4.0.12`
- vuex: `v4.0.2`
- element-plus: `v1.2.0-beta.1`
- typescript: `v4.1.5`
:::


[项目预览](12345)


## 创建项目

1. 全局安装 @vue/cli : `npm install -g @vue/cli`
> 已安装直接更新：`npm update -g @vue/cli`；查看版本：`vue --version`

2. 创建项目：`vue create vue3-cli-admin`，选择手动配置：
``` shell
Vue CLI v4.5.15
? Please pick a preset: Manually select features
? Check the features needed for your project: Choose Vue version, Babel, TS, Router, Vuex, CSS Pre-processors, Linter, Unit
? Choose a version of Vue.js that you want to start the project with 3.x
? Use class-style component syntax? Yes
? Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)? Yes
? Use history mode for router? (Requires proper server setup for index fallback in production) Yes
? Pick a CSS pre-processor (PostCSS, Autoprefixer and CSS Modules are supported by default): Sass/SCSS (with node-sass)
? Pick a linter / formatter config: Prettier
? Pick additional lint features: Lint on save
? Pick a unit testing solution: Jest
? Where do you prefer placing config for Babel, ESLint, etc.? In dedicated config files
? Save this as a preset for future projects? (y/N) n
```

3. 之后等待安装，安装完成，本地即生成一个 `vue3-cli-admin` 项目。


## 配置


### 配置全局环境变量

1. 在根目录下新建`.env.dev/.env.prod`等文件

```
<!-- .env.dev -->

NODE_ENV = 'development'
VUE_APP_ENV = 'dev'
BASE_URL = '/'
VUE_APP_PUBLIC_PATH = '/'
VUE_APP_API = 'https://www.baidu.com/'
```

> 只有以 `VUE_APP` 开头的变量会被 `webpack.DefinePlugin` 静态嵌入到客户端侧的包中，代码中可以通过 `process.env.VUE_APP_XXX` 访问；`NODE_ENV` 和 `BASE_URL` 是两个特殊变量，在代码中始终可用

2. `package.json`中修改命令:
``` 
"dev": "vue-cli-service serve --mode dev"
```

环境变量的配置跟`vite`的配置很类似，配置参考：[mode-and-env](https://cli.vuejs.org/zh/guide/mode-and-env.html)



### 配置vue.config.js

[官方配置参考](https://cli.vuejs.org/zh/config/#vue-config-js)、[详细配置参考](https://github.com/staven630/vue-cli4-config/tree/vue-cli3#top)


1. 新建 `vue.config.js`
> `vue.config.js` 是一个可选的配置文件，如果项目的 (和 `package.json` 同级的) 根目录中存在这个文件，那么它会被 `@vue/cli-service` 自动加载。


2. 配置

- configureWebpack
> 如果这个值是一个对象，则会通过 webpack-merge 合并到最终的配置中

[configurewebpack](https://cli.vuejs.org/zh/config/#configurewebpack)


- chainWebpack
> 链式操作 (高级), 是一个函数，会接收一个基于 webpack-chain 的 ChainableConfig 实例。允许对内部的 webpack 配置进行更细粒度的修改。

[chainwebpack](https://cli.vuejs.org/zh/config/#chainwebpack)




### Typescript 支持
> TypeScript 可以通过 `tsconfig.json` 来配置。

`vue-cli`中主要通过[@vue/cli-plugin-typescript](https://cli.vuejs.org/zh/config/#typescript)来支持。



- `tsconfig.json`
``` json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": [
      "webpack-env",
      "jest",
      "element-plus/global"
    ],
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "lib": [
      "esnext",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```
[tsconfig.json配置参考](https://www.tslang.cn/docs/handbook/compiler-options.html)

- shims-vue.d.ts

``` ts
// src/shims-vue.d.ts

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.gif' {
  export const gif: any
}

declare module '*.svg' {
  const content: any
  export default content
}

```



### 引入 Element-Plus

[Element-Plus](https://element-plus.gitee.io/zh-CN/guide/quickstart.html)、[@element-plus/icons](https://element-plus.gitee.io/zh-CN/component/icon.html)


**全局引入**

1. 新建：`src/plugins/element-plus.js`:
``` js
// 全局引入 elment-plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";

// 全局注册elment-icon
import * as ElIconModules from '@element-plus/icons'

function registerElementPlus(app) {
    app.use(ElementPlus, { size: "mini", locale: zhCn })

    // 统一注册el-icon图标
    for(let iconName in ElIconModules){
        let comp = ElIconModules[iconName] || null;
        comp && app.component(comp.name, comp);
    }
}

export default registerElementPlus;
```

2. `src/main.ts`中引入：
``` ts
import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App)

// 全局引入 elment-plus 和 icon
// 这里用require引入，是因为用es6引入会报ts的语法错误...
const registerElementPlus = require('@/plugins/element-plus').default;
registerElementPlus(app);
```

3. `tsconfig.json`中添加配置：
``` json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["element-plus/global"]
  }
}
```

4. 最后直接在项目中使用即可~



**按需加载**
> 待完善~


**国际化: 中英文切换配置**
> 待完善~



### 全局配置 Variables.less

1. 安装插件：`npm i style-resources-loader vue-cli-plugin-style-resources-loader -D`

2. 配置：
``` js
// vue.config.js

pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/styles/variables.scss'), // 配置全局 variables 变量
      ]
    }
},
```

> `.scss`文件中变量的使用：
 1. `$name`
 2. `height: calc(100vh - #{$navBarHeight});`


### Svg-Icon 全局配置

1. 安装插件：`npm i svg-sprite-loader -D`

2. 配置：
``` js
// vite.config.js

chainWebpack: config => {
      ///////// 配置svg规则
      const dir = resolve('src/assets/svg'); // 指定路径
      config.module.rule('svg-icons') // 给 module 添加名为 icons 的 rule
      .uses.clear().end() // 清除已有的loader, 如果不这样做会添加在此loader之后
			.test(/\.(svg)(\?.*)?$/) // 正则匹配 svg 文件
      .include.add(dir).end() // 包括哪些目录
      .exclude.add(/node_modules/).end() // // 正则匹配排除node_modules目录
			.use('svg-sprite-loader').loader('svg-sprite-loader') // 加载loader
      .options({ symbolId: 'icon-[name]'}).end() // 参数
      config.module.rule('svg').exclude.add(dir) // 默认svg配置排除指定路径
      ////////
  },
```

3. `src/components`中新建`svg-icon.g.vue`文件；

4. `src/assets/svg/`中添加所有需要全局导入的`svg`文件，`src/assets/index.ts`中全局导入：
``` ts
// src/assets/index.ts

import { createApp } from 'vue'
import SvgIcon from '@/components/svg-icon.g.vue' // svg component

// 自动导入所有.svg 文件
const requireAll = function(requireContext: any) {
    console.log( requireContext.keys());
  return requireContext.keys().map(requireContext)
}
const req = require.context('./svg', false, /\.svg$/)

requireAll(req)

export default function(app: ReturnType<typeof createApp>) {
  app.component('SvgIcon', SvgIcon) // 注册 svg-icon.vue 组件
}

```

5. `src/main.ts`中引入即可~
``` ts
import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App)

// 引入svg-icon组件
import loadSvg from '@/assets';
loadSvg(app);
```


### 本地 Mock 模拟

1. 安装 mockjs: `npm i mockjs -D`
> [mockjs 官网](http://mockjs.com/)


2. 添加接口：
``` ts
// src/mock/index.ts

const Mock = require('mockjs')

// 获取用户信息
Mock.mock(RegExp('/api/user/info'), 'get', (options: any) => {
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
})
```

3. `src/main.ts`中引入：
``` ts
// mock接口模拟
if (process.env.VUE_APP_ENV === 'mock') { // 当执行 npm run mock 时，执行该文件
    require('./mock');
}
```



## 其他配置


### .gitignore

```
.DS_Store
node_modules
/dist


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

```

### browserslist
你会发现有 `package.json` 文件里的 `browserslist` 字段 (或一个单独的 `.browserslistrc` 文件)，指定了项目的目标浏览器的范围。这个值会被 `@babel/preset-env` 和 `Autoprefixer` 用来确定需要转译的 `JavaScript` 特性和需要添加的 `CSS` 浏览器前缀。


### Babel 配置
> Babel 可以通过 `babel.config.js` 进行配置。

Vue CLI 使用了 Babel 7 中的新配置格式 babel.config.js。和 .babelrc 或 package.json 中的 babel 字段不同，这个配置文件不会使用基于文件位置的方案，而是会一致地运用到项目根目录以下的所有文件，包括 node_modules 内部的依赖。我们推荐在 Vue CLI 项目中始终使用 babel.config.js 取代其它格式。

所有的 Vue CLI 应用都使用 `@vue/babel-preset-app`，它包含了 `babel-preset-env、JSX` 支持以及为最小化包体积优化过的配置。

[参考](https://cli.vuejs.org/zh/config/#babel)

[浏览器的兼容性](https://cli.vuejs.org/zh/guide/browser-compatibility.html)

[@vue/cli-plugin-babel](https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-babel/README.md)


### Eslint 配置
> `ESLint` 可以通过 `.eslintrc` 或 `package.json` 中的 `eslintConfig` 字段来配置。

更多细节可查阅 [@vue/cli-plugin-eslint](https://cli.vuejs.org/zh/config/#eslint)。


## vue.config.js
> 配置详情~

``` js
const path = require('path')
const IS_PROD = process.env.NODE_ENV === 'production'
const WebpackBar = require('webpackbar')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')


const resolve = dir => path.join(__dirname, dir)


module.exports = {
  publicPath: IS_PROD ? process.env.VUE_APP_PUBLIC_PATH : '/', // 默认'/'，部署应用包时的基本 URL

  // outputDir: process.env.outputDir || 'dist', // 默认dist, 生产环境构建文件的目录

  assetsDir: "static", // 相对于outputDir的静态资源(js、css、img、fonts)目录

  // indexPath: 'index.html', // 指定生成的 index.html 的输出路径 (相对于 outputDir); 默认index.html

  // pages: utils.entries(), // 构建多页面应用，每个“page”应该有一个对应的 JavaScript 入口文件

  lintOnSave: false, // 默认true；是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码。这个值会在 @vue/cli-plugin-eslint 被安装之后生效。
  productionSourceMap: false, // 不输出 map 文件，以加速生产环境构建

  devServer: ['mock', 'dev'].includes(process.env.VUE_APP_ENV) ? {
    publicPath: '/',
    hot: true,
    port: '8097',
    open: true,
    proxy: { // proxy配置
      '/mock': {
        'target': 'http://60.205.222.230:3000/mock/',
        'pathRewrite': {
          '^/mock': ''
        }
      }
    }
  } : {},
  // 该对象将会被 webpack-merge 合并入最终的 webpack 配置，允许我们更细粒度的控制其内部配置。
  configureWebpack: () => {
    const config = {
        // devtool: 'source-map',
        resolve: {
            alias: { // 设置目录别名alias
                '@': resolve('src')
            },
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'] // 导入时想要省略的扩展名列表
        },
        plugins: [ // 插件
            new WebpackBar({ // 编译进度条
                name: 'vue3-cli-admin'
            }),
        ]
    };

    if (IS_PROD) {
        config.plugins.push(
            // gzip
            new CompressionWebpackPlugin({
                filename: '[path].gz[query]',
                test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
                threshold: 10240,
                minRatio: 0.8,
                deleteOriginalAssets: false
            })
        )

        // 生产环境清除 console.log
        config.optimization = {
            minimizer: [
                new TerserPlugin({
                terserOptions: {
                    mangle: true,
                    compress: {
                    warnings: false,
                    drop_console: false,
                    drop_debugger: false,
                    pure_funcs: ['console.log'] // 清除 console.log
                    }
                }
                })
            ],
        }
    }
    return config;
  },
  chainWebpack: config => {

    // 移除 preload 插件
    config.plugins.delete('preload')
    // 移除 prefetch 插件, 当有很多页面时，它会导致太多毫无意义的请求
    config.plugins.delete('prefetch')
    // 开发环境 sourcemap 不包含列信息
    config.when(!IS_PROD,config => config.devtool('cheap-source-map'))



      ///////// 配置svg规则
      const dir = resolve('src/assets/svg'); // 指定路径
      config.module.rule('svg-icons') // 给 module 添加名为 icons 的 rule
      .uses.clear().end() // 清除已有的loader, 如果不这样做会添加在此loader之后
			.test(/\.(svg)(\?.*)?$/) // 正则匹配 svg 文件
      .include.add(dir).end() // 包括哪些目录
      .exclude.add(/node_modules/).end() // // 正则匹配排除node_modules目录
			.use('svg-sprite-loader').loader('svg-sprite-loader') // 加载loader
      .options({ symbolId: 'icon-[name]'}).end() // 参数
      config.module.rule('svg').exclude.add(dir) // 默认svg配置排除指定路径
      
      ////////


      //////// 打包分析 npm i webpack-bundle-analyzer -D
      if (process.env.VUE_APP_ENV === 'analyze') {
        const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
        config.plugin('webpack-report').use(BundleAnalyzerPlugin, [
          {
            analyzerMode: 'static'
          }
        ])
      }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/styles/variables.scss'), // 配置全局 variables 变量
      ]
    }
  },
  css: {
    loaderOptions: { // // 向预处理器 Loader 传递选项
      // less: {
      //   javascriptEnabled: true
      // },
      // postcss: {
      //   // 这里的选项会传递给 postcss-loader
      // }
    }
  },
  /**
   * transpileDependencies配置默认为[], babel-loader 会忽略所有 node_modules 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来。配置需要转译的第三方库。
   */
  transpileDependencies:[ 
    'swiper',
    'dom7',
  ]

};

```


## 功能

### 动态路由与权限校验

### 导航

面包屑导航、tags-view





## 备注

1. 终端输入 `vue inspect --rules`，查看规则配置的列表；
2. `vue inspect --rule svg-icons`: 单独查看 svg-icons 的配置规则
3. `vue inspect > output.js` 输出所有 webpack 配置到指定文件
> [参考](https://cli.vuejs.org/zh/guide/webpack.html#%E4%BF%AE%E6%94%B9%E6%8F%92%E4%BB%B6%E9%80%89%E9%A1%B9)


## 报错记录

1. ` ERROR  Invalid options in vue.config.js: "linOnSave" is not allowed`

> 添加 `lintOnSave` 配置 


2. `Syntax Error: TypeError: this.getOptions is not a function`

> `<style lang="less">`引起的报错，改为`scss`


3. `svg-sprite-loader` 报错

``` js
404.svg:1 Uncaught Error: Module build failed (from ./node_modules/svg-sprite-loader/lib/loader.js):
InvalidSvg: svg-sprite-loader exception. 
```

- 先检查`svg`文件是否正常，svg文件为空可能导致此类报错；
- 然后检查`svg`的配置, 正确配置如下：
``` js
{
    chainWebpack: config => {
         ///////// 配置svg规则
        const dir = resolve('src/assets/svg'); // 指定路径
        config.module.rule('svg-icons') // 给 module 添加名为 icons 的 rule
        .uses.clear().end() // 清除已有的loader, 如果不这样做会添加在此loader之后
                .test(/\.(svg)(\?.*)?$/) // 正则匹配 svg 文件
        .include.add(dir).end() // 包括哪些目录
        .exclude.add(/node_modules/).end() // // 正则匹配排除node_modules目录
                .use('svg-sprite-loader').loader('svg-sprite-loader') // 加载loader
        .options({ symbolId: 'icon-[name]'}).end() // 参数
        config.module.rule('svg').exclude.add(dir) // 默认svg配置排除指定路径
      ////////
    }
}
```
- 终端输入 `vue inspect --rule svg-icons`后可查看配置规则：
``` js
/* config.module.rule('svg-icons') */
{
  test: /\.(svg)(\?.*)?$/,
  include: [
    '/Users/admin/my-code/self/byme/vue3-study/vue3-cli-admin/src/assets/svg'
  ],
  exclude: [
    /node_modules/
  ],
  use: [
    {
      loader: 'svg-sprite-loader',
      options: {
        symbolId: 'icon-[name]'
      }
    }
  ]
}
```
跟 `webpack` 中的配置差不多~



4. `nprogress` 和 `js-cookie` 报错

> 安装： `npm i @types/nprogress @types/js-cookie -D`



5. `element-plus`的`icon`显示不了：
``` js
 Failed to resolve component: alarm-clock
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement. 
```

这是因为`elment-plus`的`icon`图标，需要单独引入，引入方法见`src/plugins/element-plus.js`


6. `element-plus.js?d2e6:21 Uncaught TypeError: Cannot assign to read only property 'exports' of object '#<Object>'`

> webpack不允许混用`import`和`module.exports`,统一用法即可~



7. ` ERROR  TypeError: Cannot read property 'tapPromise' of undefined`

> `compression-webpack-plugin` 版本问题，降至`v5.0.1`

[参考](https://blog.csdn.net/weixin_38401146/article/details/115308825)



8. ` ERROR  TypeError: Cannot read property 'javascript' of undefined`

> terser-webpack-plugin 版本问题，降至`v4.2.3`



## 参考

- [v3-admin](https://github.com/un-pany/v3-admin)
- [vue3-antd-admin](https://github.com/buqiyuan/vue3-antd-admin)



<fix-link label="Back" href="/skills/"></fix-link>


<!-- 2021-11-20 -->