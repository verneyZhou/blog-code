# JS异步题集



## 收藏

- [一道字节笔试题，实现一个异步求和函数](https://mp.weixin.qq.com/s/RBk-cLUU-ZT4ylqIR2XdJg)
- [字节面试官问粉丝，如何实现准时的setTimeout](https://mp.weixin.qq.com/s/AZh1djakcCo798T3OsdOwQ)
- [高级进阶：深度揭秘 Promise 注册微任务和执行过程](https://mp.weixin.qq.com/s/cN40pHBfttZ3O2oEbVPAcg)
- [看一道简单的题目，控制台会输出什么？](https://juejin.cn/post/6980962149115887623)




## 笔记


### Promise执行顺序

#### 第一题

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


#### 第二题

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve(3);
    console.log("timerEnd");
  }, 0);
  console.log(2);
});
promise.then((res) => {
  console.log(res);
});
console.log(4);
```


#### 第三题

```js
console.log('script start')

async function async1() {
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2 end') 
}
async1()

setTimeout(function() {
  console.log('setTimeout')
}, 0)

new Promise(resolve => {
  console.log('Promise')
  resolve()
})
  .then(function() {
    console.log('promise1')
  })
  .then(function() {
    console.log('promise2')
  })

console.log('script end')

// 
script start
async2 end
Promise
script end
async1 end
promise1
promise2
setTimeout
```


#### 第四题

```js
setTimeout(() => {
  console.log(123);
});

const p = Promise.resolve(
  new Promise(resolve => {
    setTimeout(() => {
      resolve('p');
      console.log(55);
    });
    new Promise(resolve => {
      resolve('p1');
    }).then(r => console.log(r));
  })
);

setTimeout(() => {
  console.log(456);
});

p.then(r => console.log(r));
```

#### 第五题

```js
async function b() {
  console.log('1');
}

async function c() {
  console.log('7');
}

async function a() {
  console.log('2');
  await b();
  //console.log(3);
  await c();
  console.log(8);
}

a();
console.log(5);
Promise.resolve()
  .then(() => {
    console.log(4);
  })
  .then(() => {
    console.log(6);
  });

setTimeout(() => {
  console.log(123);
});

new Promise(resolve => {
  setTimeout(() => resolve());
}).then(() => console.log(55555555));
```


#### 第六题
```js
console.log('1');

setTimeout(function() {
    console.log('2');
    process.nextTick(function() {
        console.log('3');
    })
    new Promise(function(resolve) {
        console.log('4');
        resolve();
    }).then(function() {
        console.log('5')
    })
})
process.nextTick(function() {
    console.log('6');
})
new Promise(function(resolve) {
    console.log('7');
    resolve();
}).then(function() {
    console.log('8')
})

setTimeout(function() {
    console.log('9');
    process.nextTick(function() {
        console.log('10');
    })
    new Promise(function(resolve) {
        console.log('11');
        resolve();
    }).then(function() {
        console.log('12')
    })
})

```

#### 第七题

```js
Promise.resolve().then(() => {
        console.log(0);
        return Promise.resolve(4)
        .then(res => {
            console.log('inner',res);
        });
        // return new Promise((resolve, reject) => {
        //     resolve(4);
        // })
    }).then((res) => {
        console.log('outer',res)
    })

    Promise.resolve().then(() => {        
        console.log(1);
    }).then(() => {
        console.log(2);
    }).then(() => {
        console.log(3);
    }).then(() => {
        console.log(5);
    }).then(() =>{
        console.log(6);
    })
```


#### 第八题

```js
var date = new Date() 
console.log(1, new Date() - date) 
setTimeout(() => {
    console.log(2, new Date() - date)
}, 500) 
Promise.resolve().then(console.log(3, new Date() - date)) 
while(new Date() - date < 1000) {} 
console.log(4, new Date() - date)
```
::: tip 分析：
- 首先执行同步代码，输出 1 0
- 遇到 setTimeout ，定时 500ms 后执行，此时，将 setTimeout 交给异步线程，主线程继续执行下一步，异步线程执行 setTimeout
- 主线程执行 Promise.resolve().then , .then 的参数不是函数，发生值透传（ value => value ） ，输出 3 1
- 主线程继续执行同步任务 whlie ，等待 1000ms ，在此期间，setTimeout 定时 500ms 完成，异步线程将 setTimeout 回调事件放入宏任务队列中
- 继续执行下一步，输出 4 1000
- 检查微任务队列，为空
- 检查宏任务队列，执行 setTimeout 宏任务，输入 2 1000
:::




## 其他


1. 试着运行以下代码，会报错：
``` js
var obj = { x: 1, y: 2, z: 3 };
[...obj]; // Uncaught TypeError: obj is not iterable
```
因为扩展运算符`...` 和 for-of 语句遍历`iterable`对象定义要遍历的数据。Array 或Map 是具有默认迭代行为的内置迭代器。对象不是可迭代的，但是可以通过使用iterable和iterator协议使它们可迭代。
> 在Mozilla文档中，如果一个对象实现了`@@iterator`方法，那么它就是可迭代的，这意味着这个对象(或者它原型链上的一个对象)必须有一个带有`@@iterator`键的属性，这个键可以通过常量`Symbol.iterator`获得。
``` js
var obj = { x: 1, y: 2, z: 3 };
obj[Symbol.iterator] = function() {
  
  // iterator 是一个具有 next 方法的对象，
  // 它的返回至少有一个对象
  // 两个属性：value＆done。

  // 返回一个 iterator 对象
  return {
    next: function() {
      if (this._countDown === 3) {
        const lastValue = this._countDown;
        return { value: this._countDown, done: true };
      }
      this._countDown = this._countDown + 1;
      return { value: this._countDown, done: false };
    },
    _countDown: 0
  };
};
[...obj]; // [1,2,3]
```
这时再执行`...obj`就能正常打印：`[1,2,3]`。



## 参考

- [带你彻底弄懂Event Loop](https://segmentfault.com/a/1190000016278115)