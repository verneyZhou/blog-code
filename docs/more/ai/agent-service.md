---
title: 智能客服助手 AI Agent 完整技术方案设计
date: 2026-08-03 16:48:47
permalink: false
categories:
  - AI
tags:
  - Agent
  - AI
  - 智能客服
---


# 智能客服助手 AI Agent 完整技术方案设计


## 背景

运营团队每天面对大量重复性工单——"优惠券如何使用""新人福利如何获取""密码怎么重置""退款到账要多久""发票怎么开"。这些问题的答案存在于产品文档和历史工单中，但客服需要手动检索、逐条阅读、组织语言回复，耗时且容易出错。


客服面对的是"事实型问答"，更需要的是"准确的事实信息"，而不是"复杂的操作流程"。


## 功能

1. **自动分类工单**：紧急/普通/可机器回复，分流效率提升 50%+
2. **检索内部知识库**：产品文档、历史工单，命中率 > 80%
3. **起草回复初稿**：客服改一改就发，起草到发送时间缩短 60%
4. **复盘高频问题**：每周生成"应该新增哪些 FAQ"（V2 迭代）


**流量来源**：C端用户查询工单（客户端同事开发的前端）、B端各平台工单查询；有关于运营平台商业化类的工单查询都会流转到这里



## 业务重点

- 客服面对的是**事实型问答**，需要准确信息而非创意输出
- 工单处理是**结构化流程**，`分类→检索→起草→审批`，边界清晰
- 客服场景**容错率低**，必须有`硬护栏`防止错误信息触达用户


定位：量级不高（千级文档以内）的单Agent项目


核心链路：**工单入库 → 分类 → 检索 → 起草 → 人工审批 → 发送**




## 分层架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                    用户交互层                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  客服工作台 (Next.js App Router)                         │    │
│  │  工单列表 / 工单详情 / Agent处理面板 / 审批区              │    │
│  └──────────────┬──────────────────────────────────────────┘    │
└─────────────────┼───────────────────────────────────────────────┘
                  │ SSE（浏览器直连 Koa，P1-2.6）+ REST API
┌─────────────────┼───────────────────────────────────────────────┐
│                    编排层（Koa）                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 生命周期  │ │ 权限守卫  │ │ 队列调度  │ │ 错误恢复  │            │
│  │ 状态机    │ │ L1-L4    │ │ 串行队列  │ │ Error-   │            │
│  │          │ │          │ │          │ │ as-Data  │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│                    能力层（Skill）                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ classify     │ │ search_kb    │ │ draft_reply  │             │
│  │ _ticket      │ │              │ │ (HITL审批)   │             │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘             │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼───────────────────┐
│                    执行层（ReAct Loop）                            │
│  Observation → Reasoning(LLM决策) → Action(调Skill) → Result     │
│  → 循环或终止（最多 5 轮）                                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│                    连接层                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ PostgreSQL   │ │ pgvector     │ │ 大模型 API   │             │
│  │ + 状态/审计  │ │ + 向量检索   │ │ DeepSeek/通义│             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────────────────────────────┐
│                    Workspace（共享状态基座）                        │
│  Thread / Run / Step / Checkpoint / Artifact / Event              │
│  PostgreSQL（持久）+ Redis Stream（实时）+ Pub/Sub（取消信号）      │
└─────────────────────────────────────────────────────────────────┘
```



## 核心数据模型设计

```
Ticket (1) ──── (1) Thread

Thread (1) ──── (N) Run 
                  │
                  ├── (N) Step
                      ├── (N) Event
                  ├── (N) Checkpoint
                  └── (N) Artifact
```
- **Ticket（工单）**：业务输入，`id(工单id), customer_id(客户id), subject(主题), content(工单内容), priority(分类), ...`
- **Thread（长期上下文）**：一个工单对应一个Thread，`id, ticket_id, customer_id, ...`
- **Run（一次具体执行）**：一个Thread对应多个Run，`id, thread_id, status, max_steps, cur_step, token_input, cost_cents, ...`
- **Step（可观测步骤）**：一次Run对应多个Step，`id, run_id, step_number, skill_name, ...`
- **Checkpoint（可恢复快照）**：一次Run对应多个Checkpoint，`id, run_id, step_number, state, ...`
- **Artifact（产出物）**：一次Run对应多个Artifact，`id, run_id, type(draft/sent_reply), version, status, ...`
- **Event（事件流）**：一次Step对应多个Event，`id, run_id, step_id, event_type, payload, ...`


``` ts
type TicketPriority = 'urgent' | 'normal' | 'auto_reply'; // 工单分类：紧急、普通、自动回复
type TicketStatus = 'pending' | 'processing' | 'resolved' | 'closed'; // 工单状态：等待中、进行中、已解决、关闭

/** 
 * RunStatus
 * 一次具体执行状态机：
    created → running → waiting_for_review（等待审查） → completed（完成）
                          → failed（终态，不可复活）
                          → cancelled（终态）
                          → waiting_for_escalation（等待升级）
    retrying → running → ... （旧 failed Run 不变，创建新 Run）
 */

type StepActionType = 'llm_call' | 'tool_call' | 'hitl_interrupt'; // 操作类型：大模型调用、工具调用、人工干预
type ArtifactType = 'draft' | 'sent_reply' | 'classification' | 'search_result'; // 产物类型：草稿、发送回复、分类、搜索结果

// agent事件流类型
type AgentEvent =
  | { type: 'run_created';      run_id: string; ticket_id: string }
  | { type: 'run_started';      run_id: string }
  | { type: 'step_started';     run_id: string; step: number; skill: string }
  | { type: 'step_completed';   run_id: string; step: number; result: any }
  | { type: 'step_error';       run_id: string; step: number; error: any }
  | { type: 'draft_ready';      run_id: string; draft: string }
  | { type: 'review_requested'; run_id: string; draft: string }
  | { type: 'run_completed';    run_id: string }
  | { type: 'run_failed';       run_id: string; error: string }
  | { type: 'run_cancelled';    run_id: string }
  | { type: 'progress';         run_id: string; percent: number; message: string }
```


## 数据流分层设计


```
┌─────────────────────────────────────────────────────────────────┐
│  基础设施层（无业务逻辑，封装存储与通信）                           │
│                                                                   │
│  store         持久化层，所有业务数据读写入口                        │
│                8 个子 Repo（Ticket/Thread/Run/Step/               │
│                Checkpoint/Artifact/Event/KnowledgeDoc）            │
│                                                                   │
│  eventStream   事件管道（写端），将事件写入 Redis Stream            │
│                或内存数组，只管"存进去并返回 ID"                     │
│                                                                   │
│  cancelBus     取消信号总线，跨进程广播取消信号                      │
│                触发 AbortController 中断 LLM HTTP 请求              │
│                                                                   │
│  embedder      向量嵌入，调 DashScope text-embedding-v3           │
│                把文本转 1024 维向量                                 │
├─────────────────────────────────────────────────────────────────┤
│  能力层（封装外部依赖，业务无关）                                    │
│                                                                   │
│  model         编排层 LLM 客户端，ReAct Loop 每轮调它              │
│                决策"下一步调哪个 Skill"，Function Calling           │
│                                                                   │
│  complete      生成层 LLM 补全函数，Skill 内部调它                   │
│                生成结构化 JSON（分类结果/草稿）                      │
│                                                                   │
│  retriever    知识库检索，向量+关键词双路+RRF 融合                  │
├─────────────────────────────────────────────────────────────────┤
│  编排层（组合基础设施+能力，驱动业务）                               │
│                                                                   │
│  emitter       事件发射器，在 eventStream 之上加语义                │
│                同时写 Stream（SSE 实时推送）和 DB events 表（审计） │
│                                                                   │
│  runtime       ★核心★ ReAct Loop 载体                              │
│                组合 model/store/emitter/cancelBus/               │
│                retriever/complete 六个依赖                          │
│                驱动 LLM 推理→调 Skill→写 Step→检查 HITL→写 Checkpoint│
│                                                                   │
│  executor      Run 任务调度器                                       │
│                Route Handler 只调 executor.submit(run)            │
│                在 submit 和 execute 之间插入队列语义                 │
│                （串行/重试/并发控制）                                 │
└─────────────────────────────────────────────────────────────────┘
```

- `store：持久化层`，所有业务数据的读写入口（Ticket / Thread / Run / Step / Checkpoint / Artifact / Event）。Route Handler 和 Runtime 都通过 store.runs.findById()、store.steps.create() 等接口操作数据，不直接碰 DB。
- `eventStream：事件流`，负责将事件写入持久化存储（Redis Stream / 内存数组）。本身只管"把一条事件存进去并返回 ID"，不关心谁在消费。SSE 路由消费它来推送给浏览器。
- `executor：任务调度器`
- `runtime：Agent 执行核心`
- `emitter：eventStream 封装`；会同时写 eventStream（SSE 实时推送）和 store.events（DB 审计落盘）。
- `cancelBus：取消信号总线`
- `model: 模型层`；封装对 LLM API 的调用

- `model`（编排层）用 Function Calling，要求 LLM 输出 tool_call（强结构化）；`complete`（生成层）用 `response_format: json_object`，要求 LLM 输出 JSON 文本。编排层 temperature=0.1（稳定），生成层 temperature=0.3（自然）；降级链可以独立配置（编排层 DeepSeek→Qwen，生成层可以独立选模型）。

- 所有数据操作走 `store.xxxRepo.method()`，不直接写 SQL。mock 模式用 `InMemoryStore`，real 模式用 `PgStore`，接口一致；事务边界、缓存策略可以在 Repo 层统一控制；Route Handler 和 Runtime 不感知底层是 PG 还是内存。




## 完整执行链路

1. 服务端：`store、eventStream、embedder、cancelBus、runtime、retriever、executor、model、路由`等各个数据流模块初始化，服务运行起来；sse流式路由初始化，RAG知识库初始化；

2. 客户端：用户新建工单 `post /ticket` 接口，传入`customer_id, subject, content`；

3. 服务端：
  - 创建Ticket信息 => 创建Thread信息 => 创建Run信息，

  - 返回给客户端 Ticket、Run 信息；
  
  - 通过`executor.submit(run)`提交任务调度，这个方法直接执行`runtime.execute(run)`，这个方法是整个Agent设计的核心，**执行 ReAct Loop 循环任务**：
    1. 通过`cancelBus`给当前`runId`配置超时自动取消；从store中获取thread、ticket信息；
    2. 判断是否是重试run，是则通过`store.checkpoints`获取最新的快照信息，并恢复上下文信息；不是重试run则构建新的`上下文信息（系统提示词+可用skill）`；
    3. 进行run状态机校验，更新run状态为`running`；同时通过`emitter.emit`给当前`runId`的事件流添加`run_started`事件；
    4. *开始循环，最大循环次数`run.max_steps`默认为5*：
      - 判断当前`runID`是否已取消，是则抛出报错，结束流程；
      - 之后开始循环调LLM服务：通过`model`传入`messages + availableSkills（classify_ticket / search_knowledge / draft_reply）`调 LLM 服务，这一步主要是调*编排层模型，职责是"决定下一步调哪个 Skill、参数是什么"*；返回约定格式的内容：`{action:{skill, finish, ...}, model_used, usage:{input_tokens, output_tokens}, raw}`；调用的skill顺序为：`classify_ticket => search_knowledge => draft_reply`
      - model调用返回结果后，统计runId的模型调用情况`model_used`；
      - 通过`action.finish`判断是否完成；是则结束当前run：通过`store.runs.updateStatus`更新当前 runId 状态为`completed`，`emitter.emit(runId, 'run_completed')`；
      - 否则继续判断`action.skill`是否是上述三个固定的skillName，出现未知skill则通过 `Error-as-Data` 把 tool 错误也写进对话历史，再循环调一次；
      - 正常的话则继续调用 `store.steps.create` 记录每一步的 step 信息：`{run_id, step_number, skill_name, token_input, ...}`；通过`emitter.emit`更新当前 runId 的事件流添加 `step_started`事件；
      - *之后获取model返回的`skillName`，进行参数合并，调已经在代码里写好的上述每个skill的`execute`方法*：
        - `classify_ticket`分类skill会调`ctx.complete`方法，通过LLM来进行分类，通过系统提示词+`response_format:{type:'json_object'}`指定输出格式，校验返回结果，返回统一格式result
        - `search_knowledge`知识库检索skill会调`retriever.search`进行搜索，具体通过`向量搜索 + 关键词搜索`，再 RRF 排序返回TopK；
        - `draft_reply`生成草稿skill也会通过`ctx.complete`调 LLM 来生成草稿
      - 之后对返回的内容进行格式化组装，记录step信息，合并上下文，emitter.emit更新run的事件流状态为`step_completed`；保存每一步的 Checkpoint 信息；
      - 判断是否需要*人工审批*，是则更新当前润runId状态为`waiting_for_review`，`store.artifacts.create`保存当前草稿产物；

    5. max_steps轮循环结束后还没返回正确结果，则返回步数超限的错误，更新runId状态为`failed`，事件流添加`draft_ready`

  - 调用`emitter.emit`：`stream.append(runId, event)`实时更新事件流 + `store.events.append()`更新审计层信息；`stream.append`具体是执行`redis.xadd`添加事件流；*Redis在subscribe方法中会通过5s长轮询通知订阅者进行事件更新*；

4. 客户端：通过`run.id`发送 sse 流式请求，监听接口返回信息，流式输出；同步更新`run, events, artifactId, draft`等信息；

5. 服务端：接受到 runId 流式请求，通过`ctx.get('Last-Event-ID')`获取lastEventId，通过`stream.readHistory(runId, lastEventId)`获取断连后的历史事件，并通过`res.write`写入传到客户端；再通过 `stream.subscribe` 订阅当前 runId 的事件，这样当后续当前 runId 事件流更新时也会通过回调`res.write`传到客户端；
  - 之后通过`setInterval`每隔30s发送心跳，保持链接；监听`res的close/error`事件进行 sse 连接关闭

6. 客户端：监听到 runId 到 `waiting_for_review`状态，对草稿进行敏感词校验，修改草稿，调 `runs/:runId/approve` 接口进行发布；

7. 服务端：收到发布草稿请求，通过runId找到 store 中的 run 和 artifact，更新草稿信息和草稿状态；最后更新当前 runId 状态为 `completed`，事件流新增 `run_completed`类型



**Run 状态流转（一次完整执行）**
```
[POST /tickets]
      │
      ▼
┌──────────┐  Runtime 拉取   ┌──────────┐
│ created  │ ──────────────► │ running  │
└──────────┘                 └────┬─────┘
                                  │ Step1 classify_ticket 完成 → Checkpoint
                                  │ Step2 search_knowledge 完成 → Checkpoint
                                  │ Step3 draft_reply 完成 → requires_approval=true
                                  │   ├─ lintDraft 敏感词检查
                                  │   ├─ 创建 Artifact(status=staging)
                                  │   └─ emit draft_ready
                                  ▼
                          ┌──────────────────┐
                          │waiting_for_review│ ◄── HITL 硬中断（Run 暂停）
                          └────────┬─────────┘
                                   │
                       ┌───────────┼───────────┐
                  批准  │      修改 │      取消 │     升级
                       │           │           │           │
                       ▼           ▼           ▼           ▼
                 ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐
                 │completed │ │completed │ │cancelled │ │waiting_for_         │
                 │Artifact→ │ │Artifact→ │ │          │ │escalation           │
                 │  sent    │ │  sent    │ │          │ │(diff保留)           │
                 │(v1)      │ │(v2+diff) │ │          │ └────────────────────┘
                 └──────────┘ └──────────┘ └──────────┘
                   终态         终态         终态
```



## 技术栈选择



**前端技术栈选择**

客服工作台：`React.js + Vite + SSE`；SSR + SSE 流式渲染，PC 端工作台场景

管理后台：`Vite + React`；常规B端后台管理系统



**后端技术栈选择**

服务端框架：`Node.js 20 + Koa`；洋葱中间件模型适配 Runtime

Agent Runtime：代码自建（非 LangGraph）；线性管道最直接、最可控、调试最直接

数据库：`PostgreSQL 16`；关系型数据库，支持 JSONB + pgvector + 全文检索同库

缓存/队列/流：`Redis（Stream + Pub/Sub）`；单实例三职：任务队列、SSE 事件、取消信号



**大模型选择**

工单分类模型：`DeepSeek V3`；成本极低，分类任务无需最强模型，高频低复杂度，支持`Tool Calls`

向量模型：通义`text-embedding-v3`；无需自部署GPU，无需代理，稳定，成本低，中文效果好；默认`1024维`，单行最大token 8192，`0.25￥/1M token`

向量数据库：`pgvector（PostgreSQL 扩展）`；千级文档量级性能足够（10ms级），复用 PostgreSQL，不引入新服务，运维成本最低；`SQL 联表`天然支持混合检索；向量和结构化数据同库，免去数据同步问题；支持 HNSW 索引

草稿生成模型：`DeepSeek V3、Qwen-Max（通义千问）、ERNIE-4.0（文心一言）`；成本低，强推理，中文能力强


*不选 GPT-4o、claude-opus等国外模型原因*：国内需要代理，生产环境代理链路不稳定，成本高

*不选文心一言的原因*：Function Calling 能力不如 DeepSeek 和通义千问，且成本高于 DeepSeek。


> 备注：上述分类模型和草稿生成模型改用v4了；`deepseek-v4-flash`百万tokens输入（缓存命中）0.02元，百万tokens输入（缓存未命中）1元；上下文支持`1000k`


- 模型 API 降级策略：
``` js
// 模型调用降级链
const MODEL_CHAIN = {
  classification: ['deepseek-v3', 'qwen-max', 'qwen-plus'],  // 降级顺序
  embedding: ['text-embedding-v3', 'text-embedding-v2'],       // 降级顺序
  drafting: ['deepseek-v3', 'qwen-max', 'qwen-plus']
};
async function callModelWithFallback(
  task: 'classification' | 'embedding' | 'drafting',
  params: any
): Promise<any> {
  const chain = MODEL_CHAIN[task];
  for (const model of chain) {
    try {
      const result = await callModel(model, params, { timeout: 30000 });
      return result;
    } catch (error) {
      console.warn(`Model ${model} failed, trying next...`, error.message);
      continue; // 失败则降级调用下一个模型
    }
  }
  // 全部降级失败
  throw new Error(`All models in ${task} chain failed`);
}
```


### 一些问题


**Q：在Agent框架选择第三方或自建时有哪些考量？为什么不选择LangGraph或其他Agent框架呢？**

自建原因：客服工单处理是线性管道（分类→检索→起草→审批），不需要图的复杂条件分支。自建代码式 Runtime 最轻、最可控、调试最直接。

客服工单处理是线性管道，不需要图式 Runtime 的条件分支和状态图；
自建代码式最轻、最可控、调试最直接；
国内 LangGraph 社区生态不如海外，遇到问题排障成本高

LangGraph：`有向图（DAG/循环图）+ 持久化状态机`；比较成熟的Agent框架，通过`声明式 StateGraph`进行编排，支持复杂路由
1. 通过定义`节点、边、条件边`来实现控制流，执行路径可预测；
2. 内置 `Checkpoint`（SqliteSaver/PostgresSaver），状态持久化和 `Human-in-the-Loop` 是一等公民
3. 支持子图（Subgraph），复杂 Agent 可模块化组合
4. streamEvents(version:'v2') 提供细粒度流式事件，适合 SSE 实时推送
> TypeScript SDK 与 Python SDK 功能对齐，生产可用；但学习曲线陡，图建模思维与业务逻辑之间需要适配层


CrewAI：多 Agent 角色协作，类团队分工模型；适用于`多角色协作任务`，如"研究员收集资料 → 编辑撰写报告"；
> Python only，JS 项目无法直接使用；不适合客服场景的意图路由、工具调用确认等精细控制需求


AutoGen（Microsoft）：多 Agent 对话，Agent 之间通过消息互相驱动；适合代码生成、自动调试、需要多个 LLM 互相 review 的场景；
> TypeScript 支持弱，状态管理依赖消息历史，无显式状态图，排查问题困难


自研的优势是零框架依赖带来的长期可控性，也能够对Agent整体架构设计有一个全面的熟悉和了解。




**Q：向量模型横向对比？**

- `text-embedding-3-large（OpenAI）`：需代理，不稳定；`$0.13/1M token`
- `BGE-M3`：开源自部署，需运维模型服务；消耗 GPU 资源费；适合需要离线部署的项目
- `通义 text-embedding-v3`：国内直连，无需自部署 GPU
- `百度 Ernie-Embedding-V1`：需适配
- `智谱 embedding-3`



**Q：pgvector 跟 其他向量数据库有什么不一样？横向对比下？**

- Milvus：独立服务，需单独部署，部署复杂；运维成本高；适合文档量级百万级项目；
- Qdrant：独立服务，需单独部署；
- ChromaDB：需独立部署；Python 生态最成熟的向量数据库，有官方 JS 客户端；混合检索（向量 + BM25 关键词）支持原生，pgvector 需要自己实现 BM25；


1. `‌Milvus`是专门为向量检索设计的独立数据库‌，如果向量规模达到千万级甚至亿级以上、对查询延迟要求严苛（需稳定<50ms）可以考虑用它；对于小规模量级不高（千级文档）的可以先从`PGVector`用起；
2. 且PGVector对已深度使用PostgreSQL的团队几乎零增量成本，Milvus 需独立部署维护，运维成本高；
3. PGVector主要支持稠密向量，在百万级向量场景下两者差距不悬殊，PGVector 配合 HNSW 索引可满足多数 RAG 问答的延迟要求；



**Q：数据库为什么选择PostgreSQL不选择MySQL？JSONB、全文检索具体是什么？**

数据库的选择主要是`PostgreSQL`和`MySql`：PostgreSQL是比较成熟的关系型数据库，功能强大，支持 `JSONB、全文检索`，且提供 `PGVector` 插件可以进行向量存储和检索能力。

`pgvector 扩展`：向量存储和相似度检索是 RAG 的基础，MySQL 没有原生向量类型和向量索引，需要另起 Milvus/Qdrant，而 pgvector 直接让 PG 支持` vector(1024) 列、余弦距离 <=> 运算符、HNSW 索引`——一个数据库搞定，不引入额外中间件。

> 何时该用 PostgreSQL： 多节点部署、并发会话超过 100+、或需要 PG 的 ACID 事务语义时，应迁移到 PostgreSQL + pgvector


`JSONB（Binary JSON）`：普通 JSON 列存的是文本，查询时每次都要解析。JSONB 把 JSON 转成二进制格式存储（字段排序、去重、压缩），支持 GIN 索引，查询非常快
> 项目里 steps.input/output、runs.metadata、artifacts.content、checkpoints.state 等字段存的是半结构化数据（每次不一样），PG 的 JSONB 可以存、可以索引、可以用 `->` 运算符查询字段。MySQL 的 JSON 类型只能存，索引和查询能力弱很多。这些字段如果用关系型列来设计，要么 ALTER TABLE 频繁加列，要么设计非常复杂。JSONB 允许每行结构不同，和 Agent 的"每步产物格式由 Skill 决定"天然契合。


`全文检索（FTS）`：RAG 的关键词路需要中文分词全文检索，PG 通过 `zhparser 扩展 + tsvector` 原生支持，MySQL 的全文索引只支持英文，中文需要外接 Elasticsearch，同样引入额外中间件。
> PG 的全文检索工作原理：把文本分词（英文按空格，中文需要 zhparser 插件）、生成 tsvector（词汇的权重向量）、用 GIN 索引加速 `@@` 运算符查询




**Q：混合检索策略（向量 + 关键词 + RRF 融合）能具体介绍下吗？关键词搜索为什么用tsvector？RRF 融合是什么？融合排序取TopK具体是怎么实现的呢？**

`纯向量`：语义相近但词不同的文档能找到（比如搜"密码忘了"能匹配"账号找回"），但精确词匹配弱

`纯关键词`：精确匹配强，但不认语义——搜"密码忘了"不一定能匹配"重置凭证"

混合检索：`用向量路兜底语义，用关键词路强化精确匹配，RRF 融合两路结果`



`tsvector` 是 PG 的全文搜索数据类型，不是简单的 LIKE 字符串匹配。两者区别：
``` sql
-- LIKE：逐字符扫描，不分词，无索引优化
WHERE content_text LIKE '%密码重置%'

