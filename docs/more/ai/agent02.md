---
title: 如何设计一个AI Agent？
date: 2026-07-18 16:48:47
permalink: false
categories:
  - AI
tags:
  - Agent
  - AI
---


# 如何设计一个AI Agent？


`Agent = Model + Harness`

模型负责推理，Harness 负责"剩下的所有事情"——工具系统、上下文管理、权限控制、反馈回路、记忆与协作。


**模型是 CPU，Harness 是操作系统**————CPU 再快，OS 拉胯也白搭。



1. Prompt Engineering（2023年），怎么把话说清楚
2. Context Engineering（2024年），怎么给 AI 喂对信息
3. Harness Engineering（2026年初），怎么让 Agent 可控地工作
4. Loop Engineering（2026年中），怎么让 Agent 可控地学习




## 为什么需要工程化


**大模型的"先天约束"**

- `上下文窗口瓶颈`：32k, 128k...

- `注意力稀释效应`：LLM 的注意力容易被"噪音数据"严重稀释。这不是模型不够聪明，是我们喂给模型的信息质量在逐步劣化———信噪比在每一步都在恶化。
> 上下文窗口的"物理容量"和"有效容量"是两回事。 128K 的窗口塞满了 70% 的噪音数据，有效容量可能还不如一个精心管理的 32K 窗口。

> 恶性循环：`上下文膨胀 → 注意力稀释 → 工具调用参数错误率上升 → 产生更多无效的重试消息 → 上下文进一步膨胀`

- `数据搬运出错`：在由步骤A流转到步骤B的搬运过程中，模型可能截断长字符串、遗漏嵌套字段、混淆相似的 ID、或者在上下文压缩后彻底"忘记"某个关键值。
> eg1: 当步骤 A 返回一个包含 15 个元素的数组，LLM 在"搬运"到步骤 B 时只传递了 3-5 个"代表性"元素——它在无意识中做了一次"摘要"，但对于精确执行来说这就是数据丢失。

> eg2: 步骤 A 返回的 JSON 中有一个 refId 字段（UUID 格式，如 a1b2c3d4-e5f6-7890-abcd-ef1234567890），步骤 B 需要用这个 ID 调用另一个 API。LLM 在搬运时可能把 UUID 的最后几位截断、把两个相似的 UUID 混淆、或者在上下文压缩后直接幻觉出一个不存在的 ID。每一种错误都会导致步骤 B 调用失败，而失败信息又会膨胀上下文，加速注意力稀释。

- `无状态`
1. `单次执行内的无状态`：一个 Agent 执行到第 12 步时，前 11 步的状态完全依赖上下文消息来承载。如果进程崩溃、网络断开或服务重启，所有中间状态瞬间蒸发——LLM 没有"硬盘"，只有"内存"，断电就清零。
2. `跨执行的无状态`：这是更深层的问题。Agent 无法从历史执行中学习。一个 Agent 昨天在执行"选品任务"时发现"搜索关键词不能用空格分隔"（调了三次才成功），今天执行相同任务时这个教训已经不存在了——它会重新犯同样的错误，重新消耗三次重试的 token。

> 重要的架构决策和技术事实如果不显式记录，就会在新会话中被重新讨论甚至做出矛盾的决定。




**原始的大模型只是一块"高性能 CPU"，没有内存管理、没有文件系统、没有进程调度。要让它稳定地、大规模地执行企业级任务，需要在它外围构建一整套"操作系统"级别的基础设施。这就是从 Prompt 到 Harness 的演进动因。**



## Prompt Engineering

`角色扮演 => 结构化注入`

- 角色扮演：所有信息塞进一段 System Prompt：角色描述、业务规则、行为约束、格式要求

- 结构化注入：设计哲学（统一的工程审美标准）、安全硬规则、项目路径映射表、知识体系目录等等；
> 本质上是一种"持久化的 System Prompt 工程"。它通过结构化信息（表格、映射关系、规则列表）最大化 LLM 的上下文利用效率


**指令遵从率在多步长链路中急剧下降**：`Transformer 的注意力是一种有限资源，它在所有 token 之间做加权分配`。当上下文从 10K 膨胀到 100K 时，一个 ⚠️ 标记获得的注意力权重被稀释了 10 倍——即使你把它加粗、大写、放到最前面。



## Context Engineering

上下文管理是一个需要分层防御的系统工程，不能指望单点优化。
> 就像网络安全不能只靠防火墙一样，上下文管理也不能只靠一种压缩策略。不同粒度的数据膨胀需要不同层级的应对机制。


### 四层上下文防线

`工具结果压缩（ToolResultRefStore）=> 语义压缩（SemanticCompressor）=> 对话压缩（Compaction）=> 数据总线（DataBus）`

> 严格按照数据膨胀发生的时间顺序逐层拦截——从工具返回数据的那一刻起，到数据最终被消费或过期，每一层解决一个特定粒度的膨胀问题。

`100%原始数据（50k） => ~1%精华信息（500字符）`



**L1——工具结果压缩（ToolResultRefStore）：拦截单次大数据**

工具结果是上下文膨胀的最大来源。一次 API 调用可能返回 50KB 的 JSON 数据，但 LLM 实际需要的可能只是"共 23 条记录，状态均为 active"这样的结论。

ToolResultRefStore 是一个"大结果外置 + 引用替换"机制。三个触发条件：`字符数超限（>8000）、数组元素超限（>10）、强制存储模式（alwaysStore，用于参数绑定场景下的数据完整性保障）`。*大结果存 MySQL，消息中只留引用对象：*
``` json
{
  "__stored":true,
  "__refId":"a1b2c3d4-...",
  "__toolType":"unified_protocol_service",
  "__originalLength":52340,
  "__summary":"23 records, all active...",
  "__hint":"Call get_stored_data(refId=\"a1b2c3d4-...\") for full data"
}
```
> 备注：存储记录中有一个 preview 字段（前 12000 字符），但这个 preview 永远不进入 LLM prompt，它仅用于审计/调试/回放。


`数组元素超限`的设计有一个重要的背景：LLM 倾向于在搬运大数组时"优化"掉部分元素。它不是恶意的，而是在有限的注意力中自然地做了"摘要"
> 比如：Step 1 返回 15 条记录，Step 2 需要处理全部 15 条时，LLM 会只搬运 3-5 条"代表性样本"。

超过 10 个元素的数组强制外置存储，从根本上消除了 LLM 的篡改机会——它只能通过 get_stored_data 获取完整数据。




**L2——语义压缩（SemanticCompressor）：压缩中等数据**

`单条工具结果超过 10000 字符时触发 LLM 语义压缩`。

用另一个 LLM（temperature=0.3，超时 60s）从海量数据中提取对后续推理最关键的信息，输出上限 2000 字符。本质上是用一个小模型做"注意力蒸馏"——把 50KB 的原始数据蒸馏为 2KB 的高密度结论。
> 0.3 是在"确定性"和"输出质量"之间找到的平衡点，temperature=0 在某些模型上会触发贪心解码的退化模式（重复 token）


降级策略：LLM 压缩失败时退化为结构化截断（前 3000 字符 + JSON 包装 + __fallbackTruncated: true 标记），而非直接截断原始文本。
>JSON 包装确保 LLM 能识别"这是一段不完整的数据"而非"这是全部数据"。


*教训*：LLM 在重写 preview 时会改变字段名称和数据结构前缀，导致使用前缀匹配来识别哪些工具参数对不上了，腐败数据直接流入了下游工具调用
> 修复方案：preview 改用原始文本的 substring——不经过任何 LLM 处理




**L3——对话压缩（Compaction）：压缩累积膨胀**

L1 和 L2 管的是单条消息的体积，L3 管的是消息累积后的总量膨胀。基于 usage-based 触发：当 `prompt_tokens / contextWindow >= 85%` 时启动，目标压缩到 30%。


> 为什么是 85% 而不是 95%？因为 95% 时模型可能没有足够的输出空间，返回空响应。为什么目标是 30% 而不是 50%？因为压缩有延迟（LLM 调用 + DB 写入），这段时间内新消息还在累积，如果目标太保守，压缩刚结束就再次触发。30% 提供了足够的缓冲区。


