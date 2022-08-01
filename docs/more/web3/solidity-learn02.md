---
title: Solidity入门笔记02
date: 2022-07-17 21:25:05
permalink: false
categories:
  - web3
tags:
  - web3
  - solidity
---


# Solidity入门笔记02


## 练习


### test17

``` js

/**
PAYABLE 接收ETH的函数修饰符
https://www.it1129.com/2022/02/26/payable-%e6%8e%a5%e6%94%b6eth%e7%9a%84%e5%87%bd%e6%95%b0%e4%bf%ae%e9%a5%b0%e7%ac%a6/

测试该合约，需要把合约通过remix 发布到 Ganache 测试环境中。然后remix 连接到本地ganache 环境
HTTP://127.0.0.1:7545 。 发布时输入10个ETH

 */



// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Account {
    // 账号持有人可以接收Ether，也就是发布该合约的创建者账号
    address payable public owner;

    //构造函数中声明 Payable，在发布的时候可以给该合约发送ETH
    constructor() payable {
        owner = payable(msg.sender);
    }

    // Function to deposit Ether into this contract.
    // 声明为payable的函数在调用都可以给该合约发送ETH
    // 合约账号的余额会自动更新
    function deposit() public payable {}
     //如果不加入该方法，在metamask 中把该合约当Token来引入后后无法看到余额
     //因为这也正是ERC20 的接口
    function balanceOf(address account) public  view returns (uint) {
        return address(this).balance;
    }

    // Call this function along with some Ether.
    //调用该函数并发送ETH会报错，因为没有声明为payable  The function will throw an error since this function is not payable.
    function notPayable() public payable {}


    //从该合约中提取合约所有的ETH 到该合约的创建者
    function withdraw() public {
        // get the amount of Ether stored in this contract
        uint amount = address(this).balance;

        // send all Ether to owner
        // Owner can receive Ether since the address of owner is payable
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    //转账功能
    function transfer(address payable _to, uint _amount) public {
        // Note that "to" is declared as payable
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed to send Ether");
    }
    //注意如果没有该方法无法接收来自metamask 的转入ETH
    receive() external payable {}

}


/**
通过以下方法可以发送Ether：
1.<address payable>.transfer(uint256 amount) 发送 amount/Wei 到address (消耗2300 gas,失败时抛出 error)
2.<address payable>.send(uint256 amount) 发送amount/Wei 到address (消耗2300 gas,失败时返回false)
3.<address payable>.call{value: amount,gas:可选}(“”) 发送amount/Wei 到address ，该方法转发所有Gas 或者参数中的gas 值，返回bool。该方法加上防止重入的函数修饰器是目前推荐的方法。

通过以方法可以接收Ether：
1.receive() external payable
2.fallback() external payable
注：当调用一个不存在的合约方法时，fallback 也会被执行。
 */


contract ReceiveEther {
    /*
      fallback() or receive() 如何选择

           发送 Ether
               |
         msg.data 是否为空
              / \
            yes  no
            /     \
receive() 是否存在?  fallback()
         /   \
        yes   no
        /      \
    receive()   fallback()
    */

    // msg.data 必须为空 注意没有 function 修饰，必须声明为external ，不传参，无返回值
    receive() external payable {}

    //   msg.data 不为空 注意没有 function 修饰，必须声明为external ，不传参，无返回值
    fallback() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
     //如果不加入该方法，在metamask 中import token 后无法看到balance
    function balanceOf(address account) external view returns (uint) {
        return address(this).balance;
    }
}

contract SendEther {
    bool public locked;
    modifier noReentrancy() {
        require(!locked, "No reentrancy");

        locked = true;
        _;
        locked = false;
    }
    function sendViaTransfer(address payable _to) public payable {
        // 不推荐.
        _to.transfer(msg.value);
    }

    function sendViaSend(address payable _to) public payable {
        // 返回 boolean 值表示是否成功 
        // 不推荐.
        bool sent = _to.send(msg.value);
        require(sent, "Failed to send Ether");
    }

    function sendViaCall(address payable _to) public payable noReentrancy {
        // 返回 boolean 值表示是否成功 
        // 该方法配合防止重入的函数修饰器是当前推荐的方法
        (bool sent, bytes memory data) = _to.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }
}
```

### test18

