---
title: AI学习笔记-进阶篇
date: 2025-11-01 18:39:47
permalink: false
categories:
  - AI
tags:
  - AI
---


# AI学习笔记-进阶篇



## AI智能体（AI Agent）

[Agent学习笔记-理论篇](./agent)


## AppBuilder、ModelBuilder、AgentBuilder

- AppBuilder
> 百度`ACG`提出的AI新名词，**基于大模型搭建AI原生应用的工作台，主要是B端场景，开发企业级AI原生应用**，提供了`企业级Agent`、企业级RAG开发框架和工具链，以及丰富的大模型能力组件、传统AI模型组件，支持文档问答、图表问答、多轮对话、创作生成、工具编排等应用搭建，高效、低门槛地帮助企业解决大模型应用落地最后一公里问题。

[百度智能云千帆AppBuilder](https://qianfan.cloud.baidu.com/appbuilder/)

- ModelBuilder
> 又是百度`ACG`提出的ai新名词，**大模型服务与开发平台ModelBuilder，主要是提供各种AI大模型的API接口调用，模型的定制工具**，和AppBuilder都属于`百度智能云千帆`品牌，基于百度智能云打造出来的一站式大模型开发及应用平台，提供包括文心一言在内的文心大模型和第三方大模型服务，支持大模型（含第三方）定制开发，生产专属大模型，提供覆盖全生命周期的大模型工具链。

可以`为客户的大模型开发提供全生命周期的工具链、多个预制大模型与数据集`。这意味着客户想要针对自己的场景微调一个模型，只需要挑一个基座模型，选一个数据集，然后follow工具链的工具，就可以做一个自己的模型。

[千帆大模型平台](https://cloud.baidu.com/product-s/qianfan_home)


- AgentBuilder
> 百度`MEG`提出的AI新名词，**文心智能体平台，主要用于C端场景，方便用户创建自己的智能体**。在搜索的牵引下，我将与C端用户一起，共同打造繁荣的百度智能体生态！覆盖尽可能多的开发者，致力于实现人人都是智能体开发者的目标，为用户提供更好的用户体验，打造易用低门槛能力强的Agent创建+分发+变现平台。

[文心智能体平台](https://agents.baidu.com/center)


## RAG

[RAG学习笔记-理论篇](./rag)


## Function Calling

Function Calling (函数调用) 是一种允许大型语言模型(LLM)根据用户输入识别它需要的工具并决定何时调用该工具的机制。

`用户输入 => LLM => 决定需要的工具，执行方法调用 => 后端返回结果 => LLM处理结果 => 输出`

Function Calling 是 LLM 的能力——把自然语言转换成结构化的函数调用请求。LLM 本身不执行函数，只是告诉你"应该调用什么函数，参数是什么"。

> 不同的 API 需要封装成不同的方法，通常需要编写代码，很难在不同的平台灵活复用。



## MCP
> MCP 全称为**Model Context Protocol（模型上下文协议）**，最初由 Anthropic 提出并开源，简单来说，就是构建为 AI 助手提供额外背景信息的工具的标准方法。

Anthropic 在一篇博客文章中指出，尽管 AI 助手正在被广泛采用，并且模型能力（如推理和质量）在快速进步，但即使是**最高级的模型仍然受困于数据隔离问题**——它们被限制在信息孤岛和旧有系统中。每次接入新的数据源都需要定制化开发，导致真正互联的 AI 系统难以规模化扩展。

而 MCP（Multi-Connection Protocol） 旨在解决这一问题。它提供了一种协议，**允许开发者在数据源和 AI 应用（如聊天机器人）之间建立双向连接，旨在解决 AI 模型与外部资源隔离的问题**。它的核心功能是允许 AI 系统访问实时数据和外部工具，从而突破其训练数据的限制，提升能力和实用性。
> 具体来说，开发者可以通过 MCP 服务器 对外提供数据访问能力，然后构建 MCP 客户端（如应用程序或自动化工作流），按需连接这些服务器。MCP 可以让 AI 系统更灵活、高效地集成各类数据源，打破信息孤岛的限制。

MCP （Model Context Protocol，模型上下文协议）定义了应用程序和 AI 模型之间交换上下文信息的方式。这使得开发者能够以一致的方式将各种数据源、工具和功能连接到 AI 模型（一个中间协议层），就像 USB-C 让不同设备能够通过相同的接口连接一样。MCP 的目标是创建一个通用标准，使 AI 应用程序的开发和集成变得更加简单和统一。

传统的 AI 模型通常受限于训练时的数据，无法直接访问外部实时信息。而 MCP 的出现打破了这一壁垒，使 AI 系统能够：`获取最新的外部数据（如新闻、文件内容等）、调用外部工具（如协作平台或设计软件）、在动态环境中更灵活地运行`，简单来说，MCP 就像一座桥梁，连接了 AI 系统与外部世界，让 AI 的应用场景变得更加丰富和实用。

> MCP（Model Context Protocol） 的出现进一步标准化了工具调用。它定义了一套统一的协议，让任何服务都可以将自己暴露为 Agent 可调用的工具。这就像 USB 接口统一了设备连接方式一样，MCP 统一了 Agent 与外部世界的连接方式。


参考：[OpenAI 宣布采用竞对 Anthropic 协议，一夜将 MCP 送上热搜！Karpathy：赶紧歇了吧](https://mp.weixin.qq.com/s/NNwYhpYoaglG_cl1UoL59A)



**MCP 的过程**

`主机配置MCP服务 => 用户输入问题 => MCP客户端：LLM选择MCP工具，用户同意，请求MCP服务器 => MCP服务器调用工具，返回结果 => MCP客户端发送结果和用户查询信息 => LLM组织答案 => 输出`


- **MCP vs Function Calling**

MCP 是在 Function Calling 之上的协议层——它标准化了"函数在哪里、怎么调用、怎么发现":
``` js
// Function Calling 解决"决定做什么"，MCP 解决"怎么做到"
用户输入 → LLM (Function Calling) → "需要调用 query_database"
                                           ↓
                                    MCP Protocol
                                           ↓
                                    MCP Server 执行
                                           ↓
                                    返回结果给 LLM
```



## Agent Skills

Skill（全称 Agent Skill）是 Anthropic 在 2025 年 10 月发布的特性, **Skills 是一个文件夹，里面放着指令、脚本和资源，AI 会根据需要自动发现和加载。**

MCP 解决"连接"问题：让 AI 能访问外部世界」，「Skills 解决"方法论"问题：教 AI 怎么做某类任务。

MCP 让 AI 能连接数据库，Skill 教 AI 怎么分析查询结果。

Skills是给AI助手的"操作手册"，让AI能像熟练员工一样完成固定任务。和临时口头交代的Prompt不同，Skills相当于公司**SOP‌（标准作业程序 Standard Operating Procedure）‌文档**——AI需要时自动查阅，不用每次重复说明。它更像一个知识库般的文件夹，里面可以放规范、脚本、模板、参考资料等等，Agent会在需要时自己去翻。

Skill 的核心设计：**progressive disclosure，中文名叫渐进式披露**，传统方式（比如 MCP）在会话开始时就把所有信息加载到上下文。如果你有 10 个 MCP Server，每个暴露 5 个工具，那就是 50 个工具定义——可能消耗数千甚至上万 Token。Skill 的渐进式加载让你可以有几十个 Skill，但同时只加载一两个。上下文效率大幅提升。

Skill 并不是一次性的对话提示。它是一个可长期复用、输入输出明确的能力模块，强调的是稳定、确定且易于工程化维护。而 Prompt 更偏向临时性、探索性和即兴交互，两者在设计目标和工程要求上完全不同。

参考：[别搞混了！MCP 和 Agent Skill 到底有什么区别？](https://juejin.cn/post/7584057497205817387)、[一文带你看懂，火爆全网的Skills到底是个啥](https://mp.weixin.qq.com/s/nRVVqPaGxWdNqNrUcurSXg)



## Vibe Coding
Vibe Coding 是由计算机科学家 Andrej Karpathy 在 2025 年 2 月提出的概念。它描述了一种全新的编程方式：**通过自然语言和 AI 对话，让 AI 帮你写代码，你只需要描述需求、测试结果、指导方向。**

Vibe Coding 的核心理念是：你不需要精通编程语法，只需要能清楚表达你的想法。AI 负责把你的想法变成可运行的代码。

这就像点外卖一样：你告诉外卖平台你想吃什么，餐厅帮你做好送到手上。你不需要会做饭，但要知道自己想吃什么。


## A2A（Agent-to-Agent）
A2A（Agent-to-Agent）是指 AI 智能体之间相互通信和协作的协议或方式，是多智能体系统的基础技术。

就像人和人之间需要语言来沟通，AI 智能体之间也需要标准化的方式来交换信息、分配任务、汇报结果。

A2A 协议让不同的 AI 智能体能够组成团队，分工合作完成复杂任务。




## LLMOps
LLMOps（Large Language Model Operations）旨在‌加速大语言模型的开发、部署和运营‌，确保其应用能够高效、可扩展且安全地运行。它贯穿了从数据准备、模型训练、部署上线到持续监控与优化的整个生命周期。

一个完整的LLMOps流程通常包含以下几个阶段：
1. 数据准备‌：包括探索性数据分析、数据收集、清理、准备以及提示设计。‌‌
2. 模型开发‌：涵盖模型选择、调优（包括提示工程与微调）、训练与评估。‌‌
3. 测试与部署‌：在部署前进行全面的测试，并管理生产环境的推理与服务细节。‌‌
4. ‌持续监控与优化‌：通过收集人类反馈、监控性能漂移等方式，持续改进模型。‌‌



## OpenClaw

OpenClaw（曾用名 ClawdBot/Moltbot）是一款开源 AI Agent 平台，2026 年爆火，GitHub 星标超 242,000。它不是普通的聊天机器人，而是一个运行在你自己设备上的个人 AI 助手，能够"真正做事"：清理收件箱、发送邮件、管理日程、自动值守和执行脚本，并通过你已经在用的聊天应用（WhatsApp、Telegram、Slack、Discord、飞书、微信等）进行交互。

[OpenClaw 中文教程](https://openclawgithub.cc)、[OpenClaw中文文档](https://docs.openclaw.ai/zh-CN)



## 社区工具



### Hugging Face
Hugging Face是一个面向人工智能开发者的开源社区平台，核心功能是提供机器学习和自然语言处理（NLP）模型、数据集及协作工具。[Hugging Face](https://huggingface.co/)
> ‌中文替代方案‌：阿里云魔搭社区提供部分模型镜像下载，适合国内开发者使用


### 魔搭社区
[魔搭社区](https://modelscope.csdn.net/)（ModelScope）是由阿里推出的AI大模型开源社区，定位为聚焦多模态AI模型的开源平台，覆盖文本、图像、语音、视频等模态，提供从模型训练到部署的全流程服务。






### LangChain

[LangChain学习笔记](./langchain)



### FastGPT
[FastGPT](https://github.com/labring/FastGPT) 是一个 AI Agent 构建平台，提供开箱即用的数据处理、模型调用等能力，同时可以通过 Flow 可视化进行工作流编排，从而实现复杂的应用场景；专业做知识库问答



### Dify
[Dify](https://github.com/langgenius/dify) 是一款开源的大语言模型（LLM）应用开发平台。它融合了后端即服务（Backend as Service）和 LLMOps 的理念，使开发者可以快速搭建生产级的生成式 AI 应用,快速搭建 AI 工作流，提供工作流、角色设定、插件扩展等能力，适合做更复杂的 AI Copilot 系统


### Coze
[扣子](https://www.coze.cn/open/docs/guides)字节出的是新一代 AI Agent 开发平台。无论你是否有编程基础，都可以在扣子上快速搭建基于大模型的各类 AI 应用，并将 AI 应用发布到各个社交平台、通讯软件，也可以通过 API 或 SDK 将 AI 应用集成到你的业务系统中。


**FastGPT vs Dify vs Coze**
1. Coze低门槛、快上手、插件丰富、一键发布到抖音、飞书，电商导购、自媒体应用、内容创作辅助...如果想做个简单的客服机器人，还要接入抖音店铺，Coze确实是最佳选择；
2. Dify是一套完整的AI应用开发工具链。从模型接入到数据处理，从工作流编排到应用部署，每个环节都可以像乐高积木一样自由组合；适合需要**高度定制化**的企业应用
3. FastGPT专业做知识库问答，文档切分、向量检索、答案生成
4. Coze是托管服务，你的数据在字节的服务器上；Dify和FastGPT都**支持私有化部署**，你拥有完全控制权，但需要自己运维。



### Ollama
[Ollama](https://ollama.com/)是一个`本地运行大型语言模型（LLM）的工具`，Ollama是一个开源的 LLM（大型语言模型）服务工具，用于简化在本地运行大语言模型，降低使用大语言模型的门槛，使得大模型的开发者、研究人员和爱好者能够在本地环境快速实验、管理和部署最新大语言模型，包括如Llama 3、Phi 3、Mistral、Gemma等开源的大型语言模型。


### AnythingLLM
[AnythingLLM](https://anythingllm.com/desktop) 是一个功能强大且灵活的开源平台，旨在帮助用户轻松构建和部署基于大型语言模型 (LLM) 的私有化应用程序。

1. Ollama专注于本地大模型的下载、管理与API服务，提供基础推理能力；AnythingLLM侧重知识库构建与对话交互，依赖Ollama等工具提供模型支持。‌‌
2. Ollama作为模型运行时环境，需配合其他前端实现应用场景；AnythingLLM内置文档解析、向量化存储、对话界面等完整工作流。‌‌



