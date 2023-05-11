---
title: Typescript入门笔记
date: 2022-06-25 22:44:45
# permalink: false # a87881/
# article: false
categories: 
  - Typescript
tags: 
  - Typescript
permalink: false # 3b991a/
---

# Typescript入门笔记
> 以下是我的Ts入门学习笔记~


- [TypeScript中文手册](https://typescript.bootcss.com/)
- [TypeScript中文文档](https://www.tslang.cn/docs/home.html)


## 初体验

### 新建项目

- `npm install -g typescript`

- `mkdir typescript-demo`

- `mkdir demo01.ts`,  编写代码
``` ts
function test() {
    let web: string = "hello world"
    return web;
}

console.log(test());
```
> 直接`node demo01.ts` 会报错，需要先转成demo01js，才能执行

- `tsc demo01.ts`
> 将 demo01.ts 转换成 js 文件

- `node demo01.js`, 输出结果

- `npm install -g ts-node`
> 也可以安装 ts-node

- 根目录下新建 `tsconfig.json`
> 不然直接执行 `ts-node` 会报错

- 执行：`ts-node demo01.ts`


### tsconfig.json
> ts文件编译配置

- 自动生成：`tsc -init`
- `tsc`: 自动将ts文件编译为js

``` json
{
    "compilerOptions": {
        "strict": true, // 严格按照ts的规范
        "noImplicitAny": true, // 允许注解类型 any 不用特意标明
        "strictNullChecks": true, // 对 null 进行校验

        "removeComments": true, // 将ts编译为js时，移除注释

        "rootDir": "./src", // 入口文件
        "outDir": "./build", // 打包文件
        "sourceMap": true, // 会生成map文件，保存位置信息
        "noUnusedLocals": true, // 编译的时候会把没有用的方法清除掉

    },
    "include": ["demo01.ts"], // 需要编译的文件，不然默认编译全部ts文件
    "exclude": [], // 不包含
    
}
```

[详细配置参考](https://www.tslang.cn/docs/handbook/compiler-options.html)


## 入门


### demo01
``` ts
// 静态类型: 声明之后不能改变类型
// 定义了为数字类型
let count : number = 1;
// count = 'ddd'; // 会报错
count = 2;

console.log('====count', count);


// 自定义静态类型：接口方式
interface Person {
    name: string,
    age: number
}

// 使用自定义的静态类型
let tom: Person = {
    name: 'tom',
    age: 18
}

console.log('====tom', tom);
// tom.age = '354'; // 报错
tom.age = 28;
console.log('====tom', tom);

```

### demo02
``` ts
// 基础静态类型: number,string,null,symbol,undifined,null,viod,boolean
let count: number = 1;



/**
 * 对象静态类型
 */
// 1.普通对象类型
const person: {
    name: string,
    age: number
} = {
    name: 'tom',
    age: 18
}

// 2.数组对象类型
const stringArr: string [] = ['a', 'b', 'c']; // 每一项都必须是字符串
const numberArr: number [] = [1, 2, 3];
const arr: (string | number)[] = [1, 'a', 3];
// 元组
const arr1: [number, string, number] = [1, 'b', 3];


// 3.类
class Person{};
const tom: Person = new Person();

class Lady {
    name: string;
    age: number;
}
const ladyArr: Lady [] = [
    {name: 'a', age: 3},
    {name: 'b', age: 4}
]



// 4.函数
// 必须返回字符串
const jack: () => string = () => {return '22'};

console.log('====person', person);

```



### demo03
``` ts
// 函数参数和返回类型注解

function getTotal(a: number, b: number): number {
    // return a + b + ''; // 报错
    return a + b;
}

const total = getTotal(1,2);


// viod 是 无 的意思，即没有返回值，如果函数中有return 就会报错
function sayHello(): void {
    console.log('hello world');
    // return '';
}

// 
function nerver(): never {
    throw Error('');
    console.log('1234');
}


// 
function add({a, b}: {a:number, b: number}) {
    return a + b;
}
const num = add({a: 1, b: 3});
```

### demo04
``` ts
// 自定义接口
interface Model {
    name: string;
    age: number;
    height: number;
    weight ?: number; // 可选值
    [propname: string]: any; // 属性名称是字符串类型，值是任意类型
    say(): string; // say方法，必须有返回值，且返回值为字符号串
}



// 类
class girl implements Model {
    name="xiaoFang"
    age=12
    height=160
    say() {
        return 'my name is xiaofang'
    }
}

// 继承
interface Teacher extends Model {
    teach(): string; // 返回字符串
}


// 对象
const person = {
    name: 'rose',
    age: 20,
    height: 175,
    sex: '女',
    say() {
        return 'hello!!!';
    }
}




const getRes = (person: Model) => {
    person.age >= 18 && person.height >= 165 && console.log(person.name + '通过筛选');
    person.age < 18 || person.height < 165 && console.log(person.name + '被淘汰');

    person.weight && console.log(person.weight + '体重是：' + person.weight);
    person.sex && console.log(person.name + '性别是：' + person.sex);
}

getRes(person);

```


### demo05
``` ts

// 类
class Lady {
    content = 'hello~'
    sayHello() {
        return this.content
    }
}

// 继承
class Girl extends Lady {
    // 改写父类的sayHello方法，并用super实现继承
    sayHello() {
        return super.sayHello() + '你好~'
    }
    // 扩展
    sayHi() {
        return 'Hi~'
    }
}

const rose = new Girl();
console.log(rose.sayHello());
console.log(rose.sayHi());



// public private protected

class Person {
    // public 类的内部和外部都能访问
    public name: string
    // private 只能在类的内部进行访问
    private age: number
    // protected 只能在类的内部，和类的继承中使用
    protected weight: number = 140
    public sayHello(): string {
        return this.name + ' say hello'
    }
}


const person = new Person();
person.name = 'tom'
// person.age = 4; // 会报错：Property 'age' is private and only accessible within class 'Person'.
console.log(person.name);
console.log(person.sayHello());


class Boy extends Person {
    public sayWeight() {
        return this.weight;
    }
}
const boy = new Boy();
// boy.weight = 140 // 会报错： Property 'weight' is protected and only accessible within class 'Person' and its subclasses.
console.log(boy.sayWeight());
```

### demo06
``` ts
// 
// 父类
class Person {
    // 构造函数
    constructor(public name: string) {

    }
}


// 子类
class Boy extends Person {
    constructor(public age: number) {
        super('boy') // 调用父类的构造函数，必须传入name,不然会报错
    }
}

const boy = new Boy(18);
console.log(boy.name, boy.age);


class Lady {

    // readonly 只读属性
    public readonly gender: string = 'women';

    // private限制 _age 只能在类内部进行访问
    constructor(private _age: number) {

    }

    // 受保护的属性可以通过 get 方法进行访问
    get age() {
        return this._age
    }

    // set 方法
    set age(age: number) {
        this._age = age;
    }

    // static
    // 静态属性，可以不用实例化，直接 Lady.sayHello 就可以访问
    static sayHello() {
        console.log('===hello');
    }
}

const rose = new Lady(28);
// console.log(rose._age); // 会报错：Property '_age' is private and only accessible within class 'Lady'.
console.log(rose.age); // 28
rose.age = 30;
console.log(rose.age); // 30

Lady.sayHello(); //  ===hello



// 抽象类
// 抽象类做为其它派生类的基类使用。 它们一般不会直接被实例化。 
// 不同于接口，抽象类可以包含成员的实现细节。 abstract关键字是用于定义抽象类和在抽象类内部定义抽象方法。
// abstract class Coder {
//     abstract skill(): avoid // 抽象类中的抽象方法不包含具体实现并且必须在派生类中实现 
// }

// class FE extends Coder {
//     skill() {
//         console.log('i am good at fe');
//     }
// }

// class AR extends Coder {
//     skill() {
//         console.log('i am good at ar');
//     }
// }
```

### demo07
``` ts
// 联合类型 类型守护

class Dog {
    canFly: boolean
    run: () => {}
}

class Bird {
    canFly: boolean
    fly: () => {}
}

// 联合类型

// 1. 直接断言
function judgeAnimal(animal: Dog | Bird) {
    if (animal.canFly) {
        (animal as Bird).fly()
    } else {
        (animal as Dog).run()
    }
}

// 2. in
function judgeAnimalV2(animal: Dog | Bird) {
    if('fly' in animal) {
        animal.fly();
    } else {
        animal.run();
    }
}


// 3.
function add(first: string | number, second: string | number) {
    if (typeof first === 'string' || typeof second === 'string') {
        return `${first} ${second}`
    }

    return first + second;
}

// 4.类型保护: instanceof
class NumberObj {
    count: number
}
function addObj(first: object | NumberObj, second: object | NumberObj) {
    if (first instanceof NumberObj && second instanceof NumberObj) {
        return first.count + second.count;
    }
    return 0;
}

console.log(addObj({count: 1}, {count: 2}));


```

### demo08
``` ts
// 枚举类型
// 默认从0开始,
enum Status {
    EAT = 1, // 从1开始
    STUDY,
    SLEEP
}

console.log(Status); // { '1': 'EAT', '2': 'STUDY', '3': 'SLEEP', EAT: 1, STUDY: 2, SLEEP: 3 }
// 可以反查
console.log(Status.STUDY, Status[2]); // 2 STUDY
```


### demo09
``` ts
/**
 * 泛型
 */

// 定义泛型 T，这样保证a和必须是同一类型, 不然就会报错
function add<T>(a: T, b: T) {
    return `${a}${b}`;
}
console.log(add<number>(1,2)); // 12
console.log(add<string>('a','b')); //ab

// 多个泛型
function add2<T, P>(a: T, b: P) {
    return `${a}${b}`;
}
console.log(add2<string, number>('a',2)); //a2


// 泛型中数组的使用
function myArr<T>(params: Array<T>) {
    return params;
}
console.log(myArr<string>(['a', 'b'])); // 数组中每一项必须为字符串


/**
 * 类中使用泛型
 */ 
// 声明接口
interface Lang {
    name: string
}
// 泛型 T 继承 Lang，说明必须是对象，且每项必有name属性
class SelectLang<T extends Lang> {
    // 定义私有变量languages，数组类型，每项类型是泛型 T 
    constructor(private languages: T[] ) {}
    // 返回字符串
    getLang( index: number): string {
        return this.languages[index].name;
    }
}
const selectLang = new SelectLang([
    {name: 'java'},
    {name: 'js'},
    {name: 'html'}
])
console.log(selectLang.getLang(2)); // html

// 也可以 T extends string | number 实现泛型的约束
```




## 收藏

- [TypeScript从入门到精通视频教程-2020年新版](https://www.bilibili.com/video/BV1qV41167VD)
- [一份不可多得的 TS 学习指南（1.8W字）](https://juejin.cn/post/6872111128135073806)
- [如何进阶TypeScript功底？一文带你理解TS中各种高级语法](https://juejin.cn/post/7089809919251054628)
- [2022年了，我才开始学 typescript ，晚吗？（7.5k字总结）](https://juejin.cn/post/7124117404187099172)
- [推荐12个值得学习的TypeScript宝库！](https://mp.weixin.qq.com/s/6EUC2UapqS7i6Dv8lCr-Pg)