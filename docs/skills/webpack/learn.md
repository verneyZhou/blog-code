# webpack原理深析


## 原理

- 收集依赖
- ES6转ES5
- 替换require和exports

### 模块分析
1. 读取文件
2. 转换AST语法树
3. 收集依赖
    - 单个模块入口
    - 递归收集，生成依赖关系图
4. ES6转换为ES5


抽象语法树（AST）：将代码字符串转换为对象
> 所有需要编译的语言里面都存在，不只是在js里面




## 参考
- [AST编译](https://mp.weixin.qq.com/s/uVVo27ogrwMUY-6SybzauQ)
- [AST抽象语法树](https://segmentfault.com/a/1190000040260996)
- [astexplorer](https://astexplorer.net/)