---
title: Claude-Code学习笔记
date: 2026-04-10 15:13:55
permalink: false
categories:
  - AI
tags:
  - AI
  - Claude-Code
---

# Claude-Code学习笔记


## 安装

[Claude Code Docs 快速开始](https://code.claude.com/docs/zh-CN/quickstart)

[最强编程模型Claude Code 国内使用指南](https://zhuanlan.zhihu.com/p/1996316309248575298)


### cc-switch

[cc-switch](https://github.com/farion1231/cc-switch)

CC Switch是一个跨平台桌面应用（支持Windows、macOS、Linux），定位为AI编程CLI工具的统一管理中枢。这个开源项目基于Tauri 2框架构建，采用Rust+React混合架构，实现了五大AI CLI工具的一站式管理：`Claude Code、Codex、Gemini CLI、OpenCode、OpenClaw`


[深度拆解cc-switch：用Rust+Tauri 2+React构建生产级AI工具统一管理平台的架构之道](https://mp.weixin.qq.com/s/f_4T-ghHuI3EZCh2frZqwA)



## 使用


### CLAUDE.md

CLAUDE.md 文件是 markdown 文件，为项目、你的个人工作流或整个组织为 Claude 提供持久指令。你用纯文本编写这些文件；Claude 在每个会话开始时读取它们。


### 权限模式

[选择权限模式](https://code.claude.com/docs/zh-CN/permission-modes)


可用模式：
- `acceptEdits`：读取、文件编辑和常见文件系统命令（mkdir、touch、mv、cp 等）；迭代您正在审查的代码
- `plan`：仅读取；在更改代码库前进行探索（默认）
- `auto`：所有操作，带后台安全检查；长时间任务、减少提示疲劳
- `dontAsk`：仅预先批准的工具；锁定的 CI 和脚本
- `bypassPermissions`：所有操作，带后台安全检查；仅隔离容器和 VM


1. 在会话期间：按 `Shift+Tab` 循环切换 default → acceptEdits → plan。当前模式显示在状态栏中。
2. bypassPermissions：在您使用 `--permission-mode bypassPermissions、--dangerously-skip-permissions 或 --allow-dangerously-skip-permissions` 启动后出现；--allow- 变体将模式添加到循环中而不激活它
3. dontAsk：永远不会出现在循环中；使用 `--permission-mode dontAsk` 设置它

启动时将模式作为标志传递：`claude --permission-mode plan`



### 常见命令


``` sh
claude    - 启动 Claude Code
claude update    - 更新claude code到最新版本
claude -c    - 继续最近的对话
claude -r <session-id>    - 恢复特定会话
claude mcp    - 配置MCP服务器
claude --verbose    - 启动详细日志
claude --model claude-sonnet-4   - 设置使用模型
claude --permission-mode plan    - 设置权限模式
claude --dangerously-skip-permissions  - 跳过权限提示（谨慎使用）
```


- 对话中：
``` sh
/init 引导您为项目创建 CLAUDE.md
/agents 帮助您配置自定义 subagents
/doctor 诊断您的安装的常见问题
/context 查看什么在占用空间
/compact 压缩上下文，释放空间
/clear 重置 context window

Ctrl+C: 取消当前输入或生成
Ctrl+D: 退出Claude Code会话
Ctrl+L: 清除终端屏幕
Up/Down: 浏览命令历史
Esc: 退出当前操作
```

1. Claude Code 在你接近 context 限制时自动压缩对话历史，这保留了重要的代码和决策，同时释放空间




## 结构分析



### `.claude/`目录结构

``` json
~/.claude/
    - CLAUDE.md // 放最稳定、最高频、最影响行为的团队共享的项目规则：命令、架构边界、目录职责、测试方式、危险区；
    - rules/xx.md // 项目级补充规则或模块化规则
    - settings.json // 权限边界：哪些命令能跑，哪些文件不能读，哪些动作必须先拦住。
    - hooks/ // 确定性动作：危险命令拦截、写后格式化、结束前测试。提示词只能提醒，hooks 能真正执行
    - skills/ // 放重复工作流：代码审查、修 issue、生成发布说明、安全检查
    - commands/ // 手动触发的斜杠命令（legacy，仍可用）
    - agents/ // 放需要独立上下文的专家角色：代码审查、安全审计、性能排查。重点是隔离中间过程，subagent
    - memory/
```

- 完整文件树：
``` md
your-project/
├── CLAUDE.md                  # 团队指令（提交到 git）
├── CLAUDE.local.md            # 个人项目覆盖（gitignored）
│
└── .claude/
    ├── CLAUDE.md
    ├── settings.json          # 权限 + hooks 配置（提交）
    ├── settings.local.json    # 个人权限覆盖（gitignored）
    │
    ├── hooks/                 # Hook 脚本，被 settings.json 引用
    │   ├── bash-firewall.sh   # PreToolUse: 拦截危险命令
    │   ├── auto-format.sh     # PostToolUse: 写后自动格式化
    │   └── enforce-tests.sh   # Stransform: translateY( 结束前跑测试
    │
    ├── rules/                 # 模块化指令文件
    │   ├── code-style.md
    │   ├── testing.md
    │   └── api-conventions.md
    │
    ├── skills/                # 自动触发的工作流
    │   ├── security-review/
    │   │   ├── SKILL.md
    │   │   └── DETAILED_GUIDE.md
    │   └── deploy/
    │       ├── SKILL.md
    │       └── templates/
    │           └── release-notes.md
    │
    ├── commands/              # 手动触发的斜杠命令（legacy，仍可用）
    │   ├── review.md          # → /project:review
    │   └── fix-issue.md       # → /project:fix-issue
    │
    └── agents/                # 隔离上下文的专家子代理
        ├── code-reviewer.md
        └── security-auditor.md

~/.claude/
├── CLAUDE.md                  # 个人全局指令
├── settings.json              # 个人全局设置 + hooks
├── skills/                    # 个人技能（所有项目可用）
├── agents/                    # 个人代理（所有项目可用）
├── commands/                  # 个人命令（所有项目可用）
└── projects/                  # 会话历史 + 自动记忆
```


### .claude

[Claude 如何记住你的项目](https://code.claude.com/docs/zh-CN/memory)


- `<project-root>/.claude/`， 项目级，团队共享的规则、权限、hooks、skills、agents，通常提交到 Git
- `~/.claude/`， 用户级，个人偏好、跨项目通用的 CLAUDE.md、个人 skills/agents、会话历史


**文件发现机制：**

Claude Code 从多个位置按优先级加载 Rules（源码中对应 getMemoryFiles 函数）。实际加载逻辑是**从项目根到 CWD（当前目录） 逐层处理**，每层内部按 `CLAUDE.md → .claude/CLAUDE.md → .claude/rules/*.md → CLAUDE.local.md` 的顺序收集，后加载的覆盖先加载的。主要来源包括:
1. `/etc/claude-code/CLAUDE.md` 等组织级托管策略（企业部署的 IT 策略：公司编码标准、安全策略、合规要求，不可覆），组织统一管理，最先加载（优先级最低）；
2. `~/.claude/CLAUDE.md、~/.claude/rules/*.md` 等用户全局偏好。所有项目生效；
3. 项目的`<root>/.../<cwd>` 各层目录，从项目根到 CWD 逐层查找上述文件；
4. 本地`<cwd>/CLAUDE.local.md` 等，个人私有规则（gitignored）；
5. `--add-dir` 指定目录，项目中额外附加目录中的规则；
6. `子目录 CLAUDE.md，访问子目录时动态加载`；

最后合并成一份系统提示词进入会话。`团队契约进仓库，个人习惯留本地。`


**内容处理流程：**
> 每个文件经过 processMemoryFile 处理：
``` md
读取文件
↓
解析 frontmatter（提取 paths 等条件匹配字段）
↓
移除 HTML 注释
↓
处理 @include 引用（最大递归深度 5 层）
↓
条件规则匹配（.claude/rules/*.md 中 paths 字段匹配当前文件路径）
↓
格式化输出
```



1. `如果两条规则相互矛盾，Claude 可能会任意选择一条`。定期审查你的 CLAUDE.md 文件、子目录中的嵌套 CLAUDE.md 文件和 .claude/rules/ 以删除过时或冲突的指令；在 monorepos 中，使用 claudeMdExcludes 跳过与你的工作无关的其他团队的 CLAUDE.md 文件。
2. 工作目录上方目录层次结构中的 CLAUDE.md 和 CLAUDE.local.md 文件在启动时完整加载。子目录中的文件在 Claude 读取这些目录中的文件时按需加载。
3. Claude Code 通过从当前工作目录向上遍历目录树来读取 CLAUDE.md 文件，检查沿途的每个目录是否有 CLAUDE.md 和 CLAUDE.local.md 文件。所有发现的文件被连接到上下文中，而不是相互覆盖。在目录树中，内容从文件系统根目录向下排序到你的工作目录，因此`更靠近你启动 Claude 的位置的指令最后被读取`。
4. 格式化后的 Rules 内容通过 prependUserContext() 注入到 messages 的最前面，包裹在 `<system-reminder>` 标签中；Rules是`被动注入到每次 API 调用的上下文中，模型在推理时自然会"看到"并遵循这些规则`。
5. 子目录 Rules 的动态加载：当模型在对话过程中访问了某个子目录的文件，Claude Code 会检查该子目录是否有 CLAUDE.md。如果有，会通过 nested_memory attachment 动态注入；`只有当模型实际接触到某个子目录时，该目录的规则才会被加载进来`。



### CLAUDE.md


CLAUDE.md 文件在每个会话开始时加载到上下文窗口中，与你的对话一起消耗token。建议 CLAUDE.md 控制在 200 行以内，超过这个长度"Claude 对指令的遵从度反而会下降"；CLAUDE.md 更适合放"每次都值得带上"的东西。

创建此文件并添加适用于在项目上工作的任何人的指令：`构建和测试命令、编码标准、架构决策、命名约定和常见工作流`。这些指令通过版本控制与你的团队共享，因此请关注项目级标准而不是个人偏好

``` md
<!-- CLAUDE.md -->
# Project: Acme API

## Commands
- npm run dev: start local server
- npm run test: run unit tests
- npm run lint: run lint and format checks
- npm run build: production build

## Architecture
- Express REST API on Node 20
- PostgreSQL through Prisma
- Route handlers live in src/handlers
- Shared types live in src/types

## Conventions
- Validate request bodies with zod
- Return { data, error } from handlers
- Use src/lib/logger.ts for logs
- Never expose stack traces to clients

## Watch out
- Tests use a local database, not mocks
- Run npm run db:test:reset before integration tests
- Do not edit migrations unless the task explicitly requires it

## 其他指令
- git 工作流 @docs/git-instructions.md
```

1. CLAUDE.md 文件可以使用 `@path/to/import` 语法导入其他文件。导入的文件在启动时展开并加载到上下文中，与引用它们的 CLAUDE.md 一起；允许相对路径和绝对路径。
2. CLAUDE.md 是推理型引导（请求），Agent 有时候会忽略。必须 100% 执行的规则需要升级为 Hook（强制）。


### rules

对于较大的项目，你可以使用 .claude/rules/ 目录将指令组织到多个文件中。这使指令保持模块化并更容易让团队维护。


`规则在每个会话或打开匹配文件时加载到上下文中`。对于不需要始终在上下文中的特定任务指令，改用 skills，它仅在你调用它们或 Claude 确定它们与你的提示相关时加载。

- 在你的项目的 .claude/rules/ 目录中放置 markdown 文件。每个文件应涵盖一个主题，如 testing.md 或 api-design.md。所有 .md 文件都被递归发现：
``` md
your-project/
├── .claude/
│   ├── CLAUDE.md           # 主项目指令
│   └── rules/
│       ├── code-style.md   # 代码样式指南
│       ├── testing.md      # 测试约定
│       └── security.md     # 安全要求
```
> 没有 `paths frontmatter` 的规则在启动时加载，优先级与 .claude/CLAUDE.md 相同。

- `路径范围规则`：规则可以使用带有 paths 字段的 YAML frontmatter 范围限定到特定文件。这些条件规则仅在 Claude 只在`模型处理匹配路径的文件时才会被注入`:
``` md
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---

# API 开发规则

- 所有 API 端点必须包括输入验证
- 使用标准错误响应格式
- 包括 OpenAPI 文档注释
```
> 没有 paths 字段的规则无条件加载并适用于所有文件。`路径范围规则在 Claude 读取与模式匹配的文件时触发，而不是在每次工具使用时`。


- `用户级规则`：~/.claude/rules/ 中的个人规则适用于你机器上的每个项目。使用它们来处理不是项目特定的偏好；用户级规则在项目规则之前加载，给予项目规则更高的优先级。





### memory

自动记忆让 Claude 跨会话积累知识，无需你编写任何内容。

1. 自动记忆默认开启。要切换它，在会话中打开 `/memory` 并使用自动记忆切换，或在你的项目设置中设置 `autoMemoryEnabled: false`
2. 每个项目在 `~/.claude/projects/<project>/memory/` 获得自己的记忆目录；要将自动记忆存储在不同位置，在你的用户设置 `~/.claude/settings.json` 中设置：`"autoMemoryDirectory": "~/my-custom-memory-dir"`
3. 自动记忆是机器本地的。同一 git 存储库中的所有 worktrees 和子目录共享一个自动记忆目录。文件不在机器或云环境之间共享。







### hooks

如果指令是必须在特定点运行的内容，例如在每次提交之前或每次文件编辑之后，请将其写成 hook 代替。`Hooks 在固定的生命周期事件处作为 shell 命令执行`，并且无论 Claude 决定做什么都适用。

hooks 放确定性动作，如安全拦截、PostToolUse 自动格式化、Stop门禁、桌面通知

Hooks 是用户定义的 shell 命令，在 Claude Code 生命周期中的特定点执行。它们对 Claude Code 的行为提供确定性控制，确保某些操作始终发生，而不是依赖 LLM 选择运行它们。


[Hooks 参考](https://code.claude.com/docs/zh-CN/hooks)、[使用 hooks 自动化工作流](https://code.claude.com/docs/zh-CN/hooks-guide)



Hook 生命周期：
1. 每个会话一次（SessionStart、SessionEnd）
2. 每轮一次（UserPromptSubmit、Stop、StopFailure）
3. 代理循环内的每个工具调用（PreToolUse、PostToolUse）




**设置hook**
1. 将 hook 添加到你的设置：
``` json
// ~/.claude/settings.json
{
  "hooks": {
    "Notification": [ // 监听 Notification hook
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ],
    "PreToolUse": [ // PreToolUse hook，它阻止破坏性 shell 命令
      {
        "matcher": "Bash", // matcher 缩小到 Bash 工具调用
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)", // if 条件进一步缩小到匹配 rm * 的 Bash 子命令
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-rm.sh"
          }
        ]
      }
    ]
  }
}
```

2. 编写 hook 脚本：
``` sh
#!/bin/bash
# .claude/hooks/block-rm.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # allow the command
fi
```
> 该脚本从 stdin 读取 JSON 输入，提取命令，如果包含 rm -rf，则返回 permissionDecision 为 "deny"


Hooks 让你在 Claude Code 生命周期中的关键点运行代码：`编辑后格式化文件、在执行前阻止命令、在 Claude 需要输入时发送通知、在会话开始时注入上下文`等。

`Hooks 通过 stdin、stdout、stderr 和退出代码与 Claude Code 通信`。
1. 当事件触发时，Claude Code 将事件特定的数据作为 JSON 传递到脚本的 stdin。
2. 你的脚本读取该数据，完成其工作，并通过退出代码告诉 Claude Code 接下来要做什么。
  - `exit 0`：操作继续
  - `exit 2`：操作被阻止
  - 其他code：操作继续




### settings.json

一个最小配置的 `settings.json`：

``` json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [ // 允许
      "Bash(npm run *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Read",
      "Write",
      "Edit"
    ],
    "deny": [ // 拒绝
      "Bash(rm -rf *)",
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)"
    ],
    "ask": [ // 提醒
      ]
  }
}
```




### commands 和 skills

commands 和 skills 放可复用流程，团队经验的 SOP
> custom commands 已经向 skills 体系收敛，commands 你得手动输入 /project:review 才会触发。skills 不一样，Claude 可以根据对话上下文自动识别"当前任务匹配这个 skill"，然后主动调用
``` md
.claude/skills/
├── security-review/
│   ├── SKILL.md
│   └── DETAILED_GUIDE.md
└── deploy/
    ├── SKILL.md
    └── templates/
        └── release-notes.md
```

SKILL.md 通过 YAML frontmatter 描述触发条件：
``` md
<!-- security-review/SKILL.md -->
---
name: security-review
description: Comprehensive security audit. Use when reviewing code for
  vulnerabilities, before deployments, or when the user mentions security.
allowed-tools: Read, Grep, Glob
---
Analyze the codebase for security vulnerabilities:

1. SQL injection and XSS risks
2. Exposed credentials or secrets
3. Insecure configurations
4. Authentication and authorization gaps

Report findings with severity ratings and specific remediation steps.
Reference @DETAILED_GUIDE.md for our security standards.
```
> 当你说"帮我审查一下这个 PR 有没有安全问题"，Claude 会匹配到 description，自动加载这个 skill。


[使用 skills 扩展 Claude](https://code.claude.com/docs/zh-CN/skills)


存储 skill 的位置决定了谁可以使用它：
1. 企业：请参阅托管设置，你的组织中的所有用户
2. 个人:	`~/.claude/skills/<skill-name>/SKILL.md`，你的所有项目
3. 项目:	`.claude/skills/<skill-name>/SKILL.md`，仅此项目
4. 插件:	`<plugin>/skills/<skill-name>/SKILL.md`，启用插件的位置
> 当 skills 在各个级别共享相同的名称时，企业覆盖个人，个人覆盖项目；插件 skills 使用 plugin-name:skill-name 命名空间，因此它们不能与其他级别冲突。


Skill 通过 skill_listing attachment 注入到 messages 中。
``` md
<!-- 执行流程 -->
模型输出 tool_use: { name: "Skill", input: { skill: "commit", args: "" } }
↓
Claude Code 读取本地 SKILL.md 提示词文本
↓
将提示词内容包装为 isMeta: true 的 user 消息，注入到对话历史中
↓
tool_result 仅返回一个标签："Launching skill: commit"
↓
下一轮 API 调用时，对话历史中已包含完整的 Skill 指令
↓
模型读到指令后，按步骤调用工具（Read、Edit、Bash 等）执行任务
```
> 当模型调用 Skill 工具时，默认走 Inline 模式


- **Inline 模式 vs Fork 模式**
> Skills 有两种执行模式，Inline 是默认模式，Fork 需要 Skill 配置文件中显式设置 context: 'fork' 才会触发
1. Inline 模式（默认）：当前对话上下文，共享主对话的一切，无独立限制，直接在当前对话中生效，简单指令注入
2. `Fork 模式`（需显式配置）：独立的 Fork 上下文，有独立的缓存、权限、abort 控制，由所用 agent definition 决定（默认无硬性上限），Fork 完成后整体返回，复杂多步任务，需要隔离

Fork 的隔离性意味着 Skill 内部的文件缓存、权限拒绝记录、abort 控制都是独立的，不会污染主对话上下文。

`Skills 是"提示词注入"机制，不是函数调用`。 tool_use 只是触发器，真正的"能力"来自被注入的 Markdown 指令文本。模型读到指令后，按指令一步步执行，利用已有的工具（Read、Edit、Bash 等）完成任务。



**Q：Rules 和 Skills 都支持按需引入，区别在哪？**
1. 触发方式：Rules 每次 API 调用自动注入，Skills 需要模型判断后主动调用 tool_use（或用户手动 /skill-name 触发）
2. 执行隔离：Skills 可配置在 Fork 上下文中运行，拥有独立的缓存、权限跟踪和 abort 控制；Rules 没有这层隔离

> 但现实中，第一点反而成了 Skills 的痛点。模型判断"是否需要调用 Skill"依赖的是 skill_listing 中最多 250 字符的描述加上 whenToUse 字段——这点信息经常不够模型做出正确判断。这就是为什么很多人发现 LLM 不会自动触发 Skill，最终还是靠手动 /commit、/review-pr 来调用。

那 Skills 真正有价值的场景是什么？关键在于手动引用 Rules 替代不了的三个点：
1. `模型自主触发——用户只需表达意图`：当 Skill 的 description/whenToUse 写得足够精准，模型能自动识别场景并触发，用户不需要知道这个 Skill 的存在。差距在单步场景不明显，但在多步骤组合任务时就凸显了；Skills 还支持嵌套调用（Skill 内部再触发其他 Skill），可以用一个"主 Skill"编排多个子 Skill，形成完整的多步工作流入口。
2. `可发现、可分发——团队协作的标准化入口`：Skill 有名字、注册在系统里，可以通过 /skills 浏览，可以打包进插件发布给团队。Rules 文件路径是私人知识，Skill 是"被组织管理的知识"。当你需要把一套工作流标准化并推广给不了解内部实现的团队成员时，Skill 是更合适的载体——用户只需记住 /commit，不需要知道背后引用了哪些规则文件。
3. `Fork 模式的独立执行生命周期——这是手动引用 Rules 做不到的`：配置 context: 'fork' 后，Skill 在独立 Agent 上下文中运行：执行过程中所有的 tool_use/tool_result 不会写入主对话，主对话保持干净；有独立的 abort 控制和权限跟踪，不会影响主流程。长流程多步任务特别适合 Fork 模式。




### subagent

把某些支线任务丢到独立上下文里做，主线程只拿结果。如代码审查、安全审计、性能排查这类任务
``` md
<!-- AGENT.md -->
---
name: code-reviewer
description: Expert code reviewer. Use PROACTIVELY when reviewing PRs,
  checking for bugs, or validating implementations before merging.
model: sonnet
tools: Read, Grep, Glob
---
You are a senior code reviewer with a focus on correctness and maintainability.

When reviewing code:
- Flag bugs, not just style issues
- Suggest specific fixes, not vague improvements
- Check for edge cases and error handling gaps
- Note performance concerns only when they matter at scale
```

[创建自定义 subagents](https://code.claude.com/docs/zh-CN/sub-agents)



### plugins

创建自定义插件以使用 skills、agents、hooks 和 MCP servers 扩展 Claude Code。Plugins 让你能够使用自定义功能扩展 Claude Code，这些功能可以在项目和团队中共享。

[创建插件](https://code.claude.com/docs/zh-CN/plugins)



### MCP

MCP 服务器定义在 `~/.claude.json`（user scope）或项目根目录的 `.mcp.json（project scope）`中，常见传输方式：
1. stdio：启动子进程通信；本地命令行工具
2. sse：SSE 长连接；远程 HTTP 服务
3. http：HTTP 流式传输（Streamable HTTP）；Web 服务
4. ws：WebSocket 长连接；实时双向通信
5. sdk：进程内直连；SDK 提供的 MCP Server


- **MCP 工具的执行流程：**
``` md
模型输出 tool_use: { name: "mcp__github__create_issue", input: {...} }
↓
Claude Code 识别 mcp__ 前缀，路由到对应 MCP Client
↓
MCP Client 发送 JSON-RPC 请求到 MCP Server 进程
↓
MCP Server 执行实际操作（如调用 GitHub API）
↓
返回真实结果
↓
tool_result.content = MCP Server 的真实输出
↓
模型读取结果，继续推理
```

对模型来说，调 `mcp__github__list_issues` 和执行 `gh issue list` 拿到的结果没有本质区别——都是 tool_result 里的一段文本。但 MCP 多了一个 Server 进程、一层 JSON-RPC 通信、一套配置和维护成本。实际使用中，查 GitHub 用 gh，读数据库用 psql，调 API 用 curl，大量 MCP Server 做的事一条命令就能替代。

那 MCP 真正不可替代的场景是什么？
1. `持久化连接和状态管理`：Bash 每次是新进程没有状态。数据库连接池、WebSocket 长连接、跨调用共享认证 session，MCP Server 作为常驻进程可以做到
2. `复杂操作的原子封装`：把 5 步 Bash 命令封装成一次 MCP 调用，减少模型拼长命令出错的概率
3. `权限隔离和安全约束`：Bash "什么都能干"，MCP Server 可以限制模型只执行预定义操作

MCP 的价值不在于"能调用外部系统"（Bash 也能），而在于"以更安全、更可靠的方式调用外部系统"。


Q：MCP 和 LLM 内置 Tools 的区别在哪？
> 对模型来说没有区别。 tools[] 里格式一样，调用方式一样。区别纯粹在 Agent 侧的执行路由：`内置 Tools 本地执行，MCP Tools 转发到外部 Server`。





### 优化建议

1. CLAUDE.md 超过 200 行的文件消耗更多上下文并可能降低遵守度。使用 `路径范围规则` 仅在 Claude 处理匹配文件时加载指令，或修剪不是每个会话都需要的内容。分割到 `@path 导入` 有助于组织，但不会减少上下文，因为导入的文件在启动时加载。



## 原理解析


### 解剖Claude Code：一个生产级Harness长什么样？
> 它的内部架构包含7个子系统，每一个都在解决一个具体的”运行时”问题。


**第一， 消息注入队列**
> Agent的对话不只是用户输入和模型输出的乒乓球。Claude Code在对话流中注入系统消息——环境信息、权限变更、上下文更新——这些消息用户看不到，但模型在每一步决策时都会参考。这就像操作系统的中断机制：CPU在执行用户程序的同时，持续接收来自硬件的信号。

**第二， Prompt组装引擎** 
> 每一次模型调用的prompt不是固定模板。Claude Code根据当前任务阶段、可用工具、历史错误等动态组装prompt。一个编写代码的步骤和一个调试错误的步骤，模型看到的指令完全不同。这是Harness的核心能力之一：让同一个模型在不同场景下表现出”不同的人格”。

**第三， 工具注册表** 
> Claude Code并不是把所有工具一股脑塞给模型。它维护一个动态注册表，根据任务阶段决定哪些工具对模型可见。写代码时不需要看到部署工具，审查PR时不需要看到文件创建工具。这个设计的核心洞察是：给模型太多选择，反而会降低决策质量——就像一个菜单有200道菜的餐厅，你点菜的效率一定不如只有20道菜的餐厅。

**第四， 安全系统——6层独立防护**。
> 这可能是最被低估的Harness组件。Claude Code的安全不是在模型层面加一句”不要执行危险操作”就完事了，而是在Harness层面构建了6层独立的检查机制：`文件系统权限控制、命令白名单/黑名单、操作确认弹窗、沙盒隔离、git操作保护、敏感信息过滤`。每一层都独立运行，即使其中5层同时失效，剩下的1层仍然能拦截危险操作。这是航空工业的”冗余设计”思想在AI Agent中的应用。

**第五，上下文工程——5阶段压缩**。 
> 这是Harness中技术含量最高的部分。当对话超过模型的context window时怎么办？Claude Code不是简单地截断最早的消息，而是执行5个阶段的上下文压缩：`识别关键信息节点、摘要化低信息密度段落、保留所有工具调用结果的核心数据、维护一个”永不丢弃”的关键事实列表、最后才在压缩后的上下文中做截断`。这就是为什么有些Agent在长任务中会”忘记”之前的决定，而另一些不会——差距就在这一层。

**第六，记忆和会话服务**。 
> 超越单次对话的信息持久化。用户的偏好（比如代码风格、常用工具链）、项目的上下文（目录结构、依赖关系）、之前会话中的关键决策——这些信息被结构化存储，在新会话开始时自动加载。模型每次启动不是从零开始，而是带着”经验”上场。

**第七，每步撤销——基于git快照**。
> 这是一个看似简单但极其重要的设计。Claude Code在每一步工具操作前都创建git快照，任何一步都可以单独撤销。这解决了Agent最大的信任问题：用户不敢让Agent自主操作，因为怕它搞砸了无法回退。有了这套机制，Agent的”自主权”可以安全地扩大——犯错的代价大幅降低，人类就愿意给更多信任，Agent就能完成更复杂的任务。这是一个正反馈循环。

7个子系统，没有一个涉及模型训练。全部是模型外部的工程。但它们合在一起，决定了这个Agent能不能在真实环境中可靠地完成工作。


> Harness是投入产出比最高的优化方向。模型的进步需要数十亿美元和数月训练周期，Harness的优化今天就能做、下周就能看到效果。



[Harness Engineering的本质是什么？](https://www.zhihu.com/question/2016648624256340425/answer/2018348626129204792)




### 源码

每次 Agent 调用 LLM，本质上就是发一个 HTTP 请求，请求体由三个核心参数组成：
``` js
anthropic.messages.create({
    system: TextBlockParam[], // 静态角色定义和行为规范
    tools: BetaToolUnion[], // 工具定义（name + description + input_schema）
    messages: MessageParam[], // 动态对话内容
})
```

**system**
> 定义模型的角色和行为规范。在 Claude Code 中，system 包含：

* 核心系统提示（行为规范、编码风格、安全规则等）
* Git 状态信息（通过 appendSystemContext 追加）
* MCP Server 级 instructions（若 Server 提供了使用说明，追加在动态区域中）

system 提示分为静态部分（可跨用户缓存）和动态部分（因会话而异，不参与缓存共享）。MCP instructions 属于动态部分。
system 的静态部分高度稳定，可利用 Anthropic 的 org 级 Prompt Cache。


**tools**

tools 数组定义模型可以调用的工具。每个工具包含 name、description（来自工具的 prompt() 方法输出）、input_schema。模型根据工具描述决定何时调用哪个工具。



**messages**

messages 是一个 user/assistant 交替的消息数组，但在 Claude Code 中，它远不只是"对话历史"。实际混合了三种内容：
* 系统上下文注入（prependUserContext）：CLAUDE.md 内容、当前日期等
* 系统提示上下文（appendSystemContext）：git 状态等（注入到 system 参数）
* 动态附件（Attachments）：Skill 列表、计划模式指令、子目录 CLAUDE.md 等
* 真实对话历史：用户输入、模型回复、工具调用结果


- 为什么系统上下文不放在 system 里？
> 因为 CLAUDE.md 等内容因项目而异，混入 system 会破坏 org 级共享缓存。放在 messages 中，既不影响 system 缓存，又能在会话内轮次间复用。



**tool_use：一切扩展机制的底层基础**

Claude 的工具调用本质上是一个结构化的多轮对话协议：
``` md
用户消息
↓
模型推理 → 输出 tool_use 块
{ "type": "tool_use", "id": "toolu_xxx", "name": "工具名", "input": { ...参数... } }
↓
调用方（Agent）执行工具
↓
将结果作为 tool_result 追加到对话
{ "type": "tool_result", "tool_use_id": "toolu_xxx", "content": "执行结果" }
↓
继续下一轮模型推理
```
模型本身不"执行"任何工具，它只是输出一段结构化 JSON，真正的执行发生在调用方（即 Claude Code 客户端）。Rules、MCP、Skills 虽然表现形式完全不同，但底层都构建在同一套 tool_use 协议之上。







## 备注

### 给 Claude Code 发送 hello，发生了什么？

- 请求Request Body：
``` json
{
   "model": "claude-opus-4.7",
    // 第一部分
   "messages": [
      {
         "role": "user",
         "content": [ // 6个block，5个注入的上下文
             {"text": "<system-reminder>...</system-reminder>"}, // Hooks配置、Tool清单、MCP服务器使用指南、可用Skills、CLAUDE.md内容等
            // ...
            {"text": "hello", "cache_control":{"ttl": "1h"}}  
         ]
      }
    ],
    // 第二部分
    "system": [
        {"text": "..."}, // 计费规则，版本号信息...
        {"text": "..."}, // claude配置的默认角色身份
        {"text": "..."}, // 默认的行为准则
        {"text": "..."}, // 缓存配置，环境配置...
    ]
    // 第三部分
    "tools": [ // Cluade自带的工具定义
        {"name": "Agent", "description": "工具描述"} // name：Agent/Bash/Edit/Glob/Grep/Read/Write/Write/Skill/ToolSearch...
        // ...
        // Glob：用来“按文件名/路径模式”批量匹配文件的（找哪些文件符合规则），比如 src/**/*.ts 、 *.md 。输出通常是一组文件路径。
        // Grep：用来“在文件内容里”按关键词/正则搜索文本的（找哪些文件里出现了某段内容），比如搜 TODO 、 function\s+\w+ 。输出通常是匹配到的行/位置或包含匹配的文件列表。
    ],
    "max_tokens": 1024,
    "stream": true,
    "think": {"type": "adaptive"}, // 自动决定是否深度推理
    "output_config": {"effort": "xhigh"} // 最高推理档位
}
```

- 返回Response Body：
``` json
{
   "status_code": 200,
   "content_type": "text/event-stream",
   "date": "2023-09-01 12:00:00",
   "events": [
    {
      "event": "message_start",
      "message": {
        "model": "claude-opus-4.7",
        "role": "assistant",
        "usage": {
            "input_tokens": 6, // hello 6个token
            "cache_creation_input_tokens": 14145, // 部分新写入缓存的内容：系统提示词、工具定义
            "cache_read_input_tokens": 16835, // 从已有缓存中读取的内容；缓存读取比新写入便宜很多
            "output_tokens": 4 // 回复内容的token数
        }
      }
    }
   ]
}
```






## 收藏

- [cchistory](https://cchistory.mariozechner.at/)：可以比较cluade code不同版本之间，系统提示词和工具定义的变化；
- [claude-trace](https://www.npmjs.com/package/@mariozechner/claude-trace)：它会拦截claude code跟 Anthropic 服务器之间的api的调用，记录下所有的请求和响应，生成html文件，本地就能看，方便分析对话时发送和接收的内容。
- [claude-HUD](https://github.com/jarrodwatts/claude-hud)，一个Claude Code插件，可以在终端显示上下文使用量、活动工具、正在运行的代理和待办事项进度。
- [claude-tap](https://github.com/liaohch3/claude-tap)，拦截并查看 Claude Code、Codex CLI、Kimi CLI、OpenCode 或 Cursor CLI 的 API 流量。看清它们如何构造 system prompt、管理对话历史、选择工具、使用 token——通过一个美观的 trace 查看器。

- [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills/blob/main/README.zh.md)，一个单一的 CLAUDE.md 文件，用于改善 Claude Code 的行为
- [Everything Claude Code](https://github.com/affaan-m/everything-claude-code/blob/main/README.zh-CN.md)，来自 Anthropic 黑客马拉松获胜者的完整 Claude Code 配置集合。
- [claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)

- [Claude How To](https://github.com/luongnv89/claude-howto/blob/main/zh/README.md)，从输入 claude 开始，到编排 agents、hooks、skills 和 MCP servers，全程配有可视化教程、可直接复制粘贴的模板，以及循序渐进的学习路径。

- [skills/frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)，anthropics官方提供的前端skill
- [Agent Skills 市场](https://lobehub.com/zh/skills?category=web-frontend-development)



## 参考


- [小白也能搞懂：.claude/ 文件夹里到底应该放什么](https://mp.weixin.qq.com/s/v6iBuqep2ZCZ9wAwhnHLDA)

- [秋芝2046 Claude Code完全教程](https://my.feishu.cn/wiki/Takxwov60iO5OOkOmpEcpOGynac)

- [Claude Code 指南](https://github.com/kscbxxLiuXP/Claude_Code_Guide_Offline/blob/main/README.md)，Claude Code免费从入门到精通，专为开发者打造的终极文档指南。
- [我用Claude Code搭了个四个AI的团队，居然真的能协作开发](https://juejin.cn/post/7608759940800544818)
