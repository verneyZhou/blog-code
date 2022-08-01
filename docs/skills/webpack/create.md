---
title: Webpack原理深析（实践篇）
date: 2021-12-13 23:49:07
# permalink: false # 57ff8a/
categories: 
  - webpack
tags: 
  - webpack
permalink: false # 311a26/
---

# Webpack原理深析（实践篇）


## 手写一个简易版 Webpack

这里手写一个简易版的 Webpack，实现`ES6`转`ES5`的打包功能~

### 初始化

- `mkdir my-webpack`

- `npm init -y`

- 根目录下新建`src`文件，新建`index.js、add.js、minus.js`文件：
``` js
// src/utils/add.js
export default (a, b) => {
    return a + b
}


// src/utils/minus.js
export const minus = (a, b) => {
    return a - b;
}


// src/index.js
import add from './utils/add.js'
import { minus } from './utils/minus.js'

const sum = add(1, 2)
const division = minus(10, 1)

console.log('=======sum', sum)
console.log('=======division', division)

```

- 根目录下新建 `index.html`:
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>my-webpack</title>
</head>
<body>
    <script src="./src/index.js"></script>
</body>
</html>

```

这时，如果直接在浏览器中打开`index.html`是会报错的：`Uncaught SyntaxError: Cannot use import statement outside a module`，因为我们不能在`script`引入的`js`文件里，使用`es6`模块化语法。

接下来参考`webpack`的打包流程，手写一个简易版的`webpack`，实现打包之后能够访问到`/src/index.js`中的代码~


### 实现打包

> 实现之前，先简单分析下流程~
::: tip 打包流程分析
- 首先，我们需要读到入口文件里的内容（也就是`index.js`的内容）
- 其次，分析入口文件，递归的去读取模块所依赖的文件内容，生成依赖图
- 最后，根据依赖图，生成浏览器能够运行的最终代码
:::



#### 配置参数和打包命令

- 根目录下新建`webpack`文件夹，新建一个`index.js`作为打包编译的入口：
``` js
// webpack/index.js

const Complier = require("./compiler"); // 引入定义的 Compiler 类
const options = require("../webpack.config"); // 引入配置的参数


console.log('====webpack run!!!');

new Complier(options).run(); // 执行打包编译
```
这里引入了一个`Complier`类，打包相关的逻辑都在定义在这个类里（稍后会详细讲），开始编译就是执行它的`run`方法；同时也会传入在`webpack.config.js`中添加的自定义配置~

先看看`webpack.config.js`中的代码：

``` js
// webpack.config.js

const path = require("path");
module.exports = {
  entry: "./src/index.js", // 打包入口
  output: {
    path: path.resolve(__dirname, "./dist"), // 打包出口
    filename: "bundle.js" // 打包输出文件名
  }
};
```
这里面的配置跟我们项目中`webpack`的配置一样，只是这里只定义了打包入口和打包输出~

- 接下来在`package.json`中定义打包命令：
``` json
"scripts": {
    "build": "node webpack/index.js"
  },
```
当执行`npm run build`的时候，直接执行`webpack/index.js`中的代码~


####  定义 Compiler 类

新建文件`webpack/compiler.js`：
``` js
// webpack/compiler.js

// Compiler 编译

const fs = require("fs");
const path = require("path");
const Parser = require("./parser");

// 定义 Compiler 类
class Compiler {
  // 初始化  
  constructor(options) {
    // webpack 配置
    const { entry, output } = options;
    // 入口
    this.entry = entry;
    // 输出
    this.output = output;
    // 模块
    this.modules = [];
  }
  // 构建启动
  run() {
      // 解析入口文件
    const info = this.build(this.entry);
    // 加入 modules
    this.modules.push(info);
    // 遍历 modules
    // 收集依赖：从入口模块开始根据依赖关系进行递归解析
    this.modules.forEach(({ dependecies }) => {
        // 判断有依赖对象, 有则递归解析所有依赖项
        if (dependecies) {
            for (const dependency in dependecies) {
                this.modules.push(this.build(dependecies[dependency]));
            }
        }
    });
    // 最后将依赖关系构成为依赖图(Dependency Graph)
    const dependencyGraph = this.modules.reduce(
      (graph, item) => ({
        ...graph,
        [item.filename]: {
          dependecies: item.dependecies,
          code: item.code
        }
      }),
      {}
    );

    console.log('=====dependencyGraph', dependencyGraph);

    // 最后调用generate方法，生成打包文件
    this.generate(dependencyGraph);
  }