-- tsvector + GIN：先分词，GIN 倒排索引精确命中，O(1) 级
WHERE search_vector @@ plainto_tsquery('zh', '密码重置')
```
LIKE 扫全表，知识库大了很慢；tsvector + GIN 索引是倒排表，查询直接定位包含该词的文档 ID 列表。
> 中文需要 zhparser 插件，它把"密码重置"分成 ["密码", "重置"] 两个词条，存进 tsvector。plainto_tsquery('zh', '密码重置') 查询时也用相同分词配置，词条对齐才能命中。



`RRF 融合`：Reciprocal Rank Fusion，倒数排名融合
``` sql
-- rank_i：文档在第 i 路结果中的排名（1-indexed）
-- k：平滑常数，通常取 60，防止排名靠前的文档分数过于悬殊
rrf_score(文档) = Σ  1 / (k + rank_i) -- 核心公式


-- 举个例子，同一文档在向量路排名第 2、在关键词路排名第 1：
rrf_score = 1/(60+2) + 1/(60+1) = 0.01613  + 0.01639 = 0.03252

-- 如果只在向量路排名第 1、关键词路没出现：
rrf_score = 1/(60+1) = 0.01639
```
两路都命中的文档得分更高，这就是"双重信号叠加"的效果。
> RRF 的优势是不需要对齐不同路的分数尺度——向量路用余弦距离（0-1），关键词路用 ts_rank_cd（任意正数），直接比数字没意义。但排名是统一的整数，可以直接融合。


完整检索流程：`向量路（topK*2） => 关键词路（topK*2）=> rrfFuse(vecHits, kwHits, k=60, topK=5) => has_sufficient_results（score >= 0.7 或者 (score >= 0.5 && length > 3)）判断检索结果是否充分`




**Q：介绍下Redis，梳理下项目中用到Redis的场景有哪些，用来做什么，为什么用它？Redis Stream 和 Redis Pub/Sub 有什么区别？XREAD又是什么？缓存与消息队列如何选型？bullmq是什么，跟Redis Stream 有什么关系？**

`Redis` 是基于内存的数据结构存储引擎，支持多种数据类型（String、Hash、List、ZSet、Stream、Pub/Sub 等），主要用于缓存、消息队列、实时数据流三类场景。核心优势是微秒级读写延迟和丰富的数据结构原语。
``` ts
import Redis from 'ioredis';

let redisClient = new Redis(process.env.REDIS_URL); // Redis Stream
let redisSub = new Redis(process.env.REDIS_URL); // Pub/Sub 需独立连接
// REDIS_URL 是 Redis 服务器的连接地址；在对应云平台创建 Redis 实例后，控制台会提供连接地址，复制过来即可。
```


场景 1：`Redis Stream` — SSE 事件持久化与断线回放。Agent 每执行一步就通过 `redis.xadd` 写入事件，前端 SSE 连接时先通过 `redis.xread` 回放历史再实时订阅。
```
断线重连请求（带 Last-Event-ID 头）
  │
  ├─ readHistory: XREAD ... > lastEventId    ← 回放断点后的所有历史
  │   记录最后一条的 ID 为 lastId
  │
  └─ subscribe: XREAD BLOCK ... lastId       ← 从历史末尾继续 tail
       ← 关键：不从 $ 开始，避免"历史回放完 → 订阅开始"间隙丢事件
```
> Redis Stream 天然支持 Last-Event-ID，可实现可恢复 SSE


场景 2：`Redis Pub/Sub` — 取消信号跨实例广播。`客服点取消 → Route Handler redis.publish(channel, 'cancel') → 正在处理该 Run 的 Worker 收到信号 → AbortController.abort() → LLM HTTP 请求立即中断`。
>  取消信号是"实时通知，发后即忘"，不需要持久化，不需要重放，Pub/Sub 语义完全匹配。 Pub/Sub 需要两个独立 Redis 连接（pub + sub），因为 Redis 规定处于订阅状态的连接不能执行普通命令。


场景 3：`BullMQ` — 生产任务队列：BullMQ 底层用 Redis 的 List / ZSet / Hash 实现可靠任务队列，支持重试、延迟、并发控制。



- `Redis Stream`：持久化，消息落盘可重放；重连后可从断点续读；xread 游标消费；适用 `事件溯源、断线恢复、审计`；
  - `XREAD` 是 Redis Stream 的消费命令，从指定 Entry ID 之后读取消息。

- `Redis Pub/Sub`：非持久化，发出即忘；断线期间消息永久丢失；广播，所有订阅者同时收到；适用 `实时信号、一次性广播通知`

- `BullMQ` 是 Node.js 的任务队列库，底层用 Redis 实现，但用的数据结构是和 Stream 完全不同的`List + ZSet + Hash`；两者共享同一个 Redis 实例，但数据结构互相独立；内置重试、延迟、优先级、进度报告、并发限制；适用于`多实例生产下的后台任务调度（每个 runId 是独立任务，需要内置重试和并发控制）`
> 当前项目是单Agent项目，Run 任务调度器通过 同进程串行执行 可以满足，暂不需要BullMQ



`缓存（Redis String / Hash / ZSet）`
- 用途：加速读取，存放热点数据（session、配置、接口结果）
- 核心特征：数据可以丢失（有 DB 兜底），TTL 管理，读多写少

`消息队列（Stream / List / BullMQ）`
- 核心选型问题：消息能否丢？能丢 → Pub/Sub；不能丢 → Stream / BullMQ
- 次要问题：需要延迟 / 重试 / 优先级？需要 → BullMQ；只需顺序流 → Stream 够用




**Q：SSE流式渲染的断联重发逻辑是如何实现的？**


SSE 断线恢复由 `服务端持久化、协议语义、客户端自动重连` 三层共同保证：
1. `服务端：Redis Stream 持久化`；事件写入用 XADD，不是 Pub/Sub（Pub/Sub 发后即忘，断线恢复无法工作）。每条事件有稳定的 Redis Entry ID，作为 Last-Event-ID 的凭证。

2. `服务端：格式保证`；每条 SSE 消息格式为：`{id, event, data}`，浏览器 EventSource 收到 id: 字段后会自动记录，下次断线重连时携带 `Last-Event-ID` 请求头。

> 浏览器 `EventSource` 规范：直接用浏览器原生 EventSource，断线重连由浏览器自动处理——每收到一个带 `id:` 的帧，会自动将其记录为内部 `lastEventId`。断线重连时，自动在请求头加上 `Last-Event-ID: <lastEventId>`，无需任何客户端代码。


3. 服务端：`readHistory` + `subscribe` 无缝衔接
> 断线后的恢复流程（server/src/routes/stream.ts）：
- 读取请求头 `Last-Event-ID`
- `readHistory(runId, lastEventId)` — XREAD 回放断点之后的所有历史事件 → SSE 逐条下发
- 记录回放到的 lastId，传给 `subscribe(runId, onEvent, lastId)` — 从历史末尾继续监听，`消除"历史回放完成→订阅开始"这段间隙的事件丢失`


`客户端实现：`
```typescript
const es = new EventSource(`${apiBase}/api/v1/stream/${runId}`);
// 断线重连、Last-Event-ID 携带：由浏览器 EventSource 规范自动处理
// 应用层只需监听具名事件即可
es.addEventListener('draft_ready', (e) => { /* ... */ });
```

`心跳保活`：服务端每 25 秒发送一条 SSE 注释行（`: heartbeat`），防止代理/负载均衡因空闲超时断开连接。连接关闭时 `clearInterval` 确保定时器不泄漏。



**Q：其他Agent项目的技术栈选择为：SQLite + SqliteSaver + ChromaDB + Fastify + LangGraph？**

`SQLite` 是文件数据库，不需要独立进程、无需安装数据库服务器，零依赖部署；


状态持久化`SqliteSaver`（LangGraph 官方 checkpoint 实现），原生支持 SQLite，开箱即用，无需适配层；适用于单机场景：客服 Agent 的会话数据（消息历史、用户画像、审计日志）在单机场景下，SQLite 完全能扛
> 相比之下，Redis 的适用多节点、高并发的场景，如果要横向扩展成多实例部署，Redis 是必选项。当前单机架构 SqliteSaver 是合理的。


`ChromaDB` 是 Python 生态最成熟的向量数据库，有官方 JS 客户端；支持嵌入式模式（不需要启动服务），也支持 HTTP 服务模式；混合检索（向量 + BM25 关键词）支持原生
> 但 ChromaDB 和 SQLite 是两套存储，数据分散，运维成本加倍；生产环境 ChromaDB 需要独立部署，不如 pgvector 与业务库同源


`Fastify` 是 Node.js 框架中吞吐量最高的（官方 benchmark 约为 Koa 的 2-3x）；内置 JSON Schema 验证（基于 ajv），路由参数、请求体验证开箱即用，无需额外中间件；TypeScript 支持类型定义完整，与项目的 TypeScript 技术栈匹配
> Koa 本身极简，SSE、请求验证、日志都需要手动组装中间件


`LangGraph` 原生支持 Checkpointer 状态持久化、interrupt 中断/恢复、条件边路由。



**Q：在AI Agent项目中数据库选型上有 Supabase、SQLite、PostgreSQL、MySql、MongoDB 这些，分析下这些数据库主要适合哪些场景吧**

1. SQLite：嵌入式文件数据库，零进程部署；运维成本零；适合`本地开发、单机部署、工具型 Agent`
2. PostgreSQL：关系型数据库，需要独立进程部署，有运维成本；支持 pgvector 扩展	；支持 JSONB（索引+查询）；适合`生产环境、需要向量+关系统一存储的 Agent`
3. MySQL：关系型数据库，需要独立进程部署，有运维成本；
4. MongoDB：非关系型数据库，文档型，需要独立进程部署，有运维成本；
5. Supabase：基于 PostgreSQL 的后端数据库服务，部署方式可云托管/自托管；适合`快速上线、需要内置认证+实时订阅的 Agent 产品`

```
是否需要多节点/多进程部署？
├─ 否 → SQLite（开发/单机工具）
└─ 是
    ├─ 是否需要快速上线且接受云托管？
    │   └─ 是 → Supabase（含Auth+Storage）
    └─ 自托管/私有化部署？
        ├─ 已有 MySQL 基础设施？
        │   └─ 是 → MySQL（业务数据）+ 独立向量库
        └─ 从零选型
            ├─ 数据 Schema 高度动态？ → MongoDB
            └─ 结构化为主 + 需要向量 → PostgreSQL + pgvector（推荐）
```



## RAG知识库技术架构设计

RAG 分为两条独立通道：**离线摄入（Ingestion）**和**在线检索（Retrieval）**。两条通道共享 `knowledge_docs` 表，通过 `doc_id` 关联同一文档的所有 chunks。
```
┌─────────────────────────────────────────────────────────────────┐
│                    离线摄入（Ingestion）                           │
│                                                                   │
│  运营上传文件                                                       │
│  POST /api/v1/knowledge/upload                                   │
│       │                                                           │
│       ▼ 文件 Buffer                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  文件类型判断                                               │   │
│  │  .md/.txt → remark（AST 按 heading 分块）                 │   │
│  │  .docx    → mammoth（extractRawText）                    │   │
│  │  .xlsx    → xlsx（逐行: 列名:值）                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│       │ 文本段数组                                                 │
│       ▼                                                           │
│  chunkText（400字/50重叠，段落优先滑窗）→ Chunk[]                 │
│       │ chunk.text[]                                              │
│       ▼                                                           │
│  DashScopeEmbedder.embedBatch()                                  │
│  → text-embedding-v3 API（通义，1024维，最多25条/批）              │
│       │ vector[1024][]                                            │
│       │ PostgreSQL + pgvector（HNSW 索引）
│       ▼                                                           │
│  INSERT INTO knowledge_docs                                       │
│  (id, doc_id, title, source_type, content_text,                  │
│   embedding::vector, chunk_index, metadata)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    在线检索（Retrieval）                           │
│                                                                   │
│  Agent ReAct Loop → search_knowledge Skill                       │
│       │ query 字符串                                               │
│       ▼                                                           │
│  PgRetriever.search(query, topK)                                 │
│       │                                                           │
│       ├── 向量路（vectorSearch）                                   │
│       │   DashScopeEmbedder.embed(query) → 查询向量（文本 => 向量）  │
│       │   SELECT ... ORDER BY embedding <=> $1::vector            │
│       │   HNSW 索引（vector_cosine_ops）加速，score = 1-余弦距离   │
│       │                                                           │
│       ├── 关键词路（keywordSearch，ftsEnabled=true 时）            │
│       │   plainto_tsquery('zh', query) @@ search_vector          │
│       │   GIN 索引，zhparser 中文分词，score = ts_rank_cd         │
│       │                                                           │
│       └── RRF 融合（k=60）                                         │
│           rrfScore = Σ 1/(k+rank)，rank 1-indexed                │
│           排序用 rrfScore，返回原始 DB score（cosine/ts_rank）     │
│           ★ 复查修复：返回原始分保证 judgeSufficiency 阈值生效       │
│           │                                                       │
│           ▼ SearchResult（Top-K，含 has_sufficient_results）      │
│       注入 Agent 上下文 → draft_reply 生成回复                     │
└─────────────────────────────────────────────────────────────────┘

knowledge_docs 表（PostgreSQL + pgvector）：
  embedding vector(1024) — HNSW 索引（余弦相似度）
  search_vector tsvector GENERATED STORED — GIN 索引（中文 FTS）
  doc_id VARCHAR — 同文件所有 chunks 共享，便于管理和删除
```


**文档解析**
1. 运营后台：调 POST /api/v1/knowledge/upload，上传文件；`'md', 'txt', 'docx', 'xlsx'`，multipart/form-data
2. 服务端：
- 解析文件内容为文本段
- 文档分块，滑动窗口，400字符/50重叠
- 批量向量嵌入：批量调向量模型（文本 => 向量）；
- 向量存储表结构 knowledge_docs，pgvector 自动维护 HNSW 索引（余弦相似度）


**混合检索（向量 + 关键词 + RRF 融合）**
> agent 每次执行 search_knowledge Skill 时触发：
1. 调通义 text-embedding-v3，把查询词转成 1024 维向量（一次 API 调用）
2. PG 向量相似度检索（pgvector）
3. PG 全文检索，中文 tsvector（zhparser 中文分词）
4. RRF 融合排序，返回 Top-K 结果





- *向量文档写入 knowledge_docs 时是如何建立 HNSW 索引的呢？利用的是什么原理呢？*

下面这条语句执行后，索引就存在了。之后每次 `INSERT INTO knowledge_docs (embedding, ...)` 写入新 chunk 时，pgvector 会自动把新向量插入 HNSW 图结构，不需要任何额外操作。
``` sql
CREATE INDEX idx_knowledge_embedding
  ON knowledge_docs
  USING hnsw (embedding vector_cosine_ops);
```


`HNSW 索引`：Hierarchical Navigable Small World（层级可导航小世界图），是目前最主流的`近似最近邻（ANN）向量索引算法`。
> 把所有向量构建成一个多层图结构：
1. 最底层（Layer 0）：所有向量都在，每个节点连接若干个"邻居"
2. 上层：随机采样部分节点构建更稀疏的图，用于"快速导航"
3. 搜索时：从顶层入口点开始，贪心地沿着最近邻方向往下走，逐层缩小范围，直到底层找到候选集
```
Layer 2: A ——————————— F         （粗粒度导航，快速定位区域）
Layer 1: A — C — E — F — H       （中粒度）
Layer 0: A-B-C-D-E-F-G-H-I-J-K  （精确邻居，最终返回 Top-K）
```
> 优点：搜索时不需要扫描全量向量（暴力搜索），而是图上的定向游走，复杂度从 O(N) 降到约 O(log N)。代价是构建索引时需要额外空间和时间。

知识库数量不多时暴力扫描和 HNSW 的速度没有差别。知识库扩展到几千、几万条时，HNSW 就很必要了
> 没有索引，每次检索都要计算查询向量和所有文档向量的余弦距离，延迟会线性增长。提前建好 HNSW 索引，现在零成本，将来平滑扩展。pgvector 0.5+ 开始支持 HNSW（旧版只有 IVFFlat），当前项目用的就是 HNSW，是正确选择。


查询时怎么用这个索引：执行 `ORDER BY embedding <=> $1::vector LIMIT 5` 时，pgvector 自动走 HNSW
> <=> 是 pgvector 定义的余弦距离运算符，vector_cosine_ops 告诉 HNSW 用余弦距离度量相似度




- *向量数据库怎么存储，怎么分段？在当前Agent的RAG向量检索这方面，你觉得还可以有哪些优化方案？*

`存储：`pgvector 扩展，knowledge_docs 表的 `embedding vector(1024)` 列，HNSW 索引（余弦相似度）。每个 chunk 是一行记录，同一文件的所有 chunks 通过 doc_id 关联。

`分段：`
1. 目标块大小 400 字符，重叠 50 字符，最小块 100 字符
2. 策略：先按空行切段落，单段超过 400 字符再滑窗切割，块间保留 50 字符重叠
3. Markdown 走 remark AST 按 heading 切，语义完整性更好


`优化方案：`
1. 分段策略优化：
  - 按语义边界而非字符数切割；`按句子边界切`
  - `递归分段`；文档层级：章节 → 段落 → 句子。先尝试在最高语义边界切，切完的 chunk 太大再递归到下一级。
  - `Chunk 大小基于 token 而非字符`：向量模型和 LLM 都按 token 计费和限制，用 token 数控制块大小更准确。可以用 tiktoken 或 text-embedding-v3 的 tokenizer 做估算。

2. 索引和检索优化:
  - `子块-父块双索引`（Parent-Child Chunking）：把文档切成小块（100 字，细粒度）用于检索精确匹配，检索命中后扩展到父块（500 字）送进 LLM。这样既保证检索精度，又保证 LLM 拿到足够上下文。
    ```
    父块（500字）：[segment_id=1]
    └─ 子块 A（100字）：embedding_1 [parent=1]
    └─ 子块 B（100字）：embedding_2 [parent=1]
    └─ 子块 C（100字）：embedding_3 [parent=1]

    检索时命中子块 B → 扩展返回父块 1 的完整内容
    ```
    > 技术难度较大，适用于 知识库条数>1000 的场景
  - `增量更新索引`：当前 HNSW 索引是插入时自动更新的，没问题。但如果同一文档频繁更新（客服政策调整），应该 `DELETE WHERE doc_id=X + INSERT` 而不是 append，避免旧版 chunk 混入检索结果。

3. 查询优化：
  - `查询改写（Query Expansion）`：LLM 生成的查询词直接用于检索，如果查询词本身模糊（"我的问题怎么解决"），检索效果差。可以在检索前加一步：`让 LLM 把工单内容扩写成更具体的检索 query`
  - `多路查询 + 去重`：对同一工单发起 3 个不同角度的查询（原始问题 / 可能原因 / 解决方向），合并去重后 RRF 融合，召回率更高。
  - `元数据过滤`：当前检索是全库扫描，没有按 `source_type` 或文档标签过滤。可以给文档打标签（"退款政策" / "账号安全" / "发票"），`检索时根据分类结果预过滤，减少噪音`

4. 检索质量评估：
  - `Reranker（精排）`：`向量检索（召回 Top-20）→ 交叉编码器精排（Top-5）`。Cross-encoder 把 query 和每个 chunk 拼接后送 LLM 打分，比向量相似度更准确，但慢。适合工单量不大的场景
    > DashScope 也提供 Reranker API（reranking-v1），可以直接用
  - 反馈闭环：客服审批草稿时的修改记录（`artifacts 里的 diff 字段`）是天然的质量信号。`如果草稿被大幅修改，说明检索结果质量不佳，可以定期分析这些记录，反向优化 Prompt 和检索策略`。



- *Cross-Encoder 重排序的实现方案？*

当前检索管道：
```
query → embedder.embed → 向量检索 Top-20 + 关键词检索 Top-20 → RRF 融合 → 返回 Top-5
```
> 向量检索是"双塔模型"——query 和文档分别编码成向量再比较余弦距离，速度快但精度有损。

Cross-Encoder 是`"交叉编码"——把 [query, document] 拼接后一起送模型，模型能感知两者的精细交互，相关性打分更准`：
```
query → 向量检索 Top-20（召回）
                    ↓
            Cross-Encoder 对每对 (query, doc) 重新打分（精排）
                    ↓
                返回 Top-5（精准）
