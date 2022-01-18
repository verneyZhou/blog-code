# Webpack原理深析（理论篇）


## Webpack 打包流程分析



### 初始化

这一步会从我们配置的`webpack.config.js`中读取到对应的配置参数和`shell`命令中传入的参数进行合并得到最终打包配置参数。

这一步主要完成打包流程中的第一步：合并配置参数。


### 编译阶段
这一步会通过调用`webpack()`方法返回一个`compiler`方法，创建我们的`compiler`对象，并且注册各个`Webpack Plugin`。找到配置入口中的`entry`代码，调用`compiler.run()`方法进行编译。


- **创建`compiler`对象**
> 在得到最终的配置参数之后, 通过参数创建`compiler`对象。官方案例中通过调用`webpack(options)`方法返回的是一个`compiler`对象。并且同时调用`compiler.run()`方法启动的代码进行打包。

``` js
// 入口
// index.js
const webpack = require('./webpack');
const config = require('../example/webpack.config');
// 步骤1: 初始化参数 根据配置文件和shell参数合成参数
// 步骤2: 调用Webpack(options) 初始化compiler对象

// webpack()方法会返回一个compiler对象
const compiler = webpack(config);

// 调用run方法进行打包
compiler.run((err, stats) => {
  if (err) {
    console.log(err, 'err');
  }
  // ...
});



// webpack.js
const Compiler = require('./compiler');

function webpack(options) {
  // 合并参数
  const mergeOptions = _mergeOptions(options);
  // 创建compiler对象
  const compiler = new Compiler(mergeOptions);
  // 加载插件
  _loadPlugin(options.plugins, compiler);
  return compiler;
}



// compiler.js
// 我们在Compiler这个类的构造函数中创建了一个属性hooks，它的值是三个属性run、emit、done。
const { SyncHook } = require('tapable');

class Compiler {
  constructor(options) {
    this.options = options;
    // 创建plugin hooks
    this.hooks = {
      // 开始编译时的钩子
      run: new SyncHook(),
      // 输出 asset 到 output 目录之前执行 (写入文件之前)
      emit: new SyncHook(),
      // 在 compilation 完成时执行 全部完成编译执行
      done: new SyncHook(),
    };
  }

  // run方法启动编译
  // 同时run方法接受外部传递的callback
  run(callback) {}
}

```


上面在创建`hooks`的时候用到了`tapable`的`SyncHook`方法，这里`tapable`很重要，先讲一下~

