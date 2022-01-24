---
title: js深入：从执行上下文到闭包
date: 2021-03-18 19:39:52
# permalink: false # 2ec98c/
categories: 
  - js
tags: 
  - js基础
  - 闭包
permalink: false # 1b372f/
---
# js深入：从执行上下文到闭包

## 前言
> 这里是我的js深入学习记录。

### 名词解释
开始之前，先解释几个js中比较重要的名词~

#### 执行上下文（EC）
> 执行上下文（Execution Context）,可以被翻译为「执行上下文」或者「 执行环境」，每当程序的执行流进入到一个可执行的代码时，就进入到了一个执行环境中。

它是`JavaScript`中一个重要的概念。**执行上下文定义了变量或函数有权访问的其他数据，决定了它们各自的行为**。

**全局执行上下文是最外围的一个执行环境**。某个执行上下文中的所有代码执行完毕后，该环境被销毁，保存在其中的所有变量和函数定义也随之销毁(全局执行上下文直到应用程序退出时才会被销毁，例如关闭网页或浏览器)。

**每个函数都有自己的执行上下文**。当执行流进入一个函数时，函数的环境就会被推入**js的执行上下文栈**。 而在函数执行之后，栈将其环境弹出，把控制权返回给之前的执行环境。

::: tip 执行上下文的三种类型
- **全局执行上下文**：这是默认或者说基础的上下文，任何不在函数内部的代码都在全局上下文中。它会执行两件事：创建一个全局的`window`对象（浏览器的情况下），并且设置`this`的值等于这个全局对象。一个程序中只会有一个全局执行上下文。
- **函数执行上下文**：每当一个函数被调用时, 都会为该函数创建一个新的上下文。每个函数都有它自己的执行上下文，不过是在函数被调用时创建的。函数上下文可以有任意多个。
- **Eval函数执行上下文**：执行在`eval`函数内部的代码也会有它属于自己的执行上下文，但一般比较少用。
:::

> 对于每个执行上下文，都有三个重要属性：**变量对象、作用域链、this指向**。
::: tip 执行上下文生命周期
- **创建阶段**：也称为js的预编译阶段，主要是创建变量对象、建立作用域链、确定this指向
- **执行阶段**：给已经声明的变量进行赋值，由变量对象生成活动对象，执行函数
- **执行完毕**：出栈，等待回收
:::