```
> Cross-Encoder 慢（需要对 query+每个候选文档单独 inference），不能用于全量扫描，只做 Top-20 → Top-5 的精排。

DashScope 提供了开箱即用的 Reranker API，不需要自部署：
```
API: POST https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank
模型: qwen3-rerank（通义，支持中文，128K context）（gte-rerank 已下线）
输入: { query, documents: string[], top_n }
输出: [{ index, relevance_score }]（按相关性降序）
```


- *RAG判定检索结果`has_sufficient_results`是否充分时会取`score`进行判断，这里的 `score` 具体是什么计算逻辑呢？*

1. 首先进行向量查询：`SELECT 1 - (embedding <=> $1::vector) AS score FROM knowledge_docs ORDER BY embedding <=> $1::vector`；`<=>` 是 pgvector 的余弦距离算子，值域 [0,1]，这里会返回 余弦相似度 作为 score 返回，并按 score 正序返回；
2. 之后进行关键词查询：`SELECT ts_rank_cd(search_vector, plainto_tsquery('zh', $1)) AS score FROM knowledge_docs ORDER BY score DESC`；`ts_rank_cd` 是 PG 内置的 cover density 排名函数，综合词频和词距，值域 [0,1]；并按 score 降序返回；
3. rrfFuse — 两路融合排序：`rrfScore += 1 / (60 + rank)`；两路结果分别按各自排名计算 RRF 分，累加后重新排序；vector 路优先
4. judgeSufficiency 阈值判断：就是对第一条结果的原始 DB score 做判断

> score 本质上是 `余弦相似度（vector path 优先）`，衡量的是 query embedding 与 doc embedding 的语义接近程度；融合排序用 RRF，但 judgeSufficiency 判断用的还是原始的语义相似度分值。



- *这个Agent线上运行，用户的问题超出知识库怎么办？*

1. `Prompt 层面加约束`（draft_reply 的系统提示词）：告诉 LLM"`只基于 knowledge_results 回答，如果检索结果为空或不相关，明确告知用户'需要转人工核实'，禁止编造`"。这是防幻觉的第一道防线，比事后检测更有效。

2. 检索结果不足时，Runtime 层做兜底判断，通过 `has_sufficient_results` 字段判断：
``` ts
// runtime.ts 里 mergeObservation 之后，可以加检查
if (action.skill === 'search_knowledge') {
  const searchData = result.data as { has_sufficient_results: boolean; total: number };
  if (!searchData.has_sufficient_results && searchData.total === 0) {
    // 知识库完全没有相关内容，不进入 draft_reply，直接升级人工
    obs = pushToolError(obs, '知识库无相关结果，请升级人工处理，不要编造答案');
    // 或者直接转 waiting_for_escalation
  }
}
```

3. 置信度阈值兜底：DraftResultSchema 里已经有 `confidence` 和 `needs_human_edit` 字段；当前项目的 HITL 机制（`draft_reply.requires_approval = true`）已经保证所有草稿都要人工审批，这其实是当前架构对"知识库覆盖不足"问题的兜底防线——即使 LLM 编了内容，人工审批这一步能拦下来。



- *怎么设计RAG的评测集？RAG的评测集有多少条算合理？*

RAG pipeline 有两个独立环节，必须分开评:
- 第一层：检索质量（Retrieval）：`返回的 results 排序对不对 `
- 第二层：生成质量（Generation）：`draft_reply skill 基于检索结果生成的回复对不对`


评测集的标准结构：Query-Answer-Context 三元组：
``` ts
interface RagEvalCase {
  id: string;
  query: string;                    // 用户会问的问题（工单原文风格，不是教科书式提问）
  expected_doc_ids: string[];        // 应该被检索到的文档 id（人工标注的 ground truth）
  expected_answer_keypoints: string[]; // 正确回复必须包含的要点（不要求逐字匹配）
  category: 'exact_match' | 'paraphrase' | 'multi_doc' | 'no_answer' | 'ambiguous';
  difficulty: 'easy' | 'hard';
}
```
category 字段是评测集设计的核心，也是最容易被漏掉的部分：
- `exact_match`：query 用词跟知识库文档几乎一致（检验最基本能力）
- `paraphrase`：用户换一种说法问同一件事（比如"退货要多久到账"vs"退款周期是几天"）：检验的是向量检索能不能补关键词检索的短板，这直接对应你项目 RRF 融合两路的价值
- `multi_doc`：答案需要综合多篇文档才能回答完整：检验 topK 参数和 judgeSufficiency 的 results.length >= 3 分支是否设置合理
- `no_answer`（最容易被忽略但最重要）：知识库里根本没有这个问题的答案，正确行为是判定"检索不充分"——直接对应你项目里刚落地的"检索结果不足升级人工"逻辑。这一类如果没有，你永远测不出误判率（把"没有答案"误判成"有答案"，会导致模型编造）
- `ambiguous`：问题本身模糊（比如"怎么退款"没说明是哪个订单），检验的是分类/澄清逻辑，而不是纯检索


多少条算合理：不是拍一个固定数字，是按用途分层
1. `冒烟测试（每次 PR 跑）：20-30 条`；覆盖核心 category 各几条，跑得快，卡住明显回归
2. `版本对比（改 prompt/换模型前后对比）：100-200 条`；差异要有统计意义，样本太少两次跑的随机波动会盖过真实差异
3. `全面评测（发版前 / 定期巡检）：300-500+ 条`；覆盖长尾 query 分布，尤其是 no_answer/ambiguous 这类边界 case 要占足够比例（建议不低于总量 20%，这类恰恰是线上事故高发区）；保证每个 category 都有代表性样本


评测集从哪来：
1. `真实工单回流`：从线上 steps 表里捞被判定为 waiting_for_escalation 或人工修改过 draft 的 Run，这些是模型表现不好的真实案例，直接转成评测样本，比人工拍脑袋编的 query 更有针对性
2. `知识库反向生成`：对每篇 knowledge_docs 文档，用 LLM 生成"这篇文档能回答什么问题"，反向构造 query，保证覆盖率（这类天然是 exact_match/paraphrase）
3. `人工构造边界 case`：no_answer/ambiguous 类通常知识库里天然缺失对应数据，需要人工专门设计（比如故意问一个知识库完全没覆盖的话题）



## Skill调用流程


``` ts
// 1. Skill格式定义（packages/shared/src/skills.ts）
export const SKILL_SIGNATURES: Record<SkillName, SkillDefinition> = {
  classify_ticket: {
    name: 'classify_ticket', // 工具名
    description: '对客服工单进行分类，判断紧急程度和是否可机器回复。', // 工具描述
    requires_approval: false,
    parameters: { // 参数
      type: 'object',
      properties: {
        ticket_content: { type: 'string', description: '工单的完整内容，包括标题和正文' },
        customer_history_summary: { type: 'string', description: '该客户最近3条工单的摘要' },
      },
      required: ['ticket_content'],
    },
    returns: { //返回格式
      type: 'object',
      properties: {
        priority: { type: 'string', enum: ['urgent', 'normal', 'auto_reply'] },
        category: { type: 'string' },
        confidence: { type: 'number' },
        reasoning: { type: 'string' },
      },
    },
  },
}

// 1.1 构建初始 Observation：注入 system(skill 签名) + user(工单内容)  （server/src/agent/context.ts）
function build(run: Run, ticket: Pick<Ticket, 'id' | 'subject' | 'content' | 'customer_id'>): Observation {
  const systemPrompt = this.buildSystemPrompt();
  const userPrompt = this.buildUserPrompt(ticket);
  return {
    runId: run.id,
    threadId: run.thread_id,
    ticket,
    classification: null,
    searchResults: [],
    draft: null,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  };
}
// 构建编排层LLM系统提示词：
function buildSystemPrompt(): string {
    const skillList = Object.values(SKILL_SIGNATURES)
      .map((s) => `- ${s.name}${s.requires_approval ? '（需人工审批）' : ''}: ${s.description}`)
      .join('\n');
    return `你是客服工单处理 Agent。按 ReAct 模式逐步处理工单：观察→推理→行动→结果。

可用 Skill：
${skillList}

处理流程：classify_ticket → search_knowledge → draft_reply。
draft_reply 产出草稿后需人工审批才能发送（你不要直接"发送"，只起草）。
每次只返回一个 JSON 动作：{"skill":"...","params":{...}} 或 {"finish":true,"reason":"..."}。`;
}
function buildUserPrompt(t: Pick<Ticket, 'id' | 'subject' | 'content' | 'customer_id'>): string {
    return `工单内容：
${t.subject}
${t.content}`;
}


// 1.2 构建编排层信息（server/src/agent/runtime.ts）
obs = this.contextBuilder.build(run, ticket);
// 调LLM进行编排：
const reasoning = await model.call({
  messages: obs.messages, // 传入上面构建的messages
  availableSkills: AVAILABLE_SKILLS,
  signal: sub.signal,
});


// 2. 分类阶段调 LLM 传参：
const body = {
  model: 'deepseek-chat',
  messages: input.messages, // 编排层LLM系统提示词
  tools: [{ // 传入所有 skill
    type: 'function',
    function: {
      name: s.name, // 传入skill名称
      description: s.description,
      parameters: {
        type: 'object' as const,
        properties: s.parameters.properties,
        required: s.parameters.required,
      },
    },
  }],
  tool_choice: 'auto', // 让模型自动选择 tool
  temperature: 0.1, // 低温度保证编排输出稳定
};
// LLM返回值解析：
const json = (await response.json()) as DeepSeekChatResponse;
const choice = json.choices[0];
const toolCall = choice.message.tool_calls?.[0]; // 有 tool_call → 解析为 Skill 调用
const params = JSON.parse(toolCall.function.arguments ?? '{}');
// 格式化返回
return {
  action: { skill: skillName as any, params }, // 拿到 LLM 返回的skill名称
  model_used: modelUsed, // 模型使用情况
  usage, // token用量
  raw: JSON.stringify(toolCall),
};


// 4. 执行skill:
const action = reasoning.action as { skill: SkillName; params: Record<string, unknown> };
const skill = SKILL_REGISTRY[action.skill];
const result = await skill.execute(this.bindParams(action.skill, action.params, obs), skillCtx); // 执行
// Error-as-Data：失败不抛，作为数据交给 LLM
if (!result.success) {
  await store.steps.update(stepRec.id, { error: result.error!, duration_ms: duration });
  await emitter.emit(run.id, 'step_error', { step: stepNum, error: { code: result.error!.code, message: result.error!.message } });
  obs = pushToolError(obs, result.error!.message); // 校验不通过，把报错信息push上下文，重试
  continue;
}
/** 把 tool 错误也写进对话历史，让 LLM 感知失败并自主决定换词重试 */
function pushToolError(obs: Observation, message: string): Observation {
  return {
    ...obs,
    messages: [...obs.messages, { role: 'tool', content: JSON.stringify({ error: message }) }],
  };
}


// 5. skill执行具体逻辑：（server/src/skills/classify-ticket.ts）
export const classifyTicketSkill: RegisteredSkill = {
  name: 'classify_ticket',
  requires_approval: false, // P0-1.4：分类不需审批
  retrySafe: true,          // 只读 LLM + 写 DB 状态，无不可撤销副作用
  async execute(params, ctx): Promise<SkillResult> {
    const ticket = String(params.ticket_content ?? '');
    const raw = await ctx.complete(buildClassifyPrompt(ticket), { signal: ctx.signal }); // 执行 LLM 调用进行分类
    const parsed = tryParseJSON(raw);
    const validation = validateSkillOutput('classify_ticket', parsed); // 返回数据格式校验
    if (!validation.ok) {
      return { success: false, error: validation.error };
    }
    return { success: true, data: validation.value };
  },
};
// 系统上下文提示词构造：
function buildClassifyPrompt = (ticket: string) => `你是客服工单分类专家。根据工单内容判断紧急程度和分类。

分类规则：
- urgent: 涉及资金安全、用户投诉升级、法律风险、系统故障影响大量用户
- normal: 常规功能咨询、使用问题、一般性反馈
- auto_reply: 常见问题（密码重置、发票开具方式、配送时间查询等），知识库中有标准答案

注意：宁可把 urgent 判断为 normal，也不要把 urgent 判断为 auto_reply。
confidence 低于 0.7 时，在 reasoning 中说明不确定性来源。

工单内容：
${ticket}

只返回 JSON：{"priority":"urgent|normal|auto_reply","category":"分类","confidence":0.0-1.0,"reasoning":"理由"}`;



// 6. ctx.complete方法执行逻辑（server/src/skills/llm-complete.ts）
return async (prompt: string, callOpts?: { signal?: AbortSignal }): Promise<string> => {
  const response = await fetch(url, {
    method: 'POST',
    signal: callOpts?.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的客服 AI，请严格按照 JSON 格式返回结果，不要输出任何额外文字。',
        },
        { role: 'user', content: prompt },
      ],
      // 强制 JSON 输出，减少格式幻觉（DeepSeek 和通义均支持）
      response_format: { type: 'json_object' }, // 保持格式化输出的关键！！！
      temperature: 0.3, // 生成层可以稍高温度，保证回复自然
      max_tokens: 1024,
    }),
  });
  const json = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  const content = json.choices[0]?.message?.content;
  return content;
};


