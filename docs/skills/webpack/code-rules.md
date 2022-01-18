

# webpack配置之代码规范
> 这里主要是记录下我的前端代码规范学习笔记~

## ESlint
> [ESlint](http://eslint.cn/)是 JavaScript 的代码检验工具, 用于查找并修复 JS 代码中的问题。

ESLint 是一款用于查找并报告代码中问题的工具，并且支持部分问题自动修复。其核心是通过对代码解析得到的 AST（Abstract Syntax Tree 抽象语法树）进行模式匹配，来分析代码达到检查代码质量和风格问题的能力。



### 使用
> 这里先从新建一个项目实现 eslint 对 js 文件的代码检查来熟悉 eslint 的使用。


#### 初始化

- 新建项目：`mkdir eslint-js`

- 添加脚本文件：`npm init -y`

- 安装eslint: `npm i eslint -D`

- 配置初始化: `npx eslint --init`
``` shell
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · vue
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser
✔ What format do you want your config file to be in? · JavaScript
The config that you've selected requires the following dependencies:

eslint-plugin-vue@latest
✔ Would you like to install them now with npm? · No / Yes
```
> [eslint-plugin-vue](https://eslint.vuejs.org/)是 eslint 官方出的用于检查 `.vue`文件的插件。

> 这里配置的时候也可以选择[standardjs]()、[airbnb](https://github.com/airbnb/javascript)这些比较热门的代码规范，配合ESlint一起使用~

- 初始化完成后生成默认配置：
``` js
// .eslintrc.js

module.exports = {
    "env": { // 环境
        "browser": true,
        "es2021": true
    },
    "extends": [ // 规范
        "eslint:recommended", // eslint
        "plugin:vue/essential" // vue
    ],
    "parserOptions": { // 配置参数
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "plugins": [ // 插件
        "vue"
    ],
    "rules": { // 规则
    }
};
```
> **配置文件**：使用 JavaScript、JSON 或者 YAML 文件为整个目录（处理你的主目录）和它的子目录指定配置信息。可以配置一个独立的 `.eslintrc.*` 文件，或者直接在 `package.json` 文件里的 `eslintConfig` 字段指定配置，`ESLint` 会查找和自动读取它们，再者，你可以在命令行运行时指定一个任意的配置文件。

> 这些文件的优先级则是按照以上出现的顺序（`.eslintrc.js > .eslintrc.yaml > .eslintrc.yml > .eslintrc.json > .eslintrc > package.json`）


[eslint的配置](http://eslint.cn/docs/user-guide/configuring)


#### JS规范检查

- 根目录下新建 `index.js`:
``` js
console.log("======hello")
let i = 0
let obj = {
        a: 1,
b: 2,
};
console.log(name)
```


- 先执行检查命令：`./node_modules/.bin/eslint index.js`
> 如果`eslint`是全局安装，可直接输入`eslint index.js`进行检测~

``` shell
  2:26  error  'i' is assigned a value but never used    no-unused-vars # 声明变量 i 未使用
  3:5   error  'obj' is assigned a value but never used  no-unused-vars # 声明变量 obj 未使用

✖ 2 problems (2 errors, 0 warnings)
```


- 接着在`rule`中添加几条规则：
``` js
// .eslintrc.js

 "rules": {
      "indent": ["warn", 4, { "SwitchCase": 1 }], // 强制使用一致的缩进:warn警告； 4个空格缩进；强制 switch 语句中的 case 子句1个缩进
      "semi": ["warn", "always"], // 代码段后面都加上分号
      "comma-dangle": ["warn", "never"], //对象里的最后属性不加逗号
    }
```

[eslint的rules配置](http://eslint.cn/docs/rules/)



- 再执行`./node_modules/.bin/eslint index.js`检测一下：
``` shell
  1:27  warning  Missing semicolon                             semi # 缺少分号
  2:5   error    'i' is assigned a value but never used        no-unused-vars
  2:10  warning  Missing semicolon                             semi # 缺少分号
  3:5   error    'obj' is assigned a value but never used      no-unused-vars
  4:1   warning  Expected indentation of 2 spaces but found 8  indent # 缩进不对
  5:1   warning  Expected indentation of 2 spaces but found 0  indent # 缩进不对
  5:5   warning  Unexpected trailing comma                     comma-dangle # 对象最后属性多了逗号
  7:18  warning  Missing semicolon                             semi # 缺少分号

✖ 8 problems (2 errors, 6 warnings)
```
> 可以看到多了几个警告，这些就是上面加了几条校验规则后触发的提示~

- 接着尝试修复下：`./node_modules/.bin/eslint index.js --fix`
> 自动修复后`index.js`文件格式化为这个样子了：
``` js
console.log("======hello"); // 分号自动加上了
let i = 0; // 分号自动加上了
let obj = {
    a: 1, // 缩进自动变成4个
    b: 2 // 对象最后属性的逗号去掉了, 缩进自动变成4个
};
console.log(name); // 分号自动加上了
```
上面自动修复后，还有几个报错就需要手动进行修改了~


#### Vue自动检查
> 因为执行`npx eslint --init`初始化的时候，添加了`vue`，所以接下来试一下`vue`的自动检查~

- 首先项目根目录下新建`index.vue`:
``` vue
<template>
<div class=''><div>
</template>

<script>

export default {
components: {},
data() {
    return {

    };
},
};
</script>
```

- 接着先检查一下：`./node_modules/.bin/eslint index.vue`
``` shell
   1:1  error    Component name "index" should always be multi-word  vue/multi-word-component-names 
   # 这个报错是 eslint-plugin-vue 中自带的检查，
   # 是因为 extends 中配了 plugin:vue/essential, 改为 plugin:vue/base 就没有了
   8:1  warning  Expected indentation of 2 spaces but found 0        indent 
   9:1  warning  Expected indentation of 2 spaces but found 0        indent
  13:1  warning  Expected indentation of 2 spaces but found 0        indent
  13:2  warning  Unexpected trailing comma                           comma-dangle

✖ 5 problems (1 error, 4 warnings)
```
> 上面除了第一个报错外，其他的都是刚刚添加的`rules`里面的检查规则~

- 接下来添加一条`vue`的校验规则：
``` js
// .eslintrc.js

 "rules": {
      ...
      "vue/script-indent": ["error", 4, { "baseIndent": 0, "switchCase": 1}], //  vue中script缩进：error警告；4个空格缩进；强制 switch 语句中的 case 子句1个缩进
    }
```

- 再次检查：
``` shell
   8:1  warning  Expected indentation of 2 spaces but found 0         indent
   8:1  error    Expected indentation of 4 spaces but found 0 spaces  vue/script-indent
   9:1  warning  Expected indentation of 2 spaces but found 0         indent
   9:1  error    Expected indentation of 4 spaces but found 0 spaces  vue/script-indent
  10:1  error    Expected indentation of 8 spaces but found 4 spaces  vue/script-indent
  12:1  error    Expected indentation of 8 spaces but found 4 spaces  vue/script-indent
  13:1  warning  Expected indentation of 2 spaces but found 0         indent
  13:1  error    Expected indentation of 4 spaces but found 0 spaces  vue/script-indent
  13:2  warning  Unexpected trailing comma                            comma-dangle

✖ 9 problems (5 errors, 4 warnings)
```
> 发现多了很多`vue/script-indent`规则的报错，说明添加的规则生效了~

- 接着尝试自动修复: `./node_modules/.bin/eslint index.vue --fix`
``` vue
<template>
<div class=''><div>
</template>

<script>

export default {
    components: {}, // 自动修复了缩进
    data() {
    return {

    };
    }
};
</script>
```
发现`index.vue`中自动修复了一些缩进，但还有些报错需要手动进行修复了~



#### TS检查
> 2019 年 1 月，`TypeScirpt` 官方决定全面采用 `ESLint` 作为代码检查的工具，之后 Eslint便发布 [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) 项目，以集中解决 TypeScript 和 ESLint 兼容性问题。

[TypeScript 官方决定全面采用 ESLint](https://www.oschina.net/news/103818/future-typescript-eslint)、[typescript-tutorial](https://github.com/xcatliu/typescript-tutorial/blob/master/engineering/lint.md)

在 `JavaScript` 项目中，我们一般使用 `ESLint` 来进行代码检查，它通过插件化的特性极大的丰富了适用范围，搭配 `typescript-eslint` 之后，甚至可以用来检查 `TypeScript` 代码。

`TypeScript` 关注的重心是类型的检查，而不是代码风格。当团队的人员越来越多时，同样的逻辑不同的人写出来可能会有很大的区别。


**实践一下~**


- 新建项目：`mkdir eslint-ts`

- 生成脚本：`npm i eslint -D`

- 配置初始化：`npx eslint --init`
``` shell
➜  eslint-ts npx eslint --init
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · none
✔ Which framework does your project use? · vue
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser, node
✔ What format do you want your config file to be in? · JavaScript
The config that you've selected requires the following dependencies:

eslint-plugin-vue@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
✔ Would you like to install them now with npm? · No / Yes
Installing eslint-plugin-vue@latest, @typescript-eslint/eslint-plugin@latest, @typescript-eslint/parser@latest
```
> 安装失败的话，就手动进行安装：`npm i eslint-plugin-vue @typescript-eslint/eslint-plugin @typescript-eslint/parser -D`

::: tip
- `@typescript-eslint/parser`: `ESLint`的解析器，用于解析`TypeScript`; 由于 `ESLint` 默认使用 `Espree` 进行语法解析，无法识别 `TypeScript` 的一些语法，故我们需要安装 `@typescript-eslint/parser`，替代掉默认的解析器，从而检查和规范`TypeScript`代码。
- `@typescript-eslint/eslint-plugin`: 作为 eslint 默认规则的补充，提供了一些额外的适用于 `ts` 语法的规则。
:::

初始化成功后，会自动`.eslintrc.js`文件：
``` js
module.exports = {
    "env": { // 环境
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [ // 规范
        "eslint:recommended", // eslint
        "plugin:vue/essential", // vue
        "plugin:@typescript-eslint/recommended" // typescript-eslint
    ],
    "parserOptions": { // 解析参数
        "ecmaVersion": 13,
        "parser": "@typescript-eslint/parser" // 解析器
    },
    "plugins": [ // 插件
        "vue",
        "@typescript-eslint"
    ],
    "rules": { // 自定义规则
    }
};

```

- 安装typescript: `npm install typescript -D`

- 创建`tsconfig.json`文件： `tsc init`
> [详细配置参考](https://www.tslang.cn/docs/handbook/compiler-options.html)


- 根目录下新建`index.ts`:
``` ts
var count : number = 1
count = 2
    console.log('====count', count);

interface Person {
    name: string,
    age: number
}

var tom: Person = {
    name: 'tom',
    age: 18
}

console.log('====tom', tom);
```


- 检查一下：`./node_modules/.bin/eslint index.ts`
``` shell
   1:1  error  Unexpected var, use let or const instead                                      no-var # 不能使用 var
   1:5  error  Type number trivially inferred from a number literal, remove type annotation  @typescript-eslint/no-inferrable-types
  10:1  error  Unexpected var, use let or const instead                                      no-var # 不能使用 var

✖ 3 problems (3 errors, 0 warnings)
```
> 可以看到上面出现了`@typescript-eslint`默认给出的提示~

- 接下来新增两个规则：
``` js
// .eslintc.js

"rules": {
        // 禁止使用 var
        'no-var': "error",
        // 优先使用 interface 而不是 type
        '@typescript-eslint/consistent-type-definitions': [
            "error",
            "interface"
        ],
        "indent": ["warn", 2, { "SwitchCase": 1 }], // 强制使用一致的缩进:warn警告； 4个空格缩进；强制 switch 语句中的 case 子句1个缩进
        "semi": ["warn", "always"], // 代码段后面都加上分号
        "comma-dangle": ["warn", "never"], //对象里的最后属性不加逗号
    }
```

- 再检查一下：
``` shell
   1:1   error    Unexpected var, use let or const instead                                      no-var
   1:5   error    Type number trivially inferred from a number literal, remove type annotation  @typescript-eslint/no-inferrable-types
   1:23  warning  Missing semicolon                                                             semi
   2:10  warning  Missing semicolon                                                             semi
   3:1   warning  Expected indentation of 0 spaces but found 4                                  indent
  10:1   error    Unexpected var, use let or const instead                                      no-var
  11:1   warning  Expected indentation of 2 spaces but found 4                                  indent
  12:1   warning  Expected indentation of 2 spaces but found 4                                  indent
  13:2   warning  Missing semicolon                                                             semi

✖ 9 problems (3 errors, 6 warnings)
```
> 发现报错增多了~

- 修复：`./node_modules/.bin/eslint index.ts`
``` ts
let count  = 1;
count = 2;
console.log('====count', count);

interface Person {
    name: string,
    age: number
}

const tom: Person = {
  name: 'tom',
  age: 18
};

console.log('====tom', tom);
```
> 会发现`index.ts`文件的一些格式问题就自动修复了, 其他的就需要手动修复了

对于`vue`的检查和上面`eslint-js`中的差不多，这里就不再赘述了~





### `.eslintrc.js`配置参考

``` js
module.exports = {
    root: true, // 当前目录即为根目录，eslint规则被应用到该目录下
    env: { // 要在配置文件里指定环境，使用 env 关键字指定你想启用的环境，并设置它们为 true
      // node: true, // 会添加所有的全局变量比如global
      browser: true, // 会添加所有的浏览器变量比如Windows
      es6: true, //  启用除了 modules 以外的所有 ECMAScript 6 特性（这个功能在设置ecmaVersion版本为6的时候自动设置）。
      commonjs: true, // CommonJS 全局变量和 CommonJS 作用域 (用于 Browserify/WebPack 打包的只在浏览器中运行的代码)。
    },
    parserOptions: { // 解析
      parser: '@typescript-eslint/parser', // 解析器, ESLint 默认使用 Espree 进行语法解析
      // parser: 'babel-eslint',
      ecmaVersion: 2018, //  默认值是5，可以设置为3、5、6、7、8、9、10，用来指定使用哪一个ECMAScript版本的语法。也可以设置基于年份的JS标准，比如2015(ECMA 6)
      sourceType: 'module', // 如果你的代码是ECMAScript 模块写的，该字段配置为module，否则为script(默认值)
      ecmaFeatures: { // 想使用的额外的语言特性
        jsx: true, // 启用 JSX
      }
    },
    // plugin:prettier/recommended：使用prettier中的样式规范，且如果使得ESLint会检测prettier的格式问题，同样将格式问题以error的形式抛出
    extends: [ // 需要继承的配置: 指定eslint规范
        'plugin:vue/base',
        "plugin:@typescript-eslint/recommended"
        // 'airbnb-base',
        // 'plugin:prettier/recommended'
    ],
    plugins: [ // 插件,插件名称可以省略 eslint-plugin- 前缀
      'vue', 
      '@typescript-eslint',
      // 'prettier'
    ],
    globals: { // 要在配置文件中配置全局变量，请将 globals 配置属性设置为一个对象，该对象包含以你希望使用的每个全局变量
      // Atomics: 'readonly', // 只被读取, 不允许重写变量
      // SharedArrayBuffer: 'readonly',
    },
  
    rules: { //  自定义规则，可以覆盖掉extends的配置

      "indent": ["warn", 4, { "SwitchCase": 1 }], // 强制使用一致的缩进:warn警告； 4个空格缩进；强制 switch 语句中的 case 子句1个缩进
      "quotes": ["error", "single", { "allowTemplateLiterals": true }], // js都用单引号，template里面的html用双引号
      "semi": ["warn", "always"], // 代码段后面都加上分号
      "comma-dangle": ["warn", "never"], //对象里的最后属性不加逗号
      "no-undef": 0, // 0是忽略，1是警告，2是报错, 默认是 1
      "vue/html-self-closing": ["warn", { // vue中自闭合标签：warn警告
          "html": {
              "void": "any",
              "normal": "any",
              "component": "any"
          }
      }],       
      "no-debugger": process.env.NODE_ENV === 'production' ? 'error' : 'off', // 禁用debugger：生产环境error警告，开发环境保留
      "vue/script-indent": ["error", 4, { "baseIndent": 0, "switchCase": 1}], //  vue中script缩进：error警告；4个空格缩进；强制 switch 语句中的 case 子句1个缩进

      ///// prettier
      // "prettier/prettier": "error" // 表示被prettier标记的地方抛出错误信息。
    },

    // 该字段定义的数据可以在所有的插件中共享。这样每条规则执行的时候都可以访问这里面定义的数据
    settings: {}
  }
```

[eslint的配置](http://eslint.cn/docs/user-guide/configuring)





### VSCode配置自动检查

**settings.json**
> [settings.json](https://code.visualstudio.com/docs/getstarted/settings) 配置可以在 vscode 全局下配置，也可以在项目下自定义配置

1. 安装`ESlint`插件

2. 全局配置：Code 》 首选项 》 设置 》，默认选择【用户】， 右上角转成代码，即可打开全局的配置文件
    > 也可以 `cmd + shift + p`, 输入 `settings.json`, 也可以打开 `settings.json` 文件

3. 自定义配置：Code 》 首选项 》 设置 》，选择【工作区】，右上角转成代码，即可打开项目的的自定义配置文件，同时会在项目根目录下生成`.vscode/settings.json`文件

4. 在`settting.json` 中添加自动修复指令：
``` json
{
  // 系统配置
  "window.zoomLevel": -2, // 缩放比例
  "editor.fontSize": 16, // 字体大小
  "editor.tabSize": 4, // tab 空格数

  // eslint配置
  "eslint.run": "onSave", // 保存的时候执行校验
  // eslint 自动修复
  "eslint.autoFixOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [ // eslint校验
    "javascript",
    "javascriptreact",
    "html",
    {
      "language": "html", // 检测.html
      "autoFix": true
    },
    {
      "language": "vue", // 检测.vue
      "autoFix": true
    },
    {
      "language": "typescript", // 检测.ts
      "autoFix": true
    },
  ],
}
```

5. 然后重启`VScode`后，`cmd +s` 就能自动修复格式问题了~
> 虽然可以在`settting.json`中单独配置格式，但是如果项目中有`.eslintrc.js`文件，那么`eslint`插件会优先执行`.eslintrc.js`文件的配置。






### 备注

- 每次执行`./node_modules/.bin/eslint index.js`有点繁琐，可通过配置脚本命令简化代码：
``` json
// package.json

"scripts": {
    "eslint": "eslint index.ts",
    "fix": "eslint index.ts --fix",
    "eslint all": "eslint src --ext .js" // 检查项目src下的 .js 文件
  },
```


- 根目录下新增`.eslintignore`文件可用于过滤无需校验的文件
```
/build/
/config/
/dist/
/docs/
nodule_modules
```






### 问题记录



- **为什么 `vscode` 的 `settings.json` 配置了自动修复，有的项目可以，但有的项目 `ctrl+s` 之后 `eslint.autoFixOnSave` 没生效？**
> 暂时无解~




- `cmd + s`保存时报错: 
1. `ESLint: Cannot find module 'eslint/use-at-your-own-risk'. Please see the 'ESLint' output channel for details.`

2. `ESLint: /Users/admin/my-code/self/byme/eslint-test/eslint-js/.eslintrc.js: Environment key "es2021" is unknown . Please see the 'ESLint' output channel for details.`




- 执行`./node_modules/.bin/eslint index.js`时报错：
```
Oops! Something went wrong! :(

ESLint: 8.3.0

Error [ERR_REQUIRE_ESM]: Must use import to load ES Module: /Users/admin/my-code/self/byme/eslint-test/eslint-js/node_modules/@eslint/eslintrc/universal.js
```
> 解决方案：node版本更新到 >= `v12.22.0`





- `npm run dev`的时候报错：`warning  'alwaysShow' is not defined  no-undef`
> 这是开启 eslint 代码检查报的错~

1. 一种是直接在webpack中报eslint检查注释掉：
``` js
// {
//     test: /\.(js|vue)$/,
//     use: 'eslint-loader',
//     enforce: 'pre',
// },
```
> 这样就全部去掉了代码检查，不妥~

2. 修改规则：
``` js
// .eslintrc.js

rules: {
    "no-undef": 0, // 引入未定义的变量; 0是忽略，1是警告，2是报错, 默认是 1
}
```


- ts 检查代码规范的时候报错：`Error: Failed to load plugin '@typescript-eslint' declared in '.eslintrc.js': Cannot find module 'typescript'`
> 可能是插件没装上，重新安装一下：`npm install --save-dev typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin`，











## Prettier
> [Prettier](https://www.prettier.cn/) 代码格式化工具，聚焦于代码的格式化，通过语法分析，重新整理代码的格式，让所有人的代码都保持同样的风格; 能对 html, css, js 文件进行格式化

`Prettier` 格式化我们的代码，它调整长句，整理空格，括号等；所以它将代码作为输入，修改后的代码作为输出。
> 原理是将代码生成`AST`语法树，之后是处理`AST`，最后生成代码。

[Prettier线上试一试](https://www.prettier.cn/playground/)


### VSCode中配置

- 安装插件：`Prettier - Code formatter`

- 项目根目录下新建 RC 文件：
> `prettier.config.js` or `.prettierrc.js`
``` js
// prettier.config.js

module.exports = {
  "printWidth": 80, //一行的字符数，如果超过会进行换行，默认为80
  "tabWidth": 2, //一个tab代表几个空格数
  "useTabs": false, //是否使用tab进行缩进，默认为false，表示用空格进行缩减
  "singleQuote": false, //字符串是否使用单引号，默认为false，使用双引号
  "semi": true, //行位是否使用分号，默认为true
  "trailingComma": "none", //是否使用尾逗号，有三个可选值"< none | es5 | all>"
  "bracketSpacing": true, //对象大括号直接是否有空格，默认为true，效果：{ foo: bar }
  "parser": "vue" //代码的解析引擎，默认为babylon，与babel相同。
}
```

- 鼠标右键 》 格式化文档 》 选择 `Prettier`, 即可对文档进行格式化

- 也可在`VSCode`的 `settings.json` 文件中添加配置，实现保存时自动修复。


### 项目中引入

- 安装插件：`npm i @vue/eslint-config-prettier eslint-plugin-prettier prettier -D`
1. `eslint-plugin-prettier`: 将 `Prettier` 的规则设置到 `ESLint` 的规则中；
2. `eslint-config-prettier`: 关闭 `ESLint` 中与 `Prettier` 中会发生冲突的规则。
    > 通过使用`eslint-config-prettier`配置，能够关闭一些不必要的或者是与`prettier`冲突的`lint`选项。这样我们就不会看到一些`error`同时出现两次。使用的时候需要确保，这个配置在`extends`的最后一项。

- 在 `.eslintrc.js` 添加配置: 
``` js
extends: [
    'plugin:vue/base',
    "plugin:prettier/recommended",

],
rules: {
    "prettier/prettier": "error",
}
```



## 其他


### Vetur

- [Vetur](https://vuejs.github.io/vetur/)是一个支持`.vue`文件语法高亮的`VSCode`插件，也支持代码格式化，可跟`Pritter`一起结合使用~

### StyleLint
> `StyleLint` 是『一个强大的、现代化的 CSS 检测工具』, 与 `ESLint` 类似, 是通过定义一系列的编码风格规则帮助我们避免在样式表中出现错误。

[css代码规范工具stylelint](https://zhuanlan.zhihu.com/p/138323526)


### Volar
> 与`vetur`相同，`volar`是一个针对`vue`的`vscode`插件，不过与`vetur`不同的是，`volar`提供了更为强大的功能, 可以对 `ts` 进行支持。

[参考](https://www.imooc.com/article/317810)




## 参考

- [深入浅出eslint——关于我学习eslint的心得](https://juejin.cn/post/6844903684522917902)
- [ESLint里的规则教会我，无规矩 不编程](https://juejin.cn/post/6844903608379506701)
- [建议收藏】全网最全的讲清eslint和prettier的npm包和vscode插件的文章](https://juejin.cn/post/6990929456382607374)
- [最全的Eslint配置模板，从此统一团队的编程习惯](https://juejin.cn/post/6844903859488292871)


<fix-link label="Back" href="/skills/"></fix-link>


<!-- 2021-11-27 -->