``` js

/**
CALL, DELEGATECALL 调用其他合约
https://www.it1129.com/2022/02/27/call-delegatecall-%e8%b0%83%e7%94%a8%e5%85%b6%e4%bb%96%e5%90%88%e7%ba%a6/

call/delegatecall 都是调用其他合约的底层方法，都返回bool，表示是否成功的调用，或者是失败引起了EVM异常。该方法无法直接访问函数返回结果(因为需要事前知道编码和返回结果大小)，即使返回true，并不能说操作成功了，只是没有出现异常，比如调用可以被fallback()函数接收而返回true。

在中大型的项目中，不可能在两三个智能合约中实现所有的功能，为了项目的协同分式，会把代码按功能划分到不同的库或者合约中，并提供接口互相调用。在Solidity中，如果只是为了代码复用，可以把公共代码抽出来，部署到一个library中，后面就可以像调用Java库，python 库一样使用了。但是Solidity library中不允许定义任何storage类型的变量，这就意味着library不能修改合约的状态。如果需要修改合约状态，我们需要部署一个新的合。这就是delegatecall存在的原因。

类似delegatecall 的函数还有 callcode，但在0.5.0 已经移除，实际上，可以认为delegatecall是callcode的一个bugfix版本，官方已经不建议使用callcode了。


 */




 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
call 使用示例：
 */
contract A {
    address public sender;
    string public  message;
    uint  public num;
    event ReceivedA(address caller, uint amount, string message);

    fallback() external payable {
        emit ReceivedA(msg.sender, msg.value, "Fallback was called");
    }
    receive()external payable
    {
        emit ReceivedA(msg.sender, msg.value, "receive was called");
    }
   
    function foo(string memory _message, uint _num) public payable returns (uint) {
        sender=msg.sender;
        message=_message;
        num=_num*2;
        emit ReceivedA(msg.sender, msg.value, _message);
        return _num + 1;
    }
    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }
}

contract B {
    address public sender;
    string public  message;
    uint  public num;
    event ResponseB(address caller,bool success, bytes data);
    event ReceivedB(address caller, uint amount, string message);
    // 如果没有A的源码，但有A的地址，与方法签名，那么就可以通过call 与 发起调用 
    function testCallFoo(address payable _addrA,string memory _message, uint _num) public payable {
        // 也可以设置发布ETH 与 自定义Gas 如: _addr.call{value: msg.value, gas: 5000}
        //注意abi.encodeWithSignature("foo(string,uint256)", "call foo", 123) 虽然A 的方法签名写的是 uint ，但此处还是需要明确指明为 uint256
        // (bool success, bytes memory data) = _addrA.call{value: msg.value}(
        //     abi.encodeWithSignature("foo(string,uint256)", "call foo", 123)
        // );
        //如果有A的源码 可以使用 encodeWithSelector
        sender=msg.sender;
        message=_message;
        num=_num;
        (bool success, bytes memory data) = _addrA.call{value: msg.value-10}(abi.encodeWithSelector(A.foo.selector,_message, _num));
        emit ResponseB(msg.sender,success, data);
    }
    //因为向A 发起调用时，msg.value-10 剩下10Wei 是进了B 自己口袋，其余的才到了A的口袋
    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }
    fallback() external payable {
        emit ReceivedB(msg.sender, msg.value, "Fallback was called");
    }
    receive()external payable
    {
        emit ReceivedB(msg.sender, msg.value, "receive was called");
    }
    // 调用一个不存在的函数
    function testCallDoesNotExist(address _addrA) public {
        (bool success, bytes memory data) = _addrA.call(
            abi.encodeWithSignature("doesNotExist()")
        );

        emit ResponseB(msg.sender,success, data);
    }
}




/**
以下是delegatecall 示例：
 */

contract A {
    address public sender;
    string public  message;
    uint  public num;
    event ReceivedA(address caller, uint amount, string message);

    fallback() external payable {
        emit ReceivedA(msg.sender, msg.value, "Fallback was called");
    }
    receive()external payable
    {
        emit ReceivedA(msg.sender, msg.value, "receive was called");
    }
   
    function foo(string memory _message, uint _num) public payable returns (uint) {
        sender=msg.sender;
        message=_message;
        num=_num*2;
        emit ReceivedA(msg.sender, msg.value, _message);
        return _num + 1;
    }
    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }
}

contract B {
     // NOTE: 此时状态变量顺序也类型都必须与A 的相同
    address public sender;
    string public  message;
    uint  public num;
    event ResponseB(address caller,bool success, bytes data);

    function testCallFoo(address payable _addrA,string memory _message, uint _num) public payable {
        // 自定义Gas 如: _addr.call{gas: 5000} 不能带 value: msg.value, 
        //注意abi.encodeWithSignature("foo(string,uint256)", "call foo", 123) 虽然A 的方法签名写的是 uint ，但此处还是需要明确指明为 uint256
        // (bool success, bytes memory data) = _addrA.call(
        //     abi.encodeWithSignature("foo(string,uint256)", "call foo", 123)
        // );
        sender=msg.sender;
        message=_message;
        num=_num;
        (bool success, bytes memory data) = _addrA.delegatecall(abi.encodeWithSelector(A.foo.selector,_message, _num));
        emit ResponseB(msg.sender,success, data);
    }
    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }
}



/**
在文章 call/delegatecall 讲述了调用合约的两个底层方法，但其实还有另外的方法，虽然这种办法官方文档写着是不推荐，但做为示例让各位知道还能这么调用。
 */

//如下文件名字为foo.sol
contract CallB {
    uint public x;
    uint public value;
    //设置状态亦是X
    function setX(uint _x) public returns (uint) {
        x = _x;
        return x;
    }
    //当调用 setXandSendEth 可以通过该方法获得余额
    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }
    function setXandSendEth(uint _x) public payable returns (uint, uint) {
        x = _x;
        value = msg.value;
        return (x, value);
    }
}


import {Callee} from "./foo.sol";
//使用import 引入另外一个合约
contract Caller {
    //虽然声明为合约类型，但在Remix 中可以看到最终还是转入的Callee的地址
    //所以其实跟方法setXFromAddress 其实是一样的，只是少了一行转换的语名
    function setX(Callee _callee, uint _x) public {
        uint x = _callee.setX(_x);
    }

    function setXFromAddress(address _addr, uint _x) public {
        Callee callee = Callee(_addr);
        callee.setX(_x);
    }
   //同时发送ETH 到 _callee
    function setXandSendEth(Callee _callee, uint _x) public payable {
        (uint x, uint value) = _callee.setXandSendEth{value: msg.value}(_x);
    }
}
```


