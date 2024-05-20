---
title: React面试题收集
date: 2024-02-16 10:24:04
permalink: false
article: false
categories:
  - null
tags:
  - null
---



# React面试题收集


## 基础部分


### 生命周期

1. `constructor`: 实例过程中自动调用的方法，在方法内部通过super关键字获取来自父组件的props
2. `render`: 类组件必须实现的方法，用于渲染DOM结构，可以访问组件state与prop属性
3. `componentDidMount`: 组件挂载到真实DOM节点后执行，其在render方法之后执行
4. `shouldComponentUpdate`: 有新的props或者state时都会调用，通过返回true或者false告知组件更新与否
5. `componentDidUpdate`: 组件更新完成: 在该方法中，可以根据前后的props和state的变化做相应的操作，如获取数据，修改DOM样式等
6. `componentWillUnmount`: 此方法用于组件卸载前，清理一些注册是监听事件，或者取消订阅的网络请求等；一旦一个组件实例被卸载，其不会被再次挂载，而只可能是被重新创建


一些生命周期方法，如`componentWillMount(组件将要渲染)、componentWillReceiveProps(组件 props 变更)和componentWillUpdate(组件将要更新)`，已被弃用或替换为替代方法或挂钩。



- **react v16后增加了getDerivedStateFromProps，getSnapshotBeforeUpdate，为什么？**

1. `getDerivedStateFromProps` 首先它是 静态 方法, 方法参数分别是下一个 props、上一个 state, 这个生命周期函数是为了替代 `componentWillReceiveProps` 而存在的, 主要作用就是监听 props 然后修改当前组件的 state

2. `getSnapshotBeforeUpdate` 生命周期将`在 render 之后 DOM 变更之前`被调用, 此生命周期的返回值将作为 `componentDidUpdate` 的第三个参数进行传递, 当然通常不需要此生命周期, 但在重新渲染期间需要手动保留 DOM 信息时就特别有用

``` js
getSnapshotBeforeUpdate(prevProps, prevState){
  console.log(5);
  return 999;
}
// 组件更新完成
componentDidUpdate(prevProps, prevState, snapshot) {
  console.log(6, snapshot);
}
// 5
// 6 999
```

`增加 getSnapshotBeforeUpdate 的原因`：

大多数开发者使用 componentWillUpdate 的场景是配合 componentDidUpdate, 分别获取 渲染 前后的视图状态, 进行必要的处理; 但随着 React `异步渲染` 等机制的到来, **渲染 过程可以被分割成多次完成, 还可以被 暂停 甚至 回溯**, 这导致 componentWillUpdate 和 componentDidUpdate 执行前后可能会间隔很长时间, 足够使用户进行交互操作更改当前组件的状态, 这样可能会导致难以追踪的 BUG

> 所以就新增了 getSnapshotBeforeUpdate 生命周期, 目的就是为了解决上述问题并取代 componentWillUpdate, 因为 getSnapshotBeforeUpdate 方法是在 componentWillUpdate 后(如果存在的话), `在 React 真正更改 DOM 前调用的, 它获取到组件状态信息会更加可靠`

1. 避免了 componentWillUpdate 和 componentDidUpdate 配合使用时将组件临时的状态数据存在组件实例上`浪费内存`
2. getSnapshotBeforeUpdate 返回的数据在 componentDidUpdate 中用完即被销毁, 效率更高



- **React v16.0 之后为什么要删除 Will 相关生命周期？**


1. `为何移除 componentWillMount`: 因为在 `异步渲染机制` 中允许对组件进行中断停止等操作, 可能会导致单个组件实例 componentWillMount 被多次调用, 很多开发者目前会将事件绑定、异步请求等写在 componentWillMount 中, 一旦异步渲染时 componentWillMount 被多次调用, 将会导致: `进行重复的事件监听, 无法正常取消重复的事件, 严重点可能会导致内存泄漏`、`发出重复的异步网络请求, 导致 IO 资源被浪费`

> 现在, React 推荐将原本在 componentWillMount 中的网络请求移到 componentDidMount 中。


2. `为何移除 componentWillUpdate`的原因跟上面`增加 getSnapshotBeforeUpdate 的原因`一样，是React异步渲染机制带来的改革~




- 没有state的叫做无状态组件，有state的叫做有状态组件；

- 在 React 组件中，应该在 `componentDidMount` 中发起网络请求。这个方法会在组件第一次“挂载”(被添加到 DOM)时执行，在组件的生命周期中仅会执行一次。在 componentDidMount 中发起网络请求将保证这有一个组件可以更新了。





### 异步渲染

- **时间分片 (Time Slicing)：**

React 在 渲染 的时候, 会将任务拆分成多个小任务, 这些细分的任务则会在主线程空闲的时候进行执行, 在执行任务的期间可以随时进行暂停


时间切片的核心思想是：如果任务不能在50毫秒内执行完，那么为了不阻塞主线程，这个任务应该让出主线程的控制权，使浏览器可以处理其他任务。让出控制权意味着停止执行当前任务，让浏览器去执行其他任务，随后再回来继续执行没有执行完的任务。

所以时间切片的目的是不阻塞主线程，而实现目的的技术手段是将一个长任务拆分成很多个不超过50ms的小任务分散在宏任务队列中执行。

> 使用时间切片的缺点是，任务运行的总时间变长了，这是因为它每处理完一个小任务后，主线程会空闲出来，并且在下一个小任务开始处理之前有一小段延迟。但是为了避免卡死浏览器，这种取舍是很有必要的。

时间切片是一种概念，而引入Fiber架构是实现这种概念的技术方案。



- **window.requestIdleCallback**

`window.requestIdleCallback` 是一个浏览器 API，它允许开发者在浏览器的主事件循环有空闲时间时执行低优先级的任务。这样，开发者可以避免在浏览器进行重要任务（如动画或用户交互）时执行这些可能会干扰或减慢浏览器性能的任务。

window.requestIdleCallback 接受一个回调函数作为参数，这个回调函数会在浏览器的主线程空闲时执行。此外，它还可以接受一个配置对象，这个对象可以指定一个回调函数推迟执行的最长时间。如果在这段时间内，主线程仍然没有空闲，那么回调函数将立即执行。

> window.requestIdleCallback 的主要目标是帮助开发者优化浏览器的性能，通过确保在浏览器空闲时执行低优先级任务，从而避免对用户的体验造成干扰。





### render渲染流程

1. state 或者 props 更新, 会触发 render, 当然这里也有例外(props 可通过 shouldComponentUpdate、memo 进行控制, 并且在 useState 中如果设置了相同的 state 也不会触发 render)
2. 每次 render 时, 整个 UI 都将以 虚拟 DOM 的形式进行呈现
3. 使用 diff 算法, 计算新旧 虚拟 DOM 对象之间的差异
4. 计算完成, 将只更新实际更改的真实 DOM 节点





### react强制刷新

`component.forceUpdate()`: 默认情况下，当组件的 state 或 props 发生变化时，组件将重新渲染。如果 render() 方法依赖于其他数据，则可以调用 `forceUpdate()` 强制让组件重新渲染。

调用 forceUpdate() 将致使组件调用 render() 方法，此操作会跳过该组件的 shouldComponentUpdate()。但其子组件会触发正常的生命周期方法，包括 shouldComponentUpdate() 方法。

> 通常你应该避免使用 forceUpdate()，尽量在 render() 中使用 this.props 和 this.state。



### super(props)

`在调用 super() 方法之前，子类构造函数无法使用this引用`，ES6 子类也是如此。将 props 参数传递给 super() 调用的主要原因是`在子构造函数中能够通过this.props来获取传入的 props`

``` js
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props); // { name: 'sudheer',age: 30 }
  }
}

class MyComponent extends React.Component {
  constructor(props) {
    super();
    console.log(this.props); // undefined
    // 但是 Props 参数仍然可用
    console.log(props); // Prints { name: 'sudheer',age: 30 }
  }
  render() {
    // 构造函数外部不受影响
    console.log(this.props); // { name: 'sudheer',age: 30 }
  }
}

```




