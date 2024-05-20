---
title: 面试题-算法
date: 2024-03-02 10:24:04
permalink: false
article: false
categories:
  - null
tags:
  - null
---

# 面试题-算法


- `数组、链表、栈、队列都是线性表`，它表示的结构都是一段线性的结构，与之对应的就是`非线性表，例如树、图、堆`等，它表示的结构都非线性。


- 链表相对于数组来说，要复杂的多，首先，链表不需要连续的内存空间，它是由一组零散的内存块透过指针连接而成，所以，每一个块中必须包含当前节点内容以及后继指针。最常见的链表类型有`单链表、双链表以及循环链表`。


- 单链表：
``` js
function List () {
  // 节点
  let Node = function (element) {
    this.element = element
    this.next = null
  }
  // 初始头节点为 null
  let head = null
  
  // 链表长度
  let length = 0
  // 操作
  this.getList = function() {return head}
  this.search = function(list, element) {}
  this.append = function(element) {}
  this.insert = function(position, element) {}
  this.remove = function(element){}
  this.isEmpty = function(){}
  this.size = function(){}
}
```


- 栈：
``` js
function Stack() {
  let items = []
  this.push = function(e) { 
    items.push(e) 
  }
  this.pop = function() { 
    return items.pop() 
  }
  this.isEmpty = function() { 
    return items.length === 0 
  }
  this.size = function() { 
    return items.length 
  }
  this.clear = function() { 
    items = [] 
  }
}
```

- 队列：
``` js
function Queue() {
  let items = []
  this.enqueue = function(e) {
    items.push(e)
  }
  this.dequeue = function() {
    return items.shift()
  }
  this.isEmpty = function() {
    return items.length === 0
  }
  this.front = function() {
    return items[0]
  }
  this.clear = function() { 
    items = [] 
  }
  this.size = function() {
    return items.length
  }
}
```



- 散列表（哈希表、Hash 表）: 给定的 key 称为关键字，关键字通过散列函数计算出来的值则称为散列值（哈希值、Hash 值）。通过散列值到**散列表（哈希表、Hash 表）**中就可以获取检索值。


- 二叉树：
``` js
function Tree(val) {
    // 保存当前节点 key 值
    this.val = val
    // 指向左子节点
    this.left = null
    // 指向右子节点
    this.right = null
}
```

二叉树的遍历可分为：
1. 前序遍历: `中 => 左 => 右`
2. 中序遍历：`左 => 中 => 右`
3. 后序遍历：`左 => 右 => 中`



- 堆：
1. 堆是一个完全二叉树
2. 堆上的任意节点值都必须大于等于（大顶堆）或小于等于（小顶堆）其左右子节点值

如果堆上的任意节点都大于等于子节点值，则称为 `大顶堆`；如果堆上的任意节点都小于等于子节点值，则称为 `小顶堆`
> 也就是说，在大顶堆中，根节点是堆中最大的元素；在小顶堆中，根节点是堆中最小的元素；


- 二叉查找树（BST树）

二叉查找树与二叉树不同的是，它在二叉树的基础上，增加了对二叉树上节点存储位置的限制:
1. 左子节点值小于该节点值
2. 右子节点值大于等于该节点值


``` js
function BinarySearchTree() {
  let Node = function (key) {
    this.key = key
    this.left = null
    this.right = null
  }
  let root = null
  
  // 插入
  this.insert = function(key){
    // 创建新节点
    let newNode = new Node(key)
    // 判断是否为空树
    if(root === null) {
        root = newNode
    } else {
        insertNode(root, newNode)
    }
  }
  
  // 查找
  this.search = function(key){}
  
  // 删除
  this.remove = function(key){}
  
  // 最大值
  this.max = function(){}
  
  // 最小值
  this.min = function(){}
  
  // 中序遍历
  this.inOrderTraverse = function(){}
  
  // 先序遍历
  this.preOrderTraverse = function(){}
  
  // 后序遍历
  this.postOrderTraverse = function(){}
}
```


- **Array.prototype.sort**

关于 Array.prototype.sort() ，ES 规范并没有指定具体的算法，在 V8 引擎中， 7.0 版本之前，`数组长度小于10时， Array.prototype.sort() 使用的是插入排序，否则用快速排序`。

在 V8 引擎 7.0 版本之后就舍弃了快速排序，因为它不是稳定的排序算法，在最坏情况下，时间复杂度会降级到 O(n2)。

而是采用了一种`混合排序的算法：TimSort` 。

这种功能算法最初用于Python语言中，严格地说它不属于以上10种排序算法中的任何一种，属于一种混合排序算法：

在数据量小的子数组中使用插入排序，然后再使用`归并排序`将有序的子数组进行合并排序，`时间复杂度为 O(nlogn)` 。




- 正则匹配的时间复杂度怎么算？

虽然正则表达式匹配的时间复杂度通常与文本长度成正比`（O(n)）`，但正则表达式的具体结构可能会显著增加这个复杂度。

正则表达式的时间复杂度主要取决于所采用的匹配算法。一般来说，最慢的正则表达式匹配算法的时间复杂度为指数级别`（O(2^n)）`，其中n是要匹配的字符串的长度。而最快的正则表达式匹配算法的时间复杂度为线性`（O(n)）`。




## 参考

- [JavaScript-Algorithms](https://github.com/sisterAn/JavaScript-Algorithms)
