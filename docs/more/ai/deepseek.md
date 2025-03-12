---
title: DeepSeek相关资料整理收集
date: 2025-01-30 13:27:17
permalink: false
categories:
  - deepseek
  - ai
tags:
  - ai
---

# DeepSeek相关资料整理收集



- [deepseek](https://www.deepseek.com/)



## 笔记

### 推理大模型 vs 非推理大模型


- **推理大模型** 

推理大模型是指能够在传统的大语言模型基础上，`强化推理、逻辑分析和决策能力`的模型。它们通常具备额外的技术，比如强化学习、神经符号推理、元学习等，来增强其推理和问题解决能力。

> 例如：`DeepSeek-R1，GPT-o3`在逻辑推理、数学推理和实时问题解决方面表现突出。




- **非推理大模型** 

适用于大多数任务，非推理大模型一般侧重于`语言生成、上下文理解和自然语言处理`，而不强调深度推理能力。此类模型通常通过对大量文本数据的训练，掌握语言规律并能够生成合适的内容，但缺乏像推理模型那样复杂的推理和决策能力。

> 例如：`GPT-3、GPT-4（OpenAI），BERT（Google）`，主要用于语言生成、语言理解、文本分类、翻译



| 维度       | 推理模型                                | 通用模型                                |
|------------|-----------------------------------------|-----------------------------------------|
| 优势领域   | 数学推导、逻辑分析、代码生成、复杂问题拆解 | 文本生成、创意写作、多轮对话、开放性问答 |
| 劣势领域   | 发散性任务（如诗歌创作）                | 需要严格逻辑链的任务（如数学证明）      |
| 性能本质   | 专精于逻辑密度高的任务                  | 擅长多样性高的任务                      |
| 强弱判断   | 并非全面更强，仅在其训练目标领域显著优于通用模型 | 通用场景更灵活，但专项任务需依赖提示语补偿能力 |



提示语的基本结构包括:
1. `指令（Instruction)`：这是提示语的核心，明确告诉AI你希望
它执行什么任务。
2. `上下文（Context)`：为AI提供背景信息，帮助它更准确地理
解和执行任务。
3. `期望（Expectation)`：明确或隐含地表达你对AI输出的要求
和预期。
4. `输出格式`：期望的输出格式，如JSON、Markdown等。




## DeepSeek本地部署



- 安装本地运行管理大模型工具：[Ollama](https://ollama.com/)

[动手学ollama](https://datawhalechina.github.io/handy-ollama/#/)

1. 下载Ollama;
2. 打开，按照软件提示，cmd运行命令进行呢安装：`ollama run llama3.2`
3. 安装完成，cmd输入`ollama`有内容显示表示安装完成；
4. 打开[官网model](https://ollama.com/search)页面，查看支持哪些模型；找到`deepseek-r1`，这里选择`1.5b`，复制对应的命令，cmd执行即可~


``` sh
ollama # 查看是否已安装
ollama --version # 查看版本
ollama list # 查看本地安装了哪些模型
/bye # 退出
ollama run deepseek-r1:1.5b # 运行对应模型
ollama --help # 查看帮助，查看命令
ollama rm deepseek-r1:1.5b # 删除模型
```


- 配置图文交互界面


方案1： 安装Docker

> 参考：[DeepSeek-R1本地部署，再也不怕宕机，还有语音功能！](https://mp.weixin.qq.com/s/JUe73lGnnXv-13B8oME_Rg)


方案2：[ChatBox.AI](https://github.com/Bin-Huang/chatbox)
>  ChatBox 是 AI客户端应用和智能助手，支持众多先进的 AI 模型和 API，可在 Windows、MacOS、Android、iOS、Linux 和网页版上使用

[如何将 Chatbox 连接到远程 Ollama 服务：逐步指南](https://chatboxai.app/zh/help-center/connect-chatbox-remote-ollama-service-guide)


方案3：Chrome插件：[Page Assist](https://github.com/n4ze3m/page-assist)，安装后，在Chrome浏览器中，点击插件图标，选择`Settings`，在`Model`中选择`Ollama`，在`Server`中输入`http://127.0.0.1:11434`，点击`Save`，即可使用Ollama模型。




## VScode安装Cline插件

参考：[VSCode神级Ai插件Cline：从安装到实战【创建微信小程序扫雷】](https://www.toutiao.com/article/7458642956078072339)

1. 安装Cine插件

2. 安装完成后，`vsCode`左侧菜单栏会出现`Cline`图标，点击打开，`API Provider`选择`DeepSeek`，输入`API Key`，之后`Model`选择`deepseek-chat`即可~



## VScode安装Continue插件

[continue](https://docs.continue.dev/)，AI编程助手

1. 安装Continue插件，安装成功，vsCode左侧菜单栏会出现展示`Continue`图标
2. 本地终端运行：`ollama run deepseek-r1`
3. 点击`Continue`图标，点击下拉选择模型，会看到刚运行的deepseek模型已经自动加载进来了，选择即可~
4. 之后就可以`@`呼出快捷功能，进行操作了





## Deepseek R1打造本地化RAG知识库

参考：[Deepseek R1打造本地化RAG知识库:安装部署使用详细教程](https://www.toutiao.com/article/7465606532487496218)

- **RAG**
> Retrieval-Augmented Generation，增强信息检索和生成模型

RAG是一种结合了信息检索和大模型（LLM）的技术，在对抗大模型幻觉、高效管理用户本地文件以及数据安全保护等方面具有独到的优势。

**大模型幻觉**指的是大型语言模型在生成文本时，可能会产生看似合理但实际错误或虚构的内容。这种现象通常是因为模型在训练过程中学习了大量数据，但缺乏对真实世界的直接理解，导致其生成的回答有时不符合事实或逻辑。


1. 安装Ollama

2. 下载 DeepSeek R1 模型，启动
``` sh
ollama run deepseek-r1
```

3. 下载 Nomic-Embed-Text 向量模型
``` sh
ollama pull nomic-embed-text
```

4. 安装AnythingLLM
> AnythingLLM 是一个功能强大且灵活的开源平台，旨在帮助用户轻松构建和部署基于大型语言模型 (LLM) 的私有化应用程序。

[anythingllm](https://anythingllm.com/desktop)

- 安装完成，打开AnythingLLM，配置：
``` sh
LLM Providers: Ollama
Ollama Model: deepseek-r1
# 其他的直接下一步
工作空间：My Workspace # 输入自己的工作空间名称
# 可输入邮箱，也可直接跳过

# 初始化配置完成后，会出现工作区界面，点击 settings 图标：
LLM首选项 # 可配置模型，上面已经配置了deepseek-r1，不用再配置
向量数据库 # 默认配置即可
Emberdder首选项 # 选择 Ollama => nomic-embed-text，保存即可
```

5. 上传本地文档

- 点击工作区`My Workspace` => 点击上传图标 => 选择本地文件 => 上传 => 上传完成后，选中，Move to Workspace => Save and Embed => 等待更新完成即可

- 之后就可以在工作区进行问答了，比如让它总结刚才文档的内容，它会自动根据文档内容进行总结，并展示引用的文档。




## 收藏


- [DeepSeek官方：Awesome DeepSeek Integratio](https://github.com/deepseek-ai/awesome-deepseek-integration)


- 《DeepSeek从入门到精通》: [WPS](https://kdocs.cn/l/caFUbVZSt40Q)、[夸克网盘](https://pan.quark.cn/s/71f1ceba5a53)、[视频](https://www.bilibili.com/video/BV1cRN4eSEoy/)


- [deepseek本地部署（在线、离线）、知识库搭建（个人、组织）与代码接入](https://juejin.cn/post/7469819423534776346)

- [DeepSeek+即梦，让历史“活”起来](https://mp.weixin.qq.com/s/BYwRY-ZxwkCf8P9D2xtL-A)
- [建议收藏！DeepSeek-R1+剪映AI联动作弊器，3分钟高产爆款图文视频（含实操）](https://mp.weixin.qq.com/s/SE8kybPjvlmRbPGQZxQ74A)
- [满血DeepSeek-R1+Cursor打通！无问芯穹上线API服务，能力拉满，7大国产算力保驾护航](https://mp.weixin.qq.com/s/cEmB9NdC3u5iEHC60PBJrw)
- [小红书20篇作品变现3.5w+，揭秘如何用DeepSeek制作儿童绘本快速赚米！（附实操+变现法则）](https://mp.weixin.qq.com/s/TjceRYJ1BSzS7fnt1C9Z_w)

- [deepseek+数字人王炸组合使用方法](https://mp.weixin.qq.com/s/KNxCK6dn3YBA7hbIqhFQXA)
- [王炸 Deepseek+星流AI+可灵 做猫咪创意视频 35个作品涨粉21.5w](https://mp.weixin.qq.com/s/eC_H8tgsBmKLBK_FjN1KzQ)
- [用DeepSeek做简易版中式养生视频，22篇笔记涨粉3.4万+（附详细操作步骤）](https://mp.weixin.qq.com/s/gX81-s4ed2gGVeeaxG1j_Q)
- [爆火出圈！3分钟速成，用DeepSeek制作哪吒2走秀视频，保姆级教程](https://mp.weixin.qq.com/s/DNzJGhoL1eV5Fv_3wyjSaQ)