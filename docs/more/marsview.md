---
title: marsview梳理
date: 2024-11-13 21:15:21
# permalink: false # 0b758e/
article: false
categories: 
  - null
tags: 
  - null
permalink: false # e82559/
---


# marsview梳理


## 编辑端 editor

- RBAC
> 基于角色的权限访问控制(Role-Based Access Control)作为传统访问控制(自主访问，强制访问)的有前景的代替受到广泛的关注。在RBAC中，权限与角色相关联，用户通过成为适当角色的成员而得到这些角色的权限

### 项目

- 新建项目：名称、描述、logo、权限（公开、私有）

- **项目配置**：

  - `常规配置`：基础配置（名称、描述、logo）、系统配置：（布局、主题色、...）、权限配置（访问权限、开发权限）
    - 开发权限可通过邮箱添加开发者、体验者，但该邮箱需在用户列表中已添加
  - `菜单管理`：
    - 创建菜单：父级菜单、菜单类型（菜单、按钮、页面）、名称、图标、排序、....
    - 菜单创建成功后，可在当前菜单下添加子菜单
    - 可获取页面列表，绑定已创建的页面；
  - `角色管理`：可创建不同的角色，并给角色分配菜单权限，如超管、rd、pm...
  - `用户管理`：可通过邮箱添加用户，并给用户分配角色


::: tip
1. 权限管理流程： `创建菜单 => 创建角色 => 分配菜单权限 => 添加用户 => 给用户分配角色`
2. 目前提供 `测试、预发、生产` 三个环境进行项目访问，具体展示逻辑在`访问端`
:::



### 页面

- 创建页面：名称、描述、权限（公开/私有）、模式（编辑/查看）

- **页面编辑**：页面编辑页是一个低码配置页面，左侧编辑器菜单区，中间画布区，右侧属性配置区（编辑器操作相关数据用`usePageStore`全局存储）
    
    - **顶部工具栏**：源码、保存、预览、发布（stg, pre, prd）
    
    - **左侧菜单区**：
        - 组件物料：系统组件、自定义组件

        - 页面列表：展示已创建的页面，可编辑、删除、复制（感觉在这里展示其他页面不太必要...）

        - 组件大纲：展示当前页面的整体组件结构（组件树），可拖拽、高亮选中

        - `页面接口`：可添加配置接口信息（接口地址、格式、参数、返回结构配置,...）
            - 接口设置：`name, method, url, params, ...`
            - 返回结构设置：`page.apis.result={...}`
            - 消息提示设置：`page.apis.tips={...}`
            - 页面全局拦截器配置：`page.interceptor={headers:[{...}], timeout,...}`
        
        - `页面变量`：可添加配置变量信息（变量名称、类型（字符串/数字/对象...）、默认值...）

        - 页面成员：可输入邮箱添加页面成员（开发者、体验者）

        - `页面JSON`：展示当前页面的整体json结构，包含`userInfo, page.config, page.apis, ...`等信息
        ``` json
        {
            "userInfo": {...}, // 用户信息
            "page": {
                "pageId":123,
                "pageName": "abc",
                "config": { // 页面配置信息
                    "props": {
                        "theme": "#1677ff",
                    },
                    "style": {...},
                    "scopeCss": "",
                    "scopeStyle": {...},
                    "events": [],
                    "api": {...},
                },
                "events":[...], // 页面事件
                "apis": {...}, // 上面添加的页面接口数据
                "elements": [ // 页面包含的组件
                    {
                        "id": "Button_6yliieg2ze",
                        "parentId": "FormItem_eqt9kkyr3f", // 父组件
                        "type": "Button",
                        "name": "按钮",
                        "elements": [] // 子组件
                    },
                ],
                "elementsMap": { // 页面包含的所有组件详细配置信息
                    "Button_6yliieg2ze": {
                        "type": "Button",
                        "name": "按钮",
                        "parentId": "FormItem_eqt9kkyr3f",
                        "id": "Button_6yliieg2ze",
                        "config": { // 组件配置信息
                            "props": { // 组件属性配置
                                "text": {
                                    "type": "static",
                                    "value": "重置"
                                },
                                "type": "primary",
                                "shape": "default",
                                "block": false,
                                "ghost": false,
                                "danger": true,
                                "disabled": {
                                    "type": "variable", // 变量
                                    "value": "context.Form_10z7nbs8z9.userName || context.Form_10z7nbs8z9.userPwd ? false : true" // 三元表达式
                                }
                            },
                            "style": {  // 组件样式
                                "opacity": 1
                            },
                            "events": [ // 事件流配置信息
                                {
                                    "nickName": "点击事件",
                                    "eventName": "onClick",
                                    "actions": [ // 事件流信息
                                        {
                                            "id": "start",
                                            "type": "start", // 开始节点
                                            "title": "开始"
                                        },
                                        {
                                            "id": "85113697",
                                            "type": "normal", // 普通节点
                                            "title": "登录重置",
                                            "content": "组件方法",
                                            "config": { // 配置了form组件的表单重置方法
                                                "actionType": "methods",
                                                "actionName": "组件方法",
                                                "target": "Form_10z7nbs8z9",
                                                "method": "reset",
                                                "methodName": "表单重置"
                                            },
                                            "children": []
                                        },
                                        {
                                            "id": "end",
                                            "type": "end", // 结束节点
                                            "title": "结束"
                                        }
                                    ]
                                }
                            ],
                            "scopeCss": "/* 请在此处添加样式*/\n.marsview{\n\n}", // 自定义样式
                            "scopeStyle": { // 样式配置
                                "margin": "0 0 0 20px"
                            },
                            "api": { // 数据接口配置
                                "sourceType": "json",
                                "source": "111"
                            }
                        },
                        "events": [ // 事件集合
                            {
                                "value": "onClick",
                                "name": "点击事件"
                            }
                        ],
                        "methods": [ // 方法集合
                            {
                                "name": "startLoading",
                                "title": "开始loading"
                            },
                            {
                                "name": "endLoading",
                                "title": "结束loading"
                            }
                        ]
                    },
                },
                "variables": [ // 页面配置的变量信息
                    {
                        "name": "userInfo",
                        "type": "object",
                        "defaultValue": {
                            "userId": "",
                            "userName": "",
                            "token": ""
                        },
                        "remark": "登录接口返回信息"
                    }
                ]
                ...
            }
        }
        // 
        ```
    
    - **中间画布区**：展示页面内容，可拖拽、删除、移动、复制组件
        - 页面渲染：事件流处理：`handleActionFlow` => 组件渲染：`MarsRender`

    
    - **右侧属性配置区**：
        - **属性设置**：
            - 展示：组件ID, 页面名称
            - `SetterRender`组件：获取组件的`attrs`，渲染（组件属性、公共属性：组件显隐...）
        > 组件属性根据`type`渲染不同的表单组件，通过 `usePageStore` 中全局方法`editElement`进行修改

        - **样式配置**：
            - 自定义样式（待开发）
            - 基础样式（宽度、高度、边距、填充）
            - 布局、文字、背景、定位、边框...
        > 跟属性配置一样，form表单全局修改

        - **事件配置**：
            - 选中某个组件：`elementsMap[id].config.events: []`；未选中组件，默认配置页面：`page.config.events: []`
            - 事件流：数组结构，存在 `children` 子数组用于分支事件
                - 开始节点、结束节点
                - 条件节点：存在 `成功/失败`两种情况，需要在 `children` 中添加子事件
                - 普通节点：需要在`config`中进行事件行为配置：actionType：行为类型（页面跳转、表单提交、弹窗消息通知、发送请求、变量赋值...）
            > `参数会在事件流中流转，比如点击表格的编辑按钮，事件流默认可以取到表格对应的行数据对象，传递到下一个节点`
        > 跟上面的样式配置一样，添加事件后会通过全局的方法更新到组件上

        - **数据配置**：静态数据、接口请求、动态变量
            - 选中某个组件：`elementsMap[id].config.api: {}`；未选中组件，默认配置页面：`page.config.api: {}`
            - 逻辑编辑器：


