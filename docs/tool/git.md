---
title: git使用笔记
date: 2021-04-28 21:04:33
# permalink: false # f0e7be/
categories: 
  - git
tags: 
  - git
permalink: false # 86acb5/
---


# git使用笔记

## git常用操作
---

### 1. 基本操作

- 初始化本地Git存储库：`git init`
- 创建远程存储库的本地副本：`git clone ssh://git@github.com/[username]/[repository-name].git`
- 检查状态：`git status`
- 将文件添加到暂存区：`git add [file-name.txt]`
> 将所有工作区的修改添加到暂存区：`git add .`
- 将暂存区的修改进行提交：`git commit -m "[commit message]"`
> 如果工作区没有添加新的文件，只是在原有文件上进行修改，可以执行`git commit -am "[commit message]"`直接将工作区的修改进行提交
- 删除文件（或文件夹）：`git rm -r [file-name.txt]`
- 列出本地所有分支：`git branch`
> 列出包含本地远程的所有分支：`git branch -a`、重命名本地分支：`git branch -m [old branch name] [new branch name]`
- 创建一个新分支并切换到该分支：`git checkout -b [branch name]`
> 切换到已有分支：`git checkout [branch name]`
- 合并分支：`git merge [branch name]`
> 将一个分支合并到一个目标分支：`git merge [source branch] [target branch]`
- 将分支推送到你的远程存储库：`git push origin [branch name]`
> 强推：`git push -f`
- 拉取：`git pull`
- 查看更改：`git log`
- 合并前预览更改：`git diff [source branch] [target branch]`


### 2. 删除分支

- 删除本地分支：`git branch -D branchName`

- 批量删除本地分支：`git branch |grep 'branchName' |xargs git branch -D`
> 这是通过 shell 管道命令来实现的批量删除分支的功能<br/>
`git branch` 输出当前分支列表<br/>
`grep` 是对 git branch 的输出结果进行匹配，匹配值当然就是 `branchName` <br/>
`xargs` 的作用是将参数列表转换成小块分段传递给其他命令 <br/>
所以这条命令意思为：**从分支列表中匹配到指定分支，然后一个一个(分成小块)传递给删除分支的命令，最后进行删除**。

- 删除gitlab上的远程分支：`git push origin :branch-name`
> branch-name为分支名


