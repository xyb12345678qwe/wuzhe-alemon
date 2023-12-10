@echo off
setlocal

chcp 65001

echo 正在提交修改...
set /P COMMIT_MSG=请输入提交信息：
chcp 65001 > nul

git add .
git commit -m "%COMMIT_MSG%"

echo 正在推送到Gitee...

rem 显示进度条
setlocal enabledelayedexpansion
set "progress=-"
for /L %%i in (1,1,20) do (
    echo|set /p=!progress!
    timeout /t 1 /nobreak >nul
    set "progress=!progress!-"
)
echo.

git push origin master

echo 完成.

endlocal