### test19

``` js

/**
通过NEW 创建合约

如果A 合约知道B合约的完整代码，那么可以通过new 关键字在A 内创建B 的合约实例。创建 B 实例时可以通过 value 参数发送ETH，但却无法指定或者说限制gas 的参数。如果由于栈溢出，余额不足或者其他原因导致创建失败，会抛出异常。

使用new 创建的合约B实例的地址是根据A的地址再加上一个计数器(根据 solidity 文档，该计数器为nonce),如果在new 时加入salt 参数，合约B 的地址计算是使用A 的地址，salt(bytes32 类型 )值，B的字节码，B构造函数的参数计算出来的新的地址。因为不使用Nonce 做计数，有了这一特性，我们可以提前计算出合约B 的地址。
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bus {
    address public owner;
    string public model;
    address public busAddr;

    constructor(address _owner, string memory _model) payable {
        owner = _owner;
        model = _model;
        busAddr = address(this);
    }
}

contract BusFactory {
    Bus[] public busList;

    function create(address _owner, string memory _model) public {
        Bus bus = new Bus(_owner, _model);
        busList.push(bus);
    }
    //与create 不一样，向create2输入同样的参数时，第二次就创建失败了,因为同一个地址只能有一份合约实例
    function create2(address _owner,string memory _model,bytes32 _salt) public 
    {
        Bus bus = (new Bus){salt: _salt}(_owner, _model);
        busList.push(bus);
    }
    function createAndSendEther(address _owner, string memory _model) public payable {
        Bus bus = (new Bus){value: msg.value}(_owner, _model);
        busList.push(bus);
    }
    function create2AndSendEther(address _owner,string memory _model,bytes32 _salt) public payable {
        Bus bus = (new Bus){value: msg.value, salt: _salt}(_owner, _model);
        busList.push(bus);
    }

    function getBus(uint _index) public view returns (address owner,string memory model,address bus_addr,uint balance)
    {
        Bus bus = busList[_index];
        return (bus.owner(), bus.model(), bus.busAddr(), address(bus).balance);
    }
}


/**
如下示例计算如何计算salted 加盐的合约创建。

什么是加盐
盐 (Salt) 在密码学中，是指通过在密码任意固定位置插入特定的字符串，让散列后的结果和使用原始密码的散列结果不相符，这种过程称之为 “加盐”。密码不能以明文形式保存到数据库中，否则数据泄露密码就会被知道。而一般的加密方式由于加密规则固定，很容易被破解，安全系数不高。密码加盐的加密方式，能很好的解决这一点。
 */

contract Bus {
    address public owner;
    string public model;
    address public busAddr;

    constructor(address _owner, string memory _model) payable {
        owner = _owner;
        model = _model;
        busAddr = address(this);
    }
}

contract BusFactory {
    event Log(string,address);
    function calculateSaltedAddress(address _owner, string memory _model,bytes32 _salt) public {
       address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(bytes1(0xff), address(this),_salt, keccak256(abi.encodePacked(type(Bus).creationCode,abi.encode(_owner,_model))))))));
        emit Log("predictedAddress",predictedAddress);
        Bus d = new Bus{salt: _salt}(_owner,_model);
        emit Log("d address ==> ",address(d));
        require(address(d) == predictedAddress,"address is not the same");
    }
   
}

/**
solidity 官方示例只带一个参数是这样计算的：
address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(bytes1(0xff), address(this),salt, keccak256(abi.encodePacked(type(D).creationCode,arg)))))));
但当参数有多个需要使用abi.encode 串起各参数。

也可以使用create2 计算到合约的地址，并能发布合约，请查看 create2 发布合约:

在上一文章 通过new 在创建合约 我们知道如何使用new 创建合约，本文章通过示例展示如何通过create2 创建合约，该效果跟 new 加上salted 是一样的。都是可预先计算的合约地址。
https://www.it1129.com/2022/02/28/%e4%bd%bf%e7%94%a8-create2-%e5%8f%91%e5%b8%83%e5%90%88%e7%ba%a6/
 */

contract DeployFactory {
    event Deployed(address addr, uint salt);

    // 1. 获取需要发布的合约字节友 bytecode of contract to be deployed
    // NOTE: _owner and _foo 是 TestContract构造函数的参数
    function getBytecode(address _owner, uint _foo) public pure returns (bytes memory) {
        bytes memory bytecode = type(TestContract).creationCode;
        return abi.encodePacked(bytecode, abi.encode(_owner, _foo));
    }

    // 2. 计算合约的地址
    // NOTE: _salt 随机数
    function precomputeDeployContractAddress(bytes memory bytecode, uint _salt)public view returns (address)
    {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), _salt, keccak256(bytecode)));
        return address(uint160(uint(hash)));
    }

    // 3. 发布合约
    // NOTE:
    // Check the event log Deployed which contains the address of the deployed TestContract.
    // The address in the log should equal the address computed from above.
    function deploy(address _owner, uint _foo , uint _salt) public payable {
        address addr;
        bytes memory bytecode=getBytecode(_owner,_foo);
        /*
        NOTE: 如何使用 create2 发布合约并返回合约地址

        create2(v, p, n, s)
        v 是需要发送的Wei
        合约代码是在内容地址于 p to p + n
        and return the new address
        where new address = first 20 bytes of keccak256(0xff + address(this) + s + keccak256(mem[p…(p+n)))
              s = big-endian 256-bit value
        */
        assembly {
            addr := create2(
                callvalue(), //发送当前调用的Wei 值 官方注解是这样的：Wei sent together with the current call
                // Actual code starts after skipping the first 32 bytes
                add(bytecode, 0x20),
                mload(bytecode), // Load the size of code contained in the first 32 bytes
                _salt // Salt from function arguments
            )

            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        //不使用create2 计算出来的合约地址值
        address addr2 = precomputeDeployContractAddress(bytecode,_salt);
        require(addr2==addr,"address is not match");
        emit Deployed(addr, _salt);
    }
}

contract TestContract {
    address public owner;
    uint public foo;

    constructor(address _owner, uint _foo) payable {
        owner = _owner;
        foo = _foo;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

/**
在remix 发布后 在方法 deploy 输入：
0x5B38Da6a701c568545dCfcB03FcB875f56beddC4,10,”0x666f4D0000000000000000000000000000000000000000000000000000000000″

但可以发布TestContract 且在日志中知道新合约的地址，使用该地址，可以在remix 重新加载该地址的合约。
 */
```


