---
title: LangChain学习笔记
date: 2025-12-13 09:50:48
permalink: false
categories:
  - AI
tags:
  - AI
  - LangChain
---

# LangChain学习笔记

[LangChain](https://github.com/langchain-ai) 是一个`开源的基于 LLM 的上层应用开发框架，LangChain 提供了一系列的工具和接口，让开发者可以轻松地构建和部署基于 LLM 的应用 `。LangChain 围绕将不同组件“链接”在一起的核心概念构建，简化了与 GPT-3.5、GPT-4 等 LLM 合作的过程，使得我们可以轻松创建定制的高级用例。

Langchain 是一套开源的基于 LLMs 开发应用程序的开发框架（解决方案），框架支持 python 和 Node.js 两种语言，同时提供 LangSmith、LangGraph、LangServe 等多种配套框架或方案。

[langchain.js文档](https://js.langchain.com/docs/introduction/)、[LangChain JS/TS 中文文档](https://js.langchain.com.cn/docs/)

[Langchain.js 入门及应用：HelloWorld、模型集成、PromptTemplate、LangSmith](https://juejin.cn/post/7470344960564740136)

[LangGraph](https://github.com/langchain-ai/langgraphjs)：流程构建框架，可以理解为一个 DAG 的框架，不过支持更加复杂的循环、人工介入、持久化、断点恢复等能力


## LangChain


LangChain是由多个组件组成的：
- `Models`：模型，比如GPT-4o
- `Prompts`：提示，包括提示管理、提示优化和提示序列化
- `Memory`：记忆，用来保存和模型交互时的上下文
- `Indexes`：索引，用于结构化文档，方便和模型交互；如果要构建自己的知识库，就需要各种类型文档的加载，转换，长文本切割，文本向量计算，向量索引存储查询等
- `Chains`：链，一系列对各种组件的调用
- `Agents`：代理，决定模型采取哪些行动，执行并且观察流程，直到完成为止


LangChain提供了一套工具、组件和接口，简化了创建LLM应用的过程


### LangChain 1.0版本变化

**LangChain 从 0.3X 到 1.X 发生了结构性变化（概念性没变）：**

1. 包结构完全重构：
- `langchain-core`：只放抽象基类与` LangChain Expression Language（LCEL）`，所有第三方集成都不直接依赖完整 langchain。
- `langchain-community`：社区维护的几十种 loader、retriever、tool 等实现。合作伙伴包独立成库，例如 langchain-openai、langchain-anthropic，体积更小、升级更灵活

2. 新增官方子项目
- `LangGraph`：用“图”编排多步、多角色、有状态的工作流，替代过去靠多重 Chain 嵌套的写法。
- `LangServe`：一键把链/代理封装成 REST API，自带 /invoke、/stream、/batch 端点与 Swagger 页面。
- `LangSmith`：可视化调试、回归测试、在线监控平台，与 1.X 的回调系统深度打通。

3. API 风格全面转向 LCEL（链式表达式）
鼓励用 `|` 运算符把组件拼成 Runnable，而不是继承 Chain 基类。


### LangChain整体架构

::: tip 组件说明
- `LLM / ChatModel`：大语言模型的封装，LLM 用于文本补全，ChatModel 用于对话（支持 tool calling）
- `Prompt Template`：提示词模板，支持变量替换，将用户输入格式化为LLM 能理解的 prompt
- `Chain`：将多个组件串联，如 `prompt | llm`，数据依次流经各组件
- `Agent`：智能代理，能根据用户问题自主决策调用哪些工具
- `Tools`：工具集，扩展 Agent 能力，如搜索、计算、数据库查询等
- `Memory`：记忆组件，保存对话历史，实现多轮对话
- `Indexes/Retrievers（索引与检索）`： 用于结构化外部文档，是实现 RAG 的基础 。
:::


### Tools

`Serpapi`工具: 支持Google, Baidu, Yahoo, Ebay, YouTube等多种API查询，让LangChain可以使用Serpapi工具（Google搜索API）进行问题的解答, [serpapi](https://serpapi.com/)
- 安装：`pip install google-search-results`
- 然后进入到官网，注册账号，获取api_key, `.env`中添加`SERPAPI_API_KEY`

除了预置工具，还可以用 @tool 装饰器创建自定义工具:
``` python
from langchain.tools import tool

@tool
def search(query: str) -> str:
    """Search the web for the query.""" # 搜索工具的描述, 会被AI用于判断是否调用该工具
    # 实现搜索逻辑
    return "搜索结果"
```

### Memory

Chains 和 Agent之前是无状态的，如果你想让他能记住之前的交互，就需要引入**内存**可以让LLM拥有短期记忆


在LangChain中提供了几种短期记忆的方式：
- **BufferMemory**：将之前的对话完全存储下来，传给LLM；`200k`
- **BufferWindowMemory**：最近的K组对话存储下来，传给LLM；`k=5`
- **ConversionMemory**：对对话进行摘要，将摘要存储在内存中，相当于将压缩过的历史对话传递给LLM
- **VectorStore-backed Memory**：将之前所有对话通过向量存储到VectorDB（向量数据库）中，每次对话，会根据用户的输入信息，匹配向量数据库中最相似的K组对话；`RAG`

```
MessagesPlaceholder 用于在 Prompt 中插入历史消息
RunnableWithMessageHistory 自动管理消息历史
session_id 用于区分不同用户/会话
```


### ReAct范式

`ReAct = Reason + Act`

将推理和动作相结合，克服LLM胡言乱语的问题，同时提高了结果的可解释性和可信赖度

人们在从事一项需要多个步骤的任务时，在步骤和步骤之间，或者动作和动作之间，一般都会有推理过程


### Agent

Agent 的核心是把 LLM 当作推理引擎，让它能使用外部工具，以及自己的长期记忆，从而完成灵活的决策步骤，进行复杂任务

LangChain 里的 Chain 的概念，是由人来定义的一套流程步骤来让 LLM 执行，可以看成是把LLM 当成了一个强大的多任务工具

典型的 Agent 逻辑（比如 ReAct）：
1. 由 LLM 选择工具。
2. 执行工具后，将输出结果返回给 LLM
3. 不断重复上述过程，直到达到停止条件，通常是 LLM 自己认为找到答案了



### LCEL构建任务链

LCEL 是 LangChain 推出的链式表达式语言，支持用`|`操作符将各类单元（如Prompt、LLM、Parser等）组合。每个"|"左侧的输出会自动作为右侧的输入，实现数据流式传递。

优势：
- 代码简洁，逻辑清晰，易于多步任务编排。
- 支持多分支、条件、并行等复杂链路。
- 易于插拔、复用和调试每个子任务。

典型用法：
- 串联：A | B | C，A的输出传给B，B的输出传给C。
- 分支：{"x": A, "y": B}，并行执行A和B。
- 支持流式：如 .stream() 方法可边生成边消费。

LangChain 采用组件化的方式，核心优势是把 Prompt、Model、Memory、Retriever 都做成了标准积
木（Runnable）。

LangChain 的核心优势：
- 生态丰富：支持 100+ 模型、50+ 向量数据库、大量预置工具
- `LCEL` 管道语法：直观的链式调用，支持流式/批处理/异步
- `@tool` 装饰器：最简洁的工具注册方式
- 完善的记忆管理：`session_id` 机制支持多用户并发

| 场景 | 说明 |
| :--- | :--- |
| 工具调用型 Agent | 网络诊断、数据查询、API 调用等需要多工具协作的场景 |
| 多轮对话系统 | 客服机器人、智能助手等需要记忆上下文的场景 |
| 复杂流程编排 | 使用 LCEL 构建多步骤处理流程 |
| 快速原型开发 | 丰富的组件库，快速搭建 POC |


**Q：LangChain LCEL 解决了哪些工程化痛点？**

早期的面向对象基类（如 LLMChain）存在黑盒化严重、难以调试的问题。LCEL 的重构优势体现在：

- **声明式的数据流编排**：借鉴了 Unix 管道的设计理念，直接使用 `|` 符（如 `prompt | llm | output_parser`）将不同组件串联。输入和输
出的数据流向极其直观，大幅降低了多步任务嵌套和条件分支编排的代码复杂度。
- **原生支持企业级生产特性**：传统架构要实现流式输出（Streaming）或异步操作，需要改写底层逻辑。采用 LCEL 组装的链路原生自带高阶特性：直接调用 `.stream()` 实现打字机效果，或调用 `.abatch()` 实现异步高并发批处理 => 不需要修改内部组件逻辑，降低了部署成本



**Q: 极简的并行化处理 (RunnableParallel)解决了什么痛点？**

在传统架构中，如果想同时调用两个检索器（Retriever），或者让两个大模型并行处理数据后再合并，需要我们手写多线程代码 => 不仅增加代码量，还容易出现线程安全问题。**LCEL 原生支持字典形式的自动并行**，比如 `{"context": retriever, "question": RunnablePassthrough()} | prompt | llm`，在这个表达式中，系统会自动并行执行检索上下文和透传问题，最后再统一喂给 prompt。=> **降低复杂 Agent 链路的响应延迟**

LangChain 底层会自动将这个字典转化为 **RunnableParallel（并发运行器）**。这意味着字典里的每一个 `Key-Value` 对，不是排队挨个执行的，而是开启多线程（或异步任务）同时起跑的。


**Q：LCEL 的 Runnable接口的作用是什么？**

Runnable 接口统一了 `invoke、stream、batch` 等调用方式。比如同一 chain 可用：
- `chain.invoke(...)` 基础单次调用，最标准的一问一答模式。场景：适合后台跑批的单次任务，或者对响应时间要求不高、且不需要前端实时交互的场景。
- `chain.stream(...)` 流式输出，返回一个 Python 生成器（Generator/Iterator）。大模型每吐出一个 Token，它就立刻把这个 Token 传出来。场景：现代 AI 聊天界面（打字机效果）。
- `chain.abatch([q1,q2,q3])` 异步批量并发，传入包含多个输入的列表，框架会自动在底层开启并发（利用 asyncio），同时处理这批数据。场景：数据分析与高吞吐量后台处理。

便于 A/B 测试（对比不同 prompt 版本）和监控埋点（在 invoke 前后记录延迟、Token 消耗）

> 在早期的 LangChain 中，Prompt 是个模板对象，大模型用 `.predict()` 生成，解析器用 `.parse()` 解析。它们的方法名都不一样，你想把它们串起来，还得自己写胶水代码。如果想改成流式输出（Streaming），更是要把底层的回调函数（Callbacks）全改一遍。

**LCEL 强制所有组件都必须继承 Runnable 基类**。无论是底层的 `PromptTemplate、ChatOpenAI、StrOutputParser`，还是你自己写的一个 Python 函数，或者是把它们用 `|` 串联起来形成的一条长长的 Chain。=> 在系统眼里，它们全都是一个 Runnable 对象，都必须自带以下这套标准接口：
- 同步组：`invoke (单次调用), stream (流式), batch (批处理)`
- 异步组：`ainvoke, astream, abatch`

> LCEL 的 `{“key1”: task1, “key2”: task2}` 语法，让开发者完全不需要手动写 asyncio(并发) 或多线程代码 => 原生实现这些 I/O 任务的并发获取。


## 《从前端到 AI：LangChain.js 入门和实战》学习笔记

掘金小册：[从前端到 AI：LangChain.js 入门和实战](https://juejin.cn/book/7347579913702293567)

### 什么是 LCEL ？
- LCEL（LangChain Expression Language）是 LangChain 的声明式“管道语言”，用来把一组可运行的步骤（Prompt、模型、解析器、工具等）像积木一样组合起来。
- 它以“可组合的 Runnable”为核心，支持同步/异步、批量、流式等统一的执行语义，让链式流程既简洁又健壮。
- 你项目中看到的 RunnableConfig （如 @langchain/core/runnables ）就是 LCEL 的配置入口，用来设置并发、超时、回调、标签等运行时行为。

LCEL 的思想是把 llm app 开发中的每个节点抽象化成 runnable 节点，并通过一系列的 langchain 提供了工具函数帮助开发者组合成自己需要的 chain，更加模块化，且 langchain 内部也更容易对每个 runnable 根据依赖关系做并行化的处理。


### Runnable接口是什么?
Runnable接口是一个抽象协议，它定义了一系列标准方法，使得任何实现了该接口的类都可以被组合到LCEL链中。这个接口提供了同步和异步的调用方法，以及批处理和流式处理的方法，从而使得不同的组件（如提示模板、模型、输出解析器等）能够以统一的方式相互连接。

``` js
Runnable接口要求实现以下方法（不一定全部实现，但至少实现一部分）：
invoke(input: Any, config: Optional[RunnableConfig] = None) -> Any: 同步调用，处理单个输入。
ainvoke(input: Any, config: Optional[RunnableConfig] = None) -> Any: 异步调用，处理单个输入。
batch(inputs: List[Any], config: Optional[RunnableConfig] = None) -> List[Any]: 同步批处理。
abatch(inputs: List[Any], config: Optional[RunnableConfig] = None) -> List[Any]: 异步批处理。
stream(input: Any, config: Optional[RunnableConfig] = None) -> Iterator[Any]: 同步流处理。
```
通过实现这些方法，任何类都可以成为LCEL链中的一个组件，并且可以使用管道符|与其他组件连接。

Runnable接口是LCEL的基石，它提供了一套标准的方法，使得不同的组件能够以统一的方式被调用和组合。通过实现这个接口，LangChain的各个组件可以无缝地连接在一起，构建出强大而灵活的语言模型应用。

### PromptTemplate
PromptTemplate 是帮助我们定义一个包含变量的字符串模版，我们可以通过向该类的对象输入不同的变量值来生成模版渲染的结果
``` js
import { PromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate  } from "@langchain/core/prompts";

const translateInstructionTemplate = SystemMessagePromptTemplate.fromTemplate(`你是一个专
业的翻译员，你的任务是将文本从{source_lang}翻译成{target_lang}。`);
const userQuestionTemplate = HumanMessagePromptTemplate.fromTemplate("请翻译这句话：{text}")

const chatPrompt = ChatPromptTemplate.fromMessages([
  translateInstructionTemplate,
  userQuestionTemplate,
]);

const formattedChatPrompt = await chatPrompt.formatMessages({
  source_lang: "中文",
  target_lang: "法语",
  text: "你好，世界",
});

console.log(formattedChatPrompt)
```


### OutParser
langchain 封装了一系列的解析大模型 API 返回结果的工具让我们方便的使用, 比如 StringOutputParser 可以将大模型的返回结果转换为字符串。

``` js
import { StringOutputParser, StructuredOutputParser, CommaSeparatedListOutputParser  } from "@langchain/core/output_parsers";
```


### DocumentLoader
DocumentLoader 是 langchain 提供的一个文档加载器，它可以帮助我们从不同的数据源加载文档，比如文本文件、PDF 文件、网页等。

``` js
import { TextLoader } from "langchain/document_loaders/fs/text";
const loader = new TextLoader("data/qiu.txt");
const docs = await loader.load();

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
const loader = new PDFLoader("data/github-copliot.pdf");
const pdfs = await loader.load()
console.log(pdfs) // 
// Document {
//   pageContent: ".....",
//   metadata: {
//     source: "data/github-copliot.pdf",
//     ...
//   }

// 基于某个开源项目构建数据库，然后根据用户提问寻找与此相关的代码片段回答用户问题
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import ignore from "ignore";
const loader = new GithubRepoLoader(
    "https://github.com/RealKai42/qwerty-learner",
    { 
        branch: "master", // 分支
        recursive: false,  // 是否递归
        unknown: "warn", 
        ignorePaths: ["*.md", "yarn.lock", "*.json"],
        accessToken: env["GITHUB_TOKEN"] // github API 的 accessToken
    }
  );

// 爬取网页数据
import "cheerio";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
const loader = new CheerioWebBaseLoader(
  "https://kaiyi.cool/blog/github-copilot",
  {
    selector: "h3", // 标签过滤
  }
);
const docs = await loader.load(); 

// google搜索能力，需要申请 API key
import { SerpAPILoader } from "langchain/document_loaders/web/serpapi";
const apiKey = env["SERP_KEY"]
const question = "什么 github copliot"
const loader = new SerpAPILoader({ q: question, apiKey });
const docs = await loader.load();
```

### RecursiveCharacterTextSplitter
RecursiveCharacterTextSplitter 是 langchain 提供的一个文本分割器，它可以帮助我们将长文本分割成多个短文本，方便我们后续的处理。这是最常用的切分工具，他根据内置的一些字符对原始文本进行递归的切分，来保持相关的文本片段相邻，保持切分结果内部的语意相关性。
``` js
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("data/kong.txt"); // 加载文本文件
const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 64, // 定义了切分结果中每个块的大小，这决定了 LLM 在每个块中能够获取的上下文。需要根据数据源的内容类型来制定，如果太大一个块中可能包含多个信息，容易导致 LLM 分神，并且这个结果会作为对话的上下文输入给 LLM，导致 token 增加从而增加成本。如果过小，则可能一个块中无法包含完整的信息，影响输出的质量。
    chunkOverlap: 4, // 定义了块和块之间重叠部分的大小，因为在自然语言中内容是连续性的，分块时一定的重叠可以让文本不会在奇怪的地方被切割，并让内容保留一定的上下文。较大的 chunkOverlap 可以确保文本不会被奇怪地分割，但可能会导致重复提取信息，而较小的 chunkOverlap 可以减少重复提取信息的可能性，但可能会导致文本在奇怪的地方切割。
  });

const splitDocs = await splitter.splitDocuments(docs);
// [
//   Document {
//     pageContent: "鲁镇的酒店的格局，是和别处不同的：都是当街一个曲尺形的大柜台，柜里面预备着热水，可以随时温酒。做工的人，傍午傍晚散了工，每每花四",
//     metadata: { source: "data/kong.txt", loc: { lines: { from: 1, to: 1 } } }
//   },
//   Document {
//     pageContent: "每每花四文铜钱，买一碗酒，——这是二十多年前的事，现在每碗要涨到十文，——靠柜外站着，热热的喝了休息；倘肯多花一文，便可以买一碟盐煮笋，",
//     metadata: { source: "data/kong.txt", loc: { lines: { from: 1, to: 1 } } }
//   },
//   ...
// ]


import { SupportedTextSplitterLanguages } from "langchain/text_splitter"; // 支持语言
const js = `
function myFunction(name,job){
	console.log("Welcome " + name + ", the " + job);
}
`;

const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
  chunkSize: 64,
  chunkOverlap: 0,
});
const jsOutput = await splitter.createDocuments([js]);

```

### Vector store
向量数据库是一种特殊的数据库，它可以将文本、图像、音频等非结构化数据转换为向量表示，从而可以在数据库中进行高效的相似度搜索。
``` js
import { OpenAIEmbeddings } from "@langchain/openai";
const embeddings = new OpenAIEmbeddings()
const res = await embeddings.embedQuery(splitDocs[0].pageContent) // 在 embedding 的时候，模型关注的就是 pageContent，并不会关心 metadata 的部分

// Vector store 提供提供的是存储向量和原始文档，并且提供基于向量进行相关性检索的能力。Langchain 提供了用于测试时，在内存中构建的向量数据库，并且支持多种常见的相似性度量方式。
// embedding 向量是需要有一定的花费的，所以仅在学习和测试时使用 MemoryVectorStore，而在真实项目中，搭建其他向量数据库，或者使用云数据库。
import { MemoryVectorStore } from "langchain/vectorstores/memory";
const vectorstore = new MemoryVectorStore(embeddings); // 创建一个内存中的向量数据库
await vectorstore.addDocuments(splitDocs); // 将文档添加到向量数据库中
const retriever = vectorstore.asRetriever(2) // 返回相似度最高的两个文本内容
const res = await retriever.invoke("茴香豆是做什么用的") // 文档提取，返回相似度最高的两个文本内容
// [
//   Document {
//     pageContent: "...",
//     metadata: { source: "data/kong.txt", loc: { lines: { from: 7, to: 7 } } }
//   },
//   Document {
//     pageContent: "...",
//     metadata: { source: "data/kong.txt", loc: { lines: { from: 15, to: 15 } } }
//   }
// ]
```

- 本地vector store
> 对数据生成 embedding 需要一定花费，所以我们希望把 embedding 的结果持久化，这样可以在应用中持续复用。因为 js 并不是一个面向后端和机器学习相关的语言，所以原生的 vector store 并不多，大多数还是以支持 python 为主。facebook 开源的 [faiss](https://github.com/facebookresearch/faiss) 是向量数据库中非常流行的开源解决方案，其可以将向量数据库导出成文件，并且提供了 python 和 nodejs 的处理方式。

``` js
const embeddings = new OpenAIEmbeddings();
const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings); // 从文档中创建向量数据库
const directory = "../db/kongyiji";
await vectorStore.save(directory); // 保存向量数据库到文件
const vectorstore = await FaissStore.load(directory, embeddings); // 从文件中加载已存储好的数据库
```

- MultiQueryRetriever
> 它使用 LLM 去将用户的输入改写成多个不同写法，从不同的角度来表达同一个意思，来克服因为关键词或者细微措词导致检索效果差的问题。
``` js
// MultiQueryRetriever 是在 RAG 中 retriever 的前期就引入 llm 对语意的理解能力，来解决纯粹的相似度搜索并不理解语意导致的问题。
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
const model = new ChatOpenAI();
const retriever = MultiQueryRetriever.fromLLM({
  llm: model,
  retriever: vectorstore.asRetriever(3), // 从向量数据库中提取相似度最高的 3 个文档
  queryCount: 3, // 会对每条输入，都会用 llm 改写生成三条不同写法和措词，但表示同样意义的 query
  verbose: true, // 设置为 true 会打印出 chain 内部的详细执行过程方便 debug
});
const res = await retriever.invoke("茴香豆是做什么用的");

// ScoreThresholdRetriever 是在 RAG 中 retriever 的后期引入的，它会对相似度搜索的结果进行过滤，只返回相似度大于阈值的文档。
const retriever = ScoreThresholdRetriever.fromVectorStore(vectorstore, {
    minSimilarityScore: 0.4, // 最小的相似度阈值，也就是文档向量和 query 向量相似度达到多少，我们就认为是可以被返回的
    maxK: 5, // 一次最多返回多少条数据
    kIncrement: 1, // 算法的布厂, 每次多获取 kIncrement 个文档，然后看这 kIncrement 个文档的相似度是否满足要求，满足则返回。
});
```


### ChatMessageHistory
用户跟 llm 的所有聊天记录都会完整的存储在 chat history 中，其会负责将这些原始数据存储在内存中或者对接的其他数据库中。

在大多数情况下，我们并不会把完整的 chat history 嵌入到 llm 上下文中，而且提取聊天记录的摘要或者只返回最近几条聊天记录，这些处理逻辑就是在 Memory 中完成的。

``` js
import { ChatMessageHistory } from "langchain/stores/message/in_memory"; // ChatMessageHistory 是存储在内存里
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const history = new ChatMessageHistory();
// 向 history 中存储两个 Message 信息
await history.addMessage(new HumanMessage("你好"));
await history.addMessage(new AIMessage("你好，我是一个 AI 助手"));
const messages = await history.getMessages(); // 获取所有的消息记录
```

- 内置Memory机制
``` js
import { ChatOpenAI } from "@langchain/openai";
import { ConversationSummaryBufferMemory } from "langchain/memory"; // 其会计算当前完整聊天记录的 token 数，去判断是否超过我们设置的 maxTokenLimit，如果超过则对聊天记录总结成 summary 输入进去。
import { ConversationChain } from "langchain/chains";

const model = new ChatOpenAI();
const memory = new ConversationSummaryBufferMemory({
  llm: new ChatOpenAI(),
  maxTokenLimit: 200
});
const chain = new ConversationChain({ llm: model, memory: memory, verbose: true }); // verbose: true 会打印出 chain 内部的详细执行过程方便 debug

```


### Function calling
Function calling 本质上就是给 LLM 了解和调用外界函数的能力，LLM 会根据他的理解，在合适的时间返回对函数的调用和参数，然后根据函数调用的结果进行回答。


一个获取天气的例子：
``` js
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: env["API_KEY"],
});
// 定义一个获取天气的函数，输入参数为 location 和 unit，默认 unit 为 fahrenheit
function getCurrentWeather({ location, unit="fahrenheit"}){
   const  weather_info = {
        "location": location,
        "temperature": "72",
        "unit": unit,
        "forecast": ["sunny", "windy"],
    }
    return JSON.stringify(weather_info);
}
// 创建这个函数的描述信息, OpenAI 将 function calling 更名成了 tools，但目前很多资料依旧叫 function calling
const tools = [
    {
      type: "function",
      function: {
        name: "getCurrentWeather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    }
]
 const messages = [
    {
        "role": "user",
        "content": "北京的天气怎么样"
    }
]
const result = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    tools, //传入 tools 描述信息
    tool_choice: "none", // 禁止 LLM 去调用函数
});
console.log(result.choices[0]);
```



### Agent
将 llm 作为推理引擎，通过 RAG、web 等等方式去获取解决问题的充足信息，然后将 llm 作为自然语言的理解和推理引擎据此给出答案，Agents 就是自动去做这个过程。

ReAct 框架是非常流行的 agent 框架，其结合了推理（reasoning）和行动（acting），其流程大概是让 llm 推理完成任务需要的步骤，然后根据环境和提供的工具进行调用，观察工具的结果，推理下一步任务。 就这样 推理-调用-观察 交错调用，直到模型认为完成推理，输出结果。

Lang Smith: 可视化的追踪和分析 agents/llm-app 的内部处理流程是 langchain 官方和社区都看好的路线，

### 模型训练
模型训练就是通过海量的人类数据，让模型学会人类文字表达中的概率信息。

1. 数据收集：收集大量的文本或代码数据，这些数据可以来自书籍、文章、代码库等多种来源。
2. 数据预处理：对收集到的数据进行清洗和整理，确保数据的质量和一致性。
3. 模型训练：利用高性能的计算资源（如 GPU），通过复杂的算法（如梯度下降）调整模型内部的参数，使其能够更准确地预测下一个词或代码片段，从而实现更接近人类语言的表达效果


大模型：它是一个基于概率和海量数据训练的模型，能够在部分任务中表现出近似甚至超越人类的智能，但这只是“涌现的智能”，而不是真正的智能。

### Fine-tune（微调）
微调是指在一个已经预训练的大模型基础上，针对特定任务或领域进行进一步训练。例如，一个通用的语言模型可以通过微调，变成专门用于代码生成或特定编程语言的辅助编程。




