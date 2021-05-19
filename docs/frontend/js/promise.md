# 手写Promise

<!-- [[toc]] -->

## 前言
> 这里主要是我的`Promise`手写学习记录，关于`Promise`的入门和使用，具体可移步阮老师的[Promise对象](https://es6.ruanyifeng.com/#docs/promise)。

`Promise`作为异步编程的一种解决方案，比传统的解决方案`回调函数`更合理和更强大；它由社区最早提出和实现，`ES6`将其写进了语言标准。

我在项目中应用比较多的场景主要是对后端接口请求的处理，还有就是前端需要执行一些异步任务的时候会用到，但我一直以来都停留在简单的使用，对于它是怎么实现的一直不清楚，出于对其实现原理的好奇，所以才有了这篇博文。

下面直接进入主题。

## 使用
```js
// 定义
let asyncFn = new Promise((resolve, reject) => {
    console.log('pending');
    setTimeout(() => {
        let random = Math.random() * 10;
        if (random > 5) {
            resolve('result success'); // 成功回调
        } else {
            reject('result error'); // 错误回调
        }
    },100);
});

// 调用
asyncFn.then(res => {
    console.log('====then',res); // 成功回调处理
}).catch(err => {
    console.log('err',err); // 错误回调处理
})
```
上面就是我在项目中使用`Promise`进行异步任务时的简单模型，首先定义一个异步函数，一般是后端的接口请求，这里用`setTimeout`模拟异步操作；之后在调用这个请求的时候对成功和失败两种情况进行处理。
::: tip 执行顺序：
1. 首先是调用`asyncFn`方法，并立即执行里面的代码，打印`pending`；
2. 100ms后进行随机数判断：若大于5则执行成功回调函数`resolve`，`then`方法中打印`====then result success`；否则则执行失败回调`reject`，`catch`方法中打印`====then result error`.
:::

大概的使用就是这样，接下来试着手写一个`Promise`实现上面的效果。

## 实现
首先梳理一下要实现的主要功能：
::: warning 想实现哪些功能？
1. `Promise`的状态处理：`Pending、Resolve、Reject`和`then`方法;
2. 异步任务和链式调用
3. 添加`Promise`的其他方法：`catch、finally、all、race、resolve、reject`;
:::

### MyPromise基础版
> 这里我会按照上面三个功能点，分步实现，首先是最基本版的实现。

#### 1.构造函数的定义
首先定义一个构造函数，并添加三种状态：
```js

// 添加三个状态常量
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// 定义MyPromise类
class MyPromise {
    constructor(executor) {
        this._status = PENDING; // 初始化状态
        this._value = undefined; // 初始化成功回调返回的值
        this._reason = undefined; // 初始化失败回调返回的值

       /*
        executor是生成Promise实例时传入的执行函数，即 new Promise((resolve,reject) => {...})中的(resolve,reject) => {...}
        因为它在生成实例的时候就要立即执行，所以这里直接开始执行：
       */
        try {
            // resolve, reject是这个执行函数里传入的参数，这两个参数本身也是函数，接下来会重点定义这两个函数
            // bind(this)：绑定this指向
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch(err) { // 兼容报错情况
            this.reject(err);
        }
    }

    // 添加_resolve方法
    resolve(val) {
        ...
    }

    // 添加_reject方法
    reject(err) {
        ...
    }
}
```
初始化之后，接下来继续完善`resolve`和`reject`里面状态的执行逻辑：
```js
resolve(val) {
    if (this._status !== PENDING) return; // 为了保证状态从pending > fulfilled的单向流转，当状态不为pending时不让继续执行
    this._status = FULFILLED; // 切换状态为已完成：fulfilled
    this._value = val; // 并获取成功回调的值
}

// 同理，reject中也是类似的处理逻辑
reject (err) { 
    if (this._status !== PENDING) return
    this._status = REJECTED
    this._reason = err
}
```
以上就已经能实现`Promise`基本的状态流转和值的传递了，接下来定义`then`方法：

#### 2.then方法的初定义
看了阮老师的`Promise`入门讲解后，我发现`then`方法其实是可以接受两个回调函数作为参数的，虽然我在平时项目开发中基本都是只传一个回调函数；而和`then`一起搭配使用的`catch`方法其实就是`.then(null, rejection)`，所以这里只要定义好`then`方法就能实现`.then()`和`.catch()`。
```js
// 继续在MyPromise类中添加then方法
then (onFulfilled, onRejected) { // onFulfilled和onRejected是我们传入的两个回调函数
    if (this._status === FULFILLED) { // 成功回调
        onFulfilled(this._value);
    }
    if (this._status === REJECTED) { // 失败回调
        onRejected(this._reason);
    }
}
```
现在已经算是基本定义好了`Promise`类的状态切换和`then`方法，最简单的第一版`Promise`已经完成，可以调用一下看看是否生效，下面是完整代码：
```js
// MyPromise基础版

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
    constructor(executor) {
        this._status = PENDING;
        this._value = undefined;
        this._reason = undefined;
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch(err) {
            this.reject(err);
        }
    }
    resolve(val) {
        if (this._status !== PENDING) return;
        this._status = FULFILLED;
        this._value = val;
    }
    reject (err) { 
        if (this._status !== PENDING) return
        this._status = REJECTED
        this._reason = err
    }
    then (onFulfilled, onRejected) {
        if (this._status === FULFILLED) {
            onFulfilled(this._value);
        }
        if (this._status === REJECTED) {
            onRejected(this._reason);
        }
    }
}

// 使用
let asyncFn = new MyPromise((resolve, reject) => {
    console.log('start'); // start
    resolve('success');
    // reject('error');
})
asyncFn.then(res => {
    console.log('then',res); // then success
}, err => {
    console.log('err', err); // 如果把上面的resolve方法注释掉，执行reject('error')方法，则打印 err error
})
```
执行成功，说明第一版`Promise`已经完成，但如果把`asyncFn`修改为：
```js
let asyncFn = new MyPromise((resolve, reject) => {
    console.log('start'); // start
    setTimeout(() => { // 执行异步任务
         resolve('success');
        // reject('error');
    },0)
})
```
这样的话，由于`.then`里面的方法立即执行，还没来得及执行`resolve('success')`，`.then`就已经执行完了，所以目前这个版本只能运行同步任务,对于`异步任务`和`then的链式调用`还不行，继续完善：

### MyPromise升级版

#### 异步任务和链式调用
想要支持异步任务，首先得需要改造`constructor`：增加执行队列，用于保存`then`方法注册时的回调函数：
```js {5-6}
constructor(executor) {
    this._status = PENDING;
    this._value = undefined;
    this._reason = undefined;
    this._onResoveQueues = []; // 添加成功回调函数队列
    this._onRejectQueues = []; // 添加失败回调函数队列
    try {
        executor(this.resolve.bind(this), this.reject.bind(this))
    } catch(err) {
        this.reject(err);
    }
}
```
接着改造`then`方法：
```js
then (onFulfilled, onRejected) {
    // if (this._status === FULFILLED) { // 成功回调
    //     onFulfilled(this._value);
    // }
    // if (this._status === REJECTED) { // 失败回调
    //     onRejected(this._reason);
    // }
    const {_value, _reason, _status} = this;
    switch(_status) {
        case PENDING: // 当状态为pending,把回调函数加入到队列中
            this._onResoveQueues.push(onFulfilled);
            this._onRejectQueues.push(onRejected);
            break;
        case FULFILLED: // 立即执行成功回调
            onFulfilled(this._value);
            break;
        case REJECTED: // 立即执行失败回调
            onRejected(this._reason);
            break;
    }
}
```
- then的链式调用

接着就是给`then`方法添加链式调用，先来看看什么是链式调用：
```js
asyncFn.then(res => {
    console.log('====res1',res);
    return res;
}).then(res => {
    console.log('====res2',res);
}).then(res => {...})
```
类似这种，一般函数的链式调用都是在执行完方法后直接`return this`，在这里，想实现`then`方法的链式调用，就得让`then`返回一个新的`Promise`对象：
```js
then (onFulfilled, onRejected) {
    const {_value, _reason, _status} = this;
    // 返回一个Promise对象
    return new MyPromise((onFulfilledSub, onRejectedSub) => {
        // 封装一个成功回调方法
        let _fulfilled = val => {
            let res = onFulfilled(val);
            // 判断是否返回Promise对象
            if (res instanceof MyPromise) {// 如果是，必须等待其状态改变后再执行下一个回调
                res.then(onFulfilledSub, onRejectedSub)
            } else { // 不是，则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                onFulfilledSub(res);
            }
        };

        // 封装一个失败回调方法
        let _rejected = err => {
            let res = onRejected(err);
            // 判断是否返回Promise对象
            if (res instanceof MyPromise) {// 如果是，必须等待其状态改变后再执行下一个回调
                res.then(onFulfilledSub, onRejectedSub)
            } else { // 不是，则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                onRejectedSub(res);
            }
        };

        switch(_status) {
            case PENDING: // 当状态为pending,把回调函数加入到队列中
                this._onResoveQueues.push(_fulfilled);
                this._onRejectQueues.push(_rejected);
                break;
            case FULFILLED: // 立即执行成功回调
                _fulfilled(_value);
                break;
            case REJECTED: // 立即执行失败回调
                _rejected(_reason);
                break;
        }
    })
}
```
这里面代码量有点多，具体就是让`then`返回一个新的Promise对象，并封装了一个成功回调方法`fulfilled`和失败回调方法`rejected`，并在这两个方法里执行传入的回调函数，然后根据其返回的值是不是`Promise`对象，分别进行处理。

下面来改造`resolve`方法：
> 当执行该方法时，依次执行回调队列`_onResoveQueues`中的函数，执行完毕并清空队列
```js {5-19}
resolve(val) {
    if (this._status !== PENDING) return;
    // this._status = FULFILLED;
    // this._value = val;
    // 封装一个run方法
    const run = () => {
        this._status = FULFILLED
        this._value = val
        let cb;        
        while (cb = this._onResoveQueues.shift()) { // 循环遍历执行_onResoveQueues队列中函数，并清空队列
            cb(val)
        }
        /** 例：
        let a = [1,2,3,4,5],b;
        while(b = a.shift()){console.log(b)}; 依次打印 1 2 3 4 5，并把数组a清空
        * **/ 
    }
    // 模拟异步操作
    setTimeout(() => run(), 0)
}
```
同理，也可以对`reject`方法进行类似的改造：
```js {6-15}
reject (err) { 
    console.log(this);
    if (this._status !== PENDING) return
    // this._status = REJECTED
    // this._reason = err
    const run = () => {
        this._status = REJECTED
        this._reason = err
        let cb;        
        while (cb = this._onRejectQueues.shift()) { // 循环遍历执行_onRejectQueues队列中函数，并清空队列
            cb(val)
        }
    }
    // 模拟异步操作
    setTimeout(() => run(), 0)
}
```
到这里已经基本实现了`Promise`的异步任务和链式调用，接下来校验下第二版的`MyPromise`代码有没有问题，下面是完整代码：
```js
// MyPromise升级版

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
    constructor(executor) {
        this._status = PENDING;
        this._value = undefined;
        this._reason = undefined;
        this._onResoveQueues = []; // 添加成功回调函数队列
        this._onRejectQueues = []; // 添加失败回调函数队列
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch(err) {
            this.reject(err);
        }
    }
    resolve(val) {
        if (this._status !== PENDING) return;
        // 封装一个run方法
        const run = () => {
            this._status = FULFILLED
            this._value = val
            let cb;        
            while (cb = this._onResoveQueues.shift()) { // 循环遍历执行
                cb(val)
            }           
        }
        // 模拟异步操作
        setTimeout(() => run(), 0)
    }
    reject (err) {
        if (this._status !== PENDING) return       
        const run = () => {
            this._status = REJECTED
            this._reason = err
            let cb;        
            while (cb = this._onRejectQueues.shift()) {
                cb(err)
            }
        }
        setTimeout(() => run(), 0)
    }
    then (onFulfilled, onRejected) {
        const {_value, _reason, _status} = this;
        // 返回一个Promise对象
        return new MyPromise((onFulfilledSub, onRejectedSub) => {
            // 封装一个成功回调方法
            let _fulfilled = val => {
                let res = onFulfilled(val);
                // 判断是否返回Promise对象
                if (res instanceof MyPromise) {// 如果是，必须等待其状态改变后再执行下一个回调
                    res.then(onFulfilledSub, onRejectedSub)
                } else { // 不是，则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                    onFulfilledSub(res);
                }
            };

            // 封装一个失败回调方法
            let _rejected = err => {
                let res = onRejected(err);
                if (res instanceof MyPromise) {
                    res.then(onFulfilledSub, onRejectedSub)
                } else {
                    onRejectedSub(res);
                }
            };
            switch(_status) {
                case PENDING: // 当状态为pending,把回调函数加入到队列中
                    this._onResoveQueues.push(_fulfilled);
                    this._onRejectQueues.push(_rejected);
                    break;
                case FULFILLED: // 立即执行成功回调
                    _fulfilled(_value);
                    break;
                case REJECTED: // 立即执行失败回调
                    _rejected(_reason);
                    break;
            }
        })
    }
}

// 定义
let asyncFn = new MyPromise((resolve, reject) => {
    console.log('start');
    setTimeout(() => {
        console.log('====1111')
        resolve('success');
        // reject('error');
        console.log('====2222')
    }, 1000);
})
// 调用
asyncFn.then(res => {
    console.log('then',res);
    // 返回Promise对象
    return new MyPromise((resolve, reject) => {
        resolve(res + '__aaa')
    })
}, err => {
    console.log('err', err);
}).then(res => { // 链式调用
    console.log('===then',res);
    return res + '__bbb'; // 返回字符串
}).then(res => { // 链式调用
    console.log('====then',res);
})
console.log('end');
```
执行一下`asyncFn`方法，测一下异步任务和链式调用是否生效，执行后打印顺序为：
```js
start  // 首先打印start,因为MyPromise实例声明后，里面的代码就会立即执行
end // 然后执行所有同步任务，打印end
====1111 // 同步代码执行完毕，开始执行异步任务，1000ms后，直接打印====1111
====2222 // 因为前面的resolve('success')是异步任务，同理，先不执行，直接打印====2222
then success // 等到所有同步任务执行完毕，才开始执行asyncFn的then回调函数，打印获取到的res
===then success__aaa // 上一步then返回一个Promise对象，这里链式调用获取到的res是这个新的Promise对象resolve中抛出的值，即：success__aaa
====then success__aaa__bbb // 这一步也是通过链式调用获取上一步then方法中返回的值，因为上一步直接返回字符串，所以直接打印
```
到这里，也算是初步实现了`Promise`基本方法使用、异步任务、链式调用了，下面接着继续完善：

### MyPromise轻奢版

#### 1.兼容处理
- `resolve`方法中传值的兼容处理

在项目开发中遇到过`resolve(val)`成功回调抛出的`val`本身也是一个`Promise`对象的情况，如：
```js
let p1 = new Promise((resolve, reject) => {
    ...
})
let p = new Promise((resolve, reject) => {
    resolve(p1) // p1也是一个Promise对象
})
```
这种情况就需要对`resolve(val)`传入的`val`进行兼容处理：
> 如果`val`为`Promise`对象，则执行它的`.then`方法，等待其状态改变再执行回调
```js
resolve(val) {
    if (this._status !== PENDING) return;
    // 重新封装run方法
    const run = () => {
        // 定义一个成功回调
        let runFulfilled = (value) => {
            let cb;        
            while (cb = this._onResoveQueues.shift()) { // 循环遍历执行_onResoveQueues队列中函数，并清空队列
                cb(value)
            }
        }
        // 失败回调
        let runRejected = (error) => {
            let cb;        
            while (cb = this._onRejectQueues.shift()) { // 循环遍历执行_onRejectQueues队列中函数，并清空队列
                cb(error)
            }
        }
        // 判断val是否为Promise类型
        if (val instanceof MyPromise) {
            val.then(res => { // 执行.then方法，等待其状态改变
                this._status = FULFILLED; // 状态改变
                this._value = res; // 获取val返回的值
                runFulfilled(res); // 执行成功回调
            }, err => {
                this._status = REJECTED;
                this._reason = err;
                runRejected(err);
            })
        } else { // 其他类型
            this._status = FULFILLED; // 状态改变
            this._value = val; // 获取val返回的值
            runFulfilled(val); // 执行成功回调
        }
    }
    // 模拟异步操作
    setTimeout(() => run(), 0)
}
```
这样修改之后，就可以在`asyncFn`中这样使用了：
```js
let asyncFn = new MyPromise((resolve, reject) => {
    console.log('start');
    setTimeout(() => {
        console.log('====1111')
        // resolve('success');
        resolve(new MyPromise((_resolve, _reject) => {
            _resolve('success');
        }))
        // reject('error');
        console.log('====2222')
    }, 1000);
})
```
`resolve(val)`传入的`val`为Promise对象时，执行结果跟刚才的也是一样的。

- `then`方法中对传入的回调函数作兼容处理
> 增加类型判断、报错提示
```js
// 判断变量否为function
const isFunction = variable => typeof variable === 'function'

then() {
    ...
    let _fulfilled = val => {
        try {
            if (!isFunction(onFulfilled)) {
                onRejectedSub(val); // 直接报错
                return;
            }
            let res = onFulfilled(val);
            // 判断是否返回Promise对象
            if (res instanceof MyPromise) {// 如果是，必须等待其状态改变后再执行下一个回调
                res.then(onFulfilledSub, onRejectedSub)
            } else { // 不是，则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                onFulfilledSub(res);
            }
        } catch(err) {
            onRejectedSub(err); // 直接报错
        }
    };
    ...
}
```
同样的，在`_rejected`也加类似的判断，这里不再赘述了。

到这里其实一个基本的`Promise`就已经实现了，接下来添加一些其他方法。

#### 2.添加其他方法
- `catch`方法
> 前面说过，看了阮老师的入门课程后，发现其实`Promise`的`catch`方法就是直接调用的`then`方法：`.then(null, rejection)`
```js
catch(onRejected) {
    return this.then(null, onRejected); // 直接调用then方法
}
```
- 静态`resolve`方法
```js
static resolve(value) {
    // 如果参数是MyPromise实例，直接返回这个实例
    return value instanceof MyPromise ? value : new MyPromise(resolve => resolve(value));
} 
```
- 静态`reject`方法
```js
static reject(error) {
    return new MyPromise((resolve, reject) => reject(error)); // 返回MyPromise实例
} 
```
- 静态`all`方法
> 只要有一个失败就算失败，全成功才算成功，失败返回失败的那个报错信息，成功返回所有的成功信息，返回一个新的`Promise`对象
```js
static all(list) {
    return new MyPromise((resolve, reject) => {
        let index = 0;
        let result = [];
        list.forEach((v,i) => {
            // 统一转换成MyPromise对象，调用then方法
            MyPromise.resolve(v).then(res => {
                index ++;
                result[i] = res;
                if (index >= list.length) { // 循环结束，全部成功则执行resolve方法
                    resolve(result);
                }
            },err => {
                reject(err); // 有报错，直接执行reject方法
            })
        })
    })
}
```
- 静态`race`方法
> race，顾名思义：竞速模式。只要有一个状态改变就执行回调，同样返回一个新的`Promise`对象；这个方法常用于接口请求中需要设置超时限制的场景。
```js
staic race(list) {
    return new MyPromise((resolve, reject) => {
        for(let p of list) { // 循环遍历
            MyPromise.resolve(p).then(res => {
                resolve(res); // 有状态更改，直接执行
            }, err => {
                reject(err); // 同上
            })
        }
    })
}
```
- `finally`方法
> `finally`方法用于指定不管`Promise`对象最后状态如何，都会执行的操作
```js
finally(cb) {
    return this.then(res => {
        MyPromise.resolve(cb()).then(() => res); // 先将cb转成Promise实例
    },err => {
        MyPromise.resolve(cb()).then(() => {throw err});
    })
}
```
到这里，我的手写`MyPromise`可算是结束了~

最终版完整代码如下：
```js
// MyPromise轻奢版

const isFunction = fn => typeof fn === 'function'
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
    constructor(executor) {
        this._status = PENDING;
        this._value = undefined;
        this._reason = undefined;
        this._onResoveQueues = [];
        this._onRejectQueues = [];
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch(err) {
            this.reject(err);
        }
    }
    resolve(val) {
        if (this._status !== PENDING) return;
        const run = () => {
            let runFulfilled = (value) => {
                let cb;        
                while (cb = this._onResoveQueues.shift()) {
                    cb(value)
                }
            }
            let runRejected = (error) => {
                let cb;        
                while (cb = this._onRejectQueues.shift()) {
                    cb(error)
                }
            }
            if (val instanceof MyPromise) {
                val.then(res => {
                    this._status = FULFILLED;
                    this._value = res;
                    runFulfilled(res);
                }, err => {
                    this._status = REJECTED;
                    this._reason = err;
                    runRejected(err);
                })
            } else {
                this._status = FULFILLED;
                this._value = val;
                runFulfilled(val);
            }
        }
        setTimeout(() => run(), 0)
    }
    reject (err) {
        if (this._status !== PENDING) return
        const run = () => {
            this._status = REJECTED
            this._reason = err
            let cb;        
            while (cb = this._onRejectQueues.shift()) {
                cb(err)
            }
        }
        setTimeout(() => run(), 0)
    }
    then (onFulfilled, onRejected) {
        const {_value, _reason, _status} = this;
        return new MyPromise((onFulfilledSub, onRejectedSub) => {
            let _fulfilled = val => {
                try {
                    if (!isFunction(onFulfilled)) {
                        onRejectedSub(val);
                        return;
                    }
                    let res = onFulfilled(val);
                    if (res instanceof MyPromise) {
                        res.then(onFulfilledSub, onRejectedSub)
                    } else {
                        onFulfilledSub(res);
                    }
                } catch(err) {
                    onRejectedSub(err); // 直接报错
                }
                
            };

            // 封装一个失败回调方法
            let _rejected = err => {
                try {
                    if (!isFunction(onRejected)) {
                        onRejectedSub(err); // 直接报错
                        return;
                    }
                    let res = onRejected(err);
                    // 判断是否返回Promise对象
                    if (res instanceof MyPromise) {// 如果是，必须等待其状态改变后再执行下一个回调
                        res.then(onFulfilledSub, onRejectedSub)
                    } else { // 不是，则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                        onRejectedSub(res);
                    }
                } catch(err) {
                    onRejectedSub(err); // 直接报错
                }

                
            };
            switch(_status) {
                case PENDING: // 当状态为pending,把回调函数加入到队列中
                    this._onResoveQueues.push(_fulfilled);
                    this._onRejectQueues.push(_rejected);
                    break;
                case FULFILLED: // 立即执行成功回调
                    _fulfilled(_value);
                    break;
                case REJECTED: // 立即执行失败回调
                    _rejected(_reason);
                    break;
            }
        })
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    /*
    * 添加静态方法
    */

    static resolve(value) {
        // 如果参数是MyPromise实例，直接返回这个实例
        return value instanceof MyPromise ? value : new MyPromise(resolve => resolve(value));
    }
    
    static reject(error) {
        return new MyPromise((resolve, reject) => reject(error));
    }

    static all(list) {
        return new MyPromise((resolve, reject) => {
            let index = 0;
            let result = [];
            list.forEach((v,i) => {
                // 兼容v不是Promise实例的情况
                MyPromise.resolve(v).then(res => {
                    index ++;
                    result[i] = res;
                    if (index >= list.length) { // 循环结束
                        resolve(result);
                    }
                },err => {
                    reject(err);
                })
            })
        })
    }

    static race(list) {
        return new MyPromise((resolve, reject) => {
            for (let p of list) {
                MyPromise.resolve(p).then(res => {
                    resolve(res);
                }, err => {
                    reject(err);
                })
            }
        })
    }

    finally(cb) {
        return this.then(res => {
            MyPromise.resolve(cb()).then(() => res); // 先将cb转成Promise实例
        },err => {
            MyPromise.resolve(cb()).then(() => {throw err});
        })
    }
}
```
end~

### 备注
1. 这里`MyPromise`的异步调用时通过`setTimeout`来模拟的，但在js的执行序列里，`Promise`是属于微任务，而`setTimeout`是属于宏任务，`Promise`是先于`setTimeout`执行的，这里只是通过`setTimeout`来模拟异步操作。
2. `finally`方法感觉还需要梳理下~
3. 有时间研究下`Promise.allSettled`方法~


### 参考
1. [Promise实现原理](https://juejin.cn/post/6844903665686282253)
2. [Promise入门](https://es6.ruanyifeng.com/#docs/promise)
3. [Promise实现](https://juejin.cn/post/6844904096525189128)



<!-- 2021-03-30 -->


