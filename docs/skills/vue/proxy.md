
# Vue：深入响应式原理

这里是我的关于vue响应式原理的学习笔记~



## Object.defineProperty与Proxy
> 开始之前先介绍下`Object.defineProperty`和`Proxy`~


### Object.defineProperty
> `Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。详见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)


- **语法**

`Object.defineProperty(obj, prop, descriptor)`

> - **obj**：要定义属性的对象；
> - **prop**：要定义或修改的属性的名称或 Symbol；
> - **descriptor**：要定义或修改的属性描述符；
> - **返回值**：被传递给函数的对象


- **属性描述符（descriptor）**

对象里目前存在的**属性描述符**有两种主要形式：**数据描述符和存取描述符**。

**数据描述符**是一个具有值的属性，该值可以是可写的，也可以是不可写的。

**存取描述符**是由 getter 函数和 setter 函数所描述的属性。
> 一个描述符只能是这两者其中之一；不能同时是两者。


::: tip 属性描述符的键值
- **共享键值**
    - `configurable`：当且仅当该属性的 configurable 键值为 true 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除，默认为 false；
    -  `enumerable`：当且仅当该属性的 enumerable 键值为 true 时，该属性才会出现在对象的枚举属性中，默认为 false；

- **数据描述符键值**
    - `value`：该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等），默认为 `undefined`；
    - `writable`：当且仅当该属性的 writable 键值为 true 时，属性的值，也就是上面的 value，才能被赋值运算符改变，默认为 false；

- **存取描述符键值**
    - `get`：属性的 getter 函数，如果没有 getter，则为 undefined。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 this 对象（由于继承关系，这里的this并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值。默认为 undefined；
    - `set`：当且仅当该属性的 writable 键值为 true 时，属性的值，也就是上面的 value，才能被赋值运算符改变，默认为 false；
:::
如果一个描述符不具有 value、writable、get 和 set 中的任意一个键，那么它将被认为是一个数据描述符。如果一个描述符同时拥有 value 或 writable 和 get 或 set 键，则会产生一个异常。


- **示例:**

``` js
var o = {}; // 创建一个新对象

o.a = 37;

// 在对象中添加一个属性与数据描述符：
Object.defineProperty(o, "a", {
  value : 37,
  writable : true,
  enumerable : true,
  configurable : true
});

// 在对象中添加一个设置了存取描述符属性：
var bValue = 38;
Object.defineProperty(o, "b", {
  get() { return bValue; },
  set(newValue) { bValue = newValue; },
  enumerable : true,
  configurable : true
});

console.log(o.a,o.b); // 37 38


// 数据描述符和存取描述符不能混合使用
Object.defineProperty(o, "conflict", {
  value: 0x9f91102,
  get() { return 0xdeadbeef; }
});
// 抛出错误 TypeError

```

- **特点：**

1. configurable 特性表示对象的属性是否可以被删除，以及除 value 和 writable 特性外的其他特性是否可以被修改。
    > 如果 configurable 属性设置为false，则该属性被认为是“不可配置的”，当试图改变时（除了 value 和 writable 属性之外）时，会抛出TypeError，除非当前值和新值相同。
2. 当 writable 属性设置为 false 时，该属性被称为“不可写的”。它不能被重新赋值。
3. enumerable 定义了对象的属性是否可以在 for...in 循环和 Object.keys() 中被枚举。
4. 通常，使用点运算符和 Object.defineProperty() 为对象的属性赋值时，数据描述符中的属性默认值是不同的：
``` js
var o = {};

// 点运算符
o.a = 1;
// 等同于：
Object.defineProperty(o, "a", {
  value: 1,
  writable: true,
  configurable: true,
  enumerable: true
});


