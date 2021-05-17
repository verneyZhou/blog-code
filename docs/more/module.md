

# CommonJS、AMD、CMD、ES6
这里对前端模块化：AMD、CMD、CommonJS、ES6进行一次梳理~

## 前言
> 其实在刚开始，`JavaScript`官方定义的`API`只能构建基于浏览器的应用程序， 一直没有**模块**（module）体系，无法将一个大程序拆分成互相依赖的小文件、再用简单的方法拼装起来；其他语言都有这项功能，比如`Ruby`的 `require`、`Python` 的 `import`，甚至就连 `CSS` 都有 `@import` ，但是 `JavaScript` 任何这方面的支持都没有，这对开发大型的、复杂的项目形成了巨大障碍。

随着web2.0时代的到来，Ajax技术得到广泛应用，jQuery等前端库层出不穷，**模块化的规范管理**成了`Javascript`必须考虑的问题。

### 什么是模块
- 将一个复杂的程序依据一定的规则(规范)封装成几个块(文件), 并进行组合在一起；
- 块的内部数据与实现是**私有**的, 只是向外部暴露一些接口(方法)与外部其它模块通信。


### 模块化发展进程

1. **全局function模式**
> 将不同的功能封装成不同的全局函数。
``` js
function m1(){
  //...
}
function m2(){
  //...
}
```
**问题**：污染全局命名空间, 容易引起命名冲突或数据不安全，而且模块成员之间看不出直接关系。


2. **namespace模式**
> 简单对象封装，减少了全局变量，解决命名冲突。
``` js
let myModule = {
  data: 'www.baidu.com',
  foo() {
    console.log(`foo() ${this.data}`)
  },
  bar() {
    console.log(`bar() ${this.data}`)
  }
}
myModule.data = 'other data' //能直接修改模块内部的数据
myModule.foo() // foo() other data
```
**问题**: 会暴露所有模块成员，数据不安全(外部可以直接修改模块内部的数据)。


3. **IIFE模式**
> 匿名函数自调用(闭包)，数据是私有的, 外部只能通过暴露的方法操作。

**方法**：将数据和行为封装到一个函数内部, 通过给window添加属性来向外暴露接口。
``` js
// module.js文件
(function(window) {
  let data = 'www.baidu.com'
  //操作数据的函数
  function foo() {
    //用于暴露有函数
    console.log(`foo() ${data}`)
  }
  function bar() {
    //用于暴露有函数
    console.log(`bar() ${data}`)
    otherFun() //内部调用
  }
  function otherFun() {
    //内部私有的函数
    console.log('otherFun()')
  }
  //暴露行为
  window.myModule = { foo, bar } //ES6写法
})(window)
```
`index.html`文件：
``` html
<!-- index.html文件 -->
<script type="text/javascript" src="module.js"></script>
<script type="text/javascript">
    myModule.foo() // foo() www.baidu.com
    myModule.bar() // foo() www.baidu.com  otherFun()
    console.log(myModule.data) //undefined 不能访问模块内部数据
    myModule.data = 'xxxx' //不是修改的模块内部的data
    myModule.foo() //foo() www.baidu.com 没有改变
</script>
```
现在继续改进下，引入依赖：
``` js
// module.js文件
(function(window, $) {
  ...
  //操作数据的函数
  function foo() {
    //用于暴露有函数
    console.log(`foo() ${data}`)
    $('body').css('background', 'red')
  }
  ...
})(window, jQuery)

```
``` html
<!-- index.html文件 -->
<!-- 引入的js必须有一定顺序 -->
<script type="text/javascript" src="jquery-1.10.1.js"></script>
<script type="text/javascript" src="module.js"></script>
<script type="text/javascript">
    myModule.foo()
</script>
```
上例子通过`jquery`方法将页面的背景颜色改成红色，所以必须先引入`jQuery`库，就把这个库当作参数传入。这样做除了**保证模块的独立性，还使得模块之间的依赖关系变得明显**。
> IIFE模式也是现代模块实现的基石。

