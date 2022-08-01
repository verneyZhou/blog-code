---
title: JS算法整理笔记
date: 2022-04-01 19:33:06
permalink: false
categories: 
  - js
tags: 
  - 算法
---



# JS算法整理笔记


## 简介
> **算法（Algorithm）是指用来操作数据、解决程序问题的一组方法。** 对于同一个问题，使用不同的算法，也许最终得到的结果是一样的，但在过程中消耗的资源和时间却会有很大的区别。

算法主要从「时间」和「空间」两个维度去考量：
- 时间维度：是指执行当前算法所消耗的时间，我们通常用「时间复杂度」来描述。
- 空间维度：是指执行当前算法需要占用多少内存空间，我们通常用「空间复杂度」来描述。

### 时间复杂度
> 一个算法执行所耗费的时间，从理论上是不能算出来的，必须上机运行测试才能知道；但没有必要对每个算法都上机测试，而且这种方式非常容易受运行环境的影响，在性能高的机器上跑出来的结果与在性能低的机器上跑的结果相差会很大。

一个算法中的语句执行次数称为语句频度或时间频度。记为`T(n)`。当n不断变化时，时间频度`T(n)`也会不断变化。但有时我们想知道它变化时呈现什么规律，为此我们引入**时间复杂度**的概念。


- **大O符号表示法**

大O符号表示法是一种更通用的用来体现时间复杂度的记法。在大O符号表示法中，时间复杂度的公式是： `T(n) = O( f(n) )`，其中`f(n)` 表示每行代码执行次数之和，而 `O` 表示正比例关系，这个公式的全称是：**算法的渐进时间复杂度。**

大O符号表示法并不是用于来真实代表算法的执行时间的，它是用来表示代码执行时间的增长变化趋势的。


常见的时间复杂度量级有：

- 常数阶`O(1)`
> 无论代码执行了多少行，只要是没有循环等复杂结构，那这个代码的时间复杂度就都是O(1)，如:
``` js
int i = 1;
int j = 2;
++i;
j++;
int m = i + j;
```


- 线性阶`O(n)`
> for循环里面的代码会执行n遍，因此它消耗的时间是随着`n`的变化而变化的，因此这类代码都可以用`O(n)`来表示它的时间复杂度
``` js
for(i=1; i<=n; ++i)
{
   j = i;
   j++;
}
```

- 对数阶`O(logN)`
``` js
int i = 1;
while(i<n)
{
    i = i * 2;
}
```
> 从上面代码可以看到，在while循环里面，每次都将 i 乘以 2，乘完之后，i 距离 n 就越来越近了。我们试着求解一下，假设循环x次之后，i 就大于 2 了，此时这个循环就退出了，也就是说 2 的 x 次方等于 n，那么 `x = log2^n`

也就是说当循环 `log2^n` 次以后，这个代码就结束了。因此这个代码的时间复杂度为：O(logn)


- 线性对数阶`O(nlogN)`
> 线性对数阶`O(nlogN)` 其实非常容易理解，将时间复杂度为`O(logn)`的代码循环N遍的话，那么它的时间复杂度就是 `n * O(logN)`，也就是了`O(nlogN)`。
``` js
for(m=1; m<n; m++)
{
    i = 1;
    while(i<n)
    {
        i = i * 2;
    }
}
```


- 平方阶`O(n²)`
> 把 `O(n)` 的代码再嵌套循环一遍，它的时间复杂度就是 `O(n²)` 了。
``` js
for(x=1; x<=n; x++)
{
   for(i=1; i<=n; i++)
    {
       j = i;
       j++;
    }
}
```

- 立方阶`O(n³)`
> 参考上面的`O(n²)` 去理解就好了，`O(n³)`相当于三层n循环。


除了上述常见复杂度外，还有K次方阶`O(n^k)`、指数阶`(2^n)`、阶乘阶`O(n!)`、平方根阶`O(√n)`。

常用的时间复杂度按照耗费的时间从小到大依次是：

`O(1)<O(logn)<O(n)<O(nlogn)<O(n²)<O(n³)<O(2ⁿ)<O(n!)`




### 空间复杂度
> 空间复杂度是对一个算法在运行过程中临时占用存储空间大小的一个量度，同样反映的是一个趋势，我们用 `S(n)` 来定义。

- 空间复杂度 `O(1)`
> 如果算法执行所需要的临时空间不随着某个变量n的大小而变化，即此算法空间复杂度为一个常量，可表示为 `O(1)`
``` js
int i = 1;
int j = 2;
++i;
j++;
int m = i + j;
```


- 空间复杂度 `O(n)`
``` js
int[] m = new int[n]
for(i=1; i<=n; ++i)
{
   j = i;
   j++;
}
```
这段代码中，第一行new了一个数组出来，这个数据占用的大小为n，这段代码的2-6行，虽然有循环，但没有再分配新的空间，因此，这段代码的空间复杂度主要看第一行即可，即 S(n) = O(n)

