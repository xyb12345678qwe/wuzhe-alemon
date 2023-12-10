@echo off
setlocal

echo Committing changes...
set /P COMMIT_MSG=请输入提交信息：
chcp 936 > nul
git init
git add .
git commit -m "%COMMIT_MSG%"

echo Pushing changes to Gitee...
git push origin %BRANCH_NAME%

echo Done.
endlocal