::: tip 模块化的好处
- 避免命名冲突(减少命名空间污染)
- 更好的分离, 按需加载
- 更高复用性
- 高可维护性
:::

但如果引入多个js之后就容易出现问题：
::: warning 
- 请求过多
    > 首先我们要依赖多个模块，那样就会发送多个请求，导致请求过多
- 依赖模糊
    > 我们不知道他们的具体依赖关系是什么，也就是说很容易因为不了解他们之间的依赖关系导致加载先后顺序出错。
- 难以维护
    > 以上两种原因就导致了很难维护，很可能出现牵一发而动全身的情况导致项目出现严重的问题。 
:::

 模块化固然有多个好处，然而一个页面需要引入多个js文件，就会出现以上这些问题。而这些问题可以通过模块化规范来解决，于是就出现了开发中最流行的`CommonJS, AMD, CMD, ES6`规范。



## CommonJS
> 2009年，美国程序员Ryan Dahl创造了`node.js`项目，将`javascript`语言用于服务器端编程，这标志**Javascript模块化编程**正式诞生。`node`选择了`CommonJS`作为它的模块加载方案。

### 简介

`ConmonJS`是一种为`JS`的表现指定的规范，它希望js可以运行在任何地方，更多的说的是服务端模块规范，`Node.js`采用了这个规范。

`Node.js`是`CommonJS`规范的主要实践者，它有四个重要的环境变量为模块化的实现提供支持：`module、exports、require、global`。

每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。**在服务器端，模块的加载是运行时同步加载的；在浏览器端，模块需要提前编译打包处理。**

::: tip CommonJS的特点
- 所有代码都运行在模块作用域，不会污染全局作用域。
- 模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。
- 模块加载的顺序，按照其在代码中出现的顺序。
:::


### module对象
`Node`内部提供一个`Module`构建函数。所有模块都是`Module`的实例。

每个模块内部，都有一个`module`对象，代表当前模块。
::: tip module 有以下属性：
- module.id 模块的识别符，通常是带有绝对路径的模块文件名。
- module.filename 模块的文件名，带有绝对路径。
- module.loaded 返回一个布尔值，表示模块是否已经完成加载。
- module.parent 返回一个对象，表示调用该模块的模块。
- module.children 返回一个数组，表示该模块要用到的其他模块。
- module.exports 表示模块对外输出的值。
:::

- **module.exports属性**

`module.exports`属性表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取`module.exports`变量。

**exports变量**：为了方便，Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行这样的命令。
``` js
var exports = module.exports;
```
> 如果你觉得`exports`与`module.exports`之间的区别很难分清，一个简单的处理方法，就是放弃使用`exports`，只使用`module.exports`。


### 基本语法

- 暴露模块：`module.exports = value`或`exports.xxx = value`
- 引入模块：`require(xxx)`,如果是第三方模块，xxx为模块名；如果是自定义模块，xxx为模块文件路径

> `CommonJS`规范规定，每个模块内部，`module`变量代表当前模块。这个变量是一个对象，它的`exports`属性（即`module.exports`）是对外的接口。加载某个模块，其实是**加载该模块的`module.exports`属性**。

``` js
// example.js
var x = 5;
var addX = function (value) {
  return value + x;
};
module.exports.x = x;
module.exports.addX = addX;
```
上面代码通过`module.exports`输出变量`x`和函数`addX`。`require`方法用于加载模块。
``` js
var example = require('./example.js');

console.log(example.x); // 5
console.log(example.addX(1)); // 6
```
`require`命令的基本功能是，读入并执行一个`JavaScript`文件，然后返回该模块的`exports`对象。如果没有发现指定模块，会报错。


### 总结

**特点**

- 第一次加载某个模块时，`Node`会缓存该模块。以后再加载该模块，就直接从缓存取出该模块的`module.exports`属性。
    > 所有缓存的模块保存在`require.cache`之中，如果想删除模块的缓存，可以这样写：`delete require.cache[moduleName]`。
- `CommonJS`模块的加载机制是：输入的是**被输出的值的拷贝**。也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。
    > 对于基本数据类型，属于复制；对于复杂数据类型，是浅拷贝。