  // 打包
  build(filename) {
    const { getAst, getDependecies, getCode } = Parser;
    const ast = getAst(filename); // 获取ast
    const dependecies = getDependecies(ast, filename); // 获取依赖
    const code = getCode(ast); // 获取转换后的js
    return {
      filename, // 文件路径,可以作为每个模块的唯一标识符
      dependecies, // 依赖对象,保存着依赖模块路径
      code // 文件内容
    };
  }

  // 重写 require函数,输出bundle: 这一步我们需要将刚才编写的执行函数和依赖图合成起来输出最后的打包文件.
  generate(depsGraph) {
    // 读取配置中传入的输出文件路径和名称
    const filePath = path.join(this.output.path, this.output.filename);

    // 传入总的依赖图depsGraph，获取打包后的内容bundle
    const bundle = `(function(graph){
      function require(moduleId){ 
        function localRequire(relativePath){
          return require(graph[moduleId].dependecies[relativePath])
        }
        var exports = {};
        (function(require,exports,code){
          eval(code)
        })(localRequire,exports,graph[moduleId].code);
        return exports;
      }
      require('${this.entry}')
    })(${JSON.stringify(depsGraph)})`;

    console.log('=====bundle', bundle);

    // 如果没有打包输出目录，则新建
    !fs.existsSync(this.output.path) && fs.mkdirSync(this.output.path);
    // 把文件内容写入到文件系统
    fs.writeFileSync(filePath, bundle, 'utf-8');
  }
}

module.exports = Compiler;
```
关于打包的核心逻辑基本都在这里面了，大致流程就是：
1. 初始化，引入配置，执行`run`方法；
2. 执行`build`方法，解析入口文件，获取编译后的文件；
3. 收集依赖，递归遍历所有依赖，生成依赖图`dependencyGraph`;
4. 最后执行`generate`方法，输出打包后的文件。

> 先来看看第一步，`build`方法中是如何编译源文件的~

#### Parser编译

上面`Compiler`中引入了 Parser：`const Parser = require("./parser");`，这个对象里面定义一些 js 的编译方法，主要是用于 js 和 ast 树之间互相转换用的~

- 首先安装第三方编译工具：`npm i @babel/core @babel/parser @babel/preset-env @babel/traverse -D`
    1. `@babel/parser`是一个`js`语法解析工具，将 `js` 代码解析成对应的 `AST`;
    2. `@babel/traverse` 能对 `AST` 节点进行递归遍历;
    3. `@babel/core` 提供一些操作 `AST` 语法的方法;
    4. `@babel/preset-env` 能将 `ES6` 语法转换成 `ES5`; 


- 然后新建文件: `webpack/parser.js`:
``` js
// webpack/parser.js

// parser 解析

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser"); // js => ast
const traverse = require("@babel/traverse").default; // 遍历 ast
const { transformFromAst } = require("@babel/core"); // ast => js

// 定义 Parser 方法
const Parser = {
  // 获取 AST 语法树   
  getAst: path => {
    // 读取文件
    const content = fs.readFileSync(path, "utf-8");
    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: "module" // 表示我们要解析的是ES模块
    });
  },

  // 获取依赖   
  getDependecies: (ast, filename) => {
    const dependecies = {};
    // 遍历所有的 import 模块,存入dependecies,
    // Babel 提供了@babel/traverse(遍历)方法维护这 AST 树的整体状态,我们这里使用它来帮我们找出依赖模块。
    traverse(ast, {
      // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename);
        // 保存依赖模块路径,之后生成依赖关系图需要用到
        const filepath = "./" + path.join(dirname, node.source.value);
        dependecies[node.source.value] = filepath;
      }
    });
    return dependecies;
  },

  // es6转es5  
  getCode: ast => {
    // AST转换为code
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    });
    return code;
  }
};