### test20

``` js

/**
IMPORT 引入合约

类似于js(ES6) solidity 支持import 语句从其他合约文件中引入合约，但跟js 不一样的是没有default export 默认导出。看如下几种使用方法：

import “filename”;
filename 是引入路径，这种写法会把filename 中所有全局符号（合约，struct，函数，错误定义等） 引入到当前文件的全局范围，但这种方式并不推荐，容易引起命名冲突。

import * as symbolName from “filename”;
创建一个全局的symbolName ，然后filename中的所有symbol 都可以通过 symbolName.symbol 引用到
等同于：import “filename” as symbolName;

import {symbol1 as alias, symbol2} from “filename”;
这种是加入别名
 */



/**
以下文件是Foo.sol
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Position {
    uint x;
    uint y;
}

error InsufficientBalance(address caller);

function addTowUint(uint x, uint y) pure returns (uint) {
    return x + y;
}

contract Foo {
    string public name = "Foo";
}





/**
以下文件为Import.sol
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 从当前目录中引入 Foo.sol  这种方法找不推荐
import "./Foo.sol";

// import {symbol1 as alias, symbol2} from "filename";
import {InsufficientBalance, addTowUint as func, Position} from "./Foo.sol";

contract ImportTest {
   //因为import "./Foo.sol"; Foo 已经是全局了，
    Foo public foo = new Foo(); 

    function getFooName() public view returns (string memory) {
        return foo.name();
    }
}
```

### test21

``` js

/**
LIBRARY 库

Lib库与合约类似，只能发布一次，通过EVM 的 DELEGATECALL 特性实现代码的复用。 关于delegatecall 的可以参考 call, delegatecall 调用其他合约 。当调用库函数时其代码是在调用者的上下文中执行的，比如 this 指向当前调用者，可以访问调用者的storage。lib 有如下限制：
1.不能定义状态变量
2.不能继承与被继承
3.不能接收ETH
4.发布后无法销毁
 */


/**
MathLib.sol
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
library MathLib {
    function add(uint x, uint y) public pure returns (uint) {
        uint z = x + y;
        require(z >= x, "uint overflow");

        return z;
    }
}



// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {MathLib} from "./MathLib.sol";
contract TestLib{
    event Log(string msg,uint num);
    using MathLib for uint;
    function test_add1(uint x1,uint x2) public  
    {
        uint result= MathLib.add(x1,x2);
        emit Log("test_lib1 ",result);
    }
    function test_add2(uint x1,uint x2) public  
    {
        uint result= x1.add(x2);
        emit Log("test_lib2 ",result);
    }
}


/**
我们并不打算在此示例里实现什么有用的库，而是为大家展示lib 的用法。在TestLib 中展示了lib 的使用方法，
一种是MathLib.add ，这种写法就像MathLib 是TestLib 的基类一样，但其实并没有这种关系，因为如果是基类的话，MathLib.add 就是一种内部函数调用(internal call)，MathLib的代码在编译的时候会拷贝到TestLib，调用的时候采用JUMP 指令。但Libary 使用的是 DELEGATECALL，是外部函数调用(external call),因此msg.sender, msg. value 跟 this 都跟调用者的是一样的。大家可以尝试在打印出来即可验证。

另外一种使用方法是如test_add2中 的一样，采用 using MathLib for uint; 把 MathLib 的代码绑定到uint 这种类型运行的上下文中，这样在当前合约的运行环境中，uint 就有了MathLib 中的所有函数。因此可以直接调用：x1.add(x2)。 注意使用这种方式，当调用MathLib 中的函数时传递的第一个参数就是uint。

除此还可以使用 using MathLib for *; 把MathLib 绑定到任意类型中。这两种使用方式都有可能出现第一个参数的传递出现类型不匹配的情况， 此时编译出现类型错误：TypeError: Member “add” not found or not visible after argument-dependent lookup in int256.
 */



// 所有的外部库函数调用实际是EVM 函数调用，所以如果你传递的是memory 类型，或者值类型，这些参数都是以拷贝的方式进行传递，除非把参数声明为storage 类型。如下示例：


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
library ArrayLib {
    function indexOf(uint[] storage self, uint value) public view returns (uint) 
    {
        for (uint i = 0; i < self.length; i++) 
            if (self[i] == value) 
                return i;
        return type(uint).max; 
    }

}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {ArrayLib} from "./ArrayLib.sol";
contract TestArrayLib {
    using ArrayLib for uint[]; 
    uint[] data;
    function append(uint value) public { 
        data.push(value);
    }
    function replace(uint _old, uint _new) public { 
        //ArrayLib传递的是storage 从而避免了拷贝
        uint index = data.indexOf(_old);
        if (index == type(uint).max)
            data.push(_new);
        else
            data[index] = _new;
    }   
}
```


