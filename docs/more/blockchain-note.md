---
title: 《区块链技术与应用》学习笔记
date: 2022-05-23 23:17:19
permalink: false
categories:
  - 区块链
tags:
  - Web3
  - 区块链
---


# 《区块链技术与应用》学习笔记

[课程地址]()


## 比特币

### Part1-密码学原理

crypto-currency: 加密货币

cryptographic hash function: 加密哈希函数





1. collision resistance: 哈希碰撞
> x != y, H(x) = H(y); 不同的输入，相同的输出; 输入空间无限大，输出空间有限（2^256）

**鸽笼原理：两个不同的输入，必然会映射到一个相同的输出**


- MD5


2.  hiding, 单向的，
> digital commitment（digital equipment of sealed evelope）: 预测结果不能提前公开
2. puzzle friendly

比特币中用的哈希函数：SHA-256

比特币账户：public key, private key
> 公钥相当于银行账户，私钥相当于账户密码

例子：我向你转账10个比特币，会生成交易记录，通知所有人；
> 生成交易记录时，我会签名，签名用的是私钥，其他人收到交易信息验证签名，验证签名用的是我的公钥



## 以太坊




## 参考