// 7. 校验 Skill 输出，返回统一 Result（server/src/guard/schema-validator.ts）
import { z } from 'zod';
export const ClassifyResultSchema = z.object({
  priority: z.enum(['urgent', 'normal', 'auto_reply']),
  category: z.string().min(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
});
const SCHEMAS: Record<SkillName, z.ZodType> = {
  classify_ticket: ClassifyResultSchema,
  // ...
};
export function validateSkillOutput(skillName: SkillName, output: unknown): Result<unknown, AppError> {
  const schema = SCHEMAS[skillName]; // 拿到定义好的 schema 格式
  if (!schema) {
    return err({ code: 'UNKNOWN_SKILL', message: `无 schema: ${skillName}`, retryable: false });
  }
  const result = schema.safeParse(output); // 执行zod的 safeParse 方法进行校验
  if (!result.success) {
    // zod 错误格式化为可读字符串，供 LLM 自行修正
    const message = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return err({ code: 'SCHEMA_VIOLATION', message, retryable: true }); // 校验不通， LLM 重试
  }
  return ok(result.data);
}
```




## 后续迭代

- 高频问题复盘+闭环：
1. 需要至少 1-2 周数据积累，独立于主链路
2. 高频问题复盘（每周 FAQ 推荐）、草稿→发送→用户反馈闭环、Badcase 归因
3. `审批通过的回复 + 关联知识条目` = FAQ 候选素材，供"复盘高频问题"功能使用


- 记忆+自优化：Semantic Memory（跨工单知识沉淀）、Prompt 自动调优、Skill 命中率监控、置信度分级审批

- 提取图片中的文字：接入OCR



## 关键问题
> 生产级 Agent 系统绕不开以下 6 个问题：


### 一次执行如何创建、取消、重试和结束？

`创建：`POST /tickets => 写入 tickets 表 => 创建 Thread（绑定 ticket_id + customer_id） => 创建 Run => SSE 推送 event: run_created

`取消：`PATCH /api/v1/runs/:id { status: cancelled } => cancelBus：Pub/Sub 信号 + AbortController =>  Runtime Loop 检测 status 变更 => 跳过后续 Step，已完成的 Step 结果保留（不回滚） => SSE 推送 event: run_cancelled

`重试：`查询最后一个成功的 Checkpoint => 创建新 Run（state: retrying），继承 Thread 上下文 => 从 Checkpoint 恢复状态，跳过已完成 Step => 只重试失败的那一步 => SSE 推送 event: run_retrying
> 重试不覆盖旧 Run，而是创建新 Run。旧 Run 保留完整轨迹供审计，新 Run 的 `metadata.retry_from` 指向旧 Run ID。


`结束：`
1. 正常完成：3 个 Step 全部完成 + 审批通过；`completed`
2. 用户取消：客服点击取消；`cancelled`
3. 执行失败：任一 Step 不可恢复错误 + 重试次数耗尽；`failed`
4. 超时：Run 总时长超过 timeout_ms；`failed`（自动触发重试）
5. 升级：分类为"紧急"且客服选择升级；`waiting_for_escalation`
6. 步数超限：超过 max_steps 仍无产出；`failed`（Agent 陷入循环）




### 哪些历史、文件、状态和权限对当前执行可见？

仅当前工单+ 分类 + 客户最近3条工单 + Top-K 知识 + Skill 签名；

L1-L4 权限分层；Thread 仅绑当前 customer_id



### 失败、中断、升级后系统还能不能恢复？

完整失败处理体系（五个层次）：

`层次 1：工具错误 — Error-as-Data`

Skill 执行失败（schema 校验不过、检索返回空、LLM 输出格式异常）时，不抛异常，把错误作为 tool 消息追加到对话历史，让 LLM 自己感知并修正；

LLM 拿到 `{ error: "SCHEMA_VIOLATION: priority: invalid enum" }` 后可以自主换词重试或选择不同 Skill，不需要人工干预。



`层次 2：Checkpoint 断点续传`

每个 Step 执行完成后自动保存 Checkpoint，重试时从最后一个成功的 Checkpoint 恢复：`Step2 失败 → 从 Checkpoint1 恢复 → 只重跑 Step2 → Step1 的分类结果不重算`


`层次 3：人工中断（HITL）— 状态挂起`

draft_reply 完成后，handleHitl 把 Run 转为 `waiting_for_review / waiting_for_escalation`，Runtime 返回（return），等待客服审批



`层次 4：系统级异常 — 直接 failRun`

DB 连接、所有模型降级失败、内存溢出、网络层错误（远端关闭/DNS/管道）等不可恢复错误，isSystemError 判断后走 `failRun`，Run 状态转 failed，`emit run_failed`，前端收到通知；由客服手动触发 POST /runs/:id/retry 路由


`层次 5：进程崩溃 — 启动时崩溃恢复`
> 问题：进程崩溃（kill/OOM/断电）后，`running`/`created`/`retrying` 态 Run 永远卡死——无进程执行却显示进行中，客服工单永久「处理中」。

进程意外退出时（OOM、机器重启、部署），正在运行的 Run 没有人来结束它，状态永远卡在 running/created/retrying；`reconcileCrashedRuns 在下次启动时扫描所有非终态 Run"`，按两个策略处理：
1. `waiting_for_review`/`waiting_for_escalation` → 半终态保留（人工审批不依赖进程）
2. `running`/`created`/`retrying` → 崩溃候选：
  - 保持默认，`emit run_failed`；适用于 `客服容错率低，宁可人工重试`
  - 重试，检查未完成 Step 的 Skill 是否都 `retrySafe=true`，是则创建新 Run 从 Checkpoint 恢复；每个 Run 处理前 `findById` 二次确认状态，已转终态则跳过

```
进程重启
  │
  ▼
扫描 runs 表中 status ∈ {running, created, retrying}
  │
  ├─ waiting_for_review / waiting_for_escalation
  │   → 保留不动（人工审批不依赖进程，客服仍可审批）
  │
  └─ running / created / retrying（崩溃候选）
       │
       ├─ 已转终态（并发已处理）→ skip（幂等保证）
       │
       ├─ policy=mark_failed（默认）
       │   → 转 failed，emit run_failed
       │   → 客服工单显示「处理失败，可手动重试」
       │
       └─ policy=retry
           │
           ├─ 检查未完成 Step 的 Skill 是否都 retrySafe=true
           │   → 是：创建新 Run（retry_from=旧 Run ID），从 Checkpoint 恢复上下文
           │   → 否：降级 mark_failed
```

崩溃点识别：有 `created_at 但 output IS NULL AND error IS NULL` 的 Step => 即崩溃时进行中的 Step；
> 其之前的 Step（有 output）= Checkpoint 恢复起点

V1 量级小（单实例、工单量有限）可接受；V2 大规模部署应改为分页循环
> listByStatus() 是 SELECT * FROM runs WHERE status=$1，没有 LIMIT 和 OFFSET。长时间宕机后重启，可能一次性加载几百个 Run 进内存，在高负载下可能 OOM 或超时。



### 前端、评测和审计系统如何知道 Agent 正在做什么？

SSE 可恢复流（Redis Stream XREAD 回放）+ events 表审计


**Metrics 指标:**
1. Run 成功率：`completed / total`；`< 70% → P1 告警`
2. Run 平均耗时：`avg(completed_at - created_at)`；`> 60s → P2`
3. Run 平均轮次：`avg(current_step)`；`> 4 → P2`
4. 单 Run Token 成本：`sum(token_input + token_output)`；`> 10000 → P2`
5. 模型 API 错误率：`failed_llm_calls / total_llm_calls`；`> 5% → P1`
6. 分类置信度分布：`按 priority 分组统计低置信度比例`；`低置信度 > 30% → P2`




### 最终产物如何被保存、引用、追溯和复用？

保存：Artifact 表绑定 `run + step + thread`；

引用：客服修改草稿时，引用 `draft_v1`（通过 `artifact_id`），修改后生成 `draft_v2`，保留 `diff` 字段。

追溯：`sent_reply → 哪个 Run → 哪个 Step → 用了哪些知识条目 → 分类依据是什么`

复用：审批通过的回复 + 关联知识条目 = FAQ 候选素材，供"复盘高频问题"功能使用（V2版本中新增）。



### Agent 什么时候可以真的改文件、发请求或下订单？

L1/L2 自动；L3 声明式 HITL；L4 工具不注册（最硬护栏）






## 其他问题




### 后续迭代如何再已有架构基础上做优雅升级？会有哪些考虑？


`接口扩展`：新增实现类，不修改接口
1. 接入 Claude / GPT-4o → 新增 `AnthropicModelClient`，接口不变
2. 换向量模型 → 新增 `BGEEmbedder`，接口不变
3. 生产多实例 → 把 SerialQueueRunExecutor 换成 `BullQueueRunExecutor`，已实现，接口不变

缺点：app.ts 的条件分支会越来越多，到一定规模可以把它拆成独立的 container.ts 做依赖容器。


`Skill 扩展`
1. V2 要加 send_to_customer（L3）、refund_order（L4 审批）等 Skill，当前架构对此有明确预留
2. L4 Skill（`退款/改单`）的幂等性：如果崩溃恢复自动重试了一个已经成功的退款操作，会多退一次钱。对 `L4 Skill：retrySafe = false`，崩溃恢复会降级到 mark_failed 而不是自动重试；`需要在 Skill 内部加幂等检查`（查 DB 是否已执行过）


`状态机扩展`：当前状态机（state-machine.ts）是一个简单的 transition 矩阵，扩展需要在 TRANSITIONS 矩阵里加新行
1. `waiting_for_escalation` 的完整恢复路径（目前骨架，转换路径已定义但没有触发逻辑）
2. 新状态比如 `paused`（人工暂停，不同于 waiting_for_review）
3. 状态机兼容：新增状态追加到现有状态机，不删除已有状态








### agent的可观测性是如何实现的？

1. 已有的Agent数据模型已经覆盖了完整的Trajectory：
  - runs：`状态机流转、planned_model vs actual_models_used、timeout_ms、error_message`；运行级概览
  - steps：`每步的 skill_name、input/output JSONB、model_name、token_input/output、duration_ms`；单步级 trace
  - checkpoints：`每步后的完整 messages 数组`；状态回溯、调试
  - artifacts：`草稿内容、lint 结果、approved_by/at`；产物质量和审批链
  - events：`全量事件流（type + payload + ts）`；时序回放、SSE 审计


2. Metrics 聚合层：封装常用聚合查询，暴露 GET /api/v1/metrics/daily 之类的端点给运维后台

3. Trace 可视化：新建 GET /api/v1/runs/:id/trace 端点，返回结构化的 trace JSON；前端可以用时间线组件渲染这个 trace，类似 LangSmith / Langfuse 的 trace 视图。

4. 实时监控看板：新建 GET /api/v1/metrics/live 聚合当前 running/failed/waiting 的 Run 数量，给运维看板用。



### Metrics，Trajectory 分别是什么？

Trajectory（轨迹）：一次 Agent 执行的完整过程记录，回答"这次跑了什么"。是原始日志，记录每一步的输入、输出、决策链。

Metrics（指标）：对系统运行状态的聚合度量，回答"整体表现怎么样"。是统计数字，通常按时间维度汇总。



### agent的可评测数据如何统计的？


**线上运营指标（Metrics）**

效率类：
- `Run 成功率`：`completed / (completed + failed + cancelled_by_system) * 100%`；runs 表，按状态聚合；*良好：95-99%*
- `崩溃恢复率`：`恢复率 = reconcile 后 retried 数 / crashed 数 * 100%`；*良好：> 80%（大多数崩溃被自动重试）*
- `全流程端到端时长`：`run.updated_at - run.created_at`	runs 表两个时间戳；*（P95）=> 良好：< 30s、优秀：< 15s*
- 各 Skill P95 耗时：
  - *classify_ticket：良好：< 2s、优秀：< 1s；单次 LLM complete*
  - *search_knowledge：良好：< 2s、优秀：< 1s；向量 API + DB*
  - *draft_reply：良好：< 5s、优秀：< 3s；LLM complete，文本生成较慢*
  > 接入真实 LLM 后，编排层 model.call 每轮约 1-3s，3 轮编排 + 2 轮生成，合理端到端期望是 10-20s。

- `平均处理时长`：`AVG(steps.duration_ms) 乘以步数`；steps.duration_ms
- `草稿首次通过率`：`审批时 modified_draft 为空的比例`；artifacts 表，content.diff 是否为空
- `人工介入率`：`waiting_for_review 状态的 Run 占比`；runs 表状态分布


成本类：
- `每 Run 平均 token 消耗`：`SUM(token_input + token_output) / run_count`；steps 表；`良好：< 2000 tokens/Run`
- `按模型分拆 token`：`按 steps.model_name GROUP BY`；steps 表
- `检索调用次数`：`COUNT WHERE skill_name='search_knowledge'`；steps 表
- `每 Run LLM 调用次数`：正常：5 次；如果稳定超过 7 次，说明 Error-as-Data 修正频繁，Prompt 需要优化。



**质量评测（Evaluation）**

- 分类准确率：classify_ticket 的输出是否正确；`准确率 = 匹配正确的 / 总数`

- 检索命中率：search_knowledge 检索到的知识条目是否和工单真正相关；
  - 数据收集：`steps 表中 skill_name='search_knowledge' 的 output.results（返回了哪些文档）`
  - 指标：
    - Recall@K（期望文档在 Top-K 里的比例）
    - Precision@K（Top-K 里相关文档的比例）
    - `检索充分率`：`has_sufficient_results=true / total search * 100%`；*良好：> 70%、优秀：> 85%*

- 草稿质量：
  - 数据收集：artifacts.content.draft、artifacts.content.diff
  - 指标：
    - `草稿采用率`（status=sent AND diff 为空 / 总草稿数）；*危险：< 40%、及格：40-60%、良好：60-75%、优秀	> 75%*
    - 忠实性（人工打分）

- `敏感词 Lint 通过率`：*合格线：> 99%（低于这个数说明 Prompt 或知识库有问题）、优秀：100%（所有草稿都通过护栏检查）*



**稳定性指标**

- MTBF（平均无故障时间）：`总运行时间 / 故障次数`；*良好：> 7 天、优秀：> 30 天*
- 错误分布（判断失败是偶发还是系统性）：从 steps.error.code 统计，按类型分类；*健康状态：没有单一错误类型超过总失败的 30%（分散），且没有 DB_ERROR 持续出现。*



**综合评级良好判定：**

`Run 成功率（>95%） + 草稿采用率（>60%） + P95 端到端时长（<30s） + 检索充分率（>70%） + Lint 通过率（>99%）`

> 5 个维度全部达到良好 = 系统良好；全部达到优秀 = 系统优秀；任意核心指标（成功率/采用率）低于良好 = 需要立即干预。




`Q：换了新 Prompt / 换了模型 / 改了分块策略，怎么衡量效果有没有提升？`
> 利用 runs.planned_model 和 runs.actual_models_used 字段：
1. 同一批工单，一半走模型 A，一半走模型 B（在 app.ts 按工单 ID 路由）
2. 比较两组的`草稿采用率、token 消耗、处理时长`
3. 结合 `artifacts.content.diff `判断哪个版本的草稿被改动更少


```
steps.input            → 每步实际入参（可重放）
steps.output           → 每步实际出参（分类结果、检索结果、草稿）
steps.error            → 失败原因分布
steps.duration_ms      → 延迟分析
steps.token_input/output → 成本核算
steps.model_name       → 按模型分拆统计

artifacts.content.draft         → AI 初稿
artifacts.content.diff.modified → 客服修改版
artifacts.status                → 最终是否发送
artifacts.approved_by           → 谁审批的

checkpoints.state.messages      → 完整对话历史（可用于 Prompt 复盘）
```


**RAG 性能评估**


1. 摄入质量（Ingestion）
- `Chunk 截断率`：chunk 在句子中间截断的比例（结尾不是 `。！？;` 等语义边界）→ 当前 chunker.ts 用字符数切割，有概率在句中截断，应该统计
- `Chunk 长度分布`：用直方图查看，理想是集中在 200-400 字，偏短（< 100）或偏长（> 600）的 chunk 质量通常较差
- `空 chunk 率`：解析后为空或全是标点的 chunk 占比，这些 chunk 会污染向量空间

> 当前如何获取：knowledge_docs 表里有 content_text 和 chunk_index，执行一条 SQL 就能看：
```
SELECT
  COUNT(*) total,
  AVG(length(content_text)) avg_len,
  COUNT(*) FILTER (WHERE length(content_text) < 100) short_chunks,
  COUNT(*) FILTER (WHERE length(content_text) > 600) long_chunks
FROM knowledge_docs;
```

2. 检索质量（Retrieval）
- `召回率（Recall@K）`：对于已知答案在哪个文档里的问题，Top-K 里有没有检索到正确文档
- `精确率（Precision@K）`：Top-K 里有多少是真正相关的，排除噪音文档的能力。
- `RRF 融合效果对比`：基线对比融合前后的准确率和召回率 => 混合检索比纯向量多带来了多少提升
- `has_sufficient_results 准确率`：`当前阈值：top1 score≥0.7 或 top1≥0.5 且 ≥3 条`



3. 生成质量（Generation）
- `忠实性（Faithfulness）`：草稿里的每一个事实陈述，能否在检索结果里找到出处。这是 RAG 幻觉的核心指标。
  - 评估方式（自动）：用 `LLM-as-judge`：
  ```
  Prompt: 以下是检索到的知识条目：{context}
        以下是生成的草稿：{draft}
        请逐条检查草稿中的事实陈述，标出哪些无法在知识条目中找到依据（幻觉）。
  ```
  - 评估方式（人工）：客服团队每周抽查 20-30 条已发送的草稿，人工标注幻觉条目。

- `完整性（Completeness）`：工单提的所有问题，草稿是否都有回应。可以从 artifacts.content.diff 里分析：客服补充了哪些 AI 没有写的内容？

- `草稿采用率（最容易统计的代理指标）`：采用率是忠实性 + 完整性的综合代理指标——客服不改直接发，说明草稿质量高。
  ``` sql
  SELECT
  COUNT(*) FILTER (WHERE status='sent' AND (content->'diff') IS NULL) no_edit,
  COUNT(*) FILTER (WHERE status='sent') total_sent,
  ROUND(
    COUNT(*) FILTER (WHERE status='sent' AND (content->'diff') IS NULL) * 100.0
    / NULLIF(COUNT(*) FILTER (WHERE status='sent'), 0),
    1
  ) adoption_rate_pct
  FROM artifacts
  WHERE type='draft';
  ```




### 在分类编排阶段是调分类模型进行分类处理，项目中通过什么手段保证分类正确呢？如果分类错误后续怎么处理？


1. `LLM 的 messages 历史是天然约束`

每轮 ReAct Loop 都把完整对话历史传给 LLM，包含已完成的所有 tool_call 和结果。LLM 能"看到"已经做了什么，自然倾向于按逻辑顺序推进，而不会重复调已经成功的 Skill。

在调编排层模型的系统提示词里会写明：`处理流程：classify_ticket → search_knowledge → draft_reply`，严格约束模型返回结果


2. `未知 Skill → Error-as-Data`

LLM 如果幻觉出不存在的 Skill，不会崩溃，错误作为 tool 消息追加到历史，LLM 下一轮会纠正。


3. `max_steps 上限`

即使 LLM 反复做错误决策，最多执行 max_steps（默认 5）轮就强制 failRun，不会无限循环。


4. `Tool Schema 约束`

给 LLM 的 tools 参数只包含已注册的三个 Skill，LLM 在 Function Calling 模式下只能选这三个之一，或者返回 finish————选择空间本来就很小。



5. `流程硬约束`：如果想从架构层面保证 Skill 执行顺序，而不依赖 LLM 的"理解能力"，可以在 Runtime 加一个流程阶段检查




### 真实环境下调用大模型，如何保证输出结果的鲁棒性？

> 真实 LLM 的输出是文本，需要一套机制把"非确定性文本"可靠地转换成"确定性结构"。

1. 现代 LLM API 都支持 `tools 参数：tools + tool_choice`，让模型直接输出结构化 JSON 而不是自由文本：
``` js
// 真实调用示例
const response = await openai.chat.completions.create({
  model: 'deepseek-chat',
  messages,
  tools: [
    {
      type: 'function',
      function: {
        name: 'classify_ticket',
        description: '对工单进行分类',
        parameters: {
          type: 'object',
          properties: {
            priority: { type: 'string', enum: ['urgent', 'normal', 'auto_reply'] },
            category: { type: 'string' },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
          },
          required: ['priority', 'category', 'confidence'],
        },
      },
    },
  ],
  tool_choice: 'auto',
});

// 大模型不会真正"调用"工具，它只是"声明它想调用哪个工具"；大模型返回的不是函数执行结果，而是一个"我想调这个函数"的声明：
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "classify_ticket",
          "arguments": "{\"ticket_content\": \"我的密码忘了怎么办\"}"
        }
      }]
    },
    "finish_reason": "tool_calls"
  }]
}

// 大模型返回这个声明之后，执行权回到代码：
// deepseek.ts 里的 call() 方法解析 tool_calls[0].function.arguments，把 JSON 字符串变成 params 对象，返回 ModelResponse。
// Runtime 收到后去 SKILL_REGISTRY 里查 action.skill（字符串名），找到真实的 TypeScript 函数，在本地执行。
const action = reasoning.action as { skill: SkillName; params: ... };
const skill = SKILL_REGISTRY[action.skill];   // 从本地注册表里找到真实函数
// ...
const result = await skill.execute(params, skillCtx);  // 本地执行
```
模型被强制走 JSON Schema 约束的输出路径，大部分格式问题在 API 层就消灭了。这是第一道也是最重要的防线。
> 生产环境这里对接 DeepSeek V3 / 通义 Qwen-Max，走 Function Calling 模式，强制模型输出结构化 tool_call。


执行流程图：
```
你的代码                          大模型
   │
   │── 发送消息 + tools 描述 ──────►│
   │                                │ 根据描述推理
   │                                │ "我应该调 classify_ticket"
   │◄── 返回 tool_calls 声明 ────────│
   │
   │ 在本地执行 SKILL_REGISTRY['classify_ticket']
   │ 得到结果
   │
   │── 把结果作为 tool 消息追加 ────►│
   │   { role: 'tool', content: ... }│ 再次推理
   │                                │ "好，检索知识库吧"
   │◄── 返回下一个 tool_calls ───────│
   │
   ... 循环直到返回 finish
```
> tools 参数的作用是告诉模型有哪些工具可用、每个工具的入参格式是什么，相当于给模型看一份"菜单"。模型根据菜单选菜（输出名字+参数），你的代码负责上菜（执行真实逻辑），再把结果端回来给模型看。工具函数永远在你这边，模型那边只有 JSON 描述。


- `约束强度`：强，field 级别 schema 校验；
- `解析失败怎么办`：返回 finish，Runtime 当成完成处理




2. 靠 response_format + Prompt 约束（生成层模型调用）
> classify_ticket、draft_reply 内部调 ctx.complete(prompt)，要求 LLM 返回特定 JSON 结构（分类结果、草稿对象）
``` ts
// 保证手段：response_format: json_object + System Prompt
body: JSON.stringify({
  model,
  messages: [
    {
      role: 'system',
      content: '你是一个专业的客服 AI，请严格按照 JSON 格式返回结果，不要输出任何额外文字。',
    },
    { role: 'user', content: prompt },
  ],
  response_format: { type: 'json_object' },  // ← 强制 JSON 输出
  temperature: 0.3,
})
```
> response_format: { type: 'json_object' } 是 OpenAI 协议（DeepSeek/Qwen 均兼容）的强制 JSON 模式，模型被保证只输出合法 JSON，不会夹带 markdown 代码块或解释性文字。具体 JSON 的字段约束靠 Prompt 里的 schema 描述


- System prompt 明确规则："你只能调用以下工具之一：classify_ticket / search_knowledge / draft_reply，不得输出其他内容"
- 要求 LLM 输出 JSON 文本。编排层 temperature=0.1（稳定），生成层 temperature=0.3（自然）
- `约束强度`：中，只保证合法 JSON，字段靠 prompt
- `解析失败怎么办`：Skill 内部 JSON.parse 失败 → result.success=false → Error-as-Data 喂回 LLM





3. 输出解析 + Schema 校验
> 输出要做完整的 JSON Schema 或 Zod 校验：
``` ts
// 模型返回 tool_call 后，解析并校验
const raw = response.choices[0].message.tool_calls?.[0]?.function?.arguments;
const parsed = JSON.parse(raw);                    // 可能抛，需 try/catch
const validated = classifyOutputSchema.safeParse(parsed); // Zod
if (!validated.success) {
  // 返回 err(AppError) 而不是抛，符合项目 Result 模式
  return err({ code: 'SCHEMA_VIOLATION', message, retryable: true }); // Error-as-Data 进行重试
}
```



4. 重试 + 降级（Runtime 层）

即使有 Function Calling，模型仍可能：`调用不存在的 skill 名（幻觉）、参数类型不匹配、拒绝调用（输出 finish: true 但流程未完成）`

`Error-as-Data` 模式在真实场景的体现：工具调用失败的错误作为 tool 消息喂回模型，让模型自我修正，而不是直接抛异常结束 Run。


5. 置信度兜底

classify_ticket 的返回有 confidence 字段，应该有阈值判断：
``` ts
if (classifyResult.confidence < 0.6) {
  // 置信度不足，降级到人工处理
  await emitter.emit(runId, 'run_escalated', { reason: 'low_confidence' });
}
```



### 如何做权限控制？如何进行安全审计？


`安全控制：`
1. HITL 硬中断：`skill.requires_approval: true`，触发硬中断：状态 → waiting_for_review，等人工 resume
2. 敏感词护栏：全局正则 exec 循环，枚举所有匹配；正则匹配进行敏感词检测（过度承诺词、法律风险词、竞品敏感词、手机号/银行卡号/身份证号隐私暴露）
```
草稿内容 → 敏感词 Linter 检测
           ├── 通过 → 允许审批
           └── 不通过 → 标记违规词 + 拦截 → 客服必须手动修改
```
3. 权限分层 L1-L4


`权限控制`实际上是通过 `Skill 注册表 + requires_approval 字段 + "未知 skill 不执行"` 这三层实现的：
1. L1（只读）：查询知识库/历史工单；白名单 Skill；
2. L2（起草）：生成草稿（写 staging）；白名单 Skill，Skill 在 SKILL_REGISTRY 里注册了，`requires_approval: false`，Runtime 直接执行
3. L3（发送）：发送给客户，HITL 硬护栏，需人工审批；draft_reply 的 `requires_approval: true`，Runtime 查表判断；
3. L4（禁止操作）：退款/改单/删除；对应 Skill 根本不在 SKILL_REGISTRY 里注册，模型即使输出 refund_order 也会走 `Error-as-Data` 喂回 LLM。

权限控制在执行 Skill 之前调用可以做一次显式权限检查；当 Skill 数量增多、出现 send_to_customer（L3）和 refund_order（L4）等需要运行时动态判断权限的场景时，checkPermission 才有实际用途。比如 refund_order 注册了但需要 L4 级别审批，就不能只靠"不注册"来拦截了，必须运行时检查。




### 前端创建工单如何防重？有做幂等策略？

标准的幂等方案 Idempotency Key：`客户端生成唯一 Key，后端用它做去重`：
> 同一次提交意图只产生一个工单，重试时能复用，但不同提交不能复用同一个 Key。
``` ts
// 前端：
const STORAGE_KEY = 'pending_ticket_idem_key';
const onSubmit = async (e) => {
  // 如果已有 pending key（上次提交超时未完成），复用它
  let key = sessionStorage.getItem(STORAGE_KEY) ?? crypto.randomUUID();
  sessionStorage.setItem(STORAGE_KEY, key);  // 存起来，失败重试时复用
  try {
    await createTicket({ ..., idempotency_key: key });
    sessionStorage.removeItem(STORAGE_KEY);  // 成功后清除
  } catch (e) {
    // 失败了不清除，下次点提交会复用同一个 key
    // 这样网络超时后用户再点提交，复用同一个 Key，后端返回已有的工单而不是创建新的。
  }
};

// 后端：tickets.ts
const { idempotency_key } = body;
if (idempotency_key) {
  const existing = await store.tickets.findByIdempotencyKey(idempotency_key);
  if (existing) {
    // 返回已有的 ticket，而不是创建新的
    ctx.status = 200;
    ctx.body = { ticket: existing, ... };
    return;
  }
}
// 创建时写入 idempotency_key
const ticket = await store.tickets.create({ ..., idempotency_key });
```
> idempotency_key 需要在 tickets 表加唯一索引，DB 层保证并发安全。







### 后端创建runId,stepId等id字段是怎么创建的？如何保证高并发下的唯一性？

内存模式：`nanoid` 默认生成 21 字符的随机字母数字字符串，基于 crypto.getRandomValues()（Node.js 的密码学安全随机数）。
> 唯一性保证：21 字符，字符集 64 个字符，组合数 = 64^21 ≈ 10^38。碰撞概率比 UUID v4 还低，每秒生成 100 万个 ID，10 亿年才有 1% 概率碰撞。

生产模式（PG）：所有表的 id 字段都是 `UUID DEFAULT gen_random_uuid()`，ID 在数据库层自动生成，Node.js 代码在 INSERT 时不传 id，由 PG 生成后通过 RETURNING id 返回。
> 唯一性保证：UUID v4 是 128 位随机数，gen_random_uuid() 内部用 OpenSSL 的密码学安全随机数生成器。唯一性由 PRIMARY KEY 约束在数据库层强制——即使两个并发请求碰巧生成了相同的 UUID（概率极低），数据库会拒绝第二个插入并报错。


PG 模式下，多个 Node.js 实例同时写入时，gen_random_uuid() 在每个 INSERT 事务里独立执行，不存在锁竞争，性能不受并发影响。Primary Key 的唯一索引是最终的安全网。`唯一性通过 PRIMARY KEY 约束（DB 强制）`




### 前端发送SSE请求时，请求头中自动带上Last-Event-ID是怎么实现的？这个ID生成的机制的什么？有什么作用？哪些场景下会用到这个？


`Last-Event-ID 是怎么自动带上的？`
> 这是浏览器原生 EventSource 规范的行为，不需要写任何代码。
1. 每次收到带 `id:` 字段的 SSE 帧，浏览器内部记录 `lastEventId`
2. 连接断开后自动重连时，HTTP 请求头自动携带 `Last-Event-ID: <lastEventId>`


`浏览器的 EventSource 自动重连机制：`
1. EventSource有三个状态：`CONNECTING(0) → OPEN(1) → CLOSED(2)`，浏览器 EventSource 收到 HTTP 连接断开（readyState 从 1 变成 0）；
2. 浏览器内部启动重试定时器 → 默认等待 3 秒
3. 3秒后浏览器发出新的 GET 请求，`Accept: text/event-stream; Last-Event-ID: 1722686000500-0` ← 自动带上上次记录的 ID
4. 服务端（新进程）收到请求，执行断点续传


`后端写入 Redis Stream 时创建Last-Event-ID：`
``` ts
const id = await this.redis.xadd(
  this.key(runId), 'MAXLEN', '~', this.MAXLEN, '*',  // '*' 让 Redis 自动分配 ID
  'type', event.type, ...
);
```
Redis 自动分配的 Entry ID 格式是 `{毫秒时间戳}-{序号}`，比如 `1722686000123-0`。这个 ID 写进 SSE 帧的 `id:` 字段：
```
id: 1722686000123-0
event: step_completed
data: {...}
```
> 前端收到后浏览器记录它，断线重连时带上，服务端据此做 XREAD > 1722686000123-0 从断点之后续传。


`作用`：断线重连时告诉服务端"我上次收到哪一条"，服务端从那条之后续传，消除断线期间的事件丢失。
```
客户端收到事件序列：
  id:1722686000100-0  step_started
  id:1722686000500-0  step_completed
  [连接断开，断线期间服务端继续产生事件]
  id:1722686001000-0  draft_ready    ← 断线期间产生，客户端没收到
  id:1722686001500-0  run_completed  ← 断线期间产生，客户端没收到

重连请求头：Last-Event-ID: 1722686000500-0

服务端：readHistory(runId, '1722686000500-0')
  → XREAD > 1722686000500-0
  → 返回 draft_ready + run_completed（补发断线期间的事件）
然后继续 tail 新事件
```

`必然触发的场景：`
1. 网络抖动导致连接中断（移动网络切换、WiFi 断连）
2. 浏览器标签页切入后台、休眠后唤醒
3. 服务端主动关闭连接（Koa 超时、部署重启）
4. EventSource 默认重试间隔 3 秒，断线后自动触发

`客服工作台的具体场景：`
1. 客服在等待 Agent 处理时离开桌面，回来后`浏览器自动重连`，补收中间的 step_completed、draft_ready 等事件，界面不会停在旧状态
2. 服务器部署重启（滚动发布），Agent 正在处理的 Run 的 SSE 连接断开，重连后客服端能补收到重启后的后续事件






### 在一个run执行中，分类模型会多次调用，在每次调用中传入的上下文会包含哪些信息？草稿生成模型调用传入的上下文会包含哪些信息？有没有什么对于上下文方面优化的想法？


- 编排层每次调用传入的上下文 `model.call(messages, skills, signal)` 传的是完整的 messages 数组，累积增长：
``` js
// 第 1 轮（决策调 classify_ticket）：
[
  { role: 'system',    content: "你是客服工单处理 Agent...可用 Skill...处理流程..." },
  { role: 'user',      content: "工单内容：\n密码忘了怎么办" }
]

// 第 2 轮（决策调 search_knowledge）：
[
  { role: 'system',    ... },
  { role: 'user',      ... },
  { role: 'assistant', content: '{"skill":"classify_ticket","ticket_content":"..."}' }, // 已调用的 classify_ticket 信息
  { role: 'tool',      content: '{"skill":"classify_ticket","priority":"auto_reply","category":"密码重置","confidence":0.92,"reasoning":"..."}' } // classify_ticket 调用后的返回结果
]

// 第 3 轮（决策调 draft_reply）：
[
  { role: 'system',    ... },
  { role: 'user',      ... },
  { role: 'assistant', content: '调 classify...' },
  { role: 'tool',      content: '分类结果...' },
  { role: 'assistant', content: '调 search...' }, // 已调用的 search_knowledge 信息
  { role: 'tool',      content: '{"skill":"search_knowledge","results":[...],"total":3,"has_sufficient_results":true}' } // search_knowledge 调用后的返回结果
]
```


- `classify_ticket` 内部调了 `ctx.complete()`，这是生成层 LLM 的独立调用：
```
System: "你是客服工单处理 Agent... 可用 Skill..."  ← llm-complete.ts 固定注入
User:
  你是客服工单分类专家。根据工单内容判断紧急程度和分类。

  分类规则：
  - urgent: 涉及资金安全、用户投诉升级、法律风险、系统故障影响大量用户
  - normal: 常规功能咨询、使用问题、一般性反馈
  - auto_reply: 常见问题（密码重置、发票开具方式、配送时间查询等），知识库中有标准答案

  注意：宁可把 urgent 判断为 normal，也不要把 urgent 判断为 auto_reply。
  confidence 低于 0.7 时，在 reasoning 中说明不确定性来源。

  工单内容：
  {ticket.content}

  只返回 JSON：{"priority":"urgent|normal|auto_reply","category":"分类","confidence":0.0-1.0,"reasoning":"理由"}
```


- `draft_reply` 里的 `ctx.complete(buildDraftPrompt(...))` 是独立的一次性 LLM 调用，不携带上面的 messages 历史，只有三个要素：
```
System: "你是客服回复起草专家...规则：只使用知识库信息..."
User:
  工单内容：{ticket}
  分类结果：{"priority":"auto_reply","category":"密码重置",...}
  知识库条目：
  - [pwd-1] 密码重置指南: 点击登录页"忘记密码"...
  - [pwd-2] 账号安全: ...
  只返回 JSON：{"draft":"...","referenced_knowledge":[...],...}
```


**上下文方面的优化空间**

1. `tool 消息包含冗余数据`

search_knowledge 的 tool 消息把完整的 results 数组（每条含完整 content）都塞进 messages，但编排 LLM 决策"下一步调什么"根本不需要看知识库的完整内容，只需要知道"检索到 3 条，充分"。
> 优化：tool 消息只传摘要，完整数据留在 Observation 的独立字段：
``` js
// 当前（冗余）：
tool: { skill: 'search_knowledge', results: [{full content...}, ...], ... }

// 优化后（只传摘要给编排 LLM）：
tool: { skill: 'search_knowledge', total: 3, has_sufficient_results: true }
// 完整 results 仍在 obs.searchResults，bindParams 注入给 draft_reply Skill
```
> 这个改动可以减少编排层 LLM 的 input_tokens 约 30-40%，同时消除"LLM 在编排决策时把知识库内容当作事实引用"的幻觉风险。


2. `classify_ticket 的 complete 和 messages 上下文脱节`

classify_ticket 用 ctx.complete(buildClassifyPrompt(ticket)) 独立调 LLM，但 classify_ticket 自己的 LLM 调用`没有上下文（比如历史工单、客户画像），只有工单原文`。如果同一客户频繁投诉，单次工单看可能是 normal，但结合历史是 urgent。这属于下一阶段的优化（接入客户历史），当前 V1 按设计约束不做



### 项目中打算添加上下文压缩，你会怎么设计？


> 现状：无压缩，且因 max_steps=5 的线性管线暂不需要。

前提：当前项目`结构化状态`（obs.classification / obs.searchResults / obs.draft）与`消息日志（obs.messages`）是分离的。skill 拿参数是从 obs.classification、obs.searchResults 这些结构化字段取值，不读消息日志；

这意味着：`消息日志可以被激进压缩，只要保留「第 N 步已做完 + 结果摘要」这一事实即可`，完整结果仍在 obs 结构化字段、steps 表、events 审计表里。这是本设计能落地、且风险可控的根本原因。


需要上下文压缩的场景：
1. V2 加了更多 Skill（升级处理、退款核查等），单次 Run 可能达到 10-15 个 Step
2. 工单本身很长（客户粘贴了大量订单详情、聊天记录）
3. Error-as-Data 循环多次，历史累积快
4. 多轮对话场景（同一 Thread 里第二次 Run 需要继承上次上下文）


**阶段 0：先有「预算 + 计量」，再谈压缩（前置）**

1. `真实用量`：调用大模型API，通过 `usage.prompt_tokens` 统计token用量
2. `调用前估算`（决定「何时压」）：用 `@dqbd/tiktoken` 在 model.call 之前估算 messages 长度。注意中文会被高估约 2–4 倍——偏高是安全的（宁可早压，不要超窗）。
> @dqbd/tiktoken 是 OpenAI 官方分词库 tiktoken 的 ‌JavaScript/TypeScript 移植版本‌，专为在 Node.js 或浏览器环境中高效计算 Token 数量而设计。它是 LangChain.js 等主流 AI 框架在处理 OpenAI 模型时的默认分词依赖。该库在初始化时默认会尝试联网获取 WASM 版本信息，在国内网络环境或容器化部署中可能导致‌初始化卡顿‌。生产环境中建议采用‌零网络加载方案‌，通过自定义 getWasm 参数指定本地 WASM 文件路径，以绕过网络探测步骤 



**方案一：结构化摘要替换（推荐）**
> 不丢弃信息，而是把旧 messages 压缩成一条摘要消息，信息完整但 token 少：
``` ts
// context.ts 新增
export function compressMessages(messages: ChatMessage[]): ChatMessage[] {
  // 最近 4 条保持原样（当前轮的 assistant+tool + 上一轮的 assistant+tool）
  const KEEP_RECENT = 4;
  
  if (messages.length <= 4 + KEEP_RECENT) return messages; // 不够长，不压缩
  
  const [system, user, ...rest] = messages;
  const toCompress = rest.slice(0, -KEEP_RECENT); // 过时的信息
  const recent = rest.slice(-KEEP_RECENT); // 最近 KEEP_RECENT 条信息
  
  // 从待压缩的 messages 里提取关键信息
  const summary = extractSummary(toCompress);
  
  return [
    system!,
    user!,
    { role: 'system', content: `[已执行步骤摘要]\n${summary}` },  // 摘要替换
    ...recent,
  ];
}

function extractSummary(messages: ChatMessage[]): string {
  const lines: string[] = [];
  for (const msg of messages) {
    if (msg.role !== 'tool') continue; // 去除
    try {
      const data = JSON.parse(msg.content);
      if (data.skill === 'classify_ticket') {
        lines.push(`- 分类: ${data.priority} / ${data.category}（置信度 ${data.confidence}）`);
      } else if (data.skill === 'search_knowledge') {
        lines.push(`- 检索: ${data.total} 条结果，充分=${data.has_sufficient_results}`);
      }
    } catch {}
  }
  return lines.join('\n') || '（无）';
}
```
信息无损（关键结论都保留），token 减少 60-70%；但 extractSummary 需要按 Skill 逐一适配，加新 Skill 要更新这里



**方案二：LLM 摘要压缩（最强，成本最高）**
当 messages 超过阈值时，调一次 LLM 把历史压成自然语言摘要：
``` ts
async function summarizeHistory(messages: ChatMessage[], complete: CompleteFunction): Promise<string> {
  const prompt = `以下是 Agent 的执行历史，请用 3-5 句话总结关键信息（分类结果、检索结果摘要）：\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;
  return await complete(prompt);
}
```
压缩质量最高，适用于任意复杂历史；但需要额外调一次 LLM，增加延迟和成本；摘要本身可能有信息损失

*压缩模型选择*：`DeepSeek V2.5（快，成本低；首选，比 V3 便宜 3-5x）`、`Qwen-Turbo（快，成本低，降级备用）`、`Qwen-Plus（压缩质量要求高时）`


*压缩 Prompt 设计*：
> 压缩 Prompt 是关键。不能只说"总结这段历史"，必须告诉模型要保留什么、可以丢什么：
```
const COMPRESS_PROMPT = (history: string) =>
`你是一个 AI Agent 的上下文压缩助手。以下是一个客服 Agent 的执行历史片段，需要你将其压缩为简洁的摘要。

压缩规则（严格遵守）：
1. 必须保留的信息：
   - 分类结果：priority（urgent/normal/auto_reply）、category、confidence
   - 检索结果：是否充分（has_sufficient_results）、检索到几条相关文档
   - 执行失败的步骤及其原因（帮助模型知道哪些路径走不通）
   
2. 可以压缩的信息：
   - 成功步骤的详细参数（只保留结论）
   - tool 消息中的完整 JSON 体
   - assistant 的决策过程描述

3. 输出格式：
   - 紧凑的自然语言摘要，不超过 200 字
   - 在末尾用 [已完成步骤: classify_ticket, search_knowledge] 格式列出已执行成功的 Skill

执行历史：
${history}

请直接输出压缩后的摘要文本，不要加任何前缀。`;
```
> system 和 user（工单原文）永远不压缩；system 里的 skill 签名是函数调用契约，user 里的工单是任务本体。「对历史轮次做摘要」是上下文压缩的核心手段之一，是 Claude 系生产 Agent 的落地实践。


**触发策略设计**：
> 不是每轮都压缩，而是按阈值触发，避免频繁压缩引入额外延迟：
```
run 开始
  │
  每轮 model.call 之前
  │
  ├─ messages token 估算 < 3000 → 直接用原始 messages（不压缩）
  │
  ├─ messages token 估算 3000-6000 → 方案二：结构化摘要（无需 LLM，0 延迟）
  │
  └─ messages token 估算 > 6000 → 方案三：LLM 摘要压缩（调轻量模型）