// 另一方面，
Object.defineProperty(o, "a", { value : 1 });
// 等同于：
Object.defineProperty(o, "a", {
  value: 1,
  writable: false,
  configurable: false,
  enumerable: false
});
```

### Proxy
Proxy 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以**对外界的访问进行过滤和改写**。
> 关于`Proxy`的简介我已经在另一篇博客[JS深入：ES6、ES7、ES8...](/frontend/js/js-es6.html#proxy)有过记录，具体可参考阮老师的[Proxy]( https://es6.ruanyifeng.com/#docs/proxy)，这里不再赘述~




### 比较

- **Object.defineProperty**

::: tip Object.defineProperty 的缺点
1. 不能监听数组的变化
  ``` js
  let arr = [1,2,3]
  let obj = {}

  Object.defineProperty(obj, 'arr', {
    get () {
      console.log('get arr')
      return arr
    },
    set (newVal) {
      console.log('set', newVal)
      arr = newVal
    }
  })

  obj.arr.push(4) // 只会打印 get arr, 不会打印 set
  obj.arr = [1,2,3,4] // 这个能正常 set
  ```
  > `push、pop、shift、unshift、splice、sort、reverse`这几个方法不会触发 set，Vue 的做法是修改了数组的原型，重写了这些方法来实现数组劫持。
  

- 源码位置: `src/core/observer/array.js`:
``` js
const aryMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
const arrayAugmentations = [];

aryMethods.forEach((method)=> {

    // 这里是原生Array的原型方法
    let original = Array.prototype[method];

   // 将push, pop等封装好的方法定义在对象arrayAugmentations的属性上
   // 注意：是属性而非原型属性
    arrayAugmentations[method] = function () {
        console.log('我被改变啦!');

        // 调用对应的原生方法并返回结果
        return original.apply(this, arguments);
    };

});

let list = ['a', 'b', 'c'];
// 将我们要监听的数组的原型指针指向上面定义的空数组对象
// 别忘了这个空数组的属性上定义了我们封装好的push等方法
list.__proto__ = arrayAugmentations;
list.push('d');  // 我被改变啦！ 4

// 这里的list2没有被重新定义原型指针，所以就正常输出
let list2 = ['a', 'b', 'c'];
list2.push('d');  // 4

