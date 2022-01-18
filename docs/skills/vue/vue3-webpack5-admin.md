
# vue3+webpack5+ts 项目搭建

::: tip 技术栈
vue3、webpack5、typescript、element-plus、vuex4、vue-router4
:::


## 准备


node版本`v10.x.x`

[vue3官方文档](https://v3.cn.vuejs.org/api/)

[element-plus官方文档](https://element-plus.gitee.io/zh-CN/guide/quickstart.html#full-import)

[webpack5官方文档](https://webpack.docschina.org/)

[typescript文档](https://www.tslang.cn/index.html)


::: tip 本项目版本信息说明
- webpack: `5.62.1`,
- webpack-cli: `4.9.1`,
- vue: `3.2.21`
- vue-router: `v4.0.12`
- vuex: `v4.0.2`
- element-plus: `v1.2.0-beta.2`
- typescript: `v4.4.4`
:::


[项目预览](12345)


## 项目搭建与配置

### 搭建

1. 新建项目：
``` shell
mkdir vue3-webpack5-admin

cd vue3-webpack5-admin

npm init -y # 生成 package.json 脚本
```

2. 安装webpack: `npm i webpack webpack-cli -D`

3. `npm i webpack-dev-server webpack-merge cross-env -D`
> 热更新、合并配置、cross-env: 设置环境变量

[webpack-dev-server](https://webpack.docschina.org/configuration/dev-server/) 可用于快速开发应用程序。

4. `npm i html-webpack-plugin -D`，并新建 `index.html`
> 生成html入口



### 集成 vue3

1. `npm i vue@next -S`
> 安装`vue3`

2. `npm i vue-loader@next @vue/compiler-sfc vue-style-loader -D`
> `@vue/compiler-sfc` 是替换 `vue2` 中的 `vue-template-compiler`

> `vue-loader`是基于 `webpack` 的一个的`loader`插件，解析和转换`.vue`文件，提取出其中的逻辑代码 `script`、样式代码 `style`、以及 `HTML`模版`template`，再分别把它们交给对应的 `loader` 去处理如 `style-loader 、 less-loader` 等等，核心的作用，就是**提取**。


[vue-loader](https://vue-loader.vuejs.org/zh/)


3. `npm i vue-router@4 vuex@next -S`
> vuex, vue-router




### Babel

1. `npm i babel-loader @babel/core @babel/preset-env -D`
> babel 配置
- `@babel/core`： babel 的核心库。
- `@babel/preset-env`：babel官方推出的插件，它可以根据开发者的配置，按需加载插件；默认配置的情况下，会加载从es2015开始的所有preset；
    > 它提供了更精细化的配置，以提升编译速度，同时减少代码冗余。[babel-preset-env使用指南](https://www.cnblogs.com/chyingp/p/understanding-babel-preset-env.html)
- babel-loader： webpack 的 loader 插件，用于编译代码，转化成浏览器读得懂的代码

``` js
// webpack.config.base.js

{
    test: /\.(t|j)s$/, // babel: es6 转 es5
    exclude: /node_modules/, // 不编译node_modules下的文件
    use: {
        loader: 'babel-loader',
    }
},
```



2. `npm i @babel/plugin-transform-runtime @babel/proposal-class-properties @babel/proposal-object-rest-spread -D`
> 安装 `babel` 插件：抽离babel的一些公共工具类用来减少代码的大小、支持 ts 类的写法、支持三点展开符

3. `npm i @babel/runtime-corejs3 -D`

4. 新建 `.babelrc` 文件，添加配置
> Babel的配置文件是 Babel 执行时默认会在当前目录寻找的文件，主要有`.babelrc，.babelrc.js，babel.config.js`和`package.json`。它们的配置项都是相同，作用也是一样的，只需要选择其中一种。 


``` js
// .babelrc

{
    "presets": [
      ["@babel/preset-env", {
        "modules": "commonjs",
        "targets": {
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"],
          "node": "current"
        }
      }],
      [
        "@babel/preset-typescript", // 引用Typescript插件
        {
          "allExtensions": true // 支持所有文件扩展名，否则在vue文件中使用ts会报错
        }
      ]
    ],
    "plugins": [
      [
        "@babel/plugin-transform-runtime", // polyfill
        {
          "corejs": 3 // 指定 corejs 版本 
        }
      ],
      "@babel/proposal-class-properties", // 支持 ts 类的写法
      "@babel/proposal-object-rest-spread" // 支持三点展开符
    ]
  }
  
```

### Loader


1. `npm i style-loader css-loader less less-loader sass-loader node-sass -D`
> 安装解析样式的loader: 解析 `css, less, sass/scss`

2. `npm i url-loader file-loader svg-sprite-loader -D`
> 安装解析静态资源的loader: 图片，视频，svg 等静态资源

3. `npm i sass-resources-loader -D `
> 全局注册less/sass全局变量, [参考](https://github.com/shakacode/sass-resources-loader)



### 资源模块配置

> 以图片静态资源解析为例：
``` js
// webpack.config.base.js

{
    test: /\.(png|jpe?g|gif|bmp|webp|svg)(\?.*)?$/, // 解析图片等静态资源
    dependency: { not: ['url'] }, // 排除来自新 URL 处理的 asset
    exclude: [ path.resolve('src/assets/svg')], // 排除
    // use: {
    //     loader: 'url-loader',
    //     options: {
    //         limit: 1024, // 字节数,意味着当图片大小小于1k的话，打包时会进行base64转换
    //         name: utils.assetsPath('images/[name].[hash:7].[ext]')
    //     }
    // },
    type: "asset/resource",
    generator: {
        filename: utils.assetsPath('images/[name]_[hash:7][ext][query]')
    },
},
```

[参考](https://webpack.docschina.org/guides/asset-modules/)


### Plugins

1. `npm i mini-css-extract-plugin css-minimizer-webpack-plugin terser-webpack-plugin -D`
> 压缩、分离 `css` 文件, 压缩 `js` 文件

2. `npm i clean-webpack-plugin  -D`
> 打包前先清除以前的打包文件

其实 `webpack v5.20.0+` 自带了清理打包目录的功能，无需使用这个插件，只需在生产环境的配置文件中增加一个配置即可：
``` js
output: {
    clean: true,
},
```
[output.clean](https://webpack.docschina.org/configuration/output/#outputclean)



3. `npm i friendly-errors-webpack-plugin webpackbar webpack-dashboard webpack-bundle-analyzer -D`
> 优化类插件




### 集成 typescript 环境

[参考](https://v3.cn.vuejs.org/guide/typescript-support.html)

1. `npm i typescript ts-loader -D`
> 配置 `ts-loader` 来解析 `vue` 文件里的 `<script lang="ts">` 代码块，将 ts 转换为 js 文件

2. `npm i @babel/preset-typescript -D`
> `.babelrc` 中引入，支持`ts`中对 es6 新特性的支持

3. `tsc -init`
> 生成 `tsconfig.json` 文件

[配置参考](https://www.tslang.cn/docs/handbook/compiler-options.html)

4. 新建 `shims-vue.d.ts` 文件
> 识别 `.vue` 文件


5. `npm i @types/node @types/webpack-env -D`
> `tsconfig.json` 中添加配置
``` json
{
    "compilerOptions": {
        "types": ["node", "webpack-env", "element-plus/global"],
    }
}
```


### 安装 element-plus

1. `npm i @element-plus/icons element-plus -S`

`plugins/element-plus.js`中全局引入

[Element-Plus](https://element-plus.gitee.io/zh-CN/guide/quickstart.html)、[@element-plus/icons](https://element-plus.gitee.io/zh-CN/component/icon.html)


> 配置跟`vue-cli`的配置差不多，详细配置可参考 cli 的配置，也可直接参考代码，这里不再赘述，下同~


### svg-icon全局配置

`npm i svg-sprite-loader -D`




### 本地Mock模拟

`npm i mockjs -D`

[mockjs 官网](http://mockjs.com/)



### 其他配置

`npm i axios js-cookie nprogress -S`
> 接口，进度条...

`npm i path -S`
> 路径




## 代码规范


### Eslint
> ESLint 用于检查代码规则，在开发过程中根据你提供的规则做检验，并给出错误提示



- 安装 eslint 依赖：`npm i eslint -D`

- `npm i eslint-webpack-plugin -D`
> `eslint-loader` 已经被官方放弃了 ; [参考](https://webpack.docschina.org/plugins/eslint-webpack-plugin/)


- 支持 ts 和 vue: `npm i @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-vue  -D`

[typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint) 是 ts 官方提供的 ESLint 插件；

[eslint-plugin-vue](https://eslint.vuejs.org/) 是 vue 官方提供的 ESLint 插件

`npm i @vue/eslint-config-typescript -D`


- 新建 `.eslintrc.js`, `.eslintignore` 文件，配置




### Prettier规范

- 加入 prettier 的支持: `npm i @vue/eslint-config-prettier eslint-plugin-prettier prettier -D`

- 新建 `.prettierrc` 文件, 添加 `.prettierignore` 配置文件;

```js
// .prettierrc

{
    "tabWidth": 4,
    "printWidth": 120,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "jsxSingleQuote": false,
    "bracketSpacing": true,
    "jsxBracketSameLine": true
}
```
```js
// .prettierignore 过滤配置

dist/
node_modules
```



- `.eslintrc.js` 中添加配置:

``` js
module.exports = {
  // ...
  plugins: ["vue", "@typescript-eslint", "prettier"],
  extends: [
    'plugin:vue/essential',
    'airbnb-base',
    'plugin:prettier/recommended'
  ],
  // ...
};

```



## 其他

- 新建 .gitignore 文件

- `.prettierrc`
> Prettier 是一个代码格式化工具。能够按照我们的规则，将我们的代码格式化
 

- `.stylelintrc.js`
> stylelint 可以帮助我们规范化 css 的书写，风格统一，减少错误


- `.editorconfig`
> editorConfig不是什么软件，而是一个名称为`.editorconfig`的自定义文件。该文件用来定义项目的编码规范，编辑器的行为会与`.editorconfig` 文件中定义的一致，并且其优先级比编辑器自身的设置要高，这在多人合作开发项目时十分有用而且必要

[EditorConfig介绍与安装](https://blog.csdn.net/biubiu640/article/details/80308105)


- `postcss.config.js`
> 移动端 `rem` 适配


- `commitlint.config.js`, `husky`
> 前端提交信息规范


- `.browserslistrc`
> 支持的浏览器版本。在vue官方脚手架中，browserslist字段会被 @babel/preset-env 和 Autoprefixer 用来确定需要转译的 JavaScript 特性和需要添加的 CSS 浏览器前缀

[browserslist](https://github.com/browserslist/browserslist)

可以单独新建文件，也可以在`package.json`中添加配置:
``` json
// package.json

"browserslist": [
    "> 1%",
    "last 2 versions",
    "not ie <= 8"
]

```




## 备注

- purgecss-webpack-plugin 清除无用css
- image-webpack-loader 图片压缩
- node-notifier 脚本弹窗提示插件
- webpack-bundle-analyzer 打包分析插件
- copy-webpack-plugin 自动拷贝文件
> 当某些文件不需要经过 webpack 打包而直接使用，如一些三方脚本 js 文件等等，我们可以使用 copy-webpack-plugin 这个插件直接进行文件的拷贝；[copy-webpack-plugin](https://webpack.docschina.org/plugins/copy-webpack-plugin/)

- dotenv  配置环境变量
> 可以使用 dotenv 来按需加载不同的环境变量，VUE CLI 的环境变量也是使用的这个插件, [参考](https://zhuanlan.zhihu.com/p/150549283)


配置参考：
``` js
// 1. 下载 
npm i dotenv -D


// 2. 添加命令
"dev": "cross-env envMode=dev webpack serve --config ./build/webpack.dev.conf.js  --color",


//3. 配置

const envMode = process.env.envMode
require('dotenv').config({ path: `.env.${envMode}` })
// 正则匹配以 VUE_APP_ 开头的 变量
const prefixRE = /^VUE_APP_/
let env = {}
// 只有 NODE_ENV，BASE_URL 和以 VUE_APP_ 开头的变量将通过 webpack.DefinePlugin 静态地嵌入到客户端侧的代码中
for (const key in process.env) {
	if (key == 'NODE_ENV' || key == 'BASE_URL' || prefixRE.test(key)) {
		env[key] = JSON.stringify(process.env[key])
	}
}

plugins: [
    //...
    new webpack.DefinePlugin({ // 定义环境变量
    	'process.env': {
    		...env
    	}
    })
]

// 4.最后就可以跟 vue-cli 一样，新增一个 .env.dev 文件添加环境全局变量配置了~
NODE_ENV = 'development'
VUE_APP_BASE_API = '/api'
VUE_APP_API_USER = '/user'
VUE_APP_SHOWCONSOLE = true
```


- externals 扩展依赖
> 防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖(external dependencies)。

[参考](https://webpack.docschina.org/configuration/externals/)



## 报错记录


1. `TS2695: Left side of comma operator is unused and has no side effects.`
> ts-loader 配置中 transpileOnly 改为 true



2. `'main.ts' cannot be compiled under '--isolatedModules' because it is considered a global script file. Add an import, export, or an empty 'export {}' statement to make it a module.`
> tsconfig.json 中 isolatedModules 设为 false



3. `ERROR in Must use import to load ES Module: /Users/admin/my-code/self/byme/vue3-study/vue3-webpack5-admin/node_modules/@eslint/eslintrc/universal.js`
> eslint-webpack-plugin 插件的配置问题


## 参考


- [保姆级教程：从零搭建 Webpack5+ts+Vue3 开发环境](https://juejin.cn/post/6979478474620665887)
- [基于 vue3 + webpack 5 + sass+ vw 适配方案+axios 封装，从0构建手机端模板脚手架](https://juejin.cn/post/6989973871663251487)


<fix-link label="Back" href="/skills/"></fix-link>


<!-- 2021-11-21 -->