```

*压缩不写回 Checkpoint*：obs.messages 在 Checkpoint 里存的是原始完整历史，LLM 压缩的结果只是调用时的临时视图，不持久化。这样 resume 时仍然从完整历史恢复，不因为压缩引入信息损失。



### 如何降低退款、改单、删除等写操作的误操作风险？

不同写操作的风险量级完全不同，必须分级处理：
- `查询订单状态`：零风险；告知客户"您的退款在路上"
- `修改备注/标签`：低风险、可撤销；给工单加标签
- `修改订单信息`：中风险、部分可逆；改地址、改数量
- `退款`：高风险、不可逆；钱一旦退出就回不来
- `删除数据`：极高风险、不可逆；工单/订单删除后恢复成本极高

核心原则：**可逆操作可以让 Agent 自主执行，不可逆操作必须人工最终确认**。


**方案一：双 HITL 强制审批（最重要）**
```
Agent 决策 → "退款 ¥128.00 到客户 XXX"
  │
  第一道 HITL（自动生成审批请求，L3 权限）：
  客服审批："我确认退款 ¥128.00 给 OrderID: ABC123"
  │
  第二道 HITL（金额超过阈值时，L4 权限，需主管确认）：
  主管审批："我，王主管，授权退款 ¥128.00"
  │
  执行退款操作
```


**方案二：金额独立校验（防幻觉核心）**
> LLM 提取的金额不能直接用，必须从数据库独立查询再对比。
1. 从订单系统查询真实金额（不信任 LLM 提取值）
2. 校验金额匹配（防止 LLM 幻觉出错误金额）
3. 校验订单状态（不能重复退款）
4. 校验退款时效（超时不可退）

*退款时以 DB 查询到的金额为准，而不是 LLM 从工单里提取的金额。LLM 只负责"建议退款"，实际金额由系统查询确认。*


**方案三：操作预演（Dry Run）**
> 真正执行前先模拟执行，展示执行结果让人确认：
1. Agent 第一次调 refund_order(dry_run=true) → 返回操作预览
2. 客服看到"将退款 ¥128 到 XXX 的支付宝，3-5工作日到账"
3. 客服点确认 → 前端发 POST /runs/:id/approve
4. Runtime resume → Agent 调 refund_order(dry_run=false) → 真正执行


**方案四：操作流水审计（不可抵赖）**

每一次写操作必须留完整的审计记录，包含操作人和授权链，不可删除（追加写），用于事后对账和纠纷仲裁。


**方案五：金额上限和速率限制**

硬编码的护栏，不依赖 LLM 判断；`单笔退款上限、单客服账号每日退款总额上限、每小时最多退款 20 笔（防异常高频）、单次改单数量变化上限`；这些限制写在代码里，不是 Prompt，LLM 无法绕过。


**整体防线设计：**
```
LLM 决策"退款 ¥128"
  │
  ① 未知/未注册 Skill → 直接拦截（L4 不注册原则）
  │
  ② permission.ts checkPermission → L4 拒绝 / L3 HITL
  │
  ③ Skill 内部：validateRefund（金额从 DB 独立查询）
  │
  ④ Dry Run：展示预览，等待人工确认
  │
  ⑤ 金额上限 + 速率限制（硬编码护栏）
  │
  ⑥ 第一道 HITL：客服审批（L3）
  │
  ⑦ 第二道 HITL（金额 > 阈值）：主管审批（L4）
  │
  ⑧ 执行操作 + 审计日志（不可删除）
```
> 每一道防线都独立有效，任何一道失效不会导致整体失控。这叫纵深防御（Defense in Depth）——安全设计里最重要的原则之一。





### 在当前的Agent项目中，有没有关于记忆系统的设计？如果没有，如何基于现有项目设计记忆系统呢？

生产级 Agent 的记忆通常分四层，结合当前项目现有基础来做：
```
┌─────────────────────────────────────────────────────┐
│ Layer 4  外部长期记忆（External Long-term）          │
│          向量化存储，跨客户/跨工单知识沉淀            │
├─────────────────────────────────────────────────────┤
│ Layer 3  用户档案记忆（Customer Profile Memory）     │
│          同一 customer_id 的历史行为、偏好、解决路径  │
├─────────────────────────────────────────────────────┤
│ Layer 2  会话记忆（Session / Thread Memory）         │
│          同一 Thread 内多个 Run 的上下文传递          │
├─────────────────────────────────────────────────────┤
│ Layer 1  工作记忆（Working Memory）← 已有            │
│          当前 Run 的 Observation + Checkpoint        │
└─────────────────────────────────────────────────────┘
```
> Layer 1 已经实现，以下是 Layer 2、3、4 的具体设计方案。


**Layer 2：会话记忆（Thread Memory）**
> 现状 Gap：同一工单可能有多个 Run（重试、人工干预后继续）。目前每个 Run 独立构建 Observation，不会继承上一个 Run 的分类结果和草稿历史。

方案：在 threads 表的 metadata JSONB 字段中存储当前 Thread 的记忆摘要，在 `ContextBuilder.build()` 时注入。
``` sql
-- 不需要新表，用 threads.metadata 扩展
-- metadata 约定新增字段：
-- {
--   "memory": {
--     "last_classification": {...},
--     "resolved_draft_id": "uuid",
--     "retry_count": 2,
--     "failure_reasons": ["网络超时", "知识库未命中"]
--   }
-- }
```
``` ts
// server/src/agent/context.ts 扩展 build()
build(run: Run, ticket: ..., threadMemory?: ThreadMemory): Observation {
  const userPrompt = this.buildUserPrompt(ticket, threadMemory);
  // ...
}

private buildUserPrompt(t: Ticket, mem?: ThreadMemory): string {
  const historyHint = mem?.failure_reasons?.length
    ? `\n<retry_context>上次处理失败原因：${mem.failure_reasons.join('；')}</retry_context>`
    : '';
  return `<ticket>...<ticket>${historyHint}`;
}
```
写入时机：在 runtime.ts 的 `completeRun() / failRun()` 里，把本 Run 的关键结果写回 `threads.metadata.memory`



**Layer 3：用户档案记忆（Customer Memory）**

方案：新增 customer_memories 表，存储结构化的用户画像。
``` sql
-- server/src/db/migrations/006_customer_memory.sql
CREATE TABLE IF NOT EXISTS customer_memories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  VARCHAR(64) NOT NULL UNIQUE,
  -- 结构化字段，便于 SQL 过滤
  ticket_count INTEGER DEFAULT 0,
  -- JSONB 存放灵活扩展部分，不需要建列
  profile      JSONB NOT NULL DEFAULT '{}',
  -- profile 约定结构：
  -- {
  --   "common_issues": ["退款流程", "物流查询"],  // 频繁问题类型
  --   "preferred_channel": "web",
  --   "recent_tickets": [{ "subject": "...", "category": "...", "resolved": true }],
  --   "satisfaction_score": 4.2
  -- }
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customer_memories_cid ON customer_memories(customer_id);
```
``` ts
buildUserPrompt(
    t: Pick<Ticket, 'id' | 'subject' | 'content' | 'customer_id'>,
    customerMemory?: CustomerMemory,
  ): string {
    // Layer 3：注入客户历史上下文（最近 3 条工单，避免 prompt 过长）
    let customerHint = '';
    if (customerMemory && customerMemory.recent_tickets.length > 0) {
      const recentSummary = customerMemory.recent_tickets.slice(0, 3)
        .map((tk) => `  - ${tk.subject}（${tk.category}，${tk.resolved ? '已解决' : '未解决'}）`)
        .join('\n');
      customerHint = `\n<customer_history>
该客户历史工单 ${customerMemory.ticket_count} 条，最近记录：
${recentSummary}
</customer_history>`;
    }

    return `<ticket>
<subject>${t.subject}</subject>
<content>${t.content}</content>
</ticket>${customerHint}`;
  }
```
写入时机：工单 completed 后，异步更新（不阻塞主流程）。



**Layer 4：外部长期记忆（Episodic / Semantic Memory）**


*方向 A：成功案例沉淀（Episodic）*

工单成功解决后，把`「问题+知识片段+最终草稿」`打包成新的知识文档自动入库。复用现有的 KnowledgeDocs + PgRetriever 基础设施，不需要新表。
``` ts
// 伪代码：runtime.ts completeRun() 后触发
if (obs.draft && obs.classification && obs.searchResults.length > 0) {
  await memoryService.consolidate({
    question: ticket.content,
    category: obs.classification.category,
    usedDocs: obs.searchResults.map(r => r.doc_id),
    resolvedDraft: obs.draft,
  });
}
```

*方向 B：失败模式归纳（Reflective）*

当 Run failed 且 retry_count >= 2 时，记录失败 pattern，供下一次同类工单的 search_knowledge 做 negative filtering（"上次这条知识没用，跳过"）。




### 并发审批防重发？

> 用户快速连点"审批"，两个请求同时读到 waiting_for_review，各自执行 updateStatus → completed，草稿被发两次

``` ts
const updated = await store.runs.updateStatusCAS(run.id, 'waiting_for_review', 'completed');
if (!updated) { ctx.status = 409; ... return; }
```
PgStore 实现的 `WHERE id=$1 AND status=$2` 是数据库层原子操作，只有一个请求能成功，另一个拿到 null 返回 409。这个问题已完整解决。



### 跨进程取消信号？

> LocalCancelBus 是内存 Map，进程 A 的 Runtime 跑着 Run，进程 B 收到 cancel 请求 → publish() 只在进程 B 的内存里找 AbortController，找不到，信号丢失，Run 永远跑完。

生产模式检测 REDIS_URL 后切换 RedisCancelBus，用 `Redis Pub/Sub` 广播。`进程 B publish → Redis → 进程 A 的 subscriber 收到 → abort`。


### 多实例下同一 Thread 的 Run 并发执行？

> 设计约定"同一 thread 同时只能有一个活跃 Run"。单实例靠 SerialQueueRunExecutor（内存 Promise 链）保证。多实例部署时，实例 A 和实例 B 同时收到同一 Thread 的两个工单请求，hasActiveRun() 检查通过（时间窗口内双方都还没写 DB），各自创建 Run 并提交，串行约束被打破。

有 hasActiveRun() 检查，BullQueueRunExecutor `用 jobId = runId 防止同一 Run 重复入队`

防止同一 Thread 的两个不同 Run 并发入队：
``` sql
-- 保证同一 thread 只能有一个非终态 Run（数据库层互斥）
CREATE UNIQUE INDEX idx_runs_thread_active
  ON runs (thread_id)
  WHERE status NOT IN ('completed', 'failed', 'cancelled');
```
> 这个部分唯一索引（partial unique index）让 PostgreSQL 在插入时直接报错，应用层 hasActiveRun() 变成二级防御而非唯一防线。




### SSE 连接与多实例的事件广播

> 客户端连接到实例 A 的 SSE 端点，但 Run 在实例 B 上执行并 emit 事件，实例 A 的内存里没有这些事件，客户端收不到。

生产模式用 RedisEventStream，所有实例的 emit 都写入同一个 Redis Stream，所有实例的 SSE 路由都从 Redis Stream 读取。实例隔离问题消除。



### Text-to-SQL 在这个项目有的哪些应用场景？怎么进行设计？

Text-to-SQL 是让 LLM 把自然语言问题翻译成可执行 SQL 的技术。

1. 运营分析：不懂 SQL 的人直接问"哪类工单 Agent 最经常失败"、"最近 urgent 工单平均等待人工多久"
2. 客服质检："找出草稿被人工修改超过 50% 的 Run"
3. 调试溯源：开发排查问题时不用手写复杂 JOIN，直接问


**整体架构设计：**
```
用户自然语言问题
      │
      ▼
