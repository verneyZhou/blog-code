---
title: JS深入：js常用的设计模式
date: 2021-08-10 11:37:29
permalink: /pages/8a3db0/
categories:
  - js
tags:
  - js基础
  - 设计模式
---
# JS深入：js常用的设计模式

> 这里是我的关于JS设计模式的学习笔记~文中例子大都来自网上，我只是个搬运工。


## 前言

**设计模式**
- 设计模式就是在软件设计、开发过程中，针对特定问题、场景的更优解决方案。
- 设计模式的核心操作是去观察你整个逻辑里面的变与不变，然后将变与不变分离，达到使变化的部分灵活、不变的地方稳定的目的。



**设计模式原则**
- Single Responsibility Principle 单一职责原则
    > 一个程序只做好一件事；如果功能过于复杂就拆分开，每个部分保持独立
- OpenClosed Principle 开放/封闭原则
    > 对扩展开放，对修改封闭；增加需求时，扩展新代码，而非修改已有代码
- Liskov Substitution Principle 里氏替换原则
    > 子类能覆盖父类；父类能出现的地方子类就能出现
- Interface Segregation Principle 接口隔离原则
    > 保持接口的单一独立；类似单一职责原则，这里更关注接口
-  Dependency Inversion Principle 依赖倒转原则
    > 面向接口编程，依赖于抽象而不依赖于具体；使用方只关注接口而不关注具体类的实现