```

2. 只能劫持对象的属性，必须遍历对象的每个属性
  > 使用 Object.defineProperty() 多数要配合 Object.keys() 和遍历，于是多了一层嵌套。如：
  ``` js
  Object.keys(obj).forEach(key => {
    Object.defineProperty(obj, key, {
      // ...
    })
  })
  ```
3. 必须深层遍历嵌套的对象
  > 如果是嵌套对象，那就必须逐层遍历，直到把每个对象的每个属性都调用 Object.defineProperty() 为止。 Vue 的源码中就能找到这样的逻辑 (叫做 walk 方法)。
:::


- **Proxy**

::: tip Proxy 的优点
1. **针对对象**：`Proxy` 可以被认为是 `Object.defineProperty()` 的升级版。外界对某个对象的访问，都必须经过这层拦截。因此它是针对**整个对象**，而不是**对象的某个属性**，所以也就不需要对 keys 进行遍历。这解决了上述 Object.defineProperty() 的第二个问题；
2. **支持数组**：Proxy 不需要对数组的方法进行重载，省去了众多 hack，减少代码量等于减少了维护成本；
3. **嵌套支持**：本质上，Proxy 也是不支持嵌套的，这点和 Object.defineProperty() 是一样的。因此也需要通过逐层遍历来解决。Proxy 的写法是在 get 里面递归调用 Proxy 并返回；
:::
> Proxy 提供了 13 种拦截方法，这比起 Object.defineProperty() 要更加丰富；
> Proxy 返回的是一个新对象,我们可以只操作新的对象达到目的,而 Object.defineProperty 只能遍历对象属性直接修改。
- **Proxy用处**：埋点、性能监控、响应式系统（Observe）、监测给定对象或类、对象属性校验；
-  **缺点**：Proxy 的兼容性不如 Object.defineProperty()





## 概念

### 发布订阅模式

-  **观察者模式**

观察者模式（Observer Pattern）定义了对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知，并自动更新。观察者模式属于行为型模式，行为型模式关注的是对象之间的通讯，观察者模式就是观察者和被观察者之间的通讯。

观察者模式有一个别名叫“发布-订阅模式”，或者说是“订阅-发布模式”，订阅者和订阅目标是联系在一起的，当订阅目标发生改变时，逐个通知订阅者。
> 我们可以用报纸期刊的订阅来形象的说明，当你订阅了一份报纸，每天都会有一份最新的报纸送到你手上，有多少人订阅报纸，报社就会发多少份报纸，报社和订报纸的客户就是上面文章开头所说的“一对多”的依赖关系。


- **发布订阅模式**

发布订阅模式（Pub-Sub Pattern）是观察者模式的一个别称，但是经过时间的沉淀，似乎他已经强大了起来，已经独立于观察者模式，成为另外一种不同的设计模式。

在现在的发布订阅模式中，称为发布者的消息发送者不会将消息直接发送给订阅者，这意味着发布者和订阅者不知道彼此的存在。在发布者和订阅者之间存在第三个组件，称为消息代理或调度中心或中间件，它维持着发布者和订阅者之间的联系，过滤所有发布者传入的消息并相应地分发它们给订阅者。
> 举一个例子，你在微博上关注了A，同时其他很多人也关注了A，那么当A发布动态的时候，微博就会为你们推送这条动态。A就是发布者，你是订阅者，微博就是调度中心，你和A是没有直接的消息往来的，全是通过微博来协调的（你的关注，A的发布动态）。

- **区别**

<img class="zoom-custom-imgs" :src="$withBase('/images/skills/proxy002.png')" width="auto"/>

**观察者模式**：观察者（Observer）直接订阅（Subscribe）主题（Subject），而当主题被激活的时候，会触发（Fire Event）观察者里的事件。

**发布订阅模式**：订阅者（Subscriber）把自己想订阅的事件注册（Subscribe）到调度中心（Topic），当发布者（Publisher）发布该事件（Publish topic）到调度中心，也就是该事件触发时，由调度中心统一调度（Fire Event）订阅者注册到调度中心的处理代码。

1. 观察者模式和发布订阅模式最大的区别就是发布订阅模式有个事件调度中心。
2. 观察者模式由具体目标调度，每个被订阅的目标里面都需要有对观察者的处理，这种处理方式比较直接粗暴，但是会造成代码的冗余。
3. 而发布订阅模式中统一由调度中心进行处理，订阅者和发布者互不干扰，消除了发布者和订阅者之间的依赖。这样一方面实现了解耦，还有就是可以实现更细粒度的一些控制。比如发布者发布了很多消息，但是不想所有的订阅者都接收到，就可以在调度中心做一些处理，类似于权限控制之类的。还可以做一些节流操作。




### MVVM
> 介绍 MVVM 之前，先介绍下 MVC 模式和 MVP 模式~

- **MVC**

MVC全名是**Model View Controller**，是模型(model)－视图(view)－控制器(controller)的缩写，是一种软件设计模式。

它用一种业务逻辑、数据、界面显示分离的方法组织代码，将业务逻辑聚集到一个部件里面，在改进和个性化定制界面及用户交互的同时，不需要重新编写业务逻辑。

> View 传送指令到 Controller；Controller 完成业务逻辑后，要求 Model 改变状态；Model 将新的数据发送到 View，用户得到反馈。

> 各部分之间的通信都是单向的。

<img class="zoom-custom-imgs" :src="$withBase('/images/skills/proxy001.png')" width="auto"/>

::: tip MVC
- **Model**（模型）是应用程序中用于处理应用程序**数据逻辑**的部分。
  > 通常模型对象负责在数据库中存取数据。
- **View**（视图）是应用程序中处理**数据显示**的部分。
  > 通常视图是依据模型数据创建的。
- **Controller**（控制器）是应用程序中处理用户交互**业务逻辑**的部分。
  > 通常控制器负责从视图读取数据，控制用户输入，并向模型发送数据。
:::


**优点：** 视图层和业务层的分离降低耦合度，模块的重用性高，可维护性高，使系统更灵活，扩展性更好。


**缺点：** 

1. 对于简单的小型项目，增加系统结构和实现的复杂性
2. ViewController 负责 View 和 Model 之间调度，视图与控制器连接过于紧密会造成 ViewController 比较臃肿


- **MVP**

MVP 全称：Model-View-Presenter ；MVP 是从经典的模式 MVC 演变而来，它们的基本思想有相通的地方，Controller/Presenter 负责逻辑的处理，Model 提供数据，View 负责显示。

<img class="zoom-custom-imgs" :src="$withBase('/images/skills/mvp001.png')" width="auto"/>

::: tip MVP
- 各部分之间的通信，都是双向的。
- View 与 Model 不发生联系，都通过 Presenter 传递。
- View 非常薄，不部署任何业务逻辑，称为"被动视图"（Passive View），即没有任何主动性，而 Presenter非常厚，所有逻辑都部署在那里。
:::

作为一种新的模式，MVP与MVC有着一个重大的区别：在MVP中View并不直接使用Model，它们之间的通信是通过Presenter (MVC中的Controller)来进行的，所有的交互都发生在Presenter内部，而在MVC中View会直接从Model中读取数据而不是通过 Controller。


- **MVVM**
MVVM是 **Model-View-ViewModel** 的缩写，即**模型-视图-视图模型**。它本质上就是 MVC（Model-View-Controller） 的改进版。

> 【模型】指的是后端传递的数据。【视图】指的是所看到的页面。【视图模型】mvvm 模式的核心，它是连接 view 和 model 的桥梁。
- 它有两个方向：一是将【模型】转化成【视图】，即将后端传递的数据转化成所看到的页面。实现的方式是：数据绑定。
- 二是将【视图】转化成【模型】，即将所看到的页面转化成后端的数据。实现的方式是：DOM 事件监听。
> 这两个方向都实现的，我们称之为数据的双向绑定。

<img class="zoom-custom-imgs" :src="$withBase('/images/skills/mvvm001.png')" width="auto"/>

> MVVM 就是将其中的 View 的状态和行为抽象化，让我们将视图 UI 和业务逻辑分开。

在MVVM的框架下视图和模型是不能直接通信的。它们通过ViewModel来通信，ViewModel通常要实现一个observer观察者，当数据发生变化，ViewModel能够监听到数据的这种变化，然后通知到对应的视图做自动更新，而当用户操作视图，ViewModel也能监听到视图的变化，然后通知数据做改动，这实际上就实现了数据的双向绑定。并且MVVM中的View 和 ViewModel可以互相通信。




- **为什么会有MVVM框架？**
> 在过去的10年中，我们已经把很多传统的服务端代码放到了浏览器中，这样就产生了成千上万行的javascript代码，它们连接了各式各样的HTML 和CSS文件，但缺乏正规的组织形式，这也就是为什么越来越多的开发者使用javascript框架。比如：angular、react、vue。浏览器的兼容性问题已经不再是前端的阻碍。前端的项目越来越大，项目的可维护性和扩展性、安全性等成了主要问题。当年为了解决浏览器兼容性问题，出现了很多类库，其中最典型的就是jquery。但是这类库没有实现对业务逻辑的分成，所以维护性和扩展性极差。综上两方面原因，才有了MVVM模式一类框架的出现。比如vue,通过数据的双向绑定，极大了提高了开发效率。

- **MVC与MVVM的区别**

在MVC里，View是可以直接访问Model的，所以View里会包含Model信息以及一些业务逻辑。 MVC模型关注的是Model的不变，所以在MVC模型里，Model不依赖于View，但是 View是依赖于Model的。不仅如此，因为有一些业务逻辑在View里实现了，导致要更改View也是比较困难的，至少那些业务逻辑是无法重用的。

MVVM在概念上是真正将**页面与数据逻辑分离**的模式，它把数据绑定工作放到一个JS里去实现，而这个JS文件的主要功能是完成数据的绑定，即把model绑定到UI的元素上。此外MVVM另一个重要特性双向绑定，它更方便你去同时维护页面上都依赖于某个字段的N个区域，而不用手动更新它们。

> MVC 和 MVVM 的区别并不是 VM 完全取代了 C，ViewModel 存在目的在于抽离 Controller 中展示的业务逻辑，而不是替代 Controller，其它视图操作业务等还是应该放在 Controller 中实现。也就是说 MVVM 实现的是业务逻辑组件的重用。

- **MVVM与MVP区别**
> mvvm模式将Presener改名为View Model，基本上与MVP模式完全一致，唯一的区别是，它采用双向绑定(data-binding): View的 变动，自动反映在View Model，反之亦然。这样开发者就不用处理接收事件和View更新的工作，框架已经帮你做好了。

这些模式是依次进化而形成 MVC -> MVP -> MVVM。在以前传统的开发模式 MVC 中，前端人员只负责 View（视图）部分，写好页面交由后端创建渲染模板并提供数据，随着 MVVM 模式的出现前端已经可以自己写业务逻辑以及渲染模板，后端只负责提供数据即可。



### 双向绑定

::: tip Vue 三要素
- **响应式**: 如何监听数据变化,其中的实现方法就是**双向绑定**
- **模板引擎**: 如何解析模板
- **渲染**: Vue如何将监听到的数据变化和解析后的HTML进行渲染
:::

单向绑定非常简单，就是把Model绑定到View，当我们用JavaScript代码更新Model时，View就会自动更新。有单向绑定，就有双向绑定，如果用户更新了View，Model的数据也自动被更新了，这种情况就是双向绑定。

- **单向绑定**
> 把Model绑定到View，当我们用JavaScript代码更新Model时，View就会自动更新。因此，我们不需要进行额外的DOM操作，只需要进行Model的操作就可以实现视图的联动更新。

- **双向绑定**
> 把Model绑定到View的同时也将View绑定到Model上，这样就既可以通过更新Model来实现View的自动更新，也可以通过更新View来实现Model数据的更新。所以，当我们用JavaScript代码更新Model时，View就会自动更新，反之，如果用户更新了View，Model的数据也自动被更新了。



**实现双向绑定的方法：**
- 观察者模式（KnockoutJS）
- 数据模型（Ember）
- 发布者-订阅者模式（backbone.js）
- 脏值检查（angular.js）
- **数据劫持**（vue.js）

### 数据劫持
所谓数据劫持（也叫数据代理），指的是在访问或者修改对象的某个属性时，通过一段代码拦截这个行为，进行额外的操作或者修改返回结果。
> 比较典型的是 `Object.defineProperty()` 和 ES2015 中新增的 `Proxy` 对象。另外还有已经被废弃的 `Object.observe()`。

数据劫持比较常见的应用就是**双向绑定**。

- **例子**

``` js
// 这是将要被劫持的对象
const data = {
  name: '',
};