#### Tapable
> [Tapable](https://github.com/webpack/tapable)包本质上是为我们更方面创建自定义事件和触发自定义事件的库，类似于`Nodejs`中的`EventEmitter Api`。

Webpack 的成功之处，不仅在于强大的打包构建能力，也在于它灵活的插件机制。Webpack 本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是 Tapable。
> Webpack 中的插件机制就是基于 Tapable 实现与打包流程解耦，插件的所有形式都是基于 Tapable 实现。

其实tapable的核心思路有点类似于node.js中的events，最基本的发布/订阅模式。
``` js
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// 注册事件对应的监听函数
myEmitter.on('start', (params) => {
    console.log("输出", params)
});

// 触发事件 并传入参数
myEmitter.emit('start', '学习webpack工作流'); // 输出 学习webpack工作流

```

tapable提供的钩子有如下10个:
``` js
const {
    SyncHook, // 同步串行	不关心监听函数的返回值
    SyncBailHook, // 同步串行	只要监听函数中有一个函数的返回值不为 undefined，则跳过剩下所有的逻辑
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesLoopHook,
    AsyncSeriesWaterfallHook
 } = require("tapable");
```
可以发现`tapable`提供了各种各样的`hook`来帮我们管理事件是如何执行的; `tapable` 的核心功能就是控制一系列注册事件之间的执行流控制，比如我注册了三个事件，我可以希望他们是并发的，或者是同步依次执行，又或者其中一个出错后，后面的事件就不执行了，这些功能都可以通过 `tapable` 的 `hook` 实现。

`Tapable`中比较重要的两个方法是`call`和`tap`两个方法。
- `tap`收集订阅的事件, 每次调用tap，就是收集当前`hook`实例所有订阅的事件到`taps`数组;
- `call`方法会根据`hook`的种类动态生成对应的执行体。


在 webpack 编译阶段会生成 Compiler 对象，而 Compiler 是继承了 Tapable 的，同时 webpack 的生命周期 hooks 都是各种各样的钩子。

> 参考：[Webpack插件机制之Tapable-源码解析](https://juejin.cn/post/6844904004435050503)



- **编写`Plugin`**
> 在创建完成`Compiler`对象后，就开始调用`_loadPlugin`方法进行插件注册。

任何一个`webpack`插件都是一个类，每个插件都必须存在一个`apply`方法, 这个`apply`方法会接受一个`compiler`对象。
``` js
// webpack.js

// 加载插件函数
function _loadPlugin(plugins, compiler) {
  if (plugins && Array.isArray(plugins)) {
    plugins.forEach((plugin) => {
      plugin.apply(compiler);
    });
  }
}

// plugin-a.js
// 插件A
class PluginA {
  apply(compiler) {
    // 注册同步钩子
    // 这里的compiler对象就是我们new Compiler()创建的实例
    compiler.hooks.run.tap('Plugin A', () => {
      // 调用
      console.log('PluginA');
    });
  }
}

module.exports = PluginA;
```
关于`webpack`插件本质上就是通过发布订阅的模式，通过`compiler`上监听事件。然后在打包编译过程中触发监听的事件从而添加一定的逻辑影响打包结果。

> 我们在每个插件的`apply`方法上通过`tap`在编译准备阶段(也就是调用`webpack()`函数时)进行订阅对应的事件，当我们的编译执行到一定阶段时发布对应的事件告诉订阅者去执行监听的事件，从而达到在编译阶段的不同生命周期内去触发对应的`plugin`。

在我们`_loadePlugins`函数中, 对于每一个传入的插件在`compiler`实例对象中进行了订阅，那么当我们调用`run`方法时，等于真正开始执行编译。


- **寻找 entry 入口**
> 任何一次打包都需要入口文件，接下来让我们就从真正进入打包编译阶段。首当其冲的事情就是，我们需要根据入口配置文件路径寻找到对应入口文件。

``` js
// compiler.js

// run方法启动编译
  // 同时run方法接受外部传递的callback
  run(callback) {
    // 当调用run方式时 触发开始编译的plugin
    this.hooks.run.call();
    // 获取入口配置对象, 获得入口文件的绝对路径
    const entry = this.getEntry();
  }
```
`getEntry`方法会将入口路径最终转换为为`{ [模块名]:[模块绝对路径]... }`的形式。


### 模块编译阶段
> 上边讲了关于编译阶段的准备工作, 接下来进入模板编译阶段~

::: tip 在模块编译阶段，需要做的事件：
- 根据入口文件路径分析入口文件，对于入口文件进行匹配对应的`loader`进行处理入口文件。
- 将`loader`处理完成的入口文件使用`webpack`进行编译。
- 分析入口文件依赖，重复上边两个步骤编译对应依赖。
- 如果嵌套文件存在依赖文件，递归调用依赖模块进行编译。
- 递归编译完成后，组装一个个包含多个模块的`chunk`
:::

- **调用`loader`处理匹配后缀文件**
> 简单来说`loader`本质上就是一个函数，接受我们的源代码作为入参同时返回处理后的结果。[loader 特性](https://webpack.docschina.org/concepts/loaders/#loader-features)

``` js
// compiler.js

// 模块编译方法
  buildModule(moduleName, modulePath) {
    // 1. 读取文件原始代码
    const originSourceCode =
      ((this.originSourceCode = fs.readFileSync(modulePath)), 'utf-8');
    // moduleCode为修改后的代码
    this.moduleCode = originSourceCode;
    //  2. 调用loader进行处理
    this.handleLoader(modulePath);
  }
```

对于传入的文件路径匹配到对应后缀的`loader`后，依次倒序执行`loader`处理我们的代码。最终，在每一个模块编译中`this.moduleCode`都会经过对应的`loader`处理。


- **webpack 模块编译阶段**

1. 从入口模块进行分析，调用匹配文件的`loaders`对文件进行处理。同时分析模块依赖的模块，递归进行模块编译工作。
2. 在递归完成后，每个引用模块通过`loaders`处理完成同时得到模块之间的相互依赖关系;
3. 得到`loader`处理后的结果后，通过`babel`分析`loader`处理后的代码，进行代码编译。
   > 将每个依赖的模块编译后的对象加入`this.modules`, 将每个入口文件编译后的对象加入`this.entries`。

每个模块间的依赖关系，依赖于`AST`语法树。每个模块文件在通过`Loader`解析完成之后，会通过`acorn`库生成模块代码的`AST`语法树，通过语法树就可以分析这个模块是否还有依赖的模块，进而继续循环执行下一个模块的编译解析。


### 编译完成阶段
> 在上一步我们完成了模块之间的编译，在将所有模块递归编译完成后，我们需要根据上述的依赖关系，组合最终输出的`chunk`模块。

``` js
// compiler.js

// 根据入口文件和依赖模块组装chunks
    buildUpChunk(entryName, entryObj) {
    const chunk = {
        name: entryName, // 每一个入口文件作为一个chunk
        entryModule: entryObj, // entry编译后的对象
        modules: Array.from(this.modules).filter((i) =>
        i.name.includes(entryName)
        ), // 寻找与当前entry有关的所有module
    };
    // 将chunk添加到this.chunks中去
    this.chunks.add(chunk);
    }
```
这里根据对应的入口文件通过每一个模块`(module)`的`name`属性查找对应入口的所有依赖文件。




### 输出文件阶段
> 整理模块依赖关系，同时将处理后的文件输出到`ouput`的磁盘目录中。

``` js
// compiler.js

   class Compiler {
   
   }
  // run方法启动编译
  // 同时run方法接受外部传递的callback
  run(callback) {
    // 当调用run方式时 触发开始编译的plugin
    this.hooks.run.call();
    // 获取入口配置对象
    const entry = this.getEntry();
    // 编译入口文件
    this.buildEntryModule(entry);
    // 导出列表;之后将每个chunk转化称为单独的文件加入到输出列表assets中
    this.exportFile(callback);
  }

```
在`buildEntryModule`模块编译完成之后，通过`this.exportFile`方法实现导出文件的逻辑。

::: tip exportFile做了如下几件事:
- 首先获取配置参数的输出配置，迭代我们的`this.chunks`，将`output.filename`中的`[name]`替换称为对应的入口文件名称。同时根据`chunks`的内容为`this.assets`中添加需要打包生成的文件名和文件内容。
- 将文件写入磁盘前调用`plugin`的`emit`钩子函数。
- 判断`output.path`文件夹是否存在，如果不存在，则通过`fs`新建这个文件夹。
- 将本次打包生成的所有文件名( this.assets 的 key 值组成的数组)存放进入 files 中去。
- 循环`this.assets`，将文件依次写入对应的磁盘中去。
- 所有打包流程结束，触发`webpack`插件的`done`钩子。
:::

最终`Webpack`打包出来的`bundle`文件是一个`IIFE`的执行函数。
> 在打包生成的`bundle`文件中，有一个`__webpack_require__`方法，它是Webpack内部实现的一套依赖引入函数, 我们在模块化开发的时候，通常会使用`ES Module`或者`CommonJS`规范导出/引入依赖模块，`webpack`打包编译的时候，会统一替换成自己的`__webpack_require__`来实现模块的引入和导出，从而实现模块缓存机制，以及抹平不同模块规范之间的一些差异性。


- **总结**

1. 读取`webpack`的配置参数；
2. 启动`webpack`，创建`Compiler`对象并开始解析项目；
3. 从入口文件`（entry）`开始解析，并且找到其导入的依赖模块，递归遍历分析，形成依赖关系树；
4. 对不同文件类型的依赖模块文件使用对应的`Loader`进行编译，最终转为`Javascript`文件；
5. 整个过程中`webpack`会通过发布订阅模式，向外抛出一些`hooks`，而`webpack`的插件即可通过监听这些关键的事件节点，执行插件任务进而达到干预输出结果的目的。


<img class="zoom-custom-imgs" :src="$withBase('/images/webpack/webpack302.png')" width="auto"/>


> 参考：[Webapck5核心打包原理全流程解析](https://juejin.cn/post/7031546400034947108)



## 原理

- 收集依赖
- ES6转ES5
- 替换require和exports

### 热更新（HMR）
> 动态模块热加载, `Hot Module Replacement`，简称`HMR`，无需完全刷新整个页面的同时，更新模块。

:::tip 优点
- 可以实现局部更新，避免多余的资源请求，提高开发效率
- 在更新的时候可以保存应用原有状态
- 在代码修改和页面更新方面，实现所见即所得
:::

刷新一般分两种：
- 一种是页面刷新，不保留页面状态，就是简单粗暴，直接`window.location.reload()`。
- 另一种是基于`WDS (Webpack-dev-server)`的模块热替换，只需要局部刷新页面上发生变化的模块，同时可以保留当前的页面状态，比如复选框的选中状态、输入框的输入等。


#### webpack的编译构建过程

1. 项目启动后，进行构建打包，控制台会输出构建过程，我们可以观察到生成了一个 `Hash`值, 如：`abc123456`;

2. 然后，在我们每次修改代码保存后，控制台都会出现 `Compiling…`字样, 编译完成可以在控制台中观察到：
``` js
新的Hash值：123456edf
新的json文件： abc123456.hot-update.json
新的js文件：index.abc123456.hot-update.js
```
> `Hash`值代表每一次编译的标识, 根据新生成文件名可以发现，上次输出的`Hash`值会作为本次编译新生成的文件标识。依次类推，本次输出的`Hash`值会被作为下次热更新的标识。

3. 每次修改代码，紧接着触发重新编译，然后浏览器就会发出 2 次请求。请求的便是上面新生成的 2 个文件：`abc123456.hot-update.json, index.abc123456.hot-update.js`

<img class="zoom-custom-imgs" :src="$withBase('/images/webpack/webpack301.jpeg')" width="auto"/>

> 先看`json`文件，返回的结果中，`h`代表本次新生成的`Hash`值，用于下次文件热更新请求的前缀。`c`表示当前要热更新的文件对应的是`publish`模块; 生成的`js`文件就是本次修改后重新编译打包后的代码。

> 还有一种情况是，如果没有任何代码改动，直接保存文件，控制台也会输出编译打包信息的，但不会输出新的js文件，因为没有改动任何代码，同时浏览器发出的请求，可以看到`c`值为空，代表本次没有需要更新的代码。



#### 热更新实现原理


- **`webpack-dev-server`启动本地服务**
    - 启动`webpack`，生成`compiler`实例。`compiler`上有很多方法，比如可以启动 `webpack` 所有编译工作，以及监听本地文件的变化；
    - 同时使用 `express` 框架启动本地 `server` ，让浏览器可以请求本地的静态资源。
    - 本地 `server` 启动之后，再去启动`websocket` 服务，**通过 `websocket`，可以建立本地服务和浏览器的双向通信**。这样就可以实现当本地文件发生变化，立马告知浏览器可以热更新代码。
    - 启动本地服务前，会调用一个方法获取`websocket`客户端代码路径、`webpack`热更新代码路径; `webpack`热更新代码路径可以在`webpack.config.js`的`entry`中配置




- **webpack监听文件变化**
> 每次修改代码，就会触发编译。说明我们还需要监听本地代码的变化，这主要是通过`webpack-dev-middleware`实现的。`webpack-dev-server`只负责启动服务和前置准备工作，所有文件相关的操作都抽离到`webpack-dev-middleware`库了，主要是本地文件的编译和输出以及监听。

1. `webpack-dev-middleware`会首先对本地文件代码进行编译打包，也就是`webpack`的一系列编译流程；

2. 其次编译结束后，开启对本地文件的监听，当文件发生变化，重新编译，编译完成之后继续监听。
> **监听本地文件的变化主要是通过文件的生成时间是否有变化**，从而实现代码的改动保存会自动编译，重新打包。

3. 接着将编译后的文件打包到内存。
> 这就是为什么在开发的过程中，你会发现`dist`目录没有打包后的代码，因为都在内存中。原因就在于访问内存中的代码比访问文件系统中的文件更快，而且也减少了代码写入文件的开销。


- **监听webpack编译结束**

webpack-dev-server 会调用了一个方法用来注册监听事件的，监听每次 `webpack` 编译完成。

::: tip 该方法主要建立了 websocket 和服务端的连接，并注册了 2 个监听事件。
- `hash`事件，更新最新一次打包后的`hash`值。
- `ok`事件，进行热更新检查。
:::

当监听到一次 `webpack` 编译结束，就会调用方法通过 `websocket` 给浏览器发送通知，这样浏览器就可以拿到最新的`hash`值了，做检查更新逻辑。





- **HotModuleReplacementPlugin 进行热更新**
> `HotModuleReplacementPlugin` ，它是`Webpack`内置的`Plugin`, 平常我们会现在`webpack.config.js`中通过`new webpack.HotModuleReplacementPlugin()`进行添加~

打包之后，`HotModuleReplacementPlugin` 会在 `bundle.js` 中添加一些代码，添加`module.hot.check`方法，然后浏览器就可以调用这个方法开始进行热更新了~

::: tip module.hot.check 方法
- 利用上一次保存的`hash`值，调用`hotDownloadManifest`发送`xxx/hash.hot-update.json`的`ajax`请求；
- 请求结果获取热更新模块，以及下次热更新的`Hash`标识，并进入热更新准备阶段;
- 调用`hotDownloadUpdateChunk`发送`xxx/hash.hot-update.js` 请求.
:::

之后就是通过 `hotApply`方法实现热更新模块替换：

1. 通过`hotUpdate`可以找到旧模块;
2. 将新的模块添加到 `modules` 中;
3. 通过`__webpack_require__`执行相关模块的代码.





#### 热更新原理总结

::: tip 流程
- 使用`express`启动本地服务，当浏览器访问资源时对此做响应。
- 服务端和客户端使用`websocket`实现长连接
- `webpack`监听源文件的变化，即当开发者保存文件时触发`webpack`的重新编译。
    - 每次编译都会生成`hash值、已改动模块的json文件、已改动模块代码的js文件`
    - 编译完成后通过`socket`向客户端推送当前编译的`hash`戳
- 客户端的`websocket`监听到有文件改动推送过来的`hash`戳，会和上一次对比
    - 一致则走缓存
    - 不一致则通过`ajax`和`jsonp`向服务端获取最新资源
- 使用内存文件系统去替换有修改的内容实现局部刷新
:::


底层实现：
1. 与本地服务器建立「socket」连接，注册 hash 和 ok 两个事件，发生文件修改时，给客户端推送 hash 事件。客户端根据 hash 事件中返回的参数来拉取更新后的文件。
2. HotModuleReplacementPlugin 会在文件修改后，生成两个文件，用于被客户端拉取使用


**参考**
- [轻松理解webpack热更新原理](https://juejin.cn/post/6844904008432222215)
- [彻底搞懂并实现 webpack 热更新原理](https://segmentfault.com/a/1190000020310371)



### Tree Shaking
> `Tree-Shaking` 是一种基于 `ES Module` 规范的 `Dead Code Elimination` 技术，它会在运行过程中静态分析模块之间的导入导出，确定 ESM 模块中哪些导出值未曾其它模块使用，并将其删除，以此实现打包产物的优化。

Tree Shaking 较早前由 Rich Harris 在 Rollup 中率先实现，Webpack 自 2.0 版本开始接入，至今已经成为一种应用广泛的性能优化手段。


#### 理论基础

在 `CommonJs、AMD、CMD` 等旧版本的 `JavaScript` 模块化方案中，导入导出行为是高度动态，难以预测的，例如：
``` js
if(process.env.NODE_ENV === 'development'){
  require('./bar');
  exports.foo = 'foo';
}
```

而 `ESM` 方案则从规范层面规避这一行为，它要求所有的导入导出语句只能出现在模块顶层，且导入导出的模块名必须为字符串常量，这意味着下述代码在 `ESM` 方案下是非法的：
``` js
if(process.env.NODE_ENV === 'development'){
  import bar from 'bar';
  export const foo = 'foo';
}
```
所以，`ESM` 下模块之间的依赖关系是高度确定的，与运行状态无关，编译工具只需要对 `ESM` 模块做静态分析，就可以从代码字面量中推断出哪些模块值未曾被其它模块使用，这是实现 `Tree Shaking` 技术的必要条件。


#### 实现原理

`Webpack` 中，`Tree-shaking` 的实现一是先标记出模块导出值中哪些没有被用过，二是使用 `Terser` 删掉这些没被用到的导出语句。标记过程大致可划分为三个步骤：

- **收集模块导出**：`Make` 阶段，收集模块导出变量并记录到模块依赖关系图 `ModuleGraph` 变量中;
- **标记模块导出**：模块导出信息收集完毕后，`Webpack` 需要标记出各个模块的导出列表中，哪些导出值有被其它模块用到，哪些没有，这一过程发生在 `Seal` 阶段;
- **生成代码**：经过前面的收集与标记步骤后，`Webpack` 已经在 `ModuleGraph` 体系中清楚地记录了每个模块都导出了哪些值，每个导出值又没被哪些模块所使用。接下来，`Webpack` 会根据导出值的使用情况生成不同的代码;
- **删除 Dead Code**: 经过前面几步操作之后，模块导出列表中未被使用的值都不会定义在 `__webpack_exports__` 对象中，形成一段不可能被执行的 Dead Code, 在此之后，将由 `Terser、UglifyJS` 等 `DCE` 工具“摇”掉这部分无效代码，构成完整的 `Tree Shaking` 操作。

``` js
// index.js
import {bar} from './bar';
console.log(bar);

// bar.js
export const bar = 'bar';
export const foo = 'foo';
```
标记功能只会影响到模块的导出语句，真正执行`“Shaking”`操作的是 `Terser` 插件。例如在上例中 `foo` 变量经过标记后，已经变成一段 `Dead Code` —— 不可能被执行到的代码，这个时候只需要用 `Terser、UglifyJS`等工具 提供的 `DCE` 功能就可以删除这一段定义语句，以此实现完整的 `Tree Shaking` 效果。


> 参考：[Webpack 原理系列九：Tree-Shaking 实现原理](https://juejin.cn/post/7002410645316436004)



### AST 语法树

在计算机科学中，**抽象语法树（Abstract Syntax Tree，AST）**，或简称语法树（Syntax tree），是**源代码语法结构的一种抽象表示**。它以**树状的形式**表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。webpack、eslint 等很多工具库的核心都是通过抽象语法书这个概念来实现对代码的检查、分析等操作。

之所以说语法"抽象"的，是因为这里的语法并不会表示出真实语法中出现的每个细节。
> 比如，嵌套括号被隐含在树的结构中，并没有以节点的形式呈现；而类似于 `if-condition-then` 这样的条件跳转语句，可以使用带有三个分支的节点来表示。详见[维基百科](https://zh.wikipedia.org/wiki/%E6%8A%BD%E8%B1%A1%E8%AA%9E%E6%B3%95%E6%A8%B9)


对于JavaScript而言，可以通过`JS Parser`将JS代码转换成AST。目前比较常见的`JS Parser`有：
- [esprima](https://github.com/jquery/esprima)（流行库）
- [Babylon](https://github.com/babel/babel/tree/master/packages/babel-parser)（babel中使用）
- [acorn](https://github.com/acornjs/acorn)（webpack中使用）
- [espree](https://github.com/eslint/espree)（在acorn基础上衍生而来，eslint中使用）
- [astexplorer](https://astexplorer.net/)（在线生成工具，可选不同的JS Parser实时查看）。


在将代码转换成AST的过程中，有两个重要的阶段：**词法分析（Lexical Analysis）和语法分析（Syntax Analysis）**。


#### 词法分析
词法分析（Lexical analysis）, 也叫**扫描（scanner）**, 读取我们的代码，然后把它们按照预定的规则合并成一个个的**标记（tokens）**。同时，它会移除空白符，注释，等。最后，整个代码将被分割进一个tokens列表（或者说一维数组）。


::: tip JavaScript 中的 token 主要包含以下几种：
- 关键字：`var、let、const`等
- 标识符：没有被引号括起来的连续字符，可能是一个变量，也可能是 `if、else` 这些关键字，又或者是 `true、false` 这些内置常量
- 运算符： `+、-、 *、/` 等
- 数字：像十六进制，十进制，八进制以及科学表达式等
- 字符串：变量的值等
- 空格：连续的空格，换行，缩进等
- 注释：行注释或块注释都是一个不可拆分的最小语法单元
- 标点：大括号、小括号、分号、冒号等
:::



比如：`const a = 1`, 会被解析成 `const、a、=、1` 四个词法单元：
``` js
[
    {
        "type": "Keyword", // 关键字
        "value": "const"
    },
    {
        "type": "Identifier", // 标识符
        "value": "a"
    },
    {
        "type": "Punctuator", // 
        "value": "="
    },
    {
        "type": "String", // 字符串
        "value": "'1'"
    }
]
```

> 词法分析阶段仿佛最初学英语时，将一个句子拆分成很多独立的单词，我们首先记住每一个单词的类型和含义，但并不关心单词之间的具体联系。



#### 语法分析

语法分析（Syntax analysis），也称**解析器（Parser）**。将词法单元流转换成一个由元素逐级嵌套组成的语法结构树，即所谓的抽象语法树（AST）。

它会将词法分析出来的数组转化成树形的表达形式。同时，验证语法，语法如果有错的话，抛出语法错误。

当生成树的时候，解析器会删除一些没必要的标识 tokens（比如不完整的括号），因此 AST 不是 100% 与源码匹配的，但是已经能让我们知道如何处理了。说个题外话，解析器100%覆盖所有代码结构生成树叫做 CST（具体语法树）。

比如`const a = 1`中被解析出来的 `const、a、=、1` 这四个词法单元组成的词法单元流则会被转换成如下结构树:
``` json
{
  "type": "Program", // 程序
  "start": 0,
  "end": 11,
  "body": [
    {
      "type": "VariableDeclaration", // 描述该语句的类型  --> 变量声明
      "start": 0,
      "end": 11,
      "declarations": [ // 声明内容的数组，里面每一项也是一个对象
        {
          "type": "VariableDeclarator", // 描述该语句的类型
          "start": 6,
          "end": 11,
          "id": { // 描述变量名称的对象
            "type": "Identifier", // 标识符
            "start": 6,
            "end": 7,
            "name": "a" // 变量的名字
          },
          "init": { //  初始化变量值的对象
            "type": "Literal", // 字面量
            "start": 10,
            "end": 11,
            "value": 1, // 值 "1" 不带引号
            "raw": "1" // "1" 带引号
          }
        }
      ],
      "kind": "const" // 变量声明的关键字
    }
  ],
  "sourceType": "module"
}
```
根据这个数据结构大致可以看出转换之前源代码的基本构造。

在拿到了 AST 后，我们就可以分析 AST，在此基础上做一些自己的事情。比如最简单的将代码中的某一变量都替换成另一个名字。





#### 代码生成

代码生成阶段：将 AST 转换成一系列可执行的机器指令代码，对应例子的话就是机器通过执行指令会在内存中创建一个变量 a，并将值 1 赋值给它。

该阶段是一个非常自由的环节，可由多个步骤共同组成。在这个阶段我们可以遍历初始的 AST，对其结构进行改造，再将改造后的结构生成对应的代码字符串。
> 我们已经弄清楚每一条句子的语法结构并知道如何写出语法正确的英文句子，通过这个基本结构我们可以把英文句子完美地转换成一个中文句子或是文言文。


#### Babel 原理
> 提到 AST 我们肯定会想到 babel，自从 ES6 开始大规模使用以来，babel 就出现了，它主要解决了就是一些浏览器不兼容 ES6 新特性的问题，其实就把 ES6 代码转换为 ES5 的代码，兼容所有浏览器，babel 转换代码其实就是用了 AST，babel 与 AST 就有着很一种特别的关系。

Babel是一个 javascript 编译器。宏观来说，它分3个阶段运行代码：**解析（parsing），转译（transforming），生成（generation）**。我们可以给 babel 一些 javascript 代码，它修改代码然后生成新的代码返回。它创建了AST，遍历树，修改tokens，最后从AST中生成新的代码。

::: tip 处理流程
1. **解析 (Parsing)**：这个过程由编译器实现，会经过词法分析过程和语法分析过程，从而生成 AST。
2. **读取/遍历 (Traverse)**：深度优先遍历 AST ，访问树上各个节点的信息（Node）。
3. **修改/转换 (Transform)**：在遍历的过程中可对节点信息进行修改，生成新的 AST。
4. **输出 (Printing)**：对初始 AST 进行转换后，根据不同的场景，既可以直接输出新的 AST，也可以转译成新的代码块。
:::

babel 是如何将 code 转为 AST 呢？ 在这个阶段会用到 babel 提供的解析器 `@babel/parser`，之前叫 `Babylon`，它并非由babel团队自己开发的，而是基于fork的 acorn 项目。

babel使用 babylon，所以，首先解析代码成AST，然后遍历AST，再反转所有的变量名，最后生成代码。

掌握了AST的知识后，我们能做很多事情，各种babel的插件也是这么产生的，只不过用的库不一样。



**使用**

- [@babel/parser](https://babeljs.io/docs/en/babel-parser) ：将 JS 代码解析成对应的 AST，它是使用的 Acorn 来解析 js 代码成 AST 语法树
- @babel/traverse：对 AST 节点进行递归遍历
- @babel/types：集成了一些快速生成、修改、删除 AST Node的方法
- @babel/generator ：根据修改过后的 AST 生成新的 js 代码

例：将`const a = 1`中的`const`修改为`var`
``` js
const generator = require("@babel/generator");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse");
const types = require("@babel/types");

function compile(code) {
  // 1.parse 将代码解析为抽象语法树（AST）
  const ast = parser.parse(code);

  // 2,traverse 转换代码
  traverse.default(ast, {
    VariableDeclaration(path, state) {
      // 做一些处理
      /*
        path为当前访问的路径, 并且包含了节点的信息、父节点信息以及对节点操作许多方法。可以利用这些方法对 AST 进行添加、更新、移动和删除等等。
        state包含了当前plugin的信息和参数信息等等，并且也可以用来自定义在节点之间传递数据。
      */
      path.node.kind = 'var' // 将 const 转换为 var
    }
  });

  // 3. generator 将 AST 转回成代码
  /*
    在 transform 阶段处理 AST 结束后，该阶段的任务就是将 AST 转换回 code, 在此期间会对 AST 进行深度优先遍历，根据节点所包含的信息生成对应的代码，并且会生成对应的sourcemap。
  */
  return generator.default(ast, {}, code);
}

const code = `const a = 1`;

const newCode = compile(code)
console.log('=====newCode', newCode);

```

- [Babel插开发用户手册（babel-handbook）](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/README.md)
- [保姆级教学！这次一定学会babel插件开发！](https://juejin.cn/post/7012424646247055390)




#### AST使用场景


- 语法检查、代码风格检查、格式化代码、语法高亮、错误提示、自动补全：`ESlint、Prettier、Vetur`等。
  1. `Eslint`对代码错误或风格的检查，发现一些潜在的错误
  2. `IDE`的错误提示、格式化、高亮、自动补全等

- 代码混淆压缩：`uglifyJS`等。

- 代码转译：`webpack、babel、TypeScript`等。
  1. 比如，有个函数 `function a() {}` 我想把它变成 `function b() {}`
  2. 比如，在 `webpack` 中代码编译完成后 `require('a') --> __webapck__require__("*/**/a.js")`

- 优化变更代码，改变代码结构等








#### 参考

- [平庸前端码农之蜕变 — AST](https://github.com/codelittleprince/blog/issues/19)
- [前端也要懂编译：AST 从入门到上手指南](https://mp.weixin.qq.com/s/uVVo27ogrwMUY-6SybzauQ)
- [一文助你搞懂 AST](http://caibaojian.com/ast.html)





### SourceMap
> `sourceMap`是一项将编译、打包、压缩后的代码映射回源代码的技术，里面储存着位置信息。

由于打包压缩后的代码并没有阅读性可言，一旦在开发中报错或者遇到问题，直接在混淆代码中`debug`问题会带来非常糟糕的体验，`sourceMap`可以帮助我们快速定位到源代码的位置，提高我们的开发效率。`sourceMap`其实并不是`Webpack`特有的功能，而是`Webpack`支持`sourceMap`，像`JQuery`也支持`souceMap`。

既然是一种源码的映射，那必然就需要有一份映射的文件，来标记混淆代码里对应的源码的位置，通常这份映射文件以`.map`结尾，这个文件里保存的，是转换后代码的位置，和对应的转换前的位置。

有了它，出错的时候，通过断点工具可以直接显示原始代码，而不是转换后的代码。

里边的数据结构大概长这样：

``` json
{
    version : 3, //SourceMap的版本，目前为3
    sources: ["foo.js", "bar.js"], //转换前的文件，该项是一个数组，表示可能存在多个文件合并
    names: ["src", "maps", "are", "fun"], //转换前的所有变量名和属性名
    mappings: "AACvB,gBAAgB,EAAE;AAClB;", //记录位置信息的字符串
    file: "out.js", //转换后的文件名
    sourcesContent: ["\t// The module cache\n", "xxx"], //转换前的文件内容列表，与sources列表依次对应
    sourceRoot : "" //转换前的文件所在的目录。如果与转换前的文件在同一目录，该项为空
}
```

#### mappings

`mappings`是记录位置信息的字符串, 它的数据遵循以下规则：
- 每个分号对应转换后源码的一行；
- 每个逗号对应转换后源码的一个位置；
- 每个段由1、4或5个可变长度字段组成;
> 如上`AACvB`代表该位置转换前的源码位置，以`VLQ`编码表示；

`VLQ`是`Variable-length quantity` 的缩写，是一种通用的、使用任意位数的二进制来表示一个任意大的数字的一种编码方式。
> 关于`sourceMap`映射表的生成有一套较为复杂的规则，具体可参考这里: [【JS基础】sourceMap是个啥](https://segmentfault.com/a/1190000020213957)

有了这份映射文件，我们只需要在我们的压缩代码的最末端加上这句注释，即可让sourceMap生效：

`//# sourceURL=/path/to/file.js.map`

有了这段注释后，浏览器就会通过`sourceURL`去获取这份映射文件，通过解释器解析后，实现源码和混淆代码之间的映射。因此`sourceMap`其实也是一项需要浏览器支持的技术。

> 如果我们仔细查看`webpack`打包出来的`bundle`文件，就可以发现在默认的`development`开发模式下，每个`_webpack_modules__`文件模块的代码最末端，都会加上`//# sourceURL=webpack://file-path?`，从而实现对`sourceMap`的支持。







#### Webpack 中的使用

`Webpack` 中是通过 `Devtool` 来控制是否生成，以及如何生成 `source map`。

[Devtool](https://webpack.docschina.org/configuration/devtool/)

``` js
// webpack.dev.js

// devtool:'eval', // 不单独生成.map文件
// devtool:'cheap-source-map', // 只能定义行的信息，定位不到列的信息
devtool:'source-map' // 单独生成.map文件 可定位到源代码
// devtool: 'cheap-module-eval-source-map', // 这是 "cheap(低开销)" 的 source map，因为它没有生成列映射(column mapping)，只是映射行数。
```

::: tip
- `source-map`：外部。可以查看错误代码准确信息和源代码的错误位置。
- `inline-source-map`：内联。只生成一个内联 Source Map，可以查看错误代码准确信息和源代码的错误位置
- `hidden-source-map`：外部。可以查看错误代码准确信息，但不能追踪源代码错误，只能提示到构建后代码的错误位置。
- `eval-source-map`：内联。每一个文件都生成对应的 Source Map，都在 eval 中，可以查看错误代码准确信息 和 源代码的错误位置。
- `nosources-source-map`：外部。可以查看错误代码错误原因，但不能查看错误代码准确信息，并且没有任何源代码信息。
- `cheap-source-map`：外部。可以查看错误代码准确信息和源代码的错误位置，只能把错误精确到整行，忽略列。
- `cheap-module-source-map`：外部。可以错误代码准确信息和源代码的错误位置，module 会加入 loader 的 Source Map。
:::


- 开发环境：需要考虑速度快，调试更友好
> `eval-source-map`（完整度高，内联速度快）、 `eval-cheap-module-souce-map`（错误提示忽略列但是包含其他信息，内联速度快）

- 生产环境：需要考虑源代码要不要隐藏，调试要不要更友好
> `hidden-source-map` 只隐藏源代码，会提示构建后代码错误信息、`cheap-module-souce-map`（错误提示一整行忽略列）




参考：[深入浅出之 Source Map](https://juejin.cn/post/7023537118454480904)




<fix-link label="Back" href="/skills/"></fix-link>

<!-- 2021-12-19 -->



