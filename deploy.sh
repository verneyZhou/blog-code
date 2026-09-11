#!/usr/bin/env sh

##### 线上发布！！！！ #######

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
echo 'docs.verneyzhou-code.cn' > CNAME

git init

#////// 解决报错：error: src refspec main does not match any
git checkout -B main
# 为 dist 目录临时 git 仓库补齐提交者信息（避免报错：Please tell me who you are）
# 如果本机已配置 user.name / user.email，则不覆盖
if ! git config --get user.name >/dev/null 2>&1; then
  git config user.name "deploy-bot"
fi
if ! git config --get user.email >/dev/null 2>&1; then
  git config user.email "deploy-bot@users.noreply.github.com"
fi
# git pull
# 将所有变更加入暂存区
git add -A
# 仅当暂存区存在变更时才提交（避免 nothing to commit 导致 set -e 中断）
if ! git diff --cached --quiet; then
  git commit -m 'blog submit'
fi
# /////////

# 如果发布到 https://<USERNAME>.github.io,把下面一行注释掉,替换username即可,
# 注意以下这是ssh的方式
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master
# git push -f git@github.com:itclancode.github.io.git master

# https形式
# git push -f https://github.com/<USERNAME>/<USERNAME>.github.io.git  master


git push -f git@github.com:verneyZhou/verneyZhou.github.io.git main


# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages
# git push -f git@github.com:itclancode/blogcode.git master:gh-pages

cd -