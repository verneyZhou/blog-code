# js的事件循环

这里简单梳理下js的事件循环机制。

<!-- [[toc]] -->


## 堆、栈、队列
在js的事件循环中会涉及到堆、栈、队列的概念，这里先简单梳理下。
### js的数据类型
js中的数据类型可以分为**基本类型**和**引用类型**。基本类型是存在栈内存中的，引用类型是存在堆内存中的，但是引用类型的引用还是存在栈内存中的。

### 堆（heap）

堆是动态分配的内存，大小不定也不会自动释放。<br/>
堆内存的存储不同于栈，虽然他们都是内存中的一片空间，但是堆内存存储变量时没有什么规律可言。

<img :src="$withBase('/images/js/heap.png')" width="auto"/>

### 栈（stack）

栈也是一种数据结构，栈stack为自动分配的内存空间，它由系统自动释放。<br/>
栈是一种限定**仅在表头进行插入和删除操作**的线性表，一种**先进后出**(LIFO(Last-In-First-Out)的数据结构。栈中项的插入(叫做推入)和移除(叫做弹出)，只发生在一个位置——栈的顶部。ECMAScript 为数组专门提供了 push()和 pop()方法，以便 实现类似栈的行为。

<img :src="$withBase('/images/js/stack.jpeg')" width="auto"/>

1. 栈内存的特点:存取速度快，但不灵活，同时由于结构简单，在变量使用完成后就可以将其释放，内存回收容易实现。
2. 我们在访问引用类型时，需要在栈内存中查找对应的地址，再去堆内存中取得真正的值，访问速度自然不及栈内存。
3. 引用类型会有**浅拷贝和深拷贝**的问题：所谓**浅拷贝**就是只复制了保存在栈内存中的地址，地址指向堆内存中的数据还是只有一份，所以修改时会有影响；**深拷贝**就是把栈内存中的地址和堆内存中的内容都复制一份，这样修改时就不会有影响。

[JavaScript数据结构之栈](https://zhuanlan.zhihu.com/p/53336124)



### 队列（queue）

队列是一种特殊的线性表，特殊之处在于它**只允许在表的前端（front）进行删除操作，而在表的后端（end）进行插入操作**，和栈一样，队列是一种操作受限制的线性表。进行插入操作的端称为队尾，进行删除操作的端称为队首。

队列的数据元素又称为队列元素。在队列中插入一个队列元素称为入队，从队列中删除一个队列元素称为出队。因为队列只允许在一端插入，在另一端删除，所以只有最早进入队列的元素才能最先从队列中删除，故队列又称为**先进先出**（FIFO—first in first out）。

<img :src="$withBase('/images/js/queue.jpeg')" width="auto"/>

[JavaScript数据结构之队列](https://zhuanlan.zhihu.com/p/53444124)


## js的运行机制

### 同步任务和异步任务
1. javascript是一门**单线程**语言：同一时间只能做一件事；
2. Javascript 有一个**主线程（main thread）**和**call-stack 调用栈(执行栈)**，所有的任务都会被放到调用栈等待主线程执行。
>js调用栈采用的是后进先出的规则，当函数执行的时候，会被添加到栈的顶部，当执行栈执行完成后，就会从栈顶移出，直到栈内被清空。
3. js单线程中的任务分为两类：**同步任务和异步任务**；
    - 同步任务指的是，在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；
    - 异步任务指的是，不进入主线程、而进入"任务队列"（task queue）的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。

::: tip 异步执行的运行机制如下:
（1）所有同步任务都在主线程上执行，形成一个**执行栈**（execution context stack）。<br/>
（2）主线程之外，还存在一个**任务队列**（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。任务队列是一个先进先出的数据结构。<br/>
（3）一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。<br/>
（4）主线程不断重复上面的第三步。
:::

<img :src="$withBase('/images/js/async-task.png')" width="auto"/>

### 事件循环（Event Loop）
1. Event Loop，顾名思义：事件循环。主线程从"任务队列"中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为**Event Loop**（事件循环）。
2. js的Event Loop是指javascript的事件循环执行机制。
3. JavaScript 事件循环机制分为浏览器和 Node 事件循环机制，两者的实现技术不一样，浏览器 Event Loop 是 HTML 中定义的规范，Node Event Loop 是由 libuv 库实现。这里主要讲的是浏览器部分。
> 关于Node的Event Loop讲解：
1. [浏览器与Node的事件循环(Event Loop)有何区别?](https://juejin.cn/post/6844903761949753352)
2. [带你彻底弄懂Event Loop](https://segmentfault.com/a/1190000016278115)

### 宏任务与微任务
在js的事件循环中，按照任务的执行顺序又细分为**宏任务（macrotask）和微任务（micro task）**。
1. **macrotasks**: script(整体代码)、setTimeout、setInterval、setImmediate（node独有）、I/O、UI rendering（浏览器独有）、[requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)（浏览器独有）
2. **microtasks**: process.nextTick（node独有）、Promises、Object.observe(废弃)、[MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)
3. 宏任务和微任务的关系:

<img :src="$withBase('/images/js/macro-task.png')" width="auto"/>

> js中任务执行顺序为：同步任务 》 微任务 》 宏任务



### 浏览器的Event Loop
先看下这张别人整理的我觉得挺全面的流程图：

<img :src="$withBase('/images/js/event-loop.png')" width="auto"/>

> 这张图将浏览器的Event Loop完整的描述了出来，梳理下JavaScript代码的具体流程：
1. 执行全局Script同步代码，这些同步代码有一些是同步任务，有一些是异步任务（比如setTimeout等）；**同步任务立即执行，异步任务则判断是宏任务还是微任务，添加到对应队列中；**
2. 全局Script代码执行完毕后，调用栈Stack会清空；
3. 从微队列microtask queue中取出位于队首的回调任务，放入调用栈Stack中执行，执行完后microtask queue长度减1，调用栈清空；
4. 继续取出位于队首的任务，放入调用栈Stack中执行，以此类推，直到把microtask queue中的所有任务都执行完毕。注意，**如果在执行microtask的过程中，又产生了microtask，那么会加入到队列的末尾，也会在这个周期被调用执行**；
5. microtask queue中的所有任务都执行完毕，此时microtask queue为空队列，调用栈Stack也为空；
6. 取出宏队列macrotask queue中位于队首的任务，放入Stack中执行；
7. 执行完毕后，调用栈Stack为空；
8. 重复第3-7个步骤，直到所有任务执行完毕。

::: tip 归纳几个重点：
1. 宏任务macrotask一次只从队列中取一个任务执行，执行完后就去执行微任务队列中的任务；
2. 微任务队列中所有的任务都会被依次取出来执行，直到microtask queue为空；
3. 图中没有画UI rendering的节点，因为这个是由浏览器自行判断决定的，但是只要执行UI rendering，它的节点是在执行完所有的microtask之后，下一个macrotask之前，紧跟着执行UI render。
:::

### node中Event Loop
> node中的Event Loop跟浏览器中执行流程大致类似，也是`同步任务 》 微任务 》 宏任务`，但node中的宏队列不像浏览器中只有一个宏队列，而是细分出4个阶段的宏队列：`Timers Queue、 IO Callbacks Queue、Check Queue、Close Callbacks Queue`；同样微队列也是细分成2个阶段的微队列：`Next Tick Queue、Other Micro Queue`。

**大体解释一下NodeJS的Event Loop过程：**
1. 执行全局Script的同步代码
2. 执行microtask微任务，先执行所有Next Tick Queue中的所有任务，再执行Other Microtask Queue中的所有任务
3. 开始执行macrotask宏任务，共6个阶段，从第1个阶段开始执行相应每一个阶段macrotask中的所有任务，注意，**这里“所有任务”是指每个阶段宏任务队列的所有任务，在浏览器的Event Loop中是只取宏队列的第一个任务出来执行，每一个阶段的macrotask任务执行完毕后，开始执行微任务**，也就是步骤2
4. Timers Queue -> 步骤2 -> I/O Queue -> 步骤2 -> Check Queue -> 步骤2 -> Close Callback Queue -> 步骤2 -> Timers Queue ......
5. 这就是Node的Event Loop

这里只是简介，关于node的event loop更详细的讲解可以点击[这里](https://segmentfault.com/a/1190000016278115)


### 几个例子
这里主要是浏览器的event loop例子。

- **1.以下代码执行顺序：**
```js
console.log('script start');

setTimeout(function () {
  console.log('setTimeout');
}, 0);

Promise.resolve()
  .then(function () {
    console.log('promise1');
  })
  .then(function () {
    console.log('promise2');
  });

console.log('script end');
```
- **分析：**
1. 一开始task队列中只有script，则script中所有函数放入函数执行栈执行，代码按顺序执行；
2. 接着遇到了setTimeout,它的作用是0ms后将回调函数放入macrotask队列中，也就是说这个函数将在下一个事件循环中执行（注意这时候setTimeout执行完毕就返回了）;
3. 接着遇到了Promise，按照前面所述Promise属于microtask，所以第一个.then()会放入microtask队列;
4. 当所有script代码执行完毕后，此时函数执行栈为空。开始检查microtask队列，此时队列不为空,执行.then()的回调函数输出'promise1'，由于.then()返回的依然是promise,所以第二个.then()会放入microtask队列继续执行,输出'promise2';
5. 此时microtask队列为空了，进入下一个事件循环，检查macrotask队列发现了setTimeout的回调函数，立即执行回调函数输出'setTimeout'，代码执行完毕。
```
所以代码执行顺序是：
script start 》 script end 》 promise1 》 promise2 》 setTimeout
```
> 代码来自[Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)，推荐观看原文的代码可视化执行，更方便理解。

- 2. **以下代码执行顺序：**
```js
console.log(1);

setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3)
  });
});

new Promise((resolve, reject) => {
  console.log(4)
  resolve(5)
}).then((data) => {
  console.log(data);
})

setTimeout(() => {
  console.log(6);
})

console.log(7);
```
- **分析：**
1. 执行全局script，打印1；
2. 执行setTimeout，将它的回调函数放在macrotask中：`Macrotask Queue: [setTimeout cakkback1]`；
3. 执行`new Promise`，里面的代码立即执行，打印4；将.then后面的回调放在microtask中：`Microtask Queue: [Promise callback1]`;
4. 继续执行第二个setTimeout，将它的回调函数放在macrotask中：`Macrotask Queue: [setTimeout callback2]`；
5. 然后执行`console.log(7)`，直接打印7；到这里，全局Script代码执行完毕，进入下一个事件循环；
6. 从microtask queue中依次取出任务执行，直到microtask queue队列为空：首先执行`Promise callback1`，即`console.log(data)`,打印5；
7. 这里microtask queue中只有一个任务，执行完后开始从宏任务队列macrotask queue中取位于队首的任务执行；
8. 执行`setTimeout cakkback1`,首先直接执行`console.log(2)`,打印2，接着遇到一个Promise，Promise异步执行完后在microtask queue中又注册了一个回调函数：`Promise callback2`；
9. 这时等到第一个宏任务执行完毕，然后再去微任务队列microtask queue中依次取出执行，执行`Promise callback2`，打印3；
10. 等到微任务队列全部执行完，再去宏任务队列中取第一个任务执行，执行`setTimeout callback2`,打印6；
11. 等到全部执行完后，Stack Queue为空，Macrotask Queue为空，Micro Queue为空。
```js
// 打印顺序为：
1 4 7 5 2 3 6
```

- 3. **第三个例子**
```js
let a = new Promise((resolve, reject) => {
        console.log('start');
        setTimeout(() => {
            resolve('resolve111');
        },0);
    });

setTimeout(() => {
    console.log('settimeout');
},0);

a.then(res => {
    console.log(res);
    return new Promise((resolve, reject) => {
        reject('reject222');
    });
}).then(res => {
    console.log('then2',res);
}).catch(err => {
    console.log('err',err);
});

console.log('end');
```
执行顺序为：
```js
start > end > resolve111 > err reject222 > settimeout
```
这个例子copy到浏览器试一下就知道了，不分析了。


## 异步编程解决方案
#### 回调函数
最初js的异步解决方案是回调函数，即`callback`，把比较耗时的如`图片等静态资源的请求、ajax请求`等放在异步操作里，这样就不能阻塞后续代码的执行了。
- **缺点**
1. 回调地狱
2. 控制反转（当使用回调函数的时候，我们无法保证或者不知道第三方对于回调函数的调用是何种形式的，如果它在某种情况下是立即完成以同步的方式来调用，那可能就会导致我们代码中的逻辑错误。）
```js
ajax('first').success(function(res){
    ajax('second').success(function(res){
        ajax('third').success(function(res){
            ....
        });
    })
})
// 当嵌套的回调函数层级过多，会大大降低代码的可读性和维护性
```

#### 事件监听
异步任务的执行不取决于代码的顺序，而取决于某个事件是否发生。
```js
dom.addEventListener('click', fn);
```

#### 发布订阅
存在一个"信号中心"，某个任务执行完成，就向信号中心"发布"（publish）一个信号，其他任务可以向信号中心"订阅"（subscribe）这个信号，从而知道什么时候自己可以开始执行。这就叫做"发布/订阅模式"（publish-subscribe pattern），又称"观察者模式"（observer pattern）。
```js
// fs订阅done信号
jQuery.subscribe('done', f2);

// f1事件里面会发布done信号
function f1() {
  setTimeout(function () {
    // ...
    jQuery.publish('done');
  }, 1000);
}
```
上面代码中，jQuery.publish('done')的意思是，f1执行完成后，向信号中心jQuery发布done信号，从而引发f2的执行。

#### Promise/A+
- 之后就出现了[Promise](https://es6.ruanyifeng.com/#docs/promise)，主要以更简洁和更优雅的书写方式替代回调函数，作为新的异步编程的解决方案。
- 有三种状态，状态流转是单向的，异步操作，常用于网络请求、读取本地文件；

**优点：**
1. 解决回调地狱问题；
2. 异步调用：即使是立即完成的Promise（类似于`new Promise(function (resolve, reject) {resolve(2);})`），提供给then(...)的回调也始终是异步调用

**缺点：**
1. 比如无法取消 Promise，错误需要通过回调函数捕获

#### 生成器Generators/ yield
[Generator](https://es6.ruanyifeng.com/#docs/generator) 函数是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同，Generator 最大的特点就是可以控制函数的执行。

#### async/await
最后就是我们现在用得越来越多的[async/await](https://es6.ruanyifeng.com/#docs/async)；它是`ES2017`引入的，使得异步操作变得更加方便，它就是 Generator 函数的语法糖。

**发展历程：**

@flowstart
stage1=>operation: 回调函数
stage2=>operation: Promise
stage3=>operation: Generator
stage4=>operation: async/await

stage1(right)->stage2(right)->stage3(right)->stage4
@flowend



## 备注
1. 微任务的递归调用禁区
```js
// 切记在代码这样递归调用callback，会阻塞js执行进程！！！
function callback() {
    console.log('====Promise.resolve');
    Promise.resolve().then(callback);
}
callback();
```




## 参考
- [JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)
- [带你彻底弄懂Event Loop](https://segmentfault.com/a/1190000016278115)
- [一次弄懂Event Loop（彻底解决此类面试问题）](https://juejin.cn/post/6844903764202094606)
- [浏览器的 Event Loop](https://juejin.cn/post/6844903753707945992)
- [Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [JS 异步编程六种方案](https://juejin.cn/post/6844903760280420366)
- [JavaScript异步编程](https://segmentfault.com/a/1190000015711829)

<!-- 2021-04-07 -->