function say(name) {
  if (name === '蔡徐坤') {
    console.log('我唱跳rap都行~还会打篮球~')
  }
}

// 遍历对象,对其属性值进行劫持
Object.keys(data).forEach(function(key) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      console.log('get');
    },
    set: function(newVal) {
      // 当属性值发生变化时我们可以进行额外操作
      console.log(`大家好,我系${newVal}`);
      say(newVal);
    },
  });
});

data.name = '蔡徐坤';
//大家好,我系蔡徐坤
//我唱跳rap都行~还会打篮球~

```

::: tip 相较其他方法，数据劫持的优势：
- 无需显示调用
  > 例如Vue运用**数据劫持+发布订阅**,直接可以通知变化并驱动视图，上面的例子中`data.name = '蔡徐坤'`后直接触发变更；而比如`Angular`的脏检测则需要显示调用；react需要显示调用`setState`。
- 可精确得知变化数据
  > 还是上面的小例子，我们劫持了属性的 setter ,当属性值改变,我们可以精确获知变化的内容 newVal ，因此在这部分不需要额外的 diff 操作,否则我们只知道数据发生了变化而不知道具体哪些数据变化了,这个时候需要大量 diff 来找出变化值,这是额外性能损耗。
:::

-  **基于数据劫持实现双向绑定的实现思路**
  1. 利用`Proxy`或`Object.defineProperty`生成的`Observer`针对对象/对象的属性进行"劫持",在属性发生变化后通知订阅者;
  2. 解析器`Compile`解析模板中的`Directive`(指令)，收集指令所依赖的方法和数据,等待数据变化然后进行渲染;
  3. `Watcher`属于`Observer`和`Compile`桥梁,它将接收到的`Observer`产生的数据变化,并根据`Compile`提供的指令进行视图渲染,使得数据变化促使视图变化。

<img class="zoom-custom-imgs" src="https://user-gold-cdn.xitu.io/2018/4/11/162b38ab2d635662?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" width="auto"/>




## 双向绑定的实现

### Object.defineProperty 实现

#### 极简版

``` html
<body>
    <input type="text" id="input"/>
    <p id="p"></p>