压缩产物不是简单的摘要，而是一份`结构化交接文档`。理念是"交接而非丢弃"——类似于团队交接时写的 handover doc。我们后来对这个交接文档做了一次重要的结构化改造：从 LLM 自由叙述改为固定 `schema`。

改造前的问题是：30+ 轮对话后，"已完成的工作"是一段自由叙述文本；*改造后的结构化 schema 包含四个核心字段*：
- 第一，`用户原始请求`————防止模型在长对话压缩后"忘记初心"。
- 第二，`按逻辑阶段分组的执行历史`（[阶段描述] → [做了什么] → [得到什么结果]）——这里有一个关键的 prompt 约束：*要求 LLM "保留具体的值、ID、名称，不要概括泛化"*。因为 LLM 天然倾向于生成抽象摘要（"数据已检索"），但后续步骤需要的是具体的 ID 和数值。
- 第三，`已放弃的路径`（[方案描述]：[放弃原因]）；可以防止了 LLM 在长对话中"重蹈覆辙"
- 第四，`数据引用索引`————从被压缩的对话中提取所有 __stored 的 refId，维护为一个迷你索引表，确保压缩不会导致数据引用丢失。


> 消息分割也有一个边界安全约束：不能从 tool 消息开始截断，否则破坏 assistant-tool 配对结构。实现上需要向前回溯找到对应的 assistant 消息作为分割点。最少保留 6 条消息（硬下限），最少删除 2 条消息（避免低效压缩）。



**L4——数据总线（DataBus）：补偿压缩后的按需取回**

L3 压缩后丢失了原始细节，但后续步骤可能需要引用前序数据。DataBus 在 system prompt 中维护`全局数据索引表`，根据当前步骤的 step.input 声明和 step.description 中的 {{variable_name}} 变量引用做`依赖分析，按需预取`。

*预取逻辑分两级：*
- 小数据（<=4096 字符）直接从 MySQL 取回完整内容注入 system prompt；
- 大数据（>4096 字符）取回后生成增强摘要（enhancedSummary，上限 1000 字符），格式不是简单截断而是保留结构信息：
> 严格预算控制（4096 字符），超预算时按固定顺序降级：`丢 preview → full → summary → 去掉非直接依赖 → 收缩 transcript → 收缩 working memory`。这个降级顺序遵循一个原则：*越接近当前任务核心的信息越晚被牺牲。*



**单一表示原则**

四层防线之上，有一条贯穿全局的永久约束：*同一份上游数据在任一后续 step 的 LLM 上下文中，只允许出现一种表示形态。*
> 当 LLM 面对同一数据的多种描述时，它不会"取最精确的那个"，而是花费大量 token 做交叉验证，甚至因为不同表示之间的细微措辞差异而产生幻觉（"summary 说有 23 条，但 preview 的列表看起来只有 10 条；是不是有些被过滤了？"实际上 preview 只是截断了）

- 禁止以下组合进入同一个 step prompt：`full output + summary`、`summary + preview`、`full output + tool_result preview`、`full output + tool_results + assistant narration`。
- 小数据（<8000 字符）的唯一表示是完整结构化对象（inline）；大数据（>8000 字符）的唯一表示是 `artifact_ref（refId + 有界摘要 + 元数据）`。这两种形态是互斥的，绝不共存。


工程实现上，在 PromptBuilder 中加入了一个运行时检查：*如果检测到同一 refId 对应的数据以多种形态出现在待组装的 prompt 中，直接拒绝组装并抛出告警*。这是"编译时"检查，而非"运行时"祈祷。



### 三层记忆

四层防线管的是"怎么在窗口内塞更多有效信息"，三层记忆管的是**哪些信息必须跨步骤存活**。它们是正交的两个维度——防线负责"减少"，记忆负责"保留"。


**State（变量表）**

跨步骤共享的 key-value 存储，存储步骤输出和用户参数。

它是确定性的数据通道：*Step A 的输出写入 State，Step B 从 State 读取——不经过 LLM 的"搬运"，不存在数据损耗*。



**Working Memory（工作记忆）**

- `Pinned` 是`用户的原始请求 + 当前执行计划`。它始终在上下文最前面（紧跟 system prompt），确保模型永远不会忘记"这次执行要做什么"。
> 这解决了一个真实的生产问题：在 20+ 步的任务中，模型到后面会开始"跑偏"——执行的动作和用户原始意图渐行渐远。Pinned 是对抗"目标漂移"的锚点。

- `Insights`是滚动的`经验信息沉淀，从尾部逆序注入（最新的在前），旧的自动淘汰`。每个步骤可以通过 working_memory 工具主动写入 insights



**Transcript（近期信息）**

自适应 N 条消息窗口；动态裁剪，保留最相关上下文

N 随步骤数自适应调整：
``` js
keepTarget = round(36 - steps × 0.8)
// 5 步 ≈ 保留 32 条; 15 步 ≈ 24 条; 30 步 ≈ 12 条
```
步数越多，保留的消息越少——因为早期消息中的关键信息已经被 Working Memory 提取为 Insights，原始消息的信息密度在递减。



当 Transcript 被压缩时，Working Memory 反向扩张；`步数越多允许越多 insights`（上限 40 条 / 8000 字符）。
> 这体现了一种注意力资源的动态再分配策略，当对话历史被压缩时，用结构化知识补偿信息损失。效果是：即使 Transcript 只剩 12 条消息，模型仍然"记得"关键发现，因为它们已经被固化在 Working Memory 中了。


### Context 工程设计哲学

四层上下文防线 + 三层记忆的组合，产生了显著的工程效果：Token 消耗降低 60%+（等同于直接的成本下降），Agent 在 20 步以上的复杂任务中推理质量不再随步骤增加而显著退化
> 从 Prompt 时代"8 步开始衰减、15 步几乎不可用"到 Context 的"30+ 步稳定执行"。



1. **第一，分层拦截优于全能方案**。没有一个"银弹"压缩算法能同时处理 50KB 的单次爆发和 200K+ 的累积膨胀。四层各管一段，每层做最简单的事，组合起来覆盖全场景。这和微服务拆分的哲学一致——单一职责。

2. **第二，确定性优于智能性**。在数据流转管道中，任何引入 LLM 的环节都是潜在的不确定性来源。能用 substring 的地方不用 LLM，能用声明式绑定的地方不用模型搬运。智能只用在真正需要"理解"的环节（L2 的语义压缩、L3 的结构化摘要）。

3. **第三，事前治理优于事后修复**。预算预检、单一表示检查、强制存储阈值——这些都是"编译时"约束，让问题不可能发生，而非"运行时"检测到问题再修复。



