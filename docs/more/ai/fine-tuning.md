---
title: Fine-tuning学习笔记
date: 2026-02-07 19:56:02
permalink: false
categories:
  - AI
tags:
  - Fine-tuning
  - AI
---

# Fine-tuning学习笔记

**Fine-tuning，模型微调**。是在一个已经经过预训练、具备通用能力的模型基础上，再使用特定任务或领域的数据进行进一步训练，以适应新的任务或风格需求。由此，模型既保持原有的“广泛知识”，又在目标方向上获得“专项能力”。微调是模型层面上的能力改进。

## 微调原理

1. 以预训练模型的初始权重为起点。
2. 使用专门的数据集进一步训练模型，对模型权重进行微调。这个过程通常使用**监督学习**：我们提供输入 - 输出，展示我们希望得到的回应类型的配对。例如，如果我们是为技术支持进行微调，我们可能会提供数千个客户查询的示例，这些将与正确的技术回答相匹配。
3. 在这个过程中，**模型通过反向传播调整内部参数（权重）**，最小化预测输出与目标响应之间的差异；这里不仅仅教模型新的事实，实际上是在修改它处理信息的方式，模型也在学习识别特定领域新的知识。因此，当你特别需要具有非常深厚领域专业知识的模型时，微调就比较有优势。


::: tip 缺点
* **训练资源昂贵**：训练模型的计算成本可能非常高，需要大量 GPU。
* **训练复杂性高**：需要成千上万的高质量训练示例。
* **维护上也有挑战**：不像RAG那样，你可以随时向知识库添加新文档，更新微调模型需要进行又一轮训练。
* **遗忘风险与过拟合**：
    * 灾难性遗忘：模型可能“忘记”预训练学到的通用知识，只擅长新的领域内容。
    * 过拟合风险：模型在有限训练数据上表现突出，但对新数据的泛化能力可能下降（通常发生在训练集太小、模型过于复杂或训练轮次过多时）。
:::


## Hugging Face

- GPU：显卡，核数 > 1000；核数很多，计算量很大时可以加速
- CPU 核数：8核；核数越多，并行处理能力越强