┌─────────────────────────┐
│  QueryAnalyzer          │  判断意图 + 提取时间范围/维度
│  (LLM + schema prompt)  │  防止 DDL 类操作
└──────────┬──────────────┘
           │ 通过安全检查
           ▼
┌─────────────────────────┐
│  SQLGenerator           │  LLM → 生成 SELECT SQL
│  (schema + examples)    │  注入 schema 描述 + few-shot 样例
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  SQLValidator           │  AST 解析检查
│  (parse + whitelist)    │  只允许 SELECT，禁止 INSERT/UPDATE/DELETE/DROP
└──────────┬──────────────┘
           │ 合法
           ▼
┌─────────────────────────┐
│  QueryExecutor          │  执行 SQL，限制返回行数（MAX 200）
│  (pg + row limit)       │  超时 10s 自动中断
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  ResultInterpreter      │  LLM 把结果转成自然语言摘要
│  (LLM + results)        │  含 SQL 原文供透明性审查
└─────────────────────────┘
```
**DDL** 是 Data Definition Language（数据定义语言） 的缩写，是 SQL 的一个子集，专门用来定义和修改数据库的结构（而不是数据本身）：
``` sql
-- 创建表
CREATE TABLE users (id UUID PRIMARY KEY, name TEXT);

-- 修改表结构（加列、改列类型）
ALTER TABLE users ADD COLUMN email TEXT;

-- 删除表
DROP TABLE users;

-- 清空表（不可回滚）
TRUNCATE TABLE users;
```
与之相对的是 `DML（Data Manipulation Language，数据操作语言）`，也就是 `SELECT / INSERT / UPDATE / DELETE`，操作的是数据行而不是表结构。

在 Text-to-SQL 的安全语境里提到**禁止 DDL 类操作**，是因为：如果 LLM 生成了` DROP TABLE tickets` 这样的 SQL 并被执行，整张工单表就没了，且无法恢复。所以安全防护要做的就是在执行前解析 SQL 的 AST（语法树），确保只有 `SELECT` 语句能通过，`CREATE / ALTER / DROP / TRUNCATE` 全部拦截返回错误。




**项目中 Text-to-SQL 的实现与设计**

text-to-SQL 以 analytics 模块的形式独立存在，挂载在 observability 路由下，作为运营/管理员的数据分析入口，不侵入核心的 ReAct Loop 和 Agent 执行链路。
```
POST /api/v1/analytics/query
Body: { "question": "过去7天失败率最高的工单类别" }
```

*Pipeline 五阶段：*
```
用户自然语言问题
       │
       ▼
┌──────────────────────────────────────┐
│  前置检查                              │
│  dbQuery = undefined？               │
│  → 返回 NO_DATABASE 降级提示           │
└──────────────────┬───────────────────┘
                   │ dbQuery 存在
                   ▼
┌──────────────────────────────────────────────────────────┐
│           Self-Correction Loop（最多 3 轮）                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ① 构造 userPrompt                                  │  │
│  │    attempt=1 → 原始问题                             │  │
│  │    attempt>1 → 原始问题 + 上次失败原因（精确反馈）    │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                     ▼                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ② LLM 生成 SQL（schema prompt + userPrompt）       │  │
│  │    失败（网络/超时）→ 立即返回 LLM_ERROR（不重试）    │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                     ▼                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ③ extractSQL：从原始输出提取 SELECT 语句             │  │
│  │    失败 → lastError = 提取失败原因 → continue       │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                     ▼                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ④ validateSQL：安全校验                             │  │
│  │    • 去注释（防绕过）                                │  │
│  │    • 强制以 SELECT 开头                              │  │
│  │    • 禁止 DDL/写操作关键字（边界正则）                │  │
│  │    • 禁止分号（防多语句注入）                         │  │
│  │    • 表白名单（customer_memories 故意排除）           │  │
│  │    失败 → lastError = 校验原因 → continue           │  │
│  │    通过 → injectLimit（强制 LIMIT 200）              │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                     ▼                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ⑤ dbQuery 执行 SQL（Promise.race + 10s 超时）       │  │
│  │    超时 → 立即返回 EXEC_TIMEOUT（超时重试无意义）     │  │
│  │    PG 报错（列名/语法）→ lastError = PG 错误 → continue│ │
│  │    成功 → rawRows = 结果，break 跳出循环             │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                     │                                    │
│  ────────────── 重试判断 ──────────────────────────────   │
│  attempt < maxAttempts → 继续下一轮（LLM 收到 lastError）  │
│  attempt >= maxAttempts → 返回 MAX_ATTEMPTS_EXCEEDED      │
└──────────────────────────────────────────────────────────┘
                   │ 执行成功
                   ▼
┌──────────────────────────────────────┐
│  ⑥ desensitizeRows 结果脱敏           │
│    customer_id → SHA-256 哈希         │
│    content/subject → 截断 100 字符    │
│    error_message → 截断 200 字符      │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│  ⑦ LLM 解释结果                       │
│    取前 20 行 → 生成 3 句中文摘要       │
│    失败 → 静默降级为行数摘要            │
└──────────────────┬───────────────────┘
                   ▼
      { answer, sql, rows, row_count, error: null, attempts: N }
```


1. `SQL 生成`：llmComplete 是注入的函数，接收 `systemPrompt（schema 描述）和 userPrompt（用户问题）`，返回原始文本。*schema prompt 用自然语言描述了 7 张业务表的字段含义、关联关系和常用 JOIN 模式，这是 SQL 生成质量的核心*。
``` ts
function buildSchemaPrompt(): string {
    return `你是 PostgreSQL 分析专家，根据用户问题生成只读的 SELECT 查询。

  【数据库表结构】
  tickets（工单）
    id UUID, customer_id VARCHAR, customer_name VARCHAR,
    subject TEXT, content TEXT, channel VARCHAR,
    category VARCHAR(分类如"退款"/"密码重置"), priority VARCHAR(normal/urgent),
    status VARCHAR(pending/resolved), created_at TIMESTAMPTZ

  threads（会话，每个工单对应一个）
    id UUID, ticket_id UUID→tickets, customer_id VARCHAR, created_at TIMESTAMPTZ
    ...

  【规则】
  1. 只生成 SELECT，绝对不要 INSERT/UPDATE/DELETE/DROP/CREATE/ALTER
  2. 时间范围用 NOW() - INTERVAL 'N days'
  3. 返回列使用易读别名（如 AS 失败数）
  4. 不要分号，不要注释，不要解释，直接输出 SQL`;
}
```

2. `安全校验`：不依赖第三方解析器（也可用 node-sql-parser），用`关键字正则 + 边界匹配实现`，覆盖四类攻击面：
  - 去掉单行注释 `--` 和块注释 `/* */`，防止注释绕过检测
  - `强制以 SELECT 开头`
  - `边界正则拦截禁止操作`（INSERT/UPDATE/DELETE/DROP/CREATE/ALTER/TRUNCATE/COPY/EXECUTE 等）
  - 禁止分号（防多语句注入）
  - `表白名单`：只允许查询 tickets/threads/runs/steps/artifacts/events/knowledge_docs，customer_memories 表含客户画像数据，故意不开放

3. `LIMIT 注入，执行 SQL`：
  - injectLimit() 强制上限 200 行，覆盖 LLM 可能生成的过大 LIMIT，配合 10s Promise.race 超时防止慢查询。
  - *默认最多3次重试：把 PG 错误信息喂回给 LLM（通常包含列名/语法精确提示，修正成功率高）*

4. `结果脱敏`：desensitizeRows() 对结果行做三级处理：
  - `customer_id → SHA-256 前 12 位哈希`（格式 cust_xxxxxxxx，保留可分组性）
  - `content / subject → 截断到 100 字符`（防止工单原文泄漏）
  - `error_message → 截断到 200 字符`

5. `结果解释`：把脱敏后的前 20 行传给 LLM，生成 3 句以内的自然语言摘要，解释失败时静默降级为行数摘要。


> 端点本身用 admin token 鉴权（与知识库删除操作同级）。理由是这个端点能读全部业务数据，权限不该低于删除操作。

*整体安全防线是三层：鉴权 → SQL 校验 → 结果脱敏，任何一层拦截都返回可读的错误信息而不是 500。*

*Self-Correction Loop* 的关键设计在于 lastError 的构造方式
> 不同阶段的失败给 LLM 的反馈粒度不同。
- `extractSQL 失败`，格式要求提醒："`请只输出 SELECT 语句，不要包含解释文字`"
- `validateSQL 失败`，具体违规原因："`SQL 包含不允许的操作：DROP`"
- `PG 执行报错`，PG 原始错误："`column 'ticket_content' does not exist`"
> PG 的错误信息最有价值——它精确告诉 LLM 哪个列名写错了，下一轮修正成功率很高。attempts 字段也一起返回给调用方，方便监控"平均需要几次才能成功"这个指标。


**降级策略**
> 每个失败点都有明确处理，不抛异常到调用方：
- `STORE_MODE=memory（无真实 DB）`：返回降级提示，error: 'NO_DATABASE'
- `LLM 调用失败`：error: 'LLM_ERROR: ...'
- `SQL 无法提取`：error: 'SQL_EXTRACTION_FAILED'
- `SQL 被安全拦截`：error: 'SQL_REJECTED: 原因'，HTTP 422
- `DB 执行超时/报错`：error: 'EXEC_ERROR: ...'，HTTP 500
- `LLM 解释失败`：静默降级为行数摘要，不影响数据返回
> HTTP 状态码区分客户端错误（422）和服务器错误（500），前端可以据此提示用户"问题无法解析，请换个说法"还是"服务异常，稍后重试"。





### MCP和Agent是什么关系呢？当前项目可以和MCP结合吗？

**MCP 是 Agent 工具调用层的标准接口，Agent 是使用 MCP 工具的执行主体，两者是调用者和被调用者的关系。**

MCP 相当于 USB-C 工具侧实现一次协议，任何支持 MCP 的 Agent/LLM 都可以直接调用。


当前项目没有 MCP，但可以结合：
> 当前项目用的是自研 Skill 注册表，Runtime 的 ReAct Loop 直接调本地 Skill 函数，整个 Skill 系统是进程内的同步调用，与 MCP 的跨进程/网络协议调用方式有本质区别。

**方向一：当前项目作为 MCP Server 被外部 Agent 调用**

1. 把当前的 Skill 能力暴露为 MCP Tools，让其他 Agent（比如 Claude、Cursor 里的 Agent）能直接调用客服系统的能力：
```
外部 Agent（Claude Desktop / 自研 Agent / Cursor）
           │
           │ MCP 协议（stdio / HTTP SSE）
           ▼
┌──────────────────────────────────────────────────────┐
│  server/src/mcp/server.ts                            │
│                                                      │
│  暴露 4 个 MCP Tools：                                │
│    submit_ticket     → 创建工单并触发 Agent 处理       │
│    get_run_status    → 查询 Run 的执行状态和草稿        │
│    approve_run       → 审批通过草稿                    │
│    query_analytics   → Text-to-SQL 数据分析           │
│                                                      │
│  直接调用项目内部 store / executor / emitter 层        │
│  （不走 HTTP，进程内函数调用，零额外延迟）               │
└──────────────────────────────────────────────────────┘
```

2. 外部 Agent 怎么调用：Claude Desktop 配置（~/.claude/claude_desktop_config.json）：
``` json
{
  "mcpServers": {
    "cs-agent": {
      "command": "node",
      "args": ["/path/to/customer-service-agent/server/dist/mcp/entry.js"],
      "env": {
        "STORE_MODE": "pg",
        "MODEL_MODE": "real",
        "AUTH_TOKEN": "your-token"
      }
    }
  }
}
```

3. 配置后，Claude 对话里直接说："帮我提交一个客户 u001 的退款工单，主题是订单 #12345 申请退款，内容是收到商品损坏，申请全额退款。"

Claude 自动`调 submit_ticket → 拿到 run_id → 轮询 get_run_status → 等到 waiting_for_review → 展示草稿 → 用户确认后调 approve_run`，全程自然语言交互，无需碰任何界面。



**方向二：当前 Agent 内部集成外部 MCP Server**

> 把外部能力作为新 Skill 接入 ReAct Loop，比如：
```
ReAct Loop（runtime.ts）
      │  action.skill = 'get_order_info'
      ▼
SKILL_REGISTRY['get_order_info']  ←  McpSkill 包装
      │
      │  MCP 协议
      ▼
外部 MCP Server（订单系统 / CRM / 物流系统）
```

*实现流程：*
1. 首先在 Skill 层新增一个 McpSkill 封装类：
``` ts
// server/src/skills/mcp-skill.ts
export function createMcpSkill(client: McpClient, toolName: string): RegisteredSkill {
  return {
    name: toolName,
    execute: async (params) => {
      const result = await client.callTool({ name: toolName, arguments: params });
      return result.ok ? { success: true, data: result.content } : { success: false, error: result.error };
    },
  };
}
```

2. 扩展 SkillName 类型：
``` ts
// packages/shared/src/skills.ts

// 在 shared 层扩展 SkillName，新增外部工具的名字
export type SkillName =
  | 'classify_ticket'
  | 'search_knowledge'
  | 'draft_reply'
  // 外部 MCP 工具
  | 'get_order_info'        // 订单系统
```

3. 注册到 SKILL_REGISTRY：
``` ts
// server/src/skills/index.ts

import { createMcpSkill } from './mcp-skill.js';

// 外部 MCP Server 作为 Skill 注册，Runtime 无需知道它是 MCP 还是本地函数
const getOrderInfoSkill = createMcpSkill({
  command: 'node',
  args: ['/path/to/order-mcp-server/dist/index.js'],
  toolName: 'get_order_info',
  skillName: 'get_order_info',
  retrySafe: true,   // 只读，可安全重试
});

export const SKILL_REGISTRY: Record<SkillName, RegisteredSkill> = {
  classify_ticket:     classifyTicketSkill,
  // 外部 MCP Tools 无缝加入，Runtime 完全无感知
  get_order_info:      getOrderInfoSkill,
};
```

4. 在 SKILL_SIGNATURES 里补签名（让 LLM 知道有这个工具）：
``` ts
// packages/shared/src/skills.ts 新增
get_order_info: {
  name: 'get_order_info',
  description: '根据订单号查询订单详情，包括物流状态、金额、商品列表。',
  requires_approval: false,
  parameters: {
    type: 'object',
    properties: {
      order_id: { type: 'string', description: '订单号' },
    },
    required: ['order_id'],
  },
  returns: { type: 'object', properties: {} },
},
```

*注册后 ReAct Loop 的完整调用链：*
```
LLM 决策：{ skill: 'get_order_info', params: { order_id: '#12345' } }
     │
     ▼
SKILL_REGISTRY['get_order_info'].execute(params, ctx)
     │  McpSkill 内部
     ▼
MCP Client.callTool({ name: 'get_order_info', arguments: { order_id: '#12345' } })
     │  stdio transport
     ▼
外部订单 MCP Server（独立进程）
     │  返回 { content: [{ type: 'text', text: '{"status":"shipped",...}' }] }
     ▼
McpSkill.execute() 解析返回 { success: true, data: { status: 'shipped', ... } }
     │
     ▼
mergeObservation(obs, 'get_order_info', data)
     │  LLM 下一轮看到订单信息，继续处理
     ▼
LLM 决策：{ skill: 'draft_reply', ... }
```

Runtime 代码完全没有改动，这正是当前 Skill 注册表设计的价值所在——`新增任何工具（本地函数或远程 MCP）只需在 SKILL_REGISTRY 里注册一行，Runtime 的 ReAct Loop 对此无感知`。




### 在当前这个项目中，如何开启 AgentLoop 的 Agent 经验自进化

Agent 经验自进化的核心思路是：Agent 从自己的历史执行轨迹中学习，让下一次处理类似问题时比上一次更好。主要体现在三个层次：
```
执行完成
    │
    ▼
① 提炼经验（当前 Run 做得好/不好在哪里）
    │
    ▼
② 写入记忆（跨 Run、跨工单的持久化）
    │
    ▼
③ 注入上下文（下次 Run 开始时把经验带进 system prompt）
    │
    ▼
下一次 Run 更聪明
```

**当前项目的现状:**
- `Layer 2 Thread Memory`：记录失败原因（failure_reasons）、retry_count、上次分类结果
- `Layer 3 Customer Memory`：记录客户历史工单、频繁问题类别

*经验写入时机*：flushMemory() 在 completed 后异步写入

*经验注入上下文*：retry 场景下 buildSystemPrompt 会把失败原因注入


缺失：*主动反思（Reflection）、知识沉淀（Consolidation）、Prompt自适应*


> 三个层次的自进化方案

**层次 1：Reflection（执行后反思）**

`在 flushMemory() 里增加一步：用 LLM 对这次 Run 的执行质量做评估，结果写入 Thread Memory。`

*触发时机*：Run completed 且草稿被人工审批通过（waiting_for_review → completed via approve）。
``` ts
// server/src/agent/runtime.ts — 在 flushMemory() 末尾增加
async function reflectOnRun(run: Run, obs: Observation, wasApproved: boolean): Promise<void> {
  if (!obs.draft || !obs.classification) return;

  // 用 LLM 对本次执行做简短自评（不超过 100 字）
  const reflection = await this.deps.complete(
    `你是一个自我反思的客服 Agent。请对这次工单处理做一句话总结，重点说明：
    1. 哪个步骤耗时最多/出错了？
    2. 下次遇到同类工单（${obs.classification.category}）应该注意什么？
    只输出 JSON：{"lesson":"一句话经验","category":"${obs.classification.category}","quality":"good|ok|poor"}
    
    背景：工单分类=${obs.classification.category}，草稿是否被修改后审批=${wasApproved}，
    执行步骤数=${obs.completedSkills.size}，失败步骤=${[...obs.completedSkills].length - obs.completedSkills.size}`
  );

  try {
    const parsed = JSON.parse(reflection);
    // 把经验追加进 Thread Memory 的 lessons 字段
    await this.deps.store.threadMemory.update(run.thread_id, {
      last_lesson: parsed.lesson,
      last_quality: parsed.quality,
    });
  } catch {
    // 反思失败静默忽略
  }
}
```


**层次 2：Knowledge Consolidation（知识沉淀）**

成功解决且草稿质量高的 Run，把「问题 + 解决路径」自动写入知识库，供下一次 search_knowledge 时检索到。

这需要扩展 flushMemory() 的调用时机，在 approve 端点里传入 wasModified 标记：
``` ts
// 在 routes/runs.ts approve 端点完成后触发沉淀（通过事件或直接调用）
if (!hasModification && obs.classification?.confidence > 0.8) {
  // 高质量无修改草稿 → 提炼为知识条目
  await knowledgeConsolidator.consolidate({
    question: ticket.content,
    category: obs.classification.category,
    usedKnowledgeIds: obs.searchResults.map(r => r.doc_id),
    resolvedDraft: obs.draft,
  });
}

// knowledgeConsolidator.consolidate() 做的事情：
// 1. 用 LLM 提炼问题本质（去掉个人信息）
// 2. 生成向量 embedding
// 3. 插入 knowledge_docs（doc_id 加 "auto_" 前缀，便于识别来源）
// 4. 标记来源为 auto_generated，人工可在管理界面审核后转为 approved
```
关键约束：*自动沉淀的知识不能直接等同于人工录入的知识，需要有 status: 'pending_review' 状态，避免低质量内容污染知识库*。


**层次 3：Prompt Adaptation（提示词自适应）**

这是最复杂的一层。基于 Layer 3 Customer Memory 的 common_issues，动态调整 search_knowledge 的检索策略：
``` ts
// server/src/agent/context.ts — buildUserPrompt 里增加
if (customerMemory?.common_issues.length > 0) {
  // 把该客户高频问题类别作为检索提示注入
  const hint = customerMemory.common_issues.slice(0, 2).join('、');
  // 在 search_knowledge 的 query 里会自动带上这个上下文
  customerHint += `\n<search_hint>该客户历史上频繁询问：${hint}，检索时可优先考虑相关文档</search_hint>`;
}
```

> 知识沉淀（层次 2）和 Prompt 自适应（层次 3）建议等知识库积累了一定数据量后再迭代，否则早期样本太少会引入噪声。




### Node服务承接一些QPS比较高的C端查询流量会不会有风险？对此有什么解决方案吗？

这个项目不是典型的高 QPS CRUD 服务，它是 `I/O 密集 + 长连接流式服务`（正好是Node.js擅长）。Java/Go 在这类场景下并没有显著优势，甚至 Go 的 goroutine 模型和 Node.js 的事件循环在处理大量并发 SSE 连接时效果相当。


> 真正的风险点：
1. **LLM API 被打爆**（最高优先级）：C 端流量上来后，每个请求都触发 Agent run，会把下游 LLM Provider 的 rate limit 打满。
> 方案：加入 Job Queue，可控并发数，解耦 HTTP 接收和 Agent 执行

2. **单进程打挂，所有 C 端流量中断**：Node.js 单进程无法利用多核，且一旦 uncaughtException 没处理好会整个进程退出
> 方案：PM2 cluster mode 或 K8s deployment 多副本 + 客户端重连逻辑（指数退避）

3. **C 端没有限流，被恶意刷量**
> 双端限流处理

4. **SSE 连接泄漏**：大量 C 端用户 + SSE 长连接，如果断线没有正确清理 Redis 订阅，内存和 Redis 连接数会持续增长。
> 后端定时清除已取消 Run 的订阅，防止泄漏

5. **高 QPS 下 PostgreSQL 连接池耗尽**

当前项目每个 Node 进程配置的最多 10 个 PG 连接，简单查询（`SELECT * WHERE id=$1`）DB耗时~2ms，可承受QPS约`10 / 0.002 = 5000`；含向量检索（pgvector）DB耗时	~50ms，可承受QPS约`10 / 0.05 = 200`

> PG 数据库层：max_connections: 100（默认），假设 3 个Node实例，就是 3*10=30 个连接，剩余可用：`100 - 30 - 5(系统) = 65` 个连接；但如果继续扩容到 10 个实例，就是 100 个连接，直接打满 PG 的 max_connections，新连接会报 too many connections 错误。

*方案：PgBouncer连接池代理*
```
Node 进程 1 ──┐
Node 进程 2 ──┼──▶  PgBouncer  ──▶  PostgreSQL
Node 进程 N ──┘    (连接复用层)      (真实连接少)

