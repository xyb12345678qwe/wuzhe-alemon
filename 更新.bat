@echo off
setlocal
chcp 65001
echo 正在提交修改...
set /P COMMIT_MSG=请输入提交信息：
chcp 936 > nul
git add .
git commit -m "%COMMIT_MSG%"

echo 正在推送到Gitee...
git push origin master

echo 完成.

endlocal