[Hugging Face](https://huggingface.co/)，一个面向人工智能开发者的开源社区平台，核心功能是提供机器学习和自然语言处理（NLP）模型、数据集及协作工具。

[魔搭社区](https://modelscope.csdn.net/)（ModelScope）是由阿里推出的AI大模型开源社区，定位为聚焦多模态AI模型的开源平台，覆盖文本、图像、语音、视频等模态，提供从模型训练到部署的全流程服务。


### Hugging Face介绍

**在写代码时，主要和这三个库打交道：**
1. `Transformers (模型架构)`：工具箱。提供了统一的 Python 接口，可以用几乎相同的代码加载 BERT、GPT 或 Llama。
2. `Model Hub (模型库)`：仓库。存放模型权重文件（.bin 或 .safetensors）和配置文件（config.json）。
3. `Datasets (数据集)`：燃料库。一键下载维基百科、医疗问答、电商评论等海量数据集，并自动处理成模型能读的格式


**Transformer 模型主要分为三个流派，功能截然不同：**
1. **Encoder-Only (编码器架构)**
- 代表模型：BERT
- 能力：擅长理解和分析。
- 像一个阅读理解满分的学生。你给它一篇文章，它能告诉你文章的情感是正面的还是负面的，或者提取出文章里的人名。
- 应用：文本分类、实体识别、搜索匹配。

2. **Decoder-Only (解码器架构)**
- 代表模型：GPT系列, Llama, Qwen
- 能力：擅长生成。
- 像一个话唠小说家。你给它一个开头，它会根据概率不断猜下一个字是什么。
- 应用：聊天机器人、代码生成、创意写作。

3. **Encoder-Decoder (编码器-解码器架构)**
- 代表模型：T5, BART
- 能力：擅长转换。
- 像一个翻译官。听懂一句（Encode），然后重组成另一种语言说出来（Decode）。
应用：机器翻译、文本摘要。


**HuggingFace中都有哪些常用的模型:**
- **NLP（Natural Language Processing， 自然语言处理）领域**
    - `基础理解类（Encoder-Only）`：
        - BERT / RoBERTa：文本分类、命名实体识别（NER）的首选经典。
        - DistilBERT：BERT 的轻量化版本，推理速度更快，适合端侧应用。
    - `生成类（Decoder-Only / 大语言模型）`：
        - Llama 系列 (Meta)：目前最主流的开源大模型，适合对话、逻辑推理。
        - Qwen 系列 (阿里)：中文能力极强，开源社区的热门选择。
        - DeepSeek 系列：近期极具性价比的国产模型，常用于生成和思考任务。
    - `翻译与摘要（Encoder-Decoder）`：
        - T5 / FLAN-T5：能够将所有 NLP 任务转换为“文本到文本”的格式。
        - BART：擅长文本纠错和长文档摘要。

- **CV（Computer vision， 计算机视觉）与多模态领域**
    - `ViT (Vision Transformer)`：图像分类的标杆。
    - `Stable Diffusion`：目前最火的开源图像生成模型。
    - `CLIP (OpenAI)`：连接文本与图像，常用于以图搜图或零样本分类。


**HuggingFace中都有哪些常用Datasets：**

| 任务类型 | 常用数据集名称 | 简介 |
| :--- | :--- | :--- |
| 情感分析 | IMDb / Amazon Polarity | 5万条电影评论/3500万条商品评论，带正负标签。 |
| 问答系统 | SQuAD / CoQA | 斯坦福问答数据集，用于训练模型提取文章中的答案。 |
| 大模型预训练 | FineWeb / C4 | 数千亿词规模的清洗后网页文本，是大模型进化的基石。 |
| 代码生成 | MBPP / CodeContests | 包含数千个编程问题及其正确答案。 |
| 语音识别 | Common Voice | Mozilla 提供的多语言开源语音数据集。 |
| 中文特定 | CLUECorpusSmall | 常用中文通用语料库，适合初学者训练中文小模型。 |



### Token

**什么是Tokenization？**

模型不认识汉字或英文单词，它只认识数字。**Tokenizer（分词器）** 是人类语言和机器数字之间的桥梁。

**Tokenizer (分词器)**：把文本变成 Tensor (张量)。
- `加载词表`：必须和模型配套（不能用 BERT 的字典查 GPT 的词）。不同的模型有专属的 Tokenizer，不能混用！用 BERT 的 Tokenizer 去处理数据喂给GPT 模型，会报错或输出乱码。
- `Padding` (填充)：把短句子补长（通常补 0），因为 GPU 喜欢整齐的矩阵。
- `Truncation` (截断)：把太长的句子切掉，因为模型有最大长度限制（如 512）


::: tip 分词流程
1. `Input`: "我爱HuggingFace"
2. `Tokenize` (切分): ['我', '爱', 'Hugging', '##Face'] (注：BERT常用WordPiece切分)
3. `Convert to IDs` (转数字): [2769, 4263, 12890, 8921]
4. `Output`: 模型接收的就是这串数字向量
:::


**Token是大型语言模型处理文本的最小单位**。由于模型本身无法直接理解文字，因此需要将文本切分成一个个Token，再将Token转换为数字（向量）进行运算。不同的模型使用不同的“分词器”（Tokenizer）来定义Token。

分词方式的不同会直接影响模型的效率和对语言细节的理解能力。

> 可以通过 [tiktokenizer](https://tiktokenizer.vercel.app/) 这个工具看到不同模型是如何切分你输入的文本的


**模型的常见特殊Token**

为了让模型更好地理解文本的结构和指令，开发者会预设一些具有特殊功能的Token。这些Token不代表具体词义，而是作为一种“标点”或“命令”存在。
- 分隔符 (Separator Token): 用于区分不同的文本段落或角色。比如，在对话中区分用户和AI的发言，可能会用 `<|user|>` 和 `<|assistant|>` 这样的Token。
- 结束符 (End-of-Sentence/End-of-Text Token): 告知模型文本已经结束，可以停止生成了。常见的如 `[EOS]` 或 `<|endoftext|>`。这对于确保模型生成完整且不冗长的回答至关重要。
- 起始符 (Start Token): 标记序列的开始，例如 [CLS] (Classification) 或 [BOS] (Beginning of Sentence)，帮助模型准备开始处理文本。


### Hugging Face使用

1. 使用 HF-Mirror (镜像站)：不需要修改代码逻辑，只需要在运行 Python 之前设置一个环境变量，把流量指引到国内镜像站。

``` python
import os
# 设置环境变量，使用国内镜像站
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
from transformers import AutoModel, AutoTokenizer
# 此时会自动从镜像站下载，速度飞快
model = AutoModel.from_pretrained("bert-base-chinese")
```

2. 使用 ModelScope (魔搭社区)：使用阿里的 ModelScope 下载文件，然后用 HuggingFace 加载
> ModelScope 是下载工具，HuggingFace 是加载工具。

``` python
# 1. 安装 modelscope: pip install modelscope
from modelscope import snapshot_download
from transformers import AutoModel, AutoTokenizer

# 2. 从 ModelScope 下载模型文件到本地
# 这里的 qwen/Qwen2.5-0.5B 是魔搭上的模型ID，通常和HF同名
model_dir = snapshot_download('qwen/Qwen2.5-0.5B')
print(f"模型已下载到：{model_dir}")

# 3. 使用 HuggingFace 原生库加载（注意：这里传入的是本地路径）
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModel.from_pretrained(model_dir)

# 4. 验证是否成功
print("模型加载成功！")
```


### Pipeline与模型应用

**Pipeline**：一行代码实现AI功能

它是一个全自动的黑盒。当你把文本扔进去，它自动帮你完成三个繁琐的步骤：
1. `预处理 (Tokenizer)`：把文本变成数字，向量化。
2. `模型推理 (Model)`：模型进行计算，输出一堆看不懂的分数（Logits）。
3. `后处理 (Post-processing)`：把分数变成人类能看懂的标签（比如 "Positive", 99%）。


[AutoDL](https://autodl.com) 是中国最大的面向 C 端租云端 GPU 的平台，在 autodl 上可以直接租一个带有 GPU 的服务器（通常会配备同样水平的cpu，内存）,Autodl 平台主要用来运行需要下载本地模型的实验。

```
Qwen2.5-7B可以用 RTX 4090(24G)
7B * 3 = 21 < 24G
```

`RTX 4090 / 24 GB`
- ‌RTX 4090‌：这是 NVIDIA 基于 Ada Lovelace 架构打造的顶级消费级显卡型号，于2022年发布。它拥有16384个CUDA核心，支持实时光线追踪、DLSS 3等先进技术，专为4K乃至8K高分辨率游戏、AI创作和专业内容制作设计
- ‌24 GB‌：指显卡配备的显存（VRAM）容量为24GB，采用GDDR6X高速显存，显存位宽为384-bit，显存带宽高达1008 GB/s。这一容量在当前（2026年）足以流畅运行所有大型3A游戏（即使开启最高画质和光追），并能高效处理AI生成图像、视频剪辑、3D渲染等专业任务。‌


流程：
1. 从 AutoDL 租一个 RTX 4090 服务器（24G）;完成后会有一个云服务器连接，是一个jupyter notebook 环境，点击跳转进入云服务器；
2. D盘新建目录，如`autodl_temp`，用来存放模型文件；新建`.ipynb`文件，编写代码，开始训练

``` python
from transformers import pipeline
import os
# 必须在导入 pipeline 之前设置
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
os.environ["HF_HOME"] = "/root/autodl-tmp/models"  # 同时控制 model 和 tokenizer 缓存

# 1. 加载 pipeline
# 指定 task="sentiment-analysis"
# 💡 技巧：如果不指定 model，默认下载英文模型。
# 这里我们指定一个中文微调过的模型，效果更好。
cache_dir = '/root/autodl-tmp/models'
classifier = pipeline(
    task="sentiment-analysis",
    model="uer/roberta-base-finetuned-dianping-chinese"
    #model="bert-base-chinese"
)

# 2. 预测
result = classifier("这个手机屏幕太烂了，反应很慢！")
print(result)
# 输出示例：[{'label': 'negative (negative)', 'score': 0.98}]
```


**核心组件：Model**
> Model里面包含了很多层，由很多参数组成的神经网络。

``` python
from transformers import AutoModel, AutoModelForSequenceClassification
```
- `AutoModel` (Base Model)：只有大脑。它输出的是隐藏状态 (Hidden States)，一堆高维向量
- `AutoModelForSequenceClassification` (带头模型)：大脑 + 嘴巴。=> 它在 Base Model 后面加了一个全连接层（Classification Head），直接输出分类的分数。






**Pipeline常用任务（Task）**
> pipeline 是 HuggingFace 提供的最简易接口，只需指定 task 名称即可直接调用。

- **NLP 常用任务**
    - `sentiment-analysis`：情感分析，判断文本褒贬。
    - `text-generation`：文本生成，如写故事、续写代码。
    - `zero-shot-classification`：零样本分类，无需训练即可根据自定义标签分类。
    - `question-answering`：问答系统，根据给定的上下文回答问题。
    - `summarization`：自动摘要，将长文浓缩为短句。
    - `translation_xx_to_yy`：翻译任务，如 translation_en_to_zh。
    - `ner`：命名实体识别，提取人名、地名、组织名

- **CV & 音频 常用任务**
    - `image-classification`：图像分类。
    - `object-detection`：目标检测，识别图中的物体并定位。
    - `automatic-speech-recognition (ASR)`：语音转文字。
    - `text-to-speech (TTS)`：文字转语音。


::: tip 总结
1. 模型不仅仅是代码，它是一种能力；
2. 数据集不仅仅是文件，它是知识；
3. 而 Pipeline 则是将能力与知识打包好的一键服务。Pipeline 是最快的落地方式，Demo 阶段首选。
4. Tokenizer 的 padding 和 truncation 是批处理数据的关键。
5. `AutoModelFor...` 系列封装了特定任务的头，我们在微调时通常使用这一类模型。
:::

**如果想要深度定制，或者微调模型，就要把 Pipeline 拆开。**



## 微调（Fine-tuning）

::: warning Pre-training (预训练) = 大学通识教育
- 模型（比如 BERT）读了海量的维基百科、书籍。
- 能力：它懂语法，懂成语，知道“苹果”既是水果也是公司。
- 局限：它不知道你公司具体的业务逻辑。
:::

**Fine-tuning (微调) :在预训练模型的基础上，用你特定领域的数据再训练**


1. **数据加载与清洗 (Datasets)**: 在实际工作中，数据通常不在 Hub 上，而在你的 CSV 或 Excel 里。

Map 函数 (神器)：它不是简单的 for 循环，而是支持多进程的并行处理。
> 需要把文本列（Text）批量转换成数字列（Input IDs）。


2. **DataCollator：动态补齐**：BERT 模型要求同一批（Batch）进来的数据长度必须一致。


传统做法：不管句子多长，全部补齐到 512。
> 如果一句话只有 10 个字，你补了 502 个 0，显卡在疯狂计算无效的 0，浪费显存和时间。

**动态补齐**：提升训练速度，降低显存占用。
> 在训练时，看这一批数据（比如 16 条）里最长的那句是多少（比如 50）。把其他 15 条都只补齐到 50。


**Trainer API**
> 在 HuggingFace 出现之前，写一个训练循环需要手动写出所有步骤。你要自己写 `Forward, Backward, Optimizer.step, Zero_grad...` 写错一步模型就不收敛。


**传统 PyTorch 写法**代码量大，需手写日志、保存、断点续训，需手动配置混合精度 (fp16)，配置 DistributedDataParallel (极难)；**HuggingFace Trainer** 支持开箱即用 (Checkpoints, Logging)，可自动适配多卡。

### 全量微调 vs 高效微调

**全量微调**：在微调过程中，更新模型中的每一个参数。
- 优点：模型能力改变最彻底，天花板最高。
- 缺点：极贵（显存要爆）、极慢 ，而且容易出现“灾难性遗忘”（学了新知识，把旧知识忘了）。

**高效微调** (PEFT, Parameter-Efficient Fine-Tuning) :冻结住原来的大模型参数不动，只在旁边加一小部分（通常小于 1%）的新参数来训练。这也是目前最主流的做法（如 LoRA ）。
- 优点 ： 极快 、 极省显存 （单张消费级显卡就能跑 7B 模型），且不容易遗忘原有知识。

比如：
```
qwen2.5-7B 参数量7B（70亿）
全量微调 => 70亿的参数 都可以变化
 
高效微调 => 70亿的一部分（比如1%），大约 0.7亿参数
```


### CASE：垃圾邮件分类器

> 垃圾邮件分类是经典二分类任务，用户每天都会收到大量的邮件和短信，其中不乏垃圾信息（如诈骗信息、广告推广、恶意链接等）。手动筛选这些信息不仅耗时耗力，而且容易遗漏。

使用 HuggingFace 的 Transformers 库，基于预训练的 BERT 中文模型（bert-base-chinese）进行微调，构建一个**能够自动识别垃圾邮件的分类器**。


- **Step1，准备环境与数据**

首先配置 HuggingFace 镜像站，确保在国内环境下能够顺利下载模型
``` python
import os
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
os.environ["HF_HOME"] = "/root/autodl-tmp/models"
```

SFT监督学习，人工打标：准备训练数据，每条数据包含文本内容和标签（0表示正常，1表示垃圾）：
```python
data = [
{"text": "今晚有空一起吃饭吗？", "label": 0}, # 正常
{"text": "恭喜您获得500万大奖，点击领取", "label": 1}, # 垃圾
# ... 更多数据
]
dataset = Dataset.from_list(data)
dataset = dataset.train_test_split(test_size=0.2) # 划分训练集和测试集，测试集占20%
```

- **Step2，数据预处理（Tokenization）**

使用 BERT 的 Tokenizer 将文本转换为模型可理解的数字序列。这里的关键是不进行 Padding，留给 DataCollator 动态处理
``` python
checkpoint = "bert-base-chinese" # 基座模型
tokenizer = AutoTokenizer.from_pretrained(checkpoint) # 加载分词器

# truncation=True：截断过长的文本（BERT 最大长度限制）
# padding=False：不在这里补齐，避免浪费显存
def preprocess_function(examples):
    return tokenizer(examples["text"], truncation=True, max_length=128)

# 批量处理
tokenized_datasets = dataset.map(preprocess_function, batched=True)
```

- **Step3，DataCollator 动态补齐**

传统做法是将所有样本补齐到固定长度（如512），这会浪费大量显存。动态补齐，只补齐到当前批次中最长的长度，大幅提升训练效率
``` python
from transformers import DataCollatorWithPadding
data_collator = DataCollatorWithPadding(tokenizer=tokenizer) # 动态补齐
```

- **Step4，模型加载**

加载带分类头的 BERT 模型，`num_labels=2` 表示二分类任务
``` python
# 加载带分类头的模型 (num_labels=2: 二分类)
# AutoModelForSequenceClassification 在基础 BERT 模型后添加了分类头，可以直接输出分类结果。
model = AutoModelForSequenceClassification.from_pretrained(
    checkpoint, 
    num_labels=2 # [0, 1]
)
```

- **Step5，评估指标定义**

定义准确率作为评估指标
``` python
import numpy as np
import evaluate

metric = evaluate.load("accuracy") # 指标：准确率

# 计算准确度
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    # 预测结果predictions 跟 参考答案references 作对比
    return metric.compute(predictions=predictions, references=labels)
```
> 之后不断迭代，修改参数，使计算出来的误差最小


- **Step6，训练配置与执行**

使用 Trainer API 简化训练流程，只需配置参数即可:
``` python
training_args = TrainingArguments(
    output_dir="./spam-bert-finetuned", # 微调后的模型保存路径
    eval_strategy="epoch",               # 每个 epoch 结束后评估一次
    save_strategy="epoch",               # 每个 epoch 结束后保存一次
    learning_rate=2e-5,                  # 学习率 (微调通常很小)，学习速度，步长
    per_device_train_batch_size=4,       # 批次大小 (显存小就调小)
    num_train_epochs=3,                  # 训练轮数
    weight_decay=0.01,
    logging_steps=10,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics,
)
trainer.train() # 开始训练
```
Trainer API 的优势：自动处理训练循环（Forward、Backward、Optimizer），支持混合精度训练、多卡训练；自动保存检查点、记录日志


- **Step7，模型推理**

训练完成后，使用模型进行预测
``` python
# 模拟一条新数据
text = "低息贷款，无抵押，秒到账"
inputs = tokenizer(text, return_tensors="pt").to(model.device) # 确保数据也在 GPU 上

# 获取分类结果
with torch.no_grad():
    logits = model(**inputs).logits
    predicted_class_id = logits.argmax().item()

print(f"输入文本: {text}")
print(f"预测类别: {'垃圾邮件' if predicted_class_id == 1 else '正常邮件'}")
```

**模型参数越大，需要的数据量也越大。**

超参数：人工可以调配的参数，是在模型之前的，用于训练模型的设置，如学习率、批次大小、训练轮数等。

::: tip 总结
- **微调 vs 预训练**：预训练模型已经具备语言理解能力，微调只需要少量领域数据即可适应特定任务
- **动态补齐**：使用 DataCollatorWithPadding 实现批次级别的动态补齐，提升训练效率
- **Trainer API**：封装了训练的所有细节，让开发者专注于数据和模型本身
- **评估策略**：每个 epoch 结束后进行评估和保存，便于监控训练过程
:::
HuggingFace 生态简化 NLP 任务的开发流程，从数据准备到模型训练，再到最终推理，整个过程清晰高效。


## PyTorch

> PyTorch、TensorFlow都是比较主流的深度学习框架

PyTorch：是一个基于 Python 的科学计算库，主要用于构建和训练神经网络模型。它提供了动态计算图的功能，使得模型的构建和调试更加灵活。

TensorFlow：底层框架，在这个框架上可以构建和训练神经网络模型。

**HuggingFace**: AI 界的 GitHub，它托管了全球最主流的开源模型（Llama, BERT, Stable Diffusion 等）。它提供了很多现成的 Pipeline，你不需要懂原理，就能在你的代码里跑起来（比如一键实现情感分析）。


| 名称 | 定位 | 类比 | 说明 |
| :--- | :--- | :--- | :--- |
| **PyTorch** | 底层框架 (Engine) | 汽车引擎 | Meta 出品。动态图，灵活易调试，**学术界首选**。 |
| **TensorFlow** | 底层框架 (Engine) | 汽车引擎 | Google 出品。静态图起家，工业部署成熟，**PyTorch 的竞品**。 |
| **Hugging Face** | 模型社区 (Hub) | App Store / GitHub | **依赖**底层框架运行。提供现成的模型（BERT, Llama），你可以指定用 PyTorch 或 TensorFlow 来跑这些模型。 |



### PyTorch Tensor (张量)

**什么是 Tensor？**

Tensor（张量）是 PyTorch 中的核心数据结构，简单来说，它就是一个**多维数组**。GPU专门的数据结构，用于多维数组的计算。

它长得非常像 Python 的 `list` 或者 NumPy 的 `ndarray`，但它有两个专门为深度学习设计的超能力：
1. **GPU 加速**：普通的 list 只能在 CPU 上跑，而 Tensor 可以被搬运到显卡（GPU）上进行超高速的并行计算。
2. **自动求导 (Autograd)**：Tensor 可以记录它的“身世”（计算历史），这样在训练模型时，PyTorch 就能自动算出梯度，更新模型参数。

**怎么理解不同维度的 Tensor？**

| 维度 | 名称 | 形状示例 | 现实生活中的类比 |
| :--- | :--- | :--- | :--- |
| **0维** | Scalar (标量) | `tensor(7)` | 一个具体的数字（如：温度 25°C） |
| **1维** | Vector (向量) | `tensor([1, 2, 3])` | 一排数字（如：这句话被分词后的 Token IDs） |
| **2维** | Matrix (矩阵) | `tensor([[1, 2], [3, 4]])` | 一个表格（如：Excel 表，或者是黑白照片的像素点） |
| **3维** | 3-Tensor | `tensor([[[...]]])` | 一个立方体（如：彩色照片 RGB，有长、宽、颜色通道） |

**Token 和 Tensor 的关系：**
Tokenizer 把文本切分并转成数字列表（List），然后我们需要把这个 List 转成 **Tensor**，才能喂给 GPU 上的模型去吃。







## 问题记录

- 微调容易造成模型退化，比如丢失原本会的知识，这种情况怎么解决？
```
专业数据1 + 公开数据1

qwen 开源模型（公开数据训练）
qwen 金融版本 100万 + 100万公开数据（配置一个好的训练集）
筛选高质量的训练数据（多样性）
```





## 备注