接入前：
  10 Node 实例 × max:10 = 100 连接 → 直接打满 PG max_connections

接入后：
  10 Node 实例 × max:50 = 500 虚拟连接
  PgBouncer DEFAULT_POOL_SIZE=25 → 实际 25 个 PG 连接
  PG max_connections=100 → 占用 25%，还有大量余量
```
> docker-compose.yml 加入 PgBouncer配置，Node 应用改连接目标为 PgBouncer 端口；接入 PgBouncer 后，Node 进程的 max 可以适当调大，因为"虚拟连接"不消耗真实 PG 资源，PgBouncer 在背后复用少量真实 PG 连接。

6. **Text-to-SQL 的 LLM 调用没有超时保护**：每次 analytics 查询会调 LLM，如果 LLM 响应慢（30s+），这个请求就挂着。在高并发下会把 Node 的可用连接数慢慢耗尽（不是 event loop 阻塞，而是 HTTP keep-alive 连接积压）。
> 解法：给 LLM 调用加 AbortSignal.timeout()。



**架构层面的解决方案**

- `BFF 模式`：Node 服务只处理 Agent 执行类流量（天然低 QPS，因为每个工单触发一次），C 端的查询流量走 Java/Go 网关直连 DB。这样 Node 完全不承接高 QPS 压力。

- `分层部署`：
  - `Nginx 限流`：limit_req_zone 对 /api/v1/tickets 限速
  - `PM2 cluster`：利用多核，instances: 'max'
  - `Redis 缓存`：查询类接口加 5s 缓存，命中不打 DB
  - `接入层熔断`：Nginx 或 API Gateway 上设 upstream 熔断，Node 挂了不影响用户看到错误




### 如果一个日活百万级别的C端平台接入我们这个服务，现在服务可以支持几千的qps没问题，那如果上万甚至十万以上，当前服务如何支持呢？

*日活（DAU）和 QPS* 之间没有固定换算公式，因为 QPS 取决于产品形态，同样是"千万日活"，差异极大：
- `内容消费型（抖音、微博）`：用户停留时间长，每次刷新触发多次请求（推荐、图片、评论、点赞），`千万 DAU 可以轻松到百万级 QPS`
- `工具型（记账、天气）`：用户打开-用完-关闭，单次会话请求数少，`千万 DAU 可能只有几千到几万 QPS`
- `社交通讯型（微信）`：长连接为主，"QPS"这个指标本身不太适用，更多看的是`同时在线连接数和消息吞吐`

`估算 QPS = DAU × 人均日请求数 / 86400 × 峰值系数(3~5)`


*十万 QPS 对一个客服系统来说，几乎不可能全是"创建工单 + Agent 执行"，现实中它一定是这个结构：*
```
查询类（工单状态、历史记录、FAQ 搜索）：占 95%+ 流量，可以轻量、可缓存
写入类（提交新工单）：占 <5% 流量，天然有限速（真实用户不会疯狂提工单）
Agent 执行类（LLM 调用）：QPS 最低，但单请求最重
```
> 十万 QPS 不是十万个 Agent Run，而是十万次"用户在看什么"。这决定了扩容思路——不是让 Agent Runtime 扛十万 QPS，而是把"读"和"写/执行"彻底分离，读走缓存/只读副本，写走队列削峰。


*当前架构在十万 QPS 下会先炸的三个点：*
1. 每个 Agent 事件都同步写一次 PG。Agent 一次执行平均产生 5-10 个事件，`如果 Run 的创建 QPS 到几百，PG 事件表的写入 QPS 就到几千`。
2. LLM API 本身的并发上限：不管 Node 加多少实例，`DeepSeek/Qwen 这类 LLM API 都有账号级的 RPM（每分钟请求数）限制，通常是几百到几千 RPM`。十万 QPS 的用户请求里，如果有 1% 触发新的 Agent 执行，就是 1000 QPS 的 LLM 调用需求，远超任何单账号的 API 限额。



**分层应对方案**

- *只读副本 + 缓存*：工单状态查询这类高频读接口，走 PG 只读副本或 Redis 缓存，不打主库：`用户查询工单状态 → API Gateway → Redis 缓存（TTL 5-10s，工单状态变化不频繁）, cache miss → PG 只读副本（Streaming Replication）`
> 这一层能把 90%+ 的查询流量挡在 Node 服务和主库之外，Node 只需要处理"真正需要执行逻辑"的请求。

- *写入用消息队列削峰，Agent 执行异步化*：十万级并发下，"提交工单"这个动作不能直接同步触发 Agent 执行：
```
用户提交工单
  → API 快速返回 202 Accepted（ticket_id）+ 写入 Kafka/RocketMQ
  → 消费端按 LLM API 限额速率消费（比如 500 RPM）
  → 用户通过 SSE/轮询查状态
```
> 当前项目的 BullQueueRunExecutor 已经是这个思路的雏形（用 Redis 而非 Kafka），十万级需要换成 Kafka 或 RocketMQ，理由：Redis Queue 单机吞吐和持久化能力不如专业 MQ；需要按 Topic 分区实现"消费速率精确控制"（比如按 LLM Provider 限流分区）

- *多 LLM Provider 负载均衡*：不能只靠 DeepSeek + Qwen 两个 Key 降级，而要做多账号池
> 这是十万 QPS 场景下唯一无法绕开的硬约束——LLM 调用能力是买来的，不是靠架构优化能凸破的，需要和模型供应商谈更高的企业级配额，或者接入多个供应商做负载分摊。

- *事件写入改批量/异步，减轻 PG 压力*：stream.append（Redis）继续同步保证实时性，store.events.append（PG）改成攒批异步写（每 100ms 或攒够 500 条批量 INSERT 一次），这一步能把 PG 写入 QPS 降低 1-2 个数量级


**QPS 阶段：**
- `几千`：当前架构（PgBouncer + 多实例 + Redis）足够；不需要换 MQ，不需要读写分离
- `1万-3万`：只读副本分流查询 + 事件写入改批量；还不需要换 Kafka
- `3万-10万`：换 Kafka/RocketMQ，异步化 Run 创建 + LLM 多账号池 + CDN 兜底静态内容；不需要重写 Agent 核心逻辑
- `10万+`：上面全套，多机房/多 Region 部署，LLM 企业级配额谈判




### 项目里后端服务用到了redis和postgreSql，在项目中二者分别都做了什么呢？

- PostgreSQL 是关系型数据库：数据持久化到磁盘，支持事务、索引、复杂查询，断电重启数据不丢。`事务/索引/复杂查询/持久可靠`
- Redis 是内存数据结构服务器：数据首先在内存里操作，提供极低延迟（微秒级），同时支持多种数据结构（String、List、Hash、Stream、Pub/Sub 频道）。`低延迟/实时推送/跨进程通信`


`PostgreSQL：负责所有业务数据的持久化`

`Redis负责进程间实时通信`
1. Redis Stream（stream:{runId}）：SSE 事件管道
2. Redis Pub/Sub（cancel:{runId}）：取消信号广播

> Redis 默认非持久化，有丢数据风险，没有 pgvector；

> 用 PG 做实时通知需要客户端不断 SELECT，QPS 会飙高；不支持 Last-Event-ID 回放；


### PostgreSQL和Redis的数据不一致要怎么解决？如果Redis主从不一致，导致数据不一致，要怎么解决?如果存储在Redis数据过大怎么办？


**PostgreSQL 和 Redis 数据不一致怎么解决**

双写场景：同一个事件既写 Redis Stream（实时推送），又写 PG events 表（审计存档）。
``` ts
await Promise.all([
  this.stream.append(runId, event),      // 写 Redis 成功
  this.store.events.append({...}),        // 写 PG 失败（网络抖动/连接池耗尽）
]);
```
> Promise.all 里一个失败另一个已经成功了，SSE 前端能看到这个事件，但审计表里没有——这就是不一致。

1. 明确"哪份数据是权威源"，另一份允许滞后但不能丢：*Redis Stream 是"实时性优先"，PG events 表是"审计权威"*。真正需要保证一致的方向是：审计表不能丢事件，Redis 丢了可以从 PG 补，反过来不行。

2. 改成"*先写权威源，再异步同步到另一份*"，而不是并发双写：
``` ts
// 改造方向：PG 是权威源，先写 PG 拿到 id，再异步推 Redis
async emit(runId, type, payload) {
  const stored = await this.store.events.append({...}); // 权威写，失败则直接抛错阻断
  await this.stream.append(runId, { ...event, id: stored.id }).catch((e) => {
    console.error('[emitter] redis append failed, SSE 会延迟到下次轮询补偿', e);
    // 不阻断主流程，SSE 客户端断线重连时会从 PG/Stream 回放补上
  });
}
```
> Redis 失败只影响实时推送的及时性，客户端重连时可以靠 readHistory 或直接查 PG 补数据。

3. 生产级做法是加一个后台补偿任务，定期比对两边数据，把缺失的补齐：补偿 job，*定期检查 PG events 表比 Redis Stream 新的部分，回填 Redis*



**Redis 主从不一致怎么解决**

为什么会不一致？
> Redis 主从复制默认是异步的：主库写入后立即返回给客户端，不等从库确认。如果主库写完后立刻宕机，从库还没收到这条命令，数据就丢了——这叫"复制延迟窗口"。

1. 对强一致要求高的场景，用 WAIT 命令等待从库确认：*发布取消信号后，等待至少 1 个从库确认收到（增加延迟，换取一致性），等 1 个副本确认，最多等 100ms*

2. 读请求强制走主库，不读从库：*如果一致性比读性能更重要，直接不用从库分流读，所有读写都打主库*。
> 项目目前用的是单 Redis 实例（REDIS_URL 指向一个地址），没有主从架构。这个问题在后续做 Redis 高可用部署（Sentinel/Cluster）时才会出现，不是现在的迫切问题。


**Redis 存储数据过大怎么办**

项目里已经做的防护：`每个 Run 的事件流最多保留 1 万条，超过自动截断旧数据——这是主动限制单 key 大小的做法，注释里也写了"关键事件同时落 events 表保证审计完整"，也就是"Redis 允许丢，PG 兜底"`。
``` ts
private MAXLEN = 10_000;
async append(runId: string, event: AgentEvent): Promise<string> {
  const id = await this.redis.xadd(
    this.key(runId), 'MAXLEN', '~', this.MAXLEN, '*', ...
  );
}
```

1. *设置合理的 TTL，让数据自然过期*

2. 分离冷热数据，让 Redis 只存"热数据"：*Redis 的正确定位是缓存/实时通道，不该存长期数据*。当前项目的架构已经是对的——PG 存全量历史（events 表），Redis 只存"近期活跃 Run 的实时事件流"，这个分层设计本身就是应对内存问题的正确解法。

3. 内存超限时的 Redis 自身配置：*给 Redis 设内存上限，超过后按策略淘汰（比如 LRU 最近最少使用）*，而不是让 Redis 无限占用内存直到系统 OOM。

4. 大 key 拆分：如果某个 Run 因为死循环产生大量事件（比如 Agent 卡在重试循环），单个 Stream key 可能突增到很大。MAXLEN ~ 10000 已经是防护措施，但*如果每条事件本身很大（比如带完整 LLM 返回文本），应该在事件里只存引用（比如 artifact_id），完整内容存 PG，Redis 只存精简摘要*。

5. 水平扩容：Redis Cluster 分片：数据量真的大到单机内存扛不住时（比如 GB 级），用 Redis Cluster 把 key 按哈希分片到多个节点。
> 当前项目规模（每个 Run 一个 Stream，MAXLEN 限制 1 万条）完全不需要到这一步，提出来是让你了解量级对应关系。




### 在Agent项目中经常会涉及到 沙箱 这类东西，它具体是什么，是什么机制呢？在当前Agent项目中有需要用到它的场景吗？

沙箱（Sandbox）的核心思想是：`给一段不受信任的代码/行为划出一个受控执行边界，限制它能访问的资源和能执行的操作，即使它出错或被攻击，也不会影响边界外的系统`。

在 Agent 语境里，"不受信任的内容"通常是两类：
1. `LLM 生成的代码或 SQL`：LLM 可以被 Prompt Injection 引导生成恶意语句
2. `工具调用的副作用`：Agent 执行工具时可能触及不该碰的文件、网络、数据库


当前项目没有让 LLM 生成任意代码然后执行的场景，所以不需要。但如果未来加了"让 Agent 写脚本来分析数据"这类功能，就需要 `vm2、isolated-vm` 或 Docker 容器来沙箱化执行。





### Agent什么时候用MCP，什么时候用Tool？怎么理解MCP协议，和function calling的区别,MCP有哪些优缺点？

**Function Calling** 是模型能力：LLM 供应商（OpenAI/DeepSeek/Qwen）训练模型，让它能输出"我要调用某个函数，参数是什么"这种结构化决策。这是`模型的输出格式协议`，不涉及"函数怎么实现、部署在哪"。

**MCP（Model Context Protocol）** 是工具集成协议：`定义"外部工具/数据源"要以什么标准接口暴露给 Agent，让不同的 Agent 应用能用统一方式接入不同的工具服务器`。这是"Agent 怎么连接工具"的标准化协议，不涉及"模型怎么决定调用哪个函数"。

> Function Calling 决定"调什么"，MCP 决定"这个工具从哪来、怎么连"。两者是配合关系，不是替代关系。


*用普通 Tool（内置 Skill）的场景：*
1. 工具逻辑归属于你自己的项目/团队，代码和 Agent 部署在一起
2. 追求最低延迟——内置 Skill 是进程内函数调用，没有 IPC/网络开销
3. 逻辑简单，不需要独立进程隔离（比如 classify_ticket 就是调 LLM + 解析结果）

*用 MCP 的场景：*
1. 工具属于外部系统，团队不同、语言不同、部署位置不同（订单系统可能是 Java 团队维护的服务）
2. 需要给多个不同的 Agent 应用复用同一个工具（一个 MCP Server 可以同时被 Claude Desktop、Cursor、这个客服 Agent 接入）
3. 工具本身需要独立进程隔离（比如要执行数据库查询、调用第三方 API，出问题不该拖垮主进程）


> 工具代码你自己维护、追求性能 → 普通 Tool；工具是别人的系统、需要跨团队/跨应用复用 → MCP。


*MCP 的优点：*
1. 标准化适配格式，接入成本持续下降。
2. MCP Server 是独立进程，工具执行出错、崩溃不会直接拖垨 Agent 主进程
3. 有益于生态繁荣

*MCP 的缺点：*
1. 额外的运维复杂度：相比直接调用一个函数，多了一整层基础设施。
2. 延迟开销：进程间通信（IPC）或网络调用比进程内函数调用慢
3. 调试链路变长：出问题时，排查链路从"看函数调用栈"变成"看进程间通信日志 + 协议层日志"







### 如果模型调用订单接口的时候参数传错了怎么办？模型输出格式不符合要求呢？

**模型调用订单接口参数传错了怎么办**
1. 入参 schema 校验，在调用之前拦截明显错误的参数；
2. 如果参数错误导致订单接口返回错误（比如"订单号不存在"），这个错误会被包装成 `SkillResult.success = false`，走 `Error-as-Data` 路径——不会让整个 Run 崩掉，而是把错误信息返回给 LLM，LLM 看到"订单号格式不对"这类反馈后，有机会自己修正参数重试。
3. 对于订单这类有真实业务后果的操作（改单/退款/发货），应该在`权限分层里明确标记为 L3/L4`，要求人工审批后才真正执行，而不是 LLM 决定了就自动跑。


**模型输出格式不符合要求怎么办**
1. `Zod Schema 校验 + Error-as-Data`；校验失败时，不是抛异常中断，而是格式化成可读错误交给 LLM 自己修正
> 如果 LLM 把 confidence 输出成字符串 "0.9" 而不是数字 0.9，Zod 会报错，错误信息变成 confidence: Expected number, received string，这个信息喂给 LLM 后，它能看懂并在下一轮修正输出格式。
2. 重试策略：明确了格式错误最多重试 2 次，超过还不行就该放弃自动重试、走失败/升级路径，不会无限循环消耗 LLM 调用。
> 可加"连续格式错误快速失败"，避免浪费 max_steps：同一 skill 连续 SCHEMA_VIOLATION 超过 2 次，直接跳过重试转人工





### 接口超时呢？第三方服务挂了呢？一个任务执行到第三步突然失败了，前面两步已经产生的数据怎么处理？


**接口超时怎么办**
1. `整个 Run 的会设置超时时间`（默认可能是几分钟级别），超时后检查当前run状态，未完成自动中断；
2. 给每次模型调用加独立的超时控制：`fetch`调用模型api，通过`AbortController`传入singal，设置单次调用30s，超时触发后 fetch 会抛 `AbortError`


**第三方服务挂了怎么办**
1. *LLM API 挂了*：运行时故障转移（failover），DeepSeek 挂了自动试 Qwen，全挂了才真正失败
``` ts
// 概念示意：多 Provider 故障转移包装器，在 IModelClient 外面包一层：
class FailoverModelClient implements IModelClient {
  constructor(private providers: IModelClient[]) {}
  async call(input: ModelCallInput): Promise<ModelResponse> {
    let lastErr: unknown;
    for (const provider of this.providers) {
      try {
        return await provider.call(input);
      } catch (e) {
        lastErr = e;
        console.warn(`[failover] provider failed, trying next`, e);
      }
    }
    throw lastErr; // 全部失败才真正抛出，走 isSystemError 判断
  }
}
```
2. *MCP 外部业务系统挂了*（比如订单系统）：外部系统挂了，callTool 抛错，被捕获后返回 `MCP_CALL_FAILED（retryable: true）`，不会导致整个 Run 崩溃，而是让 LLM 看到错误信息自己决定要不要换个方式处理或提示用户"该功能暂时不可用"。
3. *崩溃恢复层面*：如果第三方服务挂的时间足够长，导致整个进程被拖死重启，崩溃恢复机制扫描 running/created/retrying 态的 Run，按 RecoveryPolicy 处理。



**执行到第三步突然失败，前面两步的数据怎么处理**
1. *数据留痕*：`steps 表逐步记录、Checkpoint 保存完整上下文、Run 状态转 failed，携带错误信息`
2. *重试机制*：`重试时创建的新 Run 会读取旧 Run 最后一次成功的 Checkpoint`（第二步之后保存的那个），恢复出完整的 Observation（包括分类结果、检索结果、对话历史），LLM 接着从"第三步该做什么"继续决策，不会重新执行第一步、第二步
3. *重试方式*：
  - `用户/客服主动重试`：POST /:id/retry 端点，`手动创建新 Run 带 retry_from`
  - `进程崩溃后自动重试`：前提是未完成 Step 涉及的 Skill 都标记为 `retrySafe: true`
  > 当前项目三个内置 Skill 都是 retrySafe: true（分类/检索/起草都是安全幂等的只读或临时写操作），但如果未来接入订单类 MCP Skill（改单、退款），必须显式标记 retrySafe: false。





### 如何做接口鉴权？如果是在Agent层面不想把token暴露给LLM,一般怎么处理？

**常规接口鉴权怎么做**
> 客户端 → 你的 server（Node.js 网关层）
- 用户态：`JWT（access token 短期 + refresh token）`或 Session，走标准的 `Authorization: Bearer <token> header`
- 服务态（服务间调用，比如 MCP 外部系统）：`HMAC 签名（时间戳 + nonce + secret 签名，防重放）`或 mTLS，不建议用静态 API Key 裸传


**Agent 层怎么做到"不暴露 token 给模型"**
> 这是这类系统的标准设计原则：LLM 只产出"意图 + 参数"，token/密钥的注入发生在执行层，而不是提示词或模型上下文里。

1. *模型只决定"调什么、传什么业务参数"*：Function Calling 的 schema 里，永远不要把 token/api_key/secret 设计成模型需要填的参数字段。
> 比如查询订单：
``` ts
// 错误设计：模型需要知道 token
{
  name: 'query_order',
  parameters: { order_id: string, auth_token: string }  // ❌ token 混进模型可见参数
}

// 正确设计：模型只填业务参数
{
  name: 'query_order',
  parameters: { order_id: string }  // ✅ 模型只关心业务语义
}
```

2. *token 在执行层（Skill/Tool 内部）注入，模型看不到*：模型的上下文（prompt、工具调用记录、Observation）里只应出现 order_id 这样的业务参数和返回结果，Authorization header 的拼装只发生在 TypeScript 代码里，`日志打印时也要对这段做脱敏`。

3. *token 的来源：按调用身份区分两种模式*
  - `代表用户身份调用（如"查我的订单"）`：token 应该是用户级凭据，从会话/JWT 解析出的 userId 去存储（Redis/DB，加密存储或走密钥管理服务如 Vault）换取，而不是让模型传用户身份；
  - `代表系统身份调用（如内部服务调用，无用户上下文）`：用服务级凭据，走 Secret Manager 拉取，定期轮换，同样不进入 prompt
> getUserToken：优先读缓存（Redis，短 TTL），miss 时用 refresh token 换新 access token；全程不经过 Agent runtime 的 context/prompt 构建逻辑

4. *防御性检查：即使模型"想"把 token 塞进参数,也要拦住*：在 schema 校验层加一条兜底规则：`如果模型的 tool_call 参数里出现了 token/password/secret 之类的敏感字段名，直接判校验失败，走 Error-as-Data 反馈给模型"该参数不允许由你提供"，而不是放行`。这是防止 prompt injection 场景下模型被诱导"伪造凭据字段"的最后一道栅栏。

5. *日志与可观测层同样要脱敏*：写入 Redis Stream 的 Observation/工具调用记录,以及任何落库的 steps 表内容,都要在序列化前对已知敏感字段做 mask（如 ***），因为这些数据会被前端展示、也可能被后续排查人员看到。

> token 的生命周期完全在你的后端代码里闭环（获取→缓存→注入→轮换），LLM 的输入输出里永远只有业务语义参数，从 `tool schema 设计到执行层实现到日志脱敏`三道关卡确保这一点。





### 当前项目是单Agent，如果以后打算升级为多Agent，在现有项目的基础上，可以怎么升级？多Agent之间的协作如何设计？

当前 SKILL_REGISTRY 已经是"一个模型 + 多个工具"模式（classify_ticket/search_knowledge/draft_reply）。多 Agent 化不是把 skill 拆成 agent 这么简单替换，而是当出现下面任一情况时才值得：
- 不同子任务需要不同的 system prompt / 不同模型才能做好（比如`分类用小模型、生成回复用大模型、法务合规审核用专门调优的模型`）
- 子任务之间需要独立的多轮推理，而不是一次工具调用能搞定（比如`"调查为什么退款流程失败"需要自己的排查循环，混进主 Loop 会让主 Agent 的上下文爆炸`）
- 需要并行探索（比如`同时查订单系统 + 查物流系统，两条链路互不干扰，各自决策要不要重试/换参数`）
> 如果只是"再加几个工具函数"，加进 SKILL_REGISTRY 就够，不需要多 Agent。


**主 Agent + sub Agent**

这种架构本质是`上下文隔离 + 关注点分离`。

单 Agent 架构的天花板卡在一件事上：所有工具调用、所有中间过程都堆在同一个 messages 数组里，任务一复杂就会有这些问题：`上下文污染、Token 成本线性爬升（所有历史都要带在每一次 LLM 调用里重新发一遍）、单一 System Prompt 难兼顾多种角色（分类要精确、生成要有文笔、审核要严格）`

Sub Agent 架构用"`任务委派 + 只回传结论`"解决这些问题。



**架构升级路径：**
> 在现有代码基础上，最小改动路径是把 AgentRuntime 拆分成两层，而不是推倒重写：
```
现在：  AgentRuntime.execute() → SKILL_REGISTRY[skill].execute()
                                  ↑ classify/search/draft 都是"叶子工具"