> Q：在gitlab上删除分支后，本地git branch -r还能看到怎么办？[参考](https://www.cnblogs.com/lyraLee/p/10916504.html)
- `git remote prune --dry-run origin` 查看当前有哪些是该消失还存在的分支
- `git remote prune origin` 删除上面展示的所有分支
- `git fetch --prune origin`   如果没有结果输出说明已经删除完成了



### 3. 查看提交记录

- `git log -n`  :n为最近提交的次数
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git101.png')" width="auto"/>

- `git log --online`  把每一个提交压缩到一行，默认只显示提交ID和提交信息第一行
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git102.png')" width="auto"/>

- `git log --online -n` :n是数字，获取最近n次的提交记录

- `git log --stat` :显示每次提交的文件增删数量
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git103.png')" width="auto"/>

- `git log -p`  :输出所有的删改
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git104.png')" width="auto"/>

- `git shortlog -n`  :每个提交按作者分类，显示提交信息第一行；n为数量，默认显示全部提交记录
> 如：`git shortlog -10`

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git105.png')" width="auto"/>

- `git log --after="2014-7-1"`  :时间过滤；  或者：`git log --before="......."`

- `git log --author="zhou"`  :作者过滤

[参考](http://www.360doc.com/content/16/0519/10/10058718_560380335.shtml)


- `git reflog`  :查看所有分支的提交记录，包括已经删除和reset的操作！！！而`git log` 则看不到被删除的commitID
> git log是显示当前的HEAD和它的祖先的，递归是沿着当前指针的父亲，父亲的父亲，…，这样的原则；git reflog根本不遍历HEAD的祖先。它是HEAD所指向的一个顺序的提交列表：它的undo历史。reflog并不是repo（仓库）的一部分，它单独存储，而且不包含在pushes，fetches或者clones里面，它纯属是本地的，可以很好地帮助你恢复你误操作的数据。



### 4. 版本回退

- `git reset --hard HEAD^` :返回上个版本
> **适应场景**：如果想恢复到之前某个提交的版本，且那个版本之后提交的版本我们都不要了

> 此时用`git push`会报错，因为我们本地库HEAD指向的版本比远程库的要旧，使用`git push -f`强制推送上去即可

- `git reset --hard commitID`  回退到指定版本	

- `git reset --hard`  撤销失败的合并更改
> 彻底回退到某个版本，本地的源码也会变为上一个版本的内容，撤销的commit中所包含的更改被冲掉。

- `git reset --soft`  回退到某个版本，只回退`log`中提交的commit的信息
> 不会撤销该`commit`本地的修改，通过`git status`还能看到本地的修改，可再次通过`git commit -m...`提交

[参考](https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/0013744142037508cf42e51debf49668810645e02887691000)


- `git revert -n commitID`  :撤销某次操作
> git revert 撤销某次操作，此次操作之前和之后的commit和history都会保留，并且把这次撤销，作为一次最新的提交。

> `-n`是`--no-commit`的简写，应用这个参数会让revert 改动只限于程序员的本地仓库，而不自动进行commit；然后手动进行git add ,git commit；**不加-n则自动生成commit**；

> 适用场景：如果我们想恢复之前的某一版本（该版本不是merge类型），但是又想保留该目标版本后面的版本，记录下这整个版本变动流程。


- `git revert -n commitID1..commitID4`  :撤销某几条连续的commitID
> 撤销commitID1到commitID4之间的提交，这是一个前开后闭区间，不包括 commitID1，但包括 commitID4


- `git cherry-pick commitID`  :”挑拣”提交
> 注：”挑拣”提交，它会获取某一个分支的单笔提交，并作为一个新的提交引入到你当前分支上。 当我们需要在本地合入其他分支的提交时，如果我们不想对整个分支进行合并，而是只想将某一次提交合入到本地当前分支上，那么就要使用git cherry-pick了。

> 合并之后如果存在冲突，则解决冲突之后手动commit,或者`git add .`后，`git check-pick --continue`；如果没有冲突则自动提交。

`git cherry-pick -n commitID`  :不想自动进行提交

[参考](https://blog.csdn.net/fightfightfight/article/details/81039050)


### 5. tag操作

- `git tag` :查看tag
- `git tag tagName -m '注释'`   :创建tag
- `git push origin tagName`  :提交tag到github

### 6. 查看git账号
- `git config user.name`   :查看账户名
- `git config user.email`  :查看邮箱



### 7. stash 保存未commit的代码
> stash 命令能够将还未 commit 的代码存起来。

``` shell
# 保存当前未commit的代码
git stash

# 保存当前未commit的代码并添加备注
git stash save "备注的内容"

# 列出stash的所有记录
git stash list
stash@{0}: WIP on ...
stash@{1}: WIP on ...
stash@{2}: On ...

# 应用第二条记录
$ git stash apply stash@{1}

# 删除stash的所有记录
git stash clear

# 应用最近一次的stash
git stash apply

# 应用最近一次的stash，随后删除该记录
git stash pop

# 删除最近的一次stash
git stash drop

```


### 8. 设置 Git 短命令

- 先设置一条命令，`git push`等于`git ps`：
``` shell
git config --global alias.ps push
```

- 打开全局配置文件
``` shell
vim ~/.gitconfig

# 会发现配置文件里存在以下内容
[user]
        name = verneyZhou
        email = verneyZhou@163.com
[alias]
        ps = push
```
> 之后可以在`alias`下面手动添加命令，如：`l = log`

- 修改成功后，执行`git l`就能查看log了~



## 场景应用
---

### 代码回滚1

1. 工作区的代码回滚（此时代码的修改还在本地工作区，还没有git add 到缓存区。）
``` shell
git checkout a.txt   # 丢弃某个文件，或者
git checkout .       # 丢弃全部
```

2. 缓存区的代码回滚（此时代码已经git add至缓存区，但还没有git commit提交。）
``` shell
git reset HEAD .  # 撤回全部
git reset HEAD a.txt # 撤回某个文件
# 这个操作会把代码回滚到git add 之前
```

3. git commit到本地分支、但没有git push到远程。
``` shell
git log # 得到你需要回退一次提交的commit id
git reset --hard <commit_id>  # 回到其中你想要的某个版本
# 或
git reset --hard HEAD^  # 回到最新的一次提交
# 或者
git reset HEAD^  # 此时本地代码保留，回到 git add 之前
```

4. git push已经把修改提交到远程仓库。
    - 方法1：`git reset`
    ``` shell
    git log # 得到你需要回退一次提交的commit id
    git reset --hard <commit_id>
    git push origin HEAD --force # 强制提交一次，之前错误的提交就从远程仓库删除
    # 或者
    git push -f  # 强制推送
    ```
    - 方法2：`git revert`
    ``` shell
    git log # 得到你需要回退一次提交的commit id
    git revert <commit_id>  # 撤销指定的版本，撤销也会作为一次提交进行保存
    git push
    ```

[参考](https://blog.csdn.net/asoar/article/details/84111841)


### 代码回滚2
> 场景为：基于master新建dev分支进行开发，开发完成，合并到master之后上线，但出现bug，导致master分支需要回滚到合并之前。
``` js
// master分支
git log // 查看提交记录，找到自己merge的提交
//commit 89e5a9e9867cfcd65e9ff479c91746276c4ce663
//Merge: cb50d57 7a4bdf7   // 一般第一个代表master分支 第二个代表自己的分支
//Author: xxxx <xxx@xxx.com>
//Date:   Mon Sep 7 22:07:04 2020 +0800
// Merge branch 'feature/test'

git revert -m 1 commitID  // 这样就能撤销自己分支的代码，回滚到合并之前的
// -m代表这次 revert 的是一个 merge commit
// 数字1 代表保留master分支，撤销自己的分支
// commitID为提交的合并id

// 然后在自己分支修改bug，重新上线之前如果直接merge到master上，回滚之前的提交会合不上去，因为回滚的时候已经撤销了，
// 先切到master分支,git log找到回滚的commitID
git revert commitID // 把之前撤销合并时丢弃的代码恢复了回来
git merge dev // 再merge 自己的分支
// 再上线~
```
[参考](https://www.cnblogs.com/bescheiden/articles/10563651.html)


#### 回滚复盘

1. 基于`master`新建分支`test`，开发完成后：`git merge master`;

2. 然后切换到master分支：`git merge test`，上线
> 此时`git log`，记录如下：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git201.png')" width="auto"/>

最新的记录是一个`merge commit`，这里是先将mster合到test分支，所以`1`是test分支最新的commitID，`2`是master分支最新的commitID~

3. 回滚操作：`git revert -m 2 commitID`
> `2`是保留master分支的提交，撤销test分支的提交；commitID为最新的`35784e....`

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git202.png')" width="auto"/>

revert之后会生成一个新的commitID:`566687...`~

4. `master`回滚之后，恢复到合并`test`分支之前的状态，之后又合进来新的`commit`；`test`分支不用回滚，保留`master`最新的代码，修改bug，又提交了几个`commit`；

5. test修复完成，最后上线之前先切换到master分支：`git revert commitID`，撤销之前的revert；这里的commitID为步骤3中master revert的commitID:`566687...`；

6. 最后，切换到test分支，执行`git merge master`；再切到master执行：`git merge test`，上线；或者直接在master分支上执行git merge test也可以~




## github新建流程
---

### 1. 配置git
[参考](https://www.runoob.com/w3cnote/git-guide.html)

### 2. 新建项目

- 开始
> 点击[链接](https://github.com/)，开始新建项目：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git001.png')" width="auto"/>

- 命名

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git002.png')" width="auto"/>

- 初次提交

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git003.png')" width="auto"/>

> 关于`ssh`和`https`的区别可看这两个链接：[ssh原理以及与https的区别](https://www.cnblogs.com/dzblog/p/6930147.html)、[网络数据传输安全及SSH与HTTPS工作原理](https://www.cnblogs.com/yyds/p/6992125.html)

如果本地无项目，可按上步骤推到git仓库；如果本地已经有项目:

1. 第一种:ssh key
    - `git remote add origin git@github.com:verneyZhou/miniApp3.0.git`
    - `git push --set-upstream origin master`
    
    如果未配置密钥，则会有如下提示，配置密钥流程见下面：

    <img class="zoom-custom-imgs" :src="$withBase('/images/tool/git004.png')" width="auto"/>

    密钥配置成功后，执行第二步，如果配置了密码，需输入id_rsa密码，如下：

    <img class="zoom-custom-imgs" :src="$withBase('/images/tool/git005.png')" width="auto"/>

2. 第二种：https
    - `git remote add origin https://github.com/verneyZhou/debug-test.git`
    - `git push -u origin master /  git push --set-upstream origin master`

    <img class="zoom-custom-imgs" :src="$withBase('/images/tool/git006.png')" width="auto"/>

    或：

    <img class="zoom-custom-imgs" :src="$withBase('/images/tool/git007.png')" width="auto"/>


#### 配置密钥
1. 按上面第一步配置git中流程，如果不需要密码，则一路回车

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git008.png')" width="auto"/>

2. `vim /Users/zhou/.ssh/id_rsa.pub`

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git009.png')" width="auto"/>

3. 复制，粘贴到github上

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git010.png')" width="auto"/>



### 3. 删除项目
[参考](https://blog.csdn.net/xyc_csdn/article/details/72865379?utm_source=itdadao&utm_medium=referral)

- setting

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git011.png')" width="auto"/>

- delete

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git012.png')" width="auto"/>

- 输入名字

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/git013.png')" width="auto"/>


### 4. 将本地项目推到远程仓库
1. `git init //初始化仓库`
2. `git add .(文件name) //添加文件到本地仓库`
3. `git commit -m "first commit" //添加文件描述信息`
4. `git remote add origin + 远程仓库地址 //链接远程仓库，创建主分支`
5. `git pull origin master // 把本地仓库的变化连接到远程仓库主分支`
> `git push --set-upstream origin master` 关联远程仓库master分支

> 注：如果遇到`Updates were rejected because the tip of your current branch is behind`即:自己当前版本低于远程仓库版本；执行：`git push -u origin master -f`

6. `git push -u origin master //把本地仓库的文件推送到远程仓库`




## 常见问题
---
1. `git remote add origin`的时候提示：`fatal: remote origin already exists.`
[参考](https://blog.csdn.net/qq_40428678/article/details/84074207)
``` js
// 这时因为你的项目已经关联过远程仓库，先删除关联，再推送~
➜  vue-element-admin git:(master) ✗ git remote add origin https://github.com/verneyZhou/ebook-admin-vue.git
fatal: remote origin already exists.
➜  vue-element-admin git:(master) ✗ git remote -v  // 查看已关联远程仓库
origin	https://github.com/PanJiaChen/vue-element-admin.git (fetch)
origin	https://github.com/PanJiaChen/vue-element-admin.git (push)
➜  vue-element-admin git:(master) ✗ git remote rm origin // 删除关联
➜  vue-element-admin git:(master) ✗ git remote -v
// 重新关联
➜  vue-element-admin git:(master) ✗ git remote add origin https://github.com/verneyZhou/ebook-admin-vue.git
// 强推
➜  vue-element-admin git:(master) ✗ git push --set-upstream origin master -f
``` 

2. 输入`git branch`报错
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/giterror001.png')" width="auto"/>
原因：从App Store升级到osx El Capitan，MAC git依附XCode的命令行工具。
方法：输入 xcode-select --install

3. 输入 `git checkout master`报错
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/giterror002.png')" width="auto"/>
原因：Git在使用过程中遭遇了崩溃，部分被上锁资源没有被释放导致的

    方法：
    - `rm -f ./.git/index.lock`
    - `cd .git del index.lock`
    - `open .git`,之后手动删除index.lock文件

4. `yarn dev`打包报错
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/giterror003.png')" width="auto"/>
打包文件太多，内存过大，可通过配置扩大内存

5. 未配置ssh key
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/giterror004.png')" width="auto"/>
配置即可

6. `git push`失败
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/giterror005.png')" width="auto"/>
name不对，更改即可~
- 命令行方式修改:
``` shell
#进入对应代码库
cd ~/repo
  
#配置用户名（只对当前仓库生效）
git config user.name "your domain name"
#配置邮箱（只对当前仓库生效）
git config user.email "your email"
  
#配置用户名（全局生效）
git config --global user.name "your domain name"
#配置邮箱（全局生效）
git config --global user.email "your email"
```
- 直接修改对应配置文件
```shell
修改当前仓库.git目录下config文件（只对当前仓库生效）；
修改当前用户目录下.gitconfig文件（全局生效）；
```
> **修改完成后，一定要再做一次 “非空commit”，然后再push！！！**<br/>
原因：我们刚才改的只是配置，但对于以前的commit信息我们是没有做任何修改的，所以我们要再做一次commit，即保证最后一次commit信息是正确的即可。

7. `npm run start`报错
<img class="zoom-custom-imgs" :src="$withBase('/images/tool/giterror006.png')" width="auto"/>
用yarn试下~


8. `git pull`报错：
``` shell
You have not concluded your merge (MERGE_HEAD exists).
Please, commit your changes before you can merge.
```
可能是因为在你以前pull下来的代码没有自动合并导致的.
``` shell
# 取消某次合并
git merge --abort #如果Git版本 >= 1.7.4
git reset --merge #如果Git版本 >= 1.6.1
```
然后再`git pull`


9. `.DS_Store`问题
> DS_Store(英文全称 Desktop Services Store)，处理参考：[如何删除mac中的.DS_Store和git中的.DS_Store](https://www.jianshu.com/p/793788ca7978)



10. git push 的时候报错：`error: You have not concluded your merge (MERGE_HEAD exists).`
> 原因可能是在以前pull下来的代码自动合并失败

- 舍弃本地代码,远端版本覆盖本地版本(慎重)
``` shell
$:git fetch --all
$:git reset --hard origin/master
$:git fetch
```

- 保留本地的更改,中止合并->重新合并->重新拉取
``` shell
$:git merge --abort
$:git reset --merge
$:git pull
```


11. 往新建的gitlab项目`git push`的时候的时候报错：`remote: GitLab: You are not allowed to push code to protected branches on this project.`
> 使用GitLab系统管理员账户登录，更改代码仓库的master主分支开放权限为：Developers + Maintainers即可。[参考](https://blog.csdn.net/weixin_44917045/article/details/123826523)

12. 往新建的gitlab项目`git push`的时候的时候报错: `remote: Ask a project Owner or Maintainer to create a default branch:`
> 这个是gitlab的特性问题，必须要管理员第一次推代码创建master分支；或者把我改成Maintainer角色。



13. 把本地项目推送到github仓库时报错：
``` sh
➜  jenkins-vite-test git:(main) ✗ git push --set-upstream origin main
error: src refspec main does not match any
error: failed to push some refs to 'github.com:verneyZhou/jenkins-vite-test.git'
```
> 可能是github仓库没有main分支，远程随便新建个文件就添加了分支；之后本地代码`git commit -am...`提交，再 `git push --set-upstream origin main -f`强推一下~



14. 在阿里云服务器上`git clone`项目报错：

``` sh
[root@iz2zef9ue9eyhqrvjxs3aqz workspace]# git clone git@github.com:verneyZhou/jenkins-vite-test.git
正克隆到 'jenkins-vite-test'...
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
SHA256:uNiVztksCsDhcc0u9e8BujQXVUpKZIDTMczCvj3tD2s.
Please contact your system administrator.
Add correct host key in /root/.ssh/known_hosts to get rid of this message.
Offending RSA key in /root/.ssh/known_hosts:1
RSA host key for github.com has changed and you have requested strict checking.
Host key verification failed.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```
> 当我在github上添加服务器的 ssh key 之后，就报错了~ 可通过执行`ssh-keygen -R github.com`命令更新`~/.ssh/known_hosts`信息，然后重新`git clone`即可~

> 最简单粗暴的方法就是直接删除`~/.ssh/known_hosts`文件，然后再重新clone~

[参考](https://github.com/orgs/community/discussions/50878)



15. `git push`报错：

``` sh
Enumerating objects: 496, done.
Counting objects: 100% (496/496), done.
Delta compression using up to 8 threads
Compressing objects: 100% (462/462), done.
client_loop: send disconnect: Broken pipe
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
```

解决方法：[参考](https://blog.csdn.net/qq_34466755/article/details/113748527)
- 方法一：将git 远程地址改为自己的`ssh`地址: `git remote set-url origin git@github.com:github用户名/仓库名.git`
- 方法二：增加git缓冲区大小: `git config --global http.postBuffer 524288000`
> 我试了上面两种方法后，又出现这种报错了，然后我把vpn关了，`git push`居然又可以了~~~！！神奇....



16. `git merge master`到main分支时报错：`fatal: refusing to merge unrelated histories`

> `git merge master --allow-unrelated-histories`

## 备注

- 如何下载公司`gitlab`上的项目？
    1. 下载vpn软件:`easy connect`
    2. 进入`gitlab`项目页面，添加电脑`id_rsd.pub`到`sshKey`
    3. `git clone` 即可
    > 注：一般只能下载项目，如果想push的话会报错，如果把`git config user`的name和email改为公司git账号应该就可以推送了（只是猜想。。。）


- [github](https://github.com/)访问不了了~
    - 搭梯子翻墙~具体流程在我另一篇博文里[搭梯子](./vpn)；
    - 配置git520，具体参考[GitHub 访问不了？教你几招轻松解决](https://zhuanlan.zhihu.com/p/358183268)
    > [github520](https://github.com/521xueweihan/GitHub520)



## 参考

- [Git各指令的本质，真是通俗易懂啊](https://juejin.cn/post/6895246702614806542)
- [一些常用的 Git 进阶知识与技巧](https://juejin.cn/post/7022746201598459940)
- [chrome Github加速插件](http://www.itmind.net/11438.html)


## 收藏

- [Git 是如何工作的](https://mp.weixin.qq.com/s/DBnbDjY_oXuM-X6m2K5oeQ)
- [Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN)
- [搭建 Github 免费图床](https://mp.weixin.qq.com/s/wEomQC6Q0D_LShPkIQIBbg)



<!-- 2021-04-29 -->