### test22

``` js

/**
使用KECCAK256 获取HASH 字符串

先看官方的方法签名与解析：
keccak256(bytes memory) returns (bytes32) compute the Keccak-256 hash of the input
输入bytes 数值，返回的是Keccak-256 hash 值。
在0.5.0 版本前该方法也叫sha3 。

keccak256的返回值是bytes32类型，意味着其返回值是一个256位的随机数。一般使用一些全局属性，比如时间block.timestamp,msg.sender,block.number等全局属性来构造随机数。
 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashHelper {
    function generateHash(string memory _text,uint _num,address _addr) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_text, _num, _addr));
    }

    //  hash 冲突问题
    // 当输入多个参数做has时，因此有可能最后encodePacked 出来的bytes 是一样的，如下面例子。此时可以使用 abi.encode
    function collision_test(string memory _text, string memory _anotherText)
        public
        pure
        returns (bytes32)
    {
        // return keccak256(abi.encodePacked(_text, _anotherText));
        // encodePacked(AAA, BBB) 值为 AAABBB
        // encodePacked(AA, ABBB) 值为 AAABBB
        //因为最后的结果都是一样的，所有会导致keccak256 出来的值是一样的。所以需要使用 abi.encode
        return keccak256(abi.encode(_text, _anotherText));
    }
}


// 假设我们的游戏要保证有80% 的概率能赢，查看如何实现：

 function test_rate() public view returns(bool)
    {
      bytes32 hash_msg=keccak256(abi.encodePacked(block.timestamp,msg.sender));
      if(uint256(hash_msg) % 100  < 70)
      {
        return true;
      }
      return false;
    }

// 但官方文档是建议我们不能依赖 block.timestamp or blockhash 做为随机源。以上只做为示例学习使用keccak256。

```


## 示例

### 简单读写合约

``` js

// SPDX-License-Identifier: GPL-3.0 // 第一行是说明源代码是根据GPL 3.0版本授权的

// 关键字 pragma 版本标识指令，用来启用某些编译器检查， 版本 标识pragma 指令通常只对本文件有效，所以我们需要把这个版本 标识pragma 添加到项目中所有的源文件。 如果使用了 import 导入 其他的文件, 标识pragma 并不会从被导入的文件，加入到导入的文件中。
pragma solidity >=0.4.16 <0.9.0; // 告诉编译器源代码所适用的Solidity版本为>=0.4.16 及 <0.9.0 ; 这样的说明是为了确保合约不会在新的编译器版本中发生异常的行为。关键字 pragma 是告知编译器如何处理源代码的通用指令


// Solidity中智能合约的含义就是一组代码（它的 功能 )和数据（它的 状态 ）的集合，并且它们是位于以太坊区块链的一个特定地址上的。
contract SimpleStorage {
    uint storedData; // 这一行代码声明了一个名为``storedData``的状态变量，其类型为 uint (256位无符号整数）

    // 关键字“public”让这些变量可以从外部读取
    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
```


### 投票合约