</body>
```
``` js
// 监听对象
function observe(obj) {
  // 遍历对象，使用 get/set 重新定义对象的每个属性值
  Object.keys(obj).map(key => {
    defineReactive(obj, key, obj[key])
  })
}

// 数据劫持
function defineReactive(obj, k, v) {

  // 递归监听子属性
  if (typeof(v) === 'object') observe(v)

  // 重定义 get/set
  Object.defineProperty(obj, k, {
    enumerable: true,
    configurable: true,
    get: function () {
      console.log('get: ' + v)
      return v
    },
    // 重新设置值时，触发收集器的通知机制
    set: function (newVal) {
      console.log('set: ' + newVal)
      v = newVal;
      document.getElementById('p').innerHTML = newVal;
    },
  })
}


const data = {
  text: '',
}
// 监视对象
observe(data);

document.getElementById('input').addEventListener('keyup', function(el) {
  data.text = el.target.value; // 赋值

})
```

具体参见[codeopen](https://codepen.io/verneyzhou/pen/oNZRbob)

> 上述代码是一个极简版的实现，通过`Object.defineProperty`对`data`属性的变化实现监听，并实现数据劫持；但上述代码耦合严重，数据、方法和DOM都是耦合在一起的。


#### 升级版
> 以**发布订阅**的角度看我们第一部分写的那一坨代码,会发现它的监听、发布和订阅都是写在一起的,我们首先要做的就是**解耦**。

分别从**订阅中心 Dep、监听者 Observer、订阅者 Watcher**这三个角色来拆分一下~

- 第一步：实现一个**订阅发布中心**，即**消息管理员（Dep）**,它负责储存订阅者和消息的分发,不管是订阅者还是发布者都需要依赖于它；
``` js

  /* 订阅中心：用于储存订阅者并发布消息 */
  let uid = 0;
  class Dep {
      constructor(){
          this.id = uid ++; // 设置id,用于区分新旧Watcher
          this.subs = []; // 储存订阅者
      }

      // 触发target上的Watcher的addDep方法，参数为dep实例本身
      depend() {
          Dep.target.addDep(this);
      }

      // 添加订阅者
      addSub(sub) {
          this.subs.push(sub);
      }

      // 通知所有订阅者，触发所有订阅者的更新逻辑
      notify() {
          console.log('=======111111', this.subs);
          this.subs.forEach(sub => sub.update());
      }
      
  }
  Dep.target = null; // 为Dep类设置一个静态属性，默认为null，工作时指向当前的Watcher


