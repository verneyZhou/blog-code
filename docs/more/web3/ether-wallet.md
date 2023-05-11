---
title: 项目实战：使用ethers.js本地生成离线钱包
date: 2022-08-22 14:19:43
permalink: /pages/838ca5/
categories:
  - web3
tags:
  - ethers
  - metamask
  - wallet
---

# 项目实战：使用ethers.js本地生成离线钱包

> 由于之前做的web3小游戏需要下载metamask才能进行后续交互，且metamask需要翻墙才能下载，上手成本较高，所以考虑本地生成离线钱包，无需下载第三方钱包也能开启我们的web3之旅~


## 笔记


### 助记词 => 钱包 => 私钥


- **数字钱包**
> 钱包用来存钱的，在区块链中，我们的数字资产都会对应到一个账户地址上， **只有拥有账户的钥匙（私钥）才可以对资产进行消费（用私钥对消费交易签名）**。

私钥通过椭圆曲线生成公钥， 公钥通过哈希函数生成地址，这两个过程都是单向的。数字钱包实际是一个管理私钥（生成、存储、签名）的工具，注意钱包并不保存资产，资产是在链上的。

创建账号关键是生成一个私钥， 私钥是一个32个字节的数， 生成一个私钥在本质上在1到2^256之间选一个数字。

什么是**去中心化钱包**，账号秘钥的管理，交易的签名，都是在客户端完成， 即私钥相关的信息都是在用户手中，**钱包的开发者接触不到私钥信息**。
> 对应的中心化钱包则是私钥由中心服务器托管，如交易所的钱包就是这种。



- `path: m/44'/60'/0'/0/0 `
>  BIP44则是为这个路径约定了一个规范的含义(也扩展了对多币种的支持)，BIP0044指定了包含5个预定义树状层级的结构：`m / purpose' / coin' / account' / change / address_index`

::: tip 
- m是固定的, Purpose也是固定的，值为44（或者 0x8000002C）;
- Coin type: 这个代表的是币种，0代表比特币，1代表比特币测试链，60代表以太坊; 完整的币种列表地址：https://github.com/satoshilabs/slips/blob/master/slip-0044.md
- Account: 代表这个币的账户索引，从0开始
- Change: 常量0用于外部(收款地址)，常量1用于内部（也称为找零地址）。外部用于在钱包外可见的地址（例如，用于接收付款）。内部链用于在钱包外部不可见的地址，用于返回交易变更。 (所以一般使用0)
- address_index: 这就是地址索引，从0开始，代表生成第几个地址，官方建议，每个account下的address_index不要超过20
:::
以太坊钱包也遵循BIP44标准，确定路径是m/44'/60'/a'/0/n; a 表示帐号，n 是第 n 生成的地址，60 是在 SLIP44 提案中确定的以太坊的编码。所以我们要开发以太坊钱包同样需要对比特币的钱包提案BIP32、BIP39有所了解。


- **BIP39**
> BIP32 提案可以让我们保存一个随机数种子（通常16进制数表示），而不是一堆秘钥，确实方便一些，不过用户使用起来(比如冷备份)也比较繁琐，这就出现了BIP39，它是使用助记词的方式，生成种子的，这样用户只需要记住12（或24）个单词，单词序列通过 PBKDF2 与 HMAC-SHA512 函数创建出随机种子作为 BIP32 的种子。