> 参考：[算法的时间与空间复杂度（一看就懂）](https://zhuanlan.zhihu.com/p/50479555)、[算法（一）时间复杂度](https://blog.csdn.net/itachi85/article/details/54882603)



## 算法类型

### 暴力枚举
> 暴力枚举应该是最简单直接的一种算法，通过循环遍历找到答案。

比如：
``` js
// 数组中的第K个最大元素：给定整数数组 nums 和整数 k，请返回数组中第 k 个最大的元素。请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。
// https://leetcode-cn.com/problems/kth-largest-element-in-an-array/
// 暴力排序
function findKthLargest(nums, k) {
    let arr = nums.sort((a,b) => b - a).slice(0,k); // 倒序，截取
    return arr[k-1];
}
console.log('=======findKthLargest', findKthLargest([3,2,3,1,2,4,5,5,6], 4)); // 4
```


### 哈希法

[Map](https://es6.ruanyifeng.com/#docs/set-map#Map) 和 [Set](https://es6.ruanyifeng.com/#docs/set-map#Set):

``` js
Map: 
    m.set(o, 'content')
    m.get(o) // "content"
    m.has(o) // true
    m.delete(o) // true
    m.has(o) // false

Set: 
    s.add(1).add(2).add(2);
    s.size // 2
    s.has(1) // true
    s.has(2) // true
    s.has(3) // false
    s.delete(2);
    s.has(2) // false
```
例子：
``` js
// 1. 两数之和：给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target  的那 两个 整数，并返回它们的数组下标。
// https://leetcode-cn.com/problems/two-sum/
function twoNum(nums, target) {
    let map = new Map();
    for(let i = 0; i < nums.length; i ++) {
        let diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i]; // 返回两个下标
        }
        map.set(nums[i], i); // 保存下标
    }
    return [-1, -1];
}

console.log('=====twoNum', twoNum([2,7,11,15], 22));


// 字母异位词分组: 给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。字母异位词 是由重新排列源单词的字母得到的一个新单词，所有源单词中的字母通常恰好只用一次。
// 分析：["eat", "tea", "tan", "ate", "nat", "bat"] => {'aet': ["ate","eat","tea"], 'ant': ["nat","tan"], 'abt': ["bat"]}
// https://leetcode-cn.com/problems/group-anagrams/
// 时间复杂度：O(nklogk)，其中 n 是 strs 中的字符串的数量，k 是 strs 中的字符串的的最大长度。需要遍历 n 个字符串，对于每个字符串，需要 O(klogk) 的时间进行排序以及 O(1) 的时间更新哈希表，因此总时间复杂度是 O(nklogk)。
// 空间复杂度：O(nk)，其中 n 是 strs 中的字符串的数量，k 是 strs 中的字符串的的最大长度。需要用哈希表存储全部字符串。
function groupAnagrams(strs) {
    const map = new Map();
    for(let str of strs) {
        let arr = Array.from(str); // Array.from('abc') => ['a', 'b', 'c']
        arr.sort(); // 排序
        let key = arr.toString(); // ['a','b', 'c'] => a,b,c
        let list = map.get(key) || new Array();
        list.push(str);
        map.set(key, list); // 更新哈希表
    }
    return Array.from(map.values()); // 获取所有哈希值，再返回一个数组
}
console.log('======groupAnagrams', groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])) // [ [ 'eat', 'tea', 'ate' ], [ 'tan', 'nat' ], [ 'bat' ] ]




// 最长连续序列：给定一个未排序的整数数组 nums ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。
// https://leetcode-cn.com/problems/longest-consecutive-sequence/
// 左邻居告诉它左边能提供的连续长度，右邻居告诉它右边能提供的连续长度
// 加上它自己的长度，就有了自己处在的连续序列的长度
function longestConsecutive(nums) {
    let map = new Map()
    let max = 0
    for (const num of nums) { // 遍历nums数组
        if (!map.has(num)) { // 重复的数字不考察，跳过
        let preLen = map.get(num - 1) || 0  // 获取左邻居所在序列的长度 
        let nextLen = map.get(num + 1) || 0 // 获取右邻居所在序列的长度 
        let curLen = preLen + 1 + nextLen   // 新序列的长度
        map.set(num, curLen) // 将自己存入 map
        max = Math.max(max, curLen) // 和 max 比较，试图刷新max
        map.set(num - preLen, curLen)  // 更新新序列的左端数字的value
        map.set(num + nextLen, curLen) // 更新新序列的右端数字的value
        }
    }
    /**
        map
        100 > 0+1+0
        4 > 0+1+0
        200 > 0+1+0
        1 > 0+1+0
        3 > 0+1+1, 4 > 2
        2 > 1+1+2, 1 > 4, 3 > 4
    */
    return max
}
console.log('========longestConsecutive', longestConsecutive([100,4,200,1,3,2])); // 4


// 存在重复元素：给你一个整数数组 nums 。如果任一值在数组中出现 至少两次 ，返回 true ；如果数组中每个元素互不相同，返回 false 。
// https://leetcode-cn.com/problems/contains-duplicate/
// a. Set去重
// function containsDuplicate(nums) {
//     return [...new Set(nums)].length !== nums.length;
// }
// b.哈希
function containsDuplicate(nums) {
    let map = new Map();
    for (let v of nums) {
        if (map.has(v)) {
            return true;
        } else {
            map.set(v, true);
        }
    }
    return false;
}
console.log('=======containsDuplicate', containsDuplicate([1,1,1,3,3,4,3,2,4,2]), containsDuplicate([1,2,3,4])); // true false
```




### 递归

程序调用自身的编程技巧称为递归（ recursion）。递归作为一种算法在程序设计语言中广泛应用。 一个过程或函数在其定义或说明中有直接或间接调用自身的一种方法，它通常把一个大型复杂的问题层层转化为一个与原问题相似的规模较小的问题来求解，递归策略只需少量的程序就可描述出解题过程所需要的多次重复计算，大大地减少了程序的代码量。


``` js

// 递归


// 电话号码的字母组合：给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。答案可以按 任意顺序 返回。
// https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number/
function letterCombinations(digits) { // '23' => ["ad","ae","af","bd","be","bf","cd","ce","cf"]
    if (!digits.length) return [];
    let res = [];
    const map = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' };

    // 深度优先遍历
    const dfs = (str, i) => {

        if (i > digits.length - 1) { //  指针越界，递归的出口
            res.push(str); //  将解推入res
            return; // 结束当前递归分支
        }

        const letters = map[digits[i]]; // 当前数字对应的字母
        for(let letter of letters) { // 一个字母是一个选择，对应一个递归分支
            dfs(str + letter, i + 1); // 选择翻译成letter，生成新字符串，i指针右移继续翻译（递归）
        }
    }

    dfs('', 0); // 递归的入口，初始字符串为''，从下标0开始翻译
    return res;
}

console.log('========letterCombinations',letterCombinations('23'));


// 括号生成：数字 n 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 有效的 括号组合。
// https://leetcode-cn.com/problems/generate-parentheses/
function generateParenthesis(n) { // 3 => ["((()))","(()())","(())()","()(())","()()()"]
    let res = [];

    const dfs = (left, right, str) => { // 左右括号所剩的数量，str是当前构建的字符串
        if (str.length >= n * 2) { //字符串构建完成，结束当前递归分支
            res.push(str);
            return;
        }
        if (left > 0) {  // 只要左括号有剩，就可以选它，然后继续做选择（递归）
            dfs(left - 1, right, str += "(");
        }
        if (left < right) { // 右括号比左括号剩的多，才能选右括号
            dfs(left, right - 1, str += ")");  // 然后继续做选择（递归）
        }
    }

    dfs(n,n, ''); // 递归的入口，剩余数量都是n，初始字符串是空串
    return res;
}
console.log('=====generateParenthesis',generateParenthesis(3));



// 实现 pow(x, n) ，即计算 x 的 n 次幂函数（即，x^n ）。
// https://leetcode-cn.com/problems/powx-n/
function myPow(x,n) {
    if (n == 0) return 1;
    // 负数：x^n = 1 / (x * x^(-n-1))
    if (n < 0) return 1 / (x * myPow(x, -n-1));

    // 奇数: x^n = x * x^(n-1)
    if (n % 2) return x * myPow(x, n-1);

    // 偶数：x^n = (x^2)^(n/2)
    return myPow(x * x, n/2);
}
console.log('=====myPow', myPow(2, 10), myPow(2, -2)); // 1024 0.25



// 子集：给你一个整数数组 nums ，数组中的元素 互不相同 。返回该数组所有可能的子集（幂集）。解集 不能 包含重复的子集。你可以按 任意顺序 返回解集。
// https://leetcode-cn.com/problems/subsets/
function subsets(nums) {
    const res = [];
    const dfs = (i, list) => {
        if (i >= nums.length) { //  指针越界,结束递归
            res.push(list.slice());
            return;
        }
        list.push(nums[i]); // 选择该数
        dfs(i + 1, list);  // 基于该选择，继续往下递归，考察下一个数
        list.pop(); // 上面递归结束，撤销选择
        dfs(i + 1, list); // 不选这个数，继续往下递归，考察下一个数
    }
    dfs(0, []); // 递归入口
    return res;
}
console.log('=====subsets', subsets([1,2,3])) // [[1,2,3],[1,2],[1,3],[1],[2,3],[2],[3],[]]


// 阶乘后的零：给定一个整数 n ，返回 n! 结果中尾随零的数量。
// https://leetcode-cn.com/problems/factorial-trailing-zeroes/
// 思路：一对2的倍数和5的倍数，贡献一个0；阶乘中，2的倍数肯定比5的倍数多。所以，只需要考虑5的倍数出现了多少次
function trailingZeroes(n) {
    if (n < 5) return 0;
    else {
        let k = Math.floor(n/5);
        return k + trailingZeroes(k);
    }
}
// while循环
// function trailingZeroes(n) {
//     let res = 0;
//     while(n >= 5) {
//         let k = Math.floor(n/5);
//         res += k;
//         n = k;
//     }
//     return res;
// }
console.log('=====trailingZeroes', trailingZeroes(22)); // 4



// 岛屿数量：给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。此外，你可以假设该网格的四条边均被水包围。
// https://leetcode-cn.com/problems/number-of-islands/
// 遍历遇到 1 即遇到土地，土地肯定在一个岛上，计数 +1;
// 递归沉岛：把与它和同在一个岛的土地变成 0
function numIslands(grid) {
    let count = 0;
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[0].length; j ++) {
            if (grid[i][j] == '1') {
                count ++;
                turnZero(i,j, grid); // 沉岛
            }
        }
    }
    return count;

    function turnZero(i,j,grid) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] == '0') return;
        grid[i][j] = '0'; // 变成0
        // 递归执行，将相邻岛屿都变为0
        turnZero(i-1, j, grid);
        turnZero(i+1, j, grid);
        turnZero(i, j-1, grid);
        turnZero(i, j+1, grid);
    }
}
console.log('========numIslands', numIslands([["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]])); // 3


```


### 回溯

回溯算法实际上一个类似枚举的搜索尝试过程，主要是在搜索尝试过程中寻找问题的解，当发现已不满足求解条件时，就“回溯”返回，尝试别的路径。回溯法是一种选优搜索法，按选优条件向前搜索，以达到目标。但当探索到某一步时，发现原先选择并不优或达不到目标，就退回一步重新选择，这种走不通就退回再走的技术为回溯法，而满足回溯条件的某个状态的点称为“回溯点”。许多复杂的，规模较大的问题都可以使用回溯法，有“通用解题方法”的美称。

``` js

// 回溯算法

// 全排列：给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。
// https://leetcode-cn.com/problems/permutations/
function permute(nums) {
    const res = [], path = [];
    backtracking(nums, nums.length, []); // 递归入口
    return res;

    function backtracking(n, k, used) {
        if (path.length >= k) { // 递归出口, 结束递归
            res.push(Array.from(path)) // Array.from 转成真正的数组，拷贝
            return;
        }

        // 遍历
        for (let i = 0; i < k; i++ ) {
            if(used[i]) continue; // 如果该位置已经取过，跳出当前循环，执行下一个循环
            path.push(n[i]); // 添加
            used[i] = true; // 标记当前位置已经取过
            backtracking(n, k, used); // 递归调用
            // 递归完成后，回溯，恢复初始化，方便下一个循环使用
            path.pop(); // 移除刚添加的最后一个元素
            used[i] = false; // 撤销记录
        }

    }
}
console.log('=====permute', permute([1,2,3])) // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]



// 单词拆分：给你一个字符串 s 和一个字符串列表 wordDict 作为字典。请你判断是否可以利用字典中出现的单词拼接出 s 。
// https://leetcode-cn.com/problems/word-break/
// 用 DFS 回溯，考察所有的拆分可能，指针从左往右扫描：
//  如果指针的左侧部分是单词，则对剩余子串递归考察。
//  如果指针的左侧部分不是单词，不用看了，回溯，考察别的分支。
// 链接：https://leetcode-cn.com/problems/word-break/solution/shou-hui-tu-jie-san-chong-fang-fa-dfs-bfs-dong-tai/


```


### 动态规划
> 动态规划（Dynamic Programming，DP）是一种将复杂问题分解成小问题求解的策略, 动态规划各子问题是相互关联的。

动态规划算法是通过拆分问题，定义问题状态和状态之间的关系，使得问题能够以递推（或者说分治）的方式去解决。
动态规划算法的基本思想与分治法类似，也是将待求解的问题分解为若干个子问题（阶段），按顺序求解子阶段，前一子问题的解，为后一子问题的求解提供了有用的信息。在求解任一子问题时，列出各种可能的局部解，通过决策保留那些有可能达到最优的局部解，丢弃其他局部解。依次解决各子问题，最后一个子问题就是初始问题的解。

``` js

/**
 * 动态规划（Dynamic Programming，DP）是一种将复杂问题分解成小问题求解的策略, 动态规划各子问题是相互关联的
 */


// 不同路径：一个机器人位于一个 m x n 网格的左上角 （起始点在下图中标记为 “Start” ）。机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish” ）。问总共有多少条不同的路径？
// 链接：https://leetcode-cn.com/problems/unique-paths
// 动态规划：f(i,j)=f(i−1,j)+f(i,j−1)
// 时间复杂度：O(mn)。
// 空间复杂度：O(mn)，即为存储所有状态需要的空间
function uniquePaths(m,n) {
    let arr = new Array(m).fill(0).map(() => new Array(n).fill(0)); // 生成 m*n 矩阵
    // 初始化步数
    for(let i = 0; i < m; i++) {
        arr[i][0] = 1;
    }
    for(let j = 0; j < n; j++) {
        arr[0][j] = 1;
    }
    // 遍历
    for(let i = 1; i < m; i ++) {
        for (let j = 1; j < n; j ++) {
            arr[i][j] = arr[i-1][j] + arr[i][j-1]; // 动态规划方程
        }
    }
    return arr[m-1][n-1];
}
console.log('=======uniquePaths', uniquePaths(3, 7)) // 28



// 爬楼梯：假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？
// https://leetcode-cn.com/problems/climbing-stairs/
//  dp[n]=dp[n−1]+dp[n−2]
// 1. 爬上 n-1 阶楼梯的方法数量。因为再爬1阶就能到第n阶
// 2. 爬上 n-2 阶楼梯的方法数量，因为再爬2阶就能到第n阶
function climbStairs(n) {
    const dp = [];
    dp[0] = 1;
    dp[1] = 1; 
    for(let i = 2; i <= n; i++ ) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}

console.log('========climbStairs', climbStairs(3)); // 3


// 解码方法
// https://leetcode-cn.com/problems/decode-ways/
// 时间复杂度：O(n)，其中 n 是字符串 s 的长度。
// 空间复杂度：O(n)
// f[i]表示字符串 s 的前 i 个字符 s[1..i] 的解码方法数
// 在进行状态转移时，我们可以考虑最后一次解码使用了 s 中的哪些字符，那么会有下面的两种情况：
    // 1. 匹配一个字符
    // 2. 匹配两个字符
function numDecodings(s) {
    let len = s.length;
    let f = new Array(len+1).fill(0);
    f[0] = 1; // 空字符串可以有 1 种解码方法，解码出一个空字符串。
    for(let i = 1; i <= len; i ++) {
        if (s[i-1] != '0') { // 匹配一个字符: 1 ~ 9
            f[i] += f[i-1];
        }
        if (i > 1 && s[i - 2] != '0' && ((s[i-2] - '0') * 10 + (s[i - 1] - '0') <= 26)) { // 匹配两个字符: 10 ~ 26
            f[i] += f[i-2];
        } 
    }
    return f[len];
}
console.log('==========numDecodings', numDecodings('226')); // 3



// 买卖股票的最佳时机：给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。
// https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/
//  时间复杂度：O(n)
// 空间复杂度：O(1)
// dp[i] = Math.max(dp[i−1], prices[i] - minprice)
function maxProfit(prices) {
    let max = 0, minPrice = prices[0];
    for(let i = 1; i < prices.length; i++) {
        minPrice = Math.min(minPrice, prices[i]);
        max = Math.max(max, prices[i] - minPrice);
    }
    return max;
}
console.log('======maxProfit', maxProfit([7,1,5,3,6,4])); // 5



// 买卖股票的最佳时机II：给定一个数组 prices ，其中 prices[i] 表示股票第 i 天的价格。在每一天，你可能会决定购买和/或出售股票。你在任何时候 最多 只能持有 一股 股票。你也可以购买它，然后在 同一天 出售。返回 你能获得的 最大 利润 。
// https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-ii/
//  时间复杂度：O(n)
// 空间复杂度：O(1)
function maxProfitV2(prices) {
    const n = prices.length;
    let res = 0, dp1 = -prices[0];
    for (let i = 1; i < n; ++i) {
        let newDp0 = Math.max(res, dp1 + prices[i]);
        let newDp1 = Math.max(dp1, res - prices[i]);
        res = newDp0;
        dp1 = newDp1;
    }
    return res;
}
// 贪心算法: 当前价格高于前一个，将价差计入利润，遍历结束可得全部利润
//  时间复杂度：O(n)
// 空间复杂度：O(1)
function maxProfitV2(prices) {
    let res = 0;
    for(let i = 1; i < prices.length; i++) {
        res += Math.max(0, prices[i] - prices[i-1]);
    }
    return res;
}

console.log('======maxProfitV2', maxProfitV2([7,1,5,3,6,4])); // 7



// 乘积最大子数组: 给你一个整数数组 nums ，请你找出数组中乘积最大的连续子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。
// https://leetcode-cn.com/problems/maximum-product-subarray/
// j的最优解，依赖 j-1 的最优解
// 考虑到存在负数，j-1可能为最大积，有可能为最小积
function maxProduct(nums) {
    let res = nums[0];
    let min = nums[0]; // 最小积
    let max = nums[0]; // 最大积
    for (let i = 1; i < nums.length; i++) {
        let temp1 = min * nums[i];
        let temp2 = max * nums[i];
        min = Math.min(temp1, temp2, nums[i]); // 负数的最小积
        max = Math.max(temp1, temp2, nums[i]); // 正数的最大积
        res = Math.max(max, res); // 更新最大值
    }
    return res;
}
console.log('======maxProduct', maxProduct([2,3,-2,4])); // 6




// 打家劫舍：你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。
// 链接：https://leetcode-cn.com/problems/house-robber
// 由于不可以在相邻的房屋闯入，所以在当前位置 n 房屋可盗窃的最大值，要么就是 n-1 房屋可盗窃的最大值，要么就是 n-2 房屋可盗窃的最大值加上当前房屋的值，二者之间取最大值。
// 动态规划方程：dp[n] = MAX( dp[n-1], dp[n-2] + num )
// 时间： O(n)
function rob(nums) {
    let dp = new Array(nums.length+1);
    dp[0] = 0;
    dp[1] = nums[0];
    for (let i = 2; i <= nums.length; i++) {
        dp[i] = Math.max(dp[i-1], (dp[i-2] + nums[i-1]));
    }
    return dp[nums.length];
}
console.log('========rob', rob([2,7,9,3,1])); // 12
```


### 二分法
> 二分法查找，也称为折半法，是一种在有序数组中查找特定元素的搜索算法。

二分法查找的思路如下：
1. 首先，从数组的中间元素开始搜索，如果该元素正好是目标元素，则搜索过程结束，否则执行下一步。
2. 如果目标元素大于/小于中间元素，则在数组大于/小于中间元素的那一半区域查找，然后重复步骤（1）的操作。
3. 如果某一步数组为空，则表示找不到目标元素。

``` js


// 二分法


// 查找升序数组中某元素下标
function binarySearch(arr,key){
	var low=0; //数组最小索引值
	var high=arr.length-1; //数组最大索引值
	while(low<=high){
		var mid=Math.floor((low+high)/2);
		if(key==arr[mid]){
			return mid;
		}else if(key>arr[mid]){
			low=mid+1;
		}else{
			high=mid-1;
		}
	}
	return -1; //low>high的情况，这种情况下key的值大于arr中最大的元素值或者key的值小于arr中最小的元素值
}



// 搜索旋转排序数组: 整数数组 nums 按升序排列，数组中的值 互不相同 。
// https://leetcode-cn.com/problems/search-in-rotated-sorted-array/
  // 时间复杂度：O(logn)
  // 空间复杂度：O(1)
//     可以先找出mid，然后根据mid来判断:
//     假如mid小于start，则mid一定在右边有序部分。
//     假如mid大于等于start， 则mid一定在左边有序部分。
function search(nums, target) {
    let start = 0, end = nums.length - 1;
    while(start <= end) {
        let mid = start + ((end - start) >> 1); // 找出中位数
        if (nums[mid] === target) return mid;
        
        if (nums[mid] >= nums[start]) { // [start, mid] 有序
            if (target >= nums[start] && target <= nums[mid]) { // target 在 [start, mid] 之间
                end = mid - 1; // 移动右指针
            } else { // target 不在 [start, mid] 之间
                start = mid + 1; // 移动左指针
            }
        } else { // [mid, end]有序
            if (target >= nums[mid] && target <= nums[end]) { // target 在 [mid, end] 之间
                start = mid + 1;
            } else { // target 不在 [mid, end] 之间
                end = mid - 1;
            }
        }
    }
    return -1;
}
console.log('======search', search([4,5,6,7,0,1,2], 0)) // 4



// 在排序数组中查找元素的第一个和最后一个位置： 给定一个按照升序排列的整数数组 nums，和一个目标值 target。找出给定目标值在数组中的开始位置和结束位置。如果数组中不存在目标值 target，返回 [-1, -1]。
// https://leetcode-cn.com/problems/find-first-and-last-position-of-element-in-sorted-array/
function searchRange(nums, target) {
    let res = [-1, -1];
    let left = bindSearch(nums, target, true); // 查找左侧下标
    let right = bindSearch(nums, target, false) - 1; // 查找右侧下标
    if (left < right && right < nums.length && nums[left] === target && nums[right] === target) {
        res = [left, right];
    }

    return res;


    // 查找下标
    function bindSearch(nums, target, lower) {
        let left = 0, right = nums.length - 1;
        let index = nums.length - 1;
        while(left <= right) {
            let mid = left + ((right - left) >> 1);
            if (nums[mid] > target || (lower && nums[mid] >= target)) { // 目标值在 [left, mid]之间
                right = mid - 1;
                index = mid;
            } else { // 目标值在 [mid, right]之间
                left = mid + 1;
            }
        }
        return index;
    }
}
console.log('========searchRange', searchRange([5,7,7,8,8,10], 8)) // [3,4]




// x 的平方根: 给你一个非负整数 x ，计算并返回 x 的 算术平方根 。由于返回类型是整数，结果只保留 整数部分 ，小数部分将被 舍去 。
// https://leetcode-cn.com/problems/sqrtx/
// a. 暴力破解法
// function mySqrt(x) {
//     let i = 0;
//     while(!(i*i <= x && (i+1)*(i+1) > x)) {
//         i ++;
//     }
//     return i;
// }

// b. 二分法
function mySqrt(x) {
    if (x < 2) return x;
    let left = 1, right = x >> 1; // 除以2并取整，缩小一下遍历的范围: 4>>>2 = 2; 5>>>2 = 2;
    while(left + 1 < right) {
        let mid = (left + right) >> 1; // 中位数
        if (mid * mid === x) return mid; // 刚好满足
        else if (mid * mid < x) left = mid; // 左边界右移
        else right = mid; // 右边界左移 
    }
    // 循环结束
    return right * right > x ? left : right;
}
console.log('=======mySqrt', mySqrt(8));


// 寻找峰值：峰值元素是指其值严格大于左右相邻值的元素。给你一个整数数组 nums，找到峰值元素并返回其索引。数组可能包含多个峰值，在这种情况下，返回 任何一个峰值 所在位置即可。
// 链接：https://leetcode-cn.com/problems/find-peak-element
// a. 遍历
// 时间复杂度：O(n)，其中 n 是数组 nums 的长度。
// 空间复杂度：O(1)
function findPeakElement(nums) {
    let idx = 0;
    for (let i = 1; i < nums.length; ++i) {
        if (nums[i] > nums[idx]) {
            idx = i;
        }
    }
    return idx;
}
// b. 二分法
function findPeakElement(nums) {
    // 辅助函数，输入下标 i，返回一个二元组 (0/1, nums[i])
    // 方便处理 nums[-1] 以及 nums[n] 的边界情况
    const get = (nums, idx) => {
        if (idx === -1 || idx === nums.length) {
            return [0, 0];
        }
        return [1, nums[idx]];
    }

    const compare = (nums, idx1, idx2) => {
        const num1 = get(nums, idx1);
        const num2 = get(nums, idx2);
        if (num1[0] !== num2[0]) {
            return num1[0] > num2[0] ? 1 : -1;
        }
        if (num1[1] === num2[1]) {
            return 0;
        }
        return num1[1] > num2[1] ? 1 : -1;
    }

    const n = nums.length;
    let left = 0, right = n - 1, ans = -1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (compare(nums, mid - 1, mid) < 0 && compare(nums, mid, mid + 1) > 0) {
            ans = mid;
            break;
        }
        if (compare(nums, mid, mid + 1) < 0) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return ans;
}
console.log('=====findPeakElement', findPeakElement([1,2,1,3,5,6,4])); // 1或5


```


### 双指针
> 双指针，指的是在遍历对象的过程中，不是普通的使用单个指针进行访问，而是使用两个相同方向（快慢指针）或者相反方向（对撞指针）的指针进行扫描，从而达到相应的目的。

``` js

// 双指针法


// 1. 无重复字符的最长子串: 给定一个字符串 s ，请你找出其中不含有重复字符的 最长子串 的长度。
// https://leetcode-cn.com/problems/longest-substring-without-repeating-characters/
function lengthOfLongestSubstring(s) {
    let set = new Set(); // 保存不重复的字符
    let right = 0; // 右指针
    let res = 0;
    let len = s.length;
    // 遍历左指针
    for(let i = 0; i < len; i ++) {

        // 当i递增时，说明右指针已经循环结束，找到了重复值，
        // 这时set删除下标i的前一个字符，重新开始移动右指针，重新计算长度
        if (i) {
            set.delete(s.charAt(i - 1)); // 左指针向右移动一格，移除一个字符
        }

        // 右指针还没遍历结束，且下一个字符没有重复
        while(!set.has(s.charAt(right)) && right < len) {
            set.add(s.charAt(right)); // 将下一个字符添加到set中
            right ++; // 右指针递增
        }

        res = Math.max(res, right - i); // 上面while循环结束，即遇到重复字符,则更新res的值：右指针 - 左指针
    }

    return res;
}

console.log('=====lengthOfLongestSubstring', lengthOfLongestSubstring('pwfsdfsdwkew'))



// 盛最多水的容器：给你 n 个非负整数 a1，a2，...，an，每个数代表坐标中的一个点 (i, ai) 。在坐标内画 n 条垂直线，垂直线 i 的两个端点分别为 (i, ai) 和 (i, 0) 。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。
// 链接：https://leetcode-cn.com/problems/container-with-most-water
// 思路： 先计算首尾两个指针的面积，再将较短指针向中间移动，直到遍历完成，取最大值
function maxArea(height) {
    let max = 0;
    let left = 0, right = height.length - 1;
    while(left < right) {
        let minHeight = Math.min(height[left], height[right]); // 计算最小高度
        let area = (right - left) * minHeight; // 计算面积
        max = Math.max(area, max); // 获取最大值
        height[left] < height[right] ? left ++ : right --; // 移动较短指针
    }
    return max;
}
console.log('======maxArea', maxArea([1,8,6,2,5,4,8,3,7]))





// 三数之和：给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？请你找出所有和为 0 且不重复的三元组。
// https://leetcode-cn.com/problems/3sum/
// 时间复杂度 O(n2)
function threeSum(nums) {
    let res = [];
    if (!nums || nums.length < 3) return res;
    nums.sort((a,b) => a -b); // 升序
    for(let i = 0; i < nums.length; i ++) {

        if (nums[i] > 0) break; // 如果当前数字大于0，则三数之和一定大于0，所以结束循环
        if (i > 0 && nums[i] === nums[i - 1]) continue; // 去重,跳出当前循环

        let left = i + 1, right = nums.length - 1; // 左右指针
        // 移动指针遍历
        while(left < right) {
            let sums = nums[i] + nums[left] + nums[right];
            if (sums === 0) {
                res.push([nums[i], nums[left], nums[right]]);
                while(left < right && nums[left] === nums[left + 1]) left ++; // 去重
                while(left < right && nums[right] === nums[right - 1]) right --; // 去重
                left ++;
                right --;
            } else if (sums < 0) {
                left ++;
            } else if (sums > 0) {
                right --;
            }
        }
    }

    return res;
}
console.log('======threeSum',threeSum([-1,0,1,2,-1,-4]))




// 删除有序数组中的重复项: 给你一个有序数组 nums ，请你 原地 删除重复出现的元素，使每个元素 只出现一次 ，返回删除后数组的新长度。
// 不要使用额外的数组空间，你必须在 原地 修改输入数组 并在使用 O(1) 额外空间的条件下完成。 时间复杂度：O(n)
// https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array/
function removeDuplicates(nums) { // [0,0,1,1,1,2,2,3,3,4] => 5
    if (!nums.length) return 0;
    let slow = 1, fast = 1;
    while(fast < nums.length) {
        if (nums[fast] !== nums[fast - 1]) { // 数组是有序的，那么重复的元素一定会相邻。
            nums[slow] = nums[fast];
            slow ++;
        }
        fast ++;
    }
    return slow;

}
console.log('========removeDuplicates', removeDuplicates([0,0,1,1,1,2,2,3,3,4]))



// 接雨水：给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。
// https://leetcode-cn.com/problems/trapping-rain-water/
// 时间复杂度：O(n)，其中 n 是数组 height 的长度。两个指针的移动总次数不超过 n。
// 空间复杂度：O(1)。只需要使用常数的额外空间。
function trap(height) {
    let res = 0;
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0;
    while(left < right) {
        leftMax = Math.max(leftMax, height[left]);
        rightMax = Math.max(rightMax, height[right]);
        if (height[left] < height[right]) { // 左指针高度 < 右指针高度
            res += leftMax - height[left]; // 计算面积
            left ++; // 右移
        } else {
            res += rightMax - height[right];
            right --; // 左移
        }
    }
    return res;
}
console.log('======trap', trap([0,1,0,2,1,0,1,3,2,1,2,1])) // 6



// 颜色分类：给定一个包含红色、白色和蓝色、共 n 个元素的数组 nums ，原地对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。我们使用整数 0、 1 和 2 分别表示红色、白色和蓝色。
// https://leetcode-cn.com/problems/sort-colors/
function sortColors(nums) {
    let left = 0, cur = 0, right = nums.length - 1;
    while(cur <= right) {
        if (nums[cur] === 2) {
            [nums[cur], nums[right]] = [nums[right], nums[cur]]; // 互换，将cur移至最右边
            right --; // 右指针左移
        }
        if (nums[cur] === 1) { // 为1时则继续递增
            cur ++;
        }
        if (nums[cur] === 0) {
            [nums[cur], nums[left]] = [nums[left], nums[cur]]; // 互换，将cur移至最左边
            left ++; // 左指针右移
            cur ++; // 这里为什么可以自信的直接加1而不检测被调换过来的数字呢？我们可以假设被换过来的数字可能为1，2；但是如果这个数字是2，那么在之前的循环中已经被移动末尾了，所以这个数组只可能是1. 
        }
       
    }
    return nums;
}
console.log('=====sortColors', sortColors([2,0,2,1,1,0])) // [0,0,1,1,2,2]


// 合并两个有序数组: 给你两个按 非递减顺序 排列的整数数组 nums1 和 nums2，另有两个整数 m 和 n ，分别表示 nums1 和 nums2 中的元素数目。请你 合并 nums2 到 nums1 中，使合并后的数组同样按 非递减顺序 排列
// https://leetcode-cn.com/problems/merge-sorted-array/
// 逆向双指针
// 可以指针设置为从后向前遍历，每次取两者之中的较大者放进 nums1 的最后面。
// 时间复杂度：O(m+n)。指针移动单调递减，最多移动 m+n 次，因此时间复杂度为 O(m+n)。
// 空间复杂度：O(1), 直接对数组 nums1 原地修改，不需要额外空间。
function merge(nums1, m, nums2, n) {
    let p1 = m -1, p2 = n -1;
    let total = m + n - 1;
    let cur = null;
    while(p1 >=0 || p2 >= 0) {
        if (p1 <= -1) cur = nums2[p2--]; // num1循环结束
        else if (p2 <= -1) cur = nums1[p1--]; // num2循环结束
        else if (nums1[p1] > nums2[p2])  cur = nums1[p1--]; // 谁大就将它的指针往左移
        else cur = nums2[p2--];

        nums1[total] = cur;
        total --;
    }
    return nums1;
}
console.log('=====merge', merge([1,2,3,0,0,0], 3, [2,5,6], 3)) // [ 1, 2, 2, 3, 5, 6 ]



// 验证回文串：给定一个字符串，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写。
// https://leetcode-cn.com/problems/valid-palindrome/
function isPalindrome(s) {
    s = s.replace(/[^0-9a-zA-Z]/g,'').toLowerCase(); // 过滤掉非数字字母的字符，转为小写
    let [left, right] = [0, s.length - 1];
    while(left < right) {
        if (s[left++] !== s[right--]) return false;
    }
    return true;
}
console.log('=========isPalindrome', isPalindrome('A man, a plan, a canal: Panama')); // true



// 快乐数：编写一个算法来判断一个数 n 是不是快乐数。
/**
 * 「快乐数」 定义为：
    对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和。
    然后重复这个过程直到这个数变为 1，也可能是 无限循环 但始终变不到 1。
    如果这个过程 结果为 1，那么这个数就是快乐数。
 */
// https://leetcode-cn.com/problems/happy-number/
//  快慢指针
// 创建一个慢指针，一次走一步，再创建一个快指针，一次走两步。
// 当快慢指针相遇，代表形参环路，该数不是快乐数。
// 若指针移动过程中，找到了 1，则当前数是一个快乐数。
function isHappy(n) {
    let slow = n;
    let fast = getNext(n);
    // 找到1 或 两指针相遇时结束循环
    while(!(slow === 1 || slow === fast)) {
        slow = getNext(slow);
        fast = getNext(getNext(fast));
    }
    return slow === 1; // 
    // 计算：19 = 1^2 + 9^2
    function getNext(n) {
        return `${n}`.split('').map(v => v*v).reduce((pre,cur) => pre+cur, 0);
    }
}
console.log('=======isHappy', isHappy(19),isHappy(2)); // true false


// 移动零：给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。请注意 ，必须在不复制数组的情况下原地对数组进行操作。
// https://leetcode-cn.com/problems/move-zeroes/
var moveZeroes = function (nums) {
    let i = 0, j = 0;
    while (i < nums.length) {
        if (nums[i] !== 0) {
            [nums[i], nums[j]] = [nums[j], nums[i]];
            i++;
            j++;
        } else {
            i++;
        }
    }
    return nums;
};
console.log('=========moveZeroes', moveZeroes([0,1,0,3,12])); // [ 1, 3, 12, 0, 0 ]

```



## 数据类型

### 二叉树
> 二叉树（Binary tree）是树形结构的一个重要类型。许多实际问题抽象出来的数据结构往往是二叉树形式，即使是一般的树也能简单地转换为二叉树，而且二叉树的存储结构及其算法都较为简单，因此二叉树显得特别重要。二叉树特点是每个结点最多只能有两棵子树，且有左右之分。

二叉树是n个有限元素的集合，该集合或者为空、或者由一个称为根（root）的元素及两个不相交的、被分别称为左子树和右子树的二叉树组成，是有序树。当集合为空时，称该二叉树为空二叉树。在二叉树中，一个元素也称作一个结点。

``` js

// 二叉树


class TreeNode {

}


// 二叉树的中序遍历：给定一个二叉树的根节点 root ，返回它的 中序 遍历。
// https://leetcode-cn.com/problems/binary-tree-inorder-traversal/
// 二叉树的中序遍历：按照访问左子树——根节点——右子树的方式遍历这棵树，而在访问左子树或者右子树的时候我们按照同样的方式遍历，直到遍历完整棵树。因此整个遍历过程天然具有递归的性质，我们可以直接用递归函数来模拟这一过程。
// a. 递归
// 时间复杂度：O(n)，其中 n 为二叉树节点的个数。二叉树的遍历中每个节点会被访问一次且只会被访问一次。
// 空间复杂度：O(n)。空间复杂度取决于递归的栈深度，而栈深度在二叉树为一条链的情况下会达到 O(n) 的级别。
function inorderTraversal(root) {
    const res = [];
    const traverse = (root) => {
        if (root == null) return; // 递归结束
        traverse(root.left); // 遍历左节点
        res.push(root.val); // 推入
        traverse(root.right); // 遍历右节点
    }
    traverse(root); // 递归入口
    return res;
}

// b. 迭代
// 时间复杂度：O(n)，其中 n 为二叉树节点的个数。二叉树的遍历中每个节点会被访问一次且只会被访问一次。
// 空间复杂度：O(n)。空间复杂度取决于栈深度，而栈深度在二叉树为一条链的情况下会达到 O(n) 的级别。
// function inorderTraversal(root) {
//     const res = [];
//     const stk = []; // 栈
//     while (root || stk.length) {
//         while (root) { // 遍历节点
//             stk.push(root); // 将root推入栈
//             root = root.left; // root指向left
//         }
//         // 节点遍历结束后
//         root = stk.pop(); // 推出
//         res.push(root.val); // 添加到res
//         root = root.right; // 指向right
//     }
//     return res;
// }
console.log('========traverse', traverse([1,null,2,3])) // [1,3,2]


// 验证二叉搜索树：给你一个二叉树的根节点 root ，判断其是否是一个有效的二叉搜索树。
// https://leetcode-cn.com/problems/validate-binary-search-tree/
// 有效 二叉搜索树定义如下：
// 节点的左子树只包含 小于 当前节点的数。
// 节点的右子树只包含 大于 当前节点的数。
// 所有左子树和右子树自身必须也是二叉搜索树。
function isValidBST(root) {
    return helper(root, -Infinity, Infinity);
    function helper(root, lower, upper) {
        if (root === null) return true;
        if (root.val <= lower || root.val >= upper) return false;
        return helper(root.left, lower, root.val) && helper(root.right, root.val, upper);
    }
}
console.log('=====isValidBST', isValidBST([2,1,3])); // true



// 对称二叉树：给你一个二叉树的根节点 root ， 检查它是否轴对称。
// https://leetcode-cn.com/problems/symmetric-tree/
function isSymmetric(root) {
    if (root === null) return true;
    return check(root.left, root.right); // 判断它的左右子树是否满足对称
    function check(left, right) {
        if (left === null && right === null) return true;
        if (left && right) { // 两个子树都存在，则需要：root值相同，且他们的子树也满足镜像
            return left.val === right.val && check(left.left, right.right) && check(left.right, right.left);
        }
        return false; // 一个子树存在一个不存在，肯定不对称
    }
}
console.log('=======isSymmetric', isSymmetric([1,2,2,3,4,4,3])) // true



// 二叉树的层序遍历：给你二叉树的根节点 root ，返回其节点值的 层序遍历 。 （即逐层地，从左到右访问所有节点）。
// https://leetcode-cn.com/problems/binary-tree-level-order-traversal/
// DFS(广度优先搜索)
// 时间复杂度：每个点进队出队各一次，故渐进时间复杂度为 O(n)。
// 空间复杂度：队列中元素的个数不超过 n 个，故渐进空间复杂度为 O(n)。
function levelOrder(root) {
    if (root === null) return [];
    let res = [];
    const q = []; //声明一个队列
    q.push(root);
    while(q.length) { // 循环队列
        let list = [];
        for(let i = 1; i <= q.length; i++) { // 遍历数组q
            const node = q.shift(); // 取出开头元素
            list.push(node.val); // 往 res 的最后一个数组添加值
            // 同时把当前节点左右子树加入q数组
            if (node.left) q.push(node.left);
            if (node.right) q.push(node.right);
        }
        res.push(list); // 追加到 res
    }
    return res;
}
console.log('=========levelOrder', levelOrder([3,9,20,null,null,15,7])); // [[3],[9,20],[15,7]]



// 二叉树的锯齿形层序遍历: 给你二叉树的根节点 root ，返回其节点值的 锯齿形层序遍历 。（即先从左往右，再从右往左进行下一层遍历，以此类推，层与层之间交替进行）。
// https://leetcode-cn.com/problems/binary-tree-zigzag-level-order-traversal/
// 广度优先遍历
// 规定二叉树的根节点为第 0 层，如果当前层数是偶数，从左至右输出当前层的节点值，否则，从右至左输出当前层的节点值。
// 双端队列是一个可以在队列任意一端插入元素的队列。在广度优先搜索遍历当前层节点拓展下一层节点的时候我们仍然从左往右按顺序拓展，但是对当前层节点的存储我们维护一个变量 isOrderLeft 记录是从左至右还是从右至左的
function zigzagLevelOrder(root) {
    if (root === null) return [];
    const res = [];
    const q = [];
    q.push(root);
    let isOrderLeft = true; // 顺序
    while(q.length) { // 循环队列
        let list = [];
        for(let i = 1; i <= q.length; i ++) {
            const node = q.shift(); // 取出第一个
            isOrderLeft ? list.push(node.val) : list.unshift(node.val); // 从左至右：添加到尾部；否则添加到头部
            // 同时把当前节点左右子树加入q数组
            if (node.left) q.push(node.left);
            if (node.right) q.push(node.right);
        }
        res.push(list);
        isOrderLeft = !isOrderLeft; // 换序
    }
    return res;
}
console.log('========zigzagLevelOrder', zigzagLevelOrder([3,9,20,null,null,15,7])); // [3],[20,9],[15,7]]



// 二叉树的最大深度： 给定一个二叉树，找出其最大深度。二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。
// https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/
// 时间：O(n)
function maxDepth(root) {
    if (root === null) return 0;
    let left = maxDepth(root.left);
    let right = maxDepth(root.right);
    return Math.max(left, right) + 1;
}
console.log('=========maxDepth', maxDepth([3,9,20,null,null,15,7])); // 3



// 从前序与中序遍历序列构造二叉树: 给定两个整数数组 preorder 和 inorder ，其中 preorder 是二叉树的先序遍历， inorder 是同一棵树的中序遍历，请构造二叉树并返回其根节点。
// https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/
// preorder 数组的第一项肯定是根节点 —— 因为前序遍历的顺序是: 根∣左∣右
// 中序遍历：inorder [左∣根∣右]
// 解题关键在于定位出根节点，划分出左右子树，然后 递归 构建左右子树
function buildTree() {
    const map = new Map();
    for (let i = 0; i < inorder.length; i++) {
        map.set(inorder[i], i); // 用哈希表存中序遍历的值
    }
        // 获取 根 | 左 | 右 节点树   
    const helper = (p_start, p_end, i_start, i_end) => {
        if (p_start > p_end) return null; // 没有子树
        let rootVal = preorder[p_start];    // 根节点的值
        let root = new TreeNode(rootVal);   // 根节点
        let mid = map.get(rootVal);         // 根节点在inorder的位置
        let leftNum = mid - i_start;        // 左子树的节点数
        // 递归获取左右子树
        root.left = helper(p_start + 1, p_start + leftNum, i_start, mid - 1);
        root.right = helper(p_start + leftNum + 1, p_end, mid + 1, i_end);
        return root;
    };
  return helper(0, preorder.length - 1, 0, inorder.length - 1); // 入口
};
console.log('======buildTree', buildTree([3,9,20,15,7], [9,3,15,20,7])); // [3,9,20,null,null,15,7]



// 将有序数组转换为二叉搜索树: 给你一个整数数组 nums ，其中元素已经按 升序 排列，请你将其转换为一棵 高度平衡 二叉搜索树。
// 高度平衡: 二叉树是一棵满足「每个节点的左右两个子树的高度差的绝对值不超过 1 」的二叉树。
// https://leetcode-cn.com/problems/convert-sorted-array-to-binary-search-tree/
// 构建一棵树包括：构建 root、构建 root.left 和 root.right
// 构建 root 时，选数组的中间元素作为 root 节点值，即可保证平衡
//  二分递归
// 将数组从最中间项分割得到三个部分：子数组1，中间项，子数组2。将中间项作为当前节点的val，对子数组1和子数组2分别递归执行原方法，得到的两个子树分别作为上一个节点的左子树与右子树
function sortedArrayToBST(nums) {
    if (!nums.length) return null;
    const root = new TreeNode(null);
    if(nums.length > 1) root.left = sortedArrayToBST(nums.splice(0, nums.length / 2)); // 切割数组，获取左侧子树
    root.val = nums[0]; // 切割后 num[0]就是中间项
    root.right = sortedArrayToBST(nums.splice(1)); // 切割剩余数组，获取右侧子树
    return root;
}



// 填充每个节点的下一个右侧节点指针：给定一个 完美二叉树 ，其所有叶子节点都在同一层，每个父节点都有两个子节点。填充它的每个 next 指针，让这个指针指向其下一个右侧节点。如果找不到下一个右侧节点，则将 next 指针设置为 NULL。初始状态下，所有 next 指针都被设置为 NULL。
// https://leetcode-cn.com/problems/populating-next-right-pointers-in-each-node/
// 时间复杂度：O(N)，每个节点只访问一次。
// 空间复杂度：O(1)，不需要存储额外的节点。
function connect(root) {
    if (root === null) return root;
    let leftMost = root;
    while(leftMost.left !== null) { // 从上往下，一层层遍历
        let head = leftMost;
        while(head !== null) { // 遍历这一层节点组织成的链表，为下一层的节点更新 next 指针
            // 1. 第一种情况两个子节点属于同一个父节点，因此直接通过父节点建立两个子节点的 next 指针即可。
            head.left.next = head.right;
            // 2. 第二种情况是连接不同父节点之间子节点的情况。更具体地说，连接的是第一个父节点的右孩子和第二父节点的左孩子。由于已经在父节点这一层建立了 next 指针，因此可以直接通过第一个父节点的 next 指针找到第二个父节点，然后在它们的孩子之间建立连接。
            if (head.next !== null) head.right.next = head.next.left;

            head = head.next; // 指针向后移动
        }
        leftMost = leftMost.next; // 去下一层的最左的节点
    }
    return root;
}
console.log('========connect', connect([1,2,3,4,5,6,7])); // [1,#,2,3,#,4,5,6,7,#]
```

### 链表
> 链表是一种物理存储单元上非连续、非顺序的存储结构，数据元素的逻辑顺序是通过链表中的指针链接次序实现的。

使用链表结构可以克服数组链表需要预先知道数据大小的缺点，链表结构可以充分利用计算机内存空间，实现灵活的内存动态管理。但是链表失去了数组随机读取的优点，同时链表由于增加了结点的指针域，空间开销比较大。

``` js

// 链表


class ListNode {
    constructor(val) {
        this.val = val;  // 节点的数据域
        this.prev = null;  // 节点的指针域
        this.next = null;  // 节点的指针域
    }
}

// 1.两数相加：给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。请你将两个数相加，并以相同形式返回一个表示和的链表。
// https://leetcode-cn.com/problems/add-two-numbers/
function addTwoNumbers(l1, l2) {
    let addOne = 0; // 进位
    let sum = new ListNode('0');
    let res = sum;
    // 只有有进位，或链表还有值就继续循环
    while(addOne || l1 || l2) {
        // 兼容某一链表没有值的情况
        let val1 = l1 !== null ? l1.val : 0;
        let val2 = l2 !== null ? l2.val : 0;
        let add = val1 + val2 + addOne; // 相加
        sum.next = new ListNode(add % 10); // 算余，并往链表 sum 中添加值
        sum = sum.next; // 将sum 指向最后一个
        addOne = add >= 10 ? 1 : 0; // 更新进位

        // 计算完成，链表指向下一个
        if (l1) l1 = l1.next;
        if (l2) l2 = l2.next;
    }

    return res.next; // 指向res的next，把初始化赋的0去掉
}

// console.log('=====addTwoNumbers', addTwoNumbers([2,4,3],[5,6,4]))



//  删除链表的倒数第 N 个结点：给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。
// https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/
// 快慢指针: 需要删除链表中的倒数第 n 个节点，我们需要知道的就是倒数第 n+1 个节点，然后删除倒数第 n+1 节点的后继节点即可
function removeNthFromEnd(head, n) {
    let preHead = new ListNode(0);
    preHead.next = head;

    let fast = head, slow = head;
    // 快指针先快走n+1步
    while(n--) {
        fast = fast.next;
    }

    // fast 、 slow 同步向前走，直到 fast.next 为 null
    while(fast && fast.next) {
        fast = fast.next;
        slow = slow.next;
    }
    // 此时，fast 为最后一个节点，slow 就是倒数第 n+1 个节点，此时问题就变更为删除链表中的 slow 的后继节点
    slow.next = slow.next.next;
    return preHead.next;
}



// 合并两个有序链表：将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。 
// https://leetcode-cn.com/problems/merge-two-sorted-lists/
// 时间复杂度：O(m+n)，m 为 l1的长度，n 为 l2 的长度
function mergeTwoLists(l1, l2) {
     // 终止条件：两条链表分别名为 l1 和 l2，当 l1 为空或 l2 为空时结束
    if (l1 === null) return l2;
    if (l2 === null) return l1;

    // 如果 l1 的 val 值更小，则将 l1.next 与排序好的链表头相接，l2 同理
    // 返回值：每一层调用都返回排序好的链表头
    if (l1.val < l2.val) {
        l1.next = mergeTwoLists(l1.next, l2);
        return l1;
    } else {
        l2.next = mergeTwoLists(l1, l2.next);
        return l2;
    }
}


// 合并K个升序链表：给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。
// https://leetcode-cn.com/problems/merge-k-sorted-lists/
function mergeKLists(lists) {
    return lists.reduce((pre, cur) => { // reduce，将链表数组中的每一个值放入新数组, reduce(total, cur)...
        while(cur) {
            pre.push(cur);
            cur = cur.next;
        }
        return pre;
    }, []).sort((a, b) => a.val - b.val) // sort，以链表的val作参考冒泡排序
    .reduceRight((pre, cur) => { // reduceRight，从右向左遍历，将数组连成链表
        cur.next = pre;
        pre = cur;
        return pre;
    }, null)
}



// 复制带随机指针的链表： 构造这个链表的 深拷贝。 深拷贝应该正好由 n 个 全新 节点组成，其中每个新节点的值都设为其对应的原节点的值。新节点的 next 指针和 random 指针也都应指向复制链表中的新节点，并使原链表和复制链表中的这些指针能够表示相同的链表状态。复制链表中的指针都不应指向原链表中的节点 。
// https://leetcode-cn.com/problems/copy-list-with-random-pointer/
// 递归
function copyRandomList(head, cacheNode = new Map()) {
    if (head === null) return null;
    if (!cacheNode.has(head)) {
        cacheNode.set(head, {val: head.val});
        Object.assign(cacheNode.get(head), {
            next: copyRandomList(head.next, cacheNode),
            random: copyRandomList(head.random, cacheNode)
        })
    }
    return cacheNode.get(head);
}
// console.log('=======copyRandomList', copyRandomList([[7,null],[13,0],[11,4],[10,2],[1,0]]));



// 环形链表：给你一个链表的头节点 head ，判断链表中是否有环。
// https://leetcode-cn.com/problems/linked-list-cycle/
// a. 哈希
// 时间复杂度为 O(n)，空间复杂度为 O(n)
function hasCycle(head) {
    let map = new Map();
    while(head) {
        if (map.get(head)) return true;
        map.set(head, true);
        head = head.next;
    }
    return false;
}
// b. 快慢指针法: 两个人在环形跑道上赛跑，同一个起点出发，一个跑得快一个跑得慢，在某一时刻，跑得快的必定会追上跑得慢的，只要是跑道是环形的，不是环形就肯定追不上。
function hasCycle(head) {
    let slow = head;
    let fast = head;
    while(fast) {
        if (fast.next === null) return false; // 无环
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}


// 相交链表：给你两个单链表的头节点 headA 和 headB ，请你找出并返回两个单链表相交的起始节点。如果两个链表不存在相交节点，返回 null 。
// https://leetcode-cn.com/problems/intersection-of-two-linked-lists/
// 双指针法: 时间O(m+n), 空间O(1)
// headA: a+n; headB: b+n; 当它们相遇时：a+n+b = b+n+a
function getIntersectionNode(headA, headB) {
    if (headA === null || headB === null) return null;
    let pA = headA, pB = headB;
    while(pA !== pB) {
        pA = pA === null ? headB : pA.next; // 如果headA循环完就循环headB
        pB = pB === null ? headA : pB.next;
    }
    return pA;
}




// 反转链表：给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。
// https://leetcode-cn.com/problems/reverse-linked-list/

// a. 迭代
// 1 > 2 > 3 > null => null > 3 > 2 > 1
// 时间复杂度：O(n)，其中 n 是链表的长度。需要遍历链表一次。
// 空间复杂度：O(1)。
function reverseList(head) {
    let prev =null;
    let cur = head;
    // 遍历链表
    while (curr) {
        const next = curr.next;
        curr.next = prev; // 将当前节点的 next 指针改为指向前一个节点。
        prev = curr; // 由于节点没有引用其前一个节点，因此必须事先存储其前一个节点
        curr = next; // 在更改引用之前，还需要存储后一个节点。
    }
    return prev; // 最后返回新的头引用。
}

// d.递归
// O(n)
function reverseList(head) {
    if (head == null || head.next == null) return head;
    const newHead = reverseList(head.next);
    head.next.next = head; // head 的下一个节点指向 head
    head.next = null; // head的下一个节点必须指向 null, 不然链表中可能产生环
    return newHead;
}

```


### 栈
> 栈（stack）又名堆栈，它是一种运算受限的线性表。限定仅在表尾进行插入和删除操作的线性表。这一端被称为栈顶，相对地，把另一端称为栈底。向一个栈插入新元素又称作进栈、入栈或压栈，它是把新元素放到栈顶元素的上面，使之成为新的栈顶元素；从一个栈删除元素又称作出栈或退栈，它是把栈顶元素删除掉，使其相邻的元素成为新的栈顶元素。

``` js

// 栈


// 有效的括号：给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。
// https://leetcode-cn.com/problems/valid-parentheses/
// 时间复杂度：O(n), n 是字符串s的长度
function isValid(s) { // "()[]{}" => true
    if (s.length % 2) return false;

    const pairs = new Map([
        [')', '('],
        ['}', '{'],
        [']', '[']
    ])
    let stack = [];

    for(let ch of s) { // 遍历
        if (pairs.has(ch)) { // 例：ch= ')' 时, pairs.get(')') = '(', 即当是右括号时
             // stk为空，或stk中最后一个元素不是跟右括号对应的左括号
            if (!stack.length || stack[stack.length - 1] !== pairs.get(ch)) {
                return false;
            }
            stack.pop() // 否则移除最后一个元素，即与 ch 匹配上的左括号
        } else {
            stack.push(ch); // 向 str 中添加 ch
        }
    }

    return !stack.length; // 最后 str 为 [] 则返回 true
}
console.log('========isValid',isValid('()[]{}'))



// 根据 逆波兰表示法，求表达式的值。
// https://leetcode-cn.com/problems/evaluate-reverse-polish-notation/
/**
 * 逆波兰表达式由波兰的逻辑学家卢卡西维兹提出。逆波兰表达式的特点是：没有括号，运算符总是放在和它相关的操作数之后。因此，逆波兰表达式也称后缀表达式。
 * 如果遇到操作数，则将操作数入栈；
   如果遇到运算符，则将两个操作数出栈，其中先出栈的是右操作数，后出栈的是左操作数，使用运算符对两个操作数进行运算，将运算得到的新操作数入栈。
   整个逆波兰表达式遍历完毕之后，栈内只有一个元素，该元素即为逆波兰表达式的值。
 */
function evalRPN(tokens) {
    const stack = []; // 栈
    for(let i = 0; i < tokens.length; i ++) {
        let cur = tokens[i];
        if (isNumber(cur)) { // 数字
            stack.push(parseInt(cur)); // 取整推入stack
        } else { // 操作符
            let num2 = stack.pop(); // 右操作数
            let num1 = stack.pop(); // 左操作数
            if (cur === '+') {
                stack.push(num1 + num2);
            } else if (cur === '-') {
                stack.push(num1 - num2);
            } else if (cur === '*') {
                stack.push(num1 * num2);
            } else if (cur === '/') {
                stack.push((num2 / num1) >> 0); // >>右移运算符取整
            }
        }
    }
    return stack.pop();

    function isNumber(s) {
        return !(s === '+' || s === '-' || s === '*' || s === '/');
    }
}
console.log('=======evalRPN', evalRPN(["2","1","+","3","*"])); // (2 + 1) * 3 = 9



// 最小栈：设计一个支持 push ，pop ，top 操作，并能在常数时间内检索到最小元素的栈。
/**
 *  push(x) —— 将元素 x 推入栈中。
    pop() —— 删除栈顶的元素。
    top() —— 获取栈顶元素。
    getMin() —— 检索栈中的最小元素。
 */
// https://leetcode-cn.com/problems/min-stack/
// 在每个元素 a 入栈时把当前栈的最小值 m 存储起来。在这之后无论何时，如果栈顶元素是 a，我们就可以直接返回存储的最小值 m。
// 设计一个数据结构，使得每个元素 a 与其相应的最小值 m 时刻保持一一对应。因此我们可以使用一个辅助栈，与元素栈同步插入与删除，用于存储与每个元素对应的最小值。
function MinStack() {
    this.stack = [];
    this.min_stack = [Infinity]; // 保存最小值
}
MinStack.prototype.push = function(val) {
    this.stack.push(val);
    this.min_stack.push(Math.min(this.min_stack[this.min_stack.length-1], val)); // 保存最小值
};
MinStack.prototype.pop = function() {
    this.stack.pop();
    this.min_stack.pop();
};
MinStack.prototype.top = function() {
    return this.stack[this.stack.length-1];
};
MinStack.prototype.getMin = function() {
    return this.min_stack[this.min_stack.length-1]; // 获取最小值
};

```


### 矩阵
> 矩阵在js中的表现通常为`m * n`的二维数组~

``` js


// 矩阵


// 有效的数独
    // 数字 1-9 在每一行只能出现一次。
    // 数字 1-9 在每一列只能出现一次。
    // 数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。
// https://leetcode-cn.com/problems/valid-sudoku/
// 时间复杂度：O(1)。数独共有 81 个单元格，只需要对每个单元格遍历一次即可。
// 空间复杂度：O(1)。由于数独的大小固定，因此哈希表的空间也是固定的。
function isValidSudoku(board) {
    // 记录每一行、每一列和每一个小九宫格中，每个数字出现的次数。只需要遍历数独一次，在遍历的过程中更新哈希表中的计数，并判断是否满足有效的数独的条件即可。
    const rows = new Array(9).fill(0).map(() => new Array(9).fill(0)); // 行
    const columns = new Array(9).fill(0).map(() => new Array(9).fill(0)); // 列
    const subs  = new Array(3).fill(0).map(() => new Array(3).fill(0).map(() => new Array(9).fill(0))); // 子单元格

    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j ++) {
            const cur = board[i][j];
            if (c !== '.') {
                // '5'.charCodeAt() = 53, '0'.charCodeAt() = 48;
                let index = c.charCodeAt() - '0'.charCodeAt() - 1;
                // 更新行、列、子单元格中的哈希表到的计数
                rows[i][index] ++;
                columns[j][index] ++;
                subs[Math.floor(i / 3)][Math.floor(j / 3)][index] ++;

                // 存在重复
                if (rows[i][index] > 1 || columns[j][index] > 1 || subs[Math.floor(i / 3)][Math.floor(j / 3)][index] > 1) {
                    return false;
                }
            }
        }
    }

    return true;
    
}



// 旋转图像：给定一个 n × n 的二维矩阵 matrix 表示一个图像。请你将图像顺时针旋转 90 度。你必须在 原地 旋转图像，这意味着你需要直接修改输入的二维矩阵。请不要 使用另一个矩阵来旋转图像。
// https://leetcode-cn.com/problems/rotate-image/
// 用翻转代替旋转
// 分两步：先水平翻转，再对角线翻转
// 时间：O(n2), 空间：O(1)
function rotate(matrix) {
    const len = matrix.length;
    // 水平翻转
    for(let i = 0; i < Math.floor(len/2); i ++) {
        for(let j = 0; j < len; j ++) {
            [matrix[i][j], matrix[len-i-1][j]] = [matrix[len-i-1][j], matrix[i][j]] // 替换
        }
    }
    // 主对角线翻转
    for(let i = 0; i < len; i ++) {
        for(let j = 0; j < i; j ++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]] // 替换
        }
    }
    return matrix;
}
console.log('=======rotate', rotate([[1,2,3],[4,5,6],[7,8,9]])) // [[7,4,1],[8,5,2],[9,6,3]]



// 螺旋矩阵：给你一个 m 行 n 列的矩阵 matrix ，请按照 顺时针螺旋顺序 ，返回矩阵中的所有元素。
// https://leetcode-cn.com/problems/spiral-matrix/
// 时间复杂度：O(mn)，其中 m 和 n 分别是输入矩阵的行数和列数。矩阵中的每个元素都要被访问一次。
// 空间复杂度：O(mn)。需要创建一个大小为 m×n 的矩阵 visited 记录每个位置是否被访问过。
function spiralOrder(matrix) {
    if (!matrix.length || !matrix[0].length) {
        return [];
    }
    const rows = matrix.length; // 行
    const columns = matrix[0].length; // 列
    // 判断路径是否进入之前访问过的位置需要使用一个与输入矩阵大小相同的辅助矩阵 visited，其中的每个元素表示该位置是否被访问过。
    // 当一个元素被访问时，将 visited 中的对应位置的元素设为已访问
    const visited = new Array(rows).fill(0).map(() => new Array(columns).fill(false));
    const total = rows * columns; // 总数：
    const order = new Array(total).fill(0); // 返回值：当路径的长度达到矩阵中的元素数量时即为完整路径，将该路径返回。

    let directionIndex = 0, row = 0, column = 0;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // 方向：向右，向下，向左，向上
    for (let i = 0; i < total; i++) { // 遍历
        order[i] = matrix[row][column];
        visited[row][column] = true; // 标记：已访问
        const nextRow = row + directions[directionIndex][0]; // 下一行的位置
        const nextColumn = column + directions[directionIndex][1]; // 下一列的位置
        // 当路径超出界限或者进入之前访问过的位置时，顺时针旋转，进入下一个方向。
        if (!(0 <= nextRow && nextRow < rows && 0 <= nextColumn && nextColumn < columns && !(visited[nextRow][nextColumn]))) {
            directionIndex = (directionIndex + 1) % 4;
        }
        row += directions[directionIndex][0]; // 行数变化
        column += directions[directionIndex][1]; // 列数变化
    }
    return order;
};
console.log('========spiralOrder', spiralOrder([[1,2,3],[4,5,6],[7,8,9]]));




// 矩阵置零: 给定一个 m x n 的矩阵，如果一个元素为 0 ，则将其所在行和列的所有元素都设为 0 。
// https://leetcode-cn.com/problems/set-matrix-zeroes/
// 在实际代码中，我们首先预处理出两个标记变量，接着使用其他行与列去处理第一行与第一列，然后反过来使用第一行与第一列去更新其他行与列，最后使用两个标记变量更新第一行与第一列即可。
// 时间复杂度：O(mn)，其中 m 是矩阵的行数，n 是矩阵的列数。我们至多只需要遍历该矩阵两次。
// 空间复杂度：O(1)。我们只需要常数空间存储若干变量。
function setZeroes(matrix) {
    const m = matrix.length; // 行
    const n = matrix[0].length; // 列
    let flagCol0 = false, flagRow0 = false;
    
    // 标记
    for (let i = 0; i < m; i++) {
        if (matrix[i][0] === 0) {
            flagCol0 = true;
        }
    }
    for (let j = 0; j < n; j++) {
        if (matrix[0][j] === 0) {
            flagRow0 = true;
        }
    }
    // 遍历其他行列
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (matrix[i][j] === 0) {
                matrix[i][0] = matrix[0][j] = 0;
            }
        }
    }
    // 使用第一行与第一列去更新其他行与列
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (matrix[i][0] === 0 || matrix[0][j] === 0) {
                matrix[i][j] = 0;
            }
        }
    }
    // 使用两个标记变量更新第一行与第一列
    if (flagCol0) {
        for (let i = 0; i < m; i++) {
            matrix[i][0] = 0;
        }
    }
    if (flagRow0) {
        for (let j = 0; j < n; j++) {
            matrix[0][j] = 0;
        }
    }

    return matrix;
}
console.log('=======setZeroes', setZeroes([[1,1,1],[1,0,1],[1,1,1]]))



// 被围绕的区域: 给你一个 m x n 的矩阵 board ，由若干字符 'X' 和 'O' ，找到所有被 'X' 围绕的区域，并将这些区域里所有的 'O' 用 'X' 填充。
// https://leetcode-cn.com/problems/surrounded-regions/
// 凡是与边界有联系的 O，标记为 NO，表示非岛屿。这个找的过程可以用 DFS 或 BFS。
// 所以非岛屿被标记为 NO，最后将它们恢复为 O，其余的 O，变成X。


```


### n进制转换
> 这里主要整理一些二进制转十进制等涉及进制转换的算法题~

``` js
// Excel 表列序号: 给你一个字符串 columnTitle ，表示 Excel 表格中的列名称。返回 该列名称对应的列序号 。
/**
 *  需要将 26 进制转换成十进制
 *  从末尾开始取得每一个字符对应的数cur = c.charCodeAt() - 64
    数字总和sum += 当前数 * 进制位数
    进制位数 *= 26，初始化进制位数carry = 1
 */
function titleToNumber(s) {
    let sum = 0, carry = 1;
    let i = s.length - 1;
    while(i >= 0) {
        let cur = s[i].charCodeAt() - 64; // 'A'.charCodeAt() = 65;
        sum += cur * carry;
        carry *= 26;
        i --;
    }
    return sum;
}
console.log('=======titleToNumber', titleToNumber('AB')); // 28



// 颠倒二进制位：颠倒给定的 32 位无符号整数的二进制位。
// https://leetcode-cn.com/problems/reverse-bits/
function reverseBits(n) {
    let res = 0;
    for (let i = 0; i < 32; i++) {
        // n & 1 === 1, 说明 n 的最后一位是 1
        // n & 1 === 0, 说明 n 的最后一位是 0
        res = (res << 1) + (n & 1); // res左移一位 + n的最后一位
        n >>= 1; // 右移一位
    }
    return res >>> 0; // 对于 JS，ES 规范在之前很多版本都是没有无符号整形的， 转化为无符号，可以用一个 n >>> 0
}
// function reverseBits(n) {
//     return +('0b'+n.toString(2).padStart(32,0).split('').reverse().join(''))
// }
console.log('=========reverseBits', reverseBits(00000010100101000001111010011100));
// 964176192 (00111001011110000010100101000000)



// 位1的个数：编写一个函数，输入是一个无符号整数（以二进制串的形式），返回其二进制表达式中数字位数为 '1' 的个数（也被称为汉明重量）。
// https://leetcode-cn.com/problems/number-of-1-bits/
// 具体代码中，当检查第 i 位时，我们可以让 n 与 2^i 进行与运算，当且仅当 n 的第 i 位为 1 时，运算结果不为 0。
function hammingWeight(n) {
    let res = 0;
    for(let i = 0; i < 32; i++) {
        if ( n & (1 << i) !== 0) {
            res ++;
        }
    }
    return res;
}



// 字符串转换整数 (atoi): 请你来实现一个 myAtoi(string s) 函数，使其能将字符串转换成一个 32 位有符号整数
// https://leetcode-cn.com/problems/string-to-integer-atoi/
function myAtoi(str) {
    let num = parseInt(str, 10);
    if (isNaN(num)) {
        return 0;
    } else if (num < Math.pow(-2, 31) || num > Math.pow(2, 31) - 1) {
        return num < Math.pow(-2, 31) ? Math.pow(-2, 31) :  Math.pow(2, 31) - 1;
    } else {
        return num;
    }
}

console.log('=====myAtoi', myAtoi('123'), myAtoi('  a123'), myAtoi(4343)) // 123 0 4343


```

### 其他

``` js


// 寻找两个正序数组的中位数： 给定两个大小分别为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。请你找出并返回这两个正序数组的 中位数 。
// 算法的时间复杂度应该为 O(log (m+n)) 。
// 链接：https://leetcode-cn.com/problems/median-of-two-sorted-arrays

// 方法a: 暴力 
// O((m + n)log(m + n))
function findMedianSortedArrays(nums1, nums2) {
    const arr = [...nums1, ...nums2].sort((a, b) => a - b);
    const len = arr.length;
    return len % 2 ? arr[(len-1)/2] : (arr[len/2] +arr[len/2 - 1]) / 2;

}
// 二分法

console.log('=====findMedianSortedArrays', findMedianSortedArrays([1,2,4], [3,0,5]))


// 最长回文子串：给你一个字符串 s，找到 s 中最长的回文子串。
// 两种情况：aba、abba
// https://leetcode-cn.com/problems/longest-palindromic-substring/
function longestPalindrom(s) {
    if (s.length < 2) return s;

    let left = 0, right=0;
    for(let i = 0; i < s.length; i++) {
        helper(i, i); // 回文子串长度为奇数，如：aba
        helper(i, i+1); // 回文子串长度为偶数，如：abba;
    }

    // 中心扩展法，判断是否是回文
    function helper(m,n) {
        // 满足回文时，往左右
        while(m >=0 && n < s.length && s[m] === s[n]) {
            m --;
            n ++;
        }
        // 循环结束，更新最大值
        if (n - m > right - left) {
            right = n;
            left = m;
        }
    }

    return s.slice(left+1, right); // string.slice(start, end): 包含start, 不包含end
}

console.log('======longestPalindrom', longestPalindrom('babad'));



// 整数反转：给你一个 32 位的有符号整数 x ，返回将 x 中的数字部分反转后的结果。如果反转后整数超过 32 位的有符号整数的范围 [−231,  231 − 1] ，就返回 0。
// https://leetcode-cn.com/problems/reverse-integer/
function reverse(num) { // 123 => 321
    let res = 0;
    while(num!==0) {
        let deg = num % 10; // 3
        res = res * 10 + deg;
        num = (num / 10) >> 0; // 取整
        // 按位取反，~~取整：12, 1, 0; 或者使用右移位运算符 >>
        // 不能用Math.floor,因为 Math.floor(-12.3) = -13;

        if (res < Math.pow(-2, 31) || res > Math.pow(2, 31) - 1) {
            return 0;
        }
    }

    return res;
}

console.log('=====reverse', reverse(123))



// 实现 strStr() 函数: 给你两个字符串 haystack 和 needle ，请你在 haystack 字符串中找出 needle 字符串出现的第一个位置（下标从 0 开始）。如果不存在，则返回  -1 。
// https://leetcode-cn.com/problems/implement-strstr/
// a. indexOf
// function strStr(haystack, needle) {
//     return haystack.indexOf(needle);
// }

// 暴力匹配
function strStr(haystack, needle) {
    let n = haystack.length, m = needle.length;
    for (let i = 0; i <= n - m; i ++) {
        let flag = true;
        for(let j = 0; j < m; j ++) {
            if (haystack[i+j] !== needle[j]) {
                flag = false;
                break;
            }
        }
        if (flag) return i;
    }
    return -1;
}
console.log('=========strStr', strStr('hello', 'll'))


// 罗马数字转整数
// https://leetcode-cn.com/problems/roman-to-integer/
function romanToInt(s) { // IV => 4
    const map = {
        I: 1,
        IV: 4,
        V: 5,
        IX: 9,
        X: 10,
        XL: 40,
        L: 50,
        XC: 90,
        C: 100,
        CD: 400,
        D: 500,
        CM: 900,
        M: 1000,
    }
    let res = 0;
    for(let i = 0; i < s.length;) {
        if (i + 1 < s.length && map[s.substring(i, i+2)]) { // 先匹配特殊的字符
            res += map[s.substring(i, i+2)];
            i += 2;
        } else {
            res += map[s.substring(i, i+1)];
            i ++;
        }
    }
    return res;
}
console.log('=====romanToInt', romanToInt('IV'), romanToInt('MCMXCIV'))




// 最长公共前缀：编写一个函数来查找字符串数组中的最长公共前缀。如果不存在公共前缀，返回空字符串 ""。
// https://leetcode-cn.com/problems/longest-common-prefix/
//  时间复杂度为O(S), S为所有字符串长度之和
function longestCommonPrefix(strs) {
    if (!strs.length) return '';
    let res = strs[0]; // 初始化, 先取第一个
    for(let i = 1; i < strs.length; i ++) {
        let j = 0;
        for (;j < res.length && j < strs[i].length; j ++) {
            if (res[j] != strs[i][j]) break; // 不匹配，跳出循环
        }
        res = res.substring(0, j); 
        if (res === '') return res; // 匹配到空串, 则结束循环
    }
    return  res;
}
console.log('======longestCommonPrefix', longestCommonPrefix(["flower","flow","flight"])) // fl




// 外观数列: 「外观数列」是一个整数序列，从数字 1 开始，序列中的每一项都是对前一项的描述。
// https://leetcode-cn.com/problems/count-and-say/
function countAndSay(n) {
    let res = '1';
    for(let i = 1; i < n; i ++) {
        // \1*就是表示\1可以出现0次或者更多次, 如"1a11aa221".replace(/(\d)\1*/g,6), 返回的是"6a6aa66"
        res = res.replace(/(\d)\1*/g, item => `${item.length}${item[0]}`)
    }
    return res;
}
console.log('=======countAndSay', countAndSay(5));


//  缺失的第一个正数：给你一个未排序的整数数组 nums ，请你找出其中没有出现的最小的正整数。
// https://leetcode-cn.com/problems/first-missing-positive/
// 时间空间均为O(n)
function firstMissingPositive(nums) {
    const set = new Set();
    for(let i = 0; i < nums.length; i ++) {
        set.add(nums[i]);
    }
    for(i = 1; i <= nums.length + 1; i++) {
        if (!set.has(i)) {
            return i;
        }
    }
}
console.log('=======firstMissingPositive', firstMissingPositive([3,4,-1,1,3,1])) // 2





// 最大子数组和： 给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。
// https://leetcode-cn.com/problems/maximum-subarray/
//  时间复杂度：O(n)，其中 n 为 nums 数组的长度。我们只需要遍历一遍数组即可求得答案。
//  空间复杂度：O(1)。我们只需要常数空间存放若干变量。
function maxSubArray(nums) {
    let res = nums[0];
    let sum = 0; 
    for(let num of nums) {
        if (sum > 0) {
            sum += num; // 如果 sum > 0，则说明 sum 对结果有增益效果，则 sum 保留并加上当前遍历数字
        } else {
            sum = num; // 如果 sum <= 0，则说明 sum 对结果无增益效果，需要舍弃，则 sum 直接更新为当前遍历数字
        }
        res = Math.max(res, sum);
    }
    return res;
}
console.log('======maxSubArray', maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // 6



// 跳跃游戏：给定一个非负整数数组 nums ，你最初位于数组的 第一个下标 。数组中的每个元素代表你在该位置可以跳跃的最大长度。判断你是否能够到达最后一个下标。
// https://leetcode-cn.com/problems/jump-game/
function canJump(nums) {
    if (nums.length === 1) return true;
    let step = 0;
    for(let i = 0; i <= step; i++) { // 循环
        step = Math.max(step, i + nums[i]); // 获取可以跳跃的最大长度
        if (step >= nums.length - 1) return true; // 能到最后下标
    }
    return false;
}
console.log('======canJump', canJump([2,3,1,1,4]));


// 合并区间：以数组 intervals 表示若干个区间的集合，其中单个区间为 intervals[i] = [starti, endi] 。请你合并所有重叠的区间，并返回 一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间 。
// 链接：https://leetcode-cn.com/problems/merge-interval
function merge(intervals) {
    intervals.sort((a, b) => a[0] - b[0]); // 升序排列
    let res = [];
    let prev = intervals[0];

    for(let i = 1; i < intervals.length; i++) {
        let cur = intervals[i];
        if (prev[1] >= cur[0]) { // 有重合
            prev[1] = Math.max(cur[1], prev[1]); // 更新prev右边界
        } else { // 无重合
            res.push(prev); // 将prev推入res
            prev = cur; // 更新prev
        }
    }

    res.push(prev); // 将最后一个prev推入res
    return res;
}
console.log('=======merge', merge([[1,3],[2,6],[8,10],[15,18]])); // [[1,3],[2,6],[8,10],[15,18]] => [[1,6],[8,10],[15,18]]


// 加一：给定一个由 整数 组成的 非空 数组所表示的非负整数，在该数的基础上加一。
// https://leetcode-cn.com/problems/plus-one/
function plusOne(digits) {
    for(let i = digits.length - 1; i >= 0; i--) {
        digits[i] ++; // 加1
        digits[i] %= 10; // 取余
        if (digits[i] != 0) return digits; // 没有进位,直接返回，结束循环
    }
    digits = new Array(digits.length+1).fill(0);
    digits[0] = 1;
    return digits;
}
console.log('=====plusOne', plusOne([1,2,3]),  plusOne([1,9,9]), plusOne([9,9,9])); // [1,2,4]



// 杨辉三角：给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。在「杨辉三角」中，每个数是它左上方和右上方的数的和。
// https://leetcode-cn.com/problems/pascals-triangle/
function generate(numRows) {
    const res = [];
    for (let i = 0; i < numRows; i ++) {
        let row = new Array(i+1).fill(1); // 每一行的数据，初始化为1
        for (let j = 1; j < row.length - 1; j ++) {
            row[j] = res[i-1][j-1] + res[i-1][j];
        }
        res.push(row); // 将每行数据push到res
    }
    return res;
}
console.log('========generate', generate(5)); // [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]



// 加油站：在一条环路上有 N 个加油站，其中第 i 个加油站有汽油 gas[i] 升。你有一辆油箱容量无限的的汽车，从第 i 个加油站开往第 i+1 个加油站需要消耗汽油 cost[i] 升。你从其中的一个加油站出发，开始时油箱为空。如果你可以绕环路行驶一周，则返回出发时加油站的编号，否则返回 -1。
// https://leetcode-cn.com/problems/gas-station/
// 暴力法
function canCompleteCircuit(gas, cost) {
    const len = gas.length;
    gas = gas.concat(gas);
    cost = cost.concat(cost);
    for(let i = 0; i < len; i ++) {
        let isStart = true;
        let left = 0;
        for (let j = i; j < i + len; j ++) { // 从i开始，循环每个站点
            left += (gas[j] - cost[j]); // 累积剩余
            if (left < 0) { // 不够到达下一站
                isStart = false;
                break; // 跳出循环
            }
        }
        if (isStart) return i; // 循环完成，仍为true,说明满足条件
    }
    return -1;
}
console.log('=======canCompleteCircuit', canCompleteCircuit([1,2,3,4,5], [3,4,5,1,2])); // 3


// 只出现一次的数字：给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。
// https://leetcode-cn.com/problems/single-number/
// 异或运算符：a^a^b = b;
// 时间复杂度：O(n)，空间复杂度：O(1)
function singleNumber(nums) {
    let res = 0;
    for(let num of nums) {
        res ^= num;
    }
    return res;
}
function singleNumber(nums) {
    return nums.reduce((pre, cur) => pre^cur, 0);
}
console.log('=========singleNumber', singleNumber([4,1,2,1,2])); // 4



// 多数元素：给定一个大小为 n 的数组，找到其中的多数元素。多数元素是指在数组中出现次数 大于 ⌊ n/2 ⌋ 的元素。
// https://leetcode-cn.com/problems/majority-element/

// a. 排序：因为大于一半, 所以排序后的 中间那个数必是
// 时间复杂度 O(nlogn) 使用了快速排序
function majorityElement(nums) {
    nums.sort((a, b) => a - b);
    return nums[Math.floor(nums.length / 2)]
}

// b. 哈希
// 时间：O(n), 空间：O(n)
function majorityElement(nums) {
    let limit = nums.length >> 1;
    let map = new Map();
    for(let v of nums) {
        if (map.has(v)) {
            map.set(v, map.get(v) + 1);
        } else {
            map.set(v, 1);
        }
        if (map.get(v) > limit) return v;
    }
}

// c. 抵消：相同的加1, 不相同的减1, 因为是大于一半, 所以最后肯定剩下大于一半的那个
// 时间 O(n) 循环一次nums; 空间 O(1) 使用几个基本变量
function majorityElement(nums) {
    let x = 0, n = 0;
    for(let v of nums) {
        if (n === 0) x = v;
        n += (x === v) ? 1 : -1;
    }
    return x;
}
console.log('========majorityElement', majorityElement([2,2,1,1,1,2,2])); // 2




// 最大数：给定一组非负整数 nums，重新排列每个数的顺序（每个数不可拆分）使之组成一个最大的整数。
// https://leetcode-cn.com/problems/largest-number/
// 比较ab和ba的大小，按降序排列，再转换为字符串
function largestNumber(nums) {
    nums.sort((a, b) => {
        let s1 = `${a}${b}`;
        let s2 = `${b}${a}`;
        return s2 - s1;
    })
    return nums[0] ? nums.join('') : '0';
}
console.log('=======largestNumber', largestNumber([3,30,34,5,9])); // 9534330





// 轮转数组：给你一个数组，将数组中的元素向右轮转 k 个位置，其中 k 是非负数。
// https://leetcode-cn.com/problems/rotate-array/
// 首先对整个数组进行翻转，这样原数组中需要翻转的子数组就会跑到数组最前面；然后从k处分隔数组，左右两个数组各自进行翻转即可
// 例：k=2,  [1,2,3,4,5] => [5,4,3,2,1] => [4,5,1,2,3]
// 空间：O(1)
function rotate(nums, k) {
    k %= nums.length;
    nums = reverse(nums, 0, nums.length-1);
    nums = reverse(nums, 0, k-1);
    nums = reverse(nums, k, nums.length-1);
    return nums;

    // 反转数组
    function reverse(nums, left, right) {
        while(left < right) {
            [nums[left++], nums[right--]] = [nums[right], nums[left]]; // es6反转
        }
        return nums;
    }
}
console.log('=========rotate', rotate([1,2,3,4,5,6,7], 3)) // [5,6,7,1,2,3,4]




// 计数质数：统计所有小于非负整数 n 的质数的数量。
// 质数的定义：在大于 1 的自然数中，除了 1 和它本身以外不再有其他因数的自然数
// https://leetcode-cn.com/problems/count-primes/
// 枚举法
function countPrimes(n) {
    let count = 0;
    for (let i = 2; i < n; i ++) {
        if (isPrime(i)) count++;
    }
    return count;

    // 判断是否是质数
    function isPrime(x) {
        for(let i = 2; i*i<=x; i++) {
            if (x%i === 0) return true; // 存在能整除的数
        }
        return false;
    }
}
// 埃氏筛
// 设 isPrime[i] 表示数 i 是不是质数，如果是质数则为 1，否则为 0。
// 从小到大遍历每个数，如果这个数为质数，则将其所有的倍数都标记为合数（除了该质数本身），即 0，这样在运行结束的时候我们即能知道质数的个数。
// 时间复杂度：O(nlogn)
// 空间复杂度：O(n), 我们需要 O(n) 的空间记录每个数是否为质数。
function countPrimes(n) {
    let isPrime = new Array(n).fill(1); // 初始化，都标记为质数
    let count = 0;
    for (let i = 2; i < n; i ++) {
        if (isPrime[i]) { // 如果为质数， 就把范围内的所有倍数都标记为合数
            count++;
            // 对于一个质数 x，如果按上文说的我们从 2x 开始标记其实是冗余的，应该直接从 x⋅x 开始标记，因为 2x,3x,… 这些数一定在 x 之前就被其他数的倍数标记过了，例如 2 的所有倍数，3 的所有倍数等。
            for (let j = i * i; j < n; j += i) {
                isPrime[j] = 0;
            }
        }
    }
    return count;
}
console.log('======countPrimes', countPrimes(10)); // 4(2, 3, 5, 7)



// 实现 Trie (前缀树)
// https://leetcode-cn.com/problems/implement-trie-prefix-tree/



```


## 排序

先看一个TopK的算法题：[数组中的第K个最大元素](https://leetcode-cn.com/problems/kth-largest-element-in-an-array/)
> 给你一个整数数组 nums 和一个整数 k ，请你返回其中出现频率前 k 高的元素。你可以按 任意顺序 返回答案。


### sort排序
> 在JS中我们对数组进行排序时一般都使用[Array.prototype.sort()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)进行排序

``` js
function findKthLargest(nums, k) {
  nums.sort((a, b) => b - a);
  return nums[k-1];
}
```
- 时间复杂度：`O(nlogn)`
- 空间复杂度：`O(logn)`

### 冒泡排序

1. 比较相邻的两个元素，如果前一个比后一个大，则交换位置。
2. 第一轮的时候最后一个元素应该是最大的一个。
3. 按照步骤1的方法进行相邻两个元素的比较，这个时候由于最后一个元素已经是最大的了，所以最后一个元素不用比较。


> 题目仅仅需要求出数组中的第K个最大元素，没必要对数组整体进行排序；可以使用冒泡排序，每次将最大的数在最右边冒泡出来，只冒泡 k 次即可。

``` js
function findKthLargest(nums, k) {

  bubbleSort(nums, k); // 冒泡k次，最后边依次出现k个最大的元素
  return nums[nums.length - k]; // 取第k大的元素

  // 冒泡排序
  function bubbleSort(nums, k = nums.length - 1) {
    for(let i = 0; i < k; i ++) {
      for(let j = 0; j < nums.length - i - 1; j ++) {
        if (nums[j] > nums[j+1]) {
          // let temp = nums[j];
          // nums[j] = nums[j+1];
          // num[j+1] = temp;
          [nums[j], nums[j+1]] = [nums[j+1], nums[j]]; // es6
        }
      }
    }
  }
}
```
- 时间复杂度：最好时间复杂度 `O(n)`，平均时间复杂度 `O(n*k)`
- 空间复杂度：`O(1)`


> 冒泡排序算是比较基础的排序方法，和它类似的还有选择排序、插入排序~

### 选择排序
> 选择排序是从数组的开头开始，将第一个元素和其他元素作比较，检查完所有的元素后，最小的放在第一个位置，接下来再开始从第二个元素开始，重复以上一直到最后。
``` js
function selectSort(arr) {
    var len = arr.length;
    for(let i = 0 ;i < len - 1; i++) {
        for(let j = i ; j<len; j++) {
            if(arr[j] < arr[i]) {
                [arr[i],arr[j]] = [arr[j],arr[i]];
            }
        }
    }
    return arr
}
```

### 插入排序
> 插入排序（Insertion-Sort）的算法描述是一种简单直观的排序算法。它的工作原理是通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。

- 首先将待排序的第一个记录作为一个有序段
- 从第二个开始，到最后一个，依次和前面的有序段进行比较，确定插入位置
``` js
function insertSort(arr) {
    for(let i = 1; i < arr.length; i++) {  //外循环从1开始，默认arr[0]是有序段
        for(let j = i; j > 0; j--) {  //j = i,将arr[j]依次插入有序段中
            if(arr[j] < arr[j-1]) {
                [arr[j],arr[j-1]] = [arr[j-1],arr[j]];
            } else {
                break;
            }
        }
    }
    return arr;
}
```
正常来讲，冒泡、选择、插入排序的时间复杂度都是`O(n²)`，基本思想就是两层循环嵌套，第一遍找元素`O(n)`,第二遍找位置`O(n)`~


### 快速排序
> 快排是处理大数据最快的排序算法之一。它是一种分而治之的算法，通过递归的方式将数据依次分解为包含较小元素和较大元素的不同子序列。该算法不断重复这个步骤直至所有数据都是有序的。

简单说： 找到一个数作为参考，比这个数字大的放在数字左边，比它小的放在右边； 然后分别再对左边和右变的序列做相同的操作。

``` js
function quickSort(arr) {
    if(arr.length <= 1) {
        return arr;  //递归出口
    }
    var left = [],
        right = [],
        current = arr.splice(0,1); //注意splice后，数组长度少了一个
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] < current) {
            left.push(arr[i])  //放在左边
        } else {
            right.push(arr[i]) //放在右边
        }
    }
    return quickSort(left).concat(current,quickSort(right)); //递归
}

```
- 平均时间复杂度：`O(nlogn)`，最坏时间复杂度：`O(n²)`；空间复杂度：`	O(logn)`

> 如果不考虑稳定性，快排似乎是接近完美的一种方法，但可惜它是不稳定的。 那什么是稳定性呢？

通俗的讲有两个相同的数A和B，在排序之前A在B的前面，而经过排序之后，B跑到了A的前面，对于这种情况的发生，我们管他叫做排序的不稳定性，而快速排序在对存在相同数进行排序时就有可能发生这种情况。


### 希尔排序
> 希尔排序是插入排序的改良算法，但是核心理念与插入算法又不同，它会先比较距离较远的元素，而非相邻的元素。

先将整个待排序的记录序列分割成为若干子序列分别进行直接插入排序。

``` js
function shellSort(arr,gap) {
    console.log(arr)//为了方便观察过程，使用时去除
    for(let i = 0; i<gap.length; i++) {  //最外层循环，一次取不同的步长，步长需要预先给出
        let n = gap[i]; //步长为n
        for(let j = i + n; j < arr.length; j++) { //接下类和插入排序一样，j循环依次取后面的数
            for(let k = j; k > 0; k-=n) { //k循环进行比较，和直接插入的唯一区别是1变为了n
                if(arr[k] < arr[k-n]) {
                    [arr[k],arr[k-n]] = [arr[k-n],arr[k]];
                    console.log(`当前序列为[${arr}] \n 交换了${arr[k]}和${arr[k-n]}`)//为了观察过程
                } else {
                    continue;
                }
            }
        }
    }
    return arr;
}

// 使用
var arr = [3, 2, 45, 6, 55, 23, 5, 4, 8, 9, 19, 0];
var gap = [3,2,1];
console.log(shellSort(arr,gap))
```
- 时间复杂度：`O(nlogn)`；空间复杂度：`	O(1)`


### 归并排序
> 归并（Merge）排序法是将两个（或两个以上）有序表合并成一个新的有序表，即把待排序序列分为若干个子序列，每个子序列是有序的。然后再把有序子序列合并为整体有序序列。


### 堆排序
> 堆排序（Heapsort）是指利用堆这种数据结构所设计的一种排序算法。堆积是一个近似完全二叉树的结构，并同时满足堆积的性质：即子结点的键值或索引总是小于（或者大于）它的父节点。




### 计数排序
> 计数排序使用一个额外的数组C，其中第i个元素是待排序数组A中值等于i的元素的个数。然后根据数组C来将A中的元素排到正确的位置。它只能对整数进行排序。

### 桶排序
> 假设输入数据服从均匀分布，将数据分到有限数量的桶里，每个桶再分别排序（有可能再使用别的排序算法或是以递归方式继续使用桶排序进行排。


### 基数排序
> 基数排序是按照低位先排序，然后收集；再按照高位排序，然后再收集；依次类推，直到最高位。有时候有些属性是有优先级顺序的，先按低优先级排序，再按高优先级排序。最后的次序就是高优先级高的在前，高优先级相同的低优先级高的在前。基数排序基于分别排序，分别收集，所以是稳定的。

`基数排序 vs 计数排序 vs 桶排序` 这三种排序算法都利用了桶的概念，但对桶的使用方法上有明显差异：
- 基数排序：根据键值的每位数字来分配桶
- 计数排序：每个桶只存储单一键值
- 桶排序：每个桶存储一定范围的数值


### TopK的实现

> 回到刚才的`TopK`问题，除了用sort和冒泡排序外，还可以使用堆排序和快速排序~

- **堆排序的思路就是：构造前 k 个最大元素小顶堆，取堆顶**
> 从数组中取出 k 个元素构造一个小顶堆，然后将其余元素与小顶堆对比，如果大于堆顶则替换堆顶，然后堆化，所有元素遍历完成后，堆中的堆顶即为第 k 个最大值

::: tip 具体操作流程：
- 从数组中取前 k 个数（ 0 到 k-1 位），构造一个小顶堆
- 从 k 位开始遍历数组，每一个数据都和小顶堆的堆顶元素进行比较，如果小于堆顶元素，则不做任何处理，继续遍历下一元素；如果大于堆顶元素，则将这个元素替换掉堆顶元素，然后再堆化成一个小顶堆。
- 遍历完成后，堆顶的数据就是第 K 大的数据
:::
时间复杂度：遍历数组需要 `O(n)` 的时间复杂度，一次堆化需要 `O(logk)` 时间复杂度，所以利用堆求 Top k 问题的时间复杂度为 `O(nlogk)`; 空间复杂度：`O(k)`


- **快速选择（quickselect）算法**

无论是排序算法还是构造堆求解 Top k问题，我们都经过的一定量的不必要操作：
1. 如果使用排序算法，我们仅仅想要的是第 k 个最大值，但对其余不需要的数也进行了排序
2. 如果使用堆排序，需要维护一个大小为 k 的堆(大顶堆，小顶堆)，时间复杂度也为 O(nlogk)

::: tip 快排的过程简单的说只有三步：
- 首先从序列中选取一个数作为基准数
- 将比这个数大的数全部放到它的右边，把小于或者等于它的数全部放到它的左边 （一次快排 partition）
- 然后分别对基准的左右两边重复以上的操作，直到数组完全排序
:::

::: tip 具体按以下步骤实现：
1. 创建两个指针分别指向数组的最左端以及最右端
2. 在数组中任意取出一个元素作为基准
3. 左指针开始向右移动，遇到比基准大的停止
4. 右指针开始向左移动，遇到比基准小的元素停止，交换左右指针所指向的元素
5. 重复3，4，直到左指针超过右指针，此时，比基准小的值就都会放在基准的左边，比基准大的值会出现在基准的右边
6. 然后分别对基准的左右两边重复以上的操作，直到数组完全排序
:::

平均时间复杂度：`O(n)`；最坏情况时间复杂度为`O(n2)`; 空间复杂度：`O(1)`


上面堆排序和快排的具体代码参考[这里](https://github.com/sisterAn/JavaScript-Algorithms/issues/62)

## 备注


### DFS 和 BFS

**深度优先搜索算法(Depth-First-Search)**: 是一种用于遍历或搜索树或图的算法。 沿着树的深度遍历树的节点，尽可能深的搜索树的分支。当节点v的所在边都己被探寻过或者在搜寻时结点不满足条件，搜索将回溯到发现节点v的那条边的起始节点。整个进程反复进行直到所有节点都被访问为止。

**BFS（Breath First Search）广度优先搜索**: BFS是从根节点开始，沿着树(图)的宽度遍历树(图)的节点。如果所有节点均被访问，则算法中止。




### JS位移运算符

- 左移运算符：`<<`
> 按二进制形式把所有的数字向左移动对应的位数，高位移出(舍弃)，低位的空位补零。

例如： `3 << 2 = 12`，则是将`数字3左移2位`:
``` js
0000 0000 0000 0000 0000 0000 0000 0011 // 先将3转换为二进制
0000 0000 0000 0000 0000 0000 0000 1100 // 再左移两位, 转换为十进制是12

// 数学意义：
// 在数字没有溢出的前提下，对于正数和负数，左移一位都相当于乘以2的1次方，左移n位就相当于乘以2的n次方。
1<<3   //等于 1*2³  8
4<<5   //等于 4*2^5  128
```


- 右移运算符: `>>`
> 按二进制形式把所有的数字向右移动对应位移位数，低位移出(舍弃)，高位的空位补符号位，即`正数补零，负数补1`

例如：`11 >> 2 = 2`，则是将`数字11右移2位`:
``` js
0000 0000 0000 0000 0000 0000 0000 1011 // 先将11转换为二进制
0000 0000 0000 0000 0000 0000 0000 0010 // 右移两位，高位补0，转换为十进制是2

// 数学意义：
// 右移一位相当于除2，右移n位相当于除以2的n次方。
10>>3    //等于 Math.floor(10 / 2^3) = 1
100>>3   //等于 Math.floor(100 / 2^3) = 12;
```

- 无符号右移运算符：`>>>`
> 按二进制形式把所有的数字向右移动对应位数，低位移出(舍弃)，高位的空位补零。对于正数来说和带符号右移相同，对于负数来说不同。其他结构和>>相似。


### 逻辑运算符

- “&”运算符
> “&”运算符（位与）用于对两个二进制操作数逐位进行比较, 在位运算中，数值 1 表示 true，0 表示 false，反之亦然。
``` js
1 & 1 // 1
1 & 0 // 0
0 & 1 // 0
0 & 0 // 0

// n & 1 === 1, 说明 n 的最后一位是 1
// n & 1 === 0, 说明 n 的最后一位是 0
101 & 1 // 1
110 & 1 // 0
```

## 算法网站

- [Leetcode算法](https://leetcode-cn.com/problemset/algorithms/)
- [牛客网题库](https://www.nowcoder.com/activity/oj)


## 收藏

- [leetcode最常见的150道前端面试题 --- 简单题上（44题）](https://juejin.cn/post/6987320619394138148)
- [【算法面试】leetcode最常见的150道前端面试题 --- 简单题下（44题）](https://juejin.cn/post/6989031479753834504)
- [66 道前端算法面试题附思路分析助你查漏补缺](https://mp.weixin.qq.com/s/6Xr4Af5_c8pSfmDRzNRCAw)
- [别再说你不懂Top K问题了](https://mp.weixin.qq.com/s/0_Rr6Pjshvd7Om2zTYMriQ)
- [前端进阶算法：常见算法题及完美题解](https://mp.weixin.qq.com/s/23fwxjhHag-WwLsS9Z9Caw)
- [前端笔试&面试爬坑系列---算法](https://juejin.cn/post/6844903656865677326)
- [面试官：请使用JS完成一个LRU缓存？](https://juejin.cn/post/7105654083347808263)


<!-- 2022-04-17 -->