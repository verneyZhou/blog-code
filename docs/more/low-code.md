---
title: 低代码平台搭建实战
date: 2023-10-25 22:42:23
permalink: false
categories:
  - 低代码
  - React
tags:
  - Nest
  - 低代码
  - React
---


# 低代码平台搭建实战


## 简介

低代码是⼀种软件开发⽅法，团队可借助此⽅法在编写最少量代码的情况下开发数字解决⽅案并创建企业应⽤程序。 低代码开发平台为⽤⼾提供了⼀套⼯具、⾃定义代码组件和样板脚本。 然后，⽤⼾可以⾼效地开发新流程和应⽤程序‒ 所有这些任务都不需要编写⼤量的代码，也不需要执⾏脚本测试。 这些平台提供具有简单拖放功能的可视化开发环境。


[国内低代码平台](https://github.com/taowen/awesome-lowcode)


- 优点：提高开发效率，降低技术门槛，加快迭代发布，提升可维护性可可扩展性，协作性

- 缺点：有限的灵活性，学习曲线和技术依赖，平台限制和依赖，性能和扩展性，数据安全风险





## 分析

> 接下来就直接从0开始，实现一个简单的低代码平台吧~ 开始代码开发之前，先分析下一个简单的低代码平台有哪些部分组成：


**页面核心构成**

- 组件区：提供可以被反复拖拽的组件 
- 设计区：可以将组件拖拽到设计区，并移动位置
- 属性区：可以定制化的配置每一个拖到设计区的组件

<img class="zoom-custom-imgs" :src="$withBase('/images/more/low-code01.png')" width="auto"/>



**组件**

- 可重用性和模块化
- 界面一致性和可定制性
- 交互和事件处理
- 可配置性和可扩展性
- 文档和示例



## 前端项目搭建


> node v16+

- 初始化项目：`npx create-react-app react-low-code`
> react v18+

[React官网](https://zh-hans.react.dev/)



### 拖拽Drag

Q：如何知道拖拽的是哪个组件？
> 拖拽事件中使用 `dataTransfer` 对象来携带一些自定义数据~

[DataTransfer传参](https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer): `DataTransfer.setData()`, `DataTransfer.getData()`

**Drag Events（拖放事件）**
- `dragstart` ：当拖动操作开始时触发，通常在拖动源元素上使用。
- `drag` ：在拖动过程中持续触发，通常在拖动源元素上使用。
- `dragenter` ：当被拖动的元素进入可放置目标时触发，通常在目标元素上使用。
- `dragover` ：当被拖动的元素在可放置目标上方移动时触发，通常在目标元素上使用。需要阻止默认行为才能接受拖放。
- `dragleave` ：当被拖动的元素离开可放置目标时触发，通常在目标元素上使用。
- `drop` ：当被拖动的元素放置在可放置目标上时触发，通常在目标元素上使用。需要阻止默认行为才能接受拖放。
- `dragend` ：当拖动操作结束时触发，无论是成功放置还是取消拖放，通常在拖动源元素上使用。


``` js
import React, { useState } from 'react';

// 拖拽组件
const DraggableElement = ({ id, text }) => {
  const [isDragging, setIsDragging] = useState(false);
  // 拖拽开始
  const handleDragStart = (event) => {
    // setData 向本次的拖拽 注入信息    
    event.dataTransfer.setData('text/plain', id);
    setIsDragging(true);
  };
  // 拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
  };
 
  // 只有配置了draggable属性的元素 才可以被拖拽   
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {text}
    </div>
  );
};
export default DraggableElement;



/**
 * 可放置目标元素
 */

// 当被拖动的元素在可放置目标上方移动时触发，通常在目标元素上使用。需要阻止默认行为才能接受拖放。
const handleDragOver = (e) => {
    e.preventDefault()
}

// 拖拽释放：当被拖动的元素放置在可放置目标上时触发，通常在目标元素上使用
const handleDrop = (e) => {
   const componentId = e.dataTransfer.getData() // 获取本次拖拽信息
   const emptyComponentData = compDic[componentId];
   // push到⻚面总JSON data中
   ...
   
}
<div onDrop={handleDrop} onDragOver={handleDragOver}></div>
```



社区拖拽库：
- [https://github.com/atlassian/react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd)
- [https://react-dnd.github.io/react-dnd/about](https://react-dnd.github.io/react-dnd/about)
- [https://github.com/react-grid-layout/react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- [https://craftft.js.org/](https://craftft.js.org/)


### 数据设计

我们需要一套统一的数据，用于承载页面信息 JSON parse


参考：`Vue: renderElement('div', {}, [children])` => `renderElement('div', {class: 'xxx', width: 'xxx'}, [])`


- 模板数据结构:

``` json
// jsonData
{
  "title": "低代码平台",
  "author": "xxx",
  // ... 
  "components": [
    {
      "type": "Button",
      "props": {
        "text": "Click me"
      },
      "children": []
    },
    {
      "type": "Input",
      "props": {
        "placeholder": "Enter your name"
      },
      "children": []
    }
  ]
}
```

- 实现示例：

``` js
import React from 'react';
// 示例按钮组件 
const Button = ({ text }) => {
  return <button>{text}</button>;
};

// 示例输入框组件 
const Input = ({ placeholder }) => {
  return <input type="text" placeholder={placeholder} />;
};

// 组件映射 
const componentMapping = {
  Button,
  Input
};

// ⻚面组件 
const Page = ({ title, components }) => {
  return (
    <div>
      <h1>{title}</h1>
      {components.map((component, index) => {
        const Component = componentMapping[component.type];
        return <Component onDrop={() => handleDrop(component.id)} key={index} {...component.props} />;
      })}
    </div>
  );
};

// 应用程序 
const App = () => {
  const jsonData = {
    // JSON数据   
  };
  return <Page title={jsonData.title} components={jsonData.components} />;
};
export default App;
```

Q: 组件区如何能知道我的组件库里面有哪些组件？
> 在 `components` 的根目录下 创建 `index.js` 并`export`

Q：组件的样式如何通过`prop`控制？
> 将`styles`也作为`props`传入进组件







### tailwindcss安装

[tailwindcss](https://tailwindcss.com)


- 安装
```
npm install -D tailwindcss

npx tailwindcss init
```

- 配置`tailwind.config.js`


- `src.index.css`添加：
``` css
@tailwind base;
@tailwind components;
@tailwind utilities;
```


### antd组件

[Antd组件官网](https://ant.design/components/overview-cn/)


- 安装：`npm install antd -S`


### 拖拽排序

[SortableJS](https://github.com/SortableJS/react-sortablejs)


- 安装：`npm install --save react-sortablejs sortablejs -S`


## Echart表格

[Echart](https://github.com/hustcc/echarts-for-react)


- 安装：`npm install echarts-for-react echarts -S`





## 后端部分

> 在这个项目中，我需要用到CRUD这类增删改查的接口，相对来讲算是比较简单的接口操作；还需要一个数据库来存储创建的模板列表；如果真的单独开发一个后端项目来只做增删改查，有点大材小用了，而且也比较复杂，需要搭建服务器，搭建数据库，写接口...等等


所以这里接口部分我采用`Serverless`方案，而`Vercel` 又提供了 `Serverless Function`，我不需要关心服务器的购买配置等等流程，只关心接口开发；用vercel部署`Serverless Api`，不购买云服务器也能拥有自己的动态网站；

数据库上我选择引入[MongoDB的云数据库](https://cloud.mongodb.com)，个人用户有512M免费存储额度，完全够自己开发个人项目了~


关于Vercel的部署、如何添加Serverless接口、如何配置MongoDB云数据库，我整理在这篇博文[Vercel部署笔记](/more/vercel-deploy.html)里了，很详细，这里不再赘述~


### 添加 Serverless接口

> 由于 Vercel 支持Serverless 接口的部署，所以我们在开发时，只需要开发相应接口，然后通过 `vercel`来进行本地调试或部署~


- 接口开发：根目录下新建`api/`文件夹，添加接口文件，如：`getTempList.js`;

- 本地调试：`vercel dev --listen 3000`, 可指定端口号；运行起来后，访问`http://localhost:3000/api/getTempList`就可以访问到接口了；

> 这样就可以一边开发前端页面，一边开发接口了~



### 添加MongoDB云数据库


> 这里不讲MongoDB数据库的添加和配置了，上面那篇笔记里都有，这里假设已经配置好云数据库，并已连接~

- 安装：`npm i mongodb`

- 接口中连接数据库，完整代码如下：

``` js
// api/getTempList.js

import { MongoClient } from 'mongodb';
import DB from '../db/config.js';

export default async function (req, res) {
    // 连接MongoDB
    const client = await MongoClient.connect(DB.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        const db = await client.db(DB.database); // 获取数据库
        const list = await db.collection(DB.collection); // 获取集合
        const result = await list.find({}).toArray(); // 获取集合中的所有数据
        console.log('===getlist===result', result);
        res.status(200).json({
            code: 200,
            msg: 'success',
            data: [...(result || [])],
        });
    } catch (err) {
        console.log('===getlist===err', err);
        res.status(400).json({
            code: 400,
            msg: JSON.stringify(err),
        });
    } finally {
        client.close(); // 关闭连接
    }
}

```
> 上述就是一个获取模板列表的接口~


接口部分开发完成后再前端页面中调用也是跟普通接口调用一样：

``` js
axios.get(`/api/getTempList`).then((res) => {
    console.log('====res', res)
    let {data = []} = res.data
    console.log('====data', data)
}).catch((err) => {})
```


### Vercel部署

> 项目开发完毕，本地调试没问题，就可以准备部署了~ 这里采用Vercel部署，简单又好用~


- 根目录新建`.github/workflows/deloy.yml`文件，利用 `Git Actions` 实现自动部署；
> 这里需要提前配置好 vercel 部署需要的 Token, ProjectId这些参数，具体配置流程这篇博文[Vercel部署笔记](/more/vercel-deploy.html)里都有说明~

- 之后`main`分支`git push`提交到github上，就会自动执行`deploy.yml`脚本，自动部署到vercel了~!




## 项目目录结构

``` js

├── .github/workflows/deploy.yml    // 自动部署脚本
├── .vercel/      // 当执行 vercel 命令时会生成，会生成projectId和orgId
├── api/        // serverless 接口目录
├── build/      // 打包产物
├── db/         // mongodb数据库配置参数
├── public/     // 入口
└── src/        // 前端页面代码
    ├── components/     // 公共组件目录
        ├── Header     // 页面头部区域
        ├── Material   // 左侧组件素材区
        ├── Editor     // 中间画布区
        ├── Config     // 右侧组件属性配置区
    ├── materials/      // 组件库：包含组件和组件可配置属性
        ├── Button/    // 按钮组件
        ├── Text/      // 文本组件
        ├── ...
        ├── index.js   // 组件导出文件
    ├── pages/          // 页面
    ├── store/         // 全局数据管理
    ├── App.css
    ├── App.js // 入口
    ├── index.css
    ├── index.js // 入口
├── velcel.json // velcel 配置文件, 可覆盖默认的接口配置
├── tailwind.config.ts // tailwindcss 配置文件
└── package.json

```

 **报错记录**

- `vercel --prod`报错：`Command "react-scripts build" exited with 127`

> vercel的`Root Directory`配置问题，参考：[https://github.com/vercel/next.js/discussions/40733](https://github.com/vercel/next.js/discussions/40733)







## 备注


- 项目Github地址：[react-low-code](https://github.com/verneyZhou/reac-low-code)
- vercel访问地址：[react-low-code-seven.vercel.app](https://react-low-code-seven.vercel.app/)
> 注：该项目只实现了低代码平台的核心逻辑，UI上肯定比不上其他成熟的产品，后续可以再优化~



### Undo 、 Redo

> 实现思路：操作历史记录栈用一个数组来保存编辑器的快照数据。保存快照就是不停地执行 `push()` 操作，将当前的编辑器数据推入 `snapshotData` 数组，并增加快照索引 `snapshotIndex` 。

目前以下几个动作会触发保存快照操作：
- 新增组件
- 删除组件
- 改变图层层级
- 拖动组件结束时


1. 全量快照存储: 速度快，但是对存储空间占用极大
2. ChangeSet存储: 依赖更复杂的changeset生成及解析逻辑


## 参考