参考：[理解开发HD 钱包涉及的 BIP32、BIP44、BIP39](https://learnblockchain.cn/2018/09/28/hdwallet)


- **实现: 随机数 => 助记词 => 钱包**

``` js
// 生成随机数
var rand = ethers.utils.randomBytes(16);

// 生成助记词
var mnemonic = ethers.utils.entropyToMnemonic(rand);

var path = "m/44'/60'/0'/0/0";

// 通过助记词创建钱包
let wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
console.log(wallet);
/**
{
    address: "0x79d8B50477c84D0C74634513acA923ddFabf3CB2"  // 地址
    privateKey: "0x7d499b3fe6d706b9cdd5948550d8525347688e13e8d6ec6ac8e0d948eb47829b"  // 私钥
    publicKey: "0x047c6e585d411bd3efa75337f012bdba7e366c567e2efe2e845c2823b4c86b1933cab60fb3ef40816ebf718ac34aebd76d129bdd58a1c675593779cc783f  // 公钥
}
 */
```

参考：[使用ethers.js开发以太坊Web钱包1 - 创建钱包账号](https://learnblockchain.cn/2018/10/25/eth-web-wallet_1)




### 钱包 => Provider => 以太坊网络
> 如果想获取钱包账号的相关信息，比如余额、交易记录，发起交易的话，就需要让钱包连上以太坊的网络。不管是在 Web3 中，还是Ethers.js 都是使用 Provider 来进行网络连接的，Ethers.js 提供了集成多种 Provider 的方式


``` js
// 使用一个已有的web3 兼容的Provider，如有MetaMask。
let provider = new ethers.providers.Web3Provider(window.ethereum);

// 如果没有自己的节点，可以使用Etherscan 及 Infura 的Provider，他们都是以太坊的基础设施服务提供商
let provider = ethers.getDefaultProvider('ropsten');

// 如果有自己的节点可以使用，可以连接主网，测试网络，私有网络或Ganache
let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");


// activeWallet是用来请求余额发送交易的对象
var activeWallet = wallet.connect(provider);
```


- **发送交易**
> 所有会更改区块链数据的函数都需要关联签名器，如果是视图函数则只需要连接provider。

1. 首选发送一个签名交易，也称为离线交易（因为这个过程可以离线进行：在离线状态下对交易进行签名，然后把签名后的交易进行广播）；
> 如果用MetaMask，则签名交易是利用MetaMask来完成的：在发送交易之前先检查当前钱包状态，检查钱包是否解锁(是否输入了密码进入了MetaMask)，通常使用`eth_requestAccounts`获取钱包账户地址，如果当前账号列表里面有数据的话，说明钱包已经解锁可以获得到账号，如果账号拿到的列表是空的话，那么说明钱包没有解锁。

2. 发送（广播）交易
> ethers.js 里提供了一个简洁的接口`sendTransaction`，来完成所有这两步操作(签名已经在接口里帮我们完成了)。

``` js
// 交易传参
const txParams = {
  from: '000000000000000', // 发起交易的账户地址，如果没有就会用当前的默认账号
  nonce: '0x00', // 每次交易会生成一个唯一性的序号，展示交易顺序，也是为了防止重放攻击
  gasPrice: '0x09184e72a000', // gasPrice是交易发起者是愿意为工作量支付的单位费用，矿工在选择交易的时候，是按照gasPrice进行排序，先服务高出价者
  gasLimit: '0x2710', // 表示预计的指令和存储空间的工作量，如果工作量没有用完，会退回交易发起者
  to: '0x0000000000000000000000000000000000000000', // 交易目标账户地址
  value: '0x00', // 用户转账金额
  data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // 是交易时附加的消息，如果是对合约地址发起交易，这会转化为对合约函数的执行
  chainId: 3 // 链id，用来去区分不同的链（分叉链）id
}


/**
 * nonce 和 chainId 有一个重要的作用就是防止重放攻击，如果没有nonce的活，收款人可能把这笔签名过的交易再次进行广播，没有chainId的话，以太坊上的交易可以再次进行广播。
 * Gas是以太坊的工作计费机制，是交易者给矿工打包的一笔预算，预算 = gasLimit * gasPrice， 可以类比为请货车的运费：公里数 * 每公里单价。
 */

// 发送交易
activeWallet.sendTransaction(txParams).then(function(tx) {
    console.log(tx);
});

```

如果是用MetaMask交易，则`nonce, gasPrice, gasLimit, data, chainId`可以在调起钱包的时候设置，不需要在调用合约的时候传参
> 在发送交易的时候 MetaMask 会弹出来一个授权的窗口，如果我们 gas和 gasPrice 没有设置的话，就可以在 MetaMask 里面去设置。如果这两个 gas 和 gas Price 设置了的话，MetaMask就会使用我们设置的gas。



参考：
- [使用ethers.js开发以太坊Web钱包3 - 展示钱包信息及发起签名交易](https://learnblockchain.cn/2018/10/26/eth-web-wallet_3)
- [如何使用Web3.js API 在页面中进行转账](https://learnblockchain.cn/article/52)



### 私钥的保存 + 助记词的导入

- 生成钱包后，通过`私钥 + 密码`将加密后的私钥保存在本地，每次需要调链上合约时，先读取本地缓存，用户输入密码后解密获取私钥，生成钱包，调合约；

- 调用 ethers.js 的api就可以通过助记词导入，生成钱包，详见下方实践~


参考：[使用ethers.js开发以太坊Web钱包2 - 账号Keystore文件导入导出](https://learnblockchain.cn/2018/10/25/eth-web-wallet_2/)

## 实践


### `Provider.ts`

``` ts
//Provider.js（最终要选择MetaMask还是ethers选择的提供者）
 
import { ethers } from 'ethers';
 
export default class Provider {
 
    static isMetaMaskProvider () {
        return Boolean(window.ethereum); // 是否安装MetaMask钱包, 先禁掉
    }
 
    static createProvider () {
        if (Provider.isMetaMaskProvider()) {
            // 基于浏览器插件MetaMask插件节点
            return new ethers.providers.Web3Provider(window.ethereum);
        } else {
            // JsonRpcProvider是基于url来连接！
            return new ethers.providers.JsonRpcProvider(
                'http://xxx.xxx.xxx.xxx:xxx' // 自己的ip地址
            );
        }
    }
}
```


#### `MetamaskWallet.ts`
> Metamask钱包~

``` ts
//MetamaskWallet.js（MetaMask浏览器钱包）
 
import Provider from './Provider';
 
export default class MetamaskWallet {
    [x: string]: any;
    constructor () {
        this.initProvider();
        this.signer = this.provider.getSigner();
        this.signer.get_address = async () => {
            const [account] = await this.provider.send(
                'eth_requestAccounts',
                []
            );
            return account;
        };
    }
 
    initProvider () {
        if (!Provider.isMetaMaskProvider()) {
            throw Error( '您正在使用当前离线钱包,暂时不能使用MetaMask钱包或先退出当前离线钱包！' );
        }
        this.provider = Provider.createProvider();
        console.log( '您正在使用的是MetaMask浏览器钱包！！！' );
    }
}
```

### `EthersWallet.ts`
> 通过 `ethers.js`生成本地离线钱包~

``` ts
/**
  * ethers.js创建或导入钱包
  */
 
import { Wallet, ethers } from 'ethers';
import Provider from './Provider';
 
export default class EthersWallet {
    [x: string]: any;
    constructor () {
        this.initProvider();
    }


    // 生成助记词
    static createMnemonic() {
        // 生成随机数
        const rand = ethers.utils.randomBytes(16);
        // 生成助记词
        const mnemonic = ethers.utils.entropyToMnemonic(rand);
        return mnemonic;
    }
 
    initProvider () {
        if (Provider.isMetaMaskProvider()) {
            throw Error( '浏览器已经提供了MetaMask钱包,不能再创建其他离线钱包了！' );
        }
        this.provider = Provider.createProvider();
        console.log( '您正在使用的是离线钱包！！！' );
    }
 
    // 私钥生成钱包！
    generate_private_key_wallet ( private_key: string ) {
        return new Wallet( private_key, this.provider );
    }
 
    // 助记词生成钱包！
    generate_mnemonric_wallet ( mnemonric: any, path = `m/44'/60'/0'/0/0` ) {
        let _mnemonric = '';
        if (!mnemonric) {
            _mnemonric = EthersWallet.createMnemonic();
        } else {
            _mnemonric = mnemonric;
        }
        if (!ethers.utils.isValidMnemonic(_mnemonric)) {
            return null;
        } else {
            // 必须连接provider才是活跃钱包
            return Wallet.fromMnemonic( _mnemonric, path ).connect( this.provider );
        }
    }
 
    // keystore.json文件生成钱包
    async generate_keystore_wallet ( keystore_json_string: string, password: string, progressCallback: any = null ) {
        // 必须连接provider才是活跃钱包
        const off_wallet = await Wallet.fromEncryptedJson( keystore_json_string, password, progressCallback );
        return off_wallet.connect( this.provider );
    }
 
    // 随机创建一个钱包
    create_new_wallet () {
        return Wallet.createRandom().connect( this.provider );
    }
}
```

### `BassContract.ts`
> 构造基础合约~


``` ts
import EthersWallet from './EthersWallet';
import MetamaskWallet from './MetamaskWallet';
import Provider from './Provider';
import { ethers } from 'ethers';
 
export default class BassContract {
    [x: string]: any;
    constructor ( param?: any, type?: string ) {
        this.initWallet( param, type );
        // 务必注意：钱包是实现了Signer接口,所以active_wallet中的一些属性是signer没有的【比如address属性】
        this.active_WalletOrSigner = this.signer || this.active_wallet;
    }
 
    initWallet ( param?: any, type?: string ) {
        const _type = type || 'mnemonric'; //  默认是按照助记词生成钱包   mnemonric 助记词 privateKey 私钥
        if (Provider.isMetaMaskProvider()) {
            // 确定是MetaMask钱包
            this.signer = new MetamaskWallet().signer;
            console.log( 'MetaMask之this.signer', this.signer );
        } else {
            this.active_wallet = null;
            if (_type === 'mnemonric') {
                // 确定是Ethers自己创建或助记词导入的钱包！
                this.active_wallet = new EthersWallet().generate_mnemonric_wallet( param );
            } else if (_type === 'privateKey') {
                // 通过私钥生成钱包
                this.active_wallet = new EthersWallet().generate_private_key_wallet( param );
            }
            console.log( 'ethers钱包========active_wallet', this.active_wallet );
        }
    }
 
    createContract ( abi_data: any, bytecode: any ) {
        return new ethers.ContractFactory( abi_data, bytecode, this.active_WalletOrSigner );
    }
 
    // 创建合约实例
    createContractInstance ( contract_address: any, abi_data: any ) {
        return new ethers.Contract( contract_address, abi_data, this.active_WalletOrSigner );
    }
}
```

### 封装合约方法
> Vue项目中合约方法封装~

``` ts
import CryptoJS from '@/utils/crypto'; // crypto 加解密
import Provider from '@/contracts/modules/Provider';
import BaseContract from '@/contracts/modules/BaseContract';
import NFTS_ABI from '@/contracts/nfts-abi';



// 钱包初始化
// 页面加载时调用该方法
async metaInit() {
    if (Provider.isMetaMaskProvider()) { // 已安装metamask钱包
        this.$store.dispatch('reset'); // 重置
        const Contract = new BaseContract();
        const wallet = Contract.active_WalletOrSigner; // 获取钱包
        const address = await wallet.get_address();
        console.log('钱包地址:', wallet, address); // 获取钱包当前账户地址
        this.$store.commit('updateUserAds', address); // 全局保存
        this.pageInit();
    } else { // 未安装
        console.log('=====encryptPrivateKey', this.encryptPrivateKey);
        this.$store.dispatch('infoReset'); // 重置
        if (!this.encryptPrivateKey || !this.userAddress) { // 加密私钥或用户地址丢失, 直接去初始化离线钱包
            this.$router.push('/wallet-intro'); // 该页面可以导入或重新创建助记词
            return;
        }

        this.pageInit();
    },
}

// 生成Provider实例
Provider() {
    return Provider.createProvider();
},

// 获取gasPrice
async GasPrice() {
    const res = await this.Provider().getGasPrice();
    return res;
},

// 获取交易序列号nonce
async Nonce() {
    const res = await this.Provider().getTransactionCount(this.userAddress);
    return res;
},

// 获取燃料费
async GetGas() {
    const res = await this.GasPrice();
    const gasPrice = Number(ethers.utils.formatEther(res));
    return (gasPrice * 21000).toFixed(6);
},

// 获取解密后的私钥
getEncryptPrivateKey( pwd: string, encryptPrivateKey?: string ): string {
    const _key = encryptPrivateKey || this.encryptPrivateKey;
    return CryptoJS.decrypt(_key, pwd); // 解密
},
// 基础合约
baseWallet(pwd = '') {
    return new Promise(resolve => {
        let Contract = null;
        if (Provider.isMetaMaskProvider()) {
            Contract = new BaseContract(); // 通过MetaMask生成钱包
        } else {
            const _key = this.getEncryptPrivateKey(pwd);
            if (!_key) {
                resolve(null);
                return;
            }
            Contract = new BaseContract(_key, 'privateKey'); // 通过私钥生成离线钱包
        }
        const wallet = Contract.active_WalletOrSigner; // 钱包
        console.log('======wallet', wallet);
        resolve(Contract);
    });
},
// 合约实例
async Contract(address = '', abi: any = '', pwd = '') {
    if (!address) return null;
    const res: any = await this.baseWallet(pwd);
    if (!res) return null;
    const contract = res.createContractInstance(address, abi); // 生成合约实例
    console.log('====contract', contract);
    return contract;
},

/**
 * 以购买nft为例：
 * 购买NFT-去
 */
async buyNFTs(params: any, confirmCallback: any = null): Promise<any> {
    const {amount, token_id, address, pwd = '' } = params;
    // 生成Contract实例
    const contract: any = await this.Contract(this.addressInfo.erc721_address, NFTS_ABI, pwd);
    // 为null则表示生成失败（密码错误）
    if(!contract) return null;

    const gasPrice = await this.GasPrice(); // 获取gasPrice
    const nonce = await this.Nonce(); // 获取交易序列号nonce
    const gasLimit = await contract.estimateGas.buyNFTs(token_id, address, amount); // 获取gasLimit
    console.log('=====GasPrice', ethers.utils.formatEther(gasPrice), ethers.utils.formatEther(gasLimit), nonce);

    const tx = await contract.buyNFTs(token_id, address, amount, {
        gasLimit: 260000,
        gasPrice,
        nonce
    });
    confirmCallback && confirmCallback(tx); // 点击确认后的回调
    const res = await tx.wait(); // 等待tx执行完毕
    console.log('=====buyNFTs', res);
    return res;
},
```


### `crypto.js`
> 加解密私钥~

``` js

import CryptoJS from 'crypto-js';

export default {
    // AES加密
    encrypt(word, keyStr, ivStr) {
        keyStr = keyStr ? keyStr.padEnd(16,0)  : 'WyTIdrCHNVKtW4f8'; // 十六进制数作为密钥
        ivStr = ivStr || 'WyTIdrCHNVKtW4f8'; // 十六进制数作为密钥偏移量
        const key = CryptoJS.enc.Utf8.parse(keyStr);
        console.log('===key', key);
        const iv = CryptoJS.enc.Utf8.parse(ivStr);

        const _word = typeof word === 'object' ? JSON.stringify(word) : word;
        // const encrypted = CryptoJS.AES.encrypt(_word, key,{
        //         iv,
        //         mode: CryptoJS.mode.CBC,
        //         padding: CryptoJS.pad.Pkcs7
        //     });
        const encrypted = CryptoJS.AES.encrypt(_word, keyStr);
        //对加密数据进行base64处理, 原理：就是先将字符串转换为utf8字符数组，再转换为base64数据
        let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted));
        return encData;
    },
 
    // AES解密
    decrypt(word, keyStr, ivStr) {
        keyStr = keyStr ? keyStr.padEnd(16,0)  : 'WyTIdrCHNVKtW4f8';
        ivStr = ivStr || 'WyTIdrCHNVKtW4f8';
        const key = CryptoJS.enc.Utf8.parse(keyStr);
        const iv = CryptoJS.enc.Utf8.parse(ivStr);
        //将数据先base64还原，再转为utf8数据
        let decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8);
        // const decrypt = CryptoJS.AES.decrypt( decData, key,{
        //     iv,
        //     mode: CryptoJS.mode.CBC,
        //     padding: CryptoJS.pad.Pkcs7
        // });
        const decrypt = CryptoJS.AES.decrypt( decData, keyStr);
        try {
            const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
            return decryptedStr.toString();
        } catch(err) {
            return '';
        }
    }
};
```

### 合约调用
> 最后就是项目中合约方法的调用~
``` ts
// nft购买
async function nftBuy(pwd: string) {
    try {
        const res = await proxy.elRoot.buyNFTs(params, (tx: any) => {
            console.log('confirmCallback', tx); // 点击确认后的回调
        });

        // 购买结束回调
        console.log('====res', res);
        if (res === null) {
            // 输入密码错误
            proxy.$toast('生成钱包失败，请检查输入密码是否正确', 'warning');
            return;
        }
        // 购买成功回调处理
        .....
    } catch (err) {
        console.log(err);
    }
}
```




### 流程图
> 根据上面的操作，大概画了一张流程图，梳理一下~

<img class="zoom-custom-imgs" :src="$withBase('/images/more/web3-wallet01.jpg')" width="auto"/>

> 主要分三步：连接区块链网络、生成本地钱包、连接合约并调用~



### 报错记录

- 连接以太坊网络，调用`getBalance`时报错：

``` js
Uncaught (in promise) TypeError: 'get' on proxy: property '_network' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected '#<Object>' but got '#<Object>')
```
> Provider初始化的时候别用 `ref(null)`, 可以用 window.Provider 或者 函数 Provider()

参考：[https://blog.csdn.net/jdjfjgfdgdfg/article/details/124407358](https://blog.csdn.net/jdjfjgfdgdfg/article/details/124407358)




- `transaction`的时候报错：
``` js
Error: invalid hexlify value (argument="value", value={"from":"0x79d8B50477c84D0C74634513acA923ddFabf3CB2","to":"0x51E09974EFAf3a7f46671c3f1120166361Fd2EfE","value":{"type":"BigNumber","hex":"0x0de0b6b3a7640000"},"gasPrice":{"type":"BigNumber","hex":"0x3b9aca00"},"nonce":0,"gasLimit":21000}, code=INVALID_ARGUMENT, version=bytes/5.6.1)
```



- `transaction`报错：

``` js
index.ts:261 Uncaught (in promise) Error: insufficient funds for intrinsic transaction cost [ See: https://links.ethers.org/v5-errors-INSUFFICIENT_FUNDS ] (error={"reason":"processing response error","code":"SERVER_ERROR","body":"{\"jsonrpc\":\"2.0\",\"id\":52,\"error\":{\"code\":-32000,\"message\":\"insufficient funds for transfer\"}}\n","error":{"code":-32000},"requestBody":"{\"method\":\"eth_estimateGas\",\"params\":[{\"gasPrice\":\"0x3b9aca00\",\"value\":\"0xde0b6b3a7640000\",\"from\":\"0x79d8b50477c84d0c74634513aca923ddfabf3cb2\",\"to\":\"0x51e09974efaf3a7f46671c3f1120166361fd2efe\"}],\"id\":52,\"jsonrpc\":\"2.0\"}","requestMethod":"POST","url":"http://10.182.10.193:1234"}, method="estimateGas", transaction={"from":"0x79d8B50477c84D0C74634513acA923ddFabf3CB2","gasPrice":{"type":"BigNumber","hex":"0x3b9aca00"},"to":"0x51E09974EFAf3a7f46671c3f1120166361Fd2EfE","value":{"type":"BigNumber","hex":"0x0de0b6b3a7640000"},"accessList":null}, code=INSUFFICIENT_FUNDS, version=providers/5.6.8)
    at Logger.makeError (index.ts:261:28)
    at Logger.throwError (index.ts:273:20)
    at checkError (json-rpc-provider.ts:98:16)
    at JsonRpcProvider.<anonymous> (json-rpc-provider.ts:603:20)
    at Generator.throw (<anonymous>)
    at rejected (base-provider.ts:2208:5)
```
> 内在交易成本资金不足，应该是用户的账户地址没eth了，通过调用`this.Provider().getBalance(this.userAddress)`方法可以查看余额


- 调授权接口的时报错：`index.ts:261 Uncaught (in promise) Error: transaction failed`
> 应该是`gasLimit`的传参的问题, 值设大点就可以了...



- 调合约方法报错：
``` shell
inpage.js:1 MetaMask - RPC Error: Internal JSON-RPC error. {code: -32603, message: 'Internal JSON-RPC error.', data: {…}}code: -32603data: {code: -32000, message: 'execution reverted'}message: "Internal JSON-RPC error."[[Prototype]]: Object

contract02.ts:221 Error: cannot estimate gas; transaction may fail or may require manual gas limit [ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ] (reason="execution reverted", method="estimateGas", transaction={"from":"0x5Eab66c132E5A522259d3569C9D8D000aFc7c44A","to":"0x6260fb50e464C58566Ac99201dA398E7dC355Ca4","data":"0x8042d1bf0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003e70000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004068747470733a2f2f63646e2e73696e61636c6f75642e6e65742f636861696e2f3066376638333939363165393838343165303965616536386462343137653835","accessList":null}, error={"code":-32603,"message":"Internal JSON-RPC error.","data":{"code":-32000,"message":"execution reverted"},"stack":"{\n  \"code\": -32603,\n  \"message\": \"Internal JSON-RPC error.\",\n  \"data\": {\n    \"code\": -32000,\n    \"message\": \"execution reverted\"\n  },\n  \"stack\": \"Error: Internal JSON-RPC error.\\n    at new i (chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/common-0.js:1:183112)\\n    at s (chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/common-0.js:1:180655)\\n    at Object.internal (chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/common-0.js:1:181265)\\n    at u (chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/background-1.js:1:105253)\\n    at chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/background-1.js:1:106285\\n    at async chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/common-0.js:18:160950\"\n}\n  at new i (chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/common-0.js:1:183112)\n  at s (chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/common-0.js:1:180655)\n  at Object.internal (chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/common-0.js:1:181265)\n  at u (chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/background-1.js:1:105253)\n  at chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/background-1.js:1:106285\n  at async chrome-extension://lppkaedlaekcakaleabiodoomlckjecj/common-0.js:18:160950"}, code=UNPREDICTABLE_GAS_LIMIT, version=providers/5.6.8)
    at Logger.makeError (index.ts:261:28)
    at Logger.throwError (index.ts:273:20)
    at checkError (json-rpc-provider.ts:78:20)
    at Web3Provider.<anonymous> (json-rpc-provider.ts:603:20)
    at Generator.throw (<anonymous>)
    at rejected (base-provider.ts:2208:5)
```



- 调合约报错：
```
Error: invalid BigNumber value (argument="value", value=null, code=INVALID_ARGUMENT, version=bignumber/5.6.2)
```


- CryptoJS 解密出现报错：`Malformed UTF-8 data`
> 估计是传参不符合规范吧，先暂时统一按钱包生成失败处理~




## 备注

### MetaMask原理总结

- 一个钱包里可以有无限个账户。每个账户都有自己的地址和密钥，每个账户都可以根据地址在区块链浏览器上查看账本。助记词是对于钱包来说的，一个钱包只有一个助记词，无论钱包里有多少个账户都是用一个助记词。

- 点击小狐狸界面右上角头像处，可以新建或导入多个钱包账户，不过除了第一个账户需要助记词，后面新导入的或新建的都是只有秘钥形式存在。在该页面的 设置 里选择 安全与隐私 可以查看助记词，不过这个助记词是第一个账号的。

MetaMask可以通过 `私钥` 或 `keystore文件` 导入账户。


- **MetaMask 怎么保存私钥？**

MetaMask不会将用户私钥存储在任何服务器上，而是通过密码保护安全地存储在浏览器主文件夹中。

MetaMask支持通过硬件钱包以离线方式存储用户私钥，保障用户资产安全。私钥决定用户资产的所有权，就类似用户在银行的所有权凭证或保险柜钥匙，公钥类似于用户在银行开设的一个账户，地址就类似用户的银行卡号。**在区块链系统上，公钥和地址是用户对外公开的，而私钥则是万不能泄露的，私钥安全对用户而言至关重要**。相比于服务器托管用户私钥的方式，MetaMask可以借助硬件钱包将私钥进行本地存储，极大帮助用户账户的隐私安全。



1. MetaMask第一次进入会先创建密码；然后生成助记词，生成钱包；之后会 钱包+密码 生成 Keystore 文件；
2. 退出登录后，输入密码，先从 Keystore 文件解密出私钥，登录成功，开始交易；
3. 重置钱包后，导入助记词，输入密码，重新生成钱包，备份 Keystore 文件；

> 助记词和密码不会存到浏览器或服务器，需要用户自己记住；本地会缓存 Keystore 文件


助记词（seed phrase/Secret Recovery Phrase）可以用于恢复钱包，当钱包恢复时会提示设置密码（password），这个密码就是守护这个扩展程序和app钱包的，这个密码只对当前这个实例有效。

助记词恢复钱包时只先恢复第一个账户，那其他账户呢？通过创建账户，钱包会按照原来创建账户的顺序恢复你的账户。所以说，只要有了你钱包的助记词，就能够恢复、控制你钱包上所有的账户，你的钱包不再安全。

私钥是相对账户来说的，每一个账户都有一个地址，对应一个私钥；导出私钥需要先输入自己的设置的密码。



### 初始化流程

页面初次加载，判断是否安装metamask，是则按之前的流程走；否则生成离线钱包
``` js
私钥 + 密码, 用crypto加密，加密后存储本地
刷新页面后，先判断能否拿到本地加密后的私钥 和 用户账户地址，不能则提示导入助记词生成钱包; 调去中心接口时，提示用户输入密码，解密，通过私钥生成钱包；
```

::: tip 流程总结
- 钱包初始化
    是否已安装metamask
        是：重置信息，获取钱包账户地址全局保存，页面初始化
        否：判断本地是否有加密私钥+用户地址
            是：页面初始化
            否：跳至 /wallet-intro 页面，通过助记词生成钱包
                生成钱包后，本地缓存加密私钥+用户地址，跳至首页 /welcome
- 页面初始化
    获取合约信息、获取用户信息、获取新人引导步骤，未注册则跳转 /login 页面

- 调中心化接口
    是否已安装metamask
        是：获取MetaMask钱包，生成Contract实例，传入 address 和 abi, 调接口
        否：输入密码，解密缓存本地私钥，通过私钥生成钱包，生成Contract实例，传入 address 和 abi, 调接口
:::



## 问题


- **用户第一次进入页面的输入的密码（初始化MetaMask时也有）在哪里会用到？**
> 创建钱包输入的密码，并不是用于生成种子，而是用来做 keystore 加密的密码，这是业内的一个常规做法，尽管这个做法会降低一些安全性，但是不遵循行规，会导致和其他的钱包不兼容，及在其他钱包的助记词不能导入到我们钱包，或反之。keystore 文件应该存储在内部存储沙盒类，即应用程序自身目录内，保证其他程序无法读取内容，万万不可存取在外部存储中，如SD卡。


- **MetaMask钱包有多个账户，ethers通过助记词生成的账户只有一个？**


- **助记词，私钥公钥，密码需要存到哪里？**
> 助记词需要用户单独保存在只有自己知道的地方；公钥不需要保存；私钥也是需要用户单独保存，只有用户自己知道，因为需要通过私钥生成自己的钱包（但一般保存助记词就可以了，可以通过助记词生成钱包）；密码则需要用户自己保存，一般都是通过`密码 + 加密后的私钥 = 私钥`生成私钥


- **助记词怎么导入？**
> 用户手动输入助记词，通过调用 `ethers.js` 的 `Wallet.fromMnemonic`方法生成钱包，详见上方示例



- **新注册的用户如何获取互通币（ht_amount）购买nft道具？如何获取燃料费(eth)?**
> nft道具需要互通币（ht_amount）购买，有token_id；普通道具需要互助币（hz_amount）购买，无token_id；如果没有互通币和燃料费, 可通过互助币充值~

::: tip 说明
1. 互助币 = hz_amount => 中心化币，购买游戏道具（图标为 F），新用户初始化赠送2000，可换购燃料费、互通币
2. 互通币 = ht_amount => 去中心化币，购买nft（图标为￥），新用户初始化为0，需要通过互助币充值，汇率 1:1
3. 燃料费 = eth_amount => eth货币，每次交易需要花费一定eth，新用户初始化为0，可通过互助币充值，汇率 => 燃料费： 互助币 = 1：1000
:::


- 如果往测试账号里加点钱?
> 可通过充值实现，初始化时送用户一定中心化币a，可以通过用户手动充值转换为交易需要的燃料费eth，也可转换为购买NFT道具时需要的去中心化币b，有一定汇率~


- **怎么判断交易是否成功？**
``` js
let transactionHash = "0xa4ddad980075786c204b45ab8193e543aec4411bd94894abef47dc90d4d3cc01"

// 获取交易信息
provider.getTransaction(transactionHash).then((transaction) => {
    console.log(transaction);

    // 授权合约发送之后返回的参数 transaction
    {
        accessList: null
        blockHash: null
        blockNumber: null
        chainId: 9215 // 
        confirmations: 0
        creates: null
        data: "0x095ea7b300000000000000000000000010b4b88cf23f594f12e51a2e753167eb126e64830000000000000000000000000000000000000000000000004563918244f40000"
        from: "0x5Eab66c132E5A522259d3569C9D8D000aFc7c44A" // 发起交易的账户地址
        gasLimit: BigNumber {_hex: '0x640b', _isBigNumber: true}
        gasPrice: BigNumber {_hex: '0x3b9aca00', _isBigNumber: true}
        hash: "0xe5a20f7327d3e5d05e20a2a3d798beafac4c232ef819eed524b8b6b8d5b01c86"
        nonce: 14 // 每次交易都会生成一个唯一性的序号
        r: "0xa9b4fe617477910f7a358909b0ed1b9c45905a16ee7081b7966f389dcc2d610d"
        s: "0x4c024203a56dd3e73ef0e261bb64cde6f49264175843ac366dc9f1d8c09db9fa"
        to: "0x51E09974EFAf3a7f46671c3f1120166361Fd2EfE" // 目标地址
        transactionIndex: null
        type: 0
        v: 18465
        value: BigNumber {_hex: '0x00', _isBigNumber: true} // 用户转账金额
    }

});

// 获取交易回复
provider.getTransactionReceipt(transactionHash).then((receipt) => {
    console.log(receipt);

    //  授权合约调用成功之后返回的参数 receipt
    {
        blockHash: "0x004bfdc5d2b04f45c8339a74c7e346d0c45cf46d1b166cde31fe57cee8d22cdf" // 调用成功后生成
        blockNumber: 593466
        byzantium: true
        confirmations: 1
        contractAddress: null
        cumulativeGasUsed: BigNumber {_hex: '0x640b', _isBigNumber: true}
        effectiveGasPrice: BigNumber {_hex: '0x3b9aca00', _isBigNumber: true}
        events: [{…}]
        from: "0x5Eab66c132E5A522259d3569C9D8D000aFc7c44A"
        gasUsed: BigNumber {_hex: '0x640b', _isBigNumber: true} // 本次交易花费的gas
        logs: [{…}]
        logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200200000000000002000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000480000000000000000000000000000000000000020000000000000000020000004000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000020000000000000000000000"
        status: 1
        to: "0x51E09974EFAf3a7f46671c3f1120166361Fd2EfE" // 目标地址
        transactionHash: "0xe5a20f7327d3e5d05e20a2a3d798beafac4c232ef819eed524b8b6b8d5b01c86" // 交易hash
        transactionIndex: 0
        type: 0
    }
});
```
> 一般交易成功后`getTransactionReceipt`返回的`status=1,且logs.length>=1`~


## 参考


- [如何开发钱包 - 技术文章整理](https://learnblockchain.cn/2019/04/11/wallet-dev-guide/#ethers.js)
- [基于ethers.js库同时兼容实现MetaMask钱包和独立的HDWallet钱包代码总结](https://blog.csdn.net/weixin_43343144/article/details/89222438)


<fix-link label="Back" href="/more/web3/"></fix-link>