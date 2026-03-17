---
title: Python学习笔记梳理
date: 2026-01-22 17:15:16
permalink: false
categories:
  - python
  - AI
tags:
  - python
  - AI
---

# Python学习笔记梳理


## 安装 

- 安装流程可参考这个文档：[零基础也能学会！2024最全Python入门教程（图文详解）](https://blog.csdn.net/qq_48379015/article/details/153405132)
  - [Python官方网站](https://www.python.org/)
  - [PyCharm官方网站](https://www.jetbrains.com.cn/pycharm/)
- python安装完成后，比如我安装的版本是`3.11.9`，打开终端，输入`python3`即可显示刚安装的python信息；



[Python 软件包索引 (PyPI)](https://pypi.org/)、[Python 标准库 — Python 3.13.0 文档](https://docs.python.org/zh-cn/3/library/index.html)


## 常用命令
``` sh
ll /usr/local/bin/python* # 查看所有安装的python版本
alias python=/usr/local/bin/python3 # 定义别名，之后输入python就默认使用python3
python # 执行, 进入python交互环境
Python 3.11.9 (v3.11.9:de54cf5be3, Apr  2 2024, 07:12:50) [Clang 13.0.0 (clang-1300.0.29.30)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> print("122"); # 打印122
122 # 输出122
>>>
# ctrl+z 退出python交互环境


pip install langchain # 安装langchain库
pip show langchain # 查看langchain库信息
pip install langchain -i https://pypi.tuna.tsinghua.edu.cn/simple # 从清华pypi镜像安装langchain库

pip3 install -r CASE-LangChain使用/requirements.txt # 从requirements.txt安装所有依赖库

## 激活后安装（简洁）：
# 进入项目根目录
➜  python-test-project source /Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/activate
(.venv) ➜  python-test-project 
# 进入python虚拟环境后，安装包
pip install 包名
pip install -U 包名            # -U 或 --upgrade 升级包
python3 -m pip install '包名==1.2.3'     # 指定版本
python3 -m pip install '包名>=1,<2'      # 版本范围
pip uninstall 包名
pip list
pip --version
pip install --force-reinstall google-search-results # 强制重装google-search-results库

(.venv) ➜  python-test-project deactivate  # 退出当前python虚拟环境                                                                        


## 不激活，直接用该 venv 的 Python：
/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/pip install 包名

# 卸载serpapi库,-y 或 --yes (uninstall 常用), 自动确认。卸载包时，默认会问你“Proceed (y/n)?”，加上 -y 就不会问了，直接卸载。
/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/pip uninstall -y serpapi

# python执行某个.py文件
python /Users/zhouyuan17/code/baidu-test-code/python-test-project/CASE-LangChain使用/agent.py
/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/python /Users/zhouyuan17/code/baidu-test-code/python-test-project/CASE-LangChain使用/agent.py # 用venv中的python执行agent.py文件
```




## Jupyter

Jupyter Notebook 的本质是一个 Web 应用程序，便于创建和共享程序文档，支持实时代码，数学方程，可视
化和 markdown。用途包括：数据清理和转换，数值模拟，统计建模，机器学习等等。

Jupyter Notebook 是一个强大的工具，用于交互式编程、数据分析和可视化。以下是启动和访问 Jupyter
Notebook 的详细步骤。

[Jupyter官方网站](https://jupyter.org/)


### 安装

- 确保已安装 Python 环境，然后使用以下命令安装 Jupyter：`pip install jupyter`
> python是v3版本，需要使用`pip3 install jupyter`安装

- `jupyter notebook -version`, 查看jupyter notebook版本

- `jupyter notebook`启动jupyter notebook, 访问`http://localhost:8888`即可
> `jupyter notebook --port 8888`可指定端口号

- 或者运行`jupyter lab`直接启动web编辑器


如果需要更改 Jupyter 的默认工作目录（启动就立马显示的根目录）：
- 生成配置文件：`jupyter notebook --generate-config`
- 编辑配置文件：打开生成的 `~/.jupyter/jupyter_notebook_config.py` 文件
- 找到 `c.ServerApp.notebook_dir` 行，取消注释并设置为你 desired 的目录，比如：`c.ServerApp.notebook_dir = '/Users/zhouyuan17/code/blog-code/docs/more/ai/python'`
- 保存后重启 Jupyter Notebook 即可生效



## Conda

Conda 是一个开源的‌软件包管理系统‌和‌环境管理系统‌，支持在 Windows、macOS 和 Linux 等多个操作系统上使用。它最初是为 Python 程序设计的，但现已发展为可管理多种编程语言（如 R、Java、C/C++、Ruby 等）的软件包和依赖关系。

- 常见命令：
``` sh
conda create -n myenv python=3.9：创建一个名为 myenv、Python 版本为 3.9 的新环境。
conda activate myenv：激活名为 myenv 的环境。
conda install numpy pandas：在当前环境中安装 NumPy 和 Pandas。
conda list：列出当前环境中已安装的所有包。
conda env export > environment.yml：导出当前环境的配置，便于分享和复现。
conda env remove -n myenv：删除名为 myenv 的环境。
```





## 备注

- 当python环境安装完成后，也可以用其他IDE运行`.py`和`.ipynb`代码，比如VS Code、Trae等，需要安装对应的插件

- `.py` 是普通 Python 脚本，`.ipynb` 是 Jupyter 笔记本格式，支持分块运行和可视化。在 Jupyter 中可新建、导入、导出这两种格式，互相转换。



## 问题记录

- 当在当前IDE执行`.ipynb`文件时，能够正常结果，但通过 `jupyter notebook` 启动服务在浏览器运行时就会错：
``` sh
---------------------------------------------------------------------------
ModuleNotFoundError                       Traceback (most recent call last)
Cell In[2], line 1
----> 1 from langchain_core.prompts import PromptTemplate
      2 from langchain_community.llms import Tongyi  # 导入通义千问Tongyi模型
      3 import dashscope

ModuleNotFoundError: No module named 'langchain_core'
``` 
jupyter内核跟IDE的python环境是不同的，需要在IDE的python环境中安装`ipykernel`，才能在jupyter中使用该环境的python内核。在 Jupyter Notebook 中修改默认 Python 解释器，需要分两步操作：
1. 先将目标 Python 环境注册为可用 kernel
``` sh
# 在“正确的”Python环境中安装 ipykernel（如果未安装）
➜  python-test-project /Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/python -m pip install -U ipykernel

# 为该环境注册一个 Jupyter 内核
➜  python-test-project /Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/python -m ipykernel install --user --name ide-env --display-name "Python (ide-env)" # 安装ide-env内核
Installed kernelspec ide-env in /Users/zhouyuan17/Library/Jupyter/kernels/ide-env

# 查看jupyter的所有内核list
➜  python-test-project jupyter kernelspec list
Available kernels:
  ide-env    /Users/zhouyuan17/Library/Jupyter/kernels/ide-env # 说明已注册ide-env内核
  python3    /Library/Frameworks/Python.framework/Versions/3.11/share/jupyter/kernels/python3
```
2. 再设置其为默认 kernel: 本地启动`jupyter lab`时，手动在 `Kernel → Change Kernel` 中选择目标环境`ide-env`，之后重新运行即可



- 调用`serpapi`网络搜索时报错：
``` sh
ImportError: cannot import name 'GoogleSearch' from 'serpapi' (unknown location)

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/Users/zhouyuan17/code/baidu-test-code/python-test-project/CASE-LangChain使用/2-LLMChain.py", line 19, in <module>
    tools = load_tools(["serpapi"])
            ^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/lib/python3.11/site-packages/langchain_community/agent_toolkits/load_tools.py", line 753, in load_tools
    tool = _get_tool_func(**sub_kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/lib/python3.11/site-packages/langchain_community/agent_toolkits/load_tools.py", line 387, in _get_serpapi
    func=SerpAPIWrapper(**kwargs).run,
         ^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/lib/python3.11/site-packages/pydantic/main.py", line 250, in __init__
    validated_self = self.__pydantic_validator__.validate_python(data, self_instance=self)
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/lib/python3.11/site-packages/langchain_community/utilities/serpapi.py", line 73, in validate_environment
    raise ImportError(
ImportError: Could not import serpapi python package. Please install it with `pip install google-search-results`.
```
> 先卸载`/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/pip uninstall -y google-search-results`，再重新安装`/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/pip install google-search-results`就可以了~


- 运行python文件报错：
``` sh
➜  python-test-project /Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/python /Users/zhouyuan17/code/baidu-test-code/python-test-project/CASE-多文件智能问答Agent/llamaindex-agent-multi-files.py
Traceback (most recent call last):
  File "/Users/zhouyuan17/code/baidu-test-code/python-test-project/CASE-多文件智能问答Agent/llamaindex-agent-multi-files.py", line 14, in <module>
    from llama_index.llms.dashscope import DashScope
ModuleNotFoundError: No module named 'llama_index.llms.dashscope'
```
> 这个报错` ModuleNotFoundError: No module named 'llama_index.llms.dashscope'` 表明你的虚拟环境中缺少 LlamaIndex 针对 DashScope (通义千问) 的扩展包。LlamaIndex 在较新版本中将不同的 LLM 集成拆分成了独立的插件包。安装缺失的包：`/Users/zhouyuan17/code/baidu-test-code/python-test-project/.venv/bin/pip install llama-index-llms-dashscope llama-index-embeddings-dashscope`



## 收藏

- [Qwen-Agent](https://github.com/QwenLM/Qwen-Agent)
- [OpenManus](https://github.com/FoundationAgents/OpenManus)