:::
[参考](https://zhuanlan.zhihu.com/p/24614363)

**开放封闭原则**
- 开放封闭原则（OCP，Open Closed Principle）是所有面向对象原则的核心。
    > 软件设计本身所追求的目标就是封装变化、降低耦合，而开放封闭原则正是对这一目标的最直接体现。
- 关于开放封闭原则，其核心的思想是：软件实体应该是可扩展，而不可修改的。也就是说，对扩展是开放的，而对修改是封闭的。
- 开放封闭原则主要体现在两个方面：
    - 对扩展开放，意味着有新的需求或变化时，可以对现有代码进行扩展，以适应新的情况；
    - 对修改封闭，意味着类一旦设计完成，就可以独立完成其工作，而不要对类进行任何修改。




## 创建型

### 工厂模式
> 工厂模式是软件工程领域一种广为人知的设计模式，这种模式抽象了创建具体对象的过程。

- ES5实现：
``` js
// 函数 createPerson()能够根据接受的参数来构建一个包含所有必要信息的 Person 对象。
function createPerson(name, age, job){
    var o = new Object();
    o.name = name;
    o.age = age;
    o.job = job;
    o.sayName = function(){
        alert(this.name);
    };
    return o; 
}
var person1 = createPerson("Nicholas", 29, "Software Engineer");
var person2 = createPerson("Greg", 27, "Doctor");
```
可以无数次地调用这个函数，而每次它都会返回一个包含三个属性一个方法的对象。

- ES6实现：
``` js
class Product {
    constructor(name) {
        this.name = name
    }
    init() {
        console.log(this.name)
    }
}

// 工厂模式定义一个用于创建对象的接口，这个接口由子类决定实例化哪一个类。
class Factory {
    create(name) {
        return new Product(name)
    }
}

// use
let factory = new Factory()
let p = factory.create('p1')
p.init() // p1
```
如果你不想让某个子系统与较大的那个对象之间形成强耦合，而是想运行时从许多子系统中进行挑选的话，那么工厂模式是一个理想的选择。

**优点**
1. 创建对象的过程可能很复杂，但我们只需要关心创建结果。
2. 构造函数和创建者分离, 符合“开闭原则”
3. 一个调用者想创建一个对象，只要知道其名称就可以了。
4. 扩展性高，如果想增加一个产品，只要扩展一个工厂类就可以。



### 单例模式
保证一个类仅有一个实例，并提供一个访问它的全局访问点；确保只有一个实例，并提供全局访问。

以页面弹窗为例：
``` html
<!DOCTYPE html>
<html lang="en">

<body>
    <button id="btn">登录</button>
</body>
<script>
    // 登录
    class Login {
        createLayout() {
            var oDiv = document.createElement('div')
            oDiv.innerHTML = '我是登录框'
            document.body.appendChild(oDiv)
            oDiv.style.display = 'none'
            return oDiv
        }
    }

    // 单例
    class Single {
        getSingle(fn) {
            var result;
            return function() {
                return result || (result = fn.apply(this, arguments))
            }
        }
    }

    var oBtn = document.getElementById('btn')
    var single = new Single()
    var login = new Login()

   
     // 由于闭包，createLoginLayer对result的引用，所以当single.getSingle函数执行完之后，内存中并不会销毁result。
    var createLoginLayer = single.getSingle(login.createLayout)
    oBtn.onclick = function() {
        // 当第二次以后点击按钮，根据createLoginLayer函数的作用域链中已经包含了result，所以直接返回result
        // 将获取单例和创建登录框的方法解耦，符合开放封闭原则
        var layout = createLoginLayer()
        layout.style.display = 'block'
    }
</script>

</html>

```
单例模式的主要思想就是，**实例如果已经创建，则直接返回**。

**优点**
- 划分命名空间，减少全局变量
- 增强模块性，把自己的代码组织在一个全局变量名下，放在单一位置，便于维护
- 且只会实例化一次。简化了代码的调试和维护

**缺点**：由于单例模式提供的是一种单点访问，所以它有可能导致模块间的强耦合 从而不利于单元测试。无法单独测试一个调用了来自单例的方法的类，而只能把它与那个单例作为一个单元一起测试。



### 原型模式
用原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象。

ES5写法：
``` js
var prototype = {
    name: 'Jack',
    getName: function() {
        return this.name
    }
}

var obj = Object.create(prototype, {
    job: {
        value: 'IT'
    }
})

console.log(obj.getName())  // Jack
console.log(obj.job)  // IT
console.log(obj.__proto__ === prototype)  //true
```

ES6写法：
``` js
class Person {
  constructor(name) {
    this.name = name
  }
  getName() {
    return this.name
  }
}
class Student extends Person {
  constructor(name) {
    super(name)
  }
  sayHello() {
    console.log(`Hello， My name is ${this.name}`)
  }
}

let student = new Student("xiaoming")
student.sayHello()

```
原型模式，就是创建一个共享的原型，通过拷贝这个原型来创建新的类，用于创建重复的对象，带来性能上的提升。



## 结构型

### 适配器模式
> 适配器模式的作用是解决两个软件实体间的接口不兼容的问题。使用适配器模式之后，原本由于接口不兼容而不能工作的两个软件实体可以一起工作。

适配器的别名是包装器(wrapper)，这是一个相对简单的模式。在程序开发中有许多这样的 场景:当我们试图调用模块或者对象的某个接口时，却发现这个接口的格式并不符合目前的需求。 这时候有两种解决办法，第一种是修改原来的接口实现，但如果原来的模块很复杂，或者我们拿 到的模块是一段别人编写的经过压缩的代码，修改原接口就显得不太现实了。第二种办法是创建 一个适配器，将原接口转换为客户希望的另一个接口，客户只需要和适配器打交道。

举一个书中渲染地图的例子：
``` js
class GooleMap {
    show() {
        console.log('渲染谷歌地图')
    }
}

class BaiduMap {
    show() {
        console.log('渲染百度地图')
    }
}

function render(map) {
    if (map.show instanceof Function) {
        map.show()
    }
}

render(new GooleMap())  // 渲染谷歌地图
render(new BaiduMap())  // 渲染百度地图
```
> 但是假如BaiduMap类的原型方法不叫show，而是叫display，这时候就可以使用适配器模式了，因为我们不能轻易的改变第三方的内容。在BaiduMap的基础上封装一层，对外暴露show方法。
``` js
class GooleMap {
    show() {
        console.log('渲染谷歌地图')
    }
}

class BaiduMap {
    display() {
        console.log('渲染百度地图')
    }
}


// 定义适配器类, 对BaiduMap类进行封装
class BaiduMapAdapter {
    show() {
        var baiduMap = new BaiduMap()
        return baiduMap.display() 
    }
}

function render(map) {
    if (map.show instanceof Function) {
        map.show()
    }
}

render(new GooleMap())         // 渲染谷歌地图
render(new BaiduMapAdapter())  // 渲染百度地图
```
适配器模式主要解决两个接口之间不匹配的问题，不会改变原有的接口，而是由一个对象对另一个对象的包装。


### 装饰者模式
动态地给某个对象添加一些额外的职责，是一种实现继承的替代方案；在不改变原对象的基础上，通过对其进行包装扩展，使原有对象可以满足用户的更复杂需求，而不会影响从这个类中派生的其他对象。

> 在传统的面向对象语言中，给对象添加功能常常使用继承的方式，但是继承的方式并不灵活， 还会带来许多问题:一方面会导致超类和子类之间存在强耦合性，当超类改变时，子类也会随之 改变;另一方面，继承这种功能复用方式通常被称为“白箱复用”，“白箱”是相对可见性而言的， 在继承方式中，超类的内部细节是对子类可见的，继承常常被认为破坏了封装性。装饰者模式能够在不改变对象自身的基础上，在程序运行期间给对象动态地添加职责。跟继承相比，装饰者是一种更轻便灵活的做法，这是一种“即用即付”的方式。

实现：
``` js
var plane = {
    fire: function(){
        console.log( '发射普通子弹' ); 
    }
}
var missileDecorator = function(){ 
    console.log( '发射导弹' );
}
var atomDecorator = function(){ 
    console.log( '发射原子弹' );
}
var fire1 = plane.fire;
plane.fire = function(){ 
    fire1();
    missileDecorator(); 
}
var fire2 = plane.fire;
plane.fire = function(){ 
    fire2();
    atomDecorator(); 
}
plane.fire();
// 分别输出: 发射普通子弹、发射导弹、发射原子弹
```

- **使用AOP实现装饰者模式**
``` js
Function.prototype.before = function( beforefn ){
    var __self = this; // 保存原函数的引用
    return function(){ // 返回包含了原函数和新函数的"代理"函数
        beforefn.apply( this, arguments ); // 执行新函数，且保证 this 不被劫持，新函数接受的参数 // 也会被原封不动地传入原函数，新函数在原函数之前执行
        return __self.apply( this, arguments ); // 执行原函数并返回原函数的执行结果，  // 并且保证 this 不被劫持
} }
Function.prototype.after = function( afterfn ){ 
    var __self = this;
    return function(){
        var ret = __self.apply( this, arguments ); 
        afterfn.apply( this, arguments );
        return ret;
    } 
};

```
**AOP 的应用实例：表单验证**
- 未使用AOP
``` js
var formSubmit = function(){
    if ( username.value === '' ){
        return alert ( '用户名不能为空' ); 
    }
    if ( password.value === '' ){
        return alert ( '密码不能为空' );
    }
    var param = {
        username: username.value, password: password.value
    }
    ajax( 'http:// xxx.com/login', param );
}
submitBtn.onclick = function(){ 
    formSubmit();
}
```

- 使用AOP
``` js
var validata = function(){
    if ( username.value === '' ){
        alert ( '用户名不能为空' );
        return false; 
    }
    if ( password.value === '' ){ 
        alert ( '密码不能为空' ); 
        return false;
    } 
}
var formSubmit = function(){ 
    var param = {
        username: username.value,
        password:password.value
    }
    ajax( 'http:// xxx.com/login', param ); 
}
formSubmit = formSubmit.before( validata );
submitBtn.onclick = function(){ 
    formSubmit();
}
```
装饰者模式和代理模式的结构看起来非常相像，这两种模式都描述了怎样为对象提供 一定程度上的间接引用，它们的实现部分都保留了对另外一个对象的引用，并且向那个对象发送请求。

代理模式的目的是，当直接访问本体不方便或者不符合需要时，为这个本体提供一个替代者。本体定义了关键功能，而代理提供或拒绝对它的访问，或者在访问本体之前做一些额外的事情。装饰者模式的作用就是为对 象动态加入行为。


### 代理模式
代理模式是为一个对象提供一个代用品或占位符，以便控制对它的访问。
> 当客户不方便直接访问一个对象或者不满足需要的时候，提供一个替身对象来控制对这个对象的访问，客户实际上访问的是替身对象。替身对象对请求做出一些处理之后， 再把请求转交给本体对象。

- 一个图片预加载的例子：
``` js
// 本体
var domImage = (function() {
  var imgEle = document.createElement('img');
  document.body.appendChild(imgEle);
  return {
    setSrc: function(src) {
      imgEle.src = src;
    }
  };
})();

// 代理
var proxyImage = (function() {
  var img = new Image();
  img.onload = function() {
    domImage.setSrc(this.src); // 图片加载完设置真实图片src
  };
  return {
    setSrc: function(src) {
      domImage.setSrc('./loading.gif'); // 预先设置图片src为loading图
      img.src = src;
    }
  };
})();

// 外部调用
proxyImage.setSrc('./product.png');

```
- 虚拟代理合并HTTP请求
> 假设我们在做一个文件同步的功能，当我们选中一个 checkbox 的时候，它对应的文件就会被同 步到另外一台备用服务器上面。当一次选中过多时，会产生频繁的网络请求。将带来很大的开销。可以通过一个代理函数 proxySynchronousFile 来收集一段时间之内的请求， 最后一次性发送给服务器
``` js
var synchronousFile = function( id ){ 
    console.log( '开始同步文件，id 为: ' + id );
};
var proxySynchronousFile = (function(){
    var cache = [], // 保存一段时间内需要同步的 ID
    timer; // 定时器
    return function( id ){
        cache.push( id );
            if ( timer ){ // 保证不会覆盖已经启动的定时器
                 return; 
            }
        timer = setTimeout(function(){ 
            synchronousFile( cache.join( ',' ) ); 
            clearTimeout( timer ); // 清空定时器 
            timer = null;
            cache.length = 0; // 清空 ID 集合
        }, 2000 ); 
    }// 2 秒后向本体发送需要同步的 ID 集合
})();

var checkbox = document.getElementsByTagName( 'input' );
   for ( var i = 0, c; c = checkbox[ i++ ]; ){
      c.onclick = function(){
      if ( this.checked === true ){
          proxySynchronousFile( this.id ); }
      }
};

```
代理模式能将代理对象与被调用对象分离，降低了系统的耦合度。代理模式在客户端和目标对象之间起到一个中介作用，这样可以起到保护目标对象的作用；缺点是处理请求速度可能有差别，非直接访问存在开销。
> 在滚动事件触发的时候，也许不需要频繁触发，我们可以引入函数节流，这是一种虚拟代理的实现

**比较**：装饰者模式和代理模式也不会改变原有对象的接口，但装饰者模式的作用是为了给对象增加功能。装饰者模式常常形成一条长的装饰链，而适配器模式通常只包装一次。代理模式是为了控制对对象的访问，通常也只包装一次。


### 外观模式
为子系统中的一组接口提供一个一致的界面，定义一个高层接口，这个接口使子系统更加容易使用。
> 可以通过请求外观接口来达到访问子系统，也可以选择越过外观来直接访问子系统，外观模式在JS中，可以认为是一组函数的集合。
``` js
// 三个处理函数
function start() {
    console.log('start');
}

function doing() {
    console.log('doing');
}

function end() {
    console.log('end');
}

// 外观函数，将一些处理统一起来，方便调用
function execute() {
    start();
    doing();
    end();
}


// 调用init开始执行
function init() {
    // 此处直接调用了高层函数，也可以选择越过它直接调用相关的函数
    execute();
}

init(); // start doing end
```


### 组合模式
组合模式将对象组合成树形结构，以表示“部分-整体”的层次结构。 除了用来表示树形结构之外，组合模式的另一个好处是通过对象的多态性表现，使得用户对单个对象和组合对象的使用具有一致性。
> 组合模式不是父子关系，它是一种HAS-A（聚合）的关系，将请求委托给它所包含的所有叶对象。基于这种委托，就需要保证组合对象和叶对象拥有相同的接口

- 扫描文件夹
> 文件夹和文件之间的关系，非常适合用组合模式来描述。文件夹里既可以包含文件，又可以 包含其他文件夹，最终可能组合成一棵树；当使用用杀毒软件扫描该文件夹时，往往不会关心里面有多少文件和子文件夹，组合模式使得我们只需要操作最外层的文件夹进行扫描。

``` js
// 文件夹 组合对象
function Folder(name) {
    this.name = name;
    this.parent = null;
    this.files = [];
}

Folder.prototype = {
    constructor: Folder,

    add: function(file) {
        file.parent = this;
        this.files.push(file);

        return this;
    },

    scan: function() {
        // 委托给叶对象处理
        for (var i = 0; i < this.files.length; ++i) {
            this.files[i].scan();
        }
    },

    remove: function(file) {
        if (typeof file === 'undefined') {
            this.files = [];
            return;
        }

        for (var i = 0; i < this.files.length; ++i) {
            if (this.files[i] === file) {
                this.files.splice(i, 1);
            }
        }
    }
};

// 文件 叶对象
function File(name) {
    this.name = name;
    this.parent = null;
}

File.prototype = {
    constructor: File,

    add: function() {
        console.log('文件里面不能添加文件');
    },

    scan: function() {
        var name = [this.name];
        var parent = this.parent;

        while (parent) {
            name.unshift(parent.name);
            parent = parent.parent;
        }

        console.log(name.join(' / '));
    }
};


// 使用
var web = new Folder('Web');
var fe = new Folder('前端');
var css = new Folder('CSS');
var js = new Folder('js');
var rd = new Folder('后端');

web.add(fe).add(rd);

var file1 = new File('HTML权威指南.pdf');
var file2 = new File('CSS权威指南.pdf');
var file3 = new File('JavaScript权威指南.pdf');
var file4 = new File('MySQL基础.pdf');
var file5 = new File('Web安全.pdf');
var file6 = new File('Linux菜鸟.pdf');

css.add(file2);
fe.add(file1).add(file3).add(css).add(js);
rd.add(file4).add(file5);
web.add(file6);

rd.remove(file4);

// 扫描
web.scan();
/*
Web / 前端 / HTML权威指南.pdf
Web / 前端 / JavaScript权威指南.pdf
Web / 前端 / CSS / CSS权威指南.pdf
Web / 后端 / Web安全.pdf
Web / Linux菜鸟.pdf
*/
```
可以方便地构造一棵树来表示对象的 部分-整体 结构。在树的构造最终完成之后，只需要通过请求树的最顶层对象，便能对整棵树做统一一致的操作。但创建出来的对象长得都差不多，可能会使代码不好理解，创建太多的对象对性能也会有一些影响。



### 享元模式
> 享元(flyweight)模式是一种用于性能优化的模式，“fly”在这里是苍蝇的意思，意为蝇量级。享元模式的核心是运用共享技术来有效支持大量细粒度的对象。
如果系统中因为创建了大量类似的对象而导致内存占用过高，享元模式就非常有用了。在 JavaScript 中，浏览器特别是移动端的浏览器分配的内存并不算多，如何节省内存就成了一件非常有意义的事情。

> 假设有个内衣工厂，目前的产品有 50 种男式内衣和 50 种女士内衣，为了推销产品，工厂决定生产一些塑料模特来穿上他们的内衣拍成广告照片。正常情况下需要50个男模特和50个女模特，然后让他们每人分别穿上一件内衣来拍照。

``` js
/*只需要区别男女模特
那我们先把 underwear 参数从构造函数中 移除，构造函数只接收 sex 参数*/
var Model = function( sex ){ 
    this.sex = sex;
};
Model.prototype.takePhoto = function(){
    console.log( 'sex= ' + this.sex + ' underwear=' + this.underwear);
};
/*分别创建一个男模特对象和一个女模特对象*/
var maleModel = new Model( 'male' ), 
    femaleModel = new Model( 'female' );
/*给男模特依次穿上所有的男装，并进行拍照*/
for ( var i = 1; i <= 50; i++ ){ 
    maleModel.underwear = 'underwear' + i; 
    maleModel.takePhoto();
};
/*给女模特依次穿上所有的女装，并进行拍照*/
for ( var j = 1; j <= 50; j++ ){ 
    femaleModel.underwear = 'underwear' + j; 
    femaleModel.takePhoto();
};
//只需要两个对象便完成了同样的功能

```
在程序中使用了大量的相似对象时，可以利用享元模式来优化，减少对象的数量。


### 桥接模式
> 桥接模式（Bridge）将抽象部分与它的实现部分分离，使它们都可以独立地变化。

``` js
class Color {
    constructor(name){
        this.name = name
    }
}
class Shape {
    constructor(name,color){
        this.name = name
        this.color = color 
    }
    draw(){
        console.log(`${this.color.name} ${this.name}`)
    }
}

//测试
let red = new Color('red')
let yellow = new Color('yellow')
let circle = new Shape('circle', red)
circle.draw() // red circle
let triangle = new Shape('triangle', yellow)
triangle.draw() // yellow triangle
```
有助于独立地管理各组成部分， 把抽象化与实现化解耦，提高可扩充性；但大量的类将导致开发成本的增加，同时在性能方面可能也会有所减少。



## 行为型

### 策略模式
> 定义一系列的算法，把它们一个个封装起来，并且使它们可以相互替换。

将算法的使用和算法的实现分离开来。一个基于策略模式的程序至少由两部分组成：
1. 第一个部分是一组策略类，策略类封装了具体的算法，并负责具体的计算过程。
2. 第二个部分是环境类Context，Context接受客户的请求，随后把请求委托给某一个策略类。要做到这点，说明Context中要维持对某个策略对象的引用

- 表单验证：
``` html
<html>
<head>
    <title>策略模式-校验表单</title>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
</head>
<body>
    <form id = "registerForm" method="post" action="http://xxxx.com/api/register">
        用户名：<input type="text" name="userName">
        密码：<input type="text" name="password">
        手机号码：<input type="text" name="phoneNumber">
        <button type="submit">提交</button>
    </form>
    <script type="text/javascript">
        // 策略对象
        const strategies = {
          isNoEmpty: function (value, errorMsg) {
            if (value === '') {
              return errorMsg;
            }
          },
          isNoSpace: function (value, errorMsg) {
            if (value.trim() === '') {
              return errorMsg;
            }
          },
          minLength: function (value, length, errorMsg) {
            if (value.trim().length < length) {
              return errorMsg;
            }
          },
          maxLength: function (value, length, errorMsg) {
            if (value.length > length) {
              return errorMsg;
            }
          },
          isMobile: function (value, errorMsg) {
            if (!/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[7]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test(value)) {
              return errorMsg;
            }                
          }
        }
        
        // 验证类
        class Validator {
          constructor() {
            this.cache = []
          }
          add(dom, rules) {
            for(let i = 0, rule; rule = rules[i++];) {
              let strategyAry = rule.strategy.split(':')
              let errorMsg = rule.errorMsg
              this.cache.push(() => {
                let strategy = strategyAry.shift()
                strategyAry.unshift(dom.value)
                strategyAry.push(errorMsg)
                return strategies[strategy].apply(dom, strategyAry)
              })
            }
          }
          start() {
            for(let i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
              let errorMsg = validatorFunc()
              if (errorMsg) {
                return errorMsg
              }
            }
          }
        }

        // 调用代码
        let registerForm = document.getElementById('registerForm')

        let validataFunc = function() {
          let validator = new Validator()
          validator.add(registerForm.userName, [{
            strategy: 'isNoEmpty',
            errorMsg: '用户名不可为空'
          }, {
            strategy: 'isNoSpace',
            errorMsg: '不允许以空白字符命名'
          }, {
            strategy: 'minLength:2',
            errorMsg: '用户名长度不能小于2位'
          }])
          validator.add(registerForm.password, [ {
            strategy: 'minLength:6',
            errorMsg: '密码长度不能小于6位'
          }])
          validator.add(registerForm.phoneNumber, [{
            strategy: 'isMobile',
            errorMsg: '请输入正确的手机号码格式'
          }])
          return validator.start()
        }

        registerForm.onsubmit = function() {
          let errorMsg = validataFunc()
          if (errorMsg) {
            alert(errorMsg)
            return false
          }
        }
    </script>
</body>
</html>

```

再来一个权限校验的例子：
> 同时满足：是掘金用户、掘金等级小于1级、职业是前端开发、是吃瓜群众，先看看常规写法：
``` js
function checkAuth(data) {
  if (data.role !== 'juejin') {
    console.log('不是掘金用户');
    return false;
  }
  if (data.grade < 1) {
    console.log('掘金等级小于 1 级');
    return false;
  }
  if (data.job !== 'FE') {
    console.log('不是前端开发');
    return false;
  }
  if (data.type !== 'eat melons') {
    console.log('不是吃瓜群众');
    return false;
  }
}
```
这样写`checkAuth`函数会爆炸，策略项无法复用；接下来用策略模式改写：
``` js
// 维护权限列表
const jobList = ['FE', 'BE'];

// 策略
var strategies = {
  checkRole: function(value) {
    return value === 'juejin';
  },
  checkGrade: function(value) {
    return value >= 1;
  },
  checkJob: function(value) {
    return jobList.indexOf(value) > 1;
  },
  checkEatType: function(value) {
    return value === 'eat melons';
  }
};


// 校验规则
var Validator = function() {
  this.cache = [];

  // 添加策略事件
  this.add = function(value, method) {
    this.cache.push(function() {
      return strategies[method](value);
    });
  };

  // 检查
  this.check = function() {
    for (let i = 0; i < this.cache.length; i++) {
      let valiFn = this.cache[i];
      var data = valiFn(); // 开始检查
      if (!data) {
        return false;
      }
    }
    return true;
  };
};


// 使用
var compose1 = function() {
  var validator = new Validator();
  const data1 = {
    role: 'juejin',
    grade: 3
  };
  validator.add(data1.role, 'checkRole');
  validator.add(data1.grade, 'checkGrade');
  const result = validator.check();
  return result;
};


```
> 这比一直疯狂写 if-else 好太多了吧~

如果在一个系统里面有许多类，它们之间的区别仅在于它们的'行为'，那么使用策略模式可以动态地让一个对象在许多行为中选择一种行为。

利用组合、委托、多态等技术和思想，可以有效的避免多重条件选择语句。但往往策略集会比较多，我们需要事先就了解定义好所有的情况。



### 迭代器模式
> 迭代器模式是指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。迭代器模式可以把迭代的过程从业务逻辑中分离出来,在使用迭代器模式之后，即使不关心对象的内部构造，也可以按顺序访问其中的每个元素。

- JS中数组的map forEach 已经内置了迭代器，这里简单封装下，兼容下对象类型：
``` js
function each(obj, cb) {
    var value;

    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; ++i) {
            value = cb.call(obj[i], i, obj[i]);

            if (value === false) {
                break;
            }
        }
    } else {
        for (var i in obj) {
            value = cb.call(obj[i], i, obj[i]);

            if (value === false) {
                break;
            }
        }
    }
}

each([1, 2, 3], function(index, value) {
    console.log(index, value);
});

each({a: 1, b: 2}, function(index, value) {
    console.log(index, value);
});

// 0 1
// 1 2
// 2 3

// a 1
// b 2
```

- 创建一个简单的迭代器：
``` js
class Iterator {
    constructor(conatiner) {
        this.list = conatiner.list
        this.index = 0
    }
    next() {
        if (this.hasNext()) {
            return this.list[this.index++]
        }
        return null
    }
    hasNext() {
        if (this.index >= this.list.length) {
            return false
        }
        return true
    }
}

class Container {
    constructor(list) {
        this.list = list
    }
    getIterator() {
        return new Iterator(this)
    }
}

// 测试代码
let container = new Container([1, 2, 3, 4, 5])
let iterator = container.getIterator()
while(iterator.hasNext()) {
  console.log(iterator.next())
}

```
JavaScript中的有序数据集合包括：`Array、Map、Set、String、typeArray、arguments、NodeList`，以上有序数据集合都部署了`Symbol.iterator`属性，属性值为一个函数，执行这个函数，返回一个迭代器，迭代器部署了`next`方法，调用迭代器的`next`方法可以按顺序访问子元素：
``` js
var arr = [1, 2, 3, 4]

var iterator = arr[Symbol.iterator]()

console.log(iterator.next())  // {value: 1, done: false}
console.log(iterator.next())  // {value: 2, done: false}
console.log(iterator.next())  // {value: 3, done: false}
console.log(iterator.next())  // {value: 4, done: false}
console.log(iterator.next())  // {value: undefined, done: true}
```
> 任何部署了[Symbol.iterator]接口的数据都可以使用`for...of`循环遍历~



### 发布-订阅模式
也称作**观察者模式**，定义了对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。

发布-订阅是一种消息范式，消息的发布者，不会将消息直接发送给特定的订阅者，而是通过消息通道广播出去，然后呢，订阅者通过订阅获取到想要的消息。

``` js
// 主题 保存状态，状态变化之后触发所有观察者对象
class Subject {
  constructor() {
    this.state = 0
    this.observers = []
  }
  getState() {
    return this.state
  }
  setState(state) {
    this.state = state
    this.notifyAllObservers()
  }
  notifyAllObservers() {
    this.observers.forEach(observer => {
      observer.update()
    })
  }
  attach(observer) {
    this.observers.push(observer)
  }
}

// 观察者
class Observer {
  constructor(name, subject) {
    this.name = name
    this.subject = subject
    this.subject.attach(this)
  }
  update() {
    console.log(`${this.name} update, state: ${this.subject.getState()}`)
  }
}

// 测试
let s = new Subject()
let o1 = new Observer('o1', s)
let o2 = new Observer('02', s)

s.setState(12)

```

- 再来一个例子：
``` js
let corp = {};
// 这次换成一个对象类型的缓存列表
corp.list = {};

corp.on = function(key, fn) {
    // 如果对象中没有对应的key值
    // 也就是说明没有订阅过
    // 那就给key创建个缓存列表
    if (!this.list[key]) {
        this.list[key] = [];
    }
    // 把函数添加到对应key的缓存列表里
    this.list[key].push(fn);
};
corp.emit = function() {
    // 第一个参数是对应的key值
    // 直接用数组的shift方法取出
    let key = [].shift.call(arguments),
        fns = this.list[key];
    // 如果缓存列表里没有函数就返回false
    if (!fns || fns.length === 0) {
        return false;
    }
    // 遍历key值对应的缓存列表
    // 依次执行函数的方法
    fns.forEach(fn => {
        fn.apply(this, arguments);
    });
};

// 测试用例
corp.on('join', (position, salary) => {
    console.log('你的职位是：' + position);
    console.log('期望薪水：' + salary);
});
corp.on('other', (skill, hobby) => {
    console.log('你的技能有： ' + skill);
    console.log('爱好： ' + hobby);
});

corp.emit('join', '前端', 10000);
corp.emit('join', '后端', 10000);
corp.emit('other', '端茶和倒水', '足球');
/*
    你的职位是：前端
    期望薪水：10000
    你的职位是：后端
    期望薪水：10000
    你的技能有： 端茶和倒水
    爱好： 足球
*/

```


**小结**
- 支持简单的广播通信，自动通知所有已经订阅过的对象
- 目标对象与观察者之间的抽象耦合关系能单独扩展以及重用，增加了灵活性
- 观察者模式所做的工作就是在解耦，让耦合的双方都依赖于抽象，而不是依赖于具体。从而使得各自的变化都不会影响到另一边的变化。
- 但当过多的使用发布订阅模式，如果订阅消息始终都没有触发，则订阅者一直保存在内存中。


### 命令模式
用一种松耦合的方式来设计程序，使得请求发送者和请求接收者能够消除彼此之间的耦合关系；命令（command）指的是一个执行某些特定事情的指令。
> 有时候需要向某些对象发送请求，但是并不知道请求的接收者是谁，也不知道被请求的操作是什么。此时希望用一种松耦合的方式来设计程序，使得请求发送者和请求接收者能够消除彼此之间的耦合关系。

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>cmd-demo</title>
</head>
<body>
    <div>
        <button id="btn1">按钮1</button>
        <button id="btn2">按钮2</button>
        <button id="btn3">按钮3</button>
    </div>
    <script>
        var btn1 = document.getElementById('btn1')
        var btn2 = document.getElementById('btn2')
        var btn3 = document.getElementById('btn3')

        // 定义一个命令发布者(执行者)的类
        class Executor {
            setCommand(btn, command) {
                btn.onclick = function() {
                    command.execute()
                }
            }
        }

        // 定义一个命令接收者
        class Menu {
            refresh() {
                console.log('刷新菜单')
            }

            addSubMenu() {
                console.log('增加子菜单')
            }
        }

        // 定义一个刷新菜单的命令对象的类
        class RefreshMenu {
            constructor(receiver) {
                // 命令对象与接收者关联
                this.receiver = receiver
            }

            // 暴露出统一的接口给命令发布者Executor
            execute() {
                this.receiver.refresh()
            }
        }

        // 定义一个增加子菜单的命令对象的类
        class AddSubMenu {
            constructor(receiver) {
                // 命令对象与接收者关联
                this.receiver = receiver
            }
            // 暴露出统一的接口给命令发布者Executor
            execute() {
                this.receiver.addSubMenu()
            }
        }

        var menu = new Menu()
        var executor = new Executor()

        var refreshMenu = new RefreshMenu(menu)
        // 给按钮1添加刷新功能
        executor.setCommand(btn1, refreshMenu)

        var addSubMenu = new AddSubMenu(menu)
        // 给按钮2添加增加子菜单功能
        executor.setCommand(btn2, addSubMenu)

        // 如果想给按钮3增加删除菜单的功能，就继续增加删除菜单的命令对象和接收者的具体删除方法，而不必修改命令对象
    </script>
</body>
</html>
```


### 状态模式
允许一个对象在其内部状态改变的时候改变它的行为，对象看起来似乎修改了它的类。

``` js
// 状态 （弱光、强光、关灯）
class State {
    constructor(state) {
        this.state = state
    }
    handle(context) {
        console.log(`this is ${this.state} light`)
        context.setState(this)
    }
}
class Context {
    constructor() {
        this.state = null
    }
    getState() {
        return this.state
    }
    setState(state) {
        this.state = state
    }
}
// test 
let context = new Context()
let weak = new State('weak')
let strong = new State('strong')
let off = new State('off')

// 弱光
weak.handle(context)
console.log(context.getState())

// 强光
strong.handle(context)
console.log(context.getState())

// 关闭
off.handle(context)
console.log(context.getState())

```
> 状态模式的关键是把事物的每种状态都封装成单独的类，跟此种状态有关的行为都被封装在这个类的内部，所以 button 被按下的的时候，只需要在上下文中，把这个请求委托给当前的状态对象即可，该状态对象会负责渲染它自身的行为。


### 职责链模式
避免请求发送者与接收者耦合在一起，让多个对象都有可能接收请求，将这些对象连接成一条链，并且沿着这条链传递请求，直到有对象处理它为止。
> 职责链模式的名字非常形象，一系列可能会处理请求的对象被连接成一条链，请求在这些对象之间依次传递，直到遇到一个可以处理它的对象，我们把这些对象称为链中的节点。

项目开发中经常遇到多流程操作，比如A执行完才执行B，B执行再执行C...，这里可以用到职责链模式：
``` js
// 定义链的某一项
function ChainItem(fn) {
    this.fn = fn;
    this.next = null;
}

ChainItem.prototype = {
    constructor: ChainItem,
    
    // 设置下一项
    setNext: function(next) {
        this.next = next;
        return next;
    },
    
    // 开始执行
    start: function() {
        this.fn.apply(this, arguments);
    },
    
    // 转到链的下一项执行
    toNext: function() {
        if (this.next) {
            this.start.apply(this.next, arguments);
        } else {
            console.log('无匹配的执行项目');
        }
    }
};

// 展示数字
function showNumber(num) {
    if (typeof num === 'number') {
        console.log('number', num);
    } else {
        // 转移到下一项
        this.toNext(num);
    }
}

// 展示字符串
function showString(str) {
    if (typeof str === 'string') {
        console.log('string', str);
    } else {
        this.toNext(str);
    }
}

// 展示对象
function showObject(obj) {
    if (typeof obj === 'object') {
        console.log('object', obj);
    } else {
        this.toNext(obj);
    }
}

var chainNumber = new ChainItem(showNumber);
var chainString = new ChainItem(showString);
var chainObject = new ChainItem(showObject);

// 设置链条，流程：判断是否为对象、判断是否为数字、判断是否字符串
chainObject.setNext(chainNumber).setNext(chainString);

chainString.start('12'); // string 12
chainNumber.start({}); // 无匹配的执行项目
chainObject.start({}); // object {}
chainObject.start(123); // number 123
```
当你负责的模块，基本满足以下情况时，可用使用职责链模式：
- 你负责的是一个完整流程，或你只负责流程中的某个环节
- 各环节可复用
- 各环节有一定的执行顺序
- 各环节可重组


### 中介者模式
所有的相关对象都通过中介者对象来通信，而不是互相引用，所以当一个对象发生改变时，只需要通知中介者对象即可；使网状的多对多关系变成了相对简单的一对多关系（复杂的调度处理都交给中介者）。

``` js
var A = {
    score: 10,

    changeTo: function(score) {
        this.score = score;

        // 自己获取
        this.getRank();
    },
    
    // 直接获取
    getRank: function() {
        var scores = [this.score, B.score, C.score].sort(function(a, b) {
            return a < b;
        });

        console.log(scores.indexOf(this.score) + 1);
    }
};

var B = {
    score: 20,

    changeTo: function(score) {
        this.score = score;

        // 通过中介者获取
        rankMediator(B);
    }
};

var C = {
    score: 30,

    changeTo: function(score) {
        this.score = score;

        rankMediator(C);
    }
};

// 中介者，计算排名
function rankMediator(person) {
    var scores = [A.score, B.score, C.score].sort(function(a, b) {
        return a < b;
    });

    console.log(scores.indexOf(person.score) + 1);
}

// A通过自身来处理
A.changeTo(100); // 1

// B和C交由中介者处理
B.changeTo(200); // 1
C.changeTo(50); // 3
```
ABC三个人分数改变后想要知道自己的排名，在A中自己处理，而B和C使用了中介者。B和C将更为轻松，整体代码也更简洁。

最后，虽然中介者做到了对模块和对象的解耦，但有时对象之间的关系并非一定要解耦，强行使用中介者来整合，可能会使代码更为繁琐，需要注意。



### 模板方法模式
> 模板方法模式是一种只需使用继承就可以实现的非常简单的模式。模板方法模式由两部分结构组成，第一部分是抽象父类，第二部分是具体的实现子类。通常在抽象父类中封装了子类的算法框架，包括实现一些公共方法以及封装子类中所有方法的执行顺序。子类通过继承这个抽象类，也继承了整个算法结构，并且可以选择重写父类的方法。

- 以泡一杯咖啡的流程为例子：
``` js
class Beverage {
    constructor({brewDrink, addCondiment}) {
        this.brewDrink = brewDrink
        this.addCondiment = addCondiment
    }
    /* 烧开水，共用方法 */
    boilWater() { console.log('水已经煮沸=== 共用') }
    /* 倒杯子里，共用方法 */
    pourCup() { console.log('倒进杯子里===共用') }
    /* 模板方法 */
    init() {
        this.boilWater()
        this.brewDrink()
        this.pourCup()
        this.addCondiment()
    }
}
/* 咖啡 */
const coffee = new Beverage({
     /* 冲泡咖啡，覆盖抽象方法 */
     brewDrink: function() { console.log('冲泡咖啡') },
     /* 加调味品，覆盖抽象方法 */
     addCondiment: function() { console.log('加点奶和糖') }
})
coffee.init() 

```
一次性实现一个算法的不变的部分，并将可变的行为留给子类来实现；子类中公共的行为应被提取出来并集中到一个公共父类中的避免代码重复。







## 参考

- [JavaScript设计模式与开发实践](https://book.douban.com/subject/26382780)
- [JavaScript中常用的设计模式](https://segmentfault.com/a/1190000017787537)
- [前端渣渣唠嗑一下前端中的设计模式（真实场景例子](https://juejin.cn/post/6844904138707337229)
- [JavaScript中常见的十五种设计模式](https://www.cnblogs.com/imwtr/p/9451129.html)
- [《JavaScript设计模式与开发实践》最全知识点汇总大全](https://juejin.cn/post/6844903751870840839)
- [JavaScript设计模式es6（23种)](https://juejin.cn/post/6844904032826294286)



<fix-link label="Back" href="/frontend/js/depth.html"></fix-link>


<!-- 2021-08-22 -->