``` js
/**
投票合约
我们的想法是为每个（投票）表决创建一份合约，为每个选项提供简称。 然后作为合约的创造者——即主席，将给予每个独立的地址以投票权。
地址后面的人可以选择自己投票，或者委托给他们信任的人来投票。
在投票时间结束时，winningProposal() 将返回获得最多投票的提案。
 */


// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/// @title 委托投票
contract Ballot {
    // 这里声明了一个新的复合类型用于稍后的变量
    // 它用来表示一个选民
    struct Voter {
        uint weight; // 计票的权重
        bool voted;  // 若为真，代表该人已投票
        address delegate; // 被委托人
        uint vote;   // 投票提案的索引
    }

    // 提案的类型
    struct Proposal {
        bytes32 name;   // 简称（最长32个字节）
        uint voteCount; // 得票数
    }

    address public chairperson;

    // 这声明了一个状态变量，为每个可能的地址存储一个 `Voter`。
    mapping(address => Voter) public voters;

    // 一个 `Proposal` 结构类型的动态数组
    Proposal[] public proposals;

    /// 为 `proposalNames` 中的每个提案，创建一个新的（投票）表决
    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        //对于提供的每个提案名称，
        //创建一个新的 Proposal 对象并把它添加到数组的末尾。
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` 创建一个临时 Proposal 对象，
            // `proposals.push(...)` 将其添加到 `proposals` 的末尾
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // 授权 `voter` 对这个（投票）表决进行投票
    // 只有 `chairperson` 可以调用该函数。
    function giveRightToVote(address voter) external {
        // 若 `require` 的第一个参数的计算结果为 `false`，
        // 则终止执行，撤销所有对状态和以太币余额的改动。
        // 在旧版的 EVM 中这曾经会消耗所有 gas，但现在不会了。
        // 使用 require 来检查函数是否被正确地调用，是一个好习惯。
        // 你也可以在 require 的第二个参数中提供一个对错误情况的解释。
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            !voters[voter].voted,
            "The voter already voted."
        );
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }

    /// 把你的投票委托到投票者 `to`。
    function delegate(address to) external {
        // 传引用
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");

        require(to != msg.sender, "Self-delegation is disallowed.");

        // 委托是可以传递的，只要被委托者 `to` 也设置了委托。
        // 一般来说，这种循环委托是危险的。因为，如果传递的链条太长，
        // 则可能需消耗的gas要多于区块中剩余的（大于区块设置的gasLimit），
        // 这种情况下，委托不会被执行。
        // 而在另一些情况下，如果形成闭环，则会让合约完全卡住。
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // 不允许闭环委托
            require(to != msg.sender, "Found loop in delegation.");
        }

        // `sender` 是一个引用, 相当于对 `voters[msg.sender].voted` 进行修改
        Voter storage delegate_ = voters[to];

        // Voters cannot delegate to wallets that cannot vote.
        require(delegate_.weight >= 1);

        sender.voted = true;
        sender.delegate = to;

        if (delegate_.voted) {
            // 若被委托者已经投过票了，直接增加得票数
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // 若被委托者还没投票，增加委托者的权重
            delegate_.weight += sender.weight;
        }
    }

    /// 把你的票(包括委托给你的票)，
    /// 投给提案 `proposals[proposal].name`.
    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;

        // 如果 `proposal` 超过了数组的范围，则会自动抛出异常，并恢复所有的改动
        proposals[proposal].voteCount += sender.weight;
    }

    /// @dev 结合之前所有的投票，计算出最终胜出的提案
    function winningProposal() external view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    // 调用 winningProposal() 函数以获取提案数组中获胜者的索引，并以此返回获胜者的名称
    function winnerName() public view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}
```

### 秘密竞拍合约

``` js
/**
秘密竞拍（盲拍）
在 投标期间 ，投标人实际上并没有发送她的出价，而只是发送一个哈希版本的出价。 由于目前几乎不可能找到两个（足够长的）值，其哈希值是相等的，因此投标人可通过该方式提交报价。 在投标结束后，投标人必须公开他们的出价：他们不加密的发送他们的出价，合约检查出价的哈希值是否与投标期间提供的相同。
 */

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract BlindAuction {
    struct Bid {
        bytes32 blindedBid;
        uint deposit;
    }

    address payable public beneficiary;
    uint public biddingEnd;
    uint public revealEnd;
    bool public ended;

    mapping(address => Bid[]) public bids;

    address public highestBidder;
    uint public highestBid;

    // 可以取回的之前的出价
    mapping(address => uint) pendingReturns;

    event AuctionEnded(address winner, uint highestBid);


    // Errors that describe failures.

    /// The function has been called too early.
    /// Try again at `time`.
    error TooEarly(uint time);
    /// The function has been called too late.
    /// It cannot be called after `time`.
    error TooLate(uint time);
    /// The function auctionEnd has already been called.
    error AuctionEndAlreadyCalled();

    /// 使用 modifier 可以更便捷的校验函数的入参。
    /// `onlyBefore` 会被用于后面的 `bid` 函数：
    /// 新的函数体是由 modifier 本身的函数体，并用原函数体替换 `_;` 语句来组成的。
    modifier onlyBefore(uint time) {
        if (block.timestamp >= time) revert TooLate(time);
        _;
    }
    modifier onlyAfter(uint time) {
        if (block.timestamp <= time) revert TooEarly(time);
        _;
    }

    constructor(
        uint biddingTime,
        uint revealTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        biddingEnd = block.timestamp + biddingTime;
        revealEnd = biddingEnd + revealTime;
    }

    /// 可以通过 `blindedBid` = keccak256(value, fake, secret)
    /// 设置一个秘密竞拍。
    /// 只有在出价披露阶段被正确披露，已发送的以太币才会被退还。
    /// 如果与出价一起发送的以太币至少为 “value” 且 “fake” 不为真，则出价有效。
    /// 将 “fake” 设置为 true ，然后发送满足订金金额但又不与出价相同的金额是隐藏实际出价的方法。
    /// 同一个地址可以放置多个出价。
    function bid(bytes32 blindedBid)
        external
        payable
        onlyBefore(biddingEnd)
    {
        bids[msg.sender].push(Bid({
            blindedBid: blindedBid,
            deposit: msg.value
        }));
    }

    /// 披露你的秘密竞拍出价。
    /// 对于所有正确披露的无效出价以及除最高出价以外的所有出价，你都将获得退款。
    function reveal(
        uint[] calldata values,
        bool[] calldata fake,
        bytes32[] calldata secret
    )
        external
        onlyAfter(biddingEnd)
        onlyBefore(revealEnd)
    {
        uint length = bids[msg.sender].length;
        require(values.length == length);
        require(fake.length == length);
        require(secret.length == length);

        uint refund;
        for (uint i = 0; i < length; i++) {
            Bid storage bid = bids[msg.sender][i];
            (uint value, bool fake, bytes32 secret) =
                    (values[i], fake[i], secret[i]);
            if (bid.blindedBid != keccak256(value, fake, secret)) {
                // 出价未能正确披露
                // 不返还订金
                continue;
            }
            refund += bid.deposit;
            if (!fake && bid.deposit >= value) {
                if (placeBid(msg.sender, value))
                    refund -= value;
            }
            // 使发送者不可能再次认领同一笔订金
            bid.blindedBid = bytes32(0);
        }
        msg.sender.transfer(refund);
    }

    // 这是一个 "internal" 函数， 意味着它只能在本合约（或继承合约）内被调用
    function placeBid(address bidder, uint value) internal
            returns (bool success)
    {
        if (value <= highestBid) {
            return false;
        }
        if (highestBidder != address(0)) {
            // 返还之前的最高出价
            pendingReturns[highestBidder] += highestBid;
        }
        highestBid = value;
        highestBidder = bidder;
        return true;
    }

    /// 取回出价（当该出价已被超越）
    function withdraw() external {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // 这里很重要，首先要设零值。
            // 因为，作为接收调用的一部分，
            // 接收者可以在 `transfer` 返回之前重新调用该函数。（可查看上面关于‘条件 -> 影响 -> 交互’的标注）
            pendingReturns[msg.sender] = 0;

            msg.sender.transfer(amount);
        }
    }

    /// 结束拍卖，并把最高的出价发送给受益人
    function auctionEnd()
        external
        onlyAfter(revealEnd)
    {
        if (ended) revert AuctionEndAlreadyCalled();
        emit AuctionEnded(highestBidder, highestBid);
        ended = true;
        beneficiary.transfer(highestBid);
    }
}
```

### 交易合约

``` js