- **为什么说React中的props是只读的？**
> 保证react的单向数据流的设计模式，使状态更可预测。

**子组件修改props**
1. 使用回调函数: 子组件可以通过一个回调函数将修改后的数据发送回父组件，由父组件来更新state。
2. 使用上下文（context）
3. 使用状态管理库



### Hooks

> Hooks是react16.8以后新增的钩子API

[React-Hooks](https://zh-hans.react.dev/reference/react/hooks)



- **为什么要推出Hooks?**

解决问题：
1. `在组件之间复用状态逻辑很难`：可以使用 Hook 从组件中提取状态逻辑，使得这些逻辑可以单独测试并复用。Hook 使你在无需修改组件结构的情况下复用状态逻辑。 这使得在组件间或社区内共享 Hook 变得更便捷。
2. `复杂组件变得难以理解`：Hook 将组件中相互关联的部分拆分成更小的函数（比如设置订阅或请求数据），而并非强制按照生命周期划分。
3. `难以理解的 class`：class 不能很好的压缩，并且会使热重载出现不稳定的情况
> Hook 使你在非 class 的情况下可以使用更多的 React 特性。 从概念上讲，React 组件一直更像是函数，而 Hook 则拥抱了函数。


::: tip React Hooks
- useState：用于管理功能组件中的状态。
- useEffect：用于在功能组件中执行副作用，例如获取数据或订阅事件。
- useContext：用于访问功能组件内的 React 上下文的值。
- useRef：用于创建对跨渲染持续存在的元素或值的可变引用。
- useCallback：用于记忆函数以防止不必要的重新渲染。
- useMemo：用于记忆值，通过缓存昂贵的计算来提高性能。
- useReducer：用于通过reducer函数管理状态，类似于Redux的工作原理。
- useLayoutEffect：与useEffect类似，但效果在所有DOM突变后同步运行。
:::

[React 内置 Hook](https://zh-hans.react.dev/reference/react/hooks)



- **子组件向父组件传值？**

``` js
// 在父组件中用useState声明数据
 const [ data, setData ] = useState(false)
// 把更新数据的函数传递给子组件
<Child setData={setData} />

// 子组件中触发函数更新数据，就会直接传递给父组件
export default function (props) {
    const { setData } = props
    setData(true)
}

// 多层级用useContext
const User = () => {
 // 直接获取，不用回调
 const { user, setUser } = useContext(UserContext);
 return <Avatar user={user} setUser={setUser} />;
};
```


- **怎样使用Hooks获取服务端数据？**

``` js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
function App() {
  const [data, setData] = useState({ hits: [] });
  useEffect(async () => {
    const result = await axios(
      'https://api/url/to/data',
    );
    setData(result.data);
  });
  return (
    <ul>
      {data.hits.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}
export default App;
```



- **React Hooks在平时开发中需要注意的问题**


1. `只在最顶层使用 Hook: 不要在循环，条件或嵌套函数中调用 Hook`， 确保总是在你的 React 函数的最顶层调用他们。

2. 只在 React 函数中调用 Hook: 不要在普通的 JavaScript 函数中调用 Hook, 在 React 的函数组件中调用 Hook; 在自定义 Hook 中调用其他 Hook


3. useState设置状态的时候，只有第一次生效，后期需要更新状态，必须通过useEffect

> TableDeail是一个公共组件，在调用它的父组件里面，我们通过set改变columns的值，以为传递给TableDeail 的 columns是最新的值，所以tabColumn每次也是最新的值，但是实际tabColumn是最开始的值，不会随着columns的更新而更新：

``` js
const TableDeail = ({    columns,}:TableData) => {
    const [tabColumn, setTabColumn] = useState(columns) 
}

// 正确的做法是通过useEffect改变这个值
const TableDeail = ({    columns,}:TableData) => {
    const [tabColumn, setTabColumn] = useState(columns) 
    useEffect(() =>{setTabColumn(columns)},[columns])
}
```

4. `不要在 useEffect 里面写太多的依赖项`, 划分这些依赖项成多个单一功能的 useEffect 其实这点是遵循了软件设计的 `单一职责模式`






- **自定义钩子**

自定义钩子是一种允许您在不同组件之间重复使用逻辑的功能。它是一种封装可重用逻辑的方法，以便在多个组件之间轻松共享和重用。自定义钩子是通常以 `*use *` 开头的函数，可在需要时调用其他钩子。

自定义钩子必须是纯函数; 自定义钩子可以返回值或其他钩子。


`纯函数`是指在函数执行过程中，除了返回值外，不会对程序的执行环境产生任何副作用的函数。
1. 无副作用
2. 确定性

> 函数式编程鼓励尽可能地使用纯函数，以避免副作用和程序的不确定性，从而编写更简洁、可维护的代码。




### useState

useState返回一个状态值和一个更新它的函数:

``` js
import { useState } from 'react';

function MyComponent() {
  const [age, setAge] = useState(28);
  const [name, setName] = useState('Taylor');
  const [todos, setTodos] = useState(() => createTodos());
  // ...
```

`const [value, setValue] = useState('Some state')`


useState 返回一个由两个值组成的数组：
1. 当前的 state。在首次渲染时，它将与你传递的 initialState 相匹配。
2. set 函数，它可以让你将 state 更新为不同的值并触发重新渲染。

该方法在更新状态时会进行浅比较, 如果待更新状态值和当前状态值一致, 则不会进行更新, 不会引起组件的重新渲染





### useEffect

`useEffect 钩子允许在功能组件中执行副作用`。或者如果您将依赖关系数组作为第二个参数传递，那么每当其中一个依赖关系发生变化时，该函数就会被调用。

通过它可模拟类似 类组件 中的部分⽣命周期

``` js
import React, { useState, useEffect } from 'react';

function Welcome(props) {
  const [value, setValue] = useState('');
  useEffect(() => {
    document.title = '加载完成';
  });
  useEffect(() => {
    console.log(value); // 新值
    document.title = '加载完成';
    // 返回 cleanup 函数
    return () => {
        console.log(value); // 旧值
        document.title = '';
    }
  }, [value]); // 第二个参数为依赖项
  return <h1>Hello, {props.name}</h1>;
}
```

- `useEffect(setup, dependencies?)`

1. `setup`：处理 Effect 的函数。setup 函数选择性返回一个 清理（cleanup） 函数。当组件被添加到 DOM 的时候，React 将运行 setup 函数。在每次依赖项变更重新渲染后，React 将首先使用旧值运行 cleanup 函数（如果你提供了该函数），然后使用新值运行 setup 函数。在组件从 DOM 中移除后，React 将最后一次运行 cleanup 函数。

2. 可选 `dependencies`：setup 代码中引用的所有响应式值的列表。响应式值包括 `props、state` 以及所有直接在组件内部声明的变量和函数。依赖项列表的元素数量必须是固定的，并且必须像 `[dep1, dep2, dep3]` 这样内联编写。
    - `[a, b]`: 如果指定了依赖项，则 Effect 在 `初始渲染后以及依赖项变更的重新渲染后` 运行; 如果 a 或 b 不同则会再次运行
    - `[]`: 如果你的 Effect 确实没有使用任何响应式值，则它仅在 初始渲染后 运行。`即使依赖项为空，setup 和 cleanup 函数也会 在开发中额外多运行一次`，以帮你发现 bug。（适用于接口请求初始渲染）
    - 如果完全不传递依赖数组，则 Effect 会在组件的 `每次单独渲染（和重新渲染）之后` 运行。



- Effect 在组件挂载时运行了两次：在开发环境下，如果开启严格模式，React 会在实际运行 setup 之前额外运行一次 setup 和 cleanup。
> 这是一个压力测试，用于验证 Effect 的逻辑是否正确实现。如果出现可见问题，则 cleanup 函数缺少某些逻辑。cleanup 函数应该停止或撤消 setup 函数所做的任何操作。

- Effect 在每次重新渲染后都运行：`没有依赖项数组每次重新渲染后重新运行`
> 如果你已经指定了依赖项数组，你的 Effect 仍循环地重新运行，那是因为你的某个依赖项在每次重新渲染时都是不同的。

- Effect 函数一直在无限循环中运行:  `Effect 函数更新了一些状态`, 且 `这些状态的改变导致了重新渲染，从而导致 Effect 函数依赖的状态发生改变`。

- 即使组件没有卸载，cleanup 逻辑也会运行: `cleanup 函数不仅在卸载期间运行，也在每个依赖项变更的重新渲染前运行`



注意事项：
1. 删除不必要的对象依赖项：如果你的 Effect 依赖于在渲染期间创建的对象或函数，则它可能会频繁运行
2. 避免使用渲染期间创建的对象作为依赖项
3. `当父子组件都用到 useEffect 时, 子组件中的会比父组件中的先触发（类似于Vue中父子组件的mounted）`

可用于模拟生命周期： componentDidUpdate componentDidMount


### useLayoutEffect

useLayoutEffect是React的一个Hook，它允许你`在浏览器执行绘制之前同步读取DOM布局`。与useEffect相比，useLayoutEffect会在所有的DOM变更之后同步调用，因此它可以用来读取DOM布局。

> useLayoutEffect 可能会影响性能。尽可能使用 useEffect。

大多数情况下，你应该优先使用useEffect，因为`useEffect会在浏览器完成绘制之后异步执行`，这通常更符合我们的预期。然而，如果你需要在DOM更新后同步读取布局，或者在DOM更新后同步触发重渲染，那么你应该使用useLayoutEffect。


**useInsertionEffect**: 在任何 DOM 突变之前触发, 主要是解决 CSS-in-JS 在渲染中注入样式的性能问题



`执行顺序：`useInsertionEffect(DOM 变更前) >  useLayoutEffect(DOM 变更后, 渲染前) >  useEffect(浏览器完成渲染之后)


### useMemo

useMemo 是一个 React Hook，它在每次重新渲染的时候能够缓存计算的结果。
1. 跳过代价昂贵的重新计算
2. 跳过组件的重新渲染

``` js
import { useMemo } from 'react';

// 在组件的顶层调用 useMemo 来缓存每次重新渲染都需要计算的结果。
function TodoList({ todos, tab }) {
  const visibleTodos = useMemo(
    () => filterTodos(todos, tab),
    [todos, tab]
  );
  // ...
}
```

`const cachedValue = useMemo(calculateValue, dependencies)`

- `calculateValue`：要缓存计算值的函数。它应该是一个没有任何参数的纯函数，并且可以返回任意类型。React 将会在首次渲染时调用该函数；在之后的渲染中，如果 dependencies 没有发生变化，React 将直接返回相同值。否则，将会再次调用 calculateValue 并返回最新结果，然后缓存该结果以便下次重复使用。

- `dependencies`：所有在 calculateValue 函数中使用的响应式变量组成的数组。响应式变量包括 props、state 和所有你直接在组件中定义的变量和函数。


在初次渲染时，useMemo 返回不带参数调用 calculateValue 的结果。在接下来的渲染中，如果依赖项没有发生改变，它将返回上次缓存的值；否则将再次调用 calculateValue，并返回最新结果。

1. 在 严格模式 中，React 将调用你的某些函数两次而不是一次：这种 仅限开发环境下的 行为可帮助你 保持组件纯粹。
2. 组件每次渲染时，useMemo 都会重新计算：如果你忘记了依赖数组，useMemo 将每次重新运行计算





### useCallback


useCallback 是一个允许你在多次渲染中缓存函数的 React Hook。

1. 跳过组件的重新渲染 
2. 防止频繁触发 Effect



``` js
import { useCallback } from 'react';

export default function ProductPage({ productId, referrer, theme }) {
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);
```

`const cachedFn = useCallback(fn, dependencies)`

- `fn`：想要缓存的函数。此函数可以接受任何参数并且返回任何值。React 将会在初次渲染而非调用时返回该函数。当进行下一次渲染时，如果 dependencies 相比于上一次渲染时没有改变，那么 React 将会返回相同的函数。否则，React 将返回在最新一次渲染中传入的函数，并且将其缓存以便之后使用。React 不会调用此函数，而是返回此函数。你可以自己决定何时调用以及是否调用。

- `dependencies`：有关是否更新 fn 的所有响应式值的一个列表。响应式值包括 props、state，和所有在你组件内部直接声明的变量和函数。没有依赖项数组每一次都返回一个新函数。

> 在初次渲染时，useCallback 返回你已经传入的 fn 函数; 在之后的渲染中, 如果依赖没有改变，useCallback 返回上一次渲染中缓存的 fn 函数；否则返回这一次渲染传入的 fn。

简而言之，**useCallback 在多次渲染中缓存一个函数，直至这个函数的依赖发生改变。**



- **useMemo vs useCallback**

1. useMemo用于记忆计算结果，而useCallback用于记忆函数本身。
2. useMemo如果依赖项未更改，则缓存计算值并在后续渲染时返回该值。
3. useCallback缓存函数本身并返回相同的实例，除非依赖项已更改。

``` js
// 在 React 内部的简化实现
function useCallback(fn, dependencies) {
  return useMemo(() => fn, dependencies);
}
```


### React Context上下文

React Context 是一项功能，它提供了一种在组件树中传递数据的方法，而无需在每一层手动传递道具。它允许您创建一个`全局状态`，树中的任何组件都可以访问该状态，无论其位置如何。当您需要在多个未通过道具直接连接的组件之间`共享数据`时，上下文就非常有用。

``` js
import { createContext, useContext } from 'react';

const ThemeContext = createContext(null);

export default function MyApp() {
  return (
    <ThemeContext.Provider value="dark">
      <Button />
    </ThemeContext.Provider>
  )
}

function Button({ children }) {
  const theme = useContext(ThemeContext);
  const className = 'button-' + theme;
  return (
    <button className={className}>
      {children}
    </button>
  );
}
```

`上下文值发生变化时，调用 useContext 的组件总是会被重新渲染`。如果重新渲染组件的成本很高，可以使用 memoization 对其进行优化。




### React refs 

React 中的 Refs提供了一种方式，允许我们访问 DOM节点或在 render方法中创建的 React元素

> 本质为ReactDOM.render()返回的组件实例，如果是渲染组件则返回的是组件实例，如果渲染dom则返回的是具体的dom节点


``` js
// class
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  render() {
    return <div ref="myref" />;
  }
}

// hooks
function App(props) {
  const myref = useRef(null)
  function handleClick() {
    myref.current.focus();
  }
  return (
    <>
      <input ref={myref}/>
    </>
  )
}
```

`useRef` 是一个 React Hook，它能帮助`引用一个不需要渲染的值`。
1. 使用 ref 引用一个值
2. 通过 ref 操作 DOM
3. 避免重复创建 ref 的内容


- useRef 返回一个具有单个 current 属性 的 ref 对象，并初始化为你提供的 初始值

- `改变 ref 不会触发重新渲染。`

使用ref:
1. 可以在重新渲染之间 存储信息（普通对象存储的值每次渲染都会重置）。
2. `改变它 不会触发重新渲染`（状态变量会触发重新渲染）。
3. 对于组件的每个副本而言，这些信息都是本地的（外部变量则是共享的）。


1. 不要在渲染期间写入或者读取 ref.current。
2. 可以在 事件处理程序或者 Effect 中读取和写入 ref。


**获取子组件实例:**
1. 子组件为类组件, 直接绑定 `ref`, 就能够拿到整个子组件的实例对象
2. 函数组件: `forwardRef + useImperativeHandle`


**转发ref:**
1. 类组件：使用不同的属性名称将 ref 进行转发
2. 函数组件：使用 React.forwardRef 进行转发, forwardRef 返回一个组件




### useReducer

简易版 Redux






### 高级组件HOC

高阶组件不是组件，是`增强函数`，可以输入一个元组件，返回出一个新的增强组件；至少满足下列一个条件的函数：

1. 接受一个或多个函数作为输入
2. 输出一个函数


高阶组件其实就是`装饰器模式`在 React 中的实现：通过给函数传入一个组件（函数或类）后在函数内部对该组件（函数或类）进行功能的增强（不修改传入参数的前提下），最后返回这个组件（函数或类），即允许向一个现有的组件添加新的功能，同时又不去修改该组件，属于 包装模式(Wrapper Pattern) 的一种。

**装饰者模式：在不改变对象自身的前提下在程序运行期间动态的给对象添加一些额外的属性或行为。可以提高代码的复用性和灵活性。**

1. 高阶组件 不是组件，是 一个把某个组件转换成另一个组件的 `函数`
2. 高阶组件的主要作用是 `代码复用`
3. 高阶组件是 装饰器模式在 React 中的实现


- **渲染劫持**

`渲染劫持`的概念是控制组件从另一个组件输出的能力；高阶组件可以在render函数中做非常多的操作，从而控制原组件的渲染输出，只要改变了原组件的渲染，我们都将它称之为一种渲染劫持。
> 实际上，在高阶组件中，`组合渲染和条件渲染`都是渲染劫持的一种



应用场景：

- 权限控制: 利用高阶组件的 `条件渲染` 特性可以对页面进行权限控制:

``` js
// HOC.js    
function withAdminAuth(WrappedComponent) {    
    return class extends React.Component {    
        constructor(props) {
          this.state = {
            isAdmin: false
          }
        }
        async componentWillMount() {    
            const currentRole = await getCurrentUserRole();    
            this.setState({    
                isAdmin: currentRole === 'Admin',    
            });    
        }    
        render() {    
            if (this.state.isAdmin) {    
                return <WrappedComponent {...this.props} />;    
            } else {    
                return (<div>您没有权限查看该页面，请联系管理员！</div>);    
            }    
        }    
    };    
}


// 使用
// pages/page-a.js    
class PageA extends React.Component {    
    constructor(props) {    
        super(props);       
    }    
    componentWillMount() {}    
    render() {}    
}    
export default withAdminAuth(PageA);    
```



注意：
1. 高阶组件内部, `尽量不要试图通过继承的方式, 修改传入的组件`, 那样可能会拦截原组件的生命周期、渲染、内部组件状态, 从而引起不必要的麻烦
2. 透传与自身无关的 props, 同时需要避免属性的覆盖问题
3. `不要在 render 方法中使用高阶组件`: 在 render 中使用, 每次渲染都会重新生成新的组件, 造成不必要的卸载、挂载, 会造成性能问题, 而且重新挂载会导致组件以及子组件状态的丢失
4. `务必复制静态属性`(因为返回的是新的类, 原组件的静态属性会丢失): 手动绑定、或者使用 React 官方提供的工具




### React Hooks 跟 高阶组件（HOC）有什么区别？

React Hooks和高阶组件（HOC）都是React中用于复用组件逻辑的技术，但它们之间存在一些区别。

1. `语法和用法`：高阶组件是一个函数，它接收一个组件并返回一个新的组件。而Hooks则是一种在函数组件内部使用的特殊函数，它`允许你在不使用类的情况下使用React的特性`，如状态（state）和生命周期（lifecycle）方法。

2. `逻辑复用`：`高阶组件通过包装组件来实现逻辑复用`，这意味着你需要创建一个新的组件来包装原始组件，并传递props给原始组件。而`Hooks则直接在函数组件内部使用，无需创建新的组件，从而更加简洁`。

3. `副作用处理`：高阶组件通常使用生命周期方法（如componentDidMount和componentDidUpdate）来处理副作用。而`Hooks则提供了useEffect钩子函数，用于在函数组件中处理副作用，使得代码更加清晰和易于管理`。

4. 自定义Hook：你可以创建自定义Hook，即一个函数，它调用其他Hooks并将它们组合在一起。这使得你可以更加灵活地组织和复用逻辑。然而，高阶组件并不支持这种自定义组合的方式。

总的来说，`React Hooks提供了一种更加简洁、灵活和可维护的方式来复用组件逻辑`，而`高阶组件则是一种更加传统和强大的技术，适用于更复杂的场景`。在React中，你可以根据具体需求选择使用哪种技术。



### React.memo()

React.memo() 是一个高阶组件。`允许你的组件在 props 没有改变的情况下跳过重新渲染。`

如果组件总是以不变的道具渲染相同的内容，可以在某些情况下将其封装在 React.memo() 调用中以提高性能，从而记住渲染结果。这意味着 React 将使用上次渲染的结果，避免重新渲染。React.memo() 只影响对道具的更改。

如果功能组件被封装在 React.memo 中并使用了 useState、useReducer 或 useContext，那么当状态或上下文发生变化时，它将被重新渲染。

``` js
import { memo } from 'react';

const MemoComponent = memo(MemoComponent = (props) => {
  // ...
});
```


### React Fragment

> 在 React 中如果需要渲染多个元素, 需要使用元素进行包裹, 否则将会报错

通过 Fragment 可以将子列表分组, 最终在渲染为真实 DOM 节点时会将其忽略(不会进行渲染)

从组件返回多个元素是 React 中的常见做法。片段允许形成子元素列表，而`无需在 DOM 中创建不必要的节点`。

``` js
<>
  <OneChild />
  <AnotherChild />
</>
// or
<React.Fragment>
  <OneChild />
  <AnotherChild />
</React.Fragment>
```




### Fiber

React15 的 StackReconciler 方案由于递归不可中断问题，如果 Diff 时间过长（JS计算时间），会造成页面 UI 的无响应（比如输入框）的表现，vdom 无法应用到 dom 中。

为了解决这个问题，React16 推出了 FiberReconciler，`将原来的树形结构（vdom）转换成 Fiber 链表的形式（child/sibling/return），整个 Fiber 的遍历是基于循环而非递归，可以随时中断`。

基于 Fiber 的链表结构，对于后续（React 17 lane 架构）的异步渲染和 （可能存在的）worker 计算都有非常好的应用基础




### 组件之间传参


- **父子通信**

1. 父组件通过 `props` 传递数据给子组件
2. 子组件通过调用父组件传来的 函数 传递数据给父组件(自定义事件)
3. 非常规方法: 父组件通过 `ref` 获取子组件的实例对象


- **跨层级通信**

1. 全局上下文：Context
2. Redux, mobx




### JSX

JSX 是 JavaScript XML 的缩写，是一种 `JavaScript 的语法扩展`，通常与 React 库一起使用。JSX 允许在 JavaScript 代码中编写类似于 HTML 的结构，以声明式地描述 UI 组件的结构。


特点：
1. `类似 HTML 的语法`：JSX `允许在 JavaScript 代码中直接编写类似 HTML 的标记结构`，包括标签、属性、嵌套等。
2. `与 JavaScript 无缝集成`：JSX 语法直接嵌入到 JavaScript 中，使得 JavaScript 和 UI 结构定义在同一个文件中，便于维护和阅读。
3. `表达式插值`：在 JSX 中可以使用`花括号 {} `插入 JavaScript 表达式，以动态生成内容或属性。
4. `组件化`：JSX 语法支持定义和使用组件，通过组件可以将 UI 结构划分为独立的、可复用的模块。
5. `通过 Babel 转译`：JSX 并不是 JavaScript 的原生语法，需要通过工具如 Babel 来将 JSX 代码转译成普通的 JavaScript 代码，以便浏览器能够正确执行。






### Suspense

React中的Suspense组件是一个内置组件，用于处理异步渲染, 允许在子组件完成加载前展示后备方案。

``` js
<Suspense fallback={<Loading />}>
  <SomeComponent />
</Suspense>
```

- `children`：真正的 UI 渲染内容。如果 children 在渲染中被挂起，Suspense 边界将会渲染 fallback。

- `fallback`：真正的 UI 未渲染完成时代替其渲染的备用 UI，它可以是任何有效的 React 节点。后备方案通常是一个轻量的占位符，例如表示加载中的图标或者骨架屏。

原理上，当React遇到需要异步加载的组件时，它会“悬停”或暂停渲染，直到异步操作完成。在这个过程中，Suspense组件会显示fallback属性中指定的占位符。一旦异步加载完成，React会继续渲染实际的组件内容，从而提供了无缝的用户体验。

1. React的lazy函数应与Suspense组件结合使用，以实现组件的懒加载
2. 基于路由实现代码分割时，Suspense也非常有用


### React.lazy

``` js
import { lazy } from 'react';
const routes = [
  { path: '/', component: lazy(() => import('./Home')) },
];
export default routes;
```

React.lazy是React中的一项新功能，用于`实现组件的懒加载`。懒加载是指当页面加载时，不会一次性将所有组件都加载进来，而是只加载当前需要显示的组件，其他组件在需要时再进行加载。这样可以加快页面的加载速度，提升用户体验。

React.lazy的原理是基于新的React API中引入的Suspense的实现。在组件中使用React.lazy时，会返回一个懒加载的组件。这个组件并不是真正的组件，而是一个`包含了组件加载的Promise对象的中介组件`。当这个懒加载的组件被渲染时，React会检查这个组件是否已经被加载。如果已经加载，则直接渲染这个组件。如果还没有加载，就会等待Promise对象的resolve()方法被调用后再进行加载。

> `React.lazy函数接受一个函数作为参数，该函数返回一个动态导入的Promise对象`。这要求React代码是基于ES6的，且`支持动态import()`。

> React.lazy实质上是React官方使用Suspense配合lazy实现的惰性加载组件功能，这个优化可以使应用整体体积变小，加载速度更快，用户可以更快地看到应用的内容。



### react-router-dom 中 Outlet 组件用法？

在 React Router v6 中，Outlet 组件是一个特殊的组件，`用于指定子路由的渲染位置`。它通常与 `<Route>` 组件结合使用，用于实现嵌套的路由结构。

Outlet 组件的作用是占位，它会在父路由组件中渲染当前激活的子路由组件。在定义路由配置时，你可以将 Outlet 组件放置在父路由组件的 JSX 中，以指示子路由组件应该渲染的位置。

> 跟vue的`router-view`一个意思~


## Redux


### 状态管理

状态管理器是一种帮助管理应用程序状态的工具或库。它为存储和管理数据提供了一个集中的存储空间或容器，应用程序中的不同组件都可以访问和更新这些数据。

除了 React Context，Redux 或 MobX 也常用作状态管理库。


``` js
import { createStore } from 'redux'

/**
 * 这是一个 reducer 函数：接受当前 state 值和描述“发生了什么”的 action 对象，它返回一个新的 state 值。
 * reducer 函数签名是 : (state, action) => newState
 *
 * Redux state 应该只包含普通的 JS 对象、数组和原语。
 * 根状态值通常是一个对象。 重要的是，不应该改变 state 对象，而是在 state 发生变化时返回一个新对象。
 *
 * 你可以在 reducer 中使用任何条件逻辑。 在这个例子中，我们使用了 switch 语句，但这不是必需的。
 * 
 */
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

// 创建一个包含应用程序 state 的 Redux store。
// 它的 API 有 { subscribe, dispatch, getState }.
let store = createStore(counterReducer)

// 你可以使用 subscribe() 来更新 UI 以响应 state 的更改。
// 通常你会使用视图绑定库（例如 React Redux）而不是直接使用 subscribe()。
// 可能还有其他用例对 subscribe 也有帮助。

store.subscribe(() => console.log(store.getState()))

// 改变内部状态的唯一方法是 dispatch 一个 action。
// 这些 action 可以被序列化、记录或存储，然后再重放。
store.dispatch({ type: 'counter/incremented' })
// {value: 1}
store.dispatch({ type: 'counter/incremented' })
// {value: 2}
store.dispatch({ type: 'counter/decremented' })
// {value: 1}
```


### Redux原理

1. 页面上用户通过 dispatch 方法触发一个 Action: dispatch(Action)
2. Store 接收到 Action; 调用 Reducer 函数, 并将 Action 和当前状态作为参数传递给它
3. Reducer 函数根据 Action 类型执行相应的处理, 并返回新的状态
4. Store 更新状态, 并通知所有订阅状态的组件(视图)
5. 组件(视图)收到通知, 获取新状态, 重新渲染




- **Redux中的reducer是什么，它有哪些参数？**
> reducer是一个纯函数，以 state 和 action 为参数。在reducer中，我们会跟踪接收到的操作类型，并根据它修改状态，返回一个新的状态对象。



###  createStore 实现原理

1. 一个状态 `state` 用于存储状态
2. 一个监听器列表, 当状态改变时会遍历该列表, 执行里面的所有方法
3. subscribe: 注册监听器
4. action: 有效载体, 必须包含 action.type, 以及额外数据
5. dispatch: 执行 `reducer(state, action)`、遍历执行所有监听器(触发组件状态更新、从而引起页面重新渲染)
6. reducer: 纯函数 `(state, action)` ==> 根据 action.type 处理计算 ==> 返回新状态



### Redux 中异步的请求怎么处理

中间件其实就是要对 redux 的 store.dispatch 方法做一些改造, 来定制一些功能

借助redux的异步中间件进⾏异步处理。redux异步流中间件其实有很多，当下主流的异步中间件有两种`redux-thunk`、redux-saga。


- **Redux-thunk: 实现原理**

1. 本来 dispatch 参数只能是 action 对象, redux-thunk 中间件对 dispatch 进行了封装, 允许 action 是一个函数
2. 在 dispatch 中如果发现 action 是函数则执行 `action(dispatch, getState)`;(延迟 dispatch), 否则执行 `dispatch(action)`



### redux 优缺点

**优点:**

1. `单一数据源`: 所有状态都存在一个对象中, 使得开发、调试都会变得比较容易
2. `State 是只读的`: 如果要修改状态只能通过触发 action 来修改, action 是一个普通对象, 可以很方便被日志打印、序列化、储存…… 因此状态的修改过程就会变得有迹可寻, 比较方便得跟踪数据的变化
3. redux 使用纯函数(reducer)来修改状态, 同一个 action 返回的 state 相同, 这样的话让状态的修改过程变得可控, 测试起来也方便

**缺点:** 

代码结构复杂，存在 Action 和 Reducer, 如果`要添加一个新的状态需要写一堆模版代码`, 但是现在市面上已经有很多成熟的方案(工具)可以帮我们简化这一步, 比如 Redux Toolkit


### 和 mobx 的区别

1. 单一数据、数据分散
2. 响应式编程、函数式编程
3. 状态修改和页面响应被抽象化封装到内部, 不易监测、调试
4. mobx 更适合业务不是很复杂、快速开发的项目


1. Redux 实现了Flux 模式，它是应用程序的可预测状态管理模式。它通过引入`单向数据流`和应用程序状态的集中存储来帮助管理应用程序的状态。
2. Mobx 实现了观察者模式，也称为发布-订阅模式。Mobx 提供了类似observable和的装饰器computed来定义可观察的状态和反应函数。用action修饰的动作用于修改状态，确保跟踪所有更改。

1. Redux 是一种更简单、更有主见的状态管理库，它遵循严格的单向数据流，并提倡不变性。它需要更多的模板代码和显式更新，但与 React 的集成度很高。
2. Mobx 提供的 API 更灵活、更直观，模板代码更少。它`允许你直接修改状态，并自动跟踪变化`以获得更好的性能。在 Redux 和 Mobx 之间做出选择取决于您的具体需求和偏好。



- **单向数据流**：actions => state => view => actions => ...


### redux-thunk 和 redux-sage 区别

1. redux-thunk `允许 action 是一个函数`, 当 aciton 是一个函数时会进行执行并传入 dispatch, 对于 redux-thunk 的整个流程来说, 它是`等异步任务执行完成之后, 我们再去调用 dispatch` , 然后去 store 去调用 reduces

2. redux-sage 则是 redux 的 action 基础上, `重新开辟了一个 async action 的分支, 单独处理异步任务`; sage 自己基本上完全弄了一套 asyc 的事件监听机制, 代码量大大增加;  redux-thunk 更简单, 和 redux 本身联系地更紧密, 尤其是整个生态都向函数式编程靠拢的今天, redux-thunk 的高阶函数看上去更加契合这个闭环




## 其他


### 如何提高组件的渲染效率的?


函数组件：
1. memo模拟PureComponent
2. 使用useMemo缓存变量
3. 使用useCallback缓存函数
4. 循环添加key, key最好用数组项的唯一值，不推荐用 index

1. 在类组件的时代时代, 为了性能优化我们经常会选择使用 PureComponent, 组件每次默认会对 props 进行一次 浅比较, 只有当 props 发生变更, 才会触发 render
2. 在函数组件中, React 贴心的提供了 React.memo 这个 HOC(高阶组件), 它的作用和 PureComponent 很相似, 只是它是专门为函数组件设计的
> React.memo: 默认情况下会对组件 props 进行 浅比较, `只有 props 变更才会触发 render`




### 哪些方法会触发 react 重新渲染?

- setState（）方法被调用: 执行 setState 会触发 render；但当 setState 传入 null 时，并不会触发 render。

- 父组件重新渲染：当组件的属性发生变化时，父组件重新渲染会导致子组件也重新渲染。这是 React 中`自顶向下数据流`的体现。
> 如果`组件的父组件重新渲染，即使组件的状态或属性没有变化，组件也会重新渲染`。这是因为 React 默认会进行比较，以确保 UI 的一致性。

- 调用 forceUpdate()：在某些特殊情况下，可以手动调用组件的 forceUpdate() 方法强制重新渲染组件。但是，这种方法通常不推荐使用，因为它会跳过 React 的性能优化机制，可能导致性能问题。

- 使用 Context：当组件所订阅的 Context 发生变化时，组件会重新渲染以反映最新的 Context 值。

- 使用 Hooks：在函数组件中使用 Hooks（如 useState、useEffect 等）时，当 Hooks 的状态发生变化时，会触发函数组件的重新渲染。




**Q: 重新渲染 render 会做些什么?**

- 会对新旧 VNode 进行对比，也就是我们所说的`Diff算法`。
- `对新旧两棵树进行一个深度优先遍历`; 遍历差异对象，根据差异的类型，根据对应对规则更新VNode


Reactv16以前的版本：
1. React 的处理 render 的基本思维模式是每次一有变动就会去重新渲染整个应用。
2. React 将 render 函数返回的虚拟 DOM 树与老的进行比较，从而确定 DOM 要不要更新、怎么更新。当 DOM 树很大时，遍历两棵树进行各种比对还是相当耗性能的，特别是在顶层 setState 一个微小的修改，默认会去遍历整棵树。




### 怎么实现React组件的国际化呢？

依赖于 i18next 的方案，对于庞大的业务项目有个很蛋疼的问题，那就是 json 文件的维护，不同语言的json维护比较繁琐；

现在大厂比较常用的方案是:` 使用 AST，每次开发完新版本，通过 AST 去扫描所有的代码，找出代码中的中文，以中文为 key，调用智能翻译服务，去帮项目自动生成 json 文件`。

这样，再也不需要人为去维护 json 文件，一切都依赖工具进行自动化。目前已经有大厂开源，比如滴滴的 `di18n`，阿里的 `kiwi`

- di18n：它能自动扫描代码中的主语言，将其替换成国际化标记；同时将语言抽取成配置，可以放到服务端保存及更新。




- 怎么防止HTML被转义：`dangerouslySetInnerHTML`




### 受控组件和非受控组件有什么区别？

受控组件和非受控组件之间的区别在于`它们如何管理和更新其状态`。

- 受控组件: 组件内部 state 或值完全受 prop 控制的组件
``` js
import { useState } from 'react'; 

function App() { 
  const [value, setValue] = useState(''); 

  return ( 
    <div> 
      <h3>Controlled Component</h3> 
      <input name="name" value={name} onChange={(e) => setValue(e.target.value)} />
      <button onClick={() => console.log(value)}>Get Value</button> 
    </div> 
  ); 
} 
```

- 非受控组件：组件内部 state或值不受 props 控制的组件, 由组件内部自己管理
``` js
import {useRef} from 'react';

function App() {
    const inputRef = useRef(null);
    return (
        <div className="App"> 
            <h3>Uncontrolled Component</h3> 
            <input type="text" name="name" ref={inputRef} /> 
            <button onClick={() => console.log(inputRef.current.value)}>Get Value</button> 
        </div> 
    )
}
```
> 如果要想拿到表单的 value 则只能通过 `ref` 等手段, 手动获取


1. 当组件状态(值)只由自身交换控制, 不受外部影响时, 可使用非受控组件
2. 当组件状态(值)除了受自身交换控制、还受到外部影响时；或当组件状态(值)和外部需要交换时, 可使用受控组件


### 基于类的 React 组件和函数式 React 组件有什么区别？

主要区别在于它们的定义方式和使用的语法。

- 基于类的组件被定义为 ES6 类并扩展该类React.Component。他们使用该render方法返回定义组件输出的 JSX (JavaScript XML)。this.state类组件可以通过和访问组件生命周期方法和状态管理this.setState()。

- 函数组件被定义为简单的 JavaScript 函数。他们接受 props 作为参数并直接返回 JSX。功能组件无权访问生命周期方法或状态。然而，随着 React 16.8 中 React Hooks 的引入，功能组件现在可以管理状态并使用其他功能.




### react框架的diff算法是怎么进行优化的呢，能从v15、v16、v17、v18各版本的优化展开说说吗？

React 框架的 Virtual DOM diff 算法是针对 Virtual DOM 的更新过程进行优化的，主要目标是尽量减少实际 DOM 操作的次数，以提高性能。

- `React v15`：

1. React v15 中的 diff 算法是基于递归遍历的方式，即`深度优先遍历`。在进行组件更新时，React 会逐层比较 Virtual DOM 树的节点，并找出需要更新的节点，然后将这些更新应用到实际的 DOM 上。
2. React v15 中的 diff 算法存在一些性能问题，特别是在比较复杂的 Virtual DOM 树时，可能会导致性能下降，因为每次更新都需要完全比较整个 Virtual DOM 树

- `React v16`：

1. React v16 引入了 Fiber 架构来对整个更新过程进行重新设计和优化。`Fiber 架构允许 React 在执行更新过程中暂停、中断和恢复更新`，从而更好地控制更新过程的优先级，提高用户界面的响应速度。
2. 在 React v16 中，diff 算法的实现并没有显著变化，但由于 Fiber 架构的引入，React 能够更灵活地管理更新过程，提高更新的性能和效率。

**Fiber 架构**将渲染工作分解为多个小任务单元，可以将一次大的渲染任务拆分为多个小任务，在每个任务之间可以让出主线程，从而提高页面的响应速度，使用户能够更快地看到页面内容。
>  通俗来说，就是把整个虚拟 DOM 树微观化，变成`链表`，然后我们利用浏览器的空闲时间计算 Diff。一旦浏览器有需求，我们可以把没计算完的任务放在一旁，把主进程控制权还给浏览器，等待浏览器下次空闲。

> 通过链表的方式，React 可以在渲染过程中轻松地中断当前任务的执行，并记录下一次需要执行的任务，从而实现任务的暂停和恢复。当浏览器空闲时，React 可以根据优先级重新调度任务的执行，保证任务的及时执行并提高用户界面的响应速度。


- `React v17`:
1. 在React 17中，并没有对diff算法进行直接的优化，但引入了新的`JSX Transform`语法，使得开发者可以使用更简洁的语法来编写React组件。
2. 此外，React 17还移除了部分已废弃的API和生命周期方法，如`componentWillMount、componentWillReceiveProps和componentWillUpdate`等，使得React的API更加清晰和一致。

- `React v18`：
1. 在React 18中，主要关注的是`并发模式（Concurrent Mode）`的优化。并发模式`允许React在更新过程中暂停和恢复`，从而提高了应用的响应性和性能。为了支持并发模式，React 18对diff算法进行了进一步的优化。例如，它引入了新的调度器（Scheduler）和任务优先级（Task Priorities），使得React可以更加智能地管理组件的更新和渲染。
2. 此外，React 18还引入了新的API，如startTransition和useTransition，使得开发者可以更方便地控制组件的更新优先级和过渡效果。




### react v18 的并发模式是什么？

> React v18 的`并发模式（Concurrent Mode）`是一种底层设计，它使 React 能够同时准备多个版本的 UI，而无需在每次状态变更后都立即渲染整个应用。这一模式在 React v17 中已经开始试用，但在 React v18 中才正式得到应用。

并发模式本身并不是一个新功能，而是一种`改进 React 更新机制`的方式。`在传统的 React 更新流程中，一旦状态发生变更，React 会开始准备虚拟 DOM，然后进行渲染。这个流程是串行的，一旦开始，就无法中断，直到整个更新流程完成。这可能会导致应用在处理大型更新时出现卡顿或延迟`。

而并发模式通过`引入异步渲染和可中断的更新流程`来解决这个问题。它`允许 React 在准备新的 UI 版本时，将部分工作放在后台进行，从而避免阻塞主线程`。这意味着应用可以更加流畅地响应用户输入和其他实时事件，即使在进行大型更新时也是如此。

此外，并发模式还引入了“时间切片”（Time Slicing）的概念。`时间切片允许 React 将渲染工作分割成更小的单元，并在主线程的空闲时间中进行处理`。这进一步提高了应用的响应性和性能。

需要注意的是，并发模式并不会自动提高应用的性能。开发者仍然需要遵循最佳实践，如避免不必要的重新渲染、使用纯组件等，以确保应用能够充分利用并发模式带来的优势。

总的来说，React v18 的并发模式是一种改进 React 更新机制的底层设计，它通过引入异步渲染、可中断的更新流程和时间切片等概念，提高了应用的响应性和性能。



### Vue 需不需要 React 的 Fiber 呢？

不需要；最早Vue3的提案其实是包含时间切片方案的，最后废弃的主要原因，是时间切片解决的的问题，Vue3基本碰不到

1. Vue3`把虚拟Dom控制在组件级别`，组件之间使用响应式，这就让Vue3的虚拟Dom不会过于庞大；
2. Vue3虚拟Dom的`静态标记和自动缓存功能`，让静态的节点和属性可以直接绕过Diff逻辑，也大大减少了虚拟Dom的Diff事件；
3. 时间切片也会带来额外的系统复杂性



### 对于同一个 DOM 分别绑定原生事件、合成事件, 在原生事件中阻止事件冒泡为什么会阻止合成事件的执行？

`合成事件是事件委托的一种实现`, 主要是利用事件冒泡机制将所有事件在 document 进行统一处理, 根据 事件流, 事件执行顺序为: `捕获阶段、目标阶段、冒泡阶段`,
当我们在原生事件上阻止事件冒泡, 那么事件就无法冒泡到 document, 那么合成事件自然无法执行！




###  React 中 setState() 为什么是异步的?

本质上来讲 setState 是同步的, 之所以出现异步的假象是`因为要进行 状态合并 或者说是 批处理, 需要等生命周期、事件处理器执行完毕, 再批量修改状态`! 当然在实际开发中, 在合成事件和生命周期函数里, 完全可以将其视为异步的

1. 保证 state 和 props 的一致性；props 必然异步, 因为只有因为当父组件重渲染了我们才知道 props

2. 提高性能: 在渲染前会有意地进行 等待, 直到所有在组件的事件处理函数内调用的 `setState()` 完成之后, 统一更新 state, 这样可以`通过避免不必要的重新渲染来提升性能`



### react v16, v17, v18 的区别？

`React v16.8.0`引入了Hooks，这是一种新的API，可以让函数组件拥有类组件的功能，如状态管理和生命周期函数。Hooks的引入使得React的代码更加简洁，易于维护和测试。然而，需要注意的是，React v16版本中的一些生命周期函数，如componentWillMount、componentWillReceiveProps和componentWillUpdate，由于可能导致性能问题，被标记为不安全，并在后续版本中弃用。

React v17则主要是一个稳定版本，没有引入太多新的功能。它的主要目标是为了解决React版本升级时的问题，使得React的升级更加平滑和可预测。这个版本主要侧重于升级简化React本身，为后续的版本（如v18、v19等）能够更平滑、更快速地升级打下基础。

至于React v18，它的变化还没有完全确定，但预计将引入一些新的功能，如`异步渲染、并发模式、服务器端渲染`等。这些新功能将使得React更加强大和灵活，可以满足更多的应用场景。

总的来说，React v16、v17和v18之间的区别主要体现在新功能和改进上。每个版本都有其独特的特点和目标，以满足不断变化的应用需求。

[一文解读 React 17 与 React 18 的更新变化](https://segmentfault.com/a/1190000042680491)




### React v18 更新内容有哪些？

1. 在 React 18 之后`所有的更新都将自动批处理`
> 在 React 18 之前, 在`合成事件、生命周期`中如果多次修改 state, 会进行批处理, 然后只会触发一次 render; 在`定时器、promise.then、原生事件`处理函数中不会进行批处理


2. `ReactDOM.createRoot`
  - `ReactDOM.render`：未开启并发模式，未开启自动批处理
  - createRoot：开发并发模式, 开启自动批处理


3. 几个新的API: 
  - `useId`: 生成唯一性的id; 原理：通过该组件在组件树中的层级结构来生成 id
  - `useInsertionEffect`: 这个 Hooks 执行时机在 DOM 生成之后, useLayoutEffect 之前, 一般用于提前注入 `<style>` 脚本



### react中引入css有哪些方式？

1. 内联样式（Inline Styles）：直接在JSX中通过style属性来添加CSS样式。

2. CSS Modules：CSS Modules是一种将CSS类名局部化的技术，它通过`在编译时生成唯一的类名来避免全局样式冲突`。

``` js
import styles from './styles.module.css';  
  
<div className={styles.hello}>Hello, World!</div>
```

3. CSS-in-JS库：有一些库，如`styled-components`和emotion，它们允许你在JavaScript中直接编写CSS样式。这种方式可以让你在组件中直接定义样式，而且可以利用JavaScript的变量和函数来动态生成样式。

``` js
import styled from 'styled-components';  
  
const StyledDiv = styled.div`  
  color: red;  
  font-size: 16px;  
`;  
  
<StyledDiv>Hello, World!</StyledDiv>
```

4. 全局CSS：如果你的React应用是一个单页应用（SPA），你也可以像在传统的前端开发中一样，通过`<link>`标签在HTML中引入全局的CSS文件。


5. Tailwind CSS: 流行的实用型 CSS 解决方案。它提供了预定义的 CSS 类，这使得开发人员更高效，并简化了 React 应用的设计系统。



### react的setState和useState有什么异同？

1. 用法：

- setState：这是`类组件中用于更新状态的方法`。通常，在类组件的构造函数中初始化状态，然后可以使用this.setState()方法来更新状态。当状态更新时，组件会重新渲染

`this.setState({name: 'xxx'}, callback)`; callback在状态更改, 视图更新完毕后执行

- useState：这是`函数组件中用于管理状态的Hook`。它接受一个初始状态作为参数，并返回一个包含当前状态和一个更新状态函数的数组。你可以使用这个数组来读取和更新状态。每次状态更新时，组件都会重新渲染

`[name, setName] = useState('')`

2. 同步与异步

setState和 useState 只在`合成事件`如onClick等和钩子函数包括`componentDidMount、useEffect`等中是“异步”的，在`原生事件`和 setTimeout、Promise.resolve().then 中都是同步的。


这里的“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是`合成事件和钩子函数的调用顺序在更新之前`，导致在合成事件和钩子函数中没法立马拿到更新后的值，形式了所谓的“异步”。


`批量更新优化`也是建立在“异步”（合成事件、钩子函数）之上的，在原生事件和setTimeout、Promise.resolve().then 中不会批量更新；在“异步”中如果对同一个值进行多次修改，批量更新策略会对其进行覆盖，取最后一次的执行，结果只会产生一次render。

> 假如在一个合成事件中，循环调用了setState方法n次，如果 React 没有优化，当前组件就要被渲染n次，这对性能来说是很大的浪费.


**但要注意的是：**

在React18中，this.setState的操作都是异步的，不论在哪执行（例如：合成事件、周期函数、定时器）目的：为了实现状态的批处理（统一处理）
这样有效的减少更新次数，降低消耗性能，代码逻辑顺序更加清晰
> 原理：`利用了更新队列机制`

在React18之前，只在React合成事件/周期函数期间进行批量更新；默认情况下，不会对promise、setTimeout、原生事件进行批处理操作




### ReactDOM.render和ReactDOM.createRoot的区别？


`ReactDOM.render`：这是React中最常用的渲染方法。当你想要显式渲染一个React组件到DOM中时，你会使用这个方法。它会直接渲染给定的React元素到指定的容器DOM元素中，并替换容器内的所有内容。这种方式是同步的，意味着它会阻塞其他代码的执行直到渲染完成。

`ReactDOM.createRoot`：这是React 18及更高版本中引入的新方法，`用于启用新的并发模式和异步渲染`。它`创建了一个可以异步渲染的根容器，并返回一个具有render方法的对象`。这个render方法可以用来渲染React组件，但与ReactDOM.render不同，它是异步的，不会阻塞其他代码的执行。

> createRoot可以`在不阻塞主线程的情况下进行渲染工作`。这有助于提高应用的响应性和性能，特别是在处理大量数据或复杂的UI时。



### React 元素中 $$typeof 的作用?

用于标识 React 元素, 该属性值为 Symbol, 主要为了防止 XSS 攻击

`XSS攻击`：攻击者注入恶意指令代码到网页, 使用户加载并执行攻击者恶意制造的网页程序

1. 已知 JSX 语法将被编译为 React.createElement 后返回一个对象(React 元素)，该对象中有`$$typeof`属性：`Symbol.for('react.element')`，表示为react元素；
2. 由于服务器可以存储任意的 JSON 数据, 如果在没有 `$$typeof` 情况下, 就很容易被伪造(手动创建 React 元素, 在页面进行注入)
3. 由于 JSON 不支持 Symbol 类型数据, 所以只要在 React 元素中添加 Symbol 类型数据 `$$typeof`, React 在处理元素时只需通过 $$typeof 就能够识别出 非法元素(伪造元素)
4. 如果浏览器不支持，但是 React 仍然会加上 `$$typeof` 字段以保证一致性；
> 但这样只会设置一个数字 —— `0xeac7`; 而之所以设置 `0xeac7`, 只是因为 `0xeac7` 看起来有点像 React




### 为什么 hooks 不能写在循环或者条件判断语句里?
> react官网介绍：`不要在循环，条件或嵌套函数`中调用 Hook，确保总是在你的 React 函数的最顶层以及任何 return 之前调用他们。

React 需要利用 `调用顺序` 来正确更新相应的状态, 以及调用相应的钩子函数, 一旦在循环或条件分支语句中调用 Hooks, 就容易导致调用顺序的不一致性, 从而产生难以预料到的后果

这里拿 useState 来举例:

1. hooks 为了在函数组件中引入状态, 维护了一个`有序表`; 
2. 首次执行时会将每个 `useState` 的初始值, `依次` 存到有序表里; 每次更新也都会按照 `索引` 修改指定位置的值; 每次 `render` 会将对应 `索引` 的值作为状态返回
3. 那么试想下, 如果我们将 useState 写在判断条件下, 可能会导致 useState 不执行, 那么这个有序列表就会出现混乱

Q: 如何打破了 React Hook 必须按顺序、不能在条件语句中调用的枷锁?
> 之前是通过顺序来查找, 可以通过唯一 key 来查找



### 为什么 useState 返回的是一个数组?

> useState 要返回两个值, 一个是当前状态, 另一个则是修改状态的方法, 那么这里它就有两种方式可以返回这两个值: `数组、对象`

1. 数组的元素是按次序排列的, `数组解构时变量的取值由数组元素的位置决定, 变量名可以任意命名`

2. 对象的属性没有次序, 解构时变量名必须与属性同名才能取到正确的值, 假设 useState 返回的是一个对象, 那么就得这么使用:

``` js
const { state: name, setState: setName } = useState()
const { state: age, setState: setAge} = useState()
```

useState 返回数组相比于对象会更灵活、解构起来也会更简洁、方便



### React性能优化？

1. **跳过不必要的组件更新**
  - PureComponent、React.memo、shouldComponentUpdate
  - useMemo、useCallback 来生成稳定值
  - 列表项使用 key 属性

2. **组件按需挂载**: 
  - 懒加载: 通过 `Webpack` 的动态导入和 `React.lazy` 方法来实现
  - 懒渲染: 懒渲染指当组件进入或即将进入可视区域时才渲染组件, 常见的组件 `Modal/Drawer` 等
  - 虚拟列表

3. **批量更新**:
  - 类组件, setState 自带批量更新操作
  - 函数组件, 尽量将相关的状态进行合并, 然后进行批量更新

4. **缓存优化**:
  - React 组件中常用 useMemo 缓存上次计算的结果, 一般用在计算非常耗时的场景中, 如: 遍历大列表做统计信息, 当然 useMemo 只能缓存上一次结果, 如果需要缓存结果则需要自定义一个缓存表, 进行处理
  - 当然对于接口数据缓存来说, 如果实时性比较高的, 那么我们可以先取缓存时间, 然后通过 `requestIdleCallback` 在系统闲暇时重新发起请求获取数据, 这样在请求比较耗时情况下, 可以优化用户的体验

5. 通过 debounce、throttle 优化频繁触发的回调函数

6. 其他：
  - 在组件中为 window 注册的全局事件、定时器等, 在组件卸载前要清理掉. 防止组件卸载后继续执行影响应用性能
  - 使用 Fragment 避免额外标记
  - 不要使用内联函数定义
  - 避免使用内联样式属性
  - 为组件创建错误边界


::: tip 总结
- 如果是因为存在不必要更新的组件进入了 Render 过程, 则选择`跳过不必要的组件更新`进行优化
- 如果是因为页面挂载了太多不可见的组件, 则选择 `懒加载、懒渲染 或 虚拟列表` 进行优化。
- 如果是因为多次设置状态, 引起了多次状态更新, 则选择`批量更新或 debounce(防抖)、throttle(节流) `优化频繁触发的回调进行优化
- 如果组件 Render 逻辑的确非常耗时, 我们需要先定位到耗时代码(这里我们可以选择使用 React 官方提供的性能分析插件、或者使用 chrome 自带的性能分析插件), 并判断能否通过缓存优化它, 如果可以则选择缓存优化, 否则选择按优先级更新, 及时响应用户, 将组件逻辑进行拆解, 以便更快响应用户
:::



### 使用 React 需要注意的事项有哪些?

1. state 不可直接进行修改
2. 不要在`循环、条件或嵌套函数`中调用 Hook, 必须始终在 React 函数的顶层使用 Hook
3. 列表渲染需要设置唯一且稳定的 key
4. 不要忘记以大写字母作为组件的名称开头
5. 最好保持组件的代码量较少, 一个组件对应一个功能, 这样不仅可以节省我们的时间, 也有助于我们调试代码
6. `类组件中注意 this 指向`: 在 JSX 中给 DOM 绑定事件时, 回调函数默认情况下无法访问当前组件, 即回调函数中 this 不可用, 一般情况下我们可以通过 bind() 来改变函数的上下文来使其可用, 当然这里其实还可以使用箭头函数声明函数
7. `不要过度使用 Redux`: 尽管 Redux 很有用, 但您无需使用它来管理应用程序中的每个状态


### react中props更新后，子组件都会重新渲染吗

`当React中的父组件的props更新后，会导致子组件重新渲染。`这是因为React使用了一种称为“props向下传递”（props are passed down）的机制，即父组件的更新状态或props会传递给子组件，从而导致子组件重新渲染。

然而，React团队也提供了一些优化手段来避免不必要的渲染。例如，可以使用`shouldComponentUpdate`生命周期方法或`React.memo高阶组件`来包裹函数组件，这样`只有当props或state真正发生变化时，组件才会重新渲染`。这种技术被称为“纯组件”（pure component）或“记忆化组件”（memoized component），它们可以帮助提高React应用程序的性能。

如果你使用的是函数组件和Hooks，你可以使用useMemo和useCallback来避免不必要的计算和渲染。