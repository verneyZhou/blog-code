

##### 线上发布！！！！ #######

#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
echo 'docs.verneyzhou-code.cn' > CNAME

git init
# git pull
git add -A
git commit -m 'blog submit'

# 如果发布到 https://<USERNAME>.github.io,把下面一行注释掉,替换username即可,
# 注意以下这是ssh的方式
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master
# git push -f git@github.com:itclancode.github.io.git master

# https形式
# git push -f https://github.com/<USERNAME>/<USERNAME>.github.io.git  master


git push -f https://github.com/verneyZhou/verneyZhou.github.io.git  master


# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages
# git push -f git@github.com:itclancode/blogcode.git master:gh-pages

cd -