// SPDX-License-Identifier: GPL-3.0  // 第一行是说明源代码是根据GPL 3.0版本授权的

// 源文件将既不允许低于 0.8.4 版本的编译器编译， 也不允许高于（包含） 0.9.0 版本的编译器编译（第二个条件因使用 ^ 被添加）
pragma solidity ^0.8.4;

contract Coin {
    // 关键字“public”让这些变量可以从外部读取，关键字 public 自动生成一个函数，允许你在这个合约之外访问这个状态变量的当前值。如果没有这个关键字，其他的合约没有办法访问这个变量。
    // 这一行声明了一个可以被公开访问的 address 类型的状态变量。address 类型是一个160位的值，且不允许任何算数操作。这种类型适合存储合约地址或外部人员的密钥对。
    // 由编译器生成的函数的代码大致如下所示: function minter() external view returns (address) { return minter; }
    address public minter; 


    // 创建一个公共状态变量，但它是一个更复杂的数据类型。 该类型将address映射为无符号整数
    // Mappings 可以看作是一个 哈希表 它会执行虚拟初始化，以使所有可能存在的键都映射到一个字节表示为全零的值。
    /**
    function balances(address account) external view returns (uint) {
        return balances[account];
    }
     */
    mapping (address => uint) public balances;


    // 轻客户端可以通过事件针对变化作出高效的反应
    // 这行声明了一个所谓的“事件（event）”，它会在 send 函数的最后一行被发出
    /**
    用户界面（当然也包括服务器应用程序）可以监听区块链上正在发送的事件，而不会花费太多成本。一旦它被发出，监听该事件的listener都将收到通知。而所有的事件都包含了 from ， to 和 amount 三个参数，可方便追踪交易。
    为了监听这个事件，你可以使用如下JavaScript代码: 
    Coin.Sent().watch({}, '', function(error, result) {
        if (!error) {
            console.log("Coin transfer: " + result.args.amount +
                " coins were sent from " + result.args.from +
                " to " + result.args.to + ".");
            console.log("Balances now:\n" +
                "Sender: " + Coin.balances.call(result.args.from) +
                "Receiver: " + Coin.balances.call(result.args.to));
        }
    })
     */
    event Sent(address from, address to, uint amount);




    // 特殊函数 constructor 是仅在创建合约期间运行的构造函数，不能在创建之后调用。 
    // 构造函数永久存储创建合约的人的地址: msg (类似的还有 tx 和 block ) 是一个特殊的全局变量    
    constructor() {
        minter = msg.sender; // msg.sender 始终记录当前（外部）函数调用是来自于哪一个地址。
    }

    

    // mint 函数用来新发行一定数量的币到一个地址
    function mint(address receiver, uint amount) public {
        // require 用来检查某些条件，如果不满足这些条件就会回推所有的状态变化。
        require(msg.sender == minter); // 确保只有合约的创建者可以调用 mint
        // 请注意，由于默认的 算术检查模式 ，如果表达式 balances[receiver] += amount 溢出交易将被还原。 即当任意精度算术中的 balances[receiver]+ amount 大于 uint (2**256 - 1)
        balances[receiver] += amount;
    }

    // Errors allow you to provide information about
    // why an operation failed. They are returned
    // to the caller of the function.
    // Errors 用来向调用者描述错误信息。Error与 revert 语句 一起使用; revert 语句无条件地中止执行并回退所有的变化，类似于 require 函数
    error InsufficientBalance(uint requested, uint available);


    // 任何人（已经拥有一些代币）都可以使用 send 函数来向其他人发送代币。
    function send(address receiver, uint amount) public {
        // 如果发送者没有足够的代币可以发送， if 条件为真 revert 将触发失败，并通过 InsufficientBalance 向发送者提供错误细节。
        if (amount > balances[msg.sender])
            revert InsufficientBalance({
                requested: amount,
                available: balances[msg.sender]
            });

        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Sent(msg.sender, receiver, amount);
    }
}
```


### 公开拍卖合约

``` js
/**
简单的公开拍卖
以下简单的拍卖合约的总体思路是每个人都可以在投标期内发送他们的出价。 出价已经包含了资金/以太币，来将投标人与他们的投标绑定。 如果最高出价提高了（被其他出价者的出价超过），之前出价最高的出价者可以拿回她的钱。 在投标期结束后，受益人需要手动调用合约来接收他的钱 - 合约不能自己激活接收。
 */

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract SimpleAuction {
    // 拍卖的参数。
    address payable public beneficiary;
    // 时间是unix的绝对时间戳（自1970-01-01以来的秒数）
    // 或以秒为单位的时间段。
    uint public auctionEnd;

    // 拍卖的当前状态
    address public highestBidder;
    uint public highestBid;

    //可以取回的之前的出价
    mapping(address => uint) pendingReturns;

    // 拍卖结束后设为 true，将禁止所有的变更
    bool ended;

    // 变更触发的事件
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    // Errors 用来定义失败

    // 以下称为 natspec 注释，可以通过三个斜杠来识别。
    // 当用户被要求确认交易时或错误发生时将显示。

    /// The auction has already ended.
    error AuctionAlreadyEnded();
    /// There is already a higher or equal bid.
    error BidNotHighEnough(uint highestBid);
    /// The auction has not ended yet.
    error AuctionNotYetEnded();
    /// The function auctionEnd has already been called.
    error AuctionEndAlreadyCalled();

    /// 以受益者地址 `beneficiaryAddress` 的名义，
    /// 创建一个简单的拍卖，拍卖时间为 `biddingTime` 秒。
    constructor(
        uint biddingTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        auctionEnd = block.timestamp + biddingTime;
    }

    /// 对拍卖进行出价，具体的出价随交易一起发送。
    /// 如果没有在拍卖中胜出，则返还出价。
    function bid() external payable {
        // 参数不是必要的。因为所有的信息已经包含在了交易中。
        // 对于能接收以太币的函数，关键字 payable 是必须的。

        // 如果拍卖已结束，撤销函数的调用。
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();

        // 如果出价不够高，返还你的钱
        if (msg.value <= highestBid)
            revert BidNotHighEnough(highestBid);

        if (highestBid != 0) {
            // 返还出价时，简单地直接调用 highestBidder.send(highestBid) 函数，
            // 是有安全风险的，因为它有可能执行一个非信任合约。
            // 更为安全的做法是让接收方自己提取金钱。
            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    /// 取回出价（当该出价已被超越）
    function withdraw() external returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // 这里很重要，首先要设零值。
            // 因为，作为接收调用的一部分，
            // 接收者可以在 `send` 返回之前，重新调用该函数。
            pendingReturns[msg.sender] = 0;

            // msg.sender is not of type `address payable` and must be
            // explicitly converted using `payable(msg.sender)` in order
            // use the member function `send()`.
            if (!payable(msg.sender).send(amount)) {
                // 这里不需抛出异常，只需重置未付款
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    /// 结束拍卖，并把最高的出价发送给受益人
    function auctionEnd() external {
        // 对于可与其他合约交互的函数（意味着它会调用其他函数或发送以太币），
        // 一个好的指导方针是将其结构分为三个阶段：
        // 1. 检查条件
        // 2. 执行动作 (可能会改变条件)
        // 3. 与其他合约交互
        // 如果这些阶段相混合，其他的合约可能会回调当前合约并修改状态，
        // 或者导致某些效果（比如支付以太币）多次生效。
        // 如果合约内调用的函数包含了与外部合约的交互，
        // 则它也会被认为是与外部合约有交互的。

        // 1. 条件
        if (block.timestamp < auctionEndTime)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionEndAlreadyCalled();

        // 2. 生效
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // 3. 交互
        beneficiary.transfer(highestBid);
    }
}
```






## 参考

- [SOLIDITY 基础入门系列](https://www.it1129.com/2022/03/07/solidity-%e5%9f%ba%e7%a1%80%e5%85%a5%e9%97%a8%e7%b3%bb%e5%88%97/)



<fix-link label="Back" href="/more/web3/"></fix-link>