- 页面发布记录：可展示发布的历史版本（stg, pre, prd）
    - 可回滚到历史版本
    - 查看页面json数据



### 组件

- 新建组件：组件标志、名称、描述

- **组件开发**：

    - `index.tsx`: 这里主要负责编写react组件的核心代码，
        - 代码编写过程中，会实时保存源码`code`, 同时也会本地缓存源码信息；
        - 同时也会通过`window.esbuild.build`实时编译源码，生成编译后的代码`compileCode`
        - 监听键盘事件，`ctrl+S`的时候通过`prettier`格式化代码；
        - 对外暴露了`getCode, refresh, getCompileCode, writeCode`等方法，方便父组件进行读写代码等操作；

    - `index.less`: 组件样式部分代码，流程跟`inde.tsx`的编写差不多，只不过代码编译时需要引入`less.render`方法放代码编译成`css`代码；

    - `config.js`: 组件配置和属性值，默认需要导出一个模块，手动编写，需要了解json配置规则；
    ``` js
    export default {
        // 组件属性配置JSON，配置完成后，在页面编辑时会在编辑页右侧属性配置区展示
        attrs: [
            {
                type: 'Title',
                label: '基础设置',
                key: 'basic'
            },
            {
                type: 'Input',
                label: '登陆名称',
                name: ['loginBtn']
            },
        ],
         config: {
            // 组件默认属性值
            props: {
                loginBtn: '登陆',
                block: true,
                labelCol: 8,
                wrapperCol: 16,
                offset: 8,
                maxWidth: 700
            },
            // 组件样式
            style: {},
            // 事件
            events: [],
            // 接口
            apis: {},
        },
        // 组件事件
        events: [
            {
            value: 'onClick',
            name: '点击事件',
            },
        ],
        methods: [],
    }
    ```
    > `attrs`手动添加后，在组件画布的右侧会实时展示配置信息~

    - `readme.md`: 组件说明，引入`@bytemd/react`md编辑器组件，据说是掘金官方用的编辑器，再通过引入`@bytemd/plugin-highlight`等plugins实现代码高亮等效果...
    > `ByteMD` 是一个用于 web 开发的 Markdown 编辑器 JavaScript 库，是字节跳动（也就是掘金社区）出品的 Markdown 格式的富文本编辑器

    - 预览：`CompPreview.tsx`
        - 首先在上面`index.less`样式部分实时编译源码时，会把编译后的`css`代码动态插入到`head`标签中；
        - 然后在预览组件中只需要实时获取编译后的react代码`compileCode`，通过Blob对象来创建URL来实现组件预览：
        ``` ts
        const [Component, setComponent] = useState<any>(null);
        // 编译后的代码，通过Blob对象来创建URL
        const blob = new Blob([reactCompile], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const module = await import(url); // import 动态加载url
        setComponent(() => module.default);
        return (
            {Component && <Component />} // 渲染
        )
        ```
        - `config.props`中变量处理`handleBindVariable`；

    - AI助手：调 ai 接口自动生成代码（需要看下后端接口是怎么实现的...），然后调上面编辑器的`writeCode`方法进行代码写入