module.exports = Parser;
```
这里面定义的方法会在`Compiler`的`build`中用到，用于获取`ES6`转换成`ES5`之后的代码~


#### 收集依赖

回到`Compiler`，获取到编译后的文件后，执行了递归生成依赖关系图, 然后执行`this.generate(dependencyGraph)`方法，根据依赖关系图生成打包后的输出文件：

``` js
// webpack/compiler.js

// 构建启动
  run() {
      // 解析入口文件
    const info = this.build(this.entry);
    // 加入 modules
    this.modules.push(info);
    // 遍历 modules
    // 收集依赖：从入口模块开始根据依赖关系进行递归解析
    this.modules.forEach(({ dependecies }) => {
        // 判断有依赖对象, 有则递归解析所有依赖项
        if (dependecies) {
            for (const dependency in dependecies) {
                this.modules.push(this.build(dependecies[dependency]));
            }
        }
    });
    // 最后将依赖关系构成为依赖图(Dependency Graph)
    const dependencyGraph = this.modules.reduce(
      (graph, item) => ({
        ...graph,
        [item.filename]: {
          dependecies: item.dependecies,
          code: item.code
        }
      }),
      {}
    );

    console.log('=====dependencyGraph', dependencyGraph);

    // 最后调用generate方法，生成打包文件
    this.generate(dependencyGraph);
  }
```

先打印`dependencyGraph`看下输出了什么：

``` js
=====dependencyGraph {
  './src/index.js': {
    dependecies: {
      './utils/add.js': './src/utils/add.js',
      './utils/minus.js': './src/utils/minus.js'
    },
    code: '"use strict";\n' +
      '\n' +
      'var _add = _interopRequireDefault(require("./utils/add.js"));\n' +
      '\n' +
      'var _minus = require("./utils/minus.js");\n' +
      '\n' +
      'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
      '\n' +
      'var sum = (0, _add["default"])(1, 2);\n' +
      'var division = (0, _minus.minus)(10, 1);\n' +
      "console.log('=======sum', sum);\n" +
      "console.log('=======division', division);"
  },
  './src/utils/add.js': {
    dependecies: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = void 0;\n' +
      '\n' +
      'var _default = function _default(a, b) {\n' +
      '  return a + b;\n' +
      '};\n' +
      '\n' +
      'exports["default"] = _default;'
  },
  './src/utils/minus.js': {
    dependecies: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.minus = void 0;\n' +
      '\n' +
      'var minus = function minus(a, b) {\n' +
      '  return a - b;\n' +
      '};\n' +
      '\n' +
      'exports.minus = minus;'
  }
}
```
可以发现，里面每个路径下都有`code`和`dependecies`两个属性，比如`./src/index.js`路径下的`dependecies`属性就有值，说明该文件里面有引入其他依赖；`code`则是经过`Parser`转换后的代码~


#### 输出打包后的文件

接着分析下`generate`方法：

``` js
// webpack/compiler.js

class Compiler {
  ...
  // 构建启动
  run() {
    ...

    // 最后调用generate方法，生成打包文件
    this.generate(dependencyGraph);
  }

  // 重写 require函数,输出bundle: 这一步我们需要将刚才编写的执行函数和依赖图合成起来输出最后的打包文件.
  generate(depsGraph) {
    // 读取配置中传入的输出文件路径和名称
    const filePath = path.join(this.output.path, this.output.filename);

    // 传入总的依赖图depsGraph，获取打包后的内容bundle
    const bundle = `(function(graph){
      function require(moduleId){ 
        function localRequire(relativePath){
          return require(graph[moduleId].dependecies[relativePath])
        }
        var exports = {};
        (function(require,exports,code){
          eval(code)
        })(localRequire,exports,graph[moduleId].code);
        return exports;
      }
      require('${this.entry}')
    })(${JSON.stringify(depsGraph)})`;

    console.log('=====bundle', bundle);

    // 如果没有打包输出目录，则新建
    !fs.existsSync(this.output.path) && fs.mkdirSync(this.output.path);
    // 把文件内容写入到文件系统
    fs.writeFileSync(filePath, bundle, 'utf-8');
  }
}

