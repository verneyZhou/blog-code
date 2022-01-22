---
title: JS深入：var、let、const
date: 2021-03-31 23:18:48
permalink: /pages/9157b5/
categories:
  - js
tags:
  - js
---

# JS深入：var、let、const
这里对js最基本、常用的`var、let、const`进行简单地梳理~

## 简介
在`ES6`之前我们都是通过`var`关键字定义`JavaScript`变量。`ES6`才新增了`let`和`const`关键字。


### var
`var`声明语句声明一个变量，并可选地将其初始化为一个值。详见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/var)
> `ECMAScript`的变量是松散类型的，所谓松散类型就是可以用来保存任何类型的数据。换句话说，每个变量仅仅是一个用于保存值的占位符而已。定义变量时要使用`var`操作符(注意var是一个关键字)，后跟变量名(即一个标识符)，如下所示：
```js
// 这行代码定义了一个名为 message 的变量，该变量可以用来保存任何值(像这样未经过初始化的 变量，会保存一个特殊的值：：undefined
var a;

// 1.在全局作用域下使用 var 声明一个变量，默认它是挂载在顶层对象 window 对象下（Node 是 global）
var b = 1;
console.log(b,window.b); // 1 1


// 2.用 var 声明的变量的作用域是它当前的执行上下文，可以是函数也可以是全局
var x = 1 // 声明在全局作用域下
function foo() {
    var x = 2 // 声明在 foo 函数作用域下
    console.log(x) // 2
}
foo()
console.log(x)  // 1


// 3.如果赋值给未声明的变量，该变量会被隐式地创建为全局变量（它将成为顶层对象的属性）
function foo(){
    b = 3
}
foo()
console.log(window.b) // 3
```

> 变量声明，无论发生在何处，都在执行任何代码之前进行处理。用`var`声明的变量的作用域是它当前的执行上下文，它可以是嵌套的函数，或者对于声明在任何函数外的变量来说是全局。


#### 变量提升（hoisted）
由于变量声明（以及其他声明）总是在代码执行之前处理的，所以在代码中的任意位置声明变量总是等效于在代码开头声明。这意味着变量可以在声明之前使用，这个行为叫做“hoisting”。“hoisting”就像是把所有的变量声明移动到函数或者全局代码的开头位置。

> 关于为什么会发生变量提升和函数提升，在我的另一篇博文[js深入：从执行上下文到闭包](./closure)中有更细致的分析，这里不再赘述~
```js
console.log(b) // undefined
var b = 3

// 上面代码可以隐式的理解为：
var b
console.log(b) // undefined
b = 3
```
> 建议始终在作用域顶部声明变量（全局代码的顶部和函数代码的顶部），这可以清楚知道哪些变量在函数作用域内，哪些变量是在全局作用域内。

- 看一个例子：
```js
var x = y, y = 'A';
console.log(x + y); // undefinedA
```
在这里，x 和 y 在代码执行前就已经创建了，而赋值操作发生在创建之后。当"x = y"执行时，y 已经存在，所以不抛出ReferenceError，并且它的值是'undefined'。所以 x 被赋予 undefined 值。然后，y 被赋予'A'。于是，在执行完第一行之后，x === undefined && y === 'A' 才出现了这样的结果。


#### 作用域规则
> `var`只能在全局作用域和函数作用域内声明变量，多次声明同一个变量并不会报错。
```js
// a. 里层的 for 循环会覆盖变量 i，因为所有 i 都引用相同的函数作用域内的变量；这些问题可能在代码审查时漏掉，引发无穷的麻烦。
function sumArr(arrList) {
    var sum = 0;
    for (var i = 0; i < arrList.length; i++) {
        var arr = arrList[i];
        for (var i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
    }

    return sum;
}


// b. 用来计数的循环变量泄露为全局变量
var a = [];
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 10


// c. 内层变量可能会覆盖外层变量
var tmp = new Date();
function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';
  }
}

f(); // undefiend
```

::: warning
1. 所有未声明直接赋值的变量都会自动挂在顶层对象下，这样容易造成全局环境变量不可控、混乱
2. 允许多次声明同一变量而不报错，造成代码不容易维护
:::



### let
let 语句声明一个块级作用域的本地变量，并且可选的将其初始化为一个值。详见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let)
```js
let x = 1;
if (true) {
  let x = 2;
  console.log(x);// 2
}
console.log(x); // 1
```
> `let`允许你声明一个作用域被限制在块级中的变量、语句或者表达式。与`var`关键字不同的是， `var`声明的变量只能是全局或者整个函数块的。`var`和`let`的不同之处在于后者是在编译时才初始化。

#### 块级作用域`{}`
> JS中作用域有：全局作用域、函数作用域。没有块作用域的概念。ECMAScript 6(简称ES6)中新增了块级作用域。
块作用域由`{ }`包括，if语句和for语句里面的`{}`也属于块作用域。

ES6的块级作用域必须有大括号，如果没有大括号，JavaScript引擎就认为不存在块级作用域；块级作用域的出现，实际上使得获得广泛应用的匿名立即执行函数表达式（匿名 IIFE）不再必要了：
```js
// IIFE 写法
(function () {
  var tmp = ...;
  ...
}());

// 块级作用域写法
{
  let tmp = ...;
  ...
}
```