```

- 第二步：实现**监听者（Observer）**,用于监听属性值的变化；

``` js

/** 监听者：监听对象属性值的变化 **/
    class Observer {
        constructor(params) {
            this.params = params;
            this.walk(params);
        }

        // 遍历属性并监听
        walk(params) {
            Object.keys(params).forEach(key => this.convert(key, params[key]))
        }

        // 执行具体的监听方法
        convert(key, val) {
            defineReactive(this.params, key, val);
        }
    }

    // 监听方法
    function defineReactive(obj, key, val) {
        // 生成一个 Dep 实例
        const dep = new Dep();

        let childObj = observe(val); // 递归监听子属性

        Object.defineProperty(obj, key, {
            enumerable: true, // 可枚举
            configurable: true, // 可配置
            get:() => {
                /*
                    如果Dep类存在target属性，将其添加到dep实例的subs数组中
                    target指向一个Watcher实例，每个Watcher都是一个订阅者
                    Watcher实例在实例化过程中，会读取data中的某个属性，从而触发当前get方法
                */
                console.log('======333333',val, Dep.target);
                if (Dep.target) dep.depend();
                
                return val;
            },
            set: (newVal) => {
                console.log('=====00000',newVal, Dep.target);
                if (val === newVal) return;
                val = newVal; // 赋值
                childObj = observe(newVal); // 对新值进行深度监听
                dep.notify(); // 通知所有订阅者，值更新了
            }
        })
    }

    // 递归监听判断
    function observe(val) {
        // 如果值为复杂类型，就返回Observer实例，继续深入监听
        if (!val || typeof val !== 'object') return;
        return new Observer(val);
    }