::: tip
1. 引入vscode web编辑器`@monaco-editor/react`，开发react组件；
2. 引入`esbuild-wasm`cdn，对代码进行编译；需要把`React、dayjs、antd`挂载到`window`上，否则`esbuild`无法编译；
``` ts
// 针对这些第三方库，在 vite.config.ts 配置中线上会单独引入cdn，本地开发则需挂在到window上
import * as antd from 'antd';
useEffect(() => {
    window.antd = window.antd || antd;
  }, []);
```
3. 初始化时会通过接口获取组件配置详情，没有则提供默认的`defaultReactCode`等默认代码字符串；
4. 会通过`prettier`和`prettier/parser-babel`对编写的代码进行格式化；
5. 发布时，通过`md5(reactjs + css + configjs)`生成`releaseHash`进行发布；
:::



### 其他模块

- 页面模板：提供页面模板，用于快速创建页面

- 登录页、欢迎页：
    - 邮箱账号登录
    - 注册

- 图片云：提供图片上传服务，方面开发

- feedback：用户反馈模块，用于收集用户反馈信息
    - 类型：bug、建议、其他
    - 状态：是否被采纳


## 访问端 admin
> 项目在editor端配置完成发布，就可以在访问端进行访问了

该项目目录配置跟常规的 react B端项目差不多，在初始化的时候需要通过`projectId`获取项目配置信息；访问页面时再通过`pageId`获取具体页面配置信息

路由：`https://admin.marsview.com.cn/project/${projectId}/${pageId}`


- 组件渲染：`@materials/MarsRender/MarsRender`
1. 上下文初始化：`initContext`: `window.React = window.React || React`;
2. 加载style样式，生成动态组件，处理表单正则、处理变量、
3. 处理事件，绑定事件流











## materials

系统组件库，发现跟编辑端 `editor/packages` 下的内容一样，admin端渲染页面时需要从该目录引入组件; 包括admin端的渲染页面的一些方法也封装在这个目录下面~

基本上所有关于低代码渲染、逻辑处理相关的代码都在这里吧~


## 文档 docs

vitepress搭建的静态文档~







## 后端

koa搭建的node项目~




## React用法学习笔记

- 防抖hook: `ahook.useDebounceFn`
- 组件缓存：`React.memo`
- vscode web编辑器：`@monaco-editor/react`
- `<Form.Item name={['scopeStyle', 'width']} />`可用于嵌套`scopeStyle.width`字段
- `react.useImperativeHandle`: 子组件向外暴露方法
- 绘制事件流画布组件：`react-infinite-viewer`
- 键盘事件hook: `ahooks.useKeyPress`
- js实现动态加载组件方法`import`
- 状态管理：`zustand`、`immer`, `use-immer`
- ts: `Pick, Omit`
- antd 表单使用: `const [form] = Form.useForm(); form.getFieldValue("name");`
- `react.forwardRef`
- `react-router-dom.useHistory`
- react编辑器画布组件： `react-dnd-html5-backend`，拖拽：`react-dnd`,



## 低码学习笔记


### 物料配置

- 全局定义修改配置方法：`/editor/src/stores/pageStore.ts`，通过`usePageStore`方法更新全局配置；


### 组件渲染

- 组件开发时画布渲染：`CompPreview.tsx`：编译后的代码，通过Blob对象来创建URL；再通过`import`动态导入;


- 页面开发画布渲染/预览渲染：`editor/packages/MarsRender`


- admin展示端渲染：`materials/MarsRender`




### 事件流处理






## 问题记录

- 编辑页左右滑很容易误操作返回，把未保存的数组清空了（拦截返回操作，自动保存草稿）
- 画布点击按钮会执行事件流，画布编辑态时不应该执行事件...
- 样式配置-自定义样式 待开发
- 样式配置-透明度设置 初始化赋值错误
- 编辑器页面拖拽缩放事件有时已经松开鼠标了，还能缩放...
- 登录好像缺少token校验逻辑
- 画布组件跨层级拖拽？新增的组件默认添加到最后一行，需要拖拽到指定位置？



