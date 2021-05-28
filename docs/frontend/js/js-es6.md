

# JS深入：ES6、ES7、ES8...
这里主要是我对ES6+特性的学习记录（持续更新中...）

## 前言
> 这里先做一些简单的回顾，回顾下`Javascript`的前世今生~


### JavaScript简史
> **1995**年，就职于 **Netscape** 公司的布兰登·艾奇(**Brendan Eich**)开发了一种名为 **LiveScript** 的脚本语言，Netscape 为了搭上媒体热炒 Java 的顺风车， 临时把 LiveScript 改名为 **JavaScript**，并在 Netscape Navigator 2 中发布；JavaScript 1.0 获得了巨大成功，Netscape 随即在 Netscape Navigator 3 中又发布了 JavaScript 1.1；

Netscape Navigator 3 发布后不久，微软就在其 Internet Explorer 3 中加入了名为 **JScript** 的 JavaScript 实现(命名为 JScript 是为了避开与 Netscape 有关的授权问题)。

微软推出其 JavaScript 实现意味着有了两个不同的 JavaScript 版本：Netscape Navigator 中的 JavaScript、Internet Explorer 中的 JScript。当时还没有标准规定 JavaScript 的 语法和特性，两个不同版本并存的局面已经完全暴露了这个问题。随后 JavaScript 的标准化问题被提上了议事日程。

### ECMAScript
1997 年，以 JavaScript 1.1 为蓝本的建议被提交给了**欧洲计算机制造商协会(ECMA，European Computer Manufacturers Association)**。
ECMA（欧洲计算机制造商协会，European Computer Manufacturers Association）；随后，来自 Netscape、Sun、微软这些公司里关注脚本语言发展的程序员们经过数月的努力，完成了 **ECMA-262**，定义一种名为 **ECMAScript**(发音为“ek-ma-script”)的**新脚本语言的标准**。

第二年，**ISO/IEC**(International Organization for Standardization and International Electrotechnical Commission，国标标准化组织和国际电工委员会)也采用了 ECMAScript 作为标准(即 ISO/IEC-16262)。 自此以后，浏览器开发商就开始致力于将 ECMAScript 作为各自 JavaScript 实现的基础，也在不同程度 上取得了成功。


- **ECMAScript vs JavaScript**

虽然 JavaScript 和 ECMAScript 通常都被人们用来表达相同的含义，但 JavaScript 的含义却比 ECMA-262 中规定的要多得多。一个完整 JavaScript 实现应该包含：**核心(ECMAScript)、文档对象模型(DOM)、浏览器对象模型(BOM)**。

ECMA-262 定义的只是 ECMAScript 这门语言的基础，而在此基础之上可以构建更完善的脚本语言；ECMAScript 这门语言本身并不包含输入和输出定义，我们常见的 Web 浏览器只是 ECMAScript 实现可能的**宿主环境**之一。
> 宿主环境不仅提供基本的 ECMAScript 实现，同时也会提供该语言的扩展，以便语言与环境之间对接交互。而这些扩展（如 DOM）则利用 ECMAScript 的核心类型和语法提供更多更具体的功能，以便实现针对环境的操作。其他 宿主环境如：Node 和 Adobe Flash。

**ECMAScript 是一种语言标准，JavaScript 是 ECMAScript 的一种实现。**


### ECMAScript 的版本
> ECMAScript 的不同版本又称为版次，以第 x 版表示(意即描述特定实现的 ECMA-262 规范的第 x 个版本)。

ECMA-262 的第 1 版本质上与 Netscape 的 JavaScript 1.1 相同，只不过作了一些较小的改动；ECMA-262 的第 5 版发布于 2009 年，也就是我们常说的 **ES5**。

|  ESMAScript版本   | 发布时间  |  新增特性  |
|  ----  | ----  |  ----  |
| ECMAScript 2009(ES5)  | 2009年11月 | 扩展了Object、Array、Function的功能等 |
| ECMAScript 2015(ES6)  | 2015年6月 | 类，模块化，箭头函数，函数参数默认值等 |
| ECMAScript 2016(ES7)  | 2016年3月 | includes，指数操作符 |
| ECMAScript 2017(ES8)  | 2017年6月 | sync/await，Object.values()，Object.entries()，String padding等 |
| ECMAScript 2018(ES9)  | - | Promise.finally()等 |
| ECMAScript 2019(ES10)  | - | Array.flat()、Array.flatMap()等 |
| ECMAScript 2020(ES11)  | - | Promise.allSettled()、import()、BigInt等 |
| ECMAScript 2021(ES12)  | - | Promise.any()等 |