#### 执行上下文栈（ECStack）
> javascript引擎是通过栈来管理多个执行上下文的，通常这种用来管理执行上下文的栈称为**执行上下文栈（Execution Context Stack）**，又称执行环境栈，或[调用栈（Call Stack）](https://developer.mozilla.org/zh-CN/docs/Glossary/Call_stack)。

`JavaScript`是一门单线程的语言，这意味着它只有一个调用栈，因此它一次仅能做一件事。js的调用栈是一种先进后出的数据结构。

每一个进入调用栈的也被称为**调用帧**；常见的递归导致的栈溢出就是调用栈中调用帧堆积过多造成的。

::: tip 流程
- 当`JavaScript`引擎首次读取脚本时，会创建一个全局执行上下文并将其Push到调用栈中；
- 每当发生函数调用时，引擎都会为该函数创建一个新的执行上下文并Push到调用栈的栈顶；
- 引擎会运行执行上下文在调用栈栈顶的函数，当此函数运行完成后，其对应的执行上下文将会从调用栈中Pop出，上下文控制权将转到调用栈的下一个执行上下文；
- 一旦所有代码执行完毕，`Javascript`引擎把全局执行上下文从调用栈中移除。
:::


#### 变量对象（VO）
> 每个执行环境都有一个与之关联的**变量对象(variable object)**，环境中定义的所有变量和函数都保存在这个对象中。虽然我们编写的代码无法访问这个对象，但解析器在处理数据时会在后台使用它。

执行上下文在创建阶段会生成变量对象。
::: tip 变量对象包括：
1. **函数形参（formal parameters）**：执行上下文会首先检查当前上下文的参数列表，建立`Arguments`对象，并作为当前上下文`VO`的`arguments`属性（只有函数上下文的`VO`才有`arguments`属性）；
2. **函数声明（Function Declaration）**：接着会检查当前上下文的`function`函数声明，每检查到一个，就在`VO`中以函数名建立一个属性，属性值指向函数所在的内存地址；
3. **变量声明（Variable Declaration）**：最后会检查当前上下文所有的变量声明，每检查到一个，如果`VO`已经存在同名的`function`就跳过，不存在就在`VO`中以变量名建立一个属性，属性值为`undifined`
:::
```js
// 变量对象VO
VO = {
    arguments: Arguments[...], // 函数形参
    FunctionName: <Funtion Reference>, // 函数声明
    Variables: undifined // 变量声明
}
```
变量对象是在**函数被调用但是函数尚未执行**的时刻被创建的，这个创建变量对象的过程实际就是函数内数据(函数参数、内部变量、内部函数)初始化的过程。

全局执行上下文中的变量对象就是**全局对象（GO）**。
> 全局上下文初始化时会初始化一系列原始属性：Math，String，Date，Window等，以浏览器为例，全局变量对象是window对象，全局上下文在执行前的初始化阶段，全局变量、函数都是被挂载倒window上的；全局环境中this指向window。


#### 活动对象（AO）
> 在没有执行当前环境之前，变量对象中的属性都不能访问；但是进入执行阶段之后，变量对象转变为了**活动对象（activation object）**。

活动对象和变量对象其实是一个东西，只是变量对象不可在`JavaScript`环境中访问，只有当js的执行流进入一个执行上下文中，这个执行上下文的变量对象才会被激活，成为活动对象，它上面的各种属性才能被访问。活动对象是在进入函数上下文时刻被创建的，它通过函数的`arguments`属性初始化。


#### 作用域（scope）
> 在`JavaScript`中, 作用域为可访问变量、对象、函数的集合；它规定了如何查找变量，也就是确定了当前执行代码对变量的访问权限。

ES6之前只有全局作用域和函数作用域。
1. **全局作用域**
    - 全局作用域在页面打开时被创建，页面关闭时被销毁
    - 编写在`script`标签中的变量和函数，作用域为全局，在页面的任意位置都可以访问到
    - 在全局作用域中有全局对象`window`，代表一个浏览器窗口，由浏览器创建，可以直接调用
    - 全局作用域中声明的变量和函数会作为`window`对象的属性和方法保存
    - `window`对象的属性和方法可以直接调用，如`window.fn()`，也可以写为`fn()`

2. **函数作用域**
    - 调用函数时，函数作用域被创建，函数执行完毕，函数作用域被销毁
    - 每调用一次函数就会创建一个新的函数作用域，他们之间是相互独立的
    - 在函数作用域中可以访问到全局作用域的变量，在函数外无法访问到函数作用域内的变量
    - 在函数作用域中访问变量、函数时，会先在自身作用域中寻找；若没有找到，则会到函数的上一级作用域中寻找，一直到全局作用域

在ES6之后提出了[块级作用域](https://es6.ruanyifeng.com/#docs/let#%E5%9D%97%E7%BA%A7%E4%BD%9C%E7%94%A8%E5%9F%9F)。

3. **块级作用域**
    - `let、const`就是`JavaScript`在`es6`中新增的用于声明块级作用域变量的方法。




#### 作用域链（scope chain）
> 当代码在一个环境中执行时，会创建变量对象的一个作用域链(scope chain)。作用域链的用途是**保证对执行环境有权访问的所有变量和函数的有序访问**。

- 作用域链的前端，始终都是当前执行的代码所在环境的变量对象。如果这个环境是函数，则将其活动对象(activation object)作为变量对象；
- 活动对象在最开始时只包含一个变量，即 `arguments`对象(这个对象在全局环境中是不存在的)；
- 作用域链中的下一个变量对象来自包含(外部)环境，而再下一个变量对象则来自下一个包含环境。这样，一直延续到全局执行环境；
- 全局执行环境的变量对象始终都是作用域链中的最后一个对象。

> 当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样由多个执行上下文的变量对象构成的链表就叫做作用域链。

> 内部环境可以通过作用域链访问所有的外部环境，但外部环境不能访问内部环境中的任何变量和函数。这些环境之间的联系是线性、有次序的。每个环境都可以向上搜索作用域链，以查询变量和函数名；但任何环境都不能通过向下搜索作用域链而进入另一个执行环境。



#### 词法环境（Lexical Environment）
> ECMAScript规范中对词法环境的描述如下：词法环境是用来定义，基于**词法嵌套结构的ECMAScript代码内的标识符与变量值和函数值之间的关联关系**的一种规范类型。

**在ES6中提出词法环境和变量环境两个概念**。

词法环境就是相应代码块内标识符与值的关联关系的体现。上文讲的作用域，和词法环境是类似的（ES6之后作用域概念变为词法环境概念）。

词法环境中有两个组成部分：
- **环境记录(EnvironmentRecord)**： 储存变量和函数声明的实际位置。可以理解为相应代码块内的所有变量声明、函数声明（代码块若为函数还包括其形参）都储存于此；对应ES6之前的变量对象。
- **对外部环境的引用(Outer)**：当前可以访问的外部词法环境。词法环境在逻辑上的嵌套结构对应ES6之前的作用域链。

词法环境主要有两种类型：
- 全局环境： 全局执行上下文，他没有外部环境的引用，拥有一个全局对象`window`和关联的方法和属性：`Math,String,Date`等。还有用户定义的全局变量，并将this指向全局对象。
- 函数环境： 用户在函数定义的变量将储存在环境记录中。对外部环境的引用可以是全局环境，也可以是包含内部函数的外部函数环境。环境记录中包含：用户声明的变量、函数、还有arguments对象。

#### 变量环境（Variable Environment）
> 变量环境也是一个词法环境。他具有词法环境中所有的属性；在ES6中，`LexicalEnvironment`和`VariableEnvironment`的区别在于前者用于存储函数声明和变量`let`和`const`绑定，而后者仅用于存储变量`var`绑定。

#### 词法作用域（lexical scoping）
> 词法作用域是作用域的其中一个工作模型（另外一个是动态作用域，在js中只有this涉及动态作用域），词法作用域主要在代码的编译阶段，一个变量和函数的词法作用域取决于该变量和函数声明的地方。（而动态作用域是取决于变量和函数被调用的地方）。

平常我们讨论函数和变量的时候说的作用域的工作模型就是上面说的词法作用域了，也被称为**静态作用域**；但是this对象的作用域的工作模型是**动态作用域**，取决于函数在哪里被调用。

**静态作用域**指的是一段代码在它执行之前就已经确定了它的作用域，简单来说就是在执行之前就确定了它可以应用哪些地方的作用域(变量)。

与词法作用域相对的是**动态作用域**，函数的作用域在函数调用的时候才决定。

::: tip 
1. js是一种弱语言，实际上不存在编译阶段，只存在预编译和执行阶段，声明的变量和函数是在预编译阶段被解释的。
2. 例如`var a=2`，这条语句会被分为两部分，声明部分和赋值部分，声明部分是在预编译阶段进行的，赋值部分是在执行阶段执行的。
3. 编译器对声明的标识符进行了编译，并告知给相应的作用域（分为全局作用域和函数作用域，除了with和catch，其中with会修改词法作用域，catch会创建新的作用域，这两者看起来的效果很像块级作用域，但是es6的let声明的才是真正的块级作用域）。
4. 一个语句的编译和执行是由作用域、编译器和引擎协同合作的。
:::



### js代码的执行流程
先看一个简单的例子：
```js
var scope = 'global';
function test(name, age) {
    var gender = 'boy';
    function show() {
        return name + age + gender;
    }
    show();
    
}
test('tom');
```
> 接下来结合这个例子，分析下js的执行流程：
1. 首先执行全局代码，创建全局执行上下文，全局上下文被压入执行上下文栈栈底：
```js
// js的执行上下文栈
 ECStack = [
    globalContext // 全局执行上下文
];
```
2. 全局上下文初始化：
> 对于每个执行上下文，都有三个重要属性：**变量对象、作用域链、this指向**
```js
globalContext = {
    VO: [global, scope, test], // 变量对象：global是一些全局变量属性、变量声明scope、函数声明test
    Scope: [globalContext.VO], // 作用域链：全局上下文的变量对象
    this: globalContext.VO // this指向：全局上下文的变量对象
}
```
3. 初始化的同时，`test`函数被创建，保存全局上下文的作用域链到函数的内部属性[[scope]]：
> 任何函数在创建的时候，都会创建一个[[scope]]属性，这个对象对应的是一个对象的列表，列表中的对象仅能javascript内部访问，没法通过语法访问；[[scope]]就是所有父变量对象的层级链，但并不代表完整的作用域链。
```js
test.[[scope]] = [
    globalContext.VO // 全局上下文的变量对象
];
```
4. 执行`test`函数，创建`test`函数执行上下文`testContext`，并将其压入执行上下文栈栈顶
```js
ECStack = [
    testContext,
    globalContext
];
```
5. 接着`test`函数执行上下文初始化：
    - 复制函数 [[scope]] 属性创建作用域链；
    - 用`arguments`创建活动对象（AO）;
    - 随后初始化AO，即加入形参、函数声明、变量声明；
    - 将活动对象压入 checkscope 作用域链顶端：`Scope = [AO].concat(test.[[scope]])`。
```js
testContext = {
    AO: { // 初始化活动对象
        arguments: { // arguments对象
            0: 'tom',
            1: undefined,
            length: 2
        },
        name: 'tom',
        age: undefined,
        gender: undefined, // 变量声明，值初始化为 undefined
        show: reference to function show(){} // 函数声明
    },
    Scope: [AO, globalContext.VO], // 将活动对象压入作用域链顶端
    this: undefined // this指向
}
```
同时`show`函数被创建，保存作用域链到`show`函数的内部属性[[scope]]：
```js
show.[[scope]] = [
    testContext.AO, // test函数上下文的活动对象
    globalContext.VO // 全局上下文的变量对象
];
```
6. 执行`show`函数，创建`show`函数执行上下文`showContext`，并将其压入执行上下文栈栈顶
```js
ECStack = [
    showContext,
    testContext,
    globalContext
];
```
7. `show`函数执行上下文初始化, 重复步骤5的流程：
```js
showContext = {
    AO: { // 活动对象初始化
        arguments: {
            length: 0
        }
    },
    Scope: [AO, testContext.AO, globalContext.VO], // 将当前活动对象压至作用域链顶端
    this: undefined // this指向
}
```
8. `show`函数执行，沿着作用域链查找`name、age、gender`的值，并返回`name + age + gender`
9. `show`函数执行完毕，`show`函数的上下文`showContext`从执行上下文栈中弹出：
```js
ECStack = [
    testContext,
    globalContext
];
```
同样的，`test`函数执行完成，它的上下文`testContext`也从执行上下文栈中弹出：
```js
 ECStack = [
    globalContext
];
```





## 闭包（closure）
js的执行上下文从创建到销毁大致梳理完了，接下来了解下神奇的闭包。

### 什么是闭包？
> 一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）。也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域。在 JavaScript 中，每当创建一个函数，闭包就会在函数创建的同时被创建出来。源自[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)

**闭包是指那些能够访问自由变量的函数**。自由变量是指在函数中使用的，但既不是函数参数也不是函数的局部变量的变量。
> 闭包 = 函数 + 函数能够访问的自由变量

创建闭包的常见方式，就是在一个函数内部创建另一个函数。

::: tip ECMAScript中，闭包指的是：
- 从理论角度：所有的函数。因为它们都在创建的时候就将上层上下文的数据保存起来了。哪怕是简单的全局变量也是如此，因为函数中访问全局变量就相当于是在访问自由变量，这个时候使用最外层的作用域。
- 从实践角度：以下函数才算是闭包：
    - 即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
    - 在代码中引用了自由变量
:::

接下来主要讲的是实践中的闭包~

### 看个例子
首先我们把刚才用于分析js执行流程的例子拷贝下来，做一下小小的修改：
```js
var scope = 'global';
function test(name, age) {
    var gender = 'boy';
    function show() {
        console.log(name + age + gender);
    }
    // show();
    return show; // 直接返回show函数
    
}
var a = test('tom', 29);
a(); // 执行a函数
// tom29boy
```
刚才我们已经对js的执行流程做了详细的分析，这里就简单说一下上面这段代码的执行过程：
::: tip 执行流程：
1. 进入全局代码，创建全局执行上下文，全局执行上下文压入执行上下文栈；
2. 全局执行上下文初始化；
3. 执行`test`函数，创建`test`函数执行上下文，`test`执行上下文被压入执行上下文栈；
4. `test`执行上下文初始化：创建变量对象、作用域链、this指向；
5. `test`函数执行完毕，`test`执行上下文从执行上下文栈中弹出；
6. 执行`show`函数，创建`show`函数执行上下文，`show`执行上下文被压入执行上下文栈；
7. `show`执行上下文初始化：创建变量对象、作用域链、this指向；
8. 函数执行完毕，`show`函数上下文从执行上下文栈中弹出。
:::
注意：这里`test函数上下文`会比`show函数上下文`先从`ECStack`中弹出！

上面在讲函数执行上下文的时候已经讲过：**当函数内代码执行完毕，该函数执行上下文会马上销毁，保存在其中的所有变量和函数定义也随之销毁**。

按照这个逻辑，当执行`show`函数的时候，是应该读取不到`test函数上下文`中的变量`name、age、gender`的；但神奇的是，执行`a()`时，是会成功打印的：`tom29boy`！

以上就已经实现了一个闭包，这也是闭包的神奇之处：自由变量的上下文已经销毁，但还是能引用它。

> 为什么会这样呢？

看一下`show`函数的作用域链：
```js
showContext = {
    Scope: [AO, testContext.AO, globalContext.VO],
}
```
上面讲过，当在一个函数上下文中查找变量时，会沿着作用域链网上查找。就是因为这个作用域链，`show`函数依然可以读取到`testContext.AO`的值，说明当`show`函数引用了`testContext.AO`中的值的时候，即使`testContext`被销毁了，但是JavaScript依然会让`testContext.AO`活在内存中，`show`函数依然可以通过`show`函数的作用域链找到它，正是因为JavaScript做到了这一点，从而实现了闭包这个概念。

### 再看一个例子
```js
var fn = [];

for (var i = 0; i < 3; i++) {
  fn[i] = function () {
    console.log(i);
  };
}

fn[0](); // 3
fn[1](); // 3
fn[2](); // 3
```
打印三个`3`，分析一下：

1. 当执行`fn[0]`之前，全局上下文的变量对象`VO`为：
```js
globalContext = {
    VO: {
        fn: [...],
        i: 3 // 全局对象VO中的 i 已经通过循环最终赋值为3
    }
}
```
2. 当执行`fn[0]`函数的时候，`fn[0]`函数的作用域链为：
```js
fn[0]Context = {
    Scope: [AO, globalContext.VO]
}
```
3. `fn[0]Context`的`AO`并没有`i`值，所以会从`globalContext.VO`中查找，`i`为`3`，所以打印的结果就是`3`。

4. `fn[1]`和`fn[2]`是一样的道理。

- 接下来改成闭包看一下：
```js
var fn = [];

for (var i = 0; i < 3; i++) {
    // 等于匿名自执行函数
  fn[i] = (function (j) {
    //  返回一个闭包
    return function() {
        console.log(j);
    }
  })(i); // 传入i
}

fn[0](); // 0
fn[1](); // 1
fn[2](); // 2
```
这次是依次打印：`0 1 2`，还是分析下流程：

1. 当执行到`fn[0]`函数之前，此时全局上下文的`VO`为：
```js
globalContext = {
    VO: {
        fn: [...],
        i: 3
    }
}
// 跟没改之前一样
```
2. 当执行`fn[0]`函数的时候，`fn[0]`函数的作用域链发生了改变：
> 当`fn[0]`函数返回后，其执行环境会被销毁，但它的活动对象仍然会留在内存中；直到匿名函数被销毁后，`fn[0]`的活动对象才会被销毁。
```js
fn[0]Context = {
    Scope: [AO, 匿名函数Context.AO, globalContext.VO]
}
```
匿名函数执行上下文的`AO`为：
```js
匿名函数Context = {
    AO: {
        arguments: {
            0: 0,
            length: 1
        },
        i: 0
    }
}
```
3. `fn[0]Context`的`AO`并没有`i`值，所以会沿着作用域链从`匿名函数Context.AO`中查找，这时候就会找`i`为`0`，找到了就不会往`globalContext.VO`中查找了，即使`globalContext.VO`也有`i`的值(值为3)，所以打印的结果就是`0`。

4. `fn[1]`和`fn[2]`是一样的道理。
> 在`fn[i]`调用每个匿名函数时，传入了变量`i`；由于函数参数是按值传递的，所以就会将变量`i`的当前值复制给参数`j`。而在这个匿名函数内部，又创建并返回了一个访问`j`的闭包。这样一来，`fn`数组中的每个函数都有自己`i`变量的一个副本，因此就可以返回各自不同的数值了。

### 闭包的用处
- **用闭包来模拟私有方法**
> 编程语言中，比如`Java`，是支持将方法声明为私有的，即它们只能被同一个类中的其它方法所调用；而`JavaScript`没有这种原生支持，但我们**可以使用闭包来模拟私有方法**。

私有方法不仅仅有利于限制对代码的访问：还提供了管理全局命名空间的强大能力，避免非核心的方法弄乱了代码的公共接口部分。

下面看一个经典的计数器的例子：
```js
// 定义一个变量
var makeCounter = function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  }
};

var Counter1 = makeCounter();
var Counter2 = makeCounter();
console.log(Counter1.value()); // 0
Counter1.increment();
Counter1.increment();
console.log(Counter1.value()); // 2
Counter1.decrement();
console.log(Counter1.value()); // 1
console.log(Counter2.value()); // 0
```
- 创建一个变量`makeCounter`，这个变量等于一个函数，在这个函数里面创建了一个词法环境，为三个函数所共享：`increment、decrement 和 value`；
- 该共享环境包含两个私有项：名为`privateCounter`的变量和名为`changeBy`的函数。这两项都无法在这个匿名函数外部直接访问。必须通过匿名函数返回的三个公共函数访问。
- 这三个公共函数是共享同一个环境的闭包。多亏`JavaScript`的词法作用域，它们都可以访问`privateCounter`变量和 `changeBy`函数。
> 两个计数器`Counter1、Counter2`是之间相互独立，每个闭包都是引用自己词法作用域内的变量`privateCounter`。每次调用其中一个计数器时，通过改变这个变量的值，会改变这个闭包的词法环境。然而在一个闭包内对变量的修改，不会影响到另外一个闭包中的变量。

闭包是一种保护私有变量的机制，在函数执行时形成私有的作用域，保护里面的私有变量不受外界干扰。

但因为创建闭包必须维护额外的作用域，过度使用它们可能会占用大量内存，比较常见的问题就是造成**内存泄露**。

::: tip 内存泄露
- 占用的内存没有及时释放
- 内存泄露积累多了就容易导致内存溢出
:::
常见的内存泄露：意外的全局变量、没有及时清理的计时器或回调函数、**闭包**

> 解决方法：在退出函数之前，将不使用的局部变量全部删除。


### 匿名函数
> 函数表达式不同于函数声明。函数声明要求有名字，但函数表达式不需要。没有名字的函数表达式也叫做匿名函数。
```js
// 一般函数声明
sayHi(); // Hi!
function sayHi(){
    console.log("Hi!");
};


// 匿名函数
sayHi(); //错误:sayHi is not a function
var sayHi = function(){
    console.log("Hi!");
};
```
匿名函数是用函数表达式进行赋值，不是函数声明，所以会报错。
> 造成这种现象是因为解析器在向执行环境中加载数据时，解析器会率先读取函数声明，并使其在执行任何代码前可用；至于函数表达式，则必须等到解析器执行到它的所在的的代码行，才会真正的被解析。函数表达式中，创建的函数叫做匿名函数，因为function关键字后面没有标识符。


### IIFE（自执行函数）
> `IIFE: Immediately Invoked Function Expression`，意为立即调用的函数表达式，也就是说，声明函数的同时立即调用这个函数。
```js
// 一般函数声明
function foo(){
  var a = 10;
  console.log(a);
}
foo();

// IIFE
(function foo(){
  var a = 10;
  console.log(a);
})();
```
函数的声明和`IIFE`的区别在于，在函数的声明中，我们首先看到的是`function`关键字，而`IIFE`我们首先看到的是左边的`（`也就是说，使用一对`（）`将函数的声明括起来，使得JS编译器不再认为这是一个函数声明，而是一个IIFE，即需要立刻执行声明的函数。

- **模拟块级作用域**
> es6之前js中没有块级作用域的概念，所以用var定义变量存在变量提升问题，上面已经展示过类似的例子；`IIFE`可以模拟块级作用域，目的是为了隔离作用域，防止污染全局命名空间。
```js
(function(){
    //这里是块级作用域
    var a = 1;
    console.log(a); // 1
})();
console.log(a); // 报错：a is not defined
```
> 这种做法可以减少闭包占用的内存问题，因为没有指向匿名函数的引用。只要函数执行完毕，就可以立即销毁其作用域链了。



### 一道面试题
最后来看一道面试题：

```js
for (var i = 0; i < 5; i++) {
    setTimeout(function() {
        console.log(i);
    }, 1000);
}

console.log(i);
```
这个都知道，先打印`5`，`1000ms`后打印五个`5`；那接下来改造下，使能输出：`5 -> 0,1,2,3,4`
> 这里当然可以用`let`，或者给`setTimeout`传入第三个参数来实现，但不是这篇博文的考察重点，暂不考虑~

1. IIFE实现
```js
for (var i = 0; i < 5; i++) {
    (function(j) {
        setTimeout(function() {
            console.log(j);
        }, 1000);
    })(i)
}

console.log(i);
```
这里用了IIFE匿名函数实现，上面已经讲过，它能模拟块级作用域~

2. 如果希望依次输出：`0 -> 1 -> 2 -> 3 -> 4 -> 5`，怎么实现？
> 其实这里主要考察对异步操作的处理，可以用es6的`Promise`来解决：
```js
var promiseFn = (i) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(i); // 依次打印 0 1 2 3 4
            resolve();
        }, i * 1000)
    })
}
var task = [];
for (var i = 0; i < 5; i ++) {
    task.push(promiseFn(i));
}

Promise.all(task).then(res => {
    setTimeout(() => {
        console.log('end', i); // end 5
    }, 1000)
})
```
接下来用ES7的`async/await`来优化一下：
```js
// 定义一个sleep函数
function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// 的IIFE函数：用async/await
(
    async function(){
        for (var i = 0; i < 5; i ++) {
            if (i > 0) await sleep(1000);
            console.log(i); // 依次打印 0 1 2 3 4
        }
        await sleep(1000);
        console.log('end',i); // end 5

    }
)()
```


## js的垃圾回收机制

### 简介
> JavaScript具有自动垃圾收集机制（Garbage Collecation），也就是说，执行环境会负责管理代码执行过程中使用的内存。而在 C 和 C++之类的语言中，开发人员的一项基本任务就是手工跟踪内存的使用情况，这是造成许多问题的一个根源。在编写 JavaScript 程序时，开发人员不用再关心内存使用问题，所需内存的分配以及无用内存的回收完全实现了自动管理。

这种垃圾收集机制的原理其实很简单：找出那些不再继续使用的变量，然后释放其占用的内存。

为此，垃圾收集器会按照固定的时间间隔(或代码执行中预定的收集时间)， 周期性地执行这一操作。

> 由于字符串、对象和数组没有固定大小，当他们的大小已知时，才能对他们进行动态的存储分配。JavaScript程序每次创建字符串、数组或对象时，解释器都必须分配内存来存储那个实体。只要像这样动态地分配了内存，最终都要释放这些内存以便他们能够被再用，否则，JavaScript的解释器将会消耗完系统中所有可用的内存，造成系统崩溃。

现在各大浏览器通常用采用的垃圾回收有两种方法：**标记清除、引用计数**。

- 标记清除

这是javascript中最常用的垃圾回收方式。当变量进入执行环境是，就标记这个变量为“进入环境”。从逻辑上讲，永远不能释放进入环境的变量所占用的内存，因为只要执行流进入相应的环境，就可能会用到他们。当变量离开环境时，则将其标记为“离开环境”。

- 引用计数

另一种不太常见的垃圾回收策略是引用计数。引用计数的含义是跟踪记录每个值被引用的次数。当声明了一个变量并将一个引用类型赋值给该变量时，则这个值的引用次数就是1。相反，如果包含对这个值引用的变量又取得了另外一个值，则这个值的引用次数就减1。当这个引用次数变成0时，则说明没有办法再访问这个值了，因而就可以将其所占的内存空间给收回来。这样，垃圾收集器下次再运行时，它就会释放那些引用次数为0的值所占的内存。


### 内存泄漏
虽然JavaScript会自动垃圾收集，但是如果我们的代码写法不当，会让变量一直处于“进入环境”的状态，无法被回收。下面列一下内存泄漏常见的几种情况：
1. 意外的全局变量
```js
function foo(arg) {
    bar = "this is a hidden global variable";
}
```
bar没被声明,会变成一个全局变量,在页面关闭之前不会被释放。

2. 被遗忘的计时器或回调函数
```js
var name = 'tom';
setInterval(function() {
    var node = document.getElementById('Node');
    if(node) {
        node.innerHTML = name;
    }
}, 1000);
```
这样的代码很常见，如果id为Node的元素从DOM中移除，该定时器仍会存在，同时，因为回调函数中包含对name的引用，定时器外面的name也不会被释放。

3. 闭包
> 上面讲过，闭包可以维持函数内局部变量，使其得不到释放；解决方法在退出函数前手动删除。

4. 没有清理的DOM元素引用
```js
var elements = {
    button: document.getElementById('button')
};
document.body.removeChild(document.getElementById('button'));
```
虽然用removeChild移除了button，但是还在elements对象里保存着#button的引用，换言之，DOM元素还在内存里面；需要把两个引用都清除才能将其从内存中删除。




## 其他
### JS引擎
> JS引擎主要是对JS代码进行词法、语法等分析，通过编译器将代码编译成可执行的机器码让计算机去执行。目前最流行的JS引擎非V8莫属了，Chrome浏览器和Node.js采用的引擎就是V8引擎。JS引擎中有堆(Memory Heap)和栈(Call Stack)的概念。

### RunTime
> JS在浏览器中可以调用浏览器提供的API，如window对象，DOM相关API等。这些接口并不是由V8引擎提供的，是存在与浏览器当中的。因此简单来说，对于这些相关的外部接口，可以在运行时供JS调用，以及JS的事件循环(Event Loop)和事件队列(Callback Queue)，把这些称为RunTime。同样，在Node.js中，可以把Node的各种库提供的API称为RunTime。所以可以这么理解，Chrome和Node.js都采用相同的V8引擎，但拥有不同的运行环境(RunTime Environments)。

### 变量提升和函数提升
> 上面讲到，执行上下文主要有两个阶段，一个创建阶段，一个执行阶段；在创建阶段的时候会进行上下文初始化：创建作用域链、创建变量对象、创建this指向；而在创建对象的时候会首先进行函数声明，并将函数名指向函数在内存中的地址；之后便进行变量声明，赋值为undefined，等到上下文进行执行阶段再对已经声明的变量进行赋值，这就是js中出现变量提升和函数提升原因。
```js
console.log(a); // undefined：在全局上下文初始化的时候已经对变量a进行了声明，只是未赋值，所以打印undefined
console.log(b); // 会打印b的函数体
b(); // 在全局上下文初始化的时候已经对函数b进行了声明，所以这里能够执行
var a = 'ceshi';
console.log(a); // ceshi：变量a被赋值，直接打印
function b() {
    console.log(b); // undefined：这里变量b已声明但未赋值

    var b = 'b'; // 函数b的执行上下文创建阶段，对变量b进行声明
}
```
- 看个例子：
```js
showName()
var showName =function(){
    console.log(2);
}
function showName(){
    console.log(1);
}
showName()
```
打印顺序是：`1 2`；为什么呢？分析一下：
1. 首先全局上下文进行初始化，创建变量对象的时候会首先进行函数声明，查找到有一个属性名为`showName`是`function`函数，并将其指向函数中内存地址；
2. 之后进行变量声明的时候，遇到`var`声明变量`showName`，但由于之前函数声明已经声明过同名的`showName`，这里就直接跳过，不再进行`showName`的变量声明；
3. js第一次执行`showName()`的时候，执行的时候它的函数声明的内容：`console.log(1)`；之后`var showName =function(){console.log(2);}`对`showName`进行了重新赋值，所以在执行第二次`showName`时就打印`2`了。


### javascript-visualizer
> 这里有一个小工具可以将js执行上下文从创建到执行的流程可视化，手动敲一遍代码更能加深自己的理解：[javascript-visualizer](https://ui.dev/javascript-visualizer/)




## 备注
1. 执行上下文在初始化的时候，会确定`this`指向，这里`this`指向是怎么确定的，下来有时间了可以继续深入研究~
2. 完善作用域部分的知识，梳理下它跟词法作用域的关系
3. 再细化函数提升和变量提升
4. 加深对词法环境和词法作用域的理解，with和catch对作用域的影响


## 参考
1. [JS 执行环境（EC），变量对象（VO）](https://www.jianshu.com/p/82691a18562d)
2. [JavaScript深入之执行上下文](https://juejin.cn/post/6844903474027560968)
3. [JavaScript高级程序设计-第3版](https://book.douban.com/subject/10546125/)
4. [深入JavaScript系列（一）：词法环境](https://blog.csdn.net/weixin_34176694/article/details/88000615)
5. [JavaScript 如何工作：对引擎、运行时、调用堆栈的概述](https://juejin.cn/post/6844903510538993671)
6. [JavaScript深入之闭包](https://juejin.cn/post/6844903475998900237)
7. [JavaScript深入之变量对象](https://juejin.cn/post/6844903473528602637)
8. [冴羽的博客](https://github.com/mqyqingfeng/Blog)
9. [破解前端面试（80% 应聘者不及格系列）：从闭包说起](https://juejin.cn/post/6844903474212143117)
10. [JavaScript中的垃圾回收和内存泄漏](https://juejin.cn/post/6844903833387155464)
11. [【译】终极指南：变量提升、作用域和闭包](https://juejin.cn/post/6844903747617832973)


<fix-link label="Back" href="/frontend/js/depth.html"></fix-link>


<!-- 2021-04-23 -->