- `CommonJS`用**同步**的方式加载模块。
    > 在服务端，模块文件都存在本地磁盘，读取非常快，所以这样做不会有问题。但是在浏览器端，限于网络原因，更合理的方案是使用异步加载。
- CommonJS 模块是**运行时加载**。当使用`require`命令加载某一个模块时，就会运行整个模块的代码。

**缺点**
> 加载模块是同步的，只有加载完成后才能执行后面的操作，也就是当要用到该模块了，现加载现用，不仅加载速度慢，而且还会导致性能、可用性、调试和跨域访问等问题。`Node.js`主要用于服务器编程，加载的模块文件一般都存在本地硬盘，加载起来比较快，不用考虑异步加载的方式，因此,`CommonJS`规范比较适用。然而，这并不适合在浏览器环境，同步意味着阻塞加载，浏览器资源是异步加载的，因此有了`AMD、CMD`解决方案。


**浏览器端实现**
> 服务器端可以用`Node.js`实现，但浏览器端不兼容`CommonJS`，主要在于缺少四个`Node.js`环境的变量：`module、exports、require、global`。

[Browserify](http://browserify.org/) 是目前最常用的 CommonJS 格式转换的工具；借助 Browserify 可以在浏览器端实现 CommonJS。




## AMD
> 基于`CommonJS`规范的`node.js`出来以后，服务端的模块概念已经形成，很自然地，大家就想要客户端模块。而且最好两者能够兼容，一个模块不用修改，在服务器和浏览器都可以运行。但由于**require是同步的**，使得CommonJS规范不适用于浏览器环境。

### 简介
> 如果是浏览器环境，要从服务器端加载模块，这时就必须采用非同步模式，因此浏览器端一般采用AMD规范。

[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)（Asynchronous Module Definition，异步模块定义）规范采用**异步方式加载模块**，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。

其核心接口是：`define(id?, dependencies?, factory) `，它要在声明模块的时候指定所有的依赖`dependencies` ，并且还要当做形参传到`factory`中，对于依赖的模块**提前执行，依赖前置**。

``` js
define("module", ["dep1", "dep2"], function(d1, d2) {
  return someExportedValue;
});
require(["module", "../file"], function(module, file) { /* ... */ });
```
- **优点**：在浏览器环境中异步加载模块；并行加载多个模块；
- **缺点**：开发成本高，代码的阅读和书写比较困难，模块定义方式的语义不顺畅；不符合通用的模块化思维方式，是一种妥协的实现；


### 实现
> 由于`AMD`不是`JavaScript`原生支持，使用`AMD`规范进行页面开发需要用到对应的库函数。

目前，主要有两个`Javascript`库实现了`AMD`规范：[require.js](https://requirejs.org/)和[curl.js](https://github.com/cujojs/curl)。下面以`RequireJS`为例说明`AMD`规范。

RequireJS的基本思想是：**通过define方法，将代码定义为模块；通过require方法，实现代码的模块加载**。[github地址](https://github.com/requirejs/requirejs)

**RequireJS主要解决两个问题：**
- 实现js文件的异步加载，避免网页失去响应；
- 管理模块之间的依赖性，便于代码的编写和维护。

RequireJs也采用`require()`语句加载模块，但是不同于`CommonJS`，它要求两个参数:
- 第一个参数`[module]`，是一个数组，里面的成员就是要加载的模块；
- 第二个参数`callback`，则是加载成功之后的回调函数。
``` js
require([module], callback);

require([increment'], function (increment) {
　   increment.add(1);
});
```



AMD模块定义的方法非常清晰，不会污染全局环境，能够清楚地显示依赖关系。AMD模式可以用于浏览器环境，并且允许非同步加载模块，也可以根据需要动态加载模块。


## CMD

### 简介

**CMD**（Common Module Definition，通用模块定义），CMD 规范是国内发展出来的，CMD 规范专门用于浏览器端，模块的加载是异步的，模块使用时才会加载执行。CMD规范整合了 CommonJS 和 AMD 规范的特点。

在 CMD 规范中，一个模块就是一个文件。

- **CMD的基本语法：**
``` js
//定义没有依赖的模块
define(function(require, exports, module){
  exports.xxx = value
  module.exports = value
})


//定义有依赖的模块
define(function(require, exports, module){
  //引入依赖模块(同步)
  var module2 = require('./module2')
  //引入依赖模块(异步)
    require.async('./module3', function (m3) {
    })
  //暴露模块
  exports.xxx = value
})


// 引入使用的模块
define(function (require) {
  var m1 = require('./module1')
  var m4 = require('./module4')
  m1.show()
  m4.show()
})
```
> require 是可以把其他模块导入进来的一个参数；而 exports 是可以把模块内的一些属性和方法导出的; module 是一个对象，上面存储了与当前模块相关联的一些属性和方法。

- **和AMD的比较**
1. AMD是**依赖关系前置**，在定义模块的时候就要声明其依赖的模块；
2. CMD是**按需加载、依赖就近**，只有在用到某个模块的时候再去require。
``` js
// CMD
define(function(require, exports, module) {
  var a = require('./a')
  a.doSomething()
  // 此处略去 100 行
  var b = require('./b') // 依赖可以就近书写
  b.doSomething()
  // ... 
})

// AMD 默认推荐的是
define(['./a', './b'], function(a, b) { // 依赖必须一开始就写好
  a.doSomething()
  // 此处略去 100 行
  b.doSomething()
  ...
}) 
```



### SeaJS
就像`AMD`有个`requireJS`，`CMD`有个浏览器的实现`SeaJS`，`SeaJS`要解决的问题和`requireJS`一样，只不过在模块定义方式和模块加载（可以说运行、解析）时机上有所不同。

- [github地址](https://github.com/seajs/seajs)
- [官网](https://seajs.github.io/seajs/docs/)


**使用：**
``` js
// 定义模块  myModule.js
define(function(require, exports, module) {
  var $ = require('jquery.js')
  $('div').addClass('active');
  exports.data = 1;
});

// 加载模块
seajs.use(['myModule.js'], function(my){
    var star= my.data;
    console.log(star);  //1
});
```

关于`RequireJS`和`SeaJS`的异同可以参考：[与 RequireJS 的异同](https://github.com/seajs/seajs/issues/277)、[SeaJS与RequireJS最大的区别](https://www.douban.com/note/283566440/)




## ES6模块
> 在 ES6 之前，社区制定了一些模块加载方案，最主要的有 `CommonJS` 和 `AMD` 两种。前者用于服务器，后者用于浏览器。ES6 在语言标准的层面上，实现了模块功能，而且实现得相当简单，完全可以取代 CommonJS 和 AMD 规范，成为浏览器和服务器通用的模块解决方案。

ES6 模块的设计思想是尽量的静态化，使得**编译时就能确定模块的依赖关系**，以及输入和输出的变量。

ES6 模块不是对象，而是通过`export`命令显式指定输出的代码，再通过`import`命令输入：
``` js
// ES6模块
import { stat, exists, readFile } from 'fs';
```
上面代码的实质是从`fs`模块加载 `3` 个方法，其他方法不加载。这种加载称为**编译时加载**或者**静态加载**，即 ES6 可以在编译时就完成模块加载，效率要比 CommonJS 模块的加载方式高。当然，这也导致了没法引用 ES6 模块本身，因为它不是对象。


### export
> `export`命令用于规定模块的对外接口。

一个模块就是一个独立的文件。该文件内部的所有变量，外部无法获取。如果你希望外部能够读取模块内部的某个变量，就必须使用`export`关键字输出该变量。

- **export的写法**

1. 输出变量`m`：
``` js
// 报错
export 1;

// 报错
var m = 1;
export m;

// 上面两种写法都会报错，因为没有提供对外的接口。
// 第一种写法直接输出 1，第二种写法通过变量m，还是直接输出 1。1只是一个值，不是接口。
// 正确的写法是下面这样：

// 写法一
export var m = 1;

// 写法二
var m = 1;
export {m};

// 写法三
var n = 1;
export {n as m}; // export输出的变量就是本来的名字，但是可以使用as关键字重命名。


// 上面三种写法都是正确的，规定了对外的接口m。其他脚本可以通过这个接口，取到值1。
// 它们的实质是，在接口名与模块内部变量之间，建立了一一对应的关系。
```

2. `function`和`class`的输出：
``` js
// 报错
function f() {}
export f;

// 正确
export function f() {};

// 正确
function f() {}
export {f};
```

- export 语句输出的接口，与其对应的值是动态绑定关系，即通过该接口，可以取到模块内部实时的值，也可以动态更新；CommonJS 模块输出的是值的缓存，不存在动态更新。
- export 命令可以出现在模块的任何位置，只要处于模块顶层就可以。如果处于块级作用域内，就会报错，import 命令也是如此。
    > 这是因为处于条件代码块之中，就没法做静态优化了，违背了 ES6 模块的设计初衷。


### import
> 使用 export 命令定义了模块的对外接口以后，其他 JS 文件就可以通过 import 命令加载这个模块。

import命令接受一对大括号，里面指定要从其他模块导入的变量名。大括号里面的变量名，必须与被导入模块对外接口的名称相同：
``` js
// main.js
import { firstName, lastName, year } from './profile.js';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```

- **import的写法**

``` js
// `import`命令可以使用`as`关键字重命名：
import { lastName as surname } from './profile.js';


// import命令输入的变量都是只读的，因为它的本质是输入接口
import {a} from './xxx.js'
a = {}; // Syntax Error : 'a' is read-only;
a.foo = 'hello'; // 不报错，但如果a是一个对象，改写a的属性是允许的。


// 仅仅执行lodash模块，但是不输入任何值
import 'lodash';


// 用星号（*）指定一个对象，整体加载某个模块
import * as circle from './circle';
console.log('圆面积：' + circle.area(4));
console.log('圆周长：' + circle.circumference(14));

```
- `import`后面的`from`指定模块文件的位置，可以是相对路径，也可以是绝对路径。如果不带有路径，只是一个模块名，那么必须有配置文件，告诉 `JavaScript` 引擎该模块的位置。
- `import`命令具有提升效果，会提升到整个模块的头部，首先执行；因为`import`命令是编译阶段执行的，在代码运行之前。



### export default 
> 为了给用户提供方便，让他们不用阅读文档就能加载模块，就要用到`export default`命令，为模块指定默认输出。


``` js
// 下面代码是一个模块文件export-default.js，它的默认输出是一个函数：

// 写法1
export default function () {
  console.log('foo');
}

// 写法2
function foo() {
  console.log('foo');
}
export default foo;
// 等同于
// export {foo as default}; // 本质上，export default 就是输出一个叫做 default 的变量或方法



// 其他模块加载该模块时，import命令可以为该匿名函数指定任意名字
import customName from './export-default';
// 等同于
// import { default as customName } from './export-default';

customName(); // 'foo'
```
> 上面代码的`import`命令，可以用任意名称指向`export-default.js`输出的方法，这时就不需要知道原模块输出的函数名。需要注意的是，这时`import`命令后面，不使用大括号。

- 默认输出 vs 正常输出：
``` js
// 第一组
export default function crc32() { // 输出
  // ...
}

import crc32 from 'crc32'; // 输入

// 第二组
export function crc32() { // 输出
  // ...
};

import {crc32} from 'crc32'; // 输入
```
> 上面代码的两组写法，第一组是使用`export default`时，对应的`import`语句不需要使用大括号；第二组是不使用`export default`时，对应的`import`语句需要使用大括号。


### import()
> 前面介绍过，`import`命令会被 `JavaScript` 引擎静态分析，先于模块内的其他语句执行；这样的设计，固然有利于编译器提高效率，但也导致无法在运行时加载模块。

> 如果`import`命令要取代 `Node` 的`require`方法，这就形成了一个障碍。因为`require`是运行时加载模块，`import`命令无法取代`require`的动态加载功能。

所以，`ES2020`提案引入`import()`函数，支持动态加载模块：
``` js
import(specifier)
```
> 上面代码中，`import`函数的参数`specifier`，指定所要加载的模块的位置。`import`命令能够接受什么参数，`import()`函数就能接受什么参数，两者区别主要是后者为动态加载。

`import()`类似于 `Node` 的`require`方法，区别主要是前者是**异步加载**，后者是同步加载。

`import()`返回一个 `Promise` 对象：
``` js
import('./myModule.js')
    .then(({export1, export2}) => {
    // ...·
    })
    .catch(err => {
        // ...
    });
```

### 浏览器加载
> `HTML` 网页中，浏览器通过`<script>`标签加载 `JavaScript` 脚本。默认情况下，浏览器是同步加载`JavaScript`脚本，如果脚本体积很大，容易造成浏览器堵塞；

`<script>`标签打开`defer`或`async`属性，脚本就会异步加载：
``` js
// 同步加载  type="application/javascript"可以省略
<script type="application/javascript" src="path/to/myModule.js"></script>

// 异步加载
<script src="path/to/myModule.js" defer></script>
<script src="path/to/myModule.js" async></script>
```
> `defer`要等到整个页面在内存中正常渲染结束（`DOM` 结构完全生成，以及其他脚本执行完成），才会执行

> `async`一旦下载完，渲染引擎就会中断渲染，执行这个脚本以后，再继续渲染。

- **加载规则**

浏览器加载 ES6 模块，也使用`<script>`标签，但是要加入`type="module"`属性：
``` js
<script type="module" src="./foo.js"></script>
// 等同于
<script type="module" src="./foo.js" defer></script>
```
> 浏览器对于带有type="module"的`<script>`，都是异步加载，不会造成堵塞浏览器，即等到整个页面渲染完，再执行模块脚本，等同于打开了`<script>`标签的`defer`属性。


### 与 CommonJS 模块的差异

::: tip 差异：
- `CommonJS` 模块输出的是一个值的拷贝，`ES6` 模块输出的是值的引用。
    > CommonJS 模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。

    > JS 引擎对脚本静态分析的时候，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。
    
- `CommonJS` 模块是运行时加载，`ES6` 模块是编译时输出接口。
    > 因为 CommonJS 加载的是一个对象（即module.exports属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。
- `CommonJS` 模块的`require()`是同步加载模块，`ES6` 模块的`import`命令是异步加载，有一个独立的模块依赖的解析阶段。
:::


### Node.js 的模块加载方法
> `CommonJS` 模块是 `Node.js` 专用的，与 `ES6` 模块不兼容。

从 `Node.js v13.2`版本开始，`Node.js` 已经默认打开了 `ES6` 模块支持。

`Node.js`要求 `ES6` 模块采用`.mjs`后缀文件名。
> 也就是说，只要脚本文件里面使用import或者export命令，那么就必须采用.mjs后缀名。Node.js 遇到.mjs文件，就认为它是 ES6 模块，默认启用严格模式，不必在每个模块文件顶部指定"use strict"。

如果不希望将后缀名改成`.mjs`，可以在项目的`package.json`文件中，指定`type`字段为`module`。
> 一旦设置了以后，该目录里面的 JS 脚本，就被解释用 ES6 模块。

如果这时还要使用 CommonJS 模块，那么需要将 CommonJS 脚本的后缀名都改成`.cjs`。

## 参考

1. [ECMAScript 6 入门-Module 的语法](https://es6.ruanyifeng.com/#docs/module)
2. [ECMAScript 6 入门-Module 的加载实现](https://es6.ruanyifeng.com/#docs/module-loader)
3. [CommonJS规范](http://javascript.ruanyifeng.com/nodejs/module.html)
4. [前端模块化（CommonJs,AMD和CMD）](https://www.jianshu.com/p/d67bc79976e6)
5. [js模块化编程之彻底弄懂CommonJS和AMD/CMD！](https://www.cnblogs.com/chenguangliang/p/5856701.html)
6. [前端模块化详解(完整版)](https://juejin.cn/post/6844903744518389768)


<!-- 2021-05-15 -->