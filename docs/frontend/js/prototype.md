


# js的原型与原型链
这里是我的js的原型与原型链学习笔记。


## 创建对象
在开始原型之前，先简单梳理下创建对象有哪些模式。

### 工厂模式
> 工厂模式是软件工程领域一种广为人知的设计模式，这种模式抽象了创建具体对象的过程。具体实现是创建一个函数，用函数来封装以特定接口创建对象的细节。
```js
function createPerson(name, age, job){
    var o = new Object(); // 创建一个空对象
    o.name = name;
    o.age = age;
    o.job = job;
    o.sayName = function(){
        alert(this.name);
    };
    return o; // 返回对象
}
var person1 = createPerson("tom", 29, "fe");
```
函数`createPerson()`能够根据接受的参数来构建一个包含所有必要信息的`Person`对象。可以无数次地调用这个函数，而每次它都会返回一个包含三个属性一个方法的对象。工厂模式虽然解决了创建多个相似对象的问题，但却没有解决对象识别的问题(即怎样知道一个对象的类型)。

### 构造函数模式
> 跟`Array、Object`这种原生构造函数类似，可以创建自定义的构造函数，从而定义自己的属性和方法。
```js
function Person(name, age, job){
    this.name = name;
    this.age = age;
    this.job = job;
    this.sayName = function(){
        alert(this.name);
    }; 
}
var person1 = new Person("tom", 29, "fe");
```
构造函数始终都应该以一个大写字母开头，构造函数与其他函数的唯一区别，就在于调用它们的方式不同。
::: tip 要创建 Person 的新实例，必须使用 new 操作符：
1. 创建一个新对象;
2. 将构造函数的作用域赋给新对象(因此 this 就指向了这个新对象);
3. 执行构造函数中的代码(为这个新对象添加属性);
4. 返回新对象。
:::
任何函数，只要通过`new`操作符来调用，那它就可以作为构造函数。

使用构造函数的主要问题，就是**每个方法都要在每个实例上重新创建一遍**。


### 原型模式
> 我们创建的每个函数都有一个`prototype(原型)`属性，这个属性是一个指针，指向一个对象，而这个对象的用途是**包含可以由特定类型的所有实例共享的属性和方法**。

如果按照字面意思来理解，那么`prototype`就是通过调用构造函数而创建的那个对象实例的原型对象。使用原型对象的好处是**可以让所有对象实例共享它所包含的属性和方法**。换句话说，不必在构造函数中定义对象实例的信息，而是可以将这些信息直接添加到原型对象中。

接下来，进入正题，梳理下什么是原型~

## 原型

### prototype
> 原型的定义上面已经讲过了，不再赘述。

无论什么时候，只要创建了一个新函数，就会根据一组特定的规则为该函数创建一个 prototype 属性，这个属性指向函数的原型对象。

先看个例子：
```js
// 构造函数
function Person() {

}
// 构造函数Person有prototype属性，是一个对象，现在给prototype添加name属性
Person.prototype.name = 'tom';
var person1 = new Person(); // 生成实例person1
var person2 = new Person(); // 生成实例person2
console.log(person1.name) // tom；person1实例可以访问其构造函数prototype属性上的name
console.log(person2.name) // tom；person2也能访问
```
每一个JavaScript对象(null除外)在创建的时候就会关联另一个对象，这个对象就是我们所说的原型`prototype`，每一个对象都会从原型"继承"属性。即：**实例原型 = 构造函数的prototype属性**

使用原型对象的好处是**可以让所有对象实例共享它所包含的属性和方法**。


### `__proto__`
> 当调用构造函数创建一个新实例后，该实例的内部将包含一个指针，指向构造函数的原型对象。

这个指针是一个内部属性，在脚本中没有标准的方式访问，但Firefox、Safari 和 Chrome 在每个对象上都支持一个属性`__proto__`；而在其他实现中，这个属性对脚本则是完全不可见的。（下文中统一用`__proto__`来指代这类指针）
```js
function Person() {

}
var person = new Person();
console.log(person.__proto__ === Person.prototype);
```
要明确的真正重要的一点就是，这个连接存在于实例与构造函数的原型对象之间，而不是存在于实例与构造函数之间。