升级后： OrchestratorAgent (原 AgentRuntime)
              │
              ├─ 决策粒度从"调哪个工具"升级为"调哪个子 Agent"
              │
              ├─ WorkerAgent: 订单调查 Agent（自己的 ReAct Loop，多轮排查订单状态）
              ├─ WorkerAgent: 知识检索 Agent（自己的 ReAct Loop，多轮改写 query 重试）
              └─ WorkerAgent: 回复生成 Agent（保持现在的 draft_reply 单步逻辑即可）
```


**落地：**
1. *WorkerAgent 复用 AgentRuntime 的结构，而不是新写一套*：AgentRuntime 现在的六个依赖（`model/store/emitter/cancelBus/retriever/complete`）本身就是可复用的骨架。每个 Worker 可以是一个"缩小版 AgentRuntime"——独立的 ContextBuilder、独立的 max_steps、独立的 system prompt，但共享同一套 Checkpoint/Event/取消基础设施；
2. *把 Worker 当作"新一类 skill"注册*：不需要改 runtime.ts 的主循环结构，`只需要在 SKILL_REGISTRY 里新增几个"委派型 skill"，模型侧的调用方式不变（仍是 Function Calling 选工具），只是这个工具的 execute() 内部跑的是一整个子 Agent 而不是一次 API 调用`
> 只把摘要回传给主 Agent，不把子 Agent 的完整消息历史塞回主 obs.messages；这是防止多 Agent 场景下 context 爆炸的核心设计点



**多 Agent 协作的设计要点**

1. *通信方式：结构化摘要，不是共享上下文*：子 Agent 完成任务后回传给主 Agent 的，应该是`结构化的结论`（比如 { order_status: 'refund_pending', blocking_reason: '库存核对未完成', recommended_action: 'wait' }），而不是把子 Agent 的完整推理过程/消息历史塞进主 Agent 的 obs.messages；
> 避免 token 爆炸，避免主 Agent 被子 Agent 的推理噪音带偏

2. *状态与 Checkpoint：子 Agent 的 Run 要不要独立建 Run 记录*
  - 简单方案：`子 Agent 执行期间不单独建 Run，作为主 Run 的一个 Step 记录`（step_number 对应，output 里存子 Agent 的完整轨迹用于 debug）。崩溃恢复时子 Agent 从头重跑，代价可接受
  - 精细方案：`子 Agent 也建独立 Run（parent_run_id 关联主 Run），可以独立 Checkpoint、独立恢复`。适合子任务本身耗时长、有副作用、不想因为主 Agent 崩溃就重跑子任务的场景

3. *失败与 HITL：谁的审批策略生效*：现有 `skill.requires_approval` 是声明式查表。子 Agent 内部如果也有需要审批的动作（比如子 Agent 决定要发起退款），有两种策略：
  - `子 Agent 直接触发 HITL（复用 handleHitl），主 Agent 的 Loop 也一并挂起等待`
  - `子 Agent 把"建议动作"作为结果返回，主 Agent 统一决定要不要发起审批`（推荐，审批策略集中在一处，不分散到多个 Agent）

4. *取消与超时：级联传递*：sub.signal（cancelBus）现在是按 run.id 订阅的。`子 Agent 应该接收父 Agent 传下来的 signal，实现级联取消；父 Run 被取消时，正在执行的子 Agent 也应该收到 abort`，而不是各自独立超时。





### 多Agent并行领任务时，怎么避免重复领取相同任务?如果要用锁来避免并发冲突，你怎么做？四个Agent同时修改同一条表记录怎么做到不冲突？遇到这类问题怎么快速给出解决方案？


**避免重复领取任务：分布式锁 / 数据库层原子操作**

1. PostgreSQL 行级锁天然解决这个问题，`FOR UPDATE SKIP LOCKED`一条原子语句完成"查找 + 抢占"，四个 Agent 同时跑这条 SQL，PG 会保证每一行只被一个事务拿到，其他事务自动跳过去拿下一行，不会重复领取，也不会互相阻塞等待。
2. Redis 原子操作（如果任务队列本身在 Redis，比如项目里 BullMQ 场景）：Redis 单线程模型天然保证命令原子性


**真要用分布式锁的场景：Redis 锁的正确实现**

如果领取逻辑更复杂（不是简单查一条记录，而是要做一系列检查再决定要不要领），需要真正的锁，用 Redis + Lua 脚本（保证"检查+设置"是原子的），不要用"先 GET 判断再 SET"：`锁必须有 TTL、释放锁要验证 owner、锁的粒度要匹配任务粒度`


**四个 Agent 同时修改同一条记录：不用锁，用数据库事务 + 版本号**
1. 乐观锁（推荐，性能更好，适合冲突概率低的场景，比如客服工单查询）：表结构加一个递增的 version 字段，只有 version 匹配才更新成功
> 四个 Agent 里，只有先提交的那个能成功，其他三个 UPDATE 影响行数为 0，应用层感知到冲突后重新读取最新状态（可能发现任务已经被别人做完了，直接放弃自己的结果）。
2. 悲观锁（SELECT ... FOR UPDATE，适合冲突概率高、必须严格串行、或者错误成本高（比如涉及金额）的场景）：
``` sql
BEGIN;
SELECT * FROM tasks WHERE id = $1 FOR UPDATE;  -- 锁住这一行，其他事务的同一句会阻塞等待
-- 处理逻辑
UPDATE tasks SET status = 'done' WHERE id = $1;
COMMIT;  -- 提交后锁释放，等待中的事务才能继续
```




### 电商对话容易中途跑偏（查订单跳转价保/退款/优惠券），如何约束目标、防止逻辑漂移


**漂移类型**
- 分类层漂移：用户问"我的订单什么时候到"，classify_ticket 把它分成了"退款"类，后续全部 skill 都跑偏。
- 推理层偏移：分类正确识别为"查订单"，但 LLM 在多轮 ReAct 循环里，看到订单信息后自己联想到"这个订单超时了，要不要建议用户申请价保"，开始调用不该调的 skill。
> 多轮对话越长，模型对最早那条 system 消息的注意力权重就越低（这是长上下文 LLM 的普遍弱点，不是这个项目独有）。到第 5、6 轮，模型更容易被最近的 tool 结果内容带偏,而不是记住最初的目标


**约束方案：**
1. 目标约束要跟着每一轮请求走，不能只在开头说一次；`在 system prompt 里显式加"任务边界"而不是只给流程列表`；`负向约束`（明确说不要做什么）比单纯罗列流程更敏感
2. `分类结果重新注入到每一轮 user/tool 消息里，而不是只存一次`；用"重复提醒"对抗"长上下文注意力衰减"，是目前业界应对长链路 Agent 漂移最常用的手段
3. 用 `Skill 白名单动态收窄`而不是纯靠 prompt 说服：`代码层面缩小模型的选择空间，按分类结果动态过滤可用 skill`
4. 事后校验：draft_reply 生成后做"话题一致性"检查，`draft 内容里出现的业务关键词是否跨越了分类边界`；这一层不追求 100% 准确（关键词匹配天然有误报），能在 HITL 审批环节给人工审核员一个"这条草稿可能跑偏了"的提示




### 从用户提问到生成完整草稿信息的端到端耗时，首字 TTFT 时延、全文生成时延分别控制在多少

- TTFT（Time To First Token）是流式生成场景的指标——模型开始吐字到用户看到第一个字符的时间。
> 主流产品的用户体验目标普遍在 500ms-1.5s 区间，超过 2s 用户会明显感知到"卡顿"

- "端到端总耗时"（用户提交问题 → 完整草稿到达前端）：`step_started/step_completed` 时间戳差值
> 三步顺序执行，当前架构是顺序 ReAct Loop）	约 5-12s；draft_reply（一次 LLM 调用，输出较长文案）	3-8s


*当前项目的流式请求：*
- Step事件的流式输出
- 生成草稿时模型 token 级别的流式输出
  1. 调模型生成草稿 fetch 请求体加 `stream: true`，响应从"一次性 .json()"变成"逐行读取 SSE 分片并解析"。
  2. `response.body.getReader()`手动解析 SSE 流，`TextDecoder`解码stream流，while循环获取token并逐个push到数组，直到解码完成。
  > SSE 分片可能在一个 JSON 对象中间断开，必须按行缓冲，不完整的最后一行留到下一次 read() 再拼接



### 当前项目的node服务怎么做自动部署？怎么实现测试环境的隔离？什么是nodejs的守护进程？node在部署过程中怎么应对客户端突然的访问量？监控怎么接入到当前系统？


**Node 服务的自动部署**

```
git push → 流水线触发
  → 构建（pnpm install + lint + test + tsc build）
  → 产物化（打 Docker 镜像，打上版本 tag）
  → 推送到镜像仓库
  → 部署（目标机器拉新镜像 → 重启服务 / 或 k8s 滚动更新）
```
1. 写一个 `Dockerfile`，用 node 官方镜像多阶段构建：`pnpm install --frozen-lockfile` → pnpm build → 用精简运行时镜像（node:22-alpine）跑 dist/
2. 流水线脚本（GitHub Actions / GitLab CI / 公司内部流水线都行）：`pnpm install && pnpm test && pnpm build && docker build && docker push registry/xxx:${TAG}`
3. 部署步骤：SSH 到目标机器执行 `docker compose pull && docker compose up -d`，`docker-compose.yml` 里已经定义好了 `server/postgres/pgbouncer/redis`全套，新增服务只改镜像 tag

> 不可变部署：每次发布都打新镜像，不 SSH 进机器手动改代码、手动 npm install；机器状态只增不减，回滚 = 把 tag 指回旧镜像重新 up -d

>发布与回滚都要能一键做：发布失败能 30 秒内回滚到上一版 tag，比"修 bug"更重要



**测试环境的隔离**

1. *数据库隔离*：每个环境独立的 PG 实例或独立 `database/schema`，测试数据用 seed 脚本初始化，禁止测试环境连生产库（哪怕只读）。当前项目 config.ts 读 `PG_HOST/PG_DATABASE` 等环境变量，天然支持不同环境指不同库
2. *Redis 隔离*：不同环境用不同 Redis 实例，或至少不同 db index；测试环境给 key 统一加短 TTL，防止测试数据把内存撑爆
3. *配置隔离*：用 `.env.development / .env.staging / .env.production` 分文件管理，或从部署平台的 env 注入，代码里只从环境变量读配置、绝不硬编码环境专属值（当前项目 config.ts 已经是这个风格）
4. *进程/端口隔离*：不同环境不同端口、不同域名。一个环境崩了不影响另一个
5. *外部依赖隔离*：测试环境的外部 MCP 服务用 mock/stub，不要调真实订单系统（mcp/skill.ts 的 Error-as-Data 设计正好可以在 mock 场景复用）



**什么是 Node.js 守护进程**

守护进程（daemon）指`常驻后台、不随终端/SSh 会话关闭而退出、崩溃后能自动恢`复的长期运行进程。
1. `脱离终端会话`：SSH 断开、终端关闭都不会杀掉它（这就是为什么很多人把 `nohup node app.js &` 当守护进程，但那其实是不完整的，nohup 只解决了"忽略挂断信号"，没有自动重启能力）
2. `崩溃自动重启`：进程挂掉后能自己拉起来
3. `日志与开机自启管理`：`stdout/stderr` 落到文件、能 `systemctl enable` 开机启动


PM2（最常用）：`pm2 start app.js` 一条命令就完成`守护 + 崩溃重启 + 日志管理 + 多实例 cluster 模式`，pm2 startup 配开机自启



**部署过程中怎么应对客户端突然的访问量**


*A. 发布瞬间的流量冲击（发布本身别造成抖动）*
- `滚动/蓝绿/金丝雀发布`：负载均衡后面挂多个实例，逐个替换（滚动）或整体切流（蓝绿），保证任意时刻都有可用实例在服务
- `优雅下线（drain）`：新版本收到退出信号后，先从负载均衡摘除、拒绝新连接，把存量请求处理完再退出。
> server.close() 只停止接收新连接，不会中断正在处理的请求，所以是符合要求的；如果用了 BullMQ 多实例模式，还要等当前 job 跑完（之前的优雅退出逻辑已经加了 await ctx.executor.close?.()）
- `健康检查（readiness probe）`：新实例启动完成、PG/Redis 连接池建好、/health 返回 200 之后，负载均衡才把流量放进去；防止冷启动时请求打到还没就绪的实例上
- `启动预热`：PG 连接池（当前 pg.Pool max 默认 10）和 Redis 连接在启动时建立，避免上线瞬间大量请求触发连接建立风暴


*B. 流量本身突增（突发访问量）*
- `横向扩容`：负载均衡后面加实例，配合自动扩缩容（k8s HPA / 云厂商 ASG），按 CPU/请求量自动增减
- `限流`：入口层做 rate limit（固定窗口/令牌桶），防单点打爆；超过阈值直接返回友好的降级响应，而不是让服务在过载中雪崩
- `缓存分担`：热点数据放 Redis 缓存，把重复查询的读压力从 PG 卸掉——但注意缓存击穿/穿透要处理
- `队列削峰`：把非实时任务（比如复杂工单的 Agent 执行）放进队列，用 BullMQ 多实例消化洪峰，前端立刻收到"已受理"，实际处理异步完成

> 优先级建议：先保证"发布不停机 + 优雅退出"（B 的前提是先有 A 的稳定基座），再加健康检查和限流；自动扩缩容是流量真的到了"多实例都扛不住"再上，不要一开始就搞。



监控怎么接入到当前系统

```
采集（prom-client 在 Node 进程里暴露 /metrics）
  → 存储查询（Prometheus 定时拉取）
  → 展示（Grafana 仪表盘）
  → 告警（Alertmanager，超阈值发通知）
```
> prom-client 是 Node 库，在进程内通过读取自身状态（进程内存、事件循环延迟、自定义业务指标）暴露 /metrics 端点；Prometheus 用 HTTP 轮询拉取这些指标，存进自己的时序库

prom-client 暴露进程与业务指标（LLM 调用延迟、token 消耗、Run 成功率、步骤耗时）→ Prometheus 采集 → Grafana 展示 → Alertmanager 告警。





### 当前Agent项目的应用场景主要是：C端的用户工单流转到了运营平台，然后我们运营输入工单，调我们的Agent服务，然后编辑草稿，再手动回复C端用户的工单问题；那如果说现在我们的C端APP想接入我们的客服Agent，不想中间多一层运营人工介入，可以在已有的架构基础上做哪些改造呢？

> 这个项目是"Agent 起草 + 人审批"，C 端智能客服是"Agent 直接回复 + 人兜底"。它在产品定位上就是"运营提效工具"，这个定位下 HITL 不是缺陷而是特性

核心改造只有一件事：`把"人工审批这个闸门"替换成"代码层面的分级放行 + 多层自动护栏"`，其余 RAG、检索、生成、记忆、并发全部复用。


**闸门层：requires_approval 从硬编码变成动态放行策略**
``` ts
// 示意：AutoReleasePolicy —— 替代硬编码 requires_approval 的自动放行决策
function shouldAutoSend(obs: Observation, draft: DraftResult): 'auto_send' | 'human' | 'refuse' {
  // 1. 高危分类（退款/改地址/资金类）→ 永不自动发送，转人工
  if (HIGH_RISK_CATEGORIES.has(obs.classification?.category)) return 'human';
  // 2. urgent → 复用现有升级逻辑，直接转人工
  if (obs.classification?.priority === 'urgent') return 'human';
  // 3. 知识库不充分 → 不生成回复，走"需核实"兜底（现有 has_sufficient_results 已覆盖）
  // 4. 置信度不足 → 转人工（draft 自带的 confidence < 阈值）
  if (draft.confidence < 0.8) return 'human';
  // 5. lint 不过 → 转人工（现有 lintDraft 已覆盖敏感词）
  // 全部通过 → 自动发送
  return 'auto_send';
}
```
> 不是删掉 HITL，而是把"全量进人工"变成"按风险分级"。handleHitl 那条路保留给 high-risk/urgent，新增一条 auto_send 分支。现有状态机可以加一个 auto_sending 过渡态，或者直接复用 completed。



**护栏层：把"人审的安全网"换成"自动检查矩阵"**

- 知识库没答案还硬答 => 已有：`has_sufficient_results === false` → 不进入 draft，走兜底话术/转人工
- 生成内容跑偏/编造	=> confidence 阈值 + 强化 lintDraft（加"话题一致性"检查，之前讨论过）
- 涉及敏感操作 => 高危分类黑名单
- 格式/规范错误	=> 已有：`validateSkillOutpu`t Zod 校验 + LLM_NOT_JSON 重试

> 每一条"人工审批能拦住的问题"，都必须有一个确定性的自动检查兜住，不能有任何一条只依赖"模型大概率不会出错"。


**动作层：新增 send_reply skill**

> C 端直连需要一个真正的发送动作：
``` ts
// 示意：send_reply —— 把回复推送给 C 端用户
export const sendReplySkill: RegisteredSkill = {
  name: 'send_reply',
  requires_approval: false,   // 分级策略已决定放行
  retrySafe: false,           // 发送是不可逆副作用，崩溃后绝不能自动重发（复用现有 retrySafe 语义）
  async execute(params, ctx) {
    // 通过 MCP 包装的 C 端消息推送接口（复用 mcp/skill.ts）发送
    // 发送成功后写回工单，emit reply_sent 事件
  },
};
```
> retrySafe: false 这一条必须重点强调——现有 recovery.ts 的崩溃恢复逻辑会判断 retrySafe 决定能否安全自动重试，发送这类副作用操作如果标记错，崩溃恢复时会重复发消息给用户，这是 C 端直连最容易出的生产事故。


**会话层：从"单轮工单"到"多轮对话"**

- 现有 Thread 模型：`用户追问 = 同一 thread 上新建一个 Run`，而不是新开工单
- Layer 2/3 记忆系统：`threadMemory（本对话上下文/失败历史）和 customerMemory（客户画像）`已经在 context.ts 注入，C 端多轮需要的"记得上次说过什么"它已经覆盖
- 新增"澄清追问"能力：现有 classify_ticket 之后直接走 search/draft，`信息不足时应该能反问用户而不是硬生成——这需要加一个"信息是否足够"的判断步骤，或者让分类结果多一个"需澄清"分支`


**兜底层：自动回复后的监控与回流**

> 自动回复没有"发送前人工看一道"，出错不可逆，所以要补"发送后"的质量闭环：
- `抽检`：按 confidence 分层抽样，低置信度区间全部人工复核（这些正好回流成评测集 badcase）
- `用户反馈`：C 端回复带"解决/未解决"按钮，未解决 → 自动转人工，并把这个 case 标记为 badcase
- `监控指标`：自动发送率、转人工率、用户不满意率、误答率——这些是"自动回复是否该继续放开"的决策依据，没有监控就贸然全自动等于盲开


**性能层：C 端高 QPS 特有的改造**

> C 端直连意味着每个用户问题都是一次 LLM 调用，成本和并发都上来了，需要补：
- `语义缓存`：相同/相似问题的回复直接复用（LLM 调用成本是当前主要成本项，这是最有效的降本手段）
- `限流与降级`：之前聊过的入口限流 + 队列削峰（BullQueueRunExecutor 多实例已具备）
- `流式体验`：之前聊过的 llm-complete 流式改造，C 端在线等待更需要打字机效果


*最稳妥的路径不是"今天全自动"，而是按分类和置信度分级逐步放开：*
1. 第一阶段：低风险分类（查询类、知识咨询类）+ 高置信度 → 自动发送；其余全走人工（现状）
2. 第二阶段：中风险分类的高置信度 case 放开自动，用监控指标验证误答率
3. 第三阶段：只有达到"自动发送率 X% 且误答率 < Y%"才考虑进一步放开，urgent/资金类永远保留人工
> 这一步一步走的每一步，正好都用"自动发送率、转人工率、误答率"这些指标做决策门禁——有数据支撑的放开才是安全的放开。




————————————————————


### Skill Register 动态加载业务Skill的过程是怎样的？怎么做到动态加载?



### 要是用redis它服务重启，数据不就没了吗？在当前项目中，redis它具体缓存的是啥?介绍一下你对redis的理解



### 大促峰值整体推理QPS与Token吞吐量级，配套队列削峰、分级限流、非核心模块降级策略


### 高频问答、RAG检索结果、静态 Prompt多级缓存架构设计思路





### 赔付核算、商家数据导出等高风险内容，如何搭建复核机制，杜绝错误判定与敏感信息泄露


### Agent效果如何量化评估？自动化指标与人工抽检怎么组合落地


### 无用户反馈的沉默数据，怎样挖掘隐性 Badcase（规则幻觉、价保计算错误、售后误判）


### 问题案例回流后，如何溯源定位是子 Agent、 RAG知识库、检索策略还是Prompt导致



### Multi-Agent架构中，如何筛选需要SFT微调的子Agent,按电商场景拆分标注数据集



### Prompt迭代是否出现修复一类问题、另一类场景效果退化？如何用灰度放量+回归测试规避负优化



### Prompt是人工迭代，还是搭建了A/B测试、自动化批量回归的调优流水线


### 用户首次提问、多轮补充、修改诉求三种场景，如何做任务路由、会话状态复用、断点续跑