## ES6（2015）
> ES6 在 ES5 发布近 6 年（2009-11 至 2015-6）之后才将其标准化，两个发布版本之间时间跨度很大，所以ES6中的特性比较多。ES6 的目标是使得 JavaScript 语言可以用来编写复杂的大型应用程序，成为企业级开发语言。

关于 ES6 中新增了哪些特性，具体可以参考阮老师的[ES6 入门教程](https://es6.ruanyifeng.com/)，我就不再一一罗列，这里只是简单记录下我对 ES6 部分特性的学习。






### 箭头函数的this指向
> 关于箭头函数的使用详见[ECMAScript 6 入门-箭头函数](https://es6.ruanyifeng.com/#docs/function#%E7%AE%AD%E5%A4%B4%E5%87%BD%E6%95%B0)，这里主要分析下它的`this`指向。

对于普通函数来说，内部的`this`代表函数运行时所在的对象，但是这一点对箭头函数不成立，它没有自己的`this`对象，内部的`this`就是一个普通变量，指向**定义时上层函数所在的对象**，也就是说，它只会**从自己的作用域链的上一层继承`this`**。
> 箭头函数内部的`this`指向是固定的，相比之下，普通函数的`this`指向是可变的。

- 执行以下代码，对比一下：
``` js
function foo() {
    console.log(this.id); // 42
    // 箭头函数
  setTimeout(() => {
    console.log('id1:', this.id); // id1: 42
  }, 100);

    // 普通函数
  setTimeout(function(){
    console.log('id2:', this.id); // id2: 21
  }, 100);
}

var id = 21;

foo.call({ id: 42 }); // call改变了foo函数this指向
```
上面例子中，普通函数的`this`指向`window`对象，所以打印`21`；箭头函数导致`this`总是指向定义时上层函数所在的对象，所以打印`42`。

- 下面是 Babel 转箭头函数产生的 ES5 代码：
``` js
// ES6
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

// ES5
function foo() {
  var _this = this;

  setTimeout(function () {
    console.log('id:', _this.id);
  }, 100);
}
```
> 转换后的 ES5 版本清楚地说明了，箭头函数里面根本没有自己的`this`，而是引用外层的`this`。

- **总结**
1. 在函数里面如果存在嵌套的箭头函数，它们的`this`都指向外层函数的`this`；也正因为没有`this`指向，箭头函数不能用作构造函数，也没有`prototype`属性；
2. 除了`this`，`arguments、super、new.target`这三个变量在箭头函数之中也是不存在的，均指向外层函数的对应变量；
3. 对象的属性建议使用传统的写法定义，不要用箭头函数定义，因为箭头函数里的`this`不指向该对象；
5. 箭头函数表达式更适用于那些本来需要**匿名函数**的地方，如： `[1,2,3,4].map(v => v * 2)`
4. 需要**动态this**的时候，也不应使用箭头函数，如：
    ``` js
    button.addEventListener('click', () => {
        this.classList.toggle('on'); // 会报错，因为 this 指向全局
    });
    ```


### Class类
> ES6之前，JavaScript 中生成实例对象的传统方法是通过构造函数。ES6 提供了更接近传统语言的写法，引入了 Class（类）这个概念，作为对象的模板。通过class关键字，可以定义类。[参考](https://es6.ruanyifeng.com/#docs/class)

基本上，ES6 的class可以看作只是一个语法糖，它的绝大部分功能，ES5 都可以做到，新的class写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。

``` js
// ES5 构造函数
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function () {
  return '(' + this.x + ', ' + this.y + ')';
};


// ES6 Class类
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}


var p = new Point(1, 2);
```
上面代码定义了一个“类”，可以看到里面有一个`constructor()`方法，这就是构造方法，而`this`关键字则代表实例对象。

ES6 的类，完全可以看作构造函数的另一种写法。

``` js
class Point {
    constructor(x, y) {
        // ...
    }

    toString() {
        // ...
    }
}

typeof Point // "function"
Point === Point.prototype.constructor // true
Object.keys(Point.prototype) // []
```
**总结**

- 类的数据类型就是函数，类本身就指向构造函数。
- 类的内部所有定义的方法，都是不可枚举的（non-enumerable）;这一点与 ES5 的行为不一致。
- 构造函数的`prototype`属性，在 ES6 的“类”上面继续存在。事实上，类的所有方法都定义在类的`prototype`属性上面。
- `constructor()`方法是类的默认方法，通过`new`命令生成对象实例时，自动调用该方法。一个类必须有`constructor()`方法，如果没有显式定义，一个空的`constructor()`方法会被默认添加。
    > constructor()方法默认返回实例对象（即this）。
- 类必须使用`new`调用，否则会报错。这是它跟普通构造函数的一个主要区别，后者不用`new`也可以执行。
- 与 ES5 一样，实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）。
- 类不存在变量提升（hoist），这一点与 ES5 完全不同。
- 如果在一个方法前，加上`static`关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为**静态方法**。



### Set和Map




### Promise
Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。[参考](https://es6.ruanyifeng.com/#docs/promise)

#### Promise.all
> Promise.all()方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。
``` js
const p = Promise.all([p1, p2, p3]);
```
p的状态由p1、p2、p3 决定，分成两种情况：
- 只有p1、p2、p3 的状态都变成 fulfilled，p 的状态才会变成 fulfilled，此时p1、p2、p3 的返回值组成一个数组，传递给p的回调函数。
- 只要p1、p2、p3 之中有一个被 rejected，p 的状态就变成 rejected，此时第一个被 reject 的实例的返回值，会传递给p的回调函数。

p1、p2、p3都是 Promise 实例，如果不是，就会先调用 Promise.resolve 方法，将参数转为 Promise 实例，再进一步处理。


### Promise.race() 
> Promise.race()方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。
``` js
const p = Promise.race([p1, p2, p3]);
```
只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数。

``` js
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p
.then(res => console.log(res))
.catch(err => console.error(err));
```
Promise.race()可以用于需要对接口请求设置超时限制的场景。



### Generator
Generator 函数是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同。





### Proxy
> Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。详见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

Proxy 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以**对外界的访问进行过滤和改写**。Proxy 这个词的原意是**代理**，用在这里表示由它来“代理”某些操作，可以译为“代理器”。

[ES6](https://es6.ruanyifeng.com/#docs/proxy) 原生提供 Proxy 构造函数，用来生成 Proxy 实例。

- **语法**

`const p = new Proxy(target, handler)`

> - **target**：要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）；
> - **handler** 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为；

new Proxy()表示生成一个Proxy实例，target参数表示所要拦截的目标对象，handler参数也是一个对象，用来定制拦截行为。

``` js
var proxy = new Proxy({}, {
  get: function(target, propKey) {
    return 35;
  }
});

proxy.time // 35
proxy.name // 35
proxy.title // 35
```
上面代码中，作为构造函数，Proxy接受两个参数：第一个参数是所要代理的**目标对象（target）**，上例是个空对象；第二个参数是一个**配置对象（handler）**，配置对象有一个get方法，用来拦截对目标对象属性的访问请求。
> get方法的两个参数分别是**目标对象（target）**和**所要访问的属性（propKey）**。可以看到，由于拦截函数总是返回35，所以访问任何属性都得到35。

- 要使得 Proxy 起作用，必须针对 Proxy 实例（上例是 proxy 对象）进行操作，而不是针对目标对象（上例是空对象）进行操作。
- 如果 handler 没有设置任何拦截，那就等同于直接通向原对象（无操作转发代理）。


#### Proxy 实例的方法
> handler 对象是一个容纳一批特定属性的占位符对象。它包含有 Proxy 的各个捕获器（trap）。所有的捕捉器是可选的。如果没有定义某个捕捉器，那么就会保留源对象的默认行为。


- **get()**
> get方法用于拦截某个属性的读取操作，可以接受三个参数，依次为目标对象、属性名和 proxy 实例本身（严格地说，是操作行为所针对的对象），其中最后一个参数可选。

``` js
var person = {
  name: "张三"
};

var proxy = new Proxy(person, {
    get: function(target, propKey, receiver) {
      console.log(target, propKey, receiver); // {name: "张三"} "name" Proxy {name: "张三"}
        if (propKey in target) {
        return target[propKey];
        } else {
        throw new ReferenceError("Prop name \"" + propKey + "\" does not exist.");
        }
    }
});

proxy.name  // "张三"
proxy.age // Uncaught ReferenceError: Prop name "age" does not exist.
```

- **set()**
> set方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 Proxy 实例本身，其中最后一个参数可选。

``` js
let validator = {
    set: function(obj, prop, value, receiver) {
        if (prop === 'age') {
            if (!Number.isInteger(value)) {
                throw new TypeError('The age is not an integer');
            }
            if (value > 200) {
                throw new RangeError('The age seems invalid');
            }
        }
        // 对于满足条件的 age 属性以及其他属性，直接保存
        obj[prop] = value;
        return true;
    }
}

let person = new Proxy({}, validator);

person.age = 100;

person.age // 100
person.age = 'young' // Uncaught RangeError: The age is not an integer
person.age = 300 //  Uncaught RangeError: The age seems invalid
```
上面代码中，由于设置了存值函数set，任何不符合要求的age属性赋值，都会抛出一个错误，这是数据验证的一种实现方法。
> 利用set方法，还可以数据绑定，即每当对象发生变化时，会自动更新 DOM。

- **apply()** 
> apply方法拦截函数的调用、call和apply操作。apply方法可以接受三个参数，分别是目标对象、目标对象的上下文对象（this）和目标对象的参数数组。

- 用法：
``` js
var handler = {
  apply (target, ctx, args) {
    return Reflect.apply(...arguments);
  }
};
```

- 例子：
``` js
var twice = {
  apply (target, ctx, args) {
    return Reflect.apply(...arguments) * 2;
  }
};
function sum (left, right) {
  return left + right;
};
var proxy = new Proxy(sum, twice);
proxy(1, 2) // 6
proxy.call(null, 5, 6) // 22
proxy.apply(null, [7, 8]) // 30
```
上面代码中，每当执行proxy函数（直接调用或call和apply调用），就会被apply方法拦截。


- **其他方法**
> 这里简单罗列下Proxy实例的其他方法~

- `has()`方法用来拦截 HasProperty 操作，即判断对象是否具有某个属性时，这个方法会生效。
- `construct()`方法用于拦截 new 命令。
- `deleteProperty()`方法用于拦截 delete 操作，如果这个方法抛出错误或者返回 false，当前属性就无法被 delete 命令删除。
- `defineProperty()`方法拦截了 Object.defineProperty() 操作。
- `getOwnPropertyDescriptor()`方法拦截 Object.getOwnPropertyDescriptor() ，返回一个属性描述对象或者 undefined。
- `getPrototypeOf()`方法主要用来拦截获取对象原型

更多可参考[这里](https://es6.ruanyifeng.com/#docs/proxy#Proxy-%E5%AE%9E%E4%BE%8B%E7%9A%84%E6%96%B9%E6%B3%95)



#### Proxy.revocable()

Proxy.revocable() 方法返回一个可取消的 Proxy 实例。
``` js
let target = {};
let handler = {};

let {proxy, revoke} = Proxy.revocable(target, handler);

proxy.foo = 123;
proxy.foo // 123

revoke();
proxy.foo // TypeError: Revoked
```
Proxy.revocable() 方法返回一个对象，该对象的 proxy 属性是 Proxy 实例，revoke 属性是一个函数，可以取消 Proxy 实例。上面代码中，当执行 revoke 函数之后，再访问 Proxy 实例，就会抛出一个错误。


#### this 问题
虽然 Proxy 可以代理针对目标对象的访问，但它不是目标对象的透明代理，即不做任何拦截的情况下，也无法保证与目标对象的行为一致。主要原因就是在 Proxy 代理的情况下，**目标对象内部的this关键字会指向 Proxy 代理**。
``` js
const target = {
  m: function () {
    console.log(this === proxy);
  }
};
const handler = {};

const proxy = new Proxy(target, handler);

target.m() // false
proxy.m()  // true
```
上面代码中，一旦 proxy 代理 target，target.m() 内部的 this 就是指向 proxy ，而不是 target。


- 再如：

``` js
const target = new Date('2015-01-01');
const handler = {
  get(target, prop) {
    if (prop === 'getDate') {
      return target.getDate.bind(target); // this绑定原始对象，就可以解决this指向问题。
    }
    return Reflect.get(target, prop);
  }
};
const proxy = new Proxy(target, handler);

proxy.getDate() // 1
```


### Reflect
> Reflect 对象与 Proxy 对象一样，也是 ES6 为了操作对象而提供的新 API。

Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与proxy handlers的方法相同。Reflect不是一个函数对象，因此它是不可构造的。具体参见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

与大多数全局对象不同，**Reflect**并非一个构造函数，所以不能通过`new`运算符对其进行调用，或者将 Reflect 对象作为一个函数来调用。Reflect 的所有属性和方法都是静态的（就像 Math 对象）。

#### Reflect对象的特点

1. 将Object对象的一些明显属于语言内部的方法（比如Object.defineProperty），放到Reflect对象上。
    > 现阶段，某些方法同时在Object和Reflect对象上部署，未来的新方法将只部署在Reflect对象上。也就是说，从Reflect对象上可以拿到语言内部的方法。

2. 修改某些Object方法的返回结果，让其变得更合理。比如，`Object.defineProperty(obj, name, desc)`在无法定义属性时，会抛出一个错误，而`Reflect.defineProperty(obj, name, desc)`则会返回`false`。
    ``` js
    // 老写法
    try {
    Object.defineProperty(target, property, attributes);
    // success
    } catch (e) {
    // failure
    }

    // 新写法
    if (Reflect.defineProperty(target, property, attributes)) {
    // success
    } else {
    // failure
    }
    ```

3. 让Object操作都变成函数行为。某些Object操作是命令式，比如`name in obj`和`delete obj[name]`，而`Reflect.has(obj, name)`和`Reflect.deleteProperty(obj, name)`让它们变成了函数行为。
    ``` js
    // 老写法
    'assign' in Object // true

    // 新写法
    Reflect.has(Object, 'assign') // true
    ```

4. Reflect对象的方法与Proxy对象的方法一一对应，只要是Proxy对象的方法，就能在Reflect对象上找到对应的方法。
    > 这就让Proxy对象可以方便地调用对应的Reflect方法，完成默认行为，作为修改行为的基础。也就是说，不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为。
    ``` js
    var loggedObj = new Proxy(obj, {
        get(target, name) {
            console.log('get', target, name);
            return Reflect.get(target, name);
        },
        deleteProperty(target, name) {
            console.log('delete' + name);
            return Reflect.deleteProperty(target, name);
        },
        has(target, name) {
            console.log('has' + name);
            return Reflect.has(target, name);
        }
    });
    ```
    > 上面代码中，每一个Proxy对象的拦截操作（get、delete、has），内部都调用对应的Reflect方法，保证原生行为能够正常执行。添加的工作，就是将每一个操作输出一行日志。



#### Reflect的静态方法

- `Reflect.get(target, name, receiver)`
> Reflect.get方法查找并返回target对象的name属性，如果没有该属性，则返回undefined。如果name属性部署了读取函数（getter），则读取函数的this绑定receiver。

``` js
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  },
};

var myReceiverObject = {
  foo: 4,
  bar: 4,
};

Reflect.get(myObject, 'foo') // 1
Reflect.get(myObject, 'bar') // 2
Reflect.get(myObject, 'baz') // 3
Reflect.get(myObject, 'baz', myReceiverObject) // 8
```

- `Reflect.set(target, name, value, receiver)`
> Reflect.set方法设置target对象的name属性等于value。如果name属性设置了赋值函数，则赋值函数的this绑定receiver。

``` js
var myObject = {
  foo: 1,
  set bar(value) {
    return this.foo = value;
  },
};

var myReceiverObject = {
  foo: 0,
};

Reflect.set(myObject, 'foo', 2);
myObject.foo // 2

Reflect.set(myObject, 'bar', 3, myReceiverObject);
myObject.foo // 2
myReceiverObject.foo // 3
```
Reflect 大部分的方法与 Object 对象的同名方法的作用都是相同的，而且它与 Proxy 对象的方法是一一对应的。具体[参见](https://es6.ruanyifeng.com/#docs/reflect#%E9%9D%99%E6%80%81%E6%96%B9%E6%B3%95)

Proxy一般和Reflect配套使用,前者拦截对象,后者返回拦截的结果,Proxy上有的的拦截方法Reflect都有。




### Iterator 和 for...of 循环





## ES7（2016）
ES7（ES2016）新增的特性比较少，主要有：`Array.prototype.includes()`

### Array.prototype.includes()
`Array.prototype.includes`方法返回一个布尔值，表示某个数组是否包含给定的值，与字符串的`includes`方法类似。
``` js
[1, 2, 3].includes(3); // true
[1, 2, 3].includes(3, 3);  // false
[1, 2, 3].includes(3, -1); // true
[1, 2, 3].includes(3, -4); // true
```
> 该方法的第二个参数表示搜索的起始位置，默认为`0`。如果第二个参数为负数，则表示倒数的位置，如果这时它大于数组长度（比如第二个参数为`-4`，但数组长度为`3`），则会重置为从`0`开始。

我们通常使用数组的`indexOf`方法，检查是否包含某个值。`indexOf`方法有两个缺点，一是不够语义化，它的含义是找到参数值的第一个出现位置，所以要去比较是否不等于`-1`，表达起来不够直观。二是，它内部使用严格相等运算符（`===`）进行判断，这会导致对NaN的误判：`[NaN].indexOf(NaN)`为`-1`。

- **includes的算法**

### 指数操作符
``` js
2**10 // 1024
```



## ES8（2017）
ES8（ES2017）新增的特性比较少，主要有：`async/await、Object.values()、`

### async/await
async 函数是什么？一句话，它就是 Generator 函数的语法糖。它是异步编程的终极解决方案。

[如何在 JS 循环中正确使用 async 与 await](https://juejin.cn/post/6844903860079738887)

[async/await 优雅的错误处理方法](https://juejin.cn/post/6844903767129718791)



### `Object.values()`和`Object.entries`
- Object.values() 是一个与 Object.keys() 类似的新函数，但返回的是 Object 自身属性的所有值，不包括继承的值。
- Object.entries() 函数返回一个给定对象自身可枚举属性的键值对的数组。
``` js
const obj = {a: 1, b: 2, c: 3};
Object.values(obj); // [1,2,3]
Object.entries(obj); [["a", 1], ["b", 2], ["c", 3]]
```


### `padStart()和padEnd()`
在 ES8 中 String 新增了两个实例函数`String.prototype.padStart`和`String.prototype.padEnd`，允许将空字符串或其他字符串添加到原始字符串的开头或结尾。

- `String.padStart(targetLength,[padString])`
    - **targetLength**：当前字符串需要填充到的目标长度。如果这个数值小于当前字符串的长度，则返回当前字符串本身。
    - **padString**：(可选)填充字符串。如果字符串太长，使填充后的字符串长度超过了目标长度，则只保留最左侧的部分，其他部分会被截断，此参数的缺省值为空格。

``` js
'123456'.padStart(5) // '123456'
'123456'.padStart(7) // ' 123456'
'123456'.padStart(8,'a') // 'aa123456'
'123456'.padStart(8,'abc') // 'ab123456'
```

- `String.padEnd(targetLength,padString])`
> 传参跟`padStart`的差不多~

``` js
'123456'.padEnd(5) // '123456'
'123456'.padEnd(7) // '123456 '
'123456'.padEnd(8,'a') // '123456aa'
'123456'.padEnd(8,'abc') // '123456ab'
```

### `Object.getOwnPropertyDescriptors()`
`Object.getOwnPropertyDescriptors()`函数用来获取一个对象的所有自身属性的描述符，如果没有任何自身属性，则返回空对象
``` js
const obj = {
	name: 'verney',
	get age() { return 18 }
};
Object.getOwnPropertyDescriptors(obj)
    /*
    {
        age: {
            configurable: true
            enumerable: true
            get: ƒ age()
            set: undefined
        }
        name: {
            configurable: true
            enumerable: true
            value: "verney"
            writable: true
        }
    }
    */
```





## ES9（2018）
ES9（ES2018）


### Promise.finally()
finally()方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。
``` js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```
> 上面代码中，不管promise最后的状态，在执行完then或catch指定的回调函数以后，都会执行finally方法指定的回调函数。

finally方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 Promise 状态到底是fulfilled还是rejected。这表明，finally方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。


### for await of
ES2018引入异步迭代器（asynchronous iterators）, `await` 可以和`for...of`循环一起使用，以串行的方式运行异步操作。
``` js
async function getInfos(arr) {
  for await (let i of arr) {
    getData(i)
  }
}
```



### 正则新增特性


## ES10（2019）
ES10（ES2019）

### flat()和flatMap()
[参考](https://es6.ruanyifeng.com/#docs/array#%E6%95%B0%E7%BB%84%E5%AE%9E%E4%BE%8B%E7%9A%84-flat%EF%BC%8CflatMap)


- **flat()**

数组的成员有时还是数组，Array.prototype.flat() 用于将嵌套的数组“拉平”，变成一维的数组。该方法返回一个新数组，对原数据没有影响。
``` js
[1, 2, [3, 4]].flat()  // [1, 2, 3, 4]
[1, 2, [3, [4, 5]]].flat(2)  // [1, 2, 3, 4, 5]
[1, [2, [3]]].flat(Infinity)  // // [1, 2, 3]
```
- flat() 默认只会“拉平”一层，如果想要“拉平”多层的嵌套数组，可以将 flat() 方法的参数写成一个整数，表示想要拉平的层数，默认为 1。
- 如果不管有多少层嵌套，都要转成一维数组，可以用 Infinity 关键字作为参数。



- **flatMap()**

flatMap()方法对原数组的每个成员执行一个函数（相当于执行Array.prototype.map()），然后对返回值组成的数组执行flat()方法。该方法返回一个新数组，不改变原数组。
``` js
// 相当于 [[2, 4], [3, 6], [4, 8]].flat()
[2, 3, 4].flatMap((x) => [x, x * 2])
// [2, 4, 3, 6, 4, 8]
```
flatMap()只能展开一层数组。


### trimStart()和trimEnd()
String 新增的的方法，分别去除字符串首尾空白字符。
``` js
'   asdfg   '.trimStart();  // "asdfg   "
'   asdfg   '.trimEnd();  // "   asdfg"
```









## ES11（2020）
ES11（ES2020）,[参考](https://github.com/ljianshu/Blog/issues/79)


### Promise.allSettled()
> Promise.allSettled()方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例。只有等到所有这些参数实例都返回结果，不管是fulfilled还是rejected，包装实例才会结束。该方法由 ES2020 引入。

``` js
const resolved = Promise.resolve(42);
const rejected = Promise.reject(-1);

const allSettledPromise = Promise.allSettled([resolved, rejected]);

allSettledPromise.then(function (results) {
  console.log(results);
});
// [
//    { status: 'fulfilled', value: 42 },
//    { status: 'rejected', reason: -1 }
// ]
```
> 该方法返回的新的 Promise 实例，一旦结束，状态总是fulfilled，不会变成rejected。状态变成fulfilled后，Promise 的监听函数接收到的参数是一个数组，每个成员对应一个传入Promise.allSettled()的 Promise 实例。

有时候，我们不关心异步操作的结果，只关心这些操作有没有结束。这时，Promise.allSettled()方法就很有用。


### `?.`和`??`

- **空值合并运算符**

ES2020 新增了一个运算符`??`。当左侧的操作数为`null`或者`undefined`时，返回其右侧操作数，否则返回左侧操作数。
> 在之前我们经常会使用`||`操作符，但是使用 || 操作符，当左侧的操作数为 0 、 null、 undefined、 NaN、 false、 '' 时，都会使用右侧的操作数。如果使用 || 来为某些变量设置默认值，可能会遇到意料之外的行为。

?? 操作符可以规避以上问题，它只有在左操作数是 null 或者是 undefined 时，才会返回右侧操作数。
``` js
const someValue = 0;
const defaultValue = 100;
let value = someValue ?? defaultValue; // 0
```

- **可选链操作符**

可选链操作符`?.`允许读取位于连接对象链深处的属性的值，而不必明确验证链中的每个引用是否有效。?. 操作符的功能类似于`.`链式操作符，不同之处在于，在引用为空(nullish, 即 null 或者 undefined) 的情况下不会引起错误，该表达式短路返回值是 undefined。

``` js
// `.`链式操作符写法
const tortoise = info.animal && info.animal.reptile && info.animal.reptile.tortoise;

// `?.`可选链操作符写法
const tortoise = info.animal?.reptile?.tortoise;
```




### import()
> ES2020提案 引入`import()`函数，支持动态加载模块。

`import(specifier)`

import函数的参数specifier，指定所要加载的模块的位置。import命令能够接受什么参数，import()函数就能接受什么参数，两者区别主要是后者为动态加载。import()返回一个 Promise 对象。
``` js
import('./dialogBox.js')
  .then(dialogBox => {...})
  .catch(error => {...})
```


### BigInt
`BigInt` 是一种内置对象，它提供了一种方法来表示大于 `2^53 - 1` 的整数。这原本是 Javascript中可以用 Number 表示的最大数字。BigInt 可以表示任意大的整数。
> `Number.MAX_SAFE_INTEGER` 即可查看。超过这个值，JS 没有办法精确表示。另外，大于或等于2的1024次方的数值，JS 无法表示，会返回 Infinity。

BigInt 即解决了这两个问题。BigInt 只用来表示整数，没有位数的限制，任何位数的整数都可以精确表示。为了和 Number 类型进行区分，BigInt 类型的数据必须添加后缀 n。

``` js
//Number类型在超过9009199254740991后，计算结果即出现问题
const num1 = 90091992547409910;
console.log(num1 + 1); //90091992547409900

//BigInt 计算结果正确
const num2 = 90091992547409910n;
console.log(num2 + 1n); //90091992547409911n


console.log(BigInt(999)); // 999n
```
BigInt 和 Number 是两种数据类型，不能直接进行四则运算，不过可以进行比较操作。
``` js
console.log(99n == 99); //true
console.log(99n === 99); //false 
console.log(99n + 1);//TypeError: Cannot mix BigInt and other types, use explicit conversionss
```


### globalThis
> JS 中存在一个顶层对象，但是，顶层对象在各种实现里是不统一的。从不同的 JavaScript 环境中获取全局对象需要不同的语句。在 Web 中，可以通过 window、self 取到全局对象，但是在 Web Workers 中，只有 self 可以。在 Node.js 中，它们都无法获取，必须使用 global。

ES2020 中引入 globalThis 作为顶层对象，在任何环境下，都可以简单的通过 globalThis 拿到顶层对象。



### String 的 matchAll 方法
matchAll() 方法返回一个包含所有匹配正则表达式的结果的迭代器。可以使用 for...of 遍历，或者使用 展开运算符(...) 或者 Array.from 转换为数组.
``` js

const regexp = /t(e)(st(\d?))/g;
const str = 'test1test2';

const matchs = str.matchAll(regexp);
console.log(matchs); // RegExpStringIterator {}
console.log([...matchs])
/*
0: (4) ["test1", "e", "st1", "1", index: 0, input: "test1test2", groups: undefined]
1: (4) ["test2", "e", "st2", "2", index: 5, input: "test1test2", groups: undefined]
length: 2
/*

```



## ES12（2021）
ES12（ES2021）,[参考](https://github.com/ljianshu/Blog/issues/92)

### Promise.any()
> ES2021 引入了Promise.any()方法。该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例返回。

只要参数实例有一个变成 fulfilled 状态，包装实例就会变成 fulfilled 状态；如果所有参数实例都变成 rejected 状态，包装实例就会变成 rejected 状态。

Promise.any()跟Promise.race()方法很像，只有一点不同，就是不会因为某个 Promise 变成rejected状态而结束。
> Promise.any()抛出的错误，不是一个一般的错误，而是一个 AggregateError 实例。它相当于一个数组，每个成员对应一个被rejected的操作所抛出的错误。

``` js
var resolved = Promise.resolve(42);
var rejected = Promise.reject(-1);
var alsoRejected = Promise.reject(Infinity);

Promise.any([resolved, rejected, alsoRejected]).then(function (result) {
  console.log(result); // 42
});

Promise.any([rejected, alsoRejected]).catch(function (results) {
  console.log(results); // [-1, Infinity]
});
```


### String.replaceAll()
返回一个全新的字符串，所有符合匹配规则的字符都将被替换掉。

``` js
let str = 'sissfsdfsdtesdran';
str.replaceAll('s', 'S'); // "SiSSfSdfSdteSdran"
str.replaceAll(/s/ig, 'S');
```

### WeakRef
> 一般来说，在 JavaScript 中，对象的引用是强保留的，这意味着只要持有对象的引用，它就不会被垃圾回收。

目前在 Javascript 中，WeakMap 和 WeakSet 是弱引用对象的唯一方法：将对象作为键添加到 WeakMap 或 WeakSet 中，是不会阻止它被垃圾回收的。
> JavaScript 的 WeakMap 并不是真正意义上的弱引用：实际上，只要键仍然存活，它就强引用其内容。WeakMap 仅在键被垃圾回收之后，才弱引用它的内容。

WeakRef 是一个更高级的 API，它提供了真正的弱引用，Weakref 实例具有一个方法 deref，该方法返回被引用的原始对象，如果原始对象已被收集，则返回undefined对象。

总而言之，JavaScript 中对象的引用是强引用，WeakMap 和 WeakSet 可以提供部分的弱引用功能，若想在 JavaScript 中实现真正的弱引用，可以通过配合使用 WeakRef 和终结器（Finalizer）来实现。


### 逻辑赋值操作符
逻辑赋值操作符（Logical Assignment Operators）

``` js
a ||= b
//等价于
a = a || (a = b)

a &&= b
//等价于
a = a && (a = b)

a ??= b
//等价于
a = a ?? (a = b)
```





## 备注

## 参考
1. [JavaScript高级程序设计-第3版](https://book.douban.com/subject/10546125/)
2. [ES6、ES7、ES8、ES9、ES10新特性一览](https://juejin.cn/post/6844903811622912014)
3. [es6 及 es6+ 的能力集](https://mp.weixin.qq.com/s/1AVWcwKmbWA80qirbY8zaQ)
4. [ES6、ES7、ES8特性一锅炖(ES6、ES7、ES8学习指南)](https://juejin.cn/post/6844903679976275976)
5. [近一万字的ES6语法知识点补充](https://juejin.cn/post/6844903775329583112)
6. [ECMAScript 6 入门](https://es6.ruanyifeng.com/)
7. [https://github.com/ljianshu/Blog](https://github.com/ljianshu/Blog)



<fix-link label="Back" href="/frontend/js/depth.html"></fix-link>


<!-- 2021-05-18 -->