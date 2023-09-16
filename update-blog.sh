

# ##### 线上发布阿里云服务器！！！！ #######


# #!/usr/bin/env sh

# # 确保脚本抛出遇到的错误
# set -e

# echo "start updating blog..."

# cd /root/nginx

# # git clone git@github.com:verneyZhou/blog-code.git

# cd blog-code

# echo "updating source..."

# git pull

# echo "frontend building"

# #rm -rf node_modules

# #cnpm i 

# npm run build

# echo "frontend publish"

# cd docs/.vuepress

# # rm -rf ~/nginx/upload/blog

# mv dist ~/nginx/upload/blog

# echo "updating blog success!!!"



npm run build

mv docs/.vuepress/dist dist