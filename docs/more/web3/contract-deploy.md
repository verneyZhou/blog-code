---
title: 智能合约的自动部署
date: 2023-02-15 12:28:00
permalink: false
categories:
  - web3
tags:
  - 智能合约
  - solidity
  - web3
---

# 智能合约的自动部署
> 平时如果想部署自己编写的智能合约，最常用的应该是[Remix IDE](https://remix.ethereum.org)编辑器，这个在线编辑器功能确实挺强大，集成了智能合约的编写、测试、部署、钱包连接等功能，能够满足日常合约开发的大部分功能，对新手也比较友好~

> 现在也有一些其他的工具支持合约部署，比如比较流行的[Hardhat](https://hardhat.org/)框架，也能支持合约的编写、测试，及部署，只不过上手成本比 Remix 要高一些~

但上面两种都需要懂一些 Web3 的前置知识才能实现部署，对于一些Web3小白来讲，如果通过低代码可视化的方式生成一个NFT合约，想部署到链上就有点迷糊了~

这时就需要一个能够一键部署的功能，让用户可以不需要知道web3的部署原理，就能部署自己的NFT~ 需求有了，那下一步就是试着去实现了~


## 实现

> 在实现部署逻辑之前，首先需要一个可以可视化生成智能合约的页面~



### 低代码可视化

这里智能合约的低代码实现是复用[OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/wizard)官网里的 Wizard 模块，它里面已经集合了`ERC20、ERC721`等常用合约的模板，用户通过选择相应选项就可以生成一个简单的合约；

> 这里应该是 OpenZeppelin 提供给新手入门熟悉合约用的，但我们这次开发的主要技术点在于**实现合约部署**，而且这里的功能能够满足我们生成一个简单合约，所以我这边做的时候直接`clone`他们的项目下来，本地新启一个服务，然后在这个项目里加部署的逻辑，等以后需要添加其他合约时，再做更细颗粒度的设计~

- [contracts-wizard 源码地址](https://github.com/OpenZeppelin/contracts-wizard)
- [wizard.openzeppelin.com](https://wizard.openzeppelin.com/)


操作比较简单，具体如下：

``` shell
git clone git@github.com:OpenZeppelin/contracts-wizard.git # clone源码
```

下载下来的项目`packages`目录下主要有三个文件夹：
- `packages/core`: 用`Solidity`编写的合约相关逻辑；
- `packages/core-cairo`: 用`cairo`编写的合约相关逻辑，我们主要是用Solidity写合约，可以先不用关注这个；
- `packages/ui`: 这一部分就是前端UI部分，也就是上面官网看到的页面；合约部署前端的逻辑就要加在这个项目里。


先通过`yarn install`安装各自的依赖，然后进到`packages/ui`文件夹，启动项目：
``` shell
yarn install
npm run dev
```
> 不出意外的话，会启动一个`http://localhost:8080`的本地服务，直接访问就可以了~如果报错，检查下node版本（v14+）和依赖是否安装完成


该项目是用`Svelte + TS + Rollup`搭建的项目，对于`Svelte`不了解可能刚开始会有上手成本，但用法和`Vue`也比较类似，只是写法更简写了；

`Svelte`在编译的过程中没有像`Vue`和`React`一样使用`Virtual Dom`，有兴趣的可以下来研究，这里不做过多阐述~


- [Svelte中文官网](https://www.sveltejs.cn/)：官网上有很多实例可以学习，方便你快速入门~
- [rollup.js 中文文档](https://www.rollupjs.com/)
- [Tailwind CSS](https://www.tailwindcss.cn/)：一个集成了很多常用类的 CSS 框架，在该项目中用到了~


### 自动部署

> 在开始开发之前，先梳理下整体业务逻辑：
1. 前端在页面上增加一个【部署】按钮，然后用户输入助记词，选择部署网络，输入合约入参（选填）；之后调服务端的部署接口，传入合约源码信息和上述参数，等服务端返回部署结果；
2. 服务端拿到合约信息后，开始编译、部署流程，并将当前流程进度实时通知前端，方便在页面进行进度展示；
3. 部署成功后，返回部署后的地址；前端展示地址和部署地址信息，结束~

> 技术难点主要在服务端拿到合约信息后，如何对合约进行编译、部署；以及如何实时通知前端当前进度？


#### 前端页面实现
> 前端主要是页面上增加一个【部署】按钮，实现如下一个表单提交：

<img class="zoom-custom-imgs" :src="$withBase('/images/more/web3-deploy02.jpeg')" width="auto"/>


比较简单，熟悉下`Svelte`的写法就可以写了，就是常规的表单提交和接口请求~ 

``` js
// fetch请求服务端接口，传参：
// url: 部署网络
// mnemonic： 助记词
// code: 合约源码
// opts: 合约入参（没有可不传）
try {
    const response = await fetch('http://localhost:8023/contract/deploy', {
      method: "post",//请求方式
      body: JSON.stringify({url, mnemonic, opts, code}),//post请求的数据体
    });
    console.log(response);
    const res = await response.json();
    console.log(res);
  } catch(err) {}
```
> 因为我是用`node`来写服务端逻辑，所以上面我请求的服务端接口是本地启的一个服务~




#### Node服务初始化
> 之后就是比较重要的服务端逻辑~ 因为部署需要涉及到编译、部署等比较复杂的操作，所以将这部分逻辑放在服务端合理一些~

- **入口配置**
> 首先是新建一个node项目，进行入口配置，这里直接展示入口`index.js`的代码：
``` js
// index.js

const express = require('express');
var app = express();

const socketio = require('socket.io');
const server = require('http').createServer(app);
const io = socketio(server, { cors: true }); // 实现客户端与服务端部署进度的通信
// 设置 socketio
app.set('socketio', io);


// body-parser是一个HTTP请求体解析的中间件，使用这个模块可以解析JSON、Raw、文本、URL-encoded格式的请求体
const bodyParser = require('body-parser');

const router = require('./router');



//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})


/// 中间件解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// 解析 application/json
app.use(bodyParser.json())
// 解析 text/plain
app.use(bodyParser.text());


// 路由
app.use('/', router)


//使用app作为中间件开启WebSocket服务器，express框架的其他功能也都能使用
//必须用server监听端口，不会报错
//socket服务器监听连接，表示已经建立连接
io.on('connection',function(socket){

    console.log('=====socket已经connection====')


	//监听客户端发来的消息
	socket.on('connectSuccess',function(data){
		console.log('客户端发来信息：', data);

		//将客户端发来的消息推送给全部的客户端
		// io.emit('msg',data);
	})
})


// 监听8023端口
server.listen(8023, function() {
    const {address, port} = server.address();
    console.log('======Http server is running on http://%s:%s', address, port);
    // console.log('服务已启动，请打开链接：http://localhost:8023')
})
```


- **路由配置**
``` js
// router.js

const express = require('express')
const deploy = require('./deploy');

// 注册路由
const router = express.Router()


router.get('/', function(req, res) {
    res.send('contract deploy node.')
})


// 部署接口
router.post('/contract/deploy', deploy)

module.exports = router;
```

- **deploy.js**
``` js
// deploy.js

// 部署流程方法入口
module.exports = async function(req, res, next) {
    console.log(req.body);
    console.log('===process.env.', process.argv, process.cwd());
    console.log('=====deploy');
    try {

        console.log(chalk.yellow(`--------->  欢迎使用智能合约低代码自动部署工具 v2  <---------`));

        const io = req.app.get('socketio');
        // console.log('===io', io);

        // 通知前端当前部署进度
        io.emit(DEPLOY_INFO.socketName, {code: 1, msg: '====正在部署初始化......===='})

        io.emit(DEPLOY_INFO.socketName, {code: 1, msg: '====正在进行编译....====='})
        // 编译
        await compile();

        io.emit(DEPLOY_INFO.socketName, {code: 1, msg: '====正在排队部署中，请稍等....====='})
        // 部署
        const deployRes = await deploy();

        successLog('大吉大利, 部署成功!!!!'); 
        res.send({
            code: 200,
            msg: 'deploy success!!!',
            data: deployRes
        })
        next();
    } catch(err) {
        console.log('======err', err);
        errorLog(`====error: ${err.message || err}`);
        res.send({
            code: err.code || 203,
            msg: `${err.message || err}`
        })
        next();
    }
  }
```
> 以上就是入口路由配置的部分代码，之后就可以在`compile()`方法中添加编译逻辑~

#### 编译
> 这里对合约的编译是使用`solc.js`来完成的，它是一个比较通用的专门用来编译智能合约的库~

[https://github.com/ethereum/solc-js](https://github.com/ethereum/solc-js)

``` js
const solc = require('solc');

// 编译
async function compile() {
    return new Promise((resolve, reject) => {
        // 生成sources对象
        const sources = {
            [MY_CONTRACT_NAME]: {
                content: DEPLOY_INFO.code
            }
        };
        console.log(sources);

        // 生成input对象
        const input = {
            language: 'Solidity',
            sources,
            settings: {
                outputSelection: {
                    '*': {
                        // '*': ['*']
                        '*': ['abi', 'evm.bytecode']
                    }
                }
            }
        }

        // 导入import合约（解决导入第三方合约报错问题）
        // https://stackoverflow.com/questions/67321111/file-import-callback-not-supported
        function findImports(relativePath) {
            //my imported sources are stored under the node_modules folder!
            const absolutePath = path.resolve(__dirname, './node_modules', relativePath);
            const source = fs.readFileSync(absolutePath, 'utf8');
            return { contents: source };
        }
        // 用solc编译合约，生成abi等信息
        let solcTemp = solc.compile(JSON.stringify(input), { import: findImports });
        console.log('=====solc', solcTemp.errors, typeof solcTemp);

        // 编译报错
        /**
         * errors:['...']
         */
        if (solcTemp.errors) {
            errorLog(`编译失败：${solcTemp.errors[0] || solcTemp.errors}`);
            reject(solcTemp.errors[0] || solcTemp.errors);
            return;
        }

        const contracts = (typeof solcTemp === 'string' ? JSON.parse(solcTemp) : solcTemp).contracts;
        if (!contracts) {
            errorLog(`编译失败：生成编译信息失败`);
            reject('生成编译信息失败');
            return;
        }
        contractsInfo = contracts;
        console.log('===contracts', contracts)

        LOADING.stop();
        successLog('编译完成！！！')
        resolve(true);
    })
}
```
> 这一步主要通过对合约进行编译，拿到合约的`abi、bytecode`等信息，下一步部署会用到~

#### 部署
> 部署是`web3.js`来实现的~

``` js
const Web3 = require('web3'); // 连接区块链网络
const HDWalletProvider = require("@truffle/hdwallet-provider");

async function deploy () {
    return new Promise(async (resolve, reject) => {
        LOADING = ora(defaultLog('项目开始部署...')).start();
        LOADING.spinner = spinner_style.arrow4;

        let contractArr = [];
        for(let contract in contractsInfo) {
            for(let name in contractsInfo[contract]) {
                // 用户部署合约
                if (contract === MY_CONTRACT_NAME) contractArr.push(contractsInfo[contract][name]);
            }
        }
        // console.log('===contractArr', contractArr);
        // 部署, 目前只支持一个合约
        const curContract = contractArr[0] || null;
        if (!curContract) {
            errorLog(`部署失败：${'无法获取到合约信息'}`);
            reject('无法获取到合约信息');
            return;
        }

        try {
            ////// 连接
            // 本地连接
            // var web3 = await new Web3(new Web3.providers.HttpProvider(DEPLOY_INFO.url))
            // 测试网络连接 传助记词或私钥都可~
            let provider = null;
            // 私钥
            if (DEPLOY_INFO.mnemonic.indexOf(' ') === -1) {
                provider = await new HDWalletProvider(DEPLOY_INFO.mnemonic, DEPLOY_INFO.url);
            } else { // 助记词
                provider = await new HDWalletProvider({
                    mnemonic: DEPLOY_INFO.mnemonic,
                    providerOrUrl: DEPLOY_INFO.url,
                });
            }
            var web3 = await new Web3(provider);
            web3.setProvider(provider);
            // console.log('====web3', provider);

            // user adress
            const accountArr = await web3.eth.getAccounts();
            console.log('===getAccounts' ,accountArr);
            if (!accountArr.length) {
                errorLog(`部署失败：${'无法获取到用户信息'}`);
                reject('无法获取到用户信息');
                return;
            }

            // chainId
            let chainID = await web3.eth.getChainId();
            console.log('===chainID', chainID, web3.utils.toHex(chainID));

            // balance
            let balance = await web3.eth.getBalance(accountArr[0]);
            console.log('====balance', balance, web3.utils.fromWei(balance)); // wei ether

            // gasPrice
            let gasPrice = await web3.eth.getGasPrice();
            console.log('====gasPrice', gasPrice, web3.utils.fromWei(gasPrice)); // wei eth

            // block
            let blockNumber = await web3.eth.getBlockNumber();
            console.log('=====blockNumber', blockNumber);
            let block = await web3.eth.getBlock(blockNumber);
            console.log('======block', block);


            const deployedContract = await new web3.eth.Contract(curContract.abi)
            // console.log('====deployedContract', deployedContract);
            let gasEstimate = await web3.eth.estimateGas({data:`0x${curContract.evm.bytecode.object}`});//获得这个合约部署大概所需的gas
            console.log('===gasEstimate', gasEstimate, web3.utils.fromWei(gasEstimate.toString())); // wei ether
            console.log('=====gas * price', gasEstimate * gasPrice, web3.utils.fromWei((gasEstimate * gasPrice).toString())); // wei eth
            let _gasEstimate = gasEstimate + 1000000
            if (balance < _gasEstimate) {
                errorLog(`部署失败：${'当前账户余额不足'}`);
                reject('当前账户余额不足');
                return;
            }

            let deployParams = {
                data: `0x${curContract.evm.bytecode.object}`
            }
            if (DEPLOY_INFO.opts) deployParams.arguments = DEPLOY_INFO.opts.split(','); // 入参
            
            ////// 开始部署
            deployedContract.deploy(deployParams).send({
                from: accountArr[0], 
                // gas: 4700000, // 该交易 gas 用量上限  wei
                gas: _gasEstimate,
                // gasPrice: 100000000,
                gasPrice: gasPrice, // 单价，一个单位的Gas价格，以 wei 为单位，默认 1Gwei = 100000000 wei = 0.0
                // value: 0, // 交易转账金额 wei
                chainId: web3.utils.toHex(chainID) // 不传会报错：Error: only replay-protected (EIP-155) transactions allowed over RPC
            }, function (err, contract){
                console.log('======1234567 e, contract hash',err, contract);
                if (err) {
                    errorLog(`部署失败：${err}`);
                    reject(err);
                    return;
                }
                if (typeof contract.address !== 'undefined') {
                    console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
                }
            })
            .on('receipt', function(receipt){
                LOADING.stop();
                successLog("部署成功：receipt.contractAddress :" + receipt.contractAddress); // 包含新合约地址
                console.log('=====receipt===',receipt)
                resolve(receipt);
            })
            .then(function(newContractInstance){
                LOADING.stop();
                console.log("newContractInstance.options.address: " + newContractInstance.options.address) // 带有新合约地址的合约实例
            })
        } catch(err) {
            LOADING.stop();
            errorLog(`部署失败：${err}`);
            reject(err);
        }
    })
}
```
1. 这里先通过`@truffle/hdwallet-provider + 部署网络地址 + 助记词`生成一个provider实例；
2. 然后再通过`web3.js`连接区块链网络，获取用户`gasPrice`等信息；
3. 最后通过传入上一步编译得到的`abi`信息，生成合约实例，传入`bytecode`信息，调用合约实例的`deploy`方法，实现部署；
4. 之后等待部署结果，兼容报错处理，拿到部署后的交易信息，返给前端即可~



#### 前端socket通信
> 服务端的部署进度是通过socket来通信的~

``` js
import io from 'socket.io-client';

let Socket: any = null;
let socketName = '';
const socketInit = () => {
  var socket = io('ws://localhost:8023');
  //监听客户端事件推送
  socket.on('connect',function(){
    console.log('连接成功', socket, socket.id);
    // 通过socket.id来身份判断，
    // socketName会在部署的时候传给服务端
    socketName = `onContractDeploy__${socket.id}`;
    socket.emit('connectSuccess',{code: 0, msg: 'client socket success'});

      //监听合约部署
    console.log('===socketName', socketName);
    socket.on(socketName,function(data){
      console.log('=====', socketName, data);
      onToast(data.msg);
    });

  });
  

  // 连接错误触发事件处理器。
  socket.on('connect_error', error => {
    console.log('=====', socketName,  error);
  })

  // 监听连接异常中断
  socket.on('disconnect',function(){
    console.log('====disconnect====断开连接');
  })

  Socket = socket;
}
onMount(() => {
  console.log('====onMount====')
  socketInit();
});
onDestroy(() => {
  console.log('=====onDestroy===')
  Socket && Socket.close();
})
```

- [在快速路由文件中使用socket.io](https://qa.1r1g.com/sf/ask/1319933331/)
- [W3Cschool socket.io 概述](https://www.w3cschool.cn/socket/socket-1olq2egc.html)

本地开发调试没问题后，就可以打包前端项目，把静态资源放在服务器上；

同时也将服务端node代码也放在服务器上，启动服务~




### 总结
> 这里画了一张从合约编写、编译、部署、调用的流程图~

<img class="zoom-custom-imgs" :src="$withBase('/images/more/web3-deploy01.jpg')" width="auto"/>


::: tip 总结
1. 编写智能合约：solidity
2. 编译：`solc` => bytycode + abi
3. 部署：`web3`，返回合约地址address
4. 生成合约实例：(abi + address) + web3
5. 前端调用合约方法
:::



- [项目访问地址](http://123.57.172.182/low-code-contract/client/embed.html)
- [github代码地址](https://github.com/verneyZhou/low-code-contracts/tree/main/server)





## 备注

- 部署到`Sepolia、Goerli`等测试网络需要提前在`Infura`上申请一个项目ID；
``` js
// 前端部署时测试网络选项，需要提供project key，如：8a2751c410bb400bb48a7e617c84ff62
 const deployNetOpts = [
    {
      url: 'https://mainnet.infura.io/v3/8a2751c410bb400bb48a7e617c84ff62',
      label: 'Mainnet 网络',
      clienUrl: 'https://cn.etherscan.com/address/',
    },
    {
      url: 'https://goerli.infura.io/v3/8a2751c410bb400bb48a7e617c84ff62',
      label: 'Goerli 测试网络',
      clienUrl: 'https://goerli.etherscan.io/address/',
    },
    ...
  ];
```
[Infura](https://www.infura.io/zh)、[Infura开发手册](http://cw.hubwiz.com/card/c/infura-api/)
> Infura 是一种 IaaS（Infrastructure as a Service）产品，目的是为了降低访问以太坊数据的门槛。通俗一点讲，Infura 就是一个可以让你的 DApp 快速接入以太坊的平台，不需要本地运行以太坊节点。

>Infura为开发者提供基础的底层设施，借助于Infura，开发者在以太坊上开发任何应用程序，无需运行后端基础设施。除了提供链上的API服务，Infura还可通过IPFS API为开发者提供分布式存储，满足开发者的交易管理、GAS处理，NFT API等需求。


- 服务器上node服务是通过pm2来实现管理的：[Node进程管理工具—pm2](https://blog.csdn.net/qq_38128179/article/details/120401139)





## 问题记录


- 本地`node index.js`时报错：`Error: listen EADDRINUSE: address already in use :::8023`
``` shell
sudo lsof -i:端口号 # 查看被占用进程的pid
sudo kill -9 pid  # 杀死进程
```

- 测试环境部署报错：`Error: Invalid JSON RPC response: ""`
> 应该是在阿里云服务器里，连接需要内网才能访问的微博测试链，访问不了导致的，换成Goerli测试链可以~





- 测试环境`node index.js`时提示：`(node:16144) ExperimentalWarning: The dns.promises API is experimental`
> 暂时无解，后面没遇到了...

- 部署报错：`insufficient funds for gas * price + value`
> 账户余额不足，或者是部署时 默认的gasPrice过低，获取gasPrice设置即可~ [以太坊中gas、gasPrice、gasLimit是什么？](https://blog.csdn.net/webhaifeng/article/details/112890801)


## 参考

**部署相关**

- [Web3部署智能合约](https://blog.csdn.net/zhongliwen1981/article/details/89926975)
- [区块链研究实验室 | 使用JavaScript编译和部署以太坊智能合约](https://zhuanlan.zhihu.com/p/69166912)
- [deploy/upload](https://github.com/bgwd666/deploy/blob/master/upload/upload.js)、[vue + node 前端自动化部署到远程服务器](https://www.jianshu.com/p/216134013ea6)
- [node-ssh编写前端自动部署脚本](https://zhuanlan.zhihu.com/p/339507164)
- [Node如何实现前端一键自动化部署](https://www.jianshu.com/p/221a1e847e57)
- [前端项目nodejs自动部署脚本](https://cloud.tencent.com/developer/article/1882523)


**其他**

- [JS fetch()用法详解](https://blog.csdn.net/weixin_52148548/article/details/124703828)
- [Ethereum JavaScript API（contract,部署与调用智能合约）](https://blog.csdn.net/wonderBlock/article/details/106842029)
- [基于NodeJS从零构建线上自动化打包工作流](https://mp.weixin.qq.com/s/6619NcJjuPQsZhmikDZ-Og)
- [@truffle/hdwallet-provider](https://www.npmjs.com/package/@truffle/hdwallet-provider)
> nodejs是后端语言，使用nodejs编写的HDWalletProvider无法在前端使用




**Ethereum 网络**

- [https://cn.etherscan.com/](https://cn.etherscan.com/)、[https://etherscan.io/](https://etherscan.io/)
- [Sepolia](https://sepolia.dev/)、[https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
- [https://goerlifaucet.com/](https://goerlifaucet.com/)、[https://goerli.etherscan.io/](https://goerli.etherscan.io/)