> 参考：[从 Prompt 到 Harness：企业级 Agent 工程的完整演进之路](https://mp.weixin.qq.com/s/xH4cyBJJJlG9cfcmSU5ztA)





## Harness Engineering

[一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](https://mp.weixin.qq.com/s/gs5ndvlMqM-Y4jg1_D2aFw)


*Harness Engineering 主要用来解决下面这些问题：*
- `安全边界`：权限控制、审计日志、拒绝追踪
- `可观测性`：Token 计数、成本追踪、决策日志
- `可靠性`：重试机制、降级策略、确定性兜底
- `扩展性`：工具生态、技能系统、多 Agent 协调



**Harness Engineering 核心构成：**

- `上下文管理（Context Architecture）`：渐进式披露、结构化规范（spec文档）、变更隔离、知识分层、知识库挂载

- `工具系统（Tool System）`：MCP（连接外部世界）、Skills（封装专家经验）和知识库（注入业务上下文）

- `执行编排与多 Agent 协作（Execution Orchestration）`
  - "3+1 Phase" 标准化工作流：`Phase 1: 计划 => Phase 2: 编码 => Phase 3: 交付 => Phase 4: 沉淀`
  - *多 Agent 角色定义*：
    - `Planner`：理解需求、拆解任务、生成方案；`Plan 模式 + 项目 Spec`
    - `Generator`：按方案写代码、写测试；`Rules + Skills + MCP`
    - `Evaluator`：代码审查、规范检查、测试验证；`Rules + 验收标准`
    - `Archiver`：归档变更、更新知识库；`归档脚本 + Git`

- `状态与记忆（State & Memory）`：短期记忆、中期记忆、长期记忆、变更记忆

- `评估与观测（Evaluation & Observability）`
  - 语法：编译通过、Lint 检查
  - 逻辑：单元测试通过
  - 规范：符合 Rules 约束；AI 自动合规检查
  - 架构：不破坏现有设计；人工 + AI 联合审查

- `约束与恢复（Guardrails & Recovery）`
  - 约束：`硬性红线（Rules - 不可违反）、软性约束（Skills - 推荐遵循）、安全策略（Safety - 兜底保护）`
  - 恢复机制：`所有变更通过 Git 管理，随时可以回滚；Spec Deltas 机制确保变更可追溯；编译失败时自动回退到上一个稳定状态`


> 参考： [驾驭AI Coding：一份面向团队的Harness Engineering落地规范](https://mp.weixin.qq.com/s/g4nTfxm7ebzRwkAVIGdIbg)




**Agent + Harness 五层运行时：**
> 从 User Interaction 到 MCP，一次用户请求在系统里流过的完整路径：
1. `用户交互层`：Chat、API、Webhook、Workflow
2. `编排层`：任务规划 =》 权限控制 =》 资源调度
3. `能力层`：Prompt、Skills、Projects、Tools & Plugins
4. `执行层`：Research Agent、Analysis Agent、Report Agent
5. `连接层（MCP）`：CRM（客服系统）、DataBase（数据库）、Saas（第三放服务）、API

> workspace工作空间：`共享上下文、Skills、Memory、Artifact（产出物）`，是跨层共享状态基座。

请求流转路径：`用户请求 =》 路由与编排 =》 能力选择 =》 执行与产出 =》 状态沉淀`


**Harness护栏系统：**
- Context Engineering：上下文管理
- Architecture Constraints：架构约束
- Feedback Loop：反馈循环
- Entropy Management：熵管理，稳定输出，减少波动。



**Harness四条"反直觉"的铁律：**
1. `上下文要少`：上下文越少越好，稀缺资源要精挑
2. `Agent 要专`：专才 Agent 永远赢过通才 Agent；
> Agent 是昂贵的，Skill 是廉价的，能用 Skill 解决的就别新增 Agent。
3. `状态要落盘`：状态要写文件，不要塞上下文；上下文是易失存储，文件系统才是持久内存。
> 任务中间结果、Agent 间协作、跨会话延续、审计回放，全部走文件系统。把 Workspace 当成"Agent 的 Git 仓库"——每一步操作都可回放、可审计、可断点续传。
4. `约束要可执行`：能写成 Linter 的约束，别停留在文档；文档只是"建议"，Linter / CI 才是"强制；



**Harness Engineering 的工程化：**
1. `结构化`：让上下文有 schema（任务类型、阶段、当前焦点），而不是塞一大段自由文本
2. `分段化`：按"系统约束 / 任务定义 / 当前状态 / 工具签名 / 历史摘要"分槽位写
3. `可回放`：每一次上下文构造都可重放、可 diff —— 这是 Bug 复现的基础
4. `可审计`：保留"为什么这一条信息出现在 Agent 面前"的来源链，便于追责和调优
> 一旦上下文变成可审计的"输入信号"，你就从"调 Prompt 的玄学"进入了"调系统的工程"——这是 Harness 工程师和 Prompt 工程师最大的分水岭。



### Harness Engineering 的工程模式

- 模式 1：`双阶段架构（Initializer + Executor）`

Anthropic 在 Claude Code 的实践中给出了一个被广泛复用的模板：把任务拆成两段：
```
Initializer Agent：理解任务 → 制定计划 → 写入 plan.md → 退出
                                        ↓
Executor Agent   ：读取 plan.md → 按步执行 → 跨 Context Window 接力
```
> 两个 Agent 不共享 Context Window，只通过 Workspace 里的 plan.md 接力。这样做的好处：`任务可以跨多次会话延续，不依赖任何一个会话的记忆`。



- 模式 2：`工具签名即文档（Tool-Signature-as-Doc）`

Agent 选错工具的最大原因，不是工具太多，而是工具签名写得像一坨胶水。成熟团队的做法：
1. 工具名是动词短语，一眼能读懂："query_calendar" 而不是 "tool_03"。
2. 参数 schema 里每个字段都带 description，且描述里说清"什么时候用、什么时候别用"。返回值结构稳定，Agent 不需要每次猜格式。



- 模式 3：`Sub-Agent 隔离（Context-Isolated Sub-Agent）`

复杂任务交给 Sub-Agent，**但关键不是"拆"，是"隔离"**：
1. 每个 Sub-Agent 有独立 Context Window，不污染主上下文。
2. 每个 Sub-Agent 只看到自己需要的工具，看不到全集。
3. 主 Agent 只接收 Sub-Agent 的`结构化输出`，不接收它的中间思考。



- 模式 4：`上下游反压（Upstream-Downstream Backpressure）`

防止 Agent 陷入无限循环的工程范式：
```
上游：给确定性设置 + 一致上下文
   │
   ▼
Agent 执行
   │
   ▼
下游：测试 / 类型检查 / Lint / CI 拒绝无效工作
   │
   ▼
错误信号回传 → 上游调整
```
> 关键细节：Linter 的错误信息本身就是上下文工程。它不只说"违反规则 X"，而是解释"为什么这个规则存在、正确做法是什么"——这样 Agent 读到错误后就能自我修正，不需要人类介入。



- 模式 5：`智能体审智能体（Agent-Audits-Agent）`

人类做不动 Code Review 的时候，让另一个 Agent 来做。但关键是换 Context：
- Reviewer Sub-Agent 只看 `git diff + docs/rules/*.md`。
- 角色设定为"怀疑态度的 Senior Reviewer"。
- 它对 Main Agent 的产出一无所知，所以不会被"自我合理化"污染。
> 经验之谈：失效的从来不是"换一个模型再评估"，而是"用同样的 Context 再评估一次"——后者只会复现同一个偏见。


- 模式 6：熵管理与文档园丁

代码库的熵会随着时间增长——Agent 比人类增长得更快，因为它擅长"模式复制"，会忠实地复制并放大坏模式。解法：
- 部署一个**后台 Agent 做"文档园丁"**，定期扫描过期文档、检测架构漂移、提交清理 PR。
- 持续小额偿还技术债，不要攒到爆雷。
- 把"垃圾回收"做成定时任务，而不是项目结束的善后。




### Harness Engineering 的工程实践经验

1. `Agent 数量不要超过 3 个，Skill 可以无限加`。Agent 数量本身也是上下文成本，Agent数量多，编排层容易"选错 Agent"
> 一个能跑的招聘系统：2 个 Agent(人岗匹配 Agent、招聘沟通 Agent) + 一组 Skill——远比"多 Agent + 少 Skill"稳。

2. `RPA（机器人流程自动化 Robotic Process Automation） + Agent 的接缝处最容易出事，要做"事务边界"`。RPA操作时容音出现做到一半上下文被打断、状态对不上"的事故。可通过引入强制性的事务文件解决：
```
RPA 开始    → 写 workspace/rpa_lock/{batch_id}.json (state: running)
每完成一条  → 追加进度
RPA 结束    → 标记 state: done

任何中断    → 下次启动时读 lock 文件，从断点续传，绝不重头跑
```

3. `聊天 Agent 必须接"硬护栏"，因为它对外说话`。

护栏机制：
- 白名单工具
- Linter 拦截：所有外发消息先过敏感词 / 合规规则 Linter，过不了直接拒绝调用
- 第二个 Agent 审稿：Reviewer 用独立 Context 判断："是否冒犯用户..."




> 参考：[给野马套上缰绳：Agent Harness 工程实践 ——从范式理论到钉钉AI招聘的真实落地](https://mp.weixin.qq.com/s/0w_xMwto4sLx6J_85OhWQw)









## Loop Engineering


用 AI 做优化，本质是把你的审美和架构能力注入给 AI。

初期：用 AI 做架构优化，但做法本身毫无架构：`丢 prompt、跑数据、看结果，即兴发挥`


**第 1 层：给 AI 立规矩——从 Karpathy 四条军规开始**

行为之外，还有工程约束
> 格式约定（命名风格、头文件组织、注释语言）、日志规范、禁止依赖的库


**第 2 层：砍掉废话——压缩输出 + 减少探索**

- 只留技术内容，砍掉所有废话。

- 输出"瘦身"后再喂给 LLM。四种过滤策略：`智能过滤（去 ANSI 转义、空行）→ 分组（相似项聚合）→ 截断（保相关砍冗余）→ 去重（100 行相同错误 → ×100）`。
> RTK（Rust Token Killer，51.8k stars）是 Rust 写的高性能 CLI 代理，插在 Agent 和命令输出之间，

- Agent 找代码。没有索引时，Claude Code 探索代码库靠 grep + glob + Read 逐文件扫描，查一个符号的调用关系要翻几十个文件才能拼出来。token 大量花在"找代码"上，"写代码"反而没剩多少。`codegraph：代码探索省 token`
> 它先用 AST 把代码库建成一张本地知识图谱——符号、调用关系、结构都在里面，通过 MCP 暴露给 Agent。之后想理解某个函数，一次 codegraph_explore 调用就把符号源码、调用路径、影响半径全返回了，不用再自己一个个文件拼。他们用 Opus 4.8 在 7 个真实代码库上跑过 benchmark：token 少 47%，工具调用少 58%，成本省 16%，速度还快 22%


**第 3 层：跨会话记忆——关键节点强制文档沉淀**

- `入口节点（进入前强制回顾）`：PLAN 阶段必须先读下所有历史记录
- `出口节点（退出前强制归档）`：LEARN 阶段提炼 Named Patterns + 决策依据 + 数据，写入 iterations/。不归档 → 不能退出循环

> 实际效果：iterations/ 沉淀了多次迭代记录，每条包含目标、方案、数据、决策。下次开新会话，Agent 在 PLAN 阶段强制读完所有记录，被证伪的方向不会重复探索，token 不会重复浪费。



**第 4 层：子Agent 化——按推理深度分工**

> 新问题：上下文越滚越大。评测、分析、知识沉淀、代码审查全挤在一个 Agent 里排队。


按推理深度拆四类子Agent：
1. `eval-runner`：跑 benchmark，出结构化对比报告；轻量模型；`每次代码变更完成时触发`；
2. `pipeline-analyzer`：追踪调用链，定位瓶颈；中等模型；`性能异常/流程不清晰时触发`；
3. `obsidian-synthesizer`：写结构化笔记到 Obsidian；轻量模型；`优化有结果/架构决策确定时触发`；
4. `code-reviewer + code-simplifier`，审查实现质量 + 精简冗余；中等模型；`大段代码改动后触发`

深度分析子Agent 用轻量/中等模型就够。它们只做一件事：`验证假设`。提假设是主Agent 和人的活。验证过程机械但繁重，省下来的推理预算留给主 Agent 做 tradeoff 决策。



**第 5 层：文档驱动开发——想法从人脑迁移到文件系统**

文档是事前蓝图。先写清楚再动手。三步：
1. `人写 Brief`：自然语言写清楚三件事——要优化什么、怎么算成功、什么不能破坏。
2. `AI 读 Brief + 历史，执行`：读完文档和 iterations/ 历史再提方案。Plan 里必须引用历史数据。
3. `AI 把结果写回文档`：iter-NNN.md + 更新 summary.md，形成闭环。


**五层组合：实际运行效果**
1. 下班前：`人写 Brief: 目标 + 约束 + 成功标准`（第五层）
2. 夜间无人值守：`AI 读 Brief + 历史`（第三层）
  3. `PLAN：基于历史记录提方案`（第一层 Karpathy约束）
  4. `EXCUTE：外科手术式修改`（第二层 压缩输出）
  5. 并行子Agent：`eval-runner 跑分 + pipeline-analyzer 验证` （第四层）
  6. 评测通过？
    - 否 => `LEARN提炼发现，写回 iterations/`（第三层 出口节点 + 第五层）=> 回到 步骤2 重新循环
    - 是 => `code-reviewer + code-simplifier 审查`（第四层）=> 流转到 步骤7
  7. `obsidian-synthesizer 写笔记`（第四层）
  8. `EXIT 归档知识`
9. 第二天上班：读 `sammary.md + 新笔记` 了解发生了什么

**红灯（RED）**：振荡（连续两轮方向相反）、发散（指标持续恶化）、模型失配（前馈假设破灭）——任何一个触发，循环就变红，先停再继续。
> 循环自己知道什么时候该停，这比"跑得快"重要得多。 

负反馈的原则是"证伪就回收，别恋战"，但"什么时候算证伪"过去得靠人盯着评测数据判断。

红灯把它定义成三个可判定的信号：`振荡是方向来回跳，发散是指标持续恶化，模型失配是预期和现实对不上`。信号一触发，循环自己先停，不用等人在旁边反应过来。

加上 tick 模式（按固定间隔自动跑一轮 OODA），这就是真正意义上的无人值守优化：你下班前写个 Brief，它按设定点自己跑，跑不动了自己停，出问题了自己记录。
> OODA 是观察 (Observe)、判断 (Orientation)、决策 (Decide)、行动 (Act) 四个英文单词首字母的组合，形成一个持续循环的决策过程 


Loop Engineering 不是"让 Agent 跑一个循环"，而是"循环本身进化成了一个控制系统"。




### 收藏

- [读完Agent Loop工程手册，我有8个还没想明白的问题](https://mp.weixin.qq.com/s/DtQ0FfSpUxYdRR8XOvppaw)
- [Loop Engineering 实战：实现从日志扫描到预发部署的全自主闭环](https://mp.weixin.qq.com/s/AQLsjzD0s9d8kGUGdul0sg)




## Agent Protocol

> Agent 框架层出不穷，LangGraph、OpenAI、DeepAgents、AutoAgen...，框架名词在变，但底层问题始终围绕任务、上下文、步骤、事件、状态和产物展开。 如果把这些名词往下拆，会发现它们其实都在回答同一个底层问题：

一个 Agent 任务，如何被启动、携带上下文、持续观测、中断恢复，以足够低的使用成本完成执行，并最终产生产物？

**一个生产级 Agent Protocol 应该包括什么？为什么这些协议对象会比具体框架 API 更稳定？**


Agent Runtime Protocol 是 Agent Runtime 暴露给外部世界的契约，它回答的是：
1. `如何启动一次任务` ：创建 Thread、Task、Run，或发送一条 Message
2. `如何携带上下文` ：历史消息、文件、结构化数据、参与者、能力声明
3. `如何观察进展` ：状态变更、流式事件、Artifact 增量、Trace
4. `如何中断和恢复`：需要输入、需要授权、取消、重试、继续执行
5. `如何拿到结果`：最终消息、Artifact、结构化输出、错误信息

**Protocol 是 Runtime 的外部边界，Runtime 是 Protocol 的内部实现。** Agent Protocol 不是 Runtime 之外的"接口文档"，而是 Runtime 架构的反向约束。一个 Runtime 如果无法稳定表达这些对象，就很难被前端、控制台、评测系统、审计系统和其他 Agent 复用。


`Protocol（外部契约） → Runtime（内部执行） → Harness（默认体验封装）`



### Agent Protocol 对象

Agent Protocol 不是某一个具体标准（不等于 A2A、AG-UI、LangChain Agent Protocol），而是 **Agent Runtime 对外暴露的一组稳定对象、生命周期操作和状态迁移**。

> 它由 6 类核心对象组成：Thread、Run、Step、Event、Artifact、Checkpoint。
- `Thread` / Session：一段长期上下文（这是谁的哪段任务？）
- `Run` / Task：一次具体执行（这次具体跑了什么？）
- `Step`：执行中的一个可观测步骤（哪一步调用了模型、工具或子 Agent？）
- `Event`：执行过程中的进展变化（现在发生了什么？）
- `Artifact`：Agent 产出的正式结果（结果在哪里，由哪次执行产生？）
- `Checkpoint`：可以恢复的执行快照（失败或中断后从哪里继续？）


**层级设计：**
```
Thread     ── 长期上下文（用户 × 场景，多次 Run 共享）
  └── Run  ── 一次具体执行（有明确的 start/cancel/timeout/cost）
        ├── Step        ── 每一步的模型调用/工具调用/子 Agent 调用
            ├── Event       ── 流式进展（token、tool_call、state_delta、error）
        ├── Checkpoint  ── 可恢复的快照（在关键 Step 前后打点）
        └── Artifact    ── 正式产出物（文件、报告、代码变更）
```
**核心状态机（Run）**：`created → running → (waiting_for_input | waiting_for_tool) → running → (completed | failed | cancelled)`

**强制边界：**
- Run 一定有 ID、超时、成本上限、权限上下文————没有这个就没法接生产
- Step 必须能独立 replay（输入、输出、side-effect 分开存）
- Event 用 SSE/WebSocket 流式吐
- Artifact 与 Run 双向绑定：任何产物都能追溯到是哪次 Run 的哪个 Step 产生的


Agent Protocol 的中心不再是单次 chat completion，而是 **长生命周期、可观测、可评测、可恢复、可协作的任务对象**。



### Agent Runtime

Agent Runtime 是 Agent 的执行环境，是模型调用之外的执行系统。负责：`接收输入 → 调用 LLM → 执行工具 → 管理状态 → 产出结果`。

它至少要管理五类事情：
1. `生命周期`：一次任务如何开始、运行、暂停、恢复、结束
2. `上下文`：哪些消息、文件、状态、外部资源对当前执行可见
3. `调度`：下一步调用模型、工具、子 Agent，还是等待人类
4. `控制面`：权限、Guardrail、取消、超时、预算、并发限制
5. `数据面`：状态快照、事件流、Trace、Artifact、成本数据如何流动


在 Agent 设计中的意义：Protocol 稳定，值得长期投入（它是跨框架通用语言）；Runtime 实现会变（图式/代码式/托管式各有取舍，可以按场景选）。


*Runtime 必须实现的 5 类能力（缺一不可）：*
1. `调度循环`：驱动 Step 执行，处理超时/取消/重试
2. `状态持久化`：Thread、Run、Step、Checkpoint 都要能写外部存储（不是内存）
3. `工具执行`：统一 Tool Schema + Error-as-Data（工具报错作为观察数据回给 LLM，而不是抛异常炸掉 Run）
4. `流式与中断`：所有关键动作都能吐 Event，能被 interrupt 打断并从最近 Checkpoint 恢复
5. `可观测性`：接 OpenTelemetry，每个 Step 是一个 Span



### Agent最小生命周期

> 不管采用哪种框架，生产级 Agent Runtime 都绕不开同一个生命周期：

1. **创建任务**：`Agent / Thread / Run`；执行模型、Runtime Loop
> 这是谁的哪段任务？这次跑了什么？

2. **携带上下文**：`Thread / Message / Workspace`；状态管理、Workspace / Sandbox
> 上下文与工作区状态是什么？

3. **执行步骤**：`Step / Tool Call / Subagent task`；执行模型、工具协议、多 Agent 协作
> 哪一步调用了模型、工具或子 Agent？

4. **观察事件**：`Event / Trace / State Snapshot`；流式输出、可观测性
> 现在正在发生什么？

5. **中断恢复**：`Checkpoint / Interrupt / Resume`；状态管理、中断恢复、错误恢复
> 失败后从哪里继续？

6. **产生产物**：`Artifact / Workspace file`；状态管理、流式输出、Harness
> 结果在哪里？

7. **评测审计**：`Step / Event / Artifact / Trace`；可观测性与可评测性



框架终究只是对现实问题的抽象。



Part 1：创建任务与执行步骤：Agent 如何跑起来
> “创建任务”和“执行步骤”

Part 2：保存状态、中断恢复与重试：Agent 如何活得久
> “携带上下文”“中断恢复”和“失败重试”

Part 3：连接工具与观察事件：Agent 如何连接外部世界
> “执行外部动作”和“观察事件”

Part 4：协作、审计与评测：Agent 如何被理解
> “跨 Agent 分工”和“评测审计”



### 执行模型 (Execution Model)

执行模型定义了 Agent 计算如何被编排：什么是执行的基本单元、单元之间如何调度、控制流由谁决定。

> 放到协议视角，它还定义了一个外部请求如何变成内部执行：一条 Message 如何创建 Task/Run，一次 Run 如何拆成多个 Step，每个 Step 如何产生状态、事件和产物。


执行模型分两层看：
- **Runtime Loop 承载方式**：谁拥有主循环，控制流被放在哪种运行时容器里
  - `图式 Runtime`（LangGraph）：使用构建二叉树的方式来构建条件和边
  - `代码式 Runtime`：Claude SDK、Deep Agents
  - `托管式 Runtime`：（OpenAI Assistants）

- **编排协议模式**：主循环内部哪些语义对象被显式化，哪些 Action 副作用会进入 Runtime 状态机
  - `ReAct`：Observation → Reasoning → Action → Result
  - `Plan-and-Execute`：把 Plan/Todo/Step/Progress 提升为显式状态
  - `Conversation-style Coordination`：多 Agent 消息路由与 handoff
  - `Manager-Worker`：任务分派、上下文隔离、结果汇总


执行模型回答“一个 Run 如何被调度”。执行模型不会统一，Loop 承载方式回答主循环放在哪里，编排协议模式回答哪些 Action 副作用会被 Runtime 提升为状态对象。
> 复杂工作流适合图式 Runtime，简单任务适合代码式 Runtime，快速原型适合托管式 Runtime；ReAct、Plan-and-Execute、Conversation-style coordination 可以运行在不同 Runtime 之上，也可以在同一个 Runtime 内叠加。

作为开发者，关键不是押注某一种 loop，而是让状态管理、工具调用、流式输出独立于具体执行模型。这样从代码式 Runtime 切到图式 Runtime，或从 ReAct 切到 Plan-and-Execute 时，其他能力仍然可以复用。



### Agent Harness

Agent Harness 是 Runtime 和 Framework 之间的层。把 Runtime 能力打包成默认可用的长任务 Agent 体验。

> 它不是主线之外的新概念，而是 Protocol/Runtime 能力产品化后的应用层。LangChain 官方把 Deep Agents SDK 归为 harness：它基于 LangGraph runtime 封装高层电池包，把 planning、todo、subagents、filesystem、context management、HITL、streaming、memory、permissions 组合成一个开箱即用的复杂任务 Agent。


评价一个 Agent 框架，既要看底层 Runtime 能力，也要看这些能力是否容易被正确使用。**Runtime 解决能不能做，Harness 解决开发者能不能低成本做好**；二进制复用型 SDK 进一步解决成熟体验复用问题，同时也带来更强的平台约束。


**Harness体验对象：**
- `Todo / Plan` => `Step / Event`：把长任务进度变成可观察、可恢复的步骤
- `Subagent task`	=> `Run / Step / Artifact`：把委派任务变成可追踪的子执行和结果
- `Virtual filesystem / Workspace` => `Artifact / Checkpoint`：把中间结果、文件和最终产物沉淀到可恢复状态
- `Skill`	=> `Tool / Artifact / Metadata`：把可复用能力包变成 Runtime 可发现的能力
- `Permission / HITL(Human-in-the-Loop)`	=> `Interrupt / Resume / Event`：把高风险动作放入中断恢复状态机





### 状态管理：生产级 Agent 的分水岭

状态管理定义了 Agent 执行过程中的可变数据如何表示、持久化、版本化和恢复。
> 协议视角下，状态管理还要决定哪些状态可以被外部看见：Thread history、Task status、Artifact、State Snapshot、Trace metadata，分别暴露给不同类型的客户端。

- `状态表示 (State Schema)`：数据的形状——类型化的结构（TypedDict）、消息列表、JSON blob
- `状态持久化 (Persistence)`：数据存到哪——内存、数据库、服务端托管
- `状态版本化 (Versioning)`：能否查看/回滚历史——快照链、消息追加、无版本
- `状态作用域 (Scope)`：数据对谁可见——全局、Agent 级、Channel 级
- `增量更新 (Update Mechanism)`：如何修改状态——Reducer 函数、直接覆盖、追加消息


> 把状态拆成五层：
- **对话：Conversation**：`Messages / Thread`：用户、模型、工具消息；*上下文窗口、裁剪、摘要？*
- **运行状态：Run State**：`State / Context`：当前执行的结构化变量；*类型、Reducer、并发更新？*
- **可恢复快照：Checkpoint**：`Snapshot / Savepoint`：某一步之后的完整可恢复状态；*存储、版本、回滚？*
- **文件产物：Artifact**：`File / Report / Code diff`：Agent 产出的外部结果；*生命周期、权限、可追溯？*
- **长期记忆：Semantic Memory**：`Long-term Memory`：跨会话沉淀的用户偏好或知识；*检索、污染、遗忘？*


**并发会话处理的状态一致性策略：**

| 策略 | 行为 | 优势 | 代价 | 典型场景 |
| --- | --- | --- | --- | --- |
| `串行队列` | 同一 Thread 的 Run 按顺序排队执行 | 语义最稳定，消息顺序清晰 | 延迟增加，长任务会阻塞后续输入 | 多轮对话、客服、需要强上下文连续性的任务 |
| `拒绝新 Run` | Thread 已有运行中 Run 时直接返回 conflict / busy | 实现简单，避免状态冲突 | 用户体验生硬，需要前端解释和重试 | 后台任务、审批流、一次只允许一个执行的场景 |
| `取消并覆盖` | 新 Run 到来时取消旧 Run，用最新输入重新执行 | 交互体验直接，适合"以最后一次为准" | 旧 Run 的部分进度和副作用需要可追溯或可回滚 | 搜索、草稿生成、用户频繁改需求的交互 |
| `分叉新 Run` | 从同一个 Checkpoint 分叉出多个 Run 并行执行 | 适合 A/B 测试、方案比较、探索式任务 | 需要清晰标记分支、Artifact 归属和最终采纳关系 | Prompt 对比、策略实验、研究任务 |
| `乐观并发` | Run 开始时记录 state version，提交时检查是否冲突 | 并发度高，适合低冲突写入 | 冲突检测和合并逻辑复杂 | 多 Agent 并行写不同 state channel |


并发写状态时，Runtime 至少要处理五类冲突：
1. `消息顺序冲突`：两个 Run 同时向同一个 Thread 追加消息，最终历史如何排序？
2. `状态版本冲突`：两个 Run 基于同一份 State Snapshot 修改同一个字段，谁覆盖谁？
3. `Artifact 归属冲突`：多个 Run 生成同名文件或报告，哪个是正式产物？
4. `Workspace 副作用冲突` ：多个 Run 同时改同一份代码、浏览器页面或外部系统资源？
5. `事件流归属冲突`：前端同时订阅多个 Run 时，如何用 run_id、step_id、event_id 恢复和去重？


Thread 不应该被简单当成一把全局锁。更稳的设计是：**Thread 承载上下文，Run 承载执行，Checkpoint 承载版本，Event 承载进展，Artifact 承载产物**；并发控制策略则明确写进 Run 创建语义和状态迁移规则。



**生产 Runtime 需要考虑：**
1. `状态版本号`：每个快照记录 schema version
2. `迁移函数`：加载旧快照时转换到新结构
3. `兼容窗口`：保留多久的旧状态可恢复
4. `失败策略`：迁移失败时是终止、降级，还是创建新 Run
> 这也是服务端托管状态和自建 Checkpoint 的核心差异：托管方案隐藏迁移复杂度，但也隐藏了控制权；自建方案控制力强，但必须承担 schema 演进成本。


*LangGraph 的 Checkpoint 模型是目前最完整的状态管理方案：*
- 每个节点执行后自动快照（不需要手动调用 save）
- 快照具备链式结构，支持"时间旅行"(即任意节点回滚、重放)
- Content-addressed blob 存储，类似 git 的存储方式，大状态只存一次
- 允许运行时修改 Agent 的上下文信息，这个相当牛意味着可以运行时让 Agent 自进化
> 代价是：学习曲线陡峭，Reducer 函数的语义需要理解，Checkpoint 存储占空间。

> AutoGen / Claude SDK / Agents SDK 基本没有内置持久化。对于短生命周期的 Agent 这没问题，但一旦需要跨请求保持状态（如人机协作工作流、事后评测、版本管理等），就必须自己搭建。


真正难的不是保存，而是恢复。恢复要求`状态 schema、工具副作用、外部资源、权限上下文`都能重新对齐；只把 messages 存进数据库，并不等于具备生产级状态管理。




###  中断与恢复：Human-in-the-Loop 的真正基础设施

中断与恢复定义了 Agent 执行如何暂停（通常等待人类输入）以及如何从暂停点继续。

- `中断触发 (Interrupt Trigger)`：什么条件下暂停——到达特定节点、需要工具审批、主动请求人类输入
- `中断状态 (Interrupt State)`：暂停时保存了什么——完整状态快照、对话历史、什么都没保存
- `中断载荷 (Interrupt Payload)`：暴露给人类的信息——"Agent 想调用这个工具，你同意吗？"
- `恢复机制 (Resume Mechanism)`：人类如何提供输入并让 Agent 继续——提交数据、选择选项、直接回复


不管框架如何实现，中断/恢复的通用流程是一样的：
```
Agent 执行 ──► 到达中断点 ──► 保存执行状态 ──► 向前端暴露中断载荷
                                                     │
                                                     ▼
                                               人类查看/决策
                                                     │
                                                     ▼
Agent 恢复 ◄── 从快照加载状态 ◄── 接收人类输入 ◄── 前端提交
```


*设计决策分析：*
- `LangGraph`：通用 interrupt + Command；任意节点、任意载荷、完整状态保存；需要 Checkpointer，学习成本高
- `Claude SDK`：interrupt()	；极简——发信号停止；没有恢复，只能重新开始


中断/恢复回答“任务暂停后能否从原位置继续”。它不是独立能力，而是状态管理的直接延伸：只有 Runtime 能保存精确状态，才可能几小时后从同一个断点继续。

> 中断/恢复是各框架实现差距最大的维度。LangGraph 的方案领先，是因为它把 Checkpoint 和 Interrupt 深度整合；其他框架要么只支持工具审批，要么只能做同步等待或重新开始。




### 错误恢复：Agent 应该先把错误当数据看

错误恢复定义了 Agent 执行过程中发生故障时，Runtime 如何检测、表示和处理错误。


- `错误检测 (Detection)`：在哪一层发现错误——工具执行、LLM 调用、状态更新
- `错误表示 (Representation) `：错误以什么形式存在——Exception、错误数据、状态标记
- `恢复策略 (Recovery Strategy) `：如何处理错误——重试、回滚、跳过、交给 LLM
- `部分进度保留 (Partial Progress) `：失败时已完成的步骤是否保留


```

Error-as-Exception (传统)                Error-as-Data (Agent 原生)
工具调用 ──► 失败 ──► 抛异常             工具调用 ──► 失败 ──► 返回错误信息
                      │                                       │
                      ▼                                       ▼
              框架/开发者 try/catch                      LLM 看到错误信息
              决定重试/放弃                              LLM 自主决定下一步
                                                       (重试/换工具/告知用户)
```

Agent Runtime 更适合把可理解的工具错误作为数据返回给模型，而不是默认打断执行。 即 Error-as-Data，因为LLM（旗舰级别的模型）有足够的推理能力来处理工具错误


*LangGraph 是唯一支持 Checkpoint 回滚的框架：*
- 节点 A 执行成功 → 自动保存 Checkpoint A
- 节点 B 执行失败 → 异常被记录到 pending_writes
- 重新 invoke 时 → 从 Checkpoint A 恢复，只重试节点 B
- 已完成的节点 A 不会重新执行
> 这对长时间运行的工作流至关重要。一个 10 步的 Agent 在第 8 步失败了，你不需要重跑前 7 步。


错误恢复回答“失败是否会抹掉已有进度”。它同样依赖状态管理：没有 Checkpoint，失败只能重跑；有 Checkpoint，Runtime 才能保留已完成步骤并只重试失败部分。

> Agent Runtime 应默认采用 Error-as-Data。Agent 的核心价值是自主决策，工具错误也应该优先作为可理解的数据交给模型处理；只有模型无法处理的系统级故障，才应该作为 Exception 向上抛。



### 工具协议：最可能先标准化的一层

工具协议定义了 Agent 如何发现、调用和处理外部能力。

- `工具定义 (Tool Definition)`：描述工具的名称、参数、返回值——通常用 JSON Schema
- `工具调用 (Tool Invocation)`：工具调用的请求/响应格式和传输方式
- `工具结果 (Tool Result)`：返回给 Agent 的数据格式
- `工具发现 (Tool Discovery)`：Agent 如何知道有哪些工具可用
- `错误处理 (Error Handling)`：工具调用失败时的行为

工具协议的关键问题在于工具能力能否从执行模型里解耦出来。


**MCP：工具层标准化的典型形态**

从 Runtime Protocol 的视角看，`MCP （Model Context Protocol）把工具发现、工具定义、工具调用、资源读取、Prompt 模板等能力抽象成一组客户端和服务端之间的协议对象`。Host / Client / Server 的分层，让 Agent Runtime 可以通过统一连接方式接入外部能力，而不必为每个工具单独写框架绑定。

*MCP 是 Agent 工具调用层的标准接口，Agent 是使用 MCP 工具的执行主体，两者是调用者和被调用者的关系。*


**MCP对象：**
- `Tool`：工具定义、参数 schema、调用结果；让外部能力以统一 schema 暴露给 Agent
- `Resource`：可读取的上下文资源；把文件、文档、数据库记录等变成可发现上下文
- `Prompt`：可复用提示模板；把任务模板和工具使用方式沉淀为可调用能力
- `Client / Server`：传输与能力发现边界；解耦 Runtime 和具体工具实现
> MCP 标准化的是“Agent 能调用什么、如何发现和调用”


MCP 的长期价值在于把工具生态从框架内部抽出来。一个 MCP Server 可以同时服务 Claude、IDE、桌面应用、后台 Agent 或自建 Runtime；Runtime 只需要实现 MCP Client/Host 侧适配，就能复用同一组工具、资源和 Prompt。
> 这正是工具协议最可能先标准化的原因：工具层边界清晰，输入输出结构化，和底层 loop 承载方式解耦。


**Runtime 控制面：权限、Guardrail（护栏）、预算**

工具一旦能产生真实副作用，Runtime 就必须有控制面。控制面负责约束 Agent 能做什么、何时必须停下来、谁可以批准继续。


*生产 Runtime 至少需要这些控制点：*
- `Permission`：限制工具、文件、网络、外部系统访问；*工具调用前*
- `Guardrail（护栏）`：检查输入/输出是否违反安全或业务规则；*模型调用前后*
- `Human Review`：让人类审批高风险动作；*写文件、发请求、提交订单前*
- `Budge（预算）`：限制 token、成本、步骤数、执行时间；*Run 开始和每个 Step 后*
- `Cancellation（取消）`：允许用户或系统终止执行；*长任务、误操作、超时*


> 工具协议回答“Runtime 如何连接外部能力”。它与执行模型解耦：同一个 Tool API 应该能被图式、代码式、托管式 Runtime 复用，而不是绑定在某个框架的 wrapper 里。



### 流式输出：不是 token 打字机，而是任务事件流

流式输出定义了 Agent 执行的增量结果如何传递给消费者。协议视角下，流式输出不是"边生成边打印 token"，而是 Runtime 把一次 Task/Run 的状态变化、消息增量、工具进展、Artifact 增量和自定义事件统一编码成事件流。

- `传输协议 (Transport)` ：SSE、WebSocket、异步生成器、轮询
- `粒度控制 (Granularity)`：Token 级、节点/步骤级、消息级
- `可恢复性 (Resumability)` ：断连后能否从断点继续接收
- `多通道 (Multi-channel)`：能否同时传递不同类型的事件

生产级流式输出不是 token 打字机，而是`状态、消息、工具、产物、错误和 Trace `组成的任务事件流。


- `Python AsyncGenerator`：不可恢复；Agents SDK、Claude SDK、AutoGen
- `SSE/WebSocket`：可恢复；LangGraph Platform、OpenAI Assistants


*LangGraph Platform 的可恢复流是目前唯一完整的实现：*
- `Producer`：将事件持久化到 Redis Stream（XADD）
- `Consumer`：先 Catch-up 回放历史事件（XREAD），再 Live Tail 实时事件
- 客户端通过 `Last-Event-ID + Redis Stream` 标识断点位置（可恢复 SSE 的关键）
- 服务端配置 stream_resumable: true + on_disconnect: "continue"



### 多 Agent 协作


多 Agent 协作定义了多个 Agent 如何共同完成一个任务。协议视角下，多 Agent 的本质不是"多个 prompt 互相聊天"，而是多个 Runtime 或多个 Agent 能否基于共同对象交换任务、消息、能力和产物。


- `通信模式 (Communication)`：Agent 间如何传递信息——直接发送、发布/订阅、共享状态
- `委派模型 (Delegation)`：任务如何分配——Handoff 接力、层级分工、投票决策
- `状态共享 (State Sharing)`：Agent 间能否看到彼此的状态——共享 / 隔离
- `拓扑结构 (Topology)`：Agent 的组织形式——线性、星型、网状、层级



### 可观测性与可评测性：看见问题与评价质量

`可观测性`偏运行时：Trace、Event、State Snapshot 帮助开发者在运行时定位问题、理解因果、回放状态。

`可评测性`偏事后：基于可观测数据形成质量指标、Badcase 分析、对比实验、反馈闭环，进而驱动 Prompt、工具、编排策略的自优化。

没有可观测性，评测就缺乏数据基础；没有可评测性，可观测数据只能用于调试，无法形成质量改进闭环。
> 生产级 Agent Runtime 需要同时提供两者：既能看见“它怎么跑的”，也能评价“它跑得好不好”。


- `Tracing：分布式追踪`——每个步骤的输入/输出、耗时、因果关系
- `Logging：事件日志`——Agent 运行过程中的关键事件记录
- `Metrics：量化指标`——延迟、Token 消耗、成本、成功率
- `Debugging：调试能力`——步进执行、状态回放、条件断点


**三类观测数据：**
- `Trace`：为什么这次执行走到这里；*LLM 调用、工具调用、Handoff、Guardrail*
- `Event Stream`：现在正在发生什么；*token、progress、custom event、interrupt*
- `State Snapshot`：当时系统处于什么状态；*checkpoint、messages、pending writes*

Trace 更适合事后分析，Event Stream 更适合前端实时展示，State Snapshot 更适合恢复和调试。
> Trace 解释因果，Event Stream 展示实时进展，State Snapshot 支持恢复和调试；三者打通后才能支撑评测闭环。


> 可观测性是所有框架中最薄弱的维度，没有标准的 Trace 格式，Tracing 和框架绑定太深，调试能力严重不足；只有 LangGraph 的 Checkpoint History 能做真正的"时间旅行调试"（回到任意一步查看当时的状态）。其他框架只能看日志。


**一个具备可评测性的 Runtime 应该能回答：**

- `质量指标`：准确率、召回率、Pass Rate、Token 成本、延迟、用户满意度
- `归因分析`：某次失败是 Prompt 问题、工具问题、状态管理问题，还是编排策略问题
- `对比实验`：同一任务在不同策略下的表现差异（A/B 测试、Prompt 变体、工具链变体）
- `反馈闭环`：评测结果如何驱动 Prompt 更新、工具优化、编排策略调整
- `Badcase 管理`：失败案例的结构化记录、分类、复现和追踪

当前框架的可评测能力普遍较弱。多数框架只提供 Trace 和 Event，但不提供：`标准化的质量指标定义、自动化的 Badcase 归因、对比实验的协议支持、评测结果到配置的自动反馈`


无论是自己建还是框架提供能力，都需要下面的：
- `评测协议`：定义质量指标、评测数据集、对比实验的标准接口
- `归因工具`：从 Trace 自动推断失败根因
- `反馈机制`：评测结果能自动驱动 Prompt/工具/策略的调整
- `Badcase 库`：结构化失败案例，支持复现和追踪


> 可观测性与可评测性回答“如何看见并评价一次 Run”。它收束前面的 Step、Event、State Snapshot、Artifact 和 Error，把 Runtime 执行过程变成可调试、可审计、可优化的数据。



### Agent Protocol 对象如何落到 Runtime 能力

> 如果用协议主线串起来，前面的生命周期和上面的几个维度可以归结为一张映射表：

| Protocol 对象/操作 | 外部契约 | Runtime 需要实现的能力 |
| --- | --- | --- |
| Agent Card / Metadata | 告诉别人我是谁、会什么、怎么调用 | Agent 注册、能力描述、权限声明、版本管理 |
| Thread / Context | 承载多轮上下文和参与者 | 会话管理、历史保存、上下文裁剪、参与者隔离 |
| Message / Part | 表达用户、Agent、工具的通信内容 | 多模态输入、结构化数据、文件引用、消息追加 |
| Task / Run | 表达一次可管理的执行 | 调度、状态机、取消、超时、预算、重试 |
| Step / Run Step | 表达执行内部的可观测步骤 | LLM 调用、工具调用、Handoff、Guardrail 记录 |
| Event Stream | 表达进展增量 | SSE、Last-Event-ID、事件持久化、多通道流 |
| Interrupt / Input Required | 表达需要人类或外部系统继续 | Checkpoint、resume、审批、授权、表单输入 |
| Artifact | 表达任务产物 | 文件管理、产物版本、增量产出、可追溯链接 |
| Todo / Plan | 表达长任务的显式计划 | 任务分解、进度跟踪、计划更新、上下文压缩 |
| Workspace / Backend | 表达 Agent 可读写的工作区 | virtual filesystem、shell、store、权限、隔离 |
| Skill | 表达可复用能力包 | 动态加载、权限控制、子 Agent 复用、脚本/参考资料 |
| Trace / Span | 表达执行因果链 | 观测埋点、成本归因、状态关联、审计 |
| Error | 表达失败和下一步可能动作 | Error-as-Data、异常边界、回滚、重试策略 |



> 参考：[相比层出不穷的 Agent 框架，不变的 Agent Protocol 是什么](https://mp.weixin.qq.com/s/0N-RnpGVy_PLSDHMwAIFNg)




## AI Agent 的可观测性

### Agent 可观测的 4 个维度


**维度 1：行为维度（What did it do？）**

- 调了哪些工具？传了什么参数？拿到什么返回？
- 走了哪些 Skill？哪些 Skill 命中、哪些被否决？
- 总共多少轮？每一轮在做什么？
- 最后是怎么终止的（任务完成 / 用户中断 / 超时 / 失败）？

数据源：`所有事件都按 schema 持久化在 JSONL 里。`


**维度 2：成本维度（What did it cost？）**

- 总 token 数：input + output 分别多少
- LLM 调用次数：多少次主对话、多少次工具调用
- 缓存命中率：多少 token 是 cache-hit（cache-hit 通常便宜 90%）
- 折算成 $ 多少

数据源：`每个 LLM call 后，从 response usage 里提取 token 数 + 已知单价。`


**维度 3：质量维度（Was it good？）**

- 成功 / 失败？
- 用户最后接受了 Agent 的产出，还是自己改了一遍？
- 用户中途中断了吗？
- 用户事后给的反馈（点赞/差评/评分）

数据源：`任务结束时的状态码、用户后续行为（git diff 看用户改了多少代码 / 用户是否重试 / 用户主动反馈）、离线 Eval 的对比结果`


**维度 4：学习维度（What did it learn？）**

- 写了哪些新 Memory？哪些被复用了？
- 创建了哪些新 Skill？哪些被改进、哪些被废弃？
- Skill 命中率随时间的变化（理论上应该越来越高）
- Memory 增长曲线（理论上应该收敛而不是无限膨胀）

数据源：`Memory Store + Skill Manager 的事件流`




### Agent的 3 类核心指标


**第 1 类：任务级指标**

- 任务成功率：目标 > 80%。低于这个数，用户基本就不愿意用了
- 平均耗时：目标 < 60 秒。Agent 不是聊天机器人，但用户等不了 5 分钟
- 平均轮次：目标 < 8 轮。轮次越多，成本越高、出错概率越大
- 用户重试率：目标 < 10%。重试率高 = Agent 第一次没干对


**第 2 类：工具/Skill 级指标**

- 每个工具的调用成功率：单独看每个工具。某个工具失败率突然升高 = 那个工具的 backend 出问题了 
- Skill 命中率：每个 Skill 被多少任务复用？被复用 0 次的 Skill = 没价值，应该 deprecate
- Skill 失败率：Skill 写入被拒绝多少次？拒绝多 = 安全闸门在工作，但也可能是 Skill 创建质量太差
- 工具超时率：超时多 = 工具或网络问题


**第 3 类：成本级指标**

- 单任务平均 token：这个数突然涨了 
- Prompt 拼接出问题或者 context 没有 trim
- 单任务平均成本（$）：直接换算成钱，方便和业务方对话
- 缓存命中率：目标 > 60%。低于这个数 → Prompt 设计可能不 cache-friendly
- 月度总账单：必须有上限，超了就告警



### 一次失败任务的回放路径


**步骤 1：用户报告 → 找 session_id**

用户反馈"Agent 把代码改坏了"。第一动作是`根据用户和时间找到 session_id`。
> 每个 session 必须能从用户/时间反查到。这要求 Trajectory 写入时就索引这两个字段。


**步骤 2：拉 trajectory → 看完整事件流**

拿到 session_id 后，加载这个 session 的完整 trajectory


**步骤 3：定位到出错的 turn**

从 trajectory 里找出"出错那一步"。通常是：`某个 tool_call 的参数不对、某次 llm_call 的输出走偏了、某个 Skill 命中后做了不该做的操作`


**步骤 4：查 prompt + tool_call 详情**

定位到 turn 后，深入看那一轮的完整输入输出；会展开：
- 这一轮注入的完整 Prompt（System / Memory / Skill / History）
- LLM 的完整 response（包括 reasoning 和 tool_call）
- 工具的完整 input 和 output


**步骤 5：根因定位**

看到 prompt 和 tool_call 后，根因通常 5 分钟能找到。常见的根因：
- Skill 触发条件太宽：Skill 不该被命中却被命中了
- Memory 污染：某条 Memory 是错的，模型按它干了
- 工具入参错误：模型理解错了，传了错的参数
- 上下文截断：Prompt 被 trim 时把关键信息删了




### 告警策略：4 个层级

**P0：自动停 Agent**

最严重的级别，告警的同时要采取自动行动：
- 成本超阈值（比如单任务 > $10）→ 立即终止
- 安全规则触发（比如检测到 prompt 注入）→ 隔离用户
- 短时间大量 L3 操作 → 全局熔断
> P0 告警要配合自动响应，不能光通知人。因为 P0 事件如果要等人来响应，损失已经发生了。


**P1：立即报警**

需要人 5 分钟内介入：
- 任务成功率突降（比如从 85% 跌到 60%）
- 某个用户单任务 token 爆表
- Skill 写入被频繁拒绝（说明可能在被攻击）
> P1 推电话或 IM 告警，必须有人值班。


**P2：日报汇总**

不需要立即处理，但要每天看：`常规质量波动、Skill 命中率变化、用户重试率上升`
> P2 用日报形式，每天早上一封邮件，团队 review。


**P3：仪表盘观察**

不主动推送，需要看的时候看：`所有日常指标、趋势分析、周报材料`



### 怎么搭一套 Agent 可观测性

`采集 => 存储 => 可视化 => 告警`


> 参考：[AI Agent 出问题，99% 的人连日志都没开](https://mp.weixin.qq.com/s/535BobPEKScC754J64kUZA)




