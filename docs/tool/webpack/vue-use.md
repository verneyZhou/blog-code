

# vue+webpack从0到1搭建项目

这是是我用 vue + webpack 搭建项目的学习记录~

## 准备
- [vue.js官方文档](https://cn.vuejs.org/)
- [webpack官方文档](https://www.webpackjs.com/)

> 注：这里使用的vue版本是v2.6.11；webpack版本是v4.42.1；里面的配置模式主要适用于webpack版本为v4.x.x；



## 开始

### 安装node和npm,nvm

- **nvm**：node版本管理工具，[参考](https://segmentfault.com/a/1190000007998600)
- [node](http://nodejs.cn/download/)版本需在v8.x.x以上

> 这一般在配置开发环境的时候都会安装，这里不再赘述~


### 新建项目

Terminal输入以下命令，开始创建项目：
``` shell
mkdir vue-webpack-project # 创建项目
cd vue-webpack-project # 打开
npm init -y    # 采用默认配置，初始化npm,生成package.json
npm install webpack webpack-cli --save-dev  # 安装webpack,webapck4+已经开始使用webpack-cli
# 或者：npm i webpack webpack-cli -D; 
# –save：模块名将被添加到dependencies(在生产环境中需要用到的依赖)，可以简化为参数-S。
# –save-dev: 模块名将被添加到devDependencies(在开发、测试环境中用到的依赖)，可以简化为参数-D。
./node_modules/.bin/webpack -v  # 查看是否安装成功,成功则出现版本号：4.x.x
```

### webpack打包初体验

- 编辑器打开项目，根目录下新建`src/index.js`:
``` js
// src/index.js
console.log('hello webpack!!!');
```

- 首次打包
> 终端输入以下命令打包：
``` shell
./node_modules/.bin/webpack  # 运行打包命令
```
运行之后会出现如下提示：

<img :src="$withBase('/images/webpack/webpack001.png')" width="auto"/>

>warning的意思是需要设定模式，如果不设定模式，默认为生产模式，生产模式是会压缩js代码；
项目里多了一个dist文件夹，webpack4在打包时默认入口文件为src目录下的index.js，输出地址为dist文件夹，文件为main.js

- 项目根目录下新建`index.html`，引入打包生成的`main.js`，然后在浏览器打开，打开控制台，可以看到`src/index.js`中的内容
``` html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>vue-webpack-project</title>
</head>
<body>
    <div id="root">hello webpack</div>
    <script src="dist/main.js"></script>
</body>
</html>
```

- 简化打包命令
``` json
// package.json
"scripts": {
    "build": webpack
}
```
然后在终端运行：
``` shell
npm run build # 打包命令，执行的是和./node_modules/.bin/webpack一样的操作
```


- 新增webpack配置文件`build/webpack.dev.js`
``` js
// build/webpack.dev.js
'use strict';
const path = require('path');
module.exports = {
    entry: './src/index.js', // 打包入口
    output: { // 输出
        path: path.join(__dirname, '../dist'),
        filename: 'bundle.js' // 自定义打包后的文件名
    },
    mode: 'production' // 环境，设置之后打包就不会有warning了
};
```
修改build命令：
``` json
// package.json
"scripts":{
    "build": "webpack --config build/webpack.dev.js" // 修改build命令
    // webpack --progress --display-modules --display-reason --colors --config ...
    // 打包时可添加其他参数：看到过程、显示模块、显示打包原因、看到颜色变化
}
```


### 安装vue

- 安装

[参考](https://vue-loader.vuejs.org/zh/guide/#%E6%89%8B%E5%8A%A8%E8%AE%BE%E7%BD%AE)

``` shell
npm i vue -S # 安装vue
npm i vue-loader vue-template-compiler -D # 安装vue-loader和vue-template-compiler
# vue-loader负责解析和转换.vue文件，提取出其中的逻辑代码script、样式代码style、以及HTML模版template,再分别把它们交给对应的Loader去处理
# vue-template-compiler负责把vue-loader提取出的HTML模版编译成对应的可执行的JavaScript代码

# ******安装样式loader******
npm i css-loader style-loader vue-style-loader -D 
# css-loader：加载由 vue-loader 提取出的 CSS 代码，并转换成common.js对象
# style-loader把css-loader解析好的样式通过<style>标签插入到head中
# vue-style-loader功能和style-loader类似

# ///// 以下选择性安装
# 如果需要解析.less文件
npm i less less-loader -D
# 如果需要解析sass/scss文件
npm i sass-loader node-sass -D
# 如果需要解析.styl文件
npm i stylus stylus-loader -D

# //////我选用less
```

- 打包初试

    - 新建app.vue：`src/App.vue`
    ``` vue
    <template>
        <div class='container'>{{text}}</div>
    </template>
    <script>
        export default {
            data(){
                return{
                    text: "hello vue+webpack"
                }
            }
            created() {
                console.log('=======created')
            },
            mounted() {
                console.log('======mounted')
            },
        }
    </script>
    <style lang="less">
    </style>
    ```

    - 新建`styles/test/index.less`，修改`src/index.js`
    ``` js
    import Vue from 'vue';
    import App from './App';
    import './styles/test/index.less'; // 引入样式

    new Vue({
        render:h => h(App)
    }).$mount('#root') // #root是已经在根目录下新建的index.html中外层div的id
    ```

    - 修改`build/webpack.dev.js`
    ``` js
    'use strict';

    const path = require('path');
    const VueLoaderPlugin = require('vue-loader/lib/plugin'); // 引入

    module.exports = {
        entry: './src/index.js', // 入口文件
        output: { // 输出文件
            path: path.join(__dirname, '../dist'), // 输出目录
            filename: 'bundle.js' // 打包文件名称
        },
        mode: 'production', // 环境
        // 配置module节点的目的,是为了在webpack遇到import、require等导入文件的语句是,能够选择合理的loader去处理这些文件.
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                // 它会应用到普通的 `.css` 文件
                // 以及 `.vue` 文件中的 `<style>` 块
                {
                    test: /\.css$/,
                    use: [ // 链式调用 从右到左，先用css-loader解析css,再传递给vue-style-loader
                    'vue-style-loader',
                    'css-loader'
                    ]
                },
                // 它会应用到普通的 `.less` 文件
                // 以及 `.vue` 文件中的 `<style lang="less">` 块
                {
                    test: /\.less$/,
                    use: [
                    'vue-style-loader',
                    'css-loader',
                    'less-loader'
                    ]
                }
            ]
        },
        plugins: [
            // 请确保引入这个插件!!!
            new VueLoaderPlugin()
        ]
    };
    ```

    - `npm run build` 打包,浏览器打开`index.html`，看打开效果

> 附：[path.resolve和path.join的区别](https://www.jianshu.com/p/4f81f01389dd)


## 配置
> 第一次打包vue成功之后，接下来开始进行配置~

### 基础配置

- 配置环境之前，先熟悉几个webpack的命令~
``` shell
webpack #最基本的启动webpack命令  默认会使用webpack.config.js
webpack --config webpack.dev.js # 修改默认配置文件
webpack -w #提供watch方法，实时进行打包更新
webpack -p #对打包后的文件进行压缩
webpack -d #提供SourceMaps，方便调试
webpack --progress #输出内容带有进度
webpack --colors #输出结果带彩色，比如：会用红色显示耗时较长的步骤
webpack --profile #输出性能数据，可以看到每一步的耗时
webpack --display-modules #默认情况下 node_modules 下的模块会被隐藏，加上这个参数可以显示这些被隐藏的模块
```

#### 热更新配置
> 配置文件提供一个入口（entry）和一个出口（output），webpack根据这个来进行 **js 的打包和编译**工作。虽然webpack提供了`webpack --watch`的命令来动态监听文件的改变并实时打包，输出新`bundle.js`文件；但这样文件多了之后打包速度会很慢，此外这样的打包方式不能做到`hot replace`，即每次webpack编译之后，你还需要手动刷新浏览器。

这时候webapck-dev-server就出现了~

**webpack-dev-server**主要是启动了一个使用express的**Http服务器**。它的作用主要是用来**伺服资源文件**。此外这个Http服务器和client使用了websocket通讯协议，原始文件作出改动后，webpack-dev-server会实时的编译，但是**最后的编译的文件并没有输出到目标文件夹**；
> 注意：你启动webpack-dev-server后，你在目标文件夹中是看不到编译后的文件的，**实时编译后的文件都保存到了内存当中**。


接下来开始操作吧~

1. **安装**

``` shell
npm i webpack-dev-server cross-env -D # 安装
# cross-env是运行跨平台设置和使用环境变量的脚本，
# 当您使用NODE_ENV =production, 来设置环境变量时，大多数Windows命令提示将会阻塞(报错)。
# windows不支持NODE_ENV=development的设置方式。
```
- [cross-env使用](https://www.jianshu.com/p/e8ba0caa6247)
> 在不同平台，设置环境变量的方式不一样（如mac与windows）。使用cross-env，则可在不同平台执行同个语句来设置环境变量。webapck4.x它支持三种模式development、production、none。

2. **修改配置文件**

复制`webpack.dev.js`，粘贴，命名为`webpack.prod.js`，之前里面配置的是打包命令；现在修改`webpack.dev.js`适用于开发环境~
- [webpack中devServer配置](https://www.webpackjs.com/configuration/dev-server/)
- [开发环境添加热更新](https://www.webpackjs.com/plugins/hot-module-replacement-plugin/)
``` js
// build/webpack.dev.js

const webpack = require('webpack');

.... // 中间省略掉不重要的代码

mode: 'development', // dev环境
devServer: {
    contentBase: path.join(__dirname, "dist"), // 基础目录,告诉服务器从哪里提供内容,只有在你想要提供静态文件时才需要。
    compress: true, // 一切服务都启用gzip 压缩
    hot:true, // 开启热更新,启用 webpack 的模块热替换特性
    stats: 'errors-only', // 只在发生错误时输出
    host: '127.0.0.1', // 指定一个host，默认是localhost;
    // 如果希望别人通过ip访问，可设置host:'0.0.0.0'
    port: 8000, // 端口号 默认8080
    historyApiFallback: true, // 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html,通常设置为true
    // https: true, // 默认情况下，dev-server 通过 HTTP 提供服务。也可以选择带有 HTTPS 的 HTTP/2 提供服务：
    // inline: true, // 默认情况下，应用程序启用内联模式(inline mode)。这意味着一段处理实时重载的脚本被插入到你的包(bundle)中，并且构建消息将会出现在浏览器控制台。
    open: true, // 自动打开浏览器
    proxy: [ // 配置多个数组格式，单个则可以是对象格式
        { // 如果你有单独的后端 API，并且希望在同域名下发送 API 请求，可跨域代理
            context: ['/api'],
            target: 'https://www.baidu.com/', // 如 /api/user/ 可代理到：https://www.baidu.com/api/user
            secure: false, // 默认情况下，不接受运行在 HTTPS 上，且使用了无效证书的后端服务器。如果你想要接受，设为true
            changeOrigin: true,
            pathRewrite: { '^/api': '' } // 如果不想要/api，则可重写路径：https://www.baidu.com/user
        }
    ],
    publicPath: '/', // 此路径下的打包文件可在浏览器中访问。
    // 假设服务器运行在 http://localhost:8080 并且 output.filename 被设置为 bundle.js。默认 publicPath 是 "/"，所以你的包(bundle)可以通过 http://localhost:8080/bundle.js 访问。
    // quiet: true, // 启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见。
    // stats: 'errors-only', // 只在发生错误时输出
},

plugins:[
        ...
        new webpack.HotModuleReplacementPlugin(), // 启动webpack自带的热替换模块，简称HMR
        // 如果单独使用devServer，代码改变时会更新打包文件，然后reload刷新页面；HMR则只更新修改部分
        // 永远不要在生产环境下启用 HMR!!!!!!
]
```

3. **添加命令**

``` json
// package.json
"scripts": {
    "dev": "cross-env NODE_ENV=development webpack-dev-server --progress --config build/webpack.dev.js",
    "build": "cross-env NODE_ENV=production webpack --config build/webpack.prod.js",
  },
// 
```
然后`npm run dev`试一下~
> 结果不出意外地，没成功....浏览器自动打开页面，但没有渲染除页面....

4. **安装`html-webpack-plugin`**

> 需要再安装一下`html-webpack-plugin`~

- [HtmlWebpackPlugin]( https://www.webpackjs.com/plugins/html-webpack-plugin/)
- [配置参数](https://github.com/jantimon/html-webpack-plugin#configuration)
- [参数详解](https://www.cnblogs.com/wonyun/p/6030090.html)

> 它可以生成创建html入口文件，比如单页面可以生成一个html文件入口，配置N个html-webpack-plugin可以生成N个页面入口；

> 为html文件中引入的外部资源如script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题。

- 安装
``` shell
npm i html-webpack-plugin -D
```

- 配置文件中引入~
``` js
//  build/webpack.dev.js
// build/webpack.dev.js
// 生产环境和开发环境均需要设置
const HtmlWebpackPlugin = require('html-webpack-plugin');
....
modules.export = {
      
    plugins:[
        ....
         new HtmlWebpackPlugin({
            title: 'vue-webpack-project',  // 设置页面title
            template: 'index.html', // 模板，相对根目录的路径，默认是：src/index.html，如果存在就打包这个模板，无则生成插件默认的html 
            filename:'index.html', // 指定打包出来文件名称
            inject:true, // 为true则自动注入js、css
            chunksSortMode: 'none', // 默认auto； 允许指定的thunk在插入到html文档前进行排序，none则不排序
        })
    ]
}
```
- `npm run build`试一下~
> 如果上面配置中`template`未设置或设置路径不存在，则会产生一个包含以下内容的文件 `dist/index.html`:
``` html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>webpack App</title>
  </head>
  <body>
    <script src="index_bundle.js"></script>
  </body>
</html>
```

5. **启动**

最后，`npm run dev`，浏览器会自动打开在devServer里面配置的地址，并渲染除`src/App.vue`的内容~
> 试试改一下代码文字或样式，回到浏览器，发现页面自动更新了，就说明热更新配置成功了~


- **Q：如何判断webpack的模块热替换是否生效？**
> 如果HMR已生效，更改代码，回到浏览器，页面自动更新，但只是局部更新，并没有reload页面，且可以在控制后台发现这样一个js：

<img :src="$withBase('/images/webpack/webpack002.jpeg')" width="auto"/>

> 如果HMR未生效，则每次更改代码都是通过reload页面进行更新。

如果用`webpack-dev-server`运行，则会自动打开浏览器，文件正常运行，但是并没有打包生成的文件。原因是`webpack-dev-server`主要调试用，生成的文件是在内存内，想要实际文件需要`npm run build`才可以。


#### 配置DefinePlugin
> DefinePlugin 允许创建一个在编译时可以配置的全局常量；这可能会对开发模式和生产模式的构建允许不同的行为非常有用。

- [DefinePlugin](https://www.webpackjs.com/plugins/define-plugin/)
``` js
// webapck.dev.js
// webpack.prod.js

plugins: [
    ...
    /////作用：可以在全局调用变量来判断环境，变量为：process.env.NODE_ENV 返回结果为"development" or "production"(双引号不可省略)
    // 也可以自定义一些全局环境变量
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(`${process.env.NODE_ENV}`),
            RUN_ENV: JSON.stringify(`${process.env.RUN_ENV}`),
            ...
        }
    }),
]
```

#### 设置devtool
- [webpack中devtool配置](https://www.webpackjs.com/configuration/devtool/)
- [什么是soure map](https://segmentfault.com/a/1190000020213957)

> sourceMap就是一个文件，里面储存着位置信息；这个文件里保存的，是转换后代码的位置，和对应的转换前的位置。有了它，出错的时候，通过断点工具可以直接显示原始代码，而不是转换后的代码。

> 开发环境开启，线上环境关闭(避免线上环境暴露代码)；线上排查问题可将sourcemap上传到监控系统。

``` js
// webpack.dev.js

// devtool:'eval', // 不单独生成.map文件
// devtool:'cheap-source-map', // 只能定义行的信息，定位不到列的信息
devtool:'source-map' // 单独生成.map文件 可定位到源代码
// devtool: 'cheap-module-eval-source-map', // 这是 "cheap(低开销)" 的 source map，因为它没有生成列映射(column mapping)，只是映射行数。
```

可对比下添加前后的打包文件：
- 未添加`devtool`配置

<img :src="$withBase('/images/webpack/webpack003.jpeg')" width="auto"/>

- 添加配置：`devtool:'source-map'`

<img :src="$withBase('/images/webpack/webpack004.jpeg')" width="auto"/>



### babel配置
> 如今 ES6 语法在开发中已经非常普及，甚至也有许多开发人员用上了 ES7 或 ES8 语法。然而，浏览器对这些高级语法的支持性并不是非常好。因此为了让我们的新语法能在浏览器中都能顺利运行，Babel 应运而生。

**Babel是一个广泛使用的转码器，可以将ES6代码转为ES5代码，从而可以在现有环境执行，所以我们可以用ES6编写，而不用考虑环境支持的问题。**

有些浏览器版本的发布早于ES6的定稿和发布，因此如果在编程中使用了ES6的新特性，而浏览器没有更新版本，或者新版本中没有对ES6的特性进行兼容，那么浏览器就会无法识别ES6代码，例如IE9根本看不懂代码写的let和const是什么东西？只能选择报错，这就是浏览器对ES6的兼容性问题。

- [webapck官方文档](https://www.webpackjs.com/loaders/babel-loader/)
- [babel-loader详解](https://segmentfault.com/a/1190000017898866?utm_source=tag-newest)
- [关于Babel配置项的这点事](https://segmentfault.com/a/1190000010468759)

1. **安装**
``` shell
npm i babel-loader @babel/core @babel/preset-env -D
```

2. **配置webpack.dev.js**
``` js
// webpack.dev.js

module:{
    rules:[
        // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
        {
            test:/.js$/, // 指定匹配规则
            exclude: /node_modules/, // 不包含哪些文件
            // include: [path.join(__dirname, '..', 'src')], // 包含哪些文件
            use:[ // a.数组引入
                'babel-loader',
            ]
            // use:{ // b.对象引入。 可在这里添加选项，也可以在根目录新建.babelrc文件写入配置
            //     loader:'babel-loader', // 指定使用的loader名称
            //     options:{ // 选项
            //         presets:['@babel/preset-env']
            //     }
            // },
        },

    ]
}
```

3. **配置.babelrc**
> 项目根目录下新建`.babelrc`文件：
```json
// .babelrc文件需要的配置项主要有预设(presets)和插件(plugins)。
{
    "presets": [ // 预设(presets)的作用是为babel安装指定的插件
      ["@babel/preset-env", {
        "modules": "commonjs", // 将modules编译成commonjs
        "targets": {
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"], // 浏览器列表
          "node": "current" // 指定当前node版本
        },
      }]
    ],
  }
```
[.babelrc详解](https://www.jianshu.com/p/3881c9ee4497)


4. **安装Polyfill**
> 首先了解一下polyfill~ 

Polyfill “腻子”（装修的时候，可以把缺损的地方填充抹平）。我们希望浏览器提供一些特性，但是没有，然后我们自己写一段代码来实现他，那这段代码就是补丁。

Polyfill 是一块代码（通常是 Web 上的 JavaScript），**用来为旧浏览器提供它没有原生支持的较新的功能。**

Babel默认只转换新的JavaScript语法（syntax），如箭头函数等，而不转换新的API，比如Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象，以及一些定义在全局对象上的方法（比如Object.assign）都不会转码；因此我们需要polyfill；

因为这是一个 polyfill （它需要在源代码之前运行），我们需要让它成为一个 dependency（上线时的依赖）,而不是一个 devDependency（开发时的依赖）。

- [babel-polyfill的几种使用方式](https://www.cnblogs.com/Jeely/p/11231530.html)
- [@babel/preset-env 与@babel/plugin-transform-runtime 使用及场景区别](https://segmentfault.com/a/1190000021188054)

- 安装
``` shell
npm i babel-polyfill -S # 一般SPA应用下载这个全局引入
npm i core-js -S # 一般MPA下载这个按需加载
npm i @babel/plugin-transform-runtime @babel/runtime -D
# npm i @babel/plugin-syntax-dynamic-import -D  # 引入异步懒加载插件
```

- 配置.babelrc：
> 以下是完整版~
``` json
// .babelrc文件需要的配置项主要有预设(presets)和插件(plugins)。
{
    "presets": [ // 预设(presets)的作用是为babel安装指定的插件
      ["@babel/preset-env", {
        "modules": "commonjs", // 将modules编译成commonjs
        "targets": {
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"], // 浏览器列表
          "node": "current" // 指定当前node版本
        },
        "debug":true, // 默认false 编译时是否去掉console.log
        // a.不引入polyfill；默认，可在src/index.js入口直接引入babel-polyfill(常用于SPA应用配置)
        // "useBuiltIns": false,
        // b.按需引用（常用于MPA应用）
         "useBuiltIns": "usage", // 按需引入
         "corejs": 3 // corejs版本号
      }]
    ],
    // presets是插件plugins的预设，也就是说直接需要不需要的插件一起引入，如果不想使用presets，可以单独使用plugins对某个功能进行单独的引入。另外，有一些方法是presets中不提供的，如果要使用就需要单独引用了
    "plugins": [ 
       // "@babel/plugin-transform-runtime", // 解决编译中产生的重复的工具函数，减小代码体积。
       // "@babel/plugin-syntax-dynamic-import", // 对一些组件进行懒加载
       // "transform-vue-jsx" // 编译jsx文件
    ]
  }
```

- 入口文件src/index.js中引入babel-polyfill（SPA项目）
``` js
import 'babel-polyfill'; // 全局引入
```

- 最后，npm run dev试一下~

> 发现打包后之前的箭头函数转换为es5语法，用到的新的API如Promise也引入了polyfill：

<img :src="$withBase('/images/webpack/webpack006.jpeg')" width="auto"/>


> 按需引入的一些es6 API的polyfill：

<img :src="$withBase('/images/webpack/webpack007.jpeg')" width="auto"/>





### eslint配置
> JavaScript 是一个动态的弱类型语言，在开发中比较容易出错。因为没有编译程序，为了寻找 JavaScript 代码错误通常需要在执行过程中不断调试。像 ESLint 这样的可以让程序员在编码的过程中发现问题而不是在执行的过程中。

ESLint 是一个开源的 JavaScript 代码检查工具，代码检查是一种静态的分析，常用于寻找有问题的模式或者代码，并且不依赖于具体的编码风格。对大多数编程语言来说都会有代码检查，一般来说编译程序会内置检查工具。

- [什么是eslint](http://eslint.cn/docs/about/)

1. **安装**

``` shell
npm i eslint eslint-loader babel-eslint -D
# 首先，要使webpack支持eslint，就要安装 eslint-loader
# 其次，要想webpack具有 eslint 的能力，就要安装eslint

# eslint允许常规解析器，有一些babel语法没有被eslint支持。
# 当使用这些插件时，你的代码要转换成eslint能够支持解析的代码格式。
# babel-esLint: 一个对Babel解析器的包装，使其能够与 ESLint 兼容。

npm i eslint-friendly-formatter -D # 可选
# eslint-friendly-formatter：指定终端中输出eslint提示信息的格式。

# ///接下来安装插件
npm i eslint-plugin-vue -D 
# eslint-plugin-vue是vue官方eslint插件,检测vue语法，同时支持在 Vue 单文件组件的模板和脚本部分的代码校验。

# 引入其他第三方插件
npm i eslint-config-standard eslint-plugin-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node eslint-plugin-html -D  
# eslint-config-standard：Standard标准，它是一些前端工程师自定的标准。
# eslint-plugin-node（支持nodejs规则）
# eslint-plugin-import（import语句规则）
# eslint-plugin-html 该插件用于检查在写在vue script 标签中的代码
```
[standard](https://github.com/standard/standard/blob/master/docs/README-zhcn.md#install)
[eslint-config-standard](https://www.npmjs.com/package/eslint-config-standard)


2. **配置webpack**
``` js
// webapck.dev.js
// webpack.prod.js

...
rules: [
    {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: "pre", // 预处理eslint-loader规则
    
        /////// eslint-loader规则必须要先于babel-loader规则
        /////// 我们使用eslint-loader是为了对编译前的ES6语法进行检查，而不是对使用了babel编译后的语法进行检查。
        //////// 所以在webpack中，eslint-loader规则要优先于babel-loader规则
    
        exclude: [/node_modules/], // 不包含
        include: [path.resolve(__dirname, 'src')], // 指定检查的目录
        options: { // 这里的配置项参数将会被传递到 eslint 的 CLIEngine 
            formatter: require('eslint-friendly-formatter') // 指定错误报告的格式规范
            // formatter默认是stylish，如果想用第三方的可以安装该插件，如上方的示例中的 eslint-friendly-formatter 。
        }
    },
    ....
]
```

3. **配置eslint**
> ESlint 被设计为完全可配置的，这意味着你可以关闭每一个规则而只运行基本语法验证，或混合和匹配 ESLint 默认绑定的规则和你的自定义规则，以让 ESLint 更适合你的项目。

有两种主要的方式来配置 ESLint：
- Configuration Comments - 使用 JavaScript 注释把配置信息直接嵌入到一个代码源文件中。
- Configuration Files - 使用 JavaScript、JSON 或者 YAML 文件为整个目录（处理你的主目录）和它的子目录指定配置信息。
    > 可以配置一个独立的 .eslintrc.* 文件，或者直接在 package.json 文件里的 eslintConfig 字段指定配置，ESLint 会查找和自动读取它们，再者，你可以在命令行运行时指定一个任意的配置文件。

这里我采用的是根目录下新建`.eslintrc.js`，进行配置~

- [eslint配置](http://eslint.cn/docs/user-guide/configuring)
- [.eslintrc规则配置](http://eslint.cn/docs/rules/)


``` js
// .eslintrc.js

module.exports = {
    root: true, // 限定使用范围，当你想对一个项目的不同部分的使用不同配置，或当你希望别人能够直接使用 ESLint
    parserOptions: { // 设置解析器选项
        parser: 'babel-eslint', // 指定解析器，babel-eslint将不能被常规linter解析的代码转换为能被常规解析的代码
        ecmaVersion: 7, // 默认设置为 3，5（默认）， 你可以使用 6、7、8、9 或 10 来指定你想要使用的 ECMAScript 版本。
        sourceType: 'module' // 设置为 "script" (默认) 或 "module"（如果你的代码是 ECMAScript 模块)。
    },
    env: { // 指定代码运行的宿主环境
        browser: true, // 浏览器环境中的全局变量。
        node: true, //
        commonjs: true, // CommonJS 全局变量和 CommonJS 作用域 (用于 Browserify/WebPack 打包的只在浏览器中运行的代码)。
        es6: true // 启用除了 modules 以外的所有 ECMAScript 6 特性（该选项会自动设置 ecmaVersion 解析器选项为 6）。
    },
    extends: [ // 指定eslint规范,我们可以使用eslint官方推荐的，也可以使用一些大公司提供的的，如：aribnb, google, standard。
        'plugin:vue/essential', // 导入eslint-plugin-vue的规范
        'standard' // 引入standard规范
    ],

    // 引用第三方的插件
    // 在配置文件里配置插件时，可以使用 plugins 关键字来存放插件名字的列表。插件名称可以省略 eslint-plugin- 前缀
    plugins: [
        'vue'
    ],
    // 定义一些比较个性化的规则
    // 添加默认或第三库中没有的、覆盖默认或第三库的
    rules: {
        "indent": ["warn", 4, { "SwitchCase": 1 }], // 强制使用一致的缩进:warn警告； 4个空格缩进；强制 switch 语句中的 case 子句1个缩进
        
        // 强制使用一致的反勾号、双引号或单引号：error警告；要求尽可能地使用单引号；允许字符串使用反勾号``
        "quotes": ["error", "single", { "allowTemplateLiterals": true }],

        // 要求或禁止使用分号代替 ASI (semi)：warn警告； 要求在语句末尾使用分号（默认）
        "semi": ["warn", "always"],

        // 禁用debugger：生产环境error警告，开发环境保留
        "no-debugger": process.env.NODE_ENV === 'production' ? 'error' : 'off',

        // vue中自闭合标签：warn警告
        "vue/html-self-closing": ["warn", {
            "html": {
                "void": "any",
                "normal": "any",
                "component": "any"
            }
        }],

        // vue中script缩进：error警告；4个空格缩进；强制 switch 语句中的 case 子句1个缩进
        "vue/script-indent": ["error", 4, { "baseIndent": 0, "switchCase": 1}]
    }
}
```

4. **过滤配置**

如果有需要跳过的文件、文件夹，根目录下新建`.eslintignore`：

```
/build/
/config/
/dist/
/docs/
/node_modules
```

5. **添加命令**

``` json
// package.json
...
"scripts": {
    "lint": "eslint --ext .js,.vue src", // 检查错误
    "lint:fix": "eslint --ext .js,.vue src --fix", // 修复错误
}
```

6. **执行**

最后，`npm run lint`试一下：

<img :src="$withBase('/images/webpack/webpack101.png')" width="auto"/>

> 果不其然，有一堆warn和error警告~

`npm run lint:fix`修复一下：

<img :src="$withBase('/images/webpack/webpack102.png')" width="auto"/>

> 执行之后，src里面的大部分格式问题就被自动修复了，其他的就手动修复了~


### 模板解析(resolve)配置

- **resolve**
> Webpack 在启动后会从配置的入口模块出发找出所有依赖的模块，Resolve 配置 Webpack 如何寻找模块所对应的文件。 Webpack 内置 JavaScript 模块化语法解析功能，默认会采用模块化标准里约定好的规则去寻找，但你也可以根据自己的需要修改默认的规则。

- **模块解析**
> resolver 是一个库(library)，用于帮助找到模块的绝对路径。

> 所依赖的模块可以是来自应用程序代码或第三方的库。resolver帮助webpack找到 bundle 中需要引入的模块代码，这些代码在包含在每个 require/import 语句中。

> 当打包模块时，webpack 使用 enhanced-resolve 来解析文件路径。

- **webpack的解析规则**
    - 绝对路径：`import "/home/me/file"`;  由于我们已经取得文件的绝对路径，因此不需要进一步再做解析。
    - 相对路径：`import "../src/file1"`;    在 `import/require` 中给定的相对路径，会添加此上下文路径(context path)，以产生模块的绝对路径(absolute path)。
    - 模块路径：`import "module/lib/file"`;  模块将在 `resolve.modules` 中指定的所有目录内搜索。 你可以替换初始模块路径，此替换路径通过使用 `resolve.alias` 配置选项来创建一个别名。
> 一旦根据上述规则解析路径后，解析器(resolver)将检查路径是否指向文件或目录。如果路径指向一个文件：
- 如果路径具有文件扩展名，则被直接将文件打包。
- 否则，将使用 [resolve.extensions] 选项作为文件扩展名来解析，此选项告诉解析器在解析中能够接受哪些扩展名（例如 .js, .jsx）。

[webpack官方文档](https://www.webpackjs.com/configuration/resolve/)
[resolve讲解](https://segmentfault.com/a/1190000013176083?utm_source=tag-newest)


1. **配置**

```js
// webpack.dev.js
// webpack.prod.js

...
module.exports = {
    ...
    /////配置模板解析resolve
    resolve: {
        // 在导入语句没带文件后缀时，webpack会自动带上后缀去尝试访问文件是否存在。
        // resolve.extensions用于配置在尝试过程中用到的后缀列表
        extensions: ['.js', '.vue', '.json', '.scss', '.css', '.less'],
        alias: {
            // resolve.alias配置项通过别名来把原来导入路径映射成一个新的导入路径。
            // 例：通过 import Button from '@/components/button' 导入时，被替换成：
            // /Users/admin/my-code/self/byme/vue-webpack-project/src/components/button
            '@': path.join(__dirname, '..', 'src'),
            // $符号来缩小范围只命中以关键字结尾的导入语句
            // 例：通过 import Vue from 'vue' 导入时，被替换成：import Vue from 'vue/dist/vue.esm.js'
            'vue$': 'vue/dist/vue.esm.js'
        },
        // resolve.modules配置webpack去哪些目录下寻找第三方模块。默认是去node_modules目录下寻找。
        modules:['node_modules']
    },
}
```

2. **修改**

配置完后，把项目中导入的模块替换成`@`，然后`npm run dev`试一下~

<img :src="$withBase('/images/webpack/webpack008.jpeg')" width="auto"/>

> 可以看到，项目中通过`@`别名引入的模块打包后编译为相对路径了



### loaders配置
> webpack 可以使用 loader 来预处理文件。这允许你打包除 JavaScript 之外的任何静态资源。

loader 用于**对模块的源代码进行转换**，loader 可以使你在 import 或"加载"模块时预处理文件。

vue-loader和css-loader已经配置好了，接下来配置其他loader~

- [webpack-loader](https://www.webpackjs.com/concepts/loaders/)

#### 静态资源路径配置
> 图片、音频、视频、字体资源，静态资源路径配置~

- [file-loader](https://www.webpackjs.com/loaders/file-loader/)
- [path模块详解](https://www.cnblogs.com/fly_dragon/p/8715438.html)
- [url-loader处理css中的图片资源遇到的问题](https://www.jianshu.com/p/3429cd456982)

- 安装
``` shell
npm i url-loader file-loader -D # 安装
# url-loader功能和file-loader类似，其内部也是用了file-loader,可以设置最小资源自动base64
# url-loader对未设置或者小于limit设置的图片进行转换，以base64的格式被img的src所使用；
# 而对于大于limit byte的图片用file-loader进行解析。
# 对于比较小的图片，使用base64编码，可以减少一次图片的网络请求；
```

- 配置
``` js
//////配置
// webpack.dev.js

// modules/rules 中添加
...
{
    test: /\.(png|jpe?g|gif|bmp|webp|svg)(\?.*)?$/, // 图片解析 url-loader
    use:[
        {
            loader:'url-loader',
            options:{
                limit:10240,
                // 字节数,意味着当图片大小小于10k的话，打包时会进行base64转换
                name: path.posix.join('static', 'images/[name].[hash:7].[ext]'),
                // path.posix.join(a,b): a/b  连接多个路径，pasix兼容不同系统
                // [name]为文件名，[hash:7]为添加图片文件指纹hash值,7位，[ext]为资源后缀名
                // name所指路径其实是相对于dist文件夹的路径，打包后，会生成dist/static/images/[name]...图片文件，
                // 打包时会把项目中的图片文件路径url替换成上面配置的name内容，即：static/iamges/[name]...
            }
        }
    ]
},
...
```

- `npm run dev` 运行

运行后看下图片资源路径的变化~

> 项目中引入的图片资源路径：

<img :src="$withBase('/images/webpack/webpack103.jpeg')" width="auto"/>

> 本地跑起来后浏览器中图片的路径：

<img :src="$withBase('/images/webpack/webpack104.jpeg')" width="auto"/>



- 配置完图片loader后，继续添加视频、音频、字体等静态资源的处理，配置同图片资源

``` js
// 字体解析
{
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    use: {
        loader: 'url-loader',
        options: {
            limit: 10000,
            name: path.posix.join('static', 'fonts/[name].[hash:7].[ext]'),
            // 打包后，会生成dist/static/fonts/[name]...字体文件，
        }
    }
},
// 视频、音频解析
{
    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    use: {
        loader: 'url-loader',
        options: {
            limit: 1024,
            name: path.posix.join('static', 'medias/[name].[hash:7].[ext]'),
            // 打包后，会生成dist/static/medias/[name]...字体文件
        }
    }
},
```
> 可引入字体和音频文件试一下~

以字体为例：

- 新建styles/commons/fonts.less，引入字体~

[CSS3 @font-face 规则](https://www.runoob.com/cssref/css3-pr-font-face-rule.html)

``` css
 /* Internet Explorer 9, Firefox, Opera,Chrome, 和 Safari支持@font-face 规则. */
 /* 但是, Internet Explorer 9 只支持 .eot 类型的字体, Firefox, Chrome, Safari, 和 Opera 支持 .ttf 与.otf 两种类型字体. */
 /* 注意： Internet Explorer 8 及更早IE版本不支持@font-face 规则. */

@font-face {
    font-family: themify;
    src:url('~@/assets/fonts/themify.woff'),
        url('~@/assets/fonts/themify.ttf'),
        url('~@/assets/fonts/themify.eot'); // ie 9
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: intelOne;
    src: url('~@/assets/fonts/arial_rounded_bold.ttf');
}
```
styles/test/index.less中引入：
``` css
@import '~@/styles/commons/fonts.less';

....
.font-themify {
    font-family: themify;
}
.font-intelOne {
    font-family: intelOne;
}
.....
 /* 直接引入class即可~ */
```


#### postcss-loader
> postcss 一种对css编译的工具，类似babel对js的处理。常见功能有：**自动补全浏览器前缀、使用下一代css语法**等等

postcss 只是一个工具，本身不会对css操作，它通过插件实现功能，**autoprefixer** 就是其一。

**与 less sass 的区别：**
- less sass 是预处理器，用来支持扩充css语法；
- postcss 既不是 预处理器也不是 后处理器，其功能比较广泛，而且重要的一点是，postcss可以和less/sass结合使用。
> postcss 鼓励开发者使用规范的CSS原生语法编写源代码，支持未来的css语法，就像babel支持ES6。

::: tip PostCSS 的主要功能只有两个：
- 第一个就是前面提到的把 CSS 解析成 JavaScript 可以操作的抽象语法树结构（Abstract Syntax Tree，AST）；
- 第二个就是调用插件来处理 AST 并得到结果。
:::

> 什么是postcss：[参考1](https://www.jianshu.com/p/7646a8377138)、[参考2](https://www.jianshu.com/p/288963680642)；[谈谈postcss](https://segmentfault.com/a/1190000011595620)

- **autoprefixer**
> 可通过PostCSS插件autoprefixer自动补齐css3前缀。

autoprefixer是css的后置处理器(打包之后进行处理)，sass、less是css的预处理器(在打包之前进行处理)。

> [查看css属性哪些浏览器支持](https://caniuse.com/)、[cssnext](https://cssnext.github.io/)

::: tip 四大浏览器内核
1. Trident(-ms)：    ie浏览器
2. Geko(-moz)：    火狐浏览器
3. Webkit(-webkit)：  safari浏览器、chrome浏览器
4. Presto(-o)：       Opera浏览器
:::

1. 安装
``` shell
npm i postcss-loader autoprefixer -D # 安装
# autoprefixer：自动补齐css3前缀。

# 可选安装
npm i postcss-import postcss-cssnext -D
# postcss-import：使用postcss-import插件，遵循@import规则，你可以将reset.css样式合并到你的主样式表中，减少http请求。
# cssnext：使用下个版本的css语法，语法见cssnext (css4)语法
# postcss-px2rem：移动端适配
```

2. 配置
``` js
// webpack.prod.js

...
rules: [
    ...
    {
        test: /\.less$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'less-loader',
          {
            loader:'postcss-loader' // 引入插件
            // options:{ // autoprefixer的旧版本可以在此添加
            //     plugins:() => {
            //         require('autoprefixer')({ // 引入插件，自动给css3加前缀
            //             overrideBrowserslist:['last 2 version','>1%','ios 7'] // 指定兼容浏览器版本: 浏览器最近两个版本、使用人数>1%、ios 7以上的版本
            //         })
            //     }
            // }
        },
        ]
    },
]
```

3. 根目录下新建`postcss.config.js`文件
``` js
module.exports = {
    plugins: {
      // 'postcss-import': {},
      // 'postcss-cssnext': {},
      'autoprefixer': {}
    }
  }
```

4. 根目录新建`.browserslistrc`文件，设置兼容版本
> `browserslist`字段指定了项目的目标浏览器范围，会被 `@babel/preset-env` 和 `Autoprefixer` 用来确定需要转译的 JavaScript 特性和需要添加的 CSS 浏览器前缀。

可以在`package.json`中新加`browserslist`，设置兼容版本；或者在根目录下新建`.browserslistrc`，设置兼容版本

[browserlist](https://www.cnblogs.com/adhehe/p/11175372.html)

5. 最后，`npm run build`一下~

项目中的样式：

<img :src="$withBase('/images/webpack/webpack105.jpeg')" width="auto"/>

打包后的样式：

<img :src="$withBase('/images/webpack/webpack106.jpeg')" width="auto"/>



#### px2rem-loader（移动端）
> 移动端设备css：px自动转换为rem；不同移动设备分辨率不同，前端需要进行页面适配。

- 以前都是通过css**媒体查询**实现响应式布局：
``` css
@media screen and(max-width:800px){
    .header{
        ...
    }
}
 /* 缺点：需要写多套适配样式代码 */
```

- 现在使用`rem`实现响应式布局
> 相对根元素字体大小。使用px2rem-loader(将px转换为rem)。

1. 安装
``` shell
npm i px2rem-loader -D 
npm i lib-flexible -S # 作为依赖安装
# 此插件需要直接引用,在页面打开需要此插件动态计算根元素font-size值，即1rem等于多少px
# 也可以安装 amfe-flexible
```

2. 配置
``` js
// webpack.prod.js
...
rules: [
   {
        test: /\.less$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'less-loader',
          {
            loader:'postcss-loader' // 引入插件
            // options:{ // autoprefixer的旧版本可以在此添加
            //     plugins:() => {
            //         require('autoprefixer')({ // 引入插件，自动给css3加前缀
            //             overrideBrowserslist:['last 2 version','>1%','ios 7'] // 指定兼容浏览器版本: 浏览器最近两个版本、使用人数>1%、ios 7以上的版本
            //         })
            //     }
            // }
           },
           {
                loader:'px2rem-loader', // 引入插件，px转rem
                options:{
                    /**
                     // 1rem等于75px,以width为750px的设计稿为标准,
                     // 比如p标签内设置font-size为24px;当width为750px时，根元素font-size为37.5px;
                     // 第一步：打包的时候转为rem,24 / 75 = 0.32rem;
                     // 第二步：由lib-flexible动态计算得根元素font-size为37.5px，即该宽度下，1rem为37.5px;
                     // 第三步：计算p标签内字体展示大小：0.32 * 37.5 = 12px
                    **/
                    remUnit:75,
                    remPrecision: 8 // px转换为rem后的小数点位数
                }
            }
        ]
    },
    ]
```

如果不想在`webpack.prod.js`中配置，也可以在`postcss.config.js`中配置：
``` js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-px2rem-exclude')({ // 引入，注：这里用的是postcss-px2rem-exclude
      remUnit:75,
      remPrecision: 8,
      exclude: /node_modules/i
    })
  ]
}
```

3. 引入`flexible`
``` js
// src/index.js
import 'lib-flexible';
```

4. 入口`index.html`中修改`meta`标签
``` html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
```

5. 最后，`npm run dev`试一下~

<img :src="$withBase('/images/webpack/webpack107.jpeg')" width="auto"/>

> 跑起来后，切换到移动端模式，发现打包后的尺寸转换成了rem~且计算得该宽度下，`1rem`等于`41.4px`


#### svg-sprite-loader
> 在vue框架中想使用svg图片，就可以配置`svg-sprite-loader`~

[配置参考](https://blog.csdn.net/weixin_34120274/article/details/91440129)

1. 安装
``` shell
npm install svg-sprite-loader -D
```

2. 配置
``` js
// webpack.dev.js
// webpack.prod.js
...
// modules/rules中添加配置：
{
    test: /\.svg$/,
    loader: 'svg-sprite-loader', // svg 配置
    include: [path.resolve('src/assets/svg')],
    options: {
        symbolId: 'icon-[name]'
    }
},
{
    test: /\.(png|jpe?g|gif|bmp|webp|svg)(\?.*)?$/,
    exclude: [ path.resolve('src/assets/svg')], // 然后修改 url-loader 配置
    use: {
        loader: 'url-loader',
        options: {
            limit: 1,
            name: utils.assetsPath('images/[name].[hash:7].[ext]')
        }
    }
},
```

3. `src/components`中创建公共组件：`svg-icon`：
``` vue

<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName"/>
  </svg>
</template>

<script>
/**
 * svg 图标组件
 * iconClass="图标名称"
 * className="风格名称"
 */
export default {
    name: 'svg-icon',
    props: {
        iconClass: {
            type: String,
            required: true
        },
        className: {
            type: String
        }
    },
    computed: {
        iconName () {
            return `#icon-${this.iconClass}`;
        },
        svgClass () {
            if (this.className) {
                return 'svg-icon ' + this.className;
            } else {
                return 'svg-icon';
            }
        }
    }
};
</script>
<style lang="less">
.svg-icon {
    width: 14px;
    height: 14px;
    cursor: pointer;
}
</style>
``` 
并在根目录下`index.js`中全局注册：
``` js
import SvgIcon from '@/components/SvgIcon';

Vue.component('svg-icon', SvgIcon);
```

4. 创建svg文件目录：`/src/assets/svg/`，里面放置所有svg文件；并创建`/src/assets/index.js`，自动导入所有的svg文件：
```js
///src/assets/index.js
const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./svg', false, /\.svg$/) // 自动导入同级的 svg/ 目录下所有以 .svg 结尾的文件
requireAll(req)
```

5. 在根目录下`index.js`中引入：
``` js
import '@/assets';// 引入svg
```

6. 最后，在代码中使用：
``` html
<svg-icon icon-class="icon-transaction" class="icon" />
<!-- icon-transaction为svg文件名 -->
```




### 文件分离及缓存优化
> 在配置之前，先熟悉几个概念~

::: tip module、chunk、bundle
- **module**：对于一份同逻辑的代码，当我们手写下一个一个的文件，它们无论是 ESM 还是 commonJS 或是 AMD，他们都是 module ；
- **chunk**：当我们写的 module 源文件传到 webpack 进行打包时，webpack 会根据**文件引用关系**生成 chunk 文件，webpack 会对这个 chunk 文件进行一些操作；
- **bundle**：webpack 处理好 chunk 文件后，最后会**输出 bundle 文件**，这个 bundle 文件包含了经过加载和编译的最终源文件，所以它可以直接在浏览器中运行。
:::
module，chunk 和 bundle 其实就是同一份逻辑代码在不同转换场景下的取了三个名字；

**我们直接写出来的是 module，webpack 处理时是 chunk，最后生成浏览器可以直接运行的 bundle**。

::: tip hash、chunkhash、contenthash
- **hash**：hash 是跟整个 webpack 构建项目相关的，每次项目构建 hash 对应的值都是不同的，即使项目文件没有做“任何修改”；
    - **同一次构建过程中生成的hash都是一样的，只要项目里有文件更改，整个项目构建的 hash 值都会更改**。类似于指纹、签名。
    - 如果出口是hash，那么一旦针对项目中任何一个文件的修改，都会构建整个项目，重新获取hash值，缓存的目的将失效。
- **chunkhash**：跟 webpack 打包的 chunk 相关，具体来说webpack是根据入口 entry 配置文件来分析其依赖项并由此来构建该 entry 的 chunk，并生成对应的 hash 值；不同的 chunk 会有不同的 hash 值。
    - **一般在项目中把公共的依赖库和程序入口文件隔离并进行单独打包构建，用 chunkhash 来生成 hash 值，只要依赖公共库不变，那么其对应的 chunkhash 就不会变，从而达到缓存的目的**。
    这样又有个问题：
    > 由于采用 chunkhash ，所以项目主入口文件 main.js 及其对应的依赖文件 main.css 由于被打包在同一个模块，所以共用相同的chunkhash。只要对应css或则js改变，与其关联的文件hash值也会改变，但其内容并没有改变，所以没有达到缓存意义。
- **contenthash**：表示由文件内容产生的hash值，内容不同产生的contenthash值也不一样。在项目中，通常做法是把项目中css都抽离出对应的css文件来加以引用。所以css文件最好使用contenthash。
:::

需要注意的是：
- chunkhash 无法和热更新（HotModuleReplacementPlugin）一起使用；建议在生成环境使用，开发环境会增加编译时间；
- img和font等资源中，使用 chunkhash 会报错,所以img等资源还是用hash还添加资源指纹~但，此hash非webpack每次项目构建的hash，它是由file-loader根据文件内容计算出来的，不要误认为是webpack构建的hash!!!!!

[参考1](https://blog.csdn.net/wsyzxxn9/article/details/90677770)

[webpack hash哈希值](https://www.jianshu.com/p/b83f4a046399)

[webpack中hash与chunkhash区别和需要注意的问题](https://www.cnblogs.com/heyushuo/p/8543889.html)


接下来开始配置吧~

#### entry&output

- entry
> 入口起点(entry point)指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。

- output
> output 属性告诉 webpack 在哪里输出它所创建的 bundles，以及如何命名这些文件，默认值为./dist。基本上，整个应用程序结构，都会被编译到你指定的输出路径的文件夹中。

[webpack官方配置参考](https://www.webpackjs.com/configuration/#%E9%80%89%E9%A1%B9)、[入口起点(entry points)](https://www.webpackjs.com/concepts/entry-points/)、[输出(output)](https://webpack.docschina.org/configuration/output/)




**配置**

`webpack.dev.js`中添加配置：
``` js
// webpack.dev.js

module.export = {
    // entry 指定webpack打包入口文件 ,从入口文件开始，寻找依赖文件，一层层遍历，形成依赖树，最后打包生成文件
    // 起点或是应用程序的起点入口。从这个起点开始，应用程序启动执行。如果传递一个数组，那么数组的每一项都会执行。
    // 动态加载的模块不是入口起点。
    // 简单规则：每个 HTML 页面都有一个入口起点。单页应用(SPA)：一个入口起点，多页应用(MPA)：多个入口起点。
    // 命名：如果传入一个字符串或字符串数组，chunk 会被命名为 main。如果传入一个对象，则每个键(key)会是 chunk 的名称，该值描述了 chunk 的入口起点。
    // entry: './src/index.js', // 单页面入口配置（简写形式）
    // 同上
    // entry: {
    //     main: './src/index.js',
    // },
    entry: {
        main: './src/index.js', // 入口文件
        vendors: ['vue', 'vue-router'] // 分离第三方库
    },
    // output 告诉webpack如何将编译后的文件输出到磁盘
    // 没有单多页面的区别，通过占位符确保文件名称唯一
    output: { // 输出文件
        path: path.join(__dirname, '../dist'), // 所有输出文件的目标路径，绝对路径
        publicPath: getPublicPath(), // 输出解析文件的目录，url 相对于 HTML 页面
        // path是webpack所有文件的输出的路径，必须是绝对路径，比如：output输出的js,url-loader解析的图片，HtmlWebpackPlugin生成的html文件，都会存放在以path为基础的目录下
        // publicPath 并不会对生成文件的路径造成影响，主要是对你的页面里面引入的资源的路径做对应的补全，常见的就是css文件里面引入的图片
        // “path”仅仅告诉Webpack结果存储在哪里，
        // publicPath设置成相对路径后，相对路径是相对于build之后的index.html的。


        filename: 'js/[name]_[hash:8].js',
        // 对应于 entry 里面的输入文件，经过webpack 打包后输出文件的文件名。
        // 
        chunkFilename: 'js/[name]_[chunk:8].js',
        // 指未被列在 entry 中，却又需要被打包出来的 chunk 文件的名称，一般是异步加载的文件。
        // 如果没有配置chunkFilename，就会把 [name] 替换为 chunk 文件的 id 号，打包后会生成例如：1.bundle.js这种文件~
        //////// 开发环境chunkhash不能和热更新一起用，所以不用chunkhash

        // libraryTarget: 'umd',
        // 将你的 library 暴露为所有的模块定义下都可运行的方式。它将在 CommonJS, AMD 环境下运行，或将模块导出到 global 下的变量。
        // umdNamedDefine: true 
        // 当使用了 libraryTarget: "umd",会对 UMD 的构建过程中的 AMD 模块进行命名。否则就使用匿名的 define。
    },
}
```

`webpack.prod.js`中添加配置：
``` js
// webpack.prod.js
const argv = require('yargs').argv; // node工具：获取命令行参数
const getPublicPath = function() {
    console.log('====argv',argv);
    let url = argv && argv.publicPath;
    if (url) {
        if (/^\/|http/.test(url)) {
            url = url;
        } else {
            url = '/' + url;
        }
    } else {
        url = '/';
    }
    console.log('====url',url);
    return url;
};
...
module.export = {
    entry: {
        main: './src/index.js', // 入口文件
        // vendors: ['vue', 'vue-router'] // 分离第三方库  开发环境可通过splitChunks进行分离
    },
    output: { // 输出文件
        path: path.join(__dirname, '../dist'), // 所有输出文件的目标路径，绝对路径
        publicPath: getPublicPath(), // 输出解析文件的目录，url 相对于 HTML 页面
        filename:'js/[name]_[chunkhash:8].js', // 中括号中name为占位符 chunkhash添加js指纹
        chunkFilename: 'js/[name]_[chunkhash:8].js',
    },
}
```

**参考**：
- [path和publicPath](https://blog.csdn.net/qq_39207948/article/details/80631435)
- [publicPath详解](https://juejin.im/post/5ae9ae5e518825672f19b094?utm_source=gold_browser_extension)
- [基于webpack的持久化缓存方案](https://github.com/pigcan/blog/issues/9)


#### js代码打包分离
> 在 webpack3 中我们使用 `webpack.optimize.CommonsChunkPlugin` 插件进行提取，webpack4 中我们可以直接使用 `optimization` 配置项进行配置

1. 配置
``` js
// webpack.prod.js

module.export = {
    ...
    // 分块优化
    // 主要就是根据不同的策略来分割打包出来的bundle。
    optimization: { // 2.分离第三方库
        splitChunks: {
            // chunks: 'all', // 同时分割同步和异步代码，它其实就是下面的配置

            // a.webpack4本身默认配置
            // cacheGroups: {
            //     vendors: { // 第三方
            //       test: /[\\/]node_modules[\\/]/,
            //       priority: -10 // 优先级
            //     },
            //     default: { // default这一项表示默认的缓存组，包括其它共享模块，但大于30k的
            //       minChunks: 2, // 最小引用次数
            //       priority: -20,
            //       reuseExistingChunk: true
            //     }
            //   },

            // b.自定义配置
            minSize: 0, // 为0则只要有引用就打包
            cacheGroups: { // 可以实现对文件模块的细粒度控制
                vendor: { // 第三方库
                    test: /[\\/]node_modules[\\/]/, // node-modules里的第三方库
                    name: 'vendors', // 提取出来，名字叫vendors
                    filename: 'js/[name]_[chunkhash:8].js',
                    chunks: 'all' // 同时分割同步和异步代码
                },
                commons: { // 打包entry入口中的公共模块
                    name: 'commons', // 名字叫commons
                    chunks: 'all',
                    filename: 'js/[name]_[chunkhash:8].js',
                    minChunks: 2 // 只要引用次数达2次，即分离出来进行打包
                }
            }
        }
    },
}
```

2. `npm run build`一下~

<img :src="$withBase('/images/webpack/webpack109.jpeg')" width="auto"/>

> 打包之后可看到js模块已经分离了~


**参考**
- [webpack_优化(Optimization)](https://webpack.docschina.org/configuration/optimization/#optimization-splitchunks)
- [SplitChunksPlugin介绍](https://github.com/lvzhenbang/webpack-play/blob/master/doc/first/splitchunkplugin.md)
- [Webpack 4 教程 - 4. 使用SplitChunksPlugin插件进行代码分割](https://segmentfault.com/a/1190000016623314)
- [理解webpack4.splitChunks](https://www.cnblogs.com/kwzm/p/10314438.html)


#### 单独提取css文件
> webpack3+版本一般使用 `extract-text-webpack-plugin`插件，4+版本使用 `mini-css-extract-plugin`新插件代替。

1. 安装
``` shell
npm i mini-css-extract-plugin -D
```

2. 配置
``` js
// webpack.prod.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 引入添加css指纹插件

....

module.export = {
    ...
    rules: [
            //  在引入样式loader的地方把vue-style-loader替换成MiniCssExtractPlugin.loader，例：
         {
            test: /\.css$/,
            use: [ // 链式调用 从右到左，先用css-loader解析css,再传递给vue-style-loader
            // 'vue-style-loader',
            MiniCssExtractPlugin.loader, 
            // 该插件不能与style-loader一起使用，因前者是把样式提取出来，而后者是把样式插入到header里面，功能互斥
            'css-loader'
            ]
        },
        ...
    ],
    plugins: [
        new MiniCssExtractPlugin({ // css包分离，添加css指纹插件 [contenthash]
            filename:'css/[name]_[contenthash:8].css'
        }),
    ]
}
```

3. `npm run build`一下~

<img :src="$withBase('/images/webpack/webpack201.jpeg')" width="auto"/>

> 打包之后，生成一个css文件，生成link标签，插入到head中~

**参考**
- [mini-css-extract-plugin插件快速入门](https://www.jianshu.com/p/bf4cb3a67a3a)



### 压缩
> 浏览器从服务器访问网页时获取的JavaScript，css资源都是文本形式的，文件越大网页加载时间越长。 为了提升网页加速速度和减少网络传输流量， 可以对这些资源进行压缩。 压缩的方法除了可以通过GIZP算法对文件压缩外，还可以对文本本身压缩。

- html压缩
> `html-webpack-plugins`在打包`index.html`文件的时候会对html自动压缩。

- js压缩
> webpack3+一般使用`uglifyjs-webpack-plugin`插件进行压缩，v4+之后webpack内置了`uglifyjs-webpack.pugin`插件，mode为production是自动开发压缩。[参考](https://www.webpackjs.com/plugins/uglifyjs-webpack-plugin/)

- css压缩
> 使用`optimize-css-assets-webpack-plugin`进行压缩。[参考](https://www.jianshu.com/p/f8beef1d6148)


1. 安装
> **cssnano**：cssnano 将你的 CSS 文件做多方面的的优化，以确保最终生成的文件对生产环境来说体积是最小的。[官网](https://www.cssnano.cn/guides/)
``` shell
npm i optimize-css-assets-webpack-plugin cssnano -D
# cssnano：css处理器
```

2. 配置
``` js
// webpack.prod.js
const OptimizeCSSAssetsPlugins = require('optimize-css-assets-webpack-plugin') // 引入css压缩插件

...
module.export = {
    ...
    plugins: [
        ...
         new OptimizeCSSAssetsPlugins({ // css压缩
            assetNameRegExp:/\.css$/g, // 于匹配需要优化或者压缩的资源名
            cssProcessor:require('cssnano') // 依赖cssnano css处理器
        }),

    ]
}
```
3. 运行
> 最后npm run build试一下，会发现，打包后的css文件体积减小


### plugins（插件）配置
我们还可以引入一些插件进行一些配置优化，这里罗列一些常用的plugin~

#### 自动清除构建目录产物
> `clean-webpack-plugin`：[github地址](https://github.com/johnagan/clean-webpack-plugin#options-and-defaults-optional)、[简介](https://www.jianshu.com/p/dd67a3b64b62)

1. 安装
``` shell
npm install --save-dev clean-webpack-plugin
```

2. 配置
``` js
// webpack.prod.js

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

...
module.export ={
    ...
    plugins: [
        new CleanWebpackPlugin(), // 清理目录
    ]
}
```

3. 最后，`npm run build`，这样每次打包之前就会自动删除`dist`文件了~


#### 运行命令行时提示语优化
> `friendly-errors-webpack-plugin`：[npm地址](https://www.npmjs.com/package/friendly-errors-webpack-plugin)

1. 安装
``` shell
# 安装
npm install friendly-errors-webpack-plugin --save-dev
```

2. 配置
``` js
// webpack.prod.js
// webpack.dev.js

const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
 
var webpackConfig = {
  // ...
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
  ],
  // ...
}
```

3. 最后，`npm run build`跑一下试试~

#### 打包分析插件
> webpack-bundle-analyzer，打包体积分析工具。

- [webpack-bundle-analyzer打包文件分析工具](https://www.cnblogs.com/hss-blog/p/10244315.html)
- [npm地址](https://www.npmjs.com/package/webpack-bundle-analyzer)

1. 安装
``` shell
# 安装
npm i webpack-bundle-analyzer -D
```

2. 添加命令
``` json
////package.json
"scripts": {
    "analyze": "npm_config_report=true npm run build",
}
```

3. 配置
``` js
//////webpack.prod.js
////修改下结构
const prodConfig = {
    ....
}

//////引入打包体积分析
if (process.env.npm_config_report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    prodConfig.plugins.push(new BundleAnalyzerPlugin())
    // new BundleAnalyzerPlugin({...})可以配置参数
}
////////

module.exports = prodConfig
```

4. 运行
``` shell
npm run analyze
# 运行成功后，默认在浏览器打开http://127.0.0.1:8888/
```

5. 看到如下页面，即运行成功~

<img :src="$withBase('/images/webpack/webpack202.png')" width="auto"/>

> 可通过此图分析打包后的文件大小，优化代码体积~


#### 启动速度优化
> `hard-source-webpack-plugin`：缓存，启动服务时提速。

`hard-source-webpack-plugin`是webpack的插件，为模块提供中间缓存步骤。为了查看结果，您需要使用此插件运行webpack两次：第一次构建将花费正常的时间。第二次构建将显着加快（大概提升90%的构建速度）。

[配置参考](https://blog.csdn.net/mnhn456/article/details/82757834)

``` js
// 1.安装
npm install --save-dev hard-source-webpack-plugin


// 2.配置
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
new HardSourceWebpackPlugin({
    // cacheDirectory是在高速缓存写入。默认情况下，将缓存存储在node_modules下的目录中，因此如 
    // 果清除了node_modules，则缓存也是如此
    cacheDirectory: 'node_modules/.cache/hard-source/[confighash]',
    // Either an absolute path or relative to webpack's options.context.
    // Sets webpack's recordsPath if not already set.
    recordsPath: 'node_modules/.cache/hard-source/[confighash]/records.json',
    // configHash在启动webpack实例时转换webpack配置，并用于cacheDirectory为不同的webpack配 
    // 置构建不同的缓存
    configHash: function(webpackConfig) {
       // node-object-hash on npm can be used to build this.
       return require('node-object-hash')({sort: false}).hash(webpackConfig);
    },
    // 当加载器，插件，其他构建时脚本或其他动态依赖项发生更改时，hard-source需要替换缓存以确保输 
    // 出正确。environmentHash被用来确定这一点。如果散列与先前的构建不同，则将使用新的缓存
    environmentHash: {
       root: process.cwd(),
       directories: [],
       files: ['package-lock.json', 'yarn.lock'],
    },
})
```
> 配置完成后，重新`npm run dev`试一下，发现在第二次的时候确实快了很多，它是把缓存放在了`dist`文件夹下面了~


#### 其他插件
> 除了上面这些，当然还有很多其他的插件，这里先简单记录下，有些是使用比较简单，有些不是很了解；等以后有时间了再完善细节~

1. 分离文件插件（主要用于基础库的分离）：`html-webpack-externals-plugin`
2. 拷贝静态文件：`copy-webpack-plugin`
3. 图片压缩：`image-webpack-loader`
4. 开启多进程 Loader 转换，提升打包效率：`happypack`；[参考](https://blog.csdn.net/u012987546/article/details/100775406)
5. 增强代码压缩，提升打包效率：`webpack-parallel-uglify-plugin`；[参考](https://www.cnblogs.com/tugenhua0707/p/9569762.html)
6. 多进程，多实例构建（资源并行解析）：`thread-loader`
7. 抽离第三方模块：webpack内置的`DllPlugin DllReferencePlugin`；[参考1](https://juejin.im/post/5cb36a3ef265da03a1581d6d#heading-56)、[参考2](https://juejin.im/post/5c3c55aa51882524b4073394#heading-7)
8. 给文件添加说明：webpack内置的`BannerPlugin`
9. 预加载资源：`preload-webpack-plugin`，Preloading，Prefetching

- [配置优化参考](https://juejin.im/post/5de87444518825124c50cd36#heading-22)


## 其他


### treeing shaking(摇树优化)
1个模块可能有多个方法，只要其中的某个方法使用到了，则整个文件都会被打到bundle里面去，tree shaking就是只把用到的方法打到bundle，没用到的方法会在uglify阶段被擦除掉。

> 根据webpack官网的提示，webpack2 支持 tree-shaking，需要修改配置文件，在.babelrc里设置modules:false即可；**webpack 3 和 4 默认支持，production mode模式下默认开启**。

[Webpack 之 treeShaking](https://www.jianshu.com/p/cf930283d404)

::: tip 特点
- 必须是es6的语法，CJS的方式不支持
- 原理：
    - 利用DCE进行代码消除。
    - 利用es6模块的特点：
        1. 只能作为模块顶层的语句出现
        2. import的模块名只能是字符串常量
        3. import binding 是 immutable(不变的)
- **代码擦除**：通过静态分析，将没用的代码注释标记，在uglify阶段删除无用代码
:::

- **DCE(dead code elimination)死码消除**
> DCE，即死码消除，编译器原理中，死码消除（Dead code elimination）是一种编译最优化技术，它的用途是移除对程序运行结果没有任何影响的代码。移除这类的代码有两种优点，不但可以减少程序的大小，还可以避免程序在运行中进行不相关的运算行为，减少它运行的时间。不会被运行到的代码（unreachable code）以及只会影响到无关程序运行结果的变量（Dead Variables），都是死码（Dead code）的范畴。

- **CJS(Common js)**
> CommonJS是nodejs也就是服务器端广泛使用的模块化机制。该规范的主要内容是，模块必须通过 module.exports 导出对外的变量或接口，通过 require() 来导入其他模块的输出到当前模块作用域中。

> CommonJS 中的模块加载是同步的, 不适合在浏览器中使用;

``` js
// 示例：
var m1 = require('module1');
//code
module.exports = {}
```

[配置问题](https://juejin.im/post/5de87444518825124c50cd36#heading-33)



### Scope Hoisting
> Scope Hoisting 可以让 Webpack 打包出来的代码文件更小、运行的更快，它又译作 "作用域提升"，是在 Webpack3 中新推出的功能。

[通过Scope Hoisting优化Webpack输出](https://segmentfault.com/a/1190000012600832)

- **未使用缺点：**
    - 构建后的代码存在大量闭包代码
    - 大量的函数闭包包裹代码，导致体积增大(模块越多越明显)
    - 运行代码时创建的函数作用域变多，内存开销变大

- **优点**：通过`scope hoisting`可以减少函数声明代码和内存开销。

- **原理**：分析出模块之间的依赖关系，尽可能的把打散的模块合并到一个函数中去，但前提是不能造成代码冗余。

- **使用：**
1. 由于 Scope Hoisting 需要分析出模块之间的依赖关系，因此源码必须采用 ES6 模块化语句，不然它将无法生效。
2. webpack3需要手动引入:`new webpack.optimize.ModuleConcatenationPlugin()`；**webpack4的`mode`为生产模式时默认自动开启**。

### .gitignore
.gitignore：添加不用上传到git上的文件
``` js
// 根目录下新建.gitignore文件

// 添加不用上传到git上的文件路径
.DS_Store
node_modules/
/dist/

///// 之后push代码到git上则不会提交上述的文件~
```


### nodemon
> 实际工作中，当我们改修项目的配置文件时，需要重新启动服务。由于用习惯了webpack的hot热重载，因此也希望再修改config配置文件时项目能够自动重启，于是这里用到了nodemon

- [node自动重启项目工具nodemon](https://www.jianshu.com/p/7571a866a047)

``` js
// 安装
npm install --save-dev nodemon


// 添加命令
"scripts": {
    "dev": "webpack-dev-server --progress --colors --inline --config webpack.dev.conf.js  ",
    "startdev": "nodemon --watch webpack.dev.conf.js --exec  npm run dev "
  },

// 启动
npm run startdev
```
此时修改文件webpack.dev.conf.js，会运行npm run dev命令；nodemon默认监听项目目录内的所有文件变动。


### webpack-merge
webpack配置公共部分提取出来(webpack-merge)

``` js
// 安装
npm i webpack-merge -D

// 配置
// webpack.base.js
// 提取webpack.dev.js和webpack.prod.js中公共部分到这个文件


// webpack.prod.js

const baseConfig = require('./webpack.base.js');
const merge = require('webpack-merge');

module.exports = merge(baseConfig,{
    ///prod环境单独的配置
    ......
})
```

### .npmrc
根目录下新建`.npmrc`文件
``` js
package-lock=false  // 禁止生成package-lock.json文件
```
对于要不要生成`package-lock.json`可以参考这篇文章：[package-lock.json的作用](https://mp.weixin.qq.com/s/heg7oZRjTHKilE0R0e-nvw)


## 备注
1. 虽然现在`vue3`已经出来了，webpack也已经更新到`v5+`版本了，但现在公司的大多数项目还是vue2+搭配webpack4+搭建项目，估计得等vue3的坑踩得差不多了才开始大面积使用吧~



## 问题
1. 在使用`postcss-px2rem + px2rem-loader`配置时，出现**vue中样式能够转换，.less文件中样式不能转换**的问题？
> module/rules里面less文件的解析loader顺序有问题~
``` js
// 按照从右到左的顺序解析，应该是先用less-loader解析.less文件，然后再用postcss-loader和px2rem-loader进行解析~

{
    test: /\.less$/,
    use: [
      'vue-style-loader',
      'css-loader',
      // 'less-loader',
      {
        loader:'postcss-loader'
       },
       {
            loader:'px2rem-loader', 
            options:{
                remUnit:75,
                remPrecision: 8 // px转换为rem后的小数点位数
            }
        },
        'less-loader' // 应该放在最后面
    ]
},
```
当然更好的方式是把配置信息写在`postcss.config.js`里面~

2. rule里面添加babel-loader，run build后通过异步（import）导入的模块没有单独打包成js文件？
> 将import换成require.ensure再打包~

3. `npm run build`的时候报错：
``` shell
Error: SplitChunksPlugin: You are trying to set a filename for a chunk which is (also) loaded on demand.
 The runtime can only handle loading of chunks which match the chunkFilename schema. Using a custom filename would fail at runtime. (cache group: vendor)
```
参考：[webpack4.X修改SplitChunksPlugin.vendors.filename报错](https://segmentfault.com/a/1190000023050468)

修改如下：
``` js
optimization: {
        splitChunks: {
            minSize: 0,
            cacheGroups: {
                vendor: { // 第三方库
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    // filename: 'js/[name]_[hash:8].js',  // 把filename注释掉
                    chunks: 'all'
                }
            }
        }
    },
```

## 参考
1. [webpack官方配置](https://www.webpackjs.com/configuration/#%E9%80%89%E9%A1%B9)
2. [Webpack 配置详解（含 4）——关注细节](https://segmentfault.com/a/1190000014685887)
3. [github webpack-play](https://github.com/lvzhenbang/webpack-play)
4. [webpack中容易混淆的知识点](https://juejin.im/post/5cede821f265da1bbd4b5630)
5. [参考](https://juejin.im/post/5cb36a3ef265da03a1581d6d#heading-45)
6. [Javascript如何与Sass,Less,Css之间共享变量](https://blog.csdn.net/qq_39953537/article/details/89029868)



## 个人记录
> 这部分是我在搭建过程中的问题记录，可以忽略~
1. 打包资源路径404问题？publicPath？
> devServer  loader  output  plugins配置里的publicPath有什么区别
2. vue-loader配置?
3. babel 异步懒加载 `@babel/plugin-syntax-dynamic-import`？`core-js`与`babel-polyfill`? 


<fix-link label="Back" href="/tool/webpack/"></fix-link>

<!-- 2021-05-13 -->