`Person` 的实例`person`包含一个内部属性`__proto__`，该属性仅仅指向了`Person.prototype`，它与构造函数没有直接的关系。

- `__proto__` vs `prototype`:
<div>
    <img class="zoom-custom-imgs" :src="$withBase('/images/js/proto.png')" width="48%"/>
    <img class="zoom-custom-imgs" :src="$withBase('/images/js/prototype.png')" width="48%"/>
</div>

### constructor
> 在默认情况下，所有原型对象都会自动获得一个`constructor(构造函数)`属性，这个属性包含一个指向`prototype`属性所在函数的指针。
```js
function Person() {

}
var person = new Person();
console.log(Person === Person.prototype.constructor); //true
```
创建了自定义的构造函数之后，其原型对象默认只会取得`constructor`属性；至于其他方法，则都是从`Object`继承而来的。
<img class="zoom-custom-imgs" :src="$withBase('/images/js/constructor.png')" width="auto"/>

### 构造函数、原型和实例的关系
简单回顾一下构造函数、原型和实例的关系:
> **每个构造函数都有一个原型对象(prototype)，原型对象都包含一个指向构造函数的指针(construtor)，而实例都包含一个指向原型对象的内部指针(`__proto__`)**。
```js
// 构造函数
function Person() {
}
// 生成实例
var person = new Person();

console.log(person.__proto__ == Person.prototype) // true
console.log(Person.prototype.constructor == Person) // true
console.log(person.constructor === Person); // true
// 虽然无法访问到实例指向原型对象的指针，但可以通过getPrototypeOf()方法来确定对象之间是否存在这种关系
// ECMAScript 5新增加的一个新方法：Object.getPrototypeOf()，这个方法返回对象的原型。
console.log(Object.getPrototypeOf(person) === Person.prototype) //true
```
原型对象是通过Object构造函数生成的，当读取实例的属性时，如果找不到，就会查找与对象关联的原型中的属性，如果还查不到，就去找原型的原型，一直找到最顶层为止。

三者关系如图：

<img class="zoom-custom-imgs" :src="$withBase('/images/js/js_prototype.png')" width="auto"/>

Object.prototype的原型为null，所以查到Object.prototype就可以停止查找了。
```js
let proto = Object.getPrototypeOf({}); // 获取{}指向Object.prototype的指针
console.log(proto === Object.prototype); // true
// 继续往上找，直到找到最顶层，null
console.log(Object.prototype.__proto__) // null
console.log(Object.getPrototypeOf(proto)); // null
```



### 一些方法

#### `hasOwnProperty()`和 `in`操作符
> 当为对象实例添加一个属性时，这个属性就会屏蔽原型对象中保存的同名属性。换句话说，添加这个属性只会阻止我们访问原型中的那个属性，但不会修改那个属性。使用`delete`操作符则可以完全删除实例属性，从而让我们能够重新访问原型中的属性。



使用`hasOwnProperty()`方法可以**检测一个属性是存在于实例中，还是存在于原型中**。这个方法是从`Object`继承来的。

`in`操作符会在通过对象能够访问给定属性时返回`true`，**无论该属性存在于实例中还是原型中**。

```js
function Person() {
}
Person.prototype.name = "tom";
var person = new Person();
console.log(person.hasOwnProperty("name")); // false
console.log(("name" in person)); // true
person.name = "rose";
console.log(person.hasOwnProperty("name")); // true
console.log(("name" in person)); // true
delete person.name;
console.log(person.hasOwnProperty("name")); // false
console.log(("name" in person)); // true
```
可以结合`hasOwnProperty`和`in`操作符封装一个方法：判断属性是否存在于原型中的。
```js
function hasPrototypeProperty(object, name){
        return !object.hasOwnProperty(name) && (name in object);
}
```

#### 确定原型和实例的关系
1. 使用`instanceof`操作符
```js
console.log({} instanceof Object); // true
console.log([] instanceof Array); // true
```
2. 使用`isPrototypeOf()`方法
```js
console.log(Object.prototype.isPrototypeOf({})); // true
console.log(Array.prototype.isPrototypeOf([])); // true
```