module.exports = Compiler;
```

分析下 `bundle`：
``` js
    //  1. 为了避免污染到全局，bundle返回的是一个自执行函数，传入的是打包后的依赖关系图；
    (function(graph){

        // 2. 在这个自执行函数里定义了一个 require 方法
        function require(moduleId){ 

            // 定义一个获取依赖方法：相对路径转化为绝对路径
            // 找到对应moduleId的依赖对象,调用require函数,eval执行,拿到exports对象
            function localRequire(relativePath){
                return require(graph[moduleId].dependecies[relativePath])
            }
            // 因为转换后的代码会把 ES6 中的 `export default ...` 转为成 `exports.default ...`
            // 但因为 ES5 不支持 ESM, exports对象缺失，所以这里定义了一个 exports 对象，传入到下方的自执行函数中
            var exports = {};
            
            // require 方法会执行一个自执行函数，会执行当前路径下的code
            // 会传入localRequire 方法，返回的也是 require 方法,用于 code 中如果需要引入其他依赖时可以调用 reuqire 方法
            // commonjs语法使用module.exports暴露实现,我们传入的exports对象会捕获依赖对象暴露的实现并写入,如：exports.add = add;
            (function(require,exports,code){
                eval(code) // 通过 eval 来执行代码
            })(localRequire,exports,graph[moduleId].code);
            
            // 暴露exports对象,即暴露依赖对象对应的实现
            return exports;
        }

        require('${this.entry}')  // 3. 首先执行了 require(this.entry), 传入配置的入口文件路径

    })(${JSON.stringify(depsGraph)}) // 传入依赖关系图

```


#### 运行

最后修改`index.html`中`js`的引入路径如下：

`<script src="./dist/bundle.js"></script>`

重新执行打包命令`npm run build`，会发现新增了`dist/bundle.js`文件:

``` js
// dist/bundle.js

(function(graph){
      function require(moduleId){ 
        function localRequire(relativePath){
          return require(graph[moduleId].dependecies[relativePath])
        }
        var exports = {};
        (function(require,exports,code){
          eval(code)
        })(localRequire,exports,graph[moduleId].code);
        return exports;
      }
      require('./src/index.js')
    })({"./src/index.js":{"dependecies":{"./utils/add.js":"./src/utils/add.js","./utils/minus.js":"./src/utils/minus.js"},"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./utils/add.js\"));\n\nvar _minus = require(\"./utils/minus.js\");\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nvar sum = (0, _add[\"default\"])(1, 2);\nvar division = (0, _minus.minus)(10, 1);\nconsole.log('=======sum', sum);\nconsole.log('=======division', division);"},"./src/utils/add.js":{"dependecies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _default = function _default(a, b) {\n  return a + b;\n};\n\nexports[\"default\"] = _default;"},"./src/utils/minus.js":{"dependecies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.minus = void 0;\n\nvar minus = function minus(a, b) {\n  return a - b;\n};\n\nexports.minus = minus;"}})
```
最后重新再浏览器中运行`index.html`文件，则会发现能执行`src/index.js`中的代码了~

[完整代码地址]()


### 参考

- [webpack打包原理 ? 看完这篇你就懂了 !](https://juejin.cn/post/6844904038543130637)
- [深入webpack打包原理，loader和plugin的实现](https://juejin.cn/post/6844904146827476999)


## 手写 Loader

`Webpack`中的`Loader`本质上就是一个函数，这个函数会在我们在我们加载一些文件时执行, 比如常见的`file-loader、vue-loader、babel-loader`等，专门用于打包时解析各种类型的文件。


### 初始化

- `mkdir my-webpack-loader`

- `npm init -y`

- `npm i webpack webpack-cli -D`

- 项目目录结构如下：
```
── loader
│   ├── arrow-function-loader.js
├── src
│   ├── index.js
├── index.html
├── webpack.config.js
├── package.json
```

具体代码如下：

- `loader/arrow-function-loader.js`
``` js
// 箭头函数转换成普通函数：
// const fn = (a, b) => a + b 转换为 const fn = function(a, b) { return a + b }

// 导出一个函数
module.exports = function (source) {
    console.log('======arrow-function-loader', source);
    return source
}
```

- `src/index.js`
``` js
const add = (a, b) => {
    return a + b;
}

