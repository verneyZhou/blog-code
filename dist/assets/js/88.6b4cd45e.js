(window.webpackJsonp=window.webpackJsonp||[]).push([[88],{685:function(e,t,s){"use strict";s.r(t);var a=s(8),v=Object(a.a)({},(function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[s("h1",{attrs:{id:"互爱町项目开发笔记"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#互爱町项目开发笔记"}},[e._v("#")]),e._v(" 互爱町项目开发笔记")]),e._v(" "),s("p",[e._v("技术栈："),s("code",[e._v("vue3 + typescript + vite + vant + ethers")])]),e._v(" "),s("ul",[s("li",[s("a",{attrs:{href:"https://v3.cn.vuejs.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("vue3"),s("OutboundLink")],1)]),e._v(" "),s("li",[s("a",{attrs:{href:"https://vitejs.cn/",target:"_blank",rel:"noopener noreferrer"}},[e._v("vite"),s("OutboundLink")],1)]),e._v(" "),s("li",[s("a",{attrs:{href:"https://youzan.github.io/vant/#/zh-CN",target:"_blank",rel:"noopener noreferrer"}},[e._v("vant"),s("OutboundLink")],1)]),e._v(" "),s("li",[s("a",{attrs:{href:"https://www.tslang.cn/docs/home.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("typescript"),s("OutboundLink")],1)]),e._v(" "),s("li",[s("a",{attrs:{href:"https://learnblockchain.cn/docs/ethers.js/index.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("ethers.js 中文文档"),s("OutboundLink")],1)])]),e._v(" "),s("p",[s("a",{attrs:{href:"https://metamask.io/download/",target:"_blank",rel:"noopener noreferrer"}},[e._v("MetaMask钱包"),s("OutboundLink")],1)]),e._v(" "),s("h2",{attrs:{id:"构建"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#构建"}},[e._v("#")]),e._v(" 构建")]),e._v(" "),s("p",[e._v("node v14+")]),e._v(" "),s("p",[e._v("node包管理工具推荐："),s("code",[e._v("pnpm > yarn > npm")])]),e._v(" "),s("p",[s("code",[e._v("npm install -g pnpm")])]),e._v(" "),s("blockquote",[s("p",[e._v("node v14+")])]),e._v(" "),s("p",[e._v("全局安装ts： "),s("code",[e._v("npm install -g typescript")])]),e._v(" "),s("h3",{attrs:{id:"项目启动"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#项目启动"}},[e._v("#")]),e._v(" 项目启动")]),e._v(" "),s("ul",[s("li",[s("p",[s("code",[e._v("pnpm install")]),e._v(" （或 npm install）")])]),e._v(" "),s("li",[s("p",[s("code",[e._v("npm run dev")])])]),e._v(" "),s("li",[s("p",[e._v("vscode编辑器可以安装"),s("a",{attrs:{href:"https://www.imooc.com/article/317810",target:"_blank",rel:"noopener noreferrer"}},[e._v("Volar"),s("OutboundLink")],1),e._v("插件，功能比Vetur更全，对.ts文件有良好支持~")])])]),e._v(" "),s("h2",{attrs:{id:"备注"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#备注"}},[e._v("#")]),e._v(" 备注")]),e._v(" "),s("ul",[s("li",[s("p",[e._v("移动端适配\npostcss-pxtorem\namfe-flexible")])]),e._v(" "),s("li",[s("p",[e._v("eslint代码规范\npnpm add eslint -D\nnpm init @eslint/config\n...\n配置.eslintrc")]),e._v(" "),s("p",[e._v("Volar")])]),e._v(" "),s("li",[s("p",[e._v("项目结构")])]),e._v(" "),s("li",[s("p",[e._v("web3调用\nethers.js")])]),e._v(" "),s("li",[s("p",[e._v("打包部署配置")])]),e._v(" "),s("li",[s("p",[e._v("引入UI库\nvant")])])]),e._v(" "),s("h3",{attrs:{id:"页面初始化"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#页面初始化"}},[e._v("#")]),e._v(" 页面初始化")]),e._v(" "),s("ol",[s("li",[e._v("入口"),s("code",[e._v("App.vue")]),e._v(": 钱包授权，链接钱包，获取钱包账户地址"),s("code",[e._v("userAddress")]),e._v("；如果没有安装钱包则弹窗提示安装钱包；\n"),s("ul",[s("li",[e._v("如果不是"),s("code",[e._v("/welcome")]),e._v("欢迎页，则执行"),s("code",[e._v("pageInit")]),e._v("：调获取合约接口 》用户信息接口 》调新人引导步骤接口；"),s("code",[e._v("210003")]),e._v("则跳至注册页；")]),e._v(" "),s("li",[e._v("如果是"),s("code",[e._v("/welcome")]),e._v("欢迎页，则无操作；用户点击【进入】，则执行上述"),s("code",[e._v("pageInit")]),e._v("逻辑，全部调用成功则跳至"),s("code",[e._v("/home/office")]),e._v("页；")])])]),e._v(" "),s("li",[s("code",[e._v("/login")]),e._v("页面：注册成功，则执行上述"),s("code",[e._v("pageInit")]),e._v("逻辑，更新数据，进入"),s("code",[e._v("home/office")]),e._v("页面；")]),e._v(" "),s("li",[s("code",[e._v("home/office")]),e._v("页面："),s("code",[e._v("layout/index.vue")]),e._v("判断如果还是新人身份，弹窗引导 》 获取盲盒")])]),e._v(" "),s("h2",{attrs:{id:"测试部署"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#测试部署"}},[e._v("#")]),e._v(" 测试部署")]),e._v(" "),s("ul",[s("li",[s("p",[e._v("新建gitlab仓库，"),s("code",[e._v("git push")]),e._v("推送代码；")])]),e._v(" "),s("li",[s("p",[e._v("nginx添加配置；")])]),e._v(" "),s("li",[s("p",[s("code",[e._v("vite.config.ts")]),e._v("中修改配置;")])]),e._v(" "),s("li",[s("p",[s("code",[e._v("package.json")]),e._v("中添加部署命令"),s("code",[e._v("deploy")]),e._v("：")])]),e._v(" "),s("li",[s("p",[e._v("接着"),s("code",[e._v("npm run build")]),e._v("打包；"),s("code",[e._v("npm run deploy")]),e._v("部署，选择测试机器, 部署~")])]),e._v(" "),s("li",[s("p",[e._v("whistle 中添加代理")])]),e._v(" "),s("li",[s("p",[e._v("浏览器访问")])])]),e._v(" "),s("h2",{attrs:{id:"上线"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#上线"}},[e._v("#")]),e._v(" 上线")]),e._v(" "),s("ul",[s("li",[s("p",[e._v("npm run build")])]),e._v(" "),s("li",[s("p",[e._v("npm run publish")])]),e._v(" "),s("li",[s("p",[e._v("上线平台操作上线，模板给后端，后端给一个地址")])])]),e._v(" "),s("p",[e._v("线上访问")]),e._v(" "),s("h2",{attrs:{id:"问题记录"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#问题记录"}},[e._v("#")]),e._v(" 问题记录")]),e._v(" "),s("h3",{attrs:{id:"配置报错记录"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#配置报错记录"}},[e._v("#")]),e._v(" 配置报错记录")]),e._v(" "),s("ul",[s("li",[e._v("链上执行写入操作"),s("code",[e._v("writeGreeting")]),e._v("时报错：")])]),e._v(" "),s("div",{staticClass:"language-js extra-class"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[e._v("MetaMask "),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token constant"}},[e._v("RPC")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[e._v("Error")]),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),e._v("ethjs"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("query"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("while")]),e._v(" formatting outputs "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("from")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token constant"}},[e._v("RPC")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('\'{"value":{"code":-32603,"data":{"code":-32000,"message":"Nonce too high. Expected nonce to be 0 but got 4. Note that transactions can\'')]),e._v("t be queued when automining"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('","')]),e._v("data"),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('":{"')]),e._v("message"),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('":"')]),e._v("Nonce too high"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v(" Expected nonce to be "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("0")]),e._v(" but got "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("4.")]),e._v(" Note that transactions can't be queued when automining"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v('"'),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),s("blockquote",[s("p",[e._v("钱包换个账户就可以，一会儿又不行了...暂时无解...")])]),e._v(" "),s("p",[e._v("解决方案：点击钱包 》点击右上角头像 》设置 》 高级 》 【自定义交易 nonce】打开，这样下次交易时手动输入nonce即可；或者选择【重设账户】")]),e._v(" "),s("p",[s("a",{attrs:{href:"https://blog.csdn.net/cljdsc/article/details/118196287",target:"_blank",rel:"noopener noreferrer"}},[e._v("以太坊nonce详解"),s("OutboundLink")],1)]),e._v(" "),s("ul",[s("li",[s("code",[e._v("npm run dev")]),e._v("报错："),s("code",[e._v("13:41:15 [vite] Internal server error: node.getIterator is not a function")])])]),e._v(" "),s("blockquote",[s("p",[e._v("将 "),s("code",[e._v("postcss-px2rem-exclude")]),e._v(" 换成 "),s("code",[e._v("postcss-px2rem")])])]),e._v(" "),s("ul",[s("li",[e._v("安装eslint后，保存ts文件编辑器报错："),s("code",[e._v("Invalid Options: 'plugins' doesn't add plugins to configuration to load. Please use the 'overrideConfig.plugins' option instead.")])])]),e._v(" "),s("blockquote",[s("p",[e._v("打开vcode的settings.json文件：")])]),e._v(" "),s("div",{staticClass:"language-json extra-class"},[s("pre",{pre:!0,attrs:{class:"language-json"}},[s("code",[e._v("  "),s("span",{pre:!0,attrs:{class:"token property"}},[e._v('"eslint.options"')]),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v('//     "plugins": [')]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v('//       "html"')]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("//     ]")]),e._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n")])])]),s("ul",[s("li",[e._v("eslint报错："),s("code",[e._v("Parsing error: '>' expected")])])]),e._v(" "),s("blockquote",[s("p",[e._v(".eslintrc修改如下：")])]),e._v(" "),s("div",{staticClass:"language-json extra-class"},[s("pre",{pre:!0,attrs:{class:"language-json"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// 'parserOptions': {")]),e._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("//     'ecmaVersion': 'latest',")]),e._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("//     'parser': '@typescript-eslint/parser',")]),e._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("//     'sourceType': 'module'")]),e._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// },")]),e._v("\n    'parser'"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" 'vue-eslint-parser'"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    'parserOptions'"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("'parser'"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("'@typescript-eslint/parser'"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n")])])]),s("h3",{attrs:{id:"开发报错记录"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#开发报错记录"}},[e._v("#")]),e._v(" 开发报错记录")]),e._v(" "),s("ul",[s("li",[e._v("项目开发中，提示"),s("code",[e._v("Maximum recursive updates exceeded in component <van-dropdown-menu>.....")])])]),e._v(" "),s("blockquote",[s("p",[e._v("将组件"),s("code",[e._v(":class=")]),e._v("去掉")])]),e._v(" "),s("ul",[s("li",[s("code",[e._v("flex: 1")]),e._v("父元素宽度撑开")])]),e._v(" "),s("blockquote",[s("p",[e._v("父元素设置"),s("code",[e._v("overflow:hidden")]),e._v("，如有溢出隐藏设置"),s("code",[e._v("width: 100%")])])]),e._v(" "),s("ul",[s("li",[e._v("提示: "),s("code",[e._v("[@vue/compiler-sfc] the >>> and /deep/ combinators have been deprecated. Use :deep() instead.")])])]),e._v(" "),s("blockquote",[s("p",[e._v("是因为在 vue3 中已经弃用了 "),s("code",[e._v("/deep/")]),e._v(" （深度选择器） 使用: "),s("code",[e._v(":deep()")])])]),e._v(" "),s("div",{staticClass:"language-less extra-class"},[s("pre",{pre:!0,attrs:{class:"language-less"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// 之前这样写")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token selector"}},[e._v("/deep/ .class")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// 现在的写法")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token selector"}},[e._v(":deep(.class)")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),s("ul",[s("li",[s("code",[e._v("vant-list")]),e._v("初始化时一直加载"),s("code",[e._v("onLoad")])])]),e._v(" "),s("blockquote",[s("p",[e._v("将外层容器高度设置为:"),s("code",[e._v("height: 100vh")])])]),e._v(" "),s("h3",{attrs:{id:"合约相关问题记录"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#合约相关问题记录"}},[e._v("#")]),e._v(" 合约相关问题记录")]),e._v(" "),s("ul",[s("li",[e._v("调链上合约方法时报错：")])]),e._v(" "),s("div",{staticClass:"language-shell extra-class"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[e._v("code: -32603\nmessage: "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"execution reverted: ERC20: transfer amount exceeds balance"')]),e._v("\n")])])]),s("blockquote",[s("p",[e._v("交易金额超出余额，应该是账户余额不够了~")])]),e._v(" "),s("ul",[s("li",[e._v("metamask连接私链错误："),s("code",[e._v("could not fetch chain ID. Is your RPC URL correct?")])])]),e._v(" "),s("h3",{attrs:{id:"兼容性问题记录"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#兼容性问题记录"}},[e._v("#")]),e._v(" 兼容性问题记录")]),e._v(" "),s("ul",[s("li",[e._v("ios时间展示问题："),s("code",[e._v("new Date('2022/01/01 00:00:00')")])])]),e._v(" "),s("blockquote",[s("p",[e._v("在ios浏览器上不能解析"),s("code",[e._v("new Date('2022-01-01 00:00:00')")]),e._v("格式~")])]),e._v(" "),s("ul",[s("li",[e._v("ios中 van-popup 组件 层级遮挡问题")])]),e._v(" "),s("blockquote",[s("p",[e._v("设置"),s("code",[e._v('teleport="body"')]),e._v(",挂载在 body 上")])]),e._v(" "),s("ul",[s("li",[e._v("iphone12图片只设置"),s("code",[e._v("max-width: 100%")]),e._v("会拉伸")])]),e._v(" "),s("blockquote",[s("p",[s("code",[e._v("max-width")]),e._v("设置确定的大小")])]),e._v(" "),s("ul",[s("li",[e._v("ios浏览器中单页面跳转会有缓存")])]),e._v(" "),s("h2",{attrs:{id:"记录"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#记录"}},[e._v("#")]),e._v(" 记录")]),e._v(" "),s("ul",[s("li",[s("s",[e._v("Toast提示位置")])]),e._v(" "),s("li",[e._v("骨架屏")]),e._v(" "),s("li",[e._v("图片懒加载占位图")]),e._v(" "),s("li",[e._v("~重定向路由~~")]),e._v(" "),s("li",[e._v("ios刘海屏问题处理")]),e._v(" "),s("li",[e._v("代码整理")]),e._v(" "),s("li",[e._v("列表滚动加载更多")]),e._v(" "),s("li",[s("s",[e._v("【发电厂】滚动渐变效果")])]),e._v(" "),s("li",[e._v("【新手引导】")]),e._v(" "),s("li",[e._v("交易详情页面跳转，调起钱包")]),e._v(" "),s("li",[e._v("封装接口请求")]),e._v(" "),s("li",[e._v("h5页面测试")]),e._v(" "),s("li",[e._v("点赞数展示优化: 999+")]),e._v(" "),s("li",[e._v("列表-详情 跳转位置缓存")]),e._v(" "),s("li",[e._v("$toast与$dialog交互冲突问题，授权提示优化?")])]),e._v(" "),s("h2",{attrs:{id:"总结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[e._v("#")]),e._v(" 总结")]),e._v(" "),s("ul",[s("li",[s("p",[e._v("每一笔链上的交易都会生成一条记录")])]),e._v(" "),s("li",[s("p",[e._v("后端把合约部署到链上后，会给一个ip地址，MetaMask钱包上添加该网络，连接，就能在自己的账户下看到还有多少ETH；前端通过"),s("code",[e._v("ethers.js")]),e._v("连接上钱包，再通过后端给的一个合约地址和合约ABI，就能生成合约实例，连接上该网络，就可以调用该网络上的合约方法了~")])]),e._v(" "),s("li",[s("p",[e._v("后端启动服务后会有一个ip地址，如："),s("code",[e._v("http://10.182.10.193:1234")]),e._v("，MetaMask钱包中添加网络，链id填"),s("code",[e._v("9215")]),e._v("，保存，之后就可以通过钱包访问这个网络下的合约了（后端好像可以给该网络添加部分测试ETH，会自动加到当前账户？）；")])]),e._v(" "),s("li",[s("p",[e._v("具体怎么访问呢，前端通过"),s("code",[e._v("ethers.js")]),e._v("连接上钱包，再通过后端给的一个合约地址和合约ABI，就能生成合约实例，连接上该网络，就可以调用该网络上的合约方法了~")])]),e._v(" "),s("li",[s("p",[s("a",{attrs:{href:"https://remix.ethereum.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("remix"),s("OutboundLink")],1),e._v("的合约如何部署钱包？")]),e._v(" "),s("ol",[s("li",[e._v("先找一个有足够余额的账户：启动 Gache 软件，选择 quick start, 会自动生成10个账户，每个账户100ETH；且生成RPC SERVER："),s("code",[e._v("HTTP://127.0.0.1:7545")])]),e._v(" "),s("li",[e._v("钱包中添加以上网络，链id填1337, 之后导入账户，上面10个选一个就行，导入私钥；")]),e._v(" "),s("li",[e._v("remix中合约开发完成，选择"),s("code",[e._v("Inject web3")]),e._v(",会自动加载出MetaMask的当前账户，第一次加载时钱包会弹框：是否确认连接"),s("code",[e._v("emix.ethereum.org")]),e._v("？选择当前账户，连接即可；之后点击"),s("code",[e._v("Deploy")]),e._v("部署，调起钱包，确认，即完成部署；部署完成后会在remix界面的"),s("code",[e._v("Deployed Contracts")]),e._v("看到部署后的详情，能看到部署后的"),s("strong",[e._v("合约地址")]),e._v("；")]),e._v(" "),s("li",[e._v("之后前端添加合约地址和合约ABI，即可调用该合约的方法~")])]),e._v(" "),s("blockquote",[s("p",[s("a",{attrs:{href:"https://segmentfault.com/a/1190000040657797",target:"_blank",rel:"noopener noreferrer"}},[e._v("Remix开发部署智能合约"),s("OutboundLink")],1),e._v("、"),s("a",{attrs:{href:"https://blog.csdn.net/qq_40261606/article/details/123249473",target:"_blank",rel:"noopener noreferrer"}},[e._v("使用Ganache，web3js和remix在个人区块链上部署并调用合约"),s("OutboundLink")],1)])])]),e._v(" "),s("li",[s("p",[e._v("以太坊线上网络、Ganache启动后的本地测试网络（http://127.0.0.1:7545）、hardhat项目启动服务后的本地测试网络（http://127.0.0.1:8545）、公司自己的 chain测试网络（http://xx.xx.xx.xx）;在每个网络下进行的交易只能在该网络下进行查询；Ganache和hardhat启动的本地测试网络都会生成一些有eth的测试账号方便开发使用；")])])]),e._v(" "),s("h3",{attrs:{id:"ethers学习笔记"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#ethers学习笔记"}},[e._v("#")]),e._v(" ethers学习笔记")]),e._v(" "),s("blockquote",[s("p",[e._v("Ethers.js 是一个 JavaScript 库，其作用是使开发者可以与以太坊区块链进行交互。该库包含 JavaScript 和 TypeScript 中的实用程序函数，以及以太坊钱包的所有功能。")])]),e._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[e._v("ethers.js 有四个模块，构成应用程序编程界面 (API)。")]),e._v(" "),s("ul",[s("li",[s("code",[e._v("Ethers.provider")]),e._v("：封装与以太坊区块链的连接。它可以用于签发查询和发送已签名的交易，这将改变区块链的状态。")]),e._v(" "),s("li",[s("code",[e._v("Ethers.contract")]),e._v("：部署智能合约并与它交互。具体来说，该模块中的函数用于侦听从智能合约发射的事件、调用智能合约提供的函数、获取有关智能合约的信息，以及部署智能合约。")]),e._v(" "),s("li",[s("code",[e._v("Ethers.utils")]),e._v("：提供用于格式化数据和处理用户输入的实用程序函数。")]),e._v(" "),s("li",[s("code",[e._v("Ethers.wallets")]),e._v("：使你可以与现有钱包（以太坊地址）建立连接、创建新钱包以及对交易签名。")])])]),e._v(" "),s("ul",[s("li",[s("p",[s("code",[e._v("Provider = new ethers.providers.Web3Provider(window.ethereum)")]),e._v("：Provider（在ethers中）是一个为以太坊网络连接提供抽象的类。它提供对区块链及其状态的只读访问。")])]),e._v(" "),s("li",[s("p",[s("code",[e._v("signer = Provider.getSigner()")]),e._v(": 签名者是一个（通常）以某种方式直接或间接访问私钥的类，它可以签署消息和交易以授权网络向您的帐户收取以太币，执行操作。")])]),e._v(" "),s("li",[s("p",[s("code",[e._v("Contract = new ethers.Contract(contractAddress, abi, signer)")]),e._v(": 合约是一种抽象，表示与以太坊网络上特定合约的连接，因此应用程序可以像使用普通 JavaScript 对象一样使用它。")])])]),e._v(" "),s("h2",{attrs:{id:"todo"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#todo"}},[e._v("#")]),e._v(" TODO")]),e._v(" "),s("ol",[s("li",[e._v("\b链上接口调用梳理, ethers.js使用熟悉\n"),s("ul",[s("li",[e._v("TX HASH, BLOCK HASH, BLOCK, gas, gas limit, GAS USED, eth, wei, USD")]),e._v(" "),s("li",[e._v("每次交易都会生成新的"),s("code",[e._v("BLOCK")]),e._v(", 生成新的的交易哈希"),s("code",[e._v("TX HASH")]),e._v("，区块哈希"),s("code",[e._v("BLOCK HASH")])])])]),e._v(" "),s("li",[e._v("翻墙")]),e._v(" "),s("li",[e._v("博客笔记，公众号")]),e._v(" "),s("li",[e._v("移动端代理配置")]),e._v(" "),s("li",[e._v("eslint强校验取消")]),e._v(" "),s("li",[e._v("vue3，ts用法总结，vue3周边生态整理")]),e._v(" "),s("li",[e._v("打包部署")]),e._v(" "),s("li",[e._v("whistle")])]),e._v(" "),s("h3",{attrs:{id:"第二期"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#第二期"}},[e._v("#")]),e._v(" 第二期")]),e._v(" "),s("ul",[s("li",[e._v("交易不走metamask：web3.js 生成账户，私钥，助记词，用户输入密码，加密生成秘钥")])]),e._v(" "),s("fix-link",{attrs:{label:"Back",href:"/more/web3/"}})],1)}),[],!1,null,null,null);t.default=v.exports}}]);