#### 重写原型对象
前面例子中每添加一个属性和方法就要敲一遍`Person.prototype`，其实可以用一个包含所有属性和方法的对象字面量来重写整个原型对象：
```js
function Person(){
}
// 重新原型对象
Person.prototype = {
    name : "tom",
    age : 29,
    job: "fe",
    sayName : function () {
        alert(this.name);
    }
};

var friend = new Person();
console.log(friend.constructor == Person); // false
console.log(friend.constructor == Object); // true
```
注意，这样写了之后：**`constructor`属性不再指向`Person`**。因为这里完全重写了默认的`prototype`对象，因此 `constructor`属性也就指向`Object`构造函数，不再指向`Person`函数。

> 还有个问题是：调用构造函数时会为实例添加一个指向最初原型的`__proto__`指针，而把原型修改为另外一个对象就等于切断了构造函数与最初原型之间的联系。
```js
function Person(){
}
Person.prototype.name = "tom";
// 先生成实例
var friend = new Person();
// 再重写prototype
Person.prototype = {
    constructor: Person, // 确保constructor能指向Person
    name : "rose",
    age: 20
};
console.log(friend.constructor == Person); // true
console.log(friend.name, friend.age); // tom undefined
```
重写原型对象切断了现有原型与任何之前已经存在的对象实例之间的联系；它们引用的仍然是最初的原型。


### 模式

#### 构造函数模式和原型模式
> **构造函数模式用于定义实例属性，而原型模式用于定义方法和共享的属性**。每个实例都会有自己的一份实例属性的副本， 但同时又共享着对方法的引用，最大限度地节省了内存。
```js
function Person(name, age, job){
    // 构造函数模式：定义实例属性
    this.name = name; 
    this.age = age;
    this.job = job;
    this.friends = ["rose", "jack"];
  }
//  原型模式：定义方法和共享的属性
Person.prototype = {
    constructor : Person,
    getFriends : function(){
        console.log(this.friends);
    }
}
var person1 = new Person("tom", 29, "fe");
var person2 = new Person("zhangsan", 27, "pm");
person1.friends.push("xiaoming");
console.log(person1.getFriends()); // ["rose", "jack", "xiaoming"]
console.log(person2.getFriends()); // ["rose", "jack"]
```
这种构造函数与原型混成的模式，是目前使用度最广泛、认同度最高的创建自定义类型的方法。

#### 寄生构造函数模式
> 这种模式的基本思想是创建一个函数，该函数的作用仅仅是封装创建对象的代码，然后再返回新创建的对象。

除了使用`new`操作符并把使用的包装函数叫做构造函数之外，这个模式跟工厂模式其实是一模一样的；但从表面上看，这个函数又很像是典型的构造函数。

这个模式可以在特殊的情况下用来为对象创建构造函数。假设我们想创建一个具有额外方法的特殊数组。由于不能直接修改`Array`构造函数，因此可以使用这个模式：
```js
function SpecialArray(){
    // 创建数组
    var values = new Array();
    // 添加值
    values.push.apply(values, arguments);
    // 添加方法
    values.toPipedString = function(){
        return this.join("|");
    };
    //返回数组
    return values;
}
var colors = new SpecialArray("red", "blue", "green");
console.log(colors.toPipedString()); // red|blue|green
console.log(colors instanceof SpecialArray) // false
```
关于寄生构造函数模式，有一点需要说明：返回的对象与构造函数或者与构造函数的原型属性之间没有关系。为此，不能依赖`instanceof`操作符来确定对象类型。由于存在上述问题，建议在可以使用其他模式的情况下，不要使用这种模式。





## 原型链

### 什么是原型链
> 前面已经梳理了原型中`prototype、__proto__、constructor`三者的关系，现在假设一种情况：**让原型对象等于另一个构造函数的实例**，结果会怎么样呢？显然，此时的原型对象将包含一个指向另一个原型的指针，相应地，另一个原型中也包含着一个指向另一个构造函数的指针。

> 假如另一个原型又是另一个类型的实例，那么上述关系依然成立，如此层层递进，就构成了实例与原型的链条。这就是所谓**原型链**的基本概念。