console.log('=====add', add(1,3));
```

- `webpack.config.js`
``` js

const path = require("path");
module.exports = {
  mode: 'none',
  entry: "./src/index.js", // 打包入口
  output: {
    path: path.resolve(__dirname, "./dist"), // 打包出口
    filename: "bundle.js" // 打包输出文件名
  },
  // 这里使用resolveLoader配置项，指定loader查找文件路径，这样我们使用loader时候可以直接指定loader的名字
  resolveLoader: {
    // loader路径查找顺序从左往右
    modules: ['node_modules', './loader']
  },
  module: {
    rules: [
        {
            test: /.js$/,
            use: [
                'arrow-function-loader' // 引入自定义的loader
            ]
        }
    ]
  }
};
```

- `index.html`
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>my-webpack-loader</title>
</head>
<body>
    <div>webpack loader build!!!</div>
    <script src="./dist/bundle.js"></script>
</body>
</html>

```

- `package.json`打包命令：
``` json
"scripts": {
    "build": "webpack --config webpack.config.js"
  },
```


- 执行打包命令：`npm run build`，终端会输出如下内容：
``` shell
> webpack --config webpack.config.js

======arrow-function-loader 
const add = (a, b) => {
    return a + b;
}

console.log('=====add', add(1,3));
asset bundle.js 164 bytes [compared for emit] (name: main)
./src/index.js 80 bytes [built] [code generated]
webpack 5.65.0 compiled successfully in 88 ms
```
> 这样就说明引入的`loader`是生效了的~

同时会生成`dist/bundle.js`文件：
``` js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};

const add = (a, b) => {
    return a + b;
}

console.log('=====add', add(1,3));
/******/ })()
;
```

- 浏览器直接打开`index.html`，运行正常说明打包成功，接下来开始完善`arrow-function-loader`中的逻辑~

### arrow-function-loader
> 实现箭头函数转换成普通函数~

#### 分析 AST 结构