```

- 第三步：实现一个**订阅者（Watcher）**；

``` js

/** 当前订阅者 **/
    class Watcher {
        constructor(vm, expOrFn, cb) {
            this.depIds = {}; // 储存订阅者id
            this.vm = vm; // 当前vue实例
            this.cb = cb; // 数据更新后的回调
            this.expOrFn = expOrFn; // 被订阅的数据
            this.val = this.get(); // 维护更新之前的数据
        }

        // 对外暴露的接口，用于在订阅的数据被更新时，由订阅者管理员(Dep)调用
        update() {
            this.run();
        }
        // 数据更新时具体执行方法
        run() {            
            const val = this.get();
            if (val !== this.val) {
                this.val = val; // 更新值
                this.cb.call(this.vm, val); // 触发回调
            }
        }
        get() {
            // 当前订阅者(Watcher)读取被订阅数据的最新更新后的值时，通知订阅者管理员收集当前订阅者
            console.log('=======22222',Dep.target);
            Dep.target = this;
            // 获取属性值，触发defineReactive中的get方法
            const val = this.vm._data[this.expOrFn];
            // 置空，用于下一个Watcher使用
            Dep.target = null;
            console.log('=======55555555',Dep.target,val);
            return val;
        }

        addDep(dep) {
            console.log('======4444444',dep);
            // 如果在depIds中没有当前的id,可以判断是新Watcher,因此可以添加到dep的数组中储存
            // 此判断是避免同id的Watcher被多次储存
            if (!this.depIds.hasOwnProperty(dep.id)) {
                dep.addSub(this); // 添加订阅者
                this.depIds[dep.id] = dep;
            }
        }


    }
```

- 第四步：完成 Vue，将上述方法挂载在 Vue 上。
``` js

  /** Vue **/
    class Vue {
        constructor(options = {}) {
            this.$options = options; // 
            let data = this._data = this.$options.data; // 获取data
            Object.keys(data).forEach(key => this._proxy(key)); // 代理

            // 监听数据
            observe(data);
        }

        // 对外暴露调用订阅者的接口，内部主要在指令中使用订阅者
        $watch(expOrFn, cb) {
            new Watcher(this, expOrFn, cb);
        }

        // 将所有data最外层属性代理到vue实例上
        _proxy(key) {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get: () => {
                    this._data[key]
                },
                set: (val) => {
                    this._data[key] = val;
                }
            })
        }
    }
```
- 最后，使用：
``` js
const vm = new Vue({
        data: {
            text: '',
        }
    });

    const p = document.getElementById('p');
    const input = document.getElementById('input');
    input.addEventListener('keyup', function(el) {
        vm.text = el.target.value; // 赋值
    })

    // 监听
    vm.$watch('text', val => {
        console.log('======66666',val);
        p.innerHTML = val;
    })
```

> 完整版参考：[codepen](https://codepen.io/verneyzhou/pen/oNZRVEQ)

::: tip 从生成 Vue 实例开始分析下流程：
1. 首先生成一个`Vue`实例`vm`，通过`vm.$watch`对`data`中的`text`属性实现监听，接下来看看`Vue`类中`$watch`方法做了什么；
2. `$watch`是`Vue`类中对外暴露的一个接口，最终返回一个`Watcher`实例；`Vue`类把`data`对象的所有属性通过`_proxy`代理到`Vue`实例上，并通过`observe(data)`实现监听；
3. `observe`方法返回一个`Observer`实例，而`Observer`类做的主要工作就是通过递归遍历对传入的属性进行深度监听；
  > 在监听方法`defineReactive`中通过`Object.defineProperty`进行数据劫持，这样当在项目中通过`vm.text = 'xxx'`改变属性时，`defineProperty`在`set`中进行拦截，并通过`dep.notify()`通知所有订阅者值已更新；那订阅者又是在什么时候添加的呢？这里就要回到上一步中的`Watcher`类~
4. 在初始化的时候，`Watcher`类会通过`this.val = this.get()`获取最新的数据；
  > `get()`方法中通过`Dep.target = this`将当前订阅者赋给`Dep.target`，并通过`this.vm._data[this.expOrFn]`获取最新属性值，因为上一步已经实现了监听，所以这一步也触发了`defineProperty`中的`get`方法，在`defineProperty`的`get`方法中会通过`dep.depend()`调用`Watcher`类中的`addDep`方法添加订阅者;
5. 当数据更新时，会通知订阅者更新，执行`Watcher`的`update`方法，然后执行`const val = this.get()`获取最新的值，重走一遍初始化时步骤4的流程；获取完成后，最后通过回调函数将最新的值抛出。
:::

**缺点**：只能监听已存在的属性，对于新增删除属性就无能为力了，同时无法监听数组的变化。
> `vue2.0`可通过`$set`新增属性、`$delete`删除属性来实现监听。

### Proxy 简易实现

1. **Proxy可以直接监听对象而非属性**
``` js
const input = document.getElementById('input');
const p = document.getElementById('p');
const obj = {};