先看个例子：
```js
// 定义构造函数SuperType
function SuperType(){
    this.property = true;
}
// 给SuperType的原型对象添加方法
SuperType.prototype.getSuperValue = function(){
    return this.property;
};

// 定义另一个构造函数SubType
function SubType(){
    this.subproperty = false;
}

// 让SubType的原型对象等于另一个构造函数SuperType的实例
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function (){
    return this.subproperty;
};
var instance = new SubType(); // 生成 SubType
console.log(instance.getSuperValue()); // true
```
每个类型分别有一个属性和一个方法。它们的主要区别是`SubType`继承了`SuperType`，而**继承是通过创建`SuperType`的实例，并将该实例赋给`SubType.prototype`实现的**。实现的本质是重写原型对象，代之以一个新类型的实例。

> 换句话说，原来存在于`SuperType`的实例中的所有属性和方法，现在也存在于`SubType.prototype`中了。在确立了继承关系之后，我们给`SubType.prototype`添加了一个方法，这样就在继承了`SuperType`的属性和方法的基础上又添加了一个新方法。

> 在上面的代码中，我们没有使用`SubType`默认提供的原型，而是给它换了一个新原型；这个新原型就是`SuperType`的实例。于是，新原型不仅具有作为一个`SuperType`的实例所拥有的全部属性和方法，而且其内部还有一个指针，指向了 `SuperType`的原型。最终结果就是这样的：**`instance`指向`SubType`的原型，`SubType`的原型又指向`SuperType`的原型**。

::: tip 在通过原型链实现继承的情况下，搜索过程就得以沿着原型链继续向上。就拿上面的例子来说，调用 instance.getSuperValue()会经历三个搜索步骤：
1. 搜索实例
2. 搜索 SubType.prototype
3. 搜索 SuperType.prototype

最后一步才会找到该方法。在找不到属性或方法的情况下，搜索过程总是要一环一环地前行到原型链末端才会停下来。
:::

### 总结
- JavaScript主要通过原型链实现继承。原型链的构建是通过将一个类型的实例赋值给另一个构造函数的原型实现的。
- 所有引用类型默认都继承了`Object`，而这个继承也是通过原型链实现的。
- 所有函数的默认原型都是`Object`的实例，因此默认原型都会包含一个内部指针，指向`Object.prototype`；这也正是所有自定义类型都会继承`toString()、 valueOf()`等默认方法的根本原因。
- **所有的实例都是一个对象，但所有的对象不一定都是实例**。如果是的话，`Object.prototype`就应该指向一个实例而不是`null`了。
- 原型链虽然很强大，可以用它来实现继承，但它也存在一个主要的问题就是：**包含引用类型值的原型属性会被所有实例共享**。

可以用一张图来表示原型链：

<img class="zoom-custom-imgs" :src="$withBase('/images/js/prototype_lian.png')" width="auto"/>

所有的原型对象都可以沿着原型链一直往上寻找，直到找到最后的原型对象`Object.prototype`，然后`Object.prototype`再往上寻找就是`null`，用来表示此处没有对象，停止寻找。

由于构造函数也是对象，所以它同样具有构造函数和原型。自定义的构造函数同样需要借助`__proto__`找到原型，进而找到创建自己的构造函数——即原生构造函数`Function`，但请注意：**原生的构造函数Function的`__proto__`是指向了`Function.prototype`**。
```js
console.log(Function.prototype === Function.__proto__); // true
```
### 思考
1. 为什么`Function.prototype === Function.__proto__`呢？

首先，基本上所有的构造函数都是`Function`的一个实例，这个是没有异议的，所以：
```js
console.log(Object.__proto__ === Function.prototype); // true
```
那么，`Function`构造函数的`prototype`属性和`__proto__`属性都指向同一个原型，是否可以说`Function`对象是由`Function`构造函数创建的一个实例？

对于这个问题的答案，至今都是玄学，可以暂且这么解释，有兴趣的可以下来研究下。




## 备注
1. 有时间再研究下js的继承方式~

## 参考
1. [JavaScript高级程序设计-第3版](https://book.douban.com/subject/10546125/)
2. [JavaScript深入之从原型到原型链](https://github.com/mqyqingfeng/Blog/issues/2)
3. [JavaScript走进原型链](https://juejin.cn/post/6949814782862032909)
4. [从探究Function.__proto__===Function.prototype过程中的一些收获](https://github.com/jawil/blog/issues/13)


<fix-link label="Back" href="/frontend/js/depth.html"></fix-link>


<!-- 2021-04-17 -->