首先在[astexplorer](https://astexplorer.net/)上分析 `const fn = (a, b) => a + b` 和 `const fn = function(a, b) { return a + b }`看两者语法树的区别:

- `const fn = (a, b) => a + b`:

``` json
{
  "type": "Program",
  "start": 0,
  "end": 26,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 26,
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 6,
          "end": 26,
          "id": {
            "type": "Identifier",
            "start": 6,
            "end": 8,
            "name": "fn"
          },
          "init": {
            "type": "ArrowFunctionExpression", // 箭头函数
            "start": 11,
            "end": 26,
            "id": null,
            "expression": true,
            "generator": false,
            "async": false,
            "params": [
              {
                "type": "Identifier",
                "start": 12,
                "end": 13,
                "name": "a"
              },
              {
                "type": "Identifier",
                "start": 15,
                "end": 16,
                "name": "b"
              }
            ],
            "body": {
              "type": "BinaryExpression", // 二进制表达式(BinaryExpression) 
              "start": 21,
              "end": 26,
              "left": {
                "type": "Identifier",
                "start": 21,
                "end": 22,
                "name": "a"
              },
              "operator": "+",
              "right": {
                "type": "Identifier",
                "start": 25,
                "end": 26,
                "name": "b"
              }
            }
          }
        }
      ],
      "kind": "const"
    }
  ],
  "sourceType": "module"
}
```

- `const fn = function(a, b) { return a + b }`:

``` json
{
  "type": "Program",
  "start": 0,
  "end": 42,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 42,
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 6,
          "end": 42,
          "id": {
            "type": "Identifier",
            "start": 6,
            "end": 8,
            "name": "fn"
          },
          "init": {
            "type": "FunctionExpression", // 普通函数
            "start": 11,
            "end": 42,
            "id": null,
            "expression": false,
            "generator": false,
            "async": false,
            "params": [
              {
                "type": "Identifier",
                "start": 20,
                "end": 21,
                "name": "a"
              },
              {
                "type": "Identifier",
                "start": 23,
                "end": 24,
                "name": "b"
              }
            ],
            "body": {
              "type": "BlockStatement", // 代码块(BlockStatement)
              "start": 26,
              "end": 42,
              "body": [
                {
                  "type": "ReturnStatement",
                  "start": 28,
                  "end": 40,
                  "argument": {
                    "type": "BinaryExpression",
                    "start": 35,
                    "end": 40,
                    "left": {
                      "type": "Identifier",
                      "start": 35,
                      "end": 36,
                      "name": "a"
                    },
                    "operator": "+",
                    "right": {
                      "type": "Identifier",
                      "start": 39,
                      "end": 40,
                      "name": "b"
                    }
                  }
                }
              ]
            }
          }
        }
      ],
      "kind": "const"
    }
  ],
  "sourceType": "module"
}
```

分析总结：
1. 变成普通函数之后就不叫箭头函数`ArrowFunctionExpression`，而是函数表达式`FunctionExpression`
2. 所以首先我们要把 箭头函数表达式(`ArrowFunctionExpression`) 转换为 函数表达式(`FunctionExpression`)
3. 要把 二进制表达式(`BinaryExpression`) 放到一个 代码块中(`BlockStatement`)
4. 其实我们要做就是把一棵树变成另外一颗树，说白了其实就是拼成另一颗树的结构，然后生成新的代码，就可以完成代码的转换


#### 访问者模式

在 `babel` 中，我们开发 `plugins` 的时候要用到访问者模式，就是说在访问到某一个路径的时候进行匹配，然后在对这个节点进行修改，比如说上面的当我们访问到 `ArrowFunctionExpression` 的时候，对 `ArrowFunctionExpression` 进行修改，变成普通函数

``` js
const babel = require('@babel/core')
const code = `const fn = (a, b) => a + b` // 转换后 const fn = function(a, b) { return a + b }

const arrowFnPlugin = {
  // 访问者模式
  visitor: {
    // 当访问到某个路径的时候进行匹配
    ArrowFunctionExpression(path) {
      // 拿到节点
      const node = path.node
      console.log('ArrowFunctionExpression -> node', node)
    },
  },
}

const r = babel.transform(code, {
  plugins: [arrowFnPlugin],
})

console.log(r)
```


#### 修改 AST 结构

在`visitor.ArrowFunctionExpression`中我们拿到的节点其实就是 `ArrowFunctionExpression` 的 `AST`，此时我们要做的是把 `ArrowFunctionExpression` 的结构替换成 `FunctionExpression`的结构，但是需要我们组装类似的结构，这么直接写很麻烦，这里需要用到 `babel` 为我们提供了一个工具叫做 `@babel/types`。
> [@babel/types](https://babel.docschina.org/docs/en/babel-types/)集成了一些快速生成、修改、删除 `AST Node`的方法~

那么接下来我们就开始生成一个 `FunctionExpression`，然后把之前的 `ArrowFunctionExpression` 替换掉；`@babel/types`提供了`functionExpression`方法，该方法接受相应的参数即可生成一个 `FunctionExpression`：

```
t.functionExpression(id, params, body, generator, async)
```

- `id`: `Identifier (default: null) id 可传递 null`
- `params`: `Array<LVal>` (required) 函数参数，可以把之前的参数拿过来
- `body`: `BlockStatement` (required) 函数体，接受一个 `BlockStatement` 我们需要生成一个
- `generator`: `boolean` (default: false) 是否为 `generator` 函数，当然不是了
- `async`: `boolean` (default: false) 是否为 `async` 函数，肯定不是了


完整代码如下：

``` js
// loader/arrow-function-loader.js

// 箭头函数转换成普通函数：
// const fn = (a, b) => a + b 转换为 const fn = function(a, b) { return a + b }

const babel = require('@babel/core')
const t = require('@babel/types')

// 导出一个函数
module.exports = function (source) {
    console.log('======arrow-function-loader', source);
    const arrowFnPlugin = {
        // 访问者模式
        // 在 babel 中，我们开发 plugins 的时候要用到访问者模式，就是说在访问到某一个路径的时候进行匹配，然后在对这个节点进行修改
        visitor: {
            // 当访问到某个路径的时候进行匹配
            // 当我们访问到 ArrowFunctionExpression 的时候，对 ArrowFunctionExpression 进行修改，变成普通函数
            ArrowFunctionExpression(path) {
                // 拿到节点然后替换节点
                const node = path.node
                console.log("=====ArrowFunctionExpression====node", node)
                // 拿到函数的参数
                const params = node.params
                let body = node.body
                // 判断是不是 blockStatement，不是的话让他变成 blockStatement
                if (!t.isBlockStatement(body)) {
                  body = t.blockStatement([body])
                }

                // 生成新的 functionExpression
                const functionExpression = t.functionExpression(null, params, body)
                // 替换原来的函数
                path.replaceWith(functionExpression)
              }
        },
    }

    // 转换代码
    const r = babel.transform(source, {
        plugins: [arrowFnPlugin], //plugins 中引入自定义的修改规则
    })
    console.log(r.code) // const fn = function (a, b) { return a + b; };

    return r.code;
}
```

#### 运行

执行打包命令：`npm run build`，会发现终端输出：
``` shell
=====r.code const add = function (a, b) {
  return a + b;
};
```
说明箭头函数已经转换成普通函数了；看一下打包之后的文件：`dist/bundle.js`:
``` js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
const add = function (a, b) {
  return a + b;
};

console.log('=====add', add(1, 3));
/******/ })()
;
```
输出也是ok的，浏览器执行一下，应该也是没问题的~

[完整代码]()


> 参考
- [一文助你搞懂 AST](http://caibaojian.com/ast.html)
- [手把手教你在Webpack写一个Loader](https://juejin.cn/post/7100534685134454815)





## 手写 Plugin

`plugin`通常是在`webpack`在打包的某个时间节点做一些操作，我们使用`plugin`的时候，一般都是`new Plugin()`这种形式使用，所以，首先应该明确的是，`plugin`应该是一个类。

因为项目配置其实都差不多，这里就继续在上一个`my-webpack-loader`项目添加`plugin`了~

- 新建`plugins/test-webpack-plugin.js`文件：
``` js
class TestWebpackPlugin {
    constructor () {
        console.log('plugin init')
    }
    apply (compiler) {

    }
}

module.exports = TestWebpackPlugin
```

在`TestWebpackPlugin`的构造函数打印一条信息，当我们执行打包命令时，这条信息就会输出，`plugin`类里面需要实现一个`apply`方法，`webpack`打包时候，会调用`plugin`的`apply`方法来执行`plugin`的逻辑，这个方法接受一个`compiler`作为参数，这个`compiler`是`webpack`实例。

`plugin`的核心在于，`apply`方法执行时，可以操作`webpack`本次打包的各个时间节点（`hooks`，也就是生命周期勾子），在不同的时间节点做一些操作。

关于`webpack`编译过程的各个生命周期勾子，可以参考[Compiler Hooks](https://webpack.docschina.org/api/compiler-hooks/)

``` js
// plugins/test-webpack-plugin.js

class TestWebpackPlugin {
    constructor () {
        console.log('plugin init')
    }
    apply (compiler) {
        // 一个新的编译(compilation)创建之后（同步）
        // compilation代表每一次执行打包，独立的编译
        compiler.hooks.compile.tap('TestWebpackPlugin', compilation => {
            console.log(compilation)
        })
        // 生成资源到 output 目录之前（异步）
        compiler.hooks.emit.tapAsync('TestWebpackPlugin', (compilation, fn) => {
            console.log(compilation)
            // 打包时候自动生成一个md文档，文档内容是很简单的一句话
            compilation.assets['index.md'] = {
                // 文件内容
                source: function () {
                    return 'this is a demo for plugin'
                },
                // 文件尺寸
                size: function () {
                    return 25
                }
            }
            fn()
        })
    }
}

module.exports = TestWebpackPlugin
```

- `webpack.config.js`中添加配置：
``` js
const TestWebpackPlugin = require('./plugins/test-webpack-plugin')
module.exports = {
  ...
  plugins: [
      new TestWebpackPlugin() // 引入自定义插件
  ]
};
```

- `npm run build`，打包，会发现`dist`中生成了`index.md`文件，说明自定义的插件`TestWebpackPlugin`生效了~


<fix-link label="Back" href="/skills/webpack/"></fix-link>


<!-- 2021-12-19 -->