const newObj = new Proxy(obj, {
  get: function(target, key, receiver) {
    console.log(`getting ${key}!`);
    return Reflect.get(target, key, receiver);
  },
  set: function(target, key, value, receiver) {
    console.log(target, key, value, receiver);
    if (key === 'text') {
      input.value = value;
      p.innerHTML = value;
    }
    return Reflect.set(target, key, value, receiver);
  },
});

input.addEventListener('keyup', function(e) {
  newObj.text = e.target.value;
});
```
在线示例参考：[CodePen](https://codepen.io/xiaomuzhu/pen/KRmwRE/) by Iwobi([@xiaomuzhu](https://codepen.io/xiaomuzhu)).
> Proxy 直接可以劫持整个对象,并返回一个新对象,不管是操作便利程度还是底层功能上都远强于 Object.defineProperty。

2. **Proxy可以直接监听数组的变化**

``` js
const list = document.getElementById('list');
const btn = document.getElementById('btn');

// 渲染列表
const Render = {
  // 初始化
  init: function(arr) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < arr.length; i++) {
      const li = document.createElement('li');
      li.textContent = arr[i];
      fragment.appendChild(li);
    }
    list.appendChild(fragment);
  },
  // 我们只考虑了增加的情况,仅作为示例
  change: function(val) {
    const li = document.createElement('li');
    li.textContent = val;
    list.appendChild(li);
  },
};

// 初始数组
const arr = [1, 2, 3, 4];

// 监听数组
const newArr = new Proxy(arr, {
  get: function(target, key, receiver) {
    console.log(key);
    return Reflect.get(target, key, receiver);
  },
  set: function(target, key, value, receiver) {
    console.log(target, key, value, receiver);
    if (key !== 'length') {
      Render.change(value);
    }
    return Reflect.set(target, key, value, receiver);
  },
});

// 初始化
window.onload = function() {
    Render.init(arr);
}

// push数字
btn.addEventListener('click', function() {
  newArr.push(6);
});

```
在线示例参考：[CodePen](https://codepen.io/xiaomuzhu/pen/zjwGoN/) by Iwobi([@xiaomuzhu](https://codepen.io/xiaomuzhu)).




## 备注

1. `Object.defineProperty`双向绑定中关于解析器`Compile`解析指令的部分这里暂时没有考虑，等以后有时间了再梳理一下~
2. `Object.defineProperty`双向绑定未实现对深层属性的监听~
3. `Proxy`的双向绑定有时间再细化下~

## 参考
- [JS 中的数据代理](https://juejin.cn/post/6844903766630596616)
- [实现双向绑定Proxy比defineproperty优劣如何?](https://juejin.cn/post/6844903601416978439)
- [剖析Vue原理&实现双向绑定MVVM](https://segmentfault.com/a/1190000006599500)
- [MVC、MVP、MVVM模式的概念与区别](https://www.jianshu.com/p/ff6de219f988)
- [由浅入深讲述MVVM](https://www.cnblogs.com/wzfwaf/p/10553160.html)
- [发布订阅模式与观察者模式](https://segmentfault.com/a/1190000018706349)
- [监听一个变量的变化，需要怎么做](https://mp.weixin.qq.com/s/q9PxtmT8hO1o76_IgJ3xyg)
- [深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)
- [mvvm](https://github.com/DMQ/mvvm)


<fix-link label="Back" href="/skills/"></fix-link>