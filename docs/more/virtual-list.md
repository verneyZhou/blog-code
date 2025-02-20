---
title: 关于虚拟列表的组件封装
date: 2025-01-20 15:10:04
permalink: false
categories:
  - 虚拟列表
  - 组件库
tags:
  - 虚拟列表
  - 组件库
---

# 关于虚拟列表的组件封装



## 前言

> 接口如果返回大量数据，一次性渲染，非常容易造成卡顿、卡死的情况。

**Q：前端如何高性能渲染长列表数据？**

前端渲染这种列表叫做长列表渲染，处理长列表渲染有两种方式：`分片渲染和虚拟列表`

### 分片渲染
> 页面的卡顿是由于同时渲染大量DOM所引起的，所以我们考虑将渲染过程分批进行，即分片渲染。

简单的说就是一个执行完再执行下一个，其思想是`建立一个队列，通过定时器来进行渲染`，比如说一共有3次，先把这三个放入到数组中，当第一个执行完成后，并剔除执行完成的，在执行第二个，直到全部执行完毕，渲染队列清空。

分片渲染就是依次渲染，将庞大的数据切分开，然后按顺序依次渲染。


- 一个简单的分片渲染示例：
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>时间分片demo</title>
</head>
<body>
    <ul id="container"></ul>
</body>
<script>
    //需要插入的容器
let ul = document.getElementById('container');
// 插入十万条数据
let total = 100000;
// 一次插入 20 条
let once = 20;
//总页数
let page = total/once
//每条记录的索引
let index = 0;
//循环加载数据
function loop(curTotal,curIndex){
    if(curTotal <= 0){
        return false;
    }
    //每页多少条
    let pageCount = Math.min(curTotal , once);
    // setTimeout：执行时间不确定，需等到下一次Event Loop执行，可能跟浏览器屏幕刷新频率(1000/60)ms不一致，可能造成丢帧、频闪等问题
    // setTimeout(()=>{
    //     for(let i = 0; i < pageCount; i++){
    //         let li = document.createElement('li');
    //         li.innerText = curIndex + i + ' : ' + ~~(Math.random() * total)
    //         ul.appendChild(li)
    //     }
    //     loop(curTotal - pageCount,curIndex + pageCount)
    // },0)

    // requestAnimationFrame：执行时间确定，跟浏览器屏幕刷新频率一致，不会丢帧
    window.requestAnimationFrame(()=>{
        let fragment = document.createDocumentFragment(); // 创建一个文档片段，减少回流次数
        for(let i = 0; i < pageCount; i++){
            let li = document.createElement('li');
            li.innerText = curIndex + i + ' : ' + ~~(Math.random() * total)
            // ul.appendChild(li)
            fragment.appendChild(li) // 将子元素插入到文档片段时不会引起页面回流
        }
        ul.appendChild(fragment)
        loop(curTotal - pageCount,curIndex + pageCount)
    })
}
loop(total,index);

</script>
</html>
```


- [DocumentFragment](https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment)
> 轻量版的 Document，就像标准的 document 一样，存储由节点（nodes）组成的文档结构。与 document 相比，最大的区别是它不是真实 DOM 树的一部分，它的变化不会触发 DOM 树的重新渲染，且不会对性能产生影响。


参考：[「前端进阶」高性能渲染十万条数据(时间分片)](https://juejin.cn/post/6844903938894872589)




### 虚拟列表
> 对于DOM结构比较简单的，可以使用时间分片的方式来对长列表进行渲染，但是对于DOM结构比较复杂的的长列表，这种方式就不太适用了~

- 虚拟列表（Virtual List）是一种前端技术，用于优化长列表的渲染性能。
> 实际上是一种实现方案，只对可视区域进行渲染，对非可视区域中的区域不渲染或只渲染一部分（渲染的部分叫缓冲区，不渲染的部分叫虚拟区），从而达到极高的性能。


虚拟列表是一种优化长列表渲染性能的技术，`通过只渲染可视区域内的元素来减少DOM操作和内存消耗`。在前端开发中，特别是在处理大量数据时，使用虚拟列表可以显著提升页面加载速度和滚动流畅度。



**Q：为什么要封装一个虚拟列表的组件？**

1. **复用性**：将虚拟列表的功能封装成可重用的组件，可以在多个项目中快速应用，提高开发效率。
2. **维护性**：统一的组件封装有助于代码的管理和维护，便于后续升级和功能扩展。
3. **灵活性**：通过参数配置或插槽等方式提供灵活的使用方式，满足不同场景下的需求。
4. **学习与分享**：封装过程中对虚拟列表的理解和实现可以作为技术积累，也可以作为开源项目与其他开发者共享。




## 实现

### 固定高度

- 画个图：

<img class="zoom-custom-imgs" :src="$withBase('/images/more/virtual01.png')" width="auto"/>

- **滚动容器** 为一般为一个固定高度的最外层容器，方便列表内容滚动时产生滚动条；
- **内容容器** 是高度跟所有列表内容适配的一个动态高度容器；
- **可视区域** 的高度是滚动容器的高度，可视区域的起始偏移量是滚动条滚动的距离；
- **偏移量scrollTop** = 滚动条滚动的距离，通过`scrollTop`计算出当前可视区域起始偏移量`startIndex`；


1. 在首屏加载的时候，只加载可视区域内需要的列表项；
2. 当滚动发生时，监听`滚动容器`的滚动事件，通过计算获得可视区域内的列表项，并将非可视区域内存在的列表项删除；

- 计算当前可视区域起始数据索引(startIndex)  
- 计算当前可视区域结束数据索引(endIndex)  
- 计算当前可视区域的数据，并渲染到页面中  
- 计算 startIndex 对应的数据在整个列表中的偏移位置 startOffset 并设置到列表上



``` tsx
// VirualList.tsx

