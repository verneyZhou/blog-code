


#### Promise面试题

[Promise](https://mp.weixin.qq.com/s/cN40pHBfttZ3O2oEbVPAcg)


#### 同步任务、宏任务、微任务
https://segmentfault.com/a/1190000016278115



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
