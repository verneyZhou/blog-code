---
title: Solidity入门笔记01
date: 2022-07-17 17:56:03
permalink: false
categories:
  - web3
tags:
  - web3
  - solidity
---

# Solidity入门笔记01

> Solidity 是一门面向合约的、为实现智能合约而创建的高级编程语言。这门语言受到了 C++，Python 和 Javascript 语言的影响，设计的目的是能在以太坊虚拟机（EVM）上运行。

[solidity-Github](https://github.com/ethereum/solidity)

[Solidity中文文档](https://solidity-cn.readthedocs.io/zh/develop/)

[登链社区-Solidity中文文档](https://learnblockchain.cn/docs/solidity/)


目前尝试 Solidity 编程的最好的方式是使用 [Remix](https://remix.ethereum.org/)。Remix 是一个基于 Web 浏览器的 IDE，它可以让你编写 Solidity 智能合约，然后部署并运行该智能合约。





## 语法


### 类型
Solidity 是一种静态类型语言，这意味着每个变量（状态变量和局部变量）都需要在编译时指定变量的类型。


#### 值类型
这些类型的变量将始终按值来传递。 也就是说，当这些变量被用作函数参数或者用在赋值语句中时，总会进行值拷贝。


- **布尔类型**
> bool ：可能的取值为字面常量值 true 和 false 。


- **整型**

`int / uint` ：分别表示有符号和无符号的不同位数的整型变量。 支持关键字 uint8 到 uint256 （无符号，从 8 位到 256 位）以及 int8 到 int256，以 8 位为步长递增。 uint 和 int 分别是 uint256 和 int256 的别名。

> Solidity中的整数是有取值范围的。 例如 uint32 类型的取值范围是 0 到 2 ** 32-1 。 0.8.0 开始，算术运算有两个计算模式：一个是 “wrapping”（截断）模式或称 “unchecked”（不检查）模式，一个是”checked” （检查）模式。 默认情况下，算术运算在 “checked” 模式下，即都会进行溢出检查，如果结果落在取值范围之外，调用会通过 失败异常 回退。 你也可以通过 unchecked { ... } 切换到 “unchecked”模式


- **定长浮点型**

`fixed / ufixed`：表示各种大小的有符号和无符号的定长浮点型。 在关键字 ufixedMxN 和 fixedMxN 中，M 表示该类型占用的位数，N 表示可用的小数位数。 M 必须能整除 8，即 8 到 256 位。 N 则可以是从 0 到 80 之间的任意数。 ufixed 和 fixed 分别是 ufixed128x19 和 fixed128x19 的别名。

> 浮点型（在许多语言中的 float 和 double 类型，更准确地说是 IEEE 754 类型）和定长浮点型之间最大的不同点是， 在前者中整数部分和小数部分（小数点后的部分）需要的位数是灵活可变的，而后者中这两部分的长度受到严格的规定。 一般来说，在浮点型中，几乎整个空间都用来表示数字，但只有少数的位来表示小数点的位置。

> Solidity 还没有完全支持定长浮点型。可以声明定长浮点型的变量，但不能给它们赋值或把它们赋值给其他变量。


- **地址类型 Address**

地址类型有两种形式，他们大致相同：
1. `address`：保存一个20字节的值（以太坊地址的大小）。
2. `address payable` ：可支付地址，与 address 相同，不过有成员函数 transfer 和 send 。

这种区别背后的思想是 address payable 可以向其发送以太币，而不能先一个普通的 address 发送以太币，例如，它可能是一个智能合约地址，并且不支持接收以太币。



- **定长字节数组**

关键字有：bytes1， bytes2， bytes3， …， bytes32。



## 练习


### test01

``` js
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Primitives {
    bool public boo = true; //布尔类型，true/false

    /*
    uint 无符号整数类型
   不同位长的整形范围如下：
        uint8     0 to 2 ** 8 - 1
        uint16    0 to 2 ** 16 - 1
        ...
        uint256   0 to 2 ** 256 - 1
    */
    uint8 public u8 = 1;
    uint public u256 = 456;
    uint public u = 123; // uint  等同于 uint256 

    /*
    
     （有符号）整数类型也是从 int8 到 int256，范围计算如下:
    int256 ranges from -2 ** 255 to 2 ** 255 - 1
    int128 ranges from -2 ** 127 to 2 ** 127 - 1
    */
    int8 public i8 = -1;
    int public i256 = 456;
    int public i = -123; // int 等同于 int256

    // int 的最大最小值
    int public minInt = type(int).min;
    int public maxInt = type(int).max;
    //也其他机器语言相区别的类型就是这个address 类型，160-bit/20byte 
    address public addr = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c;
    //合约自己的地址
    address myAddress = address(this);
    //跟普通的地址类型一样，但多了两个方法 transfer/send
    address payable sender=payable(0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c);
    /*
    solidity 有两种 bytes类型 :

     - fixed-sized byte arrays 固定长度字节数组
     - dynamically-sized byte arrays.动态长度字节数组
     bytes1, bytes2, . , bytes32  可以保存从1个32个字节的数组
     bytes 修饰的在Solidity中代表动态长度字节数组. It’s a shorthand for byte[] .
     string: 也是一种动态字节数组的且是utf-8 编码的
    */
    bytes1 a = 0xb5; //  [10110101]
    bytes1 b = 0x56; //  [01010110]
    
    string public myString = "hello";
    string public myStringUnicl = unicode"hello"; //unicode 编码
    bytes32 public myBytes32 = "hello world";

    // 未赋值的变量都有默认值
    bool public defaultBoo; // false
    uint public defaultUint; // 0
    int public defaultInt; // 0
    address public defaultAddr; // 0x0000000000000000000000000000000000000000 =address(0)

    //枚举
    enum ActionChoices { GoLeft, GoRight, GoStraight, SitStill }
    ActionChoices choice;
    ActionChoices constant defaultChoice = ActionChoices.GoStraight;
    function setGoStraight() public 
    {
        choice = ActionChoices.GoStraight;
    }
    function getChoice() public view returns (ActionChoices) 
    {
        return choice; 
    }
    //0.8.8 以上版本才支持
    /*
    function getLargestValue() public pure returns (ActionChoices) 
    { 
        return type(ActionChoices).max;
    }*/
    //0.8.8 以上版本才支持
    /*
    function getSmallestValue() public pure returns (ActionChoices) 
    { 
        return type(ActionChoices).min;
    }
    */
}
```


### test02

``` js

/**

Solidity 中的亦是分3种类型：
    local 本地变量(局部变量)
        定义在函数中
        不存储在链上
    state 状态变量
        定义在函数外
        存储在链上
    global (全局变量) 提供链上的一些全局信息，比如 block.timestamp,
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Variables {
    // 状态变量存储在链上.
    string public MyHello = "Hello";
    uint public Mynum = 123;

    function doSomething() public {
        // 定义在函数内的局部变量.不存储在链上
        uint i = 456;

        // 区块链上的一些全局变量
        uint timestamp = block.timestamp; // 当前区块的时间戳
        address sender = msg.sender; //发起此次调用的调用者地址
    }
}
```

### test03

``` js

/**
Solidity提供两种类型的常量:
一种是constant 定义的时候必须赋值,编译的时候值已经固定，constant 变量也可以在合约所在文件中定义(file level)。
一种是Immutable 在构造函数中赋值后就不可能改变。

对于常量类型的状态变量，编译并不会生成一个状态变量槽（storage slot），每一个常量在编译的时候直接用对应的值填充。

相对于普通的状态变量，常量产生的gas 消耗要低很多。constant 常量编译期间就将常量(表达式计算出来的)值copy 到代码中每一个引用常量的位置。immutable 变量在是合约的构造期间将常量(表达开式计算的)值出copy 到代码中每一个引用常量的位置，但跟constant 不一样，代码中使用到 immutable 的常量的位置会在编译期间预留32字节，哪怕最后该常量计算出来的值小于32字节。基于该原因constant 常量 gas 消耗比immutable的更低。

目前支持常量定义的类型只有string (只支持constant) 及 值类型(value types).
如定义struct 为常量时，如下：
struct User { string name; uint8 age; }
User public constant default_user=User(“TrevorLu”,100);
将会报错：TypeError: Constants of non-value type not yet implemented.

 */

 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
uint constant X = 30**25 + 9;
contract ConstAndImmutable 
{
    address public constant MY_ADDRESS = 0x777788889999AaAAbBbbCcccddDdeeeEfFFfCcCc;
    uint public constant MY_UINT = 123*20+8;
    address public immutable MY_ADDRESS2;
    uint public immutable MY_UINT2;
    constructor(uint _myUint) {
        MY_ADDRESS2 = msg.sender;
        MY_UINT2 = _myUint;
    }
}
```

### test04

``` js
/**
    与比特币一样，以太币并非无限可分的，以太币的最小单位是Wei。Wei是一个非常小的单位，1以太币= 10^18 Wei。
    目前Solidity 提供字面值有 wei，gwei，ether。
 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherUnits {
    uint public oneWei = 1 wei;
    // 1 wei is equal to 1
    bool public isOneWei = 1 wei == 1;

    uint public oneEther = 1 ether;
    // 1 ether is equal to 10^18 wei
    bool public isOneEther = 1 ether == 1e18;
    uint public oneGWei=1 gwei;
    bool public isOneGwei=1 gwei == 1e9;
    

}



// wei转换为ether
> web3.fromWei('22000000000000', 'ether');
"0.000022"

// wei转换为kwei
> web3.fromWei('1000','kwei')
"1"

// wei转换为gwei
> web3.fromWei('1000000000','gwei')
"1"

// ether转换为wei
> web3.toWei('1','ether')
"1000000000000000000"



// 通过上面的函数，在交易的过程中我们就可以随意的单位进行发送交易，而不必使用最小单位wei。
> eth.sendTransaction({from:"账号地址",to:"账号地址",value:web3.toWei(1,"ether")})




// 通过查询余额的方法，我们也可以看出区块链中存储这些数据的单位为wei。
> web3.eth.getBalance("账号地址")
867999919991999999999

```


### test05

``` js

/**
https://www.it1129.com/2022/02/16/eth-gas%e3%80%81gas-price%e3%80%81gas-limit-%e8%a7%a3%e6%9e%90/
 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Gas {
    uint public i = 0;

    // 该函数会用光所有的Gas
    // i 的值会被回滚，但使用了的Gas 无法退出到账号。
    // Gas spent are not refunded.
    function forever() public {
        while (true) {
            i += 1;
        }
    }
    function test_gas() public 
    {
        uint gas_limit=block.gaslimit; // 单个区块允许的最多gas总量
        uint gas_left=gasleft();
        bool is_same_as_gas_limit=gas_limit==gas_left;
        uint gas_price=tx.gasprice;
        i=10;
        gas_left=gasleft();
        uint gas_used=gas_limit-gas_left;
    }
}
```


### test06

``` js

/**
    Mapping 是一种引用类型，存储键值对。概念上与java中的map，python中的字典类型类似，但在使用上有比较多的限制。

    mapping语法为：mapping(keyType => valueType) ， keyType为值类型，可以是整型、字符串等数据类型，但不能使用动态数组、contract、枚举、struct，以及mapping这些类型。 valueType 的类型没有限制，甚至使用一个mapping作为valueType也是允许的。

    mapping可以看做是一个哈希表。 在这个表中已经列举了所有可能的key值，并把这些key映射到该值类型的默认为值也就是所有字节值都为0。 但在存储上，key的值并不是直接保存在这个哈希表中，否则多少存储空间都不够用。 所以，在solidity中，mapping没有长度length的概念，无法拿到所有的key或者value 的所有合集，也就是无法迭代/枚举。 也没有API可以清除整个mapping，只能使用delete 关键字清除已经key 的值

    mapping 只能在storage 的所在的存储空间，因此只能定义为状态变量，
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Mapping {
    //solidity编译器会为public 类型的mapping自动生成get方法， 输入参数为key，输出参数为value。
    mapping(address => uint) public myMap;

    function set(address _addr, uint _i) public {
        myMap[_addr] = _i;
    }

    function remove(address _addr) public {
        // Reset the value to the default value.
        delete myMap[_addr];
    }
}

contract NestedMapping {
    //如果使用mapping来作为value，则会生成两个输入参数的get方法， 以此类推。
    mapping(address => mapping(uint => bool)) public nested;

    function set( address _addr1,uint _i,bool _boo ) public {
        nested[_addr1][_i] = _boo;
    }
//没有API可以清除整个map，只能使用delete 关键字清除已知key 的value。
    function remove(address _addr1, uint _i) public {
        delete nested[_addr1][_i];
    }
}
```


### test07

``` js

/**
https://www.it1129.com/2022/02/19/%e6%95%b0%e7%bb%84-array/

在Solidity中， X[3] 总是一个包含三个 X 类型元素的数组，即使 X 本身就是一个数组，这和其他语言也有所不同，比如 C 语言。

数组分固定大小与动态大小两种。声明语法： 固定长度：T[k] /T 类型，k 为长度。 动态类型：T[]。
注：多维数组的声明顺序与传统语言中的正好相反。比如二维数组：
5个动态的unit 数组声明方式是这样的：unit[][5] ,
来一个明显的：uint [2][3] T = [[1,2],[3,4],[5,6]]; 这是3个unit[2].
如果是其他语言类C是这样的：uint [2][3] T = [[1,2,3],[4,5,6]]

数组的索引是从0开始，访问数组内容则是从声明的反方向开始。比如：uint[][5] memory x，访问第3个动态数组里面的第7个元素，是这样写的 :x[2][6] .跟声明方向是反着来的。

与mapping 一样，数组类型的状态变量声明为public 会生成对就的get 方法。

访问超过数组长度的内容会导致越界异常。但跟传统语言报出来的越界异常信息不一样。

 */



 // SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract ArayTest {
    bytes s = "Storage";
    bytes16 b16="abc";

    // 使用bytes.concat 可以连接bytes，bytes1,bytes2,…bytes32 返回bytes memroy 的数组，注意没有填充返回一个紧凑的字节数组。注意，如果bytes1,bytes2…bytes32 如果有的字节是0的填充，concat 并不会把这些0填充去掉.
    function f(bytes calldata c, string memory m, bytes4 b4) public view  returns (uint,uint) {
        bytes memory a = bytes.concat(s, c, c[:2], "Literal", bytes(m), b4,b16);
        return (a.length,(s.length + c.length + 2 + 7 + bytes(m).length + 4 + 16));
    }
    // 在remix 中f 函数输入：”0x61626364″,abcdefg,”0x98991112″ ，可以看到计算结果一样的。而且虽然b16只有3个字符，但还是按16个字节算,b16.lengh 等于16。后面的13个字节的0 ，并不会被去掉。



    /**
    内存数组
    使用new 可以创建内存动态数组，与定义在状态变量区的动态数组不同，内存动态数组，不能使用push 方法增加数组大小，如果需要扩展数组，只能重新分配，再把旧的数组拷贝到新数组中。
     */
    function g() public pure returns(uint) {
        uint[] memory a = new uint[](7);
        a[0]=7;
        //a.push(7); 
        bytes memory b = new bytes(8);
        b[0]=0x63;
        //b.push(0x66);
        return a.length;
    }



    /**
    literal 数组
    literal 数组的类型，是由数组中的第一个元素决定。如上代码，如果是传入 [1,2,3] 会报错，因为这是一个uint8[3] memory 类型的数组。
    uint[] memory x = [uint(1), 3, 4]; 该语句也会报错，因为一个固定大小的内存数组将转换成动态内存数组。
     */
    function f() public pure {
        g([uint(1), 2, 3]); 
    }
    function g(uint[3] memory) public pure { 
            // ...
    }


    /**
    array slice 数组切割
    语法：X[start:end] ,start/end 只要能返回一个uint256 的表达式即可。 返回X数组从start开始到end-1 的元素。但注意如果start大于 end 或者 end 大于 数组长度，则会报错。start、end都是可选，如果不输入则start 默认是0，end 则是数组长度。
     */
    function f(bytes calldata k) public pure  returns (bytes memory, bytes4) {
        bytes memory b=bytes.concat(k[:3]);
        bytes4 b3=bytes4(k[:3]); 
        //byte3 b3=k[0:3];//无法使用类型进行标志，只能存在于中间表达式中
        b[0]=0x60;
        return (b,b3);
    }
}



contract Array {
    // Several ways to initialize an array
    uint[] public arr;
    uint[] public arr2 = [1, 2, 3];
    // 固定大小 数组 初始化为0
    uint[10] public myFixedSizeArr;
 
    // Solidity 可以返回整个 array.
    function getArr() public view returns (uint[] memory) {
        return arr;
    }

    function push(uint i) public {
        // 加入数组元素，长度加1
        arr.push(i);
    }

    function pop() public {
        // 移动数组最后一个元素，长度减1
        arr.pop();
    }
 
    function getLength() public view returns (uint) {
        return arr.length;
    }

    function remove(uint index) public {
        // delete 并不会改变数组大小 ，只要让arr[index] 重围为初始值0
        delete arr[index];
    }

    function examples() external {
        // create array in memory, only fixed size can be created
        uint[] memory a = new uint[](5);
    }
}


//通过把把元素从右往左移动从而删除元素 保留元素的顺序
contract ArrayRemoveByShifting {
    // [1, 2, 3] -- remove(1) --> [1, 3, 3] --> [1, 3]
    // [1, 2, 3, 4, 5, 6] -- remove(2) --> [1, 2, 4, 5, 6, 6] --> [1, 2, 4, 5, 6]
    // [1, 2, 3, 4, 5, 6] -- remove(0) --> [2, 3, 4, 5, 6, 6] --> [2, 3, 4, 5, 6]
    // [1] -- remove(0) --> [1] --> []

    uint[] public arr;

    function remove(uint _index) public {
        require(_index < arr.length, "index out of bound");

        for (uint i = _index; i < arr.length - 1; i++) {
            arr[i] = arr[i + 1];
        }
        arr.pop();//交换后再把最后一个元素移除
    }

    function test() external {
        arr = [1, 2, 3, 4, 5];
        remove(2);
        // [1, 2, 4, 5]
        assert(arr[0] == 1);
        assert(arr[1] == 2);
        assert(arr[2] == 4);
        assert(arr[3] == 5);
        assert(arr.length == 4);

        arr = [1];
        remove(0);
        // []
        assert(arr.length == 0);
    }
}


//把最后一个元素copy 到被移动元素的位置从而达到移除元素。无序。
contract ArrayReplaceFromEnd {
    uint[] public arr;

    // Deleting an element creates a gap in the array.
    // One trick to keep the array compact is to
    // move the last element into the place to delete.
    function remove(uint index) public {
        // Move the last element into the place to delete
        arr[index] = arr[arr.length - 1];
        arr.pop();//删除最后一个元素
    }

    function test() public {
        arr = [1, 2, 3, 4];

        remove(1);
        // [1, 4, 3]
        assert(arr.length == 3);
        assert(arr[0] == 1);
        assert(arr[1] == 4);
        assert(arr[2] == 3);

        remove(2);
        // [1, 4]
        assert(arr.length == 2);
        assert(arr[0] == 1);
        assert(arr[1] == 4);
    }
}

```

### test08

``` js

/**
Solidty 中可以使用枚举创建自己定义数据类型。枚举可以显式的与整型进行双向转换，但不支持隐式转换。显式的转换在运行时检查枚举成员的数值范围，如果不匹配，将会引起异常。定义枚举时至少要1名成员，最多是256个。枚举也可以定义在合约外，或者libarary 中。
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Enum {
    // Enum 代表一种状态
    enum Status {
        Pending,
        Shipped,
        Accepted,
        Rejected,
        Canceled
    }

    // 默认值是枚举定义中第一个元素，此处是"Pending"
    Status public status;

    //返回的是 uint
    // Pending  - 0
    // Shipped  - 1
    // Accepted - 2
    // Rejected - 3
    // Canceled - 4
    function get() public view returns (Status) {
        return status;
    }

    //更新状态，传入uint 即可 
    function set(Status _status) public {
        status = _status;
    }
    function cancel() public {
        status = Status.Canceled;
    }

    // delete 可以重围为每一个元素的值，即0 或者 说是Pending
    function reset() public {
        delete status;
    }
}
```


### test09

``` js
/**
solidity 类似C语言可以使用struct 可以将关联的数据结合在一起形成新的自定义的数据类型。struct 是引用类型。可以被定义在其他文件中，不需要在合约体中定义，然后被其他合约引入。
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Todos {
    struct Todo {
        string text;
        bool completed;
    }
    Todo[] public todos;

    function create(string memory _text) public {
        //有3种方式初始化结构体
        // 1.类似调用函数一样
        todos.push(Todo(_text, false));

        // 2.键值对方式 
        todos.push(Todo({text: _text, completed: false}));

        // 初始化一个空的struct然后分别分每个成员赋值
        Todo memory todo;
        todo.text = _text;
        // todo.completed 默认就是false
        todos.push(todo);
    }

    // Solidity 会自动创建一个get 方法，以下方法其实可以不需要
    function get(uint _index) public view returns (string memory text, bool completed) {
        Todo storage todo = todos[_index];
        return (todo.text, todo.completed);
    }

    // 更新结构体数据
    function update(uint _index, string memory _text) public {
       //注意此处需要加入storage 修饰，否则返回就不是一个引用。而是数组里的一个拷贝
        Todo storage todo = todos[_index];
        todo.text = _text;
    }


    // update2 返回一个todos元素的拷贝而不是引用，无法更新todos里面元素的值，所以函数声明里使用的是view，不会更新todos 到链上。
    function update2(uint _index, string memory _text) public view {
        Todo memory todo = todos[_index];
        todo.text = _text;
    }

    // 更新结构体数据
    function toggleCompleted(uint _index) public {
        Todo storage todo = todos[_index];
        todo.completed = !todo.completed;
    }
}
```


### test10
``` js
/**
目前引用类型包括struct，mapping，array，使用引用类型时必须显式的指明数据存储区域，包括:
1 .memory变量则是临时的，当函数调用完成时被移除
2.storage变量永久存储在区块链上,除非合约被移除。
3.calldata 效果同memory，只不过用在external函数调用中，是一只读，且不能持久化存储的区域。（Calldata is a non-modifiable, non-persistent area where function arguments are stored, and behaves mostly like memory.）

通过赋值或者类型转换导致的存储位置的改变总是伴随着数据的自动拷贝操作，且对于某些情况下的都是 storage 类型变量的赋值一样会导致拷贝操作。因此只要情况允许，使用calldata 这样可以避免拷贝与函数内被修改的操作。

 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/**
C1. storage与 memory 之间的赋值，或者从calldata赋值到storage/memory 以拷贝的方式进行。
C2. memory与 memory之间的赋值是引用传递
C3. storage赋值到一个  local storage 是引用传递
C4. 其他情况下赋值到storage 都是通过拷贝操作的。哪怕是一个本地变量只是一个引用，当赋值到一个storage 变量时也是通过拷贝进行赋值。
**/
contract DataLocationsTest {
    // x 的数据位置是storage. 引用类型的状态变量是唯一一处可以省略数据位置声明的地方
    uint[] public  x;
    uint[] public  z;
    function f(uint[] memory memoryArray) public 
    {
        x = memoryArray; //C1,拷贝整个数组到x
        z=x;//C4 拷贝整个数组到x 到z

        uint[] storage y = x; //C3 ，引用传递，
        y.pop(); //对y的改变其实是作用于x
        delete x; //清除数组元素，y.length =0
        
        uint[] memory memoryArray2=memoryArray; //C2 传递的是引用
        memoryArray2[0]=2; //memoryArray2[0] == memoryArray[0] ==2
        z=memoryArray2;//C4 memoryArray2 虽然是引入，但还是拷贝memoryArray 到z 中
        assert(memoryArray[0]==2);

        //
        // The following does not work; it would need to create a new temporary /
        // unnamed array in storage, but storage is "statically" allocated:
        //打开注释报错，无法从一个memory 赋值到一个引用上
        //TypeError: Type uint256[] memory is not implicitly convertible to expected type uint256[] storage pointer
        // y = memoryArray; 
        
       

        // This does not work either, since it would "reset" the pointer, but there
        // is no sensible location it could point to.
        //打开注释报错，delete y 意思是重置y 的指向，但这时候没有一个合理的位置y能指向的
        // delete y;
        g(x); // calls g,传递的是 x 引入
        h(x); // calls h 传递的是 x 的拷贝
    }
    function g(uint[] storage) internal pure {}
    function h(uint[] memory) public pure {}
    function M(uint[] calldata _arr) external {
        // do something with calldata array
        //   _arr[0]=1; //报错，calldata 是只读
        z=_arr; //C1 calldata 赋值到storage 通过拷贝赋值
    }
}
```


### test11
``` js

/**
函数
 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FunctionTest {
    // 返回多个值
    function returnMany() public pure returns (uint,bool,uint)
    {
        return (1, true, 2);
    }

    // 返回多个值可以被命名
    function named() public pure returns (uint x,bool b,uint y)
    {
        return (1, true, 2);
    }

    // 直接赋值到返回的变量，这种情况下，return 语句可以省略
    function assigned() public pure returns (uint x,bool b,uint y)
    {
      x = 1;
      b = true;
      y = 2;
    }

    //  destructuring assignment 类似js 中的 https://javascript.info/destructuring-assignment
     function destructuringAssignments() public pure returns (uint,bool,uint,uint,uint)
    {
        (uint i, bool b, uint j) = returnMany();

        // Values can be left out. 可以被省略
        (uint x, , uint y) = (4, 5, 6);

        return (i, b, j, x, y);
    }

    //mapping 无法做为函数的参数或者返回值  Cannot use map for either input or output

    //使用数组做为函数参数 
    function arrayInput(uint[] memory _arr) public {}

    //可以使用数组做为返回值  Can use array for output
    uint[] public arr;
    function arrayOutput() public view returns (uint[] memory) {
        return arr;
    }
}


/**
函数修饰器(Function Modifier) ,可以用来轻易的改变一个函数的行为。比如用于在函数执行前检查某种前置条件。修改器是一种合约属性，可被继承，同时还可被派生的合约重写(override).函数修饰器，一般被用于以下情况：

Restrict access 限制访问
Validate inputs 验证输入参数
Guard against reentrancy hack 防重入攻击
 */

contract FunctionModifier {
    address public  owner;
    uint public x = 10;
    bool public locked;

    constructor() {
        // Set the transaction sender as the owner of the contract.
        owner = msg.sender;
    }

    // 该修饰器检查当前调用是否为 owner 发起
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        // 下划线是特殊符号告诉EVN 继续执行后继的代码
        _;
    }

    // 修饰器可以带参数
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Not valid address");
        _;
    }
    //只有owner 才能重新指向新的owner
    function changeOwner(address _newOwner) public onlyOwner validAddress(_newOwner) {
        owner = _newOwner;
    }

    //预防函数重入攻击，只有当locked=false 时才能调用函数，
    modifier noReentrancy() {
        require(!locked, "No reentrancy");

        locked = true;
        _;
        locked = false;
    }

    function decrement(uint i) public noReentrancy {
        x -= i;

        if (i > 1) {
            decrement(i - 1);
        }
    }
}


/**
可以重写父类的函数修改器。来改变父类的修改器行为。
 */

contract Parent{
  modifier transferLimit(uint _withdraw)  virtual {
    require(_withdraw > 100);
    _;
  }
}
contract ChildOverride is Parent{
  //覆盖的父类的
  modifier transferLimit(uint _withdraw) override{
    require(_withdraw > 10);
    _;
  }

  function f(uint withdraw) public pure transferLimit(withdraw) returns(uint) 
  {
    return withdraw;
  }
}


/**
getter 类型的函数可以被view 或者 pure 修饰。 view 修饰的函数不能改变状态变量。pure 则既不能改变状态变量，也不取读取状态变量。
 */

contract ViewPureTest {
    uint public x = 1;
    // 不能改变状态变量.
    function addToX(uint y) public view returns (uint) {
        return x + y;
    }

    //函数中没有任何状态变量出现。
    function add(uint i, uint j) public pure returns (uint) {
        return i + j;
    }
}


/**
solidity封装了两种函数的调用方式：internal和external
注意合约函数这两种调用方式，不要跟函数的可见性 visibility 修饰符(public private internal external )搞混乱。
 */

/**
1.Internal Function Calls 内部函数调用
当前合约的函数可以直接调用(内部调用)，也可以递归地调用。比如下面不合理的例子：
注：只有同一个合约实例的函数才能发起内部函数调用，需要尽量避免过度使用递归。
 */
contract CT {

    function g(uint a) public pure returns (uint ret) { 
        return a + f(); 
    } 
    function f() internal pure returns (uint ret) {
        //Warning: Unreachable code. 编译会产生该警告
        return g(7) + f(); 
    }
}

/**
2.External Function Calls
合约函数也可以这样被调用：this.g(80); and c.g(20) ，c是合约实例，g是该合约里面的方法，这种调用方法是外部函数调用-externally function call。this 不能在构造函数使用，因为此时合约实例尚未被创建。
在当前合约调用其他合约的函数，只能通过外部函数调用的方式。外部函数调用的参数必须拷贝到内存中，且并不会生成一个新的事务，而是处于当前的事务中。
发起外部调用时，也可以指定使用多少gas/Wei，比如：{value: 10, gas: 10000}。但这种方式并不推荐，因为后续对代码的优化会改变调用所使用的gas。
 */
contract InfoFeed {
    function info() public payable returns (uint ret) { 
        return 42; 
    }
}
contract Consumer { 
    InfoFeed feed;
    function setFeed(InfoFeed addr) public {
         feed = addr; 
    }
    function callFeed() public { 
        feed.info{value: 10, gas: 800}(); 
    } 
}

// 3.this 如果要当前合约的函数发起external 函数调用，可以使用该关键字。
contract InfoFeed2 {
    function F() external  pure returns   (uint ret) { 
        return 42; 
    }
    function G() public view {
        this.F();
        // F(); 使用方法方式调用会报可见错误
    }
}



/**
可见性 VISIBILITY 修饰符

函数与状态变量必须声明对其他合约的可访问性。
函数的可访问性有如下关键字修饰：
1.public – 所有合约与账号都可以调用
2.private -只有在定义该函数的合约可以调用
3.internal- 当前合约或者继承该合约的，类似java 里面的protected 关键字。
4.external – 只有其他合约或者账号可以调用,定义该函数的合约不能调用,除非使用 this 关键字
 */

contract Base {
    // private 函数只能在当前合约中被调用，其子类合约也无法发起调用
    function privateFunc() private pure returns (string memory) {
        return "private function called";
    }

    function testPrivateFunc() public pure returns (string memory) {
        return privateFunc();
    }

    // internal 当前合约与子类合约都可调用
    function internalFunc() internal pure returns (string memory) {
        return "internal function called";
    }

    function testInternalFunc() public pure virtual returns (string memory) {
        return internalFunc();
    }

    // Public 所有合约都能发起调用
    function publicFunc() public pure returns (string memory) {
        return "public function called";
    }

    // External functions can only be called
    // - by other contracts and accounts
    function externalFunc() external pure returns (string memory) {
        return "external function called";
    }

    // 在当前合约的函数中无法发起external 调用 ，函数使用this
    // function testExternalFunc() public pure returns (string memory) {
    //     return externalFunc();
    // }

    // State variables
    // 状态亦是可以被 public, private, or internal 但不能被 external 修饰。 默认是internal 也就是只有当前合约或者子类合约能访问。
    // 对于public 修饰的状态变量，编译器自动生成对应的getter 方法。
    string private privateVar = "my private variable";
    string internal internalVar = "my internal variable"; //默认可见性就是internal ，因此可以省略
    string public publicVar = "my public variable";
    // 无external 类型的状态变量
    // string external externalVar = "my external variable";
}

contract Child is Base {
    // 无法访问
    // function testPrivateFunc() public pure returns (string memory) {
    //     return privateFunc();
    // }

    // Internal function call be called inside child contracts.
    function testInternalFunc() public pure override returns (string memory) {
        return internalFunc();
    }
}
```


### test12

``` js

/**
当合约在执行过程种出现错误时，当前事务对状态变量的更改全部回滚。可以通过 require, revert or assert 3种方法抛出错误。他们的区别如下：

- require 用于验证输入参数，执行前的条件判断及函数调用是否合法，也可以使用函数修饰器将这部分条件判断抽出来，这样可以使函数更简洁，更加专注于业务逻辑。有如下方法签名：require(bool condition) 与require(bool condition, string memory message)。

- revert 类似 require.一般在用于逻辑复杂的判断，适用于分支判断的场景。有revert 表达式与revert 函数。
revert CustomError(arg1, arg2);//自定义错误
revert();
revert(“错误描述”);

- assert 断言，检查不应该发生的情况，如果发生了那代码可能出现bug了。断言一般用于在函数结束的时候检查内部错误。 方式签名：assert(条件判断表达式)

上述方法产生的错误信息通过创建错误对像实例返回给调用者，solidity 有两个内置的错误实例：Error(string) 与Panic(uint256)。

assert 断言生成Panic 对像(以下情况2)，除此之处，以下情况也会生成Panic 对像。错误代码代码表示不同类型的错误。
    1.0×00 ：由编译器本身导致的Panic. 翻译过来，目前我也没遇到过。
    2.0×01: assert 的参数（表达式）结果为 false 。
    3.0×11: 在unchecked { … }外，算术运算结果向上或向下溢出。
    4.0×12: 除以0或者模0. 比如：5 / 0 或者 23 % 0
    5.0×21: 转换一个太大的数或者负数为枚举类型。
    6.0×22: 访问一个没有正确编码的storage 字节数组.
    7.0×31: 对空数组调用.pop() 。
    8.0×32: 数组的索引越界或为负数。
    9.0×41: 分配了太多的内存或创建的数组过大。
    10.0×51: 如果你调用了零初始化内部函数类型变量。

以下情况产生Error(string)实例：
    1.调用require(x) x解析为false 。
    2.触发revert或者revert(“错误描述”)
    3.执行外部函数调用合约没有代码。
    4.如果合约接收eth的函数（包括构造函数和 fallback 函数）没有用 payable 修饰。
    5.合约通过 getter 函数接收以太币 。

以下情况可能是Panic也可能是Error:
    1. .transfer() 失败。
    2. 通过消息调用调用某个函数，但该函数没有正常结束（例如, 它耗尽了 gas，没有对应的函数，或者本身抛出一个异常）。低级操作不会抛出异常，而通过返回 false 来指示失败。
    3. 如果你使用 new 关键字创建未完成的合约 。

当异常发生在子调用中时，它们会自动“冒泡”（即异常被重新抛出） 直到被try/catch 捕获。但也有例外：send和底层函数call, delegatecall 和 staticcall 在异常情况下返回false，而不是“冒泡”。
注意：EVM有这么个设计哪怕调用的帐户不存在，delegatecall,call 和 staticcall 其返回值的第一个元素是true。因此有需要的话必须在调用之前检查账户是否存在。
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ErrorTest {
    function testRequire(uint _i) public pure {
        // Require 一般用于如下情况验证:
        // 1- 输入参数验证
        // 2- 执行前的条件判断
        // 3- 函数调用返回值的验证
        require(_i > 100, "Input must be greater than 100");
    }

    function testRevert(uint _i) public pure {
        // Revert 适用于条件判断复杂的情况.
        if (_i <= 100) {
            revert("Input must be greater than 100");
        }
    }

    uint public num;

    function testAssert() public view {
        // Assert 用于内部错误检测,
       //这里用于断言num必须为0，否则程序应该出现bug ，
        assert(num == 0);
    }

    // 自定义错误
    // 注意：使用自定义的错误比使用一个字符串描述的错误会为划算。对比以下使用字段串代码错误的代码，发布合约时，使用自定义错误消耗的gas更少。因为自定义错误使用4个字节编码。
    error InsufficientBalance(uint balance, uint withdrawAmount);

    function testCustomError(uint _withdrawAmount) public view {
        uint bal = address(this).balance;
        if (bal < _withdrawAmount) {
             //
            revert InsufficientBalance({balance: bal, withdrawAmount: _withdrawAmount});
            // revert("InsufficientBalance"); // 使用一个字符串描述的错误
        }
    }
}


contract Account {
    uint public balance;
    uint public constant MAX_UINT =type(uint256).max ;

    function deposit(uint _amount) public {
        uint oldBalance = balance;
        uint newBalance = balance + _amount;

        // balance + _amount >= oldBalance 否则溢出
        require(newBalance >= oldBalance, "Overflow");

        balance = newBalance;

        assert(balance >= oldBalance);
    }

    function withdraw(uint _amount) public {
        uint oldBalance = balance;

         
        require(balance >= _amount, "Underflow");
        //if (!condition) revert(...); 跟 require(condition, ...);  效果是一样的，只要revert、require没有side-effect，比如传入的都是string,如上Underflow，。
        //但是 如类似这样的 require(condition, f())  ，不管condition是否为true，f() 还是会被执行的。这些效果就不太样
        if (balance < _amount) {
            revert("Underflow");
        }

        balance -= _amount;

        assert(balance <= oldBalance);
    }
}

```


### test13


``` js
/**
try …catch 只能捕获外部函数调用或者合约创建时产生的错误。语法如下：
try 外部函数调用/合约创建 (return [函数表达式的返回值/合约实例]) { //returns 是可忽略的，
….成功后其他逻辑…….
}
catch Error(string memory reason)
{
…….
}
catch Panic(unit errorCode)
{
……
}
catch (bytes memory lowLevelData)
{
….
}
catch
{
…..
}

关于catch 语句块：
1.catch Error(string memory reason) { … }: 由revert(“reasonString”) 或者 require(false, “reasonString”) 产生的Error.
2.catch Panic(uint errorCode) { … }: 由assert 产生的Panic 对像，比如 除0，数组越界访问，或溢出。
3.catch (bytes memory lowLevelData) { … }: 不在1，2 的情况，比如 revert() ，或者错误信息在解码时发生错误。
4.catch { … } : 接收所有错误类型，但是不能出现前面的判断错误类型的分句，只能在catch 最后。
 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Foo {
    address public owner;

    constructor(address _owner) {
        require(_owner != address(0), "invalid address");
        assert(_owner != 0x0000000000000000000000000000000000000001);
        owner = _owner;
    }

    function myFunc(uint x) public pure returns (string memory) {
        require(x != 0, "require failed");
        return "my func was called";
    }
}

contract Bar {
    event Log(string message);
    event LogBytes(bytes data);

    Foo public foo;

    constructor() {
        foo = new Foo(msg.sender);
    }

    // 尝试不同的输入值
    // tryCatchExternalCall(0) => Log("external call failed")
    // tryCatchExternalCall(1) => Log("my func was called")
    function tryCatchExternalCall(uint _i) public {
        //foo.myFunc(_i)  是 External 函数调用
        try foo.myFunc(_i) returns (string memory result) { //result 就是myFunc的返回值，注意returns 是可选的，
            emit Log(result);
        } catch {
            emit Log("external call failed");
        }
    }

    // Example of try / catch with contract creation
    // tryCatchNewContract(0x0000000000000000000000000000000000000000,1) => Log("invalid address") 由require 产生的错误
    // tryCatchNewContract(0x0000000000000000000000000000000000000001,1) => LogBytes("")   由assert 产生的错误
   // tryCatchNewContract(0x0000000000000000000000000000000000000002,0) => Log("Foo created") Log("external call failed")
    // tryCatchNewContract(0x0000000000000000000000000000000000000002,1) => Log("Foo created")
    function tryCatchNewContract(address _owner,uint _i) public {
        try new Foo(_owner) returns (Foo _foo) {
            // you can use variable foo here
            emit Log("Foo created");
            //与其他语言的异常捕捉不一样，一个try (表达式/合约创建)/catch.... 只能捕捉发生在该表达式中的错误，以下的语句发生错误时无法捕捉，必须再加一层try/catch
            try _foo.myFunc(_i) returns (string memory result) 
            {
                emit Log(result);
            }catch{
                emit Log("external call failed");
            }

        } catch Error(string memory reason) {
            // catch failing revert() and require()
            emit Log(reason);
        } catch (bytes memory reason) {
            // catch failing assert()
            emit LogBytes(reason);
        }
    }
}

```


### test14

``` js
/**
Solidity 事件是 EVM 日志记录功能向外部应用提供的一个抽象层，ETH 客户端程序可以通过RPC 接口订阅与监听这些事件。
定义在合约中的事件可以被继承，当事件被触发时，向事件提供的参数被存储在交易的日志中，这是区块链上一个特殊的数据结构，该日志关联合约的地址永久存储在区块链上。在合约中日志与事件数据无法被访问。
事件的参数可以加入indexed 属性(最多indexed三个参数)，来设置是否被索引。设置为索引后，这些事件参数被存储在一个称为”topics”的数据结构中而不是存储在日志的数据结构，每一个topic 只能容纳32字节，因此如果事件参数是引用类型，那么该引用类型的对应的值以Keccak-256 hash 值做为该topic 值。有了topic可以允许通过这个参数来查找日志，甚至可以按特定的值过滤。
所有未被索引的参数使用ABI-encoded后保存在日志的数据区域
 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventTest {
    // Event 定义
    event Log(address indexed sender, string message);
    event AnotherLog();

    function test() public {
        emit Log(msg.sender, "Hello World!"); //触发事件使用emit 关键字
        emit Log(msg.sender, "Hello EVM!");
        emit AnotherLog();
    }
}

```


### test15

``` js

/**
老版本的solidity，构造函数是和合约名字同名的，从版本0.4.22开始solidity使用关键词constructor作为构造函数。
构造函数执行前，状态变量被初始为默认值或者变量定义时所赋值。
当构造函数执行后，最终生成的代码会被发布到区块链中，发布所用到的gas 费用跟合约最终生成代码的大小成正比。
若没有定义构造函数，solidity自动生成默认的：constructor() {}。
0.7.0 的版本前，constructor构造函数还需要使用 public 与 internal 指定可见性。
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract X {
    string public name;
    event init_logX();
    constructor(string memory _name) {
        name = _name;
        emit init_logX();
    }
}
contract Y {
    string public text;
    event init_logY();
    constructor(string memory _text) {
        text = _text;
        emit init_logY();
    }
}

//有两种方式可以初始化父合约的构造函数中的参数

//1.把参数放到继续列表中
contract B is X("Input to X"), Y("Input to Y") {

}

contract C is X, Y {
   //2.把参数放到构造函数后面
    constructor(string memory _name, string memory _text) X(_name) Y(_text) {}
}

// 父合约构造函数函数执行顺序只跟继续列表的顺序有关
 
//  constructors 调用顺序:
// 1. X
// 2. Y
// 3. D
contract D is X, Y {
    constructor() X("X was called") Y("Y was called") {}
}

//  constructors 调用顺序:
// 1. X
// 2. Y
// 3. E
contract E is X, Y {
    constructor() Y("Y was called") X("X was called") {}
}









/**
INHERITANCE继承：https://www.it1129.com/2022/02/25/inheritance-%e7%bb%a7%e6%89%bf/
Solidity 支持多继承，合约通过关键字is 继承其他合约。
如果一个函数需要在子合约重写那么必须使用virtual关键字声明。
如果一个函数需要重写父合约的函数需要使用override关键字声明。
如果一个函数既是重写同时也被继承那么需要同时使用virtual override 一起声明。如果该方法存在于多个基类中，override需要声明这些基类。
当一个合约继承多个合约时，在区块链上仅会创建一个合约，通过复制父类合约的代码到子类合约形成一份新的完整合约代码。
 */



contract X {}
contract A is X {}
//contract C is A, X {} //Solidity会报错Linearization of inheritance graph impossible
/**
合约C ，Solidity会报错Linearization of inheritance graph impossible，原因是C会请求X来重写A(因为继承定义的顺序是A->X)，但A自身又是重写X的，所以这是一个不可解决的矛盾。正确是继承顺序为：
 */
contract C is X,A {}  // X称为most base-like





/* 继承关系图
    A
   / \
  B   C
 / \ /
F  D,E

*/

contract A {
    function foo() public pure virtual returns (string memory) {
        return "A";
    }
}

contract B is A {
    // foo 因为既然是重写基类的方法同时也会被子类重写，因此需要加virtual override 两个关键字
    function foo() public pure virtual override returns (string memory) {
        return "B";
    }
}

contract C is A {
    // foo 因为既然是重写基类的方法同时也会被子类重写，因此需要加virtual override 两个关键字
    //override(A) 当只有一个基类时，可以省略，如果是有多个不能省，如下合约D,E..
    function foo() public pure virtual override returns (string memory) {
        return "C";
    }
}

// 合约可以多继承，继承列表里的顺序非常关键，当一个重写的方法在多个父类合约中被定义多次时，.
// 如果调用父类方法，其搜索顺序是从右到左，深度优先的方式进行，如下
contract D is B, C {
    // D.foo() 返回 "C"
    //注意并不是说override(C,B) 中的C，B 不能省略，否则报错，但C，B 的顺序并不影响结果
    // 注意并不是说override(C,B) 里面的顺序，而是is 继承继承列表里面的顺序。
    function foo() public pure override(C,B) returns (string memory) {
        return super.foo();
    }
}

contract E is C, B {
    // E.foo() 返回 "B"
    function foo() public pure override(C, B) returns (string memory) {
        return super.foo();
    }
}

// 当继承列表相互间也有继承关系时，继承顺序写法遵循 “most base-like” to “most derived” 参考上面继承关系图，也就是最上层的类写在最左边。
//按以左为尊的传统，辈分越高的老祖宗在最左边,而调用时方法搜索顺序从右开始，正好形成了逻辑闭环，因为肯定是优先调用最近子类的方法，这样才形成面向对像语言的多态性。
//交换以下 A and B 会抛出编译错误
contract F is A, B {
    // E.foo() 返回 "B"
    function foo() public pure override(B,A) returns (string memory) {
        return super.foo();
    }
}









/**
solidity 6.0 以后状态变量在子类不能通过重新定义进行重写。
 */

contract A {
    string public name = "Contract A";
}

// 状态变量重写在 Solidity 0.6 后已经禁止，以下合约通过在子类中重新定义name 的值报编译错误
// contract B is A {
//     string public name = "Contract B";
// }

contract C is A {
    // 要想在子类中重新赋值状态变量可以在子类的构造函数中进行
    constructor() {
        name = "Contract C";
    }
    // C.name  返回 "Contract C"
}










/**
在子类中调用父类合约的函数可以直接通过父类合约的名字，或者使用super 关键字。使用super 关键字，is继承列表中的中间父类合约都会被调用。
 */

/* 继承关系图
   A
 /  \
B   C
 \ /
  D
*/

contract A {
    // 使用该事件在交易中记录下日志
    event Log(string message);

    function foo() public virtual {
        emit Log("A.foo called");
    }

    function bar() public virtual {
        emit Log("A.bar called");
    }
}

contract B is A {
    function foo() public virtual override {
        emit Log("B.foo called");
        A.foo();
    }

    function bar() public virtual override {
        emit Log("B.bar called");
        super.bar();
        //注意并不是说bar方法就只能调用父类的bar方法,以下调用是可以的
        // super.foo();
        // A.foo();
    }
}

contract C is A {
    function foo() public virtual override {
        emit Log("C.foo called");
        A.foo();
    }

    function bar() public virtual override {
        emit Log("C.bar called");
        super.bar();
    }
}

contract D is B, C {
    // Try:
    // - 调用 D.foo  查看交易日志可以看到，虽然D 继承了A,B,C,但只顺序的打印了 C的，然后是A，B 的调用并没有. 因为在C这里使用了A.foo() 直接指定了上一级调用为A。
    function foo() public override(B, C) {
        super.foo();
    }
// - 调用 D.bar  查看交易日志可以看到，D继承顺序是 A,B,C,打印顺序为了C->B->A 因为C中bar 使用的是super ,因此继承往上一层调用就到B了。然后就是A
//查看solidity 文档对super 的定义
//super: the contract one level higher in the inheritance hierarchy 
//其实大致意思就是沿着is 继承列表再上一层。
    function bar() public override(B, C) {
        super.bar();
    }
}
```


### test16

``` js
/**
抽象合约与接口
solidity 类似java 一样，有抽象合约，当合约中至少有一个方法只有声明没有实现时，便可以使用关键字abstract把合约声明为抽象合约。抽象合约无法被实例化发布到区块链上，只能作为基类被其他合约所继承。
 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract Base1  {
    function foo() public pure virtual returns (string memory);
}
abstract contract Base2  {
    function foo() public pure virtual returns (string memory);
}
contract Parent1 is Base1 {
    function foo() public pure virtual override returns (string memory) {
        return "Parent1";
    }
}
contract Parent2 is Base1,Base2 {
    function foo() public pure virtual override(Base1,Base2) returns (string memory) {
        return "Parent2";
    }
}


/**
接口 Interface
接口与抽象合约相似，但接口内没有任何函数是已实现的，此外还有如下一些限制：
1.不能继承其它合约但可以继承接口
2.所声明函数必须是external
3.不能定义构造函数
4.不能定义状态变量
5.不能定义函数修饰器


 */

interface  IBase1  {
    function foo() external   returns (string memory);
}
interface  IBase2  {
    //接口函数默认就是virtual，不需要重复声明
    function foo() external  returns (string memory);
}
contract Parent1 is IBase1 {
    //如果是单实现一个接口，不需要再使用override 关键字，但如下 Parent2 则需要
    function foo() public pure  returns (string memory) {
        return "Parent1";
    }
}
contract Parent2 is IBase1,IBase2 {
    function foo() public pure override(IBase1,IBase2) returns (string memory) {
        return "Parent2";
    }
}




////////


contract Counter {
    uint public count;

    function increment() external {
        count += 1;
    }
}

interface ICounter {
    function count() external view returns (uint);
    function increment() external;
}

contract DyContract {
    //通过使用接口，实现程序的扩展性和后期的维护性
    function incrementCounter(address _counter) external {
        ICounter(_counter).increment();
    }

    function getCount(address _counter) external view returns (uint) {
        return ICounter(_counter).count();
    }
}
```





## 参考

- [SOLIDITY 基础入门系列](https://www.it1129.com/2022/03/07/solidity-%e5%9f%ba%e7%a1%80%e5%85%a5%e9%97%a8%e7%b3%bb%e5%88%97/)



<fix-link label="Back" href="/more/web3/"></fix-link>