import classNames from 'classnames';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import './style.scss';

interface VirtualListProps {
    // 列表数据
    data: any[];
    // 可视区域高度
    visibleHeight: number;
    // 每项的高度
    itemHeight: number;
    // 渲染每一项的函数
    renderItem: (item: any, index: number) => React.ReactNode; // 渲染每一项的函数
    wrapperClass?: string; // 容器样式
    wrapperStyle?: React.CSSProperties; // 容器样式
    bufferSize?: number; // 缓冲区大小
}

export const VirtualList: React.FC<VirtualListProps> = ({
    wrapperClass = '',
    wrapperStyle = {},
    data,
    itemHeight,
    visibleHeight,
    renderItem,
    bufferSize = 3,
}) => {
    // 可视区域能显示的item数量
    const visibleCount = Math.ceil(visibleHeight / itemHeight);
    // 用于获取滚动容器的ref
    const containerRef = useRef<HTMLDivElement>(null);
    // 起始索引
    const [startIndex, setStartIndex] = useState(0);

    // 监听滚动事件
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const newStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize); // 计算起始索引
            setStartIndex(newStartIndex);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [itemHeight]);

    // 计算需要渲染的数据片段
    const endIndex = useMemo(() => {
        const _buffer = startIndex <= 0 ? bufferSize + 1 : bufferSize * 2; // 计算缓冲区
        return Math.min(startIndex + visibleCount + _buffer, data.length);
    }, [data, startIndex, visibleCount, bufferSize]);
    // 计算需要渲染的数据片段
    const visibleData = useMemo(() => {
        return data.slice(startIndex, endIndex);
    }, [data, startIndex, endIndex]);
    // 计算总高度
    const totalHeight = useMemo(() => {
        return data.length * itemHeight;
    }, [data, itemHeight]);
    // 计算偏移量
    const offsetY = useMemo(() => {
        return startIndex * itemHeight;
    }, [startIndex, itemHeight]);

    const wrapperClassName = useMemo(() => {
        return classNames('verney-virtual-list__wrapper', wrapperClass);
    }, [wrapperClass]);

    const wrapperStyleMemo: React.CSSProperties = useMemo(() => {
        return {
            ...wrapperStyle,
            height: visibleHeight,
            overflow: 'auto',
            position: 'relative',
        };
    }, [wrapperStyle, visibleHeight]);

    const contentContainerStyle: React.CSSProperties = useMemo(() => {
        return {
            height: totalHeight,
        };
    }, [totalHeight]);
    // 滚动偏移量
    const translateContainerStyle: React.CSSProperties = useMemo(() => {
        return {
            transform: `translateY(${offsetY}px) translateZ(0)`,
        };
    }, [offsetY]);

    return (
        <div ref={containerRef} className={wrapperClassName} style={wrapperStyleMemo}>
            <div className="verney-virtual-content" style={contentContainerStyle} role="group">
                <div style={translateContainerStyle} className="verney-virtual-translate">
                    {visibleData.map((item, index) => (
                        <div
                            key={startIndex + index}
                            className="verney-virtual-list__item"
                            data-index={startIndex + index}
                            style={{ height: itemHeight }}
                        >
                            {renderItem(item, startIndex + index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// 使用：
<VirtualList
  wrapperClass={'vitual-list-wrapper'}
  data={list}
  visibleHeight={400}
  itemHeight={70}
  renderItem={(item, index) => (
      <div
          style={{
              height: '100%',
              backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff',
              padding: '16px',
          }}
      >
          列表项 {item.id}
      </div>
  )}
/>
```


::: tip 流程
1. 页面初始化时：
  - 给`containerRef`绑定`scroll`滚动事件，同时获取`visibleHeight`;
  - 同时根据`data.length * itemHeight`计算出总高度`totalHeight`；
  - 根据`visibleHeight`计算出可视区域能显示的item数量`visibleCount`；
2. 当滚动发生时，监听`滚动容器`的滚动事件，通过`containerRef.scrollTop`和`itemHeight、bufferSize`计算可视区域起始数据索引`startIndex`；
3. 根据`startIndex`计算出可视区域结束数据索引`endIndex`和偏移量`offsetY`；
4. 再根据`startIndex、endIndex`计算出可视区域数据`visibleData`，进行渲染
:::




### 不定高度

不定高相对定高的难点在于数据没有渲染之前根本不知道数据的实际高度

方案：
1. 以预估高度先行渲染，然后获取真实高度并缓存
2. 为了修正这个高度，需要等待数据渲染后拿到真实高度，更新预估高度、更新占位div高度、更新偏移量


``` tsx
// 这里展示下核心代码：

export interface measuredDataProps {
    measuredDataMap: {
        [key: number]: { // 索引为key，值为对象
            offset: number; // 当前项距离顶部的距离
            height: number; // 当前项的高度
        };
    };
    lastMeasuredItemIndex: number; // 最后一个已经缓存过高度的索引
}


// 当item尺寸变化时，更新滚动偏移量
const sizeChangeHandle = (index: number, domNode: any) => {
    const height = domNode?.offsetHeight || 0; // 获取domNode的高度
    setMeasuredData((prevData) => {
        const measuredDataMap = { ...prevData.measuredDataMap };
        const { lastMeasuredItemIndex } = prevData;
        const itemMetaData = measuredDataMap[index];
        if (itemMetaData.height === height) {
            return prevData;
        }
        itemMetaData.height = height;
        let offset = itemMetaData.offset + itemMetaData.height;
        // 重新计算从索引 0 到当前项的所有偏移量
        for (let i = index + 1; i <= lastMeasuredItemIndex; i++) {
            const item = measuredDataMap[i];
            measuredDataMap[i] = {
                ...item,
                offset: offset,
            };
            offset += item.height;
        }
        return {
            measuredDataMap,
            lastMeasuredItemIndex,
        };
    });
};
```
> 具体看[完整源码](https://github.com/verneyZhou/verney-react-design/blob/main/packages/ui/src/components/virtual-list/virtual-list.tsx)



- [docs文档](https://verney-react-design.vercel.app/components/virtual-list)
- [storybook文档](https://verney-react-design-storybook.vercel.app/?path=/story/components-virtuallist--default)




## 备注

### 实现虚拟滚动方案

- 监听scroll事件，动态计算

- 通过Intersection Observer API 来更高效地监测元素的可见性变化

参考：
[性能飙升50%，react-virtualized-list如何优化大数据集滚动渲染](https://juejin.cn/post/7375504338757845030)、[react-virtualized-list](https://github.com/SailingCoder/react-virtualized-list)




- 定位方式：
1. absolute绝对定位:`top`
2. transform定位, `will-change: transform; transform: translateZ(0)`
3. `padding-top`

- cache缓存数据，避免重复计算

- 查找索引算法优化：二分查找

``` js
// 缓存数据，本身就是有顺序的
this.positions = [
  // {
  //   top:0,
  //   bottom:100,
  //   height:100
  // }
];
//获取列表起始索引
getStartIndex(scrollTop = 0){
  //二分法查找
  return this.binarySearch(this.positions,scrollTop)
},
//二分法查找
binarySearch(list,value){
  let start = 0;
  let end = list.length - 1;
  let tempIndex = null;
  while(start <= end){
    let midIndex = parseInt((start + end)/2);
    let midValue = list[midIndex].bottom;
    if(midValue === value){
      return midIndex + 1;
    }else if(midValue < value){
      start = midIndex + 1;
    }else if(midValue > value){
      if(tempIndex === null || tempIndex > midIndex){
        tempIndex = midIndex;
      }
      end = end - 1;
    }
  }
  return tempIndex;
},
```

- 滑动过快导致的白屏现象

> 监听wheel开启虚拟滚动：监听onmousemove、onmousedown、onmouseup模拟滚动条

[基于虚拟滚动的虚拟列表实现](https://juejin.cn/post/7295652334549450792)
> 使用虚拟滚动结合虚拟列表彻底解决了不定高虚拟列表遗留的问题：滑动过快导致白屏现象



- scroll事件会频繁触发，很多时候会造成重复计算的问题，造成性能浪费

> 可以使用IntersectionObserver替换监听scroll事件，IntersectionObserver可以监听目标元素是否出现在可视区域内，在监听的回调事件中执行可视区域数据的更新，并且IntersectionObserver的监听回调是异步触发，不随着目标元素的滚动而触发，性能消耗极低。



- 如果列表中含有图片，图片加载会发送网络请求，此时无法保证我们在获取列表项真实高度时图片是否已经加载完成，从而造成计算不准确的情况。
> 可使用 ResizeObserver 来监听列表项内容区域的高度改变，从而实时获取每一列表项的高度。





## TODO

- 虚拟瀑布流滚动实现

- Chat聊天列表



## 参考

- [三种虚拟列表原理与实现](https://juejin.cn/post/7232856799170805820)、[virtual-list](https://gitee.com/zhutouqietuzai/virtual-list)
- [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)、[vue-virtual-scroll-list预览](https://tangbc.github.io/vue-virtual-scroll-list)

- [「前端进阶」高性能渲染十万条数据(虚拟列表)](https://juejin.cn/post/6844903982742110216)
- [花三个小时，完全掌握分片渲染和虚拟列表～](https://juejin.cn/post/7121551701731409934)
- [Vue3 封装不定高虚拟列表 hooks，复用性更好！](https://juejin.cn/post/7415663559310540827)