#### 作用域规则
> let声明的变量只在其声明的块或子块中可用，这一点，与var相似。二者之间最主要的区别在于var声明的变量的作用域是整个封闭函数。
```js
function varTest() {
  var x = 1;
  {
    var x = 2;  // 同样的变量!
    console.log(x);  // 2
  }
  console.log(x);  // 2
}

function letTest() {
  let x = 1;
  {
    let x = 2;  // 不同的变量
    console.log(x);  // 2
  }
  console.log(x);  // 1
}
```

#### 暂时性死区（TDZ）
> **所谓暂时性死区（Temporal Dead Zone），指`let`声明的变量在被声明之前不能被访问**。与通过`var`声明的有初始化值`undefined`的变量不同，通过`let`声明的变量直到它们的定义被执行时才初始化。在变量初始化前访问该变量会导致`ReferenceError`。该变量处在一个自块顶部到初始化处理的“暂存死区”中。
```js
console.log(x) // Uncaught ReferenceError: x is not defined
let x = 1
```

> 为了减少运行时错误，防止在变量声明前就使用这个变量，从而导致意料之外的行为。这样的错误在 ES5 是很常见的，现在有了这种规定，避免此类错误就很容易了。

暂时性死区的本质就是，只要一进入当前作用域，所要使用的变量就已经存在了，但是不可获取，只有等到声明变量的那一行代码出现，才可以获取和使用该变量。

与通过var声明的变量, 有初始化值 undefined和只是未声明的变量不同的是，如果使用typeof检测在暂存死区中的变量, 会抛出ReferenceError异常：
```js
// results in a 'ReferenceError'
console.log(typeof i);
let i = 10;
```

- **特点**
1. 使用`let`在全局作用域下声明的变量也不是顶层对象的属性
```js
let b = 2
window.b // undefined
```
> 在全局作用域中，用 let 和 const 声明的全局变量没有在全局对象中，只是一个块级作用域（Script）中。

2. 不允许同一块中重复声明
```js
let x = 1
let x = 2 // Uncaught SyntaxError: Identifier 'x' has already been declared
```
3. 关于let有没有变量提升可以参考这篇博文:[我用了两个月的时间才理解 let
](https://zhuanlan.zhihu.com/p/28140450)；里面讲的大致意思就是，变量主要有**创建、初始化（声明）、赋值**三个阶段，而let只是在创建阶段提升了，而初始化和赋值阶段没有提升：
    - let 的「创建」过程被提升了，但是初始化没有提升。
    - var 的「创建」和「初始化」都被提升了。
    - function 的「创建」「初始化」和「赋值」都被提升了。




### const
const声明一个只读的常量。一旦声明，常量的值就不能改变。const的作用域与let命令相同：只在声明所在的块级作用域内有效。
```js
const a = 1
a = 2 // Uncaught TypeError: Assignment to constant variable.

const s // 声明未赋值
// Uncaught SyntaxError: Missing initializer in const declaration
```
> const实际上保证的，**并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动**。对于简单类型的数据（数值、字符串、布尔值），值就保存在变量指向的那个内存地址，因此等同于常量。但对于复合类型的数据（主要是对象和数组），变量指向的内存地址，保存的只是一个指向实际数据的指针，const只能保证这个指针是固定的（即总是指向另一个固定的地址），至于它指向的数据结构是不是可变的，就完全不能控制了。


## 对比
1. var会污染全局对象，let/const不会
2. var是可以重复申明
3. var存在变量提升
4. let、const可以形成块级作用域，var不会形成块级作用域
5. let、const会形成一个暂时性死区，var不会
6. 指针的变化：let、const都是ES6新增声明的变量的语法，区别是let创建的变量是可以更改指针指向，也就是可以重新赋值，但是const申明的变量是不允许改变指针指向的。



## 几个例子

1.
```js
var a = 111
{
    console.log(a,window.a)
    a = 222
    console.log(a,window.a)
    function a(){}
    console.log(a,window.a)
}
```
打印顺序为：
```
ƒ a(){} 111
222 111
222 222
```

2.
```js
{
    function a() {
        console.log(20);
    }
    var b = 1;

    window.a = a;
    window.b = b;

    a = 20;
    b = 2;
    
    window.a = a;
    window.b = b;

    a = 30;
    b = 3;
}

console.log(a); // 20
console.log(b); // 3
```
函数`a`是存在于`Block`作用域中，刚开始执行`window.a = a`时，window下的a被赋值为函数；之后又被赋值为`20`；所以最后打印`20`；而`var`没有块级作用域，`全局的{}`中声明的变量会自动挂载到`window`下面作为全局变量，所以最后打印`3`。





## 参考
1. [es6入门-let 和 const 命令](https://es6.ruanyifeng.com/#docs/let)
2. [【译】终极指南：变量提升、作用域和闭包](https://juejin.cn/post/6844903747617832973)
3. [var、let、const 有什么区别](https://mp.weixin.qq.com/s/0YEcZEMIsVn5d7uPO68WXQ)


<fix-link label="Back" href="/frontend/js/depth.html"></fix-link>


<!-- 2021-04-25 -->

